import type {
  ClaimVerdict,
  DomainPreset,
  StrictnessPreset,
  VerificationSession,
} from "@/lib/types/proofstack";

const LAST_SESSION_KEY = "proofstack:last-session";
const PREFS_KEY = "proofstack:prefs";

export interface SessionPrefs {
  domain: DomainPreset;
  strictness: StrictnessPreset;
}

const DEFAULT_PREFS: SessionPrefs = {
  domain: "Cyber/Security",
  strictness: "Balanced",
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isValidVerdict(value: unknown): value is ClaimVerdict["verdict"] {
  return value === "supported" || value === "weak" || value === "unsupported" || value === "pending";
}

function isValidSession(value: unknown): value is VerificationSession {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<VerificationSession>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.createdAt !== "string" ||
    typeof candidate.question !== "string" ||
    typeof candidate.draftAnswer !== "string" ||
    typeof candidate.verifiedAnswer !== "string" ||
    !Array.isArray(candidate.claims) ||
    !Array.isArray(candidate.claimVerdicts) ||
    !Array.isArray(candidate.evidenceSnippets) ||
    typeof candidate.trustReport !== "object" ||
    candidate.trustReport === null
  ) {
    return false;
  }

  return candidate.claimVerdicts.every((verdict) => isValidVerdict(verdict?.verdict));
}

function parseJSON<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setLastSession(session: VerificationSession): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(session));
}

export function getLastSession(): VerificationSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(LAST_SESSION_KEY);
  if (!raw) {
    return null;
  }

  const parsed = parseJSON<unknown>(raw);
  if (!parsed || !isValidSession(parsed)) {
    return null;
  }

  return parsed;
}

export function clearLastSession(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(LAST_SESSION_KEY);
}

export function getPrefs(): SessionPrefs {
  if (!canUseStorage()) {
    return DEFAULT_PREFS;
  }

  const raw = window.localStorage.getItem(PREFS_KEY);
  if (!raw) {
    return DEFAULT_PREFS;
  }

  const parsed = parseJSON<Partial<SessionPrefs>>(raw);
  if (!parsed) {
    return DEFAULT_PREFS;
  }

  return {
    domain: parsed.domain === "Cyber/Security" ? parsed.domain : DEFAULT_PREFS.domain,
    strictness:
      parsed.strictness === "Fast" || parsed.strictness === "Balanced" || parsed.strictness === "Strict"
        ? parsed.strictness
        : DEFAULT_PREFS.strictness,
  };
}

export function setPrefs(next: Partial<SessionPrefs>): SessionPrefs {
  const merged: SessionPrefs = {
    ...getPrefs(),
    ...next,
  };

  if (canUseStorage()) {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
  }

  return merged;
}
