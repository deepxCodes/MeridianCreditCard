import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { AdminDashboard } from '../pages/AdminDashboard';
import {
  ShieldAlert,
  LayoutDashboard,
  LogOut,
  Bell,
  ChevronLeft,
  Menu,
} from 'lucide-react';

export const AdminShell: React.FC = () => {
  const { user, logout, showToast } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Guard: redirect to admin login if not admin
  if (!user || user.role !== 'Admin') {
    window.location.href = '/admin/login';
    return null;
  }

  const handleLogout = () => {
    logout();
    showToast('Admin session terminated');
    window.location.href = '/admin/login';
  };

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    return (
      name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('') || 'A'
    );
  };

  return (
    <div className={`admin-shell ${sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <ShieldAlert size={22} className="admin-brand-icon" />
            {!sidebarCollapsed && (
              <div className="admin-brand-text">
                <span className="admin-brand-name">Meridian</span>
                <span className="admin-brand-label">Admin Console</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="admin-sidebar-toggle desktop-only"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            <ChevronLeft size={16} className={sidebarCollapsed ? 'rotated' : ''} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          <button type="button" className="admin-nav-link active">
            <LayoutDashboard size={18} />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-chip">
            <div className="admin-avatar">{getInitials(user.fullName)}</div>
            {!sidebarCollapsed && (
              <div className="admin-user-info">
                <span className="admin-user-name">{user.fullName}</span>
                <span className="admin-user-role">Administrator</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="admin-nav-link admin-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-menu mobile-only"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Open admin menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="admin-topbar-title">System Administration</h1>
          </div>
          <div className="admin-topbar-right">
            <button type="button" className="admin-topbar-icon-btn" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="admin-topbar-user">
              <div className="admin-avatar-sm">{getInitials(user.fullName)}</div>
              <span className="admin-topbar-username">{user.fullName}</span>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="admin-content">
          <AdminDashboard />
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
