import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { sanitizeData } from "@/lib/sanitize";
import { getData, saveData } from "@/lib/store";

export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ error: "Non autorisé." }, { status: 401 });

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return NextResponse.json({ data: await getData() });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const result = sanitizeData(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await saveData(result.data);
  return NextResponse.json({ data: result.data });
}
