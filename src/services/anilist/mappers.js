export function slugify(title, id) {
  const slug = (title || "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return slug ? `${slug}-${id}` : String(id);
}
export function extractId(idOrSlug) {
  if (!idOrSlug) return "";
  const match = String(idOrSlug).match(/(\d+)$/);
  return match ? match[1] : String(idOrSlug);
}
export function formatDuration(minutes) {
  if (!minutes) return null;
  return `${minutes} min`;
}
export function formatDate(date) {
  if (!date || !date.year) return null;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = date.month ? months[date.month - 1] : "";
  return `${month} ${date.day}, ${date.year}`;
}
export function formatSeason(season, year) {
  if (!season || !year) return null;
  const seasonMap = {
    WINTER: "Winter",
    SPRING: "Spring",
    SUMMER: "Summer",
    FALL: "Fall"
  };
  return `${seasonMap[season] || season} ${year}`;
}
export function formatScore(score) {
  if (!score) return null;
  return (score / 10).toFixed(1);
}
export function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export function cleanDescription(description) {
  if (!description) return description;
  let cleaned = description.replace(/The\s+(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|[\d]+(?:st|nd|rd|th))\s+season\s+of\s+<i>.*?<\/i>\.\s*<br>\s*<br>\s*.*?<br>\s*<br>\s*\(\s*<i>\s*<br>\s*\)/gi, '');
  cleaned = cleaned.replace(/<br>\s*<br>/gi, ' ');
  cleaned = cleaned.replace(/^\s*<br>\s*/gi, '');
  cleaned = cleaned.replace(/\s*<br>\s*$/gi, '');
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  cleaned = cleaned.trim();
  return cleaned;
}
export function getShowType(format) {
  const formatMap = {
    TV: "TV",
    MOVIE: "Movie",
    SPECIAL: "Special",
    OVA: "OVA",
    ONA: "ONA",
    MUSIC: "Music"
  };
  return formatMap[format] ?? null;
}
export function getRating(isAdult) {
  return isAdult ? "18+" : "PG-13";
}
export function getQuality() {
  return "HD";
}
const ANIME_FORMATS = new Set(["TV", "TV_SHORT", "MOVIE", "SPECIAL", "OVA", "ONA", "MUSIC"]);
function isAnimeFormat(node) {
  if (!node) return false;
  const fmt = node.format;
  return !fmt || ANIME_FORMATS.has(fmt);
}
export function mapAnime(media) {
  if (!media) return null;
  if (media.format && !ANIME_FORMATS.has(media.format)) return null;
  const title = media.title || {};
  const coverImage = media.coverImage || {};
  const startDate = media.startDate || {};
  const studios = media.studios?.nodes?.map(s => s.name) || [];
  const genres = media.genres || [];
  const recommended_data = (media.recommendations?.edges || []).filter(edge => isAnimeFormat(edge.node?.mediaRecommendation)).map(edge => mapAnime(edge.node?.mediaRecommendation)).filter(Boolean);
  const charactersVoiceActors = (media.characters?.edges || []).map(edge => {
    const character = edge.node || {};
    const voiceActors = (edge.voiceActors || []).map(va => ({
      id: va.id,
      name: va.name?.full || "",
      poster: va.image?.large || "",
      language: va.language || ""
    }));
    return {
      id: character.id,
      name: character.name?.full || "",
      poster: character.image?.large || "",
      cast: character.description || "",
      voiceActors
    };
  });
  const tvInfo = {
    rating: getRating(media.isAdult),
    quality: getQuality(),
    sub: media.episodes || null,
    dub: null,
    showType: getShowType(media.format),
    eps: media.episodes || null,
    duration: formatDuration(media.duration)
  };
  const animeInfo = {
    Overview: cleanDescription(media.description) || null,
    Japanese: title.native || null,
    Synonyms: media.synonyms?.join(", ") || null,
    Aired: formatDate(startDate),
    Premiered: formatSeason(media.season, media.seasonYear),
    Duration: formatDuration(media.duration),
    Status: media.status || null,
    "MAL Score": formatScore(media.averageScore),
    Genres: genres.map(capitalize),
    Studios: studios.map(capitalize),
    Producers: studios.map(capitalize),
    tvInfo
  };
  const animeTitle = title.english || title.romaji || title.native || "";
  const animeId = String(media.id);
  return {
    id: animeId,
    link: slugify(animeTitle, animeId),
    mal_id: media.id,
    ani_id: animeId,
    title: animeTitle,
    japanese_title: title.romaji || title.native || "",
    poster: coverImage.large || coverImage.extraLarge || "",
    banner: media.bannerImage || "",
    adultContent: media.isAdult || false,
    animeInfo,
    seasons: [],
    charactersVoiceActors,
    recommended_data
  };
}
export function mapAnimeList(mediaList) {
  if (!Array.isArray(mediaList)) return [];
  return mediaList.filter(media => !media?.format || ANIME_FORMATS.has(media.format)).map(media => mapAnime(media)).filter(Boolean);
}
export function mapAnimeListWithRank(mediaList) {
  if (!Array.isArray(mediaList)) return [];
  return mediaList.map((media, index) => ({
    ...mapAnime(media),
    number: index + 1
  })).filter(Boolean);
}
export function mapSchedule(schedules) {
  if (!Array.isArray(schedules)) return [];
  return schedules.map(schedule => {
    const media = schedule.media || {};
    const title = media.title || {};
    const coverImage = media.coverImage || {};
    const airingDate = new Date(schedule.airingAt * 1000);
    const time = airingDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    return {
      id: String(media.id),
      title: title.english || title.romaji || title.native || "",
      japanese_title: title.romaji || title.native || "",
      poster: coverImage.large || "",
      time,
      episode_no: schedule.episode || null,
      tvInfo: {
        sub: media.episodes || null,
        dub: null,
        showType: getShowType(media.format),
        eps: media.episodes || null,
        duration: formatDuration(media.duration)
      }
    };
  });
}
export function mapCharacters(data) {
  if (!data || !data.Media) return {
    data: [],
    totalPages: 1
  };
  const media = data.Media;
  const title = media.title || {};
  const pageInfo = media.characters?.pageInfo || {};
  return {
    id: String(media.id),
    title: title.english || title.romaji || title.native || "",
    japanese_title: title.romaji || title.native || "",
    poster: media.coverImage?.large || "",
    totalPages: pageInfo.lastPage || 1,
    currentPage: pageInfo.currentPage || 1,
    hasNextPage: pageInfo.hasNextPage || false,
    data: (media.characters?.edges || []).map(edge => {
      const character = edge.node || {};
      const voiceActors = (edge.voiceActors || []).map(va => ({
        id: va.id,
        name: va.name?.full || "",
        poster: va.image?.large || "",
        language: va.language || ""
      }));
      return {
        character: {
          id: character.id,
          name: character.name?.full || "",
          poster: character.image?.large || "",
          cast: character.description || ""
        },
        voiceActors
      };
    })
  };
}
export function mapGenres(genres) {
  if (!Array.isArray(genres)) return [];
  return genres.map(capitalize);
}
export function mapSearchResults(data) {
  if (!data || !data.Page) {
    return {
      data: [],
      pageInfo: {},
      totalPages: 0
    };
  }
  const page = data.Page;
  const pageInfo = page.pageInfo || {};
  return {
    data: mapAnimeList(page.media || []),
    pageInfo: {
      hasNextPage: pageInfo.hasNextPage || false,
      total: pageInfo.total || 0,
      currentPage: pageInfo.currentPage || 1,
      lastPage: pageInfo.lastPage || 1
    },
    totalPages: pageInfo.lastPage || 1
  };
}
export function mapCategoryResults(data) {
  if (!data || !data.Page) {
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
  const page = data.Page;
  const pageInfo = page.pageInfo || {};
  return {
    response: mapAnimeList(page.media || []),
    pageInfo: {
      hasNextPage: pageInfo.hasNextPage || false,
      total: pageInfo.total || 0,
      currentPage: pageInfo.currentPage || 1,
      lastPage: pageInfo.lastPage || 1
    }
  };
}
export function mapQtip(media) {
  if (!media) return null;
  const title = media.title || {};
  const coverImage = media.coverImage || {};
  const startDate = media.startDate || {};
  const animeTitle = title.english || title.romaji || title.native || "";
  const animeId = String(media.id);
  const formatStatus = s => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : null;
  const epCount = media.episodes || null;
  return {
    id: animeId,
    title: animeTitle,
    japaneseTitle: title.romaji || title.native || "",
    Synonyms: media.synonyms?.join(", ") || null,
    airedDate: formatDate(startDate),
    status: formatStatus(media.status),
    genres: (media.genres || []).map(capitalize),
    description: cleanDescription(media.description) || null,
    poster: coverImage.large || "",
    rating: media.averageScore ? (media.averageScore / 10).toFixed(1) : null,
    quality: null,
    subCount: epCount,
    dubCount: epCount,
    episodeCount: null,
    type: getShowType(media.format),
    watchLink: `/watch/${slugify(animeTitle, animeId)}`
  };
}
