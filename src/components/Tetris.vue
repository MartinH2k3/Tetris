<script setup lang="ts">
import { Point, Grid } from "@/utils/grid";
import { randomChoice } from "@/utils/array_helpers";
import {computed, onMounted, onUnmounted, reactive, Ref, ref} from "vue";

const AUTOPLAY = true;
const DIRECTIONS = {
  "UP": new Point(0, -1),
  "DOWN": new Point(0, 1),
  "LEFT": new Point(-1, 0),
  "RIGHT": new Point(1, 0),
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

  validPosition(grid: Grid): boolean {
    for (const tile of this.tiles) {
      if (!tile.within(grid) || grid.grid[tile.y][tile.x] !== null) {
        return false;
      }
    }
    return true;
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
    while (this.validMove(DIRECTIONS.DOWN, grid)) {
      this.move(DIRECTIONS.DOWN);
    }
  }

  rotate(grid: Grid): void {
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
  rotateBack(grid: Grid): void {
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

  changeShape(shape: TetrominoShape, grid: Grid) {
    if (shape === this.shape) {
      return;
    }
    const before = this.deepcopy();
    this.shape = shape;
    this.createTiles();
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

  aboveLine(y: number): boolean {
    for (const tile of this.tiles) {
      if (tile.y < y) {
        return true;
      }
    }
    return false;
  }

  remove(grid: Grid) {
    for (const tile of this.tiles) {
      grid.grid[tile.y][tile.x] = null;
    }
  }

  addTo(grid: Grid) {
    for (const tile of this.tiles) {
      grid.grid[tile.y][tile.x] = this.shape;
    }
  }
}

function spawnTetromino(shape: TetrominoShape|null = null): Tetromino {
  const center = new Point(5, 2);
  if (shape === null)
    shape = randomChoice(["I", "L", "J", "S", "Z", "T", "O"]);
  return new Tetromino(center, shape!);
}

const bufferHeight = 4;
const grid = reactive(new Grid(10, 20+bufferHeight));
const score = ref(0);
const lost = ref(false);

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

let currTetromino = spawnTetromino();
let nextShape: Ref<TetrominoShape> = ref(randomChoice(["I", "L", "J", "S", "Z", "T", "O"]));
let heldShape: Ref<TetrominoShape | null> = ref(null);
let switched = false;

function handleKeyDown(event: KeyboardEvent) {
  let before = currTetromino.deepcopy();
  switch (event.key) {
    case 'ArrowLeft':
      if (currTetromino.validMove(DIRECTIONS.LEFT, grid))
        currTetromino.move(DIRECTIONS.LEFT);
      break;
    case 'ArrowRight':
      if (currTetromino.validMove(DIRECTIONS.RIGHT, grid))
        currTetromino.move(DIRECTIONS.RIGHT);
      break;
    case 'ArrowUp':
      if (switched)
        break;
      console.log('switching')
      let temp = currTetromino.shape;
      switched = true;
      if (heldShape.value === null) {
        heldShape.value = nextShape.value;
        nextShape.value = randomChoice(["I", "L", "J", "S", "Z", "T", "O"]);
      }
      currTetromino = spawnTetromino(heldShape.value);
      heldShape.value = temp;
      break;
    case 'ArrowDown':
      if (currTetromino.validMove(DIRECTIONS.DOWN, grid))
        currTetromino.move(DIRECTIONS.DOWN);
      break;
    case 'x':
      // Rotate 90° clockwise (you can choose a different key)
      currTetromino.rotate(grid);
      break;
    case 'z':
      // Rotate 90° counter-clockwise with 'z', for example
      currTetromino.rotateBack(grid);
      break;
    case 'c':
      currTetromino.drop(grid);
      break;
    case 'v':
      Solver.playBestMoves(grid, currTetromino);
      break;
  }
  renderMove(before, currTetromino);
}

function restartGame(){
  grid.clear();
  score.value = 0;
  lost.value = false;
  currTetromino = spawnTetromino();
  nextShape.value = randomChoice(["I", "L", "J", "S", "Z", "T", "O"]);
  heldShape.value = null;
  switched = false;
  intervalId = window.setInterval(() => {
    fall(currTetromino);
  }, 500);
}

function fall(tetromino: Tetromino): void {
  let before = tetromino.deepcopy();
  if (tetromino.validMove(DIRECTIONS.DOWN, grid)) {
    tetromino.move(DIRECTIONS.DOWN);
    renderMove(before, tetromino);
  } else if (tetromino.aboveLine(bufferHeight)) {
    lost.value = true;
    clearInterval(intervalId);
  }
  else {
    console.log(Solver.evaluateGrid(grid));
    score.value += checkFullRows();
    currTetromino = spawnTetromino(nextShape.value);
    console.log(Solver.bestMoves(grid, currTetromino))
    nextShape.value = randomChoice(["I", "L", "J", "S", "Z", "T", "O"]);
    switched = false;
  }
}

// held tetromino
const tetrominoPositions: Record<TetrominoShape, Array<{ x: number; y: number }>> = {
  I: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
  J: [{ x: 2, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
  L: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
  O: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
  S: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  T: [{ x: 1, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
  Z: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
};
const heldShapeCells = computed(() => {
  if (!heldShape.value) return [];
  return tetrominoPositions[heldShape.value!];
});

const nextShapeCells = computed(() => {
  return tetrominoPositions[nextShape.value];
});

// style
function tileClass(tile: string | null): string {
  if (tile === null) {
    return 'cell';
  }
  return tile.toLowerCase() + '_block';
}

function isHeldCell(row: number, col: number): boolean {
  return heldShapeCells.value.some(cell => cell.x === col && cell.y === row);
}

function isNextCell(row: number, col: number): boolean {
  return nextShapeCells.value.some(cell => cell.x === col && cell.y === row);
}

// Solver
class Solver {
  static evaluateGrid(grid: Grid): number {
    let holes = 0;
    let column_heights = Array(grid.width).fill(0);
    let clearedRows = 0;
    for (let i = 0; i < grid.height; i++) {
      let row = grid.grid[i];
      let rowFilled = true;
      for (let j = 0; j < grid.width; j++) {
        if (row[j] === null) {
          rowFilled = false;
          if (column_heights[j] > 0) {
            holes++;
          }
        } else if (column_heights[j] === 0) {
          column_heights[j] = grid.height - i;
        }
      }
      if (rowFilled) {
        clearedRows++;
      }
    }
    let height = Math.max(...column_heights) - clearedRows;
    let bumpiness = column_heights.slice(1).reduce((a, b, i) => a + Math.abs(b - column_heights[i]), 0);
    // find some "hyperparameters" for the best evaluatvion function
    let weights = [10, 3, 2, 1];
    return holes * weights[0] + height * weights[1] + bumpiness * weights[2] - Math.pow(2, clearedRows) * weights[3];
  }
  static bestMoves(grid: Grid, tetromino: Tetromino) {
    let bestScore = Infinity;
    let bestSequence = '';
    for (let rotations = 0; rotations < 4; rotations++){
      let rotated = tetromino.deepcopy();
      for (let i = 0; i < rotations; i++){
        rotated.rotate(grid);
      }
      let offset = 0;
      while (rotated.validMove(DIRECTIONS.LEFT, grid)){
        rotated.move(DIRECTIONS.LEFT);
        offset++;
      }
      do {
        // copies to not modify the original grid and tetromino
        let gridCopy = grid.deepcopy();
        let tetrominoCopy = rotated.deepcopy();
        // check what happens if tetromino falls directly down
        tetrominoCopy.drop(gridCopy);
        tetrominoCopy.addTo(gridCopy);
        let score = this.evaluateGrid(gridCopy);

        if (score < bestScore){
          bestScore = score;
          bestSequence = 'x'.repeat(rotations) + (offset >= 0 ? '<'.repeat(offset) : '>'.repeat(-offset));
        }
        rotated.move(DIRECTIONS.RIGHT);
        offset--;
      } while (rotated.validPosition(grid));
    }
    return bestSequence;
  }
  static playBestMoves(grid: Grid, tetromino: Tetromino) {
    let bestSequence = this.bestMoves(grid, tetromino);
    while (bestSequence.length > 0){
      for (let move of bestSequence) {
        switch (move) {
          case 'x':
            tetromino.rotate(grid);
            break;
          case '<':
            tetromino.move(DIRECTIONS.LEFT);
            break;
          case '>':
            tetromino.move(DIRECTIONS.RIGHT);
            break;
        }
      }
      bestSequence = this.bestMoves(grid, tetromino);
    }
    tetromino.drop(grid);
    tetromino.addTo(grid);
  }
}

// event listeners
let intervalId: number | undefined;
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  intervalId = window.setInterval(() => {
    fall(currTetromino);
  }, 500);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="main-container">
    <div class="side-container">
      <h3 class="side-title">Held</h3>
      <div class="side-grid">
        <div
            v-for="(row, rowIndex) in 4"
            :key="rowIndex"
            class="side-grid-row"
        >
          <div
              v-for="(col, colIndex) in 4"
              :key="colIndex"
              class="side-grid-cell"
          >
            <div
                v-if="isHeldCell(rowIndex, colIndex)"
                class="side-grid-tetromino"
                :class="`${heldShape?.toLowerCase()}_block`"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <div class="board-container">
      <h1> SCORE: {{ score }} </h1>
      <div class="board">
        <div
            v-for="(row, rowIndex) in grid.grid.slice(bufferHeight)"
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
    <div class="side-container">
      <h3 class="side-title">Next</h3>
      <div class="side-grid">
        <div
            v-for="(row, rowIndex) in 4"
            :key="rowIndex"
            class="side-grid-row"
        >
          <div
              v-for="(col, colIndex) in 4"
              :key="colIndex"
              class="side-grid-cell"
          >
            <div
                v-if="isNextCell(rowIndex, colIndex)"
                class="side-grid-tetromino"
                :class="`${nextShape.toLowerCase()}_block`"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="lost" class="game-over-overlay">
      <div class="game-over-content">
        <h2>Game Over</h2>
        <button @click="restartGame">Restart</button>
      </div>
    </div>
  </div>

</template>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Sixtyfour&display=swap');

$container-gap: 36px;
$text-color: #000;
$inverse-text-color: #fff;
$cell-size: 20px;
$cell-gap: 1px;
$board-rows: 20;
$board-cols: 10;
$cell-color: #444;
$cell-background: #333;
$side-grid-margin: 60px;

* {
  font-family: 'Share Tech Mono', monospace;
  color: $text-color;
}

.main-container {
  position: relative;
  padding: $container-gap;
  display: flex;
  justify-content: center;
  gap: $container-gap;
  width: fit-content;
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
  background-color: $cell-background;
}

.row {
  display: contents; /* So columns line up in the grid */
}

.cell {
  background-color: $cell-color; /* Default background */
}

.block {
  border: 1px solid #222;
}

.side-container {
  margin-top: $side-grid-margin;
  text-align: center;
}

.side-grid {
  display: grid;
  grid-template-rows: repeat(4, $cell-size); /* 4 rows */
  grid-template-columns: repeat(4, $cell-size); /* 4 columns */
  gap: $cell-gap;
  background-color: $cell-background;
  justify-content: center;
  border: 1px solid $cell-color;
}

.side-grid-row {
  /* So even empty cell displays */
  display: contents;
}

.side-grid-cell {
  background-color: $cell-color;
  position: relative;
}

.side-grid-tetromino {
  /* So even empty cell displays */
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

/* Game over overlay */
.game-over-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.game-over-content {
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);

  h2 {
    color: $inverse-text-color;
    cursor: default;
  }
  button {
    color: $text-color;
    background-color: $inverse-text-color;
    border: none;
    padding: 2px 5px;
    border-radius: 3px;
    cursor: pointer;
  }
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