import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const file = await req.blob();
  // console.log(file);
  // let randomUUID = Math.random().toString(36).slice(10);
  // const reqq = await fetch(
  //   `https://pixeldrain.com/api/file/${randomUUID}?anonymous=true`,
  //   {
  //     method: "PUT",
  //     body: file,
  //     headers: {
  //       'Content-Type': 'text/plain',
  //     },
  //   }
  // );
  // const data = await reqq.json();
  // return NextResponse.json({ id: data.id });
  const expires = new Date().getTime() + 30 * 60 * 1000;
  const form = new FormData();
  form.append("file", file);
  form.append("expires", expires.toString());

  const response = await fetch("https://0x0.st", {
    method: "POST",
    body: form,
  });
  const text = await response.text();
  console.log(text);
  return new NextResponse(text);
}
