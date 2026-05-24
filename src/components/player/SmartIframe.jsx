import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { useWatchProgress } from "@/src/hooks/useWatchProgress";
function appendTimeParam(src, time) {
  try {
    const url = new URL(src, window.location.origin);
    url.searchParams.set("t", String(time));
    url.searchParams.set("start", String(time));
    return url.toString();
  } catch {
    return src;
  }
}
const SmartIframe = forwardRef(function SmartIframe({
  primarySrc,
  fallbackSrcs = [],
  className = "",
  timeoutMs = 10000,
  itemId = null,
  title = "",
  image = "",
  episodeId = null,
  episodeNumber = 0,
  season = 1,
  totalDuration = 0
}, ref) {
  const allSrcs = [primarySrc, ...fallbackSrcs].filter(Boolean);
  const [srcIndex, setSrcIndex] = useState(0);
  const [showBtn, setShowBtn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const timerRef = useRef(null);
  const btnTimerRef = useRef(null);
  const confirmedRef = useRef(false);
  const mountedRef = useRef(true);
  const seekTimeRef = useRef(0);
  const {
    saveProgress
  } = useWatchProgress({
    itemId,
    title,
    image,
    episodeId,
    episodeNumber,
    season,
    totalDuration
  });
  const progressIntervalRef = useRef(null);
  const iframeRef = useRef(null);
  const currentSrc = allSrcs[srcIndex] ?? null;
  const hasNext = srcIndex < allSrcs.length - 1;
  useImperativeHandle(ref, () => ({
    seekTo(time) {
      const t = Math.floor(time);
      try {
        const win = iframeRef.current?.contentWindow;
        if (win) {
          win.postMessage({
            type: "seek",
            time: t
          }, "*");
          win.postMessage({
            event: "seek",
            time: t
          }, "*");
          win.postMessage({
            action: "seek",
            value: t
          }, "*");
        }
      } catch {
        seekTimeRef.current = t;
        setIsLoading(true);
        setShowBtn(false);
        setRetryKey(k => k + 1);
      }
    }
  }));
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  useEffect(() => {
    if (!currentSrc) return;
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: "GET_VIDEO_TIME"
        }, "*");
      }
    }, 10000);
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentSrc]);
  useEffect(() => {
    const handleMessage = event => {
      if (event.data?.type === "VIDEO_TIME_UPDATE") {
        const {
          currentTime
        } = event.data;
        if (typeof currentTime === "number" && !isNaN(currentTime)) {
          saveProgress(currentTime);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [saveProgress]);
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      try {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: "GET_VIDEO_TIME"
          }, "*");
        }
      } catch (error) {
        void error;
      }
    };
  }, []);
  const tryNext = useCallback(() => {
    if (!hasNext) return;
    clearTimeout(timerRef.current);
    clearTimeout(btnTimerRef.current);
    confirmedRef.current = false;
    seekTimeRef.current = 0;
    setIsLoading(true);
    setShowBtn(false);
    setSrcIndex(i => i + 1);
  }, [hasNext]);
  const retryCurrentSrc = useCallback(() => {
    clearTimeout(timerRef.current);
    clearTimeout(btnTimerRef.current);
    confirmedRef.current = false;
    seekTimeRef.current = 0;
    setIsLoading(true);
    setShowBtn(false);
    setRetryKey(k => k + 1);
  }, []);
  useEffect(() => {
    confirmedRef.current = false;
    seekTimeRef.current = 0;
    setIsLoading(true);
    setSrcIndex(0);
    setShowBtn(false);
    setRetryKey(0);
  }, [primarySrc]);
  useEffect(() => {
    if (!currentSrc) return;
    clearTimeout(timerRef.current);
    clearTimeout(btnTimerRef.current);
    btnTimerRef.current = setTimeout(() => {
      if (mountedRef.current && !confirmedRef.current) setShowBtn(true);
    }, 4000);
    if (hasNext) {
      timerRef.current = setTimeout(() => {
        if (mountedRef.current && !confirmedRef.current) tryNext();
      }, timeoutMs);
    }
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(btnTimerRef.current);
    };
  }, [srcIndex, retryKey, currentSrc, hasNext, timeoutMs, tryNext]);
  useEffect(() => {
    if (!currentSrc) return;
    let origin;
    try {
      origin = new URL(currentSrc).origin;
    } catch {
      return;
    }
    const onMessage = e => {
      if (e.origin !== origin) return;
      let data = e.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || typeof data !== "object") return;
      if (data.event === "error") {
        if (!confirmedRef.current) {
          if (hasNext) tryNext();else retryCurrentSrc();
        }
        return;
      }
      if (!confirmedRef.current) {
        confirmedRef.current = true;
        clearTimeout(timerRef.current);
        clearTimeout(btnTimerRef.current);
        setShowBtn(false);
        setIsLoading(false);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [currentSrc, hasNext, tryNext, retryCurrentSrc]);
  const handleIframeLoad = useCallback(() => {
    seekTimeRef.current = 0;
    setIsLoading(false);
  }, []);
  if (!currentSrc) return null;
  const iframeSrc = seekTimeRef.current > 0 ? appendTimeParam(currentSrc, seekTimeRef.current) : currentSrc;
  return <div className={`relative w-full h-full ${className}`}>
      {isLoading && <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-white/20 border-t-[#cae962] rounded-full animate-spin" />
            <span className="text-white/50 text-xs">Loading player...</span>
          </div>
        </div>}
      <iframe key={`${currentSrc}-${retryKey}`} ref={iframeRef} src={iframeSrc} frameBorder="0" allowFullScreen allow="autoplay; fullscreen; picture-in-picture; encrypted-media" sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock allow-popups allow-popups-to-escape-sandbox" className="w-full h-full" style={{
      border: "none"
    }} title="Anime player" onLoad={handleIframeLoad} />
      {showBtn && <div className="absolute top-0 left-0 right-0 z-50 flex items-center gap-3 bg-black/90 border-b border-white/10 px-4 py-2.5">
          <span className="text-yellow-400 text-[13px]">⚠</span>
          <span className="text-white/80 text-[12px] flex-1">Source not loading</span>
          <button onClick={() => setShowBtn(false)} className="text-white/40 text-[12px] px-2 hover:text-white/70 transition-colors flex-shrink-0" title="Dismiss">
            ✕
          </button>
          {hasNext ? <button onClick={tryNext} className="text-[12px] font-semibold bg-[#cae962] text-black px-3 py-1 rounded hover:bg-[#b8d44e] transition-colors flex-shrink-0">
              Try next source
            </button> : <button onClick={retryCurrentSrc} className="text-[12px] font-semibold bg-[#cae962] text-black px-3 py-1 rounded hover:bg-[#b8d44e] transition-colors flex-shrink-0">
              Reload
            </button>}
        </div>}
    </div>;
});
export default SmartIframe;
