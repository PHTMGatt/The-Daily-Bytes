import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBookmark, FiLogOut, FiMoon, FiSearch, FiSun, FiUser } from 'react-icons/fi';
import auth from '../utils/auth';
import { getNavigationSearchValue, getSearchTargetPath } from '../utils/navigationSearch';
import { nextHeaderHidden } from '../utils/feedLayout.js';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loginCheck, setLoginCheck] = useState(auth.loggedIn());
  const [search, setSearch] = useState(() => getNavigationSearchValue(location.search));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    setLoginCheck(auth.loggedIn());
    setSearch(getNavigationSearchValue(location.search));
  }, [location.pathname, location.search]);

  // Phones: the header slides away while reading down and comes back on any scroll up.
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setHidden((current) => nextHeaderHidden(lastY.current, y, current));
        lastY.current = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    setHidden(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    navigate(`${getSearchTargetPath(location.pathname)}?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className={`navbar${hidden ? ' navbar-hidden' : ''}`} onFocusCapture={() => setHidden(false)}>
      <div className="navbar-inner">
        <Link className="brand-lockup" to="/" aria-label="Daily Bytes home">
          <span className="brand-name">Daily <strong>Bytes</strong></span>
          <span className="brand-tagline">Games. Hardware. Tech.</span>
        </Link>

        <form className="nav-search" onSubmit={handleSearch} role="search">
          <FiSearch className="nav-search-icon" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search games, GPUs, RAM, hardware..."
            aria-label="Search Daily Bytes"
          />
          <button type="submit" aria-label="Search">
            <FiArrowRight aria-hidden="true" />
          </button>
        </form>

        <div className="nav-actions">
          {loginCheck && (
            <Link className="nav-text-link" to="/saved">
              <FiBookmark /> Saved
            </Link>
          )}
          <button
            className="theme-icon-button"
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <FiMoon /> : <FiSun />}
          </button>

          {loginCheck ? (
            <button
              className="account-button"
              type="button"
              onClick={() => {
                auth.logout();
                setLoginCheck(false);
              }}
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          ) : (
            <Link className="account-button" to="/login">
              <FiUser />
              <span>Sign in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
