interface CarProps {
  x: number;
  isStopped: boolean;
  variant: number;
}

export function Car({ x, isStopped, variant }: CarProps) {
  // Different car styles for variety - more distinct colors
  const getCarStyle = () => {
    switch (variant) {
      case 0: // Taxi - yellow
        return { body: '#aa9a2a', roof: '#8a7a1a', light: '#ffff88', isTaxi: true };
      case 1: // Sedan - maroon
        return { body: '#6a3a3a', roof: '#4a2a2a', light: '#ffaa66', isTaxi: false };
      case 2: // Ute - blue
        return { body: '#3a4a6a', roof: '#2a3a5a', light: '#88ffff', isTaxi: false };
      case 3: // Wagon - green
        return { body: '#3a5a3a', roof: '#2a4a2a', light: '#aaffaa', isTaxi: false };
      default:
        return { body: '#5a5a5a', roof: '#3a3a3a', light: '#ffffff', isTaxi: false };
    }
  };

  const style = getCarStyle();

  return (
    <div 
      className="absolute z-20"
      style={{ 
        left: `${x}%`, 
        bottom: '28%', // Anchored to road layer properly
        transform: 'translateX(-50%)',
      }}
    >
      {/* Shadow - grounds the car */}
      <div 
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-14 h-2 rounded-full opacity-40"
        style={{ background: '#0a0a0a', filter: 'blur(2px)' }}
      />
      
      {/* Car sprite */}
      <div className="relative w-16 h-7">
        {/* Headlights */}
        <div 
          className={`absolute top-3 left-0 w-1.5 h-1.5 rounded-l ${isStopped ? 'animate-pulse' : ''}`}
          style={{ background: style.light, boxShadow: isStopped ? `0 0 4px ${style.light}` : 'none' }}
        />
        
        {/* Body - more defined shape */}
        <div 
          className="absolute bottom-1 left-1 w-14 h-5 rounded border-2"
          style={{ background: style.body, borderColor: '#1a1a1a' }}
        />
        
        {/* Cabin */}
        <div 
          className="absolute top-0 left-4 w-7 h-4 rounded-t border-2 border-b-0"
          style={{ background: style.roof, borderColor: '#1a1a1a' }}
        >
          {/* Windows - darker for contrast */}
          <div className="absolute inset-1 rounded-t" style={{ background: '#0a1520', opacity: 0.9 }} />
        </div>
        
        {/* Taxi sign */}
        {style.isTaxi && (
          <div className="absolute -top-1 left-6 w-3 h-1.5 rounded" style={{ background: '#ffff44' }}>
            <span className="text-[3px] text-black font-bold">TAXI</span>
          </div>
        )}
        
        {/* Taillights - brighter red */}
        <div className="absolute top-3 right-0 w-1.5 h-2 rounded-r" style={{ background: '#ff2222', boxShadow: isStopped ? '0 0 3px #ff2222' : 'none' }} />
        
        {/* Wheels - touching the ground with hub detail */}
        <div className="absolute bottom-0 left-2 w-3 h-3 rounded-full border-2" style={{ background: '#0a0a0a', borderColor: '#2a2a2a' }}>
          <div className="absolute inset-0.5 rounded-full" style={{ background: '#1a1a1a' }} />
        </div>
        <div className="absolute bottom-0 right-2.5 w-3 h-3 rounded-full border-2" style={{ background: '#0a0a0a', borderColor: '#2a2a2a' }}>
          <div className="absolute inset-0.5 rounded-full" style={{ background: '#1a1a1a' }} />
        </div>
        
        {/* Interior glow when stopped */}
        {isStopped && (
          <div className="absolute top-1.5 left-5 w-5 h-2 rounded animate-pulse" style={{ background: '#ffaa4455' }} />
        )}
      </div>
    </div>
  );
}
