const eller = () => {
  console.log("Eller's Algorithm");
  metricsData.startTracking("Eller's Algorithm");
  timerState.startGen();

  mazeState.generated = false;
  mazeState.generator = null;
  const naming = document.querySelector("#title-Container");
  naming.innerHTML = "Eller's Algorithm";
  // stop previous animation if running
  if (currentInterval) clearInterval(currentInterval);
  gridReset();
  pathReset();

  let currentRow = 0;
  // let wallList = [];

  // give each cell its own groupId initially
  for (let k = 0; k < grid.length; k++) {
    grid[k].groupId = grid[k].id;
  }

  function removeWalls(cellA, cellB) {
    if (cellA.i < cellB.i) {
      cellA.walls.bottom = false;
      cellB.walls.top = false;
    }

    if (cellA.j < cellB.j) {
      cellA.walls.right = false;
      cellB.walls.left = false;
    }
  }

  function union(oldId, newId) {
    let reqIndex = grid.findIndex((c) => c.groupId === oldId);
    if (reqIndex !== -1) {
      grid[reqIndex].groupId = newId;
      union(oldId, newId); // recursive call to update all cells with oldId
    }
  }

  function step() {
    if (currentRow >= rows) {
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

    // Horizontal merges
    for (let j = 0; j < cols - 1; j++) {
      let cellA = grid[index(currentRow, j)];
      let cellB = grid[index(currentRow, j + 1)];
      // currentCell = cellA;
      cellA.visited = true;

      if (cellA.groupId !== cellB.groupId) {
        let carve = currentRow === rows - 1 ? true : random() < 0.5;
        if (carve) {
          removeWalls(cellA, cellB);
          union(cellB.groupId, cellA.groupId);
        }
      }
    }

    if (currentRow === rows - 1) {
      currentRow++;
      return;
    }

    // Vertical merges
    let sets = {};
    for (let j = 0; j < cols; j++) {
      let c = grid[index(currentRow, j)];
      if (!sets[c.groupId]) {
        sets[c.groupId] = [];
      }
      sets[c.groupId].push(c);
    }

    Object.values(sets).forEach((members) => {
      // ensure at least one vertical per set
      let chosen = floor(random(members.length));
      members.forEach((m, idx) => {
        if (idx === chosen || random() < 0.5) {
          let below = grid[index(currentRow + 1, m.j)];
          if (below) {
            removeWalls(m, below);
            below.groupId = m.groupId;
          }
        }
      });
    });

    currentRow++;
  }

  currentInterval = setInterval(step, mazeSpeed);
};
