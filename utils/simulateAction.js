function simulateAction(valueToResolve, time, isRunning) {
  return new Promise((resolve) =>
    setTimeout(() => {
      if (!isRunning) {
        throw Error('Stopped Game');
      }
      resolve(valueToResolve);
    }, time)
  );
}

export default simulateAction;
