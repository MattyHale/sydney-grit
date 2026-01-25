import { useEffect, useState } from 'react';

interface IbisProps {
  x: number;
  isActive: boolean;
}

export function Ibis({ x, isActive }: IbisProps) {
  const [frame, setFrame] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setFrame(f => (f + 1) % 4), 300);
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  // Pecking animation
  const peckAngle = [0, 20, 35, 10][frame];
  const peckY = [0, 1, 2, 1][frame];

  return (
    <div 
      className="absolute z-15"
      style={{ 
        left: `${x}%`, 
        bottom: '72%',
        transform: 'translateX(-50%)',
      }}
    >
      {/* Shadow */}
      <div style={{
        position: 'absolute', width: '12px', height: '3px',
        background: 'rgba(0,0,0,0.2)', borderRadius: '50%',
        bottom: '0px', left: '50%', transform: 'translateX(-50%)',
      }} />
      
      {/* Ibis sprite */}
      <div style={{ position: 'relative', width: '20px', height: '16px' }}>
        
        {/* Tail feathers - black */}
        <div style={{
          position: 'absolute', width: '5px', height: '4px',
          background: '#1a1a1a', borderRadius: '0 0 0 2px',
          left: '0px', bottom: '4px',
        }} />
        
        {/* Body - white/cream */}
        <div style={{
          position: 'absolute', width: '12px', height: '8px',
          background: '#e8e8d8', borderRadius: '4px',
          left: '3px', bottom: '4px', border: '1px solid #aaa',
        }} />
        
        {/* Legs */}
        <div style={{
          position: 'absolute', width: '1px', height: '5px',
          background: '#444', left: '6px', bottom: '0px',
        }}>
          <div style={{ position: 'absolute', width: '3px', height: '1px', background: '#444', bottom: '0', left: '-1px' }} />
        </div>
        <div style={{
          position: 'absolute', width: '1px', height: '5px',
          background: '#444', left: '10px', bottom: '0px',
        }}>
          <div style={{ position: 'absolute', width: '3px', height: '1px', background: '#444', bottom: '0', left: '-1px' }} />
        </div>
        
        {/* Neck */}
        <div style={{
          position: 'absolute', width: '3px', height: '5px',
          background: '#e8e8d8', borderRadius: '1px',
          right: '4px', bottom: '10px',
          transform: `rotate(${peckAngle * 0.3}deg)`, transformOrigin: 'bottom center',
        }} />
        
        {/* Head */}
        <div style={{
          position: 'absolute', width: '6px', height: '5px',
          background: '#e8e8d8', borderRadius: '3px',
          right: '2px', top: `${peckY}px`,
          transform: `rotate(${peckAngle}deg)`, transformOrigin: 'bottom left',
        }}>
          {/* Eye */}
          <div style={{
            position: 'absolute', width: '1px', height: '1px',
            background: '#222', borderRadius: '50%',
            right: '1px', top: '1px',
          }} />
          
          {/* Long curved beak - distinctive ibis feature */}
          <div style={{
            position: 'absolute', width: '8px', height: '2px',
            background: '#1a1a1a', borderRadius: '0 4px 4px 0',
            right: '-7px', top: '2px',
            transform: 'rotate(10deg)',
          }} />
        </div>
      </div>
    </div>
  );
}
