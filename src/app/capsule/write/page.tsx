"use client";

import styles from "../capsule.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/Functions/firebase/clientApp";

// ── Types ────────────────────────────────────────────────────────────────────

type CreateResponse = {
  ok?: boolean;
  id?: string;
};

// ── Component ────────────────────────────────────────────────────────────────

export default function WriteCapsulePage() {
  const router = useRouter();

  const [senderId, setSenderId] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [releaseAtLocal, setReleaseAtLocal] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // ── Auth ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setSenderId(user?.uid ?? "");
    });
    return unsub;
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────

  const releasePreview = useMemo(() => {
    const ms = Date.parse(releaseAtLocal);
    return Number.isFinite(ms) ? new Date(ms).toLocaleString() : "";
  }, [releaseAtLocal]);

  const canCreate =
    !busy &&
    senderId.trim().length > 0 &&
    content.trim().length > 0 &&
    releaseAtLocal.trim().length > 0;

  // ── Submit ─────────────────────────────────────────────────────────────────

  const submit = async () => {
    const releaseMs = Date.parse(releaseAtLocal);

    if (!senderId.trim())            return setStatusMessage("User not authenticated.");
    if (!content.trim())             return setStatusMessage("Please enter your letter.");
    if (!Number.isFinite(releaseMs)) return setStatusMessage("Please choose a valid release date/time.");

    try {
      setBusy(true);
      setStatusMessage("Creating capsule...");

      const res = await fetch("/api/capsule/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: senderId.trim(),
          subject,
          content,
          releaseAtMillis: releaseMs,
        }),
      });

      const text = await res.text();
      let data: CreateResponse | null = null;
      try { data = text ? (JSON.parse(text) as CreateResponse) : null; }
      catch { data = null; }

      if (!res.ok) throw new Error(text || "Failed to create capsule");

      // Success — navigate to inbox (busy stays true to disable button during transition)
      router.push("/capsule");
    } catch (e: unknown) {
      setStatusMessage(e instanceof Error ? e.message : "Failed to create capsule");
      setBusy(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.CapsuleLayout}>
      <div className={styles.SingleColumn}>
        <div className={styles.ListCard}>
          <div className={styles.ListHeader}>
            <div>
              <div className={styles.ListHeaderTitle}>Create Capsule</div>
              <div className={styles.SmallHint}>Write a letter to your future self.</div>
            </div>
          </div>

          <div className={styles.FormBody}>
            <div className={styles.ActionRow}>
              <button className={styles.GhostButton} onClick={() => router.push("/dashboard")} type="button">
                Back to Dashboard
              </button>
              <button className={styles.GhostButton} onClick={() => router.push("/capsule")} type="button">
                Back to Capsules
              </button>
            </div>

            <div className={styles.Field}>
              <label className={styles.Label} htmlFor="capsule-release-at">Unlock At</label>
              <input
                id="capsule-release-at"
                className={styles.Input}
                type="datetime-local"
                value={releaseAtLocal}
                onChange={(e) => setReleaseAtLocal(e.target.value)}
              />
              <div className={styles.SmallHint}>
                {releasePreview ? `Unlock time: ${releasePreview}` : "Pick a future date/time."}
              </div>
            </div>

            <div className={styles.Field}>
              <label className={styles.Label} htmlFor="capsule-subject">Subject</label>
              <input
                id="capsule-subject"
                className={styles.Input}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject (optional)"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label} htmlFor="capsule-content">Message</label>
              <textarea
                id="capsule-content"
                className={styles.Textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a letter to your future self..."
              />
            </div>

            {statusMessage && (
              <div className={styles.Field}>
                <div className={styles.SmallHint} style={{ color: "#dc2626" }}>{statusMessage}</div>
              </div>
            )}

            <div className={styles.ActionRow}>
              <button
                className={styles.SecondaryButton}
                onClick={submit}
                type="button"
                disabled={!canCreate}
                style={!canCreate ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
              >
                {busy ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}