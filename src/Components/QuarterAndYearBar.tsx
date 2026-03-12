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

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(a: Date, b: Date) {
  const ms = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / ms);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function findCurrentTermKey(today: Date): string | null {
  for (const [key, t] of Object.entries(UCSD_TERM_DATES)) {
    const s = toDate(t.start);
    const e = toDate(t.end);
    if (today >= s && today <= e) return key;
  }
  return null;
}

function parseKey(key: string): { season: "FA" | "WI" | "SP"; yy: number } | null {
  const m = key.trim().toUpperCase().match(/^(FA|WI|SP)\s(\d{2})$/);
  if (!m) return null;
  return { season: m[1] as "FA" | "WI" | "SP", yy: Number(m[2]) };
}

function springKeyForAcademicYear(currentTermKey: string): string | null {
  const parsed = parseKey(currentTermKey);
  if (!parsed) return null;
  const springYY = parsed.season === "FA" ? parsed.yy + 1 : parsed.yy;
  return `SP ${String(springYY).padStart(2, "0")}`;
}

function schoolYearLabelFromTermKey(termKey: string): string | null {
  const parsed = parseKey(termKey);
  if (!parsed) return null;

  const startYear = parsed.season === "FA" ? 2000 + parsed.yy : 2000 + (parsed.yy - 1);
  const endYear = startYear + 1;

  return `${startYear}\u2013${endYear}`;
}

function SmallBar(props: { label: string; valueText: string; pct: number }) {
  const pctClamped = clamp(props.pct, 0, 1);
  return (
    <div style={styles.card}>
      <div style={styles.row}>
        <span style={styles.label}>{props.label}</span>
        <span style={styles.value}>{props.valueText}</span>
      </div>
      <div style={styles.track}>
        <div style={{ ...styles.fill, width: `${pctClamped * 100}%` }} />
      </div>
    </div>
  );
}

export default function QuarterAndSchoolYearBars() {
  const today = new Date();
  const termKey = findCurrentTermKey(today);

  let quarterLabel = "Current Quarter";
  let quarterValue = "—";
  let quarterPct = 0;

  if (termKey) {
    quarterLabel = `Current Quarter (${termKey})`;
    const t = UCSD_TERM_DATES[termKey];
    const start = toDate(t.start);
    const end = toDate(t.end);

    const total = Math.max(1, daysBetween(start, end));
    const left = clamp(daysBetween(today, end), 0, total);
    const elapsed = total - left;

    quarterValue = `${left} days`;
    quarterPct = elapsed / total;
  }

  let yearLabel = "Current Year";
  let yearValue = "—";
  let yearPct = 0;

  if (termKey) {
    const sy = schoolYearLabelFromTermKey(termKey);
    if (sy) yearLabel = `Current Year (${sy})`;

    const spKey = springKeyForAcademicYear(termKey);
    if (spKey && UCSD_TERM_DATES[spKey]) {
      const fallStartKey = `FA ${String(Number(spKey.split(" ")[1]) - 1).padStart(2, "0")}`;
      const start = UCSD_TERM_DATES[fallStartKey]
        ? toDate(UCSD_TERM_DATES[fallStartKey].start)
        : toDate(UCSD_TERM_DATES[termKey].start);

      const end = toDate(UCSD_TERM_DATES[spKey].end);

      const total = Math.max(1, daysBetween(start, end));
      const left = clamp(daysBetween(today, end), 0, total);
      const elapsed = total - left;

      yearValue = `${left} days`;
      yearPct = elapsed / total;
    }
  }

  return (
    <div style={styles.wrapper}>
      <SmallBar label={quarterLabel} valueText={quarterValue} pct={quarterPct} />
      <SmallBar label={yearLabel} valueText={yearValue} pct={yearPct} />
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  wrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "12px",
  },
  card: {
    background: "rgba(0,0,0,0.03)",
    borderRadius: "18px",
    padding: "12px",
  },
  row: { display: "flex", justifyContent: "space-between", gap: "10px" },
  label: { fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.7)" },
  value: { fontSize: "12px", fontWeight: 800, color: "rgba(0,0,0,0.9)" },
  track: {
    marginTop: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: "999px", background: "#9ED7C2" },
};