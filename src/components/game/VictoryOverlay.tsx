import { useEffect, useState } from 'react';

interface VictoryOverlayProps {
  survivalTime: number;
  onRestart: () => void;
}

export function VictoryOverlay({ survivalTime, onRestart }: VictoryOverlayProps) {
  const [confettiPhase, setConfettiPhase] = useState(0);
  const [bellRinging, setBellRinging] = useState(true);
  
  // Animate confetti
  useEffect(() => {
    const interval = setInterval(() => {
      setConfettiPhase(prev => (prev + 1) % 360);
    }, 50);
    
    // Stop bell after 3 seconds
    const bellTimeout = setTimeout(() => setBellRinging(false), 3000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(bellTimeout);
    };
  }, []);
  
  // Format time
  const minutes = Math.floor(survivalTime / 60);
  const seconds = survivalTime % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  // Generate confetti pieces
  const confetti = Array.from({ length: 30 }, (_, i) => {
    const x = (i * 37 + confettiPhase) % 100;
    const y = ((i * 23 + confettiPhase * 2) % 120) - 20;
    const rotation = (i * 47 + confettiPhase * 3) % 360;
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const color = colors[i % colors.length];
    const size = 4 + (i % 4);
    
    return (
      <div
        key={i}
        className="absolute"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          transform: `rotate(${rotation}deg)`,
          opacity: 0.9,
        }}
      />
    );
  });
  
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      />
      
      {/* Confetti layer */}
      <div className="absolute inset-0 pointer-events-none">
        {confetti}
      </div>
      
      {/* Golden rays */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.2) 0%, transparent 60%)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4">
        {/* Bell icon */}
        <div 
          className={`text-6xl mb-4 ${bellRinging ? 'animate-bounce' : ''}`}
          style={{ 
            filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
            animation: bellRinging ? 'ring 0.2s ease-in-out infinite alternate' : undefined,
          }}
        >
          🔔
        </div>
        
        {/* IPO text with glow */}
        <h1 
          className="text-4xl font-bold mb-2"
          style={{
            color: '#FFD700',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.4)',
          }}
        >
          IPO!
        </h1>
        
        <h2 
          className="text-lg mb-6"
          style={{
            color: '#4ECDC4',
            textShadow: '0 0 10px rgba(78, 205, 196, 0.6)',
          }}
        >
          YOU RANG THE BELL
        </h2>
        
        {/* Divider */}
        <div 
          className="w-32 h-1 mx-auto mb-6"
          style={{
            background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
          }}
        />
        
        {/* Stats */}
        <div className="space-y-3 mb-8">
          <p className="text-gb-lightest text-sm">
            From Bootstrap to IPO in
          </p>
          <p 
            className="text-3xl font-bold"
            style={{ color: '#98D8C8' }}
          >
            {timeString}
          </p>
        </div>
        
        {/* Achievement badges */}
        <div className="flex justify-center gap-3 mb-8">
          <div 
            className="px-3 py-1 rounded-full text-xs"
            style={{ 
              backgroundColor: 'rgba(255, 215, 0, 0.2)', 
              color: '#FFD700',
              border: '1px solid rgba(255, 215, 0, 0.5)',
            }}
          >
            🦄 UNICORN
          </div>
          <div 
            className="px-3 py-1 rounded-full text-xs"
            style={{ 
              backgroundColor: 'rgba(78, 205, 196, 0.2)', 
              color: '#4ECDC4',
              border: '1px solid rgba(78, 205, 196, 0.5)',
            }}
          >
            🚀 FOUNDER
          </div>
        </div>
        
        {/* Restart button */}
        <button
          onClick={onRestart}
          className="px-8 py-3 text-sm font-bold rounded transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: '#1a1a2e',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
          }}
        >
          PLAY AGAIN
        </button>
        
        <p className="text-gb-dark text-[10px] mt-4 italic">
          Can you do it faster?
        </p>
      </div>
      
      {/* CSS for bell animation */}
      <style>{`
        @keyframes ring {
          0% { transform: rotate(-15deg); }
          100% { transform: rotate(15deg); }
        }
      `}</style>
    </div>
  );
}
