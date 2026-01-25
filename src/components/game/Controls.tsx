import { useRef, useCallback } from 'react';
import { ResolvedButtons } from '@/types/game';

interface ControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onUp: () => void;
  onDown: (pressed: boolean) => void;
  onStopMove: () => void;
  onButtonA: () => void;
  onButtonB: () => void;
  onButtonC: () => void;
  resolvedButtons: ResolvedButtons;
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
  resolvedButtons,
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

  // Determine which hint to show based on resolved button states
  const getActiveHint = () => {
    const { A, B, C } = resolvedButtons;
    
    // Car encounter takes priority
    if (A.type === 'car-encounter') {
      return {
        show: true,
        icon: '🚗',
        title: 'Car stopped nearby',
        hint: 'A: approach | ▼: ignore',
        borderClass: 'border-gb-light',
        pulse: true,
      };
    }
    
    // Dealer nearby
    if (A.type === 'dealer') {
      return {
        show: true,
        icon: '💊',
        title: 'Dealer nearby',
        hint: 'A: buy drugs',
        borderClass: 'border-[#44ff44]',
        pulse: true,
      };
    }
    
    // LSD available
    if (A.type === 'lsd') {
      return {
        show: true,
        icon: '🌈',
        title: 'LSD available',
        hint: 'A: take acid',
        borderClass: 'border-[#ff44ff]',
        pulse: true,
      };
    }
    
    // Pedestrian actions
    if (A.type === 'pedestrian' || B.type === 'pedestrian' || C.type === 'pedestrian') {
      const actions: string[] = [];
      if (A.type === 'pedestrian') actions.push(`A:${A.action}`);
      if (B.type === 'pedestrian') actions.push(`B:${B.action}`);
      if (C.type === 'pedestrian') actions.push(`C:${C.action}`);
      return {
        show: true,
        icon: '👤',
        title: 'Target nearby',
        hint: actions.join(' '),
        borderClass: 'border-gb-light',
        pulse: false,
      };
    }
    
    // Steal window
    if (B.type === 'steal' || C.type === 'steal') {
      return {
        show: true,
        icon: '👛',
        title: 'Steal opportunity',
        hint: 'B or C: grab purse',
        borderClass: 'border-[#ff6666]',
        pulse: true,
      };
    }
    
    // Desperation actions
    if (A.type === 'desperation' || B.type === 'desperation' || C.type === 'desperation') {
      return {
        show: true,
        type: 'desperation',
        actions: [
          A.type === 'desperation' ? { key: 'A', action: A.action } : null,
          B.type === 'desperation' ? { key: 'B', action: B.action } : null,
          C.type === 'desperation' ? { key: 'C', action: C.action } : null,
        ].filter(Boolean) as { key: string; action: string }[],
      };
    }
    
    return { show: false };
  };

  const hint = getActiveHint();

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

      {/* Contextual hints */}
      {hint.show && hint.type !== 'desperation' && (
        <div className={`absolute bottom-[160px] sm:bottom-[140px] left-1/2 -translate-x-1/2 flex flex-col gap-1 text-[10px] sm:text-[9px] text-gb-lightest bg-gb-darkest px-3 py-2 rounded border ${hint.borderClass} ${hint.pulse ? 'animate-pulse' : ''}`}>
          <span>{hint.icon} {hint.title}</span>
          <span>{hint.hint}</span>
        </div>
      )}

      {/* Desperation hints */}
      {hint.show && hint.type === 'desperation' && (
        <div className="absolute bottom-[160px] sm:bottom-[140px] left-1/2 -translate-x-1/2 flex gap-2 text-[9px] sm:text-[8px] text-gb-lightest">
          {hint.actions?.map(({ key, action }) => (
            <span key={key} className="bg-gb-dark px-2 py-1 animate-pulse rounded">
              {key}: {action}
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
          <span className="text-gb-lightest text-base sm:text-sm font-bold">
            {resolvedButtons.C.label || 'C'}
          </span>
        </button>
        <button
          className="w-14 h-14 sm:w-12 sm:h-12 bg-gb-dark active:bg-gb-light rounded-full flex items-center justify-center border-3 sm:border-2 border-gb-light touch-none select-none shadow-lg"
          onTouchStart={(e) => { e.preventDefault(); onButtonB(); }}
          onMouseDown={onButtonB}
        >
          <span className="text-gb-lightest text-base sm:text-sm font-bold">
            {resolvedButtons.B.label || 'B'}
          </span>
        </button>
        <button
          className="w-14 h-14 sm:w-12 sm:h-12 bg-gb-dark active:bg-gb-light rounded-full flex items-center justify-center border-3 sm:border-2 border-gb-light touch-none select-none shadow-lg"
          onTouchStart={(e) => { e.preventDefault(); onButtonA(); }}
          onMouseDown={onButtonA}
        >
          <span className="text-gb-lightest text-base sm:text-sm font-bold">
            {resolvedButtons.A.label || 'A'}
          </span>
        </button>
      </div>
    </div>
  );
}
