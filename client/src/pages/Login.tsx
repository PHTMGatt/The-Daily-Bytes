import { useState, FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';

import Auth from '../utils/auth';
import { login } from '../api/authAPI';
import { UserLogin } from '../interfaces/UserLogin';
import './Auth.css';

const Login = () => {
  const [loginData, setLoginData] = useState<UserLogin>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const finishLogin = async (credentials: UserLogin) => {
    setLoading(true);
    setError('');

    try {
      const data = await login(credentials);
      if (!data?.token) throw new Error('Unable to create a session.');
      Auth.login(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await finishLogin(loginData);
  };

  const handleDemoLogin = async () => {
    setLoginData({ username: 'demo', password: 'dailybytes' });
    await finishLogin({ username: 'demo', password: 'dailybytes' });
  };

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <div className="auth-heading">
          <span className="auth-eyebrow">READER ACCESS</span>
          <h1>Welcome back</h1>
          <p>
            Home, DailyByte, Trending, and Contact stay public. Sign in to unlock
            the extra category sidebar.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Username</span>
            <input
              type="text"
              name="username"
              value={loginData.username ?? ''}
              onChange={handleChange}
              autoComplete="username"
              placeholder="Enter your username"
              required
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={loginData.password ?? ''}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
          </label>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button className="auth-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button
          className="auth-demo"
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
        >
          Continue with demo account
        </button>
        <p className="auth-demo-copy">Demo: <strong>demo</strong> / <strong>dailybytes</strong></p>

        <p className="auth-footer">
          Need an account? <Link to="/signup">Create a local demo profile</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
