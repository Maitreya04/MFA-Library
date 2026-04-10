import { NextRequest, NextResponse } from "next/server";
import { fetchByISBN } from "@/lib/google-books";

export async function GET(req: NextRequest) {
  const isbn = req.nextUrl.searchParams.get("isbn")?.trim();
  if (!isbn) {
    return NextResponse.json({ error: "isbn query param required" }, { status: 400 });
  }

  const metadata = await fetchByISBN(isbn);
  if (!metadata) {
    return NextResponse.json(
      { error: "No metadata found — manual entry required", isbn },
      { status: 404 }
    );
  }

  return NextResponse.json(metadata);
}
