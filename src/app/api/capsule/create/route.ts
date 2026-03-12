import { db } from "@/Functions/firebase/clientApp";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";

/**
 * Create a new time capsule
 * POST /api/letter/create  (keep path for now; later rename to /api/capsule/create)
 *
 * Body:
 * {
 *   content: string;
 *   receiverId: string;
 *   senderId: string;
 *   subject?: string;
 *   releaseAtMillis?: number; // REQUIRED (or use releaseAtISO)
 *   releaseAtISO?: string;    // e.g. "2026-12-31T00:00:00Z"
 * }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      content?: unknown;
      receiverId?: unknown;
      senderId?: unknown;
      subject?: unknown;
      releaseAtMillis?: unknown;
      releaseAtISO?: unknown;
    };

    const content = typeof body.content === "string" ? body.content.trim() : "";
    const senderId = typeof body.senderId === "string" ? body.senderId.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";

    if (!content) return new Response("Missing content", { status: 400 });
    if (!senderId) return new Response("Missing senderId", { status: 400 });

    // Parse release time (required)
    let releaseAt: Timestamp | null = null;

    if (typeof body.releaseAtMillis === "number" && Number.isFinite(body.releaseAtMillis)) {
      releaseAt = Timestamp.fromMillis(body.releaseAtMillis);
    } else if (typeof body.releaseAtISO === "string") {
      const ms = Date.parse(body.releaseAtISO);
      if (!Number.isNaN(ms)) releaseAt = Timestamp.fromMillis(ms);
    }

    if (!releaseAt) return new Response("Missing or invalid release time", { status: 400 });

    const capsulesCol = collection(db, "capsules");

    const docRef = await addDoc(capsulesCol, {
      content,
      senderId,
      subject: subject || null,
      createdAt: serverTimestamp(),
      releaseAt,
      openedAt: null,
    });

    return Response.json({ ok: true, id: docRef.id });
  } catch (e) {
    console.error("Creating capsule:", e);
    return new Response("Error during creating capsule", { status: 400 });
  }
}