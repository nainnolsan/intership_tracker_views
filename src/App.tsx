import { NavLink, Outlet } from 'react-router-dom';
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
            <span className="status-dot" aria-hidden="true" />
            Ready to connect through API Gateway
          </div>
          <Outlet />
        </main>
      </div>
      <ThemeToggle />
    </>
  );
}

export default App;
