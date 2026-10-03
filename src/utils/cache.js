const cacheStore = new Map();

/**
 * Fetch cached response data if available and not expired
 * @param {string} key - Unique key identifier
 */
export const getCachedData = (key) => {
  const cached = cacheStore.get(key);
  if (!cached) return null;

  // Check if cache has expired
  if (Date.now() > cached.expiry) {
    cacheStore.delete(key);
    return null;
  }
  return cached.data;
};

/**
 * Store response data in cache with a TTL
 * @param {string} key - Unique key identifier
 * @param {any} data - Data to cache
 * @param {number} durationMs - TTL in milliseconds (default 5 minutes)
 */
export const setCachedData = (key, data, durationMs = 5 * 60 * 1000) => {
  cacheStore.set(key, {
    data,
    expiry: Date.now() + durationMs,
  });
};

const inflight = new Map();

/**
 * Return cached data, join a request already in flight for the same key, or
 * start a new one. Lets an early prefetch and the page's own request share a
 * single network call.
 * @param {string} key - Unique key identifier
 * @param {() => Promise<any>} fetcher - Loads the data when it isn't cached
 * @param {number} durationMs - TTL in milliseconds for the cached result
 */
export const getOrFetch = (key, fetcher, durationMs) => {
  const cached = getCachedData(key);
  if (cached) return Promise.resolve(cached);
  if (inflight.has(key)) return inflight.get(key);

  const request = fetcher()
    .then((data) => {
      setCachedData(key, data, durationMs);
      return data;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, request);
  return request;
};

/**
 * Invalidate all cached data on mutations
 */
export const clearCache = () => {
  cacheStore.clear();
};
