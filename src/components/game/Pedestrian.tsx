import { useEffect, useState } from 'react';
import { PedestrianState, PedestrianAction } from '@/types/game';

interface PedestrianProps {
  pedestrian: PedestrianState;
  playerX: number;
  actionsAvailable?: PedestrianAction[];
}

// Enhanced chibi style configs for each archetype - more distinctive visuals
const ARCHETYPE_STYLES: Record<string, { 
  skinColor: string;
  skinBorder: string;
  bodyColor: string;
  bodyBorder: string;
  hairColor: string;
  hairStyle: 'bald' | 'short' | 'long' | 'mohawk' | 'grey' | 'spiky' | 'big' | 'curly' | 'slick' | 'ponytail' | 'hoodie';
  eyeColor: string;
  cheekColor: string;
  walkSpeed: number;
  bounceIntensity: number;
  swayIntensity: number;
  accessory?: string;
  hasMustache?: boolean;
  hasBeard?: boolean;
  hasGlasses?: boolean;
  hasHat?: boolean;
  hatColor?: string;
  isPig?: boolean;
  shirtColor?: string;
  pantsColor?: string;
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
    bounceIntensity: 0.8,
    swayIntensity: 0.3,
    accessory: 'briefcase',
    hasMustache: true,
    shirtColor: '#ffffff',
    pantsColor: '#2a2a3a',
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
    walkSpeed: 120,
    bounceIntensity: 1.5,
    swayIntensity: 1.2,
    shirtColor: '#ff00aa',
    pantsColor: '#1a1a1a',
  },
  tourist: { 
    skinColor: '#ffd8c8',
    skinBorder: '#e8b8a8',
    bodyColor: '#ff6b35',
    bodyBorder: '#dd4a15',
    hairColor: '#5a4a3a',
    hairStyle: 'short',
    eyeColor: '#1a1a1a',
    cheekColor: '#ff999955',
    walkSpeed: 280,
    bounceIntensity: 0.6,
    swayIntensity: 0.5,
    accessory: 'camera',
    hasHat: true,
    hatColor: '#6a5a4a',
    shirtColor: '#ff6b35',
    pantsColor: '#4a4a3a',
  },
  pensioner: { 
    skinColor: '#e8d8c8',
    skinBorder: '#c8b8a8',
    bodyColor: '#7a6a5a',
    bodyBorder: '#5a4a3a',
    hairColor: '#c8c8c8',
    hairStyle: 'grey',
    eyeColor: '#2a2a2a',
    cheekColor: '#cc888855',
    walkSpeed: 450,
    bounceIntensity: 0.3,
    swayIntensity: 0.2,
    accessory: 'cane',
    hasGlasses: true,
    shirtColor: '#8a7a6a',
    pantsColor: '#5a4a3a',
  },
  backpacker: { 
    skinColor: '#d8b898',
    skinBorder: '#b89878',
    bodyColor: '#5a8a5a',
    bodyBorder: '#4a7a4a',
    hairColor: '#4a3a2a',
    hairStyle: 'long',
    eyeColor: '#1a1a1a',
    cheekColor: '#cc886655',
    walkSpeed: 200,
    bounceIntensity: 1.0,
    swayIntensity: 0.8,
    accessory: 'backpack',
    hasBeard: true,
    shirtColor: '#6a8a5a',
    pantsColor: '#5a5a4a',
  },
  junkie: { 
    skinColor: '#b8a888',
    skinBorder: '#988868',
    bodyColor: '#3a3a3a',
    bodyBorder: '#2a2a2a',
    hairColor: '#4a4a3a',
    hairStyle: 'bald',
    eyeColor: '#5a3a3a',
    cheekColor: '#66444444',
    walkSpeed: 380,
    bounceIntensity: 0.4,
    swayIntensity: 1.5, // Staggering
    shirtColor: '#4a4a4a',
    pantsColor: '#2a2a2a',
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
    walkSpeed: 160,
    bounceIntensity: 1.3,
    swayIntensity: 1.4,
    accessory: 'purse',
    shirtColor: '#cc2266',
    pantsColor: '#1a1a1a',
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
    walkSpeed: 150,
    bounceIntensity: 1.2,
    swayIntensity: 0.6,
    accessory: 'bag',
    shirtColor: '#5a7a9a',
    pantsColor: '#3a3a4a',
  },
  cop: {
    skinColor: '#ffb8b8',
    skinBorder: '#e89898',
    bodyColor: '#1a3a5a',
    bodyBorder: '#0a2a4a',
    hairColor: '#ffb8b8',
    hairStyle: 'bald',
    eyeColor: '#1a1a1a',
    cheekColor: '#ff888866',
    walkSpeed: 200,
    bounceIntensity: 0.7,
    swayIntensity: 0.4,
    hasHat: true,
    hatColor: '#1a3a5a',
    isPig: true,
    shirtColor: '#1a3a5a',
    pantsColor: '#1a2a3a',
  },
  punk: {
    skinColor: '#e8c8a8',
    skinBorder: '#c8a888',
    bodyColor: '#1a1a1a',
    bodyBorder: '#0a0a0a',
    hairColor: '#44ff44',
    hairStyle: 'spiky',
    eyeColor: '#1a1a1a',
    cheekColor: '#88666655',
    walkSpeed: 110,
    bounceIntensity: 1.6,
    swayIntensity: 0.9,
    shirtColor: '#1a1a1a',
    pantsColor: '#2a2a2a',
  },
  dealer: {
    skinColor: '#d8b898',
    skinBorder: '#b89878',
    bodyColor: '#2a2a3a',
    bodyBorder: '#1a1a2a',
    hairColor: '#2a2a2a',
    hairStyle: 'hoodie',
    eyeColor: '#1a1a1a',
    cheekColor: '#88666644',
    walkSpeed: 260,
    bounceIntensity: 0.5,
    swayIntensity: 0.3,
    accessory: 'hood',
    shirtColor: '#3a3a4a',
    pantsColor: '#2a2a3a',
  },
  vc: {
    skinColor: '#ffcdb8',
    skinBorder: '#e8a888',
    bodyColor: '#3a5a6a',
    bodyBorder: '#2a4a5a',
    hairColor: '#5a5a5a',
    hairStyle: 'slick',
    eyeColor: '#1a1a1a',
    cheekColor: '#ff999955',
    walkSpeed: 220,
    bounceIntensity: 0.6,
    swayIntensity: 0.4,
    accessory: 'coffee',
    hasGlasses: true,
    shirtColor: '#4a6a7a',
    pantsColor: '#3a4a5a',
  },
  founder: {
    skinColor: '#ffd8c8',
    skinBorder: '#e8b8a8',
    bodyColor: '#4a4a5a',
    bodyBorder: '#3a3a4a',
    hairColor: '#3a2a2a',
    hairStyle: 'curly',
    eyeColor: '#1a1a1a',
    cheekColor: '#ff886655',
    walkSpeed: 140,
    bounceIntensity: 1.1,
    swayIntensity: 0.7,
    accessory: 'laptop',
    shirtColor: '#5a5a6a',
    pantsColor: '#3a3a4a',
  },
};

