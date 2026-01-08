const dijkstra = (start = grid[0], end = grid[grid.length - 1]) => {
  console.log("Dijkstra's Algorithm");
  if (!mazeState.generated || solveState.solving) {
    console.log(" Maze not generated OR solver already running");
    return;
  }

  solverReset();
  metricsData.startTracking("Dijkstra");
  timerState.startSolve();
  solveState.solving = true;

  // console.log("Start cell:", start);
  // console.log("End cell:", end);

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

  // Initialize Dijkstra values
  for (let cell of grid) {
    cell.distance = Infinity;
    cell.previous = null;
    cell.cellChecked = false;
  }

  start.distance = 0;
  let unvisited = [...grid];

  console.log("Initialized all distances to Infinity");
  console.log("Start distance set to 0");

  solverInterval = setInterval(() => {
    // Pick closest unvisited cell
    currentCell = unvisited.reduce((min, cell) =>
      cell.distance < min.distance ? cell : min
    );

    console.log(
      "Current cell:",
      currentCell,
      "Distance:",
      currentCell.distance
    );

    if (currentCell.distance === Infinity) {
      console.log("Remaining nodes unreachable — no path exists");
      clearInterval(solverInterval);
      timerState.stopSolve();

      // Record metrics even for failed attempts
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

    currentCell.cellChecked = true;
    unvisited = unvisited.filter((cell) => cell !== currentCell);

    console.log("Marked cell as visited");

    // End reached
    if (currentCell === end) {
      console.log("End cell reached!");

      path = [];
      let temp = end;
      while (temp) {
        path.push(temp);
        temp = temp.previous;
      }
      path.reverse();

      // console.log(" Shortest path length:", path.length);

      // console.log(" Path:", path);

      clearInterval(solverInterval);
      timerState.stopSolve();

      // Record metrics
      const metrics = calculateMetrics();
      const solveTime = (performance.now() - timerState.solveStart) / 1000;
      metricsData.recordResult("solver", {
        time: solveTime,
        ...metrics,
      });

      solveState.solving = false;

      return;
    }

    // Relax neighbors
    let neighbors = currentCell.openNeighbors();
    console.log("Open neighbors count:", neighbors.length);

    for (let neighbor of neighbors) {
      let alt = currentCell.distance + 1;

      console.log(
        "→ Checking neighbor:",
        neighbor,
        "Current dist:",
        neighbor.distance,
        "New dist:",
        alt
      );

      if (alt < neighbor.distance) {
        neighbor.distance = alt;
        neighbor.previous = currentCell;

        console.log("Updated neighbor distance & previous");
      }
    }
  }, mazeSpeed);
};
