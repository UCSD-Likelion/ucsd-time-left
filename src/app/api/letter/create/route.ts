import { db } from "@/Functions/firebase/clientApp";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      content?: unknown;
      receiverId?: unknown;
      senderId?: unknown;
      subject?: unknown;
    };

    const content = typeof body.content === "string" ? body.content.trim() : "";
    const receiverId = typeof body.receiverId === "string" ? body.receiverId.trim() : "";
    const senderId = typeof body.senderId === "string" ? body.senderId.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";

    if (!content) return new Response("Missing content", { status: 400 });
    if (!receiverId) return new Response("Missing receiverId", { status: 400 });
    if (!senderId) return new Response("Missing senderId", { status: 400 });

    const lettersCol = collection(db, "letters");

    const docRef = await addDoc(lettersCol, {
      content,
      receiverId,
      senderId,
      subject: subject || null,
      date: serverTimestamp(),
      readAt: null,
    });

    return Response.json({ ok: true, id: docRef.id });
  } catch (e) {
    console.error("Creating letter:", e);
    return new Response("Error during creating letter", { status: 400 });
  }
}