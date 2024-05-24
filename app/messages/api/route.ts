import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
let count = 0;

export async function GET() {
  const res = await fetch("http://localhost:4000/books/all", {
    //const data: { books: any[] } = await res.json();
    next: { tags: ["messages"] },
  });
  const data = await res.json();
  return Response.json({ data });

}


export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  const res = await fetch("http://localhost:4000/message/" + name, {
    method: "DELETE", // *GET, POST, PUT, DELETE, etc.
    cache: "no-store",
  });
  const data = await res.json();
  if (res.ok) {
    revalidateTag("messages");
  }
  return Response.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();

  const res = await fetch("http://localhost:4000/message/", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body.data), // body data type must match "Content-Type" header
    cache: "no-store",
  });
  const data = await res.json();

  if (res.ok) {
    revalidateTag("messages");
  }

  return Response.json({ data }, { status: res.status });
}
