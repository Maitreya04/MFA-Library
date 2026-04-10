"use client";

interface FilterChipsProps {
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}

export default function FilterChips({
  options,
  selected,
  onSelect,
}: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
          selected === null
            ? "bg-indigo-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt === selected ? null : opt)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
            selected === opt
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
