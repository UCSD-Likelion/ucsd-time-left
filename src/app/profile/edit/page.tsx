"use client";

import styles from "./../profile.module.css";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/Components/AuthProvider";

type UserWire = {
  id: string;
  uid: string;
  username: string;
  college: string;
  enrollment: string; // "Freshman" | "Sophomore" | "Junior" | "Senior"
  admission: string;  // "FA 24"
  graduation: string; // "SP 26"
  major: string[];
  minor: string[];
  pid: string;
};

function toMillis(value: string): number | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function normalizeStatus(value: string): "Freshman" | "Continuing" | "Transfer" | null {
  const t = value.trim().toLowerCase();
  if (t === "freshman")   return "Freshman";
  if (t === "continuing") return "Continuing";
  if (t === "transfer")   return "Transfer";
  return null;
}

function normalizeYearLevel(value: string): 2 | 3 | 4 | null {
  const n = Number.parseInt(value, 10);
  return n === 2 || n === 3 || n === 4 ? n : null;
}

export default function EditProfilePage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user: authUser, loading: authLoading } = useAuth();

  const uid = params.get("uid") ?? authUser?.uid ?? "";

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [colleges, setColleges] = useState<string[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [minors, setMinors] = useState<string[]>([]);

  // ── Form state ────────────────────────────────────────────────────────────
  const [firstName, setFirstName]   = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName]     = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [studentId, setStudentId]   = useState("");

  const [college, setCollege]           = useState("");
  const [major, setMajor]               = useState("");
  const [isDoubleMajor, setIsDoubleMajor] = useState(false);
  const [secondMajor, setSecondMajor]   = useState("");
  const [minor, setMinor]               = useState("");
  const [isDoubleMinor, setIsDoubleMinor] = useState(false);
  const [secondMinor, setSecondMinor]   = useState("");

  const [currentEnrollment, setCurrentEnrollment] = useState("");
  const [currentYear, setCurrentYear]             = useState("");
  const [admissionDate, setAdmissionDate]         = useState("");
  const [expectedGraduationDate, setExpectedGraduationDate] = useState("");

  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;

    async function load() {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const [profileRes, collegesRes, majorsRes] = await Promise.all([
          fetch(`/api/user/get?uid=${encodeURIComponent(uid)}`),
          fetch("/api/colleges"),
          fetch("/api/majors"),
        ]);

        if (!profileRes.ok) throw new Error(await profileRes.text());

        const profileData = (await profileRes.json()) as { ok: boolean } & UserWire;
        if (!profileData.ok) throw new Error("Bad profile response");

        const collegesData = await collegesRes.json();
        const majorsData   = await majorsRes.json();

        if (cancelled) return;

        setColleges(collegesData.colleges ?? []);
        setMajors(majorsData.majors ?? []);
        setMinors(majorsData.minors ?? []);

        // Pre-fill from profile
        const nameParts = (profileData.username ?? "").split(" ");
        setFirstName(nameParts[0] ?? "");
        setLastName(nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");
        setMiddleName(nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "");

        setStudentId(profileData.pid ?? "");
        setCollege(profileData.college ?? "");

        const [maj1, maj2] = profileData.major ?? [];
        setMajor(maj1 ?? "");
        setIsDoubleMajor(Boolean(maj2));
        setSecondMajor(maj2 ?? "");

        const [min1, min2] = profileData.minor ?? [];
        setMinor(min1 ?? "");
        setIsDoubleMinor(Boolean(min2));
        setSecondMinor(min2 ?? "");

        const lvl = profileData.enrollment ?? "";
        if (lvl === "Freshman") {
          setCurrentEnrollment("Freshman");
          setCurrentYear("");
        } else if (lvl === "Sophomore") {
          setCurrentEnrollment("Continuing");
          setCurrentYear("2");
        } else if (lvl === "Junior") {
          setCurrentEnrollment("Continuing");
          setCurrentYear("3");
        } else if (lvl === "Senior") {
          setCurrentEnrollment("Continuing");
          setCurrentYear("4");
        }

        setAdmissionDate("");
        setExpectedGraduationDate("");
      } catch (e: unknown) {
        if (!cancelled) setProfileError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [uid]);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.replace(`/login?redirect=/profile/edit?uid=${uid}`);
    }
  }, [authLoading, authUser, router, uid]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uid || busy) return;

    setError(null);
    setBusy(true);

    try {
      const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ").trim();
      const majorList = [major, isDoubleMajor ? secondMajor : ""].filter((v) => v.trim());
      const minorList = [minor, isDoubleMinor ? secondMinor : ""].filter((v) => v.trim());

      const res = await fetch("/api/user/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            uid,
            username: fullName,
            pid: studentId || null,
            major: majorList,
            minor: minorList,
            college: college || null,
            status: normalizeStatus(currentEnrollment),
            yearLevel: normalizeYearLevel(currentYear),
          },
          birthdayMillis:   toMillis(dateOfBirth),
          enrollmentMillis: toMillis(admissionDate),
          graduationMillis: toMillis(expectedGraduationDate),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      router.push(`/profile?uid=${encodeURIComponent(uid)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setBusy(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className={styles.Page}>
        <div className={styles.Container}>
          <div className={styles.SkeletonCard} />
          <div className={styles.SkeletonCard} />
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className={styles.Page}>
        <div className={styles.ContainerOne}>
          <div className={styles.ErrorBox}>
            <div className={styles.ErrorTitle}>Could not load profile to edit</div>
            <div className={styles.ErrorText}>{profileError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.Page} onSubmit={handleSubmit}>
      <div className={styles.Container}>
        {/* Left */}
        <section className={styles.LeftCard}>
          <div className={styles.AvatarWrap}>
            <div className={styles.AvatarPlaceholder}>Profile image</div>
          </div>

          <div className={styles.InputGroup}>
            <label>First Name</label>
            <input required type="text" className={styles.Input} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>

          <div className={styles.InputGroup}>
            <label>Middle Name</label>
            <input type="text" className={styles.Input} value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
          </div>

          <div className={styles.InputGroup}>
            <label>Last Name</label>
            <input required type="text" className={styles.Input} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          <div className={styles.InputGroup}>
            <label>Date of Birth</label>
            <input type="date" className={styles.Input} value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </div>
        </section>

        {/* Right */}
        <section className={styles.RightCard}>
          <div className={styles.HeaderRow}>
            <div>
              <div className={styles.Title}>Edit Profile</div>
              <div className={styles.Subtitle}>
                Changes will be saved immediately.
              </div>
            </div>
            <div className={styles.ButtonGroup}>
              <button type="button" className={styles.CancelButton} onClick={() => router.push(`/profile?uid=${encodeURIComponent(uid)}`)}>
                Cancel
              </button>
              <button type="submit" className={styles.SaveButton} disabled={busy}>
                {busy ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {error && <div className={styles.ErrorText} style={{ margin: "16px 24px" }}>{error}</div>}

          <div className={styles.List}>
            {/* Academic Info */}
            <div className={styles.Item}>
              <div className={styles.Key}>PID</div>
              <div className={styles.Value}>
                <input type="text" className={styles.Input} value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="A12345678" />
              </div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>College</div>
              <div className={styles.Value}>
                <select required className={styles.Select} value={college} onChange={(e) => setCollege(e.target.value)}>
                  <option value="" disabled>Select College</option>
                  {colleges.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>Major</div>
              <div className={styles.Value}>
                <select required className={styles.Select} value={major} onChange={(e) => setMajor(e.target.value)}>
                  <option value="" disabled>Select Major</option>
                  {majors.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <label className={styles.CheckboxLabel}>
                  <input type="checkbox" checked={isDoubleMajor} onChange={(e) => { setIsDoubleMajor(e.target.checked); if (!e.target.checked) setSecondMajor(""); }} />
                  Double Major
                </label>
                {isDoubleMajor && (
                  <select required className={styles.Select} value={secondMajor} onChange={(e) => setSecondMajor(e.target.value)}>
                    <option value="" disabled>Select Second Major</option>
                    {majors.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                )}
              </div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>Minor</div>
              <div className={styles.Value}>
                <select className={styles.Select} value={minor} onChange={(e) => setMinor(e.target.value)}>
                  <option value="">None</option>
                  {minors.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <label className={styles.CheckboxLabel}>
                  <input type="checkbox" checked={isDoubleMinor} onChange={(e) => { setIsDoubleMinor(e.target.checked); if (!e.target.checked) setSecondMinor(""); }} />
                  Double Minor
                </label>
                {isDoubleMinor && (
                  <select required className={styles.Select} value={secondMinor} onChange={(e) => setSecondMinor(e.target.value)}>
                    <option value="" disabled>Select Second Minor</option>
                    {minors.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                )}
              </div>
            </div>

            {/* Enrollment */}
            <div className={styles.Item}>
              <div className={styles.Key}>Status</div>
              <div className={styles.Value}>
                <input required type="text" className={styles.Input} value={currentEnrollment} onChange={(e) => setCurrentEnrollment(e.target.value)} placeholder="Freshman / Continuing / Transfer" />
              </div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>Current Year</div>
              <div className={styles.Value}>
                <input type="text" className={styles.Input} value={currentYear} onChange={(e) => setCurrentYear(e.target.value)} placeholder="2 / 3 / 4 (Blank if Freshman)" />
              </div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>Admission Date</div>
              <div className={styles.Value}>
                <input required type="date" className={styles.Input} value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} />
              </div>
            </div>

            <div className={styles.Item}>
              <div className={styles.Key}>Expected Grad.</div>
              <div className={styles.Value}>
                <input required type="date" className={styles.Input} value={expectedGraduationDate} onChange={(e) => setExpectedGraduationDate(e.target.value)} />
              </div>
            </div>

          </div>
        </section>
      </div>
    </form>
  );
}