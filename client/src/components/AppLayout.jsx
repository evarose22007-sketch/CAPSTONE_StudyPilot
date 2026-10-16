import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { BookIcon, HomeIcon, ListIcon, Logo, LogoutIcon } from './Icons';

const links = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/tasks', label: 'Tasks', icon: ListIcon },
  { to: '/courses', label: 'Courses', icon: BookIcon },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="sidebar">
        <div className="brand">
          <Logo />
          <span>StudyPilot</span>
        </div>

        <nav aria-label="Main" className="nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="nav__link">
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="account">
          <p className="account__name">{user.name}</p>
          <p className="account__email">{user.email}</p>
          <button type="button" className="btn btn--quiet btn--small account__logout" onClick={handleLogout}>
            <LogoutIcon />
            Log out
          </button>
        </div>
        <button type="button" className="icon-btn mobile-logout" onClick={handleLogout} aria-label="Log out">
          <LogoutIcon />
        </button>
      </header>

      <main id="main" className="main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
