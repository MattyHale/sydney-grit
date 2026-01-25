import { useEffect, useRef, useCallback } from 'react';
import { District } from '@/types/districts';

interface AmbientAudioConfig {
  // Oscillator settings
  baseFrequency: number;
  oscillatorType: OscillatorType;
  gainLevel: number;
  // Secondary layer
  secondaryFrequency?: number;
  secondaryGain?: number;
  // Noise settings
  noiseType: 'pink' | 'brown' | 'white' | 'none';
  noiseGain: number;
  noiseFilterFreq: number;
  // Modulation
  lfoFrequency: number;
  lfoDepth: number;
  // Reverb
  reverbMix: number;
}

const DISTRICT_AUDIO_CONFIGS: Record<District, AmbientAudioConfig> = {
  cross: {
    // Neon hum - buzzy 60Hz electrical hum with harmonics
    baseFrequency: 60,
    oscillatorType: 'sawtooth',
    gainLevel: 0.04,
    secondaryFrequency: 120,
    secondaryGain: 0.02,
    noiseType: 'pink',
    noiseGain: 0.015,
    noiseFilterFreq: 400,
    lfoFrequency: 0.5,
    lfoDepth: 0.3,
    reverbMix: 0.2,
  },
  oxford: {
    // Similar neon hum but slightly different character
    baseFrequency: 55,
    oscillatorType: 'square',
    gainLevel: 0.03,
    secondaryFrequency: 110,
    secondaryGain: 0.015,
    noiseType: 'pink',
    noiseGain: 0.02,
    noiseFilterFreq: 600,
    lfoFrequency: 0.3,
    lfoDepth: 0.25,
    reverbMix: 0.25,
  },
  cbd: {
    // HVAC hum - low rumble with filtered white noise
    baseFrequency: 40,
    oscillatorType: 'sine',
    gainLevel: 0.05,
    secondaryFrequency: 80,
    secondaryGain: 0.02,
    noiseType: 'brown',
    noiseGain: 0.03,
    noiseFilterFreq: 200,
    lfoFrequency: 0.1,
    lfoDepth: 0.15,
    reverbMix: 0.4,
  },
  chinatown: {
    // Kitchen clatter - metallic overtones with percussive noise
    baseFrequency: 180,
    oscillatorType: 'triangle',
    gainLevel: 0.02,
    secondaryFrequency: 360,
    secondaryGain: 0.015,
    noiseType: 'white',
    noiseGain: 0.025,
    noiseFilterFreq: 2000,
    lfoFrequency: 2.5,
    lfoDepth: 0.6,
    reverbMix: 0.15,
  },
  central: {
    // Station reverb - deep rumble with echo
    baseFrequency: 35,
    oscillatorType: 'sine',
    gainLevel: 0.04,
    secondaryFrequency: 70,
    secondaryGain: 0.025,
    noiseType: 'brown',
    noiseGain: 0.035,
    noiseFilterFreq: 300,
    lfoFrequency: 0.08,
    lfoDepth: 0.2,
    reverbMix: 0.6,
  },
  redfern: {
    // Distant dogs - sparse, eerie with occasional howls simulated by LFO
    baseFrequency: 25,
    oscillatorType: 'sine',
    gainLevel: 0.03,
    noiseType: 'brown',
    noiseGain: 0.04,
    noiseFilterFreq: 150,
    lfoFrequency: 0.05,
    lfoDepth: 0.4,
    reverbMix: 0.5,
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

  // Create noise buffer
  const createNoiseBuffer = useCallback((ctx: AudioContext, type: 'pink' | 'brown' | 'white') => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
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
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else { // brown
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
    }
    
    return buffer;
  }, []);

  // Initialize audio context on first user interaction
  const initAudio = useCallback(() => {
    if (isInitializedRef.current) return;
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = 0.15; // Master volume
      masterGainRef.current.connect(audioContextRef.current.destination);
      isInitializedRef.current = true;
    } catch (e) {
      console.warn('Web Audio not supported');
    }
  }, []);

  // Update audio based on district
  const updateDistrictAudio = useCallback((district: District) => {
    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    const config = DISTRICT_AUDIO_CONFIGS[district];
    const now = ctx.currentTime;

    // Clean up existing nodes
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); } catch {}
    }
    if (secondaryOscRef.current) {
      try { secondaryOscRef.current.stop(); } catch {}
    }
    if (noiseSourceRef.current) {
      try { noiseSourceRef.current.stop(); } catch {}
    }
    if (lfoRef.current) {
      try { lfoRef.current.stop(); } catch {}
    }

    // Create main oscillator
    oscillatorRef.current = ctx.createOscillator();
    oscillatorRef.current.type = config.oscillatorType;
    oscillatorRef.current.frequency.value = config.baseFrequency;
    
    const oscGain = ctx.createGain();
    oscGain.gain.value = config.gainLevel;
    
    // LFO for modulation
    lfoRef.current = ctx.createOscillator();
    lfoRef.current.type = 'sine';
    lfoRef.current.frequency.value = config.lfoFrequency;
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = config.lfoDepth * config.gainLevel;
    
    lfoRef.current.connect(lfoGain);
    lfoGain.connect(oscGain.gain);
    
    oscillatorRef.current.connect(oscGain);
    oscGain.connect(masterGain);
    
    oscillatorRef.current.start(now);
    lfoRef.current.start(now);

    // Secondary oscillator (harmonic)
    if (config.secondaryFrequency) {
      secondaryOscRef.current = ctx.createOscillator();
      secondaryOscRef.current.type = config.oscillatorType;
      secondaryOscRef.current.frequency.value = config.secondaryFrequency;
      
      const secGain = ctx.createGain();
      secGain.gain.value = config.secondaryGain || 0.01;
      
      secondaryOscRef.current.connect(secGain);
      secGain.connect(masterGain);
      secondaryOscRef.current.start(now);
    }

    // Noise layer
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
      
      noiseSourceRef.current.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSourceRef.current.start(now);
    }
  }, [createNoiseBuffer]);

  // Rain sound
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
      rainGain.gain.value = 0.08;
      
      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'bandpass';
      rainFilter.frequency.value = 1500;
      rainFilter.Q.value = 0.5;
      
      rainNoiseRef.current.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(masterGain);
      rainNoiseRef.current.start();
    }
  }, [createNoiseBuffer]);

  // Handle time of day volume
  useEffect(() => {
    if (!masterGainRef.current) return;
    
    const baseVolume = 0.12;
    const nightBoost = timeOfDay === 'night' ? 1.3 : timeOfDay === 'dusk' ? 1.15 : 1.0;
    masterGainRef.current.gain.value = baseVolume * nightBoost;
  }, [timeOfDay]);

  // Handle pause/game over/mute
  useEffect(() => {
    if (!masterGainRef.current) return;
    
    if (isPaused || isGameOver || isMuted) {
      masterGainRef.current.gain.value = 0;
    } else {
      const baseVolume = 0.12;
      const nightBoost = timeOfDay === 'night' ? 1.3 : timeOfDay === 'dusk' ? 1.15 : 1.0;
      masterGainRef.current.gain.value = baseVolume * nightBoost;
    }
  }, [isPaused, isGameOver, isMuted, timeOfDay]);

  // Handle district change
  useEffect(() => {
    if (currentDistrictRef.current !== currentDistrict && isInitializedRef.current) {
      currentDistrictRef.current = currentDistrict;
      updateDistrictAudio(currentDistrict);
    }
  }, [currentDistrict, updateDistrictAudio]);

  // Handle rain
  useEffect(() => {
    if (isInitializedRef.current) {
      updateRainSound(isRaining);
    }
  }, [isRaining, updateRainSound]);

  // Initialize on click
  useEffect(() => {
    const handleClick = () => {
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

    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleClick);
    
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleClick);
    };
  }, [initAudio, updateDistrictAudio, updateRainSound, currentDistrict, isRaining]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { initAudio };
}
