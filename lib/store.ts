import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import { withDefaults } from "./defaults";
import { seedData } from "./seed";
import type { AnswersMap, AppData } from "./types";

/**
 * Trois modes de stockage, choisis automatiquement :
 * - "redis"  : Upstash Redis (variables KV_REST_API_* ou UPSTASH_REDIS_REST_*)
 * - "file"   : fichier .data/db.json (développement local)
 * - "memory" : mémoire du serveur, NON durable (Vercel sans Redis connecté)
 */
export type StorageMode = "redis" | "file" | "memory";

const DATA_KEY = "escale:data";
const ANSWERS_KEY = "escale:answers";
const FILE = path.join(process.cwd(), ".data", "db.json");

let redisClient: Redis | null | undefined;

function redis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  redisClient = url && token ? new Redis({ url, token }) : null;
  return redisClient;
}

export function storageMode(): StorageMode {
  if (redis()) return "redis";
  return process.env.VERCEL ? "memory" : "file";
}

interface LocalDb {
  data: AppData | null;
  answers: AnswersMap;
}

const globalForMem = globalThis as unknown as { __escaleDb?: LocalDb };

async function readLocal(): Promise<LocalDb> {
  if (storageMode() === "memory") {
    if (!globalForMem.__escaleDb) {
      globalForMem.__escaleDb = { data: null, answers: {} };
    }
    return globalForMem.__escaleDb;
  }
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalDb>;
    return { data: parsed.data ?? null, answers: parsed.answers ?? {} };
  } catch {
    return { data: null, answers: {} };
  }
}

async function writeLocal(db: LocalDb): Promise<void> {
  if (storageMode() === "memory") {
    globalForMem.__escaleDb = db;
    return;
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2), "utf8");
}

export async function getData(): Promise<AppData> {
  const r = redis();
  const stored = r
    ? await r.get<AppData>(DATA_KEY)
    : (await readLocal()).data;
  return withDefaults(stored ?? (JSON.parse(JSON.stringify(seedData)) as AppData));
}

export async function saveData(data: AppData): Promise<void> {
  const r = redis();
  if (r) {
    await r.set(DATA_KEY, data);
    return;
  }
  const db = await readLocal();
  await writeLocal({ ...db, data });
}

export async function getAnswers(): Promise<AnswersMap> {
  const r = redis();
  if (r) return (await r.get<AnswersMap>(ANSWERS_KEY)) ?? {};
  return (await readLocal()).answers;
}

async function setAnswers(answers: AnswersMap): Promise<void> {
  const r = redis();
  if (r) {
    await r.set(ANSWERS_KEY, answers);
    return;
  }
  const db = await readLocal();
  await writeLocal({ ...db, answers });
}

/** Fusionne de nouvelles réponses et retire celles listées dans removeIds. */
export async function saveAnswers(
  patch: AnswersMap,
  removeIds: string[] = [],
): Promise<void> {
  const current = await getAnswers();
  const next: AnswersMap = { ...current, ...patch };
  for (const id of removeIds) delete next[id];
  await setAnswers(next);
}

/** Sans argument : efface tout. Sinon : efface seulement ces questions. */
export async function clearAnswers(questionIds?: string[]): Promise<void> {
  if (!questionIds) {
    await setAnswers({});
    return;
  }
  const current = await getAnswers();
  for (const id of questionIds) delete current[id];
  await setAnswers(current);
}
