import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import { createClient } from "redis";
import { normalizeData } from "./sanitize";
import { seedData } from "./seed";
import type { AnswersMap, AppData } from "./types";

/**
 * Quatre modes de stockage, choisis automatiquement :
 * - "redis"  : Upstash Redis via REST (KV_REST_API_URL / KV_REST_API_TOKEN)
 * - "redis"  : Redis classique via REDIS_URL (node-redis, ex. Redis de Vercel)
 * - "file"   : fichier .data/db.json (développement local)
 * - "memory" : mémoire du serveur, NON durable (Vercel sans Redis connecté)
 */
export type StorageMode = "redis" | "file" | "memory";

const DATA_KEY = "escale:data";
const ANSWERS_KEY = "escale:answers";
const FILE = path.join(process.cwd(), ".data", "db.json");

interface Kv {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
}

/**
 * Lit une variable d'environnement par son nom exact, ou avec n'importe quel
 * préfixe (Vercel en ajoute un quand on nomme la base, ex. STORAGEONE_KV_REST_API_URL).
 */
function env(...names: string[]): string | undefined {
  for (const name of names) {
    if (process.env[name]) return process.env[name];
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (value && names.some((name) => key.endsWith(`_${name}`))) return value;
  }
  return undefined;
}

const REDIS_URL_NAMES = ["REDIS_URL"];

/* ------------------------------ Upstash (REST) ------------------------------ */

let upstash: Redis | null | undefined;

function upstashKv(): Kv | null {
  if (upstash === undefined) {
    const url = env("KV_REST_API_URL", "UPSTASH_REDIS_REST_URL");
    const token = env("KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_TOKEN");
    upstash = url && token ? new Redis({ url, token }) : null;
  }
  const client = upstash;
  if (!client) return null;
  return {
    get: <T,>(key: string) => client.get<T>(key),
    set: async (key, value) => {
      await client.set(key, value);
    },
  };
}

/* ------------------------------ node-redis (REDIS_URL) ------------------------------ */

type NodeRedis = ReturnType<typeof createClient>;
const globalForRedis = globalThis as unknown as {
  __escaleRedis?: Promise<NodeRedis>;
};

function nodeRedis(): Promise<NodeRedis> {
  if (!globalForRedis.__escaleRedis) {
    const client = createClient({ url: env(...REDIS_URL_NAMES) });
    client.on("error", (err) => console.error("Redis:", err.message));
    globalForRedis.__escaleRedis = client.connect().then(() => client);
    // Si la connexion échoue, on réessaiera à la requête suivante.
    globalForRedis.__escaleRedis.catch(() => {
      globalForRedis.__escaleRedis = undefined;
    });
  }
  return globalForRedis.__escaleRedis;
}

function nodeRedisKv(): Kv | null {
  if (!env(...REDIS_URL_NAMES)) return null;
  return {
    get: async <T,>(key: string) => {
      const raw = await (await nodeRedis()).get(key);
      if (typeof raw !== "string") return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },
    set: async (key, value) => {
      await (await nodeRedis()).set(key, JSON.stringify(value));
    },
  };
}

function kv(): Kv | null {
  return upstashKv() ?? nodeRedisKv();
}

export function storageMode(): StorageMode {
  if (kv()) return "redis";
  return process.env.VERCEL ? "memory" : "file";
}

/* ------------------------------ fichier / mémoire ------------------------------ */

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

/* ------------------------------ API ------------------------------ */

export async function getData(): Promise<AppData> {
  const store = kv();
  const stored = store
    ? await store.get<AppData>(DATA_KEY)
    : (await readLocal()).data;
  // normalizeData complète les données enregistrées avant l'ajout des thèmes
  // et des textes modifiables (rien n'est perdu).
  return stored
    ? normalizeData(stored)
    : (JSON.parse(JSON.stringify(seedData)) as AppData);
}

export async function saveData(data: AppData): Promise<void> {
  const store = kv();
  if (store) {
    await store.set(DATA_KEY, data);
    return;
  }
  const db = await readLocal();
  await writeLocal({ ...db, data });
}

export async function getAnswers(): Promise<AnswersMap> {
  const store = kv();
  if (store) return (await store.get<AnswersMap>(ANSWERS_KEY)) ?? {};
  return (await readLocal()).answers;
}

async function setAnswers(answers: AnswersMap): Promise<void> {
  const store = kv();
  if (store) {
    await store.set(ANSWERS_KEY, answers);
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
