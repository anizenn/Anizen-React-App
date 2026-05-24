import { animekaiClient, mapSearchList, getCategoryCacheKey, getFromCache, setToCache, CACHE_CONFIG } from "../services/animekai/index.js";
const getProducer = async (producer, page = 1) => {
  const cacheKey = getCategoryCacheKey(`producer-${producer}`, page);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  try {
    const raw = await animekaiClient.search(producer, page);
    const items = mapSearchList(raw?.results ?? []);
    const result = {
      response: items,
      pageInfo: {
        hasNextPage: raw?.hasNextPage ?? false,
        total: (raw?.totalPages ?? 1) * 24,
        currentPage: raw?.currentPage ?? page,
        lastPage: raw?.totalPages ?? 1
      }
    };
    setToCache(cacheKey, result, CACHE_CONFIG.CATEGORY);
    return result;
  } catch (err) {
    console.error("Error fetching producer info:", err);
    return {
      response: [],
      pageInfo: {
        hasNextPage: false,
        total: 0,
        currentPage: 1,
        lastPage: 1
      }
    };
  }
};
export default getProducer;
