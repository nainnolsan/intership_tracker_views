import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { clearSession, getSessionProfile, redirectToCentralLogin } from './auth/session';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/applications', label: 'Applications' },
  { to: '/pipeline', label: 'Pipeline Board' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/email-center', label: 'Email Center' },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profile = useMemo(() => getSessionProfile(), []);

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
          <div className="content-topbar">
            <div className="topbar-status">
              <span className="status-dot" aria-hidden="true" />
              Ready to connect through API Gateway
            </div>

            <div className="user-menu" ref={menuRef}>
              <button
                type="button"
                className="user-menu-trigger"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span className="user-avatar" aria-hidden="true">
                  {profile.initials}
                </span>

                <span className="user-meta">
                  <strong>{profile.displayName}</strong>
                  <small>{profile.email ?? 'Signed in'}</small>
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
                  <hr className="user-menu-separator" />
                  <button type="button" role="menuitem" className="user-menu-item danger" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
          <Outlet />
        </main>
      </div>
      <ThemeToggle />
    </>
  );
}

export default App;
