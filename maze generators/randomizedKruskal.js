const randomizedKruskal = () => {
  console.log("Randomized Kruskal's Algorithm");
  metricsData.startTracking("Randomized Kruskal");
  timerState.startGen();
  mazeState.generated = false;
  const naming = document.querySelector("#title-Container");
  naming.innerHTML = "Randomized Kruskal's Algorithm";
  // stop previous animation if running
  if (currentInterval) clearInterval(currentInterval);
  gridReset();
  pathReset();

  let wallList = [];
  let distinctGroups = rows * cols; // Initialize distinct groups count

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[index(i, j)].groupId = grid[index(i, j)].id; // Each cell starts in its own group
    }
  }
  // console.log("Grid with groupID:", grid);

  const loadWallList = () => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let current = grid[index(i, j)];

        // Right neighbor exists?
        if (j < cols - 1) {
          wallList.push({
            current: current,
            neighbor: grid[index(i, j + 1)],
          });
        }

        // Bottom neighbor exists?
        if (i < rows - 1) {
          wallList.push({
            current: current,
            neighbor: grid[index(i + 1, j)],
          });
        }
      }
    }
  };
  loadWallList();
  // console.log("list of walls: ", wallList);

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

  const isSameGroup = (cellA, cellB) => {
    return cellA.groupId === cellB.groupId;
  };

  const union = (cellA, cellB) => {
    if (cellA.groupId !== cellB.groupId) {
      let oldGroupId = cellB.groupId;
      let newGroupId = cellA.groupId;
      for (let k = 0; k < grid.length; k++) {
        if (grid[k].groupId === oldGroupId) {
          grid[k].groupId = newGroupId;
        }
      }
      distinctGroups--; // Decrement distinct groups count on successful union
    } else {
      return;
    }
  };

  const step = () => {
    if (wallList.length > 0 && distinctGroups > 1) {
      // Check for wall list AND incomplete connectivity
      let randomWall = random(wallList);
      let cellA = randomWall.current;
      let cellB = randomWall.neighbor;
      currentCell = cellA;
      cellA.visited = true;
      cellB.visited = true;

      if (!isSameGroup(cellA, cellB)) {
        removeWalls(cellA, cellB);
        union(cellA, cellB);
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
  };

  currentInterval = setInterval(step, mazeSpeed);
};
