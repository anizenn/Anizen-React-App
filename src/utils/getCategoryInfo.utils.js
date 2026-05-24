import { animekaiClient, mapSearchList, getCategoryCacheKey, getFromCache, setToCache, CACHE_CONFIG } from "../services/animekai/index.js";
function buildFetcher(path, page) {
  if (path.startsWith("genre/")) {
    const genre = path.replace("genre/", "");
    return () => animekaiClient.genreSearch(genre, page);
  }
  switch (path) {
    case "recent":
      return () => animekaiClient.recentAdded(page);
    case "updates":
      return () => animekaiClient.recentEpisodes(page);
    case "new-releases":
      return () => animekaiClient.newReleases(page);
    case "completed":
      return () => animekaiClient.completed(page);
    case "upcoming":
      return () => animekaiClient.newReleases(page);
    case "trending":
      return () => animekaiClient.trending(page);
    case "movie":
      return () => animekaiClient.movies(page);
    case "special":
      return () => animekaiClient.specials(page);
    case "ova":
      return () => animekaiClient.ova(page);
    case "ona":
      return () => animekaiClient.ona(page);
    case "tv":
      return () => animekaiClient.tv(page);
    default:
      return () => animekaiClient.search(path.replace(/-/g, " "), page);
  }
}
const getCategoryInfo = async (path, page = 1) => {
  const cacheKey = getCategoryCacheKey(path, page);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  try {
    const fetcher = buildFetcher(path, page);
    const raw = await fetcher();
    const items = mapSearchList(raw?.results ?? []);
    const result = {
      response: items,
      pageInfo: {
        hasNextPage: raw?.hasNextPage ?? false,
        total: (raw?.totalPages ?? 1) * 24,
        currentPage: raw?.currentPage ?? page,
        lastPage: raw?.totalPages ?? 1,
        totalPages: raw?.totalPages ?? 1
      }
    };
    setToCache(cacheKey, result, CACHE_CONFIG.CATEGORY);
    return result;
  } catch (err) {
    console.error("Error fetching category info:", err);
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
export default getCategoryInfo;
