import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { userApi } from '../services/api';

export const ProfilePanel: React.FC = () => {
  const { user, updateUserProfile, showToast } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editMobile, setEditMobile] = useState(user?.phoneNumber || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  // Mask helpers
  const maskEmail = (e?: string) => {
    if (!e) return '—';
    const parts = e.split('@');
    if (parts.length < 2) return e;
    const [u, d] = parts;
    return `${u.slice(0, 2)}***@${d}`;
  };

  const maskMobile = (m?: string) => {
    if (!m) return '—';
    return `******${m.slice(-4)}`;
  };

  const handleStartEdit = () => {
    setEditName(user?.fullName || '');
    setEditEmail(user?.email || '');
    setEditMobile(user?.phoneNumber || '');
    setEditAddress(user?.address || '');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      fullName: editName.trim() || user?.fullName,
      email: editEmail.trim() || user?.email,
      phoneNumber: editMobile.trim() || user?.phoneNumber,
      address: editAddress.trim() || user?.address,
    };

    try {
      await userApi.updateProfile(updated);
    } catch {
      // offline / mock fallback
    }

    updateUserProfile(updated);
    setIsEditing(false);
    showToast('Profile updated');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (!currentPassword) {
      setPassError('Current password is required.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPassError('New password must be at least 8 characters.');
      return;
    }

    setPassLoading(true);
    try {
      await userApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      showToast('Password updated successfully');
    } catch (err: any) {
      setPassError(err.response?.data?.message || 'Failed to update password. Check current password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <section id="panel-profile" className="panel active">
      {/* PERSONAL INFO CARD */}
      {!isEditing ? (
        <div className="card">
          <h2 className="section-title-inline">Personal information</h2>
          <div className="profile-grid" id="profileView">
            <div className="p-item">
              <span className="p-label">Full name</span>
              <span className="p-value">{user?.fullName || 'Jane Doe'}</span>
            </div>
            <div className="p-item">
              <span className="p-label">Email</span>
              <span className="p-value">{maskEmail(user?.email || 'jane.doe@email.com')}</span>
            </div>
            <div className="p-item">
              <span className="p-label">Mobile</span>
              <span className="p-value">{maskMobile(user?.phoneNumber || '9876543210')}</span>
            </div>
            <div className="p-item">
              <span className="p-label">Address</span>
              <span className="p-value">
                {user?.address || '42 Park Avenue'}, {user?.city || 'Mumbai'} {user?.state || 'Maharashtra'}{' '}
                {user?.zipCode || '400001'}
              </span>
            </div>
            <div className="p-item">
              <span className="p-label">Username</span>
              <span className="p-value">{user?.username || 'janedoe'}</span>
            </div>
            <div className="p-item">
              <span className="p-label">Date of birth</span>
              <span className="p-value">{user?.dateOfBirth || '1995-06-15'}</span>
            </div>
          </div>
          <button type="button" className="btn btn-secondary" id="btnEditProfile" onClick={handleStartEdit}>
            Edit information
          </button>
        </div>
      ) : (
        <form className="card" id="profileEditForm" onSubmit={handleSaveProfile} noValidate>
          <h2 className="section-title-inline">Edit information</h2>
          <div className="field-grid two">
            <div className="field">
              <label htmlFor="p-name">Full name</label>
              <input
                type="text"
                id="p-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="p-email">Email</label>
              <input
                type="email"
                id="p-email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="field-grid two">
            <div className="field">
              <label htmlFor="p-mobile">Mobile number</label>
              <input
                type="tel"
                id="p-mobile"
                value={editMobile}
                onChange={(e) => setEditMobile(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="p-address">Residential address</label>
              <input
                type="text"
                id="p-address"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
              />
            </div>
          </div>
          <div className="form-nav">
            <button type="button" className="btn btn-ghost" id="profileCancel" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save changes
            </button>
          </div>
        </form>
      )}

      {/* CHANGE PASSWORD CARD */}
      <div className="card">
        <h2 className="section-title-inline">Change password</h2>
        <form id="changePasswordForm" onSubmit={handleChangePassword} noValidate>
          <div className="field-grid two">
            <div className="field">
              <label htmlFor="cp-current">Current password</label>
              <input
                type="password"
                id="cp-current"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="cp-new">New password</label>
              <input
                type="password"
                id="cp-new"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          {passError && <p className="error-msg show" id="err-cp">{passError}</p>}
          <button type="submit" className="btn btn-secondary" disabled={passLoading}>
            {passLoading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>

      {/* NOTIFICATION PREFERENCES CARD */}
      <div className="card">
        <h2 className="section-title-inline">Notification preferences</h2>
        <label className="checkbox-line block">
          <input type="checkbox" defaultChecked />
          <span>Email updates on application status</span>
        </label>
        <label className="checkbox-line block">
          <input type="checkbox" defaultChecked />
          <span>SMS alerts for critical actions</span>
        </label>
        <label className="checkbox-line block">
          <input type="checkbox" />
          <span>Marketing communications</span>
        </label>
      </div>

      {/* SECURITY SETTINGS CARD */}
      <div className="card">
        <h2 className="section-title-inline">Security settings</h2>
        <div className="security-row">
          <span>Two-factor authentication</span>
          <span className="status-pill status-pending">Not enabled</span>
        </div>
        <div className="security-row">
          <span>Session timeout</span>
          <span className="stat-value" style={{ fontSize: 14 }}>
            15 minutes of inactivity
          </span>
        </div>
        <div className="security-row">
          <span>Last login</span>
          <span className="stat-value" id="lastLoginDisplay" style={{ fontSize: 14 }}>
            {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Today'}
          </span>
        </div>
      </div>
    </section>
  );
};
