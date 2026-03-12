"use client";

import styles from "./profile.module.css";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type StudentType = "Freshman" | "Continuing" | "Transfer";

type UserWire = {
  id: string;
  uid: string;

  username: string;
  bio: string | null;
  profileImageUrl: string | null;

  birthdayMillis: number | null;
  pid: string;

  majors: string[];
  minors: string[];

  college: string;

  studentType: StudentType;
  yearLevel: 2 | 3 | 4 | null;

  enrollmentAtMillis: number | null;
  graduationAtMillis: number | null;

  updatedAtMillis: number | null;
};

function fmtDate(ms: number | null): string {
  if (!ms) return "";
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
}

function fmtMonth(ms: number | null): string {
  if (!ms) return "";
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit" });
}

function joinOrDash(arr: string[]): string {
  if (!arr || arr.length === 0) return "-";
  return arr.join(", ");
}

export default function ProfilePage() {
  const router = useRouter();
  const params = useSearchParams();

  // For testing without auth: /profile?uid=YOUR_UID
  const uid = params.get("uid") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserWire | null>(null);

  useEffect(() => {
    if (!uid.trim()) {
      setError('Missing uid. Try: /profile?uid=YOUR_UID');
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/user/get?uid=${encodeURIComponent(uid)}`);
        if (!res.ok) throw new Error(await res.text());

        const data = (await res.json()) as { ok: boolean; user: UserWire };
        if (!data?.ok || !data.user) throw new Error("Bad response from server");

        if (!cancelled) setUser(data.user);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const briefInfo = useMemo(() => {
    if (!user) return "";
    const major = user.majors?.[0] ?? "-";
    const college = user.college || "-";
    return `${college} • ${major}`;
  }, [user]);

  const editLink = useMemo(() => {
    // Random link placeholder, you can change later
    return `/profile/edit?uid=${encodeURIComponent(uid)}`;
  }, [uid]);

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

  const showYearLevel = user.studentType === "Continuing" || user.studentType === "Transfer";

  return (
    <div className={styles.Page}>
      <div className={styles.Container}>
        {/* Left panel */}
        <section className={styles.LeftCard}>
          <div className={styles.AvatarWrap}>
            {user.profileImageUrl ? (
              <img className={styles.AvatarImg} src={user.profileImageUrl} alt="profile" />
            ) : (
              <div className={styles.AvatarPlaceholder}>Profile Image</div>
            )}
          </div>

          <div className={styles.Username}>{user.username}</div>
          <div className={styles.Bio}>{user.bio ?? "No bio yet."}</div>

          <div className={styles.BriefInfo}>{briefInfo}</div>

          <div className={styles.QuickRow}>
            <div className={styles.QuickItem}>
              <div className={styles.QuickLabel}>Enrollment</div>
              <div className={styles.QuickValue}>{fmtMonth(user.enrollmentAtMillis) || "-"}</div>
            </div>
            <div className={styles.QuickItem}>
              <div className={styles.QuickLabel}>Graduation</div>
              <div className={styles.QuickValue}>{fmtMonth(user.graduationAtMillis) || "-"}</div>
            </div>
          </div>
        </section>

        {/* Right panel */}
        <section className={styles.RightCard}>
          <div className={styles.HeaderRow}>
            <div>
              <div className={styles.Title}>Profile Details</div>
              <div className={styles.Subtitle}>
                This page is loaded from <code>/api/user/get</code>.
              </div>
            </div>

            <button className={styles.EditButton} onClick={() => router.push(editLink)}>
              Edit
            </button>
          </div>

          <div className={styles.List}>
            <div className={styles.Item}>
              <div className={styles.Key}>생일</div>
              <div className={styles.Value}>{fmtDate(user.birthdayMillis) || "-"}</div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>PID (타이핑)</div>
              <div className={styles.Value}>{user.pid || "-"}</div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>Major (드랍다운)</div>
              <div className={styles.Value}>{joinOrDash(user.majors)}</div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>Minor</div>
              <div className={styles.Value}>{joinOrDash(user.minors)}</div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>College (드랍다운)</div>
              <div className={styles.Value}>{user.college || "-"}</div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>신입생/ 재학생 / 편입</div>
              <div className={styles.Value}>
                {user.studentType}
                {showYearLevel && (
                  <span className={styles.Muted}> • Year: {user.yearLevel ?? "-"}</span>
                )}
              </div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>UCSD입학년도 월</div>
              <div className={styles.Value}>{fmtMonth(user.enrollmentAtMillis) || "-"}</div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>UCSD졸업년도 월</div>
              <div className={styles.Value}>{fmtMonth(user.graduationAtMillis) || "-"}</div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>UID</div>
              <div className={styles.Value}>
                <code>{user.uid}</code>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}