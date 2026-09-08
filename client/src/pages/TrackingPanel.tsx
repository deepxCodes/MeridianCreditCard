import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { applicationApi } from '../services/api';

export const TrackingPanel: React.FC = () => {
  const { application, setApplication, addNotification, showToast } = useAuthStore();
  const [advancing, setAdvancing] = useState(false);

  const stageLabels = [
    'Application submitted',
    'Documents verified',
    'Credit assessment',
    'Application review',
    'Approved / Rejected',
    'Card issued',
  ];

  const currentStage = application ? application.currentStage : 1;
  const isRejected = application ? application.isRejected : false;

  const bannerMap: Record<number, string> = {
    1: 'Your application has been received and is queued for document verification.',
    2: 'All submitted documents have been verified successfully.',
    3: 'Our team is assessing your creditworthiness based on the information provided.',
    4: 'Your application is undergoing final review by our credit committee.',
    5: isRejected
      ? 'Your application was not approved at this time.'
      : 'Congratulations — your application has been approved.',
    6: 'Your card has been issued and will arrive within 5–7 business days.',
  };

  const handleAdvanceStage = async () => {
    if (!application) {
      showToast('No active application found. Please submit an application first.');
      return;
    }
    if (isRejected && currentStage === 5) return;
    if (currentStage >= 6) return;

    setAdvancing(true);
    try {
      const updated = await applicationApi.advanceStage();
      setApplication(updated);

      const stageName = stageLabels[updated.currentStage - 1];
      if (updated.currentStage === 5 && updated.isRejected) {
        addNotification(
          'Application update',
          `Application ${application.applicationReference} was not approved. See tracking for details.`
        );
      } else {
        addNotification(
          'Application update',
          `Application ${application.applicationReference} has moved to: ${stageName}.`
        );
      }
    } catch {
      // Offline / client simulation
      let nextStage = currentStage + 1;
      let reject = false;

      if (currentStage === 4) {
        reject = Math.random() < 0.15;
      }

      const updatedApp = {
        ...application,
        currentStage: nextStage,
        isRejected: reject,
        rejectionReason: reject ? 'Credit assessment score threshold not met.' : undefined,
        lastStageUpdatedAt: new Date().toISOString(),
      };

      setApplication(updatedApp);

      const stageName = stageLabels[nextStage - 1];
      if (nextStage === 5 && reject) {
        addNotification(
          'Application update',
          `Application ${application.applicationReference} was not approved. See tracking for details.`
        );
      } else {
        addNotification(
          'Application update',
          `Application ${application.applicationReference} has moved to: ${stageName}.`
        );
      }
    }
    setAdvancing(false);
    showToast('Stage updated');
  };

  const isButtonDisabled =
    !application ||
    currentStage >= 6 ||
    (isRejected && currentStage === 5) ||
    advancing;

  const buttonText = !application
    ? 'No application'
    : currentStage >= 6
    ? 'Application complete'
    : isRejected && currentStage === 5
    ? 'Application closed'
    : advancing
    ? 'Updating…'
    : 'Simulate next stage';

  return (
    <section id="panel-tracking" className="panel active">
      {/* HEADER CARD */}
      <div className="card">
        <div className="tracking-head">
          <div>
            <span className="stat-label">Application ID</span>
            <span className="stat-value mono" id="trackAppId">
              {application ? application.applicationReference : '—'}
            </span>
          </div>
          <div>
            <span className="stat-label">Applicant</span>
            <span className="stat-value" id="trackName">
              {application ? application.fullName : '—'}
            </span>
          </div>
          <div>
            <span className="stat-label">Card type</span>
            <span className="stat-value" id="trackCard">
              {application ? `${application.cardChoice} Card` : '—'}
            </span>
          </div>
          <div>
            <span className="stat-label">Submitted on</span>
            <span className="stat-value" id="trackDate">
              {application ? application.submittedAt : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* TIMELINE CARD */}
      <div className="card">
        <h2 className="section-title-inline">Review timeline</h2>
        <ol className="timeline" id="timeline">
          {stageLabels.map((label, idx) => {
            const stageNum = idx + 1;
            let itemClass = 'timeline-item';
            if (application) {
              if (stageNum < currentStage) {
                itemClass += ' is-done';
              } else if (stageNum === currentStage) {
                if (isRejected && stageNum === 5) {
                  itemClass += ' is-rejected';
                } else {
                  itemClass += ' is-current';
                }
              }
            }

            return (
              <li key={stageNum} className={itemClass} data-stage={stageNum}>
                <span className="timeline-dot"></span>
                <span className="timeline-label">
                  {stageNum === 5 && isRejected ? 'Application not approved' : label}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="form-nav">
          <button
            type="button"
            className="btn btn-secondary"
            id="btnAdvanceStage"
            onClick={handleAdvanceStage}
            disabled={isButtonDisabled}
          >
            {buttonText}
          </button>
        </div>
      </div>

      {/* STAGE ACTION BANNER */}
      {application && (
        <div
          className={`banner ${isRejected && currentStage === 5 ? 'banner-error' : 'banner-info'}`}
          id="trackActionBanner"
        >
          {bannerMap[currentStage]}
        </div>
      )}

      {/* ISSUED CARD VISUAL */}
      {application && currentStage === 6 && !isRejected && (
        <div className="card" id="cardIssuedCard">
          <h2 className="section-title-inline">Your card</h2>
          <div className="credit-card-visual">
            <span className="cc-bank">Meridian Credit</span>
            <span className="cc-chip" aria-hidden="true"></span>
            <span className="cc-number" id="ccNumber">
              {application.issuedCard?.maskedCardNumber || '•••• •••• •••• 4821'}
            </span>
            <span className="cc-holder" id="ccHolder">
              {(application.fullName || 'CARDHOLDER').toUpperCase()}
            </span>
            <span className="cc-type" id="ccType">
              {(application.cardChoice || 'CLASSIC').toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
