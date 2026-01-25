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
    }, isHigh ? 80 : 120);
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
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full opacity-40"
        style={{ background: '#0a0a0a', filter: 'blur(1px)' }}
      />
      
      {/* Sega-style chibi baby sprite */}
      <div className={`relative transition-all duration-75`}>
        {state === 'collapsed' ? (
          // Collapsed - lying flat
          <div className="relative w-14 h-6">
            {/* Body lying flat */}
            <div 
              className="absolute bottom-0 left-0 w-6 h-4 rounded"
              style={{ background: '#e8b89d' }}
            />
            {/* Big head on side */}
            <div 
              className="absolute bottom-0 right-0 w-8 h-6 rounded-full"
              style={{ background: '#ffcdb8', border: '2px solid #e8b89d' }}
            >
              {/* Closed eye */}
              <div className="absolute top-2 right-2 w-1.5 h-0.5 rounded" style={{ background: '#2a2a2a' }} />
            </div>
          </div>
        ) : state === 'ducking' ? (
          // Ducking - scrunched up ball
          <div className="relative w-10 h-8">
            {/* Curled body */}
            <div 
              className="absolute bottom-0 left-1 w-8 h-5 rounded-full"
              style={{ background: '#e8b89d' }}
            />
            {/* Big head tucked */}
            <div 
              className="absolute top-0 left-0 w-9 h-7 rounded-full"
              style={{ background: '#ffcdb8', border: '2px solid #e8b89d' }}
            >
              {/* Worried eyes */}
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full" style={{ background: '#ffffff' }}>
                <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full" style={{ background: '#2a2a2a' }} />
              </div>
            </div>
          </div>
        ) : (
          // Standing/walking - classic Sega chibi proportions
          <div className="relative w-12 h-14">
            {/* HUGE round head - Sega baby style */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-11 h-10 rounded-full"
              style={{ 
                background: 'linear-gradient(180deg, #ffcdb8 0%, #f5b89d 100%)',
                border: '2px solid #e8a888',
                boxShadow: isHigh ? '0 0 8px rgba(255, 100, 150, 0.6)' : 'none',
              }}
            >
              {/* Hair tuft on top */}
              <div 
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-3"
                style={{ 
                  background: '#4a3a2a',
                  borderRadius: '50% 50% 30% 30%',
                }}
              />
              <div 
                className="absolute -top-0.5 left-2 w-2 h-2 rotate-[-20deg]"
                style={{ background: '#4a3a2a', borderRadius: '50%' }}
              />
              <div 
                className="absolute -top-0.5 right-2 w-2 h-2 rotate-[20deg]"
                style={{ background: '#4a3a2a', borderRadius: '50%' }}
              />
              
              {/* Big round eyes - Sega style */}
              <div 
                className="absolute top-3 left-1.5 w-3 h-3 rounded-full"
                style={{ background: '#ffffff', border: '1px solid #cccccc' }}
              >
                {/* Pupil - dilated when high */}
                <div 
                  className="absolute rounded-full"
                  style={{ 
                    background: '#1a1a1a',
                    width: isHigh ? '8px' : '6px',
                    height: isHigh ? '8px' : '6px',
                    top: isHigh ? '1px' : '2px',
                    left: isHigh ? '1px' : '2px',
                    transition: 'all 0.3s',
                  }}
                />
                {/* Shine */}
                <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full" style={{ background: '#ffffff' }} />
              </div>
              <div 
                className="absolute top-3 right-1.5 w-3 h-3 rounded-full"
                style={{ background: '#ffffff', border: '1px solid #cccccc' }}
              >
                <div 
                  className="absolute rounded-full"
                  style={{ 
                    background: '#1a1a1a',
                    width: isHigh ? '8px' : '6px',
                    height: isHigh ? '8px' : '6px',
                    top: isHigh ? '1px' : '2px',
                    left: isHigh ? '1px' : '2px',
                    transition: 'all 0.3s',
                  }}
                />
                <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full" style={{ background: '#ffffff' }} />
              </div>
              
              {/* Rosy cheeks */}
              <div 
                className="absolute top-5 left-0.5 w-2 h-1.5 rounded-full opacity-60"
                style={{ background: '#ff9999' }}
              />
              <div 
                className="absolute top-5 right-0.5 w-2 h-1.5 rounded-full opacity-60"
                style={{ background: '#ff9999' }}
              />
              
              {/* Small mouth - expression changes */}
              <div 
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-1 rounded-b-full"
                style={{ background: isHigh ? '#ff6666' : '#cc8888' }}
              />
            </div>
            
            {/* Tiny body - classic chibi proportions */}
            <div 
              className="absolute top-9 left-1/2 -translate-x-1/2 w-5 h-3 rounded"
              style={{ background: '#e8b89d' }}
            />
            
            {/* Stubby arms - animated when walking/high */}
            <div 
              className="absolute top-9 left-1 w-2 h-2.5 rounded-full origin-top transition-transform"
              style={{ 
                background: '#ffcdb8',
                border: '1px solid #e8a888',
                transform: state === 'walking' 
                  ? `rotate(${(walkFrame % 2 === 0 ? 30 : -30) + (isHigh ? jitterX * 8 : 0)}deg)` 
                  : `rotate(${10 + (isHigh ? jitterX * 5 : 0)}deg)`,
              }}
            />
            <div 
              className="absolute top-9 right-1 w-2 h-2.5 rounded-full origin-top transition-transform"
              style={{ 
                background: '#ffcdb8',
                border: '1px solid #e8a888',
                transform: state === 'walking' 
                  ? `rotate(${(walkFrame % 2 === 0 ? -30 : 30) + (isHigh ? -jitterX * 8 : 0)}deg)` 
                  : `rotate(${-10 + (isHigh ? -jitterX * 5 : 0)}deg)`,
              }}
            />
            
            {/* Tiny stubby legs - rapid waddle animation */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
              <div 
                className="w-2 h-2.5 rounded-b-full transition-transform"
                style={{ 
                  background: '#ffcdb8',
                  border: '1px solid #e8a888',
                  transform: state === 'walking' 
                    ? `translateY(${walkFrame % 2 === 0 ? 0 : 2}px) rotate(${walkFrame % 2 === 0 ? -10 : 10}deg)` 
                    : 'translateY(0)',
                }}
              />
              <div 
                className="w-2 h-2.5 rounded-b-full transition-transform"
                style={{ 
                  background: '#ffcdb8',
                  border: '1px solid #e8a888',
                  transform: state === 'walking' 
                    ? `translateY(${walkFrame % 2 === 1 ? 0 : 2}px) rotate(${walkFrame % 2 === 1 ? -10 : 10}deg)` 
                    : 'translateY(0)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}