import { NextResponse } from "next/server";
import { getUserInfoByUid } from "../userInfo.dao";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const uid = body?.uid;

    if (!uid || typeof uid !== "string") {
      return new NextResponse("Missing or invalid uid", { status: 400 });
    }

    const user = await getUserInfoByUid(uid);

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return new NextResponse("Server error", { status: 500 });
  }
}