import { NextResponse } from "next/server";

import { clearLatestSession, getLatestSession } from "@/lib/session/latestSession";

export async function GET() {
  const latest = await getLatestSession();

  if (!latest) {
    return NextResponse.json({ error: "No verification session found." }, { status: 404 });
  }

  return NextResponse.json(latest);
}

export async function DELETE() {
  await clearLatestSession();
  return NextResponse.json({ status: "cleared" });
}
