"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  return (
    <>
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900 p-2 h-min">
        <Link
          className={cn(
            "text-zinc-600 dark:text-zinc-400 transition hover:bg-zinc-200 hover:dark:bg-zinc-800 px-2 rounded-md",
            pathname === "/languages" && "font-bold text-black dark:text-white"
          )}
          href="/languages"
        >
          Все языки
        </Link>
        <Link
          className={cn(
            "text-zinc-600 dark:text-zinc-400 transition hover:bg-zinc-200 hover:dark:bg-zinc-800 px-2 rounded-md",
            pathname === "/decks" && "font-bold text-black dark:text-white"
          )}
          href="/decks"
        >
          Колоды
        </Link>
      </div>
    </>
  );
}
