export default class AudioSystem {
  constructor() {
    this.sounds = new Map();
    this.volume = {
      master: 0.7,
      sfx: 0.8,
      ambience: 0.6,
    };
  }

  preload(name, src) {
    const audio = new Audio(src);
    audio.volume = this.volume.master;
    this.sounds.set(name, audio);
  }

  play(name) {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  }

  update() {
    // Placeholder for mixing logic or adaptive effects.
  }
}
