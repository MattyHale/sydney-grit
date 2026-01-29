import Entity from "./Entity.js";

export default class Player extends Entity {
  constructor({ x, y }) {
    super({
      x,
      y,
      width: 32,
      height: 48,
      sprite: { color: "#38bdf8" },
      tags: ["player"],
    });
  }
}
