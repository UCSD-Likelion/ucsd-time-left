import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBO9hqAvAAj9iY1CeGNUBOzURFTl7bPH4s",
  authDomain: "tassel-94287.firebaseapp.com",
  projectId: "tassel-94287",
  storageBucket: "tassel-94287.firebasestorage.app",
  messagingSenderId: "700261633148",
  appId: "1:700261633148:web:a9859bba16187a5d2f0df9",
  measurementId: "G-EML93NJYNS"
};


const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);