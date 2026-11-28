import ReactDOM from 'react-dom/client';
import type { ComponentType } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './index.css';

import App from './App';
import ErrorPage from './pages/ErrorPage';
import DailyByte from './pages/DailyByte';

// Home (the gaming and tech hubs) ships in the first bundle; other pages load with their route.
const lazyPage = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    // Opening a lazy page directly: stay blank for the moment its chunk takes to arrive.
    hydrateFallbackElement: <></>,
    children: [
      { index: true, element: <DailyByte /> },
      { path: 'login', lazy: lazyPage(() => import('./pages/Login')) },
      { path: 'signup', lazy: lazyPage(() => import('./pages/SignUp')) },
      { path: 'dailybyte', element: <DailyByte /> },
      { path: 'saved', lazy: lazyPage(() => import('./pages/Saved')) },
      // Old general-news pages from the original class project: Daily Bytes is gaming + tech now.
      { path: 'entertainment', element: <Navigate to="/" replace /> },
      { path: 'sports', element: <Navigate to="/" replace /> },
      { path: 'health', element: <Navigate to="/" replace /> },
      { path: 'trending', lazy: lazyPage(() => import('./pages/Trending')) },
      { path: 'horoscope', lazy: lazyPage(() => import('./pages/Horoscope')) },
      { path: 'tech', element: <DailyByte key="tech" hub="tech" /> },
      { path: 'technology', element: <Navigate to="/tech" replace /> },
    ],
  },
]);

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<RouterProvider router={router} />);
}
