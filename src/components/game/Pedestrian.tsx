import { useEffect, useState } from 'react';
import { PedestrianState, PedestrianAction } from '@/types/game';

interface PedestrianProps {
  pedestrian: PedestrianState;
  playerX: number;
  actionsAvailable?: PedestrianAction[];
}

// Visual configs for each archetype - distinct adult silhouettes
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
  walkSpeed: number;
  // Unique silhouette elements
  shoulderWidth?: number;
  hairStyle?: 'bald' | 'short' | 'long' | 'curly' | 'mohawk' | 'grey' | 'spiky' | 'big' | 'receding' | 'beard';
  bodyShape?: 'thin' | 'average' | 'wide' | 'hunched' | 'stocky';
  // Special visual elements
  hasSkirt?: boolean;
  hasFishnets?: boolean;
  hasTie?: boolean;
  hasStuds?: boolean;
  hasHood?: boolean;
  hasFacialHair?: 'stubble' | 'beard' | 'mustache';
  hasWrinkles?: boolean;
}> = {
  businessman: { 
    bodyColor: '#1a1a2a', // Dark pinstripe suit
    headColor: '#6a6a5a', 
    accessory: 'briefcase', 
    height: 25, // Taller adult
    bodyWidth: 6,
    walkSpeed: 180,
    shoulderWidth: 8,
    hairStyle: 'receding',
    bodyShape: 'stocky',
    hasTie: true,
    hasFacialHair: 'stubble',
  },
  clubber: { 
    bodyColor: '#5a2a5a', // Bright purple/pink
    headColor: '#6a5a5a', 
    accessory: 'none', 
    height: 22,
    bodyWidth: 5,
    stance: 'relaxed',
    walkSpeed: 160,
    hairStyle: 'mohawk',
    bodyShape: 'thin',
    hasFacialHair: 'stubble',
  },
  tourist: { 
    bodyColor: '#5a7a5a', // Khaki/green
    headColor: '#7a7a6a', 
    accessory: 'camera', 
    height: 23,
    bodyWidth: 6,
    hasHat: true,
    walkSpeed: 280,
    hairStyle: 'short',
    bodyShape: 'stocky',
    hasFacialHair: 'mustache',
  },
  pensioner: { 
    bodyColor: '#5a5a5a', // Grey
    headColor: '#9a9a9a', // Grey hair
    accessory: 'cane', 
    height: 19, // Shorter, hunched
    bodyWidth: 5,
    walkSpeed: 450,
    hairStyle: 'grey',
    bodyShape: 'hunched',
    hasWrinkles: true,
  },
  backpacker: { 
    bodyColor: '#4a5a4a', // Earthy
    headColor: '#6a5a4a', 
    accessory: 'backpack', 
    height: 23,
    bodyWidth: 5,
    walkSpeed: 200,
    hairStyle: 'long',
    bodyShape: 'thin',
    hasFacialHair: 'beard',
  },
  junkie: { 
    bodyColor: '#2a2a2a', // Dark, worn
    headColor: '#4a4a3a', 
    accessory: 'none', 
    height: 20, // Hunched adult
    bodyWidth: 4, // Thin
    stance: 'hunched',
    walkSpeed: 380,
    hairStyle: 'bald',
    bodyShape: 'hunched',
    hasFacialHair: 'stubble',
    hasWrinkles: true,
  },
  sexworker: { 
    bodyColor: '#8a2a4a', // Hot pink/red mini
    headColor: '#7a6a6a', 
    accessory: 'purse', 
    height: 22,
    bodyWidth: 4,
    hasHeels: true,
    hasSkirt: true,
    hasFishnets: true,
    stance: 'posed',
    walkSpeed: 200,
    hairStyle: 'big',
    bodyShape: 'thin',
  },
  student: { 
    bodyColor: '#3a3a5a', // Casual blue
    headColor: '#5a5a5a', 
    accessory: 'bag', 
    height: 21,
    bodyWidth: 5,
    walkSpeed: 180,
    hairStyle: 'curly',
    bodyShape: 'average',
    hasFacialHair: 'stubble',
  },
  cop: {
    bodyColor: '#1a2a3a', // Dark blue uniform
    headColor: '#5a5a5a',
    accessory: 'radio',
    height: 26, // Tall authority figure
    bodyWidth: 7,
    hasHat: true,
    walkSpeed: 200,
    shoulderWidth: 8,
    hairStyle: 'short',
    bodyShape: 'stocky',
    hasFacialHair: 'mustache',
  },
  punk: {
    bodyColor: '#1a1a1a', // Black leather
    headColor: '#5a5a4a',
    accessory: 'none',
    height: 22,
    bodyWidth: 5,
    walkSpeed: 150,
    hairStyle: 'spiky',
    bodyShape: 'thin',
    hasStuds: true,
    hasFacialHair: 'stubble',
  },
  dealer: {
    bodyColor: '#2a2a3a', // Dark hoodie
    headColor: '#4a4a4a',
    accessory: 'hood',
    height: 23,
    bodyWidth: 6,
    walkSpeed: 300,
    hairStyle: 'bald',
    bodyShape: 'stocky',
    hasHood: true,
    hasFacialHair: 'stubble',
  },
};

