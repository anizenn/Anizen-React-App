const PROXY_BASE = "/anikoto";
const idLookupCache = new Map();
const seriesCache = new Map();
const CACHE_MS = 30 * 60 * 1000;
async function fetchJson(path) {
  const res = await fetch(`${PROXY_BASE}${path}`);
  if (!res.ok) throw new Error(`Anikoto ${res.status}: ${path}`);
  return res.json();
}
const MAX_PAGES = 6;
const PER_PAGE = 50;
async function findAnikotoId(malId, aniId) {
  const malKey = malId ? `mal:${malId}` : null;
  const aniKey = aniId ? `ani:${aniId}` : null;
  if (malKey && idLookupCache.has(malKey)) return idLookupCache.get(malKey);
  if (aniKey && idLookupCache.has(aniKey)) return idLookupCache.get(aniKey);
  for (let page = 1; page <= MAX_PAGES; page++) {
    let data;
    try {
      data = await fetchJson(`/recent-anime?page=${page}&per_page=${PER_PAGE}`);
    } catch {
      break;
    }
    const items = Array.isArray(data) ? data : data?.data ?? [];
    if (!items.length) break;
    for (const item of items) {
      const itemMal = item.mal_id != null ? String(item.mal_id) : null;
      const itemAni = item.ani_id != null ? String(item.ani_id) : null;
      const anikotoId = item.id;
      if (!anikotoId) continue;
      const matched = malId && itemMal && itemMal === String(malId) || aniId && itemAni && itemAni === String(aniId);
      if (matched) {
        if (itemMal) idLookupCache.set(`mal:${itemMal}`, anikotoId);
        if (itemAni) idLookupCache.set(`ani:${itemAni}`, anikotoId);
        return anikotoId;
      }
    }
    if (items.length < PER_PAGE) break;
  }
  if (malKey) idLookupCache.set(malKey, null);
  if (aniKey) idLookupCache.set(aniKey, null);
  return null;
}
async function getSeriesEpisodes(anikotoId) {
  const cached = seriesCache.get(anikotoId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_MS) {
    return cached.episodes;
  }
  const data = await fetchJson(`/series/${anikotoId}`);
  const episodes = Array.isArray(data) ? data : data?.data?.episodes ?? data?.episodes ?? [];
  seriesCache.set(anikotoId, {
    episodes,
    fetchedAt: Date.now()
  });
  return episodes;
}
export async function getEpisodeEmbedId(malId, aniId, episodeNumber) {
  if (episodeNumber == null) return null;
  if (!malId && !aniId) return null;
  try {
    const anikotoId = await findAnikotoId(malId, aniId);
    if (!anikotoId) {
      console.warn("[Anikoto] Series not found in recent-anime for mal:", malId, "ani:", aniId);
      return null;
    }
    const episodes = await getSeriesEpisodes(anikotoId);
    const ep = episodes.find(e => String(e.number ?? e.episode_number ?? e.ep) === String(episodeNumber));
    if (!ep) return null;
    if (ep.episode_embed_id) return ep.episode_embed_id;
    if (ep.embed_id) return ep.embed_id;
    const embedUrl = ep.embed_url?.sub ?? ep.embed_url?.dub;
    if (embedUrl) {
      const match = embedUrl.match(/\/stream\/s-2\/([^/?#]+)/);
      if (match?.[1]) return match[1];
    }
    return null;
  } catch (err) {
    console.warn("[Anikoto] Could not fetch embed ID:", err.message);
    return null;
  }
}
