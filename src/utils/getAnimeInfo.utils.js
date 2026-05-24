import { animekaiClient, mapAnimeInfo, getAnimeDetailCacheKey, getFromCache, setToCache, CACHE_CONFIG } from "../services/animekai/index.js";
export default async function getAnimeInfo(id, random = false) {
  if (random) {
    const slug = await animekaiClient.random();
    if (!slug) throw new Error("Could not fetch a random anime.");
    id = slug;
  }
  if (!id) throw new Error("id is required");
  const cacheKey = getAnimeDetailCacheKey(id);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  try {
    const raw = await animekaiClient.info(id);
    if (!raw) throw new Error(`Anime not found: ${id}`);
    const mapped = mapAnimeInfo(raw);
    setToCache(cacheKey, mapped, CACHE_CONFIG.ANIME_DETAILS);
    return mapped;
  } catch (error) {
    console.error("Error fetching anime info:", error);
    throw error;
  }
}
