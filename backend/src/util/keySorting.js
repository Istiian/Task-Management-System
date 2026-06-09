// Sorts an object's keys alphabetically and returns a new object.
// Used to produce stable, order-independent cache keys from query filter objects.
export const sortQuery = (query) => {
    return Object.keys(query)
        .sort()
        .reduce((obj, key) => {
            obj[key] = query[key];
            return obj;
        }, {});
};
