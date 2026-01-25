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
  const jitterIntensity = Math.min(2, (cocaineLevel - 30) / 35);

  useEffect(() => {
    if (state !== 'walking') return;
    const interval = setInterval(() => {
      setWalkFrame(f => (f + 1) % 4);
    }, isHigh ? 100 : 150);
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
    if (state === 'ducking') return 'h-7';
    if (state === 'collapsed') return 'h-5';
    return 'h-12';
  };

  return (
    <div 
      className="absolute transition-all duration-100 z-30"
      style={{ 
        left: `calc(${x}% + ${jitterX}px)`, 
        bottom: `calc(46% + ${jitterY}px)`,
        transform: `translateX(-50%) ${direction === 'left' ? 'scaleX(-1)' : ''}`,
      }}
    >
      {/* Shadow - grounds the player */}
      <div 
        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1.5 rounded-full opacity-30"
        style={{ background: '#0a0a0a', filter: 'blur(1px)' }}
      />
      
      {/* Player sprite - street worker aesthetic */}
      <div className={`relative w-8 ${getHeight()} transition-all duration-100`}>
        {state === 'collapsed' ? (
          // Collapsed/lying pose
          <div className="relative w-12 h-5">
            <div className="absolute bottom-0 left-0 w-10 h-4 bg-[#6a2a4a] rounded border border-[#5a2a3a]" />
            <div className="absolute bottom-1.5 right-0 w-4 h-4 bg-[#7a6a6a] rounded-full border border-[#5a5a5a]" />
            {/* Big hair even when collapsed */}
            <div className="absolute bottom-2 right-[-2px] w-5 h-3 rounded-t" style={{ background: '#4a2a2a' }} />
          </div>
        ) : state === 'ducking' ? (
          // Ducking/huddled pose
          <div className="relative w-8 h-7">
            {/* Hunched body - mini skirt visible */}
            <div className="absolute bottom-2 left-0 w-8 h-4 bg-[#6a2a4a] rounded border border-[#5a2a3a]" />
            {/* Head tucked with big hair */}
            <div className="absolute top-0 left-1 w-5 h-5 bg-[#7a6a6a] rounded-full border border-[#5a5a5a]">
              {/* Big styled hair */}
              <div className="absolute -top-1 -left-1 right-[-4px] h-4 rounded-t" style={{ background: '#4a2a2a' }} />
              <div className="absolute top-0 -left-1.5 w-2 h-3 rounded" style={{ background: '#4a2a2a' }} />
            </div>
            {/* Heels even when ducking */}
            <div className="absolute -bottom-0.5 left-1 w-1.5 h-2" style={{ background: '#cc3333' }} />
            <div className="absolute -bottom-0.5 right-1 w-1.5 h-2" style={{ background: '#cc3333' }} />
          </div>
        ) : (
          // Standing/walking pose - full street worker look
          <div className="relative w-8 h-12">
            {/* Big 80s/90s styled hair */}
            <div 
              className="absolute -top-1 left-0 right-[-2px] h-5 rounded-t"
              style={{ background: '#4a2a2a', zIndex: 1 }}
            />
            <div 
              className="absolute top-1 -left-1.5 w-2.5 h-4 rounded"
              style={{ background: '#4a2a2a', zIndex: 1 }}
            />
            <div 
              className="absolute top-1 right-[-3px] w-2.5 h-4 rounded"
              style={{ background: '#4a2a2a', zIndex: 1 }}
            />
            
            {/* Head */}
            <div 
              className="absolute top-1 left-1 w-5 h-5 bg-[#7a6a6a] rounded-full border border-[#5a5a5a]"
              style={isHigh ? { boxShadow: '0 0 6px rgba(255, 100, 150, 0.5)' } : {}}
            >
              {/* Makeup - red lips */}
              <div 
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-0.5 rounded"
                style={{ background: '#cc4455' }}
              />
              {/* Eye - dilated when high */}
              <div 
                className="absolute top-1.5 right-1.5 rounded-full bg-[#1a2a1a]"
                style={{ 
                  width: isHigh ? '5px' : '4px', 
                  height: isHigh ? '5px' : '4px',
                  transition: 'all 0.3s'
                }}
              />
              {/* Eyeshadow */}
              <div 
                className="absolute top-1 right-1 w-2 h-1 rounded-t"
                style={{ background: '#6a4a7a55' }}
              />
            </div>
            
            {/* Neck */}
            <div className="absolute top-[22px] left-[10px] w-2 h-1" style={{ background: '#7a6a6a' }} />
            
            {/* Body/torso - low-cut top */}
            <div 
              className="absolute top-[23px] left-1 w-6 h-5 rounded-t border-2"
              style={{ 
                background: '#6a2a4a',
                borderColor: '#5a2a3a',
              }}
            >
              {/* Neckline */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-2 rounded-b" style={{ background: '#7a6a6a' }} />
            </div>
            
            {/* Mini skirt */}
            <div 
              className="absolute top-[38px] left-0 w-8 h-4 rounded-b"
              style={{ 
                background: '#6a2a4a',
                borderLeft: '2px solid #5a2a3a',
                borderRight: '2px solid #5a2a3a',
                borderBottom: '2px solid #5a2a3a',
              }}
            />
            
            {/* Arms - more movement when walking/high */}
            <div 
              className="absolute top-[24px] left-[-2px] w-1.5 h-4 bg-[#7a6a6a] rounded origin-top transition-transform"
              style={{ 
                transform: state === 'walking' 
                  ? `rotate(${(walkFrame % 2 === 0 ? 20 : -20) + (isHigh ? jitterX * 6 : 0)}deg)` 
                  : `rotate(${5 + (isHigh ? jitterX * 4 : 0)}deg)` 
              }}
            />
            <div 
              className="absolute top-[24px] right-[-2px] w-1.5 h-4 bg-[#7a6a6a] rounded origin-top transition-transform"
              style={{ 
                transform: state === 'walking' 
                  ? `rotate(${(walkFrame % 2 === 0 ? -20 : 20) + (isHigh ? -jitterX * 6 : 0)}deg)` 
                  : `rotate(${-5 + (isHigh ? -jitterX * 4 : 0)}deg)` 
              }}
            />
            
            {/* Legs - with fishnets */}
            <div className="absolute bottom-2 left-1.5 flex gap-1">
              <div 
                className="w-2 h-4 bg-[#5a4a4a] rounded-b transition-transform origin-top relative"
                style={{ transform: state === 'walking' ? `translateY(${walkFrame % 2 === 0 ? 0 : 1}px)` : 'translateY(0)' }}
              >
                {/* Fishnet pattern */}
                <div className="absolute top-1 left-0 right-0 h-px" style={{ background: '#1a1a1a55' }} />
                <div className="absolute top-2.5 left-0 right-0 h-px" style={{ background: '#1a1a1a55' }} />
              </div>
              <div 
                className="w-2 h-4 bg-[#5a4a4a] rounded-b transition-transform origin-top relative"
                style={{ transform: state === 'walking' ? `translateY(${walkFrame % 2 === 1 ? 0 : 1}px)` : 'translateY(0)' }}
              >
                {/* Fishnet pattern */}
                <div className="absolute top-1 left-0 right-0 h-px" style={{ background: '#1a1a1a55' }} />
                <div className="absolute top-2.5 left-0 right-0 h-px" style={{ background: '#1a1a1a55' }} />
              </div>
            </div>
            
            {/* Red stiletto heels */}
            <div className="absolute -bottom-0.5 left-1.5 w-2 h-2.5" style={{ background: '#cc3333' }}>
              <div className="absolute bottom-0 right-0 w-0.5 h-1.5" style={{ background: '#aa2222' }} />
            </div>
            <div className="absolute -bottom-0.5 right-1.5 w-2 h-2.5" style={{ background: '#cc3333' }}>
              <div className="absolute bottom-0 right-0 w-0.5 h-1.5" style={{ background: '#aa2222' }} />
            </div>
            
            {/* Small purse accessory */}
            <div 
              className="absolute top-[30px] -right-3 w-3 h-3 rounded"
              style={{ background: '#5a2a3a', border: '1px solid #7a4a5a' }}
            >
              <div className="absolute -top-2 left-0.5 w-2 h-2 rounded-t" style={{ background: '#7a4a5a' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}