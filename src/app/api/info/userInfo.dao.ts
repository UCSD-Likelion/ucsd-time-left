import { collection, getDocs, query, where } from "firebase/firestore";
import { UserInfo } from "@/types/userInfo";
import { db } from "@/Functions/firebase/clientApp";

export async function getUserInfoByUid(uid: string): Promise<UserInfo | null> {
  const q = query(collection(db, "users"), where("uid", "==", uid));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  const data = docSnap.data() as Partial<UserInfo>;

  return {
    id: docSnap.id,
    uid: String(data.uid ?? uid),
    username: String(data.username ?? ""),
    college: String(data.college ?? ""),
    enrollment: String(data.enrollment ?? ""),
    graduation: String(data.graduation ?? ""),
    major: Array.isArray(data.major) ? data.major.map(String) : [],
    minor: Array.isArray(data.minor) ? data.minor.map(String) : [],
    pid: String(data.pid ?? ""),
  };
}