export default class CarSystem {
  update(state) {
    for (const entity of state.entities) {
      if (!entity.tags.has("car")) continue;
      entity.velocity.x = -2.5;
      if (entity.position.x < -200) {
        entity.position.x = state.world.width + 200;
      }
    }
  }
}
