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

/**
 * Invalidate all cached data on mutations
 */
export const clearCache = () => {
  cacheStore.clear();
};
