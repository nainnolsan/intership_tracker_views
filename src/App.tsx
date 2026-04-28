import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { NavLink, Outlet } from 'react-router-dom';
import { clearSession, getSessionProfile, redirectToCentralLogin } from './auth/session';
import ThemeToggle from './components/ThemeToggle';
import { GET_PROFILE_QUERY } from './graphql/authQueries';
import './App.css';

interface ProfileQueryData {
  me?: {
    success?: boolean;
    message?: string;
    data?: {
      id?: string;
      name?: string;
      email?: string;
      createdAt?: string;
    };
  };
}

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/applications', label: 'Applications' },
  { to: '/discovery', label: 'Job Discovery ✨' },
  { to: '/email-center', label: 'Email Center' },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const sessionProfile = useMemo(() => getSessionProfile(), []);
  const { data } = useQuery<ProfileQueryData>(GET_PROFILE_QUERY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  const profileName = (data?.me?.data?.name as string | undefined)?.trim() || sessionProfile.displayName;
  const profileEmail = (data?.me?.data?.email as string | undefined) || sessionProfile.email;
  const profileInitials = profileName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join('') || sessionProfile.initials;

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);

  const handleLogout = () => {
    clearSession();
    redirectToCentralLogin(window.location.origin);
  };

  return (
    <>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-user-slot">
            <div className="user-menu" ref={menuRef}>
              <button
                type="button"
                className="user-menu-trigger"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span className="user-avatar" aria-hidden="true">
                  {profileInitials}
                </span>

                <span className="user-meta">
                  <strong>{profileName}</strong>
                  <small>{profileEmail ?? 'Signed in'}</small>
                </span>

                <span className="user-chevron" aria-hidden="true">
                  ▾
                </span>
              </button>

              {menuOpen && (
                <div className="user-menu-dropdown" role="menu">
                  <button type="button" role="menuitem" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                    My Profile
                  </button>
                  <button type="button" role="menuitem" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                    Preferences
                  </button>
                  <button type="button" role="menuitem" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                    API Integrations
                  </button>
                  <button type="button" role="menuitem" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                    Billing & Plan
                  </button>
                  <hr className="user-menu-separator" />
                  <button type="button" role="menuitem" className="user-menu-item danger" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="brand">
            <p className="eyebrow">Internship Tracker</p>
            <h2>Portfolio Ops</h2>
            <p className="brand-copy">Applications, funnel progression, analytics, and recruiter email coordination.</p>
          </div>

          <nav>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="content-area">
          <Outlet />
        </main>
      </div>
      <ThemeToggle />
    </>
  );
}

export default App;
