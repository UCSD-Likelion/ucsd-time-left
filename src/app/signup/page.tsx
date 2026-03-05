'use client';
import styles from "./signup.module.css";
import "@material/web/textfield/outlined-text-field";
import "@material/web/button/filled-button.js";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import type { FormEvent } from "react";
import type { MdOutlinedTextField } from "@material/web/textfield/outlined-text-field";
import { auth } from "@/Functions/firebase/clientApp";

export default function SignupPage() {
	const router = useRouter();
	const params = useSearchParams();
	const redirectTo = params.get("redirect") || "/dashboard";
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	
	const submit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (busy) return;
		
		setError(null);
		setBusy(true);
		
		try {
			await createUserWithEmailAndPassword(auth, email, password);
			router.replace(redirectTo);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Signup failed";
			setError(message);
		} finally {
			setBusy(false);
		}
	};
	
	return (
		<div className={styles.SignUpLayout}>
			<div className={styles.SignUpSection}>
				<div className={styles.SignUpText}>
					<h1>Create Account</h1>
				</div>
				<div className="items-center h-full justify-center flex w-full">
					<form onSubmit={submit}>
						<div className="flex row-span-1 w-full">
							<md-outlined-text-field suppressHydrationWarning label="First Name"
							                        type="text"
							                        required className="mr-2 ml-4 my-4 w-1/2"
							/>
							<md-outlined-text-field suppressHydrationWarning label="Last Name"
							                        type="text"
							                        required className="mr-4 ml-2 my-4 w-1/2"
							/>
						</div>
						
						<div className="flex flex-col">
							<md-outlined-text-field suppressHydrationWarning label="Email"
							                        type="email"
							                        required className="mx-4 my-4"
							                        value={email}
							                        onChange={(e) =>
								                        setEmail((e.currentTarget as MdOutlinedTextField).value)
							                        }
							/>
							<md-outlined-text-field suppressHydrationWarning label="Password"
							                        type="password"
							                        required className="mx-4 my-4"
							                        value={password}
							                        onChange={(e) =>
								                        setPassword((e.currentTarget as MdOutlinedTextField).value)
							                        }
							/>
						</div>
						
						{error ? <p className="mx-4 text-red-600">{error}</p> : null}
						
						<md-filled-button type="submit"
						                  disabled={busy}
						                  style={{ width: "100%", padding:10 }}
						>
							{busy ? "Signing up..." : "Sign Up"}
						</md-filled-button>
					</form>
				</div>
			</div>
			<div className={styles.LogoSection}></div>
		</div>
	);
}
