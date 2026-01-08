window.timerState = {
  genStart: null,
  solveStart: null,
  genInterval: null,
  solveInterval: null,

  startGen() {
    this.genStart = performance.now();
    clearInterval(this.genInterval);
    this.genInterval = setInterval(() => {
      const ms = performance.now() - this.genStart;
      document.getElementById("gen-timer").innerText = (ms / 1000).toFixed(3) + " s";
    }, 50);
  },

  stopGen() {
    if (this.genInterval) clearInterval(this.genInterval);
    const finalMs = performance.now() - this.genStart;
    document.getElementById("gen-timer").innerText = (finalMs / 1000).toFixed(3) + " s";
  },

  startSolve() {
    this.solveStart = performance.now();
    clearInterval(this.solveInterval);
    this.solveInterval = setInterval(() => {
      const ms = performance.now() - this.solveStart;
      document.getElementById("solve-timer").innerText = (ms / 1000).toFixed(3) + " s";
    }, 50);
  },

  stopSolve() {
    if (this.solveInterval) clearInterval(this.solveInterval);
    const finalMs = performance.now() - this.solveStart;
    document.getElementById("solve-timer").innerText = (finalMs / 1000).toFixed(3) + " s";
  }
};
