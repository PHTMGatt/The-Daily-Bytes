import type { UserData } from '../interfaces/UserData';

const TOKEN_KEY = 'daily_bytes_session';
const COOKIE_KEY = 'daily_bytes_access';

const safeSet = (storage: Storage, key: string, value: string) => {
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const safeGet = (storage: Storage, key: string) => {
  try {
    return storage.getItem(key) || '';
  } catch {
    return '';
  }
};

const safeRemove = (storage: Storage, key: string) => {
  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage cleanup failures in restrictive browser modes.
  }
};

class AuthService {
  getProfile(): UserData {
    const token = this.getToken();
    const username = token.startsWith('daily-bytes:')
      ? decodeURIComponent(token.split(':')[1] || 'reader')
      : decodeURIComponent(token || 'reader');

    return {
      id: null,
      username,
      email: null,
    };
  }

  loggedIn() {
    return Boolean(this.getToken());
  }

  isTokenExpired(_token: string) {
    return false;
  }

  getToken(): string {
    const local = safeGet(localStorage, TOKEN_KEY);
    if (local) return local;

    const session = safeGet(sessionStorage, TOKEN_KEY);
    if (session) return session;

    const cookie = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${COOKIE_KEY}=`));

    return cookie ? decodeURIComponent(cookie.split('=')[1] || '') : '';
  }

  login(identity: string) {
    const sessionValue = identity || 'reader';
    safeSet(localStorage, TOKEN_KEY, sessionValue);
    safeSet(sessionStorage, TOKEN_KEY, sessionValue);
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(sessionValue)}; path=/; max-age=604800; SameSite=Lax`;
    window.location.href = '/';
  }

  loginDemo() {
    this.login('demo');
  }

  logout() {
    safeRemove(localStorage, TOKEN_KEY);
    safeRemove(sessionStorage, TOKEN_KEY);
    document.cookie = `${COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    window.location.href = '/';
  }
}

export default new AuthService();
