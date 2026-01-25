import { useState } from 'react';
import { HotspotZone, FundingStage } from '@/types/game';

interface ShopOption {
  id: string;
  label: string;
  icon: string;
  cost?: number;
  energyCost?: number;
  description: string;
  requiredStage?: FundingStage;
}

interface ShopInteriorProps {
  shopType: HotspotZone;
  money: number;
  energy: number;
  fundingStage: FundingStage;
  onAction: (actionId: string) => void;
  onExit: () => void;
}

// Stage progression order
const STAGE_ORDER: FundingStage[] = ['bootstrap', 'seed', 'series-a', 'series-b', 'series-c', 'series-d', 'ipo'];

const getNextStage = (current: FundingStage): FundingStage | null => {
  const idx = STAGE_ORDER.indexOf(current);
  return idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null;
};

const STAGE_CONFIG: Record<FundingStage, { label: string; amount: string; successRate: number; energyCost: number; hopeLoss: number }> = {
  'bootstrap': { label: 'Seed Round', amount: '$500K', successRate: 0.5, energyCost: 20, hopeLoss: 15 },
  'seed': { label: 'Series A', amount: '$2M', successRate: 0.4, energyCost: 25, hopeLoss: 25 },
  'series-a': { label: 'Series B', amount: '$10M', successRate: 0.35, energyCost: 30, hopeLoss: 30 },
  'series-b': { label: 'Series C', amount: '$30M', successRate: 0.3, energyCost: 35, hopeLoss: 35 },
  'series-c': { label: 'Series D', amount: '$80M', successRate: 0.25, energyCost: 40, hopeLoss: 40 },
  'series-d': { label: 'IPO', amount: '$500M', successRate: 0.15, energyCost: 50, hopeLoss: 50 },
  'ipo': { label: 'Victory!', amount: '∞', successRate: 1, energyCost: 0, hopeLoss: 0 },
};

// Australian VC firm names by stage
const AU_VC_NAMES: Record<FundingStage, string> = {
  'bootstrap': 'Blackbird Ventures',
  'seed': 'Square Peg Capital',
  'series-a': 'AirTree Ventures',
  'series-b': 'Main Sequence',
  'series-c': 'Reinventure',
  'series-d': 'Giant Leap',
  'ipo': 'ASX',
};

const getVCOptions = (stage: FundingStage): ShopOption[] => {
  const nextStage = getNextStage(stage);
  const config = nextStage ? STAGE_CONFIG[stage] : null;
  
  const options: ShopOption[] = [];
  
  if (stage === 'ipo') {
    options.push({ id: 'victory', label: '🔔 Ring the Bell!', icon: '🏆', description: 'You\'re listing on the ASX. You bloody legend.' });
  } else if (config) {
    options.push({ 
      id: 'pitch-next', 
      label: config.label, 
      icon: stage === 'series-d' ? '🔔' : '🚀', 
      energyCost: config.energyCost,
      description: `Pitch to ${AU_VC_NAMES[stage]}. ${Math.round(config.successRate * 100)}% chance for ${config.amount}.`
    });
  }
  
  options.push({ id: 'network', label: 'Founder Drinks', icon: '🍺', cost: 20, energyCost: 10, description: 'Beers at Fishburners. Meet other founders.' });
  
  return options;
};

