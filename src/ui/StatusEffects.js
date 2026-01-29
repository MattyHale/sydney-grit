export default class StatusEffects {
  render(ctx, state, canvas) {
    const active = Array.from(state.economy.status || []);
    if (active.length === 0) return;

    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
    ctx.fillRect(canvas.width - 220, 70, 200, 40 + active.length * 16);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.fillText("Status", canvas.width - 200, 90);

    active.forEach((status, index) => {
      ctx.fillText(status, canvas.width - 200, 110 + index * 16);
    });
    ctx.restore();
  }
}
