"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Components/AuthProvider";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/dashboard");
  }, [loading, user, router]);

  if (loading) return <p style={{ padding: 16 }}>Loading...</p>;
  if (!user) return null;

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ fontSize: 24 }}>Dashboard</h1>
      <p>Signed in as {user.email}</p>
      <button onClick={logout} style={{ padding: 10 }}>
        Sign out
      </button>
    </main>
  );
}