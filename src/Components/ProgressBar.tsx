"use client";

import React from "react";

type TermDates = { start: string; end: string };

const UCSD_TERM_DATES: Record<string, TermDates> = {
  "FA 24": { start: "2024-09-23", end: "2024-12-14" },
  "WI 25": { start: "2025-01-02", end: "2025-03-22" },
  "SP 25": { start: "2025-03-31", end: "2025-06-13" },
  "FA 25": { start: "2025-09-22", end: "2025-12-13" },
  "WI 26": { start: "2026-01-02", end: "2026-03-21" },
  "SP 26": { start: "2026-03-25", end: "2026-06-12" },
  "FA 26": { start: "2026-09-21", end: "2026-12-12" },
  "WI 27": { start: "2027-01-04", end: "2027-03-20" },
  "SP 27": { start: "2027-03-24", end: "2027-06-11" },
  "FA 27": { start: "2027-09-20", end: "2027-12-11" },
  "WI 28": { start: "2028-01-05", end: "2028-03-25" },
  "SP 28": { start: "2028-03-29", end: "2028-06-16" },
  "FA 28": { start: "2028-09-25", end: "2028-12-16" },
  "WI 29": { start: "2029-01-03", end: "2029-03-24" },
  "SP 29": { start: "2029-03-28", end: "2029-06-15" },
  "FA 29": { start: "2029-09-24", end: "2029-12-15" },
  "WI 30": { start: "2030-01-02", end: "2030-03-23" },
  "SP 30": { start: "2030-03-27", end: "2030-06-14" },
};

function toDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(a: Date, b: Date) {
  const ms = 24 * 60 * 60 * 1000;
  const ta = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const tb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((tb - ta) / ms);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export default function CollegeProgressBar(props: {
  admission: string;   
  graduation: string;  
}) {
  const admissionKey = props.admission.trim();
  const graduationKey = props.graduation.trim();

  const a = UCSD_TERM_DATES[admissionKey];
  const g = UCSD_TERM_DATES[graduationKey];

  if (!a || !g) {
    return (
      <section style={styles.card}>
        <div style={styles.header}>
          <span style={styles.title}>College Progress</span>
          <span style={styles.pct}>—</span>
        </div>
        <p style={styles.sub}>
          Missing UCSD calendar dates for:{" "}
          <b>{!a ? admissionKey : graduationKey}</b>
        </p>
      </section>
    );
  }

  const start = toDate(a.start);
  const end = toDate(g.end);
  const today = new Date();

  const total = Math.max(1, daysBetween(start, end));
  const elapsed = clamp(daysBetween(start, today), 0, total);
  const left = total - elapsed;
  const progress = elapsed / total;

  return (
    <section style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}></span>
        <span style={styles.pct}>{(progress * 100).toFixed(2)}%</span>
      </div>

      <div style={styles.track}>
        <div style={{ ...styles.fill, width: `${progress * 100}%` }} />
      </div>

      <div style={styles.stats}>
        <div>
          <div style={styles.statLabel}>Total days</div>
          <div style={styles.statValue}>{total}</div>
        </div>
        <div>
          <div style={styles.statLabel}>Days elapsed</div>
          <div style={styles.statValue}>{elapsed}</div>
        </div>
        <div>
          <div style={styles.statLabel}>Days left</div>
          <div style={styles.statValue}>{left}</div>
        </div>
      </div>

      <div style={styles.rowBottom}>
      </div>
    </section>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  card: {
    width: "100%",
    maxWidth: "100%",
    margin: 0,
    background: "#fcfcfc",
    borderRadius: "26px",
    padding: "20px",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: "18px", fontWeight: 800 },
  pct: { fontSize: "14px", fontWeight: 800 },
  track: {
    marginTop: "12px",
    height: "14px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: "999px", background: "#9ED7C2" },
  stats: {
    marginTop: "14px",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  statLabel: { fontSize: "12px", opacity: 0.7, fontWeight: 600 },
  statValue: { fontSize: "18px", fontWeight: 800, marginTop: "4px" },
  rowBottom: { marginTop: "14px", display: "flex", gap: "8px", flexWrap: "wrap" },
  badge: {
    display: "inline-block",
    background: "#d2b36a",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 700,
    padding: "6px 10px",
    borderRadius: "999px",
  },
  sub: { marginTop: "10px", fontSize: "13px", opacity: 0.75 },
};