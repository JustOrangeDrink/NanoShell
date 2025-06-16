import { thronglerShine } from "./Animations/animations.js";
import {
  Collision,
  Size,
  Health,
  Turns,
  Damage,
  Alignment,
  Behavior,
  Stats,
  Occlusion,
  CPU,
  Attributes,
  Inventory,
  Pickable,
  Stack,
  WieldSlots,
  Weapon,
  Hidden,
  Shield,
  Armor,
  ArmorSlots,
  Script,
  Encription,
  Crystal,
  EquipEffects,
  Chip,
  ChipSlots,
} from "./Component/components.js";
import { Entity } from "./Entity/entities.js";
import { guardBehavior } from "./System/ai.js";
import { randomTp, strengthBoost } from "./System/effects.js";
import { getRenderName } from "./utils.js";

const tiles = {};

class Tile {
  constructor(
    name,
    singleTitle,
    multipleTitle,
    z,
    charX,
    charY,
    colorArray = [0, 0, 0, 0],
    components,
    bgColorArray = [0, 0, 0, 0],
    animation = false
  ) {
    const [r, g, b, a] = colorArray;
    const [bgR, bgG, bgB, bgA] = bgColorArray;

    this.name = name;
    this.singleTitle = singleTitle;
    this.multipleTitle = multipleTitle;
    this.currentTitle = singleTitle;

    this.z = z;

    this.charX = charX;
    this.charY = charY;
    this.color = [r, g, b, a];
    this.bg = [bgR, bgG, bgB, bgA];
    this.renderName = getRenderName(name, colorArray, bgColorArray);

    this.components = components;

    this.animation = animation;

    tiles[name] = this;
  }

  init(x, y) {
    const entity = new Entity(
      this.name,
      this.singleTitle,
      this.multipleTitle,
      x,
      y,
      this.z,
      this.charX,
      this.charY,
      this.color,
      this.bg,
      this.animation
    );

    if (this.components) {
      for (let i = 0; i < this.components.length; i++) {
        const [component, ...componentArgs] = this.components[i];
        const resultArgs = [];

        for (let k = 0; k < componentArgs.length; k++) {
          const componentArg = componentArgs[k];

          if (Array.isArray(componentArg)) {
            for (let j = 0; j < componentArg.length; j++) {
              if (componentArg[j] == "self") componentArg[j] = entity;
            }
          }
          if (componentArg == "self") resultArgs.push(entity);
          else resultArgs.push(componentArg);
        }

        entity.addComponent(new component(...resultArgs));
      }
    }

    return entity;
  }
}

new Tile(
  "Fist",
  "Fist",
  "Fists",
  0,
  0,
  0,
  [0, 0, 0, 0],
  [[Weapon, 0, 0, 0, "punch"]]
);

new Tile(
  "Player",
  "Player",
  "Players",
  4,
  0,
  4,
  [255, 255, 255, 255],
  [
    [Collision],
    [Health, 30, 30],
    [CPU, 10],
    [Damage, 10],
    [Turns, 1, 1, 0],
    [Alignment, "Good"],
    [Stats, 50, 0, 1],
    [Attributes, 3, 5, 3],
    [Inventory],
    [WieldSlots, 2, tiles.Fist.init()],
    [ArmorSlots, 1],
    [ChipSlots, 2],
  ]
);

new Tile(
  "Guard",
  "Guard",
  "Guards",
  3,
  7,
  4,
  [255, 0, 255, 255],
  [
    [Collision],
    [Health, 15, 15],
    [Damage, 5],
    [Turns, 1, 1, 0],
    [Alignment, "Bad"],
    [Behavior, guardBehavior],
    [Stats, 40, 0, 1],
    [Attributes, 1, 1, 1],
    [WieldSlots, 2, tiles.Fist.init()],
  ]
);

new Tile(
  "Bit",
  "Bit",
  "Bits",
  1,
  13,
  14,
  [255, 255, 0, 255],
  [[Size, "Tiny"], [Pickable], [Stack]]
);

new Tile(
  "ScriptTeleportation",
  "Script of Teleportation",
  "Scripts of Teleportation",
  1,
  5,
  15,
  [225, 175, 100, 255],
  [
    [Size, "Tiny"],
    [Stack],
    [Pickable, "Execute"],
    [Script, [randomTp]],
    [Encription, "Script of |Sfe45g@gkh|", "Scripts of |Sfe45g@gkh|"],
  ]
);

new Tile(
  "ScriptEnemySummon",
  "Script of Enemy Summon",
  "Scripts of Enemy Summon",
  1,
  5,
  15,
  [225, 175, 100, 255],
  [
    [Size, "Tiny"],
    [Stack],
    [Pickable, "Execute"],
    [Script],
    [Encription, "Script of |k39skgsk|", "Scripts of |k39skgsk|"],
  ]
);

new Tile(
  "CrystalStrength",
  "Crystal of Strength",
  "Crystals of Strength",
  1,
  4,
  0,
  [225, 100, 255, 255],
  [
    [Size, "Tiny"],
    [Stack],
    [Pickable, "Drain"],
    [Crystal, [strengthBoost, 6, 10]],
    [Encription, "|Amethyst| Crystal", "|Amethyst| Crystals"],
  ]
);

new Tile("Floor", "Floor", "Floors", 0, 9, 15, [85, 85, 85, 255]);

new Tile(
  "Wall",
  "Wall",
  "Walls",
  2,
  3,
  2,
  [0, 255, 0, 255],
  [[Collision, true, true], [Occlusion]]
);

new Tile(
  "Sword",
  "Sword",
  "Swords",
  1,
  8,
  1,
  [220, 220, 220, 255],
  [
    [Size, "Tiny"],
    [Pickable, "Wield"],
    [Weapon, 5, 10, 1, "slash"],
  ]
);

new Tile(
  "Shield",
  "Shield",
  "Shields",
  1,
  8,
  14,
  [220, 220, 220, 255],
  [
    [Size, "Tiny"],
    [Pickable, "Wield"],
    [Shield, 2, 1],
  ]
);

new Tile(
  "Throngler",
  "Throngler",
  "Thronglers",
  1,
  8,
  1,
  [255, 100, 255, 255],
  [
    [Size, "Tiny"],
    [Pickable, "Wield"],
    [Weapon, 100, 1000, 1, "bonk"],
  ],
  [],
  [thronglerShine]
);

new Tile(
  "Armor",
  "Armor",
  "Armors",
  1,
  14,
  1,
  [220, 220, 220, 255],
  [
    [Size, "Tiny"],
    [Pickable, "Equip"],
    [Armor, 4, 1],
  ]
);

new Tile(
  "ChipVision",
  "Chip of Strength",
  "Chips of Strength",
  1,
  1,
  9,
  [60, 255, 60, 255],
  [
    [Size, "Tiny"],
    [Pickable, "Install"],
    [Chip, 1],
    [Encription, "Chip of |x1x00z|", "Chips of |x1x00z|"],
    [EquipEffects, [strengthBoost, Infinity, 3, "self"]],
  ]
);

new Tile(
  "Filler",
  "Filler",
  "Fillers",
  5,
  11,
  13,
  [255, 0, 0, 255],
  [[Hidden]]
);

export { tiles };
