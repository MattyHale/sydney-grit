interface GameOverOverlayProps {
  reason: string;
  survivalTime: number;
  onRestart: () => void;
}

// Compact bleak collapse messages - one line, no gore, no explicit content
const COLLAPSE_MESSAGES: Record<string, string> = {
  'Starvation.': 'Your body gave out. The hunger was too much.',
  'Hypothermia.': 'The cold took you. No one noticed.',
  'Lost all hope.': 'You stopped trying. The world moved on.',
  'Overdose.': 'Too much. The high became forever.',
  'Arrested by police.': 'They took you away. The system swallowed you.',
  'A dangerous encounter.': 'You trusted the wrong person. It cost everything.',
  'Violence on the street.': 'The night took its toll. You didn\'t see it coming.',
  'Arrested for theft.': 'You got caught. The cell door closed.',
};

// Bleak flavor text based on survival time
const getFlavorText = (survivalTime: number): string => {
  if (survivalTime < 30) return 'It was always going to end this way.';
  if (survivalTime < 60) return 'You lasted longer than most.';
  if (survivalTime < 120) return 'The street remembers no one.';
  if (survivalTime < 180) return 'You fought hard. It wasn\'t enough.';
  return 'Sydney, 1991. Another name forgotten.';
};

export function GameOverOverlay({ reason, survivalTime, onRestart }: GameOverOverlayProps) {
  const collapseMessage = COLLAPSE_MESSAGES[reason] || reason;
  const flavorText = getFlavorText(survivalTime);
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
      {/* Dark overlay - bleak dimming */}
      <div className="absolute inset-0 bg-black/90" />
      
      {/* Content */}
      <div className="relative text-center px-6 max-w-xs animate-fade-in">
        {/* Collapse message - one line, bleak */}
        <p className="text-gb-lightest text-[11px] mb-4 leading-relaxed font-medium">
          {collapseMessage}
        </p>
        
        {/* Stats */}
        <div className="flex flex-col gap-1 mb-4 border-2 border-gb-dark p-3">
          <span className="text-gb-dark text-[9px] tracking-wide uppercase">Survived</span>
          <span className="text-gb-lightest text-xl font-bold">{survivalTime}s</span>
        </div>
        
        {/* Flavor text */}
        <p className="text-gb-dark text-[8px] italic mb-6">
          {flavorText}
        </p>
        
        {/* Restart */}
        <button
          onClick={onRestart}
          className="px-6 py-2 bg-gb-dark text-gb-lightest text-xs rounded border-2 border-gb-light hover:bg-gb-light hover:text-gb-darkest transition-colors"
        >
          TRY AGAIN
        </button>
      </div>
    </div>
  );
}
