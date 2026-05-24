export function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export function getShowType(type) {
  if (!type) return null;
  const map = {
    TV: "TV",
    MOVIE: "Movie",
    SPECIAL: "Special",
    OVA: "OVA",
    ONA: "ONA",
    MUSIC: "Music"
  };
  const upper = type.toUpperCase();
  return map[upper] ?? type;
}
export function formatDuration(str) {
  if (!str) return null;
  return str.replace("/ep", "").trim();
}
export function mapSearchItem(item) {
  if (!item) return null;
  const tvInfo = {
    rating: "PG-13",
    quality: "HD",
    sub: item.sub ?? item.episodes ?? null,
    dub: item.dub || null,
    showType: getShowType(item.type),
    eps: item.episodes ?? item.sub ?? null,
    duration: null
  };
  return {
    id: item.id,
    link: item.id,
    mal_id: item.id,
    ani_id: item.id,
    title: item.title || "",
    japanese_title: item.japaneseTitle || "",
    poster: item.image || "",
    banner: item.image || "",
    adultContent: false,
    tvInfo,
    animeInfo: {
      Overview: null,
      Japanese: item.japaneseTitle || null,
      Synonyms: null,
      Aired: null,
      Premiered: null,
      Duration: null,
      Status: null,
      "MAL Score": null,
      Genres: [],
      Studios: [],
      Producers: [],
      tvInfo
    },
    seasons: [],
    charactersVoiceActors: [],
    recommended_data: []
  };
}
export function mapSearchList(results) {
  if (!Array.isArray(results)) return [];
  return results.map(mapSearchItem).filter(Boolean);
}
export function mapAnimeInfo(info) {
  if (!info) return null;
  const subCount = info.hasSub ? info.totalEpisodes || info.episodes?.length || null : null;
  const dubCount = info.hasDub ? info.totalEpisodes || info.episodes?.length || null : null;
  const relations = Array.isArray(info.relations) ? info.relations : [];
  const seasons = relations.filter(r => r.relationType === "SEQUEL" || r.relationType === "PREQUEL").map(r => ({
    season: r.title || "",
    season_poster: r.image || "",
    id: r.id,
    link: r.id
  }));
  const recommended_data = Array.isArray(info.recommendations) ? info.recommendations.map(r => ({
    id: r.id,
    link: r.id,
    title: r.title || "",
    japanese_title: r.japaneseTitle || "",
    poster: r.image || "",
    tvInfo: {
      sub: r.sub || r.episodes || null,
      dub: r.dub || null,
      showType: getShowType(r.type),
      eps: r.episodes || r.sub || null
    }
  })) : [];
  return {
    id: info.id,
    link: info.id,
    mal_id: info.malId ? parseInt(info.malId) : null,
    ani_id: info.anilistId ? parseInt(info.anilistId) : null,
    title: info.title || "",
    japanese_title: info.japaneseTitle || "",
    poster: info.image || "",
    banner: info.image || "",
    adultContent: false,
    animeInfo: {
      Overview: info.description || null,
      Japanese: info.japaneseTitle || null,
      Synonyms: null,
      Aired: null,
      Premiered: info.season || null,
      Duration: formatDuration(info.duration),
      Status: info.status || null,
      "MAL Score": null,
      Genres: Array.isArray(info.genres) ? info.genres.map(capitalize) : [],
      Studios: [],
      Producers: [],
      tvInfo: {
        rating: "PG-13",
        quality: "HD",
        sub: subCount,
        dub: dubCount,
        showType: getShowType(info.type),
        eps: info.totalEpisodes || null,
        duration: formatDuration(info.duration)
      }
    },
    seasons,
    charactersVoiceActors: [],
    recommended_data,
    nextEpisodeTimestamp: info.nextEpisodeTimestamp ?? null
  };
}
export function mapSpotlight(items) {
  if (!Array.isArray(items)) return [];
  return items.map(item => {
    if (!item) return null;
    return {
      id: item.id,
      link: item.id,
      mal_id: item.id,
      ani_id: item.id,
      title: item.title || "",
      japanese_title: item.japaneseTitle || "",
      banner: item.banner || "",
      poster: item.banner || "",
      description: item.description || "",
      adultContent: false,
      tvInfo: {
        rating: "PG-13",
        quality: item.quality || "HD",
        sub: item.sub || null,
        dub: item.dub || null,
        showType: getShowType(item.type),
        eps: item.sub || null,
        duration: null,
        releaseDate: item.releaseDate || null,
        episodeInfo: {
          sub: item.sub || null,
          dub: item.dub || null
        }
      },
      animeInfo: {
        Overview: item.description || null,
        Japanese: item.japaneseTitle || null,
        Synonyms: null,
        Aired: item.releaseDate || null,
        Premiered: null,
        Duration: null,
        Status: null,
        "MAL Score": null,
        Genres: Array.isArray(item.genres) ? item.genres.map(capitalize) : [],
        Studios: [],
        Producers: [],
        tvInfo: {
          rating: "PG-13",
          quality: item.quality || "HD",
          sub: item.sub || null,
          dub: item.dub || null,
          showType: getShowType(item.type),
          eps: item.sub || null,
          duration: null,
          episodeInfo: {
            sub: item.sub || null,
            dub: item.dub || null
          }
        }
      },
      seasons: [],
      charactersVoiceActors: [],
      recommended_data: []
    };
  }).filter(Boolean);
}
export function mapScheduleItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    title: item.title || "",
    japanese_title: item.japaneseTitle || "",
    poster: "",
    airingTimestamp: item.airingTimestamp ?? null,
    time: item.airingTime || "",
    episode_no: item.airingEpisode ? parseInt(item.airingEpisode) : null,
    tvInfo: {
      sub: null,
      dub: null,
      showType: null,
      eps: null,
      duration: null
    }
  };
}
export function mapSchedule(items) {
  if (!Array.isArray(items)) return [];
  return items.map(mapScheduleItem).filter(Boolean);
}
export function mapEpisodes(episodes) {
  if (!Array.isArray(episodes)) return [];
  return episodes.map(ep => ({
    number: ep.number,
    title: ep.title || `Episode ${ep.number}`,
    thumbnail: null,
    has_sub: ep.isSubbed !== false,
    has_dub: ep.isDubbed === true,
    filler: ep.isFiller || false,
    animekai_id: ep.id
  }));
}
