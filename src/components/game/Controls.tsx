import { useRef, useCallback } from 'react';

interface ControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onUp: () => void;
  onDown: (pressed: boolean) => void;
  onStopMove: () => void;
  onSteal: () => void;
  onPitch: () => void;
  onBuyDrugs: () => void;
  onSellDrugs: () => void;
  canSteal: boolean;
  canPitch: boolean;
  canBuyDrugs: boolean;
  canSellDrugs: boolean;
  // Zone info
  currentZone: string | null;
  // Dog state for eat dog action
  hasDog: boolean;
}

export function Controls({
  onLeft,
  onRight,
  onUp,
  onDown,
  onStopMove,
  onSteal,
  onPitch,
  onBuyDrugs,
  onSellDrugs,
  canSteal,
  canPitch,
  canBuyDrugs,
  canSellDrugs,
  currentZone,
  hasDog,
}: ControlsProps) {
  const moveIntervalRef = useRef<number | null>(null);

  const startMove = useCallback((direction: 'left' | 'right') => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
    }
    const moveFunc = direction === 'left' ? onLeft : onRight;
    moveFunc();
    moveIntervalRef.current = window.setInterval(moveFunc, 50);
  }, [onLeft, onRight]);

  const stopMove = useCallback(() => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
    onStopMove();
  }, [onStopMove]);

  // Zone label for UP button hint - all zones are now enterable
  const getZoneHint = () => {
    if (!currentZone) return null;
    
    // Special case: Sell Dog at food vendors
    if (currentZone === 'food-vendor' && hasDog) {
      return '🐕 Sell Dog';
    }
    
    const labels: Record<string, string> = {
      'ask-help': 'Talk',
      'bins': 'Search',
      'services': 'Enter',
      'shelter': 'Enter',
      'sleep': 'Rest',
      'alley': 'Enter',
      'food-vendor': 'Enter',
      'shop': 'Enter',
      'bar': 'Enter',
      'club': 'Enter',
      'arcade': 'Enter',
      'pawn': 'Enter',
    };
    return labels[currentZone] || 'Enter';
  };

  const zoneHint = getZoneHint();

  return (
    <div className="bg-gb-darkest border-t-2 border-gb-dark px-2 sm:px-3 py-3 sm:py-2 flex justify-between items-center min-h-[130px] sm:min-h-[110px]">
      {/* D-Pad */}
      <div className="relative w-28 h-28 sm:w-24 sm:h-24">
        {/* Up - Shows zone hint when available */}
        <button
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-9 sm:h-9 rounded-t-lg flex flex-col items-center justify-center touch-none select-none shadow-lg ${
            zoneHint ? 'bg-gb-light' : 'bg-gb-dark'
          } active:bg-gb-light`}
          onTouchStart={(e) => { e.preventDefault(); onUp(); }}
          onMouseDown={onUp}
        >
          <span className="text-gb-lightest text-sm sm:text-xs">▲</span>
          {zoneHint && (
            <span className="text-[6px] text-gb-darkest font-bold -mt-0.5">{zoneHint}</span>
          )}
        </button>
        
        {/* Down */}
        <button
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-9 sm:h-9 bg-gb-dark active:bg-gb-light rounded-b-lg flex items-center justify-center touch-none select-none shadow-lg"
          onTouchStart={(e) => { e.preventDefault(); onDown(true); }}
          onTouchEnd={(e) => { e.preventDefault(); onDown(false); }}
          onMouseDown={() => onDown(true)}
          onMouseUp={() => onDown(false)}
          onMouseLeave={() => onDown(false)}
        >
          <span className="text-gb-lightest text-sm sm:text-xs">▼</span>
        </button>
        
        {/* Left */}
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-9 sm:h-9 bg-gb-dark active:bg-gb-light rounded-l-lg flex items-center justify-center touch-none select-none shadow-lg"
          onTouchStart={(e) => { e.preventDefault(); startMove('left'); }}
          onTouchEnd={(e) => { e.preventDefault(); stopMove(); }}
          onMouseDown={() => startMove('left')}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
        >
          <span className="text-gb-lightest text-sm sm:text-xs">◀</span>
        </button>
        
        {/* Right */}
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-9 sm:h-9 bg-gb-dark active:bg-gb-light rounded-r-lg flex items-center justify-center touch-none select-none shadow-lg"
          onTouchStart={(e) => { e.preventDefault(); startMove('right'); }}
          onTouchEnd={(e) => { e.preventDefault(); stopMove(); }}
          onMouseDown={() => startMove('right')}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
        >
          <span className="text-gb-lightest text-sm sm:text-xs">▶</span>
        </button>
        
        {/* Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 sm:w-7 sm:h-7 bg-gb-darkest rounded" />
      </div>

      {/* 4 Fixed Action Buttons in 2x2 grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-1.5">
        {/* STEAL */}
        <button
          className={`w-16 h-12 sm:w-14 sm:h-10 rounded-lg flex flex-col items-center justify-center touch-none select-none shadow-lg border-2 transition-all ${
            canSteal 
              ? 'bg-gb-light border-gb-lightest animate-pulse' 
              : 'bg-gb-dark border-gb-dark opacity-50'
          } active:bg-gb-light`}
          onTouchStart={(e) => { e.preventDefault(); onSteal(); }}
          onMouseDown={onSteal}
          disabled={!canSteal}
        >
          <span className="text-lg sm:text-base">🤏</span>
          <span className="text-[7px] sm:text-[6px] text-gb-lightest font-bold">STEAL</span>
        </button>

        {/* PITCH */}
        <button
          className={`w-16 h-12 sm:w-14 sm:h-10 rounded-lg flex flex-col items-center justify-center touch-none select-none shadow-lg border-2 transition-all ${
            canPitch 
              ? 'bg-gb-light border-gb-lightest animate-pulse' 
              : 'bg-gb-dark border-gb-dark opacity-50'
          } active:bg-gb-light`}
          onTouchStart={(e) => { e.preventDefault(); onPitch(); }}
          onMouseDown={onPitch}
          disabled={!canPitch}
        >
          <span className="text-lg sm:text-base">📢</span>
          <span className="text-[7px] sm:text-[6px] text-gb-lightest font-bold">PITCH</span>
        </button>

        {/* BUY DRUGS */}
        <button
          className={`w-16 h-12 sm:w-14 sm:h-10 rounded-lg flex flex-col items-center justify-center touch-none select-none shadow-lg border-2 transition-all ${
            canBuyDrugs 
              ? 'bg-gb-light border-gb-lightest animate-pulse' 
              : 'bg-gb-dark border-gb-dark opacity-50'
          } active:bg-gb-light`}
          onTouchStart={(e) => { e.preventDefault(); onBuyDrugs(); }}
          onMouseDown={onBuyDrugs}
          disabled={!canBuyDrugs}
        >
          <span className="text-lg sm:text-base">💊</span>
          <span className="text-[7px] sm:text-[6px] text-gb-lightest font-bold">BUY</span>
        </button>

        {/* SELL DRUGS */}
        <button
          className={`w-16 h-12 sm:w-14 sm:h-10 rounded-lg flex flex-col items-center justify-center touch-none select-none shadow-lg border-2 transition-all ${
            canSellDrugs 
              ? 'bg-gb-light border-gb-lightest animate-pulse' 
              : 'bg-gb-dark border-gb-dark opacity-50'
          } active:bg-gb-light`}
          onTouchStart={(e) => { e.preventDefault(); onSellDrugs(); }}
          onMouseDown={onSellDrugs}
          disabled={!canSellDrugs}
        >
          <span className="text-lg sm:text-base">💰</span>
          <span className="text-[7px] sm:text-[6px] text-gb-lightest font-bold">SELL</span>
        </button>
      </div>
    </div>
  );
}
