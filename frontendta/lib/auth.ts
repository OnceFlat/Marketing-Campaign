import { User } from "@/lib/api";

export type AuthSession = {
  user: User;
  roles: string[];
};

const STORAGE_KEY = "campaign_auth_session";
const COOKIE_MAX_AGE = 60 * 60 * 24;

export function saveSession(session: AuthSession) {
  const value = JSON.stringify(session);

  safeSetStorage(window.localStorage, value);
  safeSetStorage(window.sessionStorage, value);
  document.cookie = `${STORAGE_KEY}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function getSession(): AuthSession | null {
  const raw = readStoredSession();
  if (!raw) {
    clearSession();
    return null;
  }

  try {
    const session = JSON.parse(raw) as Partial<AuthSession>;

    if (!session.user || !Array.isArray(session.roles)) {
      clearSession();
      return null;
    }

    return session as AuthSession;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked in private modes; the cookie fallback is cleared below.
  }

  document.cookie = `${STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

function readStoredSession() {
  return safeGetStorage(window.localStorage)
    ?? safeGetStorage(window.sessionStorage)
    ?? readSessionCookie();
}

function safeSetStorage(storage: Storage, value: string) {
  try {
    storage.setItem(STORAGE_KEY, value);
  } catch {
    // Cookie fallback keeps login usable when browser storage is unavailable.
  }
}

function safeGetStorage(storage: Storage) {
  try {
    return storage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function readSessionCookie() {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${STORAGE_KEY}=`));

  if (!cookie) return null;

  return decodeURIComponent(cookie.slice(STORAGE_KEY.length + 1));
}
