function getProxyBaseUrl() {
  return window.location.origin;
}
function isProxyEnabled() {
  return import.meta.env.VITE_IMAGE_PROXY_ENABLED === "true";
}
export function proxyImageUrl(url) {
  if (!url) return "";
  if (!isProxyEnabled()) {
    return url;
  }
  if (url.includes("/proxy/anilist/")) {
    return url;
  }
  if (!url.includes("anilist.co")) {
    return url;
  }
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    return `${getProxyBaseUrl()}/proxy/anilist${path}`;
  } catch (error) {
    console.error("Error proxying image URL:", error);
    return url;
  }
}
export function processAnimeImages(anime) {
  if (!anime) return anime;
  return {
    ...anime,
    poster: proxyImageUrl(anime.poster),
    banner: proxyImageUrl(anime.banner),
    seasons: anime.seasons?.map(season => ({
      ...season,
      season_poster: proxyImageUrl(season.season_poster)
    })),
    recommended_data: anime.recommended_data?.map(item => ({
      ...item,
      poster: proxyImageUrl(item.poster)
    }))
  };
}
