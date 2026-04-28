import { db } from "@/Functions/firebase/clientApp";
import type { UserProfileData } from "@/app/api/user/user.dao";
import { collection, doc, getDoc } from "firebase/firestore";

const usersCol = collection(db, "users");

function toMillis(ts: any): number | null {
  if (!ts) return null;
  if (typeof ts?.toMillis === "function") return ts.toMillis();
  if (typeof ts?.seconds === "number") {
    return ts.seconds * 1000;
  }
  return null;
}

function getTermFromDate(millis: number | null): string {
  if (!millis) return "";

  const date = new Date(millis);
  const month = date.getMonth() + 1;
  const year = date.getFullYear().toString().slice(-2);

  if (month >= 9 && month <= 12) return `FA ${year}`;
  if (month >= 1 && month <= 3) return `WI ${year}`;
  if (month >= 4 && month <= 6) return `SP ${year}`;
  return `SS ${year}`;
}

function getYearLevelFromEnrollment(millis: number | null): string {
  if (!millis) return "";

  const start = new Date(millis);
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();

  const currentMonth = now.getMonth();
  if (currentMonth < 8) {
    years -= 1;
  }

  if (years <= 0) return "Freshman";
  if (years === 1) return "Sophomore";
  if (years === 2) return "Junior";
  return "Senior";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const uid = url.searchParams.get("uid") ?? "";

  if (!uid.trim()) {
    return new Response("Missing uid", { status: 400 });
  }

  const ref = doc(usersCol, uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return new Response("User not found", { status: 404 });
  }

  const data = snap.data() as UserProfileData;

  const enrollmentMillis = toMillis(data.enrollment);
  const graduationMillis = toMillis(data.graduation);

  return Response.json({
    ok: true,
    id: snap.id,
    uid: data.uid ?? snap.id,
    username: data.username ?? "",
    college: data.college ?? "",
    enrollment: getYearLevelFromEnrollment(enrollmentMillis),
    admission: getTermFromDate(enrollmentMillis),
    graduation: getTermFromDate(graduationMillis),
    major: Array.isArray(data.major) ? data.major : [],
    minor: Array.isArray(data.minor) ? data.minor : [],
    pid: data.pid ?? "",
  });
}