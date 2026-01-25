import { useEffect, useState } from 'react';
import { PedestrianState, PedestrianAction } from '@/types/game';

interface PedestrianProps {
  pedestrian: PedestrianState;
  playerX: number;
  actionsAvailable?: PedestrianAction[];
}

// Simplified chibi style configs - cleaner visuals
const ARCHETYPE_STYLES: Record<string, { 
  skinColor: string;
  bodyColor: string;
  hairColor: string;
  hairStyle: 'none' | 'short' | 'long' | 'mohawk' | 'spiky' | 'big' | 'slick' | 'hoodie';
  walkSpeed: number;
  accessory?: 'briefcase' | 'backpack' | 'coffee' | 'laptop' | 'purse' | 'camera' | 'cane';
  isPig?: boolean;
  hasGlasses?: boolean;
  hasHat?: boolean;
  hatColor?: string;
  tieColor?: string;
  shoeColor?: string;
}> = {
  businessman: { 
    skinColor: '#ffd4c4',
    bodyColor: '#2a2a3a',
    hairColor: '#3a3a3a',
    hairStyle: 'slick',
    walkSpeed: 180,
    accessory: 'briefcase',
    tieColor: '#cc3333',
    shoeColor: '#2a2a2a',
  },
  clubber: { 
    skinColor: '#e8c8a8',
    bodyColor: '#aa22aa',
    hairColor: '#ff44cc',
    hairStyle: 'mohawk',
    walkSpeed: 120,
    shoeColor: '#1a1a1a',
  },
  tourist: { 
    skinColor: '#ffd8c8',
    bodyColor: '#ff6b35',
    hairColor: '#5a4a3a',
    hairStyle: 'short',
    walkSpeed: 280,
    accessory: 'camera',
    hasHat: true,
    hatColor: '#6a5a4a',
    shoeColor: '#5a5a5a',
  },
  pensioner: { 
    skinColor: '#e8d8c8',
    bodyColor: '#7a6a5a',
    hairColor: '#cccccc',
    hairStyle: 'short',
    walkSpeed: 400,
    accessory: 'cane',
    hasGlasses: true,
    shoeColor: '#4a4a4a',
  },
  backpacker: { 
    skinColor: '#d8b898',
    bodyColor: '#5a8a5a',
    hairColor: '#4a3a2a',
    hairStyle: 'long',
    walkSpeed: 200,
    accessory: 'backpack',
    shoeColor: '#5a4a3a',
  },
  junkie: { 
    skinColor: '#b8a888',
    bodyColor: '#3a3a3a',
    hairColor: '#4a4a3a',
    hairStyle: 'none',
    walkSpeed: 350,
    shoeColor: '#2a2a2a',
  },
  sexworker: { 
    skinColor: '#ffd0c0',
    bodyColor: '#cc2266',
    hairColor: '#4a2a2a',
    hairStyle: 'big',
    walkSpeed: 160,
    accessory: 'purse',
    shoeColor: '#cc2266',
  },
  student: { 
    skinColor: '#ffd8c8',
    bodyColor: '#3a5a7a',
    hairColor: '#4a3a2a',
    hairStyle: 'short',
    walkSpeed: 150,
    shoeColor: '#ffffff',
  },
  cop: {
    skinColor: '#ffb8b8',
    bodyColor: '#1a3a5a',
    hairColor: '#ffb8b8',
    hairStyle: 'none',
    walkSpeed: 200,
    hasHat: true,
    hatColor: '#1a3a5a',
    isPig: true,
    shoeColor: '#1a1a1a',
  },
  punk: {
    skinColor: '#e8c8a8',
    bodyColor: '#1a1a1a',
    hairColor: '#44ff44',
    hairStyle: 'spiky',
    walkSpeed: 110,
    shoeColor: '#1a1a1a',
  },
  dealer: {
    skinColor: '#d8b898',
    bodyColor: '#2a2a3a',
    hairColor: '#2a2a2a',
    hairStyle: 'hoodie',
    walkSpeed: 260,
    shoeColor: '#2a2a2a',
  },
  vc: {
    skinColor: '#ffd4c4',
    bodyColor: '#3a5a6a',
    hairColor: '#5a5a5a',
    hairStyle: 'slick',
    walkSpeed: 220,
    accessory: 'coffee',
    hasGlasses: true,
    shoeColor: '#3a3a3a',
  },
  founder: {
    skinColor: '#ffd8c8',
    bodyColor: '#4a4a5a',
    hairColor: '#3a2a2a',
    hairStyle: 'short',
    walkSpeed: 140,
    accessory: 'laptop',
    shoeColor: '#ffffff',
  },
};

