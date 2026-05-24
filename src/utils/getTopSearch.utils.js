import { animekaiClient, getTrendingCacheKey, getFromCache, setToCache, CACHE_CONFIG } from "../services/animekai/index.js";
const getTopSearch = async () => {
  const cacheKey = getTrendingCacheKey();
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  try {
    const trending = await animekaiClient.trending(1);
    const items = (Array.isArray(trending?.results) ? trending.results : Array.isArray(trending) ? trending : []).filter(item => item?.id && item?.title).map(item => ({
      id: item.id,
      title: item.title,
      link: `/search?keyword=${encodeURIComponent(item.title)}`
    }));
    const result = items.slice(0, 10);
    if (result.length) setToCache(cacheKey, result, CACHE_CONFIG.TRENDING);
    return result;
  } catch (error) {
    console.error("Error fetching top search data:", error);
    return [];
  }
};
export default getTopSearch;
