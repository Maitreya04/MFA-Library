import { NextRequest, NextResponse } from "next/server";
import { createBook, getBookByISBN } from "@/lib/notion";
import type { CreateBookInput } from "@/types/book";

export async function POST(req: NextRequest) {
  let body: CreateBookInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.isbn || !body.title) {
    return NextResponse.json(
      { error: "isbn and title are required" },
      { status: 400 }
    );
  }

  // Dedup check
  const existing = await getBookByISBN(body.isbn);
  if (existing) {
    return NextResponse.json(
      { error: "Book already exists", book: existing },
      { status: 409 }
    );
  }

  const book = await createBook(body);
  return NextResponse.json(book, { status: 201 });
}
