import { HOTSPOTS } from '@/types/game';

interface StreetProps {
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  isRaining: boolean;
  shelterOpen: boolean;
  servicesOpen: boolean;
  playerX: number;
  worldOffset?: number;
}

export function Street({ timeOfDay, isRaining, shelterOpen, servicesOpen, playerX, worldOffset = 0 }: StreetProps) {
  // Enhanced palette with better contrast per time of day
  const getPalette = () => {
    switch (timeOfDay) {
      case 'night': 
        return {
          sky: 'bg-[#0a1a0a]', // Very dark
          building: 'bg-[#1a2a1a]',
          pavement: 'bg-[#0f200f]',
          accent: 'bg-gb-light', // Neon glow
          windowGlow: 'bg-[#9bbc0f]',
        };
      case 'dusk':
        return {
          sky: 'bg-[#1a2a1a]',
          building: 'bg-[#2a3a2a]',
          pavement: 'bg-gb-dark',
          accent: 'bg-[#ffaa44]', // Warm streetlights
          windowGlow: 'bg-[#ff8844]',
        };
      case 'dawn':
        return {
          sky: 'bg-[#3a4a3a]',
          building: 'bg-gb-dark',
          pavement: 'bg-gb-dark',
          accent: 'bg-gb-light',
          windowGlow: 'bg-[#aabb88]',
        };
      default: // day
        return {
          sky: 'bg-gb-light',
          building: 'bg-gb-dark',
          pavement: 'bg-[#4a5a4a]',
          accent: 'bg-gb-lightest',
          windowGlow: 'bg-gb-lightest',
        };
    }
  };

  const palette = getPalette();

  return (
    <div className={`absolute inset-0 ${palette.sky} overflow-hidden`}>
      {/* Stars at night */}
      {timeOfDay === 'night' && (
        <>
          <div className="absolute top-4 left-[20%] w-1.5 h-1.5 bg-gb-lightest rounded-full animate-pulse" />
          <div className="absolute top-8 left-[40%] w-1 h-1 bg-gb-light rounded-full" />
          <div className="absolute top-6 left-[70%] w-1.5 h-1.5 bg-gb-lightest rounded-full animate-pulse" />
          <div className="absolute top-3 left-[85%] w-1 h-1 bg-gb-light rounded-full" />
          <div className="absolute top-12 left-[55%] w-1 h-1 bg-gb-lightest rounded-full" />
        </>
      )}

      {/* Streetlight glow at dusk/night */}
      {(timeOfDay === 'dusk' || timeOfDay === 'night') && (
        <>
          <div className="absolute top-[25%] left-[15%] w-12 h-20 bg-gradient-to-b from-[#ffaa4420] to-transparent rounded-full blur-sm" />
          <div className="absolute top-[25%] left-[50%] w-12 h-20 bg-gradient-to-b from-[#ffaa4420] to-transparent rounded-full blur-sm" />
          <div className="absolute top-[25%] left-[80%] w-12 h-20 bg-gradient-to-b from-[#ffaa4420] to-transparent rounded-full blur-sm" />
        </>
      )}

      {/* Rain overlay */}
      {isRaining && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-4 bg-gb-lightest opacity-30 animate-rain"
              style={{
                left: `${(i * 2.5) + Math.random() * 2}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Background buildings - infinite feel with offset */}
      <div className="absolute top-0 left-0 right-0 h-[40%] flex" style={{ transform: `translateX(${-(worldOffset % 100) * 0.1}px)` }}>
        {/* Building 1 */}
        <div className={`w-[15%] h-full ${palette.building} border-r-2 border-gb-darkest`}>
          <div className={`absolute top-2 left-[2%] w-3 h-4 ${palette.windowGlow} opacity-40`} />
          <div className={`absolute top-8 left-[5%] w-3 h-4 ${palette.windowGlow} opacity-30`} />
        </div>
        
        {/* Building 2 - Services - HIGH CONTRAST DOOR */}
        <div className={`w-[20%] h-[90%] ${palette.building} border-r-2 border-gb-darkest relative`}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-14 bg-gb-darkest border-2 border-gb-light">
            {servicesOpen && (
              <div className="absolute inset-1 bg-[#8bac0f] animate-pulse shadow-lg shadow-[#8bac0f]/50" />
            )}
          </div>
          <span className={`absolute top-2 left-1/2 -translate-x-1/2 text-[7px] ${timeOfDay === 'night' ? 'text-gb-lightest' : 'text-gb-light'} font-bold`}>
            SERVICES
          </span>
          {/* Neon sign at night */}
          {(timeOfDay === 'night' || timeOfDay === 'dusk') && servicesOpen && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#ff6666] animate-pulse rounded" />
          )}
        </div>
        
        {/* Building 3 - Shelter - HIGH CONTRAST DOOR */}
        <div className={`w-[20%] h-[85%] ${palette.building} border-r-2 border-gb-darkest relative`}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-16 bg-gb-darkest border-2 border-gb-light">
            {shelterOpen && (
              <div className="absolute inset-1 bg-[#9bbc0f] animate-pulse shadow-lg shadow-[#9bbc0f]/50" />
            )}
          </div>
          <span className={`absolute top-2 left-1/2 -translate-x-1/2 text-[7px] ${timeOfDay === 'night' ? 'text-gb-lightest' : 'text-gb-light'} font-bold`}>
            SHELTER
          </span>
          {/* Warm light at dusk/night when open */}
          {(timeOfDay === 'night' || timeOfDay === 'dusk') && shelterOpen && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-6 bg-gradient-to-t from-[#ffaa4430] to-transparent" />
          )}
        </div>
        
        {/* Building 4 */}
        <div className={`w-[25%] h-[95%] ${palette.building} border-r-2 border-gb-darkest`}>
          <div className={`absolute top-4 left-[10%] w-4 h-5 ${palette.windowGlow} opacity-25`} />
          <div className={`absolute top-4 right-[10%] w-4 h-5 ${palette.windowGlow} opacity-25`} />
          <div className={`absolute top-12 left-[10%] w-4 h-5 ${palette.windowGlow} opacity-20`} />
        </div>
        
        {/* Building 5 */}
        <div className={`w-[20%] h-full ${palette.building}`}>
          <div className={`absolute top-6 left-[20%] w-3 h-4 ${palette.windowGlow} opacity-30`} />
        </div>
      </div>

      {/* Pavement */}
      <div className={`absolute bottom-0 left-0 right-0 h-[35%] ${palette.pavement}`}>
        {/* Pavement texture - top edge */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gb-darkest" />
        
        {/* Road layer for cars */}
        <div className="absolute top-8 left-0 right-0 h-8 bg-[#1a2a1a]">
          {/* Road markings */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gb-light opacity-30" 
               style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, #8bac0f33 20px, #8bac0f33 40px)' }} />
        </div>
        
        {/* Curb */}
        <div className="absolute top-6 left-0 right-0 h-1.5 bg-gb-darkest" />
      </div>

      {/* Hotspot indicators - HIGH CONTRAST */}
      {HOTSPOTS.map((hotspot) => (
        <div
          key={hotspot.zone}
          className="absolute bottom-[38%]"
          style={{ 
            left: `${hotspot.x + hotspot.width / 2}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {/* BINS - more visible */}
          {hotspot.zone === 'bins' && (
            <div className="flex gap-1">
              <div className="w-4 h-5 bg-[#2a3a2a] rounded-t border-2 border-gb-light" />
              <div className="w-4 h-6 bg-[#3a4a3a] rounded-t border-2 border-gb-light" />
              <div className="w-4 h-5 bg-[#2a3a2a] rounded-t border-2 border-gb-light" />
            </div>
          )}
          {hotspot.zone === 'ask-help' && (
            <div className="w-10 h-4 bg-[#3a4a3a] rounded-t border-2 border-gb-dark" /> /* Bench */
          )}
          {hotspot.zone === 'sleep' && (
            <div className="w-8 h-10 bg-gb-darkest border-t-2 border-l-2 border-r-2 border-gb-dark">
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-6 bg-[#1a1a1a]" />
            </div>
          )}
        </div>
      ))}

      {/* Zone label when player is in a hotspot */}
      {HOTSPOTS.map((hotspot) => {
        const isInZone = playerX >= hotspot.x && playerX <= hotspot.x + hotspot.width;
        if (!isInZone) return null;
        
        return (
          <div
            key={`label-${hotspot.zone}`}
            className="absolute bottom-[55%] left-1/2 -translate-x-1/2 px-3 py-1 bg-gb-darkest text-gb-lightest text-[9px] animate-pulse border border-gb-light rounded"
          >
            ↑ {hotspot.label}
          </div>
        );
      })}
    </div>
  );
}