export function Pedestrian({ pedestrian, playerX, actionsAvailable = [] }: PedestrianProps) {
  const [walkFrame, setWalkFrame] = useState(0);
  
  const style = ARCHETYPE_STYLES[pedestrian.archetype] || ARCHETYPE_STYLES.student;
  
  // Simple walk cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setWalkFrame(f => (f + 1) % 4);
    }, style.walkSpeed);
    return () => clearInterval(interval);
  }, [style.walkSpeed]);

  const isNearPlayer = Math.abs(pedestrian.x - playerX) < 8;
  const showActionHint = isNearPlayer && pedestrian.canBeStolen && actionsAvailable.length > 0;
  
  // Simple bob animation
  const bobY = walkFrame % 2 === 0 ? 0 : -2;
  const legSwap = walkFrame % 2 === 0;
  
  const facingLeft = pedestrian.direction === 'left';

  return (
    <div 
      className="absolute"
      style={{ 
        left: `${pedestrian.x}%`, 
        bottom: '42%',
        transform: `translateX(-50%) scaleX(${facingLeft ? -1 : 1})`,
        zIndex: 25,
      }}
    >
      {/* Shadow */}
      <div 
        className="absolute rounded-full"
        style={{ 
          width: '16px',
          height: '4px',
          background: 'rgba(0,0,0,0.3)',
          bottom: '-2px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      
      {/* Character container - all parts positioned relative to this */}
      <div 
        style={{ 
          position: 'relative',
          width: '24px',
          height: '36px',
          transform: `translateY(${bobY}px)`,
        }}
      >
        {/* Accessory behind character */}
        {style.accessory === 'backpack' && (
          <div
            style={{
              position: 'absolute',
              width: '10px',
              height: '12px',
              background: '#5a8a4a',
              borderRadius: '2px',
              left: '-4px',
              top: '14px',
              border: '1px solid #4a7a3a',
            }}
          />
        )}
        
        {/* Hood (behind head) */}
        {style.hairStyle === 'hoodie' && (
          <div
            style={{
              position: 'absolute',
              width: '20px',
              height: '16px',
              background: style.bodyColor,
              borderRadius: '10px 10px 0 0',
              left: '2px',
              top: '0px',
            }}
          />
        )}
        
        {/* HEAD */}
        <div
          style={{
            position: 'absolute',
            width: '18px',
            height: '16px',
            background: style.isPig ? '#ffcccc' : style.skinColor,
            borderRadius: '9px',
            left: '3px',
            top: '0px',
          }}
        >
          {/* Hair */}
          {style.hairStyle === 'short' && (
            <div
              style={{
                position: 'absolute',
                width: '14px',
                height: '6px',
                background: style.hairColor,
                borderRadius: '7px 7px 0 0',
                left: '2px',
                top: '-2px',
              }}
            />
          )}
          {style.hairStyle === 'slick' && (
            <div
              style={{
                position: 'absolute',
                width: '16px',
                height: '5px',
                background: style.hairColor,
                borderRadius: '8px 8px 0 0',
                left: '1px',
                top: '-1px',
              }}
            />
          )}
          {style.hairStyle === 'long' && (
            <>
              <div
                style={{
                  position: 'absolute',
                  width: '18px',
                  height: '8px',
                  background: style.hairColor,
                  borderRadius: '9px 9px 0 0',
                  left: '0px',
                  top: '-2px',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '10px',
                  background: style.hairColor,
                  left: '-2px',
                  top: '6px',
                  borderRadius: '0 0 2px 2px',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '10px',
                  background: style.hairColor,
                  right: '-2px',
                  top: '6px',
                  borderRadius: '0 0 2px 2px',
                }}
              />
            </>
          )}
          {style.hairStyle === 'mohawk' && (
            <div
              style={{
                position: 'absolute',
                width: '4px',
                height: '10px',
                background: style.hairColor,
                left: '7px',
                top: '-8px',
                borderRadius: '2px 2px 0 0',
              }}
            />
          )}
          {style.hairStyle === 'spiky' && (
            <>
              <div style={{ position: 'absolute', width: '3px', height: '8px', background: style.hairColor, left: '3px', top: '-6px', transform: 'rotate(-15deg)' }} />
              <div style={{ position: 'absolute', width: '3px', height: '10px', background: style.hairColor, left: '7px', top: '-8px' }} />
              <div style={{ position: 'absolute', width: '3px', height: '8px', background: style.hairColor, left: '11px', top: '-6px', transform: 'rotate(15deg)' }} />
            </>
          )}
          {style.hairStyle === 'big' && (
            <div
              style={{
                position: 'absolute',
                width: '22px',
                height: '14px',
                background: style.hairColor,
                borderRadius: '11px 11px 0 0',
                left: '-2px',
                top: '-6px',
              }}
            />
          )}
          
          {/* Hat */}
          {style.hasHat && !style.isPig && (
            <div
              style={{
                position: 'absolute',
                width: '18px',
                height: '6px',
                background: style.hatColor,
                borderRadius: '3px 3px 0 0',
                left: '0px',
                top: '-4px',
              }}
            />
          )}
          
          {/* Pig features */}
          {style.isPig && (
            <>
              {/* Ears */}
              <div
                style={{
                  position: 'absolute',
                  width: '6px',
                  height: '8px',
                  background: '#ffbbbb',
                  borderRadius: '3px 3px 0 0',
                  left: '-2px',
                  top: '-4px',
                  transform: 'rotate(-15deg)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: '6px',
                  height: '8px',
                  background: '#ffbbbb',
                  borderRadius: '3px 3px 0 0',
                  right: '-2px',
                  top: '-4px',
                  transform: 'rotate(15deg)',
                }}
              />
              {/* Snout */}
              <div
                style={{
                  position: 'absolute',
                  width: '10px',
                  height: '6px',
                  background: '#ffaaaa',
                  borderRadius: '5px',
                  left: '4px',
                  bottom: '2px',
                }}
              >
                <div style={{ position: 'absolute', width: '2px', height: '2px', background: '#885555', borderRadius: '50%', left: '2px', top: '2px' }} />
                <div style={{ position: 'absolute', width: '2px', height: '2px', background: '#885555', borderRadius: '50%', right: '2px', top: '2px' }} />
              </div>
              {/* Cop hat */}
              <div
                style={{
                  position: 'absolute',
                  width: '16px',
                  height: '5px',
                  background: style.hatColor,
                  borderRadius: '2px 2px 0 0',
                  left: '1px',
                  top: '-6px',
                }}
              >
                <div style={{ position: 'absolute', width: '4px', height: '3px', background: '#ccaa44', left: '6px', top: '1px' }} />
              </div>
            </>
          )}
          
          {/* Eyes */}
          {!style.isPig && (
            <>
              <div
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  background: '#ffffff',
                  borderRadius: '50%',
                  left: '3px',
                  top: '5px',
                }}
              >
                <div style={{ position: 'absolute', width: '2px', height: '2px', background: '#1a1a1a', borderRadius: '50%', left: '1px', top: '1px' }} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  background: '#ffffff',
                  borderRadius: '50%',
                  right: '3px',
                  top: '5px',
                }}
              >
                <div style={{ position: 'absolute', width: '2px', height: '2px', background: '#1a1a1a', borderRadius: '50%', left: '1px', top: '1px' }} />
              </div>
            </>
          )}
          {style.isPig && (
            <>
              <div style={{ position: 'absolute', width: '3px', height: '3px', background: '#1a1a1a', borderRadius: '50%', left: '4px', top: '4px' }} />
              <div style={{ position: 'absolute', width: '3px', height: '3px', background: '#1a1a1a', borderRadius: '50%', right: '4px', top: '4px' }} />
            </>
          )}
          
          {/* Glasses */}
          {style.hasGlasses && (
            <>
              <div style={{ position: 'absolute', width: '6px', height: '4px', border: '1px solid #333', borderRadius: '1px', left: '1px', top: '4px' }} />
              <div style={{ position: 'absolute', width: '6px', height: '4px', border: '1px solid #333', borderRadius: '1px', right: '1px', top: '4px' }} />
              <div style={{ position: 'absolute', width: '4px', height: '1px', background: '#333', left: '7px', top: '5px' }} />
            </>
          )}
        </div>
        
        {/* BODY */}
        <div
          style={{
            position: 'absolute',
            width: '14px',
            height: '10px',
            background: style.bodyColor,
            borderRadius: '2px',
            left: '5px',
            top: '14px',
          }}
        >
          {/* Tie */}
          {style.tieColor && (
            <div
              style={{
                position: 'absolute',
                width: '2px',
                height: '6px',
                background: style.tieColor,
                left: '6px',
                top: '1px',
              }}
            />
          )}
          {/* Cop badge */}
          {style.isPig && (
            <div style={{ position: 'absolute', width: '4px', height: '4px', background: '#ccaa44', left: '2px', top: '2px' }} />
          )}
        </div>
        
        {/* ARMS */}
        <div
          style={{
            position: 'absolute',
            width: '4px',
            height: '8px',
            background: style.hairStyle === 'hoodie' ? style.bodyColor : style.skinColor,
            borderRadius: '2px',
            left: '1px',
            top: '15px',
            transform: `rotate(${legSwap ? 20 : -20}deg)`,
            transformOrigin: 'top center',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '4px',
            height: '8px',
            background: style.hairStyle === 'hoodie' ? style.bodyColor : style.skinColor,
            borderRadius: '2px',
            right: '1px',
            top: '15px',
            transform: `rotate(${legSwap ? -20 : 20}deg)`,
            transformOrigin: 'top center',
          }}
        />
        
        {/* LEGS */}
        <div
          style={{
            position: 'absolute',
            width: '5px',
            height: '10px',
            background: style.bodyColor,
            borderRadius: '0 0 2px 2px',
            left: '5px',
            top: '23px',
            transform: `rotate(${legSwap ? 15 : -15}deg)`,
            transformOrigin: 'top center',
          }}
        >
          <div style={{ position: 'absolute', width: '6px', height: '3px', background: style.shoeColor || '#2a2a2a', borderRadius: '1px', bottom: '0', left: '-1px' }} />
        </div>
        <div
          style={{
            position: 'absolute',
            width: '5px',
            height: '10px',
            background: style.bodyColor,
            borderRadius: '0 0 2px 2px',
            right: '5px',
            top: '23px',
            transform: `rotate(${legSwap ? -15 : 15}deg)`,
            transformOrigin: 'top center',
          }}
        >
          <div style={{ position: 'absolute', width: '6px', height: '3px', background: style.shoeColor || '#2a2a2a', borderRadius: '1px', bottom: '0', left: '-1px' }} />
        </div>
        
        {/* Accessories in front */}
        {style.accessory === 'briefcase' && (
          <div
            style={{
              position: 'absolute',
              width: '8px',
              height: '6px',
              background: '#5a4a3a',
              borderRadius: '1px',
              right: '-6px',
              top: '20px',
              border: '1px solid #4a3a2a',
            }}
          >
            <div style={{ position: 'absolute', width: '4px', height: '1px', background: '#3a2a1a', left: '2px', top: '0' }} />
          </div>
        )}
        {style.accessory === 'coffee' && (
          <div
            style={{
              position: 'absolute',
              width: '5px',
              height: '7px',
              background: '#ffffff',
              borderRadius: '1px',
              right: '-4px',
              top: '18px',
            }}
          >
            <div style={{ position: 'absolute', width: '5px', height: '3px', background: '#8a6a4a', top: '2px' }} />
          </div>
        )}
        {style.accessory === 'laptop' && (
          <div
            style={{
              position: 'absolute',
              width: '8px',
              height: '6px',
              background: '#888888',
              borderRadius: '1px',
              left: '-6px',
              top: '18px',
            }}
          />
        )}
        {style.accessory === 'purse' && (
          <div
            style={{
              position: 'absolute',
              width: '6px',
              height: '5px',
              background: '#cc4466',
              borderRadius: '1px',
              right: '-4px',
              top: '18px',
            }}
          />
        )}
        {style.accessory === 'camera' && (
          <div
            style={{
              position: 'absolute',
              width: '8px',
              height: '5px',
              background: '#3a3a3a',
              borderRadius: '1px',
              left: '8px',
              top: '20px',
            }}
          >
            <div style={{ position: 'absolute', width: '3px', height: '3px', background: '#4a4a6a', borderRadius: '50%', left: '1px', top: '1px' }} />
          </div>
        )}
        {style.accessory === 'cane' && (
          <div
            style={{
              position: 'absolute',
              width: '2px',
              height: '16px',
              background: '#5a4a3a',
              right: '-4px',
              top: '16px',
              borderRadius: '1px',
            }}
          >
            <div style={{ position: 'absolute', width: '4px', height: '3px', background: '#3a2a1a', top: '-2px', left: '-1px', borderRadius: '2px 2px 0 0' }} />
          </div>
        )}
      </div>
      
      {/* Action hints */}
      {isNearPlayer && (
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: `translateX(-50%) scaleX(${facingLeft ? -1 : 1})`,
            whiteSpace: 'nowrap',
            zIndex: 50,
          }}
        >
          {pedestrian.archetype === 'dealer' && (
            <div className="px-2 py-0.5 text-[7px] rounded font-bold animate-pulse"
              style={{ background: '#1a1a2a', color: '#44ff44', border: '1px solid #22aa22' }}>
              💊 BUY
            </div>
          )}
          {pedestrian.archetype === 'vc' && (
            <div className="px-2 py-0.5 text-[7px] rounded font-bold animate-pulse"
              style={{ background: '#1a2a3a', color: '#44aaff', border: '1px solid #2288cc' }}>
              📊 PITCH
            </div>
          )}
          {pedestrian.archetype === 'founder' && (
            <div className="px-2 py-0.5 text-[7px] rounded font-bold animate-pulse"
              style={{ background: '#2a2a1a', color: '#ffaa44', border: '1px solid #cc8822' }}>
              🤝 NETWORK
            </div>
          )}
          {showActionHint && !['dealer', 'vc', 'founder'].includes(pedestrian.archetype) && (
            <div className="px-2 py-0.5 text-[6px] rounded font-bold animate-pulse"
              style={{ background: '#1a1a1a', color: '#9bbc0f', border: '1px solid #8bac0f' }}>
              🤏 STEAL
            </div>
          )}
        </div>
      )}
    </div>
  );
}
