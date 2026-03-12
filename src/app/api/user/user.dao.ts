import { db } from "@/Functions/firebase/clientApp";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export type UserProfileData = {
  uid: string;

  username: string;
  bio?: string | null;

  birthday?: Timestamp | null;

  pid?: string | null;

  major: string[];
  minor: string[];

  college?: string | null;

  status?: "Freshman" | "Continuing" | "Transfer" | null;

  yearLevel?: 2 | 3 | 4 | null;

  enrollment?: Timestamp | null;
  graduation?: Timestamp | null;
};

export type UserProfile = UserProfileData & { id: string };

const usersCol = collection(db, "users");

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(usersCol, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  return { id: snap.id, ...(snap.data() as UserProfileData) };
}

export async function upsertUserProfile(profile: UserProfileData): Promise<void> {
  const ref = doc(usersCol, profile.uid);
  await setDoc(ref, profile, { merge: true });
}

export async function updateUserProfile(uid: string, patch: Partial<UserProfileData>): Promise<void> {
  const ref = doc(usersCol, uid);
  await updateDoc(ref, patch);
}