import { db } from "@/Functions/firebase/clientApp";
import { Timestamp, collection, addDoc } from "firebase/firestore";

// Time Capsule stored in Firestore (doc id is NOT stored in the document)
export type CapsuleData = {
  content: string;
  createdAt: Timestamp;
  releaseAt: Timestamp;
  senderId: string;
  subject?: string | null;
  openedAt?: Timestamp | null;
};

export type Capsule = CapsuleData & { id: string };

// const capsulesCol = collection(db, "capsules");

// export async function createCapsule(capsule: CapsuleData): Promise<string> {
//   const docRef = await addDoc(capsulesCol, capsule);
//   return docRef.id;
// }