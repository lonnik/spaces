export const throttle = (func: (...arg: any[]) => void, limit: number) => {
  let inThrottle: boolean = false;
  let currentArgs: any[];
  let timeout: NodeJS.Timeout;

  return (...args: any[]) => {
    clearTimeout(timeout);
    if (!inThrottle) {
      func(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);

      return;
    }

    currentArgs = args;
    timeout = setTimeout(() => {
      func(currentArgs);
    }, limit);
  };
};
