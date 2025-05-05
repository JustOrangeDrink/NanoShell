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
  constructor(smallCollision = false) {
    this.type = "Collision";
    this.collision = true;
    this.smallCollision = smallCollision;
  }
}

class Size {
  constructor(size) {
    this.type = "Size";
    this.size = size;
  }
}

export { Vector, Render, Collision, Size };
