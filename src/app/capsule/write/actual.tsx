"use client";

import styles from "../capsule.module.css";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WriteCapsulePage() {
  const router = useRouter();

  const [toUser, setToUser] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [releaseAtLocal, setReleaseAtLocal] = useState(""); // datetime-local
  const [busy, setBusy] = useState(false);

  const goInbox = () => router.push("/capsule");
  const goDashboard = () => router.push("/dashboard");

  const submit = async () => {
    // Design preview: auth disabled. Replace with user.uid later.
    const senderId = "demo-sender";

    // Convert datetime-local -> ms
    const releaseMs = releaseAtLocal ? Date.parse(releaseAtLocal) : NaN;

    if (!Number.isFinite(releaseMs)) {
      alert("Please choose a valid release date/time.");
      return;
    }

    try {
      setBusy(true);

      const res = await fetch("/api/capsule/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: toUser,
          senderId,
          subject,
          content,
          releaseAtMillis: releaseMs,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to create capsule");
      }

      router.push("/capsule");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to create capsule");
    } finally {
      setBusy(false);
    }
  };

  const canCreate =
    !busy && toUser.trim().length > 0 && content.trim().length > 0 && releaseAtLocal.trim().length > 0;

  return (
    <div className={styles.CapsuleLayout}>
      <aside className={styles.Sidebar}>
        <button className={styles.BackButton} onClick={goDashboard} aria-label="Back to dashboard">
          ←
        </button>

        <div>
          <h1 className={styles.SidebarTitle}>Create Capsule</h1>
          <p className={styles.SidebarSubtitle}>Write now, unlock later.</p>
        </div>

        <button className={styles.PrimaryButton} onClick={goInbox}>
          Back to Capsules
        </button>

        <div className={styles.SidebarSection}>
          <div className={styles.SidebarSectionLabel}>HINT</div>
          <div className={styles.FolderList}>
            <div className={styles.FolderItemActive}>Pick a future unlock time</div>
            <div className={styles.FolderItem}>Capsule stays locked until then</div>
          </div>
        </div>
      </aside>

      <section className={styles.Content}>
        <div className={styles.ComposeGrid}>
          <div className={styles.ComposeCard}>
            <div className={styles.ComposeHeader}>
              <div className={styles.ComposeTitle}>New Time Capsule</div>
              <div className={styles.SmallHint}>POSTs to /api/capsule/create</div>
            </div>

            <div className={styles.FormBody}>
              <div className={styles.Field}>
                <div className={styles.Label}>To (uid or username)</div>
                <input
                  className={styles.Input}
                  value={toUser}
                  onChange={(e) => setToUser(e.target.value)}
                  placeholder="receiver uid / username"
                  autoComplete="off"
                />
              </div>

              <div className={styles.Field}>
                <div className={styles.Label}>Unlock at</div>
                <input
                  className={styles.Input}
                  type="datetime-local"
                  value={releaseAtLocal}
                  onChange={(e) => setReleaseAtLocal(e.target.value)}
                />
                <div className={styles.SmallHint}>
                  Pick a future date/time. The capsule stays locked until then.
                </div>
              </div>

              <div className={styles.Field}>
                <div className={styles.Label}>Subject</div>
                <input
                  className={styles.Input}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="subject (optional)"
                />
              </div>

              <div className={styles.Field}>
                <div className={styles.Label}>Message</div>
                <textarea
                  className={styles.Textarea}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write something for the future..."
                />
              </div>
            </div>

            <div className={styles.ActionRow}>
              <button className={styles.GhostButton} onClick={goInbox} disabled={busy}>
                Cancel
              </button>
              <button
                className={styles.SecondaryButton}
                onClick={submit}
                disabled={!canCreate}
                style={!canCreate ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
              >
                {busy ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}