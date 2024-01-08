import * as axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const file = await req.text();
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
  form.append("file", new File([file], "export.json"));
  form.append("expires", expires.toString());

  const response = await fetch("https://0x0.st", {
    method: "POST",
    body: form,
  });
  const text = await response.text();
  console.log(text);
  return new NextResponse(text);
  // const apiUrl = "https://file.io";
  // const expires = new Date();
  // expires.setTime(expires.getTime() + 30 * 60 * 1000);
  // const form = new FormData();
  // form.append("file", new File([file], "export.json"));
  // form.append("expires", expires.toISOString());
  // const resp = await axios.default
  //   .post(apiUrl, form);
  // const text = resp.data;
  // console.log(text);
  // return NextResponse.json(text);

  // Make POST request to API endpoint
  // fetch(apiUrl, {
  //   method: "POST",
  //   body: form,
  // })
  //   .then((response) => response.json())
  //   .then((data) => console.log(data))
  //   .catch((error) => console.error(error));
}
