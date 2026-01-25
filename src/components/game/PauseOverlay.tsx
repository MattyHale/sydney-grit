interface PauseOverlayProps {
  onResume: () => void;
}

export function PauseOverlay({ onResume }: PauseOverlayProps) {
  return (
    <div className="absolute inset-0 bg-gb-darkest/90 z-30 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-gb-lightest text-xl mb-4">PAUSED</h2>
        <p className="text-gb-light text-[10px] mb-6">Sydney 1991</p>
        <button
          onClick={onResume}
          className="px-6 py-2 bg-gb-dark border-2 border-gb-light text-gb-lightest text-xs hover:bg-gb-light hover:text-gb-darkest transition-colors"
        >
          RESUME
        </button>
        <p className="text-gb-dark text-[8px] mt-4">Press P or ESC</p>
      </div>
    </div>
  );
}
