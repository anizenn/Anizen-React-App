import { animekaiClient, mapSearchList, getSearchCacheKey, getFromCache, setToCache, CACHE_CONFIG } from "../services/animekai/index.js";
const getSearch = async (keyword, page = 1) => {
  if (!keyword?.trim()) return {
    data: [],
    pageInfo: {},
    totalPages: 0
  };
  const cacheKey = getSearchCacheKey(keyword, page);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  try {
    const raw = await animekaiClient.search(keyword, page);
    const items = mapSearchList(raw?.results ?? []);
    const result = {
      data: items,
      pageInfo: {
        hasNextPage: raw?.hasNextPage ?? false,
        total: (raw?.totalPages ?? 1) * 24,
        currentPage: raw?.currentPage ?? page,
        lastPage: raw?.totalPages ?? 1
      },
      totalPages: raw?.totalPages ?? 1
    };
    setToCache(cacheKey, result, CACHE_CONFIG.SEARCH);
    return result;
  } catch (err) {
    console.error("Error fetching search results:", err);
    throw err;
  }
};
export default getSearch;
