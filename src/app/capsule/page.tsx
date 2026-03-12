"use client";

import styles from "./capsule.module.css";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type View = "my-capsules" | "get-test" | "notes";

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

type ListItemResponse = {
  id: string;
  content?: string | null;
  senderId: string;
  subject?: string | null;
  createdAtMillis?: number | null;
  releaseAtMillis?: number | null;
  openedAtMillis?: number | null;
  locked?: boolean;
};

type ListResponse = {
  ok?: boolean;
  capsules?: ListItemResponse[];
};

type CapsuleViewModel = {
  id: string;
  senderId: string;
  subject: string;
  content: string;
  createdLabel: string;
  releaseLabel: string;
  openedLabel: string;
  locked: boolean;
};

function formatMillis(ms: number | null | undefined): string {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return "—";
  return new Date(ms).toLocaleString();
}

function toViewModel(item: ListItemResponse): CapsuleViewModel {
  return {
    id: item.id,
    senderId: item.senderId,
    subject: item.subject?.trim() ? item.subject : "Untitled letter",
    content: item.content?.trim()
      ? item.content
      : item.locked
        ? "This letter is still locked. Open it after the release time."
        : "(No content)",
    createdLabel: formatMillis(item.createdAtMillis),
    releaseLabel: formatMillis(item.releaseAtMillis),
    openedLabel: formatMillis(item.openedAtMillis),
    locked: Boolean(item.locked),
  };
}

