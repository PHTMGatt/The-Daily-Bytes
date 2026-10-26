const TOKEN_KEY = 'daily_bytes_session';

const decodePayload = (token: string): { username?: string; exp?: number } => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return {};
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
};

class AuthService {
  loggedIn() {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      this.clearToken();
      return false;
    }
    return true;
  }

  isTokenExpired(token: string) {
    const { exp } = decodePayload(token);
    return !exp || exp * 1000 <= Date.now();
  }

  getToken(): string {
    try {
      return localStorage.getItem(TOKEN_KEY) || '';
    } catch {
      return '';
    }
  }

  login(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    window.location.assign('/');
  }

  clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Storage can be unavailable in restrictive browser modes.
    }
  }

  logout() {
    this.clearToken();
    window.location.assign('/');
  }
}

export default new AuthService();
