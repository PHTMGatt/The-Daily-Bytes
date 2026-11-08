import './App.css';
import Navbar from './components/Navbar';
import SideNav from './components/SideNav';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Navbar />
      <SideNav />
      <main className="app-main" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
