interface CarProps {
  x: number;
  isStopped: boolean;
  variant: number;
}

export function Car({ x, isStopped, variant }: CarProps) {
  // Different car styles for variety
  const getCarStyle = () => {
    switch (variant) {
      case 0:
        return { body: '#5a6a5a', roof: '#3a4a3a', light: '#ffff88' };
      case 1:
        return { body: '#6a5a4a', roof: '#4a3a2a', light: '#ffaa66' };
      case 2:
        return { body: '#4a5a6a', roof: '#2a3a4a', light: '#88ffff' };
      default:
        return { body: '#5a5a5a', roof: '#3a3a3a', light: '#ffffff' };
    }
  };

  const style = getCarStyle();

  return (
    <div 
      className="absolute z-20"
      style={{ 
        left: `${x}%`, 
        bottom: '60%', // On road layer
        transform: 'translateX(-50%)',
      }}
    >
      {/* Car sprite */}
      <div className="relative w-14 h-6">
        {/* Headlights */}
        <div 
          className={`absolute top-2 left-0 w-1.5 h-1 rounded-l ${isStopped ? 'animate-pulse' : ''}`}
          style={{ background: style.light }}
        />
        
        {/* Body */}
        <div 
          className="absolute bottom-0 left-1 w-12 h-4 rounded border"
          style={{ background: style.body, borderColor: '#1a2a1a' }}
        />
        
        {/* Cabin */}
        <div 
          className="absolute top-0 left-3 w-6 h-3 rounded-t border border-b-0"
          style={{ background: style.roof, borderColor: '#1a2a1a' }}
        >
          {/* Windows */}
          <div className="absolute inset-0.5 rounded-t" style={{ background: '#1a2a3a', opacity: 0.8 }} />
        </div>
        
        {/* Taillights */}
        <div className="absolute top-2 right-0 w-1 h-1 rounded-r" style={{ background: '#ff4444' }} />
        
        {/* Wheels */}
        <div className="absolute bottom-[-1px] left-2 w-2.5 h-2.5 rounded-full border" style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }} />
        <div className="absolute bottom-[-1px] right-2 w-2.5 h-2.5 rounded-full border" style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }} />
        
        {/* Interior glow when stopped */}
        {isStopped && (
          <div className="absolute top-1 left-4 w-4 h-1.5 rounded animate-pulse" style={{ background: '#ffaa4466' }} />
        )}
      </div>
    </div>
  );
}
