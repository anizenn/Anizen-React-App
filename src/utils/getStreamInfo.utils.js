import { animekaiClient, getFromCache, setToCache } from "../services/animekai/index.js";
import { episodeTokenStore } from "./getEpisodes.utils.js";
import { getEpisodeEmbedId } from "../services/anikoto/client.js";
const STREAM_CACHE_MS = 10 * 60 * 1000;
export default async function getStreamInfo(animeId, serverName, type = "sub", episodeId, quality, malId, dataId, anilistId, animeTitle) {
  const language = type === "dub" ? "dub" : "sub";
  const cacheKey = `stream_${animeId}_${episodeId}_${language}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  const iframeUrls = [];
  let sources = [];
  let subtitles = [];
  let download = null;
  let intro = null;
  let outro = null;
  try {
    const episodeList = episodeTokenStore.get(animeId) ?? [];
    const episode = episodeList.find(ep => String(ep.number) === String(episodeId));
    const animekai_id = episode?.animekai_id ?? dataId;
    if (animekai_id) {
      const akType = language === "dub" ? "dub" : "hardsub";
      const watchData = await animekaiClient.watch(animekai_id, akType);
      if (watchData?.results?.length > 0) {
        const primary = watchData.results[0];
        if (primary.iframe) iframeUrls.push(primary.iframe);
        for (const r of watchData.results) {
          if (r.sources?.length) sources = sources.concat(r.sources);
          if (r.subtitles?.length) subtitles = subtitles.concat(r.subtitles);
          if (!download && r.download) download = r.download;
          if (r.iframe && r.iframe !== primary.iframe) iframeUrls.push(r.iframe);
        }
        if (watchData.intro) intro = watchData.intro;
        if (watchData.outro) outro = watchData.outro;
      }
    }
  } catch (err) {
    console.warn("[getStreamInfo] AnimeKai watch failed:", err.message);
  }
  try {
    const embedId = await getEpisodeEmbedId(malId, anilistId, episodeId);
    if (embedId) {
      const anikotoUrl = `https://megaplay.buzz/stream/s-2/${embedId}/${language}`;
      if (!iframeUrls.includes(anikotoUrl)) iframeUrls.push(anikotoUrl);
    }
  } catch (error) {
    void error;
  }
  if (malId) {
    const u = `https://megaplay.buzz/stream/mal/${malId}/${episodeId}/${language}`;
    if (!iframeUrls.includes(u)) iframeUrls.push(u);
  }
  if (anilistId) {
    const u = `https://megaplay.buzz/stream/ani/${anilistId}/${episodeId}/${language}`;
    if (!iframeUrls.includes(u)) iframeUrls.push(u);
  }
  if (iframeUrls.length === 0 && sources.length === 0) {
    throw new Error(`No stream source found for "${animeTitle || animeId}" ep ${episodeId}.`);
  }
  const result = {
    streamingLink: {
      iframe: iframeUrls[0] ?? null,
      fallbackIframes: iframeUrls.slice(1)
    },
    sources,
    subtitles,
    download,
    ...(intro ? {
      intro
    } : {}),
    ...(outro ? {
      outro
    } : {})
  };
  setToCache(cacheKey, result, STREAM_CACHE_MS);
  return result;
}
