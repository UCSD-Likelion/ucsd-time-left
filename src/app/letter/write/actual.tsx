"use client";

import styles from "../letter.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/Components/AuthProvider";

export default function WriteLetterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [toUser, setToUser] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent("/letter/write")}`);
    }
  }, [authLoading, user, router]);

  const goBack = () => router.push("/letter"); // back to inbox
  const goDashboard = () => router.push("/dashboard");

  const submit = async () => {
    if (!user) {
      alert("Please sign in first.");
      router.replace(`/login?redirect=${encodeURIComponent("/letter/write")}`);
      return;
    }

    const senderId = user.uid;

    try {
      setBusy(true);

      const res = await fetch("/api/letter/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: toUser,
          senderId,
          subject,
          content,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to send");
      }

      // Navigate back to inbox after successful send
      router.push("/letter");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.LetterLayout}>
      {/* Sidebar */}
      <aside className={styles.Sidebar}>
        <button className={styles.BackButton} onClick={goDashboard} aria-label="Back to dashboard">
          ←
        </button>

        <div>
          <h1 className={styles.SidebarTitle}>Compose</h1>
          <p className={styles.SidebarSubtitle}>Write a new letter.</p>
        </div>

        <button className={styles.PrimaryButton} onClick={goBack}>
          Back to Inbox
        </button>

        <div className={styles.SidebarSection}>
          <div className={styles.SidebarSectionLabel}>FOLDERS</div>
          <div className={styles.FolderList}>
            <div className={styles.FolderItemActive}>Draft</div>
            <div className={styles.FolderItem}>Inbox</div>
            <div className={styles.FolderItem}>Sent</div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <section className={styles.Content}>
        <div className={styles.ComposeGrid}>
          <div className={styles.ComposeCard}>
            <div className={styles.ComposeHeader}>
              <div className={styles.ComposeTitle}>New Letter</div>
              <div className={styles.SmallHint}>{authLoading ? "Checking login..." : user ? "Signed in" : "Sign in required"}</div>
            </div>

            <div className={styles.FormBody}>
              <div className={styles.Field}>
                <div className={styles.Label}>To (PID? or Username?)</div>
                <input
                  className={styles.Input}
                  value={toUser}
                  onChange={(e) => setToUser(e.target.value)}
                  placeholder="receiver uid / username"
                />
              </div>

              <div className={styles.Field}>
                <div className={styles.Label}>Subject</div>
                <input
                  className={styles.Input}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="subject"
                />
              </div>

              <div className={styles.Field}>
                <div className={styles.Label}>Message</div>
                <textarea
                  className={styles.Textarea}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your message..."
                />
              </div>
            </div>

            <div className={styles.ActionRow}>
              <button className={styles.GhostButton} onClick={goBack}>
                Cancel
              </button>
              <button
                className={styles.SecondaryButton}
                onClick={submit}
                disabled={busy || authLoading || !user || !toUser.trim() || !content.trim()}
                style={busy || authLoading || !user || !toUser.trim() || !content.trim() ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
              >
                {busy ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}