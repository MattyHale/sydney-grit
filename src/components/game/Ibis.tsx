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
      className="absolute z-15"
      style={{ 
        left: `${x}%`, 
        bottom: '74%', // Foreground layer
        transform: 'translateX(-50%)',
      }}
    >
      {/* Ibis sprite - white bird with long curved beak */}
      <div className="relative w-5 h-4">
        {/* Body */}
        <div 
          className="absolute bottom-1 left-0 w-3 h-2 rounded border"
          style={{ background: '#9a9a8a', borderColor: '#6a6a5a' }}
        />
        
        {/* Head with curved beak */}
        <div 
          className={`absolute left-2 w-2 h-2 rounded-full border transition-transform ${
            peckFrame === 1 ? 'top-0.5 rotate-12' : peckFrame === 2 ? 'top-1 rotate-[-10deg]' : 'top-0'
          }`}
          style={{ background: '#9a9a8a', borderColor: '#6a6a5a' }}
        >
          {/* Beak */}
          <div 
            className="absolute top-0.5 right-[-4px] w-1.5 h-0.5 rounded-r origin-left"
            style={{ 
              background: '#3a3a3a',
              transform: `rotate(${peckFrame === 1 ? '20deg' : peckFrame === 2 ? '-15deg' : '5deg'})`,
            }}
          />
        </div>
        
        {/* Legs */}
        <div className="absolute bottom-[-1px] left-0.5 w-0.5 h-1.5" style={{ background: '#5a5a4a' }} />
        <div className="absolute bottom-[-1px] left-2 w-0.5 h-1.5" style={{ background: '#5a5a4a' }} />
      </div>
    </div>
  );
}
