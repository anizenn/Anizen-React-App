import { animekaiClient, mapEpisodes, getFromCache, setToCache, CACHE_CONFIG } from "../services/animekai/index.js";
export const episodeTokenStore = new Map();
export default async function getEpisodes(animeId) {
  const cacheKey = `ak_episodes_${animeId}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  try {
    const raw = await animekaiClient.info(animeId);
    if (!raw) throw new Error(`Anime not found: ${animeId}`);
    const episodes = mapEpisodes(raw.episodes ?? [], animeId);
    const totalEpisodes = raw.totalEpisodes ?? episodes.length;
    episodeTokenStore.set(animeId, episodes);
    const data = {
      episodes,
      totalEpisodes
    };
    setToCache(cacheKey, data, CACHE_CONFIG.EPISODES);
    return data;
  } catch (error) {
    console.error("Error fetching episodes:", error);
    throw error;
  }
}
