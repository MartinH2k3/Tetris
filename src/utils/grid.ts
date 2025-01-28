export class Grid {
  public grid: any[][];
  constructor(public width: number, public height: number) {
    this.width = width;
    this.height = height;
    this.grid = Array.from({ length: height }, () => Array(width).fill(null));
  }
  area() {
    return this.width * this.height;
  }
}

export class Point {
  constructor(public x: number, public y: number) {
    this.x = x;
    this.y = y;
  }

  move(horizontally: number, vertically: number): Point;
  move(distance: Point): Point;
  move(a: number | Point, b?: number): Point {
    if (typeof a === 'number')
      return new Point(this.x + a, this.y + (b as number));
    else
      return new Point(this.x + a.x, this.y + a.y);
  }

  within(grid: Grid) {
    return this.x >= 0 && this.x < grid.width && this.y >= 0 && this.y < grid.height;
  }

  equals(point: Point) {
    return this.x === point.x && this.y === point.y;
  }
}
