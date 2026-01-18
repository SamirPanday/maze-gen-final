const wallFollower = (start = grid[0], end = grid[grid.length - 1]) => {
  console.log("Wall Follower Solver Algorithm");
  if (!mazeState.generated || solveState.solving) {
    console.log("Maze has not been generated yet/the maze is still solving");
    return;
  }
  solverReset();
  metricsData.startTracking("Wall Follower");
  timerState.startSolve();
  solveState.solving = true;
  solveState.started = true; // Signal that solver has started
  let backtrackCount = 0; // Track backtracks for metrics
  // console.log("Starting Wall Follower Solver from", start, "to", end);

  let currentCell = start;
  let nextCell;

  let facingDirection = "east";
  path.push(currentCell);

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

    if (facingDirection === "east") {
      if (!currentCell.walls.top) {
        nextCell = grid[index(currentCell.i - 1, currentCell.j)];
        if (nextCell) {
          currentCell = nextCell;
        }
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "north";
      } else if (!currentCell.walls.right) {
        nextCell = grid[index(currentCell.i, currentCell.j + 1)];
        if (nextCell) {
          currentCell = nextCell;
        }
        // path.push(currentCell);
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "east";
      } else if (!currentCell.walls.bottom) {
        nextCell = grid[index(currentCell.i + 1, currentCell.j)];
        if (nextCell) {
          currentCell = nextCell;
        }
        // path.push(currentCell);
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "south";
      } else {
        nextCell = grid[index(currentCell.i, currentCell.j - 1)];
        if (nextCell) {
          currentCell = nextCell;
        }
        // path.push(currentCell);
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "west";
      }
    } else if (facingDirection === "north") {
      if (!currentCell.walls.left) {
        nextCell = grid[index(currentCell.i, currentCell.j - 1)];
        if (nextCell) {
          currentCell = nextCell;
        }
        // path.push(currentCell);
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "west";
      } else if (!currentCell.walls.top) {
        nextCell = grid[index(currentCell.i - 1, currentCell.j)];
        if (nextCell) {
          currentCell = nextCell;
        }
        // path.push(currentCell);
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "north";
      } else if (!currentCell.walls.right) {
        nextCell = grid[index(currentCell.i, currentCell.j + 1)];
        if (nextCell) {
          currentCell = nextCell;
        }
        // path.push(currentCell);
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "east";
      } else {
        nextCell = grid[index(currentCell.i + 1, currentCell.j)];
        if (nextCell) {
          currentCell = nextCell;
        }
        // path.push(currentCell);
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "south";
      }
    } else if (facingDirection === "west") {
      if (!currentCell.walls.bottom) {
        nextCell = grid[index(currentCell.i + 1, currentCell.j)];
        if (nextCell) {
          currentCell = nextCell;
        }
        // path.push(currentCell);
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "south";
      } else if (!currentCell.walls.left) {
        nextCell = grid[index(currentCell.i, currentCell.j - 1)];
        if (nextCell) {
          currentCell = nextCell;
        }
        // path.push(currentCell);
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "west";
      } else if (!currentCell.walls.top) {
        nextCell = grid[index(currentCell.i - 1, currentCell.j)];
        if (nextCell) {
          currentCell = nextCell;
        }
        // path.push(currentCell);
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "north";
      } else {
        nextCell = grid[index(currentCell.i, currentCell.j + 1)];
        if (nextCell) {
          currentCell = nextCell;
        }
        // path.push(currentCell);
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "east";
      }
    } else if (facingDirection === "south") {
      if (!currentCell.walls.right) {
        nextCell = grid[index(currentCell.i, currentCell.j + 1)];
        if (nextCell) {
          currentCell = nextCell;
        }
        // path.push(currentCell);
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "east";
      } else if (!currentCell.walls.bottom) {
        nextCell = grid[index(currentCell.i + 1, currentCell.j)];
        if (nextCell) {
          currentCell = nextCell;
        }
        // path.push(currentCell);
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "south";
      } else if (!currentCell.walls.left) {
        nextCell = grid[index(currentCell.i, currentCell.j - 1)];
        if (nextCell) {
          currentCell = nextCell;
        }
        // path.push(currentCell);
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "west";
      } else {
        nextCell = grid[index(currentCell.i - 1, currentCell.j)];
        if (nextCell) {
          currentCell = nextCell;
        }
        // path.push(currentCell);
        if (!currentCell.cellChecked) {
          path.push(currentCell);
        } else {
          path.pop();
        }
        facingDirection = "north";
      }
    }
  };
  solverInterval = setInterval(pathfindingStep, mazeSpeed);
};
