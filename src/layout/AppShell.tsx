import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Icon, Persona, PersonaSize, Text } from '@fluentui/react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { usePageHeaderContext } from './usePageHeader';
import './AppShell.css';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: 'Home', end: true },
  { to: '/vehicles', label: 'Vehicles', icon: 'Car' },
  { to: '/assignments', label: 'Assignments', icon: 'ClipboardList' },
  { to: '/assign', label: 'Assign Vehicle', icon: 'Assign' },
];

export const AppShell: React.FC = () => {
  const { header } = usePageHeaderContext();
  const user = useCurrentUser();
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = () => setNavOpen(false);

  return (
    <div className="app-shell">
      {navOpen && <div className="app-sidebar-overlay" onClick={closeNav} />}

      <aside className={`app-sidebar${navOpen ? ' is-open' : ''}`}>
        <div className="app-sidebar-brand">
          <div className="app-sidebar-logo">EMT</div>
          <div>
            <div className="app-sidebar-title">Executive Mobility</div>
            <div className="app-sidebar-subtitle">Tracker</div>
          </div>
        </div>

        <nav className="app-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `app-nav-link${isActive ? ' is-active' : ''}`}
              onClick={closeNav}
            >
              <Icon iconName={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar-footer">Volkswagen &middot; Internal use only</div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="app-topbar-left">
            <button
              type="button"
              className="app-topbar-hamburger"
              aria-label="Toggle navigation"
              onClick={() => setNavOpen((open) => !open)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 6,
              }}
            >
              <Icon iconName="GlobalNavButton" styles={{ root: { fontSize: 20, color: '#1B2A2F' } }} />
            </button>

            <div style={{ minWidth: 0 }}>
              <Text variant="xLarge" styles={{ root: { fontWeight: 600, color: '#1B2A2F', display: 'block' } }}>
                {header.title}
              </Text>
              {header.subtitle && (
                <Text variant="small" styles={{ root: { color: '#5B6B70' } }}>
                  {header.subtitle}
                </Text>
              )}
            </div>
          </div>

          <div className="app-topbar-user">
            <div className="app-topbar-user-text">
              <Text variant="medium" styles={{ root: { fontWeight: 600, color: '#1B2A2F', display: 'block' } }}>
                {user.displayName}
              </Text>
              <Text variant="small" styles={{ root: { color: '#5B6B70' } }}>
                {user.role}
              </Text>
            </div>
            <Persona text={user.displayName} imageInitials={user.initials} size={PersonaSize.size40} hidePersonaDetails />
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
