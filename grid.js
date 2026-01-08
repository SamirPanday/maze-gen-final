let cell_size = 25;
let mazeSpeed = 50; // Default animation speed
const framewidth = 500;
const frameheight = 500;
const rows = Math.floor(frameheight / cell_size);
const cols = Math.floor(framewidth / cell_size);
let grid = [];
let currentCell;
let currentInterval = null;
let solverInterval = null;
let path = [];

window.mazeState = {
  generated: false,
};
window.solveState = {
  solving: false,
};

// Metrics tracking for comparative study
window.metricsData = {
  currentAlgorithm: "",
  results: [],

  startTracking(algorithmName) {
    this.currentAlgorithm = algorithmName;
  },

  recordResult(type, data) {
    const result = {
      algorithm: this.currentAlgorithm,
      type: type, // 'generator' or 'solver'
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.results.push(result);
    console.log("📊 Metrics Recorded:", result);
    this.displayLastResult(result);
  },

  displayLastResult(result) {
    console.log("\n========== ALGORITHM METRICS ==========");
    console.log(`Algorithm: ${result.algorithm}`);
    console.log(`Type: ${result.type}`);
    if (result.time) console.log(`Time: ${result.time.toFixed(3)} seconds`);
    if (result.pathLength)
      console.log(`Path Length: ${result.pathLength} cells`);
    if (result.deadEnds !== undefined)
      console.log(`Dead Ends: ${result.deadEnds}`);
    if (result.junctions !== undefined)
      console.log(`Junctions: ${result.junctions}`);
    if (result.manhattanEfficiency !== undefined)
      console.log(`Manhattan Eff.: ${result.manhattanEfficiency.toFixed(2)}x`);
    if (result.cellsExplored)
      console.log(`Cells Explored: ${result.cellsExplored} cells`);
    if (result.efficiency)
      console.log(`Efficiency: ${result.efficiency.toFixed(2)}%`);
    if (result.totalCells) console.log(`Total Cells: ${result.totalCells}`);
    console.log("=======================================\n");
  },

  exportForReport() {
    console.log("\n📋 COMPARATIVE STUDY DATA FOR REPORT:");
    console.log(JSON.stringify(this.results, null, 2));
    console.table(this.results);
    return this.results;
  },

  clear() {
    this.results = [];
    console.log("✓ Metrics data cleared");
  },
};
function solverReset() {
  path = [];

  for (let i = 0; i < grid.length; i++) {
    grid[i].cellChecked = false;
    grid[i].visited = false;
  }
}

function gridReset() {
  grid = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid.push(new cell(i, j));
    }
  }
}

function pathReset() {
  path = [];
}

// Calculate metrics for comparative study
function calculateMetrics() {
  const pathLength = path.length;
  const cellsExplored = grid.filter((cell) => cell.cellChecked).length;
  const totalCells = grid.length;
  const efficiency = cellsExplored > 0 ? (pathLength / cellsExplored) * 100 : 0;

  return {
    pathLength,
    cellsExplored,
    totalCells,
    efficiency,
    ...calculateAdvancedMetrics(),
  };
}

function calculateAdvancedMetrics() {
  let deadEnds = 0;
  let junctions = 0;

  for (let cell of grid) {
    let wallsCount = 0;
    if (cell.walls.top) wallsCount++;
    if (cell.walls.right) wallsCount++;
    if (cell.walls.bottom) wallsCount++;
    if (cell.walls.left) wallsCount++;

    if (wallsCount === 3) deadEnds++;
    // Junctions: 0 or 1 wall (3 or 4 exits)
    if (wallsCount <= 1) junctions++;
  }

  // Manhattan efficiency
  let start = grid[0];
  let end = grid[grid.length - 1];
  let manhattanDist = Math.abs(end.i - start.i) + Math.abs(end.j - start.j);
  let manhattanEfficiency = path.length > 0 ? path.length / manhattanDist : 0;

  return {
    deadEnds,
    junctions,
    manhattanEfficiency,
  };
}

