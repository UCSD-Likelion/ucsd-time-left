import styles from './login.module.css';

export default function Login() {
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

        </div>
    </div>
  )
}