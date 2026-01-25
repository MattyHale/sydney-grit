interface GameOverOverlayProps {
  reason: string;
  survivalTime: number;
  onRestart: () => void;
}

export function GameOverOverlay({ reason, survivalTime, onRestart }: GameOverOverlayProps) {
  return (
    <div className="absolute inset-0 bg-gb-darkest/95 z-30 flex items-center justify-center animate-fade-in">
      <div className="text-center px-4">
        <h2 className="text-gb-lightest text-lg mb-2">GAME OVER</h2>
        <p className="text-gb-light text-xs mb-4">{reason}</p>
        
        <div className="border-2 border-gb-dark p-4 mb-6">
          <p className="text-gb-dark text-[10px] mb-1">SURVIVAL TIME</p>
          <p className="text-gb-lightest text-2xl font-bold">{survivalTime}s</p>
        </div>
        
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-gb-dark border-2 border-gb-light text-gb-lightest text-xs hover:bg-gb-light hover:text-gb-darkest transition-colors"
        >
          TRY AGAIN
        </button>
        
        <p className="text-gb-dark text-[8px] mt-6 max-w-[200px] mx-auto">
          Learn the rhythms. Time your actions. Survive longer.
        </p>
      </div>
    </div>
  );
}
