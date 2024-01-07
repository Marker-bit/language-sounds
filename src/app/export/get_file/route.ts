import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const file = new URL(req.url).searchParams.get("filename");
  // console.log(file);
  const reqq = await fetch(`https://pixeldrain.com/api/file/${file}`);
  return new NextResponse(await reqq.text());
}
