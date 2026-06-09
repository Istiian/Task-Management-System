export const sortQuery = (query) => {
  return Object.keys(query)
    .sort()
    .reduce((obj, key) => {
      obj[key] = query[key];
      return obj;
    }, {});
};