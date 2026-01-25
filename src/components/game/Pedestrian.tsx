import { useEffect, useState } from 'react';
import { PedestrianState, PedestrianAction } from '@/types/game';

interface PedestrianProps {
  pedestrian: PedestrianState;
  playerX: number;
  actionsAvailable?: PedestrianAction[];
}

// Chibi style configs for each archetype - Sega Mega Drive aesthetic
const ARCHETYPE_STYLES: Record<string, { 
  skinColor: string;
  skinBorder: string;
  bodyColor: string;
  bodyBorder: string;
  hairColor: string;
  hairStyle: 'bald' | 'short' | 'long' | 'mohawk' | 'grey' | 'spiky' | 'big' | 'curly' | 'slick';
  eyeColor: string;
  cheekColor: string;
  walkSpeed: number;
  accessory?: string;
  hasMustache?: boolean;
  hasBeard?: boolean;
  hasGlasses?: boolean;
  hasHat?: boolean;
  hatColor?: string;
  isPig?: boolean; // For cops
}> = {
  businessman: { 
    skinColor: '#ffcdb8',
    skinBorder: '#e8a888',
    bodyColor: '#2a2a3a',
    bodyBorder: '#1a1a2a',
    hairColor: '#3a3a3a',
    hairStyle: 'slick',
    eyeColor: '#1a1a1a',
    cheekColor: '#ff999955',
    walkSpeed: 180,
    accessory: 'briefcase',
    hasMustache: true,
  },
  clubber: { 
    skinColor: '#e8c8a8',
    skinBorder: '#d8a888',
    bodyColor: '#8a2a8a',
    bodyBorder: '#6a1a6a',
    hairColor: '#ff44aa',
    hairStyle: 'mohawk',
    eyeColor: '#1a1a1a',
    cheekColor: '#ff66ff55',
    walkSpeed: 140,
  },
  tourist: { 
    skinColor: '#ffd8c8',
    skinBorder: '#e8b8a8',
    bodyColor: '#4a7a4a',
    bodyBorder: '#3a5a3a',
    hairColor: '#5a4a3a',
    hairStyle: 'short',
    eyeColor: '#1a1a1a',
    cheekColor: '#ff999955',
    walkSpeed: 250,
    accessory: 'camera',
    hasHat: true,
    hatColor: '#6a5a4a',
  },
  pensioner: { 
    skinColor: '#e8d8c8',
    skinBorder: '#c8b8a8',
    bodyColor: '#6a6a6a',
    bodyBorder: '#4a4a4a',
    hairColor: '#aaaaaa',
    hairStyle: 'grey',
    eyeColor: '#2a2a2a',
    cheekColor: '#cc888855',
    walkSpeed: 400,
    accessory: 'cane',
    hasGlasses: true,
  },
  backpacker: { 
    skinColor: '#d8b898',
    skinBorder: '#b89878',
    bodyColor: '#5a6a4a',
    bodyBorder: '#4a5a3a',
    hairColor: '#4a3a2a',
    hairStyle: 'long',
    eyeColor: '#1a1a1a',
    cheekColor: '#cc886655',
    walkSpeed: 200,
    accessory: 'backpack',
    hasBeard: true,
  },
  junkie: { 
    skinColor: '#c8b898',
    skinBorder: '#a89878',
    bodyColor: '#3a3a3a',
    bodyBorder: '#2a2a2a',
    hairColor: '#4a4a3a',
    hairStyle: 'bald',
    eyeColor: '#3a2a2a',
    cheekColor: '#88666644',
    walkSpeed: 350,
  },
  sexworker: { 
    skinColor: '#ffd0c0',
    skinBorder: '#e8b0a0',
    bodyColor: '#cc2266',
    bodyBorder: '#aa1144',
    hairColor: '#4a2a2a',
    hairStyle: 'big',
    eyeColor: '#1a1a1a',
    cheekColor: '#ff77aa66',
    walkSpeed: 180,
    accessory: 'purse',
  },
  student: { 
    skinColor: '#ffd8c8',
    skinBorder: '#e8b8a8',
    bodyColor: '#3a5a7a',
    bodyBorder: '#2a4a6a',
    hairColor: '#4a3a2a',
    hairStyle: 'curly',
    eyeColor: '#1a1a1a',
    cheekColor: '#ff999955',
    walkSpeed: 160,
    accessory: 'bag',
  },
  cop: {
    // PIG!
    skinColor: '#ffb8b8',
    skinBorder: '#e89898',
    bodyColor: '#1a3a5a',
    bodyBorder: '#0a2a4a',
    hairColor: '#ffb8b8',
    hairStyle: 'bald',
    eyeColor: '#1a1a1a',
    cheekColor: '#ff888866',
    walkSpeed: 180,
    hasHat: true,
    hatColor: '#1a3a5a',
    isPig: true,
  },
  punk: {
    skinColor: '#e8c8a8',
    skinBorder: '#c8a888',
    bodyColor: '#1a1a1a',
    bodyBorder: '#0a0a0a',
    hairColor: '#1a1a1a',
    hairStyle: 'spiky',
    eyeColor: '#1a1a1a',
    cheekColor: '#88666655',
    walkSpeed: 130,
  },
  dealer: {
    skinColor: '#d8b898',
    skinBorder: '#b89878',
    bodyColor: '#2a2a3a',
    bodyBorder: '#1a1a2a',
    hairColor: '#2a2a2a',
    hairStyle: 'bald',
    eyeColor: '#1a1a1a',
    cheekColor: '#88666644',
    walkSpeed: 280,
    accessory: 'hood',
  },
  vc: {
    // Venture Capitalist - fancy Patagonia vest
    skinColor: '#ffcdb8',
    skinBorder: '#e8a888',
    bodyColor: '#2a4a5a',
    bodyBorder: '#1a3a4a',
    hairColor: '#5a5a5a',
    hairStyle: 'slick',
    eyeColor: '#1a1a1a',
    cheekColor: '#ff999955',
    walkSpeed: 200,
    accessory: 'coffee',
    hasGlasses: true,
  },
  founder: {
    // Fellow startup founder - hoodie
    skinColor: '#ffd8c8',
    skinBorder: '#e8b8a8',
    bodyColor: '#3a3a4a',
    bodyBorder: '#2a2a3a',
    hairColor: '#3a2a2a',
    hairStyle: 'curly',
    eyeColor: '#1a1a1a',
    cheekColor: '#ff886655',
    walkSpeed: 150,
    accessory: 'laptop',
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
  
  // Render hair based on style
  const renderHair = () => {
    if (style.isPig) return null; // Pigs don't have hair
    
    switch (style.hairStyle) {
      case 'bald':
        return null;
      case 'grey':
        return (
          <div 
            className="absolute -top-1 left-0.5 right-0.5 h-3 rounded-t-full"
            style={{ background: style.hairColor }}
          />
        );
      case 'long':
        return (
          <>
            <div className="absolute -top-1 left-0 right-0 h-3 rounded-t" style={{ background: style.hairColor }} />
            <div className="absolute top-3 -left-1 w-2 h-4 rounded" style={{ background: style.hairColor }} />
            <div className="absolute top-3 -right-1 w-2 h-4 rounded" style={{ background: style.hairColor }} />
          </>
        );
      case 'mohawk':
        return (
          <div 
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-5 rounded-t"
            style={{ background: style.hairColor }}
          />
        );
      case 'curly':
        return (
          <div 
            className="absolute -top-1.5 -left-0.5 -right-0.5 h-4 rounded-t-full"
            style={{ background: style.hairColor, borderRadius: '60% 60% 30% 30%' }}
          />
        );
      case 'spiky':
        return (
          <>
            <div className="absolute -top-3 left-0.5 w-2 h-4 rotate-[-15deg]" style={{ background: style.hairColor }} />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-5" style={{ background: style.hairColor }} />
            <div className="absolute -top-3 right-0.5 w-2 h-4 rotate-[15deg]" style={{ background: style.hairColor }} />
          </>
        );
      case 'big':
        return (
          <>
            <div className="absolute -top-2 -left-1.5 right-[-6px] h-6 rounded-t-full" style={{ background: style.hairColor }} />
            <div className="absolute top-1 -left-2.5 w-3 h-5 rounded" style={{ background: style.hairColor }} />
            <div className="absolute top-1 -right-2.5 w-3 h-5 rounded" style={{ background: style.hairColor }} />
          </>
        );
      case 'slick':
        return (
          <>
            <div className="absolute -top-0.5 left-1 right-1 h-2 rounded-t" style={{ background: style.hairColor }} />
            {/* Receding temples */}
            <div className="absolute -top-0.5 left-0 w-1.5 h-1.5 rounded-tl" style={{ background: style.skinColor }} />
            <div className="absolute -top-0.5 right-0 w-1.5 h-1.5 rounded-tr" style={{ background: style.skinColor }} />
          </>
        );
      case 'short':
      default:
        return (
          <div 
            className="absolute -top-1 left-0.5 right-0.5 h-2.5 rounded-t"
            style={{ background: style.hairColor }}
          />
        );
    }
  };

  return (
    <div 
      className="absolute transition-all duration-75 z-25"
      style={{ 
        left: `${pedestrian.x}%`, 
        bottom: '46%',
        transform: `translateX(-50%) ${pedestrian.direction === 'left' ? 'scaleX(-1)' : ''}`,
        opacity: isNearPlayer ? 1 : 0.9,
      }}
    >
      {/* Shadow */}
      <div 
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full opacity-35"
        style={{ background: '#0a0a0a', filter: 'blur(1px)' }}
      />
      
      {/* Chibi sprite */}
      <div className="relative w-12 h-14">
        {/* Hat (if any) - render before head */}
        {style.hasHat && !style.isPig && (
          <div 
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-3 rounded-t z-10"
            style={{ background: style.hatColor, border: `1px solid ${style.bodyBorder}` }}
          />
        )}
        
        {/* Hood for dealer */}
        {style.accessory === 'hood' && (
          <>
            <div 
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-11 h-8 rounded-t-full z-10"
              style={{ background: style.bodyColor, border: `2px solid ${style.bodyBorder}` }}
            />
            <div 
              className="absolute top-2 left-1/2 -translate-x-1/2 w-5 h-3 rounded-b z-20"
              style={{ background: '#0a0a0f' }}
            />
          </>
        )}
        
        {/* BIG HEAD - Sega chibi style */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-9 rounded-full"
          style={{ 
            background: style.isPig 
              ? `linear-gradient(180deg, ${style.skinColor} 0%, #ffaaaa 100%)` 
              : `linear-gradient(180deg, ${style.skinColor} 0%, ${style.skinBorder} 100%)`,
            border: `2px solid ${style.skinBorder}`,
            opacity: style.accessory === 'hood' ? 0.7 : 1,
          }}
        >
          {/* Hair (non-pigs) */}
          {!style.isPig && style.accessory !== 'hood' && renderHair()}
          
          {/* PIG SNOUT */}
          {style.isPig && (
            <>
              {/* Pig ears */}
              <div 
                className="absolute -top-1 left-0 w-3 h-3 rotate-[-20deg] rounded-full"
                style={{ background: style.skinColor, border: `1px solid ${style.skinBorder}` }}
              />
              <div 
                className="absolute -top-1 right-0 w-3 h-3 rotate-[20deg] rounded-full"
                style={{ background: style.skinColor, border: `1px solid ${style.skinBorder}` }}
              />
              {/* Snout */}
              <div 
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-3 rounded-full"
                style={{ background: '#ffaaaa', border: `1px solid ${style.skinBorder}` }}
              >
                {/* Nostrils */}
                <div className="absolute top-1 left-1 w-1 h-1 rounded-full" style={{ background: '#884444' }} />
                <div className="absolute top-1 right-1 w-1 h-1 rounded-full" style={{ background: '#884444' }} />
              </div>
              {/* Cop hat on pig */}
              <div 
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 rounded-t"
                style={{ background: style.hatColor, border: `1px solid ${style.bodyBorder}` }}
              >
                {/* Badge on hat */}
                <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-2 h-1.5" style={{ background: '#ccaa44' }} />
              </div>
            </>
          )}
          
          {/* Eyes */}
          <div 
            className="absolute top-2.5 left-1 w-2.5 h-2.5 rounded-full"
            style={{ background: '#ffffff', border: '1px solid #cccccc' }}
          >
            <div 
              className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full"
              style={{ background: style.eyeColor }}
            />
            <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 rounded-full" style={{ background: '#ffffff' }} />
          </div>
          <div 
            className="absolute top-2.5 right-1 w-2.5 h-2.5 rounded-full"
            style={{ background: '#ffffff', border: '1px solid #cccccc' }}
          >
            <div 
              className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full"
              style={{ background: style.eyeColor }}
            />
            <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 rounded-full" style={{ background: '#ffffff' }} />
          </div>
          
          {/* Glasses */}
          {style.hasGlasses && (
            <>
              <div className="absolute top-2 left-0 w-3.5 h-3 rounded border-2" style={{ borderColor: '#4a4a4a', background: 'transparent' }} />
              <div className="absolute top-2 right-0 w-3.5 h-3 rounded border-2" style={{ borderColor: '#4a4a4a', background: 'transparent' }} />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-0.5" style={{ background: '#4a4a4a' }} />
            </>
          )}
          
          {/* Rosy cheeks */}
          <div 
            className="absolute top-4.5 left-0 w-2 h-1.5 rounded-full"
            style={{ background: style.cheekColor }}
          />
          <div 
            className="absolute top-4.5 right-0 w-2 h-1.5 rounded-full"
            style={{ background: style.cheekColor }}
          />
          
          {/* Mustache */}
          {style.hasMustache && !style.isPig && (
            <div 
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded"
              style={{ background: style.hairColor }}
            />
          )}
          
          {/* Beard */}
          {style.hasBeard && !style.isPig && (
            <div 
              className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-5 h-3 rounded-b"
              style={{ background: style.hairColor }}
            />
          )}
          
          {/* Mouth (non-pigs) */}
          {!style.isPig && (
            <div 
              className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1 rounded-b-full"
              style={{ background: '#cc8888' }}
            />
          )}
        </div>
        
        {/* Tiny body */}
        <div 
          className="absolute top-8 left-1/2 -translate-x-1/2 w-6 h-4 rounded"
          style={{ background: style.bodyColor, border: `1px solid ${style.bodyBorder}` }}
        >
          {/* Cop badge */}
          {style.isPig && (
            <div className="absolute top-0.5 left-0.5 w-2 h-2 rounded-sm" style={{ background: '#ccaa44' }} />
          )}
          {/* Tie for businessman */}
          {pedestrian.archetype === 'businessman' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3" style={{ background: '#aa3333' }} />
          )}
        </div>
        
        {/* Stubby arms */}
        <div 
          className="absolute top-8 left-0.5 w-2 h-3 rounded-full origin-top transition-transform"
          style={{ 
            background: style.skinColor,
            border: `1px solid ${style.skinBorder}`,
            transform: `rotate(${walkFrame % 2 === 0 ? 25 : -25}deg)`,
          }}
        />
        <div 
          className="absolute top-8 right-0.5 w-2 h-3 rounded-full origin-top transition-transform"
          style={{ 
            background: style.skinColor,
            border: `1px solid ${style.skinBorder}`,
            transform: `rotate(${walkFrame % 2 === 0 ? -25 : 25}deg)`,
          }}
        />
        
        {/* Stubby legs - waddle animation */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div 
            className="w-2 h-3 rounded-b-full transition-transform"
            style={{ 
              background: style.skinColor,
              border: `1px solid ${style.skinBorder}`,
              transform: `translateY(${walkFrame % 2 === 0 ? 0 : 2}px) rotate(${walkFrame % 2 === 0 ? -8 : 8}deg)`,
            }}
          />
          <div 
            className="w-2 h-3 rounded-b-full transition-transform"
            style={{ 
              background: style.skinColor,
              border: `1px solid ${style.skinBorder}`,
              transform: `translateY(${walkFrame % 2 === 1 ? 0 : 2}px) rotate(${walkFrame % 2 === 1 ? -8 : 8}deg)`,
            }}
          />
        </div>
        
        {/* Accessories */}
        {style.accessory === 'briefcase' && (
          <div 
            className="absolute top-10 -right-2 w-4 h-3 rounded-sm"
            style={{ background: '#3a2a1a', border: '1px solid #5a4a3a' }}
          />
        )}
        {style.accessory === 'backpack' && (
          <div 
            className="absolute top-7 -left-3 w-5 h-6 rounded"
            style={{ background: '#5a7a4a', border: '1px solid #4a6a3a' }}
          >
            <div className="absolute top-1 left-1 w-3 h-1" style={{ background: '#4a6a3a' }} />
          </div>
        )}
        {style.accessory === 'camera' && (
          <div 
            className="absolute top-9 left-1/2 -translate-x-1/2 w-5 h-3 rounded"
            style={{ background: '#4a4a4a', border: '1px solid #6a6a6a' }}
          >
            <div className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full" style={{ background: '#2a2a2a' }} />
          </div>
        )}
        {style.accessory === 'cane' && (
          <div 
            className="absolute bottom-0 -right-2 w-1 h-8 origin-bottom rounded-t transition-transform" 
            style={{ 
              background: '#6a5a4a', 
              transform: `rotate(${walkFrame % 2 === 0 ? 10 : -8}deg)`,
            }} 
          />
        )}
        {style.accessory === 'bag' && (
          <div 
            className="absolute top-8 -right-2.5 w-4 h-4 rounded"
            style={{ background: '#4a4a5a', border: '1px solid #3a3a4a' }}
          />
        )}
        {style.accessory === 'purse' && (
          <div 
            className="absolute top-9 -right-2 w-3 h-3 rounded"
            style={{ background: '#aa4466', border: '1px solid #884455' }}
          >
            <div className="absolute -top-1.5 left-0.5 w-2 h-1.5 rounded-t" style={{ background: '#884455' }} />
          </div>
        )}
      </div>
      
      {/* Action hints - dealers show BUY */}
      {showActionHint && pedestrian.archetype === 'dealer' && (
        <div 
          className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[7px] animate-pulse rounded font-bold whitespace-nowrap"
          style={{ background: '#1a1a2a', color: '#44ff44', border: '1px solid #22aa22' }}
        >
          💊 BUY
        </div>
      )}
      
      {/* Regular action hints */}
      {showActionHint && pedestrian.archetype !== 'dealer' && (
        <div 
          className="absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[6px] animate-pulse rounded font-bold whitespace-nowrap"
          style={{ background: '#1a1a1a', color: '#9bbc0f', border: '1px solid #8bac0f' }}
        >
          STEAL | PITCH | TRADE | HIT
        </div>
      )}
      
      {/* Fallback B/C indicator */}
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