export function Pedestrian({ pedestrian, playerX, actionsAvailable = [] }: PedestrianProps) {
  const [walkFrame, setWalkFrame] = useState(0);
  
  const style = ARCHETYPE_STYLES[pedestrian.archetype] || ARCHETYPE_STYLES.student;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWalkFrame(f => (f + 1) % 4);
    }, style.walkSpeed);
    return () => clearInterval(interval);
  }, [style.walkSpeed]);

  const isNearPlayer = Math.abs(pedestrian.x - playerX) < 8;
  const showActionHint = isNearPlayer && pedestrian.canBeStolen && actionsAvailable.length > 0;
  
  // Hair rendering based on style
  const renderHair = () => {
    switch (style.hairStyle) {
      case 'bald':
        return null;
      case 'grey':
        return <div className="absolute -top-0.5 left-0 right-0 h-2 rounded-t" style={{ background: '#9a9a9a' }} />;
      case 'long':
        return (
          <>
            <div className="absolute -top-0.5 left-0 right-0 h-2 rounded-t" style={{ background: '#3a2a2a' }} />
            <div className="absolute top-2 -left-0.5 w-1.5 h-3 rounded" style={{ background: '#3a2a2a' }} />
            <div className="absolute top-2 -right-0.5 w-1.5 h-3 rounded" style={{ background: '#3a2a2a' }} />
          </>
        );
      case 'mohawk':
        return <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-4 rounded-t" style={{ background: '#8a2a6a' }} />;
      case 'curly':
        return <div className="absolute -top-1 left-0 right-0 h-2.5 rounded-t" style={{ background: '#4a3a2a', borderRadius: '50% 50% 0 0' }} />;
      case 'spiky':
        return (
          <>
            <div className="absolute -top-2.5 left-0 w-1.5 h-4 rotate-[-20deg]" style={{ background: '#1a1a1a' }} />
            <div className="absolute -top-3 left-2 w-1.5 h-4.5" style={{ background: '#1a1a1a' }} />
            <div className="absolute -top-2.5 right-0 w-1.5 h-4 rotate-[20deg]" style={{ background: '#1a1a1a' }} />
          </>
        );
      case 'big':
        // Big 80s/90s hair
        return (
          <>
            <div className="absolute -top-2 -left-1 right-[-4px] h-5 rounded-t" style={{ background: '#4a2a2a' }} />
            <div className="absolute top-0 -left-2 w-2.5 h-4 rounded" style={{ background: '#4a2a2a' }} />
            <div className="absolute top-0 -right-2 w-2.5 h-4 rounded" style={{ background: '#4a2a2a' }} />
          </>
        );
      case 'receding':
        // Receding hairline - clearly adult male
        return (
          <>
            <div className="absolute -top-0.5 left-1.5 right-1.5 h-1.5 rounded-t" style={{ background: '#3a3a3a' }} />
            <div className="absolute -top-0.5 left-0 w-1 h-1 rounded-tl" style={{ background: style.headColor }} />
            <div className="absolute -top-0.5 right-0 w-1 h-1 rounded-tr" style={{ background: style.headColor }} />
          </>
        );
      case 'beard':
        // Just the top hair, beard rendered separately
        return <div className="absolute -top-0.5 left-0.5 right-0.5 h-2 rounded-t" style={{ background: '#3a2a2a' }} />;
      case 'short':
      default:
        return <div className="absolute -top-0.5 left-0.5 right-0.5 h-1.5 rounded-t" style={{ background: '#3a3a3a' }} />;
    }
  };
  
  // Body shape modifiers
  const getBodyModifiers = () => {
    switch (style.bodyShape) {
      case 'thin':
        return { bodyHeight: style.height - 14, widthMod: 0.8 };
      case 'wide':
        return { bodyHeight: style.height - 15, widthMod: 1.3 };
      case 'hunched':
        return { bodyHeight: style.height - 12, widthMod: 0.9, tilt: 10 };
      default:
        return { bodyHeight: style.height - 16, widthMod: 1 };
    }
  };
  
  const bodyMods = getBodyModifiers();
  
  return (
    <div 
      className="absolute transition-all duration-100 z-25"
      style={{ 
        left: `${pedestrian.x}%`, 
        bottom: '46%',
        transform: `translateX(-50%) ${pedestrian.direction === 'left' ? 'scaleX(-1)' : ''}`,
        opacity: isNearPlayer ? 1 : 0.85,
      }}
    >
      {/* Shadow - grounds pedestrian to footpath */}
      <div 
        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-full opacity-30"
        style={{ 
          background: '#0a0a0a', 
          filter: 'blur(1px)',
          width: `${(style.shoulderWidth || style.bodyWidth) * 1.5}px`,
          height: '4px',
        }}
      />
      
      {/* Pedestrian sprite */}
      <div 
        className="relative" 
        style={{ 
          height: `${style.height}px`, 
          width: '16px',
          transform: bodyMods.tilt ? `rotate(${bodyMods.tilt}deg)` : undefined,
        }}
      >
        {/* Hat (tourist, cop) */}
        {style.hasHat && (
          <div 
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-2 rounded-t"
            style={{ 
              background: pedestrian.archetype === 'cop' ? '#1a2a3a' : '#5a5a4a',
              borderBottom: pedestrian.archetype === 'cop' ? '1px solid #3a4a5a' : 'none',
            }}
          />
        )}
        
        {/* Hood (dealer) */}
        {style.hasHood && (
          <>
            {/* Hood shape - covers head */}
            <div 
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-5 rounded-t-full"
              style={{ background: '#1a1a2a', border: '1px solid #2a2a3a' }}
            />
            {/* Hood opening shadow */}
            <div 
              className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-2 rounded-b"
              style={{ background: '#0a0a0f' }}
            />
          </>
        )}
        
        {/* Head */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border"
          style={{ 
            background: style.headColor, 
            borderColor: '#2a2a2a',
            opacity: style.hasHood ? 0.6 : 1,
          }}
        >
          {/* Hair */}
          {!style.hasHood && renderHair()}
          
          {/* Facial hair - makes them clearly adult */}
          {style.hasFacialHair === 'stubble' && (
            <div 
              className="absolute bottom-0.5 left-0.5 right-0.5 h-1.5 rounded-b opacity-40"
              style={{ background: '#2a2a2a' }}
            />
          )}
          {style.hasFacialHair === 'beard' && (
            <div 
              className="absolute bottom-[-2px] left-0 right-0 h-2.5 rounded-b"
              style={{ background: '#3a2a2a', border: '1px solid #2a1a1a' }}
            />
          )}
          {style.hasFacialHair === 'mustache' && (
            <div 
              className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-1 rounded"
              style={{ background: '#3a2a2a' }}
            />
          )}
          
          {/* Wrinkles for older characters */}
          {style.hasWrinkles && (
            <>
              <div className="absolute top-1 left-0.5 w-1 h-px" style={{ background: '#4a4a4a' }} />
              <div className="absolute top-1.5 right-0.5 w-1 h-px" style={{ background: '#4a4a4a' }} />
            </>
          )}
        </div>
        
        {/* Neck for taller figures */}
        {style.height > 20 && (
          <div 
            className="absolute top-[16px] left-1/2 -translate-x-1/2 w-2 h-1.5"
            style={{ background: style.headColor }}
          />
        )}
        
        {/* Body - varies by archetype */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 rounded-sm border"
          style={{ 
            top: style.height > 20 ? '15px' : '14px',
            width: `${style.bodyWidth * bodyMods.widthMod * 2.5}px`,
            height: `${bodyMods.bodyHeight}px`,
            background: style.bodyColor,
            borderColor: '#1a1a1a',
          }}
        >
        {/* Cop badge */}
        {pedestrian.archetype === 'cop' && (
          <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-sm" style={{ background: '#8a8a4a' }} />
        )}
        
        {/* Businessman tie */}
        {style.hasTie && (
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-4" style={{ background: '#8a3a3a' }} />
        )}
        
        {/* Punk studs on jacket */}
        {style.hasStuds && (
          <>
            <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 rounded-full" style={{ background: '#aaaaaa' }} />
            <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 rounded-full" style={{ background: '#aaaaaa' }} />
            <div className="absolute top-2 left-0.5 w-0.5 h-0.5 rounded-full" style={{ background: '#aaaaaa' }} />
            <div className="absolute top-2 right-0.5 w-0.5 h-0.5 rounded-full" style={{ background: '#aaaaaa' }} />
          </>
        )}
      </div>
        
        {/* Shoulders for wider builds */}
        {(style.shoulderWidth || 0) > style.bodyWidth && (
          <>
            <div 
              className="absolute rounded-t"
              style={{ 
                top: style.height > 20 ? '15px' : '14px',
                left: '0px',
                width: '3px',
                height: '4px',
                background: style.bodyColor,
              }}
            />
            <div 
              className="absolute rounded-t"
              style={{ 
                top: style.height > 20 ? '15px' : '14px',
                right: '0px',
                width: '3px',
                height: '4px',
                background: style.bodyColor,
              }}
            />
          </>
        )}
        
        {/* Skirt for sex workers */}
        {style.hasSkirt && (
          <div 
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: style.height > 20 ? '18px' : '16px',
              width: `${style.bodyWidth * bodyMods.widthMod * 3}px`,
              height: '5px',
              background: '#8a2a4a',
              borderRadius: '0 0 3px 3px',
            }}
          />
        )}
        
        {/* Legs - walking animation */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
          {/* Fishnets pattern for sex workers */}
          <div 
            className="rounded-b transition-transform relative"
            style={{ 
              width: '3px',
              height: style.hasHeels ? '7px' : '5px',
              background: pedestrian.archetype === 'cop' ? '#1a2a3a' : 
                         pedestrian.archetype === 'punk' ? '#1a1a1a' :
                         pedestrian.archetype === 'sexworker' ? '#5a4a4a' : '#2a2a2a',
              transform: `translateY(${walkFrame % 2 === 0 ? 0 : 1}px)`,
            }}
          >
            {style.hasFishnets && (
              <>
                <div className="absolute top-1 left-0 right-0 h-px" style={{ background: '#1a1a1a55' }} />
                <div className="absolute top-2.5 left-0 right-0 h-px" style={{ background: '#1a1a1a55' }} />
              </>
            )}
          </div>
          <div 
            className="rounded-b transition-transform relative"
            style={{ 
              width: '3px',
              height: style.hasHeels ? '7px' : '5px',
              background: pedestrian.archetype === 'cop' ? '#1a2a3a' : 
                         pedestrian.archetype === 'punk' ? '#1a1a1a' :
                         pedestrian.archetype === 'sexworker' ? '#5a4a4a' : '#2a2a2a',
              transform: `translateY(${walkFrame % 2 === 1 ? 0 : 1}px)`,
            }}
          >
            {style.hasFishnets && (
              <>
                <div className="absolute top-1 left-0 right-0 h-px" style={{ background: '#1a1a1a55' }} />
                <div className="absolute top-2.5 left-0 right-0 h-px" style={{ background: '#1a1a1a55' }} />
              </>
            )}
          </div>
        </div>
        
        {/* Heels - red stilettos for sex workers */}
        {style.hasHeels && (
          <>
            <div className="absolute -bottom-1 left-[14px] w-1.5 h-2.5" style={{ background: '#cc3333' }} />
            <div className="absolute -bottom-1 right-[14px] w-1.5 h-2.5" style={{ background: '#cc3333' }} />
            {/* Thin heels */}
            <div className="absolute -bottom-1 left-[15px] w-0.5 h-1" style={{ background: '#aa2222' }} />
            <div className="absolute -bottom-1 right-[15px] w-0.5 h-1" style={{ background: '#aa2222' }} />
          </>
        )}
        
        {/* Punk boots */}
        {pedestrian.archetype === 'punk' && (
          <>
            <div className="absolute -bottom-0.5 left-[13px] w-2 h-2" style={{ background: '#1a1a1a', border: '1px solid #3a3a3a' }} />
            <div className="absolute -bottom-0.5 right-[13px] w-2 h-2" style={{ background: '#1a1a1a', border: '1px solid #3a3a3a' }} />
          </>
        )}
        
        {/* Accessories */}
        {style.accessory === 'briefcase' && (
          <div className="absolute top-[18px] -right-3 w-4 h-3 rounded-sm border" style={{ background: '#2a1a1a', borderColor: '#4a3a3a' }} />
        )}
        {style.accessory === 'backpack' && (
          <div className="absolute top-[12px] -left-2 w-4 h-6 rounded" style={{ background: '#4a5a3a', border: '1px solid #3a4a2a' }}>
            <div className="absolute top-1 left-0.5 w-3 h-1" style={{ background: '#3a4a2a' }} />
          </div>
        )}
        {style.accessory === 'camera' && (
          <div className="absolute top-[16px] left-1/2 -translate-x-1/2 w-4 h-2.5 rounded" style={{ background: '#3a3a3a', border: '1px solid #5a5a5a' }}>
            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full" style={{ background: '#1a1a1a' }} />
          </div>
        )}
        {style.accessory === 'cane' && (
          <div 
            className="absolute bottom-0 -right-2 w-1 h-8 origin-bottom rounded-t" 
            style={{ 
              background: '#5a4a3a', 
              transform: `rotate(${walkFrame % 2 === 0 ? 8 : -5}deg)` 
            }} 
          />
        )}
        {style.accessory === 'bag' && (
          <div className="absolute top-[14px] -right-2 w-3 h-4 rounded" style={{ background: '#3a3a4a' }}>
            <div className="absolute top-0 left-0.5 w-0.5 h-3" style={{ background: '#2a2a3a' }} />
          </div>
        )}
        {style.accessory === 'purse' && (
          <div className="absolute top-[14px] -right-2 w-2.5 h-2.5 rounded" style={{ background: '#5a2a3a', border: '1px solid #7a4a5a' }}>
            <div className="absolute -top-1 left-0.5 w-1.5 h-1 rounded-t" style={{ background: '#7a4a5a' }} />
          </div>
        )}
        {style.accessory === 'radio' && (
          <div className="absolute top-[16px] -left-2 w-2 h-3 rounded" style={{ background: '#2a2a2a', border: '1px solid #3a3a3a' }}>
            <div className="absolute -top-2 left-0.5 w-0.5 h-2" style={{ background: '#3a3a3a' }} />
          </div>
        )}
      </div>
      
      {/* Action hints when close - dealers show BUY */}
      {showActionHint && pedestrian.archetype === 'dealer' && (
        <div 
          className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[7px] animate-pulse rounded font-bold whitespace-nowrap"
          style={{ background: '#1a1a2a', color: '#44ff44', border: '1px solid #22aa22' }}
        >
          💊 BUY
        </div>
      )}
      
      {/* Regular action hints for non-dealers */}
      {showActionHint && pedestrian.archetype !== 'dealer' && (
        <div 
          className="absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[6px] animate-pulse rounded font-bold whitespace-nowrap"
          style={{ background: '#1a1a1a', color: '#9bbc0f', border: '1px solid #8bac0f' }}
        >
          STEAL | PITCH | TRADE | HIT
        </div>
      )}
      
      {/* Legacy B/C indicator fallback */}
      {isNearPlayer && pedestrian.canBeStolen && !showActionHint && (
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
