import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const file = new URL(req.url).searchParams.get("filename");
  const reqq = await fetch(`https://file.io/${file}`);
  return new NextResponse(await reqq.text());
}
