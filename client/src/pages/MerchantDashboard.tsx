import React, { useEffect, useState } from 'react';
import { DollarSign, Store, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import type { Transaction } from '../types';
import { transactionApi } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export const MerchantDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

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
              <span>GST: <span className="merchant-gst">{user?.merchantProfile?.gstNumber || '27AABCU9603R1ZM'}</span></span>
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
                <th>Date & Time</th>
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
