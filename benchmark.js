window.benchmarkSuite = {
  isRunning: false,
  results: [],
  config: {
    trials: 5,
    speed: 0,
    generators: [
      { name: "Recursive Backtracking", func: recursiveBacktracking },
      { name: "Randomized Kruskal", func: randomizedKruskal },
      { name: "Randomized Prim", func: randomizedPrim },
      { name: "Eller's Algorithm", func: eller },
      { name: "Wilson's Algorithm", func: wilson },
    ],
    solvers: [
      { name: "Recursive DFS", func: recursiveDFS },
      { name: "Wall Follower", func: wallFollower },
      { name: "Dijkstra", func: dijkstra },
      { name: "A* Search", func: aStar }, // UPDATED: Matches Python script name
    ],
  },

  async run() {
    if (this.isRunning) return;
    this.isRunning = true;

    // 1. Save original speed and set to instant
    const originalSpeed = window.mazeSpeed;
    window.mazeSpeed = this.config.speed;

    console.log("🚀 Starting Benchmark Suite...");

    try {
      for (const generator of this.config.generators) {
        for (const solver of this.config.solvers) {
          console.log(`\nTesting: ${generator.name} + ${solver.name}`);
          for (let i = 0; i < this.config.trials; i++) {
            await this.runTrial(generator, solver);
          }
        }
      }

      console.log("✅ Benchmark Complete!");
      metricsData.exportForReport(); // Trigger the JSON download
      alert("Benchmark Complete! Check your downloads folder.");
    } catch (e) {
      console.error("Benchmark Failed:", e);
    } finally {
      this.isRunning = false;
      window.mazeSpeed = originalSpeed; // Restore UI speed
    }
  },

  runTrial(generator, solver) {
    return new Promise((resolve) => {
      // Step 0: Force Cleanup
      if (window.currentInterval) clearInterval(window.currentInterval);
      if (window.solverInterval) clearInterval(window.solverInterval);

      window.mazeState.generated = false;
      window.solveState.solving = false;
      window.solveState.started = false;

      // Timeout Safety (300 seconds / 5 mins max per operation)
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject("Timeout after 300s"), 300000),
      );

      const execution = new Promise(async (resolveExec) => {
        // Step 1: Generate
        generator.func();
        await this.waitForCondition(() => window.mazeState.generated, 100);

        // Step 2: Solve
        await new Promise((r) => setTimeout(r, 50)); // Tiny breather
        solver.func();

        // Wait for Start then Finish
        await this.waitForCondition(
          () => window.solveState.started || window.solveState.solving,
          10,
        );
        await this.waitForCondition(() => !window.solveState.solving, 50);

        resolveExec();
      });

      Promise.race([execution, timeout])
        .then(resolve)
        .catch((e) => {
          console.warn(`Trial Skipped: ${e}`);
          resolve();
        });
    });
  },

  // Helper to keep code clean
  waitForCondition(conditionFn, interval) {
    return new Promise((resolve) => {
      const checker = setInterval(() => {
        if (conditionFn()) {
          clearInterval(checker);
          resolve();
        }
      }, interval);
    });
  },
};
