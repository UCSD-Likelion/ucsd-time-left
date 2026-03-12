import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY!,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID
// };

const firebaseConfig = {
  apiKey: "AIzaSyCyRDvhKEXET3d0NLU0uQ2PcIakq60Ff5g",
  authDomain: "time-left-fe046.firebaseapp.com",
  projectId: "time-left-fe046",
  storageBucket: "time-left-fe046.firebasestorage.app",
  messagingSenderId: "847464131953",
  appId: "1:847464131953:web:9772b87090f7c048b39ad0",
  measurementId: "G-31YTD0PHMZ"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);