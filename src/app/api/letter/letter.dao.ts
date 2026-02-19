import { db } from '@/Functions/firebase/clientApp';
import { Timestamp } from "firebase/firestore";
import { collection, addDoc } from 'firebase/firestore';
// import { collection, getDocs, QueryDocumentSnapshot, SnapshotOptions, DocumentData } from 'firebase/firestore';


export type LetterData = {
  content: string;
  date: Timestamp;
  receiverId: string;
  senderId: string;
};

export type Letter = LetterData & { id: string };

const lettersCol = collection(db, "letters");

export async function createLetter(letter: LetterData): Promise<string> {
  const docRef = await addDoc(lettersCol, letter);

  return docRef.id;
}