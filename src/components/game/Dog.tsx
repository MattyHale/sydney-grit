import { useEffect, useState } from 'react';

interface DogProps {
  playerX: number;
  playerDirection: 'left' | 'right';
  isVisible: boolean;
  health: number;
  isSick?: boolean;
}

export function Dog({ playerX, playerDirection, isVisible, health, isSick = false }: DogProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => setFrame(f => (f + 1) % 4), isSick ? 400 : 200);
    return () => clearInterval(interval);
  }, [isVisible, isSick]);

  if (!isVisible) return null;

  const dogX = playerDirection === 'right' ? playerX - 6 : playerX + 6;
  const isWeak = health < 50;

  const bodyColor = isSick ? '#7a7a6a' : '#9a7a5a';
  const darkColor = isSick ? '#5a5a4a' : '#7a5a3a';

  const tailWag = frame % 2 === 0 ? 30 : -20;
  const legPhase = frame % 2 === 0;

  return (
    <div 
      className="absolute z-25"
      style={{ 
        left: `${dogX}%`, 
        bottom: '44%',
        transform: `translateX(-50%) scaleX(${playerDirection === 'left' ? -1 : 1})`,
        opacity: isWeak ? 0.7 : 1,
      }}
    >
      {/* Shadow */}
      <div style={{
        position: 'absolute', width: '20px', height: '4px',
        background: 'rgba(0,0,0,0.2)', borderRadius: '50%',
        bottom: '0px', left: '50%', transform: 'translateX(-50%)',
      }} />
      
      {/* Dog sprite */}
      <div style={{ position: 'relative', width: '28px', height: '18px' }}>
        
        {/* Tail */}
        <div style={{
          position: 'absolute', width: '3px', height: '8px',
          background: darkColor, borderRadius: '2px',
          left: '-2px', bottom: '6px',
          transform: `rotate(${tailWag}deg)`, transformOrigin: 'bottom center',
        }} />
        
        {/* Body */}
        <div style={{
          position: 'absolute', width: '18px', height: '10px',
          background: bodyColor, borderRadius: '5px',
          left: '2px', bottom: '4px', border: `1px solid ${darkColor}`,
        }} />
        
        {/* Legs */}
        <div style={{
          position: 'absolute', width: '3px', height: '5px',
          background: darkColor, borderRadius: '0 0 1px 1px',
          left: '4px', bottom: '0px',
          transform: `translateY(${legPhase ? 0 : -1}px)`,
        }} />
        <div style={{
          position: 'absolute', width: '3px', height: '5px',
          background: darkColor, borderRadius: '0 0 1px 1px',
          left: '10px', bottom: '0px',
          transform: `translateY(${legPhase ? -1 : 0}px)`,
        }} />
        <div style={{
          position: 'absolute', width: '3px', height: '4px',
          background: darkColor, borderRadius: '0 0 1px 1px',
          right: '6px', bottom: '0px',
          transform: `translateY(${legPhase ? -1 : 0}px)`,
        }} />
        <div style={{
          position: 'absolute', width: '3px', height: '4px',
          background: darkColor, borderRadius: '0 0 1px 1px',
          right: '2px', bottom: '0px',
          transform: `translateY(${legPhase ? 0 : -1}px)`,
        }} />
        
        {/* Head */}
        <div style={{
          position: 'absolute', width: '10px', height: '10px',
          background: bodyColor, borderRadius: '5px',
          right: '0px', bottom: '6px', border: `1px solid ${darkColor}`,
        }}>
          {/* Eye */}
          <div style={{
            position: 'absolute', width: '3px', height: '3px',
            background: '#222', borderRadius: '50%',
            right: '2px', top: '2px',
          }}>
            <div style={{ position: 'absolute', width: '1px', height: '1px', background: '#fff', borderRadius: '50%', right: '0', top: '0' }} />
          </div>
          {/* Nose */}
          <div style={{
            position: 'absolute', width: '3px', height: '2px',
            background: '#222', borderRadius: '50%',
            right: '-1px', bottom: '3px',
          }} />
        </div>
        
        {/* Ear */}
        <div style={{
          position: 'absolute', width: '4px', height: '6px',
          background: darkColor, borderRadius: '2px',
          right: '4px', top: '-2px',
        }} />
        
        {/* Collar */}
        {!isSick && (
          <div style={{
            position: 'absolute', width: '6px', height: '2px',
            background: '#cc4444', borderRadius: '1px',
            right: '6px', bottom: '10px',
          }} />
        )}
        
        {/* Sick indicator */}
        {isSick && (
          <div style={{
            position: 'absolute', top: '-8px', left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '8px', color: '#6a8a4a', fontWeight: 'bold',
          }}>
            ×_×
          </div>
        )}
      </div>
    </div>
  );
}
