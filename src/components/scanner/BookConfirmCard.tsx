"use client";

import { useState } from "react";
import type { EnrichedMetadata, BookCondition } from "@/types/book";
import TagInput from "./TagInput";

const GENRE_SUGGESTIONS = [
  "Fiction",
  "Non-Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Thriller",
  "Romance",
  "Biography",
  "History",
  "Science",
  "Mathematics",
  "Technology",
  "Philosophy",
  "Psychology",
  "Self-Help",
  "Poetry",
  "Drama",
  "Comics",
  "Art",
  "Music",
  "Religion",
  "Travel",
  "Cooking",
  "Health",
  "Education",
  "Reference",
  "Children",
  "Young Adult",
  "Horror",
  "Adventure",
];

const TAG_SUGGESTIONS = [
  "Textbook",
  "Award Winner",
  "Classic",
  "Bestseller",
  "Local Author",
  "Donated",
  "Large Print",
  "Illustrated",
  "Series",
  "Anthology",
  "Bilingual",
  "STEM",
  "Literature",
  "Exam Prep",
  "Research",
  "Curriculum",
];

interface BookConfirmCardProps {
  isbn: string;
  metadata: EnrichedMetadata | null;
  onConfirm: (data: {
    title: string;
    author: string;
    genre: string[];
    subjectTags: string[];
    description: string;
    language: string;
    coverURL: string;
    shelfLocation: string;
    condition: BookCondition;
    addedBy: string;
  }) => void;
  onCancel: () => void;
  submitting: boolean;
}

export default function BookConfirmCard({
  isbn,
  metadata,
  onConfirm,
  onCancel,
  submitting,
}: BookConfirmCardProps) {
  const [title, setTitle] = useState(metadata?.title ?? "");
  const [author, setAuthor] = useState(metadata?.author ?? "");
  const [genre, setGenre] = useState<string[]>(metadata?.genre ?? []);
  const [subjectTags, setSubjectTags] = useState<string[]>(
    metadata?.subjectTags ?? []
  );
  const [description, setDescription] = useState(metadata?.description ?? "");
  const [language, setLanguage] = useState(metadata?.language ?? "en");
  const [coverURL] = useState(metadata?.coverURL ?? "");
  const [shelfLocation, setShelfLocation] = useState("");
  const [condition, setCondition] = useState<BookCondition>("Good");
  const [addedBy, setAddedBy] = useState("");

  const isManual = !metadata;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Cover + quick info header */}
      {coverURL && (
        <div className="mb-4 flex gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverURL}
            alt={title}
            className="h-36 w-24 rounded-md object-cover shadow"
          />
          <div className="flex-1 space-y-1">
            <p className="text-xs text-gray-400">ISBN: {isbn}</p>
            {!isManual && (
              <p className="text-xs text-green-600">
                Auto-filled from Google Books — edit anything below
              </p>
            )}
          </div>
        </div>
      )}

      {isManual && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          No metadata found for ISBN {isbn}. Fill in the details manually.
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          onConfirm({
            title: title.trim(),
            author: author.trim(),
            genre,
            subjectTags,
            description: description.trim(),
            language: language.trim() || "en",
            coverURL,
            shelfLocation: shelfLocation.trim(),
            condition,
            addedBy: addedBy.trim(),
          });
        }}
        className="space-y-4"
      >
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Author */}
        <div>
          <label className="block text-xs font-medium text-gray-700">
            Author
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Genre with suggestions */}
        <TagInput
          label="Genre"
          tags={genre}
          onChange={setGenre}
          suggestions={GENRE_SUGGESTIONS}
          placeholder="Add genre…"
        />

        {/* Subject Tags with suggestions */}
        <TagInput
          label="Subject Tags"
          tags={subjectTags}
          onChange={setSubjectTags}
          suggestions={TAG_SUGGESTIONS}
          placeholder="Add tag…"
        />

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs font-medium text-gray-700">
            Language
          </label>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="e.g. en, fr, es"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <hr className="border-gray-100" />

        {/* Shelf location */}
        <div>
          <label className="block text-xs font-medium text-gray-700">
            Shelf Location
          </label>
          <input
            type="text"
            value={shelfLocation}
            onChange={(e) => setShelfLocation(e.target.value)}
            placeholder="e.g. A-3, Room 204"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Condition */}
        <div>
          <label className="block text-xs font-medium text-gray-700">
            Condition
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as BookCondition)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option>New</option>
            <option>Good</option>
            <option>Fair</option>
            <option>Poor</option>
          </select>
        </div>

        {/* Added by (volunteer name) */}
        <div>
          <label className="block text-xs font-medium text-gray-700">
            Your Name
          </label>
          <input
            type="text"
            value={addedBy}
            onChange={(e) => setAddedBy(e.target.value)}
            placeholder="Volunteer name"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Add to Library"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
