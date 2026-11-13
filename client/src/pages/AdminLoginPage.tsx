import React, { useState } from 'react';
import { ShieldAlert, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../services/api';

export const AdminLoginPage: React.FC = () => {
  const { setAuth, showToast } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Admin email or username is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(email.trim(), password);
      if (res.user.role !== 'Admin') {
        setLoading(false);
        setError('Access denied. This portal is restricted to administrators.');
        return;
      }
      setAuth(res.user, res.accessToken);
      showToast('Admin session established');
      window.location.href = '/admin';
    } catch {
      setLoading(false);
      setError('Invalid credentials or insufficient privileges.');
    }
  };

  return (
    <div className="admin-login-shell">
      {/* Background decorative elements */}
      <div className="admin-login-bg">
        <div className="admin-bg-orb admin-bg-orb-1" />
        <div className="admin-bg-orb admin-bg-orb-2" />
        <div className="admin-bg-orb admin-bg-orb-3" />
        <div className="admin-bg-grid" />
      </div>

      <div className="admin-login-container">
        {/* Header branding */}
        <div className="admin-login-header">
          <img src="/Meridiancredit.jpg" alt="Meridian Credit Logo" className="admin-login-logo" />
          <h1 className="admin-login-brand">Meridian Credit</h1>
          <p className="admin-login-label">Administration Console</p>
        </div>

        {/* Login card */}
        <form className="admin-login-card" onSubmit={handleSubmit} noValidate>
          <div className="admin-card-header">
            <Lock size={18} className="admin-lock-icon" />
            <div>
              <h2 className="admin-card-title">Secure Sign-in</h2>
              <p className="admin-card-subtitle">IP-restricted administrative access</p>
            </div>
          </div>

          {error && (
            <div className="admin-error-banner">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="admin-field">
            <label htmlFor="adminEmail">Admin Email / Username</label>
            <input
              type="text"
              id="adminEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deepg or deepg@meridiancredit.com"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="admin-field">
            <label htmlFor="adminPassword">Password</label>
            <div className="admin-input-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                id="adminPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-toggle-pass"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="admin-spinner" />
            ) : (
              <>
                <ShieldAlert size={16} />
                Authenticate
              </>
            )}
          </button>

          <div className="admin-login-footer">
            <div className="admin-secure-badge">
              <Lock size={12} />
              <span>256-bit encrypted session · IP verified</span>
            </div>
          </div>
        </form>

        {/* Bottom info */}
        <p className="admin-login-note">
          This portal is restricted to authorised personnel.
          <br />
          Unauthorised access attempts are logged and reported.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
