"use client";

import styles from "./letter.module.css";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
// import { useAuth } from "@/Components/AuthProvider";
import type { Letter } from "../api/letter/letter.dao";

type LetterWire = {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  subject: string | null;
  dateMillis: number | null;
  readAtMillis: number | null;
};

type LetterListItem = {
  id: string;
  fromLabel: string;
  subject: string;
  preview: string;
  dateLabel: string;
  unread?: boolean;
};

type TimestampJson = { seconds: number; nanoseconds: number };

function toMillis(ts: unknown): number | null {
  if (!ts) return null;

  // Firestore Timestamp instance (client)
  if (typeof ts === "object" && ts !== null && typeof (ts as any).toMillis === "function") {
    return (ts as any).toMillis();
  }

  // JSON shape: { seconds, nanoseconds }
  if (typeof ts === "object" && ts !== null) {
    const s = (ts as any).seconds;
    const ns = (ts as any).nanoseconds;
    if (typeof s === "number" && typeof ns === "number") {
      return s * 1000 + Math.floor(ns / 1_000_000);
    }
  }

  // Already milliseconds
  if (typeof ts === "number") return ts;

  // ISO string
  if (typeof ts === "string") {
    const ms = Date.parse(ts);
    return Number.isNaN(ms) ? null : ms;
  }

  return null;
}

function letterToWire(l: Letter): LetterWire {
  return {
    id: l.id,
    content: l.content,
    senderId: l.senderId,
    receiverId: l.receiverId,
    subject: l.subject ?? null,
    dateMillis: toMillis(l.date),
    readAtMillis: toMillis(l.readAt),
  };
}


// Shown immediately (nice UX) until backend fetch finishes.
const EXAMPLE_LETTERS: LetterListItem[] = [
  {
    id: "L1",
    fromLabel: "Friend1",
    subject: "Wyd?",
    preview: "Wyd?  Some example text for letter",
    dateLabel: "Feb 25",
    unread: true,
  },
  {
    id: "L2",
    fromLabel: "Friend2",
    subject: "Free this weekend?",
    preview: "Free this weekend? Some example text for letter",
    dateLabel: "Feb 20",
  },
];

function formatShortDate(ms: number | null): string {
  if (!ms) return "";
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function LetterInboxPage() {
  const router = useRouter();
  // const { user, loading: authLoading } = useAuth();

  const goBack = () => router.push("/dashboard");

  const [letters, setLetters] = useState<LetterListItem[]>(EXAMPLE_LETTERS);
  const [selectedId, setSelectedId] = useState<string>(EXAMPLE_LETTERS[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => letters.find((l) => l.id === selectedId) ?? null,
    [letters, selectedId]
  );

  // NOTE: Auth + backend fetch disabled for design preview.
  // Re-enable useAuth() + the useEffect below when you want real data.
  // useEffect(() => {
  //   if (authLoading) return;
  //   if (!user) {
  //     router.replace(`/login?redirect=${encodeURIComponent("/letter")}`);
  //     return;
  //   }

  //   let cancelled = false;

  //   async function loadInbox() {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const url = `/api/letter/get?mode=list&uid=${encodeURIComponent(user.uid)}&box=inbox&limit=50`;
  //       const res = await fetch(url);
  //       if (!res.ok) throw new Error(await res.text());

  //       const raw = (await res.json()) as Letter[];
  //       const data: LetterWire[] = raw.map(letterToWire);

  //       const mapped: LetterListItem[] = data.map((x) => ({
  //         id: x.id,
  //         fromLabel: x.senderId, // later: replace with sender's displayName from users collection
  //         subject: x.subject ?? "(No Title)",
  //         preview: (x.content ?? "").slice(0, 80),
  //         dateLabel: formatShortDate(x.dateMillis),
  //         unread: x.readAtMillis == null,
  //       }));

  //       if (!cancelled) {
  //         setLetters(mapped);
  //         setSelectedId(mapped[0]?.id ?? "");
  //       }
  //     } catch (e: unknown) {
  //       if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load letters");
  //     } finally {
  //       if (!cancelled) setLoading(false);
  //     }
  //   }

  //   loadInbox();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [authLoading, user, router]);

  const compose = () => router.push("/letter/write");
  const openLetter = (id: string) => setSelectedId(id);

  return (
    <div className={styles.LetterLayout}>
      <aside className={styles.Sidebar}>
        <button className={styles.BackButton} onClick={goBack} aria-label="Back to dashboard">
          ←
        </button>

        <div>
          <h1 className={styles.SidebarTitle}>Inbox</h1>
          <p className={styles.SidebarSubtitle}>Check your letters in a simple, email-like inbox.</p>
        </div>

        <button className={styles.PrimaryButton} onClick={compose}>
          + Compose
        </button>

        <div className={styles.SidebarSection}>
          <div className={styles.SidebarSectionLabel}>FOLDERS</div>
          <div className={styles.FolderList}>
            <div className={styles.FolderItemActive}>Inbox</div>
            <div className={styles.FolderItem}>Sent</div>
            <div className={styles.FolderItem}>Archive</div>
          </div>
        </div>
      </aside>

      <section className={styles.Content}>
        <div className={styles.ContentGrid}>
          <div className={styles.ListCard}>
            <div className={styles.ListHeader}>
              <div className={styles.ListHeaderTitle}>Inbox</div>
              <button className={styles.SecondaryButton} onClick={compose}>
                Compose
              </button>
            </div>

            {loading && <div className={styles.StatusText}>Loading inbox...</div>}
            {error && <div className={styles.ErrorText}>{error}</div>}

            <div className={styles.ListBody}>
              {letters.map((l) => {
                const active = l.id === selectedId;
                return (
                  <button
                    key={l.id}
                    className={`${styles.ListRow} ${active ? styles.ListRowActive : ""}`}
                    onClick={() => openLetter(l.id)}
                  >
                    <div className={styles.RowTop}>
                      <div className={styles.FromLine}>
                        {l.unread && <span className={styles.UnreadDot} aria-label="unread" />}
                        <span className={styles.FromName}>{l.fromLabel}</span>
                      </div>
                      <span className={styles.RowDate}>{l.dateLabel}</span>
                    </div>
                    <div className={styles.RowSubject}>{l.subject}</div>
                    <div className={styles.RowPreview}>{l.preview}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.PreviewCard}>
            {!selected ? (
              <p className={styles.StatusText}>Select a letter from the list on the left.</p>
            ) : (
              <>
                <div className={styles.PreviewHeader}>
                  <div>
                    <div className={styles.PreviewSubject}>{selected.subject}</div>
                    <div className={styles.PreviewMeta}>
                      From <span className={styles.PreviewFrom}>{selected.fromLabel}</span>
                    </div>
                  </div>
                  <div className={styles.PreviewDate}>{selected.dateLabel}</div>
                </div>

                <hr className={styles.Divider} />

                <p className={styles.PreviewBody}>{selected.preview}</p>

                <div className={styles.PreviewActions}>
                  <button className={styles.SecondaryButton} onClick={compose}>
                    Reply
                  </button>
                  <button className={styles.TertiaryButton} onClick={() => alert("Practice: archive")}>
                    Archive
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}