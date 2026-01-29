export default class EventSystem {
  static emit(state, type, payload = {}) {
    state.eventQueue.push({ type, payload });
  }

  static process(state) {
    while (state.eventQueue.length > 0) {
      const event = state.eventQueue.shift();
      this.handleEvent(state, event);
    }
  }

  static handleEvent(state, event) {
    switch (event.type) {
      case "STEAL_ATTEMPT":
        state.economy.money = Math.max(0, state.economy.money - 10);
        break;
      case "BUY_DRUGS":
        state.economy.money -= event.payload.cost ?? 0;
        break;
      case "USE_DRUG":
        state.effects = { ...state.effects, lsd: true };
        break;
      case "LSD_TRIP":
        state.effects = { ...state.effects, lsd: true };
        break;
      case "COP_CHASE":
        state.economy.status.add("police");
        break;
      default:
        break;
    }
  }

  update(state) {
    EventSystem.process(state);
  }
}
