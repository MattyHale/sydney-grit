import Entity from "./Entity.js";

export default class NPC extends Entity {
  constructor({ x, y }) {
    super({
      x,
      y,
      width: 30,
      height: 44,
      sprite: { color: "#a78bfa" },
      tags: ["npc"],
    });
  }
}
