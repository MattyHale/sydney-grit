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
      setPeckFrame(f => (f + 1) % 4);
    }, 350);
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  // Pecking animation - more pronounced
  const getPeckTransform = () => {
    switch (peckFrame) {
      case 0: return { headY: 0, headRotate: 0, beakRotate: 5 };
      case 1: return { headY: 2, headRotate: 25, beakRotate: -10 }; // Pecking down
      case 2: return { headY: 3, headRotate: 35, beakRotate: -15 }; // Deep peck
      case 3: return { headY: 1, headRotate: 10, beakRotate: 0 }; // Coming up
    }
    return { headY: 0, headRotate: 0, beakRotate: 5 };
  };

  const peck = getPeckTransform();

  return (
    <div 
      className="absolute z-15"
      style={{ 
        left: `${x}%`, 
        bottom: '72%', // Foreground layer - near bins
        transform: 'translateX(-50%)',
      }}
    >
      {/* Shadow - grounds the ibis */}
      <div 
        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full opacity-30"
        style={{ background: '#0a0a0a', filter: 'blur(1px)' }}
      />
      
      {/* Ibis sprite - distinctive white bird with long curved beak */}
      <div className="relative w-7 h-6">
        {/* Body - white/cream colored */}
        <div 
          className="absolute bottom-1 left-0 w-5 h-3 rounded border"
          style={{ background: '#d8d8c8', borderColor: '#9a9a8a' }}
        />
        
        {/* Tail feathers - black tips */}
        <div 
          className="absolute bottom-1 left-[-3px] w-2 h-2 rounded-l"
          style={{ background: '#1a1a1a' }}
        />
        
        {/* Neck */}
        <div 
          className="absolute left-3 w-1 h-2 origin-bottom transition-all"
          style={{ 
            background: '#d8d8c8',
            bottom: '10px',
            transform: `rotate(${peck.headRotate * 0.5}deg)`,
          }}
        />
        
        {/* Head with distinctive long curved beak */}
        <div 
          className="absolute w-3 h-2.5 rounded-full border transition-all"
          style={{ 
            background: '#d8d8c8', 
            borderColor: '#9a9a8a',
            left: '12px',
            top: `${peck.headY}px`,
            transform: `rotate(${peck.headRotate}deg)`,
            transformOrigin: 'bottom left',
          }}
        >
          {/* Eye - small and dark */}
          <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 rounded-full" style={{ background: '#1a1a1a' }} />
          
          {/* Long curved beak - black, distinctive ibis feature */}
          <div 
            className="absolute top-1 right-[-6px] w-3 h-1 rounded-r origin-left transition-transform"
            style={{ 
              background: '#1a1a1a',
              transform: `rotate(${peck.beakRotate}deg) scaleY(0.7)`,
              borderRadius: '0 2px 4px 0',
            }}
          />
        </div>
        
        {/* Legs - thin and dark */}
        <div className="absolute bottom-0 left-1 w-0.5 h-2" style={{ background: '#3a3a3a' }} />
        <div className="absolute bottom-0 left-3 w-0.5 h-2" style={{ background: '#3a3a3a' }} />
        
        {/* Feet touching ground */}
        <div className="absolute bottom-0 left-0.5 w-1 h-0.5 rounded" style={{ background: '#3a3a3a' }} />
        <div className="absolute bottom-0 left-2.5 w-1 h-0.5 rounded" style={{ background: '#3a3a3a' }} />
      </div>
    </div>
  );
}
