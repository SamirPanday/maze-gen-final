const recursiveDFS = (start = grid[0], end = grid[grid.length - 1]) => {
  console.log("Recursive Solver Algorithm");
  if (!mazeState.generated || solveState.solving) {
    console.log("Maze has not been generated yet/ is currently being solved");
    return;
  }
  solverReset();
  metricsData.startTracking("Recursive DFS");
  timerState.startSolve();
  solveState.solving = true;
  solveState.started = true; // Signal that solver has started
  let backtrackCount = 0; // Track backtracks for metrics
  console.log(solveState.solving);
  currentCell = start;
  let nextCell;
  // console.log("Starting recursive solver from", start, "to", end);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[index(i, j)].openNeighbors = () => {
        let openNeighborsList = [];
        if (
          grid[index(i, j)].walls.top === false &&
          grid[index(i - 1, j)] &&
          !grid[index(i - 1, j)].cellChecked
        ) {
          openNeighborsList.push(grid[index(i - 1, j)]);
        }
        if (
          grid[index(i, j)].walls.right === false &&
          grid[index(i, j + 1)] &&
          !grid[index(i, j + 1)].cellChecked
        ) {
          openNeighborsList.push(grid[index(i, j + 1)]);
        }
        if (
          grid[index(i, j)].walls.bottom === false &&
          grid[index(i + 1, j)] &&
          !grid[index(i + 1, j)].cellChecked
        ) {
          openNeighborsList.push(grid[index(i + 1, j)]);
        }
        if (
          grid[index(i, j)].walls.left === false &&
          grid[index(i, j - 1)] &&
          !grid[index(i, j - 1)].cellChecked
        ) {
          openNeighborsList.push(grid[index(i, j - 1)]);
        }
        return openNeighborsList;
      };
    }
  }
  //   console.log(currentCell.openNeighbors());

  const pathfindingStep = () => {
    currentCell.cellChecked = true;

    if (currentCell === end) {
      path.push(currentCell);
      currentCell = null;
      console.log("Path found!");
      clearInterval(solverInterval);
      // console.log("Path:", path);
      timerState.stopSolve();

      // Record metrics
      const metrics = calculateMetrics();
      const solveTime = (performance.now() - timerState.solveStart) / 1000;
      metricsData.recordResult("solver", {
        time: solveTime,
        backtracks: backtrackCount,
        ...metrics,
      });

      solveState.solving = false;
      return;
    }

    let neighbors = currentCell.openNeighbors();
    if (neighbors.length > 0) {
      path.push(currentCell);
      nextCell = random(neighbors);
      currentCell = nextCell;
    } else {
      if (path.length > 0) {
        currentCell = path.pop();
        backtrackCount++; // Count each backtrack
      } else {
        console.log("No path found!");
        clearInterval(solverInterval);
        timerState.stopSolve();

        // Record metrics
        const metrics = calculateMetrics();
        const solveTime = (performance.now() - timerState.solveStart) / 1000;
        metricsData.recordResult("solver", {
          time: solveTime,
          backtracks: backtrackCount,
          ...metrics,
          pathFound: false,
        });

        solveState.solving = false;
        return;
      }
    }
  };
  solverInterval = setInterval(pathfindingStep, mazeSpeed);
};
