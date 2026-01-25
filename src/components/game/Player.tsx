import { useEffect, useState } from 'react';

interface PlayerProps {
  x: number;
  direction: 'left' | 'right';
  state: 'idle' | 'walking' | 'ducking' | 'collapsed';
  cocaineLevel?: number;
}

export function Player({ x, direction, state, cocaineLevel = 0 }: PlayerProps) {
  const [frame, setFrame] = useState(0);
  const [jitterX, setJitterX] = useState(0);
  const [jitterY, setJitterY] = useState(0);

  const isHigh = cocaineLevel > 30;
  const jitterIntensity = Math.min(2, (cocaineLevel - 30) / 35);

  useEffect(() => {
    if (state !== 'walking') return;
    const interval = setInterval(() => setFrame(f => (f + 1) % 4), isHigh ? 80 : 120);
    return () => clearInterval(interval);
  }, [state, isHigh]);

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

  const armSwing = state === 'walking' ? (frame % 2 === 0 ? 25 : -25) : 10;
  const legOffset = frame % 2 === 0;

  return (
    <div 
      className="absolute z-30"
      style={{ 
        left: `calc(${x}% + ${jitterX}px)`, 
        bottom: `calc(42% + ${jitterY}px)`,
        transform: `translateX(-50%) scaleX(${direction === 'left' ? -1 : 1})`,
      }}
    >
      {/* Shadow */}
      <div style={{
        position: 'absolute', width: '20px', height: '5px',
        background: 'rgba(0,0,0,0.3)', borderRadius: '50%',
        bottom: '0px', left: '50%', transform: 'translateX(-50%)',
      }} />
      
      {state === 'collapsed' ? (
        /* Collapsed - lying flat */
        <div style={{ position: 'relative', width: '32px', height: '12px' }}>
          <div style={{
            position: 'absolute', width: '14px', height: '8px',
            background: '#2a2a3a', borderRadius: '2px',
            left: '0', bottom: '0',
          }} />
          <div style={{
            position: 'absolute', width: '16px', height: '12px',
            background: '#ffcdb8', borderRadius: '8px',
            right: '0', bottom: '0', border: '1px solid #e8a888',
          }}>
            <div style={{ position: 'absolute', width: '3px', height: '1px', background: '#222', borderRadius: '1px', right: '4px', top: '4px' }} />
          </div>
        </div>
      ) : state === 'ducking' ? (
        /* Ducking - crouched */
        <div style={{ position: 'relative', width: '24px', height: '20px' }}>
          <div style={{
            position: 'absolute', width: '16px', height: '10px',
            background: '#2a2a3a', borderRadius: '4px',
            left: '4px', bottom: '0', border: '1px solid #1a1a2a',
          }} />
          <div style={{
            position: 'absolute', width: '20px', height: '16px',
            background: '#ffcdb8', borderRadius: '10px',
            left: '2px', top: '0', border: '1px solid #e8a888',
          }}>
            <div style={{
              position: 'absolute', width: '5px', height: '5px',
              background: '#fff', borderRadius: '50%',
              left: '4px', top: '5px', border: '1px solid #ccc',
            }}>
              <div style={{ position: 'absolute', width: '3px', height: '3px', background: '#222', borderRadius: '50%', left: '1px', top: '1px' }} />
            </div>
          </div>
        </div>
      ) : (
        /* Standing/walking - chibi businessman */
        <div style={{ position: 'relative', width: '28px', height: '36px' }}>
          
          {/* BIG HEAD */}
          <div style={{
            position: 'absolute', width: '24px', height: '20px',
            background: 'linear-gradient(180deg, #ffcdb8 0%, #f5b89d 100%)',
            borderRadius: '12px', left: '2px', top: '0',
            border: '1px solid #e8a888',
            boxShadow: isHigh ? '0 0 8px rgba(255,100,150,0.6)' : 'none',
          }}>
            {/* Hair */}
            <div style={{
              position: 'absolute', width: '18px', height: '5px',
              background: '#2a2a2a', borderRadius: '9px 9px 0 0',
              left: '3px', top: '-1px',
            }} />
            {/* Receding temples */}
            <div style={{ position: 'absolute', width: '4px', height: '4px', background: '#ffcdb8', borderRadius: '50%', left: '1px', top: '0' }} />
            <div style={{ position: 'absolute', width: '4px', height: '4px', background: '#ffcdb8', borderRadius: '50%', right: '1px', top: '0' }} />
            
            {/* Eyes */}
            <div style={{
              position: 'absolute', width: '6px', height: '6px',
              background: '#fff', borderRadius: '50%',
              left: '4px', top: '6px', border: '1px solid #ccc',
            }}>
              <div style={{
                position: 'absolute', width: isHigh ? '5px' : '3px', height: isHigh ? '5px' : '3px',
                background: '#222', borderRadius: '50%',
                left: isHigh ? '0' : '1px', top: isHigh ? '0' : '1px',
                transition: 'all 0.2s',
              }} />
              <div style={{ position: 'absolute', width: '2px', height: '2px', background: '#fff', borderRadius: '50%', left: '1px', top: '1px' }} />
            </div>
            <div style={{
              position: 'absolute', width: '6px', height: '6px',
              background: '#fff', borderRadius: '50%',
              right: '4px', top: '6px', border: '1px solid #ccc',
            }}>
              <div style={{
                position: 'absolute', width: isHigh ? '5px' : '3px', height: isHigh ? '5px' : '3px',
                background: '#222', borderRadius: '50%',
                left: isHigh ? '0' : '1px', top: isHigh ? '0' : '1px',
                transition: 'all 0.2s',
              }} />
              <div style={{ position: 'absolute', width: '2px', height: '2px', background: '#fff', borderRadius: '50%', left: '1px', top: '1px' }} />
            </div>
            
            {/* Cheeks */}
            <div style={{ position: 'absolute', width: '4px', height: '3px', background: '#ff9999', borderRadius: '50%', opacity: 0.5, left: '1px', top: '11px' }} />
            <div style={{ position: 'absolute', width: '4px', height: '3px', background: '#ff9999', borderRadius: '50%', opacity: 0.5, right: '1px', top: '11px' }} />
            
            {/* Smile */}
            <div style={{
              position: 'absolute', width: '6px', height: '3px',
              background: isHigh ? '#ff6666' : '#cc8888',
              borderRadius: '0 0 3px 3px',
              left: '9px', bottom: '2px',
            }} />
          </div>
          
          {/* BODY - suit */}
          <div style={{
            position: 'absolute', width: '14px', height: '8px',
            background: '#2a2a3a', borderRadius: '2px',
            left: '7px', top: '19px', border: '1px solid #1a1a2a',
          }}>
            {/* Collar */}
            <div style={{
              position: 'absolute', width: '6px', height: '3px',
              background: '#fff', borderRadius: '0 0 2px 2px',
              left: '4px', top: '0',
            }} />
            {/* Tie */}
            <div style={{
              position: 'absolute', width: '2px', height: '5px',
              background: '#cc3333', left: '6px', top: '2px',
            }} />
          </div>
          
          {/* ARMS */}
          <div style={{
            position: 'absolute', width: '5px', height: '8px',
            background: '#2a2a3a', borderRadius: '2px',
            left: '2px', top: '19px',
            transform: `rotate(${armSwing + (isHigh ? jitterX * 5 : 0)}deg)`,
            transformOrigin: 'top center',
          }}>
            <div style={{ position: 'absolute', width: '4px', height: '3px', background: '#ffcdb8', borderRadius: '2px', bottom: '-1px', left: '0' }} />
          </div>
          <div style={{
            position: 'absolute', width: '5px', height: '8px',
            background: '#2a2a3a', borderRadius: '2px',
            right: '2px', top: '19px',
            transform: `rotate(${-armSwing + (isHigh ? -jitterX * 5 : 0)}deg)`,
            transformOrigin: 'top center',
          }}>
            <div style={{ position: 'absolute', width: '4px', height: '3px', background: '#ffcdb8', borderRadius: '2px', bottom: '-1px', left: '0' }} />
          </div>
          
          {/* LEGS */}
          <div style={{
            position: 'absolute', width: '5px', height: '10px',
            background: '#2a2a3a', borderRadius: '0 0 2px 2px',
            left: '8px', top: '26px',
            transform: state === 'walking' 
              ? `translateY(${legOffset ? 0 : 1}px) rotate(${legOffset ? -8 : 8}deg)` 
              : 'none',
            transformOrigin: 'top center',
          }}>
            <div style={{ position: 'absolute', width: '6px', height: '2px', background: '#1a1a1a', borderRadius: '1px', bottom: '0', left: '-1px' }} />
          </div>
          <div style={{
            position: 'absolute', width: '5px', height: '10px',
            background: '#2a2a3a', borderRadius: '0 0 2px 2px',
            right: '8px', top: '26px',
            transform: state === 'walking' 
              ? `translateY(${legOffset ? 1 : 0}px) rotate(${legOffset ? 8 : -8}deg)` 
              : 'none',
            transformOrigin: 'top center',
          }}>
            <div style={{ position: 'absolute', width: '6px', height: '2px', background: '#1a1a1a', borderRadius: '1px', bottom: '0', left: '-1px' }} />
          </div>
          
          {/* Briefcase */}
          <div style={{
            position: 'absolute', width: '8px', height: '6px',
            background: '#5a4a3a', borderRadius: '1px', border: '1px solid #4a3a2a',
            right: '-4px', top: '22px',
          }}>
            <div style={{ position: 'absolute', width: '4px', height: '1px', background: '#3a2a1a', left: '2px', top: '0' }} />
          </div>
        </div>
      )}
    </div>
  );
}
