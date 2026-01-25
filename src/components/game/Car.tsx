import { useEffect, useState } from 'react';

interface CarProps {
  x: number;
  isStopped: boolean;
  variant: number;
}

export function Car({ x, isStopped, variant }: CarProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (isStopped) return;
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 2);
    }, 200);
    return () => clearInterval(interval);
  }, [isStopped]);

  // Different car colors based on variant
  const getCarColor = () => {
    switch (variant % 3) {
      case 0: return 'bg-gb-dark';
      case 1: return 'bg-gb-darkest';
      case 2: return 'bg-gb-light';
      default: return 'bg-gb-dark';
    }
  };

  return (
    <div
      className="absolute bottom-[8%] transition-all"
      style={{
        left: `${x}%`,
        transform: 'translateX(-50%)',
        transition: isStopped ? 'left 0.5s ease-out' : 'left 0.05s linear',
      }}
    >
      {/* Car body */}
      <div className={`relative ${getCarColor()}`}>
        {/* Main body */}
        <div className="w-16 h-5 rounded-sm" />
        
        {/* Cabin */}
        <div className="absolute -top-3 left-3 w-8 h-3 bg-gb-darkest rounded-t-sm">
          {/* Windows */}
          <div className="absolute top-0.5 left-0.5 w-3 h-2 bg-gb-light opacity-60" />
          <div className="absolute top-0.5 right-0.5 w-3 h-2 bg-gb-light opacity-60" />
        </div>
        
        {/* Wheels */}
        <div 
          className="absolute -bottom-1 left-1 w-3 h-3 bg-gb-darkest rounded-full"
          style={{ transform: `rotate(${frame * 45}deg)` }}
        />
        <div 
          className="absolute -bottom-1 right-1 w-3 h-3 bg-gb-darkest rounded-full"
          style={{ transform: `rotate(${frame * 45}deg)` }}
        />
        
        {/* Headlights */}
        <div className="absolute top-1 left-0 w-1 h-1 bg-gb-lightest" />
        <div className="absolute top-2 left-0 w-1 h-1 bg-gb-lightest" />
        
        {/* Taillights */}
        <div className="absolute top-1 right-0 w-1 h-1 bg-gb-light" />
        <div className="absolute top-2 right-0 w-1 h-1 bg-gb-light" />
      </div>
    </div>
  );
}
