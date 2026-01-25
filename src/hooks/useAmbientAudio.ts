import { useEffect, useRef, useCallback } from 'react';
import { District } from '@/types/districts';

interface AmbientAudioConfig {
  baseFrequency: number;
  oscillatorType: OscillatorType;
  gainLevel: number;
  secondaryFrequency?: number;
  secondaryGain?: number;
  noiseType: 'pink' | 'brown' | 'white' | 'none';
  noiseGain: number;
  noiseFilterFreq: number;
  lfoFrequency: number;
  lfoDepth: number;
  // Character descriptors for reference
  description: string;
}

// Per-district soundscape configs based on patch spec
const DISTRICT_AUDIO_CONFIGS: Record<District, AmbientAudioConfig> = {
  cross: {
    // Distant sirens, muffled club bass, cars
    baseFrequency: 60,
    oscillatorType: 'sine',
    gainLevel: 0.018,
    secondaryFrequency: 120,
    secondaryGain: 0.01,
    noiseType: 'pink',
    noiseGain: 0.015,
    noiseFilterFreq: 350,
    lfoFrequency: 0.25,
    lfoDepth: 0.18,
    description: 'neon hum + club bass + sirens',
  },
  oxford: {
    // Crowd chatter + muffled pop music
    baseFrequency: 55,
    oscillatorType: 'sine',
    gainLevel: 0.012,
    secondaryFrequency: 110,
    secondaryGain: 0.007,
    noiseType: 'pink',
    noiseGain: 0.018,
    noiseFilterFreq: 500,
    lfoFrequency: 0.3,
    lfoDepth: 0.12,
    description: 'crowd chatter + pop leak',
  },
  cbd: {
    // Traffic, bus air brakes, HVAC hum
    baseFrequency: 45,
    oscillatorType: 'sine',
    gainLevel: 0.022,
    secondaryFrequency: 90,
    secondaryGain: 0.012,
    noiseType: 'brown',
    noiseGain: 0.028,
    noiseFilterFreq: 150,
    lfoFrequency: 0.06,
    lfoDepth: 0.08,
    description: 'traffic + bus brakes + HVAC',
  },
  chinatown: {
    // Kitchen clatter, sizzling, chatter
    baseFrequency: 130,
    oscillatorType: 'sine',
    gainLevel: 0.008,
    secondaryFrequency: 260,
    secondaryGain: 0.004,
    noiseType: 'pink',
    noiseGain: 0.022,
    noiseFilterFreq: 900,
    lfoFrequency: 1.0,
    lfoDepth: 0.3,
    description: 'kitchen clang + steam hiss',
  },
  central: {
    // PA chimes, train brakes, echo
    baseFrequency: 40,
    oscillatorType: 'sine',
    gainLevel: 0.02,
    secondaryFrequency: 80,
    secondaryGain: 0.012,
    noiseType: 'brown',
    noiseGain: 0.035,
    noiseFilterFreq: 180,
    lfoFrequency: 0.04,
    lfoDepth: 0.1,
    description: 'station chime + platform echo',
  },
  surryHills: {
    // Light traffic, dogs, café clatter
    baseFrequency: 70,
    oscillatorType: 'sine',
    gainLevel: 0.01,
    secondaryFrequency: 140,
    secondaryGain: 0.005,
    noiseType: 'pink',
    noiseGain: 0.012,
    noiseFilterFreq: 400,
    lfoFrequency: 0.2,
    lfoDepth: 0.1,
    description: 'café murmur + small dogs',
  },
  cabramatta: {
    // Market chatter, grill sizzle, scooters
    baseFrequency: 110,
    oscillatorType: 'sine',
    gainLevel: 0.012,
    secondaryFrequency: 220,
    secondaryGain: 0.006,
    noiseType: 'pink',
    noiseGain: 0.025,
    noiseFilterFreq: 700,
    lfoFrequency: 0.7,
    lfoDepth: 0.22,
    description: 'market chatter + grill sizzle',
  },
  parramatta: {
    // TV sports, pokies chime
    baseFrequency: 85,
    oscillatorType: 'sine',
    gainLevel: 0.015,
    secondaryFrequency: 170,
    secondaryGain: 0.008,
    noiseType: 'pink',
    noiseGain: 0.018,
    noiseFilterFreq: 450,
    lfoFrequency: 0.4,
    lfoDepth: 0.15,
    description: 'TV sports + pokies chime',
  },
  mountDruitt: {
    // Cars, servo beeps, distant dogs
    baseFrequency: 50,
    oscillatorType: 'sine',
    gainLevel: 0.018,
    secondaryFrequency: 100,
    secondaryGain: 0.01,
    noiseType: 'brown',
    noiseGain: 0.03,
    noiseFilterFreq: 200,
    lfoFrequency: 0.08,
    lfoDepth: 0.12,
    description: 'cars + servo beeps + dogs',
  },
  redfern: {
    // Sparse, eerie ambient - distant dogs
    baseFrequency: 32,
    oscillatorType: 'sine',
    gainLevel: 0.016,
    noiseType: 'brown',
    noiseGain: 0.04,
    noiseFilterFreq: 90,
    lfoFrequency: 0.025,
    lfoDepth: 0.2,
    description: 'eerie low drone + distant dogs',
  },
};

