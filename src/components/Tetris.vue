<script setup lang="ts">
import { Point, Grid } from "@/utils/grid";
import { randomChoice } from "@/utils/vector";
import {onMounted, onUnmounted, reactive, ref} from "vue";

const directions = {
  "up": new Point(0, -1),
  "down": new Point(0, 1),
  "left": new Point(-1, 0),
  "right": new Point(1, 0),
}

type TetrominoShape = "I"|"L"|"J"|"S"|"Z"|"T"|"O";

class Tetromino {
  public tiles: Point[] = [];

  constructor(public center: Point, public shape: TetrominoShape, empty: boolean = false) {
    this.center = center;
    this.shape = shape;
    if (!empty)
      this.createTiles();
  }

  createTiles(): void {
    switch (this.shape){
      case "I":
        this.tiles = [this.center, this.center.move(0, -1), this.center.move(0, 1), this.center.move(0, 2)];
        break;
      case "L":
        this.tiles = [this.center, this.center.move(0, -1), this.center.move(0, 1), this.center.move(1, 1)];
        break;
      case "J":
        this.tiles = [this.center, this.center.move(0, -1), this.center.move(0, 1), this.center.move(-1, 1)];
        break;
      case "S":
        this.tiles = [this.center, this.center.move(0, -1), this.center.move(1, 0), this.center.move(1, 1)];
        break;
      case "Z":
        this.tiles = [this.center, this.center.move(0, -1), this.center.move(-1, 0), this.center.move(-1, 1)];
        break;
      case "T":
        this.tiles = [this.center, this.center.move(0, -1), this.center.move(1, 0), this.center.move(-1, 0)];
        break;
      case "O":
        this.tiles = [this.center, this.center.move(0, -1), this.center.move(1, -1), this.center.move(1, 0)];
        break;
    }
  }

