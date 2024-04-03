export const parseQuery = (queryParams: { [param: string]: any }) => {
  return Object.entries(queryParams).reduce((acc, [key, value], index) => {
    if (value === undefined) {
      return acc;
    }

    const queryParamDelimiter = index === 0 ? "?" : "&";

    return `${acc}${queryParamDelimiter}${key}=${encodeURIComponent(value)}`;
  }, "");
};
