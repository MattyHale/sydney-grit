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

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setTailWag(t => (t + 1) % 2);
    }, isSick ? 600 : 300);
    return () => clearInterval(interval);
  }, [isVisible, isSick]);

  if (!isVisible) return null;

  const dogX = playerDirection === 'right' ? playerX - 8 : playerX + 8;
  const isWeak = health < 50;

  return (
    <div 
      className="absolute transition-all duration-200 z-25"
      style={{ 
        left: `${dogX}%`, 
        bottom: '46%', // Same level as player on footpath
        transform: `translateX(-50%) ${playerDirection === 'left' ? 'scaleX(-1)' : ''}`,
        opacity: isWeak ? 0.6 : 1,
      }}
    >
      {/* Dog sprite - distinct brown color */}
      <div className="relative w-10 h-6">
        {/* Body */}
        <div className={`absolute bottom-1 left-0 w-8 h-4 ${isSick ? 'bg-[#4a5a4a]' : 'bg-[#6a5a4a]'} border ${isSick ? 'border-[#3a4a3a]' : 'border-[#5a4a3a]'} rounded`} />
        
        {/* Head */}
        <div className={`absolute bottom-2 right-[-2px] w-4 h-4 ${isSick ? 'bg-[#4a5a4a]' : 'bg-[#6a5a4a]'} border ${isSick ? 'border-[#3a4a3a]' : 'border-[#5a4a3a]'} rounded-full`}>
          {/* Eye */}
          <div className="absolute top-1 right-1 w-1 h-1 bg-[#1a1a1a] rounded-full" />
          {/* Nose */}
          <div className="absolute bottom-0.5 right-0 w-1 h-1 bg-[#1a1a1a] rounded-full" />
        </div>
        
        {/* Ear */}
        <div className={`absolute top-0 right-1.5 w-1.5 h-2 ${isSick ? 'bg-[#3a4a3a]' : 'bg-[#5a4a3a]'} rounded`} />
        
        {/* Tail */}
        <div 
          className={`absolute bottom-2 left-[-4px] w-1.5 h-3 ${isSick ? 'bg-[#3a4a3a]' : 'bg-[#5a4a3a]'} rounded transition-transform origin-bottom ${
            tailWag === 0 ? 'rotate-[30deg]' : 'rotate-[-20deg]'
          }`}
        />
        
        {/* Legs */}
        <div className={`absolute bottom-[-2px] left-1 w-1.5 h-2 ${isSick ? 'bg-[#3a4a3a]' : 'bg-[#5a4a3a]'} rounded-b`} />
        <div className={`absolute bottom-[-2px] left-4 w-1.5 h-2 ${isSick ? 'bg-[#3a4a3a]' : 'bg-[#5a4a3a]'} rounded-b`} />
        
        {/* Sick indicator */}
        {isSick && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[6px]" style={{ color: '#8a8a6a' }}>
            ×_×
          </div>
        )}
      </div>
    </div>
  );
}
