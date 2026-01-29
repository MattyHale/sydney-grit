export default class GameLoopSystem {
  constructor({ state, systems, renderer }) {
    this.state = state;
    this.systems = systems;
    this.renderer = renderer;
    this.lastTime = performance.now();
    this.running = false;
  }

  start() {
    this.running = true;
    requestAnimationFrame(this.loop.bind(this));
  }

  stop() {
    this.running = false;
  }

  loop(now) {
    if (!this.running) return;
    const delta = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.state.setDelta(delta);

    for (const system of this.systems) {
      system.update(this.state);
    }

    this.renderer.render(this.state);
    requestAnimationFrame(this.loop.bind(this));
  }
}
