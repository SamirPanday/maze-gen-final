const randomizedPrim = () => {
  console.log("Randomized Prim's Algorithm");
  metricsData.startTracking("Randomized Prim");
  timerState.startGen();

  mazeState.generated = false;
  const naming = document.querySelector("#title-Container");
  naming.innerHTML = "Randomized Prim's Algorithm";
  // stop previous animation if running
  if (currentInterval) clearInterval(currentInterval);
  gridReset();
  pathReset();

  let wallList = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[index(i, j)].frontierWalls = {
        top: { current: grid[index(i, j)], neighbor: grid[index(i - 1, j)] },
        right: { current: grid[index(i, j)], neighbor: grid[index(i, j + 1)] },
        bottom: { current: grid[index(i, j)], neighbor: grid[index(i + 1, j)] },
        left: { current: grid[index(i, j)], neighbor: grid[index(i, j - 1)] },
      };
    }
  }
  // console.log("Grid with frontier walls:", grid);

  currentCell = grid[0];
  currentCell.visited = true;

  const setWallList = (cell) => {
    if (
      cell.frontierWalls.top.neighbor &&
      !cell.frontierWalls.top.neighbor.visited
    ) {
      wallList.push(cell.frontierWalls.top);
    }
    if (
      cell.frontierWalls.right.neighbor &&
      !cell.frontierWalls.right.neighbor.visited
    ) {
      wallList.push(cell.frontierWalls.right);
    }
    if (
      cell.frontierWalls.bottom.neighbor &&
      !cell.frontierWalls.bottom.neighbor.visited
    ) {
      wallList.push(cell.frontierWalls.bottom);
    }
    if (
      cell.frontierWalls.left.neighbor &&
      !cell.frontierWalls.left.neighbor.visited
    ) {
      wallList.push(cell.frontierWalls.left);
    }
  };
  setWallList(currentCell);
  //   console.log("Initial wall list:", wallList);

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

  const step = () => {
    if (wallList.length > 0) {
      //   currentCell.visited = true;
      let randomWall = random(wallList);
      let cellA = randomWall.current;
      let cellB = randomWall.neighbor;
      if (!cellB.visited) {
        removeWalls(cellA, cellB);
        cellB.visited = true;
        currentCell = cellB;
        setWallList(cellB);
      }
      let wallIndex = wallList.indexOf(randomWall);
      wallList.splice(wallIndex, 1);
    } else {
      clearInterval(currentInterval);
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
    // console.log("Current wall list:", wallList);
    // console.log("Current cell:", currentCell);
  };
  currentInterval = setInterval(step, mazeSpeed);
};
