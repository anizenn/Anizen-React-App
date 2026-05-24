import axios from "axios";
import { getFromCache, setToCache, removeFromCache } from "./cache.js";
const ANILIST_API_URL = "https://graphql.anilist.co";
class AniListClient {
  constructor() {
    this.client = axios.create({
      baseURL: ANILIST_API_URL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });
  }
  async query(query, variables = {}) {
    try {
      const response = await this.client.post("", {
        query,
        variables
      });
      return response.data;
    } catch (error) {
      console.error("AniList GraphQL query error:", error);
      throw new Error(`AniList API error: ${error.message}`);
    }
  }
  async queryWithCache(query, variables = {}, cacheKey, cacheDuration = 5 * 60 * 1000) {
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
    const result = await this.query(query, variables);
    setToCache(cacheKey, result, cacheDuration);
    return result;
  }
  clearCache(key = null) {
    if (key) removeFromCache(key);
  }
}
export default new AniListClient();
