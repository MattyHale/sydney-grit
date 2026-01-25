import { useEffect, useState } from 'react';

interface PlayerProps {
  x: number;
  direction: 'left' | 'right';
  state: 'idle' | 'walking' | 'ducking' | 'collapsed';
  cocaineLevel?: number;
}

export function Player({ x, direction, state, cocaineLevel = 0 }: PlayerProps) {
  const [walkFrame, setWalkFrame] = useState(0);
  const [jitterX, setJitterX] = useState(0);
  const [jitterY, setJitterY] = useState(0);

  const isHigh = cocaineLevel > 30;
  const jitterIntensity = Math.min(2, (cocaineLevel - 30) / 35); // 0-2px jitter

  useEffect(() => {
    if (state !== 'walking') return;
    const interval = setInterval(() => {
      setWalkFrame(f => (f + 1) % 4);
    }, isHigh ? 100 : 150); // Faster animation when high
    return () => clearInterval(interval);
  }, [state, isHigh]);

  // Jitter effect when high
  useEffect(() => {
    if (!isHigh) {
      setJitterX(0);
      setJitterY(0);
      return;
    }
    const interval = setInterval(() => {
      setJitterX((Math.random() - 0.5) * jitterIntensity * 2);
      setJitterY((Math.random() - 0.5) * jitterIntensity);
    }, 80);
    return () => clearInterval(interval);
  }, [isHigh, jitterIntensity]);

  const getHeight = () => {
    if (state === 'ducking') return 'h-6';
    if (state === 'collapsed') return 'h-4';
    return 'h-10';
  };

  return (
    <div 
      className="absolute transition-all duration-100 z-30"
      style={{ 
        left: `calc(${x}% + ${jitterX}px)`, 
        bottom: `calc(46% + ${jitterY}px)`, // Positioned on footpath layer with jitter
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
            <div 
              className="absolute top-0 left-1 w-4 h-4 bg-[#6a7a6a] rounded-full border border-[#5a6a5a]"
              style={isHigh ? { boxShadow: '0 0 4px rgba(255, 150, 200, 0.4)' } : {}}
            >
              {/* Eye - dilated when high */}
              <div 
                className="absolute top-1 right-1 rounded-full bg-[#1a2a1a]"
                style={{ 
                  width: isHigh ? '5px' : '4px', 
                  height: isHigh ? '5px' : '4px',
                  transition: 'all 0.3s'
                }}
              />
            </div>
            
            {/* Body/torso - more defined */}
            <div className="absolute top-4 left-0.5 w-5 h-4 bg-[#3a4a3a] rounded-sm border-2 border-[#2a3a2a]" />
            
            {/* Arms - more erratic when high */}
            <div 
              className="absolute top-5 left-[-2px] w-1.5 h-3 bg-[#3a4a3a] rounded origin-top transition-transform"
              style={{ 
                transform: state === 'walking' 
                  ? `rotate(${(walkFrame % 2 === 0 ? 15 : -15) + (isHigh ? jitterX * 5 : 0)}deg)` 
                  : `rotate(${isHigh ? jitterX * 3 : 0}deg)` 
              }}
            />
            <div 
              className="absolute top-5 right-[-2px] w-1.5 h-3 bg-[#3a4a3a] rounded origin-top transition-transform"
              style={{ 
                transform: state === 'walking' 
                  ? `rotate(${(walkFrame % 2 === 0 ? -15 : 15) + (isHigh ? -jitterX * 5 : 0)}deg)` 
                  : `rotate(${isHigh ? -jitterX * 3 : 0}deg)` 
              }}
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
