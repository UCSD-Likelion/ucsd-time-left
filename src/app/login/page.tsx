"use client";
import styles from './login.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/Components/AuthProvider';
import { useState } from 'react';
import { GoogleButton } from '@/Components/GoogleButton/GoogleButton';
import "@material/web/button/filled-button.js";
import "@material/web/textfield/outlined-text-field";

import type { MdOutlinedTextField } from "@material/web/textfield/outlined-text-field.js";
import Link from "next/link";

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
				<div className={styles.SignInText}>
					<h1>
						Sign-in
					</h1>
					<p>
						{"Don't have an account? "}
						<Link
							href="/signup"
							style={{color: "#D3B66E"}}
							className="underline hover:no-underline">
							Create Now.
						</Link>
					</p>
				</div>
				<div>
					<form onSubmit={submit}>
						<md-outlined-text-field
							suppressHydrationWarning
							label="Email"
							type="email"
							value={email}
							onChange={(e) => setEmail((e.currentTarget as MdOutlinedTextField).value)}
							required
							style={{ width: "100%", padding: 10, marginBottom: 12 }}>
						</md-outlined-text-field>
						
						<md-outlined-text-field
							suppressHydrationWarning
							label="Password"
							value={password}
							onChange={(e) => setPassword((e.currentTarget as MdOutlinedTextField).value)}
							type="password"
							required
							style={{ width: "100%", padding: 10, marginBottom: 12 }}
						>
						</md-outlined-text-field>
						
						{error &&
                            <p style={{ color: "crimson"}} className="my-4">
	                            {console.log(error)}
	                            {(error === "Firebase: Error (auth/invalid-credential).") && "\n\nUser not found."}
	                            {(error === "Firebase: Error (auth/too-many-requests).") && "\n\nToo Many Requests"}
	                            {(error === "Firenase: Error (auth/invalid-password).") && "\n\nWrong Password"}
                            </p>
						}
						
						<md-filled-button type="submit" disabled={busy} style={{ width: "100%", padding: 10, fontSize: "16px", height: "45px" }}>
							Sign in
						</md-filled-button>
					</form>

					<div className={styles.OrDivider}>
						<span>or</span>
					</div>

					<div style={{ marginTop: "20px", width: "100%" }} >
						<GoogleButton 
							onClick={google} 
							disabled={busy}
						/>
					</div>
				</div>
				
			</div>
		</div>
	)
}
