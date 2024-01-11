"use client"

import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Home() {
  return (
    <div className="flex gap-1 flex-col">
      <Link href="/languages">Languages</Link>
    </div>
  );
}
