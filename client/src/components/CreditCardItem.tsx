import React from 'react';
import { ShieldCheck, ShieldOff, Trash2, Cpu } from 'lucide-react';
import type { Card } from '../types';

interface CreditCardItemProps {
  card: Card;
  onToggleStatus: (cardId: number, newStatus: 'Active' | 'Blocked') => void;
  onDelete: (cardId: number) => void;
}

export const CreditCardItem: React.FC<CreditCardItemProps> = ({ card, onToggleStatus, onDelete }) => {
  const isBlocked = card.cardStatus === 'Blocked';
  const isExpired = card.cardStatus === 'Expired';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 shadow-xl ${
        isBlocked
          ? 'bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/30'
          : isExpired
          ? 'bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30'
          : 'bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-indigo-500/10'
      }`}
    >
      {/* Decorative gradient orb */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-7 rounded bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-amber-300" />
          </div>
          <span className="text-xs font-mono tracking-widest text-slate-400 font-semibold">CHIP SECURE</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
              isBlocked
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : isExpired
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {card.cardStatus}
          </span>
        </div>
      </div>

      {/* Card Number */}
      <div className="my-4 font-mono text-xl tracking-[0.25em] text-slate-100 font-bold drop-shadow-sm">
        {card.maskedCardNumber}
      </div>

      {/* Details Row */}
      <div className="flex items-end justify-between mt-6 pt-4 border-t border-slate-800/80">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Card Holder</div>
          <div className="text-sm font-semibold text-white tracking-wide uppercase">{card.cardHolderName}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Expires</div>
          <div className="text-sm font-semibold text-slate-200 font-mono">
            {String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Credit Balance</div>
          <div className="text-base font-extrabold text-emerald-400 font-mono">
            ₹{card.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 flex items-center justify-end gap-2 border-t border-slate-800/50">
        {card.cardStatus !== 'Expired' && (
          <button
            onClick={() => onToggleStatus(card.id, isBlocked ? 'Active' : 'Blocked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isBlocked
                ? 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 border border-rose-500/30'
            }`}
          >
            {isBlocked ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
            {isBlocked ? 'Unblock Card' : 'Block Card'}
          </button>
        )}

        <button
          onClick={() => onDelete(card.id)}
          title="Delete Card"
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
