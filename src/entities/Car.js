import Entity from "./Entity.js";

export default class Car extends Entity {
  constructor({ x, y }) {
    super({
      x,
      y,
      width: 60,
      height: 24,
      sprite: { color: "#f43f5e" },
      tags: ["car"],
    });
  }
}
