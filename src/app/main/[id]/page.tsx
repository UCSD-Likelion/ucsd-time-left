"use client";

import QuarterAndSchoolYearBars from "@/Components/QuarterAndYearBar";
import CollegeProgressBar from "@/Components/ProgressBar";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { UserInfo } from "@/types/userInfo";

export default function Main() {
  const params = useParams();
  const rawId = params?.id;
  const uid = Array.isArray(rawId) ? rawId[0] : rawId;

  const [info, setInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    
    const safeUid = uid;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setInfo(null);

      try {
        const res = await fetch(`/api/user/get?uid=${encodeURIComponent(safeUid)}`);

        if (!res.ok) throw new Error(await res.text());

        const data = (await res.json()) as UserInfo;
        if (!cancelled) setInfo(data);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load user info");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    
    return () => {
      cancelled = true;
    };
  }, [uid]);

  if (!uid) return <main style={styles.center}>Missing id</main>;
  if (loading) return <main style={styles.center}>Loading...</main>;
  if (error)
    return <main style={{ ...styles.center, color: "crimson" }}>{error}</main>;
  if (!info) return <main style={styles.center}>User not found</main>;

  const username = info.username.trim();
  const enrollment = info.enrollment.trim();
  const college = info.college.trim();
  const admission = info.admission.trim();     
  const graduation = info.graduation.trim();   

  const majorText = info.major.map(String).map((s) => s.trim()).filter(Boolean).join(", ");

  const minorArr = info.minor.map(String).map((s) => s.trim()).filter(Boolean);
  const minorText = minorArr.join(", ");

  return (
    <main style={styles.page}>
      <div style={styles.topBar} />

      <section style={styles.profileCard}>
        <div style={styles.photoBox} />

        <div style={styles.profileText}>
          <h1 style={styles.name}>{username}</h1>

          <div style={styles.tagRow}>
            <span style={styles.tag}>{enrollment}</span>
            <span style={{ ...styles.tag, ...styles.majorTag }}>{majorText}</span>
            {minorArr.length > 0 && (
              <span style={styles.tag}>Minor: {minorText}</span>
            )}
          </div>

          <div style={styles.tagRow}>
            <span style={styles.tag}>{college}</span>
          </div>
        </div>
      </section>

      <section style={styles.largeBox}>
        <CollegeProgressBar admission={admission} graduation={graduation} />
        <QuarterAndSchoolYearBars />
      </section>

      <section style={styles.largeBox} />
      <section style={styles.bottomPill} />
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    width: "100%",
    height: "3815px",
    margin: "0 auto",
    background: "linear-gradient(135deg, #286096 0%, #152748 100%)",
    padding: "0 0 40px 0",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  topBar: {
    width: "100%",
    height: "111px",
    background: "#FFFFFF33", 
    marginBottom: "40px",
  },
  profileCard: {
    width: "1239px", 
    margin: "0 auto 28px auto",
    background: "#f2f2f2",
    borderRadius: "73px",
    padding: "72px",
    display: "flex",
    gap: "48px",
    alignItems: "center",
  },
  photoBox: {
    width: "469px",
    height: "469px",
    borderRadius: "57px",
    background: "#D9D9D9",
    flexShrink: 0,
  },
  name: {
    margin: 0,
    fontSize: "64px",
    fontWeight: 700,
    color: "#111",
  },
  profileText: {
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  transform: "translateY(-100px)",
  flex: 1,
  minWidth: 0,
},

tagRow: {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  marginTop: "12px",
  maxWidth: "100%",
},

tag: {
  display: "inline-block",
  background: "#d2b36a",
  color: "#fff",
  fontSize: "20px",
  fontWeight: 700,
  padding: "14px 18px",
  borderRadius: "999px",
  lineHeight: 1.2,
  whiteSpace: "nowrap",
},

majorTag: {
  whiteSpace: "normal",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  maxWidth: "100%",
},
  largeBox: {
    width: "1239px",
    maxWidth: "1239px",
    height: "1321px",
    margin: "0 auto 20px auto",
    background: "#fcfcfc",
    borderRadius: "73px",
    padding: "20px",
    boxSizing: "border-box",
  },
  
};