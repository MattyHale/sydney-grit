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
      className="absolute bottom-[31%]"
      style={{ 
        left: `${x}%`, 
        transform: `translateX(-50%) ${direction === 'left' ? 'scaleX(-1)' : ''}`,
      }}
    >
      {/* Police officer sprite - distinct uniform */}
      <div className="relative w-6 h-8">
        {/* Cap */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-gb-darkest rounded-t" />
        
        {/* Head */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-gb-light rounded-full border border-gb-darkest" />
        
        {/* Body - dark uniform */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-5 h-4 bg-gb-darkest border border-gb-dark rounded-sm">
          {/* Badge */}
          <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-gb-lightest" />
        </div>
        
        {/* Legs - walking animation */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div className={`w-2 h-3 bg-gb-darkest rounded-b transition-transform ${walkFrame === 0 ? 'translate-y-0' : 'translate-y-0.5'}`} />
          <div className={`w-2 h-3 bg-gb-darkest rounded-b transition-transform ${walkFrame === 1 ? 'translate-y-0' : 'translate-y-0.5'}`} />
        </div>
        
        {/* Flashlight at night */}
        <div className="absolute top-5 right-[-3px] w-1 h-2 bg-gb-light rounded" />
      </div>
    </div>
  );
}
