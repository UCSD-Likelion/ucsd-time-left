"use client";

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

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setInfo(null);

      try {
        const res = await fetch("/api/info/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid }),
        });

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
  if (error) return <main style={{ ...styles.center, color: "crimson" }}>{error}</main>;
  if (!info) return <main style={styles.center}>User not found</main>;

  return (
    <main style={styles.page}>
      <div style={styles.topBar} />

      <section style={styles.profileCard}>
        <div style={styles.photoBox} />

        <div style={styles.profileText}>
          <h1 style={styles.name}>{info.username || "No Name"}</h1>

          <div style={styles.tagRow}>
            <span style={styles.tag}>
              {info.enrollment || "Year not set"}
            </span>
            <span style={styles.tag}>
              {info.major?.length ? info.major.join(", ") : "Major not set"}
            </span>
          </div>

          <div style={styles.tagRow}>
            <span style={styles.tag}>
              {info.college || "College not set"}
            </span>
          </div>
        </div>
      </section>

      <section style={styles.largeBox} />
      <section style={styles.largeBox} />
      <section style={styles.bottomPill} />
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #234d84 0%, #17345f 100%)",
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
    height: "34px",
    background: "#6f95bf",
    opacity: 0.9,
    marginBottom: "28px",
  },
  profileCard: {
    width: "78%",
    maxWidth: "760px",
    margin: "0 auto 28px auto",
    background: "#f2f2f2",
    borderRadius: "26px",
    border: "5px solid #1ea0ff",
    padding: "18px 20px",
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
  },
  photoBox: {
    width: "135px",
    height: "135px",
    borderRadius: "18px",
    background: "#d3d3d3",
    flexShrink: 0,
  },
  profileText: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingTop: "8px",
  },
  name: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#111",
  },
  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
  },
  tag: {
    display: "inline-block",
    background: "#d2b36a",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 600,
    padding: "5px 10px",
    borderRadius: "999px",
    lineHeight: 1.2,
  },
  largeBox: {
    width: "78%",
    maxWidth: "760px",
    height: "380px",
    margin: "0 auto 20px auto",
    background: "#f2f2f2",
    borderRadius: "26px",
  },
  bottomPill: {
    width: "78%",
    maxWidth: "760px",
    height: "48px",
    margin: "22px auto 0 auto",
    background: "#f2f2f2",
    borderRadius: "999px",
  },
};