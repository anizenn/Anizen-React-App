import { useEffect, useRef, useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/src/context/LanguageContext";
import { useHomeInfo } from "@/src/context/HomeInfoContext";
import { useWatch } from "@/src/hooks/useWatch";
import BouncingLoader from "@/src/components/ui/bouncingloader/Bouncingloader";
import Episodelist from "@/src/components/episodelist/Episodelist";
import website_name from "@/src/config/website";
import Sidecard from "@/src/components/sidecard/Sidecard";
import CategoryCard from "@/src/components/categorycard/CategoryCard";
import { faClosedCaptioning, faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Servers from "@/src/components/servers/Servers";
import SmartIframe from "@/src/components/player/SmartIframe";
import CategoryCardLoader from "@/src/components/Loader/CategoryCard.loader";
import { Skeleton } from "@/src/components/ui/Skeleton/Skeleton";
import Voiceactor from "@/src/components/voiceactor/Voiceactor";
import Watchcontrols from "@/src/components/watchcontrols/Watchcontrols";
import useWatchControl from "@/src/hooks/useWatchControl";
function injectImageProtectionCSS() {
  if (document.getElementById("image-protection-styles")) return;
  const style = document.createElement("style");
  style.id = "image-protection-styles";
  style.textContent = `
    img {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      -webkit-user-drag: none !important;
      pointer-events: none !important;
    }
    img.interactive {
      pointer-events: auto !important;
    }
  `;
  document.head.appendChild(style);
}
function Tag({
  bgColor,
  index,
  icon,
  text
}) {
  return <div className={`flex space-x-1 justify-center items-center px-[4px] py-[1px] text-black font-semibold text-[13px] ${index === 0 ? "rounded-l-[4px]" : "rounded-none"}`} style={{
    backgroundColor: bgColor
  }}>
    {icon && <FontAwesomeIcon icon={icon} className="text-[12px]" />}
    <p className="text-[12px]">{text}</p>
  </div>;
}
function FullscreenURLIndicator({
  visible
}) {
  if (!visible) return null;
  return <div className="fixed top-0 left-0 right-0 z-[9999] bg-black bg-opacity-90 text-white px-4 py-2 text-[12px] font-mono flex items-center justify-between pointer-events-none" style={{
    backdropFilter: "blur(2px)"
  }}>
    <span className="truncate">{window.location.href}</span>
    <span className="ml-4 flex-shrink-0 text-[#cae962]">● FULLSCREEN</span>
  </div>;
}
export default function Watch() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    id: animeId
  } = useParams();
  const queryParams = new URLSearchParams(location.search);
  let initialEpisodeId = queryParams.get("ep");
  const [tags, setTags] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const {
    language
  } = useLanguage();
  const {
    homeInfo
  } = useHomeInfo();
  const isFirstSet = useRef(true);
  const [showNextEpisodeSchedule, setShowNextEpisodeSchedule] = useState(true);
  const smartIframeRef = useRef(null);
  const {
    error,
    buffering,
    streamInfo,
    animeInfo,
    episodes,
    nextEpisodeSchedule,
    animeInfoLoading,
    totalEpisodes,
    isFullOverview,
    setIsFullOverview,
    activeEpisodeNum,
    seasons,
    episodeId,
    setEpisodeId,
    activeServerId,
    setActiveServerId,
    servers,
    serverLoading,
    retry
  } = useWatch(animeId, initialEpisodeId);
  const {
    autoPlay,
    setAutoPlay,
    autoSkipIntro,
    setAutoSkipIntro,
    autoNext,
    setAutoNext
  } = useWatchControl();
  const autoSkipIntroRef = useRef(autoSkipIntro);
  useEffect(() => {
    autoSkipIntroRef.current = autoSkipIntro;
  }, [autoSkipIntro]);
  const [skipTimestamps, setSkipTimestamps] = useState(null);
  const skipTimestampsRef = useRef(null);
  useEffect(() => {
    skipTimestampsRef.current = skipTimestamps;
  }, [skipTimestamps]);
  const [skipButtonVisible, setSkipButtonVisible] = useState(null);
  const [skipCountdown, setSkipCountdown] = useState(null);
  const lastSeekAtRef = useRef(0);
  const currentTime = useRef(0);
  useEffect(() => {
    if (streamInfo?.intro || streamInfo?.outro) {
      const ts = {
        intro: streamInfo.intro ?? null,
        outro: streamInfo.outro ?? null
      };
      skipTimestampsRef.current = ts;
      setSkipTimestamps(ts);
      if (autoSkipIntroRef.current && ts.intro?.end) {
        const t = setTimeout(() => {
          smartIframeRef.current?.seekTo(ts.intro.end);
        }, 1500);
        return () => clearTimeout(t);
      }
    }
  }, [streamInfo?.intro, streamInfo?.outro]);
  useEffect(() => {
    currentTime.current = 0;
    lastSeekAtRef.current = 0;
    setSkipButtonVisible(null);
    setSkipCountdown(null);
  }, [episodeId]);
  useEffect(() => {
    if (!skipButtonVisible) {
      setSkipCountdown(null);
      return;
    }
    setSkipCountdown(3);
  }, [skipButtonVisible]);
  useEffect(() => {
    if (skipCountdown === null) return;
    if (skipCountdown === 0) {
      const endTime = skipButtonVisible === "intro" ? skipTimestampsRef.current?.intro?.end : skipTimestampsRef.current?.outro?.end;
      if (endTime) smartIframeRef.current?.seekTo(endTime);
      setSkipButtonVisible(null);
      setSkipCountdown(null);
      return;
    }
    const t = setTimeout(() => setSkipCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [skipCountdown, skipButtonVisible]);
  const embedSrc = streamInfo?.streamingLink?.iframe ? streamInfo.streamingLink.iframe.startsWith("/stream-proxy") ? `${streamInfo.streamingLink.iframe}&autoPlay=${autoPlay ? "1" : "0"}&autoSkip=${autoSkipIntro ? "1" : "0"}` : streamInfo.streamingLink.iframe : null;
  const embedFallbacks = (streamInfo?.streamingLink?.fallbackIframes ?? []).map(url => url.startsWith("/stream-proxy") ? `${url}&autoPlay=${autoPlay ? "1" : "0"}&autoSkip=${autoSkipIntro ? "1" : "0"}` : url);
  useEffect(() => {
    injectImageProtectionCSS();
    const handleImageContextMenu = e => {
      if (e.target.tagName === "IMG") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    const handleImageDragStart = e => {
      if (e.target.tagName === "IMG") {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener("contextmenu", handleImageContextMenu, true);
    document.addEventListener("dragstart", handleImageDragStart, true);
    return () => {
      document.removeEventListener("contextmenu", handleImageContextMenu, true);
      document.removeEventListener("dragstart", handleImageDragStart, true);
    };
  }, []);
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      setIsFullscreen(!!isCurrentlyFullscreen);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);
  useEffect(() => {
    const handleMessage = event => {
      let data = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || typeof data !== "object") return;
      if (data.type === "SKIP_TIMINGS") {
        const ts = {
          intro: data.intro ?? null,
          outro: data.outro ?? null
        };
        skipTimestampsRef.current = ts;
        setSkipTimestamps(ts);
        return;
      }
      if (data.event === "complete" && autoNext) {
        const idx = episodes?.findIndex(ep => String(ep.number) === String(episodeId));
        if (idx >= 0 && idx < (episodes?.length ?? 0) - 1) {
          setEpisodeId(String(episodes[idx + 1].number));
        }
        return;
      }
      const rawTime = data.time ?? data.currentTime;
      const isTimeEvent = typeof rawTime === "number" && (data.event === "time" || data.type === "time" || data.type === "timeupdate" || data.event === "timeupdate" || data.type === "VIDEO_TIME_UPDATE");
      if (isTimeEvent) {
        currentTime.current = rawTime;
        if (data.intro || data.outro) {
          const updated = {
            intro: data.intro ?? skipTimestampsRef.current?.intro ?? null,
            outro: data.outro ?? skipTimestampsRef.current?.outro ?? null
          };
          skipTimestampsRef.current = updated;
          setSkipTimestamps(updated);
        }
        const ts = skipTimestampsRef.current;
        if (!ts) return;
        const inIntro = ts.intro?.start !== undefined && rawTime >= ts.intro.start && rawTime < ts.intro.end;
        const inOutro = ts.outro?.start !== undefined && rawTime >= ts.outro.start && rawTime < ts.outro.end;
        if (inIntro || inOutro) {
          const type = inIntro ? "intro" : "outro";
          const shouldAutoSkip = autoSkipIntroRef.current;
          if (shouldAutoSkip) {
            const now = Date.now();
            if (now - lastSeekAtRef.current < 5000) return;
            lastSeekAtRef.current = now;
            const endTime = inIntro ? ts.intro?.end : ts.outro?.end;
            if (endTime) smartIframeRef.current?.seekTo(endTime);
          } else {
            setSkipButtonVisible(type);
          }
        } else {
          setSkipButtonVisible(null);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [autoNext, episodes, episodeId, autoSkipIntroRef]);
  useEffect(() => {
    if (!animeInfoLoading && animeInfo?.link && animeId !== animeInfo.link) {
      navigate(`/watch/${animeInfo.link}${episodeId ? `?ep=${episodeId}` : ""}`, {
        replace: true
      });
    }
  }, [animeInfo, animeInfoLoading, animeId, episodeId, navigate]);
  useEffect(() => {
    if (!episodes || episodes.length === 0) return;
    if (!episodeId || episodeId === "null") return;
    const isValidEpisode = episodes.some(ep => String(ep.number) === String(episodeId));
    if (!episodeId || !isValidEpisode) {
      const fallbackId = episodes[0].number ?? null;
      if (fallbackId && String(fallbackId) !== String(episodeId)) {
        setEpisodeId(String(fallbackId));
      }
      return;
    }
    const slugOrId = animeInfo?.link || animeId;
    const newUrl = `/watch/${slugOrId}?ep=${episodeId}`;
    if (isFirstSet.current) {
      navigate(newUrl, {
        replace: true
      });
      isFirstSet.current = false;
    } else {
      navigate(newUrl);
    }
  }, [episodeId, animeId, navigate, episodes, animeInfo, setEpisodeId]);
  useEffect(() => {
    if (animeInfo) {
      document.title = `Watch ${animeInfo.title} English Sub/Dub online Free on ${website_name}`;
    }
    return () => {
      document.title = `${website_name} | Free anime streaming platform`;
    };
  }, [animeId, animeInfo]);
  useEffect(() => {
    if (totalEpisodes === 0 && episodes !== null && episodes.length === 0 && animeInfo !== null) {
      navigate(`/${animeInfo?.link || animeId}`, {
        replace: true
      });
    }
  }, [episodes, animeInfo, animeId, totalEpisodes, navigate]);
  useEffect(() => {
    let ro = null;
    let mo = null;
    const episodesEl = () => document.querySelector(".episodes");
    const playerEl = () => document.querySelector(".player");
    const applyHeight = () => {
      window.requestAnimationFrame(() => {
        const p = playerEl();
        const e = episodesEl();
        if (!e || !p) return;
        if (window.innerWidth > 1200) {
          const height = Math.ceil(p.getBoundingClientRect().height);
          e.style.height = `${height}px`;
          e.style.minHeight = `${height}px`;
        } else {
          e.style.height = "auto";
          e.style.minHeight = "auto";
        }
      });
    };
    const ensureAndApply = () => {
      if (playerEl() && episodesEl()) {
        applyHeight();
        if (window.ResizeObserver) {
          ro = new ResizeObserver(applyHeight);
          ro.observe(playerEl());
        } else {
          window.addEventListener("resize", applyHeight);
          mo = new MutationObserver(applyHeight);
          mo.observe(playerEl(), {
            attributes: true,
            childList: true,
            subtree: true
          });
        }
      } else {
        const t = setTimeout(() => {
          clearTimeout(t);
          ensureAndApply();
        }, 120);
      }
    };
    ensureAndApply();
    window.addEventListener("orientationchange", applyHeight);
    return () => {
      window.removeEventListener("orientationchange", applyHeight);
      if (ro) ro.disconnect();
      if (mo) mo.disconnect();
      window.removeEventListener("resize", applyHeight);
    };
  }, [buffering, episodes]);
  useEffect(() => {
    setTags([{
      condition: animeInfo?.animeInfo?.tvInfo?.rating,
      bgColor: "#ffffff",
      text: animeInfo?.animeInfo?.tvInfo?.rating
    }, {
      condition: animeInfo?.animeInfo?.tvInfo?.quality,
      bgColor: "#cae962",
      text: animeInfo?.animeInfo?.tvInfo?.quality
    }, {
      condition: animeInfo?.animeInfo?.tvInfo?.sub,
      icon: faClosedCaptioning,
      bgColor: "#B0E3AF",
      text: animeInfo?.animeInfo?.tvInfo?.sub
    }, {
      condition: animeInfo?.animeInfo?.tvInfo?.dub,
      icon: faMicrophone,
      bgColor: "#B9E7FF",
      text: animeInfo?.animeInfo?.tvInfo?.dub
    }]);
  }, [animeId, animeInfo]);
  return <div className="w-full h-fit flex flex-col justify-center items-center relative max-[578px]:px-4">
    <FullscreenURLIndicator visible={isFullscreen} />
    <div className="-mx-[50px] [width:calc(100%+100px)] max-[578px]:mx-0 max-[578px]:w-full relative pt-[10px] max-[1400px]:px-[30px] max-[1200px]:px-[80px] max-[1024px]:px-4">
      <img src={!animeInfoLoading ? `${animeInfo?.poster}` : "/logo"} alt={`${animeInfo?.title} Poster`} className="absolute inset-0 w-full h-full object-cover filter grayscale z-[-900]" />
      <div className="absolute inset-0 bg-[#3a3948] bg-opacity-80 backdrop-blur-sm z-[-800]"></div>
      <div className="relative z-10 px-4  pb-[50px] grid grid-cols-[minmax(0,75%),minmax(0,25%)] w-full h-full mt-[30px] max-[1400px]:flex max-[1400px]:flex-col max-[1200px]:mt-[20px] max-[1024px]:px-4 max-md:mt-[15px]">
        {animeInfo && <ul className="flex absolute left-4 top-[-30px] gap-x-2 items-center w-fit max-[1200px]" style={{
          paddingTop: "5px"
        }}>
          {[["Home", "home"], [animeInfo?.animeInfo?.tvInfo?.showType, animeInfo?.animeInfo?.tvInfo?.showType]].map(([text, link], index) => <li key={index} className="flex gap-x-3 items-center">
            <Link to={`/${link}`} className="text-white hover:text-[#cae962] text-[15px] font-semibold">{text}</Link>
            <div className="dot mt-[1px] bg-white"></div>
          </li>)}
          <p className="font-light text-[15px] text-gray-300 line-clamp-1 max-[575px]:leading-5">
            Watching {language === "EN" ? animeInfo?.title : animeInfo?.japanese_title}
          </p>
        </ul>}
        <div className="flex w-full min-h-fit max-[1200px]:flex-col-reverse margin-right-[10px]">
          <div className="episodes w-[35%] bg-[#191826] flex justify-center items-center max-[1400px]:w-[380px] max-[1200px]:w-full max-[1200px]:h-full max-[1200px]:min-h-[100px]">
            {!episodes ? <BouncingLoader /> : <Episodelist episodes={episodes} currentEpisode={episodeId} onEpisodeClick={id => setEpisodeId(id)} totalEpisodes={totalEpisodes} />}
          </div>
          <div className="player w-full h-fit bg-black flex flex-col">
            <div className="w-full relative aspect-video bg-black" onContextMenu={e => e.preventDefault()}>
              {buffering ? <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
                {animeInfo?.banner && <img src={animeInfo.banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
                <BouncingLoader />
              </div> : embedSrc ? <SmartIframe ref={smartIframeRef} primarySrc={embedSrc} fallbackSrcs={embedFallbacks} className="absolute inset-0" timeoutMs={10000} itemId={animeId} title={animeInfo?.title || ''} image={animeInfo?.poster || ''} episodeId={episodeId} episodeNumber={parseInt(episodeId || '0', 10)} season={1} totalDuration={0} /> : !streamInfo || !embedSrc ? <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 text-center px-4">
                <p className="font-medium text-[15px]">
                  {error || (servers ? "This server may be down — try another server below" : "Could not load servers for this episode")}
                </p>
                <button onClick={retry} className="px-4 py-1.5 rounded-md bg-[#cae962] text-black font-semibold text-[13px]">
                  Retry
                </button>
              </div> : null}
              {skipButtonVisible && !autoSkipIntro && <button className="absolute bottom-14 right-4 z-50 px-4 py-2 bg-black/70 border border-white/30 text-white text-sm font-semibold rounded hover:bg-white/20 transition-colors" onClick={() => {
                const endTime = skipButtonVisible === "intro" ? skipTimestampsRef.current?.intro?.end : skipTimestampsRef.current?.outro?.end;
                if (endTime) smartIframeRef.current?.seekTo(endTime);
                setSkipButtonVisible(null);
                setSkipCountdown(null);
              }}>
                {skipButtonVisible === "intro" ? "Skip Intro" : "Skip Outro"}
                {skipCountdown !== null && ` (${skipCountdown})`}
              </button>}
            </div>

            {!buffering && <Watchcontrols autoPlay={autoPlay} setAutoPlay={setAutoPlay} autoSkipIntro={autoSkipIntro} setAutoSkipIntro={setAutoSkipIntro} autoNext={autoNext} setAutoNext={setAutoNext} episodes={episodes} episodeId={episodeId} onButtonClick={id => setEpisodeId(id)} />}
            <Servers servers={servers} activeEpisodeNum={activeEpisodeNum} activeServerId={activeServerId} setActiveServerId={setActiveServerId} serverLoading={serverLoading} />
            {seasons?.length > 0 && <div className="flex flex-col gap-y-2 bg-[#11101A] p-4">
              <h1 className="w-fit text-lg max-[478px]:text-[18px] font-semibold">Watch more seasons of this anime</h1>
              <div className="flex flex-wrap gap-4 max-[575px]:grid max-[575px]:grid-cols-3 max-[575px]:gap-3 max-[480px]:grid-cols-2">
                {seasons.map((season, index) => <Link to={`/${season.link || season.id || "#"}`} key={index} className={`relative w-[20%] h-[60px] rounded-lg overflow-hidden cursor-pointer group ${animeId === (season.link || String(season.id)) ? "border border-[#cae962]" : ""} max-[1200px]:w-[140px] max-[575px]:w-full`}>
                  <p className={`text-[13px] text-center font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-2 z-30 line-clamp-2 group-hover:text-[#cae962] ${animeId === (season.link || String(season.id)) ? "text-[#cae962]" : "text-white"}`}>
                    {season.season}
                  </p>
                  <div className="absolute inset-0 z-10 bg-[url('https://i.postimg.cc/pVGY6RXd/thumb.png')] bg-repeat"></div>
                  <img src={`${season.season_poster}`} alt="" className="w-full h-full object-cover blur-[3px] opacity-50" />
                </Link>)}
              </div>
            </div>}
            {nextEpisodeSchedule?.nextEpisodeSchedule && showNextEpisodeSchedule && <div className="p-4">
              <div className="w-full px-4 rounded-md bg-[#0088CC] flex items-center justify-between gap-x-2">
                <div className="w-full h-fit">
                  <span className="text-[18px]">🚀</span>
                  {" Estimated the next episode will come at "}
                  <span className="text-[13.4px] font-medium">
                    {new Date(nextEpisodeSchedule.nextEpisodeSchedule).toLocaleString("en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true
                    })}
                  </span>
                </div>
                <span className="text-[25px] h-fit font-extrabold text-[#80C4E6] mb-1 cursor-pointer" onClick={() => setShowNextEpisodeSchedule(false)}>×</span>
              </div>
            </div>}
          </div>
        </div>
        <div className="flex flex-col gap-y-4 items-start ml-8 max-[1400px]:ml-0 max-[1400px]:mt-10 max-[1400px]:flex-row max-[1400px]:gap-x-6 max-[1024px]:px-[30px] max-[1024px]:mt-8 max-[500px]:mt-4 max-[500px]:px-4">
          {animeInfo && animeInfo?.poster ? <img src={`${animeInfo?.poster}`} alt="" className="w-[100px] h-[150px] object-cover max-[500px]:w-[70px] max-[500px]:h-[90px]" /> : <Skeleton className="w-[100px] h-[150px] rounded-none" />}
          <div className="flex flex-col gap-y-4 justify-start">
            {animeInfo && animeInfo?.title ? <p className="text-[26px] font-medium leading-6 max-[500px]:text-[18px]">
              {language === "EN" ? animeInfo?.title : animeInfo?.japanese_title}
            </p> : <Skeleton className="w-[170px] h-[20px] rounded-xl" />}
            <div className="flex flex-wrap w-fit gap-x-[2px] gap-y-[3px]">
              {animeInfo ? tags.map(({
                condition,
                icon,
                bgColor,
                text
              }, index) => condition && <Tag key={index} index={index} bgColor={bgColor} icon={icon} text={text} />) : <Skeleton className="w-[70px] h-[20px] rounded-xl" />}
              <div className="flex w-fit items-center ml-1">
                {[animeInfo?.animeInfo?.tvInfo?.showType, animeInfo?.animeInfo?.tvInfo?.duration].map((item, index) => item && <div key={index} className="px-1 h-fit flex items-center gap-x-2 w-fit">
                  <div className="dot mt-[2px]"></div>
                  <p className="text-[14px]">{item}</p>
                </div>)}
              </div>
            </div>
            {animeInfo ? animeInfo?.animeInfo?.Overview && <div className="max-h-[150px] overflow-hidden">
              <div className="max-h-[110px] mt-2 overflow-y-auto">
                <p className="text-[14px] font-[400]">
                  {animeInfo?.animeInfo?.Overview.length > 270 ? <>
                    {isFullOverview ? animeInfo?.animeInfo?.Overview : `${animeInfo?.animeInfo?.Overview.slice(0, 270)}...`}
                    <span className="text-[13px] font-bold hover:cursor-pointer" onClick={() => setIsFullOverview(!isFullOverview)}>
                      {isFullOverview ? "- Less" : "+ More"}
                    </span>
                  </> : animeInfo?.animeInfo?.Overview}
                </p>
              </div>
            </div> : <div className="flex flex-col gap-y-2">
              <Skeleton className="w-[200px] h-[10px] rounded-xl" />
              <Skeleton className="w-[160px] h-[10px] rounded-xl" />
              <Skeleton className="w-[100px] h-[10px] rounded-xl" />
              <Skeleton className="w-[80px] h-[10px] rounded-xl" />
            </div>}
            <p className="text-[14px] max-[575px]:hidden">
              {`${website_name} is the best site to watch `}
              <span className="font-bold">{language === "EN" ? animeInfo?.title : animeInfo?.japanese_title}</span>
              {` SUB online, or you can even watch `}
              <span className="font-bold">{language === "EN" ? animeInfo?.title : animeInfo?.japanese_title}</span>
              {` DUB in HD quality.`}
            </p>
            <Link to={`/${animeInfo?.link || animeId}`} className="w-fit text-[15px] bg-white rounded-[12px] px-[15px] py-1 text-black">
              View detail
            </Link>
          </div>
        </div>
      </div>
    </div>
    <div className="w-full px-4 grid grid-cols-[minmax(0,75%),minmax(0,25%)] gap-x-6 max-[1200px]:flex flex-col">
      <div className="mt-[15px] flex flex-col gap-y-7">
        {animeInfo?.mal_id && <Voiceactor animeInfo={animeInfo} className="!mt-0" />}
        {animeInfo?.recommended_data?.length > 0 ? <CategoryCard label="Recommended for you" data={animeInfo?.recommended_data} limit={animeInfo?.recommended_data.length} showViewMore={false} /> : <CategoryCardLoader className={"mt-[15px]"} />}
      </div>
      <div>
        {homeInfo && homeInfo.most_popular && <Sidecard label="Most Popular" data={homeInfo.most_popular.slice(0, 10)} className="mt-[15px]" limit={10} />}
      </div>
    </div>
  </div>;
}