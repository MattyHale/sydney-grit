export default class HUD {
  render(ctx, state, canvas) {
    const { hunger, warmth, hope, money } = state.economy;
    ctx.save();
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(`$${Math.floor(money)}`, 20, 28);

    this.drawBar(ctx, 20, 50, 120, hunger, "Hunger", "#f97316");
    this.drawBar(ctx, 20, 80, 120, warmth, "Warmth", "#38bdf8");
    this.drawBar(ctx, 20, 110, 120, hope, "Hope", "#22c55e");
    ctx.restore();

    ctx.fillStyle = "rgba(15, 23, 42, 0.35)";
    ctx.fillRect(canvas.width - 220, 16, 200, 44);
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText("Drugs", canvas.width - 200, 42);
  }

  drawBar(ctx, x, y, width, value, label, color) {
    ctx.fillStyle = "#334155";
    ctx.fillRect(x, y, width, 10);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, (width * value) / 100, 10);
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(label, x + width + 8, y + 10);
  }
}
