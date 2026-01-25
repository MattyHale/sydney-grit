import { useRef, useCallback } from 'react';
import { DesperationAction, PedestrianAction } from '@/types/game';

interface ControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onUp: () => void;
  onDown: (pressed: boolean) => void;
  onStopMove: () => void;
  onButtonA: () => void;
  onButtonB: () => void;
  onButtonC: () => void;
  desperationActions: DesperationAction[];
  carEncounterActive?: boolean;
  stealWindowActive?: boolean;
  pedestrianActions?: PedestrianAction[];
}

export function Controls({
  onLeft,
  onRight,
  onUp,
  onDown,
  onStopMove,
  onButtonA,
  onButtonB,
  onButtonC,
  desperationActions,
  carEncounterActive,
  stealWindowActive,
  pedestrianActions = [],
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

  const getButtonLabel = (button: 'A' | 'B' | 'C'): string => {
    // Pedestrian actions take priority
    if (pedestrianActions.length > 0) {
      if (button === 'A' && pedestrianActions.includes('steal')) return '🤏';
      if (button === 'B' && pedestrianActions.includes('pitch')) return '📢';
      if (button === 'C') {
        if (pedestrianActions.includes('trade')) return '💋';
        if (pedestrianActions.includes('hit')) return '👊';
      }
    }
    
    const index = button === 'A' ? 0 : button === 'B' ? 1 : 2;
    if (desperationActions[index]) {
      switch (desperationActions[index]) {
        case 'theft': return '💰';
        case 'car': return '🚗';
        case 'sell': return '📦';
        case 'dog-sacrifice': return '🐕';
        case 'buy-coke': return '❄️';
        case 'purse-steal': return '👛';
      }
    }
    return button;
  };

  // Get action text hints for display
  const getActionHints = (): string[] => {
    const hints: string[] = [];
    if (pedestrianActions.length > 0) {
      if (pedestrianActions.includes('steal')) hints.push('A:STEAL');
      if (pedestrianActions.includes('pitch')) hints.push('B:PITCH');
      if (pedestrianActions.includes('trade')) hints.push('C:TRADE');
      else if (pedestrianActions.includes('hit')) hints.push('C:HIT');
    }
    desperationActions.forEach((action, i) => {
      const btn = ['A', 'B', 'C'][i];
      if (action === 'buy-coke') hints.push(`${btn}:COKE`);
    });
    return hints;
  };

  return (
    <div className="bg-gb-darkest border-t-2 border-gb-dark px-3 sm:px-4 py-4 sm:py-3 flex justify-between items-center min-h-[140px] sm:min-h-[120px]">
      {/* D-Pad - Much bigger for mobile */}
      <div className="relative w-32 h-32 sm:w-28 sm:h-28">
        {/* Up */}
        <button
          className="absolute top-0 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-10 sm:h-10 bg-gb-dark active:bg-gb-light rounded-t-lg flex items-center justify-center touch-none select-none shadow-lg"
          onTouchStart={(e) => { e.preventDefault(); onUp(); }}
          onMouseDown={onUp}
        >
          <span className="text-gb-lightest text-base sm:text-sm">▲</span>
        </button>
        
        {/* Down */}
        <button
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-10 sm:h-10 bg-gb-dark active:bg-gb-light rounded-b-lg flex items-center justify-center touch-none select-none shadow-lg"
          onTouchStart={(e) => { e.preventDefault(); onDown(true); }}
          onTouchEnd={(e) => { e.preventDefault(); onDown(false); }}
          onMouseDown={() => onDown(true)}
          onMouseUp={() => onDown(false)}
          onMouseLeave={() => onDown(false)}
        >
          <span className="text-gb-lightest text-base sm:text-sm">▼</span>
        </button>
        
        {/* Left */}
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-10 sm:h-10 bg-gb-dark active:bg-gb-light rounded-l-lg flex items-center justify-center touch-none select-none shadow-lg"
          onTouchStart={(e) => { e.preventDefault(); startMove('left'); }}
          onTouchEnd={(e) => { e.preventDefault(); stopMove(); }}
          onMouseDown={() => startMove('left')}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
        >
          <span className="text-gb-lightest text-base sm:text-sm">◀</span>
        </button>
        
        {/* Right */}
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-10 sm:h-10 bg-gb-dark active:bg-gb-light rounded-r-lg flex items-center justify-center touch-none select-none shadow-lg"
          onTouchStart={(e) => { e.preventDefault(); startMove('right'); }}
          onTouchEnd={(e) => { e.preventDefault(); stopMove(); }}
          onMouseDown={() => startMove('right')}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
        >
          <span className="text-gb-lightest text-base sm:text-sm">▶</span>
        </button>
        
        {/* Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 bg-gb-darkest rounded" />
      </div>

      {/* Car encounter hint - shows prominently when car is stopped nearby */}
      {carEncounterActive && (
        <div className="absolute bottom-[160px] sm:bottom-[140px] left-1/2 -translate-x-1/2 flex flex-col gap-1 text-[10px] sm:text-[9px] text-gb-lightest bg-gb-darkest px-3 py-2 rounded border border-gb-light animate-pulse">
          <span>🚗 Car stopped nearby</span>
          <span>A: approach | ▼: ignore</span>
        </div>
      )}

      {/* Pedestrian action hints */}
      {pedestrianActions.length > 0 && !carEncounterActive && (
        <div className="absolute bottom-[160px] sm:bottom-[140px] left-1/2 -translate-x-1/2 flex flex-col gap-1 text-[10px] sm:text-[9px] text-gb-lightest bg-gb-darkest px-3 py-2 rounded border border-gb-light">
          <span>👤 Target nearby</span>
          <span>A:steal B:pitch C:trade/hit</span>
        </div>
      )}

      {/* Steal hint - only if no pedestrian actions */}
      {stealWindowActive && !carEncounterActive && pedestrianActions.length === 0 && (
        <div className="absolute bottom-[160px] sm:bottom-[140px] left-1/2 -translate-x-1/2 flex flex-col gap-1 text-[10px] sm:text-[9px] text-gb-lightest bg-gb-darkest px-3 py-2 rounded border border-[#ff6666] animate-pulse">
          <span>👛 Steal opportunity</span>
          <span>B or C: grab purse</span>
        </div>
      )}

      {/* Desperation hints */}
      {desperationActions.length > 0 && !carEncounterActive && !stealWindowActive && pedestrianActions.length === 0 && (
        <div className="absolute bottom-[160px] sm:bottom-[140px] left-1/2 -translate-x-1/2 flex gap-2 text-[9px] sm:text-[8px] text-gb-lightest">
          {desperationActions.map((action, i) => (
            <span key={action} className="bg-gb-dark px-2 py-1 animate-pulse rounded">
              {['A', 'B', 'C'][i]}: {action}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons - Much bigger for mobile */}
      <div className="flex gap-4 sm:gap-3">
        <button
          className="w-14 h-14 sm:w-12 sm:h-12 bg-gb-dark active:bg-gb-light rounded-full flex items-center justify-center border-3 sm:border-2 border-gb-light touch-none select-none shadow-lg"
          onTouchStart={(e) => { e.preventDefault(); onButtonC(); }}
          onMouseDown={onButtonC}
        >
          <span className="text-gb-lightest text-base sm:text-sm font-bold">{getButtonLabel('C')}</span>
        </button>
        <button
          className="w-14 h-14 sm:w-12 sm:h-12 bg-gb-dark active:bg-gb-light rounded-full flex items-center justify-center border-3 sm:border-2 border-gb-light touch-none select-none shadow-lg"
          onTouchStart={(e) => { e.preventDefault(); onButtonB(); }}
          onMouseDown={onButtonB}
        >
          <span className="text-gb-lightest text-base sm:text-sm font-bold">{getButtonLabel('B')}</span>
        </button>
        <button
          className="w-14 h-14 sm:w-12 sm:h-12 bg-gb-dark active:bg-gb-light rounded-full flex items-center justify-center border-3 sm:border-2 border-gb-light touch-none select-none shadow-lg"
          onTouchStart={(e) => { e.preventDefault(); onButtonA(); }}
          onMouseDown={onButtonA}
        >
          <span className="text-gb-lightest text-base sm:text-sm font-bold">{getButtonLabel('A')}</span>
        </button>
      </div>
    </div>
  );
}
