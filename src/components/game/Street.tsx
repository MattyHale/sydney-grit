import { HOTSPOTS } from '@/types/game';
import { getDistrictBlend, DISTRICT_CONFIGS, District } from '@/types/districts';

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

  // District-specific block rendering
  const getBlocksForDistrict = () => {
    const blocks: string[] = [];
    const dominant = currentConfig.dominantBlocks;
    for (let i = 0; i < 14; i++) {
      // Mix dominant blocks with some generic variety
      if (i % 3 === 0 && dominant.length > 0) {
        blocks.push(dominant[i % dominant.length]);
      } else {
        const allBlocks = ['shop', 'alley', 'generic', 'bins', ...dominant];
        blocks.push(allBlocks[(i + Math.floor(worldOffset / 50)) % allBlocks.length]);
      }
    }
    return blocks;
  };

  const renderCityBlocks = () => {
    const blockTypes = getBlocksForDistrict();
    const blockWidth = 70;
    const totalWidth = blockWidth * blockTypes.length;
    
    // Normalize parallax offset to always be positive for consistent wrapping
    const normalizedOffset = ((parallaxOffset % totalWidth) + totalWidth) % totalWidth;
    
    return blockTypes.map((type, i) => {
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
          {renderBlock(type, i, palette, currentConfig.signage)}
        </div>
      );
    });
  };

  const renderBlock = (type: string, index: number, pal: ReturnType<typeof getPalette>, signage: string[]) => {
    const sign = signage[index % signage.length] || '';
    const isEven = index % 2 === 0;
    const buildingColor = isEven ? pal.building : pal.buildingAlt;
    const signageClass = isTripping ? 'signage-glitch' : '';
    
    switch (type) {
      case 'services':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }}>
              <div className="absolute top-2 left-1 w-2 h-3" style={{ background: pal.windowGlow, opacity: 0.3 }} />
              <div className="absolute top-2 right-1 w-2 h-3" style={{ background: pal.windowGlow, opacity: 0.3 }} />
            </div>
            {/* Awning */}
            <div className="absolute bottom-10 left-0 right-0 h-3" style={{ background: '#4a6a8a', borderBottom: '2px solid #3a5a7a' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-10 border-2" style={{ background: servicesOpen ? pal.windowGlow : '#0a0f0a', borderColor: '#8bac0f' }}>
              {servicesOpen && <div className="absolute inset-1 animate-pulse" style={{ background: '#8bac0f', opacity: 0.7 }} />}
            </div>
            <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 px-1 text-[5px] font-bold ${signageClass}`} style={{ background: '#1a1a1a', color: '#9bbc0f', border: '1px solid #8bac0f' }}>
              {scrambleText('SERVICES')}
            </div>
          </div>
        );
      
      case 'shelter':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }} />
            {/* Overhang */}
            <div className="absolute bottom-12 left-0 right-0 h-4" style={{ background: '#3a4a3a', borderBottom: '2px solid #2a3a2a' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-12 border-2" style={{ background: shelterOpen ? '#9bbc0f' : '#0f1a0f', borderColor: '#6a8a6a' }}>
              {shelterOpen && <div className="absolute inset-1 animate-pulse" style={{ background: '#9bbc0f', opacity: 0.6 }} />}
              {/* Cross symbol */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4">
                <div className="absolute top-0 left-1.5 w-1 h-4" style={{ background: '#4a6a4a' }} />
                <div className="absolute top-1.5 left-0 w-4 h-1" style={{ background: '#4a6a4a' }} />
              </div>
            </div>
            <div className={`absolute bottom-13 left-1/2 -translate-x-1/2 px-1 text-[5px] font-bold ${signageClass}`} style={{ background: '#1a1a1a', color: '#8bac0f' }}>
              {scrambleText('SHELTER')}
            </div>
          </div>
        );
      
      case 'stripclub':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a0510' }} />
            <div className="absolute top-1 left-1 right-1 h-8" style={{ background: '#0a0308' }}>
              {/* Vertical neon tubes on either side - with flicker */}
              {isNight && (
                <>
                  <div className="absolute top-0 left-0 w-0.5 h-full neon-flicker-fast" style={{ background: '#ff66aa', boxShadow: '0 0 6px #ff66aa' }} />
                  <div className="absolute top-0 right-0 w-0.5 h-full neon-buzz" style={{ background: '#ff66aa', boxShadow: '0 0 6px #ff66aa' }} />
                </>
              )}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-10" style={{ background: '#0f0508', border: '2px solid #3a1a2a' }}>
              {/* Curtain with shimmer */}
              <div className="absolute inset-1" style={{ background: 'repeating-linear-gradient(90deg, #2a0a1a 0px, #3a1a2a 2px)' }} />
              {isNight && <div className="absolute inset-1 animate-pulse opacity-20" style={{ background: 'linear-gradient(90deg, transparent, #ff88aa33, transparent)' }} />}
            </div>
            {/* Bouncer silhouette with cigarette */}
            <div className="absolute bottom-1 right-0.5 w-2.5 h-4 rounded-t" style={{ background: '#0a0505' }}>
              <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5" style={{ background: '#151010' }} />
              {/* Cigarette ember */}
              {isNight && <div className="absolute bottom-2 -right-0.5 w-0.5 h-0.5 rounded-full ember-glow" style={{ background: '#ff4400' }} />}
            </div>
            {/* Clubber queue silhouettes */}
            <div className="absolute bottom-1 left-0 flex gap-0.5">
              <div className="w-1 h-2.5 rounded-t" style={{ background: '#150a10' }} />
              <div className="w-1 h-2 rounded-t" style={{ background: '#150a10' }} />
            </div>
            {/* Graffiti tag on wall */}
            <div className="absolute top-10 left-0.5 text-[3px] rotate-6" style={{ color: '#4a3a5a', opacity: 0.5 }}>XTC</div>
            {isNight && neonIntensity > 0.3 && (
              <>
                {/* Female silhouette neon - stylized, non-explicit */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-8 h-6 neon-flicker-slow">
                  <div className="w-2 h-2 rounded-full mx-auto" style={{ background: pal.neonPrimary, boxShadow: `0 0 6px ${pal.neonPrimary}` }} />
                  <div className="w-1 h-3 mx-auto" style={{ background: pal.neonPrimary, boxShadow: `0 0 4px ${pal.neonPrimary}` }} />
                </div>
                <div className={`absolute bottom-19 left-1/2 -translate-x-1/2 px-1 py-0.5 text-[5px] neon-buzz font-bold ${signageClass}`} style={{ color: pal.neonPrimary, textShadow: `0 0 8px ${pal.neonPrimary}` }}>
                  {scrambleText('GIRLS')}
                </div>
                <div className="absolute top-0 left-0 right-0 h-1 neon-flicker-fast" style={{ background: pal.neonPrimary, boxShadow: `0 0 10px ${pal.neonPrimary}` }} />
                {/* Smoke haze */}
                <div className="absolute bottom-8 left-0 right-0 h-4 opacity-15" style={{ background: 'linear-gradient(0deg, #888888 0%, transparent 100%)' }} />
                {/* Puddle reflection */}
                <div className="absolute bottom-0 left-1 w-8 h-1 rounded puddle-shimmer" style={{ background: `linear-gradient(90deg, transparent, ${pal.neonPrimary}22, transparent)` }} />
              </>
            )}
          </div>
        );

      case 'bar':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1510' }} />
            <div className="absolute top-2 left-1 right-1 h-6" style={{ background: '#0a0808' }}>
              {/* Window with warm glow */}
              <div className="absolute inset-0.5" style={{ background: '#ffaa4411' }} />
              {/* Bar patrons silhouettes */}
              <div className="absolute bottom-0 left-1 w-1 h-2 rounded-t" style={{ background: '#151010' }} />
              <div className="absolute bottom-0 left-3 w-1 h-1.5 rounded-t" style={{ background: '#151010' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-9" style={{ background: '#0f0a08', border: '2px solid #3a2a2a' }}>
              {/* Door window */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3" style={{ background: '#ffaa4422' }} />
            </div>
            {/* Smokers outside with cigarette ember */}
            <div className="absolute bottom-1 left-0.5 w-1.5 h-2.5 rounded-t" style={{ background: '#151510' }}>
              {isNight && <div className="absolute top-0.5 -right-0.5 w-0.5 h-0.5 rounded-full ember-glow" style={{ background: '#ff4400' }} />}
            </div>
            {isNight && <div className="absolute bottom-3 left-1 w-0.5 h-2 opacity-20 animate-pulse" style={{ background: 'linear-gradient(0deg, #888888 0%, transparent 100%)' }} />}
            {/* Graffiti on side */}
            <div className="absolute top-8 right-0.5 text-[2px] -rotate-12" style={{ color: '#5a4a3a', opacity: 0.4 }}>ACE</div>
            {isNight && neonIntensity > 0.2 && (
              <>
                <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[6px] neon-flicker-slow font-bold ${signageClass}`} style={{ color: '#ffaa44', textShadow: '0 0 6px #ffaa44' }}>
                  {scrambleText('BAR')}
                </div>
                {/* Beer glass neon with flicker */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-4 rounded-b border neon-buzz" style={{ borderColor: '#ffaa44', boxShadow: '0 0 4px #ffaa4488' }} />
                {/* Amber light spill */}
                <div className="absolute bottom-0 left-0 right-0 h-4 opacity-15" style={{ background: 'linear-gradient(0deg, #ffaa4444 0%, transparent 100%)' }} />
                {/* Puddle reflection */}
                <div className="absolute bottom-0 left-2 w-6 h-0.5 rounded puddle-shimmer" style={{ background: 'linear-gradient(90deg, transparent, #ffaa4433, transparent)' }} />
              </>
            )}
          </div>
        );
      
      case 'hostel':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }} />
            {/* Multiple floors of windows - backpacker hostel vibe */}
            <div className="absolute top-1 left-0.5 w-2 h-3" style={{ background: pal.windowGlow, opacity: 0.25 }} />
            <div className="absolute top-1 right-0.5 w-2 h-3" style={{ background: pal.windowGlow, opacity: 0.15 }} />
            <div className="absolute top-5 left-0.5 w-2 h-3" style={{ background: pal.windowGlow, opacity: 0.3 }} />
            <div className="absolute top-5 right-0.5 w-2 h-3" style={{ background: '#0a0808', opacity: 0.8 }} />
            <div className="absolute top-9 left-0.5 w-2 h-3" style={{ background: '#0a0808' }} />
            <div className="absolute top-9 right-0.5 w-2 h-3" style={{ background: pal.windowGlow, opacity: 0.2 }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#2a3a2a', border: '1px solid #4a5a4a' }}>
              {/* Noticeboard */}
              <div className="absolute top-1 left-0.5 w-2 h-2" style={{ background: '#5a5a4a' }}>
                <div className="w-1 h-0.5 mt-0.5 mx-auto" style={{ background: '#e8e8d0' }} />
              </div>
            </div>
            <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold px-0.5 ${signageClass}`} style={{ background: '#1a1a1a', color: '#8a8a6a' }}>{scrambleText('HOSTEL')}</div>
            {/* Backpacker silhouettes with packs */}
            <div className="absolute bottom-1 left-0 flex gap-0.5 items-end">
              <div className="w-1.5 h-2.5 rounded-t" style={{ background: '#1a2a1a' }}>
                <div className="w-1 h-1.5 -mt-0.5 mx-auto rounded" style={{ background: '#4a5a3a' }} />
              </div>
              <div className="w-1.5 h-2 rounded-t" style={{ background: '#1a2a1a' }}>
                <div className="w-1 h-1 -mt-0.5 mx-auto rounded" style={{ background: '#3a4a5a' }} />
              </div>
            </div>
            {/* Chalkboard specials */}
            {isNight && (
              <div className="absolute bottom-10 right-0.5 w-3 h-2" style={{ background: '#0a0a0a', border: '1px solid #2a2a2a' }}>
                <div className="text-[2px] text-center mt-0.5" style={{ color: '#888866' }}>$5</div>
              </div>
            )}
          </div>
        );
        
      case 'kebab':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }} />
            {/* Bright stainless steel shopfront */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#3a2a20', border: '1px solid #4a3a30' }}>
              <div className="absolute top-1 left-1 right-1 h-5" style={{ background: '#4a3525' }}>
                {/* Food display glow */}
                <div className="absolute inset-0.5" style={{ background: '#ffaa4433' }} />
                {/* Rotisserie meat */}
                <div className="absolute top-0.5 left-1 w-2.5 h-4 rounded" style={{ background: 'linear-gradient(180deg, #5a3a1a 0%, #7a4a2a 50%, #5a3a1a 100%)' }} />
                {/* Sauce bottles */}
                <div className="absolute bottom-0.5 right-0.5 w-0.5 h-2" style={{ background: '#ff4444' }} />
                <div className="absolute bottom-0.5 right-1.5 w-0.5 h-2" style={{ background: '#ffffff' }} />
              </div>
              {/* Counter with wrappers */}
              <div className="absolute bottom-1 left-1 w-4 h-1" style={{ background: '#e8e0d0' }} />
            </div>
            {/* Messy wrappers on ground */}
            <div className="absolute bottom-0 right-0.5 w-2 h-0.5 rotate-12" style={{ background: '#e8e0d0' }} />
            <div className={`absolute bottom-13 left-1/2 -translate-x-1/2 text-[5px] font-bold px-1 ${signageClass}`} style={{ color: '#ffcc44', textShadow: isNight ? '0 0 4px #ffaa44' : 'none' }}>{scrambleText('KEBAB')}</div>
            {isNight && (
              <>
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-10 h-1" style={{ background: '#ffaa44', boxShadow: '0 0 8px #ffaa44' }} />
                {/* Loud late-night crowd silhouettes */}
                <div className="absolute bottom-1 left-0 flex gap-0.5">
                  <div className="w-1 h-2 rounded-t" style={{ background: '#1a1510' }} />
                  <div className="w-1 h-2.5 rounded-t" style={{ background: '#1a1510' }} />
                  <div className="w-1 h-2 rounded-t" style={{ background: '#1a1510' }} />
                </div>
                {/* Light spill */}
                <div className="absolute bottom-0 left-0 right-0 h-6 opacity-25" style={{ background: 'linear-gradient(0deg, #ffaa4444 0%, transparent 100%)' }} />
                {/* Steam plume */}
                <div className="absolute bottom-14 left-2 w-3 h-5 opacity-20 animate-pulse" style={{ background: 'linear-gradient(0deg, #ffffff44 0%, transparent 100%)' }} />
              </>
            )}
          </div>
        );
        
      case 'restaurant':
      case 'foodstall':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#2a1a10' }} />
            {/* Red awning for Chinatown */}
            <div className="absolute top-0 left-0 right-0 h-4" style={{ background: '#8a2a1a', borderBottom: '1px solid #5a1a0a' }} />
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#3a2515' }}>
              <div className="absolute inset-1" style={{ background: '#ffcc6622' }} />
              {/* Food in window */}
              <div className="absolute top-1 left-1 w-2 h-2 rounded-full" style={{ background: '#8a6a4a' }} />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#6a5a3a' }} />
            </div>
            <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 text-[4px] font-bold px-0.5 ${signageClass}`} style={{ color: '#ffcc66' }}>{scrambleText(sign || 'FOOD')}</div>
            {isNight && <div className="absolute bottom-0 left-0 right-0 h-5 opacity-25" style={{ background: 'linear-gradient(0deg, #ffaa4444 0%, transparent 100%)' }} />}
            {/* Lantern */}
            {warmth > 0.7 && (
              <div className="absolute top-5 left-1 w-2 h-3 rounded" style={{ background: '#ff4422', boxShadow: isNight ? '0 0 4px #ff442266' : 'none' }} />
            )}
          </div>
        );
        
      case 'soup':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }} />
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#3a3a35' }}>
              {/* Counter */}
              <div className="absolute top-0 left-0 right-0 h-2" style={{ background: '#5a5a50' }} />
              {/* Steam */}
              {isNight && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-4 opacity-30 animate-pulse" style={{ background: 'linear-gradient(0deg, #ffffff33 0%, transparent 100%)' }} />}
            </div>
            <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 text-[4px] font-bold px-0.5 ${signageClass}`} style={{ background: '#1a1a1a', color: '#aaba8a' }}>{scrambleText('SOUP')}</div>
          </div>
        );
        
      case 'pawn':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#15150f' }} />
            {/* Bars on window */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#202015' }}>
              <div className="absolute top-1 left-1 right-1 h-6 border-2" style={{ background: '#0f0f0a', borderColor: '#3a3a25' }}>
                {/* Items in window */}
                <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 rounded-full" style={{ background: '#8a8a4a' }} />
                <div className="absolute bottom-0.5 right-0.5 w-2 h-1" style={{ background: '#6a6a3a' }} />
              </div>
              {/* Security bars */}
              <div className="absolute top-1 left-2 w-px h-6" style={{ background: '#4a4a3a' }} />
              <div className="absolute top-1 left-4 w-px h-6" style={{ background: '#4a4a3a' }} />
            </div>
            <div className={`absolute bottom-13 left-1/2 -translate-x-1/2 text-[5px] font-bold px-1 ${signageClass}`} style={{ color: '#aaaa44', textShadow: isNight ? '0 0 2px #aaaa44' : 'none' }}>{scrambleText('CASH')}</div>
            {isNight && <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-8 h-0.5 animate-pulse" style={{ background: '#aaaa44' }} />}
            {/* Three balls pawn symbol */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#8a8a3a' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#8a8a3a' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#8a8a3a' }} />
            </div>
          </div>
        );
      
      case 'bottleo':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#15100f' }} />
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#201510' }}>
              {/* Bottles in window */}
              <div className="absolute top-1 left-1 right-1 h-6" style={{ background: '#0f0a08' }}>
                <div className="absolute bottom-0 left-0.5 w-1 h-3" style={{ background: '#4a6a4a' }} />
                <div className="absolute bottom-0 left-2 w-1 h-2.5" style={{ background: '#6a4a3a' }} />
                <div className="absolute bottom-0 left-3.5 w-1 h-3.5" style={{ background: '#3a5a5a' }} />
                <div className="absolute bottom-0 right-0.5 w-1 h-2" style={{ background: '#5a5a3a' }} />
              </div>
            </div>
            <div className={`absolute bottom-13 left-1/2 -translate-x-1/2 text-[4px] font-bold px-0.5 ${signageClass}`} style={{ color: '#aa6644' }}>{scrambleText('BOTTLE-O')}</div>
            {isNight && <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-10 h-0.5" style={{ background: '#aa6644' }} />}
          </div>
        );
        
      case 'tab':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#10101a' }} />
            <div className="absolute top-2 left-1 right-1 h-6" style={{ background: '#05050a' }}>
              {/* TV screens */}
              <div className="absolute inset-0.5 grid grid-cols-2 gap-0.5">
                <div style={{ background: '#1a2a3a' }} />
                <div style={{ background: '#1a3a2a' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-9" style={{ background: '#15151a', border: '1px solid #2a2a35' }} />
            <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[6px] font-bold px-1 py-0.5 ${signageClass}`} style={{ background: '#1a1a2a', color: '#4488ff', border: '1px solid #2244aa' }}>{scrambleText('TAB')}</div>
            {isNight && <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-0.5" style={{ background: '#4488ff', boxShadow: '0 0 4px #4488ff' }} />}
          </div>
        );
      
      case 'newsagent':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }} />
            <div className="absolute bottom-0 left-0 right-0 h-11" style={{ background: '#2a2a25' }}>
              {/* Newspaper racks */}
              <div className="absolute top-1 left-0.5 right-0.5 h-4" style={{ background: '#3a3a30' }}>
                <div className="absolute inset-0.5 flex gap-0.5">
                  <div className="flex-1" style={{ background: '#e8e8e0' }} />
                  <div className="flex-1" style={{ background: '#e0e0d8' }} />
                  <div className="flex-1" style={{ background: '#d8d8d0' }} />
                </div>
              </div>
            </div>
            <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 text-[4px] font-bold px-0.5 ${signageClass}`} style={{ color: '#8a8a6a' }}>{scrambleText('NEWS')}</div>
          </div>
        );
        
      case 'station':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1a1a' }} />
            {/* Station roof structure */}
            <div className="absolute top-0 left-0 right-0 h-5" style={{ background: '#252525' }} />
            <div className="absolute top-5 left-0 right-0 h-1" style={{ background: '#3a3a3a' }} />
            <div className="absolute top-7 left-1 right-1 h-7" style={{ background: '#0f0f0f' }}>
              {/* Platform indicator */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-2 rounded" style={{ background: '#252525' }}>
                <span className="text-[4px] text-gray-400">1</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: '#202020' }}>
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-5" style={{ background: '#151515', border: '1px solid #2a2a2a' }} />
            </div>
            <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[5px] font-bold px-1 ${signageClass}`} style={{ color: '#888888', background: '#1a1a1a' }}>{scrambleText('TRAINS')}</div>
            {isNight && <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1.5" style={{ background: '#aaaaaa22' }} />}
          </div>
        );
      
      case 'convenience':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a2a1a' }} />
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#2a3a2a' }}>
              {/* Bright interior */}
              <div className="absolute inset-1" style={{ background: '#4a5a4a33' }} />
              {/* Shelves */}
              <div className="absolute top-1 left-0.5 right-0.5 h-1" style={{ background: '#5a6a5a' }} />
              <div className="absolute top-3 left-0.5 right-0.5 h-1" style={{ background: '#5a6a5a' }} />
            </div>
            <div className={`absolute bottom-13 left-1/2 -translate-x-1/2 text-[4px] font-bold px-0.5 ${signageClass}`} style={{ color: '#66aa66' }}>{scrambleText('24HR')}</div>
            {isNight && <div className="absolute bottom-0 left-0 right-0 h-4 opacity-30" style={{ background: 'linear-gradient(0deg, #aaffaa33 0%, transparent 100%)' }} />}
          </div>
        );
        
      case 'boarded':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#100f0a' }} />
            <div className="absolute top-2 left-1 right-1 h-10" style={{ background: '#15140f' }}>
              {/* Boards nailed over windows */}
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: '#2a2a1a' }} />
              <div className="absolute top-2.5 left-0 right-0 h-1.5" style={{ background: '#252515' }} />
              <div className="absolute top-5 left-0 right-0 h-1.5" style={{ background: '#2a2a1a' }} />
              <div className="absolute top-7.5 left-0 right-0 h-1.5" style={{ background: '#252515' }} />
              {/* Nails */}
              <div className="absolute top-1 left-1 w-0.5 h-0.5 rounded-full" style={{ background: '#4a4a3a' }} />
              <div className="absolute top-1 right-1 w-0.5 h-0.5 rounded-full" style={{ background: '#4a4a3a' }} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-6" style={{ background: '#0a0a05' }} />
            {/* Multiple graffiti tags */}
            <div className="absolute bottom-3 left-1 text-[3px] rotate-6" style={{ color: '#5a4a6a', opacity: 0.6 }}>SYDE</div>
            <div className="absolute bottom-5 right-1 text-[2px] -rotate-3" style={{ color: '#4a5a4a', opacity: 0.5 }}>91</div>
            <div className="absolute top-12 left-3 text-[3px] rotate-12" style={{ color: '#6a3a4a', opacity: 0.4 }}>RIP</div>
            {/* Trash on ground */}
            <div className="absolute bottom-0.5 left-2 w-1 h-0.5 rotate-12" style={{ background: '#2a2a1a' }} />
            <div className="absolute bottom-0.5 right-2 w-0.5 h-1" style={{ background: '#1a1a0a' }} />
          </div>
        );
      
      case 'club':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#10081a' }} />
            <div className="absolute top-1 left-1 right-1 h-8" style={{ background: '#05020a' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-9" style={{ background: '#0a0510', border: '2px solid #3a2a4a' }}>
              {/* Velvet rope suggestion */}
              <div className="absolute -left-1 top-2 bottom-2 w-0.5" style={{ background: '#aa4466' }} />
            </div>
            {/* Queue silhouettes with embers */}
            <div className="absolute bottom-1 left-0 flex gap-0.5 items-end">
              <div className="relative w-1 h-2.5 rounded-t" style={{ background: '#1a1520' }}>
                {isNight && <div className="absolute top-0.5 -right-0.5 w-0.5 h-0.5 rounded-full ember-glow" style={{ background: '#ff4400' }} />}
              </div>
              <div className="w-1 h-2 rounded-t" style={{ background: '#1a1520' }} />
            </div>
            {/* Graffiti */}
            <div className="absolute top-10 right-0.5 text-[2px] rotate-6" style={{ color: '#6a4a6a', opacity: 0.4 }}>RAVE</div>
            {isNight && neonIntensity > 0.5 && (
              <>
                <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 text-[5px] neon-flicker-fast font-bold ${signageClass}`} style={{ color: '#ff44ff', textShadow: '0 0 6px #ff44ff' }}>
                  {scrambleText('CLUB')}
                </div>
                <div className="absolute top-0 left-0 right-0 h-1 neon-buzz" style={{ background: 'linear-gradient(90deg, #ff44ff, #44ffff, #ff44ff)', boxShadow: '0 0 8px #ff44ff' }} />
                {/* Disco lights */}
                <div className="absolute top-3 left-2 w-1 h-1 rounded-full neon-flicker-fast" style={{ background: '#ff44ff' }} />
                <div className="absolute top-4 right-2 w-1 h-1 rounded-full neon-flicker-fast" style={{ background: '#44ffff', animationDelay: '0.3s' }} />
                {/* Puddle reflection of lights */}
                <div className="absolute bottom-0 left-1 w-8 h-1 rounded puddle-shimmer" style={{ background: 'linear-gradient(90deg, #ff44ff22, #44ffff22, #ff44ff22)' }} />
              </>
            )}
          </div>
        );

      case 'alley':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#030303' }} />
            <div className="absolute left-0 top-0 bottom-0 w-2" style={{ background: buildingColor }} />
            <div className="absolute right-0 top-0 bottom-0 w-2" style={{ background: buildingColor }} />
            {/* Dumpster */}
            <div className="absolute bottom-0 left-3 w-4 h-3 rounded-t" style={{ background: '#2a3a2a', border: '1px solid #3a4a3a' }} />
            {/* Trash */}
            <div className="absolute bottom-0 right-3 w-2 h-1.5" style={{ background: '#1a1a1a' }} />
            <div className="absolute bottom-0 right-4 w-1.5 h-2" style={{ background: '#0f0f0f' }} />
            {/* Fire escape */}
            <div className="absolute top-2 left-0 w-1.5 h-6" style={{ background: '#2a2a2a' }} />
            {/* Graffiti tags in alley */}
            <div className="absolute top-4 left-2.5 text-[3px] rotate-12" style={{ color: '#5a3a4a', opacity: 0.6 }}>SYDE</div>
            <div className="absolute top-8 right-2.5 text-[2px] -rotate-6" style={{ color: '#4a4a5a', opacity: 0.5 }}>91</div>
            <div className="absolute bottom-4 left-3 text-[3px]" style={{ color: '#3a5a4a', opacity: 0.4 }}>NME</div>
            {/* Puddle in alley */}
            {isNight && (
              <div className="absolute bottom-0.5 left-4 w-4 h-1 rounded puddle-shimmer" style={{ background: 'linear-gradient(90deg, transparent, #ffffff11, transparent)' }} />
            )}
            {/* Figure lurking - cigarette ember */}
            {isNight && (
              <div className="absolute bottom-1 right-3 w-1.5 h-3 rounded-t opacity-40" style={{ background: '#0a0a0a' }}>
                <div className="absolute top-0.5 -left-0.5 w-0.5 h-0.5 rounded-full ember-glow" style={{ background: '#ff4400' }} />
              </div>
            )}
          </div>
        );
      
      case 'bins':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }} />
            <div className="absolute bottom-0 left-0.5 right-0.5 h-12" style={{ background: '#252a25', borderTop: '2px solid #3a4a3a' }}>
              {/* Loading dock feel */}
              {[...Array(4)].map((_, j) => (
                <div key={j} className="w-full h-px" style={{ background: '#3a4a3a', marginTop: '3px' }} />
              ))}
            </div>
            {/* Multiple bin types */}
            <div className="absolute bottom-1 left-1 w-3 h-4 rounded-t" style={{ background: '#4a5a4a', border: '1px solid #5a6a5a' }} />
            <div className="absolute bottom-1 left-5 w-4 h-5 rounded-t" style={{ background: '#3a4a3a', border: '1px solid #4a5a4a' }} />
            <div className="absolute bottom-1 right-1 w-3 h-3 rounded-t" style={{ background: '#5a5a4a' }} />
          </div>
        );
        
      case 'office':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#252530' }} />
            {/* Grid of windows */}
            <div className="absolute top-1 left-0.5 right-0.5 grid grid-cols-3 gap-0.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-3" style={{ background: pal.windowGlow, opacity: 0.1 + (i % 3) * 0.1 }} />
              ))}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#1a1a20', border: '1px solid #3a3a40' }}>
              {/* Revolving door suggestion */}
              <div className="absolute inset-1" style={{ background: '#0a0a10' }} />
            </div>
          </div>
        );
      
      case 'motel':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1515' }} />
            {/* Two floors of rooms */}
            <div className="absolute top-1 left-0.5 right-0.5 h-4 flex gap-0.5">
              <div className="flex-1" style={{ background: pal.windowGlow, opacity: 0.15 }} />
              <div className="flex-1" style={{ background: '#0a0505' }} />
              <div className="flex-1" style={{ background: pal.windowGlow, opacity: 0.2 }} />
            </div>
            <div className="absolute top-6 left-0.5 right-0.5 h-4 flex gap-0.5">
              <div className="flex-1" style={{ background: '#0a0505' }} />
              <div className="flex-1" style={{ background: pal.windowGlow, opacity: 0.1 }} />
              <div className="flex-1" style={{ background: '#0a0505' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7" style={{ background: '#0f0808', border: '1px solid #2a1a1a' }} />
            {isNight && (
              <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[5px] animate-pulse ${signageClass}`} style={{ color: '#ff6666', textShadow: '0 0 4px #ff666666' }}>{scrambleText('MOTEL')}</div>
            )}
          </div>
        );
      
      // Cabramatta-specific blocks
      case 'pho':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#2a1a10' }} />
            {/* Vietnamese restaurant - warm tones, steam */}
            <div className="absolute top-0 left-0 right-0 h-3" style={{ background: '#7a2a1a', borderBottom: '1px solid #5a1a0a' }} />
            <div className="absolute bottom-0 left-0 right-0 h-11" style={{ background: '#3a2515' }}>
              <div className="absolute inset-1" style={{ background: '#ffcc6633' }} />
              {/* Bowl of pho */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-2 rounded-t-full" style={{ background: '#5a4a3a' }}>
                {isNight && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-3 opacity-40 animate-pulse" style={{ background: 'linear-gradient(0deg, #ffffff33 0%, transparent 100%)' }} />}
              </div>
            </div>
            <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 text-[5px] font-bold px-1 ${signageClass}`} style={{ color: '#ffcc66', textShadow: isNight ? '0 0 3px #ffaa44' : 'none' }}>{scrambleText('PHỞ')}</div>
            {isNight && <div className="absolute bottom-0 left-0 right-0 h-5 opacity-25" style={{ background: 'linear-gradient(0deg, #ffaa4444 0%, transparent 100%)' }} />}
          </div>
        );
        
      case 'goldshop':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1505' }} />
            {/* Gold/jewelry shop - Vietnamese style */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#252010' }}>
              <div className="absolute top-1 left-1 right-1 h-6 border-2" style={{ background: '#0f0a05', borderColor: '#4a4a25' }}>
                {/* Gold items display */}
                <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 rounded-full" style={{ background: '#aa9a4a' }} />
                <div className="absolute bottom-0.5 left-3 w-2 h-1" style={{ background: '#9a8a3a' }} />
                <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: '#aa9a4a' }} />
              </div>
              {/* Security bars */}
              <div className="absolute top-1 left-2 w-px h-6" style={{ background: '#5a5a3a' }} />
              <div className="absolute top-1 right-2 w-px h-6" style={{ background: '#5a5a3a' }} />
            </div>
            <div className={`absolute bottom-13 left-1/2 -translate-x-1/2 text-[4px] font-bold px-0.5 ${signageClass}`} style={{ color: '#ccaa44', textShadow: isNight ? '0 0 2px #ccaa44' : 'none' }}>{scrambleText('VÀNG')}</div>
            {isNight && <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-8 h-0.5 animate-pulse" style={{ background: '#ccaa44' }} />}
          </div>
        );
        
      case 'market':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1a15' }} />
            {/* Open market stall feel */}
            <div className="absolute top-0 left-0 right-0 h-4" style={{ background: '#5a2a2a', borderBottom: '1px solid #4a1a1a' }} />
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#252520' }}>
              {/* Produce */}
              <div className="absolute top-1 left-0.5 right-0.5 h-5 grid grid-cols-3 gap-0.5">
                <div style={{ background: '#4a7a3a' }} />
                <div style={{ background: '#7a5a3a' }} />
                <div style={{ background: '#3a6a4a' }} />
              </div>
            </div>
            <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#8a8a6a' }}>{scrambleText('MARKET')}</div>
          </div>
        );
        
      case 'arcade':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#0a0510' }} />
            {/* Dark arcade - games, seedy */}
            <div className="absolute top-2 left-1 right-1 h-8" style={{ background: '#050208' }}>
              {/* Arcade cabinets with screen flicker */}
              <div className="absolute top-1 left-1 w-3 h-5 rounded-t" style={{ background: '#1a1a2a' }}>
                <div className="w-2 h-2 mx-auto mt-0.5 neon-flicker-fast" style={{ background: '#2a4a3a' }} />
              </div>
              <div className="absolute top-1 right-1 w-3 h-5 rounded-t" style={{ background: '#1a1a2a' }}>
                <div className="w-2 h-2 mx-auto mt-0.5 neon-buzz" style={{ background: '#4a2a3a' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-8" style={{ background: '#0a0508', border: '1px solid #2a1a2a' }} />
            {/* Kid with cigarette */}
            <div className="absolute bottom-1 left-0.5 w-1 h-2 rounded-t" style={{ background: '#1a1520' }}>
              {isNight && <div className="absolute top-0.5 -right-0.5 w-0.5 h-0.5 rounded-full ember-glow" style={{ background: '#ff4400' }} />}
            </div>
            {/* Graffiti */}
            <div className="absolute top-11 right-0.5 text-[2px] rotate-6" style={{ color: '#5a4a6a', opacity: 0.4 }}>PAC</div>
            {isNight && neonIntensity > 0.2 && (
              <>
                <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[5px] neon-flicker-fast font-bold ${signageClass}`} style={{ color: '#ff66aa', textShadow: '0 0 4px #ff66aa' }}>{scrambleText('ARCADE')}</div>
                <div className="absolute top-0 left-0 right-0 h-0.5 neon-buzz" style={{ background: '#ff66aa', boxShadow: '0 0 6px #ff66aa' }} />
                {/* Puddle */}
                <div className="absolute bottom-0 left-2 w-5 h-0.5 rounded puddle-shimmer" style={{ background: 'linear-gradient(90deg, transparent, #ff66aa22, transparent)' }} />
              </>
            )}
          </div>
        );
      
      // === KINGS CROSS VENUES ===
      case 'bourbon':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1510' }} />
            {/* Curved awning - The Bourbon signature */}
            <div className="absolute top-0 left-0 right-0 h-4 rounded-b-lg" style={{ background: '#3a2a20', borderBottom: '2px solid #4a3a30' }} />
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#201510' }}>
              <div className="absolute inset-1" style={{ background: '#ffaa4411' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-9" style={{ background: '#0f0a08', border: '2px solid #4a3a2a' }} />
            {/* Smoker with ember */}
            <div className="absolute bottom-1 left-0.5 w-1.5 h-2.5 rounded-t" style={{ background: '#201510' }}>
              {isNight && <div className="absolute top-0.5 -right-0.5 w-0.5 h-0.5 rounded-full ember-glow" style={{ background: '#ff4400' }} />}
            </div>
            {isNight && (
              <>
                <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 text-[4px] font-bold px-1 neon-flicker-slow ${signageClass}`} style={{ color: '#ffcc44', textShadow: '0 0 6px #ffaa44' }}>
                  {scrambleText('THE BOURBON')}
                </div>
                {/* Warm yellow glow */}
                <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20" style={{ background: 'linear-gradient(0deg, #ffaa4444 0%, transparent 100%)' }} />
                {/* Taxi silhouettes */}
                <div className="absolute bottom-1 right-1 w-4 h-2 rounded-t" style={{ background: '#4a4a2a' }} />
                {/* Puddle reflection */}
                <div className="absolute bottom-0 left-2 w-6 h-0.5 rounded puddle-shimmer" style={{ background: 'linear-gradient(90deg, transparent, #ffcc4422, transparent)' }} />
              </>
            )}
          </div>
        );
        
      case 'brothel':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a0a15' }} />
            {/* Discreet frontage */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#150810' }}>
              {/* Curtained windows - warm pink/blue spill */}
              <div className="absolute top-1 left-1 right-1 h-6" style={{ background: '#0a0508' }}>
                <div className="absolute inset-0.5" style={{ background: 'repeating-linear-gradient(90deg, #2a0a1a 0px, #1a0510 2px)' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-8" style={{ background: '#0a0306', border: '1px solid #3a1a2a' }}>
              {/* Concierge silhouette */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-3 rounded-t" style={{ background: '#1a1015' }} />
            </div>
            {/* Taxi lingering with ember */}
            <div className="absolute bottom-1 right-1 w-3.5 h-2 rounded-t" style={{ background: '#2a2a20' }}>
              {isNight && <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 rounded-full ember-glow" style={{ background: '#ff4400' }} />}
            </div>
            {isNight && neonIntensity > 0.3 && (
              <>
                <div className={`absolute bottom-13 left-1/2 -translate-x-1/2 text-[4px] px-1 neon-buzz ${signageClass}`} style={{ color: '#ff88aa', textShadow: '0 0 4px #ff66aa44' }}>
                  {scrambleText(sign || 'LANGTREES')}
                </div>
                {/* Soft neon glow with flicker */}
                <div className="absolute top-0 left-0 right-0 h-0.5 neon-flicker-slow" style={{ background: '#ff88aa', boxShadow: '0 0 8px #ff66aa44' }} />
                {/* Light spill onto pavement */}
                <div className="absolute bottom-0 left-0 right-0 h-4 opacity-15" style={{ background: 'linear-gradient(0deg, #ff88aa22 0%, transparent 100%)' }} />
                {/* Puddle reflection */}
                <div className="absolute bottom-0 left-1 w-6 h-0.5 rounded puddle-shimmer" style={{ background: 'linear-gradient(90deg, transparent, #ff88aa22, transparent)' }} />
              </>
            )}
          </div>
        );
        
      case 'parlour':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151015' }} />
            {/* Massage parlour - frosted windows, discreet */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#1a1015' }}>
              <div className="absolute top-1 left-1 right-1 h-5" style={{ background: '#251520', border: '1px solid #352530' }}>
                {/* Frosted glass effect */}
                <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, #ffffff08 0px, transparent 1px)' }} />
              </div>
              {/* Beads/curtains silhouette */}
              <div className="absolute bottom-0 left-1 w-0.5 h-4 opacity-50" style={{ background: '#4a3a4a' }} />
              <div className="absolute bottom-0 left-2 w-0.5 h-3.5 opacity-50" style={{ background: '#4a3a4a' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7" style={{ background: '#0f0810', border: '1px solid #2a1a2a' }} />
            {isNight && (
              <>
                <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] px-1 ${signageClass}`} style={{ color: '#ffaacc', textShadow: '0 0 3px #ff88aa33' }}>
                  {scrambleText('MASSAGE')}
                </div>
                {/* Warm interior fluro */}
                <div className="absolute top-5 left-2 right-2 h-0.5 opacity-40" style={{ background: '#ffccdd' }} />
              </>
            )}
            {/* Smokers silhouette */}
            <div className="absolute bottom-1 right-1 w-1.5 h-3 rounded-t opacity-60" style={{ background: '#1a1a1a' }} />
          </div>
        );

      // === OXFORD ST VENUES ===
      case 'stonewall':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#15101a' }} />
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#1a151f' }}>
              {/* Upstairs dance silhouettes */}
              <div className="absolute top-1 left-1 right-1 h-4" style={{ background: '#0a0810' }}>
                <div className="absolute bottom-0 left-1 w-1 h-2 rounded-t animate-pulse" style={{ background: '#2a2a3a' }} />
                <div className="absolute bottom-0 left-3 w-1 h-2.5 rounded-t" style={{ background: '#2a2a3a', animationDelay: '0.2s' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-9" style={{ background: '#0a0510', border: '2px solid #3a2a4a' }}>
              {/* Queue on sidewalk */}
              <div className="absolute -left-2 bottom-1 w-1 h-2 rounded-t" style={{ background: '#252530' }} />
            </div>
            {isNight && neonIntensity > 0.4 && (
              <>
                <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 text-[4px] font-bold animate-pulse ${signageClass}`} style={{ color: '#ff44ff', textShadow: '0 0 6px #ff44ff' }}>
                  {scrambleText('STONEWALL')}
                </div>
                {/* Rainbow neon glow */}
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #ff4444, #ffaa44, #44ff44, #44aaff, #aa44ff)', boxShadow: '0 0 8px #ff44ff88' }} />
              </>
            )}
          </div>
        );
        
      case 'exchange':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151510' }} />
            {/* Awning frontage */}
            <div className="absolute top-0 left-0 right-0 h-3" style={{ background: '#3a3530', borderBottom: '1px solid #4a4540' }} />
            <div className="absolute bottom-0 left-0 right-0 h-11" style={{ background: '#201a15' }}>
              {/* Line of punters */}
              <div className="absolute bottom-1 left-0 flex gap-0.5">
                <div className="w-1 h-2 rounded-t" style={{ background: '#252520' }} />
                <div className="w-1 h-2.5 rounded-t" style={{ background: '#252520' }} />
                <div className="w-1 h-2 rounded-t" style={{ background: '#252520' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#0f0a08', border: '1px solid #3a3530' }} />
            {isNight && (
              <>
                <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ffcc44', textShadow: '0 0 4px #ffaa44' }}>
                  {scrambleText('THE EXCHANGE')}
                </div>
                {/* Club spill light */}
                <div className="absolute bottom-0 left-0 right-0 h-5 opacity-15" style={{ background: 'linear-gradient(0deg, #ffaa4433 0%, transparent 100%)' }} />
              </>
            )}
          </div>
        );
        
      case 'qbar':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#0a0a10' }} />
            {/* Black awning */}
            <div className="absolute top-0 left-0 right-0 h-3" style={{ background: '#151520' }} />
            <div className="absolute bottom-0 left-0 right-0 h-11" style={{ background: '#0f0f15' }}>
              {/* Strobe leaks */}
              {isNight && <div className="absolute top-2 left-2 w-1 h-1 rounded-full animate-pulse" style={{ background: '#ffffff', animationDuration: '0.1s' }} />}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-8" style={{ background: '#050508', border: '1px solid #2a2a35' }} />
            {isNight && neonIntensity > 0.5 && (
              <>
                <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[5px] font-bold animate-pulse ${signageClass}`} style={{ color: '#44ffff', textShadow: '0 0 6px #44ffff' }}>
                  {scrambleText('Q')}
                </div>
                {/* Smoke silhouettes */}
                <div className="absolute bottom-2 right-1 w-1 h-3 opacity-20 animate-pulse" style={{ background: 'linear-gradient(0deg, #888888 0%, transparent 100%)' }} />
              </>
            )}
          </div>
        );

      // === CBD VENUES ===
      case 'frankies':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1010' }} />
            {/* Band poster wall */}
            <div className="absolute top-1 left-0.5 right-0.5 h-6" style={{ background: '#0f0808' }}>
              <div className="absolute top-0.5 left-0.5 w-2 h-2.5" style={{ background: '#3a2a2a' }} />
              <div className="absolute top-0.5 right-0.5 w-2 h-2.5" style={{ background: '#2a3a2a' }} />
              <div className="absolute bottom-0.5 left-1 w-3 h-2" style={{ background: '#2a2a3a' }} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#150a0a' }}>
              {/* Amber interior glow */}
              <div className="absolute inset-1" style={{ background: '#ff884411' }} />
              {/* Pizza boxes */}
              <div className="absolute bottom-1 left-1 w-3 h-0.5" style={{ background: '#6a5a4a' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7" style={{ background: '#0a0505', border: '1px solid #3a2020' }} />
            {isNight && (
              <>
                <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ff4444', textShadow: '0 0 4px #ff4444' }}>
                  {scrambleText("FRANKIE'S")}
                </div>
                {/* Crowd smoking outside */}
                <div className="absolute bottom-1 right-0 w-2 h-2 rounded-t opacity-60" style={{ background: '#1a1515' }} />
                <div className="absolute bottom-2 right-0.5 w-1 h-2 opacity-15 animate-pulse" style={{ background: 'linear-gradient(0deg, #888888 0%, transparent 100%)' }} />
              </>
            )}
          </div>
        );
        
      case 'jacksons':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#15151a' }} />
            {/* Angular pub silhouette with balcony */}
            <div className="absolute top-0 left-0 right-0 h-5" style={{ background: '#0a0a10' }}>
              {/* Balcony crowd */}
              <div className="absolute bottom-0 left-1 right-1 h-2 flex gap-0.5">
                <div className="w-1 h-1.5 rounded-t" style={{ background: '#252530' }} />
                <div className="w-1 h-1 rounded-t" style={{ background: '#252530' }} />
                <div className="w-1 h-1.5 rounded-t" style={{ background: '#252530' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#101015' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#0a0a0f', border: '1px solid #2a2a35' }} />
            {isNight && (
              <>
                <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#88aaff', textShadow: '0 0 4px #6688ff' }}>
                  {scrambleText('JACKSONS')}
                </div>
                {/* Beer signage glow */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-6 h-0.5 animate-pulse" style={{ background: '#ffcc44', boxShadow: '0 0 4px #ffaa4466' }} />
              </>
            )}
          </div>
        );
        
      case 'criterion':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#101510' }} />
            {/* Corner pub feel */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#151a15' }}>
              {/* Chalkboard menu */}
              <div className="absolute top-1 left-1 w-4 h-4" style={{ background: '#0a0f0a', border: '1px solid #2a3a2a' }}>
                <div className="text-[2px] mt-0.5 ml-0.5" style={{ color: '#8a8a7a' }}>SPECIAL</div>
              </div>
              {/* Smokers pen */}
              <div className="absolute bottom-0 right-0 w-3 h-3" style={{ background: '#1a1f1a', borderLeft: '1px solid #2a3a2a' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-8" style={{ background: '#0a0f0a', border: '1px solid #2a3a2a' }} />
            {isNight && (
              <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#44aa44', textShadow: '0 0 3px #44aa44' }}>
                {scrambleText('CRITERION')}
              </div>
            )}
          </div>
        );
        
      case 'civic':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151515' }} />
            {/* Art Deco vertical signage */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-10" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              {isNight && (
                <div className="absolute inset-0.5 flex flex-col items-center justify-center">
                  {['C','I','V','I','C'].map((letter, i) => (
                    <span key={i} className={`text-[3px] ${signageClass}`} style={{ color: '#ffaa44', textShadow: '0 0 2px #ffaa44' }}>{scrambleText(letter)}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: '#101010' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-7" style={{ background: '#0a0a0a', border: '1px solid #252525' }}>
              {/* Scattered flyers */}
              <div className="absolute -left-1 bottom-0 w-1.5 h-0.5 rotate-12" style={{ background: '#4a4a3a' }} />
            </div>
          </div>
        );

      // === CHINATOWN VENUES ===
      case 'goldencentury':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#152515' }} />
            {/* Green signage - Golden Century signature */}
            <div className="absolute top-0 left-0 right-0 h-4" style={{ background: '#2a4a2a', borderBottom: '1px solid #3a5a3a' }} />
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#203520' }}>
              {/* Tiled interior glow */}
              <div className="absolute inset-1" style={{ background: '#88aa8822' }} />
              {/* Steam clouds */}
              {isNight && <div className="absolute -top-2 left-2 w-3 h-4 opacity-30 animate-pulse" style={{ background: 'linear-gradient(0deg, #ffffff33 0%, transparent 100%)' }} />}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#152515', border: '1px solid #2a4a2a' }} />
            {isNight && (
              <>
                <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[3px] font-bold ${signageClass}`} style={{ color: '#44ff44', textShadow: '0 0 4px #44ff44' }}>
                  {scrambleText('GOLDEN CENTURY')}
                </div>
                {/* Chefs smoking late */}
                <div className="absolute bottom-1 right-0 w-1.5 h-2 rounded-t opacity-50" style={{ background: '#e8e8e0' }} />
              </>
            )}
          </div>
        );
        
      case 'bbqking':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1510' }} />
            {/* Bright fluorescence */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#252015' }}>
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: '#aaaaaa', opacity: 0.3 }} />
              {/* Roast ducks silhouette */}
              <div className="absolute top-2 left-1 right-1 h-5 flex justify-center gap-1">
                <div className="w-2 h-4 rounded-b" style={{ background: '#6a4a2a' }} />
                <div className="w-2 h-4 rounded-b" style={{ background: '#5a3a1a' }} />
                <div className="w-2 h-4 rounded-b" style={{ background: '#6a4a2a' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-7" style={{ background: '#1a1510', border: '1px solid #3a3525' }} />
            {isNight && (
              <>
                <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ff6644', textShadow: '0 0 4px #ff4422' }}>
                  {scrambleText('BBQ KING')}
                </div>
                {/* 3am crowd */}
                <div className="absolute bottom-1 left-0 w-2 h-2.5 rounded-t" style={{ background: '#202015' }} />
              </>
            )}
          </div>
        );
        
      case 'emperors':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1a15' }} />
            {/* Bakery - bread trays, queue */}
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#252520' }}>
              {/* Bread trays */}
              <div className="absolute top-1 left-0.5 right-0.5 h-4 grid grid-cols-3 gap-0.5">
                <div style={{ background: '#8a7a5a' }} />
                <div style={{ background: '#7a6a4a' }} />
                <div style={{ background: '#8a7a5a' }} />
              </div>
              {/* Tongs */}
              <div className="absolute bottom-1 right-1 w-2 h-0.5 rotate-45" style={{ background: '#6a6a6a' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-7" style={{ background: '#151510', border: '1px solid #2a2a20' }} />
            {/* Queue onto sidewalk */}
            <div className="absolute bottom-1 left-0 w-1 h-2 rounded-t" style={{ background: '#1a1a15' }} />
            {isNight && (
              <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[3px] font-bold ${signageClass}`} style={{ color: '#ffcc44' }}>
                {scrambleText("EMPEROR'S GARDEN")}
              </div>
            )}
          </div>
        );
        
      case 'noodlebar':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1510' }} />
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#201a10' }}>
              {/* Plastic stools */}
              <div className="absolute bottom-0 left-0.5 w-2 h-1.5 rounded-t" style={{ background: '#aa3333' }} />
              <div className="absolute bottom-0 left-3 w-2 h-1.5 rounded-t" style={{ background: '#3333aa' }} />
              {/* Steam clouds */}
              {isNight && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 opacity-25 animate-pulse" style={{ background: 'linear-gradient(0deg, #ffffff44 0%, transparent 100%)' }} />}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-8" style={{ background: '#151008', border: '1px solid #2a2515' }} />
            {isNight && (
              <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ffaa44' }}>
                {scrambleText('NOODLE')}
              </div>
            )}
            {/* Handwritten menu */}
            <div className="absolute top-1 right-0.5 w-3 h-4" style={{ background: '#e8e0d0', border: '1px solid #a89870' }} />
          </div>
        );
        
      case 'capitol':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1015' }} />
            {/* Theatre poster walls */}
            <div className="absolute top-0 left-0 right-0 h-8" style={{ background: '#150a10' }}>
              <div className="absolute top-0.5 left-0.5 w-3 h-4" style={{ background: '#3a2a3a', border: '1px solid #4a3a4a' }} />
              <div className="absolute top-0.5 right-0.5 w-3 h-4" style={{ background: '#2a3a3a', border: '1px solid #3a4a4a' }} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: '#100510' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-7" style={{ background: '#0a0308', border: '2px solid #3a2a3a' }}>
              {/* Grand entrance */}
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: '#4a3a4a' }} />
            </div>
            {isNight && (
              <>
                <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ffcc44', textShadow: '0 0 4px #ffaa44' }}>
                  {scrambleText('CAPITOL')}
                </div>
                {/* Pre/post-show taxis */}
                <div className="absolute bottom-1 right-0 w-4 h-2 rounded-t" style={{ background: '#4a4a2a' }} />
              </>
            )}
          </div>
        );

      // === REDFERN VENUES ===
      case 'hopetoun':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#101510' }} />
            {/* Band poster wall - Hoppo vibe */}
            <div className="absolute top-0 left-0 right-0 h-6" style={{ background: '#0a100a' }}>
              <div className="absolute inset-0.5 grid grid-cols-3 gap-0.5">
                <div style={{ background: '#2a2a3a' }} />
                <div style={{ background: '#3a2a2a' }} />
                <div style={{ background: '#2a3a2a' }} />
              </div>
            </div>
            {/* Green tiles */}
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#152515', border: '1px solid #2a4a2a' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7" style={{ background: '#0a150a', border: '1px solid #2a3a2a' }} />
            {isNight && (
              <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#44aa44' }}>
                {scrambleText('HOPETOUN')}
              </div>
            )}
            {/* Bikes chained to poles */}
            <div className="absolute bottom-1 left-0 w-3 h-2" style={{ background: '#2a2a2a' }} />
          </div>
        );
        
      case 'dolphin':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151515' }} />
            {/* Open windows, smokers stairwell */}
            <div className="absolute top-1 left-0.5 right-0.5 h-6" style={{ background: '#101010' }}>
              <div className="absolute top-0.5 left-0.5 w-2 h-2" style={{ background: '#1a1a1a', border: '1px solid #252525' }} />
              <div className="absolute top-0.5 right-0.5 w-2 h-2" style={{ background: '#1a1a1a', border: '1px solid #252525' }} />
              {/* Stairwell */}
              <div className="absolute bottom-0 right-0 w-2 h-3" style={{ background: '#0a0a0a' }}>
                <div className="w-1 h-1.5 rounded-t ml-0.5" style={{ background: '#1a1a1a' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: '#121212' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7" style={{ background: '#0a0a0a', border: '1px solid #252525' }} />
            {isNight && (
              <>
                <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#6688aa' }}>
                  {scrambleText('THE DOLPHIN')}
                </div>
                {/* Chalk signage */}
                <div className="absolute top-8 left-0.5 w-3 h-2" style={{ background: '#1a1a1a', border: '1px solid #252525' }} />
              </>
            )}
          </div>
        );

      // === CABRAMATTA VENUES ===
      case 'nightmarket':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1510' }} />
            {/* Tarp roofs */}
            <div className="absolute top-0 left-0 right-0 h-4" style={{ background: '#4a3a2a', borderBottom: '1px solid #5a4a3a' }} />
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#201a10' }}>
              {/* Lanterns */}
              <div className="absolute top-0 left-1 w-1.5 h-2 rounded" style={{ background: '#ff4422', boxShadow: isNight ? '0 0 4px #ff442266' : 'none' }} />
              <div className="absolute top-0 right-1 w-1.5 h-2 rounded" style={{ background: '#ffaa22', boxShadow: isNight ? '0 0 4px #ffaa2266' : 'none' }} />
              {/* Smoky grills */}
              {isNight && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-4 opacity-30 animate-pulse" style={{ background: 'linear-gradient(0deg, #ffffff44 0%, transparent 100%)' }} />}
              {/* Long tables with plastic stools */}
              <div className="absolute bottom-1 left-0 right-0 h-2 flex gap-0.5">
                <div className="flex-1 h-full" style={{ background: '#4a4a3a' }} />
              </div>
            </div>
            {isNight && (
              <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ffcc44' }}>
                {scrambleText('NIGHT MARKET')}
              </div>
            )}
          </div>
        );
        
      case 'bakery':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1a15' }} />
            {/* Asian bakery - pastry trays, tongs */}
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#252520' }}>
              {/* Display case */}
              <div className="absolute top-1 left-0.5 right-0.5 h-5" style={{ background: '#ffcc6622', border: '1px solid #3a3a30' }}>
                <div className="absolute inset-0.5 grid grid-cols-2 gap-0.5">
                  <div style={{ background: '#8a7a5a' }} />
                  <div style={{ background: '#aa8a6a' }} />
                </div>
              </div>
              {/* Tongs clatter */}
              <div className="absolute bottom-1 right-1 w-2 h-0.5 rotate-12" style={{ background: '#8a8a8a' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-6" style={{ background: '#1a1a15', border: '1px solid #2a2a20' }} />
            {isNight && (
              <>
                <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ffaa44' }}>
                  {scrambleText('BÁNH MÌ')}
                </div>
                {/* Neon Open sign */}
                <div className="absolute top-0 right-0 px-0.5 text-[3px] animate-pulse" style={{ color: '#ff4444', textShadow: '0 0 3px #ff4444' }}>OPEN</div>
              </>
            )}
            {/* Mums + kids silhouette */}
            <div className="absolute bottom-1 left-0 flex gap-0.5">
              <div className="w-1.5 h-2.5 rounded-t" style={{ background: '#1a1a15' }} />
              <div className="w-1 h-1.5 rounded-t" style={{ background: '#1a1a15' }} />
            </div>
          </div>
        );

      // === NEW AUTHENTIC KINGS CROSS 1991 VENUES ===
      case 'lesboys':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#15051a' }} />
            {/* Les Boys - legendary drag bar */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#1a0a20' }}>
              <div className="absolute top-1 left-1 right-1 h-5" style={{ background: '#0a0510' }}>
                {/* Mirror ball */}
                {isNight && <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full neon-flicker-fast" style={{ background: 'radial-gradient(circle, #ffffff 20%, #888888 50%, #444444 100%)' }} />}
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#0a0310', border: '2px solid #4a2a5a' }} />
            {/* Drag queen silhouette */}
            <div className="absolute bottom-1 left-0.5 w-2 h-3 rounded-t" style={{ background: '#2a1a30' }}>
              <div className="absolute -top-1 left-0 right-0 h-2 rounded-full" style={{ background: '#4a3a50' }} />
            </div>
            {isNight && neonIntensity > 0.5 && (
              <>
                <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[4px] font-bold neon-flicker-slow ${signageClass}`} style={{ color: '#ff44ff', textShadow: '0 0 8px #ff44ff' }}>
                  {scrambleText('LES BOYS')}
                </div>
                <div className="absolute top-0 left-0 right-0 h-1 neon-buzz" style={{ background: 'linear-gradient(90deg, #ff44ff, #44ffff, #ff44ff)', boxShadow: '0 0 10px #ff44ff' }} />
              </>
            )}
          </div>
        );

      case 'porkys':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a0810' }} />
            {/* Porky's - infamous Cross nightclub */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#150510' }}>
              <div className="absolute top-1 left-1 right-1 h-4" style={{ background: '#0a0308' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-9" style={{ background: '#0a0306', border: '2px solid #4a1a2a' }}>
              {/* Velvet rope */}
              <div className="absolute -left-1 top-2 bottom-2 w-0.5" style={{ background: '#aa2244' }} />
            </div>
            {/* Bouncer */}
            <div className="absolute bottom-1 right-0.5 w-3 h-4 rounded-t" style={{ background: '#0a0508' }}>
              <div className="w-2 h-2 rounded-full mx-auto mt-0.5" style={{ background: '#151010' }} />
            </div>
            {isNight && (
              <>
                <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 text-[5px] font-bold neon-flicker-slow ${signageClass}`} style={{ color: '#ff6688', textShadow: '0 0 6px #ff6688' }}>
                  {scrambleText("PORKY'S")}
                </div>
                <div className="absolute top-0 left-0 right-0 h-0.5 neon-buzz" style={{ background: '#ff6688', boxShadow: '0 0 8px #ff6688' }} />
              </>
            )}
          </div>
        );

      case 'texasontap':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1508' }} />
            {/* Texas on Tap - American bar in the Cross */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#201810' }}>
              <div className="absolute inset-1" style={{ background: '#ffaa4411' }} />
              {/* Country music vibe */}
              <div className="absolute top-2 left-1 w-3 h-3" style={{ background: '#3a2a1a', borderRadius: '0 50% 50% 0' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#0f0a05', border: '1px solid #4a3a25' }} />
            {isNight && (
              <>
                <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[3px] font-bold ${signageClass}`} style={{ color: '#ffaa44', textShadow: '0 0 4px #ffaa44' }}>
                  {scrambleText('TEXAS ON TAP')}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-4 opacity-20" style={{ background: 'linear-gradient(0deg, #ffaa4444 0%, transparent 100%)' }} />
              </>
            )}
          </div>
        );

      case 'tunnel':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#050510' }} />
            {/* The Tunnel - underground club */}
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#080810' }}>
              {/* Tunnel entrance */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-6 rounded-t-full" style={{ background: '#030308', border: '2px solid #2a2a3a' }} />
            </div>
            {/* Steps going down */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-4">
              <div className="absolute bottom-0 w-full h-1" style={{ background: '#1a1a2a' }} />
              <div className="absolute bottom-1 w-full h-1" style={{ background: '#151520' }} />
              <div className="absolute bottom-2 w-full h-1" style={{ background: '#101018' }} />
            </div>
            {isNight && (
              <>
                <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 text-[5px] font-bold neon-flicker-fast ${signageClass}`} style={{ color: '#44aaff', textShadow: '0 0 6px #44aaff' }}>
                  {scrambleText('TUNNEL')}
                </div>
                {/* Laser leak from entrance */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-3 opacity-30" style={{ background: 'linear-gradient(0deg, #44aaff33 0%, transparent 100%)' }} />
              </>
            )}
          </div>
        );

      case 'kinselas':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151520' }} />
            {/* Kinselas - converted funeral parlour */}
            <div className="absolute top-0 left-0 right-0 h-6" style={{ background: '#1a1a25' }}>
              {/* Art deco facade */}
              <div className="absolute inset-0.5 border" style={{ borderColor: '#3a3a4a' }} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#101018' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8" style={{ background: '#0a0a10', border: '2px solid #2a2a35' }}>
              {/* Grand entrance */}
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: '#3a3a4a' }} />
            </div>
            {isNight && (
              <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#aaaaff', textShadow: '0 0 4px #8888ff' }}>
                {scrambleText('KINSELAS')}
              </div>
            )}
          </div>
        );

      case 'alamode':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1015' }} />
            {/* A La Mode - late night cafe */}
            <div className="absolute bottom-0 left-0 right-0 h-11" style={{ background: '#201520' }}>
              <div className="absolute inset-1" style={{ background: '#ffcc4411' }} />
              {/* Coffee cup silhouettes */}
              <div className="absolute top-2 left-1 w-2 h-2 rounded-t" style={{ background: '#3a2a30' }} />
              <div className="absolute top-2 right-1 w-2 h-2 rounded-t" style={{ background: '#3a2a30' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-7" style={{ background: '#100810', border: '1px solid #3a2a35' }} />
            {isNight && (
              <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ffcc88' }}>
                {scrambleText('A LA MODE')}
              </div>
            )}
          </div>
        );

      case 'injectionroom':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#0a0a08' }} />
            {/* Dark alley / injection spot - grim Cross reality */}
            <div className="absolute left-0 top-0 bottom-0 w-2" style={{ background: '#151510' }} />
            <div className="absolute right-0 top-0 bottom-0 w-2" style={{ background: '#151510' }} />
            {/* Mattress on ground */}
            <div className="absolute bottom-0 left-2 w-5 h-2" style={{ background: '#2a2520' }} />
            {/* Figure hunched over */}
            <div className="absolute bottom-2 left-3 w-2 h-2 rounded-t" style={{ background: '#1a1515' }} />
            {/* Syringe on ground */}
            <div className="absolute bottom-0.5 right-3 w-1.5 h-0.5 rotate-45" style={{ background: '#666666' }} />
            {/* Graffiti */}
            <div className="absolute top-4 left-2.5 text-[3px]" style={{ color: '#4a3a3a', opacity: 0.5 }}>RIP</div>
          </div>
        );

      // === NEW AUTHENTIC OXFORD ST 1991 VENUES ===
      case 'albury':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#15101a' }} />
            {/* The Albury Hotel - iconic gay pub */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#1a1520' }}>
              <div className="absolute top-1 left-1 right-1 h-5" style={{ background: '#100815' }}>
                {/* Crowd silhouettes */}
                <div className="absolute bottom-0 left-1 w-1 h-2 rounded-t" style={{ background: '#252530' }} />
                <div className="absolute bottom-0 left-3 w-1 h-2.5 rounded-t" style={{ background: '#252530' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#0a0510', border: '1px solid #3a2a40' }} />
            {isNight && (
              <>
                <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ff88ff', textShadow: '0 0 4px #ff66ff' }}>
                  {scrambleText('THE ALBURY')}
                </div>
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: '#ff88ff', boxShadow: '0 0 6px #ff66ff' }} />
              </>
            )}
          </div>
        );

      case 'midnight':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#0a0815' }} />
            {/* Midnight Shift - legendary dance club */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#0f0a18' }}>
              {/* Strobe light effect */}
              {isNight && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full neon-flicker-fast" style={{ background: '#ffffff', animationDuration: '0.15s' }} />}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-9" style={{ background: '#050510', border: '2px solid #2a1a3a' }} />
            {/* Queue */}
            <div className="absolute bottom-1 left-0 flex gap-0.5">
              <div className="w-1 h-2 rounded-t" style={{ background: '#1a1525' }} />
              <div className="w-1 h-2.5 rounded-t" style={{ background: '#1a1525' }} />
            </div>
            {isNight && neonIntensity > 0.4 && (
              <>
                <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 text-[3px] font-bold neon-buzz ${signageClass}`} style={{ color: '#44ffff', textShadow: '0 0 6px #44ffff' }}>
                  {scrambleText('MIDNIGHT SHIFT')}
                </div>
                <div className="absolute top-0 left-0 right-0 h-1 animate-pulse" style={{ background: 'linear-gradient(90deg, #ff44ff, #44ffff, #ffff44)', boxShadow: '0 0 10px #44ffff' }} />
              </>
            )}
          </div>
        );

      case 'gilligan':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#101515' }} />
            {/* Gilligan's - Oxford St bar */}
            <div className="absolute bottom-0 left-0 right-0 h-11" style={{ background: '#151a1a' }}>
              <div className="absolute inset-1" style={{ background: '#44aa4411' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7" style={{ background: '#0a1010', border: '1px solid #2a3a3a' }} />
            {isNight && (
              <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#44aa88' }}>
                {scrambleText("GILLIGAN'S")}
              </div>
            )}
          </div>
        );

      case 'beresford':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151510' }} />
            {/* Beresford Hotel */}
            <div className="absolute top-0 left-0 right-0 h-5" style={{ background: '#1a1a15' }}>
              {/* Rooftop bar silhouettes */}
              <div className="absolute bottom-0 left-1 right-1 h-2 flex gap-0.5">
                <div className="w-1 h-1.5 rounded-t" style={{ background: '#252520' }} />
                <div className="w-1 h-1 rounded-t" style={{ background: '#252520' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#101510' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#0a0f0a', border: '1px solid #2a3a2a' }} />
            {isNight && (
              <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#88aa44' }}>
                {scrambleText('BERESFORD')}
              </div>
            )}
          </div>
        );

      case 'dco':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#0a0a15' }} />
            {/* DCO - Dance Club Oxford */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#0f0f1a' }}>
              {/* Disco lights */}
              {isNight && (
                <>
                  <div className="absolute top-2 left-2 w-1 h-1 rounded-full neon-flicker-fast" style={{ background: '#ff44ff' }} />
                  <div className="absolute top-3 right-2 w-1 h-1 rounded-full neon-flicker-fast" style={{ background: '#44ffff', animationDelay: '0.2s' }} />
                </>
              )}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#050510', border: '2px solid #3a2a4a' }} />
            {isNight && neonIntensity > 0.5 && (
              <>
                <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[6px] font-bold neon-buzz ${signageClass}`} style={{ color: '#ff44ff', textShadow: '0 0 8px #ff44ff' }}>
                  {scrambleText('DCO')}
                </div>
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #ff44ff, #44ffff, #ff44ff)', boxShadow: '0 0 8px #ff44ff' }} />
              </>
            )}
          </div>
        );

      case 'flinders':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#15100a' }} />
            {/* Flinders Hotel */}
            <div className="absolute bottom-0 left-0 right-0 h-11" style={{ background: '#1a1510' }}>
              <div className="absolute inset-1" style={{ background: '#ffaa4411' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#0f0a08', border: '1px solid #3a2a20' }} />
            {isNight && (
              <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ffaa66' }}>
                {scrambleText('FLINDERS')}
              </div>
            )}
          </div>
        );

      case 'taxi':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#101015' }} />
            {/* Taxi Club - late night institution */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#15151a' }}>
              <div className="absolute inset-1" style={{ background: '#ffcc4411' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-9" style={{ background: '#0a0a10', border: '1px solid #2a2a35' }} />
            {/* Taxis out front */}
            <div className="absolute bottom-1 right-0 w-4 h-2 rounded-t" style={{ background: '#4a4a25' }} />
            {isNight && (
              <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ffcc44', textShadow: '0 0 4px #ffaa44' }}>
                {scrambleText('TAXI CLUB')}
              </div>
            )}
          </div>
        );

      // === NEW AUTHENTIC CBD 1991 VENUES ===
      case 'marblebarr':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#15100a' }} />
            {/* Marble Bar - heritage basement bar */}
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#1a1510' }}>
              {/* Ornate facade */}
              <div className="absolute top-0 left-0 right-0 h-2" style={{ background: '#2a2015', borderBottom: '1px solid #3a3025' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-7" style={{ background: '#0f0a08', border: '2px solid #4a3a2a' }}>
              {/* Steps down */}
              <div className="absolute bottom-0 w-full h-2" style={{ background: '#1a1510' }} />
            </div>
            {isNight && (
              <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ccaa66' }}>
                {scrambleText('MARBLE BAR')}
              </div>
            )}
          </div>
        );

      case 'regent':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1515' }} />
            {/* Regent Theatre - grand cinema */}
            <div className="absolute top-0 left-0 right-0 h-6" style={{ background: '#201a1a' }}>
              {/* Poster displays */}
              <div className="absolute top-0.5 left-0.5 w-3 h-4" style={{ background: '#3a2a30', border: '1px solid #4a3a40' }} />
              <div className="absolute top-0.5 right-0.5 w-3 h-4" style={{ background: '#2a3030', border: '1px solid #3a4040' }} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: '#151010' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-7" style={{ background: '#0a0808', border: '2px solid #3a2a2a' }}>
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: '#4a3a3a' }} />
            </div>
            {isNight && (
              <>
                <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[5px] font-bold ${signageClass}`} style={{ color: '#ffaa44', textShadow: '0 0 4px #ff8822' }}>
                  {scrambleText('REGENT')}
                </div>
                {/* Marquee lights */}
                <div className="absolute bottom-10 left-1 w-1 h-1 rounded-full animate-pulse" style={{ background: '#ffcc44' }} />
                <div className="absolute bottom-10 right-1 w-1 h-1 rounded-full animate-pulse" style={{ background: '#ffcc44', animationDelay: '0.3s' }} />
              </>
            )}
          </div>
        );

      case 'state':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151015' }} />
            {/* State Theatre - grand heritage venue */}
            <div className="absolute top-0 left-0 right-0 h-8" style={{ background: '#1a1520' }}>
              {/* Gothic arches */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-4 rounded-t-full" style={{ background: '#251a25', border: '1px solid #352a35' }} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: '#100a10' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-7" style={{ background: '#0a0508', border: '2px solid #3a2a35' }} />
            {isNight && (
              <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ffcc88', textShadow: '0 0 4px #ffaa66' }}>
                {scrambleText('STATE THEATRE')}
              </div>
            )}
          </div>
        );

      case 'forcesfood':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151515' }} />
            {/* Forces Canteen - cheap food for homeless */}
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#1a1a1a' }}>
              <div className="absolute inset-1" style={{ background: '#aaaaaa11' }} />
              {/* Counter */}
              <div className="absolute top-2 left-0.5 right-0.5 h-1" style={{ background: '#3a3a3a' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-7" style={{ background: '#101010', border: '1px solid #2a2a2a' }} />
            {/* Queue of homeless */}
            <div className="absolute bottom-1 left-0 flex gap-0.5">
              <div className="w-1.5 h-2 rounded-t" style={{ background: '#1a1a1a' }} />
              <div className="w-1.5 h-2.5 rounded-t" style={{ background: '#1a1a1a' }} />
            </div>
            <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[3px] font-bold ${signageClass}`} style={{ color: '#888888' }}>
              {scrambleText('FORCES CANTEEN')}
            </div>
          </div>
        );

      case 'qvb':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1510' }} />
            {/* QVB - Queen Victoria Building */}
            <div className="absolute top-0 left-0 right-0 h-6" style={{ background: '#201a15' }}>
              {/* Romanesque arches */}
              <div className="absolute top-0 left-1 w-2 h-3 rounded-t-full" style={{ background: '#2a2520', border: '1px solid #3a3530' }} />
              <div className="absolute top-0 right-1 w-2 h-3 rounded-t-full" style={{ background: '#2a2520', border: '1px solid #3a3530' }} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: '#151010' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-6" style={{ background: '#0f0a08', border: '1px solid #3a3025' }} />
            {isNight && (
              <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-[5px] font-bold ${signageClass}`} style={{ color: '#ccaa66' }}>
                {scrambleText('QVB')}
              </div>
            )}
          </div>
        );

      case 'wynyard':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151515' }} />
            {/* Wynyard Station */}
            <div className="absolute top-0 left-0 right-0 h-5" style={{ background: '#1a1a1a' }} />
            <div className="absolute top-5 left-0 right-0 h-1" style={{ background: '#2a2a2a' }} />
            <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: '#101010' }}>
              {/* Tunnel entrance */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-5 rounded-t" style={{ background: '#0a0a0a', border: '1px solid #252525' }} />
            </div>
            <div className={`absolute bottom-7 left-1/2 -translate-x-1/2 text-[5px] font-bold ${signageClass}`} style={{ color: '#888888' }}>
              {scrambleText('WYNYARD')}
            </div>
          </div>
        );

      case 'davidjones':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151510' }} />
            {/* David Jones department store */}
            <div className="absolute top-0 left-0 right-0 h-4" style={{ background: '#1a1a15' }}>
              {/* Display windows */}
              <div className="absolute inset-0.5 flex gap-0.5">
                <div className="flex-1" style={{ background: '#ffcc4422' }} />
                <div className="flex-1" style={{ background: '#ffcc4422' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#101510' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8" style={{ background: '#0a0f0a', border: '1px solid #2a3a2a' }} />
            <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[5px] font-bold ${signageClass}`} style={{ color: '#1a1a1a', background: '#e8e8e0', padding: '0 2px' }}>
              {scrambleText('DJ')}
            </div>
          </div>
        );

      // === NEW AUTHENTIC CHINATOWN 1991 VENUES ===
      case 'eastocean':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1515' }} />
            {/* East Ocean - yum cha institution */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#201a1a' }}>
              <div className="absolute inset-1" style={{ background: '#ff888811' }} />
              {/* Red lanterns */}
              <div className="absolute top-0 left-1 w-1.5 h-2 rounded" style={{ background: '#cc2222', boxShadow: isNight ? '0 0 3px #cc222266' : 'none' }} />
              <div className="absolute top-0 right-1 w-1.5 h-2 rounded" style={{ background: '#cc2222', boxShadow: isNight ? '0 0 3px #cc222266' : 'none' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#150a0a', border: '1px solid #3a2020' }} />
            {isNight && (
              <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ff6644' }}>
                {scrambleText('EAST OCEAN')}
              </div>
            )}
          </div>
        );

      case 'marigold':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1510' }} />
            {/* Marigold - yum cha palace */}
            <div className="absolute top-0 left-0 right-0 h-4" style={{ background: '#2a1515', borderBottom: '1px solid #3a2525' }} />
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#201510' }}>
              <div className="absolute inset-1" style={{ background: '#ffaa4422' }} />
              {/* Trolley silhouettes */}
              <div className="absolute top-2 left-1 w-2 h-3 rounded-t" style={{ background: '#2a2520' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-8" style={{ background: '#150a08', border: '1px solid #3a2a20' }} />
            {isNight && (
              <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ffcc44' }}>
                {scrambleText('MARIGOLD')}
              </div>
            )}
          </div>
        );

      case 'hingfong':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151510' }} />
            {/* Hing Fong - late night restaurant */}
            <div className="absolute bottom-0 left-0 right-0 h-11" style={{ background: '#1a1a15' }}>
              <div className="absolute inset-1" style={{ background: '#ffcc6622' }} />
              {/* Steaming woks */}
              {isNight && <div className="absolute -top-2 left-2 w-3 h-3 opacity-25 animate-pulse" style={{ background: 'linear-gradient(0deg, #ffffff33 0%, transparent 100%)' }} />}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7" style={{ background: '#100f0a', border: '1px solid #2a2a20' }} />
            {isNight && (
              <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ffaa66' }}>
                {scrambleText('HING FONG')}
              </div>
            )}
          </div>
        );

      case 'marketcity':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151515' }} />
            {/* Market City - shopping mall */}
            <div className="absolute top-0 left-0 right-0 h-5" style={{ background: '#1a1a1a' }}>
              <div className="absolute inset-0.5" style={{ background: '#2a2a2a' }} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-9" style={{ background: '#101010' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-7" style={{ background: '#0a0a0a', border: '1px solid #252525' }} />
            <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ff4444' }}>
              {scrambleText('MARKET CITY')}
            </div>
          </div>
        );

      case 'paddy':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1a15' }} />
            {/* Paddy's Markets */}
            <div className="absolute top-0 left-0 right-0 h-4" style={{ background: '#3a2a20', borderBottom: '1px solid #4a3a30' }} />
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#201a15' }}>
              {/* Market stalls */}
              <div className="absolute top-1 left-0.5 right-0.5 h-5 grid grid-cols-3 gap-0.5">
                <div style={{ background: '#3a5a3a' }} />
                <div style={{ background: '#5a4a3a' }} />
                <div style={{ background: '#4a3a5a' }} />
              </div>
            </div>
            <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#88aa66' }}>
              {scrambleText("PADDY'S")}
            </div>
          </div>
        );

      case 'herbshop':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151510' }} />
            {/* Traditional Chinese medicine shop */}
            <div className="absolute bottom-0 left-0 right-0 h-11" style={{ background: '#1a1a15' }}>
              {/* Herb drawers */}
              <div className="absolute top-1 left-0.5 right-0.5 h-6 grid grid-cols-4 grid-rows-3 gap-px" style={{ background: '#2a2a20' }}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} style={{ background: '#3a3a30' }} />
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-6" style={{ background: '#100f0a', border: '1px solid #2a2a20' }} />
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#88aa44' }}>
              {scrambleText('藥材')}
            </div>
          </div>
        );

      // === NEW AUTHENTIC CENTRAL 1991 VENUES ===
      case 'centralstation':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151515' }} />
            {/* Central Station - grand terminus */}
            <div className="absolute top-0 left-0 right-0 h-6" style={{ background: '#1a1a1a' }}>
              {/* Clock tower silhouette */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-5" style={{ background: '#252525' }}>
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: '#3a3a3a' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: '#101010' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6 rounded-t" style={{ background: '#0a0a0a', border: '1px solid #252525' }} />
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#888888' }}>
              {scrambleText('CENTRAL')}
            </div>
          </div>
        );

      case 'eddyave':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#0a0a08' }} />
            {/* Eddy Ave - notorious drug strip */}
            <div className="absolute left-0 top-0 bottom-0 w-2" style={{ background: '#151510' }} />
            <div className="absolute right-0 top-0 bottom-0 w-2" style={{ background: '#151510' }} />
            {/* Huddle of junkies */}
            <div className="absolute bottom-1 left-2 flex gap-0.5">
              <div className="w-1.5 h-2 rounded-t" style={{ background: '#1a1515' }} />
              <div className="w-1.5 h-2.5 rounded-t" style={{ background: '#151a15' }} />
              <div className="w-1.5 h-2 rounded-t" style={{ background: '#15151a' }} />
            </div>
            {/* Syringe */}
            <div className="absolute bottom-0.5 right-3 w-1.5 h-0.5 rotate-30" style={{ background: '#555555' }} />
            {/* Graffiti */}
            <div className="absolute top-3 left-2.5 text-[3px]" style={{ color: '#4a3a3a', opacity: 0.5 }}>EDDY</div>
          </div>
        );

      case 'railwaybuffet':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151510' }} />
            {/* Railway Buffet - old station cafe */}
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#1a1a15' }}>
              <div className="absolute inset-1" style={{ background: '#ffaa4411' }} />
              {/* Counter */}
              <div className="absolute top-2 left-0.5 right-0.5 h-1" style={{ background: '#3a3a30' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-7" style={{ background: '#100f0a', border: '1px solid #2a2a20' }} />
            <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[3px] font-bold ${signageClass}`} style={{ color: '#aa8844' }}>
              {scrambleText('RAILWAY BUFFET')}
            </div>
          </div>
        );

      case 'salvation':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151015' }} />
            {/* Salvation Army - charity services */}
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#1a1520' }}>
              {/* Red shield */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4" style={{ background: '#aa2222', borderRadius: '0 0 50% 50%' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6" style={{ background: '#100810', border: '1px solid #2a1a25' }} />
            {/* Queue of homeless */}
            <div className="absolute bottom-1 left-0 flex gap-0.5">
              <div className="w-1.5 h-2.5 rounded-t" style={{ background: '#1a1a1a' }} />
              <div className="w-1.5 h-2 rounded-t" style={{ background: '#1a1a1a' }} />
            </div>
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#aa4444' }}>
              {scrambleText('SALVO')}
            </div>
          </div>
        );

      case 'derelict':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#0a0a08' }} />
            {/* Derelict building */}
            <div className="absolute top-1 left-1 right-1 h-10" style={{ background: '#101010' }}>
              {/* Broken windows */}
              <div className="absolute top-1 left-1 w-2 h-2" style={{ background: '#050505', border: '1px solid #1a1a1a' }} />
              <div className="absolute top-1 right-1 w-2 h-2" style={{ background: '#080808', border: '1px solid #1a1a1a' }} />
              <div className="absolute top-5 left-1 w-2 h-2" style={{ background: '#080805', border: '1px solid #1a1a1a' }} />
            </div>
            {/* Rubble */}
            <div className="absolute bottom-0 left-1 w-3 h-1.5" style={{ background: '#1a1a15' }} />
            <div className="absolute bottom-0 right-2 w-2 h-1" style={{ background: '#151510' }} />
            {/* Graffiti */}
            <div className="absolute top-8 left-2 text-[3px] rotate-6" style={{ color: '#4a4a3a', opacity: 0.4 }}>91</div>
          </div>
        );

      case 'sexshop':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a0810' }} />
            {/* Adult shop */}
            <div className="absolute bottom-0 left-0 right-0 h-11" style={{ background: '#150510' }}>
              {/* Blacked out windows */}
              <div className="absolute top-1 left-1 right-1 h-5" style={{ background: '#050308' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7" style={{ background: '#0a0306', border: '1px solid #3a1a2a' }} />
            {isNight && (
              <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[5px] font-bold neon-flicker-slow ${signageClass}`} style={{ color: '#ff4466', textShadow: '0 0 4px #ff4466' }}>
                {scrambleText('XXX')}
              </div>
            )}
          </div>
        );

      case 'redrooster':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1010' }} />
            {/* Red Rooster - late night fast food */}
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#201510' }}>
              <div className="absolute inset-1" style={{ background: '#ff442211' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-7" style={{ background: '#150a08', border: '1px solid #3a2020' }} />
            {/* Rooster logo */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full" style={{ background: '#aa2222' }} />
            {isNight && (
              <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ff4422' }}>
                {scrambleText('RED ROOSTER')}
              </div>
            )}
          </div>
        );

      // === NEW AUTHENTIC REDFERN 1991 VENUES ===
      case 'theblock':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#0a0a08' }} />
            {/* The Block - Indigenous housing */}
            <div className="absolute top-1 left-1 right-1 h-10" style={{ background: '#101010' }}>
              {/* Run-down terrace row */}
              <div className="absolute top-0 left-0 w-3 h-8" style={{ background: '#151510', borderRight: '1px solid #1a1a15' }} />
              <div className="absolute top-0 left-3 w-3 h-8" style={{ background: '#121210', borderRight: '1px solid #1a1a15' }} />
              {/* Aboriginal flag colors */}
              <div className="absolute top-1 left-1 w-2 h-1" style={{ background: '#cc0000' }} />
              <div className="absolute top-2 left-1 w-2 h-1" style={{ background: '#000000' }} />
              <div className="absolute top-3 left-1 w-2 h-0.5" style={{ background: '#ffcc00' }} />
            </div>
            {/* People gathered */}
            <div className="absolute bottom-1 left-1 flex gap-0.5">
              <div className="w-1.5 h-2.5 rounded-t" style={{ background: '#151510' }} />
              <div className="w-1.5 h-2 rounded-t" style={{ background: '#151510' }} />
            </div>
            {/* Graffiti */}
            <div className="absolute top-12 right-1 text-[2px]" style={{ color: '#5a4a3a', opacity: 0.5 }}>LAND RIGHTS</div>
          </div>
        );

      case 'eveleigh':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#101010' }} />
            {/* Eveleigh St - main Block street */}
            <div className="absolute top-1 left-0.5 right-0.5 h-8" style={{ background: '#0a0a0a' }}>
              {/* Street lamp */}
              <div className="absolute top-0 left-1 w-0.5 h-6" style={{ background: '#3a3a3a' }} />
              {isNight && <div className="absolute top-0 left-0.5 w-1.5 h-1.5 rounded-full" style={{ background: '#ffaa44', boxShadow: '0 0 4px #ffaa4466' }} />}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-6" style={{ background: '#0f0f0f' }} />
            {/* Dog */}
            <div className="absolute bottom-1 right-2 w-2 h-1.5" style={{ background: '#2a2520' }} />
          </div>
        );

      case 'redfernstation':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#121212' }} />
            {/* Redfern Station */}
            <div className="absolute top-0 left-0 right-0 h-5" style={{ background: '#1a1a1a' }} />
            <div className="absolute top-5 left-0 right-0 h-1" style={{ background: '#252525' }} />
            <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: '#0a0a0a' }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-5" style={{ background: '#080808', border: '1px solid #1a1a1a' }} />
            </div>
            <div className={`absolute bottom-7 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#666666' }}>
              {scrambleText('REDFERN')}
            </div>
          </div>
        );

      case 'indigenous':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#0f0f0a' }} />
            {/* Indigenous community center */}
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#151510' }}>
              {/* Aboriginal art on wall */}
              <div className="absolute top-1 left-1 w-4 h-3" style={{ background: '#2a1a10', border: '1px solid #3a2a20' }}>
                <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full" style={{ background: '#cc8844' }} />
                <div className="absolute top-1 right-0.5 w-1 h-1 rounded-full" style={{ background: '#884422' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-6" style={{ background: '#0a0a08', border: '1px solid #2a2a20' }} />
            {/* Flag */}
            <div className="absolute top-1 right-1 w-3 h-2">
              <div className="w-full h-1" style={{ background: '#000000' }} />
              <div className="w-full h-0.5" style={{ background: '#cc0000' }} />
              <div className="absolute top-0.5 left-1 w-1 h-0.5 rounded-full" style={{ background: '#ffcc00' }} />
            </div>
          </div>
        );

      case 'courthouse':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#15151a' }} />
            {/* Redfern Courthouse */}
            <div className="absolute top-0 left-0 right-0 h-6" style={{ background: '#1a1a20' }}>
              {/* Columns */}
              <div className="absolute top-0 left-1 w-1.5 h-5" style={{ background: '#252530' }} />
              <div className="absolute top-0 right-1 w-1.5 h-5" style={{ background: '#252530' }} />
              {/* Pediment */}
              <div className="absolute top-0 left-0 right-0 h-2" style={{ background: '#202025', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: '#101015' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6" style={{ background: '#0a0a10', border: '1px solid #2a2a35' }} />
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#888888' }}>
              {scrambleText('COURT')}
            </div>
          </div>
        );

      // === NEW AUTHENTIC CABRAMATTA 1991 VENUES ===
      case 'pho2000':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1510' }} />
            {/* Pho 2000 - famous Cabra pho shop */}
            <div className="absolute bottom-0 left-0 right-0 h-11" style={{ background: '#201a10' }}>
              <div className="absolute inset-1" style={{ background: '#ffcc6633' }} />
              {/* Giant pho bowl steam */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-2 rounded-t-full" style={{ background: '#5a4a3a' }}>
                {isNight && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-4 opacity-40 animate-pulse" style={{ background: 'linear-gradient(0deg, #ffffff44 0%, transparent 100%)' }} />}
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-7" style={{ background: '#150a05', border: '1px solid #3a2a15' }} />
            {isNight && (
              <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ffcc44' }}>
                {scrambleText('PHỞ 2000')}
              </div>
            )}
          </div>
        );

      case 'thanbinh':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151510' }} />
            {/* Thanh Binh - Vietnamese restaurant */}
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#1a1a10' }}>
              <div className="absolute inset-1" style={{ background: '#ffaa4422' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7" style={{ background: '#100f08', border: '1px solid #2a2a15' }} />
            {isNight && (
              <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ffaa66' }}>
                {scrambleText('THÀNH BÌNH')}
              </div>
            )}
          </div>
        );

      case 'freedomplaza':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151515' }} />
            {/* Freedom Plaza - Cabramatta shopping center */}
            <div className="absolute top-0 left-0 right-0 h-5" style={{ background: '#1a1a1a' }}>
              <div className="absolute inset-0.5" style={{ background: '#252525' }} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-9" style={{ background: '#101010' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-7" style={{ background: '#0a0a0a', border: '1px solid #252525' }} />
            {/* Elderly Vietnamese */}
            <div className="absolute bottom-1 left-0 flex gap-0.5">
              <div className="w-1.5 h-2 rounded-t" style={{ background: '#1a1a15' }} />
              <div className="w-1.5 h-2.5 rounded-t" style={{ background: '#1a1a15' }} />
            </div>
            <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[3px] font-bold ${signageClass}`} style={{ color: '#ff6644' }}>
              {scrambleText('FREEDOM PLAZA')}
            </div>
          </div>
        );

      case 'cabrashops':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#151510' }} />
            {/* Generic Cabra shop row */}
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#1a1a10' }}>
              {/* Produce boxes */}
              <div className="absolute bottom-0 left-0.5 w-3 h-3" style={{ background: '#3a4a2a' }} />
              <div className="absolute bottom-0 right-0.5 w-3 h-2" style={{ background: '#5a4a3a' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7" style={{ background: '#100f08', border: '1px solid #2a2a15' }} />
            <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#88aa44' }}>
              {scrambleText('TIỆM')}
            </div>
          </div>
        );

      case 'herbalmed':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#101510' }} />
            {/* Vietnamese herbal medicine */}
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#151a15' }}>
              {/* Herb jars */}
              <div className="absolute top-1 left-0.5 right-0.5 h-5 grid grid-cols-3 gap-0.5">
                <div style={{ background: '#3a4a3a' }} />
                <div style={{ background: '#4a5a3a' }} />
                <div style={{ background: '#3a5a4a' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-6" style={{ background: '#0a100a', border: '1px solid #2a3a2a' }} />
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#66aa44' }}>
              {scrambleText('THUỐC')}
            </div>
          </div>
        );

      case 'butcher':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1010' }} />
            {/* Asian butcher */}
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#201515' }}>
              {/* Hanging ducks */}
              <div className="absolute top-1 left-1 w-2 h-4" style={{ background: '#6a4a3a' }} />
              <div className="absolute top-1 right-1 w-2 h-4" style={{ background: '#5a3a2a' }} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-7" style={{ background: '#150808', border: '1px solid #3a2020' }} />
            {isNight && (
              <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#ff6644' }}>
                {scrambleText('THỊT')}
              </div>
            )}
          </div>
        );

      case 'fishmarket':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#101515' }} />
            {/* Fish market */}
            <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: '#151a1a' }}>
              {/* Ice trays with fish */}
              <div className="absolute top-1 left-0.5 right-0.5 h-4" style={{ background: '#3a5a6a' }}>
                <div className="absolute bottom-0.5 left-0.5 w-3 h-1.5 rotate-12" style={{ background: '#6a7a8a' }} />
                <div className="absolute bottom-0.5 right-0.5 w-2.5 h-1 -rotate-6" style={{ background: '#5a6a7a' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6" style={{ background: '#0a1010', border: '1px solid #2a3535' }} />
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-[4px] font-bold ${signageClass}`} style={{ color: '#44aaaa' }}>
              {scrambleText('CÁ')}
            </div>
          </div>
        );

      case 'vc':
        // Australian VC office - sleek corporate building
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
              {scrambleText(sign || 'VENTURES')}
            </div>
            {isNight && (
              <div className="absolute bottom-11 left-0 right-0 h-4 opacity-30" style={{ boxShadow: '0 0 8px #4488cc' }} />
            )}
          </div>
        );

      case 'startuphub':
        // Australian startup hub / accelerator
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
            {/* Hub signage */}
            <div className={`absolute bottom-10 left-0.5 right-0.5 h-3 flex items-center justify-center text-[3px] font-bold ${signageClass}`} style={{ background: '#1a2a1a', color: '#88cc88', border: '1px solid #4a6a4a' }}>
              {scrambleText(sign || 'TECH HUB')}
            </div>
            {isNight && (
              <div className="absolute bottom-10 left-0 right-0 h-3 opacity-40" style={{ boxShadow: '0 0 6px #44cc44' }} />
            )}
          </div>
        );

      case 'shop':
      default:
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }} />
            {/* Awning */}
            <div className="absolute bottom-11 left-0 right-0 h-2" style={{ background: index % 4 === 0 ? '#8a4a4a' : index % 4 === 1 ? '#4a8a4a' : index % 4 === 2 ? '#4a4a8a' : '#8a8a4a' }} />
            <div className="absolute bottom-0 left-0.5 right-0.5 h-11 border-2" style={{ background: '#1a2525', borderColor: '#3a4545' }}>
              <div className="absolute inset-1" style={{ background: pal.windowGlow, opacity: 0.1 }} />
              {/* Mannequin or product */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-4 rounded-t" style={{ background: '#3a3a3a' }} />
            </div>
            {/* Building signage from district */}
            <div className={`absolute bottom-13 left-0.5 right-0.5 h-3 flex items-center justify-center text-[4px] font-bold ${signageClass}`} style={{ background: '#2a2a2a', color: '#9bbc0f' }}>
              {scrambleText(sign || 'SHOP')}
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
