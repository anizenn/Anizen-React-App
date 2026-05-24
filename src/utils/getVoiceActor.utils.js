import { graphqlClient, CHARACTERS_QUERY, getCharactersCacheKey, getFromCache, setToCache, CACHE_CONFIG, mapCharacters, proxyImageUrl } from "../services/anilist/index.js";
export default async function fetchVoiceActorInfo(malId, page = 1) {
  try {
    const cacheKey = `${getCharactersCacheKey(malId)}_page${page}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    const result = await graphqlClient.query(CHARACTERS_QUERY, {
      id: parseInt(malId),
      page,
      perPage: 20
    });
    const mapped = mapCharacters(result.data);
    if (mapped && mapped.data) {
      mapped.data = mapped.data.map(item => ({
        ...item,
        character: {
          ...item.character,
          poster: proxyImageUrl(item.character.poster)
        },
        voiceActors: item.voiceActors.map(va => ({
          ...va,
          poster: proxyImageUrl(va.poster)
        }))
      }));
    }
    setToCache(cacheKey, mapped, CACHE_CONFIG.CHARACTERS);
    return mapped;
  } catch (error) {
    console.error("Error fetching voice actor info:", error);
    throw error;
  }
}
