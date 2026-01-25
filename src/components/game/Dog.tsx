import { useEffect, useState } from 'react';

interface DogProps {
  playerX: number;
  playerDirection: 'left' | 'right';
  isVisible: boolean;
  health: number;
  isSick?: boolean;
}

export function Dog({ playerX, playerDirection, isVisible, health, isSick = false }: DogProps) {
  const [tailWag, setTailWag] = useState(0);
  const [walkFrame, setWalkFrame] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setTailWag(t => (t + 1) % 2);
      setWalkFrame(f => (f + 1) % 2);
    }, isSick ? 600 : 250);
    return () => clearInterval(interval);
  }, [isVisible, isSick]);

  if (!isVisible) return null;

  const dogX = playerDirection === 'right' ? playerX - 8 : playerX + 8;
  const isWeak = health < 50;

  // Distinct brown/tan coloring for visibility
  const bodyColor = isSick ? '#5a5a4a' : '#8a6a4a';
  const darkColor = isSick ? '#4a4a3a' : '#6a4a2a';

  return (
    <div 
      className="absolute transition-all duration-200 z-25"
      style={{ 
        left: `${dogX}%`, 
        bottom: '46%', // Same level as player on footpath
        transform: `translateX(-50%) ${playerDirection === 'left' ? 'scaleX(-1)' : ''}`,
        opacity: isWeak ? 0.7 : 1,
      }}
    >
      {/* Shadow - grounds the dog */}
      <div 
        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full opacity-30"
        style={{ background: '#0a0a0a', filter: 'blur(1px)' }}
      />
      
      {/* Dog sprite - distinct from player */}
      <div className="relative w-12 h-8">
        {/* Body - larger and more defined */}
        <div 
          className="absolute bottom-2 left-0 w-9 h-5 rounded border-2"
          style={{ background: bodyColor, borderColor: darkColor }}
        />
        
        {/* Chest/underbelly - lighter color */}
        <div 
          className="absolute bottom-2 left-2 w-4 h-3 rounded"
          style={{ background: '#aa8a6a' }}
        />
        
        {/* Head - positioned at front */}
        <div 
          className="absolute bottom-3 right-[-2px] w-5 h-5 rounded-full border-2"
          style={{ background: bodyColor, borderColor: darkColor }}
        >
          {/* Eye - expressive */}
          <div className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-[#1a1a1a] rounded-full">
            <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full" />
          </div>
          {/* Nose - black and wet */}
          <div className="absolute bottom-0.5 right-0 w-1.5 h-1.5 bg-[#1a1a1a] rounded-full" />
          {/* Snout */}
          <div className="absolute bottom-1 right-[-2px] w-2 h-2 rounded" style={{ background: '#9a7a5a' }} />
        </div>
        
        {/* Ears - floppy */}
        <div 
          className="absolute top-0 right-2 w-2 h-3 rounded"
          style={{ background: darkColor }}
        />
        
        {/* Tail - animated wag */}
        <div 
          className="absolute bottom-3 left-[-5px] w-2 h-4 rounded transition-transform origin-bottom"
          style={{ 
            background: darkColor,
            transform: `rotate(${tailWag === 0 ? 35 : -25}deg)`,
          }}
        />
        
        {/* Legs - walking animation, touching ground */}
        <div 
          className="absolute bottom-0 left-1 w-2 h-3 rounded-b"
          style={{ 
            background: darkColor,
            transform: `translateY(${walkFrame === 0 ? 0 : -1}px)`,
          }}
        />
        <div 
          className="absolute bottom-0 left-4 w-2 h-3 rounded-b"
          style={{ 
            background: darkColor,
            transform: `translateY(${walkFrame === 1 ? 0 : -1}px)`,
          }}
        />
        <div 
          className="absolute bottom-0 right-3 w-2 h-2.5 rounded-b"
          style={{ 
            background: darkColor,
            transform: `translateY(${walkFrame === 0 ? -1 : 0}px)`,
          }}
        />
        <div 
          className="absolute bottom-0 right-0.5 w-2 h-2.5 rounded-b"
          style={{ 
            background: darkColor,
            transform: `translateY(${walkFrame === 1 ? -1 : 0}px)`,
          }}
        />
        
        {/* Sick indicator - more visible */}
        {isSick && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-bold" style={{ color: '#6a8a4a' }}>
            ×_×
          </div>
        )}
        
        {/* Collar - makes it look like a companion */}
        {!isSick && (
          <div className="absolute bottom-4 right-3 w-3 h-1 rounded" style={{ background: '#aa4444' }} />
        )}
      </div>
    </div>
  );
}
