"use client";

import styles from "../capsule.module.css";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type CreateResponse = {
  ok?: boolean;
  id?: string;
};

export default function WriteCapsulePage() {
  const router = useRouter();

  const [senderId, setSenderId] = useState("demo-sender");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [releaseAtLocal, setReleaseAtLocal] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdCapsuleId, setCreatedCapsuleId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const goInbox = () => router.push("/capsule");
  const goDashboard = () => router.push("/dashboard");

  const releasePreview = useMemo(() => {
    if (!releaseAtLocal) return "";
    const ms = Date.parse(releaseAtLocal);
    if (!Number.isFinite(ms)) return "";
    return new Date(ms).toLocaleString();
  }, [releaseAtLocal]);

  const submit = async () => {
    const releaseMs = releaseAtLocal ? Date.parse(releaseAtLocal) : NaN;

    if (!senderId.trim()) {
      setStatusMessage("Please enter your user id.");
      return;
    }

    if (!content.trim()) {
      setStatusMessage("Please enter your letter.");
      return;
    }

    if (!Number.isFinite(releaseMs)) {
      setStatusMessage("Please choose a valid release date/time.");
      return;
    }

    try {
      setBusy(true);
      setStatusMessage("Creating capsule...");
      setCreatedCapsuleId("");

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

      try {
        data = text ? (JSON.parse(text) as CreateResponse) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(text || "Failed to create capsule");
      }

      const capsuleId = data?.id ?? "";
      setCreatedCapsuleId(capsuleId);
      setStatusMessage(capsuleId ? `Capsule created. Document id: ${capsuleId}` : "Capsule created.");
    } catch (e: unknown) {
      setStatusMessage(e instanceof Error ? e.message : "Failed to create capsule");
    } finally {
      setBusy(false);
    }
  };

  const canCreate =
    !busy &&
    senderId.trim().length > 0 &&
    content.trim().length > 0 &&
    releaseAtLocal.trim().length > 0;

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
              <button className={styles.GhostButton} onClick={goDashboard} type="button">
                Back to Dashboard
              </button>
              <button className={styles.GhostButton} onClick={goInbox} type="button">
                Back to Capsules
              </button>
            </div>

            <div className={styles.Field}>
              <label className={styles.Label} htmlFor="capsule-sender-id">
                Your User Id
              </label>
              <input
                id="capsule-sender-id"
                className={styles.Input}
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                placeholder="your user id"
                autoComplete="off"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label} htmlFor="capsule-release-at">
                Unlock At
              </label>
              <input
                id="capsule-release-at"
                className={styles.Input}
                type="datetime-local"
                value={releaseAtLocal}
                onChange={(e) => setReleaseAtLocal(e.target.value)}
              />
              <div className={styles.SmallHint}>
                {releasePreview
                  ? `Unlock time: ${releasePreview}`
                  : "Pick a future date/time."}
              </div>
            </div>

            <div className={styles.Field}>
              <label className={styles.Label} htmlFor="capsule-subject">
                Subject
              </label>
              <input
                id="capsule-subject"
                className={styles.Input}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="subject (optional)"
              />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label} htmlFor="capsule-content">
                Message
              </label>
              <textarea
                id="capsule-content"
                className={styles.Textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a letter to your future self..."
              />
            </div>

            <div className={styles.Field}>
              <div className={styles.Label}>Status</div>
              <div className={styles.SmallHint}>{statusMessage || "Nothing submitted yet."}</div>
              <div className={styles.SmallHint}>Created document id: {createdCapsuleId || "—"}</div>
            </div>

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