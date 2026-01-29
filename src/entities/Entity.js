export default class Entity {
  constructor({ x = 0, y = 0, width = 32, height = 32, sprite = null, tags = [] } = {}) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.sprite = sprite;
    this.width = width;
    this.height = height;
    this.state = "idle";
    this.tags = new Set(tags);
  }
}
