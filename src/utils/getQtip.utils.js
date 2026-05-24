import { animekaiClient, mapAnimeInfo, getQtipCacheKey, getFromCache, setToCache, CACHE_CONFIG } from "../services/animekai/index.js";
const getQtip = async id => {
  if (!id) return null;
  const cacheKey = getQtipCacheKey(String(id));
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  try {
    const raw = await animekaiClient.info(String(id));
    if (!raw) return null;
    const info = mapAnimeInfo(raw);
    const qtip = {
      id: info.id,
      title: info.title,
      japanese_title: info.japanese_title,
      Synonyms: info.animeInfo.Synonyms,
      airedDate: info.animeInfo.Aired,
      status: info.animeInfo.Status,
      genres: info.animeInfo.Genres,
      description: info.animeInfo.Overview,
      poster: info.poster,
      rating: info.animeInfo["MAL Score"],
      quality: "HD",
      subCount: info.animeInfo.tvInfo.sub,
      dubCount: info.animeInfo.tvInfo.dub,
      episodeCount: info.animeInfo.tvInfo.eps,
      type: info.animeInfo.tvInfo.showType,
      watchLink: `/watch/${info.id}`
    };
    setToCache(cacheKey, qtip, CACHE_CONFIG.ANIME_DETAILS);
    return qtip;
  } catch (err) {
    console.error("Error fetching qtip info:", err);
    return null;
  }
};
export default getQtip;
