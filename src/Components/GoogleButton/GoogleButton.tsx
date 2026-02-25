import Image from "next/image";
import styles from "./GoogleButton.module.css";

export function GoogleButton({ onClick, disabled}: { onClick: () => void; disabled: boolean }) {
    return (
        <button className={styles.gsiMaterialButton} style={{ width: "300px" }} onClick={onClick} disabled={disabled}>
          <div className={styles.gsiMaterialButtonState}></div>
          <div className={styles.gsiMaterialButtonContentWrapper}>
            <div className={styles.gsiMaterialButtonIcon}>
				<Image src="/Google.svg" alt="Google logo" width={18} height={18} />
            </div>
            <span className={styles.gsiMaterialButtonContents}>Continue with Google</span>
            <span style={{ display: "none" }}>Continue with Google</span>
          </div>
        </button>
    )
}