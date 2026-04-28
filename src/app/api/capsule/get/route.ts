import { db } from "@/Functions/firebase/clientApp";
import type { Capsule, CapsuleData } from "@/app/api/capsule/capsule.dao";
import { collection, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
 
const capsulesCol = collection(db, "capsules");

function toMillis(ts: any): number | null {
  if (!ts) return null;
  if (typeof ts?.toMillis === "function") return ts.toMillis();

  // if it got JSON-ified somehow:
  if (typeof ts?.seconds === "number" && typeof ts?.nanoseconds === "number") {
    return ts.seconds * 1000 + Math.floor(ts.nanoseconds / 1_000_000);
  }
  return null;
}

/**
 * Get a single time capsule
 * POST /api/letter/get
 * Body: { documentId: string }
 *
 * If locked: returns 403 + releaseAtMillis
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { documentId?: unknown };

    if (typeof body.documentId !== "string") {
      return new Response("Invalid document id", { status: 400 });
    }

    const docRef = doc(capsulesCol, body.documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return new Response("Document does not exist", { status: 404 });
    }

    const data = docSnap.data() as CapsuleData;
    const releaseMs = toMillis(data.releaseAt);
    const nowMs = Date.now();

    if (releaseMs != null && nowMs < releaseMs) {
      return Response.json(
        { ok: false, locked: true, id: docSnap.id, releaseAtMillis: releaseMs },
        { status: 403 }
      );
    }

    if (data.openedAt == null && releaseMs != null && nowMs > releaseMs) {
      await updateDoc(docRef, { openedAt: serverTimestamp() });
    }

    const capsule: Capsule = { id: docSnap.id, ...data };

    return Response.json({
      ok: true,
      id: capsule.id,
      content: capsule.content,
      senderId: capsule.senderId,
      subject: capsule.subject ?? null,
      createdAtMillis: toMillis(capsule.createdAt),
      releaseAtMillis: toMillis(capsule.releaseAt),
      openedAtMillis: toMillis(capsule.openedAt ?? null),
    });
  } catch (e) {
    console.error("Getting capsule:", e);
    return new Response("Error during getting capsule", { status: 400 });
  }
}