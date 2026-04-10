import { NextRequest, NextResponse } from "next/server";
import { listBooks } from "@/lib/notion";

export async function GET(req: NextRequest) {
  const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
  const { books, nextCursor } = await listBooks(cursor);
  return NextResponse.json({ books, nextCursor });
}
