// Grid Size Options (change cell_size, refresh page):
// cell_size = 120 → 5×5 (Extra Small)
// cell_size = 60 → 10×10 (Small)
// cell_size = 30 → 20×20 (Medium)
// cell_size = 20 → 30×30 (Large)
// cell_size = 15 → 40×40 (Extra Large)
let cell_size = 15;
let mazeSpeed = 50; // Default animation speed
const framewidth = 600;
const frameheight = 600;
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
      mazeSize: `${rows}x${cols}`,
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
    if (result.backtracks !== undefined)
      console.log(`Backtracks: ${result.backtracks}`);
    if (result.deadEnds !== undefined)
      console.log(`Dead Ends: ${result.deadEnds}`);
    if (result.junctions !== undefined)
      console.log(`Junctions: ${result.junctions}`);
    if (result.corridorLength !== undefined)
      console.log(`Avg Corridor Length: ${result.corridorLength.toFixed(2)}`);
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

  // Download as CSV for spreadsheet analysis
  exportAsCSV() {
    if (this.results.length === 0) {
      alert("No metrics data to export. Run some benchmarks first!");
      return;
    }
    const headers = [
      "algorithm",
      "type",
      "timestamp",
      "mazeSize",
      "time",
      "pathLength",
      "backtracks",
      "cellsExplored",
      "totalCells",
      "efficiency",
      "deadEnds",
      "junctions",
      "corridorLength",
      "manhattanEfficiency",
      "pathFound",
    ];
    const rows = this.results.map((r) =>
      headers.map((h) => (r[h] !== undefined ? r[h] : "")).join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    this.downloadFile(csv, "maze_metrics.csv", "text/csv");
    console.log("✅ CSV exported successfully!");
  },

  // Download as JSON for programmatic processing
  exportAsJSON() {
    if (this.results.length === 0) {
      alert("No metrics data to export. Run some benchmarks first!");
      return;
    }
    const json = JSON.stringify(this.results, null, 2);
    this.downloadFile(json, "maze_metrics.json", "application/json");
    console.log("✅ JSON exported successfully!");
  },

  // Generate summary statistics grouped by algorithm
  exportSummaryStats() {
    if (this.results.length === 0) {
      alert("No metrics data to export. Run some benchmarks first!");
      return;
    }

    const grouped = {};
    this.results.forEach((r) => {
      const key = `${r.algorithm} (${r.type})`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });

    const summary = {};
    for (const [algo, data] of Object.entries(grouped)) {
      const times = data.map((d) => d.time).filter((t) => t !== undefined);
      const paths = data
        .map((d) => d.pathLength)
        .filter((p) => p !== undefined);
      const backtracks = data
        .map((d) => d.backtracks)
        .filter((b) => b !== undefined);

      summary[algo] = {
        trials: data.length,
        avgTime:
          times.length > 0
            ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(4)
            : "N/A",
        stdDevTime: times.length > 1 ? this.stdDev(times).toFixed(4) : "N/A",
        avgPathLength:
          paths.length > 0
            ? (paths.reduce((a, b) => a + b, 0) / paths.length).toFixed(1)
            : "N/A",
        avgBacktracks:
          backtracks.length > 0
            ? (
                backtracks.reduce((a, b) => a + b, 0) / backtracks.length
              ).toFixed(1)
            : "N/A",
      };
    }

    console.log("\n📈 SUMMARY STATISTICS:");
    console.table(summary);

    // Also download as CSV
    const headers = [
      "Algorithm",
      "Trials",
      "Avg Time (s)",
      "Std Dev Time",
      "Avg Path Length",
      "Avg Backtracks",
    ];
    const rows = Object.entries(summary).map(([algo, stats]) =>
      [
        algo,
        stats.trials,
        stats.avgTime,
        stats.stdDevTime,
        stats.avgPathLength,
        stats.avgBacktracks,
      ].join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    this.downloadFile(csv, "maze_summary_stats.csv", "text/csv");
    console.log("✅ Summary stats exported!");
  },

  stdDev(arr) {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const squareDiffs = arr.map((v) => Math.pow(v - mean, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / arr.length);
  },

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
  let corridorCells = 0;
  let totalCorridorRuns = 0;

  for (let cell of grid) {
    let wallsCount = 0;
    if (cell.walls.top) wallsCount++;
    if (cell.walls.right) wallsCount++;
    if (cell.walls.bottom) wallsCount++;
    if (cell.walls.left) wallsCount++;

    if (wallsCount === 3) deadEnds++;
    // Junctions: 0 or 1 wall (3 or 4 exits)
    if (wallsCount <= 1) junctions++;

    // Corridor cell: exactly 2 walls forming a straight passage
    if (wallsCount === 2) {
      // Check if opposite walls (forms straight corridor)
      if (
        (cell.walls.top && cell.walls.bottom) ||
        (cell.walls.left && cell.walls.right)
      ) {
        corridorCells++;
      }
    }
  }

  // Estimate average corridor length (straight cells per corridor segment)
  // More corridor cells with fewer junctions = longer corridors
  const corridorBreakers = deadEnds + junctions + 1; // +1 to avoid division by zero
  const corridorLength = corridorCells / corridorBreakers;

  // Manhattan efficiency
  let start = grid[0];
  let end = grid[grid.length - 1];
  let manhattanDist = Math.abs(end.i - start.i) + Math.abs(end.j - start.j);
  let manhattanEfficiency = path.length > 0 ? path.length / manhattanDist : 0;

  return {
    deadEnds,
    junctions,
    corridorLength,
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
    .querySelector(".a-star-btn")
    .addEventListener("click", () => aStar());

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
        this.i * cell_size,
      ); // top
    }
    if (this.walls.right) {
      // stroke('green');
      line(
        this.j * cell_size + cell_size,
        this.i * cell_size,
        this.j * cell_size + cell_size,
        this.i * cell_size + cell_size,
      ); // right
    }
    if (this.walls.bottom) {
      // stroke('blue');
      line(
        this.j * cell_size,
        this.i * cell_size + cell_size,
        this.j * cell_size + cell_size,
        this.i * cell_size + cell_size,
      ); // bottom
    }
    if (this.walls.left) {
      // stroke('yellow');
      line(
        this.j * cell_size,
        this.i * cell_size,
        this.j * cell_size,
        this.i * cell_size + cell_size,
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
