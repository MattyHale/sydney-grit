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
    // Slower wag when sick
    const interval = setInterval(() => {
      setTailWag(t => (t + 1) % 2);
    }, isSick ? 600 : 300);
    return () => clearInterval(interval);
  }, [isVisible, isSick]);

  if (!isVisible) return null;

  const dogX = playerDirection === 'right' ? playerX - 10 : playerX + 10;
  const isWeak = health < 50;

  return (
    <div 
      className="absolute bottom-[30%] transition-all duration-200"
      style={{ 
        left: `${dogX}%`, 
        transform: `translateX(-50%) ${playerDirection === 'left' ? 'scaleX(-1)' : ''}`,
        opacity: isWeak ? 0.6 : 1,
      }}
    >
      {/* Dog sprite - more visible with better contrast */}
      <div className="relative w-12 h-8">
        {/* Body - distinct color */}
        <div className={`absolute bottom-1 left-0 w-10 h-5 ${isSick ? 'bg-[#4a5a4a]' : 'bg-[#5a4a3a]'} border-2 ${isSick ? 'border-gb-dark' : 'border-[#3a2a1a]'} rounded`} />
        
        {/* Head */}
        <div className={`absolute bottom-2 right-[-2px] w-5 h-5 ${isSick ? 'bg-[#4a5a4a]' : 'bg-[#5a4a3a]'} border-2 ${isSick ? 'border-gb-dark' : 'border-[#3a2a1a]'} rounded-full`}>
          {/* Eye */}
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-gb-lightest rounded-full" />
          {/* Nose */}
          <div className="absolute bottom-1 right-0 w-1 h-1 bg-gb-darkest rounded-full" />
        </div>
        
        {/* Ears */}
        <div className={`absolute top-0 right-2 w-2 h-3 ${isSick ? 'bg-[#3a4a3a]' : 'bg-[#4a3a2a]'} rounded`} />
        
        {/* Tail - wags slower when sick */}
        <div 
          className={`absolute bottom-3 left-[-5px] w-2 h-4 ${isSick ? 'bg-[#3a4a3a]' : 'bg-[#4a3a2a]'} rounded transition-transform origin-bottom ${
            tailWag === 0 ? 'rotate-[35deg]' : 'rotate-[-25deg]'
          }`}
        />
        
        {/* Legs */}
        <div className={`absolute bottom-[-4px] left-1.5 w-2 h-3 ${isSick ? 'bg-[#3a4a3a]' : 'bg-[#4a3a2a]'} rounded-b`} />
        <div className={`absolute bottom-[-4px] left-5 w-2 h-3 ${isSick ? 'bg-[#3a4a3a]' : 'bg-[#4a3a2a]'} rounded-b`} />
        
        {/* Sick indicator */}
        {isSick && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] text-gb-light">
            ×_×
          </div>
        )}
      </div>
    </div>
  );
}
