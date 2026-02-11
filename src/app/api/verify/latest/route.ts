import { NextResponse } from "next/server";

import { getLatestSession } from "@/lib/session/latestSession";

export async function GET() {
  const latest = await getLatestSession();

  if (!latest) {
    return NextResponse.json({ error: "No verification session found." }, { status: 404 });
  }

  return NextResponse.json(latest);
}
