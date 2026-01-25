import { useEffect, useState } from 'react';

interface PoliceProps {
  x: number;
  isActive: boolean;
  direction: 'left' | 'right';
}

export function Police({ x, isActive, direction }: PoliceProps) {
  const [frame, setFrame] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setFrame(f => (f + 1) % 4), 160);
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const legOffset = frame % 2 === 0;
  const armSwing = frame % 2 === 0 ? 20 : -20;
  const bob = frame % 2 === 0 ? 0 : -1;

  return (
    <div 
      className="absolute z-30"
      style={{ 
        left: `${x}%`, 
        bottom: '42%',
        transform: `translateX(-50%) scaleX(${direction === 'left' ? -1 : 1})`,
      }}
    >
      {/* Shadow */}
      <div style={{
        position: 'absolute', width: '18px', height: '4px',
        background: 'rgba(0,0,0,0.25)', borderRadius: '50%',
        bottom: '0px', left: '50%', transform: 'translateX(-50%)',
      }} />
      
      {/* Pig cop character */}
      <div style={{ position: 'relative', width: '26px', height: '36px', transform: `translateY(${bob}px)` }}>
        
        {/* HEAD - pig with cop hat */}
        <div style={{
          position: 'absolute', width: '20px', height: '16px',
          background: '#ffcccc', borderRadius: '10px',
          left: '3px', top: '0px', border: '1px solid #eebb99',
        }}>
          {/* Pig ears */}
          <div style={{
            position: 'absolute', width: '6px', height: '7px',
            background: '#ffbbbb', borderRadius: '3px 3px 0 0',
            left: '-2px', top: '-3px', transform: 'rotate(-15deg)',
          }} />
          <div style={{
            position: 'absolute', width: '6px', height: '7px',
            background: '#ffbbbb', borderRadius: '3px 3px 0 0',
            right: '-2px', top: '-3px', transform: 'rotate(15deg)',
          }} />
          
          {/* Cop hat */}
          <div style={{
            position: 'absolute', width: '18px', height: '5px',
            background: '#1a3a5a', borderRadius: '2px 2px 0 0',
            left: '1px', top: '-5px',
          }}>
            <div style={{ position: 'absolute', width: '5px', height: '3px', background: '#ccaa44', left: '6px', top: '1px' }} />
          </div>
          
          {/* Eyes */}
          <div style={{ position: 'absolute', width: '4px', height: '4px', background: '#222', borderRadius: '50%', left: '4px', top: '4px' }} />
          <div style={{ position: 'absolute', width: '4px', height: '4px', background: '#222', borderRadius: '50%', right: '4px', top: '4px' }} />
          
          {/* Snout */}
          <div style={{
            position: 'absolute', width: '10px', height: '6px',
            background: '#ffaaaa', borderRadius: '5px',
            left: '5px', bottom: '1px',
          }}>
            <div style={{ position: 'absolute', width: '2px', height: '2px', background: '#885555', borderRadius: '50%', left: '2px', top: '2px' }} />
            <div style={{ position: 'absolute', width: '2px', height: '2px', background: '#885555', borderRadius: '50%', right: '2px', top: '2px' }} />
          </div>
        </div>
        
        {/* BODY - navy uniform */}
        <div style={{
          position: 'absolute', width: '14px', height: '10px',
          background: '#1a3a5a', borderRadius: '2px',
          left: '6px', top: '15px', border: '1px solid #0a2a4a',
        }}>
          {/* Badge */}
          <div style={{ position: 'absolute', width: '4px', height: '4px', background: '#ccaa44', left: '2px', top: '2px' }} />
        </div>
        
        {/* ARMS - uniformed */}
        <div style={{
          position: 'absolute', width: '5px', height: '8px',
          background: '#1a3a5a', borderRadius: '2px',
          left: '1px', top: '15px',
          transform: `rotate(${armSwing}deg)`, transformOrigin: 'top center',
        }}>
          <div style={{ position: 'absolute', width: '4px', height: '3px', background: '#ffcccc', borderRadius: '2px', bottom: '-1px', left: '0' }} />
        </div>
        <div style={{
          position: 'absolute', width: '5px', height: '8px',
          background: '#1a3a5a', borderRadius: '2px',
          right: '1px', top: '15px',
          transform: `rotate(${-armSwing}deg)`, transformOrigin: 'top center',
        }}>
          <div style={{ position: 'absolute', width: '4px', height: '3px', background: '#ffcccc', borderRadius: '2px', bottom: '-1px', left: '0' }} />
        </div>
        
        {/* Belt */}
        <div style={{
          position: 'absolute', width: '14px', height: '2px',
          background: '#222', left: '6px', top: '24px',
        }}>
          <div style={{ position: 'absolute', width: '3px', height: '2px', background: '#888844', left: '5px' }} />
        </div>
        
        {/* LEGS - dark trousers */}
        <div style={{
          position: 'absolute', width: '5px', height: '10px',
          background: '#1a2a3a', borderRadius: '0 0 2px 2px',
          left: '7px', top: '25px',
          transform: `rotate(${legOffset ? 12 : -12}deg)`, transformOrigin: 'top center',
        }}>
          <div style={{ position: 'absolute', width: '6px', height: '3px', background: '#1a1a1a', borderRadius: '1px', bottom: '0', left: '-1px' }} />
        </div>
        <div style={{
          position: 'absolute', width: '5px', height: '10px',
          background: '#1a2a3a', borderRadius: '0 0 2px 2px',
          right: '7px', top: '25px',
          transform: `rotate(${legOffset ? -12 : 12}deg)`, transformOrigin: 'top center',
        }}>
          <div style={{ position: 'absolute', width: '6px', height: '3px', background: '#1a1a1a', borderRadius: '1px', bottom: '0', left: '-1px' }} />
        </div>
        
        {/* Radio on shoulder */}
        <div style={{
          position: 'absolute', width: '3px', height: '4px',
          background: '#222', borderRadius: '1px',
          left: '3px', top: '15px',
        }} />
      </div>
    </div>
  );
}
