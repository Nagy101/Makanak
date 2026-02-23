/**
 * Obfuscated localStorage wrapper.
 *
 * Keys are mapped to short opaque names so the browser DevTools storage panel
 * does not reveal what is stored. Values are base64-encoded so raw tokens /
 * user objects are not plainly readable at a glance.
 *
 * This is obfuscation, not encryption — it stops casual inspection but is
 * not a substitute for proper server-side security. The JWT itself must be
 * validated on the server on every request.
 */

// ── Opaque key map ────────────────────────────────────────────────────────────
const KEY = {
  token: '_mk_t',
  user:  '_mk_s',
} as const;

type StorageKey = keyof typeof KEY;

// ── Codec ─────────────────────────────────────────────────────────────────────

function encode(value: string): string {
  try {
    return btoa(encodeURIComponent(value));
  } catch {
    return value;
  }
}

function decode(raw: string): string {
  try {
    return decodeURIComponent(atob(raw));
  } catch {
    // Fallback: maybe it was written by old plain-text code
    return raw;
  }
}

// ── Migration ─────────────────────────────────────────────────────────────────
// On first load, move any values stored under the old plain keys to the new
// obfuscated keys, then remove the old ones.

function migrate() {
  const oldPairs: Array<[string, StorageKey]> = [
    ['token', 'token'],
    ['user',  'user'],
  ];
  for (const [oldKey, newKey] of oldPairs) {
    const old = localStorage.getItem(oldKey);
    if (old !== null) {
      localStorage.setItem(KEY[newKey], encode(old));
      localStorage.removeItem(oldKey);
    }
  }
}

// Run once when the module is first imported
migrate();

// ── Public API ────────────────────────────────────────────────────────────────

export const storage = {
  getToken(): string | null {
    const raw = localStorage.getItem(KEY.token);
    return raw ? decode(raw) : null;
  },

  setToken(token: string): void {
    localStorage.setItem(KEY.token, encode(token));
  },

  removeToken(): void {
    localStorage.removeItem(KEY.token);
    // Also wipe legacy key just in case
    localStorage.removeItem('token');
  },

  getUser<T = unknown>(): T | null {
    const raw = localStorage.getItem(KEY.user);
    if (!raw) return null;
    try {
      return JSON.parse(decode(raw)) as T;
    } catch {
      return null;
    }
  },

  setUser(user: unknown): void {
    localStorage.setItem(KEY.user, encode(JSON.stringify(user)));
  },

  removeUser(): void {
    localStorage.removeItem(KEY.user);
    localStorage.removeItem('user');
  },

  /** Wipe all session data (call on logout). */
  clear(): void {
    this.removeToken();
    this.removeUser();
  },
};
