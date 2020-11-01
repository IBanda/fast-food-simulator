function simulateAction(valueToResolve, time, isRunning) {
  return new Promise((resolve) =>
    setTimeout(() => {
      if (!isRunning.running) {
        throw Error('Stopped Simulation');
      }
      resolve(valueToResolve);
    }, time)
  );
}

export default simulateAction;
