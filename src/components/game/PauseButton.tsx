interface PauseButtonProps {
  onPause: () => void;
}

export function PauseButton({ onPause }: PauseButtonProps) {
  return (
    <button
      onClick={onPause}
      className="absolute top-2 right-2 z-20 w-8 h-8 bg-gb-dark border border-gb-light flex items-center justify-center hover:bg-gb-light group transition-colors"
    >
      <div className="flex gap-0.5">
        <div className="w-1 h-3 bg-gb-lightest group-hover:bg-gb-darkest" />
        <div className="w-1 h-3 bg-gb-lightest group-hover:bg-gb-darkest" />
      </div>
    </button>
  );
}
