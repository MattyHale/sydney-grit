import { useEffect, useState } from 'react';
import { PedestrianState } from '@/types/game';

interface PedestrianProps {
  pedestrian: PedestrianState;
  playerX: number;
}

// Visual configs for each archetype - silhouette/clothing variations
const ARCHETYPE_STYLES: Record<string, { bodyColor: string; headColor: string; accessory?: string; height: number }> = {
  businessman: { bodyColor: 'bg-gb-darkest', headColor: 'bg-gb-dark', accessory: 'briefcase', height: 24 },
  clubber: { bodyColor: 'bg-gb-light', headColor: 'bg-gb-darkest', accessory: 'none', height: 22 },
  tourist: { bodyColor: 'bg-gb-dark', headColor: 'bg-gb-light', accessory: 'camera', height: 20 },
  pensioner: { bodyColor: 'bg-gb-dark', headColor: 'bg-gb-lightest', accessory: 'cane', height: 18 },
  backpacker: { bodyColor: 'bg-gb-darkest', headColor: 'bg-gb-dark', accessory: 'backpack', height: 24 },
  junkie: { bodyColor: 'bg-gb-dark', headColor: 'bg-gb-dark', accessory: 'none', height: 20 },
  sexworker: { bodyColor: 'bg-gb-light', headColor: 'bg-gb-lightest', accessory: 'none', height: 22 },
  student: { bodyColor: 'bg-gb-dark', headColor: 'bg-gb-darkest', accessory: 'bag', height: 22 },
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
      className="absolute transition-all duration-100"
      style={{ 
        left: `${pedestrian.x}%`, 
        bottom: '32%',
        transform: `translateX(-50%) ${pedestrian.direction === 'left' ? 'scaleX(-1)' : ''}`,
        opacity: isNearPlayer ? 1 : 0.85,
      }}
    >
      {/* Pedestrian sprite */}
      <div className="relative" style={{ height: `${style.height}px` }}>
        {/* Head */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 ${style.headColor} rounded-full border border-gb-darkest`} />
        
        {/* Body */}
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 w-4 ${style.bodyColor} border border-gb-darkest rounded-sm`} 
          style={{ height: `${style.height - 12}px` }} 
        />
        
        {/* Legs - walking animation */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div className={`w-1.5 h-3 bg-gb-darkest rounded-b ${walkFrame === 0 ? 'translate-y-0' : 'translate-y-0.5'}`} />
          <div className={`w-1.5 h-3 bg-gb-darkest rounded-b ${walkFrame === 1 ? 'translate-y-0' : 'translate-y-0.5'}`} />
        </div>
        
        {/* Accessories */}
        {style.accessory === 'briefcase' && (
          <div className="absolute top-4 -right-2 w-2 h-2 bg-gb-darkest rounded-sm" />
        )}
        {style.accessory === 'backpack' && (
          <div className="absolute top-3 -left-1 w-2 h-3 bg-gb-dark rounded" />
        )}
        {style.accessory === 'camera' && (
          <div className="absolute top-4 left-1/2 w-1.5 h-1 bg-gb-lightest rounded" />
        )}
        {style.accessory === 'cane' && (
          <div className="absolute bottom-0 -right-1 w-0.5 h-5 bg-gb-darkest" />
        )}
        {style.accessory === 'bag' && (
          <div className="absolute top-5 -right-1.5 w-2 h-2 bg-gb-dark rounded" />
        )}
      </div>
      
      {/* Steal indicator when close */}
      {isNearPlayer && pedestrian.canBeStolen && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[6px] text-gb-lightest bg-gb-darkest px-1 animate-pulse">
          B/C
        </div>
      )}
    </div>
  );
}
