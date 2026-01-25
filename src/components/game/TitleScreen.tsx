import { useEffect, useState } from 'react';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen = ({ onStart }: TitleScreenProps) => {
  const [blinkVisible, setBlinkVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Blinking "Press Start" effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkVisible(prev => !prev);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Handle any key press or click to start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasInteracted) {
        setHasInteracted(true);
        onStart();
      }
    };

    const handleClick = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        onStart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleClick);
    };
  }, [hasInteracted, onStart]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gb-darkest relative overflow-hidden">
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />
      
      {/* CRT glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-gb-light/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-4 text-center">
        {/* Game title */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-gb-medium text-[8px] sm:text-[10px] tracking-widest">
            SYDNEY 1991
          </p>
          <h1 className="text-gb-lightest text-3xl sm:text-4xl md:text-5xl tracking-wider gb-glow font-bold">
            THE FOUNDER
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-gb-light text-[10px] sm:text-xs tracking-wide italic">
          "Bootstrap or Die"
        </p>

        {/* Decorative divider */}
        <div className="flex items-center gap-2 my-1">
          <div className="w-6 h-0.5 bg-gb-medium" />
          <div className="text-gb-light text-[8px]">💼</div>
          <div className="w-6 h-0.5 bg-gb-medium" />
        </div>

        {/* Story intro */}
        <div className="flex flex-col gap-1 text-gb-medium text-[7px] sm:text-[9px] leading-relaxed max-w-xs">
          <p className="text-gb-light">YOU ARE A TECH FOUNDER</p>
          <p className="text-gb-medium/80">
            NO RUNWAY • NO OFFICE • JUST A DREAM
          </p>
          <p className="text-gb-medium/60 mt-1">
            PITCH VCs • SCROUNGE FOR RUNWAY • SURVIVE
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-1 mt-2 text-gb-medium/70 text-[6px] sm:text-[8px]">
          <p>← → MOVE  •  ↑ ENTER  •  ↓ DUCK</p>
          <p>A B C CONTEXT ACTIONS</p>
        </div>

        {/* Press Start prompt */}
        <div className="mt-4">
          <p 
            className={`text-gb-lightest text-[10px] sm:text-xs tracking-widest transition-opacity duration-100 ${
              blinkVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            PRESS START
          </p>
        </div>

        {/* Copyright/version */}
        <p className="absolute bottom-4 text-gb-dark text-[6px] sm:text-[8px]">
          © 1991 KINGS CROSS GAMES
        </p>
      </div>

      {/* Corner decorations - briefcase style */}
      <div className="absolute top-4 left-4 w-3 h-3 border-l-2 border-t-2 border-gb-medium" />
      <div className="absolute top-4 right-4 w-3 h-3 border-r-2 border-t-2 border-gb-medium" />
      <div className="absolute bottom-4 left-4 w-3 h-3 border-l-2 border-b-2 border-gb-medium" />
      <div className="absolute bottom-4 right-4 w-3 h-3 border-r-2 border-b-2 border-gb-medium" />
    </div>
  );
};
