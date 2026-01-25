import { HOTSPOTS } from '@/types/game';

interface StreetProps {
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  isRaining: boolean;
  shelterOpen: boolean;
  servicesOpen: boolean;
  playerX: number;
}

export function Street({ timeOfDay, isRaining, shelterOpen, servicesOpen, playerX }: StreetProps) {
  const getBackgroundClass = () => {
    switch (timeOfDay) {
      case 'night': return 'bg-gb-darkest';
      case 'dusk': return 'bg-gb-dark';
      case 'dawn': return 'bg-gb-dark';
      default: return 'bg-gb-light';
    }
  };

  const getBuildingClass = () => {
    switch (timeOfDay) {
      case 'night': return 'bg-gb-dark';
      case 'dusk': return 'bg-gb-darkest';
      case 'dawn': return 'bg-gb-darkest';
      default: return 'bg-gb-dark';
    }
  };

  return (
    <div className={`absolute inset-0 ${getBackgroundClass()} overflow-hidden`}>
      {/* Sky elements */}
      {timeOfDay === 'night' && (
        <>
          <div className="absolute top-4 left-[20%] w-1 h-1 bg-gb-light rounded-full" />
          <div className="absolute top-8 left-[40%] w-1 h-1 bg-gb-light rounded-full" />
          <div className="absolute top-6 left-[70%] w-1 h-1 bg-gb-light rounded-full" />
          <div className="absolute top-3 left-[85%] w-1 h-1 bg-gb-light rounded-full" />
        </>
      )}

      {/* Rain overlay */}
      {isRaining && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-3 bg-gb-light opacity-40 animate-rain"
              style={{
                left: `${(i * 3.5) + Math.random() * 2}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Background buildings */}
      <div className="absolute top-0 left-0 right-0 h-[40%] flex">
        {/* Building 1 */}
        <div className={`w-[15%] h-full ${getBuildingClass()} border-r-2 border-gb-darkest`}>
          <div className="absolute top-2 left-[2%] w-3 h-4 bg-gb-light opacity-30" />
          <div className="absolute top-8 left-[5%] w-3 h-4 bg-gb-light opacity-30" />
        </div>
        
        {/* Building 2 - Services */}
        <div className={`w-[20%] h-[90%] ${getBuildingClass()} border-r-2 border-gb-darkest relative`}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-12 bg-gb-darkest">
            {servicesOpen && (
              <div className="absolute inset-1 bg-gb-light animate-pulse" />
            )}
          </div>
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[6px] text-gb-light">
            SERVICES
          </span>
        </div>
        
        {/* Building 3 - Shelter */}
        <div className={`w-[20%] h-[85%] ${getBuildingClass()} border-r-2 border-gb-darkest relative`}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-14 bg-gb-darkest">
            {shelterOpen && (
              <div className="absolute inset-1 bg-gb-lightest animate-pulse" />
            )}
          </div>
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[6px] text-gb-light">
            SHELTER
          </span>
        </div>
        
        {/* Building 4 */}
        <div className={`w-[25%] h-[95%] ${getBuildingClass()} border-r-2 border-gb-darkest`}>
          <div className="absolute top-4 left-[10%] w-4 h-5 bg-gb-light opacity-20" />
          <div className="absolute top-4 right-[10%] w-4 h-5 bg-gb-light opacity-20" />
        </div>
        
        {/* Building 5 */}
        <div className={`w-[20%] h-full ${getBuildingClass()}`}>
          <div className="absolute top-6 left-[20%] w-3 h-4 bg-gb-light opacity-30" />
        </div>
      </div>

      {/* Pavement */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gb-dark">
        {/* Pavement texture */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gb-darkest" />
        
        {/* Road markings */}
        <div className="absolute bottom-4 left-0 right-0 h-px bg-gb-light opacity-40" />
        
        {/* Curb */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gb-darkest" />
      </div>

      {/* Hotspot indicators */}
      {HOTSPOTS.map((hotspot) => (
        <div
          key={hotspot.zone}
          className="absolute bottom-[38%]"
          style={{ 
            left: `${hotspot.x + hotspot.width / 2}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {/* Visual markers for hotspots */}
          {hotspot.zone === 'bins' && (
            <div className="flex gap-0.5">
              <div className="w-3 h-4 bg-gb-darkest rounded-t" />
              <div className="w-3 h-5 bg-gb-darkest rounded-t" />
              <div className="w-3 h-4 bg-gb-darkest rounded-t" />
            </div>
          )}
          {hotspot.zone === 'ask-help' && (
            <div className="w-8 h-3 bg-gb-darkest rounded-t" /> /* Bench */
          )}
          {hotspot.zone === 'sleep' && (
            <div className="w-6 h-8 bg-gb-darkest border-t-2 border-gb-dark" /> /* Doorway */
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
            className="absolute bottom-[55%] left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gb-darkest text-gb-lightest text-[8px] animate-pulse"
          >
            ↑ {hotspot.label}
          </div>
        );
      })}
    </div>
  );
}
