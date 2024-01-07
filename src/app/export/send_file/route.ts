import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const file = await req.blob();
  // console.log(file);
  let randomUUID = Math.random().toString(36).slice(10);
  const reqq = await fetch(
    `https://pixeldrain.com/api/file/${randomUUID}?anonymous=true`,
    {
      method: "PUT",
      body: file,
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  );
  const data = await reqq.json();
  return NextResponse.json({ id: data.id });
}
