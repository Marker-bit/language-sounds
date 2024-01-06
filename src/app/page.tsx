import Link from "next/link";

export default function Home() {
  return (
    <div className="flex gap-1 flex-col">
      <Link href="/languages">Languages</Link>
    </div>
  );
}
