import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120,
  useClones: false,
});

export const getCache = <T>(key: string): T | undefined => {
  return cache.get<T>(key);
};

export const setCache = <T>(key: string, value: T, ttl?: number): void => {
  if (ttl !== undefined) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
};

export const delCache = (key: string | string[]): void => {
  cache.del(key);
};

export const flushCache = (): void => {
  cache.flushAll();
};

export default { get: getCache, set: setCache, del: delCache, flush: flushCache };
