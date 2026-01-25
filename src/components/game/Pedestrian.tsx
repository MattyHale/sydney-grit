import { useEffect, useState } from 'react';
import { PedestrianState } from '@/types/game';

interface PedestrianProps {
  pedestrian: PedestrianState;
  playerX: number;
}

// Visual configs for each archetype - more distinct silhouettes
const ARCHETYPE_STYLES: Record<string, { 
  bodyColor: string; 
  headColor: string; 
  accessory?: string; 
  height: number;
  bodyWidth: number;
  hasHeels?: boolean;
  hasHat?: boolean;
  hasBag?: boolean;
  stance?: string;
}> = {
  businessman: { 
    bodyColor: '#1a1a2a', // Dark suit
    headColor: '#6a6a5a', 
    accessory: 'briefcase', 
    height: 22,
    bodyWidth: 5,
    hasBag: false,
  },
  clubber: { 
    bodyColor: '#5a2a5a', // Bright purple/pink
    headColor: '#6a5a5a', 
    accessory: 'none', 
    height: 20,
    bodyWidth: 4,
    stance: 'relaxed',
  },
  tourist: { 
    bodyColor: '#5a7a5a', // Khaki/green
    headColor: '#7a7a6a', 
    accessory: 'camera', 
    height: 19,
    bodyWidth: 5,
    hasHat: true,
  },
  pensioner: { 
    bodyColor: '#5a5a5a', // Grey
    headColor: '#8a8a8a', // Grey hair
    accessory: 'cane', 
    height: 16, // Shorter, hunched
    bodyWidth: 4,
  },
  backpacker: { 
    bodyColor: '#4a5a4a', // Earthy
    headColor: '#6a5a4a', 
    accessory: 'backpack', 
    height: 21,
    bodyWidth: 4,
  },
  junkie: { 
    bodyColor: '#2a2a2a', // Dark, worn
    headColor: '#4a4a3a', 
    accessory: 'none', 
    height: 17, // Hunched
    bodyWidth: 3, // Thin
    stance: 'hunched',
  },
  sexworker: { 
    bodyColor: '#6a3a4a', // Red/dark outfit
    headColor: '#7a6a6a', 
    accessory: 'purse', 
    height: 20,
    bodyWidth: 4,
    hasHeels: true, // Distinctive heel silhouette
    stance: 'posed',
  },
  student: { 
    bodyColor: '#3a3a5a', // Casual blue
    headColor: '#5a5a5a', 
    accessory: 'bag', 
    height: 19,
    bodyWidth: 4,
  },
};

