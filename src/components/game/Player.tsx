import { useEffect, useState } from 'react';

interface PlayerProps {
  x: number;
  direction: 'left' | 'right';
  state: 'idle' | 'walking' | 'ducking' | 'collapsed';
}

export function Player({ x, direction, state }: PlayerProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (state === 'walking') {
      const interval = setInterval(() => {
        setFrame(f => (f + 1) % 4);
      }, 150);
      return () => clearInterval(interval);
    } else {
      setFrame(0);
    }
  }, [state]);

  const baseClasses = "absolute bottom-[30%] transition-all duration-75";
  
  if (state === 'collapsed') {
    return (
      <div 
        className={baseClasses}
        style={{ 
          left: `${x}%`, 
          transform: `translateX(-50%) ${direction === 'left' ? 'scaleX(-1)' : ''}` 
        }}
      >
        {/* Collapsed sprite - lying down */}
        <div className="relative w-12 h-4">
          <div className="absolute bottom-0 left-0 w-12 h-3 bg-gb-darkest border-2 border-gb-dark" />
          <div className="absolute bottom-1 right-0 w-4 h-4 bg-gb-light rounded-full border-2 border-gb-dark" />
        </div>
      </div>
    );
  }

  if (state === 'ducking') {
    return (
      <div 
        className={baseClasses}
        style={{ 
          left: `${x}%`, 
          transform: `translateX(-50%) ${direction === 'left' ? 'scaleX(-1)' : ''}` 
        }}
      >
        {/* Ducking sprite */}
        <div className="relative w-10 h-8">
          <div className="absolute bottom-0 left-1 w-8 h-5 bg-gb-darkest border-2 border-gb-dark rounded-t" />
          <div className="absolute top-0 left-2 w-6 h-4 bg-gb-light rounded-full border-2 border-gb-dark" />
        </div>
      </div>
    );
  }

  // Walking or idle
  const walkOffset = state === 'walking' ? [0, -2, 0, -2][frame] : 0;
  const legFrame = state === 'walking' ? frame % 2 : 0;

  return (
    <div 
      className={baseClasses}
      style={{ 
        left: `${x}%`, 
        transform: `translateX(-50%) ${direction === 'left' ? 'scaleX(-1)' : ''}`,
      }}
    >
      {/* Full character sprite - larger for visibility */}
      <div className="relative w-10 h-16" style={{ transform: `translateY(${walkOffset}px)` }}>
        {/* Head */}
        <div className="absolute top-0 left-1.5 w-7 h-5 bg-gb-light rounded-full border-2 border-gb-dark" />
        {/* Hair */}
        <div className="absolute top-0 left-2 w-6 h-2 bg-gb-darkest rounded-t" />
        {/* Eyes */}
        <div className="absolute top-2 left-3 w-1 h-1 bg-gb-darkest" />
        
        {/* Body / Jacket */}
        <div className="absolute top-5 left-0 w-10 h-6 bg-gb-darkest border-2 border-gb-dark rounded-t" />
        
        {/* Arms */}
        <div 
          className={`absolute top-6 left-[-4px] w-2 h-5 bg-gb-darkest border border-gb-dark rounded transition-transform origin-top ${
            state === 'walking' && frame % 2 === 0 ? 'rotate-[20deg]' : 'rotate-[-10deg]'
          }`} 
        />
        <div 
          className={`absolute top-6 right-[-4px] w-2 h-5 bg-gb-darkest border border-gb-dark rounded transition-transform origin-top ${
            state === 'walking' && frame % 2 === 1 ? 'rotate-[-20deg]' : 'rotate-[10deg]'
          }`} 
        />
        
        {/* Pants */}
        <div className="absolute top-11 left-1 w-8 h-2 bg-gb-dark border border-gb-darkest" />
        
        {/* Legs */}
        <div 
          className={`absolute top-[52px] left-2 w-2.5 h-4 bg-gb-dark border border-gb-darkest transition-transform origin-top ${
            legFrame === 0 ? 'rotate-[15deg]' : 'rotate-[-15deg]'
          }`}
        />
        <div 
          className={`absolute top-[52px] right-2 w-2.5 h-4 bg-gb-dark border border-gb-darkest transition-transform origin-top ${
            legFrame === 1 ? 'rotate-[15deg]' : 'rotate-[-15deg]'
          }`}
        />
      </div>
    </div>
  );
}
