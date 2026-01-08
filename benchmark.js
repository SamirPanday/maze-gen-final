// Benchmark Suite
// Automates running all generators and solvers to collect data

window.benchmarkSuite = {
  isRunning: false,
  results: [],
  config: {
    trials: 5,
    speed: 0, // Fast mode
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
    ],
  },

  async run() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.results = [];

    console.log("🚀 Starting Benchmark Suite...");
    const originalSpeed = mazeSpeed;
    // Don't override speed if user wants to use checkbox value
    // mazeSpeed = this.config.speed;

    try {
      for (const generator of this.config.generators) {
        for (const solver of this.config.solvers) {
          console.log(`\nTesting: ${generator.name} + ${solver.name}`);

          for (let i = 0; i < this.config.trials; i++) {
            console.log(`  Trial ${i + 1}/${this.config.trials}`);
            await this.runTrial(generator, solver);
          }
        }
      }

      console.log("✅ Benchmark Complete!");
      metricsData.exportForReport();
      alert("Benchmark Complete! Check console for data.");
    } catch (e) {
      console.error("Benchmark Failed:", e);
    } finally {
      this.isRunning = false;
      mazeSpeed = originalSpeed; // Restore speed
    }
  },

  runTrial(generator, solver) {
    return new Promise((resolve) => {
      // Step 0: Force Cleanup
      if (window.currentInterval) clearInterval(window.currentInterval);
      if (window.solverInterval) clearInterval(window.solverInterval);
      window.mazeState.generated = false;
      window.solveState.solving = false;

      // Timeout Safety (60 seconds max per operation)
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject("Timeout"), 60000)
      );

      const execution = new Promise(async (resolveExec) => {
        // Step 1: Generate Maze
        generator.func();

        await new Promise((r) => {
          const checkGen = setInterval(() => {
            if (mazeState.generated) {
              clearInterval(checkGen);
              r();
            }
          }, 100);
        });

        // Wait a tick
        await new Promise((r) => setTimeout(r, 100));

        // Step 2: Solve Maze
        solver.func();

        await new Promise((r) => {
          const checkSolve = setInterval(() => {
            if (!solveState.solving) {
              clearInterval(checkSolve);
              r();
            }
          }, 100);
        });

        resolveExec();
      });

      Promise.race([execution, timeout])
        .then(resolve)
        .catch((e) => {
          console.warn(`Trial Skipped: ${e}`);
          // Force cleanup again
          if (window.currentInterval) clearInterval(window.currentInterval);
          if (window.solverInterval) clearInterval(window.solverInterval);
          resolve(); // Continue to next trial anyway
        });
    });
  },
};
