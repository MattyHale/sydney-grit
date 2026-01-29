import "@fontsource/press-start-2p";
import GameLoopSystem from "./core/GameLoopSystem.js";
import RenderingSystem from "./core/RenderingSystem.js";
import PhysicsSystem from "./core/PhysicsSystem.js";
import InputSystem from "./core/InputSystem.js";
import AudioSystem from "./core/AudioSystem.js";
import StateManager from "./core/StateManager.js";
import NPCSystem from "./systems/NPCSystem.js";
import CarSystem from "./systems/CarSystem.js";
import AnimalSystem from "./systems/AnimalSystem.js";
import WeatherSystem from "./systems/WeatherSystem.js";
import EventSystem from "./systems/EventSystem.js";
import EconomySystem from "./systems/EconomySystem.js";
import Player from "./entities/Player.js";
import Dog from "./entities/Dog.js";
import NPC from "./entities/NPC.js";
import Car from "./entities/Car.js";
import Ibis from "./entities/Ibis.js";

const canvas = document.querySelector("#game-canvas");
canvas.width = 960;
canvas.height = 540;

const assets = {};
const state = new StateManager();
const renderer = new RenderingSystem({ canvas, assets });
const inputSystem = new InputSystem(window);
const audioSystem = new AudioSystem();

state.popups = [];
state.effects = { lsd: false };

const player = new Player({ x: 120, y: 360 });
const dog = new Dog({ x: 180, y: 390 });
const npc = new NPC({ x: 340, y: 360 });
const car = new Car({ x: 700, y: 420 });
const ibis = new Ibis({ x: 520, y: 390 });

state.addEntity(player);
state.addEntity(dog);
state.addEntity(npc);
state.addEntity(car);
state.addEntity(ibis);

const playerControlSystem = {
  update(currentState) {
    const input = currentState.input;
    const speed = 2.4;
    const isDown = (code) => input.keys.get(code)?.isDown;

    if (isDown("ArrowLeft") || isDown("KeyA")) {
      player.velocity.x = -speed;
    } else if (isDown("ArrowRight") || isDown("KeyD")) {
      player.velocity.x = speed;
    }

    if (isDown("ArrowUp") || isDown("KeyW")) {
      player.velocity.y = -speed;
    } else if (isDown("ArrowDown") || isDown("KeyS")) {
      player.velocity.y = speed;
    }

    if (input.queue.length > 0) {
      const action = input.queue.shift();
      if (["KeyZ", "KeyX", "KeyC"].includes(action.code)) {
        currentState.popups.unshift({ message: `${action.code} ${action.type}` });
        currentState.popups = currentState.popups.slice(0, 3);
      }
    }

    currentState.world.scrollX = Math.min(
      Math.max(0, player.position.x - canvas.width / 2),
      currentState.world.width - canvas.width
    );
  },
};

const systems = [
  inputSystem,
  playerControlSystem,
  new NPCSystem(),
  new AnimalSystem(),
  new CarSystem(),
  new WeatherSystem(),
  new EconomySystem(),
  new EventSystem(),
  new PhysicsSystem({
    bounds: { left: 0, right: state.world.width, top: 280, bottom: 480 },
  }),
  audioSystem,
];

const gameLoop = new GameLoopSystem({ state, systems, renderer });

requestAnimationFrame(() => {
  gameLoop.start();
});
