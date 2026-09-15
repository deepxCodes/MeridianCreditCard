import React, { useEffect, useState } from 'react';
import { CreditCard, Download, Plus, RefreshCw, Search, ShieldCheck, Zap } from 'lucide-react';
import type { Card, Transaction } from '../types';
import { adminApi, cardApi, transactionApi } from '../services/api';
import { CreditCardItem } from '../components/CreditCardItem';
import { PaymentModal } from '../components/PaymentModal';
import { AddCardModal } from '../components/AddCardModal';

export const CustomerDashboard: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [fetchedCards, fetchedTxns, fetchedMerchants] = await Promise.all([
        cardApi.getCards(),
        transactionApi.getMyTransactions(),
        adminApi.getMerchants(),
      ]);
      setCards(fetchedCards);
      setTransactions(fetchedTxns);
      setMerchants(fetchedMerchants);
    } catch (err) {
      console.error('Failed to fetch customer data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (cardId: number, newStatus: 'Active' | 'Blocked') => {
    try {
      await cardApi.updateStatus(cardId, newStatus);
      fetchData();
    } catch (err) {
      alert('Failed to update card status.');
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (confirm('Are you sure you want to delete this card?')) {
      try {
        await cardApi.deleteCard(cardId);
        fetchData();
      } catch (err) {
        alert('Failed to delete card.');
      }
    }
  };

  const filteredTxns = transactions.filter(
    (t) =>
      t.transactionReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.gatewayResponse.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCreditLimit = cards.reduce((acc, c) => acc + c.availableBalance, 0);

  return (
    <div className="space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between border border-slate-800">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Active Cards</div>
            <div className="text-3xl font-extrabold text-white mt-1">{cards.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between border border-slate-800">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Available Credit</div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
              ₹{totalCreditLimit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between border border-slate-800">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Payments Made</div>
            <div className="text-3xl font-extrabold text-violet-400 mt-1">{transactions.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Cards Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Your Simulated Credit Cards</h2>
          <p className="text-xs text-slate-400">Manage card limits, toggle block/unblock, and simulate payments</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddCardOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            Add Card
          </button>

          <button
            onClick={() => setIsPaymentOpen(true)}
            disabled={cards.length === 0}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            Simulate Payment
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-dashed border-slate-800">
          <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No cards issued yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Add a test credit card to simulate gateway transactions</p>
          <button
            onClick={() => setIsAddCardOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((c) => (
            <CreditCardItem
              key={c.id}
              card={c}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteCard}
            />
          ))}
        </div>
      )}

      {/* Transactions Section */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Payment Transaction History</h3>
            <p className="text-xs text-slate-400">Complete audit log of authorized and declined transactions</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search reference or merchant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Merchant</th>
                <th className="py-3 px-4">Card Used</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-400">{t.transactionReference}</td>
                    <td className="py-3 px-4 font-medium text-white">{t.businessName}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{t.maskedCardNumber}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.transactionStatus === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {t.transactionStatus} ({t.gatewayResponse})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {new Date(t.processedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {t.transactionStatus === 'Approved' && (
                        <button
                          onClick={() => transactionApi.downloadReceipt(t.id, t.transactionReference)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 inline-flex items-center gap-1 transition-all"
                        >
                          <Download className="w-3 h-3" />
                          PDF
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

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        cards={cards}
        merchants={merchants}
        onPaymentSuccess={fetchData}
      />

      <AddCardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        onCardAdded={fetchData}
      />
    </div>
  );
};
