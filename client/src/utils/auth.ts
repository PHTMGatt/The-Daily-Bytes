import type { UserData } from '../interfaces/UserData';

const TOKEN_KEY = 'daily_bytes_session';
const COOKIE_KEY = 'daily_bytes_access';
type StorageName = 'localStorage' | 'sessionStorage';

function readStorage(storage: StorageName): string {
  try { return window[storage].getItem(TOKEN_KEY) || ''; } catch { return ''; }
}
function writeStorage(storage: StorageName, value: string): void {
  try {
    if (value) window[storage].setItem(TOKEN_KEY, value);
    else window[storage].removeItem(TOKEN_KEY);
  } catch { /* Access to the storage property itself can be blocked. */ }
}

// This is a reader-demo identity, never server authentication or authorization.
class AuthService {
  private volatileToken = '';

  getProfile(): UserData {
    const token = this.getToken();
    const value = token.startsWith('daily-bytes:') ? token.split(':')[1] : token;
    let username = 'reader';
    try { username = decodeURIComponent(value || 'reader'); } catch { /* Ignore malformed local state. */ }
    return { id: null, username, email: null };
  }

  loggedIn() { return Boolean(this.getToken()); }
  isTokenExpired(_token: string) { return false; }

  getToken(): string {
    const stored = this.volatileToken || readStorage('localStorage') || readStorage('sessionStorage');
    if (stored) return stored;
    try {
      const cookie = document.cookie.split('; ').find(entry => entry.startsWith(`${COOKIE_KEY}=`));
      return cookie ? decodeURIComponent(cookie.split('=')[1] || '') : '';
    } catch { return ''; }
  }

  private redirectHome() {
    window.dispatchEvent(new Event('daily-bytes-auth'));
    if (import.meta.env.VITE_REVIEW_HASH_ROUTER === 'true') window.location.hash = '/';
    else window.location.href = '/';
  }

  login(identity: string) {
    this.volatileToken = identity || 'reader';
    writeStorage('localStorage', this.volatileToken);
    writeStorage('sessionStorage', this.volatileToken);
    try { document.cookie = `${COOKIE_KEY}=${encodeURIComponent(this.volatileToken)}; path=/; max-age=604800; SameSite=Lax`; } catch { /* Memory-only preview session. */ }
    this.redirectHome();
  }

  loginDemo() { this.login('demo'); }

  logout() {
    this.volatileToken = '';
    writeStorage('localStorage', '');
    writeStorage('sessionStorage', '');
    try { document.cookie = `${COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`; } catch { /* Cookies can be blocked. */ }
    this.redirectHome();
  }
}

export default new AuthService();
