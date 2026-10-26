import type { UserLogin } from '../interfaces/UserLogin';

const postAuth = async (path: 'login' | 'register', userInfo: UserLogin) => {
  const response = await fetch(`/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: userInfo.username?.trim(),
      email: userInfo.email?.trim(),
      password: userInfo.password,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Authentication request failed.');
  }

  return data as { token: string };
};

export const login = (userInfo: UserLogin) => postAuth('login', userInfo);
export const signUp = (userInfo: UserLogin) => postAuth('register', userInfo);
