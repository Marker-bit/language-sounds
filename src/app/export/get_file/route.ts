import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const file = new URL(req.url).searchParams.get("filename");
  const reqq = await fetch(`https://0x0.st/${file}`);
  return new NextResponse(await reqq.text());
}
