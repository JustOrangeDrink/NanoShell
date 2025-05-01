class Position {
  constructor(x = 0, y = 0) {
    this.type = "Position";
    this.x = x;
    this.y = y;
  }
}

class Vector {
  constructor(dx = 0, dy = 0) {
    return new Proxy(
      {
        type: "Vector",
        dx: dx,
        dy: dy,
      },
      {
        set: (target, prop, value) => {
          target[prop] = value;
          if (value === 0) return true;
          document.dispatchEvent(new Event("moved"));
          return true;
        },
      }
    );
  }
}

class Render {
  constructor(charX, charY, color) {
    this.type = "Render";
    this.charX = charX;
    this.charY = charY;
    this.color = color;
  }
}

class Collision {
  constructor() {
    this.type = "Collision";
    this.collision = true;
  }
}

class Size {
  constructor(size) {
    this.type = "Size";
    this.size = size;
  }
}

export { Position, Vector, Render, Collision, Size };
