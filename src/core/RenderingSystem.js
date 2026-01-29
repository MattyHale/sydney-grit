import HUD from "../ui/HUD.js";
import StatusEffects from "../ui/StatusEffects.js";
import Popups from "../ui/Popups.js";

export default class RenderingSystem {
  constructor({ canvas, assets }) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.assets = assets;
    this.hud = new HUD();
    this.statusEffects = new StatusEffects();
    this.popups = new Popups();
    this.layerOrder = ["background", "midground", "action", "ui", "overlay"];
  }

  render(state) {
    const ctx = this.context;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const layers = {
      background: () => this.drawBackground(state),
      midground: () => this.drawMidground(state),
      action: () => this.drawEntities(state),
      ui: () => this.drawUI(state),
      overlay: () => this.drawOverlay(state),
    };

    for (const layer of this.layerOrder) {
      layers[layer]();
    }
  }

  drawBackground(state) {
    const ctx = this.context;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const district = state.districts[state.world.districtIndex];
    if (district?.visualTint) {
      ctx.fillStyle = district.visualTint;
      ctx.globalAlpha = 0.15;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, this.canvas.height - 220, this.canvas.width, 220);

    this.drawLandmark("Sydney Harbour Bridge", 120, this.canvas.height - 240, "#334155");
    this.drawLandmark("Opera House", 520, this.canvas.height - 230, "#475569");
  }

  drawMidground(state) {
    const ctx = this.context;
    ctx.fillStyle = "#1f2937";
    for (let i = 0; i < 6; i += 1) {
      const x = (i * 180 - state.world.scrollX * 0.4) % this.canvas.width;
      ctx.fillRect(x, this.canvas.height - 180, 120, 160);
    }
  }

  drawEntities(state) {
    const ctx = this.context;
    const viewLeft = state.world.scrollX - 50;
    const viewRight = state.world.scrollX + this.canvas.width + 50;

    for (const entity of state.entities) {
      if (entity.position.x + entity.width < viewLeft || entity.position.x > viewRight) {
        continue;
      }
      ctx.fillStyle = entity.sprite?.color || "#f8fafc";
      ctx.fillRect(
        entity.position.x - state.world.scrollX,
        entity.position.y,
        entity.width,
        entity.height
      );
    }
  }

  drawUI(state) {
    this.hud.render(this.context, state, this.canvas);
    this.statusEffects.render(this.context, state, this.canvas);
    this.popups.render(this.context, state, this.canvas);
  }

  drawOverlay(state) {
    const ctx = this.context;
    if (state.weather?.rain) {
      ctx.fillStyle = "rgba(148, 163, 184, 0.2)";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (state.effects?.lsd) {
      ctx.fillStyle = "rgba(236, 72, 153, 0.15)";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  drawLandmark(label, x, y, color) {
    const ctx = this.context;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 160, 80);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillText(label, x + 6, y + 45);
  }
}
