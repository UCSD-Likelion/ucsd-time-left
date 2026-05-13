'use client';
import { useState, useEffect, type FormEvent } from "react";
import "@material/web/textfield/outlined-text-field";
import "@material/web/button/filled-button.js";
import "@material/web/select/outlined-select";
import "@material/web/select/select-option";
import type { MdOutlinedTextField } from "@material/web/textfield/outlined-text-field";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Components/AuthProvider";
import { clearOnboardingDraft, loadOnboardingDraft, saveOnboardingDraft } from "@/app/onboarding/onboardingStorage";
import {MdOutlinedSelect} from "@material/web/select/outlined-select";

export default function EnrollmentInformation() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [draft] = useState(() => loadOnboardingDraft());
    const [currentEnrollment, setCurrentEnrollment] = useState(draft.currentEnrollment);
    const [currentYear, setCurrentYear] = useState(draft.currentYear);
    const [admissionDate, setAdmissionDate] = useState(draft.admissionDate);
    const [expectedGraduationDate, setExpectedGraduationDate] = useState(draft.expectedGraduationDate);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login?redirect=/onboarding/3");
        }
    }, [loading, router, user]);

    const toMillis = (value: string): number | null => {
        if (!value) return null;
        const date = new Date(value);
        const ms = date.getTime();
        return Number.isFinite(ms) ? ms : null;
    };

    const normalizeStatus = (value: string): "Freshman" | "Continuing" | "Transfer" | null => {
        const trimmed = value.trim().toLowerCase();
        if (trimmed === "freshman") return "Freshman";
        if (trimmed === "continuing") return "Continuing";
        if (trimmed === "transfer") return "Transfer";
        return null;
    };

    const normalizeYearLevel = (value: string): 2 | 3 | 4 | null => {
        const num = Number.parseInt(value, 10);
        return num === 2 || num === 3 || num === 4 ? num : null;
    };
    
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user?.uid || busy) return;

        setError(null);
        setBusy(true);

        try {
            const draft = saveOnboardingDraft({
                currentEnrollment,
                currentYear,
                admissionDate,
                expectedGraduationDate,
            });

            const fullName = [draft.firstName, draft.middleName, draft.lastName]
                .filter(Boolean)
                .join(" ")
                .trim();

            const majors = [draft.major, draft.isDoubleMajor ? draft.secondMajor : ""]
                .filter((value) => value.trim());
            const minors = [draft.minor, draft.isDoubleMinor ? draft.secondMinor : ""]
                .filter((value) => value.trim());

            const res = await fetch("/api/user/upsert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profile: {
                        uid: user.uid,
                        username: fullName || user.displayName || "",
                        pid: draft.studentId || null,
                        major: majors,
                        minor: minors,
                        college: draft.college || null,
                        status: normalizeStatus(draft.currentEnrollment),
                        yearLevel: normalizeYearLevel(draft.currentYear),
                    },
                    birthdayMillis: toMillis(draft.dateOfBirth),
                    enrollmentMillis: toMillis(draft.admissionDate),
                    graduationMillis: toMillis(draft.expectedGraduationDate),
                }),
            });

            if (!res.ok) throw new Error(await res.text());

            clearOnboardingDraft();
            router.replace("/dashboard");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to save onboarding";
            setError(message);
        } finally {
            setBusy(false);
        }
    };
    
    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-2">Enrollment Information</h1>
            <p className="text-gray-600 mb-6">Please provide your enrollment information.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <md-outlined-select required
                                  className="w-full"
                                  onChange={(e) =>
                                      setCurrentEnrollment((e.currentTarget as MdOutlinedSelect).value)
                                  } label="Enrollment Status">
                    <md-select-option value="continuing">
                        <div slot="headline">Continuing</div>
                    </md-select-option>
                    <md-select-option value="freshman">
                        <div slot="headline">Freshman</div>
                    </md-select-option>
                    <md-select-option value="transfer">
                        <div slot="headline">Transfer</div>
                    </md-select-option>
                </md-outlined-select>
                
                <md-outlined-text-field label="Current Year"
                                        type="text"
                                        required className="w-full"
                                        value={currentYear}
                                        onChange={(e) =>
                                            setCurrentYear((e.currentTarget as MdOutlinedTextField).value)
                                        }
                                        placeholder="20XX"
                />
                <md-outlined-text-field label="Admission Date"
                                        type="date"
                                        required className="w-full"
                                        value={admissionDate}
                                        onChange={(e) =>
                                            setAdmissionDate((e.currentTarget as MdOutlinedTextField).value)
                                        }
                />
                
                <md-outlined-select required
                                    className="w-full"
                                    onChange={(e) => console.log((e.currentTarget as any).value)}
                                    label="Admission Term">
                    <md-select-option value="fall">
                        <div slot="headline">Fall</div>
                    </md-select-option>
                    <md-select-option value="winter">
                        <div slot="headline">Winter</div>
                    </md-select-option>
                    <md-select-option value="spring">
                        <div slot="headline">Spring</div>
                    </md-select-option>
                    <md-select-option value="summer">
                        <div slot="headline">Summer</div>
                    </md-select-option>
                </md-outlined-select>
                <md-outlined-text-field label="Admission Year"
                                        type="text"
                                        required className="w-full"
                                        value={currentYear}
                                        onChange={(e) => console.log((e.currentTarget as any).value)
                                        }
                                        placeholder="20XX"
                />
                <md-outlined-text-field label="Expected Graduation Date"
                                        type="date"
                                        required className="w-full"
                                        value={expectedGraduationDate}
                                        onChange={(e) =>
                                            setExpectedGraduationDate((e.currentTarget as MdOutlinedTextField).value)
                                        }
                />
                
                <md-outlined-select required
                                    className="w-full"
                                    onChange={(e) => console.log((e.currentTarget as any).value)}
                                    label="Graduation Term">
                    <md-select-option value="fall">
                        <div slot="headline">Fall</div>
                    </md-select-option>
                    <md-select-option value="winter">
                        <div slot="headline">Winter</div>
                    </md-select-option>
                    <md-select-option value="spring">
                        <div slot="headline">Spring</div>
                    </md-select-option>
                    <md-select-option value="summer">
                        <div slot="headline">Summer</div>
                    </md-select-option>
                </md-outlined-select>
                <md-outlined-text-field label="Graduation Year"
                                        type="text"
                                        required className="w-full"
                                        value={currentYear}
                                        onChange={(e) => console.log((e.currentTarget as any).value)
                                        }
                                        placeholder="20XX"
                />
                
                <div className="flex gap-3">
						<md-filled-button
							type="button"
							style={{ width: "100%" }}
							onClick={() => router.push("/onboarding/2")}
						>
							Back
						</md-filled-button>
						<md-filled-button type="submit" style={{ width: "100%" }} disabled={busy}>
                            {busy ? "Saving..." : "Complete"}
                        </md-filled-button>
					</div>
                {error ? <p className="text-red-600">{error}</p> : null}
            </form>
        </div>
    );
}
