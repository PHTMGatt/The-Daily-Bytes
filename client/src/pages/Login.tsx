import { useState, FormEvent, ChangeEvent } from 'react';

import Auth from '../utils/auth';
import { login } from '../api/authAPI';
import { UserLogin } from '../interfaces/UserLogin';

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(loginData);
      if (data?.token) {
        Auth.login(data.token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const useDemoLogin = () => {
    setLoginData({ username: 'demo', password: 'dailybytes' });
    setError('');
  };

  return (
    <div className="form-container">
      <form className="form login-form" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <p className="contact-subtext">
          Sign in to unlock the full Daily Bytes experience.
        </p>

        <div className="form-group">
          <label>Username</label>
          <input
            className="form-input"
            type="text"
            name="username"
            value={loginData.username ?? ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            className="form-input"
            type="password"
            name="password"
            value={loginData.password ?? ''}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <div className="form-group">
          <button
            type="submit"
            disabled={loading}
            className={`login-button ${loading ? 'loading' : ''}`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        <div className="form-group">
          <button type="button" className="btn" onClick={useDemoLogin}>
            Use demo account
          </button>
          <small>Demo credentials: demo / dailybytes</small>
        </div>
      </form>
    </div>
  );
};

export default Login;
