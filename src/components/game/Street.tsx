import { HOTSPOTS } from '@/types/game';
import { getDistrictBlend, DISTRICT_CONFIGS, DISTRICT_VENUES, getVenueForBlock, District, BlockSignage } from '@/types/districts';
import { SkylineBackground } from './SkylineBackground';

interface StreetProps {
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  isRaining: boolean;
  shelterOpen: boolean;
  servicesOpen: boolean;
  playerX: number;
  worldOffset?: number;
  isTripping?: boolean;
}

// Lerp helper
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpColor = (a: string, b: string, t: number) => {
  // Simple hex lerp
  const parseHex = (h: string) => {
    const c = h.replace('#', '');
    return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
  };
  const [r1,g1,b1] = parseHex(a);
  const [r2,g2,b2] = parseHex(b);
  const r = Math.round(lerp(r1,r2,t));
  const g = Math.round(lerp(g1,g2,t));
  const bl = Math.round(lerp(b1,b2,t));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bl.toString(16).padStart(2,'0')}`;
};

export function Street({ timeOfDay, isRaining, shelterOpen, servicesOpen, playerX, worldOffset = 0, isTripping = false }: StreetProps) {
  const { current, next, blend } = getDistrictBlend(worldOffset);
  const currentConfig = DISTRICT_CONFIGS[current];
  const nextConfig = DISTRICT_CONFIGS[next];
  
  // LSD signage scrambling - replaces letters with similar-looking symbols
  const scrambleText = (text: string): string => {
    if (!isTripping) return text;
    const scrambleMap: Record<string, string[]> = {
      'A': ['∆', 'Λ', '4', 'A'],
      'B': ['ß', '8', 'B', '฿'],
      'C': ['(', '©', 'C', '<'],
      'D': ['Ð', 'D', 'Ɖ'],
      'E': ['3', 'Ξ', 'E', '€'],
      'F': ['F', 'Ƒ'],
      'G': ['G', '6', 'Ǥ'],
      'H': ['#', 'H', 'Ħ'],
      'I': ['1', '!', 'I', '|'],
      'K': ['K', 'ĸ'],
      'L': ['L', '1', '|'],
      'M': ['M', 'Ɯ'],
      'N': ['И', 'N', 'Ñ'],
      'O': ['0', 'Ø', 'O', '◊'],
      'P': ['P', 'Þ'],
      'R': ['R', 'Я'],
      'S': ['$', '5', 'S', '§'],
      'T': ['†', 'T', '7'],
      'U': ['U', 'Ü', 'µ'],
      'V': ['V', '√'],
      'W': ['W', 'Ψ'],
      'X': ['X', '×', '✕'],
      'Y': ['Y', '¥'],
      'Z': ['Z', '2'],
    };
    
    // Only scramble ~40% of the time per character for "glitchy" effect
    return text.split('').map(char => {
      const upper = char.toUpperCase();
      if (scrambleMap[upper] && Math.random() < 0.4) {
        const options = scrambleMap[upper];
        return options[Math.floor(Math.random() * options.length)];
      }
      return char;
    }).join('');
  };
  
  // Blended values
  const neonIntensity = lerp(currentConfig.neonIntensity, nextConfig.neonIntensity, blend);
  const warmth = lerp(currentConfig.warmth, nextConfig.warmth, blend);
  const brightness = lerp(currentConfig.brightness, nextConfig.brightness, blend);

  // Base palette modified by time and district
  const getPalette = () => {
    const isNight = timeOfDay === 'night' || timeOfDay === 'dusk';
    const baseWarm = warmth > 0.5;
    
    if (timeOfDay === 'night') {
      return {
        sky: lerpColor('#020502', '#050208', warmth),
        building: lerpColor('#0f1a0f', '#1a1015', warmth),
        buildingAlt: lerpColor('#152015', '#201520', warmth),
        shopfront: lerpColor('#1a2a1a', '#2a1a20', warmth),
        footpath: lerpColor('#1a1f1a', '#1f1a1a', warmth),
        kerb: lerpColor('#0a0f0a', '#0f0a0a', warmth),
        road: lerpColor('#080c08', '#0c0808', warmth),
        neonPrimary: baseWarm ? '#ff6688' : '#88ffaa',
        neonSecondary: baseWarm ? '#ffaa44' : '#44aaff',
        windowGlow: lerpColor('#8bac0f', '#ffaa44', warmth),
      };
    } else if (timeOfDay === 'dusk') {
      return {
        sky: lerpColor('#1a1520', '#201a15', warmth),
        building: lerpColor('#1a201a', '#201a15', warmth),
        buildingAlt: lerpColor('#252a25', '#2a2520', warmth),
        shopfront: lerpColor('#2a352a', '#352a25', warmth),
        footpath: lerpColor('#2a2f2a', '#2f2a2a', warmth),
        kerb: lerpColor('#151a15', '#1a1515', warmth),
        road: lerpColor('#101510', '#151010', warmth),
        neonPrimary: baseWarm ? '#ff6688' : '#88ffaa',
        neonSecondary: baseWarm ? '#ffaa44' : '#44aaff',
        windowGlow: lerpColor('#aabb88', '#ffcc88', warmth),
      };
    } else if (timeOfDay === 'dawn') {
      return {
        sky: '#2a3035',
        building: '#253025',
        buildingAlt: '#303530',
        shopfront: '#3a453a',
        footpath: '#3a3f3a',
        kerb: '#202520',
        road: '#151a15',
        neonPrimary: '#668866',
        neonSecondary: '#886666',
        windowGlow: '#aabb88',
      };
    } else {
      return {
        sky: '#6a8a6a',
        building: '#4a5a4a',
        buildingAlt: '#556555',
        shopfront: '#5a6a5a',
        footpath: '#5a5f5a',
        kerb: '#3a4a3a',
        road: '#2a3a2a',
        neonPrimary: '#446644',
        neonSecondary: '#664444',
        windowGlow: '#9bbc0f',
      };
    }
  };

  const palette = getPalette();
  const isNight = timeOfDay === 'night' || timeOfDay === 'dusk';
  const parallaxOffset = worldOffset * 0.3;
  const midParallaxOffset = worldOffset * 0.6;

  // District-specific block rendering using venue system
  const getVenuesForDistrict = (): BlockSignage[] => {
    const venues = DISTRICT_VENUES[current];
    const blocks: BlockSignage[] = [];
    for (let i = 0; i < 14; i++) {
      blocks.push(venues[i % venues.length]);
    }
    return blocks;
  };

  const renderCityBlocks = () => {
    const venues = getVenuesForDistrict();
    const blockWidth = 100;  // WIDER buildings
    const totalWidth = blockWidth * venues.length;
    
    // Normalize parallax offset to always be positive for consistent wrapping
    const normalizedOffset = ((parallaxOffset % totalWidth) + totalWidth) % totalWidth;
    
    return venues.map((venue, i) => {
      // Calculate base position and wrap around the total width
      let xPos = (i * blockWidth) - normalizedOffset;
      
      // Wrap blocks that go off-screen left to the right side
      if (xPos < -blockWidth) {
        xPos += totalWidth;
      }
      // Wrap blocks that are too far right to the left
      if (xPos > totalWidth) {
        xPos -= totalWidth;
      }
      
      return (
        <div
          key={`block-${i}`}
          className="absolute flex-shrink-0"
          style={{
            left: `${xPos}px`,
            bottom: 0,
            width: `${blockWidth}px`,
            height: '100%',
          }}
        >
          {renderBlock(venue.type, i, palette, venue.name)}
        </div>
      );
    });
  };

  // ============================================
  // CLEAR BUILDING SIGNAGE SYSTEM
  // Each building type has a distinct color + emoji + label
  // ============================================
  
  // Type-specific styling configs for maximum clarity
  const BUILDING_STYLES: Record<string, { 
    emoji: string; 
    label: string;
    bgColor: string; 
    textColor: string; 
    glowColor: string;
  }> = {
    hub: { emoji: '🚀', label: 'STARTUP HUB', bgColor: '#082010', textColor: '#22ff88', glowColor: '#22ff88' },
    vc: { emoji: '💼', label: 'VC OFFICE', bgColor: '#081020', textColor: '#4499ff', glowColor: '#4499ff' },
    shelter: { emoji: '🏠', label: 'SHELTER', bgColor: '#102010', textColor: '#88cc66', glowColor: '#88cc66' },
    club: { emoji: '💃', label: 'CLUB', bgColor: '#200818', textColor: '#ff44aa', glowColor: '#ff44aa' },
    bar: { emoji: '🍺', label: 'BAR', bgColor: '#201808', textColor: '#ffaa44', glowColor: '#ffaa44' },
    food: { emoji: '🍴', label: 'RESTAURANT', bgColor: '#201008', textColor: '#ff8844', glowColor: '#ff8844' },
    cafe: { emoji: '☕', label: 'CAFE', bgColor: '#181510', textColor: '#cc9966', glowColor: '#aa7744' },
    hostel: { emoji: '🛏️', label: 'HOSTEL', bgColor: '#101810', textColor: '#88aa66', glowColor: '#88aa66' },
    pawn: { emoji: '💰', label: 'PAWN', bgColor: '#181508', textColor: '#ffcc44', glowColor: '#ddaa22' },
    alley: { emoji: '🚬', label: 'ALLEY', bgColor: '#080808', textColor: '#555555', glowColor: '#333333' },
    derelict: { emoji: '🏚️', label: 'EMPTY', bgColor: '#101010', textColor: '#555544', glowColor: '#333322' },
    shop: { emoji: '🏪', label: 'SHOP', bgColor: '#151515', textColor: '#9bbc0f', glowColor: '#9bbc0f' },
    servo: { emoji: '⛽', label: 'SERVO', bgColor: '#101520', textColor: '#ff4444', glowColor: '#ff4444' },
    rsl: { emoji: '🎰', label: 'RSL/POKIES', bgColor: '#180808', textColor: '#ff6644', glowColor: '#ff4422' },
    station: { emoji: '🚂', label: 'STATION', bgColor: '#101520', textColor: '#aaaaff', glowColor: '#8888ff' },
    arcade: { emoji: '🎮', label: 'ARCADE', bgColor: '#100820', textColor: '#ff44ff', glowColor: '#ff44ff' },
  };
  
  const renderBlock = (type: string, index: number, pal: ReturnType<typeof getPalette>, venueName: string) => {
    const isEven = index % 2 === 0;
    const buildingColor = isEven ? pal.building : pal.buildingAlt;
    const signageClass = isTripping ? 'signage-glitch' : '';
    
    // Get styling for this building type
    const style = BUILDING_STYLES[type] || BUILDING_STYLES.shop;
    
    // MEGA SIGN RENDERING - Clear 2-line sign with type label + venue name
    const renderMegaSign = () => (
      <div 
        className={`absolute top-0 left-0 right-0 h-20 flex flex-col items-center justify-center px-1 ${signageClass}`}
        style={{ 
          background: style.bgColor,
          border: `3px solid ${style.textColor}`,
          boxShadow: isNight ? `0 0 25px ${style.glowColor}88, inset 0 0 15px ${style.glowColor}22` : `0 2px 4px rgba(0,0,0,0.5)`,
        }}
      >
        {/* TYPE LABEL - Always visible, consistent */}
        <div 
          className="flex items-center gap-1 font-bold"
          style={{ 
            color: style.textColor,
            fontSize: '10px',
            letterSpacing: '2px',
            textShadow: isNight ? `0 0 10px ${style.glowColor}, 0 0 20px ${style.glowColor}` : '1px 1px 0 #000',
          }}
        >
          <span className="text-[14px]">{style.emoji}</span>
          <span>{style.label}</span>
        </div>
        
        {/* VENUE NAME - The specific place */}
        <div 
          className="font-bold mt-1 text-center leading-tight"
          style={{ 
            color: style.textColor,
            fontSize: '9px',
            letterSpacing: '1px',
            opacity: 0.85,
            textShadow: isNight ? `0 0 8px ${style.glowColor}` : '1px 1px 0 #000',
            maxWidth: '95%',
            overflow: 'hidden',
          }}
        >
          {scrambleText(venueName)}
        </div>
      </div>
    );
    
    // BUILDING BODY rendering (below the sign)
    const renderBuildingBody = (bodyBg: string, features?: React.ReactNode) => (
      <div className="flex-1 relative" style={{ background: bodyBg }}>
        {/* Windows */}
        <div className="absolute top-2 left-2 w-5 h-5" style={{ background: isNight ? `${style.glowColor}33` : '#0a0a0a', border: '1px solid #333' }} />
        <div className="absolute top-2 right-2 w-5 h-5" style={{ background: isNight ? `${style.glowColor}22` : '#080808', border: '1px solid #333' }} />
        {/* Door */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-8" style={{ background: '#0a0a0a', border: '2px solid #333' }}>
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: '#555' }} />
        </div>
        {features}
      </div>
    );
    
    switch (type) {
      case 'hub':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderMegaSign()}
            <div className="flex-1 relative mt-20" style={{ background: '#0c1015' }}>
              <div className="absolute top-1 left-2 right-2 bottom-8" style={{ background: '#0a0e12', border: '2px solid #1a2a35' }}>
                <div className="absolute top-1 left-1 w-4 h-3" style={{ background: '#22ff8833' }} />
                <div className="absolute top-1 right-1 w-4 h-3" style={{ background: '#22ff8844' }} />
                <div className="absolute top-5 left-1 w-4 h-3" style={{ background: '#22ff8822' }} />
                <div className="absolute top-5 right-1 w-4 h-3" style={{ background: '#22ff8855' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-7" style={{ background: '#060a0c', border: '2px solid #2a3a4a' }} />
            </div>
          </div>
        );
      
      case 'vc':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderMegaSign()}
            <div className="flex-1 relative mt-20" style={{ background: '#0a0e14' }}>
              <div className="absolute top-1 left-2 right-2 bottom-8" style={{ background: '#080c10', border: '2px solid #1a2a40' }}>
                <div className="absolute top-1 left-1 w-4 h-3" style={{ background: '#4499ff33' }} />
                <div className="absolute top-1 right-1 w-4 h-3" style={{ background: '#4499ff44' }} />
                <div className="absolute top-5 left-1 w-4 h-3" style={{ background: '#4499ff22' }} />
                <div className="absolute top-5 right-1 w-4 h-3" style={{ background: '#4499ff55' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6" style={{ background: '#060810', border: '2px solid #2a3a50' }}>
                <div className="absolute inset-1 rounded-full border" style={{ borderColor: '#3a4a5a' }} />
              </div>
            </div>
          </div>
        );
      
      case 'shelter':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderMegaSign()}
            <div className="flex-1 relative mt-20" style={{ background: '#101510' }}>
              <div className="absolute top-1 left-2 right-2 bottom-6" style={{ background: '#0c100c', border: '2px solid #1a251a' }}>
                <div className="absolute top-1 left-1 w-4 h-4" style={{ background: shelterOpen ? '#88cc6644' : '#080808' }} />
                <div className="absolute top-1 right-1 w-4 h-4" style={{ background: shelterOpen ? '#88cc6633' : '#080808' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-6" style={{ background: shelterOpen ? '#88cc6622' : '#080c08', border: '2px solid #3a5a3a' }}>
                {shelterOpen && <div className="absolute inset-1 animate-pulse" style={{ background: '#88cc66', opacity: 0.4 }} />}
              </div>
            </div>
          </div>
        );
      
      case 'club':
        return (
          <div className="relative w-full h-full flex flex-col">
            <div 
              className={`absolute top-0 left-0 right-0 h-20 flex flex-col items-center justify-center px-1 ${isNight ? 'neon-buzz' : ''} ${signageClass}`}
              style={{ 
                background: style.bgColor,
                border: `3px solid ${style.textColor}`,
                boxShadow: isNight ? `0 0 30px ${style.glowColor}aa, inset 0 0 20px ${style.glowColor}33` : 'none',
              }}
            >
              <div 
                className="flex items-center gap-1 font-bold"
                style={{ 
                  color: style.textColor,
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textShadow: isNight ? `0 0 12px ${style.glowColor}, 0 0 25px ${style.glowColor}` : 'none',
                }}
              >
                <span className="text-[14px]">{style.emoji}</span>
                <span>{style.label}</span>
              </div>
              <div 
                className="font-bold mt-1"
                style={{ 
                  color: style.textColor,
                  fontSize: '9px',
                  opacity: 0.85,
                  textShadow: isNight ? `0 0 10px ${style.glowColor}` : 'none',
                }}
              >
                {scrambleText(venueName)}
              </div>
            </div>
            <div className="flex-1 relative mt-20" style={{ background: '#0a0508' }}>
              <div className="absolute top-1 left-2 right-2 bottom-6" style={{ background: '#060304', border: isNight ? '2px solid #ff44aa44' : '2px solid #1a0a1a' }}>
                {isNight && (
                  <>
                    <div className="absolute top-0 left-0 w-1 h-full neon-flicker-fast" style={{ background: '#ff44aa', boxShadow: '0 0 10px #ff44aa' }} />
                    <div className="absolute top-0 right-0 w-1 h-full neon-buzz" style={{ background: '#ff44aa', boxShadow: '0 0 10px #ff44aa' }} />
                  </>
                )}
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6" style={{ background: '#060304', border: '2px solid #2a1020' }} />
            </div>
          </div>
        );

      case 'bar':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderMegaSign()}
            <div className="flex-1 relative mt-20" style={{ background: '#141008' }}>
              <div className="absolute top-1 left-2 w-4 h-5" style={{ background: '#0a0805', border: '1px solid #2a1a0a' }}>
                <div className="absolute inset-0" style={{ background: isNight ? '#ffaa4433' : '#ffaa4411' }} />
              </div>
              <div className="absolute top-1 right-2 w-4 h-5" style={{ background: '#0a0805', border: '1px solid #2a1a0a' }}>
                <div className="absolute inset-0" style={{ background: isNight ? '#ffaa4422' : '#ffaa4411' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-7" style={{ background: '#0a0805', border: '2px solid #3a2a15' }}>
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-3" style={{ background: isNight ? '#ffaa4433' : '#ffaa4411' }} />
              </div>
            </div>
            {isNight && <div className="absolute bottom-0 left-0 right-0 h-3 opacity-20" style={{ background: 'linear-gradient(0deg, #ffaa44 0%, transparent 100%)' }} />}
          </div>
        );
      
      case 'food':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderMegaSign()}
            <div className="flex-1 relative mt-20" style={{ background: '#14100a' }}>
              <div className="absolute top-1 left-2 right-2 bottom-6" style={{ background: '#0a0805', border: '1px solid #2a1a10' }}>
                <div className="absolute inset-0" style={{ background: isNight ? '#ff884433' : '#ff884411' }} />
              </div>
              {isNight && (
                <div className="absolute top-2 right-3 w-3 h-4 opacity-30 animate-pulse" style={{ background: 'linear-gradient(0deg, #aaaaaa 0%, transparent 100%)' }} />
              )}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6" style={{ background: '#100a05', border: '2px solid #3a2510' }} />
            </div>
          </div>
        );
      
      case 'cafe':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderMegaSign()}
            <div className="flex-1 relative mt-20" style={{ background: '#14120f' }}>
              <div className="absolute top-1 left-2 right-2 bottom-5" style={{ background: '#0a0908', border: '1px solid #2a2520' }}>
                <div className="absolute inset-0" style={{ background: '#aa886622' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-5" style={{ background: '#0f0d0a', border: '2px solid #3a3025' }} />
            </div>
          </div>
        );
      
      case 'hostel':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderMegaSign()}
            <div className="flex-1 relative mt-20" style={{ background: '#101410' }}>
              <div className="absolute top-1 left-1 w-4 h-4" style={{ background: pal.windowGlow, opacity: 0.25 }} />
              <div className="absolute top-1 right-1 w-4 h-4" style={{ background: pal.windowGlow, opacity: 0.15 }} />
              <div className="absolute top-6 left-1 w-4 h-4" style={{ background: pal.windowGlow, opacity: 0.35 }} />
              <div className="absolute top-6 right-1 w-4 h-4" style={{ background: '#080808' }} />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-5" style={{ background: '#1a2a1a', border: '2px solid #3a4a3a' }} />
            </div>
          </div>
        );
      
      case 'pawn':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderMegaSign()}
            <div className="flex-1 relative mt-20" style={{ background: '#141210' }}>
              <div className="absolute top-1 left-2 right-2 bottom-5" style={{ background: '#0a0a05', border: '1px solid #3a3018' }}>
                <div className="absolute top-1 left-1 w-2 h-2 rounded-sm" style={{ background: '#aa8822' }} />
                <div className="absolute top-1 right-1 w-1.5 h-3" style={{ background: '#888866' }} />
                <div className="absolute bottom-1 left-2 w-4 h-1.5 rounded-sm" style={{ background: '#997722' }} />
              </div>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ddaa22', boxShadow: isNight ? '0 0 4px #ddaa22' : 'none' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ddaa22', boxShadow: isNight ? '0 0 4px #ddaa22' : 'none' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ddaa22', boxShadow: isNight ? '0 0 4px #ddaa22' : 'none' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-4" style={{ background: '#10100a', border: '2px solid #3a3018' }} />
            </div>
          </div>
        );
      
      case 'alley':
        return (
          <div className="relative w-full h-full" style={{ background: '#040404' }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #0a0a0a 0%, #020202 50%, #0a0a0a 100%)' }}>
              {/* Alley has minimal signage - just dark space */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded" style={{ background: '#0a0a0a', border: '1px solid #222' }}>
                <span className="text-[8px] font-bold" style={{ color: '#444' }}>🚬 ALLEY</span>
              </div>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-5" style={{ background: '#0a100a', border: '1px solid #0a1a0a' }} />
              {isNight && <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-2 h-6 opacity-15 animate-pulse" style={{ background: 'linear-gradient(0deg, #555 0%, transparent 100%)' }} />}
              {isNight && (
                <div className="absolute bottom-1 right-3 w-2 h-4 rounded-t" style={{ background: '#050505' }}>
                  <div className="absolute top-1 left-0 w-1 h-1 rounded-full ember-glow" style={{ background: '#ff4400' }} />
                </div>
              )}
            </div>
          </div>
        );
      
      case 'derelict':
        return (
          <div className="relative w-full h-full flex flex-col">
            <div 
              className={`absolute top-0 left-0 right-0 h-20 flex flex-col items-center justify-center px-1 opacity-60 ${signageClass}`}
              style={{ 
                background: '#0c0c0a',
                border: '2px solid #222',
              }}
            >
              <div className="flex items-center gap-1 font-bold" style={{ color: '#444', fontSize: '9px' }}>
                <span className="text-[12px]">🏚️</span>
                <span>EMPTY</span>
              </div>
              <div className="text-[8px] mt-1" style={{ color: '#333' }}>{scrambleText(venueName)}</div>
            </div>
            <div className="flex-1 relative mt-20" style={{ background: '#0a0a08' }}>
              <div className="absolute top-1 left-2 w-4 h-5" style={{ background: '#2a2518', border: '1px solid #1a1510' }}>
                <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(45deg, #3a2a18 0px, #3a2a18 2px, transparent 2px, transparent 5px)' }} />
              </div>
              <div className="absolute top-1 right-2 w-4 h-5" style={{ background: '#2a2518', border: '1px solid #1a1510' }}>
                <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(-45deg, #3a2a18 0px, #3a2a18 2px, transparent 2px, transparent 5px)' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-6" style={{ background: '#101008', border: '1px solid #1a1a15' }}>
                <div className="absolute top-2 left-0 w-full h-0.5 rotate-3" style={{ background: '#2a2518' }} />
              </div>
            </div>
          </div>
        );
      
      case 'servo':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderMegaSign()}
            <div className="flex-1 relative mt-20" style={{ background: '#0c1015' }}>
              <div className="absolute top-1 left-2 right-2 bottom-6" style={{ background: '#0a0c10', border: '2px solid #1a2530' }}>
                <div className="absolute top-1 left-1 w-3 h-4" style={{ background: isNight ? '#ff444444' : '#ff444422', border: '1px solid #aa2222' }} />
                <div className="absolute top-1 right-1 w-3 h-4" style={{ background: isNight ? '#44ff4444' : '#44ff4422', border: '1px solid #22aa22' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-5" style={{ background: '#080a0c', border: '2px solid #1a2025' }} />
            </div>
          </div>
        );
      
      case 'rsl':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderMegaSign()}
            <div className="flex-1 relative mt-20" style={{ background: '#100808' }}>
              <div className="absolute top-1 left-2 right-2 bottom-6" style={{ background: '#0a0505', border: '2px solid #2a1515' }}>
                {isNight && (
                  <>
                    <div className="absolute top-1 left-1 w-2 h-2 animate-pulse" style={{ background: '#ff4422', boxShadow: '0 0 4px #ff4422' }} />
                    <div className="absolute top-1 right-1 w-2 h-2 animate-pulse" style={{ background: '#ffaa22', boxShadow: '0 0 4px #ffaa22', animationDelay: '0.3s' }} />
                    <div className="absolute top-4 left-2 w-2 h-2 animate-pulse" style={{ background: '#22ff44', boxShadow: '0 0 4px #22ff44', animationDelay: '0.6s' }} />
                  </>
                )}
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-5" style={{ background: '#080505', border: '2px solid #2a1010' }} />
            </div>
          </div>
        );
      
      case 'station':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderMegaSign()}
            <div className="flex-1 relative mt-20" style={{ background: '#0c0c12' }}>
              <div className="absolute top-1 left-2 right-2 bottom-6" style={{ background: '#08080c', border: '2px solid #1a1a30' }}>
                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[6px] font-bold" style={{ color: '#6666aa' }}>PLATFORM</div>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-6" style={{ background: '#060608', border: '2px solid #2a2a40' }}>
                <div className="absolute inset-1 flex items-center justify-center text-[5px]" style={{ color: '#4444aa' }}>▶</div>
              </div>
            </div>
          </div>
        );
      
      case 'arcade':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderMegaSign()}
            <div className="flex-1 relative mt-20" style={{ background: '#0a0610' }}>
              <div className="absolute top-1 left-2 right-2 bottom-6" style={{ background: '#060408', border: '2px solid #201030' }}>
                {isNight && (
                  <>
                    <div className="absolute top-1 left-1 w-2 h-3 animate-pulse" style={{ background: '#ff44ff55' }} />
                    <div className="absolute top-1 right-1 w-2 h-3 animate-pulse" style={{ background: '#44ffff55', animationDelay: '0.2s' }} />
                    <div className="absolute top-5 left-1 w-2 h-3 animate-pulse" style={{ background: '#ffff4455', animationDelay: '0.4s' }} />
                  </>
                )}
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-5" style={{ background: '#050308', border: '2px solid #1a1020' }} />
            </div>
          </div>
        );

      case 'shop':
      default:
        const awningColors = ['#6a3535', '#356a35', '#35356a', '#6a5a35'];
        const awningColor = awningColors[index % awningColors.length];
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderMegaSign()}
            <div className="flex-1 relative mt-20" style={{ background: buildingColor }}>
              <div className="absolute top-0 left-0 right-0 h-3" style={{ background: awningColor, borderBottom: `1px solid ${awningColor}88` }} />
              <div className="absolute top-4 left-2 right-2 bottom-5" style={{ background: '#101515', border: '1px solid #2a3030' }}>
                <div className="absolute inset-1" style={{ background: pal.windowGlow, opacity: 0.1 }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-4" style={{ background: '#0a1010', border: '2px solid #2a3535' }} />
            </div>
          </div>
        );
    }
  };
  // Foreground clutter with district variety
  const renderClutter = () => {
    const items = [];
    const clutterTypes = currentConfig.clutterTypes;
    const itemWidth = 55;
    const totalWidth = itemWidth * 18;
    
    // Normalize offset for consistent wrapping
    const normalizedOffset = ((midParallaxOffset % totalWidth) + totalWidth) % totalWidth;
    
    for (let i = 0; i < 18; i++) {
      const type = clutterTypes[i % clutterTypes.length];
      let xPos = (i * itemWidth) - normalizedOffset + 10;
      
      // Wrap items to stay visible
      if (xPos < -itemWidth) {
        xPos += totalWidth;
      }
      if (xPos > totalWidth) {
        xPos -= totalWidth;
      }
      
      items.push(
        <div
          key={`clutter-${i}`}
          className="absolute"
          style={{
            left: `${xPos}px`,
            bottom: '2px',
          }}
        >
          {renderClutterItem(type, i, palette)}
        </div>
      );
    }
    return items;
  };

  const renderClutterItem = (type: string, index: number, pal: ReturnType<typeof getPalette>) => {
    switch (type) {
      case 'bins':
        return (
          <div className="flex gap-0.5">
            <div className="w-2.5 h-4 rounded-t" style={{ background: '#3a4a3a', border: '1px solid #5a6a5a' }} />
            <div className="w-2.5 h-5 rounded-t" style={{ background: '#4a5a4a', border: '1px solid #6a7a6a' }} />
          </div>
        );
      case 'crates':
        return (
          <div className="flex gap-0.5 items-end">
            <div className="w-3 h-2" style={{ background: '#5a4a3a', border: '1px solid #7a6a5a' }} />
            <div className="w-2.5 h-2.5" style={{ background: '#4a3a2a' }} />
            {/* Milk crate */}
            <div className="w-3 h-3 rounded-sm" style={{ background: '#2a4a6a', border: '1px solid #3a5a7a' }}>
              <div className="w-1.5 h-1.5 mt-0.5 mx-auto rounded-sm" style={{ background: '#1a3a5a' }} />
            </div>
          </div>
        );
      case 'trash':
        return (
          <div className="flex gap-0.5 items-end">
            {/* Trash bags */}
            <div className="w-3 h-2 rounded" style={{ background: '#1a1a1a' }} />
            <div className="w-2 h-2.5 rounded" style={{ background: '#252525' }} />
            {/* Scattered items */}
            <div className="w-1.5 h-1" style={{ background: '#4a4a3a' }} />
            {/* Flyers/paper */}
            <div className="w-2 h-0.5 rotate-12" style={{ background: '#8a8a7a' }} />
          </div>
        );
      case 'bottles':
        return (
          <div className="flex gap-1 items-end">
            <div className="w-1 h-2" style={{ background: '#4a6a4a' }} />
            <div className="w-1 h-1.5" style={{ background: '#6a4a3a' }} />
            <div className="w-1 h-2.5" style={{ background: '#3a5a5a' }} />
            {/* Broken bottle */}
            <div className="w-1.5 h-1 rotate-45" style={{ background: '#3a5a3a' }} />
          </div>
        );
      case 'newsrack':
        return (
          <div className="w-3 h-5" style={{ background: '#4a3a3a', border: '1px solid #6a5a5a' }}>
            <div className="w-2 h-2.5 mt-0.5 mx-auto" style={{ background: '#8a8a6a' }} />
            <div className="text-[2px] text-center" style={{ color: '#5a5a4a' }}>NEWS</div>
          </div>
        );
      case 'phonebooth':
        return (
          <div className="w-3.5 h-8 rounded-t relative" style={{ background: '#3a4a5a', border: '1px solid #5a6a7a' }}>
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded" style={{ background: '#2a3a4a' }} />
            {/* Phone cord */}
            <div className="absolute bottom-2 left-1 w-0.5 h-2" style={{ background: '#5a5a5a' }} />
            {isNight && <div className="absolute top-0 left-0 right-0 h-1" style={{ background: '#aaaaff33' }} />}
          </div>
        );
      case 'busstop':
        return (
          <div className="relative">
            <div className="w-0.5 h-9" style={{ background: '#5a5a5a' }} />
            <div className="absolute top-0 left-0 w-5 h-3" style={{ background: '#4a5a4a', border: '1px solid #6a7a6a' }}>
              <div className="text-[2px] text-center mt-0.5" style={{ color: '#8a8a6a' }}>BUS</div>
            </div>
            {/* Bench */}
            <div className="absolute bottom-0 left-1 w-4 h-1.5" style={{ background: '#5a4a3a' }} />
          </div>
        );
      case 'neon':
        return isNight ? (
          <div className="w-4 h-1 animate-pulse" style={{ background: pal.neonPrimary, boxShadow: `0 0 4px ${pal.neonPrimary}` }} />
        ) : null;
      case 'posters':
        return (
          <div className="flex gap-0.5">
            <div className="w-3 h-4" style={{ background: '#4a4a3a', border: '1px solid #5a5a4a' }}>
              <div className="w-2 h-2 mx-auto mt-0.5" style={{ background: '#6a5a4a' }} />
            </div>
            {/* Torn poster */}
            <div className="w-2 h-3" style={{ background: '#5a4a4a', clipPath: 'polygon(0 0, 100% 20%, 100% 100%, 0 80%)' }} />
          </div>
        );
      case 'kebabvan':
        return (
          <div className="relative w-10 h-5" style={{ background: '#3a3530', border: '1px solid #5a5550' }}>
            <div className="absolute top-0.5 left-1 w-2 h-1.5 rounded" style={{ background: '#ffaa4466' }} />
            <div className="text-[3px] absolute bottom-0.5 left-1" style={{ color: '#aa8866' }}>KEBAB</div>
            {isNight && <div className="absolute top-0 left-0 right-0 h-1" style={{ background: '#ffaa4444' }} />}
            {/* Wheels */}
            <div className="absolute -bottom-1 left-1 w-1.5 h-1.5 rounded-full" style={{ background: '#2a2a2a' }} />
            <div className="absolute -bottom-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: '#2a2a2a' }} />
          </div>
        );
      case 'puddles':
        return isRaining ? (
          <div className="w-8 h-1.5 rounded-full opacity-50" style={{ background: 'linear-gradient(90deg, transparent, #6a8a9a, #8aaaaa, #6a8a9a, transparent)' }} />
        ) : null;
      case 'steam':
        return isNight ? (
          <div className="w-3 h-5 opacity-25 animate-pulse" style={{ background: 'linear-gradient(0deg, #ffffff44 0%, transparent 100%)' }} />
        ) : null;
      case 'lanterns':
        return isNight ? (
          <div className="w-2.5 h-4 rounded" style={{ background: '#ff4422', boxShadow: '0 0 6px #ff442266' }}>
            <div className="w-0.5 h-2 mx-auto" style={{ background: '#3a2a1a' }} />
          </div>
        ) : (
          <div className="w-2.5 h-4 rounded" style={{ background: '#aa3322' }} />
        );
      case 'dumpster':
        return (
          <div className="w-6 h-4 rounded-t relative" style={{ background: '#3a5a3a', border: '1px solid #4a6a4a' }}>
            <div className="absolute -top-0.5 left-0 right-0 h-1" style={{ background: '#4a6a4a' }} />
            {/* Trash peeking out */}
            <div className="absolute -top-1 left-1 w-2 h-2 rounded" style={{ background: '#2a2a2a' }} />
          </div>
        );
      case 'cone':
        return (
          <div className="w-2 h-3" style={{ 
            background: 'linear-gradient(180deg, #ff6633 0%, #ff6633 33%, #ffffff 33%, #ffffff 50%, #ff6633 50%)',
            clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)'
          }} />
        );
      case 'smoke':
        return isNight ? (
          <div className="w-1 h-4 opacity-20 animate-pulse" style={{ background: 'linear-gradient(0deg, #888888 0%, transparent 100%)' }} />
        ) : null;
      // New clutter types for additional districts
      case 'flyers':
        return (
          <div className="flex gap-0.5 items-end">
            <div className="w-2 h-3" style={{ background: '#8a7a6a', transform: 'rotate(5deg)' }} />
            <div className="w-1.5 h-2" style={{ background: '#7a8a6a', transform: 'rotate(-8deg)' }} />
          </div>
        );
      case 'ashtrays':
        return (
          <div className="w-3 h-1.5 rounded" style={{ background: '#4a4a4a', border: '1px solid #5a5a5a' }}>
            <div className="w-0.5 h-1 mx-auto" style={{ background: '#888888' }} />
          </div>
        );
      case 'glitter':
        return isNight ? (
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-0.5 h-0.5 rounded-full animate-pulse" style={{ background: i % 2 === 0 ? '#ff88cc' : '#88ffcc', animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : null;
      case 'rainbowFlag':
        return (
          <div className="w-0.5 h-6" style={{ background: '#5a5a5a' }}>
            <div className="absolute top-0 left-1 w-4 h-3" style={{ background: 'linear-gradient(180deg, #ff0000 0%, #ff8800 17%, #ffff00 33%, #00ff00 50%, #0088ff 67%, #8800ff 83%, #ff00ff 100%)' }} />
          </div>
        );
      case 'chalkMenu':
        return (
          <div className="w-4 h-5" style={{ background: '#2a2a2a', border: '1px solid #4a4a4a' }}>
            <div className="text-[2px] p-0.5" style={{ color: '#ffffff' }}>MENU</div>
          </div>
        );
      case 'briefcase':
        return (
          <div className="w-4 h-3" style={{ background: '#5a4a3a', border: '1px solid #7a6a5a', borderRadius: '1px' }}>
            <div className="w-2 h-0.5 mx-auto mt-0.5" style={{ background: '#3a2a1a' }} />
          </div>
        );
      case 'ticketMachine':
        return (
          <div className="w-4 h-7" style={{ background: '#4a5a6a', border: '1px solid #6a7a8a' }}>
            <div className="w-2 h-2 mx-auto mt-1" style={{ background: '#2a3a4a' }} />
            <div className="w-3 h-1 mx-auto mt-1" style={{ background: '#3a4a5a' }} />
          </div>
        );
      case 'timetable':
        return (
          <div className="w-5 h-4" style={{ background: '#ffffff', border: '1px solid #cccccc' }}>
            <div className="text-[2px] p-0.5" style={{ color: '#333333' }}>TRAINS</div>
          </div>
        );
      case 'pigeons':
        return (
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#6a6a6a' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#7a7a7a' }} />
          </div>
        );
      case 'graffiti':
        return (
          <div className="text-[4px] font-bold" style={{ color: '#ff4488', transform: 'rotate(-5deg)' }}>
            SYDE
          </div>
        );
      case 'buskerCorner':
        return (
          <div className="flex gap-1 items-end">
            <div className="w-3 h-4 rounded-t" style={{ background: '#8a6a4a' }} />
            <div className="w-2 h-1" style={{ background: '#666666' }} />
          </div>
        );
      case 'bikes':
        return (
          <div className="flex gap-0.5 items-end">
            <div className="w-4 h-3" style={{ border: '1px solid #5a5a5a', borderRadius: '50%' }} />
            <div className="w-1 h-4" style={{ background: '#5a5a5a' }} />
          </div>
        );
      case 'potPlants':
        return (
          <div className="w-3 h-4">
            <div className="w-3 h-2 rounded-t" style={{ background: '#4a8a4a' }} />
            <div className="w-2 h-2 mx-auto" style={{ background: '#6a4a3a' }} />
          </div>
        );
      case 'dogBowl':
        return (
          <div className="w-3 h-1.5 rounded" style={{ background: '#6a6a8a', border: '1px solid #8a8aaa' }} />
        );
      case 'plasticStools':
        return (
          <div className="flex gap-0.5">
            <div className="w-2 h-2" style={{ background: '#ff4444' }} />
            <div className="w-2 h-2" style={{ background: '#4444ff' }} />
          </div>
        );
      case 'herbCrates':
        return (
          <div className="w-4 h-3" style={{ background: '#4a6a4a', border: '1px solid #5a7a5a' }}>
            <div className="w-3 h-1 mx-auto mt-0.5" style={{ background: '#6a8a6a' }} />
          </div>
        );
      case 'seafoodBoxes':
        return (
          <div className="w-5 h-3" style={{ background: '#3a4a5a', border: '1px solid #4a5a6a' }}>
            <div className="text-[2px] text-center mt-0.5" style={{ color: '#8a9aaa' }}>FISH</div>
          </div>
        );
      case 'scooter':
        return (
          <div className="w-5 h-3" style={{ background: '#cc4444' }}>
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 rounded-full" style={{ background: '#2a2a2a' }} />
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full" style={{ background: '#2a2a2a' }} />
          </div>
        );
      case 'hangingSigns':
        return (
          <div className="w-0.5 h-4" style={{ background: '#5a5a5a' }}>
            <div className="absolute bottom-0 left-0.5 w-3 h-2" style={{ background: '#aa3322', border: '1px solid #884422' }} />
          </div>
        );
      case 'schooner':
        return (
          <div className="w-2 h-3 rounded-t" style={{ background: '#ffcc44', border: '1px solid #cc9922' }}>
            <div className="w-2 h-1 mt-0.5" style={{ background: '#ffffff', opacity: 0.3 }} />
          </div>
        );
      case 'footyPosters':
        return (
          <div className="w-4 h-5" style={{ background: '#3a5a3a', border: '1px solid #4a6a4a' }}>
            <div className="text-[2px] text-center mt-1" style={{ color: '#ffffff' }}>NRL</div>
          </div>
        );
      case 'shoppingTrolleys':
        return (
          <div className="w-4 h-4" style={{ border: '1px solid #8a8a8a', background: '#aaaaaa22' }}>
            <div className="absolute bottom-0 left-0 w-1 h-1 rounded-full" style={{ background: '#5a5a5a' }} />
            <div className="absolute bottom-0 right-0 w-1 h-1 rounded-full" style={{ background: '#5a5a5a' }} />
          </div>
        );
      case 'cars':
        return (
          <div className="w-8 h-3" style={{ background: '#4a4a5a', borderRadius: '2px' }}>
            <div className="absolute top-0 left-1 w-2 h-1.5" style={{ background: '#6a6a7a', borderRadius: '1px' }} />
            <div className="absolute bottom-0 left-1 w-1.5 h-1.5 rounded-full" style={{ background: '#2a2a2a' }} />
            <div className="absolute bottom-0 right-1 w-1.5 h-1.5 rounded-full" style={{ background: '#2a2a2a' }} />
          </div>
        );
      case 'energyCans':
        return (
          <div className="flex gap-0.5">
            <div className="w-1.5 h-2" style={{ background: '#44ff44', border: '1px solid #22cc22' }} />
            <div className="w-1.5 h-2" style={{ background: '#ff4444', border: '1px solid #cc2222' }} />
          </div>
        );
      case 'hoonCar':
        return (
          <div className="w-10 h-4" style={{ background: '#2a2a3a', borderRadius: '2px' }}>
            <div className="absolute top-0 left-2 w-3 h-2" style={{ background: '#3a3a4a', borderRadius: '1px' }} />
            <div className="absolute bottom-0 left-1 w-2 h-2 rounded-full" style={{ background: '#1a1a1a', border: '1px solid #ffcc00' }} />
            <div className="absolute bottom-0 right-1 w-2 h-2 rounded-full" style={{ background: '#1a1a1a', border: '1px solid #ffcc00' }} />
          </div>
        );
      case 'servoSign':
        return (
          <div className="w-5 h-6" style={{ background: '#ff4422', border: '2px solid #ffffff' }}>
            <div className="text-[3px] text-center mt-1 font-bold" style={{ color: '#ffffff' }}>SHELL</div>
          </div>
        );
      case 'syringes':
        return (
          <div className="flex gap-0.5 opacity-60">
            <div className="w-0.5 h-2" style={{ background: '#aaaaaa' }} />
            <div className="w-0.5 h-1.5 rotate-45" style={{ background: '#aaaaaa' }} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* LAYER 0: Fixed Sydney Harbour Skyline - does not scroll */}
      <SkylineBackground timeOfDay={timeOfDay} isRaining={isRaining} />
      
      {/* Overlay gradient for district blending */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(180deg, transparent 0%, ${palette.building}88 60%, ${palette.footpath} 100%)` }}
      />

      {/* LAYER 1: Buildings/Shopfronts */}
      <div className="absolute top-[18%] left-0 right-0 h-[26%] overflow-hidden">
        {renderCityBlocks()}
      </div>

      {/* LAYER 3: Footpath - 10% */}
      <div 
        className="absolute left-0 right-0 h-[10%]"
        style={{ 
          top: '44%',
          background: `linear-gradient(180deg, ${palette.footpath} 0%, ${palette.kerb} 100%)`,
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: palette.kerb }} />
        
        {/* Zone indicators removed - signage is on buildings now */}
      </div>

      {/* LAYER 4: Kerb - 2% */}
      <div className="absolute left-0 right-0 h-[2%]" style={{ top: '54%', background: palette.kerb }} />

      {/* LAYER 5: Road - 14% */}
      <div className="absolute left-0 right-0 h-[14%]" style={{ top: '56%', background: palette.road }}>
        <div 
          className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
          style={{ background: `repeating-linear-gradient(90deg, ${palette.footpath}22 0px, ${palette.footpath}22 15px, transparent 15px, transparent 30px)` }}
        />
        <div className="absolute top-1 left-0 right-0 h-px" style={{ background: '#8a8a2a', opacity: 0.4 }} />
      </div>

      {/* LAYER 6: Foreground clutter - 12% */}
      <div className="absolute left-0 right-0 h-[12%] overflow-hidden pointer-events-none" style={{ top: '62%' }}>
        {renderClutter()}
      </div>

      {/* Neon glow overlay */}
      {isNight && neonIntensity > 0.3 && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div 
            className="absolute top-[12%] left-[15%] w-14 h-20 rounded-full blur-xl"
            style={{ background: `radial-gradient(circle, ${palette.neonPrimary}33 0%, transparent 70%)`, opacity: neonIntensity * 0.4 }}
          />
          <div 
            className="absolute top-[15%] left-[45%] w-10 h-16 rounded-full blur-lg"
            style={{ background: `radial-gradient(circle, ${palette.neonSecondary}33 0%, transparent 70%)`, opacity: neonIntensity * 0.3 }}
          />
          <div 
            className="absolute top-[10%] left-[70%] w-12 h-18 rounded-full blur-xl"
            style={{ background: `radial-gradient(circle, ${palette.neonPrimary}33 0%, transparent 70%)`, opacity: neonIntensity * 0.35 }}
          />
        </div>
      )}

      {/* Rain overlay */}
      {isRaining && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-px animate-rain"
              style={{
                left: `${(i * 1.7) + Math.random()}%`,
                top: `${Math.random() * 50}%`,
                height: '10px',
                background: 'rgba(155, 188, 15, 0.25)',
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
