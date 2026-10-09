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
      setError(err instanceof Error ? err.message : 'Unable to create your profile.');
      setLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <div className="auth-heading">
          <span className="auth-eyebrow">LOCAL PROFILE</span>
          <h1>Create an account</h1>
          <p>
            This portfolio demo stores the profile only in this browser. No remote
            account or database is created.
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
              placeholder="Choose a password"
              minLength={4}
              required
            />
          </label>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button className="auth-primary" type="submit" disabled={loading}>
            {loading ? 'Creating profile…' : 'Create profile'}
          </button>
        </form>

        <p className="auth-footer">
          Already have a profile? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
};

export default SignUp;
