import './App.css';
import Navbar from './components/Navbar';
import SideNav from './components/SideNav';
import auth from './utils/auth';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const loggedIn = auth.loggedIn();
  const authRoute = ['/login', '/signup'].includes(location.pathname.toLowerCase());

  if (!loggedIn && !authRoute) {
    return <Navigate to="/login" replace />;
  }

  if (loggedIn && authRoute) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <Navbar />
      <SideNav />
      <main className="container pt-5">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
