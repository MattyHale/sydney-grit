export default class NPCSystem {
  update(state) {
    for (const entity of state.entities) {
      if (!entity.tags.has("npc")) continue;
      if (Math.random() < 0.01) {
        entity.velocity.x += (Math.random() - 0.5) * 0.8;
      }
    }
  }
}
