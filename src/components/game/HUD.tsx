import { GameStats, FundingStage } from '@/types/game';
import { District, DISTRICT_NAMES } from '@/types/districts';
import { Volume2, VolumeX } from 'lucide-react';

const STAGE_LABELS: Record<FundingStage, string> = {
  'bootstrap': '🥾 Bootstrap',
  'seed': '🌱 Seed',
  'series-a': '🚀 Series A',
  'series-b': '📈 Series B',
  'series-c': '🏢 Series C',
  'series-d': '🏦 Series D',
  'ipo': '🔔 IPO!',
};

interface HUDProps {
  stats: GameStats;
  timeOfDay: string;
  isRaining: boolean;
  lsdTripActive?: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  currentDistrict: District;
}

function StatBar({ label, value, max = 100, danger = false, glow = false, trippy = false }: { 
  label: string; 
  value: number; 
  max?: number;
  danger?: boolean;
  glow?: boolean;
  trippy?: boolean;
}) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  const isDanger = danger || percentage < 25;
  
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`text-gb-lightest text-[8px] sm:text-[10px] uppercase tracking-tight ${trippy ? 'animate-pulse' : ''}`}>
        {label}
      </span>
      <div 
        className={`w-12 sm:w-16 h-2 bg-gb-darkest border border-gb-dark ${glow ? 'shadow-[0_0_8px_rgba(255,150,200,0.5)]' : ''} ${trippy ? 'shadow-[0_0_8px_rgba(150,100,255,0.6)]' : ''}`}
        style={glow ? { borderColor: 'rgba(255, 150, 200, 0.6)' } : trippy ? { borderColor: 'rgba(150, 100, 255, 0.6)' } : {}}
      >
        <div 
          className={`h-full transition-all duration-300 ${
            trippy ? 'bg-purple-400 animate-pulse' :
            glow ? 'bg-pink-400 animate-pulse' :
            isDanger ? 'bg-gb-lightest animate-pulse' : 'bg-gb-light'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Format money for display
function formatMoney(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

export function HUD({ stats, timeOfDay, isRaining, lsdTripActive = false, isMuted, onToggleMute, currentDistrict }: HUDProps) {
  const isHigh = stats.cocaine > 30;
  const districtName = DISTRICT_NAMES[currentDistrict];
  
  return (
    <div className={`bg-gb-dark border-b-2 border-gb-darkest px-2 py-1.5 flex flex-wrap items-center justify-between gap-2 ${isHigh ? 'shadow-[inset_0_-2px_8px_rgba(255,150,200,0.2)]' : ''} ${lsdTripActive ? 'shadow-[inset_0_-2px_12px_rgba(150,100,255,0.3)]' : ''}`}>
      {/* Mute button */}
      <button
        onClick={onToggleMute}
        className="p-1 text-gb-light hover:text-gb-lightest transition-colors"
        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
      >
        {isMuted ? (
          <VolumeX size={14} className="sm:w-4 sm:h-4" />
        ) : (
          <Volume2 size={14} className="sm:w-4 sm:h-4" />
        )}
      </button>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <StatBar label="NRG" value={stats.hunger} danger={stats.hunger < 25} />
        <StatBar label="CNF" value={stats.warmth} danger={stats.warmth < 25} />
        <StatBar label="HPE" value={stats.hope} danger={stats.hope < 25} trippy={lsdTripActive} />
        <StatBar label="COC" value={stats.cocaine} danger={stats.cocaine > 75} glow={isHigh} />
        {stats.lsd > 0 && (
          <div className="flex flex-col gap-0.5">
            <span className="text-gb-lightest text-[8px] sm:text-[10px] uppercase tracking-tight">LSD</span>
            <span className={`text-xs font-bold ${lsdTripActive ? 'text-purple-400 animate-pulse' : 'text-gb-light'}`}>
              {stats.lsd}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Assets indicator */}
        <div className="flex gap-1 text-[10px]">
          {stats.hasWatch && <span title="Watch">⌚</span>}
          {stats.hasLaptop && <span title="MacBook">💻</span>}
          {stats.hasPhone && <span title="iPhone">📱</span>}
        </div>
        
        {/* Funding stage indicator */}
        <div className="flex flex-col items-center">
          <span className="text-gb-lightest text-[7px] sm:text-[8px] uppercase opacity-60">Stage</span>
          <span className={`text-[9px] sm:text-[10px] font-bold ${stats.fundingStage === 'ipo' ? 'text-yellow-400 animate-pulse' : 'text-gb-light'}`}>
            {STAGE_LABELS[stats.fundingStage]}
          </span>
        </div>
        
        {/* District name indicator */}
        <div className="flex flex-col items-center">
          <span className="text-gb-lightest text-[7px] sm:text-[8px] uppercase opacity-60">Location</span>
          <span className={`text-[9px] sm:text-[10px] font-bold text-gb-light ${lsdTripActive ? 'animate-pulse' : ''}`}>
            {districtName}
          </span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-gb-lightest text-[8px] sm:text-[10px] uppercase">Runway</span>
          <span className={`text-xs sm:text-sm font-bold ${
            stats.money < 1000 ? 'text-gb-lightest animate-pulse' : 'text-green-400'
          }`}>
            {formatMoney(stats.money)}
          </span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-gb-lightest text-[8px] sm:text-[10px] uppercase">Months</span>
          <span className="text-gb-light text-xs sm:text-sm font-bold">
            {stats.survivalTime}
          </span>
        </div>
        
        <div className="flex flex-col items-center">
          <span className={`text-[10px] sm:text-xs text-gb-light capitalize ${lsdTripActive ? 'text-gb-lightest' : ''}`}>
            {lsdTripActive ? '✦ HIGH ✦' : timeOfDay}
          </span>
          {isRaining && !lsdTripActive && (
            <span className="text-[8px] text-gb-lightest">🌧</span>
          )}
          {lsdTripActive && (
            <span className="text-[8px] text-gb-lightest animate-pulse">∞</span>
          )}
        </div>
      </div>
    </div>
  );
}
