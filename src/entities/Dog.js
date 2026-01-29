import Entity from "./Entity.js";

export default class Dog extends Entity {
  constructor({ x, y }) {
    super({
      x,
      y,
      width: 28,
      height: 20,
      sprite: { color: "#f97316" },
      tags: ["animal"],
    });
  }
}
