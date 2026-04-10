"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
  const isScan = pathname === "/scan" || pathname === "/review";

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-gray-900">
          BookShelf
        </Link>
        <Link
          href={isScan ? "/" : "/scan"}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {isScan ? "Browse Catalogue" : "Scan Book"}
        </Link>
      </div>
    </nav>
  );
}
