"use client";

import styles from "./capsule.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/Functions/firebase/clientApp";

// ── Types ────────────────────────────────────────────────────────────────────

type ListItemResponse = {
  id: string;
  senderId: string;
  subject?: string | null;
  content?: string | null;
  createdAtMillis?: number | null;
  releaseAtMillis?: number | null;
  openedAtMillis?: number | null;
  locked?: boolean;
};

type ListResponse = {
  ok?: boolean;
  capsules?: ListItemResponse[];
};

type GetSuccessResponse = {
  ok: true;
  id: string;
  content: string;
  senderId: string;
  subject: string | null;
  createdAtMillis: number | null;
  releaseAtMillis: number | null;
  openedAtMillis: number | null;
};

type GetLockedResponse = {
  ok: false;
  locked: true;
  id: string;
  releaseAtMillis: number | null;
};

type CapsuleViewModel = {
  id: string;
  senderId: string;
  subject: string;
  content: string | null; // null = not yet fetched
  createdLabel: string;
  releaseLabel: string;
  openedLabel: string;
  locked: boolean;
  everOpened: boolean;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatMillis(ms: number | null | undefined): string {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return "—";
  return new Date(ms).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function toViewModel(item: ListItemResponse): CapsuleViewModel {
  return {
    id: item.id,
    senderId: item.senderId,
    subject: item.subject?.trim() || "Untitled letter",
    content: null,
    createdLabel: formatMillis(item.createdAtMillis),
    releaseLabel: formatMillis(item.releaseAtMillis),
    openedLabel: formatMillis(item.openedAtMillis),
    locked: Boolean(item.locked),
    everOpened: typeof item.openedAtMillis === "number" && Number.isFinite(item.openedAtMillis),
  };
}

async function parseJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  try { return text ? (JSON.parse(text) as T) : null; }
  catch { return null; }
}

// ── Capsule egg card ──────────────────────────────────────────────────────────
//
// Shape: border-radius 50% 50% 50% 50% / 60% 60% 40% 40%
// This creates a classic egg — wider at the bottom, tapered at top.
// Each card is fixed 130×170px so the grid tiles consistently.
//
// Placeholder art is an inline SVG that will be swapped for real images later.
// To swap: replace <EggPlaceholderArt> with <img src={capsule.imageUrl} ... />

function EggPlaceholderArt({ locked, everOpened }: { locked: boolean; everOpened: boolean }) {
  if (locked) {
    return (
      // Sealed: warm amber glow + lock icon
      <svg width="100%" height="100%" viewBox="0 0 130 170" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="sealedGrad" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
        </defs>
        <rect width="130" height="170" fill="url(#sealedGrad)" />
        {/* subtle crack lines */}
        <line x1="65" y1="30" x2="60" y2="55" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="65" y1="30" x2="72" y2="60" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.4" />
        {/* lock body */}
        <rect x="49" y="88" width="32" height="26" rx="5" fill="#92400e" fillOpacity="0.85" />
        {/* lock shackle */}
        <path d="M56 88 V78 Q65 68 74 78 V88" fill="none" stroke="#92400e" strokeWidth="5" strokeOpacity="0.85" strokeLinecap="round" />
        {/* keyhole */}
        <circle cx="65" cy="100" r="5" fill="#fde68a" fillOpacity="0.9" />
        <rect x="63" y="100" width="4" height="7" rx="1" fill="#fde68a" fillOpacity="0.9" />
      </svg>
    );
  }

  if (!everOpened) {
    return (
      // Unread: cool blue, envelope motif
      <svg width="100%" height="100%" viewBox="0 0 130 170" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="unreadGrad" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#3b82f6" />
          </radialGradient>
        </defs>
        <rect width="130" height="170" fill="url(#unreadGrad)" />
        {/* envelope */}
        <rect x="30" y="72" width="70" height="50" rx="5" fill="white" fillOpacity="0.9" />
        <polyline points="30,72 65,100 100,72" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
        {/* seal dot */}
        <circle cx="65" cy="97" r="6" fill="#3b82f6" fillOpacity="0.3" />
      </svg>
    );
  }

  return (
    // Opened: soft green, open envelope
    <svg width="100%" height="100%" viewBox="0 0 130 170" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="openedGrad" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="100%" stopColor="#22c55e" />
        </radialGradient>
      </defs>
      <rect width="130" height="170" fill="url(#openedGrad)" />
      {/* envelope body */}
      <rect x="30" y="85" width="70" height="50" rx="5" fill="white" fillOpacity="0.9" />
      {/* open flap */}
      <polyline points="30,85 65,68 100,85" fill="white" fillOpacity="0.75" stroke="#16a34a" strokeWidth="1.5" />
      {/* letter sticking out */}
      <rect x="44" y="62" width="42" height="30" rx="3" fill="white" fillOpacity="0.95" />
      <line x1="50" y1="72" x2="80" y2="72" stroke="#22c55e" strokeWidth="2" strokeOpacity="0.6" />
      <line x1="50" y1="79" x2="74" y2="79" stroke="#22c55e" strokeWidth="2" strokeOpacity="0.4" />
    </svg>
  );
}

function CapsuleEgg({
  capsule,
  isActive,
  onClick,
}: {
  capsule: CapsuleViewModel;
  isActive: boolean;
  onClick: () => void;
}) {
  const eggRadius = "50% 50% 50% 50% / 60% 60% 40% 40%";

  // Badge colour
  const badge = capsule.locked
    ? { bg: "#fff7ed", color: "#92400e", border: "#f5d0a6", label: "🔒 Sealed" }
    : !capsule.everOpened
      ? { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", label: "✉️ Unread" }
      : { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0", label: "✅ Opened" };

  return (
    <button
      type="button"
      onClick={onClick}
      title={capsule.subject}
      style={{
        all: "unset",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        // Animate in
        animation: "fadeUp 220ms ease-out both",
      }}
    >
      {/* Egg shell */}
      <div style={{
        width: 130,
        height: 170,
        borderRadius: eggRadius,
        overflow: "hidden",
        position: "relative",
        boxShadow: isActive
          ? "0 0 0 3px #3b82f6, 0 8px 24px rgba(59,130,246,0.30)"
          : "0 4px 14px rgba(0,0,0,0.10)",
        transform: isActive ? "translateY(-4px) scale(1.04)" : "translateY(0) scale(1)",
        transition: "box-shadow 160ms, transform 160ms",
      }}>
        {/* Placeholder art — swap with <img> when real images are ready */}
        <EggPlaceholderArt locked={capsule.locked} everOpened={capsule.everOpened} />

        {/* Sheen overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 55%)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Label below egg */}
      <div style={{ textAlign: "center", maxWidth: 130 }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: "#111827",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          maxWidth: 120,
        }}>
          {capsule.subject}
        </div>
        <div style={{ marginTop: 4 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: "0.3px",
            padding: "2px 7px", borderRadius: 999,
            background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
          }}>
            {badge.label}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetaChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      padding: "8px 12px", borderRadius: 10,
      background: accent ? "#f0fdf4" : "#f9fafb",
      border: `1px solid ${accent ? "#bbf7d0" : "#e5e7eb"}`,
      minWidth: 130,
    }}>
      <span style={{
        fontSize: 10, fontWeight: 800, letterSpacing: "0.5px",
        color: accent ? "#166534" : "#9ca3af",
        textTransform: "uppercase", marginBottom: 2,
      }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: accent ? "#15803d" : "#374151" }}>
        {value}
      </span>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CapsuleInboxPage() {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [capsules, setCapsules] = useState<CapsuleViewModel[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CapsuleViewModel | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // ── Auth ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid ?? null);
    });
    return unsub;
  }, []);

  // ── Load capsule list ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;

    const load = async () => {
      setListLoading(true);
      setListError(null);
      try {
        const res = await fetch("/api/capsule/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderId: currentUserId }),
        });
        const parsed = await parseJson<ListResponse>(res);
        if (!res.ok) throw new Error("Failed to load capsules");
        if (!cancelled) {
          const items = Array.isArray(parsed?.capsules) ? parsed.capsules : [];
          setCapsules(items.map(toViewModel));
        }
      } catch (e: unknown) {
        if (!cancelled) setListError(e instanceof Error ? e.message : "Failed to load capsules");
      } finally {
        if (!cancelled) setListLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [currentUserId]);

  // ── Open capsule ──────────────────────────────────────────────────────────

  const openCapsule = async (capsule: CapsuleViewModel) => {
    setDetailError(null);
    setSelected(capsule);
    if (capsule.content !== null || capsule.locked) return;

    setDetailLoading(true);
    try {
      const res = await fetch("/api/capsule/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: capsule.id }),
      });
      const parsed = await parseJson<GetSuccessResponse | GetLockedResponse>(res);

      if (res.status === 403 && parsed && "locked" in parsed && parsed.locked) {
        const patch = { locked: true, releaseLabel: formatMillis(parsed.releaseAtMillis), content: "" };
        setCapsules((prev) => prev.map((c) => c.id === capsule.id ? { ...c, ...patch } : c));
        setSelected((prev) => prev?.id === capsule.id ? { ...prev, ...patch } : prev);
        return;
      }

      if (!res.ok || !parsed || !("ok" in parsed) || !parsed.ok) throw new Error("Failed to fetch capsule");

      const full = parsed as GetSuccessResponse;
      const updated: CapsuleViewModel = {
        id: full.id,
        senderId: full.senderId,
        subject: full.subject?.trim() || "Untitled letter",
        content: full.content,
        createdLabel: formatMillis(full.createdAtMillis),
        releaseLabel: formatMillis(full.releaseAtMillis),
        openedLabel: formatMillis(full.openedAtMillis),
        locked: false,
        everOpened: true,
      };

      setCapsules((prev) => prev.map((c) => c.id === updated.id ? updated : c));
      setSelected(updated);
    } catch (e: unknown) {
      setDetailError(e instanceof Error ? e.message : "Failed to load capsule");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => { setSelected(null); setDetailError(null); };

  // ── Render: egg grid ──────────────────────────────────────────────────────

  const renderGrid = () => {
    if (!currentUserId) return <p className={styles.SmallHint}>Loading user…</p>;
    if (listLoading)    return <p className={styles.SmallHint}>Loading your capsules…</p>;
    if (listError)      return <p className={styles.SmallHint} style={{ color: "#dc2626" }}>{listError}</p>;
    if (!capsules.length) return (
      <div className={styles.EmptyStateCard}>
        No capsules yet — write one to your future self.
      </div>
    );

    return (
      <>
        {/* inject keyframe once */}
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          // Right-to-left order via row-reverse; wraps into rows naturally
          flexDirection: "row-reverse",
          gap: "24px 20px",
          justifyContent: "flex-end",   // anchors eggs to the right edge
          padding: "8px 4px 4px",
        }}>
          {capsules.map((c, i) => (
            <div key={c.id} style={{ animationDelay: `${i * 40}ms` }}>
              <CapsuleEgg
                capsule={c}
                isActive={selected?.id === c.id}
                onClick={() => openCapsule(c)}
              />
            </div>
          ))}
        </div>
      </>
    );
  };

  // ── Render: detail panel ──────────────────────────────────────────────────

  const renderDetail = () => {
    if (!selected) return null;

    const renderBody = () => {
      if (selected.locked) return (
        <div style={{
          padding: "36px 28px", textAlign: "center",
          background: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)",
          borderRadius: 12, border: "1.5px dashed #f59e0b",
        }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
          <p style={{ fontWeight: 700, color: "#92400e", margin: 0, fontSize: 15 }}>
            This capsule is still sealed
          </p>
          <p style={{ color: "#b45309", margin: "8px 0 0", fontSize: 13 }}>
            Unlocks on {selected.releaseLabel}
          </p>
        </div>
      );
      if (detailLoading) return (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#6b7280", fontSize: 14 }}>
          Opening your letter…
        </div>
      );
      if (detailError) return (
        <div style={{ padding: 16, background: "#fef2f2", borderRadius: 10, color: "#dc2626", fontSize: 13 }}>
          {detailError}
        </div>
      );
      return (
        <div style={{
          whiteSpace: "pre-wrap", lineHeight: 1.9, color: "#1f2937",
          fontSize: 15, fontFamily: "'Georgia', 'Times New Roman', serif",
        }}>
          {selected.content || "(No content)"}
        </div>
      );
    };

    return (
      <div className={styles.ListCard} style={{ marginTop: 16 }}>
        {/* Letter header */}
        <div style={{
          padding: "24px 24px 20px",
          borderBottom: "1px solid #f3f4f6",
          background: "linear-gradient(to bottom, #f8faff, #ffffff)",
        }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 900, color: "#111827", lineHeight: 1.25 }}>
            {selected.locked ? "Sealed Capsule" : selected.subject}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <MetaChip label="Written" value={selected.createdLabel} />
            <MetaChip label="Unlocks" value={selected.releaseLabel} />
            {!selected.locked && selected.openedLabel !== "—" && (
              <MetaChip label="Opened" value={selected.openedLabel} accent />
            )}
          </div>
        </div>

        {/* Letter body */}
        <div style={{ padding: "24px 24px 20px" }}>
          {!selected.locked && (
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "0.8px",
              color: "#9ca3af", marginBottom: 14, textTransform: "uppercase",
            }}>
              Message
            </div>
          )}
          {renderBody()}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 24px", borderTop: "1px solid #f3f4f6",
          display: "flex", justifyContent: "flex-end",
        }}>
          <button className={styles.GhostButton} onClick={closeDetail} type="button">
            Close
          </button>
        </div>
      </div>
    );
  };

  // ── Root ──────────────────────────────────────────────────────────────────

  return (
    <div className={styles.CapsuleLayout}>
      <div className={styles.SingleColumn}>

        <div className={styles.ListCard}>
          <div className={styles.ListHeader}>
            <div className={styles.ListHeaderTitle}>My Capsules</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={styles.GhostButton} onClick={() => router.push("/dashboard")} type="button">
                Dashboard
              </button>
              <button className={styles.SecondaryButton} onClick={() => router.push("/capsule/write")} type="button">
                + Create
              </button>
            </div>
          </div>

          <div className={styles.FormBody}>
            {renderGrid()}
          </div>
        </div>

        {renderDetail()}
      </div>
    </div>
  );
}