function addEventHandler(element, hero) {
  element.addEventListener("keydown", (event) => {
    const vector = hero.getComponent("Vector");
    switch (event.key) {
      case "a":
        vector.dx--;
        break;
      case "d":
        vector.dx++;
        break;
      case "w":
        vector.dy--;
        break;
      case "s":
        vector.dy++;
        break;

      default:
        break;
    }
  });
}

export { addEventHandler };