export function Pedestrian({ pedestrian, playerX }: PedestrianProps) {
  const [walkFrame, setWalkFrame] = useState(0);
  
  useEffect(() => {
    const speed = pedestrian.archetype === 'pensioner' ? 350 : 
                  pedestrian.archetype === 'junkie' ? 400 : 180;
    const interval = setInterval(() => {
      setWalkFrame(f => (f + 1) % 2);
    }, speed);
    return () => clearInterval(interval);
  }, [pedestrian.archetype]);

  const style = ARCHETYPE_STYLES[pedestrian.archetype] || ARCHETYPE_STYLES.student;
  const isNearPlayer = Math.abs(pedestrian.x - playerX) < 8;
  
  return (
    <div 
      className="absolute transition-all duration-100 z-25"
      style={{ 
        left: `${pedestrian.x}%`, 
        bottom: '46%', // Footpath level
        transform: `translateX(-50%) ${pedestrian.direction === 'left' ? 'scaleX(-1)' : ''}`,
        opacity: isNearPlayer ? 1 : 0.85,
      }}
    >
      {/* Shadow - grounds pedestrian */}
      <div 
        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full opacity-25"
        style={{ background: '#0a0a0a', filter: 'blur(1px)' }}
      />
      
      {/* Pedestrian sprite */}
      <div className="relative" style={{ height: `${style.height}px`, width: '14px' }}>
        {/* Hat (tourist) */}
        {style.hasHat && (
          <div 
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-t"
            style={{ background: '#5a5a4a' }}
          />
        )}
        
        {/* Head */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border"
          style={{ background: style.headColor, borderColor: '#2a2a2a' }}
        >
          {/* Hair detail based on archetype */}
          {pedestrian.archetype === 'pensioner' && (
            <div className="absolute -top-0.5 left-0 right-0 h-1.5 rounded-t" style={{ background: '#9a9a9a' }} />
          )}
          {pedestrian.archetype === 'clubber' && (
            <div className="absolute -top-1 left-0.5 right-0.5 h-2 rounded-t" style={{ background: '#3a2a3a' }} />
          )}
        </div>
        
        {/* Body */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 rounded-sm border"
          style={{ 
            top: '14px',
            width: `${style.bodyWidth * 2.5}px`,
            height: `${style.height - 16}px`,
            background: style.bodyColor,
            borderColor: '#1a1a1a',
          }}
        />
        
        {/* Legs - walking animation */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div 
            className="rounded-b transition-transform"
            style={{ 
              width: '3px',
              height: style.hasHeels ? '5px' : '4px',
              background: pedestrian.archetype === 'sexworker' ? '#1a1a1a' : '#2a2a2a',
              transform: `translateY(${walkFrame === 0 ? 0 : 1}px)`,
            }}
          />
          <div 
            className="rounded-b transition-transform"
            style={{ 
              width: '3px',
              height: style.hasHeels ? '5px' : '4px',
              background: pedestrian.archetype === 'sexworker' ? '#1a1a1a' : '#2a2a2a',
              transform: `translateY(${walkFrame === 1 ? 0 : 1}px)`,
            }}
          />
        </div>
        
        {/* Heels (sexworker) */}
        {style.hasHeels && (
          <>
            <div className="absolute bottom-0 left-3 w-1 h-1" style={{ background: '#aa4444' }} />
            <div className="absolute bottom-0 right-3 w-1 h-1" style={{ background: '#aa4444' }} />
          </>
        )}
        
        {/* Accessories */}
        {style.accessory === 'briefcase' && (
          <div className="absolute top-[16px] -right-2 w-3 h-2.5 rounded-sm border" style={{ background: '#2a1a1a', borderColor: '#4a3a3a' }} />
        )}
        {style.accessory === 'backpack' && (
          <div className="absolute top-[12px] -left-1 w-3 h-5 rounded" style={{ background: '#4a5a3a', border: '1px solid #3a4a2a' }} />
        )}
        {style.accessory === 'camera' && (
          <div className="absolute top-[16px] left-1/2 -translate-x-1/2 w-3 h-2 rounded" style={{ background: '#3a3a3a', border: '1px solid #5a5a5a' }}>
            <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full" style={{ background: '#1a1a1a' }} />
          </div>
        )}
        {style.accessory === 'cane' && (
          <div className="absolute bottom-0 -right-1 w-0.5 h-6 origin-bottom" style={{ background: '#5a4a3a', transform: `rotate(${walkFrame === 0 ? 5 : -5}deg)` }} />
        )}
        {style.accessory === 'bag' && (
          <div className="absolute top-[14px] -right-1 w-2.5 h-3 rounded" style={{ background: '#3a3a4a' }} />
        )}
        {style.accessory === 'purse' && (
          <div className="absolute top-[14px] -right-1.5 w-2 h-2 rounded" style={{ background: '#5a2a3a', border: '1px solid #7a4a5a' }} />
        )}
      </div>
      
      {/* Steal indicator when close */}
      {isNearPlayer && pedestrian.canBeStolen && (
        <div 
          className="absolute -top-4 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[6px] animate-pulse rounded font-bold"
          style={{ background: '#1a1a1a', color: '#9bbc0f', border: '1px solid #8bac0f' }}
        >
          B/C
        </div>
      )}
    </div>
  );
}
