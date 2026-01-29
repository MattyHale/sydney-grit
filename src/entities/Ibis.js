import Entity from "./Entity.js";

export default class Ibis extends Entity {
  constructor({ x, y }) {
    super({
      x,
      y,
      width: 26,
      height: 20,
      sprite: { color: "#fbbf24" },
      tags: ["animal"],
    });
  }
}
