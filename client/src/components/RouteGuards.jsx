import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Loading } from './States';

/** Only for logged-in students; others go to /login and come back afterwards. */
export function RequireAuth() {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <FullPageLoading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Login and register pages: a logged-in student goes straight to the dashboard. */
export function GuestOnly() {
  const { user, status } = useAuth();
  if (status === 'checking') return <FullPageLoading />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}

function FullPageLoading() {
  return (
    <div className="full-page-center">
      <Loading label="Opening StudyPilot" />
    </div>
  );
}
