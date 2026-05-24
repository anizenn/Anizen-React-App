import { animekaiClient, mapSearchList, mapSpotlight, getFromCache, setToCache, CACHE_CONFIG } from "../services/animekai/index.js";
const HOME_CACHE_DURATION = 10 * 60 * 1000;
async function fetchSpotlight() {
  try {
    const data = await animekaiClient.spotlight();
    return mapSpotlight(Array.isArray(data) ? data : data?.results ?? []);
  } catch (e) {
    console.error("fetchSpotlight failed:", e);
    return [];
  }
}
async function fetchCategory(fn, cacheKey) {
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  try {
    const data = await fn();
    const mapped = mapSearchList(data?.results ?? []);
    setToCache(cacheKey, mapped, CACHE_CONFIG.AIRING);
    return mapped;
  } catch (e) {
    console.error(`fetchCategory(${cacheKey}) failed:`, e);
    return [];
  }
}
async function fetchGenres() {
  try {
    const data = await animekaiClient.genres();
    const list = Array.isArray(data) ? data : data?.results ?? [];
    return list.map(g => g.charAt(0).toUpperCase() + g.slice(1)).filter(Boolean);
  } catch (e) {
    console.error("fetchGenres failed:", e);
    return [];
  }
}
export default async function getHomeInfo() {
  const cacheKey = "ak_home";
  try {
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
  } catch (error) {
    void error;
  }
  try {
    const [spotlightRaw, trending, popular, newReleases, recentlyAdded, upcoming, completed, genres] = await Promise.all([fetchSpotlight(), fetchCategory(() => animekaiClient.recentEpisodes(1), "ak_trending_1"), fetchCategory(() => animekaiClient.newReleases(1), "ak_popular_1"), fetchCategory(() => animekaiClient.recentEpisodes(1), "ak_new_releases_1"), fetchCategory(() => animekaiClient.recentAdded(1), "ak_recently_added_1"), fetchCategory(() => animekaiClient.newReleases(2), "ak_upcoming_1"), fetchCategory(() => animekaiClient.completed(1), "ak_completed_1"), fetchGenres()]);
    const topten = {
      today: popular.slice(0, 10).map((item, i) => ({
        ...item,
        number: i + 1
      })),
      week: popular.slice(0, 10).map((item, i) => ({
        ...item,
        number: i + 1
      })),
      month: popular.slice(0, 10).map((item, i) => ({
        ...item,
        number: i + 1
      }))
    };
    const finalData = {
      spotlights: spotlightRaw.slice(0, 10),
      trending: trending.slice(0, 10).map((item, i) => ({
        ...item,
        number: i + 1
      })),
      new_releases: newReleases,
      recently_added: recentlyAdded,
      upcoming,
      latest_completed: completed,
      topten,
      genres
    };
    setToCache(cacheKey, finalData, HOME_CACHE_DURATION);
    return finalData;
  } catch (error) {
    console.error("Error fetching home info:", error);
    return null;
  }
}
