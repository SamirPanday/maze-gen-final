const wilson = () => {
  console.log("Wilson's Algorithm started");
  metricsData.startTracking("Wilson's Algorithm");
  timerState.startGen();
  mazeState.generated = false;
  const naming = document.querySelector("#title-Container");
  naming.innerHTML = "Wilson's Algorithm";
  if (currentInterval) clearInterval(currentInterval);
  gridReset();
  pathReset();

  // Mark all cells as NOT in maze
  grid.forEach((cell) => {
    cell.inMaze = false;
    cell.visited = false;
  });

  // Pick a random starting cell
  let first = random(grid);
  first.inMaze = true;
  first.visited = true; // Mark as visited so it shows
  console.log("Initial cell added to maze:", first);

  let unvisited = grid.filter((c) => !c.inMaze);
  let currentWalk = [];
  let walkMap = new Map();

  const getNeighbors = (cell) => {
    const neighbors = [];
    const { i, j } = cell;
    if (i > 0) neighbors.push(grid[index(i - 1, j)]);
    if (i < rows - 1) neighbors.push(grid[index(i + 1, j)]);
    if (j > 0) neighbors.push(grid[index(i, j - 1)]);
    if (j < cols - 1) neighbors.push(grid[index(i, j + 1)]);
    return neighbors;
  };

  const removeWalls = (cellA, cellB) => {
    if (cellA.i > cellB.i) {
      cellA.walls.top = false;
      cellB.walls.bottom = false;
    }
    if (cellA.i < cellB.i) {
      cellA.walls.bottom = false;
      cellB.walls.top = false;
    }
    if (cellA.j > cellB.j) {
      cellA.walls.left = false;
      cellB.walls.right = false;
    }
    if (cellA.j < cellB.j) {
      cellA.walls.right = false;
      cellB.walls.left = false;
    }
  };

  const startNewWalk = () => {
    let startCell = random(unvisited);
    currentWalk = [startCell];
    walkMap.clear();
    walkMap.set(startCell.id, 0);
    path = [startCell]; // Update path to show the walk
    console.log("New random walk started at:", startCell);
  };

  startNewWalk();

  const step = () => {
    if (unvisited.length === 0) {
      clearInterval(currentInterval);
      console.log("Maze generation complete (Wilson)");
      timerState.stopGen();
      mazeState.generated = true;

      // Record Generator Metrics
      const genTime = (performance.now() - timerState.genStart) / 1000;
      const myMetrics = calculateAdvancedMetrics();
      metricsData.recordResult("generator", { time: genTime, ...myMetrics });

      currentCell = null;
      path = []; // Clear the path visualization
      return;
    }

    let current = currentWalk[currentWalk.length - 1];
    currentCell = current; // Update global currentCell for teal highlight

    let next = random(getNeighbors(current));
    console.log(
      `Walking from (${current.i},${current.j}) -> (${next.i},${next.j})`
    );

    // Loop detected → erase
    if (walkMap.has(next.id)) {
      let loopIndex = walkMap.get(next.id);
      console.log("Loop detected, erasing from index:", loopIndex);
      currentWalk = currentWalk.slice(0, loopIndex + 1);
      walkMap.clear();
      currentWalk.forEach((c, i) => walkMap.set(c.id, i));
      path = [...currentWalk]; // Update path to show erased walk
      return;
    }

    currentWalk.push(next);
    walkMap.set(next.id, currentWalk.length - 1);
    path = [...currentWalk]; // Update path to show growing walk

    // Walk hits maze → carve path
    if (next.inMaze) {
      console.log("Walk hit existing maze, carving path");
      for (let i = 0; i < currentWalk.length - 1; i++) {
        let a = currentWalk[i];
        let b = currentWalk[i + 1];
        removeWalls(a, b);
        a.inMaze = true;
        a.visited = true; // Mark as part of maze
        console.log(`Carving: (${a.i},${a.j}) <-> (${b.i},${b.j})`);
      }
      currentWalk[currentWalk.length - 1].inMaze = true;
      currentWalk[currentWalk.length - 1].visited = true;

      unvisited = grid.filter((c) => !c.inMaze);
      console.log("Remaining unvisited cells:", unvisited.length);

      if (unvisited.length > 0) {
        startNewWalk();
      } else {
        path = []; // Clear path when done
      }
    }
  };

  currentInterval = setInterval(step, mazeSpeed);
};
