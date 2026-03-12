import { db } from "@/Functions/firebase/clientApp";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import type { UserProfileData } from "@/app/api/user/user.dao";

const usersCol = collection(db, "users");

function fromMillisOrNull(x: unknown): Timestamp | null {
  if (typeof x !== "number" || !Number.isFinite(x)) return null;
  return Timestamp.fromMillis(x);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      profile?: unknown;
      birthdayMillis?: unknown;
      enrollmentMillis?: unknown;
      graduationMillis?: unknown;
    };

    if (!body.profile || typeof body.profile !== "object") {
      return new Response("Missing profile", { status: 400 });
    }

    const p = body.profile as UserProfileData;

    if (!p.uid || typeof p.uid !== "string") return new Response("Invalid uid", { status: 400 });
    if (!Array.isArray(p.major)) return new Response("major must be string[]", { status: 400 });
    if (!Array.isArray(p.minor)) return new Response("minor must be string[]", { status: 400 });

    const birthday = fromMillisOrNull(body.birthdayMillis);
    const enrollment = fromMillisOrNull(body.enrollmentMillis);
    const graduation = fromMillisOrNull(body.graduationMillis);

    const merged: UserProfileData = {
      ...p,
      birthday: birthday ?? p.birthday ?? null,
      enrollment: enrollment ?? p.enrollment ?? null,
      graduation: graduation ?? p.graduation ?? null,
    };

    const ref = doc(usersCol, merged.uid);
    await setDoc(ref, merged, { merge: true });

    return Response.json({ ok: true });
  } catch (e) {
    console.error("Upserting user profile:", e);
    return new Response("Error during upsert", { status: 400 });
  }
}