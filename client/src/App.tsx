import './App.css';
import Navbar from './components/Navbar';
import SideNav from './components/SideNav';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <SideNav />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
