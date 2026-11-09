import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './index.css';

import App from './App';
import ErrorPage from './pages/ErrorPage';
import Horoscope from './pages/Horoscope';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Trending from './pages/Trending';
import DailyByte from './pages/DailyByte';
import Saved from './pages/Saved';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <DailyByte /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <SignUp /> },
      { path: 'dailybyte', element: <DailyByte /> },
      { path: 'saved', element: <Saved /> },
      // Old general-news pages from the original class project: Daily Bytes is gaming + tech now.
      { path: 'entertainment', element: <Navigate to="/" replace /> },
      { path: 'sports', element: <Navigate to="/" replace /> },
      { path: 'health', element: <Navigate to="/" replace /> },
      { path: 'trending', element: <Trending /> },
      { path: 'horoscope', element: <Horoscope /> },
      { path: 'tech', element: <DailyByte key="tech" hub="tech" /> },
      { path: 'technology', element: <Navigate to="/tech" replace /> },
    ],
  },
]);

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<RouterProvider router={router} />);
}
