import { HOTSPOTS } from '@/types/game';
import { getDistrictBlend, DISTRICT_CONFIGS, DISTRICT_VENUES, getVenueForBlock, District, BlockSignage } from '@/types/districts';

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

  const renderBlock = (type: string, index: number, pal: ReturnType<typeof getPalette>, venueName: string) => {
    const isEven = index % 2 === 0;
    const buildingColor = isEven ? pal.building : pal.buildingAlt;
    const signageClass = isTripping ? 'signage-glitch' : '';
    
    // BIG SIGNAGE helper - prominent, readable signs at TOP of buildings
    const renderBigSign = (bgColor: string, textColor: string, glowColor?: string, emoji?: string) => (
      <div 
        className={`absolute top-0 left-0 right-0 h-16 flex items-center justify-center px-1 font-bold ${signageClass}`}
        style={{ 
          background: bgColor,
          color: textColor,
          border: `3px solid ${textColor}88`,
          textShadow: isNight && glowColor ? `0 0 12px ${glowColor}, 0 0 24px ${glowColor}` : 'none',
          boxShadow: isNight && glowColor ? `0 0 20px ${glowColor}66, inset 0 0 10px ${glowColor}22` : 'none',
          fontSize: '11px',
          letterSpacing: '1px',
          lineHeight: '1.1',
          textAlign: 'center',
        }}
      >
        {emoji && <span className="mr-1">{emoji}</span>}
        {scrambleText(venueName)}
      </div>
    );
    
    switch (type) {
      case 'hub':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderBigSign('#0a1a12', '#44ff88', '#44ff88', '🚀')}
            <div className="flex-1 relative" style={{ background: '#1a1e22' }}>
              <div className="absolute top-2 left-2 right-2 bottom-10" style={{ background: '#0c1015', border: '2px solid #2a3545' }}>
                <div className="absolute top-2 left-2 w-4 h-3" style={{ background: '#88cc8833' }} />
                <div className="absolute top-2 right-2 w-4 h-3" style={{ background: '#88cc8844' }} />
                <div className="absolute bottom-2 left-3 w-2 h-3 rounded-t" style={{ background: '#3a4a4a' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-9" style={{ background: '#0a0f12', border: '3px solid #3a4a5a' }} />
            </div>
          </div>
        );
      
      case 'vc':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderBigSign('#0a1420', '#66aaff', '#4488ff', '💼')}
            <div className="flex-1 relative" style={{ background: '#141820' }}>
              <div className="absolute top-2 left-2 right-2 bottom-8" style={{ background: '#0a0e14', border: '2px solid #2a3a50' }}>
                <div className="absolute top-2 left-1 w-4 h-3" style={{ background: '#4488cc33' }} />
                <div className="absolute top-2 right-1 w-4 h-3" style={{ background: '#4488cc44' }} />
                <div className="absolute top-6 left-1 w-4 h-3" style={{ background: '#4488cc22' }} />
                <div className="absolute top-6 right-1 w-4 h-3" style={{ background: '#4488cc55' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-7" style={{ background: '#0a0f15', border: '3px solid #3a4a5a' }}>
                <div className="absolute inset-2 rounded-full border-2" style={{ borderColor: '#4a5a6a' }} />
              </div>
            </div>
          </div>
        );
      
      case 'shelter':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderBigSign('#0a1a10', '#88cc66', shelterOpen ? '#88cc66' : undefined, '🏠')}
            <div className="flex-1 relative" style={{ background: '#1a1f1a' }}>
              <div className="absolute top-2 left-2 right-2 bottom-8" style={{ background: '#151a15', border: '2px solid #2a352a' }}>
                <div className="absolute top-2 left-2 w-4 h-4" style={{ background: shelterOpen ? '#9bbc0f44' : '#0a0f0a' }} />
                <div className="absolute top-2 right-2 w-4 h-4" style={{ background: shelterOpen ? '#9bbc0f33' : '#0a0f0a' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-7 border-3" style={{ background: shelterOpen ? '#9bbc0f22' : '#0f1a0f', borderColor: '#4a6a4a' }}>
                {shelterOpen && <div className="absolute inset-1 animate-pulse" style={{ background: '#9bbc0f', opacity: 0.4 }} />}
              </div>
            </div>
          </div>
        );
      
      case 'club':
        return (
          <div className="relative w-full h-full flex flex-col">
            <div 
              className={`absolute top-0 left-0 right-0 h-16 flex items-center justify-center px-1 font-bold ${isNight ? 'neon-buzz' : ''} ${signageClass}`}
              style={{ 
                background: '#1a0515',
                color: '#ff66cc',
                border: '3px solid #ff66aa88',
                textShadow: isNight ? '0 0 12px #ff66aa, 0 0 24px #ff66aa' : 'none',
                boxShadow: isNight ? '0 0 20px #ff66aa66' : 'none',
                fontSize: '11px',
                letterSpacing: '2px',
              }}
            >
              💃 {scrambleText(venueName)}
            </div>
            <div className="flex-1 relative mt-16" style={{ background: '#120810' }}>
              <div className="absolute top-2 left-2 right-2 bottom-8" style={{ background: '#0a0508', border: isNight ? '2px solid #ff66aa44' : '2px solid #2a1a2a' }}>
                {isNight && (
                  <>
                    <div className="absolute top-0 left-0 w-1 h-full neon-flicker-fast" style={{ background: '#ff66aa', boxShadow: '0 0 10px #ff66aa' }} />
                    <div className="absolute top-0 right-0 w-1 h-full neon-buzz" style={{ background: '#ff66aa', boxShadow: '0 0 10px #ff66aa' }} />
                  </>
                )}
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-7" style={{ background: '#0f0508', border: '3px solid #3a1a2a' }} />
              <div className="absolute bottom-1 right-2 w-4 h-6 rounded-t" style={{ background: '#0a0505' }} />
            </div>
          </div>
        );

      case 'bar':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderBigSign('#1a1008', '#ffcc66', isNight ? '#ffaa44' : undefined, '🍺')}
            <div className="flex-1 relative" style={{ background: '#1a1510' }}>
              <div className="absolute top-2 left-2 w-5 h-6" style={{ background: '#0a0805', border: '2px solid #3a2a1a' }}>
                <div className="absolute inset-1" style={{ background: isNight ? '#ffaa4433' : '#ffaa4411' }} />
                <div className="absolute bottom-1 left-1 w-2 h-3 rounded-t" style={{ background: '#151010' }} />
              </div>
              <div className="absolute top-2 right-2 w-5 h-6" style={{ background: '#0a0805', border: '2px solid #3a2a1a' }}>
                <div className="absolute inset-1" style={{ background: isNight ? '#ffaa4422' : '#ffaa4411' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10" style={{ background: '#0f0a05', border: '3px solid #4a3a2a' }}>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-5 h-4" style={{ background: isNight ? '#ffaa4433' : '#ffaa4411' }} />
              </div>
            </div>
            {isNight && <div className="absolute bottom-0 left-0 right-0 h-4 opacity-20" style={{ background: 'linear-gradient(0deg, #ffaa44 0%, transparent 100%)' }} />}
          </div>
        );
      
      case 'food':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderBigSign('#1a1008', '#ffaa66', isNight ? '#ff8844' : undefined, '🍴')}
            <div className="flex-1 relative" style={{ background: '#1a1512' }}>
              <div className="absolute top-2 left-2 right-2 bottom-8" style={{ background: '#0a0805', border: '2px solid #3a2a18' }}>
                <div className="absolute inset-1" style={{ background: isNight ? '#ff884433' : '#ff884411' }} />
                <div className="absolute bottom-2 left-2 w-2 h-3 rounded-t" style={{ background: '#2a2015' }} />
                <div className="absolute bottom-2 right-2 w-2 h-3 rounded-t" style={{ background: '#2a2015' }} />
              </div>
              {isNight && (
                <div className="absolute top-2 right-3 w-4 h-5 opacity-25 animate-pulse" style={{ background: 'linear-gradient(0deg, #aaaaaa 0%, transparent 100%)' }} />
              )}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-11 h-7" style={{ background: '#1a1008', border: '3px solid #4a3520' }} />
            </div>
          </div>
        );
      
      case 'cafe':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderBigSign('#1a1510', '#cc9966', isNight ? '#aa8844' : undefined, '☕')}
            <div className="flex-1 relative" style={{ background: '#1a1815' }}>
              <div className="absolute top-2 left-2 right-2 bottom-6" style={{ background: '#0a0908', border: '2px solid #3a3025' }}>
                <div className="absolute inset-1" style={{ background: '#aa886622' }} />
                <div className="absolute bottom-2 right-2 w-3 h-4" style={{ background: '#3a3530' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-5" style={{ background: '#151210', border: '3px solid #4a3a30' }} />
            </div>
          </div>
        );
      
      case 'hostel':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderBigSign('#0a1a10', '#88aa66', isNight ? '#88aa66' : undefined, '🛏️')}
            <div className="flex-1 relative" style={{ background: '#181a18' }}>
              <div className="absolute top-2 left-1 w-4 h-4" style={{ background: pal.windowGlow, opacity: 0.25 }} />
              <div className="absolute top-2 right-1 w-4 h-4" style={{ background: pal.windowGlow, opacity: 0.15 }} />
              <div className="absolute top-7 left-1 w-4 h-4" style={{ background: pal.windowGlow, opacity: 0.35 }} />
              <div className="absolute top-7 right-1 w-4 h-4" style={{ background: '#0a0a08' }} />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6" style={{ background: '#2a3a2a', border: '2px solid #4a5a4a' }} />
            </div>
          </div>
        );
      
      case 'pawn':
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderBigSign('#1a1508', '#ffcc44', isNight ? '#ddaa22' : undefined, '💰')}
            <div className="flex-1 relative" style={{ background: '#1a1815' }}>
              <div className="absolute top-2 left-2 right-2 bottom-6" style={{ background: '#0a0a05', border: '2px solid #4a4020' }}>
                <div className="absolute top-2 left-2 w-3 h-3 rounded-sm" style={{ background: '#aa8822' }} />
                <div className="absolute top-2 right-2 w-2 h-4" style={{ background: '#888866' }} />
                <div className="absolute bottom-2 left-3 w-5 h-2 rounded-sm" style={{ background: '#997722' }} />
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
                <div className="w-3 h-3 rounded-full" style={{ background: '#ddaa22', boxShadow: isNight ? '0 0 6px #ddaa22' : 'none' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#ddaa22', boxShadow: isNight ? '0 0 6px #ddaa22' : 'none' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#ddaa22', boxShadow: isNight ? '0 0 6px #ddaa22' : 'none' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-5" style={{ background: '#151510', border: '3px solid #4a4025' }} />
            </div>
          </div>
        );
      
      case 'alley':
        return (
          <div className="relative w-full h-full" style={{ background: '#050505' }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #101010 0%, #030303 50%, #101010 100%)' }}>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 h-12 flex items-center justify-center text-[10px] font-bold" style={{ color: '#333333' }}>
                ALLEY
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-6" style={{ background: '#1a2a1a', border: '2px solid #0a1a0a' }} />
              {isNight && <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3 h-8 opacity-15 animate-pulse" style={{ background: 'linear-gradient(0deg, #666666 0%, transparent 100%)' }} />}
              {isNight && (
                <div className="absolute bottom-2 right-4 w-3 h-6 rounded-t" style={{ background: '#080808' }}>
                  <div className="absolute top-2 left-0 w-1 h-1 rounded-full ember-glow" style={{ background: '#ff4400' }} />
                </div>
              )}
            </div>
          </div>
        );
      
      case 'derelict':
        return (
          <div className="relative w-full h-full flex flex-col">
            <div 
              className={`absolute top-0 left-0 right-0 h-16 flex items-center justify-center px-1 font-bold opacity-50 ${signageClass}`}
              style={{ 
                background: '#1a1815',
                color: '#4a4a40',
                border: '3px solid #2a2a2a',
                fontSize: '10px',
              }}
            >
              {scrambleText(venueName)}
            </div>
            <div className="flex-1 relative mt-16" style={{ background: '#121210' }}>
              <div className="absolute top-2 left-2 w-5 h-6" style={{ background: '#3a3020', border: '2px solid #2a2015' }}>
                <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(45deg, #4a3a20 0px, #4a3a20 3px, transparent 3px, transparent 7px)' }} />
              </div>
              <div className="absolute top-2 right-2 w-5 h-6" style={{ background: '#3a3020', border: '2px solid #2a2015' }}>
                <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(-45deg, #4a3a20 0px, #4a3a20 3px, transparent 3px, transparent 7px)' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8" style={{ background: '#1a1510', border: '2px solid #2a2520' }}>
                <div className="absolute top-3 left-0 w-full h-1 rotate-6" style={{ background: '#3a3020' }} />
              </div>
              <div className="absolute bottom-10 left-2 text-[6px] rotate-3" style={{ color: '#5a4a3a', opacity: 0.6 }}>NME</div>
            </div>
          </div>
        );

      case 'shop':
      default:
        const awningColors = ['#8a4a4a', '#4a8a4a', '#4a4a8a', '#8a7a4a'];
        const awningColor = awningColors[index % awningColors.length];
        return (
          <div className="relative w-full h-full flex flex-col">
            {renderBigSign('#1a1a1a', '#9bbc0f', isNight ? '#9bbc0f' : undefined, '🏪')}
            <div className="flex-1 relative" style={{ background: buildingColor }}>
              <div className="absolute top-0 left-0 right-0 h-4" style={{ background: awningColor, borderBottom: `2px solid ${awningColor}88` }} />
              <div className="absolute top-5 left-2 right-2 bottom-6" style={{ background: '#1a2020', border: '2px solid #3a4040' }}>
                <div className="absolute inset-2" style={{ background: pal.windowGlow, opacity: 0.1 }} />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-5 rounded-t" style={{ background: '#3a3a3a' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-5 border-3" style={{ background: '#151a1a', borderColor: '#3a4545' }} />
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
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: `linear-gradient(180deg, ${palette.sky} 0%, ${palette.building} 100%)` }}>
      {/* LAYER 1: Skyline - 6% */}
      <div className="absolute top-0 left-0 right-0 h-[6%]" style={{ background: palette.sky }}>
        <div className="absolute bottom-0 left-0 right-0 h-full flex items-end">
          {[...Array(25)].map((_, i) => (
            <div
              key={`sky-${i}`}
              className="flex-shrink-0"
              style={{
                width: `${15 + (i % 4) * 10}px`,
                height: `${30 + (i % 5) * 15}%`,
                background: palette.building,
                marginLeft: '-1px',
                transform: `translateX(${-parallaxOffset * 0.15}px)`,
              }}
            />
          ))}
        </div>
        
        {/* Sydney Harbour Bridge silhouette - anchored in skyline */}
        <div 
          className="absolute bottom-0 h-full pointer-events-none"
          style={{ 
            left: `${40 - (parallaxOffset * 0.05) % 100}%`,
            width: '80px',
          }}
        >
          {/* Main arch */}
          <div 
            className="absolute bottom-0 w-full h-[80%]"
            style={{
              background: 'transparent',
              borderTop: `3px solid ${palette.building}`,
              borderRadius: '50% 50% 0 0',
            }}
          />
          {/* Bridge deck */}
          <div 
            className="absolute bottom-[15%] left-0 right-0 h-[4px]"
            style={{ background: palette.building }}
          />
          {/* Pylons */}
          <div 
            className="absolute bottom-0 left-[5%] w-[6px] h-[60%]"
            style={{ background: palette.building }}
          />
          <div 
            className="absolute bottom-0 right-[5%] w-[6px] h-[60%]"
            style={{ background: palette.building }}
          />
          {/* Vertical cables */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`cable-${i}`}
              className="absolute bottom-[15%] w-px"
              style={{
                left: `${15 + i * 10}%`,
                height: `${25 + Math.sin(i * 0.8) * 15}%`,
                background: palette.building,
                opacity: 0.7,
              }}
            />
          ))}
          {/* Car lights at night */}
          {isNight && (
            <div 
              className="absolute bottom-[17%] left-[20%] right-[20%] h-px animate-pulse"
              style={{ background: '#ffaa4433' }}
            />
          )}
        </div>
        
        {/* Centrepoint Tower silhouette */}
        <div 
          className="absolute bottom-0"
          style={{ 
            left: `${75 - (parallaxOffset * 0.03) % 100}%`,
          }}
        >
          {/* Tower spike */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] h-[90%]" style={{ background: palette.building }} />
          {/* Observation deck */}
          <div className="absolute bottom-[50%] left-1/2 -translate-x-1/2 w-[8px] h-[8px] rounded-full" style={{ background: palette.building }} />
          {/* Night glow ring */}
          {isNight && (
            <div className="absolute bottom-[52%] left-1/2 -translate-x-1/2 w-[10px] h-[4px] rounded-full animate-pulse" style={{ background: '#ffcc4444', boxShadow: '0 0 4px #ffcc4422' }} />
          )}
        </div>

        {/* Stars at night */}
        {timeOfDay === 'night' && (
          <>
            <div className="absolute top-1 left-[12%] w-1 h-1 rounded-full animate-pulse" style={{ background: '#9bbc0f' }} />
            <div className="absolute top-2 left-[28%] w-0.5 h-0.5 rounded-full" style={{ background: '#8bac0f' }} />
            <div className="absolute top-1 left-[55%] w-1 h-1 rounded-full animate-pulse" style={{ background: '#9bbc0f' }} />
            <div className="absolute top-2 left-[78%] w-0.5 h-0.5 rounded-full" style={{ background: '#8bac0f' }} />
          </>
        )}
      </div>

      {/* LAYER 2: Buildings/Shopfronts - 38% */}
      <div className="absolute top-[6%] left-0 right-0 h-[38%] overflow-hidden">
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

      {/* LAYER 6: Foreground clutter - 20% */}
      <div className="absolute left-0 right-0 h-[20%] overflow-hidden pointer-events-none" style={{ top: '70%' }}>
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
