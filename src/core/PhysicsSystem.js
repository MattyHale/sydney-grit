export const checkCollision = (a, b) =>
  a.position.x < b.position.x + b.width &&
  a.position.x + a.width > b.position.x &&
  a.position.y < b.position.y + b.height &&
  a.position.y + a.height > b.position.y;

export default class PhysicsSystem {
  constructor({ friction = 0.88, bounds }) {
    this.friction = friction;
    this.bounds = bounds;
  }

  update(state) {
    for (const entity of state.entities) {
      entity.velocity.x *= this.friction;
      entity.velocity.y *= this.friction;

      entity.position.x += entity.velocity.x * state.delta * 60;
      entity.position.y += entity.velocity.y * state.delta * 60;

      if (this.bounds) {
        if (entity.position.x < this.bounds.left) {
          entity.position.x = this.bounds.left;
          entity.velocity.x = 0;
        }
        if (entity.position.x + entity.width > this.bounds.right) {
          entity.position.x = this.bounds.right - entity.width;
          entity.velocity.x = 0;
        }
        if (entity.position.y < this.bounds.top) {
          entity.position.y = this.bounds.top;
          entity.velocity.y = 0;
        }
        if (entity.position.y + entity.height > this.bounds.bottom) {
          entity.position.y = this.bounds.bottom - entity.height;
          entity.velocity.y = 0;
        }
      }
    }
  }
}
