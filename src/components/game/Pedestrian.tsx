import { useEffect, useState } from 'react';
import { PedestrianState, PedestrianAction } from '@/types/game';

interface PedestrianProps {
  pedestrian: PedestrianState;
  playerX: number;
  actionsAvailable?: PedestrianAction[];
}

// Clean archetype configurations
const ARCHETYPE_STYLES: Record<string, { 
  skinColor: string;
  bodyColor: string;
  hairColor: string;
  hairStyle: 'none' | 'short' | 'mohawk' | 'spiky' | 'big' | 'slick' | 'hoodie';
  accessory?: 'briefcase' | 'backpack' | 'coffee' | 'laptop' | 'purse';
  isPig?: boolean;
  hatColor?: string;
  hasGlasses?: boolean;
}> = {
  businessman: { 
    skinColor: '#ffd4c4', bodyColor: '#2a2a3a', hairColor: '#3a3a3a',
    hairStyle: 'slick', accessory: 'briefcase',
  },
  clubber: { 
    skinColor: '#e8c8a8', bodyColor: '#aa22aa', hairColor: '#ff44cc',
    hairStyle: 'mohawk',
  },
  tourist: { 
    skinColor: '#ffd8c8', bodyColor: '#ff6b35', hairColor: '#5a4a3a',
    hairStyle: 'short', hatColor: '#6a5a4a',
  },
  pensioner: { 
    skinColor: '#e8d8c8', bodyColor: '#7a6a5a', hairColor: '#cccccc',
    hairStyle: 'short', hasGlasses: true,
  },
  backpacker: { 
    skinColor: '#d8b898', bodyColor: '#5a8a5a', hairColor: '#4a3a2a',
    hairStyle: 'short', accessory: 'backpack',
  },
  junkie: { 
    skinColor: '#b8a888', bodyColor: '#3a3a3a', hairColor: '#4a4a3a',
    hairStyle: 'none',
  },
  sexworker: { 
    skinColor: '#ffd0c0', bodyColor: '#cc2266', hairColor: '#4a2a2a',
    hairStyle: 'big', accessory: 'purse',
  },
  student: { 
    skinColor: '#ffd8c8', bodyColor: '#3a5a7a', hairColor: '#4a3a2a',
    hairStyle: 'short',
  },
  cop: {
    skinColor: '#ffcccc', bodyColor: '#1a3a5a', hairColor: '#ffcccc',
    hairStyle: 'none', isPig: true, hatColor: '#1a3a5a',
  },
  punk: {
    skinColor: '#e8c8a8', bodyColor: '#1a1a1a', hairColor: '#44ff44',
    hairStyle: 'spiky',
  },
  dealer: {
    skinColor: '#d8b898', bodyColor: '#2a2a3a', hairColor: '#2a2a3a',
    hairStyle: 'hoodie',
  },
  vc: {
    skinColor: '#ffd4c4', bodyColor: '#3a5a6a', hairColor: '#5a5a5a',
    hairStyle: 'slick', accessory: 'coffee', hasGlasses: true,
  },
  founder: {
    skinColor: '#ffd8c8', bodyColor: '#4a4a5a', hairColor: '#3a2a2a',
    hairStyle: 'short', accessory: 'laptop',
  },
};

