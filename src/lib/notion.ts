import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { Book, CreateBookInput } from "@/types/book";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID!;

// ── Helpers to parse Notion property values ─────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = PageObjectResponse["properties"] & Record<string, any>;

function richText(props: Props, prop: string): string {
  return props[prop]?.rich_text?.[0]?.plain_text ?? "";
}

function multiSelect(props: Props, prop: string): string[] {
  return (
    props[prop]?.multi_select?.map((s: { name: string }) => s.name) ?? []
  );
}

function selectValue(props: Props, prop: string): string {
  return props[prop]?.select?.name ?? "";
}

// ── Parse a Notion page into our Book type ──────────────────────────

function pageToBook(page: PageObjectResponse): Book {
  const p = page.properties as Props;
  return {
    id: page.id,
    title: (p.Title as { title: { plain_text: string }[] })?.title?.[0]?.plain_text ?? "",
    isbn: richText(p, "ISBN"),
    author: richText(p, "Author"),
    genre: multiSelect(p, "Genre"),
    subjectTags: multiSelect(p, "SubjectTags"),
    coverURL: (p.CoverURL as { url: string | null })?.url ?? "",
    description: richText(p, "Description"),
    status: selectValue(p, "Status") as Book["status"],
    shelfLocation: richText(p, "ShelfLocation"),
    condition: selectValue(p, "Condition") as Book["condition"],
    language: selectValue(p, "Language"),
    dateAdded: (p.DateAdded as { date: { start: string } | null })?.date?.start ?? "",
    addedBy: richText(p, "AddedBy"),
  };
}

// ── Public API ──────────────────────────────────────────────────────

export async function getBookByISBN(isbn: string): Promise<Book | null> {
  const response: QueryDatabaseResponse = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "ISBN",
      rich_text: { equals: isbn },
    },
    page_size: 1,
  });

  const pages = response.results.filter(
    (r): r is PageObjectResponse => "properties" in r
  );
  if (pages.length === 0) return null;
  return pageToBook(pages[0]);
}

export async function listBooks(
  cursor?: string,
  pageSize = 50
): Promise<{ books: Book[]; nextCursor: string | null }> {
  const response: QueryDatabaseResponse = await notion.databases.query({
    database_id: databaseId,
    start_cursor: cursor,
    page_size: pageSize,
    sorts: [{ property: "DateAdded", direction: "descending" }],
  });

  const pages = response.results.filter(
    (r): r is PageObjectResponse => "properties" in r
  );

  return {
    books: pages.map(pageToBook),
    nextCursor: response.next_cursor,
  };
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    if (!("properties" in page)) return null;
    return pageToBook(page as PageObjectResponse);
  } catch {
    return null;
  }
}

export async function createBook(input: CreateBookInput): Promise<Book> {
  const page = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Title: { title: [{ text: { content: input.title } }] },
      ISBN: { rich_text: [{ text: { content: input.isbn } }] },
      Author: { rich_text: [{ text: { content: input.author } }] },
      Genre: { multi_select: input.genre.map((g) => ({ name: g })) },
      SubjectTags: {
        multi_select: input.subjectTags.map((t) => ({ name: t })),
      },
      ...(input.coverURL ? { CoverURL: { url: input.coverURL } } : {}),
      Description: {
        rich_text: [{ text: { content: input.description.slice(0, 2000) } }],
      },
      Status: { select: { name: input.status } },
      ShelfLocation: {
        rich_text: [{ text: { content: input.shelfLocation } }],
      },
      Condition: { select: { name: input.condition } },
      Language: { select: { name: input.language || "English" } },
      DateAdded: { date: { start: new Date().toISOString().split("T")[0] } },
      AddedBy: { rich_text: [{ text: { content: input.addedBy } }] },
    },
  });

  return pageToBook(page as PageObjectResponse);
}
