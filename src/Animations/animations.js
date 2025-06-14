import { recolorize } from "../utils.js";

function hitAnimation(trgEntity, duration = 150) {
  recolorize(trgEntity, [255, 0, 0, 255], [150, 0, 0, 255]);

  setTimeout(() => {
    recolorize(trgEntity, trgEntity.defaultColor, trgEntity.defaultBg);
  }, duration);
}

function blockAnimation(trgEntity, duration = 150) {
  recolorize(trgEntity, [0, 0, 255, 255], [0, 0, 150, 255]);

  setTimeout(() => {
    recolorize(trgEntity, trgEntity.defaultColor, trgEntity.defaultBg);
  }, duration);
}

function missAnimation(trgEntity, duration = 150) {}

function thronglerShine(trgEntity, interval = 100) {
  const red = [255, 0, 0, 255];
  const green = [0, 255, 0, 255];
  const blue = [0, 0, 255, 255];
  const purple = [255, 0, 255, 255];
  const yellow = [255, 255, 0, 255];
  const cyan = [0, 255, 255, 255];

  const colors = [red, green, blue, yellow, purple, cyan];

  let current = 0;
  const recolorinterval = setInterval(() => {
    if (!trgEntity.id) clearInterval(recolorinterval);
    current = current < colors.length - 1 ? current + 1 : 0;
    recolorize(trgEntity, colors[current], trgEntity.defaultBg);
  }, interval);
}

export { hitAnimation, blockAnimation, missAnimation, thronglerShine };
