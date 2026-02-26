"use client";
import styles from './signup.module.css';
import "@material/web/textfield/outlined-text-field";

export default function SignupPage() {
	return (
		<div className={styles.SignUpLayout}>
			<div className={styles.SignUpSection}>
				<div className={styles.SignUpText}>
					<h1>
						Create Account
					</h1>
				</div>
				<div>
					<form>
						<div className="flex row-span-1">
							<md-outlined-text-field
								suppressHydrationWarning
								label="First Name"
								type='text'
								required
								className="mr-2 ml-4 my-2"
							>
							</md-outlined-text-field>
							<md-outlined-text-field
								suppressHydrationWarning
								label="Last Name"
								type='text'
								required
								className="mr-4 ml-2 my-2"
							>
							</md-outlined-text-field>
						</div>
						<div className="flex flex-col">
							<md-outlined-text-field
								suppressHydrationWarning
								label="Email"
								type='email'
								required
								className="mx-4 my-2"
							>
							</md-outlined-text-field>
							<md-outlined-text-field
								suppressHydrationWarning
								label="Password"
								type='password'
								required
								className="mx-4 my-2"
							>
							</md-outlined-text-field>
						</div>
					</form>
				</div>
			</div>
			<div className={styles.LogoSection}>
			</div>
		</div>
	)
}
