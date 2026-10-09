import { UserLogin } from '../interfaces/UserLogin';

const USERS_KEY = 'daily_bytes_demo_users';

interface StoredUser {
  username: string;
  email: string;
  passwordHash: string;
}

const demoUser = {
  username: 'demo',
  password: 'dailybytes',
};

const hashPassword = async (password: string) => {
  const bytes = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const readUsers = (): StoredUser[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const createSessionToken = (username: string) =>
  `daily-bytes:${encodeURIComponent(username)}:${Date.now()}`;

const login = async (userInfo: UserLogin) => {
  const username = userInfo.username?.trim() || '';
  const password = userInfo.password || '';

  if (username === demoUser.username && password === demoUser.password) {
    return { token: createSessionToken(username) };
  }

  const passwordHash = await hashPassword(password);
  const user = readUsers().find(
    (entry) => entry.username.toLowerCase() === username.toLowerCase() && entry.passwordHash === passwordHash
  );

  if (!user) {
    throw new Error('Invalid username or password.');
  }

  return { token: createSessionToken(user.username) };
};

const signUp = async (userInfo: UserLogin) => {
  const username = userInfo.username?.trim() || '';
  const email = userInfo.email?.trim() || '';
  const password = userInfo.password || '';

  if (!username || !email || !password) {
    throw new Error('Username, email, and password are required.');
  }

  const users = readUsers();
  if (users.some((entry) => entry.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('That username already exists in this browser.');
  }

  users.push({
    username,
    email,
    passwordHash: await hashPassword(password),
  });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  return { token: createSessionToken(username) };
};

export { login, signUp };
