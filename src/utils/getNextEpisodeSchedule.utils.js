import { animekaiClient, mapSchedule, getScheduleCacheKey, getFromCache, setToCache, CACHE_CONFIG } from "../services/animekai/index.js";
const formatDate = date => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
const getNextEpisodeSchedule = async animeId => {
  try {
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = formatDate(date);
      const cacheKey = getScheduleCacheKey(dateStr);
      let scheduleItems = getFromCache(cacheKey);
      if (!scheduleItems) {
        const raw = await animekaiClient.schedule(dateStr);
        scheduleItems = mapSchedule(raw?.results ?? []);
        setToCache(cacheKey, scheduleItems, CACHE_CONFIG.SCHEDULES);
      }
      const match = scheduleItems.find(s => String(s.id) === String(animeId));
      if (match) {
        let scheduledDate;
        if (match.airingTimestamp) {
          scheduledDate = new Date(match.airingTimestamp * 1000);
        } else if (match.time) {
          scheduledDate = new Date(`${dateStr} ${match.time}`);
        } else {
          scheduledDate = new Date(`${dateStr}T00:00:00`);
        }
        return {
          nextEpisodeSchedule: scheduledDate.toISOString()
        };
      }
    }
    return null;
  } catch (err) {
    console.error("Error fetching next episode schedule:", err);
    return null;
  }
};
export default getNextEpisodeSchedule;