const SHOP_CONFIGS: Record<string, {
  title: string;
  subtitle: string;
  options: ShopOption[];
  bgColor: string;
  accentColor: string;
}> = {
  'strip-club': {
    title: 'GENTLEMAN\'S CLUB',
    subtitle: 'The Cross • Private Booths Available',
    bgColor: '#2a1a2a',
    accentColor: '#ff4488',
    options: [
      { id: 'drinks', label: 'Champagne', icon: '🍾', cost: 100, description: 'Impress clients, boost confidence' },
      { id: 'massage', label: 'VIP Massage', icon: '💆', cost: 200, description: 'Relax, reduce stress, restore hope' },
      { id: 'private', label: 'Private Room', icon: '🚪', cost: 500, description: 'Full relaxation package' },
    ],
  },
  'bar': {
    title: 'THE BOURBON',
    subtitle: 'Est. 1986 • Kings Cross',
    bgColor: '#2a2a1a',
    accentColor: '#ffaa44',
    options: [
      { id: 'beer', label: 'Schooner', icon: '🍺', cost: 12, description: 'Cheap, takes the edge off' },
      { id: 'whiskey', label: 'Whiskey', icon: '🥃', cost: 25, description: 'Liquid courage for pitching' },
      { id: 'round', label: 'Buy a Round', icon: '🍻', cost: 80, description: 'Network with strangers' },
    ],
  },
  'pawn': {
    title: 'CASH CONVERTERS',
    subtitle: 'We Buy Everything',
    bgColor: '#1a2a1a',
    accentColor: '#44ff88',
    options: [
      { id: 'sell-watch', label: 'Sell Watch', icon: '⌚', cost: 0, description: 'Get $300, lose an asset' },
      { id: 'sell-laptop', label: 'Sell MacBook', icon: '💻', cost: 0, description: 'Get $800, can\'t work for a day' },
      { id: 'sell-phone', label: 'Sell iPhone', icon: '📱', cost: 0, description: 'Get $400, miss calls' },
    ],
  },
  'cafe': {
    title: 'SINGLE ORIGIN',
    subtitle: 'Specialty Coffee • Coworking',
    bgColor: '#2a1a1a',
    accentColor: '#aa6633',
    options: [
      { id: 'coffee', label: 'Flat White', icon: '☕', cost: 6, description: 'Energy boost (+15 energy)' },
      { id: 'meeting', label: 'Coffee Meeting', icon: '💼', cost: 15, energyCost: 10, description: 'Pitch a contact' },
      { id: 'cowork', label: 'Day Pass', icon: '🏢', cost: 35, description: 'Work, restore hope' },
    ],
  },
  'services': {
    title: 'STONE & CHALK',
    subtitle: 'Fishburners • Startmate • Sydney Startup Hub',
    bgColor: '#1a1a2a',
    accentColor: '#8844ff',
    options: [
      { id: 'mentor', label: 'See Mentor', icon: '👨‍🏫', cost: 0, energyCost: 5, description: 'Free advice from a Startmate mentor' },
      { id: 'workshop', label: 'Pitch Practice', icon: '📊', cost: 50, energyCost: 15, description: 'Practice at Fishburners demo night' },
      { id: 'apply', label: 'Apply to Startmate', icon: '📝', cost: 0, energyCost: 20, description: 'Long shot at $120K + mentorship' },
    ],
  },
  'alley': {
    title: 'BACK ALLEY',
    subtitle: 'Dark • Quiet • Private',
    bgColor: '#0a0a0a',
    accentColor: '#44ff44',
    options: [
      { id: 'buy-coke', label: 'Buy Coke', icon: '❄️', cost: 150, description: 'High-grade Colombian (5x speed!)' },
      { id: 'buy-party', label: 'Party Pack', icon: '🎉', cost: 400, description: 'Coke + pills for client entertainment' },
      { id: 'deal', label: 'Make a Deal', icon: '🤫', cost: 0, description: 'Risky business opportunity' },
    ],
  },
  'food-vendor': {
    title: 'FINE DINING',
    subtitle: 'Quay • Rockpool • Tetsuya\'s',
    bgColor: '#1a1a1a',
    accentColor: '#ffcc00',
    options: [
      { id: 'lunch', label: 'Business Lunch', icon: '🍽️', cost: 85, description: 'Impress a client (+energy)' },
      { id: 'dinner', label: 'Client Dinner', icon: '🥂', cost: 250, description: 'Close a deal over dinner' },
      { id: 'takeaway', label: 'UberEats', icon: '🥡', cost: 25, description: 'Quick food (+30 energy)' },
    ],
  },
  'bins': {
    title: 'DUMPSTER',
    subtitle: 'Behind the Office • Smells Like Opportunity',
    bgColor: '#1a1a0a',
    accentColor: '#888844',
    options: [
      { id: 'dig-shallow', label: 'Quick Dig', icon: '🗑️', energyCost: 5, description: 'Fast search. Maybe find $20-50.' },
      { id: 'dig-deep', label: 'Deep Dive', icon: '🔍', energyCost: 15, description: 'Thorough search. Find $50-150 or items.' },
      { id: 'scavenge', label: 'Scavenge Parts', icon: '🔧', energyCost: 10, description: 'Look for tech parts to sell.' },
    ],
  },
};

