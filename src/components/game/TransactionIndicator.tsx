import { useEffect, useState } from 'react';
import { TransactionFeedback } from '@/types/game';

interface TransactionIndicatorProps {
  transaction: TransactionFeedback | null;
  onClear: () => void;
}

const ICONS: Record<string, string> = {
  money: '💵',
  steal: '🤏',
  drugs: '💊',
  hope: '✨',
  fail: '❌',
  danger: '⚠️',
};

const COLORS: Record<string, string> = {
  money: 'text-green-400',
  steal: 'text-yellow-400',
  drugs: 'text-purple-400',
  hope: 'text-cyan-400',
  fail: 'text-red-400',
  danger: 'text-red-500',
};

const BG_COLORS: Record<string, string> = {
  money: 'bg-green-900/80',
  steal: 'bg-yellow-900/80',
  drugs: 'bg-purple-900/80',
  hope: 'bg-cyan-900/80',
  fail: 'bg-red-900/80',
  danger: 'bg-red-900/80',
};

export function TransactionIndicator({ transaction, onClear }: TransactionIndicatorProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (transaction) {
      setVisible(true);
      setAnimating(true);
      
      // Auto-hide after 1.5s
      const hideTimer = setTimeout(() => {
        setAnimating(false);
      }, 1200);
      
      const clearTimer = setTimeout(() => {
        setVisible(false);
        onClear();
      }, 1500);
      
      return () => {
        clearTimeout(hideTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [transaction, onClear]);

  if (!visible || !transaction) return null;

  const icon = ICONS[transaction.type] || '•';
  const colorClass = COLORS[transaction.type] || 'text-gb-lightest';
  const bgClass = BG_COLORS[transaction.type] || 'bg-gb-darkest/80';

  return (
    <div 
      className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none
        px-4 py-2 rounded-lg border-2 border-gb-light shadow-lg
        ${bgClass}
        transition-all duration-300
        ${animating ? 'opacity-100 scale-110' : 'opacity-0 scale-90'}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        {transaction.amount && (
          <span className={`text-lg font-bold ${colorClass}`}>
            {transaction.amount}
          </span>
        )}
      </div>
    </div>
  );
}
