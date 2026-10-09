import type { UserData } from '../interfaces/UserData';

const TOKEN_KEY = 'daily_bytes_session';

class AuthService {
  getProfile(): UserData {
    const token = this.getToken();
    const parts = token.split(':');
    const username = parts.length >= 2 ? decodeURIComponent(parts[1]) : 'reader';

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
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  login(sessionToken: string) {
    localStorage.setItem(TOKEN_KEY, sessionToken);
    window.location.assign('/');
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.assign('/login');
  }
}

export default new AuthService();
