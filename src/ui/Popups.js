export default class Popups {
  render(ctx, state, canvas) {
    if (!state.popups || state.popups.length === 0) return;
    ctx.save();
    ctx.font = "12px 'Press Start 2P', monospace";
    state.popups.forEach((popup, index) => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
      ctx.fillRect(20, canvas.height - 60 - index * 30, 280, 24);
      ctx.fillStyle = "#f8fafc";
      ctx.fillText(popup.message, 28, canvas.height - 42 - index * 30);
    });
    ctx.restore();
  }
}
