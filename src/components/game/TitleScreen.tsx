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
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        {/* Game title */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-gb-lightest text-2xl sm:text-3xl md:text-4xl tracking-wider gb-glow">
            SYDNEY
          </h1>
          <h2 className="text-gb-light text-3xl sm:text-4xl md:text-5xl tracking-widest gb-glow">
            1991
          </h2>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-2 my-2">
          <div className="w-8 h-0.5 bg-gb-medium" />
          <div className="w-2 h-2 bg-gb-light rotate-45" />
          <div className="w-8 h-0.5 bg-gb-medium" />
        </div>

        {/* Instructions */}
        <div className="flex flex-col gap-2 text-gb-medium text-[8px] sm:text-[10px] leading-relaxed max-w-xs">
          <p>SURVIVE THE STREETS</p>
          <p className="text-gb-light/80">
            MANAGE HUNGER • WARMTH • HOPE
          </p>
          <div className="flex flex-col gap-1 mt-2 text-gb-medium/80">
            <p>← → MOVE</p>
            <p>↑ INTERACT • ↓ DUCK</p>
            <p>A B C ACTIONS</p>
          </div>
        </div>

        {/* Press Start prompt */}
        <div className="mt-6">
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
          © 2024 LOVABLE GAMES
        </p>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-3 h-3 border-l-2 border-t-2 border-gb-medium" />
      <div className="absolute top-4 right-4 w-3 h-3 border-r-2 border-t-2 border-gb-medium" />
      <div className="absolute bottom-4 left-4 w-3 h-3 border-l-2 border-b-2 border-gb-medium" />
      <div className="absolute bottom-4 right-4 w-3 h-3 border-r-2 border-b-2 border-gb-medium" />
    </div>
  );
};
