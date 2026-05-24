const memoryCache = new Map();
const CACHE_CONFIG = {
  HOME: 10 * 60 * 1000,
  ANIME_DETAILS: 30 * 60 * 1000,
  EPISODES: 60 * 60 * 1000,
  SEARCH: 5 * 60 * 1000,
  SUGGESTION: 5 * 60 * 1000,
  GENRES: 60 * 60 * 1000,
  SCHEDULES: 10 * 60 * 1000,
  TRENDING: 5 * 60 * 1000,
  POPULAR: 10 * 60 * 1000,
  UPCOMING: 30 * 60 * 1000,
  COMPLETED: 30 * 60 * 1000,
  AIRING: 5 * 60 * 1000,
  CHARACTERS: 60 * 60 * 1000,
  CATEGORY: 10 * 60 * 1000,
  DEFAULT: 5 * 60 * 1000
};
export function getHomeCacheKey() {
  return "home";
}
export function getAnimeDetailCacheKey(id) {
  return `anime_${id}`;
}
export function getSearchCacheKey(keyword, page) {
  return `search_${keyword}_${page}`;
}
export function getSuggestionCacheKey(keyword) {
  return `suggestion_${keyword}`;
}
export function getScheduleCacheKey(date) {
  return `schedule_${date}`;
}
export function getTrendingCacheKey() {
  return "trending";
}
export function getCategoryCacheKey(category, page) {
  return `category_${category}_${page}`;
}
export function getCharactersCacheKey(id) {
  return `characters_${id}`;
}
export function getQtipCacheKey(id) {
  return `qtip_${id}`;
}
export function getFromCache(key) {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.duration) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}
export function setToCache(key, data, duration) {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
    duration
  });
}
export function removeFromCache(key) {
  memoryCache.delete(key);
}
export function clearAllCache() {
  memoryCache.clear();
}
export default CACHE_CONFIG;
