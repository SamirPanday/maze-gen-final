const recursiveBacktracking = () => {
  console.log("Recursive Backtracking Algorithm");
  metricsData.startTracking("Recursive Backtracking");
  timerState.startGen();
  mazeState.generated = false;
  const naming = document.querySelector("#title-Container");
  naming.innerHTML = "Recursive Backtracking Algorithm";
  // stop previous animation if running
  if (currentInterval) clearInterval(currentInterval);
  gridReset();
  pathReset();

  let previousCells = [];
  currentCell = grid[0];
  // console.log(currentCell);

  const step = () => {
    currentCell.visited = true;
    let neighbors = currentCell.neighbors();
    // console.log("the neighbors are:", neighbors);
    if (neighbors.length > 0) {
      let nextCell = random(neighbors);
      removeWalls(currentCell, nextCell);
      previousCells.push(currentCell);
      currentCell = nextCell;
    } else {
      if (previousCells.length > 0) {
        currentCell = previousCells.pop();
      } else {
        clearInterval(currentInterval); // Stop the interval when done
        console.log("Maze generation complete");
        // console.log("Final grid:", grid);
        timerState.stopGen();
        mazeState.generated = true;

        // Record Generator Metrics
        const genTime = (performance.now() - timerState.genStart) / 1000;
        const myMetrics = calculateAdvancedMetrics();
        metricsData.recordResult("generator", { time: genTime, ...myMetrics });

        return;
      }
    }
  };
  currentInterval = setInterval(step, mazeSpeed);

  const removeWalls = (current, next) => {
    if (current.i > next.i) {
      current.walls.top = false;
      next.walls.bottom = false;
    }
    if (current.i < next.i) {
      current.walls.bottom = false;
      next.walls.top = false;
    }
    if (current.j > next.j) {
      current.walls.left = false;
      next.walls.right = false;
    }
    if (current.j < next.j) {
      current.walls.right = false;
      next.walls.left = false;
    }
  };
};
