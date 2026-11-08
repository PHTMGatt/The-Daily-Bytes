import { Link, useLocation } from 'react-router-dom';
import { FaGamepad } from 'react-icons/fa';
import { FiBookmark, FiCpu, FiHome, FiTrendingUp } from 'react-icons/fi';
import './SideNav.css';

const navItems = [
  { label: 'Home', to: '/', icon: FiHome },
  // Each hub opens on its combined "mine" feed; single games / parts are chips inside the hub.
  { label: 'Gaming', to: '/dailybyte', hub: '/dailybyte', icon: FaGamepad },
  { label: 'Tech', to: '/tech', hub: '/tech', icon: FiCpu },
  { label: 'Saved', to: '/saved', icon: FiBookmark },
  { label: 'Trending', to: '/trending', icon: FiTrendingUp },
];

const SideNav = () => {
  const location = useLocation();

  // A hub stays highlighted for its combined feed and for every chip opened inside it.
  const isActive = (to: string, hub?: string) => {
    if (hub) return location.pathname === hub;
    return location.pathname === to;
  };

  return (
    <aside className="sidenav" aria-label="Primary navigation">
      <nav className="sidenav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              to={item.to}
              aria-current={isActive(item.to, item.hub) ? 'page' : undefined}
              key={item.label}
              className={`sidenav-link ${isActive(item.to, item.hub) ? 'active' : ''}`}
            >
              <Icon className="sidenav-icon" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidenav-note">
        <span />
        <p>Games. Gear.<br />Zero filler.</p>
      </div>
    </aside>
  );
};

export default SideNav;
