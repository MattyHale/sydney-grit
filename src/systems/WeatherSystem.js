export default class WeatherSystem {
  update(state) {
    if (!state.weather) {
      state.weather = { rain: false, timer: 0 };
    }

    state.weather.timer += state.delta;
    if (state.weather.timer > 12) {
      state.weather.rain = state.nextRandom() > 0.6;
      state.weather.timer = 0;
    }
  }
}
