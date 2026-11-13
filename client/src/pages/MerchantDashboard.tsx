import React, { useEffect, useState } from 'react';
import './MerchantDashboard.css';
import { DollarSign, Store, TrendingUp, AlertCircle, RefreshCw, Building2, Tag, Globe, FileText, MapPin } from 'lucide-react';
import type { Transaction } from '../types';
import { transactionApi, userApi } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

// ─── Merchant Registration Gate ──────────────────────────────────────────────
const MerchantRegistrationForm: React.FC = () => {
  const { updateUserProfile, showToast } = useAuthStore();
  const [form, setForm] = useState({
    businessName: '',
    businessCategory: '',
    businessAddress: '',
    gstNumber: '',
    website: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Retail & Shopping',
    'Food & Restaurants',
    'Healthcare & Pharmacy',
    'Travel & Tourism',
    'Electronics & Technology',
    'Fashion & Apparel',
    'Education & Training',
    'Automotive',
    'Real Estate',
    'Professional Services',
    'Entertainment & Media',
    'Other',
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.businessName.trim() || form.businessName.trim().length < 2)
      newErrors.businessName = 'Business name must be at least 2 characters.';
    if (!form.businessCategory)
      newErrors.businessCategory = 'Please select a business category.';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try {
      const res = await userApi.registerMerchant({
        businessName: form.businessName.trim(),
        businessCategory: form.businessCategory,
        businessAddress: form.businessAddress.trim() || undefined,
        gstNumber: form.gstNumber.trim() || undefined,
        website: form.website.trim() || undefined,
      });
      // Update the Zustand store so the UI flips to the merchant dashboard
      updateUserProfile(res.user);
      showToast('Merchant profile registered! Welcome to the Merchant Portal.');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        'Registration failed. Please try again.';
      showToast(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="merchant-gate-wrapper">
      <div className="merchant-gate-card">
        {/* Header */}
        <div className="merchant-gate-header">
          <div className="merchant-gate-icon">
            <Store size={28} />
          </div>
          <div>
            <h2 className="merchant-gate-title">Register as a Merchant</h2>
            <p className="merchant-gate-subtitle">
              Set up your business profile to start accepting payments through Meridian Credit.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="merchant-gate-form" noValidate>
          {/* Business Name */}
          <div className="form-group">
            <label htmlFor="businessName" className="form-label">
              <Building2 size={14} style={{ display: 'inline', marginRight: 4 }} />
              Business Name <span className="required-star">*</span>
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              className={`form-control ${errors.businessName ? 'input-error' : ''}`}
              placeholder="e.g. Sharma Electronics"
              value={form.businessName}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.businessName && <div className="field-error">{errors.businessName}</div>}
          </div>

          {/* Business Category */}
          <div className="form-group">
            <label htmlFor="businessCategory" className="form-label">
              <Tag size={14} style={{ display: 'inline', marginRight: 4 }} />
              Business Category <span className="required-star">*</span>
            </label>
            <select
              id="businessCategory"
              name="businessCategory"
              className={`form-control ${errors.businessCategory ? 'input-error' : ''}`}
              value={form.businessCategory}
              onChange={handleChange}
              disabled={submitting}
            >
              <option value="">— Select a category —</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.businessCategory && <div className="field-error">{errors.businessCategory}</div>}
          </div>

          {/* Business Address */}
          <div className="form-group">
            <label htmlFor="businessAddress" className="form-label">
              <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />
              Business Address
            </label>
            <input
              id="businessAddress"
              name="businessAddress"
              type="text"
              className="form-control"
              placeholder="e.g. 45 MG Road, Bengaluru, Karnataka"
              value={form.businessAddress}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          {/* GST Number */}
          <div className="form-group">
            <label htmlFor="gstNumber" className="form-label">
              <FileText size={14} style={{ display: 'inline', marginRight: 4 }} />
              GST Number
            </label>
            <input
              id="gstNumber"
              name="gstNumber"
              type="text"
              className="form-control"
              placeholder="e.g. 27AABCU9603R1ZM"
              value={form.gstNumber}
              onChange={handleChange}
              disabled={submitting}
              maxLength={15}
            />
          </div>

          {/* Website */}
          <div className="form-group">
            <label htmlFor="website" className="form-label">
              <Globe size={14} style={{ display: 'inline', marginRight: 4 }} />
              Website URL
            </label>
            <input
              id="website"
              name="website"
              type="url"
              className="form-control"
              placeholder="e.g. https://your-business.com"
              value={form.website}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            id="btnRegisterMerchant"
            disabled={submitting}
          >
            {submitting ? 'Registering…' : 'Register Business & Access Merchant Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Main Merchant Dashboard ─────────────────────────────────────────────────
export const MerchantDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Gate: if no merchant profile exists yet, show registration form
  if (!user?.merchantProfile) {
    return <MerchantRegistrationForm />;
  }

  const fetchMerchantTxns = async () => {
    setLoading(true);
    try {
      const data = await transactionApi.getMerchantTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch merchant transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantTxns();
  }, []);

  const totalRevenue = transactions
    .filter((t) => t.transactionStatus === 'Approved')
    .reduce((acc, t) => acc + t.amount, 0);

  const approvedCount = transactions.filter((t) => t.transactionStatus === 'Approved').length;
  const declinedCount = transactions.filter((t) => t.transactionStatus === 'Declined').length;

  return (
    <div className="merchant-shell">
      {/* Merchant Header Card */}
      <div className="merchant-header-card">
        <div className="merchant-header-left">
          <div className="merchant-icon-badge">
            <Store size={26} />
          </div>
          <div>
            <h2 className="merchant-title">
              {user?.merchantProfile?.businessName || (user?.fullName ? `${user.fullName}'s Merchant Account` : 'Merchant Business Account')}
            </h2>
            <div className="merchant-subtitle">
              <span>Category: <strong className="merchant-tag">{user?.merchantProfile?.businessCategory || 'General Retail'}</strong></span>
              <span>•</span>
              <span>GST: <span className="merchant-gst">{user?.merchantProfile?.gstNumber || '—'}</span></span>
            </div>
          </div>
        </div>

        <div className="merchant-header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchMerchantTxns}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing…' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="merchant-grid-stats">
        <div className="merchant-stat-card">
          <div className="merchant-stat-top">
            <span className="stat-label">Total Sales Revenue</span>
            <div className="merchant-stat-icon revenue">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="merchant-stat-value revenue-val">
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="merchant-stat-hint">Processed via Meridian Credit Gateway</div>
        </div>

        <div className="merchant-stat-card">
          <div className="merchant-stat-top">
            <span className="stat-label">Successful Payments</span>
            <div className="merchant-stat-icon approved">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="merchant-stat-value">{approvedCount}</div>
          <div className="merchant-stat-hint">
            <span className="status-pill status-success" style={{ fontSize: '11px', padding: '2px 8px' }}>
              Approved
            </span>
          </div>
        </div>

        <div className="merchant-stat-card">
          <div className="merchant-stat-top">
            <span className="stat-label">Declined / Failed</span>
            <div className="merchant-stat-icon declined">
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="merchant-stat-value">{declinedCount}</div>
          <div className="merchant-stat-hint">
            <span className="status-pill status-danger" style={{ fontSize: '11px', padding: '2px 8px' }}>
              Declined by Rules
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="merchant-table-card">
        <div className="merchant-table-header">
          <div>
            <h3 className="merchant-table-title">Received Customer Payments</h3>
            <p className="merchant-table-subtitle">Live log of settlement transactions received by your merchant account</p>
          </div>
        </div>

        <div className="merchant-table-responsive">
          <table className="merchant-data-table">
            <thead>
              <tr>
                <th>Txn Reference</th>
                <th>Customer Name</th>
                <th>Card Used</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="merchant-empty-row">
                    {loading ? 'Fetching transactions...' : 'No merchant payment transactions received yet.'}
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="merchant-ref">{t.transactionReference}</td>
                    <td><strong>{t.customerName}</strong></td>
                    <td className="merchant-date">{t.maskedCardNumber}</td>
                    <td className="merchant-amount">₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          t.transactionStatus === 'Approved'
                            ? 'status-success'
                            : 'status-danger'
                        }`}
                      >
                        {t.transactionStatus}
                      </span>
                    </td>
                    <td className="merchant-date">
                      {new Date(t.processedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
