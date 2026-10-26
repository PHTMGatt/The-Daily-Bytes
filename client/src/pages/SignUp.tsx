import { useState, FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';

import Auth from '../utils/auth';
import { signUp } from '../api/authAPI';
import { UserLogin } from '../interfaces/UserLogin';
import './Auth.css';

const SignUp = () => {
  const [signUpData, setSignUpData] = useState<UserLogin>({
    username: '',
    password: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await signUp(signUpData);
      if (!data?.token) throw new Error('Unable to create a session.');
      Auth.login(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account.');
      setLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <div className="auth-heading">
          <span className="auth-eyebrow">READER ACCOUNT</span>
          <h1>Create your account</h1>
          <p>
            Create one secure Daily Bytes account and keep your saved gaming and hardware stories across browsers.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={signUpData.email ?? ''}
              onChange={handleChange}
              autoComplete="email"
              placeholder="you@example.com"
              maxLength={254}
              required
            />
          </label>

          <label className="auth-field">
            <span>Username</span>
            <input
              type="text"
              name="username"
              value={signUpData.username ?? ''}
              onChange={handleChange}
              autoComplete="username"
              placeholder="Choose a username"
              minLength={3}
              maxLength={40}
              required
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={signUpData.password ?? ''}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="8–128 characters"
              minLength={8}
              maxLength={128}
              required
            />
          </label>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button className="auth-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
};

export default SignUp;
