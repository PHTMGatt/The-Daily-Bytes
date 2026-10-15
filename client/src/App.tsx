import './App.css';
import Navbar from './components/Navbar';
import SideNav from './components/SideNav';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    const names: Record<string, string> = { '/': 'Home', '/dailybyte': 'Your Daily Byte', '/login': 'Reader access', '/signup': 'Local profile' };
    document.title = `${names[pathname] || pathname.slice(1).replace(/^./, char => char.toUpperCase())} | The Daily Bytes`;
  }, [pathname]);
  return (
    <div>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <SideNav />
      <main className="container pt-5" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
