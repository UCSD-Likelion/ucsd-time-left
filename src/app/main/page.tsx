"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/Functions/firebase/clientApp";

export default function MainRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    console.log("Checking logged-in user...");

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Firebase user:", user);

      if (!user) {
        console.log("No user. Going to login.");
        router.replace("/login");
        return;
      }

      console.log("Logged in uid:", user.uid);
      router.replace(`/main/${user.uid}`);
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
      }}
    >
      Loading your profile...
    </main>
  );
}