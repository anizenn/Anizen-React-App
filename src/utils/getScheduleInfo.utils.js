import { animekaiClient, mapSchedule, getScheduleCacheKey, getFromCache, setToCache, CACHE_CONFIG } from "../services/animekai/index.js";
export default async function getSchedInfo(date) {
  if (!date) return [];
  const cacheKey = getScheduleCacheKey(date);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  try {
    const raw = await animekaiClient.schedule(date);
    const mapped = mapSchedule(raw?.results ?? []);
    setToCache(cacheKey, mapped, CACHE_CONFIG.SCHEDULES);
    return mapped;
  } catch (error) {
    console.error("Error fetching schedule info:", error);
    return [];
  }
}
