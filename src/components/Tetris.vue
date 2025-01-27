<script setup lang="ts">
import {Point} from "@/utils/grid.js";

abstract class Tetromino {
  public tiles: Point[] = [];
  protected constructor(public center: Point) {
    this.center = center;
  }
  move(horizontally: number, vertically: number): void;
  move(distance: Point): void;
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

class LBlock extends Tetromino {
  constructor(public center: Point) {
    super(center);
    // center, upper part of L, lower part of L, right part of L
    this.tiles = [center, center.move(0, -1), center.move(0, 1), center.move(1, 1)];
  }
}

class JBlock extends Tetromino {
  constructor(public center: Point) {
    super(center);
    // center, upper part of J, lower part of J, left part of J
    this.tiles = [center, center.move(0, -1), center.move(0, 1), center.move(-1, 1)];
  }
}

class ZBlock extends Tetromino {
  constructor(public center: Point) {
    super(center);
    // center, upper part of Z, lower part of Z, right part of Z
    this.tiles = [center, center.move(0, -1), center.move(1, 0), center.move(1, 1)];
  }
}

class SBlock extends Tetromino {
  constructor(public center: Point) {
    super(center);
    // center, upper part of S, lower part of S, left part of S
    this.tiles = [center, center.move(0, -1), center.move(-1, 0), center.move(-1, 1)];
  }
}

class TBlock extends Tetromino {
  constructor(public center: Point) {
    super(center);
    // center, upper part of T, lower part of T, right part of T, left part of T
    this.tiles = [center, center.move(0, -1), center.move(0, 1), center.move(1, 0), center.move(-1, 0)];
  }
}

class IBlock extends Tetromino {
  constructor(public center: Point) {
    super(center);
    this.tiles = [center, center.move(0, -1), center.move(0, 1)];
  }
  rotate() {

  }
}

</script>

<template>

</template>

<style scoped>

</style>