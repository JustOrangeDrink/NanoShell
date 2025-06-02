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

export { hitAnimation, blockAnimation };
