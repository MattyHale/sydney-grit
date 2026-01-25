import { useEffect, useState } from 'react';

interface DogProps {
  playerX: number;
  playerDirection: 'left' | 'right';
  isVisible: boolean;
  health: number;
}

export function Dog({ playerX, playerDirection, isVisible, health }: DogProps) {
  const [tailWag, setTailWag] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setTailWag(t => (t + 1) % 2);
    }, 300);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const dogX = playerDirection === 'right' ? playerX - 8 : playerX + 8;
  const isSick = health < 50;

  return (
    <div 
      className="absolute bottom-[30%] transition-all duration-200"
      style={{ 
        left: `${dogX}%`, 
        transform: `translateX(-50%) ${playerDirection === 'left' ? 'scaleX(-1)' : ''}`,
        opacity: isSick ? 0.6 : 1,
      }}
    >
      {/* Dog sprite - larger for visibility */}
      <div className="relative w-10 h-6">
        {/* Body */}
        <div className={`absolute bottom-0 left-0 w-8 h-4 ${isSick ? 'bg-gb-dark' : 'bg-gb-darkest'} border-2 border-gb-dark rounded`} />
        
        {/* Head */}
        <div className={`absolute bottom-1 right-[-2px] w-4 h-4 ${isSick ? 'bg-gb-dark' : 'bg-gb-darkest'} border-2 border-gb-dark rounded-full`} />
        
        {/* Ear */}
        <div className="absolute top-0 right-1 w-1.5 h-2 bg-gb-darkest rounded" />
        
        {/* Tail */}
        <div 
          className={`absolute bottom-2 left-[-4px] w-1.5 h-3 bg-gb-darkest rounded transition-transform origin-bottom ${
            tailWag === 0 ? 'rotate-[30deg]' : 'rotate-[-20deg]'
          }`}
        />
        
        {/* Legs */}
        <div className="absolute bottom-[-3px] left-1 w-1.5 h-2 bg-gb-darkest rounded-b" />
        <div className="absolute bottom-[-3px] left-4 w-1.5 h-2 bg-gb-darkest rounded-b" />
        
        {/* Eye */}
        <div className="absolute bottom-2 right-1 w-1 h-1 bg-gb-light rounded-full" />
      </div>
    </div>
  );
}
