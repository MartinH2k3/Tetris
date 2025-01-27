<script setup lang="ts">
import {Point, Grid} from "@/utils/grid.js";

class Tetromino {
  public tiles: Point[] = [];
  constructor(public center: Point) {
    this.center = center;
  }
  move(horizontally: number, vertically: number): void;
  move(distance: Point): void;
  move(direction: "up"| "down" | "left" | "right"): void;
  move(a: number | Point, b?: number) {
    if (typeof a === 'number')
      this.tiles = this.tiles.map((point) => point.move(a, b as number));
    else
      this.tiles = this.tiles.map((point) => point.move(a));
  }
  rotate(): void {
    this.tiles = this.tiles.map((point) => {
      const relativeX = point.x - this.center.x;
      const relativeY = point.y - this.center.y;
      return this.center.move(-relativeY, relativeX);
    });
  }
  rotate_back(): void {
    this.tiles = this.tiles.map((point) => {
      const relativeX = point.x - this.center.x;
      const relativeY = point.y - this.center.y;
      return this.center.move(relativeY, -relativeX);
    });
  }
}

function createTetromino(center: Point, type: "I"|"L"|"J"|"S"|"Z"|"T"|"O"): Tetromino {
  const tetromino = new Tetromino(center);
  switch (type){
    case "I":
      tetromino.tiles = [center, center.move(0, -1), center.move(0, 1), center.move(0, 2)];
      break;
    case "L":
      tetromino.tiles = [center, center.move(0, -1), center.move(0, 1), center.move(1, 1)];
      break;
    case "J":
      tetromino.tiles = [center, center.move(0, -1), center.move(0, 1), center.move(-1, 1)];
      break;
    case "S":
      tetromino.tiles = [center, center.move(0, -1), center.move(1, 0), center.move(1, 1)];
      break;
    case "Z":
      tetromino.tiles = [center, center.move(0, -1), center.move(-1, 0), center.move(-1, 1)];
      break;
    case "T":
      tetromino.tiles = [center, center.move(0, -1), center.move(1, 0), center.move(-1, 0)];
      break;
    case "O":
      tetromino.tiles = [center, center.move(0, -1), center.move(1, -1), center.move(1, 0)];
      break;
  }
  return tetromino;
}

directions = {
  "up": new Point(0, -1),
  "down": new Point(0, 1),
  "left": new Point(-1, 0),
  "right": new Point(1, 0),
}

const grid = new Grid(10, 20);
const tetromino = createTetromino(new Point(5, 0), "I");
</script>

<template>

</template>

<style scoped>

</style>