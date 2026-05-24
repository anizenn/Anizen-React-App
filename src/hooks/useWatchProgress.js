import { useCallback } from "react";
import { saveContinueWatch } from "@/src/utils/continueWatchingUtils";
export function useWatchProgress(options = {}) {
  const {
    itemId,
    title,
    image,
    episodeId = null,
    episodeNumber = 0,
    season = 1,
    totalDuration = 0,
    enabled = true
  } = options;
  const saveProgress = useCallback(currentTime => {
    if (!enabled || !itemId) return;
    saveContinueWatch({
      id: itemId,
      title: title || "Unknown Title",
      image: image || "",
      episodeId,
      episodeNumber,
      season,
      progress: currentTime,
      totalDuration,
      lastWatched: Date.now()
    });
  }, [enabled, itemId, title, image, episodeId, episodeNumber, season, totalDuration]);
  return {
    saveProgress
  };
}
export default useWatchProgress;
