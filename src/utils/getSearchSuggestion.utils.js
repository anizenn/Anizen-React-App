import { animekaiClient, mapSearchList, getSuggestionCacheKey, getFromCache, setToCache, CACHE_CONFIG } from "../services/animekai/index.js";
const getSearchSuggestion = async keyword => {
  if (!keyword?.trim()) return [];
  const cacheKey = getSuggestionCacheKey(keyword);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  try {
    const raw = await animekaiClient.suggestions(keyword);
    const mapped = mapSearchList(Array.isArray(raw) ? raw : raw?.results ?? []);
    setToCache(cacheKey, mapped, CACHE_CONFIG.SUGGESTION);
    return mapped;
  } catch (err) {
    console.error("Error fetching search suggestion:", err);
    return [];
  }
};
export default getSearchSuggestion;
