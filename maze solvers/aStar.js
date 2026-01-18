const aStar = (start = grid[0], end = grid[grid.length - 1]) => {
  console.log("A* Algorithm");
  if (!mazeState.generated || solveState.solving) {
    console.log(" Maze not generated OR solver already running");
    return;
  }

  solverReset();
  metricsData.startTracking("A* Search");
  timerState.startSolve();
  solveState.solving = true;
  solveState.started = true;

  // Heuristic function: Manhattan distance
  const heuristic = (cell, target) => {
    return Math.abs(cell.j - target.j) + Math.abs(cell.i - target.i);
  };

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[index(i, j)].openNeighbors = () => {
        let list = [];

        if (
          !grid[index(i, j)].walls.top &&
          grid[index(i - 1, j)] &&
          !grid[index(i - 1, j)].cellChecked
        )
          list.push(grid[index(i - 1, j)]);

        if (
          !grid[index(i, j)].walls.right &&
          grid[index(i, j + 1)] &&
          !grid[index(i, j + 1)].cellChecked
        )
          list.push(grid[index(i, j + 1)]);

        if (
          !grid[index(i, j)].walls.bottom &&
          grid[index(i + 1, j)] &&
          !grid[index(i + 1, j)].cellChecked
        )
          list.push(grid[index(i + 1, j)]);

        if (
          !grid[index(i, j)].walls.left &&
          grid[index(i, j - 1)] &&
          !grid[index(i, j - 1)].cellChecked
        )
          list.push(grid[index(i, j - 1)]);

        return list;
      };
    }
  }

  // Initialize values
  for (let cell of grid) {
    cell.g = Infinity; // Distance from start
    cell.f = Infinity; // Total estimated cost (f = g + h)
    cell.previous = null;
    cell.cellChecked = false;
  }

  start.g = 0;
  start.f = heuristic(start, end);

  // Use a list explicitly for open set to match typical A* implementation
  let openSet = [start];
  // We can track closed set via cellChecked property

  console.log("Initialized A*");

  solverInterval = setInterval(() => {
    if (openSet.length === 0) {
      console.log("No path exists");
      clearInterval(solverInterval);
      timerState.stopSolve();

      const metrics = calculateMetrics();
      const solveTime = (performance.now() - timerState.solveStart) / 1000;
      metricsData.recordResult("solver", {
        time: solveTime,
        ...metrics,
        pathFound: false,
      });

      solveState.solving = false;
      return;
    }

    // Pick cell with lowest f score
    let currentCell = openSet.reduce((min, cell) =>
      cell.f < min.f ? cell : min,
    );

    if (currentCell === end) {
      console.log("End cell reached!");

      path = [];
      let temp = end;
      while (temp) {
        path.push(temp);
        temp = temp.previous;
      }
      path.reverse();

      clearInterval(solverInterval);
      timerState.stopSolve();

      const metrics = calculateMetrics();
      const solveTime = (performance.now() - timerState.solveStart) / 1000;
      metricsData.recordResult("solver", {
        time: solveTime,
        ...metrics,
      });

      solveState.solving = false;
      return;
    }

    // Remove current from openSet and mark as checked (closed)
    openSet = openSet.filter((cell) => cell !== currentCell);
    currentCell.cellChecked = true;

    // Check neighbors
    let neighbors = currentCell.openNeighbors();

    for (let neighbor of neighbors) {
      // In A*, we usually check if neighbor is in closed set (cellChecked serves this purpose)
      // But openNeighbors() already filters out cellChecked ones in this implementation structure?
      // Wait, openNeighbors() in dijkstra.js filters !cellChecked.
      // If we use standard A*, we might re-evaluate closed nodes if we found a better path,
      // but for a simple grid with uniform cost, we generally don't need to re-open closed nodes.
      // So relying on openNeighbors filtering !cellChecked is fine for this context.

      let tempG = currentCell.g + 1;

      // If this path to neighbor is better than any previous one (or it's new)
      // Note: neighbor.g is initialized to Infinity
      if (tempG < neighbor.g) {
        neighbor.previous = currentCell;
        neighbor.g = tempG;
        neighbor.f = neighbor.g + heuristic(neighbor, end);

        // Add to openSet if not already there
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }, mazeSpeed);
};
