import { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useThemeStore } from '../store/themeStore.js';
import { Button } from '../components/Button.jsx';
import { logoutRequest } from '../features/auth/authApi.js';
import { NAV_BY_ROLE, ROLE_LABEL } from './navConfig.js';

export function AppLayout({ children }) {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = NAV_BY_ROLE[user?.role] || [];

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md p-2 hover:bg-surface-hover md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <span aria-hidden="true">☰</span>
          </button>
          <span className="text-base font-semibold text-text">ClinicOS</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="min-h-[40px] rounded-md border border-border px-3 py-2 text-sm text-text hover:bg-surface-hover"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-text">{user?.email}</p>
            <p className="text-xs text-muted">{ROLE_LABEL[user?.role]}</p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>

      <div className="flex">
        <nav
          aria-label="Primary"
          className={`${mobileNavOpen ? 'block' : 'hidden'} w-56 shrink-0 border-r border-border bg-surface p-4 md:block`}
        >
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-primary text-primary-foreground' : 'text-text hover:bg-surface-hover'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main id="main-content" className="min-w-0 flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
