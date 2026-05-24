import { useRef, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { useLanguage } from "@/src/context/LanguageContext";
import useToolTipPosition from "@/src/hooks/useToolTipPosition";
import pb from "@/src/lib/pocketbase";
import { toast } from "react-toastify";
import axios from "axios";
import { animekaiClient } from "@/src/services/animekai/index.js";
import getQtip from "@/src/utils/getQtip.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faLock } from "@fortawesome/free-solid-svg-icons";
import { faClosedCaptioning, faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { Skeleton } from "@/src/components/ui/Skeleton/Skeleton";
import PageSlider from "@/src/components/pageslider/PageSlider";
import Qtip from "@/src/components/qtip/Qtip";
const T = {
     bg: "#242428",
     surface: "#1a1b1e",
     surface2: "#202125",
     border: "rgba(255,255,255,0.08)",
     lime: "#cae962",
     pink: "#e9376b",
     textPrimary: "#e5e7eb",
     textSecondary: "#9ca3af",
     textMuted: "#6b7280"
};
function CalendarHeatmap({
     data
}) {
     const today = new Date();
     const weeks = [];
     const startDay = new Date(today.getFullYear(), 0, 1);
     startDay.setDate(startDay.getDate() - startDay.getDay());
     for (let w = 0; w < 53; w++) {
          const week = [];
          for (let d = 0; d < 7; d++) {
               const date = new Date(startDay);
               date.setDate(startDay.getDate() + w * 7 + d);
               const key = date.toISOString().substring(0, 10);
               week.push({
                    date,
                    key,
                    count: data[key] || 0
               });
          }
          weeks.push(week);
     }
     const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
     const days = ["", "M", "", "W", "", "F", ""];
     const getColor = count => {
          if (!count) return T.surface2;
          if (count >= 10) return T.lime;
          if (count >= 5) return "#a8d44a";
          if (count >= 2) return "#7fb832";
          return "#5a8522";
     };
     const CELL_GAP = 3;
     const DAY_LABEL_W = 18;
     const ROW_H = 14;
     const GRID_H = ROW_H * 7 + CELL_GAP * 6;
     return <div style={{
          width: "100%",
          minWidth: "480px"
     }}>
          <div style={{
               display: "flex",
               marginLeft: DAY_LABEL_W + CELL_GAP,
               marginBottom: 4
          }}>
               {weeks.map((week, wi) => {
                    const first = week[0].date;
                    const show = first.getDate() <= 7 && first.getDay() === 0;
                    return <div key={wi} style={{
                         flex: 1,
                         fontSize: "11px",
                         color: T.textMuted,
                         overflow: "visible",
                         whiteSpace: "nowrap",
                         minWidth: 0
                    }}>
                         {show ? months[first.getMonth()] : ""}
                    </div>;
               })}
          </div>

          <div style={{
               display: "flex",
               gap: CELL_GAP,
               alignItems: "stretch",
               height: GRID_H
          }}>
               <div style={{
                    width: DAY_LABEL_W,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    flexShrink: 0
               }}>
                    {days.map((d, i) => <div key={i} style={{
                         height: ROW_H,
                         fontSize: "11px",
                         color: T.textMuted,
                         lineHeight: `${ROW_H}px`,
                         textAlign: "right",
                         paddingRight: 4
                    }}>
                         {d}
                    </div>)}
               </div>

               {weeks.map((week, wi) => <div key={wi} style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: CELL_GAP,
                    minWidth: 0
               }}>
                    {week.map((cell, di) => {
                         const out = cell.date.getFullYear() !== today.getFullYear();
                         return <div key={di} title={cell.count > 0 ? `${cell.count} ep${cell.count !== 1 ? "s" : ""} on ${cell.date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric"
                         })}` : cell.key} style={{
                              flex: 1,
                              borderRadius: 3,
                              background: out ? "transparent" : getColor(cell.count),
                              cursor: cell.count > 0 ? "pointer" : "default",
                              opacity: out ? 0 : 1,
                              transition: "background 150ms"
                         }} />;
                    })}
               </div>)}
          </div>

          <div style={{
               display: "flex",
               gap: "6px",
               alignItems: "center",
               marginTop: "10px",
               justifyContent: "flex-end"
          }}>
               <span style={{
                    fontSize: "12px",
                    color: T.textMuted
               }}>Less</span>
               {[T.surface2, "#5a8522", "#7fb832", "#a8d44a", T.lime].map((c, i) => <div key={i} style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "3px",
                    background: c
               }} />)}
               <span style={{
                    fontSize: "12px",
                    color: T.textMuted
               }}>More</span>
          </div>
     </div>;
}
function AnimeHeatmap({
     userId
}) {
     const [heatmapData, setHeatmapData] = useState({});
     const [totalCount, setTotalCount] = useState(0);
     const [loading, setLoading] = useState(true);
     useEffect(() => {
          if (!userId) return;
          (async () => {
               try {
                    const bookmarkRecords = await pb.collection("bookmarks").getFullList({
                         filter: `user = "${userId}"`,
                         fields: "watchHistory",
                         requestKey: null
                    });
                    const watchedIds = [...new Set(bookmarkRecords.flatMap(b => Array.isArray(b.watchHistory) ? b.watchHistory : []))];
                    if (watchedIds.length === 0) {
                         setLoading(false);
                         return;
                    }
                    const filter = watchedIds.map(id => `id = "${id}"`).join(" || ");
                    const watchedRecords = await pb.collection("watched").getFullList({
                         filter,
                         fields: "created",
                         requestKey: null
                    });
                    const daily = {};
                    let total = 0;
                    watchedRecords.forEach(r => {
                         const day = r.created.substring(0, 10);
                         daily[day] = (daily[day] || 0) + 1;
                         total++;
                    });
                    setHeatmapData(daily);
                    setTotalCount(total);
               } catch (err) {
                    console.error("Heatmap error:", err);
               } finally {
                    setLoading(false);
               }
          })();
     }, [userId]);
     if (loading) return <p style={{
          color: T.textMuted,
          fontSize: "14px"
     }}>Loading activity…</p>;
     return <>
          <p style={{
               fontSize: "15px",
               fontWeight: 700,
               marginBottom: "16px",
               color: T.textPrimary
          }}>
               Watched <span style={{
                    color: T.lime
               }}>{totalCount}</span> episode{totalCount !== 1 ? "s" : ""} this year
          </p>
          <CalendarHeatmap data={heatmapData} />
     </>;
}
function AnimeCard({
     href,
     infoHref,
     poster,
     title,
     japaneseTitle,
     animeId,
     watchDetail,
     flash,
     qtipData
}) {
     const navigate = useNavigate();
     const {
          language
     } = useLanguage();
     const [hoveredItem, setHoveredItem] = useState(null);
     const [hoverTimeout, setHoverTimeout] = useState(null);
     const [showPlay, setShowPlay] = useState(false);
     const stableData = [{
          id: animeId
     }];
     const {
          tooltipPosition,
          tooltipHorizontalPosition,
          cardRefs
     } = useToolTipPosition(hoveredItem, stableData);
     const displayTitle = language === "JP" ? japaneseTitle || qtipData?.japanese_title || title : title;
     const handleMouseEnter = () => {
          const t = setTimeout(() => {
               setHoveredItem(animeId + "0");
               setShowPlay(true);
          }, 400);
          setHoverTimeout(t);
     };
     const handleMouseLeave = () => {
          clearTimeout(hoverTimeout);
          setHoveredItem(null);
          setShowPlay(false);
     };
     const imageSrc = qtipData?.poster || poster;
     const isHovered = hoveredItem === animeId + "0";
     return <div className={`flex flex-col transition-transform duration-300 ease-in-out${flash ? " card-flash" : ""}`} style={{
          height: "fit-content"
     }}>
          <div className="w-full relative group hover:cursor-pointer" onClick={() => navigate(href)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
               {isHovered && showPlay && <FontAwesomeIcon icon={faPlay} className="text-[40px] text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000]" />}
               <div className="overlay" />
               <div className="overflow-hidden" ref={el => cardRefs.current[0] = el}>
                    <img src={imageSrc} alt={title} className={`w-full h-[250px] object-cover max-[1200px]:h-[35vw] max-[758px]:h-[45vw] max-[478px]:h-[60vw] transform transition-all duration-300 ease-in-out ${isHovered ? "blur-[7px]" : ""}`} loading="lazy" />
               </div>

               <div className="absolute left-2 bottom-4 flex items-center justify-center w-fit space-x-1 z-[100] max-[270px]:flex-col max-[270px]:gap-y-[3px]">
                    {qtipData?.subCount && <div className="flex space-x-1 justify-center items-center bg-[#B0E3AF] rounded-[2px] px-[4px] text-black py-[2px]">
                         <FontAwesomeIcon icon={faClosedCaptioning} className="text-[12px]" />
                         <p className="text-[12px] font-bold">{qtipData.subCount}</p>
                    </div>}
                    {qtipData?.dubCount && <div className="flex space-x-1 justify-center items-center bg-[#B9E7FF] rounded-[2px] px-[8px] text-black py-[2px]">
                         <FontAwesomeIcon icon={faMicrophone} className="text-[12px]" />
                         <p className="text-[12px] font-bold">{qtipData.dubCount}</p>
                    </div>}
                    {watchDetail && <div className="flex space-x-1 justify-center items-center bg-[#a9a6b16f] rounded-[2px] px-[8px] text-white py-[2px]">
                         <p className="text-[12px] font-extrabold">Ep {watchDetail.episodeNumber}</p>
                    </div>}
               </div>

               {isHovered && window.innerWidth > 1024 && <div className={`absolute ${tooltipPosition} ${tooltipHorizontalPosition} z-[100000] transform transition-all duration-300 ease-in-out opacity-100 translate-y-0`}>
                    <Qtip id={animeId} />
               </div>}
          </div>

          <Link to={infoHref} className="text-white font-semibold mt-1 item-title hover:text-[#cae962] hover:cursor-pointer">
               <div className="line-clamp-1">{displayTitle}</div>
          </Link>

          <div className="flex items-center gap-x-2 w-full mt-2 overflow-hidden">
               {qtipData?.type && <div className="text-gray-400 text-[14px] text-nowrap overflow-hidden text-ellipsis">
                    {qtipData.type.split(" ").shift()}
               </div>}
               {qtipData?.type && qtipData?.episodeCount && <div className="dot" />}
               {qtipData?.episodeCount && <div className="text-gray-400 text-[14px] text-nowrap overflow-hidden text-ellipsis">
                    {qtipData.episodeCount} eps
               </div>}
          </div>
     </div>;
}
function AnimeListLoader() {
     return <div className="grid grid-cols-6 gap-x-3 gap-y-8 mt-6 max-[1400px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-2">
          {[...Array(12)].map((_, i) => <div key={i} className="flex flex-col" style={{
               height: "fit-content"
          }}>
               <div className="w-full relative">
                    <Skeleton className="w-full h-[250px] object-cover max-[1200px]:h-[35vw] max-[758px]:h-[45vw] max-[478px]:h-[60vw] rounded-none" />
                    <div className="absolute left-2 bottom-4 flex items-center justify-center w-fit space-x-1 z-20">
                         <Skeleton className="w-[40px] h-[16px] rounded-[2px] bg-gray-600" />
                    </div>
               </div>
               <Skeleton className="mt-2 w-[90%] h-[14px]" />
               <div className="flex items-center gap-x-2 w-full mt-2">
                    <Skeleton className="w-[35%] h-[12px]" />
               </div>
          </div>)}
     </div>;
}
function AnimeLists({
     status,
     userId
}) {
     const [bookmarks, setBookmarks] = useState([]);
     const [isLoading, setIsLoading] = useState(true);
     const [currentPage, setCurrentPage] = useState(1);
     const [totalPages, setTotalPages] = useState(1);
     const [flashIds, setFlashIds] = useState(new Set());
     const [qtipMap, setQtipMap] = useState({});
     const qtipMapRef = useRef({});
     const fetchingRef = useRef(new Set());
     const currentPageRef = useRef(currentPage);
     const PER_PAGE = 12;
     useEffect(() => {
          currentPageRef.current = currentPage;
     }, [currentPage]);
     useEffect(() => {
          qtipMapRef.current = qtipMap;
     }, [qtipMap]);
     const flash = id => {
          setFlashIds(f => new Set([...f, id]));
          setTimeout(() => setFlashIds(f => {
               const s = new Set(f);
               s.delete(id);
               return s;
          }), 900);
     };
     const fetchBookmarks = useCallback(async page => {
          if (!userId) return;
          setIsLoading(true);
          try {
               const result = await pb.collection("bookmarks").getList(page, PER_PAGE, {
                    filter: `user = "${userId}" && status = "${status}"`,
                    sort: "-updated",
                    expand: "watchHistory",
                    requestKey: `bookmarks-list-${userId}-${status}-${page}`
               });
               setBookmarks(result.items);
               setTotalPages(result.totalPages);
          } catch (err) {
               console.error("Error fetching bookmarks:", err);
          } finally {
               setIsLoading(false);
          }
     }, [userId, status]);
     useEffect(() => {
          if (!userId) return;
          let unsubFn = null;
          (async () => {
               try {
                    unsubFn = await pb.collection("bookmarks").subscribe("*", e => {
                         const rec = e.record;
                         if (rec.user !== userId) return;
                         if (e.action === "create") {
                              if (rec.status !== status) return;
                              if (currentPageRef.current !== 1) {
                                   setTotalPages(t => Math.ceil((t * PER_PAGE + 1) / PER_PAGE));
                                   return;
                              }
                              setBookmarks(prev => {
                                   if (prev.find(b => b.id === rec.id)) return prev;
                                   flash(rec.id);
                                   return [rec, ...prev].slice(0, PER_PAGE);
                              });
                         }
                         if (e.action === "update") {
                              if (rec.status === status) {
                                   setBookmarks(prev => {
                                        const idx = prev.findIndex(b => b.id === rec.id);
                                        if (idx !== -1) {
                                             const next = [...prev];
                                             next[idx] = {
                                                  ...next[idx],
                                                  ...rec
                                             };
                                             return next;
                                        }
                                        if (currentPageRef.current !== 1) return prev;
                                        flash(rec.id);
                                        return [rec, ...prev].slice(0, PER_PAGE);
                                   });
                              } else {
                                   setBookmarks(prev => {
                                        const next = prev.filter(b => b.id !== rec.id);
                                        if (next.length < prev.length) fetchBookmarks(currentPageRef.current);
                                        return next;
                                   });
                              }
                         }
                         if (e.action === "delete") {
                              setBookmarks(prev => {
                                   const next = prev.filter(b => b.id !== rec.id);
                                   if (next.length < prev.length) fetchBookmarks(currentPageRef.current);
                                   return next;
                              });
                         }
                    }, {
                         filter: `user = "${userId}"`
                    });
               } catch (err) {
                    console.warn("Realtime subscribe error:", err);
               }
          })();
          return () => {
               unsubFn?.();
          };
     }, [userId, status]);
     useEffect(() => {
          fetchBookmarks(currentPage);
     }, [currentPage, fetchBookmarks]);
     useEffect(() => {
          setCurrentPage(1);
          setQtipMap({});
          qtipMapRef.current = {};
          fetchingRef.current = new Set();
     }, [status]);
     useEffect(() => {
          if (bookmarks.length === 0) return;
          let cancelled = false;
          const fetchMissing = async () => {
               const missing = bookmarks.filter(bm => !qtipMapRef.current[bm.animeId] && !fetchingRef.current.has(bm.animeId));
               if (missing.length === 0) return;
               missing.forEach(bm => fetchingRef.current.add(bm.animeId));
               const BATCH = 3;
               const DELAY = 500;
               for (let i = 0; i < missing.length; i += BATCH) {
                    if (cancelled) {
                         missing.slice(i).forEach(bm => fetchingRef.current.delete(bm.animeId));
                         return;
                    }
                    const batch = missing.slice(i, i + BATCH);
                    const results = await Promise.allSettled(batch.map(async bm => {
                         const qtip = await getQtip(bm.animeId);
                         return {
                              animeId: bm.animeId,
                              qtip
                         };
                    }));
                    const patch = {};
                    results.forEach(r => {
                         if (r.status === "fulfilled" && r.value.qtip) {
                              patch[r.value.animeId] = r.value.qtip;
                         }
                         if (r.status === "fulfilled") fetchingRef.current.delete(r.value.animeId);
                    });
                    if (!cancelled && Object.keys(patch).length > 0) {
                         setQtipMap(prev => ({
                              ...prev,
                              ...patch
                         }));
                    }
                    if (i + BATCH < missing.length) {
                         await new Promise(res => setTimeout(res, DELAY));
                    }
               }
          };
          fetchMissing();
          return () => {
               cancelled = true;
          };
     }, [bookmarks]);
     if (isLoading) return <AnimeListLoader />;
     if (!bookmarks.length) {
          return <div className="flex justify-center items-center h-[200px]">
               <p style={{
                    color: T.textMuted
               }}>No anime found</p>
          </div>;
     }
     return <>
          <div className="grid grid-cols-6 gap-x-3 gap-y-8 mt-6 max-[1400px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-2">
               {bookmarks.map(bm => {
                    const latestEp = bm.expand?.watchHistory ? [...bm.expand.watchHistory].sort((a, b) => b.episodeNumber - a.episodeNumber)[0] : null;
                    const watchHref = latestEp ? `/watch/${bm.animeId}?ep=${latestEp.episodeId}` : `/watch/${bm.animeId}`;
                    const infoHref = `/${bm.animeId}`;
                    const qtipData = qtipMap[bm.animeId] || null;
                    return <AnimeCard key={bm.id} href={watchHref} infoHref={infoHref} poster={bm.thumbnail} title={bm.animeTitle} japaneseTitle={qtipMap[bm.animeId]?.japanese_title} animeId={bm.animeId} watchDetail={latestEp} flash={flashIds.has(bm.id)} qtipData={qtipData} />;
               })}
          </div>

          {totalPages > 1 && <PageSlider page={currentPage} totalPages={totalPages} handlePageChange={p => setCurrentPage(p)} />}
     </>;
}
const ANILIST_STATUS_MAP = {
     CURRENT: "watching",
     COMPLETED: "completed",
     PLANNING: "plan to watch",
     DROPPED: "dropped",
     PAUSED: "on hold",
     REPEATING: "watching"
};
function AnilistImport({
     userId
}) {
     const [open, setOpen] = useState(false);
     const [step, setStep] = useState(1);
     const [username, setUsername] = useState("");
     const [lists, setLists] = useState([]);
     const [isLoading, setIsLoading] = useState(false);
     const reset = () => {
          setStep(1);
          setUsername("");
          setLists([]);
          setIsLoading(false);
     };
     const fetchAnilistData = async () => {
          if (!username.trim()) {
               toast.warning("Please enter a valid AniList username");
               return;
          }
          setIsLoading(true);
          try {
               const res = await axios.post("https://graphql.anilist.co", {
                    query: `query ($username: String) { MediaListCollection(type: ANIME, userName: $username) { lists { name status entries { media { id idMal title { english romaji } coverImage { large } } } } } }`,
                    variables: {
                         username: username.trim()
                    }
               });
               const data = res.data?.data?.MediaListCollection?.lists;
               if (!data?.length) {
                    toast.error("No anime lists found for that username");
                    setIsLoading(false);
                    return;
               }
               setLists(data);
               setStep(2);
          } catch (err) {
               toast.error("Failed to fetch AniList data. Check the username.");
               console.error(err);
          } finally {
               setIsLoading(false);
          }
     };
     const importAnimes = async () => {
          if (!userId) return;
          setIsLoading(true);
          let imported = 0,
               failed = 0;
          for (const list of lists) {
               const pbStatus = ANILIST_STATUS_MAP[list.status] || "watching";
               for (const entry of list.entries) {
                    const titleToSearch = entry.media?.title?.english || entry.media?.title?.romaji;
                    if (!titleToSearch) {
                         failed++;
                         continue;
                    }
                    try {
                         const suggestions = await animekaiClient.suggestions(titleToSearch);
                         if (!suggestions?.length) {
                              failed++;
                              continue;
                         }
                         const best = suggestions[0];
                         const existing = await pb.collection("bookmarks").getList(1, 1, {
                              filter: `user = "${userId}" && animeId = "${best.id}"`
                         });
                         if (existing.totalItems > 0) {
                              if (existing.items[0].status !== pbStatus) await pb.collection("bookmarks").update(existing.items[0].id, {
                                   status: pbStatus
                              });
                         } else {
                              await pb.collection("bookmarks").create({
                                   user: userId,
                                   animeId: best.id,
                                   animeTitle: best.title,
                                   thumbnail: best.image || "",
                                   status: pbStatus
                              });
                         }
                         imported++;
                    } catch {
                         failed++;
                    }
               }
          }
          toast.success(`Imported ${imported} anime${failed > 0 ? ` (${failed} not found)` : ""}!`);
          setOpen(false);
          reset();
     };
     return <>
          <button onClick={() => setOpen(true)} className="flex items-center gap-x-[6px] px-3 py-[5px] rounded-md border border-white/10 bg-white/5 text-[#9ca3af] text-[12px] font-semibold transition-all duration-150 hover:border-[#cae962] hover:text-[#cae962]">

               <img src="https://camo.githubusercontent.com/0e9a12578d9495f77ac45315e2ba04463884c3a2180a8bbe09d19026f65a2c9b/68747470733a2f2f616e696c6973742e636f2f696d672f69636f6e732f69636f6e2e737667" alt="AniList" className="w-4 h-4" />

               <span className="text-[9px] px-[5px] py-[1px] rounded bg-blue-500 text-white">Beta</span>
          </button>

          {open && <div onClick={() => {
               setOpen(false);
               reset();
          }} style={{
               position: "fixed",
               inset: 0,
               zIndex: 1000,
               background: "rgba(0,0,0,0.75)",
               backdropFilter: "blur(1.5px)",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               padding: "16px"
          }}>
               <div onClick={e => e.stopPropagation()} style={{
                    background: T.surface,
                    borderRadius: "12px",
                    padding: "24px",
                    width: "100%",
                    maxWidth: "480px",
                    border: `1px solid ${T.border}`,
                    position: "relative"
               }}>
                    <button onClick={() => {
                         setOpen(false);
                         reset();
                    }} style={{
                         position: "absolute",
                         top: "12px",
                         right: "12px",
                         background: "none",
                         border: "none",
                         color: T.textSecondary,
                         cursor: "pointer",
                         fontSize: "20px"
                    }}>×</button>
                    <h2 style={{
                         fontSize: "18px",
                         fontWeight: 700,
                         color: T.textPrimary,
                         marginBottom: "6px"
                    }}>
                         Import from AniList <span style={{
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "#3b82f6",
                              color: "#fff"
                         }}>Beta</span>
                    </h2>
                    <p style={{
                         fontSize: "13px",
                         color: T.textMuted,
                         marginBottom: "20px"
                    }}>Import may take a while for large lists. Only public AniList profiles are supported.</p>

                    {step === 1 && <>
                         <input type="text" placeholder="Enter AniList username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchAnilistData()} style={{
                              width: "100%",
                              padding: "10px 14px",
                              borderRadius: "8px",
                              border: `1px solid ${T.border}`,
                              background: T.bg,
                              color: T.textPrimary,
                              fontSize: "14px",
                              outline: "none",
                              boxSizing: "border-box"
                         }} onFocus={e => e.target.style.borderColor = T.lime} onBlur={e => e.target.style.borderColor = T.border} />
                         <div style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              marginTop: "16px"
                         }}>
                              <button onClick={fetchAnilistData} disabled={isLoading} style={{
                                   padding: "8px 20px",
                                   borderRadius: "8px",
                                   border: "none",
                                   background: T.lime,
                                   color: "#1a1b1e",
                                   cursor: isLoading ? "not-allowed" : "pointer",
                                   fontWeight: 700,
                                   fontSize: "14px",
                                   opacity: isLoading ? 0.7 : 1
                              }}>
                                   {isLoading ? "Fetching…" : "Continue →"}
                              </button>
                         </div>
                    </>}
                    {step === 2 && <>
                         <p style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: T.textPrimary,
                              marginBottom: "12px"
                         }}>The following lists will be imported:</p>
                         <ul style={{
                              listStyle: "none",
                              padding: 0,
                              margin: "0 0 20px",
                              maxHeight: "220px",
                              overflowY: "auto",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px"
                         }}>
                              {lists.map(lst => <li key={lst.name} style={{
                                   display: "flex",
                                   justifyContent: "space-between",
                                   alignItems: "center",
                                   padding: "8px 12px",
                                   background: T.bg,
                                   borderRadius: "8px",
                                   fontSize: "13px"
                              }}>
                                   <span style={{
                                        color: T.textPrimary,
                                        fontWeight: 600
                                   }}>{lst.name}</span>
                                   <span style={{
                                        color: T.lime,
                                        fontSize: "12px"
                                   }}>{lst.entries.length} entries</span>
                              </li>)}
                         </ul>
                         {isLoading && <p style={{
                              fontSize: "12px",
                              color: T.textMuted,
                              marginBottom: "12px"
                         }}>Please wait — searching and saving each anime…</p>}
                         <div style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: "10px"
                         }}>
                              <button onClick={() => setStep(1)} disabled={isLoading} style={{
                                   padding: "8px 16px",
                                   borderRadius: "8px",
                                   border: `1px solid ${T.border}`,
                                   background: "none",
                                   color: T.textSecondary,
                                   cursor: "pointer",
                                   fontSize: "14px"
                              }}>Back</button>
                              <button onClick={importAnimes} disabled={isLoading} style={{
                                   padding: "8px 20px",
                                   borderRadius: "8px",
                                   border: "none",
                                   background: T.lime,
                                   color: "#1a1b1e",
                                   cursor: isLoading ? "not-allowed" : "pointer",
                                   fontWeight: 700,
                                   fontSize: "14px",
                                   opacity: isLoading ? 0.7 : 1
                              }}>
                                   {isLoading ? "Importing…" : "Import"}
                              </button>
                         </div>
                    </>}
               </div>
          </div>}
     </>;
}
const TAB_LIST = [{
     value: "watching",
     label: "Watching"
}, {
     value: "plan to watch",
     label: "Plan To Watch"
}, {
     value: "on hold",
     label: "On Hold"
}, {
     value: "completed",
     label: "Completed"
}, {
     value: "dropped",
     label: "Dropped"
}];
function Profile() {
     const {
          username
     } = useParams();
     const {
          user,
          updateProfile,
          getAvatarUrl
     } = useAuth();
     const navigate = useNavigate();
     const fileInputRef = useRef(null);
     const [activeTab, setActiveTab] = useState("watching");
     const [avatarUploading, setAvatarUploading] = useState(false);
     useEffect(() => {
          if (user && (!username || username === "undefined")) {
               navigate(`/profile/${user.username || user.id}`, {
                    replace: true
               });
          }
     }, [user, username, navigate]);
     const isOwnProfile = user && (user.username === username || user.id === username);
     const avatarUrl = user?.avatar && isOwnProfile ? getAvatarUrl(pb.authStore.record, "400x400") : null;
     const initials = (username || "?")[0].toUpperCase();
     const handleAvatarUpload = async e => {
          const file = e.target.files?.[0];
          if (!file || !user?.id) return;
          setAvatarUploading(true);
          try {
               const res = await pb.collection("users").update(user.id, {
                    avatar: file
               });
               if (res) {
                    await updateProfile({
                         avatar: res.avatar
                    });
                    toast.success("Avatar updated!");
               }
          } catch (err) {
               toast.error("Failed to update avatar.");
               console.error(err);
          } finally {
               setAvatarUploading(false);
          }
     };
     if (!isOwnProfile) {
          return <div style={{
               minHeight: "60vh",
               background: T.bg,
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               justifyContent: "center",
               gap: "16px",
               color: "#fff"
          }}>
               <FontAwesomeIcon icon={faLock} className="text-6xl text-gray-400" />
               <h2 style={{
                    fontSize: "24px",
                    fontWeight: 600
               }}>Profile not found</h2>
               <p style={{
                    color: T.textMuted,
                    fontSize: "14px"
               }}>{user ? `@${username} is not your account.` : "Log in to view your profile."}</p>
               <button onClick={() => navigate("/home")} style={{
                    marginTop: "16px",
                    padding: "8px 24px",
                    borderRadius: "9999px",
                    background: T.lime,
                    color: "#1a1b1e",
                    fontWeight: 700,
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer"
               }}>
                    Back to home
               </button>
          </div>;
     }
     return <div style={{
          background: T.bg,
          color: T.textPrimary
     }}>

          <div className="profile-banner" style={{
               width: "100%",
               position: "relative",
               overflow: "hidden"
          }}>
               <img src="/zoro-bg.jpg" alt="Profile banner" style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 30%"
               }} />
               <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to bottom, rgba(36,36,40,0.15) 0%, rgba(36,36,40,0.5) 60%, rgba(36,36,40,1) 100%)"
               }} />
               <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: `linear-gradient(90deg, transparent, ${T.lime}, transparent)`
               }} />
          </div>

          <div className="profile-body" style={{
               maxWidth: "1400px",
               margin: "0 auto",
               position: "relative",
               zIndex: 1
          }}>

               <div className="profile-header">
                    <style>{`
            @keyframes cardFlash {
              0%   { outline: 2px solid #cae962; outline-offset: 0px; box-shadow: 0 0 12px #cae96288; }
              60%  { outline: 2px solid #cae962; outline-offset: 3px; box-shadow: 0 0 20px #cae96244; }
              100% { outline: 2px solid transparent; outline-offset: 3px; box-shadow: none; }
            }
            .card-flash { animation: cardFlash 0.9s ease-out forwards; }

            .profile-banner { height: 280px; }

            .profile-body { padding: 0 32px 40px; }

            .profile-header { display: flex; align-items: flex-end; gap: 24px; margin-top: -70px; margin-bottom: 40px; }

            .profile-tabs { font-size: 13px; }
            .profile-tab-btn { padding: 9px 4px; font-size: 13px; white-space: nowrap; }

            .heatmap-wrapper { padding: 24px 28px; }
            .heatmap-scroll { overflow-x: visible; }

            @media (max-width: 768px) {
              .profile-banner { height: 220px; }
              .profile-body { padding: 0 20px 32px; }
              .profile-header { margin-top: -60px; margin-bottom: 28px; gap: 18px; }
              .heatmap-wrapper { padding: 18px 20px; }
            }

            @media (max-width: 640px) {
              .profile-banner { height: 180px; }
              .profile-body { padding: 0 14px 28px; }
              .profile-header { flex-direction: column; align-items: center; margin-top: -50px; margin-bottom: 20px; gap: 0; }
              .profile-tab-btn { padding: 8px 2px; font-size: 11px; }
              .heatmap-wrapper { padding: 16px 14px; }
              .heatmap-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 6px; }
            }

            @media (max-width: 480px) {
              .profile-banner { height: 150px; }
              .profile-body { padding: 0 10px 24px; }
              .profile-header { margin-top: -44px; margin-bottom: 16px; }
              .profile-tab-btn { padding: 7px 1px; font-size: 10px; }
              .heatmap-wrapper { padding: 14px 10px; }
            }
          `}</style>

                    <div style={{
                         display: "flex",
                         flexDirection: "column",
                         alignItems: "flex-start",
                         gap: "0px",
                         flexShrink: 0
                    }}>
                         <div onClick={() => !avatarUploading && fileInputRef.current?.click()} title="Click to change avatar" style={{
                              width: "clamp(100px, 18vw, 160px)",
                              height: "clamp(100px, 18vw, 160px)",
                              borderRadius: "50%",
                              overflow: "hidden",
                              border: `4px solid ${T.lime}`,
                              boxShadow: `0 0 10px ${T.lime}30`,
                              background: T.surface,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              position: "relative",
                              flexShrink: 0
                         }}>
                              {avatarUrl ? <img src={avatarUrl} alt={username} style={{
                                   width: "100%",
                                   height: "100%",
                                   objectFit: "cover"
                              }} /> : <span style={{
                                   fontSize: "60px",
                                   fontWeight: 700,
                                   color: T.lime
                              }}>{initials}</span>}
                              <div style={{
                                   position: "absolute",
                                   inset: 0,
                                   borderRadius: "50%",
                                   background: "rgba(0,0,0,0.55)",
                                   display: "flex",
                                   alignItems: "center",
                                   justifyContent: "center",
                                   opacity: 0,
                                   transition: "opacity 150ms",
                                   fontSize: "13px",
                                   color: "#fff",
                                   fontWeight: 600
                              }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0"}>
                                   {avatarUploading ? "Saving…" : "Change"}
                              </div>
                         </div>

                         <p style={{
                              marginTop: "10px",
                              fontSize: "15px",
                              fontWeight: 700,
                              color: T.textPrimary,
                              textAlign: "center",
                              width: "clamp(100px, 18vw, 160px)",
                              wordBreak: "break-all"
                         }}>@{username}</p>
                    </div>
               </div>
               <input type="file" ref={fileInputRef} accept="image/*" onChange={handleAvatarUpload} style={{
                    display: "none"
               }} />

               <div className="flex justify-end items-center gap-x-2 mb-4">
                    <span style={{
                         fontSize: "12px",
                         color: T.textMuted
                    }}>Import:</span>
                    <AnilistImport userId={user?.id} />
               </div>

               <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "3px",
                    background: T.surface,
                    borderRadius: "10px",
                    padding: "4px",
                    border: `1px solid ${T.border}`
               }}>
                    {TAB_LIST.map(tab => <button key={tab.value} onClick={() => setActiveTab(tab.value)} className="profile-tab-btn" style={{
                         borderRadius: "8px",
                         border: "none",
                         background: activeTab === tab.value ? T.lime : "transparent",
                         color: activeTab === tab.value ? "#1a1b1e" : T.textSecondary,
                         cursor: "pointer",
                         fontWeight: activeTab === tab.value ? 700 : 400,
                         transition: "all 150ms",
                         whiteSpace: "nowrap"
                    }}>
                         {tab.label}
                    </button>)}
               </div>


               <div style={{
                    marginTop: "8px"
               }}>
                    <AnimeLists status={activeTab} userId={user?.id} />
               </div>


               <div className="heatmap-wrapper" style={{
                    marginTop: "56px",
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: "12px"
               }}>
                    <div className="heatmap-scroll">
                         <AnimeHeatmap userId={user?.id} />
                    </div>
               </div>
          </div>
     </div>;
}
export default Profile;