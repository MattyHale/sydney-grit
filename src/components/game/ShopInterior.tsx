import { useState } from 'react';
import { HotspotZone } from '@/types/game';

interface ShopOption {
  id: string;
  label: string;
  icon: string;
  cost?: number;
  description: string;
}

interface ShopInteriorProps {
  shopType: HotspotZone;
  money: number;
  onAction: (actionId: string) => void;
  onExit: () => void;
}

const SHOP_CONFIGS: Record<string, {
  title: string;
  subtitle: string;
  options: ShopOption[];
  bgColor: string;
  accentColor: string;
}> = {
  'vc-firm': {
    title: 'VENTURE CAPITAL',
    subtitle: 'Sequoia • a16z • Blackbird',
    bgColor: '#1a1a2a',
    accentColor: '#4488ff',
    options: [
      { id: 'pitch-seed', label: 'Seed Pitch', icon: '🌱', cost: 0, description: '50/50 - Win $500K or lose hope' },
      { id: 'pitch-series-a', label: 'Series A', icon: '🚀', cost: 50, description: 'Big risk, big reward: $2M or devastation' },
      { id: 'network', label: 'Network', icon: '🤝', cost: 20, description: 'Meet founders, gain hope' },
    ],
  },
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
      { id: 'coffee', label: 'Flat White', icon: '☕', cost: 6, description: 'Energy boost, focus' },
      { id: 'meeting', label: 'Coffee Meeting', icon: '💼', cost: 15, description: 'Pitch a contact' },
      { id: 'cowork', label: 'Day Pass', icon: '🏢', cost: 35, description: 'Work, restore hope' },
    ],
  },
  'services': {
    title: 'STARTUP HUB',
    subtitle: 'Accelerator • Mentorship',
    bgColor: '#1a1a2a',
    accentColor: '#8844ff',
    options: [
      { id: 'mentor', label: 'See Mentor', icon: '👨‍🏫', cost: 0, description: 'Free advice, +hope' },
      { id: 'workshop', label: 'Workshop', icon: '📊', cost: 50, description: 'Learn to pitch better' },
      { id: 'apply', label: 'Apply to Program', icon: '📝', cost: 0, description: 'Long shot at funding' },
    ],
  },
  'alley': {
    title: 'BACK ALLEY',
    subtitle: 'Dark • Quiet • Private',
    bgColor: '#0a0a0a',
    accentColor: '#44ff44',
    options: [
      { id: 'buy-coke', label: 'Buy Coke', icon: '❄️', cost: 150, description: 'High-grade Colombian' },
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
      { id: 'lunch', label: 'Business Lunch', icon: '🍽️', cost: 85, description: 'Impress a client' },
      { id: 'dinner', label: 'Client Dinner', icon: '🥂', cost: 250, description: 'Close a deal over dinner' },
      { id: 'takeaway', label: 'UberEats', icon: '🥡', cost: 25, description: 'Quick food, back to work' },
    ],
  },
};

export function ShopInterior({ shopType, money, onAction, onExit }: ShopInteriorProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const config = SHOP_CONFIGS[shopType] || SHOP_CONFIGS['bar'];
  
  const handleSelect = (option: ShopOption) => {
    if (option.cost && option.cost > money) {
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
            <p className="text-[8px] text-gray-400 mt-0.5">{config.subtitle}</p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-green-400">${money.toLocaleString()}</div>
            <div className="text-[7px] text-gray-500">BALANCE</div>
          </div>
        </div>
      </div>
      
      {/* Options */}
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-2">
          {config.options.map((option) => {
            const canAfford = !option.cost || option.cost <= money;
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
                      ? 'border-gray-600 hover:border-gray-400' 
                      : 'border-gray-800 opacity-40'
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
                      <span className="text-xs font-bold text-white">{option.label}</span>
                      {option.cost ? (
                        <span className={`text-[10px] font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                          ${option.cost}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500">FREE</span>
                      )}
                    </div>
                    <p className="text-[8px] text-gray-400 mt-0.5">{option.description}</p>
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
          className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold text-white transition-colors"
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
