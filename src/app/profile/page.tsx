"use client";

import styles from "./profile.module.css";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

//
// {
//   ok, id, uid, username, college,
//   enrollment,  — computed year level string, e.g. "Junior"
//   admission,   — computed quarter string,    e.g. "FA 24"
//   graduation,  — computed quarter string,    e.g. "SP 26"
//   major,       — string[]
//   minor,       — string[]
//   pid,
// }

type UserWire = {
  id: string;
  uid: string;
  username: string;
  college: string;
  enrollment: string; // year level: "Freshman" | "Sophomore" | "Junior" | "Senior"
  admission: string;  // quarter term: "FA 24"
  graduation: string; // quarter term: "SP 26"
  major: string[];
  minor: string[];
  pid: string;
};


function joinOrDash(arr: string[]): string {
  return arr?.length ? arr.join(", ") : "-";
}


export default function ProfilePage() {
  const router = useRouter();
  const params = useSearchParams();

  const uid = params.get("uid") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserWire | null>(null);

  useEffect(() => {
    if (!uid.trim()) {
      setError("Missing uid. Try: /profile?uid=YOUR_UID");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/user/get?uid=${encodeURIComponent(uid)}`);
        if (!res.ok) throw new Error(await res.text());

        const data = (await res.json()) as { ok: boolean } & UserWire;
        if (!data?.ok) throw new Error("Bad response from server");

        if (!cancelled) setUser(data);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [uid]);

  const briefInfo = useMemo(() => {
    if (!user) return "";
    return `${user.college || "-"} • ${user.major?.[0] ?? "-"}`;
  }, [user]);

  const editLink = `/profile/edit?uid=${encodeURIComponent(uid)}`;


  if (loading) {
    return (
      <div className={styles.Page}>
        <div className={styles.Container}>
          <div className={styles.SkeletonCard} />
          <div className={styles.SkeletonCard} />
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error || !user) {
    return (
      <div className={styles.Page}>
        <div className={styles.ContainerOne}>
          <div className={styles.ErrorBox}>
            <div className={styles.ErrorTitle}>Could not load profile</div>
            <div className={styles.ErrorText}>{error ?? "No user loaded"}</div>
            <div className={styles.ErrorHint}>
              Make sure you created a user document in Firestore under <code>users/{uid}</code>.
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className={styles.Page}>
      <div className={styles.Container}>

        {/* Left */}
        <section className={styles.LeftCard}>
          <div className={styles.AvatarWrap}>
            <div className={styles.AvatarPlaceholder}>Profile image</div>
          </div>

          <div className={styles.Username}>{user.username || "-"}</div>
          <div className={styles.BriefInfo}>{briefInfo}</div>

          <div className={styles.QuickRow}>
            <div className={styles.QuickItem}>
              <div className={styles.QuickLabel}>Admission</div>
              <div className={styles.QuickValue}>{user.admission || "-"}</div>
            </div>
            <div className={styles.QuickItem}>
              <div className={styles.QuickLabel}>Graduation</div>
              <div className={styles.QuickValue}>{user.graduation || "-"}</div>
            </div>
          </div>
        </section>

        {/* Right */}
        <section className={styles.RightCard}>
          <div className={styles.HeaderRow}>
            <div>
              <div className={styles.Title}>Profile Details</div>
              <div className={styles.Subtitle}>
                Loaded from <code>/api/user/get</code>.
              </div>
            </div>
            <button className={styles.EditButton} onClick={() => router.push(editLink)}>
              Edit
            </button>
          </div>

          <div className={styles.List}>
            <div className={styles.Item}>
              <div className={styles.Key}>PID</div>
              <div className={styles.Value}>{user.pid || "-"}</div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>Major</div>
              <div className={styles.Value}>{joinOrDash(user.major)}</div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>Minor</div>
              <div className={styles.Value}>{joinOrDash(user.minor)}</div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>College</div>
              <div className={styles.Value}>{user.college || "-"}</div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>Year Level</div>
              <div className={styles.Value}>{user.enrollment || "-"}</div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>Admission Term</div>
              <div className={styles.Value}>{user.admission || "-"}</div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>Graduation Term</div>
              <div className={styles.Value}>{user.graduation || "-"}</div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>UID</div>
              <div className={styles.Value}><code>{user.uid}</code></div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