export default function CapsuleInboxPage() {
  const router = useRouter();
  const goBack = () => router.push("/dashboard");
  const compose = () => router.push("/capsule/write");

  const [view, setView] = useState<View>("my-capsules");
  const [currentUserId, setCurrentUserId] = useState("demo-sender");
  const [documentId, setDocumentId] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Enter a user id to load all capsules for that id, or test GET /api/capsule/get with a document id."
  );
  const [selectedCapsule, setSelectedCapsule] = useState<CapsuleViewModel | null>(null);
  const [loadedCapsules, setLoadedCapsules] = useState<CapsuleViewModel[]>([]);

  const cards = useMemo(() => {
    if (view === "my-capsules") return loadedCapsules;
    if (!selectedCapsule) return [];
    return [selectedCapsule];
  }, [loadedCapsules, selectedCapsule, view]);

  const loadCapsulesById = async () => {
    const trimmedSenderId = currentUserId.trim();

    if (!trimmedSenderId) {
      setStatusMessage("Please enter a user id.");
      setLoadedCapsules([]);
      setSelectedCapsule(null);
      return;
    }

    try {
      setBusy(true);
      setStatusMessage(`Loading capsules for ${trimmedSenderId}...`);
      setLoadedCapsules([]);
      setSelectedCapsule(null);

      const res = await fetch("/api/capsule/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: trimmedSenderId }),
      });

      const text = await res.text();
      let parsed: ListResponse | null = null;

      try {
        parsed = text ? (JSON.parse(text) as ListResponse) : null;
      } catch {
        parsed = null;
      }

      if (!res.ok) {
        throw new Error(text || "Failed to load capsules");
      }

      const items = Array.isArray(parsed?.capsules) ? parsed.capsules : [];
      const nextCapsules = items.map(toViewModel);
      setLoadedCapsules(nextCapsules);
      setSelectedCapsule(nextCapsules[0] ?? null);
      setStatusMessage(
        nextCapsules.length > 0
          ? `Loaded ${nextCapsules.length} capsule${nextCapsules.length === 1 ? "" : "s"} for ${trimmedSenderId}.`
          : `No capsules found for ${trimmedSenderId}.`
      );
    } catch (e: unknown) {
      setStatusMessage(e instanceof Error ? e.message : "Failed to load capsules");
      setLoadedCapsules([]);
      setSelectedCapsule(null);
    } finally {
      setBusy(false);
    }
  };

  const fetchCapsule = async () => {
    const trimmedId = documentId.trim();

    if (!trimmedId) {
      setStatusMessage("Please enter a document id.");
      setSelectedCapsule(null);
      return;
    }

    try {
      setBusy(true);
      setStatusMessage("Loading capsule...");
      setSelectedCapsule(null);

      const res = await fetch("/api/capsule/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: trimmedId }),
      });

      const text = await res.text();
      let parsed: GetSuccessResponse | GetLockedResponse | null = null;

      try {
        parsed = text ? (JSON.parse(text) as GetSuccessResponse | GetLockedResponse) : null;
      } catch {
        parsed = null;
      }

      if (res.status === 403 && parsed && "locked" in parsed && parsed.locked) {
        setSelectedCapsule({
          id: parsed.id,
          senderId: "Future self capsule",
          subject: "Letter to your future self",
          content: "This letter is still locked. Use the release date below for testing.",
          createdLabel: "Hidden while locked",
          releaseLabel: formatMillis(parsed.releaseAtMillis),
          openedLabel: "—",
          locked: true,
        });
        setStatusMessage(`Capsule is locked until ${formatMillis(parsed.releaseAtMillis)}.`);
        return;
      }

      if (!res.ok || !parsed || !("ok" in parsed) || parsed.ok !== true) {
        throw new Error(text || "Failed to get capsule");
      }

      setSelectedCapsule({
        id: parsed.id,
        senderId: parsed.senderId,
        subject: parsed.subject?.trim() ? parsed.subject : "Untitled letter",
        content: parsed.content,
        createdLabel: formatMillis(parsed.createdAtMillis),
        releaseLabel: formatMillis(parsed.releaseAtMillis),
        openedLabel: formatMillis(parsed.openedAtMillis),
        locked: false,
      });
      setStatusMessage("Capsule loaded successfully.");
    } catch (e: unknown) {
      setStatusMessage(e instanceof Error ? e.message : "Failed to get capsule");
      setSelectedCapsule(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.CapsuleLayout}>
      <div className={styles.SingleColumn}>
        <div className={styles.ListCard}>
          <div className={styles.ListHeader}>
            <div>
              <div className={styles.ListHeaderTitle}>Capsules</div>
            </div>
          </div>

          <div className={styles.FormBody}>
            <div className={styles.ActionRow}>
              <button className={styles.GhostButton} onClick={goBack} type="button">
                Back to Dashboard
              </button>
              <button className={styles.GhostButton} onClick={compose} type="button">
                Create Capsule
              </button>
            </div>

            <div className={styles.ActionRow}>
              <button className={styles.GhostButton} onClick={() => setView("my-capsules")} type="button">
                Capsules By User Id
              </button>
              <button className={styles.GhostButton} onClick={() => setView("get-test")} type="button">
                Single Capsule Test
              </button>
              <button className={styles.GhostButton} onClick={() => setView("notes")} type="button">
                Testing Notes
              </button>
            </div>

            {view === "my-capsules" ? (
              <>
                <div className={styles.Field}>
                  <label className={styles.Label} htmlFor="capsule-user-id">
                    User Id
                  </label>
                  <input
                    id="capsule-user-id"
                    className={styles.Input}
                    value={currentUserId}
                    onChange={(e) => setCurrentUserId(e.target.value)}
                    placeholder="Enter user id"
                    autoComplete="off"
                  />
                </div>

                <div className={styles.ActionRow}>
                  <button className={styles.SecondaryButton} onClick={loadCapsulesById} type="button" disabled={busy}>
                    {busy ? "Loading..." : "Load Capsules"}
                  </button>
                </div>
              </>
            ) : view === "get-test" ? (
              <>
                <div className={styles.Field}>
                  <label className={styles.Label} htmlFor="capsule-document-id">
                    Document Id
                  </label>
                  <input
                    id="capsule-document-id"
                    className={styles.Input}
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    placeholder="Paste capsule document id"
                    autoComplete="off"
                  />
                </div>

                <div className={styles.ActionRow}>
                  <button className={styles.SecondaryButton} onClick={fetchCapsule} type="button" disabled={busy}>
                    {busy ? "Loading..." : "Fetch Capsule"}
                  </button>
                  <button
                    className={styles.GhostButton}
                    onClick={() => setDocumentId(selectedCapsule?.id ?? "")}
                    type="button"
                  >
                    Use Selected Id
                  </button>
                </div>
              </>
            ) : null}

            <div className={styles.Field}>
              <div className={styles.Label}>Status</div>
              <div className={styles.SmallHint}>{statusMessage}</div>
            </div>

            {view === "notes" ? (
              <div className={styles.Field}>
                <div className={styles.Label}>Notes</div>
                <div className={styles.SmallHint}>1. Use the user id view to load capsules from POST /api/capsule/list.</div>
                <div className={styles.SmallHint}>2. Use the single capsule view to load one capsule from POST /api/capsule/get.</div>
                <div className={styles.SmallHint}>3. Click any loaded capsule button below to inspect its details.</div>
              </div>
            ) : (
              <div className={styles.Field}>
                <div className={styles.Label}>Capsule List</div>
                {cards.length === 0 ? (
                  <div className={styles.SmallHint}>No capsules loaded.</div>
                ) : (
                  cards.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={styles.GhostButton}
                      onClick={() => setSelectedCapsule(c)}
                      style={{ width: "100%", textAlign: "left", marginBottom: 8 }}
                    >
                      {c.subject} | {c.senderId} | {c.releaseLabel} | {c.locked ? "LOCKED" : "READY"}
                    </button>
                  ))
                )}
              </div>
            )}

            {selectedCapsule && (
              <div className={styles.Field}>
                <div className={styles.Label}>Selected Capsule</div>
                <div className={styles.SmallHint}>Document id: {selectedCapsule.id}</div>
                <div className={styles.SmallHint}>Owner: {selectedCapsule.senderId}</div>
                <div className={styles.SmallHint}>Subject: {selectedCapsule.subject}</div>
                <div className={styles.SmallHint}>Created at: {selectedCapsule.createdLabel}</div>
                <div className={styles.SmallHint}>Release at: {selectedCapsule.releaseLabel}</div>
                <div className={styles.SmallHint}>Opened at: {selectedCapsule.openedLabel}</div>
                <div className={styles.SmallHint}>State: {selectedCapsule.locked ? "LOCKED" : "READY"}</div>
                <div className={styles.SmallHint}>{selectedCapsule.content}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}