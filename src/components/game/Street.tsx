import { HOTSPOTS } from '@/types/game';

interface StreetProps {
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  isRaining: boolean;
  shelterOpen: boolean;
  servicesOpen: boolean;
  playerX: number;
  worldOffset?: number;
}

// Street block types for variety
const BLOCK_TYPES = ['shop', 'alley', 'services', 'shelter', 'bins', 'soup', 'generic', 'bar'] as const;

export function Street({ timeOfDay, isRaining, shelterOpen, servicesOpen, playerX, worldOffset = 0 }: StreetProps) {
  // Palette per time of day
  const getPalette = () => {
    switch (timeOfDay) {
      case 'night': 
        return {
          sky: '#050a05',
          skyGradient: 'linear-gradient(180deg, #020502 0%, #0a150a 100%)',
          building: '#0f1a0f',
          buildingAlt: '#152015',
          shopfront: '#1a2a1a',
          footpath: '#252a25',
          kerb: '#0a0f0a',
          road: '#080c08',
          neon: true,
          windowGlow: '#9bbc0f',
        };
      case 'dusk':
        return {
          sky: '#1a1520',
          skyGradient: 'linear-gradient(180deg, #0f0a15 0%, #2a2030 50%, #3a2520 100%)',
          building: '#1a201a',
          buildingAlt: '#252a25',
          shopfront: '#2a352a',
          footpath: '#3a3a35',
          kerb: '#151a15',
          road: '#101510',
          neon: true,
          windowGlow: '#ffaa44',
        };
      case 'dawn':
        return {
          sky: '#2a3035',
          skyGradient: 'linear-gradient(180deg, #1a2025 0%, #3a4045 50%, #4a4540 100%)',
          building: '#253025',
          buildingAlt: '#303530',
          shopfront: '#3a453a',
          footpath: '#4a4a45',
          kerb: '#202520',
          road: '#151a15',
          neon: false,
          windowGlow: '#aabb88',
        };
      default: // day
        return {
          sky: '#6a8a6a',
          skyGradient: 'linear-gradient(180deg, #5a7a5a 0%, #8aaa8a 100%)',
          building: '#4a5a4a',
          buildingAlt: '#556555',
          shopfront: '#5a6a5a',
          footpath: '#6a7a6a',
          kerb: '#3a4a3a',
          road: '#2a3a2a',
          neon: false,
          windowGlow: '#9bbc0f',
        };
    }
  };

  const palette = getPalette();
  const parallaxOffset = worldOffset * 0.3;
  const midParallaxOffset = worldOffset * 0.6;

  // Generate repeating city blocks
  const renderCityBlocks = () => {
    const blocks = [];
    const blockWidth = 80; // pixels per block
    const numBlocks = 12;
    
    for (let i = 0; i < numBlocks; i++) {
      const blockType = BLOCK_TYPES[i % BLOCK_TYPES.length];
      const xPos = (i * blockWidth) - (parallaxOffset % (blockWidth * numBlocks));
      
      blocks.push(
        <div
          key={`block-${i}`}
          className="absolute flex-shrink-0"
          style={{
            left: `${xPos}px`,
            bottom: '52%',
            width: `${blockWidth}px`,
            height: '35%',
          }}
        >
          {renderBlock(blockType, i, palette)}
        </div>
      );
    }
    return blocks;
  };

  const renderBlock = (type: typeof BLOCK_TYPES[number], index: number, pal: ReturnType<typeof getPalette>) => {
    const isEven = index % 2 === 0;
    const buildingColor = isEven ? pal.building : pal.buildingAlt;
    
    switch (type) {
      case 'services':
        return (
          <div className="relative w-full h-full">
            {/* Building */}
            <div className="absolute inset-0" style={{ background: buildingColor }}>
              {/* Windows */}
              <div className="absolute top-2 left-2 w-3 h-4" style={{ background: pal.windowGlow, opacity: 0.3 }} />
              <div className="absolute top-2 right-2 w-3 h-4" style={{ background: pal.windowGlow, opacity: 0.3 }} />
            </div>
            {/* Awning */}
            <div className="absolute bottom-8 left-0 right-0 h-3" style={{ background: '#4a6a8a' }} />
            {/* Door */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-10 border-2" style={{ background: servicesOpen ? pal.windowGlow : '#0a0f0a', borderColor: '#8bac0f' }}>
              {servicesOpen && <div className="absolute inset-1 animate-pulse" style={{ background: '#8bac0f' }} />}
            </div>
            {/* Sign */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-1 text-[5px] font-bold" style={{ background: '#1a1a1a', color: '#9bbc0f' }}>
              SERVICES
            </div>
            {pal.neon && <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-10 h-1 animate-pulse" style={{ background: '#ff6666', boxShadow: '0 0 8px #ff6666' }} />}
          </div>
        );
      
      case 'shelter':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }}>
              <div className="absolute top-3 left-1 w-4 h-5" style={{ background: pal.windowGlow, opacity: 0.25 }} />
              <div className="absolute top-3 right-1 w-4 h-5" style={{ background: pal.windowGlow, opacity: 0.25 }} />
            </div>
            {/* Shelter awning */}
            <div className="absolute bottom-10 left-0 right-0 h-4" style={{ background: '#3a4a3a' }} />
            {/* Door */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-12 border-2" style={{ background: shelterOpen ? '#9bbc0f' : '#0f1a0f', borderColor: '#6a8a6a' }}>
              {shelterOpen && <div className="absolute inset-1 animate-pulse" style={{ background: '#9bbc0f', opacity: 0.8 }} />}
            </div>
            {/* Sign */}
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 px-1 text-[5px] font-bold" style={{ background: '#1a1a1a', color: '#8bac0f' }}>
              SHELTER
            </div>
          </div>
        );
      
      case 'shop':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }} />
            {/* Shopfront window */}
            <div className="absolute bottom-1 left-1 right-1 h-12 border" style={{ background: '#1a2a2a', borderColor: '#3a4a4a' }}>
              <div className="absolute inset-1" style={{ background: pal.windowGlow, opacity: 0.15 }} />
            </div>
            {/* Awning */}
            <div className="absolute bottom-12 left-0 right-0 h-3" style={{ background: index % 3 === 0 ? '#8a4a4a' : index % 3 === 1 ? '#4a8a4a' : '#4a4a8a' }} />
            {/* Sign above */}
            <div className="absolute bottom-16 left-1 right-1 h-4 flex items-center justify-center text-[4px]" style={{ background: '#2a2a2a', color: '#9bbc0f' }}>
              {index % 4 === 0 ? 'MILK BAR' : index % 4 === 1 ? 'CHEMIST' : index % 4 === 2 ? 'TAB' : 'NEWSAGENT'}
            </div>
            {pal.neon && (
              <div className="absolute bottom-17 left-1/2 -translate-x-1/2 w-6 h-0.5" style={{ background: '#ffaa44', boxShadow: '0 0 4px #ffaa44' }} />
            )}
          </div>
        );
      
      case 'bar':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1515' }} />
            {/* Blacked out windows */}
            <div className="absolute top-2 left-2 right-2 h-8" style={{ background: '#0a0505' }} />
            {/* Door */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-10" style={{ background: '#0f0a0a', border: '1px solid #3a2a2a' }} />
            {/* Neon sign */}
            {pal.neon && (
              <>
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[5px] animate-pulse" style={{ background: 'transparent', color: '#ff4488', textShadow: '0 0 4px #ff4488' }}>
                  BAR
                </div>
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1" style={{ background: '#ff66aa', boxShadow: '0 0 6px #ff66aa' }} />
              </>
            )}
          </div>
        );
      
      case 'alley':
        return (
          <div className="relative w-full h-full">
            {/* Dark alley gap */}
            <div className="absolute inset-0" style={{ background: '#050805' }} />
            {/* Side walls */}
            <div className="absolute left-0 top-0 bottom-0 w-2" style={{ background: buildingColor }} />
            <div className="absolute right-0 top-0 bottom-0 w-2" style={{ background: buildingColor }} />
            {/* Trash at bottom */}
            <div className="absolute bottom-0 left-3 w-4 h-3" style={{ background: '#2a2a2a' }} />
            <div className="absolute bottom-0 right-3 w-3 h-2" style={{ background: '#1a1a1a' }} />
          </div>
        );
      
      case 'bins':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }} />
            {/* Roller door */}
            <div className="absolute bottom-0 left-1 right-1 h-14" style={{ background: '#2a3a2a', borderTop: '2px solid #4a5a4a' }}>
              {/* Roller lines */}
              {[...Array(6)].map((_, j) => (
                <div key={j} className="w-full h-px" style={{ background: '#3a4a3a', marginTop: '2px' }} />
              ))}
            </div>
            {/* Bins at base - moved to clutter layer */}
          </div>
        );
      
      case 'soup':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#2a2520' }} />
            {/* Hatch window */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-6 border" style={{ background: '#3a3530', borderColor: '#5a5550' }}>
              <div className="absolute inset-1" style={{ background: pal.windowGlow, opacity: 0.2 }} />
            </div>
            {/* Sign */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-1 text-[4px]" style={{ background: '#1a1510', color: '#aaba8a' }}>
              SOUP
            </div>
          </div>
        );
      
      default: // generic
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }} />
            {/* Random windows */}
            <div className="absolute top-2 left-2 w-3 h-4" style={{ background: pal.windowGlow, opacity: 0.2 }} />
            <div className="absolute top-8 left-2 w-3 h-4" style={{ background: pal.windowGlow, opacity: 0.15 }} />
            <div className="absolute top-2 right-2 w-3 h-4" style={{ background: pal.windowGlow, opacity: 0.25 }} />
            {/* Boarded section */}
            <div className="absolute bottom-0 left-1 right-1 h-8" style={{ background: '#1a1a15' }} />
          </div>
        );
    }
  };

  // Foreground clutter items
  const renderClutter = () => {
    const items = [];
    const clutterTypes = ['bin', 'crate', 'trash', 'newsrack', 'phonebooth', 'busstop'];
    
    for (let i = 0; i < 15; i++) {
      const type = clutterTypes[i % clutterTypes.length];
      const xPos = (i * 65) - (midParallaxOffset % 800) + 20;
      
      items.push(
        <div
          key={`clutter-${i}`}
          className="absolute"
          style={{
            left: `${xPos}px`,
            bottom: '18%',
          }}
        >
          {renderClutterItem(type, i)}
        </div>
      );
    }
    return items;
  };

  const renderClutterItem = (type: string, index: number) => {
    switch (type) {
      case 'bin':
        return (
          <div className="flex gap-0.5">
            <div className="w-3 h-5 rounded-t" style={{ background: '#3a4a3a', border: '1px solid #5a6a5a' }} />
            <div className="w-3 h-6 rounded-t" style={{ background: '#4a5a4a', border: '1px solid #6a7a6a' }} />
          </div>
        );
      case 'crate':
        return (
          <div className="w-4 h-3" style={{ background: '#5a4a3a', border: '1px solid #7a6a5a' }} />
        );
      case 'trash':
        return (
          <div className="flex gap-0.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#2a2a2a' }} />
            <div className="w-3 h-1" style={{ background: '#3a3a3a' }} />
          </div>
        );
      case 'newsrack':
        return (
          <div className="w-4 h-6" style={{ background: '#4a3a3a', border: '1px solid #6a5a5a' }}>
            <div className="w-3 h-3 mt-0.5 mx-auto" style={{ background: '#8a8a6a' }} />
          </div>
        );
      case 'phonebooth':
        return (
          <div className="w-4 h-8 rounded-t" style={{ background: '#3a4a5a', border: '1px solid #5a6a7a' }}>
            <div className="w-2 h-2 mx-auto mt-1" style={{ background: '#2a3a4a' }} />
          </div>
        );
      case 'busstop':
        return (
          <div className="relative">
            <div className="w-1 h-10" style={{ background: '#5a5a5a' }} />
            <div className="absolute top-0 left-0 w-5 h-3" style={{ background: '#4a5a4a', border: '1px solid #6a7a6a' }} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: palette.skyGradient }}>
      {/* LAYER 1: Skyline (far background) - 8% height */}
      <div className="absolute top-0 left-0 right-0 h-[8%]" style={{ background: palette.sky }}>
        {/* Distant building silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 h-full flex items-end">
          {[...Array(20)].map((_, i) => (
            <div
              key={`sky-${i}`}
              className="flex-shrink-0"
              style={{
                width: `${20 + (i % 3) * 15}px`,
                height: `${40 + (i % 4) * 20}%`,
                background: palette.building,
                marginLeft: '-1px',
                transform: `translateX(${-parallaxOffset * 0.2}px)`,
              }}
            />
          ))}
        </div>
        {/* Stars at night */}
        {timeOfDay === 'night' && (
          <>
            <div className="absolute top-1 left-[15%] w-1 h-1 rounded-full animate-pulse" style={{ background: '#9bbc0f' }} />
            <div className="absolute top-2 left-[35%] w-0.5 h-0.5 rounded-full" style={{ background: '#8bac0f' }} />
            <div className="absolute top-1 left-[60%] w-1 h-1 rounded-full animate-pulse" style={{ background: '#9bbc0f' }} />
            <div className="absolute top-3 left-[80%] w-0.5 h-0.5 rounded-full" style={{ background: '#8bac0f' }} />
          </>
        )}
      </div>

      {/* LAYER 2: Buildings/Shopfronts (main background) - 35% height, starts at 8% */}
      <div className="absolute top-[8%] left-0 right-0 h-[35%] overflow-hidden">
        {renderCityBlocks()}
      </div>

      {/* LAYER 3: Footpath (player plane) - 12% height */}
      <div 
        className="absolute left-0 right-0 h-[12%]"
        style={{ 
          top: '43%',
          background: `linear-gradient(180deg, ${palette.footpath} 0%, ${palette.kerb} 100%)`,
        }}
      >
        {/* Footpath texture lines */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: palette.kerb }} />
        <div className="absolute top-2 left-0 right-0 h-px opacity-30" style={{ background: palette.kerb }} />
        
        {/* Zone indicators */}
        {HOTSPOTS.map((hotspot) => {
          const isInZone = playerX >= hotspot.x && playerX <= hotspot.x + hotspot.width;
          if (!isInZone) return null;
          
          return (
            <div
              key={`zone-${hotspot.zone}`}
              className="absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[8px] font-bold animate-pulse"
              style={{ 
                background: '#0f1a0f',
                color: '#9bbc0f',
                border: '1px solid #8bac0f',
              }}
            >
              ↑ {hotspot.label}
            </div>
          );
        })}
      </div>

      {/* LAYER 4: Kerb (thin divider) - 2% height */}
      <div 
        className="absolute left-0 right-0 h-[2%]"
        style={{ 
          top: '55%',
          background: palette.kerb,
        }}
      />

      {/* LAYER 5: Road (cars) - 15% height */}
      <div 
        className="absolute left-0 right-0 h-[15%]"
        style={{ 
          top: '57%',
          background: palette.road,
        }}
      >
        {/* Road markings */}
        <div 
          className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
          style={{ 
            background: `repeating-linear-gradient(90deg, ${palette.footpath}33 0px, ${palette.footpath}33 20px, transparent 20px, transparent 40px)`,
          }}
        />
        {/* Double yellow line at top */}
        <div className="absolute top-1 left-0 right-0 h-px" style={{ background: '#8a8a2a', opacity: 0.5 }} />
        <div className="absolute top-2 left-0 right-0 h-px" style={{ background: '#8a8a2a', opacity: 0.5 }} />
      </div>

      {/* LAYER 6: Foreground clutter - 8% height */}
      <div 
        className="absolute left-0 right-0 h-[18%] overflow-hidden pointer-events-none"
        style={{ top: '72%' }}
      >
        {renderClutter()}
      </div>

      {/* Rain overlay */}
      {isRaining && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-px animate-rain"
              style={{
                left: `${(i * 2) + Math.random()}%`,
                top: `${Math.random() * 60}%`,
                height: '12px',
                background: 'rgba(155, 188, 15, 0.3)',
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Neon glow overlay at night/dusk */}
      {(timeOfDay === 'night' || timeOfDay === 'dusk') && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div 
            className="absolute top-[15%] left-[20%] w-16 h-24 rounded-full blur-xl opacity-20"
            style={{ background: 'radial-gradient(circle, #ff6688 0%, transparent 70%)' }}
          />
          <div 
            className="absolute top-[20%] left-[50%] w-12 h-20 rounded-full blur-lg opacity-15"
            style={{ background: 'radial-gradient(circle, #88ff66 0%, transparent 70%)' }}
          />
          <div 
            className="absolute top-[18%] left-[75%] w-14 h-18 rounded-full blur-xl opacity-20"
            style={{ background: 'radial-gradient(circle, #ffaa44 0%, transparent 70%)' }}
          />
        </div>
      )}
    </div>
  );
}
