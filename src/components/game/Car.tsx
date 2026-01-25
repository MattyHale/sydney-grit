interface CarProps {
  x: number;
  isStopped: boolean;
  variant: number;
}

export function Car({ x, isStopped, variant }: CarProps) {
  // Different car colors/styles for variety - HIGH CONTRAST
  const getCarStyle = () => {
    switch (variant) {
      case 0:
        return { body: 'bg-[#6a7a6a]', roof: 'bg-[#4a5a4a]', light: 'bg-[#ffff88]' };
      case 1:
        return { body: 'bg-[#8a6a5a]', roof: 'bg-[#5a4a3a]', light: 'bg-[#ffaa66]' };
      case 2:
        return { body: 'bg-[#5a6a8a]', roof: 'bg-[#3a4a5a]', light: 'bg-[#88ffff]' };
      default:
        return { body: 'bg-gb-dark', roof: 'bg-gb-darkest', light: 'bg-gb-lightest' };
    }
  };

  const style = getCarStyle();

  return (
    <div 
      className="absolute bottom-[24%] transition-all"
      style={{ 
        left: `${x}%`, 
        transform: 'translateX(-50%)',
      }}
    >
      {/* Car sprite - larger and more distinct */}
      <div className="relative w-16 h-8">
        {/* Headlights */}
        <div className={`absolute top-3 left-0 w-2 h-1.5 ${style.light} rounded-l ${isStopped ? 'animate-pulse' : ''}`} />
        
        {/* Body */}
        <div className={`absolute bottom-0 left-1 w-14 h-5 ${style.body} rounded border-2 border-gb-darkest`} />
        
        {/* Roof/cabin */}
        <div className={`absolute top-0 left-4 w-8 h-4 ${style.roof} rounded-t border-2 border-b-0 border-gb-darkest`}>
          {/* Windows */}
          <div className="absolute inset-0.5 bg-[#1a2a3a] rounded-t opacity-80" />
        </div>
        
        {/* Taillights */}
        <div className="absolute top-3 right-0 w-1.5 h-1.5 bg-[#ff4444] rounded-r" />
        
        {/* Wheels */}
        <div className="absolute bottom-[-2px] left-3 w-3 h-3 bg-gb-darkest rounded-full border border-gb-dark" />
        <div className="absolute bottom-[-2px] right-3 w-3 h-3 bg-gb-darkest rounded-full border border-gb-dark" />
        
        {/* Stopped indicator - interior light */}
        {isStopped && (
          <div className="absolute top-1 left-5 w-6 h-2 bg-[#ffaa4444] rounded animate-pulse" />
        )}
      </div>
    </div>
  );
}
