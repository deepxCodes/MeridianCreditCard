import React, { useState } from 'react';
import { CreditCard, X } from 'lucide-react';
import { cardApi } from '../services/api';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardAdded: () => void;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onCardAdded }) => {
  const [cardHolderName, setCardHolderName] = useState('JOHN DOE');
  const [cardNumber, setCardNumber] = useState('4111222233334444');
  const [expiryMonth, setExpiryMonth] = useState(12);
  const [expiryYear, setExpiryYear] = useState(2028);
  const [cvv, setCvv] = useState('123');
  const [balance, setBalance] = useState('100000');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await cardApi.addCard({
        cardHolderName,
        cardNumber,
        expiryMonth: Number(expiryMonth),
        expiryYear: Number(expiryYear),
        cvv,
        initialSimulatedBalance: parseFloat(balance),
      });

      onCardAdded();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to add card.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-6 shadow-2xl relative">
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
            <h2 className="text-lg font-bold text-white">Add Simulated Credit Card</h2>
            <p className="text-xs text-slate-400">Create new card for testing</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl mb-4 bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Card Holder Name</label>
            <input
              type="text"
              required
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">16-Digit Card Number</label>
            <input
              type="text"
              required
              maxLength={19}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Exp Month</label>
              <input
                type="number"
                min={1}
                max={12}
                required
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Exp Year</label>
              <input
                type="number"
                min={2025}
                max={2040}
                required
                value={expiryYear}
                onChange={(e) => setExpiryYear(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CVV</label>
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Credit Limit (₹ INR)</label>
            <input
              type="number"
              step="1000"
              required
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Card...' : 'Save & Issue Card'}
          </button>
        </form>
      </div>
    </div>
  );
};
