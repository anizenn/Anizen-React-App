const CONTINUE_WATCHING_KEY = "anizen_continue_watching";
const VERSION_KEY = "anizen_cw_version";
const CURRENT_VERSION = "1.0";
export function saveContinueWatch(item) {
  try {
    const continueWatching = getContinueWatchList();
    const filtered = continueWatching.filter(entry => entry.id !== item.id);
    const newEntry = {
      id: item.id,
      title: item.title,
      image: item.image,
      episodeId: item.episodeId || null,
      episodeNumber: item.episodeNumber || 0,
      season: item.season || 1,
      progress: item.progress || 0,
      totalDuration: item.totalDuration || 0,
      lastWatched: Date.now(),
      version: CURRENT_VERSION
    };
    const updated = [newEntry, ...filtered].slice(0, 50);
    localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(updated));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    return true;
  } catch (error) {
    console.error('Failed to save continue watching:', error);
    return false;
  }
}
export function getContinueWatchList() {
  try {
    const version = localStorage.getItem(VERSION_KEY);
    const data = localStorage.getItem(CONTINUE_WATCHING_KEY);
    if (!data || version !== CURRENT_VERSION) {
      if (version && version !== CURRENT_VERSION) {
        localStorage.removeItem(CONTINUE_WATCHING_KEY);
        localStorage.removeItem(VERSION_KEY);
      }
      return [];
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load continue watching:', error);
    localStorage.removeItem(CONTINUE_WATCHING_KEY);
    localStorage.removeItem(VERSION_KEY);
    return [];
  }
}
export function removeFromContinueWatch(itemId) {
  try {
    const continueWatching = getContinueWatchList();
    const filtered = continueWatching.filter(entry => entry.id !== itemId);
    localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to remove from continue watching:', error);
    return false;
  }
}
export function migrateLegacyData() {
  try {
    const legacyData = localStorage.getItem('continueWatching');
    if (legacyData) {
      try {
        const parsed = JSON.parse(legacyData);
        if (Array.isArray(parsed)) {
          const migrated = parsed.map(item => ({
            id: item.id || item.mal_id || Date.now().toString(),
            title: item.title || item.name || 'Unknown Title',
            image: item.image || item.img_path || '',
            episodeId: item.episode_id || null,
            episodeNumber: item.episode_number || 0,
            season: item.season || 1,
            progress: item.progress || 0,
            totalDuration: item.total_duration || 0,
            lastWatched: item.last_watched || Date.now(),
            version: CURRENT_VERSION
          }));
          localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(migrated));
          localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
          localStorage.removeItem('continueWatching');
          return true;
        }
      } catch {
        localStorage.removeItem('continueWatching');
      }
    }
    return false;
  } catch (error) {
    console.error('Failed to migrate legacy data:', error);
    return false;
  }
}
