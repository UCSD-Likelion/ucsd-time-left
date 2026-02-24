"use client";

import styles from './login.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/Components/AuthProvider';
import { useState } from 'react';
import { GoogleButton } from '@/Components/GoogleButton/GoogleButton';


export default function Login() {
    const router = useRouter();
    const params = useSearchParams();
    const redirectTo = params.get("redirect") || "/dashboard";

    const { loginEmail, signupEmail, loginGoogle } = useAuth();

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await loginEmail(email, password);
      else await signupEmail(email, password);
      router.replace(redirectTo);
    } catch (err: any) {
      setError(err?.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    setBusy(true);
    try {
      await loginGoogle();
      router.replace(redirectTo);
    } catch (err: any) {
      setError(err?.message || "Google sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.LoginLayout}>
        <div className={styles.LogoSection}>
            <h1>
                Welcome Back
            </h1>
            <p>
                You can sign in with your email address and password, or 
                continue with your Google account.
            </p>
        </div>
        <div className={styles.LoginSection}>
            <form onSubmit={submit}>
        <label style={{ display: "block", marginBottom: 6 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />

        <label style={{ display: "block", marginBottom: 6 }}>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />

        {error && <p style={{ color: "crimson", marginBottom: 12 }}>{error}</p>}

        <button type="submit" disabled={busy} style={{ width: "100%", padding: 10 }}>
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
                <GoogleButton onClick={google} disabled={busy} />
        </div>
    </div>
  )
}