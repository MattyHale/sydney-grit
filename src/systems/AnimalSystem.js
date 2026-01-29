export default class AnimalSystem {
  update(state) {
    for (const entity of state.entities) {
      if (!entity.tags.has("animal")) continue;
      entity.velocity.x += (state.nextRandom() - 0.5) * 0.3;
    }
  }
}
