import { useEffect, useState } from 'react';

interface IbisProps {
  x: number;
  isActive: boolean;
}

export function Ibis({ x, isActive }: IbisProps) {
  const [peckFrame, setPeckFrame] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setPeckFrame(f => (f + 1) % 3);
    }, 400);
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div 
      className="absolute bottom-[33%]"
      style={{ 
        left: `${x}%`, 
        transform: 'translateX(-50%)',
      }}
    >
      {/* Ibis sprite - distinctive long beak */}
      <div className="relative w-6 h-5">
        {/* Body - white/light colored */}
        <div className="absolute bottom-1 left-0 w-4 h-3 bg-gb-lightest border border-gb-dark rounded" />
        
        {/* Head with curved beak */}
        <div className={`absolute left-3 w-2 h-2 bg-gb-lightest border border-gb-dark rounded-full transition-transform ${
          peckFrame === 1 ? 'top-1 rotate-12' : peckFrame === 2 ? 'top-2 rotate-[-10deg]' : 'top-0'
        }`}>
          {/* Long curved beak */}
          <div className="absolute top-0.5 right-[-6px] w-2 h-0.5 bg-gb-darkest rounded-r origin-left"
            style={{ transform: `rotate(${peckFrame === 1 ? '20deg' : peckFrame === 2 ? '-15deg' : '5deg'})` }}
          />
        </div>
        
        {/* Legs */}
        <div className="absolute bottom-[-2px] left-1 w-0.5 h-2 bg-gb-dark" />
        <div className="absolute bottom-[-2px] left-2.5 w-0.5 h-2 bg-gb-dark" />
        
        {/* Tail */}
        <div className="absolute bottom-1 left-[-2px] w-1.5 h-1 bg-gb-dark rounded-l" />
      </div>
    </div>
  );
}
