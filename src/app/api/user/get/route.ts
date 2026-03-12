import { db } from "@/Functions/firebase/clientApp";
import type { UserProfileData } from "@/app/api/user/user.dao";
import { collection, doc, getDoc } from "firebase/firestore";

const usersCol = collection(db, "users");

function toMillis(ts: any): number | null {
  if (!ts) return null;
  if (typeof ts?.toMillis === "function") return ts.toMillis();
  if (typeof ts?.seconds === "number" && typeof ts?.nanoseconds === "number") {
    return ts.seconds * 1000 + Math.floor(ts.nanoseconds / 1_000_000);
  }
  return null;
}


export async function GET(req: Request) {
  const url = new URL(req.url);
  const uid = url.searchParams.get("uid") ?? "";

  if (!uid.trim()) return new Response("Missing uid", { status: 400 });

  const ref = doc(usersCol, uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return new Response("User not found", { status: 404 });

  const data = snap.data() as UserProfileData;

  return Response.json({
    ok: true,
    profile: {
      ...data,
      birthdayMillis: toMillis(data.birthday),
      enrollmentMillis: toMillis(data.enrollment),
      graduationMillis: toMillis(data.graduation),
    },
  });
}