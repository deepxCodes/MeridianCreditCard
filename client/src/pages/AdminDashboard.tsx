import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  CheckCircle,
  ShieldAlert,
  Users,
  RefreshCw,
  FileText,
  Eye,
  ArrowRightCircle,
  Check,
  X,
  CreditCard,
} from 'lucide-react';
import type { CreditCardApplication, DashboardStats, FraudLog, User } from '../types';
import { adminApi } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [fraudLogs, setFraudLogs] = useState<FraudLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<CreditCardApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<CreditCardApplication | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [fetchedStats, fetchedLogs, fetchedUsers, fetchedApps] = await Promise.all([
        adminApi.getStats(),
        adminApi.getFraudLogs(),
        adminApi.getUsers(),
        adminApi.getApplications(),
      ]);
      setStats(fetchedStats);
      setFraudLogs(fetchedLogs);
      setUsers(fetchedUsers);
      setApplications(fetchedApps);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
      // Fallback: check localStorage for applicant data if backend is offline
      const storedAppStr = localStorage.getItem('mc_app');
      if (storedAppStr) {
        try {
          const storedApp = JSON.parse(storedAppStr);
          setApplications([storedApp]);
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResolveFraud = async (logId: number) => {
    try {
      await adminApi.resolveFraudLog(logId);
      fetchAdminData();
    } catch (err) {
      alert('Failed to resolve fraud log.');
    }
  };

  const handleAdvanceStage = async (app: CreditCardApplication) => {
    const nextStage = Math.min((app.currentStage || 1) + 1, 6);
    try {
      await adminApi.updateApplicationStage(app.id || 1, nextStage, false);
      fetchAdminData();
    } catch {
      // Offline fallback
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, currentStage: nextStage, isRejected: false } : a))
      );
    }
  };

  const handleApprove = async (app: CreditCardApplication) => {
    try {
      await adminApi.updateApplicationStage(app.id || 1, 6, false);
      fetchAdminData();
    } catch {
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, currentStage: 6, isRejected: false } : a))
      );
    }
  };

  const handleReject = async (app: CreditCardApplication) => {
    const reason = prompt('Please enter rejection reason:', 'Credit score threshold not met.') || 'Credit criteria not met';
    try {
      await adminApi.updateApplicationStage(app.id || 1, 5, true, reason);
      fetchAdminData();
    } catch {
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, currentStage: 5, isRejected: true, rejectionReason: reason } : a))
      );
    }
  };

  const stageLabels = [
    'Application submitted',
    'Documents verified',
    'Credit assessment',
    'Application review',
    'Decision',
    'Card issued',
  ];

  const getStageLabel = (stage: number, isRejected: boolean) => {
    if (stage === 5) return isRejected ? 'Rejected' : 'Approved';
    if (stage >= 1 && stage <= 6) return stageLabels[stage - 1];
    return 'In Progress';
  };

  return (
    <div className="admin-dashboard-container">
      {/* Header Row */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-page-heading">
            <ShieldAlert size={26} color="#818cf8" />
            System Administration & Operations Console
          </h2>
          <p className="admin-page-subtitle">Credit card applicants review, fraud logs, system telemetry & account controls</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={fetchAdminData}
          disabled={loading}
          style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', borderColor: 'rgba(255,255,255,0.12)' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing…' : 'Refresh Telemetry'}
        </button>
      </div>

      {/* Metric Cards Grid */}
      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="admin-stat-label">Gateway System Volume</span>
            <div className="admin-stat-value volume-val">
              ₹{stats.totalVolumeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="admin-stat-subtext">Approved Settlement Value</div>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-label">Card Applicants</span>
            <div className="admin-stat-value rate-val">
              {applications.length}
            </div>
            <div className="admin-stat-subtext">
              {applications.filter((a) => !a.isRejected && a.currentStage < 6).length} In Review Pipeline
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-label">Registered Accounts</span>
            <div className="admin-stat-value">
              {stats.totalUsers}
            </div>
            <div className="admin-stat-subtext">
              {stats.totalCustomers} Customers · {stats.totalMerchants} Merchants
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-label">Fraud Incidents</span>
            <div className="admin-stat-value fraud-val">
              {stats.totalFraudLogsCount}
            </div>
            <div className={`admin-stat-subtext ${stats.pendingFraudLogsCount > 0 ? 'highlight-warn' : ''}`}>
              {stats.pendingFraudLogsCount} Pending Review
            </div>
          </div>
        </div>
      )}

      {/* 1. CREDIT CARD APPLICANTS & REVIEW QUEUE */}
      <div className="admin-panel-card">
        <div className="admin-panel-header">
          <div>
            <h3 className="admin-panel-title">
              <FileText size={20} color="#38bdf8" />
              Credit Card Applicants & Underwriting Queue
            </h3>
            <p className="admin-panel-subtitle">Review personal dossiers, income verification, and advance applicant approval stages</p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>App Reference</th>
                <th>Applicant Name</th>
                <th>Contact Details</th>
                <th>Employment & Income</th>
                <th>Card Choice</th>
                <th>Review Stage</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty-table-msg">
                    {loading ? 'Fetching applicants queue...' : 'No credit card applications submitted yet.'}
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id || app.applicationReference}>
                    <td className="admin-mono-ref">{app.applicationReference}</td>
                    <td>
                      <strong>{app.fullName}</strong>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>PAN: {app.pan || 'N/A'}</div>
                    </td>
                    <td>
                      <div className="admin-mono-date" style={{ color: '#e2e8f0' }}>{app.email}</div>
                      <div className="admin-mono-date" style={{ fontSize: '11px' }}>{app.mobile || '—'}</div>
                    </td>
                    <td>
                      <div><strong>₹{(app.income || 0).toLocaleString('en-IN')}/yr</strong></div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{app.empType} {app.employer ? `· ${app.employer}` : ''}</div>
                    </td>
                    <td>
                      <span
                        className="admin-badge"
                        style={{
                          background: app.cardChoice === 'Premium' ? 'rgba(168,85,247,0.15)' : 'rgba(59,130,246,0.15)',
                          color: app.cardChoice === 'Premium' ? '#c084fc' : '#60a5fa',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {app.cardChoice || 'Classic'} Card
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          app.isRejected
                            ? 'admin-badge-critical'
                            : app.currentStage >= 6
                            ? 'admin-badge-role-customer'
                            : 'admin-badge-high'
                        }`}
                      >
                        Stage {app.currentStage}: {getStageLabel(app.currentStage, app.isRejected)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedApp(app)}
                          className="admin-btn-action"
                          title="View Applicant Dossier"
                        >
                          <Eye size={13} />
                          Dossier
                        </button>

                        {!app.isRejected && app.currentStage < 6 && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAdvanceStage(app)}
                              className="admin-btn-action"
                              title="Advance to Next Stage"
                              style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' }}
                            >
                              <ArrowRightCircle size={13} />
                              Advance
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApprove(app)}
                              className="admin-btn-approve"
                              title="Approve & Issue Card"
                            >
                              <Check size={12} />
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReject(app)}
                              className="admin-btn-reject"
                              title="Reject Application"
                            >
                              <X size={12} />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. FRAUD DETECTION ENGINE TABLE */}
      <div className="admin-panel-card">
        <div className="admin-panel-header">
          <div>
            <h3 className="admin-panel-title">
              <AlertOctagon size={20} color="#f43f5e" />
              Fraud Detection Engine Audit Log
            </h3>
            <p className="admin-panel-subtitle">Transactions flagged by heuristics (e.g. &gt;₹50,000 limit, velocity, or blocked cards)</p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Txn Ref</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Trigger Reason</th>
                <th>Severity</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {fraudLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty-table-msg">
                    {loading ? 'Loading fraud incidents...' : 'No fraud incidents flagged by the engine.'}
                  </td>
                </tr>
              ) : (
                fraudLogs.map((f) => (
                  <tr key={f.id}>
                    <td className="admin-mono-ref">{f.transactionReference}</td>
                    <td><strong>{f.customerName}</strong></td>
                    <td className="admin-mono-amt">₹{f.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ maxWidth: '280px', color: '#e2e8f0' }}>{f.fraudReason}</td>
                    <td>
                      <span
                        className={`admin-badge ${
                          f.severity === 'Critical'
                            ? 'admin-badge-critical'
                            : f.severity === 'High'
                            ? 'admin-badge-high'
                            : 'admin-badge-medium'
                        }`}
                      >
                        {f.severity}
                      </span>
                    </td>
                    <td>
                      {f.isResolved ? (
                        <span style={{ color: '#34d399', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} />
                          Resolved ({f.resolvedBy || 'Admin'})
                        </span>
                      ) : (
                        <span style={{ color: '#fbbf24', fontWeight: 600 }}>Pending Review</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!f.isResolved && (
                        <button
                          type="button"
                          onClick={() => handleResolveFraud(f.id)}
                          className="admin-btn-resolve"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. USERS DIRECTORY */}
      <div className="admin-panel-card">
        <div className="admin-panel-header">
          <div>
            <h3 className="admin-panel-title">
              <Users size={20} color="#818cf8" />
              Registered System Accounts
            </h3>
            <p className="admin-panel-subtitle">Directory of administrators, verified merchants, and cardholders</p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-empty-table-msg">
                    {loading ? 'Loading user directory...' : 'No registered accounts found.'}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="admin-mono-date">#{u.id}</td>
                    <td><strong>{u.fullName}</strong></td>
                    <td className="admin-mono-date" style={{ color: '#cbd5e1' }}>{u.email}</td>
                    <td>
                      <span
                        className={`admin-badge ${
                          u.role === 'Admin'
                            ? 'admin-badge-role-admin'
                            : u.role === 'Merchant'
                            ? 'admin-badge-role-merchant'
                            : 'admin-badge-role-customer'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: u.isEmailVerified ? '#34d399' : '#f59e0b', fontWeight: 600 }}>
                        {u.isEmailVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="admin-mono-date">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DOSSIER MODAL */}
      {selectedApp && (
        <div className="admin-modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="admin-modal-title flex items-center gap-2">
                <CreditCard size={20} color="#38bdf8" />
                Applicant Dossier: {selectedApp.applicationReference}
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedApp(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Personal */}
              <div>
                <h4 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Personal Information
                </h4>
                <div className="admin-dossier-grid">
                  <div className="admin-dossier-item">
                    <span className="admin-dossier-label">Full Name</span>
                    <span className="admin-dossier-val">{selectedApp.fullName}</span>
                  </div>
                  <div className="admin-dossier-item">
                    <span className="admin-dossier-label">Date of Birth</span>
                    <span className="admin-dossier-val">{selectedApp.dob || '—'}</span>
                  </div>
                  <div className="admin-dossier-item">
                    <span className="admin-dossier-label">Tax ID (PAN)</span>
                    <span className="admin-dossier-val">{selectedApp.pan || '—'}</span>
                  </div>
                  <div className="admin-dossier-item">
                    <span className="admin-dossier-label">Phone & Email</span>
                    <span className="admin-dossier-val">{selectedApp.mobile} · {selectedApp.email}</span>
                  </div>
                  <div className="admin-dossier-item" style={{ gridColumn: 'span 2' }}>
                    <span className="admin-dossier-label">Residential Address</span>
                    <span className="admin-dossier-val">{selectedApp.address}, {selectedApp.city}, {selectedApp.state} - {selectedApp.zip}</span>
                  </div>
                </div>
              </div>

              {/* Employment */}
              <div>
                <h4 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Employment & Financials
                </h4>
                <div className="admin-dossier-grid">
                  <div className="admin-dossier-item">
                    <span className="admin-dossier-label">Employment Type</span>
                    <span className="admin-dossier-val">{selectedApp.empType}</span>
                  </div>
                  <div className="admin-dossier-item">
                    <span className="admin-dossier-label">Employer Name</span>
                    <span className="admin-dossier-val">{selectedApp.employer || '—'}</span>
                  </div>
                  <div className="admin-dossier-item">
                    <span className="admin-dossier-label">Annual Income</span>
                    <span className="admin-dossier-val" style={{ color: '#34d399' }}>
                      ₹{(selectedApp.income || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="admin-dossier-item">
                    <span className="admin-dossier-label">Selected Card Type</span>
                    <span className="admin-dossier-val">{selectedApp.cardChoice} Card</span>
                  </div>
                  <div className="admin-dossier-item">
                    <span className="admin-dossier-label">Existing Loans</span>
                    <span className="admin-dossier-val">{selectedApp.loans || 'None'}</span>
                  </div>
                  <div className="admin-dossier-item">
                    <span className="admin-dossier-label">Bank Account Last 4</span>
                    <span className="admin-dossier-val">{selectedApp.bank || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Current Underwriting Status
                </h4>
                <div className="admin-dossier-grid">
                  <div className="admin-dossier-item">
                    <span className="admin-dossier-label">Current Stage</span>
                    <span className="admin-dossier-val">
                      Stage {selectedApp.currentStage}: {getStageLabel(selectedApp.currentStage, selectedApp.isRejected)}
                    </span>
                  </div>
                  <div className="admin-dossier-item">
                    <span className="admin-dossier-label">Submission Date</span>
                    <span className="admin-dossier-val">
                      {selectedApp.submittedAt ? new Date(selectedApp.submittedAt).toLocaleString() : '—'}
                    </span>
                  </div>
                  {selectedApp.isRejected && selectedApp.rejectionReason && (
                    <div className="admin-dossier-item" style={{ gridColumn: 'span 2', borderColor: 'rgba(239,68,68,0.3)' }}>
                      <span className="admin-dossier-label" style={{ color: '#f87171' }}>Rejection Reason</span>
                      <span className="admin-dossier-val" style={{ color: '#fca5a5' }}>{selectedApp.rejectionReason}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedApp(null)}
                style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', borderColor: 'rgba(255,255,255,0.12)' }}
              >
                Close
              </button>

              {!selectedApp.isRejected && selectedApp.currentStage < 6 && (
                <>
                  <button
                    type="button"
                    className="admin-btn-action"
                    onClick={() => {
                      handleAdvanceStage(selectedApp);
                      setSelectedApp(null);
                    }}
                  >
                    Advance Stage
                  </button>
                  <button
                    type="button"
                    className="admin-btn-approve"
                    onClick={() => {
                      handleApprove(selectedApp);
                      setSelectedApp(null);
                    }}
                  >
                    Approve Application
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
