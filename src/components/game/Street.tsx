import { HOTSPOTS } from '@/types/game';
import { getDistrictBlend, DISTRICT_CONFIGS, District } from '@/types/districts';

interface StreetProps {
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  isRaining: boolean;
  shelterOpen: boolean;
  servicesOpen: boolean;
  playerX: number;
  worldOffset?: number;
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

export function Street({ timeOfDay, isRaining, shelterOpen, servicesOpen, playerX, worldOffset = 0 }: StreetProps) {
  const { current, next, blend } = getDistrictBlend(worldOffset);
  const currentConfig = DISTRICT_CONFIGS[current];
  const nextConfig = DISTRICT_CONFIGS[next];
  
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
    
    return blockTypes.map((type, i) => {
      const xPos = (i * blockWidth) - (parallaxOffset % (blockWidth * blockTypes.length));
      
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
            <div className="absolute bottom-11 left-1/2 -translate-x-1/2 px-1 text-[5px] font-bold" style={{ background: '#1a1a1a', color: '#9bbc0f', border: '1px solid #8bac0f' }}>
              SERVICES
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
            <div className="absolute bottom-13 left-1/2 -translate-x-1/2 px-1 text-[5px] font-bold" style={{ background: '#1a1a1a', color: '#8bac0f' }}>
              SHELTER
            </div>
          </div>
        );
      
      case 'stripclub':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a0510' }} />
            <div className="absolute top-1 left-1 right-1 h-8" style={{ background: '#0a0308' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-10" style={{ background: '#0f0508', border: '2px solid #3a1a2a' }}>
              {/* Curtain */}
              <div className="absolute inset-1" style={{ background: 'repeating-linear-gradient(90deg, #2a0a1a 0px, #3a1a2a 2px)' }} />
            </div>
            {isNight && neonIntensity > 0.3 && (
              <>
                {/* Female silhouette neon - stylized, non-explicit */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-8 h-6">
                  <div className="w-2 h-2 rounded-full mx-auto" style={{ background: pal.neonPrimary, boxShadow: `0 0 4px ${pal.neonPrimary}` }} />
                  <div className="w-1 h-3 mx-auto" style={{ background: pal.neonPrimary, boxShadow: `0 0 3px ${pal.neonPrimary}` }} />
                </div>
                <div className="absolute bottom-19 left-1/2 -translate-x-1/2 px-1 py-0.5 text-[5px] animate-pulse font-bold" style={{ color: pal.neonPrimary, textShadow: `0 0 6px ${pal.neonPrimary}` }}>
                  GIRLS
                </div>
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: pal.neonPrimary, boxShadow: `0 0 8px ${pal.neonPrimary}` }} />
              </>
            )}
          </div>
        );

      case 'bar':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: '#1a1510' }} />
            <div className="absolute top-2 left-1 right-1 h-6" style={{ background: '#0a0808' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-9" style={{ background: '#0f0a08', border: '2px solid #3a2a2a' }} />
            {isNight && neonIntensity > 0.2 && (
              <>
                <div className="absolute bottom-11 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[6px] animate-pulse font-bold" style={{ color: '#ffaa44', textShadow: '0 0 4px #ffaa44' }}>
                  BAR
                </div>
                {/* Beer glass neon */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-4 rounded-b border" style={{ borderColor: '#ffaa44', boxShadow: '0 0 3px #ffaa4466' }} />
              </>
            )}
          </div>
        );
      
      case 'hostel':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }} />
            {/* Multiple windows - backpacker vibe */}
            <div className="absolute top-1 left-0.5 w-2 h-3" style={{ background: pal.windowGlow, opacity: 0.25 }} />
            <div className="absolute top-1 right-0.5 w-2 h-3" style={{ background: pal.windowGlow, opacity: 0.2 }} />
            <div className="absolute top-5 left-0.5 w-2 h-3" style={{ background: pal.windowGlow, opacity: 0.3 }} />
            <div className="absolute top-5 right-0.5 w-2 h-3" style={{ background: pal.windowGlow, opacity: 0.15 }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: '#2a3a2a', border: '1px solid #4a5a4a' }} />
            <div className="absolute bottom-9 left-1/2 -translate-x-1/2 text-[4px] font-bold px-0.5" style={{ background: '#1a1a1a', color: '#8a8a6a' }}>HOSTEL</div>
            {/* Backpack icon */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2 h-3 rounded" style={{ background: '#4a5a3a' }} />
          </div>
        );
        
      case 'kebab':
        return (
          <div className="relative w-full h-full">
            <div className="absolute inset-0" style={{ background: buildingColor }} />
            {/* Bright shopfront */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#3a2a20' }}>
              <div className="absolute top-1 left-1 right-1 h-5" style={{ background: '#4a3525' }}>
                {/* Food display glow */}
                <div className="absolute inset-0.5" style={{ background: '#ffaa4422' }} />
                {/* Rotisserie */}
                <div className="absolute top-0.5 left-1 w-2 h-4 rounded" style={{ background: '#6a4a2a' }} />
              </div>
            </div>
            <div className="absolute bottom-13 left-1/2 -translate-x-1/2 text-[5px] font-bold px-1" style={{ color: '#ffcc44', textShadow: isNight ? '0 0 3px #ffaa44' : 'none' }}>KEBAB</div>
            {isNight && (
              <>
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-10 h-1" style={{ background: '#ffaa44', boxShadow: '0 0 6px #ffaa44' }} />
                {/* Light spill */}
                <div className="absolute bottom-0 left-0 right-0 h-6 opacity-20" style={{ background: 'linear-gradient(0deg, #ffaa4444 0%, transparent 100%)' }} />
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
            <div className="absolute bottom-11 left-1/2 -translate-x-1/2 text-[4px] font-bold px-0.5" style={{ color: '#ffcc66' }}>{sign || 'FOOD'}</div>
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
            <div className="absolute bottom-11 left-1/2 -translate-x-1/2 text-[4px] font-bold px-0.5" style={{ background: '#1a1a1a', color: '#aaba8a' }}>SOUP</div>
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
            <div className="absolute bottom-13 left-1/2 -translate-x-1/2 text-[5px] font-bold px-1" style={{ color: '#aaaa44', textShadow: isNight ? '0 0 2px #aaaa44' : 'none' }}>CASH</div>
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
            <div className="absolute bottom-13 left-1/2 -translate-x-1/2 text-[4px] font-bold px-0.5" style={{ color: '#aa6644' }}>BOTTLE-O</div>
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
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[6px] font-bold px-1 py-0.5" style={{ background: '#1a1a2a', color: '#4488ff', border: '1px solid #2244aa' }}>TAB</div>
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
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[4px] font-bold px-0.5" style={{ color: '#8a8a6a' }}>NEWS</div>
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
            <div className="absolute bottom-9 left-1/2 -translate-x-1/2 text-[5px] font-bold px-1" style={{ color: '#888888', background: '#1a1a1a' }}>TRAINS</div>
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
            <div className="absolute bottom-13 left-1/2 -translate-x-1/2 text-[4px] font-bold px-0.5" style={{ color: '#66aa66' }}>24HR</div>
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
            {/* Graffiti tag */}
            <div className="absolute bottom-3 left-2 text-[3px]" style={{ color: '#4a4a5a' }}>TAG</div>
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
            {isNight && neonIntensity > 0.5 && (
              <>
                <div className="absolute bottom-11 left-1/2 -translate-x-1/2 text-[5px] animate-pulse font-bold" style={{ color: '#ff44ff', textShadow: '0 0 6px #ff44ff' }}>
                  CLUB
                </div>
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #ff44ff, #44ffff, #ff44ff)', boxShadow: '0 0 8px #ff44ff' }} />
                {/* Disco lights */}
                <div className="absolute top-3 left-2 w-1 h-1 rounded-full animate-pulse" style={{ background: '#ff44ff' }} />
                <div className="absolute top-4 right-2 w-1 h-1 rounded-full animate-pulse" style={{ background: '#44ffff', animationDelay: '0.3s' }} />
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
              <div className="absolute bottom-9 left-1/2 -translate-x-1/2 text-[5px] animate-pulse" style={{ color: '#ff6666', textShadow: '0 0 4px #ff666666' }}>MOTEL</div>
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
            <div className="absolute bottom-13 left-0.5 right-0.5 h-3 flex items-center justify-center text-[4px] font-bold" style={{ background: '#2a2a2a', color: '#9bbc0f' }}>
              {sign || 'SHOP'}
            </div>
          </div>
        );
    }
  };

  // Foreground clutter with district variety
  const renderClutter = () => {
    const items = [];
    const clutterTypes = currentConfig.clutterTypes;
    
    for (let i = 0; i < 18; i++) {
      const type = clutterTypes[i % clutterTypes.length];
      const xPos = (i * 55) - (midParallaxOffset % 900) + 10;
      
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
          <div className="flex gap-0.5">
            <div className="w-3 h-2" style={{ background: '#5a4a3a', border: '1px solid #7a6a5a' }} />
            <div className="w-2.5 h-2.5" style={{ background: '#4a3a2a' }} />
          </div>
        );
      case 'trash':
        return (
          <div className="flex gap-0.5 items-end">
            <div className="w-2 h-1.5 rounded" style={{ background: '#2a2a2a' }} />
            <div className="w-3 h-1" style={{ background: '#3a3a3a' }} />
            <div className="w-1.5 h-2" style={{ background: '#252525' }} />
          </div>
        );
      case 'bottles':
        return (
          <div className="flex gap-1 items-end">
            <div className="w-1 h-2" style={{ background: '#4a6a4a' }} />
            <div className="w-1 h-1.5" style={{ background: '#6a4a3a' }} />
            <div className="w-1 h-2.5" style={{ background: '#3a5a5a' }} />
          </div>
        );
      case 'newsrack':
        return (
          <div className="w-3 h-5" style={{ background: '#4a3a3a', border: '1px solid #6a5a5a' }}>
            <div className="w-2 h-2.5 mt-0.5 mx-auto" style={{ background: '#8a8a6a' }} />
          </div>
        );
      case 'phonebooth':
        return (
          <div className="w-3 h-7 rounded-t" style={{ background: '#3a4a5a', border: '1px solid #5a6a7a' }}>
            <div className="w-1.5 h-1.5 mx-auto mt-1" style={{ background: '#2a3a4a' }} />
          </div>
        );
      case 'busstop':
        return (
          <div className="relative">
            <div className="w-0.5 h-8" style={{ background: '#5a5a5a' }} />
            <div className="absolute top-0 left-0 w-4 h-2.5" style={{ background: '#4a5a4a', border: '1px solid #6a7a6a' }} />
          </div>
        );
      case 'neon':
        return isNight ? (
          <div className="w-4 h-1 animate-pulse" style={{ background: pal.neonPrimary, boxShadow: `0 0 4px ${pal.neonPrimary}` }} />
        ) : null;
      case 'posters':
        return (
          <div className="w-3 h-4" style={{ background: '#4a4a3a', border: '1px solid #5a5a4a' }}>
            <div className="w-2 h-2 mx-auto mt-0.5" style={{ background: '#6a5a4a' }} />
          </div>
        );
      case 'kebabvan':
        return (
          <div className="w-8 h-4" style={{ background: '#3a3530', border: '1px solid #5a5550' }}>
            <div className="absolute top-0 left-1 w-1.5 h-1" style={{ background: '#ffaa4466' }} />
            <div className="text-[3px] mt-1 ml-1" style={{ color: '#aa8866' }}>KEBAB</div>
          </div>
        );
      case 'puddles':
        return isRaining ? (
          <div className="w-6 h-1 rounded-full opacity-40" style={{ background: 'linear-gradient(90deg, transparent, #6a8a9a, transparent)' }} />
        ) : null;
      case 'steam':
        return isNight ? (
          <div className="w-2 h-4 opacity-30 animate-pulse" style={{ background: 'linear-gradient(0deg, #ffffff33 0%, transparent 100%)' }} />
        ) : null;
      case 'lanterns':
        return isNight ? (
          <div className="w-2 h-3 rounded" style={{ background: '#ff4422', boxShadow: '0 0 4px #ff442244' }} />
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
        
        {/* Zone indicators */}
        {HOTSPOTS.map((hotspot) => {
          const isInZone = playerX >= hotspot.x && playerX <= hotspot.x + hotspot.width;
          if (!isInZone) return null;
          
          return (
            <div
              key={`zone-${hotspot.zone}`}
              className="absolute top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[7px] font-bold animate-pulse"
              style={{ background: '#0f1a0f', color: '#9bbc0f', border: '1px solid #8bac0f' }}
            >
              ↑ {hotspot.label}
            </div>
          );
        })}
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
