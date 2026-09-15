import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { applicationApi, userApi } from '../services/api';
import type { NavPanel } from '../types';
import { DashboardPanel } from '../pages/DashboardPanel';
import { MerchantDashboard } from '../pages/MerchantDashboard';
import { ApplyPanel } from '../pages/ApplyPanel';
import { ConfirmationPanel } from '../pages/ConfirmationPanel';
import { TrackingPanel } from '../pages/TrackingPanel';

import { ProfilePanel } from '../pages/ProfilePanel';
import { SupportPanel } from '../pages/SupportPanel';

export const AppShell: React.FC = () => {
  const {
    user,
    activePanel,
    setActivePanel,
    logout,
    notifications,
    hasUnreadNotifs,
    clearUnreadNotifs,
    setNotifications,
    setApplication,
    showToast,
  } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Fetch initial user application and notifications on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [app, notifs] = await Promise.all([
          applicationApi.getCurrent(),
          userApi.getNotifications(),
        ]);
        if (app) setApplication(app);
        if (notifs && notifs.length > 0) setNotifications(notifs);
      } catch {
        // use existing stored state
      }
    };
    loadInitialData();
  }, []);

  const panelTitles: Record<NavPanel, string> = {
    dashboard: 'Dashboard',
    merchant: 'Merchant Portal',
    apply: 'Credit card application',
    tracking: 'Application tracking',
    profile: 'Profile',
    support: 'Help & support',
    confirmation: 'Application submitted',
  };

  const getInitials = (name?: string) => {
    if (!name) return 'JD';
    return (
      name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('') || 'U'
    );
  };

  const handleNavClick = (panel: NavPanel) => {
    setActivePanel(panel);
    setSidebarOpen(false);
    setNotifOpen(false);
    window.scrollTo(0, 0);
  };

  const handleToggleNotif = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && hasUnreadNotifs) {
      clearUnreadNotifs();
    }
  };

  const handleLogout = () => {
    logout();
    showToast('You have been logged out');
  };

  return (
    <div id="appShell" className="app-shell active">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"></span>
          <span className="brand-name">Meridian Credit</span>
        </div>
        <nav className="side-nav">
          <button
            type="button"
            className={`side-link ${activePanel === 'dashboard' ? 'active' : ''}`}
            data-nav="dashboard"
            onClick={() => handleNavClick('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`side-link ${activePanel === 'merchant' ? 'active' : ''}`}
            data-nav="merchant"
            onClick={() => handleNavClick('merchant')}
          >
            Merchant Portal
          </button>
          <button
            type="button"
            className={`side-link ${activePanel === 'apply' ? 'active' : ''}`}
            data-nav="apply"
            onClick={() => handleNavClick('apply')}
          >
            Apply for a card
          </button>
          <button
            type="button"
            className={`side-link ${activePanel === 'tracking' ? 'active' : ''}`}
            data-nav="tracking"
            onClick={() => handleNavClick('tracking')}
          >
            Track application
          </button>
          <button
            type="button"
            className={`side-link ${activePanel === 'profile' ? 'active' : ''}`}
            data-nav="profile"
            onClick={() => handleNavClick('profile')}
          >
            Profile
          </button>
          <button
            type="button"
            className={`side-link ${activePanel === 'support' ? 'active' : ''}`}
            data-nav="support"
            onClick={() => handleNavClick('support')}
          >
            Help &amp; support
          </button>
        </nav>
        <button type="button" className="side-link logout" id="btnLogout" onClick={handleLogout}>
          Log out
        </button>
      </aside>

      {/* MAIN APP BODY */}
      <div className="app-body">
        {/* TOPBAR */}
        <header className="topbar">
          <button
            type="button"
            className="icon-btn mobile-only"
            id="btnSidebarToggle"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1 className="topbar-title" id="topbarTitle">
            {panelTitles[activePanel] || 'Meridian Credit'}
          </h1>
          <div className="topbar-actions">
            <button
              type="button"
              className="icon-btn"
              id="btnNotifBell"
              aria-label="Notifications"
              onClick={handleToggleNotif}
            >
              <span>Alerts</span>
              {hasUnreadNotifs && <span className="notif-dot" id="notifDot"></span>}
            </button>
            <div className="avatar-chip" id="userChip">
              {getInitials(user?.fullName)}
            </div>
          </div>
        </header>

        {/* NOTIFICATION PANEL DRAWER */}
        {notifOpen && (
          <div className="notif-panel" id="notifPanel">
            <div className="notif-panel-head">
              <span>Notifications</span>
              <button type="button" className="btn btn-text" id="notifClose" onClick={() => setNotifOpen(false)}>
                Close
              </button>
            </div>
            <ul className="notif-list" id="notifList">
              {notifications.map((n, idx) => (
                <li key={n.id || idx}>
                  <span className="notif-title">{n.title}</span>
                  {n.body}
                  <div className="notif-time">{n.time}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* MAIN PANEL CONTENT */}
        <main className="app-main">
          {activePanel === 'dashboard' && <DashboardPanel />}
          {activePanel === 'merchant' && <MerchantDashboard />}
          {activePanel === 'apply' && <ApplyPanel />}
          {activePanel === 'confirmation' && <ConfirmationPanel />}
          {activePanel === 'tracking' && <TrackingPanel />}

          {activePanel === 'profile' && <ProfilePanel />}
          {activePanel === 'support' && <SupportPanel />}
        </main>
      </div>
    </div>
  );
};
