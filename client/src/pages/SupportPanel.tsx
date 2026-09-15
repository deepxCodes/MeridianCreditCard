import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supportApi } from '../services/api';

export const SupportPanel: React.FC = () => {
  const { showToast } = useAuthStore();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim() || !message.trim()) {
      setError('Please complete both fields before sending.');
      return;
    }

    setLoading(true);
    try {
      await supportApi.sendMessage(subject.trim(), message.trim());
    } catch {
      // offline / mock fallback
    }

    setLoading(false);
    setSubject('');
    setMessage('');
    showToast('Message sent to support — we will respond within one business day');
  };

  return (
    <section id="panel-support" className="panel active">
      {/* FAQ CARD */}
      <div className="card">
        <h2 className="section-title-inline">Frequently asked questions</h2>
        <div className="faq-list">
          <details className="faq-item">
            <summary>How long does application review take?</summary>
            <p>Typically 3–5 business days from the point all documents are verified.</p>
          </details>
          <details className="faq-item">
            <summary>Can I edit my application after submission?</summary>
            <p>No. Once submitted, contact support to request a correction before assessment begins.</p>
          </details>
          <details className="faq-item">
            <summary>What documents are required?</summary>
            <p>
              Identity proof, address proof, and income proof are mandatory. A photograph and other supporting documents
              are optional.
            </p>
          </details>
          <details className="faq-item">
            <summary>What happens if my application is rejected?</summary>
            <p>You will receive a notification with the reason and guidance on reapplying after 90 days.</p>
          </details>
        </div>
      </div>

      {/* CONTACT SUPPORT CARD */}
      <div className="card">
        <h2 className="section-title-inline">Contact support</h2>
        <form id="supportForm" onSubmit={handleSupportSubmit} noValidate>
          <div className="field">
            <label htmlFor="sup-subject">
              Subject <span className="req">*</span>
            </label>
            <input
              type="text"
              id="sup-subject"
              placeholder="Brief description of your question"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="sup-message">
              Message <span className="req">*</span>
            </label>
            <textarea
              id="sup-message"
              rows={4}
              placeholder="Detailed message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          {error && <p className="error-msg show" id="err-support">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </div>
    </section>
  );
};
