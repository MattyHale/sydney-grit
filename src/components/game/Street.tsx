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
    const blockWidth = 70;
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
    
    switch (type) {
      case 'services':
      case 'hub':
        // Startup hub / accelerator
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151a20' }} />
            {/* Open plan windows showing activity */}
            <div className="absolute top-1 left-0.5 right-0.5 h-10" style={{ background: '#0a1015', border: '1px solid #2a3540' }}>
              {/* People silhouettes working */}
              <div className="absolute bottom-1 left-1 w-1 h-2 rounded-t" style={{ background: '#2a3a4a' }} />
              <div className="absolute bottom-1 left-3 w-1 h-1.5 rounded-t" style={{ background: '#2a3a4a' }} />
              <div className="absolute bottom-1 right-1 w-1 h-2 rounded-t" style={{ background: '#2a3a4a' }} />
              {/* Whiteboard */}
              <div className="absolute top-1 right-1 w-3 h-2" style={{ background: '#e8e8d8', opacity: 0.3 }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-9" style={{ background: '#0a1015', border: '2px solid #4a5a6a' }}>
              <div className="absolute inset-1" style={{ background: pal.windowGlow, opacity: 0.15 }} />
            </div>
            {/* Hub signage with venue name */}
            <div className={`absolute bottom-10 left-0.5 right-0.5 h-4 flex items-center justify-center text-[3px] font-bold ${signageClass}`} style={{ background: '#1a2a1a', color: '#88cc88', border: '1px solid #4a6a4a' }}>
              {scrambleText(venueName)}
            </div>
            {isNight && (
              <div className="absolute bottom-10 left-0 right-0 h-4 opacity-40" style={{ boxShadow: '0 0 6px #44cc44' }} />
            )}
          </div>
        );
      
      case 'vc':
        // Australian VC office
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a2025' }} />
            {/* Glass facade */}
            <div className="absolute top-1 left-0.5 right-0.5 bottom-12" style={{ background: '#0a1520', border: '1px solid #2a4050' }}>
              {/* Window grid */}
              <div className="absolute top-1 left-1 w-2 h-2" style={{ background: pal.windowGlow, opacity: 0.2 }} />
              <div className="absolute top-1 right-1 w-2 h-2" style={{ background: pal.windowGlow, opacity: 0.3 }} />
              <div className="absolute top-4 left-1 w-2 h-2" style={{ background: pal.windowGlow, opacity: 0.25 }} />
              <div className="absolute top-4 right-1 w-2 h-2" style={{ background: pal.windowGlow, opacity: 0.15 }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-10" style={{ background: '#0a0f15', border: '2px solid #3a4a5a' }}>
              <div className="absolute inset-1" style={{ background: pal.windowGlow, opacity: 0.1 }} />
            </div>
            {/* VC firm signage */}
            <div className={`absolute bottom-11 left-0.5 right-0.5 h-4 flex items-center justify-center text-[3px] font-bold ${signageClass}`} style={{ background: '#1a1a2a', color: '#88aacc', border: '1px solid #3a4a6a' }}>
              {scrambleText(venueName)}
            </div>
            {isNight && (
              <div className="absolute bottom-11 left-0 right-0 h-4 opacity-30" style={{ boxShadow: '0 0 8px #4488cc' }} />
            )}
          </div>
        );
      
      case 'shelter':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }} />
            <div className="absolute bottom-12 left-0 right-0 h-4" style={{ background: '#3a4a3a', borderBottom: '2px solid #2a3a2a' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-12 border-2" style={{ background: shelterOpen ? '#9bbc0f' : '#0f1a0f', borderColor: '#6a8a6a' }}>
              {shelterOpen && <div className="absolute inset-1 animate-pulse" style={{ background: '#9bbc0f', opacity: 0.6 }} />}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4">
                <div className="absolute top-0 left-1.5 w-1 h-4" style={{ background: '#4a6a4a' }} />
                <div className="absolute top-1.5 left-0 w-4 h-1" style={{ background: '#4a6a4a' }} />
              </div>
            </div>
            <div className={`absolute bottom-13 left-0.5 right-0.5 h-3 flex items-center justify-center text-[4px] font-bold ${signageClass}`} style={{ background: '#1a1a1a', color: '#8bac0f' }}>
              {scrambleText(venueName)}
            </div>
          </div>
        );
      
      case 'club':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a0510' }} />
            <div className="absolute top-1 left-1 right-1 h-8" style={{ background: '#0a0308' }}>
              {isNight && (
                <>
                  <div className="absolute top-0 left-0 w-0.5 h-full neon-flicker-fast" style={{ background: '#ff66aa', boxShadow: '0 0 6px #ff66aa' }} />
                  <div className="absolute top-0 right-0 w-0.5 h-full neon-buzz" style={{ background: '#ff66aa', boxShadow: '0 0 6px #ff66aa' }} />
                </>
              )}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-10" style={{ background: '#0f0508', border: '2px solid #3a1a2a' }}>
              <div className="absolute inset-1" style={{ background: 'repeating-linear-gradient(90deg, #2a0a1a 0px, #3a1a2a 2px)' }} />
              {isNight && <div className="absolute inset-1 animate-pulse opacity-20" style={{ background: 'linear-gradient(90deg, transparent, #ff88aa33, transparent)' }} />}
            </div>
            {/* Bouncer silhouette */}
            <div className="absolute bottom-1 right-0.5 w-2.5 h-4 rounded-t" style={{ background: '#0a0505' }}>
              <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5" style={{ background: '#151010' }} />
              {isNight && <div className="absolute bottom-2 -right-0.5 w-0.5 h-0.5 rounded-full ember-glow" style={{ background: '#ff4400' }} />}
            </div>
            {isNight && neonIntensity > 0.3 && (
              <>
                <div className={`absolute bottom-12 left-0.5 right-0.5 h-4 flex items-center justify-center text-[4px] neon-buzz font-bold ${signageClass}`} style={{ color: pal.neonPrimary, textShadow: `0 0 8px ${pal.neonPrimary}` }}>
                  {scrambleText(venueName)}
                </div>
                <div className="absolute top-0 left-0 right-0 h-1 neon-flicker-fast" style={{ background: pal.neonPrimary, boxShadow: `0 0 10px ${pal.neonPrimary}` }} />
              </>
            )}
            {!isNight && (
              <div className={`absolute bottom-12 left-0.5 right-0.5 h-4 flex items-center justify-center text-[4px] font-bold ${signageClass}`} style={{ background: '#2a1a2a', color: '#aa6688' }}>
                {scrambleText(venueName)}
              </div>
            )}
          </div>
        );

      case 'bar':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1510' }} />
            <div className="absolute top-2 left-1 right-1 h-6" style={{ background: '#0a0808' }}>
              <div className="absolute inset-0.5" style={{ background: '#ffaa4411' }} />
              <div className="absolute bottom-0 left-1 w-1 h-2 rounded-t" style={{ background: '#151010' }} />
              <div className="absolute bottom-0 left-3 w-1 h-1.5 rounded-t" style={{ background: '#151010' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-9" style={{ background: '#0f0a08', border: '2px solid #3a2a2a' }}>
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3" style={{ background: '#ffaa4422' }} />
            </div>
            {/* Smokers */}
            <div className="absolute bottom-1 left-0.5 w-1.5 h-2.5 rounded-t" style={{ background: '#151510' }}>
              {isNight && <div className="absolute top-0.5 -right-0.5 w-0.5 h-0.5 rounded-full ember-glow" style={{ background: '#ff4400' }} />}
            </div>
            {isNight && neonIntensity > 0.2 && (
              <>
                <div className={`absolute bottom-11 left-0.5 right-0.5 h-4 flex items-center justify-center text-[4px] neon-flicker-slow font-bold ${signageClass}`} style={{ color: '#ffaa44', textShadow: '0 0 6px #ffaa44' }}>
                  {scrambleText(venueName)}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-4 opacity-15" style={{ background: 'linear-gradient(0deg, #ffaa4444 0%, transparent 100%)' }} />
              </>
            )}
            {!isNight && (
              <div className={`absolute bottom-11 left-0.5 right-0.5 h-4 flex items-center justify-center text-[4px] font-bold ${signageClass}`} style={{ background: '#2a2520', color: '#aa8844' }}>
                {scrambleText(venueName)}
              </div>
            )}
          </div>
        );
      
      case 'food':
        // Restaurant - FOOD establishment
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1815' }} />
            {/* Kitchen window with warm glow */}
            <div className="absolute top-2 left-1 right-1 h-6" style={{ background: '#0a0808' }}>
              <div className="absolute inset-0.5" style={{ background: '#ff884422' }} />
              {/* Steam from kitchen */}
              {isNight && <div className="absolute -top-2 left-2 w-4 h-3 opacity-20 animate-pulse" style={{ background: 'linear-gradient(0deg, #888888 0%, transparent 100%)' }} />}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-10" style={{ background: '#1a1510', border: '2px solid #3a2a20' }}>
              <div className="absolute inset-1" style={{ background: '#ff884411' }} />
              {/* Table silhouette */}
              <div className="absolute bottom-2 left-1 w-4 h-0.5" style={{ background: '#3a3025' }} />
            </div>
            {/* Restaurant signage - clear FOOD indicator */}
            <div className={`absolute bottom-12 left-0.5 right-0.5 h-4 flex items-center justify-center text-[3px] font-bold ${signageClass}`} style={{ background: '#2a1a15', color: '#ffaa66', border: '1px solid #4a3a25' }}>
              {scrambleText(venueName)}
            </div>
            {isNight && (
              <div className="absolute bottom-12 left-0 right-0 h-4 opacity-30" style={{ boxShadow: '0 0 6px #ff8844' }} />
            )}
          </div>
        );
      
      case 'cafe':
        // Cafe - also FOOD
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1a15' }} />
            <div className="absolute top-2 left-1 right-1 h-5" style={{ background: '#0a0a08' }}>
              <div className="absolute inset-0.5" style={{ background: '#aa886622' }} />
              {/* Coffee machine */}
              <div className="absolute bottom-1 right-1 w-2 h-3" style={{ background: '#3a3a35' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#151510', border: '2px solid #3a3a30' }}>
              <div className="absolute inset-1" style={{ background: '#aa884411' }} />
            </div>
            {/* Outdoor seating */}
            <div className="absolute bottom-1 left-0 w-3 h-2" style={{ background: '#2a2a25' }} />
            <div className={`absolute bottom-10 left-0.5 right-0.5 h-3 flex items-center justify-center text-[4px] font-bold ${signageClass}`} style={{ background: '#2a2520', color: '#aa9966' }}>
              {scrambleText(venueName)}
            </div>
          </div>
        );
      
      case 'hostel':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }} />
            <div className="absolute top-1 left-0.5 w-2 h-3" style={{ background: pal.windowGlow, opacity: 0.25 }} />
            <div className="absolute top-1 right-0.5 w-2 h-3" style={{ background: pal.windowGlow, opacity: 0.15 }} />
            <div className="absolute top-5 left-0.5 w-2 h-3" style={{ background: pal.windowGlow, opacity: 0.3 }} />
            <div className="absolute top-5 right-0.5 w-2 h-3" style={{ background: '#0a0808', opacity: 0.8 }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#2a3a2a', border: '1px solid #4a5a4a' }}>
              <div className="absolute top-1 left-0.5 w-2 h-2" style={{ background: '#5a5a4a' }}>
                <div className="w-1 h-0.5 mt-0.5 mx-auto" style={{ background: '#e8e8d0' }} />
              </div>
            </div>
            <div className={`absolute bottom-9 left-0.5 right-0.5 h-3 flex items-center justify-center text-[4px] font-bold ${signageClass}`} style={{ background: '#1a1a1a', color: '#8a8a6a' }}>
              {scrambleText(venueName)}
            </div>
          </div>
        );
      
      case 'pawn':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1a15' }} />
            <div className="absolute top-2 left-1 right-1 h-6" style={{ background: '#0a0a08' }}>
              {/* Display case */}
              <div className="absolute inset-0.5 grid grid-cols-3 gap-0.5 p-0.5">
                <div className="bg-yellow-900 rounded-sm" />
                <div className="bg-gray-600 rounded-sm" />
                <div className="bg-yellow-800 rounded-sm" />
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#151510', border: '2px solid #3a3a25' }} />
            {/* Three balls sign */}
            {isNight && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-0.5">
                <div className="w-2 h-2 rounded-full" style={{ background: '#ffd700', boxShadow: '0 0 4px #ffd700' }} />
                <div className="w-2 h-2 rounded-full" style={{ background: '#ffd700', boxShadow: '0 0 4px #ffd700' }} />
                <div className="w-2 h-2 rounded-full" style={{ background: '#ffd700', boxShadow: '0 0 4px #ffd700' }} />
              </div>
            )}
            <div className={`absolute bottom-10 left-0.5 right-0.5 h-3 flex items-center justify-center text-[4px] font-bold ${signageClass}`} style={{ background: '#2a2a20', color: '#ddaa44' }}>
              {scrambleText(venueName)}
            </div>
          </div>
        );
      
      case 'alley':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#0a0a0a' }} />
            {/* Dark alley with dumpster */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full" style={{ background: 'linear-gradient(90deg, #151515 0%, #0a0a0a 50%, #151515 100%)' }}>
              {/* Dumpster */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-4" style={{ background: '#2a3a2a', border: '1px solid #1a2a1a' }} />
              {/* Smoke/steam */}
              {isNight && <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-2 h-4 opacity-20 animate-pulse" style={{ background: 'linear-gradient(0deg, #888888 0%, transparent 100%)' }} />}
              {/* Dealer silhouette at night */}
              {isNight && (
                <div className="absolute bottom-1 right-1 w-2 h-4 rounded-t" style={{ background: '#151515' }}>
                  {/* Cigarette ember */}
                  <div className="absolute top-1 -left-0.5 w-0.5 h-0.5 rounded-full ember-glow" style={{ background: '#ff4400' }} />
                </div>
              )}
            </div>
            {/* No signage for alleys - they're anonymous */}
          </div>
        );
      
      case 'derelict':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151510' }} />
            {/* Boarded up windows */}
            <div className="absolute top-2 left-1 w-2.5 h-4" style={{ background: '#3a3025', border: '1px solid #2a2015' }}>
              <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(45deg, #4a3a25 0px, #4a3a25 2px, transparent 2px, transparent 4px)' }} />
            </div>
            <div className="absolute top-2 right-1 w-2.5 h-4" style={{ background: '#3a3025', border: '1px solid #2a2015' }}>
              <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(-45deg, #4a3a25 0px, #4a3a25 2px, transparent 2px, transparent 4px)' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-8" style={{ background: '#2a2520', border: '1px solid #3a3025' }} />
            {/* Graffiti */}
            <div className="absolute top-8 left-0.5 text-[3px] rotate-3" style={{ color: '#5a4a3a', opacity: 0.5 }}>NME</div>
            <div className={`absolute bottom-10 left-0.5 right-0.5 h-3 flex items-center justify-center text-[4px] font-bold ${signageClass}`} style={{ background: '#1a1a15', color: '#5a5a4a' }}>
              {scrambleText(venueName)}
            </div>
          </div>
        );

      case 'shop':
      default:
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }} />
            <div className="absolute bottom-11 left-0 right-0 h-2" style={{ background: index % 4 === 0 ? '#8a4a4a' : index % 4 === 1 ? '#4a8a4a' : index % 4 === 2 ? '#4a4a8a' : '#8a8a4a' }} />
            <div className="absolute bottom-0 left-0.5 right-0.5 h-11 border-2" style={{ background: '#1a2525', borderColor: '#3a4545' }}>
              <div className="absolute inset-1" style={{ background: pal.windowGlow, opacity: 0.1 }} />
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-4 rounded-t" style={{ background: '#3a3a3a' }} />
            </div>
            <div className={`absolute bottom-13 left-0.5 right-0.5 h-3 flex items-center justify-center text-[4px] font-bold ${signageClass}`} style={{ background: '#2a2a2a', color: '#9bbc0f' }}>
              {scrambleText(venueName)}
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
