import React from 'react';
import { useAuthStore } from '../store/useAuthStore';

export const ConfirmationPanel: React.FC = () => {
  const { application, setActivePanel } = useAuthStore();

  return (
    <section id="panel-confirmation" className="panel active">
      <div className="card confirmation-card">
        <span className="confirm-icon" aria-hidden="true">
          ✓
        </span>
        <h2>Application submitted</h2>
        <p className="confirm-sub">
          Your credit card application has been received and is now in queue for document verification.
        </p>
        <div className="confirm-grid">
          <div>
            <span className="stat-label">Application ID</span>
            <span className="stat-value mono" id="confAppId">
              {application ? application.applicationReference : 'MC-829103'}
            </span>
          </div>
          <div>
            <span className="stat-label">Submitted on</span>
            <span className="stat-value" id="confDate">
              {application ? application.submittedAt : 'Today'}
            </span>
          </div>
          <div>
            <span className="stat-label">Current status</span>
            <span className="status-pill" id="confStatus">
              Received
            </span>
          </div>
          <div>
            <span className="stat-label">Expected next step</span>
            <span className="stat-value">Document verification</span>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setActivePanel('tracking')}
        >
          Track application
        </button>
      </div>
    </section>
  );
};
