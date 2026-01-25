import { useRef, useCallback } from 'react';
import { DesperationAction } from '@/types/game';

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
    const index = button === 'A' ? 0 : button === 'B' ? 1 : 2;
    if (desperationActions[index]) {
      switch (desperationActions[index]) {
        case 'theft': return '💰';
        case 'car': return '🚗';
        case 'sell': return '📦';
        case 'dog-sacrifice': return '🐕';
      }
    }
    return button;
  };

  return (
    <div className="bg-gb-darkest border-t-2 border-gb-dark px-4 py-3 flex justify-between items-center">
      {/* D-Pad */}
      <div className="relative w-24 h-24">
        {/* Up */}
        <button
          className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-gb-dark active:bg-gb-light rounded-t flex items-center justify-center touch-none select-none"
          onTouchStart={(e) => { e.preventDefault(); onUp(); }}
          onMouseDown={onUp}
        >
          <span className="text-gb-lightest text-xs">▲</span>
        </button>
        
        {/* Down */}
        <button
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-gb-dark active:bg-gb-light rounded-b flex items-center justify-center touch-none select-none"
          onTouchStart={(e) => { e.preventDefault(); onDown(true); }}
          onTouchEnd={(e) => { e.preventDefault(); onDown(false); }}
          onMouseDown={() => onDown(true)}
          onMouseUp={() => onDown(false)}
          onMouseLeave={() => onDown(false)}
        >
          <span className="text-gb-lightest text-xs">▼</span>
        </button>
        
        {/* Left */}
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-gb-dark active:bg-gb-light rounded-l flex items-center justify-center touch-none select-none"
          onTouchStart={(e) => { e.preventDefault(); startMove('left'); }}
          onTouchEnd={(e) => { e.preventDefault(); stopMove(); }}
          onMouseDown={() => startMove('left')}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
        >
          <span className="text-gb-lightest text-xs">◀</span>
        </button>
        
        {/* Right */}
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-gb-dark active:bg-gb-light rounded-r flex items-center justify-center touch-none select-none"
          onTouchStart={(e) => { e.preventDefault(); startMove('right'); }}
          onTouchEnd={(e) => { e.preventDefault(); stopMove(); }}
          onMouseDown={() => startMove('right')}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
        >
          <span className="text-gb-lightest text-xs">▶</span>
        </button>
        
        {/* Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gb-darkest rounded" />
      </div>

      {/* Desperation hints */}
      {desperationActions.length > 0 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 text-[8px] text-gb-lightest">
          {desperationActions.map((action, i) => (
            <span key={action} className="bg-gb-dark px-1 py-0.5 animate-pulse">
              {['A', 'B', 'C'][i]}: {action}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          className="w-12 h-12 bg-gb-dark active:bg-gb-light rounded-full flex items-center justify-center border-2 border-gb-light touch-none select-none"
          onTouchStart={(e) => { e.preventDefault(); onButtonC(); }}
          onMouseDown={onButtonC}
        >
          <span className="text-gb-lightest text-sm font-bold">{getButtonLabel('C')}</span>
        </button>
        <button
          className="w-12 h-12 bg-gb-dark active:bg-gb-light rounded-full flex items-center justify-center border-2 border-gb-light touch-none select-none"
          onTouchStart={(e) => { e.preventDefault(); onButtonB(); }}
          onMouseDown={onButtonB}
        >
          <span className="text-gb-lightest text-sm font-bold">{getButtonLabel('B')}</span>
        </button>
        <button
          className="w-12 h-12 bg-gb-dark active:bg-gb-light rounded-full flex items-center justify-center border-2 border-gb-light touch-none select-none"
          onTouchStart={(e) => { e.preventDefault(); onButtonA(); }}
          onMouseDown={onButtonA}
        >
          <span className="text-gb-lightest text-sm font-bold">{getButtonLabel('A')}</span>
        </button>
      </div>
    </div>
  );
}
