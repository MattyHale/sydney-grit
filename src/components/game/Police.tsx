import { useEffect, useState } from 'react';

interface PoliceProps {
  x: number;
  isActive: boolean;
  direction: 'left' | 'right';
}

export function Police({ x, isActive, direction }: PoliceProps) {
  const [walkFrame, setWalkFrame] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setWalkFrame(f => (f + 1) % 2);
    }, 200);
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div 
      className="absolute z-30"
      style={{ 
        left: `${x}%`, 
        bottom: '46%', // Footpath level
        transform: `translateX(-50%) ${direction === 'left' ? 'scaleX(-1)' : ''}`,
      }}
    >
      {/* Police officer sprite - distinct dark uniform */}
      <div className="relative w-6 h-10">
        {/* Cap */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-t"
          style={{ background: '#1a1a2a' }}
        />
        
        {/* Head */}
        <div 
          className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border"
          style={{ background: '#6a6a5a', borderColor: '#4a4a3a' }}
        />
        
        {/* Body - dark uniform */}
        <div 
          className="absolute top-4 left-1/2 -translate-x-1/2 w-5 h-4 rounded-sm border"
          style={{ background: '#1a1a2a', borderColor: '#0a0a1a' }}
        >
          {/* Badge */}
          <div className="absolute top-0.5 left-0.5 w-1 h-1" style={{ background: '#aaba8a' }} />
        </div>
        
        {/* Legs */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div 
            className="w-2 h-3 rounded-b transition-transform"
            style={{ 
              background: '#1a1a2a',
              transform: `translateY(${walkFrame === 0 ? 0 : 1}px)`,
            }}
          />
          <div 
            className="w-2 h-3 rounded-b transition-transform"
            style={{ 
              background: '#1a1a2a',
              transform: `translateY(${walkFrame === 1 ? 0 : 1}px)`,
            }}
          />
        </div>
        
        {/* Flashlight */}
        <div className="absolute top-5 right-[-2px] w-1 h-2 rounded" style={{ background: '#5a5a4a' }} />
      </div>
    </div>
  );
}
