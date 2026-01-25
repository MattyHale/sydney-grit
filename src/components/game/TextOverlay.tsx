interface TextOverlayProps {
  text: string;
  visible: boolean;
}

export function TextOverlay({ text, visible }: TextOverlayProps) {
  if (!visible || !text) return null;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
      <div className="bg-gb-darkest border-2 border-gb-light px-3 py-2 max-w-[280px]">
        <p className="text-gb-lightest text-[10px] sm:text-xs text-center leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}