export function useAmbientAudio(
  currentDistrict: District,
  isPaused: boolean,
  isGameOver: boolean,
  isRaining: boolean,
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night',
  isMuted: boolean
) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const secondaryOscRef = useRef<OscillatorNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const rainNoiseRef = useRef<AudioBufferSourceNode | null>(null);
  const isInitializedRef = useRef(false);
  const currentDistrictRef = useRef<District>(currentDistrict);

  const createNoiseBuffer = useCallback((ctx: AudioContext, type: 'pink' | 'brown' | 'white') => {
    const duration = 4;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    const fadeLength = ctx.sampleRate * 0.1;
    
    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }
    } else {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 2.5;
      }
    }
    
    for (let i = 0; i < fadeLength; i++) {
      const fadeIn = i / fadeLength;
      const fadeOut = 1 - fadeIn;
      const endIdx = bufferSize - fadeLength + i;
      const blended = data[i] * fadeIn + data[endIdx] * fadeOut;
      data[i] = blended;
      data[endIdx] = blended;
    }
    
    return buffer;
  }, []);

  const initAudio = useCallback(() => {
    if (isInitializedRef.current) return;
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = 0.3;
      masterGainRef.current.connect(audioContextRef.current.destination);
      isInitializedRef.current = true;
    } catch (e) {
      console.warn('Web Audio not supported');
    }
  }, []);

  const updateDistrictAudio = useCallback((district: District) => {
    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    const config = DISTRICT_AUDIO_CONFIGS[district];
    const now = ctx.currentTime;

    const cleanupNode = (node: OscillatorNode | AudioBufferSourceNode | null) => {
      if (node) {
        try { node.stop(now + 0.1); } catch {}
      }
    };
    
    cleanupNode(oscillatorRef.current);
    cleanupNode(secondaryOscRef.current);
    cleanupNode(noiseSourceRef.current);
    cleanupNode(lfoRef.current);

    setTimeout(() => {
      if (!ctx || ctx.state === 'closed') return;
      
      oscillatorRef.current = ctx.createOscillator();
      oscillatorRef.current.type = config.oscillatorType;
      oscillatorRef.current.frequency.value = config.baseFrequency;
      
      const oscGain = ctx.createGain();
      oscGain.gain.value = config.gainLevel;
      
      lfoRef.current = ctx.createOscillator();
      lfoRef.current.type = 'sine';
      lfoRef.current.frequency.value = config.lfoFrequency;
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = config.lfoDepth * config.gainLevel;
      
      lfoRef.current.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      
      oscillatorRef.current.connect(oscGain);
      oscGain.connect(masterGain);
      
      oscillatorRef.current.start();
      lfoRef.current.start();

      if (config.secondaryFrequency) {
        secondaryOscRef.current = ctx.createOscillator();
        secondaryOscRef.current.type = config.oscillatorType;
        secondaryOscRef.current.frequency.value = config.secondaryFrequency;
        
        const secGain = ctx.createGain();
        secGain.gain.value = config.secondaryGain || 0.005;
        
        secondaryOscRef.current.connect(secGain);
        secGain.connect(masterGain);
        secondaryOscRef.current.start();
      }

      if (config.noiseType !== 'none') {
        const noiseBuffer = createNoiseBuffer(ctx, config.noiseType);
        noiseSourceRef.current = ctx.createBufferSource();
        noiseSourceRef.current.buffer = noiseBuffer;
        noiseSourceRef.current.loop = true;
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = config.noiseGain;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = config.noiseFilterFreq;
        noiseFilter.Q.value = 0.5;
        
        noiseSourceRef.current.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);
        noiseSourceRef.current.start();
      }
    }, 150);
  }, [createNoiseBuffer]);

  const updateRainSound = useCallback((raining: boolean) => {
    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    if (rainNoiseRef.current) {
      try { rainNoiseRef.current.stop(); } catch {}
      rainNoiseRef.current = null;
    }

    if (raining) {
      const rainBuffer = createNoiseBuffer(ctx, 'white');
      rainNoiseRef.current = ctx.createBufferSource();
      rainNoiseRef.current.buffer = rainBuffer;
      rainNoiseRef.current.loop = true;
      
      const rainGain = ctx.createGain();
      rainGain.gain.value = 0.05;
      
      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'bandpass';
      rainFilter.frequency.value = 1200;
      rainFilter.Q.value = 0.3;
      
      rainNoiseRef.current.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(masterGain);
      rainNoiseRef.current.start();
    }
  }, [createNoiseBuffer]);

  useEffect(() => {
    if (!masterGainRef.current) return;
    
    const baseVolume = 0.25;
    const nightBoost = timeOfDay === 'night' ? 1.2 : timeOfDay === 'dusk' ? 1.1 : 1.0;
    masterGainRef.current.gain.setTargetAtTime(baseVolume * nightBoost, audioContextRef.current?.currentTime || 0, 0.3);
  }, [timeOfDay]);

  useEffect(() => {
    if (!masterGainRef.current || !audioContextRef.current) return;
    
    const targetGain = (isPaused || isGameOver || isMuted) ? 0 : 0.25;
    masterGainRef.current.gain.setTargetAtTime(targetGain, audioContextRef.current.currentTime, 0.2);
  }, [isPaused, isGameOver, isMuted]);

  useEffect(() => {
    if (currentDistrictRef.current !== currentDistrict && isInitializedRef.current) {
      currentDistrictRef.current = currentDistrict;
      updateDistrictAudio(currentDistrict);
    }
  }, [currentDistrict, updateDistrictAudio]);

  useEffect(() => {
    if (isInitializedRef.current) {
      updateRainSound(isRaining);
    }
  }, [isRaining, updateRainSound]);

  useEffect(() => {
    const handleInteraction = () => {
      if (!isInitializedRef.current) {
        initAudio();
        if (audioContextRef.current) {
          updateDistrictAudio(currentDistrict);
          if (isRaining) {
            updateRainSound(true);
          }
        }
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [initAudio, updateDistrictAudio, updateRainSound, currentDistrict, isRaining]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { initAudio };
}
