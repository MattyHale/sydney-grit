// Fixed Sydney Harbour skyline background - does not scroll with districts
// Shows Opera House, Harbour Bridge, city skyline, cranes, water reflections, ferry lights

interface SkylineBackgroundProps {
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  isRaining: boolean;
}

export function SkylineBackground({ timeOfDay, isRaining }: SkylineBackgroundProps) {
  const isNight = timeOfDay === 'night' || timeOfDay === 'dusk';
  const isDawn = timeOfDay === 'dawn';
  
  // Sky gradient based on time
  const getSkyGradient = () => {
    switch (timeOfDay) {
      case 'night':
        return 'linear-gradient(180deg, #020508 0%, #051020 40%, #0a1830 100%)';
      case 'dusk':
        return 'linear-gradient(180deg, #1a1025 0%, #301530 30%, #502040 60%, #803050 100%)';
      case 'dawn':
        return 'linear-gradient(180deg, #152030 0%, #304060 30%, #506080 60%, #8090a0 100%)';
      default:
        return 'linear-gradient(180deg, #4080c0 0%, #60a0d0 40%, #80c0e0 100%)';
    }
  };
  
  // Water color
  const getWaterColor = () => {
    switch (timeOfDay) {
      case 'night': return '#0a1520';
      case 'dusk': return '#1a2535';
      case 'dawn': return '#203040';
      default: return '#406080';
    }
  };
  
  const silhouetteColor = isNight ? '#0a0f15' : isDawn ? '#1a2530' : '#2a4050';
  const highlightColor = isNight ? '#ffcc44' : '#ffffff';

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ background: getSkyGradient() }}
    >
      {/* Stars at night */}
      {isNight && (
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={`star-${i}`}
              className={i % 3 === 0 ? 'animate-pulse' : ''}
              style={{
                position: 'absolute',
                left: `${(i * 17 + 5) % 100}%`,
                top: `${(i * 11 + 3) % 30}%`,
                width: i % 4 === 0 ? '2px' : '1px',
                height: i % 4 === 0 ? '2px' : '1px',
                background: '#ffffff',
                borderRadius: '50%',
                opacity: 0.6 + (i % 4) * 0.1,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Moon at night */}
      {isNight && (
        <div
          style={{
            position: 'absolute',
            right: '15%',
            top: '8%',
            width: '20px',
            height: '20px',
            background: 'radial-gradient(circle at 30% 30%, #ffffee 0%, #ddddcc 50%, #aaaaaa 100%)',
            borderRadius: '50%',
            boxShadow: '0 0 20px #ffffee44, 0 0 40px #ffffee22',
          }}
        />
      )}
      
      {/* Distant city skyline - left side */}
      <div className="absolute bottom-[35%] left-0 right-0 h-[15%]">
        {/* Low city buildings */}
        {[...Array(25)].map((_, i) => (
          <div
            key={`bldg-${i}`}
            style={{
              position: 'absolute',
              left: `${i * 4}%`,
              bottom: 0,
              width: `${12 + (i % 3) * 6}px`,
              height: `${20 + (i % 5) * 12 + (i % 7) * 5}%`,
              background: silhouetteColor,
            }}
          >
            {/* Lit windows at night */}
            {isNight && i % 2 === 0 && (
              <>
                <div 
                  className={i % 3 === 0 ? 'animate-pulse' : ''}
                  style={{
                    position: 'absolute',
                    left: '20%',
                    top: `${20 + (i % 4) * 15}%`,
                    width: '3px',
                    height: '3px',
                    background: highlightColor,
                    opacity: 0.6,
                  }}
                />
                <div 
                  style={{
                    position: 'absolute',
                    right: '25%',
                    top: `${35 + (i % 3) * 12}%`,
                    width: '2px',
                    height: '3px',
                    background: highlightColor,
                    opacity: 0.4,
                  }}
                />
              </>
            )}
          </div>
        ))}
        
        {/* Cranes */}
        <div style={{ position: 'absolute', left: '12%', bottom: 0 }}>
          <div style={{ width: '2px', height: '45px', background: silhouetteColor }} />
          <div style={{ position: 'absolute', top: '5px', left: '-15px', width: '35px', height: '2px', background: silhouetteColor }} />
          <div style={{ position: 'absolute', top: '5px', left: '15px', width: '1px', height: '20px', background: silhouetteColor }} />
        </div>
        <div style={{ position: 'absolute', left: '78%', bottom: 0 }}>
          <div style={{ width: '2px', height: '35px', background: silhouetteColor }} />
          <div style={{ position: 'absolute', top: '3px', left: '-12px', width: '28px', height: '2px', background: silhouetteColor }} />
        </div>
      </div>
      
      {/* Sydney Harbour Bridge - center-left */}
      <div 
        className="absolute"
        style={{ 
          bottom: '35%',
          left: '25%',
          width: '120px',
          height: '50px',
        }}
      >
        {/* Main arch */}
        <div 
          style={{
            position: 'absolute',
            bottom: '15px',
            left: 0,
            right: 0,
            height: '35px',
            borderTop: `4px solid ${silhouetteColor}`,
            borderRadius: '50% 50% 0 0',
          }}
        />
        {/* Bridge deck */}
        <div 
          style={{
            position: 'absolute',
            bottom: '12px',
            left: 0,
            right: 0,
            height: '5px',
            background: silhouetteColor,
          }}
        />
        {/* Pylons */}
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: '5px',
            width: '10px',
            height: '25px',
            background: silhouetteColor,
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
          }}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            right: '5px',
            width: '10px',
            height: '25px',
            background: silhouetteColor,
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
          }}
        />
        {/* Vertical cables */}
        {[...Array(10)].map((_, i) => (
          <div
            key={`cable-${i}`}
            style={{
              position: 'absolute',
              bottom: '15px',
              left: `${12 + i * 10}%`,
              width: '1px',
              height: `${15 + Math.sin(i * 0.6) * 12}px`,
              background: silhouetteColor,
              opacity: 0.8,
            }}
          />
        ))}
        {/* Car lights at night */}
        {isNight && (
          <div 
            className="animate-pulse"
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '15%',
              right: '15%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #ff884444, #ffaa4433, transparent)',
            }}
          />
        )}
      </div>
      
      {/* Opera House - center-right */}
      <div 
        className="absolute"
        style={{ 
          bottom: '35%',
          left: '55%',
          width: '60px',
          height: '30px',
        }}
      >
        {/* Sails */}
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '20px',
            height: '25px',
            background: silhouetteColor,
            clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)',
          }}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: '12px',
            width: '18px',
            height: '22px',
            background: silhouetteColor,
            clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)',
          }}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: '22px',
            width: '16px',
            height: '18px',
            background: silhouetteColor,
            clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)',
          }}
        />
        {/* Small back sails */}
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: '35px',
            width: '14px',
            height: '15px',
            background: silhouetteColor,
            clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)',
          }}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: '43px',
            width: '12px',
            height: '12px',
            background: silhouetteColor,
            clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)',
          }}
        />
        {/* Base/platform */}
        <div 
          style={{
            position: 'absolute',
            bottom: '-3px',
            left: '-5px',
            width: '65px',
            height: '5px',
            background: silhouetteColor,
          }}
        />
        {/* Lights at night */}
        {isNight && (
          <div 
            style={{
              position: 'absolute',
              bottom: '-2px',
              left: '5px',
              right: '10px',
              height: '1px',
              background: '#ffffcc66',
              boxShadow: '0 0 8px #ffffcc44',
            }}
          />
        )}
      </div>
      
      {/* Centrepoint Tower */}
      <div 
        style={{
          position: 'absolute',
          bottom: '35%',
          left: '72%',
        }}
      >
        {/* Spire */}
        <div style={{ width: '2px', height: '55px', background: silhouetteColor }} />
        {/* Observation deck */}
        <div 
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '-6px',
            width: '14px',
            height: '8px',
            background: silhouetteColor,
            borderRadius: '3px',
          }}
        />
        {/* Restaurant level */}
        <div 
          style={{
            position: 'absolute',
            bottom: '22px',
            left: '-4px',
            width: '10px',
            height: '6px',
            background: silhouetteColor,
            borderRadius: '2px',
          }}
        />
        {/* Night glow ring */}
        {isNight && (
          <div 
            className="animate-pulse"
            style={{
              position: 'absolute',
              bottom: '33px',
              left: '-8px',
              width: '18px',
              height: '3px',
              background: '#ffcc4466',
              borderRadius: '50%',
              boxShadow: '0 0 10px #ffcc4444',
            }}
          />
        )}
      </div>
      
      {/* Water layer */}
      <div 
        className="absolute left-0 right-0 bottom-[20%] h-[15%]"
        style={{ background: getWaterColor() }}
      >
        {/* Water reflections */}
        {isNight && (
          <>
            {/* Bridge reflection */}
            <div 
              className="animate-pulse"
              style={{
                position: 'absolute',
                top: '20%',
                left: '28%',
                width: '60px',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #ffaa4422, #ffcc4433, #ffaa4422, transparent)',
              }}
            />
            {/* Opera House reflection */}
            <div 
              style={{
                position: 'absolute',
                top: '15%',
                left: '56%',
                width: '40px',
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #ffffcc22, transparent)',
              }}
            />
            {/* Tower reflection */}
            <div 
              className="animate-pulse"
              style={{
                position: 'absolute',
                top: '25%',
                left: '72%',
                width: '3px',
                height: '15px',
                background: 'linear-gradient(180deg, #ffcc4433, transparent)',
              }}
            />
            {/* City lights reflection */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`refl-${i}`}
                className={i % 2 === 0 ? 'animate-pulse' : ''}
                style={{
                  position: 'absolute',
                  top: `${15 + (i % 3) * 10}%`,
                  left: `${10 + i * 10}%`,
                  width: `${4 + (i % 3) * 2}px`,
                  height: '2px',
                  background: `rgba(255, ${200 + (i % 3) * 20}, ${100 + (i % 2) * 50}, 0.2)`,
                }}
              />
            ))}
          </>
        )}
        
        {/* Ferry lights */}
        {isNight && (
          <>
            <div 
              className="animate-pulse"
              style={{
                position: 'absolute',
                top: '40%',
                left: '40%',
                width: '4px',
                height: '2px',
                background: '#88ff88',
                boxShadow: '0 0 4px #88ff88',
              }}
            />
            <div 
              style={{
                position: 'absolute',
                top: '60%',
                left: '65%',
                width: '3px',
                height: '2px',
                background: '#ff8888',
                boxShadow: '0 0 3px #ff8888',
              }}
            />
          </>
        )}
        
        {/* Rain effect on water */}
        {isRaining && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'repeating-linear-gradient(180deg, transparent 0px, transparent 4px, rgba(200, 220, 255, 0.1) 5px)',
            }}
          />
        )}
      </div>
      
      {/* Clouds */}
      {(timeOfDay === 'day' || timeOfDay === 'dawn') && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            style={{
              position: 'absolute',
              top: '8%',
              left: '20%',
              width: '40px',
              height: '15px',
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '10px',
              filter: 'blur(2px)',
            }}
          />
          <div 
            style={{
              position: 'absolute',
              top: '12%',
              left: '60%',
              width: '50px',
              height: '18px',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              filter: 'blur(3px)',
            }}
          />
          <div 
            style={{
              position: 'absolute',
              top: '6%',
              right: '25%',
              width: '35px',
              height: '12px',
              background: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '8px',
              filter: 'blur(2px)',
            }}
          />
        </div>
      )}
      
      {/* Rain overlay */}
      {isRaining && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(180deg, transparent 0px, transparent 8px, rgba(180, 200, 220, 0.05) 9px)',
            animation: 'rain 0.3s linear infinite',
          }}
        />
      )}
    </div>
  );
}
