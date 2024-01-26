export const debounce = (fn: (...args: any[]) => any, interval: number) => {
  let timeout: NodeJS.Timeout;

  return (...args: any[]): Promise<any> => {
    clearTimeout(timeout);

    return new Promise((resolve, reject) => {
      timeout = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, interval);
    });
  };
};
