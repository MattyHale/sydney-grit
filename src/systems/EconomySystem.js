export default class EconomySystem {
  update(state) {
    const { hunger, warmth, hope } = state.economy.decay;
    state.economy.hunger = Math.max(0, state.economy.hunger - hunger * state.delta);
    state.economy.warmth = Math.max(0, state.economy.warmth - warmth * state.delta);
    state.economy.hope = Math.max(0, state.economy.hope - hope * state.delta);

    if (state.economy.hope < 20) {
      state.economy.status.add("low-hope");
    } else {
      state.economy.status.delete("low-hope");
    }
  }
}