function setup() {
  frameRate(60);
  let cnv = createCanvas(framewidth, frameheight);
  cnv.parent("canvas-container");

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid.push(new cell(i, j));
    }
  }

  document
    .querySelector(".recursive-btn")
    .addEventListener("click", recursiveBacktracking);

  document
    .querySelector(".kruskal-btn")
    .addEventListener("click", randomizedKruskal);

  document.querySelector(".prim-btn").addEventListener("click", randomizedPrim);

  document.querySelector(".eller-btn").addEventListener("click", eller);
  document
    .querySelector(".recursive-solver-btn")
    .addEventListener("click", () => recursiveDFS());
  document
    .querySelector(".wall-follower-btn")
    .addEventListener("click", () => wallFollower());

  document
    .querySelector(".dijkstra-btn")
    .addEventListener("click", () => dijkstra());

  document
    .querySelector(".wilson-btn")
    .addEventListener("click", () => wilson());
}

function draw() {
  // background("white");
  background("black");
  for (let i = 0; i < grid.length; i++) {
    grid[i].show();
  }
  // filling the color for the path
  for (let i = 0; i < path.length; i++) {
    let x = path[i].j * cell_size;
    let y = path[i].i * cell_size;
    noStroke();
    fill(104, 231, 255, 90);
    // fill("white");
    rect(x, y, cell_size, cell_size);
  }
}

function index(i, j) {
  if (i < 0 || j < 0 || i > rows - 1 || j > cols - 1) {
    return -1;
  }
  return i * cols + j;
}

function cell(i, j) {
  this.id = i * cols + j; // unique identifier for each cell
  this.i = i; // y-coordinate (row)
  this.j = j; // x-coordinate (column)
  this.walls = { top: true, right: true, bottom: true, left: true };
  this.visited = false;
  this.cellChecked = false;
  this.centre = {
    x: this.j * cell_size + cell_size / 2,
    y: this.i * cell_size + cell_size / 2,
  };

  this.show = () => {
    // stroke("black");
    stroke("white");
    strokeWeight(2);
    if (this.walls.top) {
      // stroke('red');
      line(
        this.j * cell_size,
        this.i * cell_size,
        this.j * cell_size + cell_size,
        this.i * cell_size
      ); // top
    }
    if (this.walls.right) {
      // stroke('green');
      line(
        this.j * cell_size + cell_size,
        this.i * cell_size,
        this.j * cell_size + cell_size,
        this.i * cell_size + cell_size
      ); // right
    }
    if (this.walls.bottom) {
      // stroke('blue');
      line(
        this.j * cell_size,
        this.i * cell_size + cell_size,
        this.j * cell_size + cell_size,
        this.i * cell_size + cell_size
      ); // bottom
    }
    if (this.walls.left) {
      // stroke('yellow');
      line(
        this.j * cell_size,
        this.i * cell_size,
        this.j * cell_size,
        this.i * cell_size + cell_size
      ); // left
    }

    // if (this.visited) {
    //   noStroke();
    //   fill(129, 197, 200);
    //   rect(this.j * cell_size, this.i * cell_size, cell_size, cell_size);
    // }

    // Visualize cells checked by solver algorithms
    if (this.cellChecked) {
      noStroke();
      fill(129, 197, 200, 100);
      rect(this.j * cell_size, this.i * cell_size, cell_size, cell_size);
    }

    if (this === currentCell) {
      let x = this.j * cell_size;
      let y = this.i * cell_size;
      noStroke();
      fill("teal");
      rect(x, y, cell_size, cell_size);
    }
  };

  this.neighbors = () => {
    let neighbors = [];
    let top = grid[index(i - 1, j)];
    let right = grid[index(i, j + 1)];
    let bottom = grid[index(i + 1, j)];
    let left = grid[index(i, j - 1)];

    if (top && !top.visited) {
      neighbors.push(top);
    }
    if (right && !right.visited) {
      neighbors.push(right);
    }
    if (bottom && !bottom.visited) {
      neighbors.push(bottom);
    }
    if (left && !left.visited) {
      neighbors.push(left);
    }

    return neighbors;
  };
}
