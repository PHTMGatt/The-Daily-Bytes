import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMoon, FiSun } from 'react-icons/fi';
import auth from '../utils/auth';
import './Navbar.css';

interface SliderToggleProps {
  selected: 'light' | 'dark';
  setSelected: (val: 'light' | 'dark') => void;
}

const SliderToggle = ({ selected, setSelected }: SliderToggleProps) => {
  return (
    <div className="theme-toggle-wrapper" role="group" aria-label="Theme toggle">
      <button
        className={`theme-toggle-button ${selected === 'light' ? 'selected' : ''}`}
        onClick={() => setSelected('light')}
        aria-pressed={selected === 'light'}
      >
        <FiSun className="icon" />
        Light
      </button>
      <button
        className={`theme-toggle-button ${selected === 'dark' ? 'selected' : ''}`}
        onClick={() => setSelected('dark')}
        aria-pressed={selected === 'dark'}
      >
        <FiMoon className="icon" />
        Dark
      </button>
      <div className={`theme-slider ${selected === 'dark' ? 'right' : 'left'}`} />
    </div>
  );
};

const Navbar = () => {
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const [loginCheck, setLoginCheck] = useState(auth.loggedIn());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    let saved = '';
    try { saved = localStorage.getItem('theme') || ''; } catch { /* Theme works without storage. */ }
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--header-height', `${headerRef.current?.offsetHeight || 82}px`);
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setLoginCheck(auth.loggedIn());
    const update = () => setLoginCheck(auth.loggedIn());
    window.addEventListener('daily-bytes-auth', update);
    return () => window.removeEventListener('daily-bytes-auth', update);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem('theme', theme); } catch { /* Theme works without storage. */ }
  }, [theme]);

  const tabs = [
    { label: 'Home', to: '/' },
    { label: 'DailyByte', to: '/dailybyte' },
    { label: 'Trending', to: '/trending' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <header className="navbar" ref={headerRef}>
      <div className="navbar-inner">
        <Link to="/" className="nav-title">
          <svg aria-hidden="true" viewBox="0 0 32 32" width="28" height="28"><path d="M5 5h10c16 0 16 22 0 22H5zm6 6v10h4c7 0 7-10 0-10z" fill="currentColor"/><path d="M25 5h4v4h-4z" fill="#f5c74a"/></svg>
          THE DAILY BYTES
        </Link>

        <nav className="nav-tabs" aria-label="Primary navigation">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              to={tab.to}
              aria-current={location.pathname === tab.to ? 'page' : undefined}
              className={`nav-link ${location.pathname === tab.to ? 'active' : ''}`}
            >
              {tab.label.toUpperCase()}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          {loginCheck ? (
            <button
              className="nav-link logout-button"
              onClick={() => {
                auth.logout();
                setLoginCheck(false);
              }}
            >
              LOGOUT
            </button>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                LOGIN
              </Link>
              <Link to="/signup" className="nav-link signup-button">
                SIGN UP
              </Link>
            </>
          )}

          <SliderToggle selected={theme} setSelected={setTheme} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
