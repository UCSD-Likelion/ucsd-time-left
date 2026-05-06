"use client";
import styles from "./signup.module.css";
import "@material/web/textfield/outlined-text-field";
import "@material/web/button/filled-button.js";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import type { MdOutlinedTextField } from "@material/web/textfield/outlined-text-field";
import { useAuth } from "@/Components/AuthProvider";
import { GoogleButton } from "@/Components/GoogleButton/GoogleButton";

export default function SignupPage() {
	const router = useRouter();
	const params = useSearchParams();
	const redirectTo = params.get("redirect") || "/dashboard";
	const query = params.toString();
	const loginHref = query ? `/login?${query}` : "/login";

	const { signupEmail, loginGoogle } = useAuth();
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const userProfileExists = async (uid: string): Promise<boolean> => {
		const res = await fetch(`/api/user/get?uid=${encodeURIComponent(uid)}`);
		if (res.status === 404) return false;
		if (!res.ok) throw new Error(await res.text());
		return true;
	};

	const routeAfterAuth = async (uid: string) => {
		const exists = await userProfileExists(uid);
		router.replace(exists ? redirectTo : "/onboarding/1");
	};

	const submit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (busy) return;

		setError(null);
		setBusy(true);

		try {
			const cred = await signupEmail(email, password);
			const uid = cred.user?.uid;
			if (!uid) throw new Error("Missing user session");
			await routeAfterAuth(uid);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Signup failed";
			setError(message);
		} finally {
			setBusy(false);
		}
	};

	const google = async () => {
		setError(null);
		setBusy(true);
		try {
			const cred = await loginGoogle();
			const uid = cred.user?.uid;
			if (!uid) throw new Error("Missing user session");
			await routeAfterAuth(uid);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Google sign in failed";
			setError(message);
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className={styles.SignUpLayout}>
			<div className={styles.LogoSection}>
				<h1>Join Us</h1>
				<p>
					You can sign up with your email address and password, or
					continue with your Google account.
				</p>
			</div>
			<div className={styles.SignUpFormSection}>
				<div className={styles.SignUpText}>
					<h1>Create Account</h1>
					<p>
						{"Already have an account? "}
						<Link
							href={loginHref}
							style={{ color: "#D3B66E" }}
							className="underline hover:no-underline"
						>
							Log in
						</Link>
					</p>
				</div>
				<div>
					<form onSubmit={submit}>
						<div className={styles.NameRow}>
							<md-outlined-text-field
								suppressHydrationWarning
								label="First"
								type="text"
								required
								value={firstName}
								onChange={(e) =>
									setFirstName(
										(e.currentTarget as MdOutlinedTextField).value,
									)
								}
								style={{ width: "100%", padding: 10 }}
							/>
							<md-outlined-text-field
								suppressHydrationWarning
								label="Last"
								type="text"
								required
								value={lastName}
								onChange={(e) =>
									setLastName(
										(e.currentTarget as MdOutlinedTextField).value,
									)
								}
								style={{ width: "100%", padding: 10 }}
							/>
						</div>

						<md-outlined-text-field
							suppressHydrationWarning
							label="E-mail"
							type="email"
							value={email}
							onChange={(e) =>
								setEmail(
									(e.currentTarget as MdOutlinedTextField).value,
								)
							}
							required
							style={{
								width: "100%",
								padding: 10,
								marginBottom: 12,
							}}
						/>

						<md-outlined-text-field
							suppressHydrationWarning
							label="Password"
							type="password"
							value={password}
							onChange={(e) =>
								setPassword(
									(e.currentTarget as MdOutlinedTextField).value,
								)
							}
							required
							style={{
								width: "100%",
								padding: 10,
								marginBottom: 12,
							}}
						/>

						{error ? (
							<p style={{ color: "crimson" }} className="my-4">
								{error}
							</p>
						) : null}

						<md-filled-button
							type="submit"
							disabled={busy}
							style={{
								width: "100%",
								padding: 10,
								fontSize: "16px",
								height: "45px",
							}}
						>
							{busy ? "Creating account..." : "Create Account"}
						</md-filled-button>
					</form>

					<div className={styles.OrDivider}>
						<span>or</span>
					</div>

					<div style={{ marginTop: "20px", width: "100%" }}>
						<GoogleButton onClick={google} disabled={busy} />
					</div>
				</div>
			</div>
		</div>
	);
}