export function ShopInterior({ shopType, money, energy, fundingStage, onAction, onExit }: ShopInteriorProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Get config - VC firm is dynamic based on stage
  const isVCFirm = shopType === 'vc-firm';
  const vcOptions = isVCFirm ? getVCOptions(fundingStage) : [];
  const config = isVCFirm ? {
    title: AU_VC_NAMES[fundingStage].toUpperCase(),
    subtitle: fundingStage === 'ipo' ? 'Australian Stock Exchange' : `Pitch for ${fundingStage.toUpperCase()} Round`,
    bgColor: '#1a1a2a',
    accentColor: '#4488ff',
    options: vcOptions,
  } : (SHOP_CONFIGS[shopType] || SHOP_CONFIGS['bar']);
  
  const handleSelect = (option: ShopOption) => {
    const canAffordMoney = !option.cost || option.cost <= money;
    const hasEnergy = !option.energyCost || option.energyCost <= energy;
    if (!canAffordMoney || !hasEnergy) {
      return; // Can't afford
    }
    setSelectedOption(option.id);
  };
  
  const handleConfirm = () => {
    if (selectedOption) {
      onAction(selectedOption);
    }
  };
  
  return (
    <div 
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: config.bgColor }}
    >
      {/* Header */}
      <div 
        className="p-3 border-b-2"
        style={{ borderColor: config.accentColor }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 
              className="text-sm font-bold tracking-wider"
              style={{ color: config.accentColor }}
            >
              {config.title}
            </h2>
            <p className="text-[8px] text-muted-foreground mt-0.5">{config.subtitle}</p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-green-400">${money.toLocaleString()}</div>
            <div className="text-[7px] text-muted-foreground">RUNWAY</div>
            <div className="text-[10px] text-yellow-400 mt-0.5">⚡{Math.round(energy)}</div>
          </div>
        </div>
      </div>
      
      {/* Options */}
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-2">
          {config.options.map((option) => {
            const canAffordMoney = !option.cost || option.cost <= money;
            const hasEnergy = !option.energyCost || option.energyCost <= energy;
            const canAfford = canAffordMoney && hasEnergy;
            const isSelected = selectedOption === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                disabled={!canAfford}
                className={`w-full p-2 rounded border-2 text-left transition-all ${
                  isSelected 
                    ? 'border-white bg-white/10' 
                    : canAfford 
                      ? 'border-muted hover:border-muted-foreground' 
                      : 'border-muted/50 opacity-40'
                }`}
                style={{ 
                  borderColor: isSelected ? config.accentColor : undefined,
                  background: isSelected ? `${config.accentColor}22` : undefined,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{option.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground">{option.label}</span>
                      <div className="flex gap-2">
                        {option.energyCost && (
                          <span className={`text-[10px] font-bold ${hasEnergy ? 'text-yellow-400' : 'text-red-400'}`}>
                            ⚡{option.energyCost}
                          </span>
                        )}
                        {option.cost ? (
                          <span className={`text-[10px] font-bold ${canAffordMoney ? 'text-green-400' : 'text-red-400'}`}>
                            ${option.cost}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">FREE</span>
                        )}
                      </div>
                    </div>
                    <p className="text-[8px] text-muted-foreground mt-0.5">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Footer */}
      <div 
        className="p-2 border-t-2 flex gap-2"
        style={{ borderColor: config.accentColor }}
      >
        <button
          onClick={onExit}
          className="flex-1 py-2 px-3 bg-muted hover:bg-muted/80 rounded text-xs font-bold text-foreground transition-colors"
        >
          ← EXIT
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedOption}
          className={`flex-1 py-2 px-3 rounded text-xs font-bold text-white transition-colors ${
            selectedOption 
              ? 'hover:opacity-80' 
              : 'opacity-40 cursor-not-allowed'
          }`}
          style={{ background: selectedOption ? config.accentColor : '#444' }}
        >
          CONFIRM →
        </button>
      </div>
    </div>
  );
}
