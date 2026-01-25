import { useEffect, useState } from 'react';
import { PedestrianState } from '@/types/game';

interface PedestrianProps {
  pedestrian: PedestrianState;
  playerX: number;
}

// Visual configs for each archetype
const ARCHETYPE_STYLES: Record<string, { bodyColor: string; headColor: string; accessory?: string; height: number }> = {
  businessman: { bodyColor: '#2a2a2a', headColor: '#5a5a5a', accessory: 'briefcase', height: 20 },
  clubber: { bodyColor: '#6a3a6a', headColor: '#5a4a5a', accessory: 'none', height: 18 },
  tourist: { bodyColor: '#5a6a4a', headColor: '#6a6a5a', accessory: 'camera', height: 17 },
  pensioner: { bodyColor: '#4a4a4a', headColor: '#7a7a7a', accessory: 'cane', height: 15 },
  backpacker: { bodyColor: '#4a5a4a', headColor: '#5a5a4a', accessory: 'backpack', height: 20 },
  junkie: { bodyColor: '#3a3a3a', headColor: '#4a4a4a', accessory: 'none', height: 16 },
  sexworker: { bodyColor: '#6a4a5a', headColor: '#7a6a6a', accessory: 'none', height: 18 },
  student: { bodyColor: '#4a4a5a', headColor: '#5a5a5a', accessory: 'bag', height: 18 },
};

export function Pedestrian({ pedestrian, playerX }: PedestrianProps) {
  const [walkFrame, setWalkFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWalkFrame(f => (f + 1) % 2);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const style = ARCHETYPE_STYLES[pedestrian.archetype] || ARCHETYPE_STYLES.student;
  const isNearPlayer = Math.abs(pedestrian.x - playerX) < 8;
  
  return (
    <div 
      className="absolute transition-all duration-100 z-25"
      style={{ 
        left: `${pedestrian.x}%`, 
        bottom: '46%', // Same footpath level as player
        transform: `translateX(-50%) ${pedestrian.direction === 'left' ? 'scaleX(-1)' : ''}`,
        opacity: isNearPlayer ? 1 : 0.85,
      }}
    >
      {/* Pedestrian sprite */}
      <div className="relative" style={{ height: `${style.height}px`, width: '12px' }}>
        {/* Head */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border"
          style={{ background: style.headColor, borderColor: '#2a2a2a' }}
        />
        
        {/* Body */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-4 rounded-sm border"
          style={{ 
            top: '12px',
            height: `${style.height - 14}px`,
            background: style.bodyColor,
            borderColor: '#1a1a1a',
          }}
        />
        
        {/* Legs - walking animation */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div 
            className="w-1.5 h-2 rounded-b"
            style={{ 
              background: '#2a2a2a',
              transform: `translateY(${walkFrame === 0 ? 0 : 1}px)`,
            }}
          />
          <div 
            className="w-1.5 h-2 rounded-b"
            style={{ 
              background: '#2a2a2a',
              transform: `translateY(${walkFrame === 1 ? 0 : 1}px)`,
            }}
          />
        </div>
        
        {/* Accessories */}
        {style.accessory === 'briefcase' && (
          <div className="absolute top-4 -right-1 w-2 h-1.5 rounded-sm" style={{ background: '#3a2a1a' }} />
        )}
        {style.accessory === 'backpack' && (
          <div className="absolute top-3 -left-0.5 w-2 h-3 rounded" style={{ background: '#4a4a3a' }} />
        )}
        {style.accessory === 'camera' && (
          <div className="absolute top-4 left-1/2 w-1.5 h-1 rounded" style={{ background: '#5a5a5a' }} />
        )}
        {style.accessory === 'cane' && (
          <div className="absolute bottom-0 -right-0.5 w-0.5 h-4" style={{ background: '#5a4a3a' }} />
        )}
        {style.accessory === 'bag' && (
          <div className="absolute top-5 -right-1 w-2 h-2 rounded" style={{ background: '#3a3a4a' }} />
        )}
      </div>
      
      {/* Steal indicator when close */}
      {isNearPlayer && pedestrian.canBeStolen && (
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-1 text-[5px] animate-pulse rounded"
          style={{ background: '#1a1a1a', color: '#9bbc0f', border: '1px solid #4a4a4a' }}
        >
          B/C
        </div>
      )}
    </div>
  );
}