export function Pedestrian({ pedestrian, playerX, actionsAvailable = [] }: PedestrianProps) {
  const [frame, setFrame] = useState(0);
  const style = ARCHETYPE_STYLES[pedestrian.archetype] || ARCHETYPE_STYLES.student;
  
  useEffect(() => {
    const interval = setInterval(() => setFrame(f => (f + 1) % 4), 180);
    return () => clearInterval(interval);
  }, []);

  const isNearPlayer = Math.abs(pedestrian.x - playerX) < 8;
  const facingLeft = pedestrian.direction === 'left';
  
  // Simple walk animation
  const legOffset = frame % 2 === 0;
  const armSwing = frame % 2 === 0 ? 15 : -15;
  const bob = frame % 2 === 0 ? 0 : -1;

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
        style={{ 
          position: 'absolute',
          width: '16px',
          height: '4px',
          background: 'rgba(0,0,0,0.25)',
          borderRadius: '50%',
          bottom: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      
      {/* Character - all relative to this container */}
      <div style={{ position: 'relative', width: '24px', height: '32px', transform: `translateY(${bob}px)` }}>
        
        {/* Backpack behind */}
        {style.accessory === 'backpack' && (
          <div style={{
            position: 'absolute', width: '10px', height: '10px',
            background: '#4a7a4a', borderRadius: '2px', border: '1px solid #3a6a3a',
            left: '-2px', top: '12px',
          }} />
        )}
        
        {/* Hood behind head */}
        {style.hairStyle === 'hoodie' && (
          <div style={{
            position: 'absolute', width: '18px', height: '10px',
            background: style.bodyColor, borderRadius: '9px 9px 0 0',
            left: '3px', top: '2px',
          }} />
        )}
        
        {/* HEAD */}
        <div style={{
          position: 'absolute', width: '16px', height: '14px',
          background: style.isPig ? '#ffcccc' : style.skinColor,
          borderRadius: '8px', left: '4px', top: '0px',
          border: `1px solid ${style.isPig ? '#eebb99' : '#ddb090'}`,
        }}>
          {/* Hair styles */}
          {style.hairStyle === 'short' && (
            <div style={{
              position: 'absolute', width: '12px', height: '5px',
              background: style.hairColor, borderRadius: '6px 6px 0 0',
              left: '2px', top: '-2px',
            }} />
          )}
          {style.hairStyle === 'slick' && (
            <div style={{
              position: 'absolute', width: '14px', height: '4px',
              background: style.hairColor, borderRadius: '7px 7px 0 0',
              left: '1px', top: '-1px',
            }} />
          )}
          {style.hairStyle === 'mohawk' && (
            <div style={{
              position: 'absolute', width: '4px', height: '8px',
              background: style.hairColor, borderRadius: '2px',
              left: '6px', top: '-6px',
            }} />
          )}
          {style.hairStyle === 'spiky' && (
            <div style={{ position: 'absolute', left: '3px', top: '-5px', display: 'flex', gap: '2px' }}>
              <div style={{ width: '3px', height: '6px', background: style.hairColor, transform: 'rotate(-10deg)' }} />
              <div style={{ width: '3px', height: '8px', background: style.hairColor }} />
              <div style={{ width: '3px', height: '6px', background: style.hairColor, transform: 'rotate(10deg)' }} />
            </div>
          )}
          {style.hairStyle === 'big' && (
            <div style={{
              position: 'absolute', width: '20px', height: '10px',
              background: style.hairColor, borderRadius: '10px 10px 0 0',
              left: '-2px', top: '-5px',
            }} />
          )}
          
          {/* Hat */}
          {style.hatColor && !style.isPig && (
            <div style={{
              position: 'absolute', width: '16px', height: '5px',
              background: style.hatColor, borderRadius: '3px 3px 0 0',
              left: '0px', top: '-3px',
            }} />
          )}
          
          {/* Pig features */}
          {style.isPig && (
            <>
              <div style={{
                position: 'absolute', width: '5px', height: '6px',
                background: '#ffbbbb', borderRadius: '3px 3px 0 0',
                left: '-1px', top: '-2px', transform: 'rotate(-10deg)',
              }} />
              <div style={{
                position: 'absolute', width: '5px', height: '6px',
                background: '#ffbbbb', borderRadius: '3px 3px 0 0',
                right: '-1px', top: '-2px', transform: 'rotate(10deg)',
              }} />
              <div style={{
                position: 'absolute', width: '8px', height: '5px',
                background: '#ffaaaa', borderRadius: '4px',
                left: '4px', bottom: '1px',
              }}>
                <div style={{ position: 'absolute', width: '2px', height: '2px', background: '#885555', borderRadius: '50%', left: '1px', top: '1px' }} />
                <div style={{ position: 'absolute', width: '2px', height: '2px', background: '#885555', borderRadius: '50%', right: '1px', top: '1px' }} />
              </div>
              <div style={{
                position: 'absolute', width: '14px', height: '4px',
                background: style.hatColor, borderRadius: '2px 2px 0 0',
                left: '1px', top: '-4px',
              }}>
                <div style={{ position: 'absolute', width: '4px', height: '2px', background: '#ccaa44', left: '5px', top: '1px' }} />
              </div>
            </>
          )}
          
          {/* Eyes */}
          {!style.isPig ? (
            <>
              <div style={{
                position: 'absolute', width: '4px', height: '4px',
                background: '#fff', borderRadius: '50%',
                left: '2px', top: '4px', border: '1px solid #ccc',
              }}>
                <div style={{ position: 'absolute', width: '2px', height: '2px', background: '#222', borderRadius: '50%', left: '1px', top: '1px' }} />
              </div>
              <div style={{
                position: 'absolute', width: '4px', height: '4px',
                background: '#fff', borderRadius: '50%',
                right: '2px', top: '4px', border: '1px solid #ccc',
              }}>
                <div style={{ position: 'absolute', width: '2px', height: '2px', background: '#222', borderRadius: '50%', left: '1px', top: '1px' }} />
              </div>
            </>
          ) : (
            <>
              <div style={{ position: 'absolute', width: '3px', height: '3px', background: '#222', borderRadius: '50%', left: '3px', top: '3px' }} />
              <div style={{ position: 'absolute', width: '3px', height: '3px', background: '#222', borderRadius: '50%', right: '3px', top: '3px' }} />
            </>
          )}
          
          {/* Glasses */}
          {style.hasGlasses && (
            <>
              <div style={{ position: 'absolute', width: '5px', height: '4px', border: '1px solid #444', borderRadius: '1px', left: '1px', top: '3px', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ position: 'absolute', width: '5px', height: '4px', border: '1px solid #444', borderRadius: '1px', right: '1px', top: '3px', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ position: 'absolute', width: '2px', height: '1px', background: '#444', left: '6px', top: '4px' }} />
            </>
          )}
        </div>
        
        {/* BODY */}
        <div style={{
          position: 'absolute', width: '12px', height: '8px',
          background: style.bodyColor, borderRadius: '2px',
          left: '6px', top: '13px', border: '1px solid rgba(0,0,0,0.2)',
        }}>
          {style.isPig && (
            <div style={{ position: 'absolute', width: '4px', height: '3px', background: '#ccaa44', left: '1px', top: '1px' }} />
          )}
        </div>
        
        {/* ARMS */}
        <div style={{
          position: 'absolute', width: '4px', height: '7px',
          background: style.hairStyle === 'hoodie' ? style.bodyColor : style.skinColor,
          borderRadius: '2px', left: '2px', top: '13px',
          transform: `rotate(${armSwing}deg)`, transformOrigin: 'top center',
        }} />
        <div style={{
          position: 'absolute', width: '4px', height: '7px',
          background: style.hairStyle === 'hoodie' ? style.bodyColor : style.skinColor,
          borderRadius: '2px', right: '2px', top: '13px',
          transform: `rotate(${-armSwing}deg)`, transformOrigin: 'top center',
        }} />
        
        {/* LEGS */}
        <div style={{
          position: 'absolute', width: '5px', height: '10px',
          background: style.bodyColor, borderRadius: '0 0 2px 2px',
          left: '6px', top: '20px',
          transform: `rotate(${legOffset ? 10 : -10}deg)`, transformOrigin: 'top center',
        }}>
          <div style={{ position: 'absolute', width: '6px', height: '3px', background: '#2a2a2a', borderRadius: '1px', bottom: '0', left: '-1px' }} />
        </div>
        <div style={{
          position: 'absolute', width: '5px', height: '10px',
          background: style.bodyColor, borderRadius: '0 0 2px 2px',
          right: '6px', top: '20px',
          transform: `rotate(${legOffset ? -10 : 10}deg)`, transformOrigin: 'top center',
        }}>
          <div style={{ position: 'absolute', width: '6px', height: '3px', background: '#2a2a2a', borderRadius: '1px', bottom: '0', left: '-1px' }} />
        </div>
        
        {/* Front accessories */}
        {style.accessory === 'briefcase' && (
          <div style={{
            position: 'absolute', width: '7px', height: '5px',
            background: '#5a4a3a', borderRadius: '1px', border: '1px solid #4a3a2a',
            right: '-4px', top: '17px',
          }}>
            <div style={{ position: 'absolute', width: '3px', height: '1px', background: '#3a2a1a', left: '2px', top: '0' }} />
          </div>
        )}
        {style.accessory === 'coffee' && (
          <div style={{
            position: 'absolute', width: '4px', height: '6px',
            background: '#fff', borderRadius: '1px',
            right: '-3px', top: '15px',
          }}>
            <div style={{ position: 'absolute', width: '4px', height: '3px', background: '#8a6a4a', top: '1px' }} />
          </div>
        )}
        {style.accessory === 'laptop' && (
          <div style={{
            position: 'absolute', width: '7px', height: '5px',
            background: '#666', borderRadius: '1px',
            left: '-4px', top: '16px',
          }} />
        )}
        {style.accessory === 'purse' && (
          <div style={{
            position: 'absolute', width: '5px', height: '4px',
            background: '#cc4466', borderRadius: '1px',
            right: '-3px', top: '16px',
          }} />
        )}
      </div>
      
      {/* Action hints */}
      {isNearPlayer && (
        <div style={{
          position: 'absolute', top: '-18px', left: '50%',
          transform: `translateX(-50%) scaleX(${facingLeft ? -1 : 1})`,
          whiteSpace: 'nowrap', zIndex: 50,
        }}>
          {pedestrian.archetype === 'dealer' && (
            <div className="px-1.5 py-0.5 text-[6px] rounded font-bold animate-pulse"
              style={{ background: '#1a1a2a', color: '#44ff44', border: '1px solid #22aa22' }}>
              💊 BUY
            </div>
          )}
          {pedestrian.archetype === 'vc' && (
            <div className="px-1.5 py-0.5 text-[6px] rounded font-bold animate-pulse"
              style={{ background: '#1a2a3a', color: '#44aaff', border: '1px solid #2288cc' }}>
              📊 PITCH
            </div>
          )}
          {pedestrian.archetype === 'founder' && (
            <div className="px-1.5 py-0.5 text-[6px] rounded font-bold animate-pulse"
              style={{ background: '#2a2a1a', color: '#ffaa44', border: '1px solid #cc8822' }}>
              🤝 NETWORK
            </div>
          )}
          {pedestrian.canBeStolen && actionsAvailable.length > 0 && !['dealer', 'vc', 'founder'].includes(pedestrian.archetype) && (
            <div className="px-1.5 py-0.5 text-[6px] rounded font-bold animate-pulse"
              style={{ background: '#1a1a1a', color: '#9bbc0f', border: '1px solid #8bac0f' }}>
              🤏 STEAL
            </div>
          )}
        </div>
      )}
    </div>
  );
}
