<template>
  <div class="board">
    <!-- Loop through each row of the grid -->
    <div
        v-for="(row, rowIndex) in grid.grid.slice(4)"
        :key="rowIndex"
        class="row"
    >
      <!-- Loop through each cell in the row -->
      <div
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          :class="tileClass(cell)"
      >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Point, Grid} from "@/utils/grid.js";
import {onMounted, onUnmounted, reactive} from "vue";

const directions = {
  "up": new Point(0, -1),
  "down": new Point(0, 1),
  "left": new Point(-1, 0),
  "right": new Point(1, 0),
}

type TetrominoShape = "I"|"L"|"J"|"S"|"Z"|"T"|"O";

class Tetromino {
  public tiles: Point[] = [];
  constructor(public center: Point) {
    this.center = center;
  }
  can_move(distance: Point, grid: Grid): boolean {
    for (const tile of this.tiles) {
      const newTile = tile.move(distance);
      if (!newTile.within(grid) || grid.grid[newTile.y][newTile.x] !== null) {
        return false;
      }
    }
    return true;
  }

  move(horizontally: number, vertically: number): void;
  move(distance: Point): void;
  move(a: number | Point, b?: number) {
    if (typeof a === 'number') {
      a = new Point(a, b!);
    }

    this.center = this.center.move(a);
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

  deepcopy(): Tetromino {
    // Create a new center Point
    const newCenter = new Point(this.center.x, this.center.y);

    // Create the new Tetromino with the new center
    const copy = new Tetromino(newCenter);

    // Deep copy each tile into the copy's tiles array
    copy.tiles = this.tiles.map(
        (tile) => new Point(tile.x, tile.y)
    );

    return copy;
  }
}

function createTetromino(center: Point, shape: TetrominoShape): Tetromino {
  const tetromino = new Tetromino(center);
  switch (shape){
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

const grid = reactive(new Grid(10, 24));
const tetromino = createTetromino(new Point(5, 0), "I");

function renderMove(prev: Tetromino, next: Tetromino, shape: TetrominoShape) {
  for (const tile of prev.tiles) {
    grid.grid[tile.y][tile.x] = null;
  }
  for (const tile of next.tiles) {
    grid.grid[tile.y][tile.x] = shape;
    console.log(tile.x, tile.y, grid.grid[tile.y][tile.x]);
  }
}

function handleKeyDown(event: KeyboardEvent) {
  let before = tetromino.deepcopy();
  switch (event.key) {
    case 'ArrowLeft':
      tetromino.move(directions.left);
      break;
    case 'ArrowRight':
      tetromino.move(directions.right);
      break;
    case 'ArrowUp':
      tetromino.move(directions.up);
      break;
    case 'ArrowDown':
      tetromino.move(directions.down);
      break;
    case 'x':
      // Rotate 90° clockwise (you can choose a different key)
      tetromino.rotate();
      break;
    case 'z':
      // Rotate 90° counter-clockwise with 'z', for example
      tetromino.rotate_back();
      break;
  }
  renderMove(before, tetromino, "I");
}

function tileClass(tile: string | null): string {
  if (tile === null) {
    return 'cell';
  }
  return tile.toLowerCase() + '_block';
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped lang="scss">
$cell-size: 20px;
$cell-gap: 1px;
$board-rows: 20;
$board-cols: 10;

.board {
  display: grid;
  grid-template-rows: repeat($board-rows, $cell-size); /* 20 rows of 20px height each */
  grid-template-columns: repeat($board-cols, $cell-size); /* 10 columns of 20px width each */
  gap: 1px; /* Small gap between cells */
  max-width: 10*$cell-size + 9*$cell-gap;
  background-color: #333;
}

.row {
  display: contents; /* So columns line up in the grid */
}

.cell {
  width: 20px;
  height: 20px;
  background-color: #444; /* Default background */
}

.i_block {
  background-color: #0af; /* Highlight cells occupied by the tetromino */
}

.l_block {
  background-color: #f80;
}

.j_block {
  background-color: #00f;
}

.s_block {
  background-color: #f00;
}

.z_block {
  background-color: #0f0;
}

.t_block {
  background-color: #a0f;
}

.o_block {
  background-color: #ff0;
}
</style>