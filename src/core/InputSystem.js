export default class InputSystem {
  constructor(target = window) {
    this.target = target;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.target.addEventListener("keydown", this.onKeyDown);
    this.target.addEventListener("keyup", this.onKeyUp);
  }

  onKeyDown(event) {
    if (event.repeat) return;
    this.dispatch(event.code, "down");
  }

  onKeyUp(event) {
    this.dispatch(event.code, "up");
  }

  dispatch(code, action) {
    const now = performance.now();
    this.lastEvent = { code, action, time: now };
  }

  update(state) {
    const input = state.input;
    if (this.lastEvent) {
      const { code, action, time } = this.lastEvent;
      if (action === "down") {
        input.keys.set(code, { pressedAt: time, isDown: true });
      }
      if (action === "up") {
        const entry = input.keys.get(code);
        const pressedDuration = entry ? time - entry.pressedAt : 0;
        const isLongPress = pressedDuration >= input.longPressThresholdMs;
        input.queue.push({ code, type: isLongPress ? "long" : "tap" });
        input.keys.set(code, { pressedAt: 0, isDown: false });
      }
      this.lastEvent = null;
    }
  }
}
