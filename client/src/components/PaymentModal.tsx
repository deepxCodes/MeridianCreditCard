import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, CreditCard, Lock, XCircle, X } from 'lucide-react';
import type { Card, ProcessPaymentResponse } from '../types';
import { paymentApi } from '../services/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  merchants: any[];
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  cards,
  merchants,
  onPaymentSuccess,
}) => {
  const [selectedMerchantId, setSelectedMerchantId] = useState<number>(merchants[0]?.id || 1);
  const [selectedCardId, setSelectedCardId] = useState<number>(cards[0]?.id || 0);
  const [amount, setAmount] = useState<string>('2500');
  const [cvv, setCvv] = useState<string>('123');

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessPaymentResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const response = await paymentApi.processPayment({
        customerId: cards.find((c) => c.id === selectedCardId)?.userId || 1,
        merchantId: Number(selectedMerchantId),
        cardId: Number(selectedCardId),
        amount: parseFloat(amount),
        cvv,
      });

      setResult(response);
      if (response.status === 'Approved') {
        onPaymentSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Payment simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Simulated Payment Gateway</h2>
            <p className="text-xs text-slate-400">Process test payment transaction</p>
          </div>
        </div>

        {/* Result Alert Box */}
        {result && (
          <div
            className={`p-4 rounded-xl mb-6 border ${
              result.status === 'Approved'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.status === 'Approved' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="text-sm font-bold">
                  Payment Status: {result.status} ({result.gatewayResponse})
                </div>
                <div className="text-xs mt-1 font-mono text-slate-300">Ref: {result.transactionReference}</div>
                {result.failureReason && (
                  <div className="text-xs mt-1 font-medium text-rose-300">Reason: {result.failureReason}</div>
                )}
                {result.isFraudFlagged && (
                  <div className="mt-2 p-2 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Fraud Engine Alert: Flagged severity <strong>{result.fraudSeverity}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl mb-6 bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Merchant Store</label>
            <select
              value={selectedMerchantId}
              onChange={(e) => setSelectedMerchantId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.businessName} ({m.businessCategory})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Customer Card</label>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.maskedCardNumber} - {c.cardHolderName} (₹{c.availableBalance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (₹ INR)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CVV Code</label>
              <input
                type="password"
                maxLength={4}
                required
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cards.length === 0}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-bold text-white text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            {loading ? 'Processing Transaction...' : 'Authorise & Process Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};
