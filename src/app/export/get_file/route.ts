import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const file = new URL(req.url).searchParams.get("filename");
  const reqq = await fetch(file!);
  return reqq;
}
