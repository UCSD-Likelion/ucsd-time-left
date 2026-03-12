import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/Functions/firebase/clientApp";

type CapsuleListItem = {
  id: string;
  senderId: string;
  subject: string | null;
  content: string | null;
  createdAtMillis: number | null;
  releaseAtMillis: number | null;
  openedAtMillis: number | null;
  locked: boolean;
};

function toMillis(value: unknown): number | null {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const senderId =
      typeof body?.senderId === "string" ? body.senderId.trim() : "";

    if (!senderId) {
      return NextResponse.json(
        { ok: false, error: "senderId is required." },
        { status: 400 }
      );
    }

    const capsulesRef = collection(db, "capsules");
    const capsulesQuery = query(
        capsulesRef,
        where("senderId", "==", senderId)
    );

    const snapshot = await getDocs(capsulesQuery);
    const now = Date.now();

    const capsules: CapsuleListItem[] = snapshot.docs
        .map((docSnap) => {
            const data = docSnap.data() as {
            senderId?: string;
            subject?: string | null;
            content?: string | null;
            createdAt?: unknown;
            releaseAt?: unknown;
            openedAt?: unknown;
            };

            const createdAtMillis = toMillis(data.createdAt);
            const releaseAtMillis = toMillis(data.releaseAt);
            const openedAtMillis = toMillis(data.openedAt);
            const locked =
            typeof releaseAtMillis === "number" ? releaseAtMillis > now : false;

            return {
            id: docSnap.id,
            senderId: data.senderId ?? senderId,
            subject: data.subject ?? null,
            content: locked ? null : (data.content ?? null),
            createdAtMillis,
            releaseAtMillis,
            openedAtMillis,
            locked,
            };
        })
        .sort((a, b) => (b.createdAtMillis ?? 0) - (a.createdAtMillis ?? 0));

    return NextResponse.json({
      ok: true,
      capsules,
    });
  } catch (error) {
    console.error("POST /api/capsule/list failed:", error);

    return NextResponse.json(
      { ok: false, error: "Failed to load capsules." },
      { status: 500 }
    );
  }
}