export type OnboardingDraft = {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  studentId: string;
  college: string;
  major: string;
  minor: string;
  isDoubleMajor: boolean;
  secondMajor: string;
  isDoubleMinor: boolean;
  secondMinor: string;
  currentEnrollment: string;
  currentYear: string;
  admissionDate: string;
  expectedGraduationDate: string;
};

const STORAGE_KEY = "onboardingDraft";

const emptyDraft: OnboardingDraft = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  studentId: "",
  college: "",
  major: "",
  minor: "",
  isDoubleMajor: false,
  secondMajor: "",
  isDoubleMinor: false,
  secondMinor: "",
  currentEnrollment: "",
  currentYear: "",
  admissionDate: "",
  expectedGraduationDate: "",
};

function safeRead(): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    return { ...emptyDraft, ...parsed };
  } catch {
    return null;
  }
}

export function loadOnboardingDraft(): OnboardingDraft {
  return safeRead() ?? { ...emptyDraft };
}

export function saveOnboardingDraft(patch: Partial<OnboardingDraft>): OnboardingDraft {
  const current = safeRead() ?? { ...emptyDraft };
  const next = { ...current, ...patch };
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function clearOnboardingDraft(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

