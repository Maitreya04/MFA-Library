"use client";

import type { EnrichedMetadata } from "@/types/book";
import type { BookCondition } from "@/types/book";

interface BookConfirmCardProps {
  isbn: string;
  metadata: EnrichedMetadata;
  onConfirm: (extra: {
    shelfLocation: string;
    condition: BookCondition;
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
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        {metadata.coverURL && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={metadata.coverURL}
            alt={metadata.title}
            className="h-36 w-24 rounded-md object-cover shadow"
          />
        )}
        <div className="flex-1 space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">
            {metadata.title}
          </h2>
          <p className="text-sm text-gray-600">{metadata.author}</p>
          <p className="text-xs text-gray-400">ISBN: {isbn}</p>
          {metadata.genre.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {metadata.genre.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {metadata.description && (
        <p className="mt-3 line-clamp-3 text-sm text-gray-600">
          {metadata.description}
        </p>
      )}

      {/* Volunteer fills in these fields */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onConfirm({
            shelfLocation: (fd.get("shelfLocation") as string) || "",
            condition: (fd.get("condition") as BookCondition) || "Good",
          });
        }}
        className="mt-4 space-y-3"
      >
        <div>
          <label className="block text-xs font-medium text-gray-700">
            Shelf Location
          </label>
          <input
            name="shelfLocation"
            placeholder="e.g. A-3"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">
            Condition
          </label>
          <select
            name="condition"
            defaultValue="Good"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option>New</option>
            <option>Good</option>
            <option>Fair</option>
            <option>Poor</option>
          </select>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
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
