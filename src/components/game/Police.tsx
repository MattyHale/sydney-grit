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
    }, 180);
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
      {/* Shadow */}
      <div 
        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-1 rounded-full opacity-25"
        style={{ background: '#0a0a0a', filter: 'blur(1px)' }}
      />
      
      {/* Police officer sprite - very distinct dark blue uniform */}
      <div className="relative w-8 h-12">
        {/* Cap - distinctive police cap with badge */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-2 rounded-t"
          style={{ background: '#1a1a3a' }}
        >
          {/* Cap badge */}
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1" style={{ background: '#aabb66' }} />
        </div>
        
        {/* Head */}
        <div 
          className="absolute top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border"
          style={{ background: '#7a7a6a', borderColor: '#5a5a4a' }}
        />
        
        {/* Body - dark navy uniform */}
        <div 
          className="absolute top-5 left-1/2 -translate-x-1/2 w-6 h-5 rounded-sm border-2"
          style={{ background: '#1a1a3a', borderColor: '#0a0a2a' }}
        >
          {/* Badge */}
          <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded" style={{ background: '#aabb88' }} />
          {/* Buttons */}
          <div className="absolute top-1 right-1 w-0.5 h-3 flex flex-col gap-0.5">
            <div className="w-0.5 h-0.5 rounded-full" style={{ background: '#3a3a5a' }} />
            <div className="w-0.5 h-0.5 rounded-full" style={{ background: '#3a3a5a' }} />
          </div>
        </div>
        
        {/* Belt */}
        <div className="absolute top-9 left-1/2 -translate-x-1/2 w-6 h-1" style={{ background: '#2a2a2a' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1" style={{ background: '#8a8a4a' }} />
        </div>
        
        {/* Legs - dark trousers */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div 
            className="w-2.5 h-4 rounded-b transition-transform"
            style={{ 
              background: '#1a1a2a',
              transform: `translateY(${walkFrame === 0 ? 0 : 1}px)`,
            }}
          />
          <div 
            className="w-2.5 h-4 rounded-b transition-transform"
            style={{ 
              background: '#1a1a2a',
              transform: `translateY(${walkFrame === 1 ? 0 : 1}px)`,
            }}
          />
        </div>
        
        {/* Flashlight */}
        <div className="absolute top-6 right-[-3px] w-1.5 h-2.5 rounded" style={{ background: '#4a4a4a' }}>
          <div className="absolute top-0 w-1 h-0.5 rounded" style={{ background: '#ffff88' }} />
        </div>
        
        {/* Radio on shoulder */}
        <div className="absolute top-5 left-[-1px] w-1 h-2" style={{ background: '#2a2a2a' }} />
      </div>
    </div>
  );
}