export function Pedestrian({ pedestrian, playerX, actionsAvailable = [] }: PedestrianProps) {
  const [walkFrame, setWalkFrame] = useState(0);
  const [bouncePhase, setBouncePhase] = useState(0);
  
  const style = ARCHETYPE_STYLES[pedestrian.archetype] || ARCHETYPE_STYLES.student;
  
  // Walking animation with bounce
  useEffect(() => {
    const interval = setInterval(() => {
      setWalkFrame(f => (f + 1) % 8);
      setBouncePhase(p => (p + 1) % 16);
    }, style.walkSpeed / 2);
    return () => clearInterval(interval);
  }, [style.walkSpeed]);

  const isNearPlayer = Math.abs(pedestrian.x - playerX) < 8;
  const showActionHint = isNearPlayer && pedestrian.canBeStolen && actionsAvailable.length > 0;
  
  // Calculate bounce and sway for natural movement
  const bounce = Math.sin(bouncePhase * Math.PI / 4) * style.bounceIntensity * 2;
  const sway = Math.sin(bouncePhase * Math.PI / 8) * style.swayIntensity * 1.5;
  const headBob = Math.sin(bouncePhase * Math.PI / 4 + 0.5) * style.bounceIntensity;
  
  // Leg animation phases
  const leftLegPhase = Math.sin(walkFrame * Math.PI / 2);
  const rightLegPhase = Math.sin(walkFrame * Math.PI / 2 + Math.PI);
  const armSwing = Math.sin(walkFrame * Math.PI / 2) * 35;
  
  // Render hair based on style
  const renderHair = () => {
    if (style.isPig || style.hairStyle === 'hoodie') return null;
    
    switch (style.hairStyle) {
      case 'bald':
        return null;
      case 'grey':
        return (
          <>
            <div 
              className="absolute -top-1 left-1 right-1 h-3 rounded-t-full"
              style={{ background: style.hairColor }}
            />
            {/* Bald spot */}
            <div 
              className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-3 h-2 rounded-full"
              style={{ background: style.skinColor }}
            />
          </>
        );
      case 'long':
        return (
          <>
            <div className="absolute -top-1.5 left-0 right-0 h-4 rounded-t-full" style={{ background: style.hairColor }} />
            <div className="absolute top-4 -left-1.5 w-2.5 h-6 rounded-b" style={{ background: style.hairColor }} />
            <div className="absolute top-4 -right-1.5 w-2.5 h-6 rounded-b" style={{ background: style.hairColor }} />
          </>
        );
      case 'mohawk':
        return (
          <>
            <div 
              className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-6"
              style={{ 
                background: `linear-gradient(0deg, ${style.hairColor} 0%, ${style.hairColor}88 100%)`,
                clipPath: 'polygon(20% 100%, 80% 100%, 100% 0%, 0% 0%)',
              }}
            />
            {/* Sides shaved */}
            <div className="absolute -top-0.5 left-0 w-2 h-2 rounded-tl" style={{ background: style.skinBorder }} />
            <div className="absolute -top-0.5 right-0 w-2 h-2 rounded-tr" style={{ background: style.skinBorder }} />
          </>
        );
      case 'curly':
        return (
          <div 
            className="absolute -top-2 -left-1 -right-1 h-5 rounded-t-full"
            style={{ 
              background: style.hairColor,
              boxShadow: `inset 0 -2px 4px ${style.hairColor}88`,
            }}
          >
            {/* Curly texture */}
            <div className="absolute top-0.5 left-1 w-1.5 h-1.5 rounded-full" style={{ background: style.hairColor, filter: 'brightness(0.8)' }} />
            <div className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: style.hairColor, filter: 'brightness(0.8)' }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full" style={{ background: style.hairColor, filter: 'brightness(0.9)' }} />
          </div>
        );
      case 'spiky':
        return (
          <>
            <div className="absolute -top-4 left-1 w-1.5 h-5 rotate-[-20deg]" style={{ background: style.hairColor }} />
            <div className="absolute -top-5 left-3 w-1.5 h-6" style={{ background: style.hairColor }} />
            <div className="absolute -top-4 right-3 w-1.5 h-5" style={{ background: style.hairColor }} />
            <div className="absolute -top-3 right-1 w-1.5 h-4 rotate-[20deg]" style={{ background: style.hairColor }} />
          </>
        );
      case 'big':
        return (
          <>
            <div 
              className="absolute -top-3 -left-2 -right-2 h-7 rounded-t-full"
              style={{ background: style.hairColor }}
            />
            <div className="absolute top-2 -left-3 w-3 h-6 rounded-full" style={{ background: style.hairColor }} />
            <div className="absolute top-2 -right-3 w-3 h-6 rounded-full" style={{ background: style.hairColor }} />
          </>
        );
      case 'slick':
        return (
          <>
            <div className="absolute -top-0.5 left-1.5 right-1.5 h-2.5 rounded-t" style={{ background: style.hairColor }} />
            {/* Side part */}
            <div className="absolute -top-0.5 left-2 w-0.5 h-2" style={{ background: style.skinColor }} />
            {/* Receding temples */}
            <div className="absolute -top-0.5 left-0 w-2 h-2 rounded-tl" style={{ background: style.skinColor }} />
            <div className="absolute -top-0.5 right-0 w-2 h-2 rounded-tr" style={{ background: style.skinColor }} />
          </>
        );
      case 'ponytail':
        return (
          <>
            <div className="absolute -top-1 left-1 right-1 h-3 rounded-t" style={{ background: style.hairColor }} />
            <div className="absolute top-2 -right-4 w-5 h-2 rounded-r-full" style={{ background: style.hairColor }} />
          </>
        );
      case 'short':
      default:
        return (
          <div 
            className="absolute -top-1 left-0.5 right-0.5 h-3 rounded-t"
            style={{ background: style.hairColor }}
          />
        );
    }
  };

  return (
    <div 
      className="absolute transition-none z-25"
      style={{ 
        left: `${pedestrian.x}%`, 
        bottom: `calc(46% + ${bounce}px)`,
        transform: `translateX(-50%) ${pedestrian.direction === 'left' ? 'scaleX(-1)' : ''} rotate(${sway}deg)`,
        opacity: isNearPlayer ? 1 : 0.95,
        filter: isNearPlayer ? 'brightness(1.1)' : 'none',
      }}
    >
      {/* Shadow - scales with bounce */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{ 
          background: '#0a0a0a', 
          filter: 'blur(2px)',
          width: `${10 - bounce * 0.3}px`,
          height: `${3 - bounce * 0.1}px`,
          bottom: `${-4 - bounce}px`,
          opacity: 0.4 - bounce * 0.02,
        }}
      />
      
      {/* Chibi sprite container */}
      <div className="relative w-12 h-16">
        
        {/* Hood for dealer - render first as background */}
        {style.accessory === 'hood' && (
          <div 
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-10 rounded-t-full z-5"
            style={{ 
              background: style.bodyColor, 
              border: `2px solid ${style.bodyBorder}`,
            }}
          />
        )}
        
        {/* Hat (if any) */}
        {style.hasHat && !style.isPig && (
          <div 
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-11 h-3 rounded-t z-15"
            style={{ 
              background: style.hatColor, 
              border: `1px solid ${style.bodyBorder}`,
              transform: `translateY(${headBob * 0.5}px)`,
            }}
          >
            {/* Hat brim */}
            <div 
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded"
              style={{ background: style.hatColor, borderBottom: `1px solid ${style.bodyBorder}` }}
            />
          </div>
        )}
        
        {/* BIG HEAD - Sega chibi style */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-9 rounded-full z-10"
          style={{ 
            background: style.isPig 
              ? `radial-gradient(circle at 30% 30%, #ffcccc 0%, ${style.skinColor} 50%, ${style.skinBorder} 100%)` 
              : `radial-gradient(circle at 30% 30%, ${style.skinColor} 0%, ${style.skinBorder} 100%)`,
            border: `2px solid ${style.skinBorder}`,
            transform: `translateY(${headBob}px)`,
            boxShadow: style.accessory === 'hood' ? 'inset 0 -5px 10px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          {/* Hair (non-pigs, non-hooded) */}
          {!style.isPig && style.accessory !== 'hood' && renderHair()}
          
          {/* PIG features */}
          {style.isPig && (
            <>
              {/* Pig ears */}
              <div 
                className="absolute -top-1 -left-1 w-3.5 h-4 rotate-[-25deg] rounded-full"
                style={{ 
                  background: style.skinColor, 
                  border: `1px solid ${style.skinBorder}`,
                }}
              >
                <div className="absolute inset-1 rounded-full" style={{ background: '#ffaaaa' }} />
              </div>
              <div 
                className="absolute -top-1 -right-1 w-3.5 h-4 rotate-[25deg] rounded-full"
                style={{ 
                  background: style.skinColor, 
                  border: `1px solid ${style.skinBorder}`,
                }}
              >
                <div className="absolute inset-1 rounded-full" style={{ background: '#ffaaaa' }} />
              </div>
              {/* Snout */}
              <div 
                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-3.5 rounded-full z-20"
                style={{ 
                  background: '#ffbbbb', 
                  border: `1px solid ${style.skinBorder}`,
                }}
              >
                {/* Nostrils */}
                <div className="absolute top-1.5 left-1 w-1 h-1 rounded-full" style={{ background: '#885555' }} />
                <div className="absolute top-1.5 right-1 w-1 h-1 rounded-full" style={{ background: '#885555' }} />
              </div>
              {/* Cop hat on pig */}
              <div 
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-9 h-4 rounded-t z-25"
                style={{ 
                  background: style.hatColor, 
                  border: `1px solid ${style.bodyBorder}`,
                  transform: `translateY(${headBob * 0.5}px)`,
                }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1" style={{ background: style.hatColor }} />
                {/* Badge on hat */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2.5 h-2" style={{ background: '#ddaa44' }}>
                  <div className="absolute inset-0.5" style={{ background: '#ccaa44' }} />
                </div>
              </div>
            </>
          )}
          
          {/* Eyes */}
          <div 
            className="absolute top-2.5 left-1 w-2.5 h-3 rounded-full"
            style={{ background: '#ffffff', border: '1px solid #dddddd' }}
          >
            <div 
              className="absolute top-1 left-0.5 w-1.5 h-1.5 rounded-full"
              style={{ background: style.eyeColor }}
            />
            <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 rounded-full" style={{ background: '#ffffff' }} />
          </div>
          <div 
            className="absolute top-2.5 right-1 w-2.5 h-3 rounded-full"
            style={{ background: '#ffffff', border: '1px solid #dddddd' }}
          >
            <div 
              className="absolute top-1 left-0.5 w-1.5 h-1.5 rounded-full"
              style={{ background: style.eyeColor }}
            />
            <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 rounded-full" style={{ background: '#ffffff' }} />
          </div>
          
          {/* Glasses */}
          {style.hasGlasses && (
            <>
              <div 
                className="absolute top-2 left-0 w-4 h-3.5 rounded border-2" 
                style={{ borderColor: '#3a3a3a', background: 'rgba(255,255,255,0.1)' }} 
              />
              <div 
                className="absolute top-2 right-0 w-4 h-3.5 rounded border-2" 
                style={{ borderColor: '#3a3a3a', background: 'rgba(255,255,255,0.1)' }} 
              />
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-2 h-0.5" style={{ background: '#3a3a3a' }} />
            </>
          )}
          
          {/* Rosy cheeks */}
          <div 
            className="absolute top-5 left-0 w-2 h-1.5 rounded-full"
            style={{ background: style.cheekColor }}
          />
          <div 
            className="absolute top-5 right-0 w-2 h-1.5 rounded-full"
            style={{ background: style.cheekColor }}
          />
          
          {/* Mustache */}
          {style.hasMustache && !style.isPig && (
            <div 
              className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-1.5"
              style={{ 
                background: style.hairColor,
                borderRadius: '0 0 4px 4px',
              }}
            />
          )}
          
          {/* Beard */}
          {style.hasBeard && !style.isPig && (
            <div 
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-4 rounded-b-full"
              style={{ background: style.hairColor }}
            />
          )}
          
          {/* Mouth (non-pigs) */}
          {!style.isPig && (
            <div 
              className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-1 rounded-b-full"
              style={{ background: '#cc8888' }}
            />
          )}
        </div>
        
        {/* Tiny body with clothes */}
        <div 
          className="absolute top-8 left-1/2 -translate-x-1/2 w-7 h-5 rounded z-5"
          style={{ 
            background: style.bodyColor, 
            border: `1px solid ${style.bodyBorder}`,
            transform: `translateY(${bounce * 0.3}px)`,
          }}
        >
          {/* Shirt/vest details */}
          {pedestrian.archetype === 'businessman' && (
            <>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-1" style={{ background: '#ffffff' }} />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3" style={{ background: '#cc3333' }} />
            </>
          )}
          {pedestrian.archetype === 'vc' && (
            <>
              {/* Patagonia vest */}
              <div className="absolute inset-0.5 rounded" style={{ background: '#4a6a7a' }}>
                <div className="absolute top-0.5 left-0.5 w-1 h-1" style={{ background: '#ffaa00' }} />
              </div>
            </>
          )}
          {pedestrian.archetype === 'founder' && (
            <>
              {/* Hoodie with startup logo */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-2 rounded" style={{ background: '#ff6644' }} />
            </>
          )}
          {style.isPig && (
            <div className="absolute top-0.5 left-0.5 w-2 h-2" style={{ background: '#ddaa44' }} />
          )}
        </div>
        
        {/* Arms with swing animation */}
        <div 
          className="absolute top-8.5 left-0 w-2 h-4 rounded-full origin-top"
          style={{ 
            background: style.accessory === 'hood' ? style.bodyColor : style.skinColor,
            border: `1px solid ${style.accessory === 'hood' ? style.bodyBorder : style.skinBorder}`,
            transform: `rotate(${armSwing}deg) translateY(${bounce * 0.2}px)`,
          }}
        >
          {/* Hand */}
          <div 
            className="absolute -bottom-1 left-0 w-2 h-2 rounded-full" 
            style={{ background: style.skinColor, border: `1px solid ${style.skinBorder}` }} 
          />
        </div>
        <div 
          className="absolute top-8.5 right-0 w-2 h-4 rounded-full origin-top"
          style={{ 
            background: style.accessory === 'hood' ? style.bodyColor : style.skinColor,
            border: `1px solid ${style.accessory === 'hood' ? style.bodyBorder : style.skinBorder}`,
            transform: `rotate(${-armSwing}deg) translateY(${bounce * 0.2}px)`,
          }}
        >
          {/* Hand */}
          <div 
            className="absolute -bottom-1 left-0 w-2 h-2 rounded-full" 
            style={{ background: style.skinColor, border: `1px solid ${style.skinBorder}` }} 
          />
        </div>
        
        {/* Legs with walking animation */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div 
            className="w-2.5 h-4 rounded-b origin-top"
            style={{ 
              background: style.pantsColor || style.bodyColor,
              border: `1px solid ${style.bodyBorder}`,
              transform: `rotate(${leftLegPhase * 20}deg) translateY(${leftLegPhase > 0 ? 0 : 2}px)`,
            }}
          >
            {/* Shoe */}
            <div 
              className="absolute -bottom-0.5 -left-0.5 w-3 h-1.5 rounded-b" 
              style={{ background: '#2a2a2a' }} 
            />
          </div>
          <div 
            className="w-2.5 h-4 rounded-b origin-top"
            style={{ 
              background: style.pantsColor || style.bodyColor,
              border: `1px solid ${style.bodyBorder}`,
              transform: `rotate(${rightLegPhase * 20}deg) translateY(${rightLegPhase > 0 ? 0 : 2}px)`,
            }}
          >
            {/* Shoe */}
            <div 
              className="absolute -bottom-0.5 -left-0.5 w-3 h-1.5 rounded-b" 
              style={{ background: '#2a2a2a' }} 
            />
          </div>
        </div>
        
        {/* Accessories */}
        {style.accessory === 'briefcase' && (
          <div 
            className="absolute top-11 -right-3 w-4 h-3.5 rounded-sm z-15"
            style={{ 
              background: '#5a4a3a', 
              border: '1px solid #4a3a2a',
              transform: `rotate(${-armSwing * 0.3}deg)`,
            }}
          >
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-2 h-0.5" style={{ background: '#3a2a1a' }} />
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1" style={{ background: '#ccaa44' }} />
          </div>
        )}
        {style.accessory === 'backpack' && (
          <div 
            className="absolute top-7 -left-4 w-6 h-7 rounded z-0"
            style={{ 
              background: '#5a8a4a', 
              border: '1px solid #4a7a3a',
            }}
          >
            <div className="absolute top-1 left-1 w-4 h-2 rounded" style={{ background: '#4a7a3a' }} />
            <div className="absolute bottom-1 left-1 w-2 h-2 rounded" style={{ background: '#4a7a3a' }} />
          </div>
        )}
        {style.accessory === 'camera' && (
          <div 
            className="absolute top-10 left-1/2 -translate-x-1/2 w-5 h-3 rounded z-15"
            style={{ 
              background: '#3a3a3a', 
              border: '1px solid #5a5a5a',
              transform: `translateY(${bounce * 0.5}px)`,
            }}
          >
            <div className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full" style={{ background: '#1a1a1a' }}>
              <div className="absolute inset-0.5 rounded-full" style={{ background: '#4a4a6a' }} />
            </div>
            {/* Flash */}
            <div className="absolute -top-1 right-0.5 w-1.5 h-1" style={{ background: '#aaaaaa' }} />
          </div>
        )}
        {style.accessory === 'cane' && (
          <div 
            className="absolute bottom-0 -right-3 w-1.5 h-10 origin-bottom rounded-t" 
            style={{ 
              background: `linear-gradient(180deg, #8a7a6a 0%, #5a4a3a 100%)`, 
              transform: `rotate(${-armSwing * 0.5 + 15}deg)`,
              border: '1px solid #4a3a2a',
            }}
          >
            {/* Cane handle */}
            <div className="absolute -top-1 -right-1 w-3 h-2 rounded-t" style={{ background: '#3a2a1a' }} />
          </div>
        )}
        {style.accessory === 'bag' && (
          <div 
            className="absolute top-8 -right-3 w-4 h-5 rounded z-15"
            style={{ 
              background: '#4a4a5a', 
              border: '1px solid #3a3a4a',
              transform: `rotate(${-armSwing * 0.2}deg)`,
            }}
          >
            {/* Strap */}
            <div className="absolute -top-3 left-1 w-0.5 h-4" style={{ background: '#3a3a4a' }} />
          </div>
        )}
        {style.accessory === 'purse' && (
          <div 
            className="absolute top-10 -right-2 w-3.5 h-3 rounded z-15"
            style={{ 
              background: '#cc4466', 
              border: '1px solid #aa3355',
              transform: `rotate(${-armSwing * 0.3}deg)`,
            }}
          >
            <div className="absolute -top-2 left-0.5 w-2.5 h-2 rounded-t" style={{ background: '#aa3355' }} />
          </div>
        )}
        {style.accessory === 'coffee' && (
          <div 
            className="absolute top-10 -right-2 w-3 h-4 rounded z-15"
            style={{ 
              background: '#ffffff', 
              border: '1px solid #dddddd',
              transform: `rotate(${-armSwing * 0.2}deg)`,
            }}
          >
            {/* Coffee cup sleeve */}
            <div className="absolute top-1 left-0 right-0 h-2" style={{ background: '#8a6a4a' }} />
            {/* Lid */}
            <div className="absolute -top-0.5 left-0 right-0 h-1 rounded-t" style={{ background: '#ffffff', borderBottom: '1px solid #cccccc' }} />
          </div>
        )}
        {style.accessory === 'laptop' && (
          <div 
            className="absolute top-9 -left-4 w-5 h-3.5 rounded z-0"
            style={{ 
              background: '#888888', 
              border: '1px solid #666666',
              transform: `rotate(${armSwing * 0.2}deg)`,
            }}
          >
            {/* Apple logo parody */}
            <div className="absolute top-1 left-1.5 w-2 h-1.5 rounded" style={{ background: '#aaaaaa' }} />
          </div>
        )}
      </div>
      
      {/* Action hints - dealers show BUY */}
      {showActionHint && pedestrian.archetype === 'dealer' && (
        <div 
          className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[7px] animate-pulse rounded font-bold whitespace-nowrap z-50"
          style={{ background: '#1a1a2a', color: '#44ff44', border: '1px solid #22aa22' }}
        >
          💊 BUY
        </div>
      )}
      
      {/* VC hint */}
      {showActionHint && pedestrian.archetype === 'vc' && (
        <div 
          className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[7px] animate-pulse rounded font-bold whitespace-nowrap z-50"
          style={{ background: '#1a2a3a', color: '#44aaff', border: '1px solid #2288cc' }}
        >
          📊 PITCH
        </div>
      )}
      
      {/* Founder hint */}
      {showActionHint && pedestrian.archetype === 'founder' && (
        <div 
          className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[7px] animate-pulse rounded font-bold whitespace-nowrap z-50"
          style={{ background: '#2a2a1a', color: '#ffaa44', border: '1px solid #cc8822' }}
        >
          🤝 NETWORK
        </div>
      )}
      
      {/* Regular action hints */}
      {showActionHint && !['dealer', 'vc', 'founder'].includes(pedestrian.archetype) && (
        <div 
          className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[6px] animate-pulse rounded font-bold whitespace-nowrap z-50"
          style={{ background: '#1a1a1a', color: '#9bbc0f', border: '1px solid #8bac0f' }}
        >
          🤏 STEAL
        </div>
      )}
      
      {/* Fallback B/C indicator */}
      {isNearPlayer && pedestrian.canBeStolen && !showActionHint && (
        <div 
          className="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[6px] animate-pulse rounded font-bold z-50"
          style={{ background: '#1a1a1a', color: '#9bbc0f', border: '1px solid #8bac0f' }}
        >
          B/C
        </div>
      )}
    </div>
  );
}
