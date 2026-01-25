import { useEffect, useState } from 'react';

interface PlayerProps {
  x: number;
  direction: 'left' | 'right';
  state: 'idle' | 'walking' | 'ducking' | 'collapsed';
}

export function Player({ x, direction, state }: PlayerProps) {
  const [walkFrame, setWalkFrame] = useState(0);

  useEffect(() => {
    if (state !== 'walking') return;
    const interval = setInterval(() => {
      setWalkFrame(f => (f + 1) % 4);
    }, 150);
    return () => clearInterval(interval);
  }, [state]);

  const getHeight = () => {
    if (state === 'ducking') return 'h-6';
    if (state === 'collapsed') return 'h-4';
    return 'h-10';
  };

  return (
    <div 
      className="absolute transition-all duration-100 z-30"
      style={{ 
        left: `${x}%`, 
        bottom: '46%', // Positioned on footpath layer
        transform: `translateX(-50%) ${direction === 'left' ? 'scaleX(-1)' : ''}`,
      }}
    >
      {/* Shadow - grounds the player */}
      <div 
        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-1.5 rounded-full opacity-30"
        style={{ background: '#0a0a0a', filter: 'blur(1px)' }}
      />
      
      {/* Player sprite */}
      <div className={`relative w-6 ${getHeight()} transition-all duration-100`}>
        {state === 'collapsed' ? (
          // Collapsed/lying pose
          <div className="relative w-10 h-4">
            <div className="absolute bottom-0 left-0 w-8 h-3 bg-[#4a5a4a] rounded border border-[#3a4a3a]" />
            <div className="absolute bottom-1 right-0 w-3 h-3 bg-[#5a6a5a] rounded-full border border-[#4a5a4a]" />
          </div>
        ) : state === 'ducking' ? (
          // Ducking/huddled pose
          <div className="relative w-6 h-6">
            {/* Hunched body */}
            <div className="absolute bottom-0 left-0 w-6 h-5 bg-[#3a4a3a] rounded border border-[#2a3a2a]" />
            {/* Head tucked */}
            <div className="absolute top-0 left-1 w-4 h-4 bg-[#5a6a5a] rounded-full border border-[#4a5a4a]" />
          </div>
        ) : (
          // Standing/walking pose
          <div className="relative w-6 h-10">
            {/* Head */}
            <div className="absolute top-0 left-1 w-4 h-4 bg-[#6a7a6a] rounded-full border border-[#5a6a5a]">
              {/* Eye */}
              <div className="absolute top-1 right-1 w-1 h-1 bg-[#1a2a1a] rounded-full" />
            </div>
            
            {/* Body/torso - more defined */}
            <div className="absolute top-4 left-0.5 w-5 h-4 bg-[#3a4a3a] rounded-sm border-2 border-[#2a3a2a]" />
            
            {/* Arms */}
            <div 
              className="absolute top-5 left-[-2px] w-1.5 h-3 bg-[#3a4a3a] rounded origin-top transition-transform"
              style={{ transform: state === 'walking' ? `rotate(${walkFrame % 2 === 0 ? 15 : -15}deg)` : 'rotate(0deg)' }}
            />
            <div 
              className="absolute top-5 right-[-2px] w-1.5 h-3 bg-[#3a4a3a] rounded origin-top transition-transform"
              style={{ transform: state === 'walking' ? `rotate(${walkFrame % 2 === 0 ? -15 : 15}deg)` : 'rotate(0deg)' }}
            />
            
            {/* Legs - more prominent */}
            <div className="absolute bottom-0 left-0.5 flex gap-1">
              <div 
                className="w-2 h-3 bg-[#2a3a2a] rounded-b transition-transform origin-top"
                style={{ transform: state === 'walking' ? `translateY(${walkFrame % 2 === 0 ? 0 : 1}px)` : 'translateY(0)' }}
              />
              <div 
                className="w-2 h-3 bg-[#2a3a2a] rounded-b transition-transform origin-top"
                style={{ transform: state === 'walking' ? `translateY(${walkFrame % 2 === 1 ? 0 : 1}px)` : 'translateY(0)' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
