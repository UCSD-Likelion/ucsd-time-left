"use client";

import "@/app/globals.css";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import type { UserCredential } from "firebase/auth";
import { auth } from "@/Functions/firebase/clientApp";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  loginEmail: (email: string, password: string) => Promise<UserCredential>;
  signupEmail: (email: string, password: string) => Promise<UserCredential>;
  loginGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      loginEmail: async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
      },
      signupEmail: async (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
      },
      loginGoogle: async () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
      },
      logout: async () => {
        await signOut(auth);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  console.log(AuthContext);

  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