  validMove(distance: Point, grid: Grid): boolean {
    for (const tile of this.tiles) {
      const newTile: Point = tile.move(distance);
      if (!newTile.within(grid) || (grid.grid[newTile.y][newTile.x] !== null && !this.tiles.some((point) => point.equals(newTile)))) {
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
  drop(grid: Grid): void {
    while (this.validMove(directions.down, grid)) {
      this.move(directions.down);
    }
  }

  rotate(): void {
    const before = this.deepcopy();
    this.tiles = this.tiles.map((point) => {
      const relativeX = point.x - this.center.x;
      const relativeY = point.y - this.center.y;
      return this.center.move(-relativeY, relativeX);
    });
    for (const tile of this.tiles) {
      if (!tile.within(grid) || (grid.grid[tile.y][tile.x] !== null && !before.tiles.some((point) => point.equals(tile)))) {
        this.tiles = before.tiles;
        break;
      }
    }
  }
  rotate_back(): void {
    const before = this.deepcopy();
    this.tiles = this.tiles.map((point) => {
      const relativeX = point.x - this.center.x;
      const relativeY = point.y - this.center.y;
      return this.center.move(relativeY, -relativeX);
    });
    for (const tile of this.tiles) {
      if (!tile.within(grid) || (grid.grid[tile.y][tile.x] !== null && !before.tiles.some((point) => point.equals(tile)))) {
        this.tiles = before.tiles;
        break;
      }
    }
  }

  deepcopy(): Tetromino {
    // Create a new center Point
    const newCenter = new Point(this.center.x, this.center.y);

    // Create the new Tetromino with the new center
    const copy = new Tetromino(newCenter, this.shape, true);

    // Deep copy each tile into the copy's tiles array
    copy.tiles = this.tiles.map(
        (tile) => new Point(tile.x, tile.y)
    );

    return copy;
  }
}

function spawnTetromino(): Tetromino {
  const center = new Point(5, 2);
  const shape = randomChoice(["I", "L", "J", "S", "Z", "T", "O"]);
  return new Tetromino(center, shape);
}

const grid = reactive(new Grid(10, 24));
const score = ref(0);

function renderMove(prev: Tetromino, next: Tetromino) {
  for (const tile of prev.tiles) {
    grid.grid[tile.y][tile.x] = null;
  }
  for (const tile of next.tiles) {
    grid.grid[tile.y][tile.x] = next.shape;
  }
}

function cleanRow(row: number): void {
  for (let i = row; i > 0; i--) {
    for (let j = 0; j < grid.width; j++) {
      grid.grid[i][j] = grid.grid[i - 1][j];
    }
  }
  for (let j = 0; j < grid.width; j++) {
    grid.grid[0][j] = null;
  }
}

function checkFullRows(): number {
  let deleted = 0;
  for (let i = 0; i < grid.height; i++) {
    let full = true;
    for (let j = 0; j < grid.width; j++) {
      if (grid.grid[i][j] === null) {
        full = false;
        break;
      }
    }
    if (full) {
      deleted++;
      cleanRow(i);
    }
  }
  switch (deleted){
    case 1:
      return 40;
    case 2:
      return 100;
    case 3:
      return 300;
    case 4:
      return 1200;
    default:
      return 0;
  }
}

let curr_tetromino = spawnTetromino();
function fall(tetromino: Tetromino): void {
  let before = tetromino.deepcopy();
  if (tetromino.validMove(directions.down, grid)) {
    tetromino.move(directions.down);
    renderMove(before, tetromino);
  } else {
    score.value += checkFullRows();
    curr_tetromino = spawnTetromino();
  }
}

function handleKeyDown(event: KeyboardEvent) {
  let before = curr_tetromino.deepcopy();
  switch (event.key) {
    case 'ArrowLeft':
      if (curr_tetromino.validMove(directions.left, grid))
        curr_tetromino.move(directions.left);
      break;
    case 'ArrowRight':
      if (curr_tetromino.validMove(directions.right, grid))
        curr_tetromino.move(directions.right);
      break;
    case 'ArrowUp':
      if (curr_tetromino.validMove(directions.up, grid))
        curr_tetromino.move(directions.up);
      break;
    case 'ArrowDown':
      if (curr_tetromino.validMove(directions.down, grid))
        curr_tetromino.move(directions.down);
      break;
    case 'x':
      // Rotate 90° clockwise (you can choose a different key)
      curr_tetromino.rotate();
      break;
    case 'z':
      // Rotate 90° counter-clockwise with 'z', for example
      curr_tetromino.rotate_back();
      break;
  }
  renderMove(before, curr_tetromino);
}
// style
function tileClass(tile: string | null): string {
  if (tile === null) {
    return 'cell';
  }
  return tile.toLowerCase() + '_block';
}

let intervalId: number | undefined;
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  intervalId = window.setInterval(() => {
    fall(curr_tetromino);
  }, 500);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="board-container">
    <h1> {{ score }} </h1>
    <div class="board">
      <div
          v-for="(row, rowIndex) in grid.grid.slice(4)"
          :key="rowIndex"
          class="row"
      >
        <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            :class="tileClass(cell)"
        >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Doto:wght@311&family=Sixtyfour&display=swap');

$cell-size: 20px;
$cell-gap: 1px;
$board-rows: 20;
$board-cols: 10;

* {
  font-family: 'Doto', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.board-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 10*$cell-size + 9*$cell-gap;
}
.board {
  display: grid;
  grid-template-rows: repeat($board-rows, $cell-size);
  grid-template-columns: repeat($board-cols, $cell-size);
  gap: $cell-gap;
  background-color: #333;
}

.row {
  display: contents; /* So columns line up in the grid */
}

.cell {
  background-color: #444; /* Default background */
}

.block {
  border: 1px solid #222;
}

.i_block {
  @extend .block;
  background-color: #0af; /* Highlight cells occupied by the tetromino */
}

.l_block {
  @extend .block;
  background-color: #f80;
}

.j_block {
  @extend .block;
  background-color: #00f;
}

.s_block {
  @extend .block;
  background-color: #f00;
}

.z_block {
  @extend .block;
  background-color: #0f0;
}

.t_block {
  @extend .block;
  background-color: #a0f;
}

.o_block {
  @extend .block;
  background-color: #ff0;
}
</style>