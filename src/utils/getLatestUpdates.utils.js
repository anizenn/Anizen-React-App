import { animekaiClient, mapSearchList, getFromCache, setToCache, CACHE_CONFIG } from "../services/animekai/index.js";
const TAB_ID_MAP = {
  all: "all-updates",
  sub: "sub-updates",
  dub: "dub-updates",
  china: "china-updates"
};
export async function fetchLatestTab(tabKey = "all", page = 1) {
  const tabId = TAB_ID_MAP[tabKey] ?? "all-updates";
  const cacheKey = `ak_latest_${tabId}_${page}`;
  const cached = getFromCache(cacheKey);
  if (cached) return {
    items: cached.items,
    hasNextPage: cached.hasNextPage
  };
  try {
    const raw = await animekaiClient.latestUpdates(tabId, page);
    const items = mapSearchList(raw?.results ?? []);
    const hasNextPage = raw?.hasNextPage ?? false;
    setToCache(cacheKey, {
      items,
      hasNextPage
    }, CACHE_CONFIG.AIRING);
    return {
      items,
      hasNextPage
    };
  } catch (err) {
    console.error(`[getLatestUpdates] tab=${tabId} page=${page} failed:`, err);
    return {
      items: [],
      hasNextPage: false
    };
  }
}
export default async function getLatestUpdates() {
  const [all, sub, dub, china] = await Promise.all([fetchLatestTab("all"), fetchLatestTab("sub"), fetchLatestTab("dub"), fetchLatestTab("china")]);
  return {
    all: all.items,
    sub: sub.items,
    dub: dub.items,
    china: china.items
  };
}
