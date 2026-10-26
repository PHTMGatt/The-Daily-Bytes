import { Link, useLocation } from 'react-router-dom';
import { FaGamepad } from 'react-icons/fa';
import { FiBookmark, FiCpu, FiHardDrive, FiHome, FiTrendingUp } from 'react-icons/fi';
import { MdMemory } from 'react-icons/md';
import { BsController } from 'react-icons/bs';
import './SideNav.css';

const navItems = [
  { label: 'Home', to: '/', icon: FiHome },
  { label: 'Gaming', to: '/dailybyte?q=gaming', query: 'gaming', icon: FaGamepad },
  { label: 'Witcher 3', to: '/dailybyte?q=The%20Witcher%203', query: 'the witcher 3', icon: BsController },
  { label: 'NVIDIA', to: '/dailybyte?q=NVIDIA%20GPU', query: 'nvidia gpu', icon: FiCpu },
  { label: 'RAM Prices', to: '/dailybyte?q=RAM%20prices', query: 'ram prices', icon: MdMemory },
  { label: 'PC Hardware', to: '/dailybyte?q=PC%20hardware', query: 'pc hardware', icon: FiHardDrive },
  { label: 'Saved', to: '/saved', icon: FiBookmark },
  { label: 'Trending', to: '/trending', icon: FiTrendingUp },
];

const SideNav = () => {
  const location = useLocation();
  const currentQuery = (new URLSearchParams(location.search).get('q') || '').toLowerCase();

  const isActive = (to: string, query?: string) => {
    if (to === '/') return location.pathname === '/';
    if (query) return location.pathname === '/dailybyte' && currentQuery === query;
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
              key={item.label}
              className={`sidenav-link ${isActive(item.to, item.query) ? 'active' : ''}`}
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
