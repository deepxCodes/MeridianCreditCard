import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import type { NavPanel } from '../types';

export const DashboardPanel: React.FC = () => {
  const { application, notifications, setActivePanel } = useAuthStore();

  const stageNames = [
    'Application submitted',
    'Documents verified',
    'Credit assessment',
    'Application review',
    application?.isRejected ? 'Rejected' : 'Approved',
    'Card issued',
  ];

  const currentStageLabel = application
    ? stageNames[application.currentStage - 1] || 'In progress'
    : 'No application yet';

  const statusPillClass = !application
    ? 'status-pill status-pending'
    : application.isRejected
    ? 'status-pill status-danger'
    : application.currentStage >= 6
    ? 'status-pill status-success'
    : 'status-pill status-warning';

  const statusValue = !application
    ? 'Not started'
    : application.isRejected
    ? 'Rejected'
    : application.currentStage >= 6
    ? 'Card issued'
    : 'In progress';

  const handleQuickAction = (nav: NavPanel) => {
    setActivePanel(nav);
  };

  return (
    <section id="panel-dashboard" className="panel active">
      <div className="banner banner-info" id="dashWelcomeBanner">
        Welcome back. Your session is active and secure.
      </div>

      <div className="grid-cards">
        <div className="card stat-card">
          <span className="stat-label">Application status</span>
          <span className="stat-value" id="dashStatus">
            {statusValue}
          </span>
          <span className={statusPillClass} id="dashStatusPill">
            {currentStageLabel}
          </span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Application ID</span>
          <span className="stat-value mono" id="dashAppId">
            {application ? application.applicationReference : '—'}
          </span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Current stage</span>
          <span className="stat-value" id="dashStage">
            {application ? currentStageLabel : '—'}
          </span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Submitted on</span>
          <span className="stat-value" id="dashDate">
            {application ? application.submittedAt : '—'}
          </span>
        </div>
      </div>

      <div className="section-heading">
        <h2>Quick actions</h2>
      </div>
      <div className="grid-actions">
        <button type="button" className="action-card" onClick={() => handleQuickAction('apply')}>
          <span className="action-title">Apply for credit card</span>
          <span className="action-sub">Start or resume your application</span>
        </button>
        <button type="button" className="action-card" onClick={() => handleQuickAction('tracking')}>
          <span className="action-title">Track application</span>
          <span className="action-sub">See your review timeline</span>
        </button>
        <button type="button" className="action-card" onClick={() => handleQuickAction('profile')}>
          <span className="action-title">View profile</span>
          <span className="action-sub">Manage your personal details</span>
        </button>
        <button
          type="button"
          className="action-card"
          onClick={() => {
            setActivePanel('apply');
          }}
        >
          <span className="action-title">Upload documents</span>
          <span className="action-sub">Add or replace verification files</span>
        </button>
        <button type="button" className="action-card" onClick={() => handleQuickAction('support')}>
          <span className="action-title">Contact support</span>
          <span className="action-sub">Get help with your application</span>
        </button>
      </div>

      <div className="section-heading">
        <h2>Recent notifications</h2>
      </div>
      <ul className="notif-list card" id="dashNotifPreview">
        {notifications.slice(0, 3).map((n, idx) => (
          <li key={n.id || idx}>
            <span className="notif-title">{n.title}</span>
            {n.body}
            <div className="notif-time">{n.time}</div>
          </li>
        ))}
      </ul>
    </section>
  );
};
