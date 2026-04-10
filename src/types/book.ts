export type BookStatus = "Available" | "Borrowed" | "Reserved";
export type BookCondition = "New" | "Good" | "Fair" | "Poor";

export interface Book {
  id: string;
  title: string;
  isbn: string;
  author: string;
  genre: string[];
  subjectTags: string[];
  coverURL: string;
  description: string;
  status: BookStatus;
  shelfLocation: string;
  condition: BookCondition;
  language: string;
  dateAdded: string;
  addedBy: string;
}

/** Payload for creating a book — id and dateAdded are set server-side */
export type CreateBookInput = Omit<Book, "id" | "dateAdded">;

/** Partial metadata returned from Google Books / Open Library enrichment */
export interface EnrichedMetadata {
  title: string;
  author: string;
  genre: string[];
  subjectTags: string[];
  coverURL: string;
  description: string;
  language: string;
}
