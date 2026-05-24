import getAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faClosedCaptioning, faMicrophone, faPlus, faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import website_name from "@/src/config/website";
import CategoryCard from "@/src/components/categorycard/CategoryCard";
import Sidecard from "@/src/components/sidecard/Sidecard";
import Loader from "@/src/components/Loader/Loader";
import Error from "@/src/components/error/Error";
import { useLanguage } from "@/src/context/LanguageContext";
import { useHomeInfo } from "@/src/context/HomeInfoContext";
import Voiceactor from "@/src/components/voiceactor/Voiceactor";
import notify from "@/src/utils/Toast";
import { useAuth } from "@/src/context/AuthContext";
import { useAuthModal } from "@/src/context/AuthModalContext";
import pb from "@/src/lib/pocketbase";
const STATUS_OPTIONS = [{
  value: "watching",
  label: "Watching"
}, {
  value: "plan to watch",
  label: "Plan to Watch"
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
function InfoItem({
  label,
  value,
  isProducer = true
}) {
  return value && <div className="text-[14px] font-bold">
        {`${label}: `}
        <span className="font-light">
          {Array.isArray(value) ? value.map((item, index) => isProducer ? <Link to={`/producer/${item.replace(/[&'"^%$#@!()+=<>:;,.?/\\|{}[\]`~*_]/g, "").split(" ").join("-").replace(/-+/g, "-")}`} key={index} className="cursor-pointer hover:text-[#cae962]">
                  {item}
                  {index < value.length - 1 && ", "}
                </Link> : <span key={index} className="cursor-pointer">
                  {item}
                </span>) : isProducer ? <Link to={`/producer/${value.replace(/[&'"^%$#@!()+=<>:;,.?/\\|{}[\]`~*_]/g, "").split(" ").join("-").replace(/-+/g, "-")}`} className="cursor-pointer hover:text-[#cae962]">
              {value}
            </Link> : <span className="cursor-pointer">{value}</span>}
        </span>
      </div>;
}
function Tag({
  bgColor,
  index,
  icon,
  text
}) {
  return <div className={`flex space-x-1 justify-center items-center px-[4px] py-[1px] text-black font-bold text-[13px] ${index === 0 ? "rounded-l-[4px]" : "rounded-none"}`} style={{
    backgroundColor: bgColor
  }}>
      {icon && <FontAwesomeIcon icon={icon} className="text-[12px]" />}
      <p className="text-[12px]">{text}</p>
    </div>;
}
function AnimeInfo({
  random = false
}) {
  const {
    language
  } = useLanguage();
  const {
    id: paramId
  } = useParams();
  const id = random ? null : paramId;
  const location = useLocation();
  const [isFull, setIsFull] = useState(false);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [seasons, setSeasons] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    homeInfo
  } = useHomeInfo();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    openLogin
  } = useAuthModal();
  const [bookmarkId, setBookmarkId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [bmDropdownOpen, setBmDropdownOpen] = useState(false);
  const [bmSaving, setBmSaving] = useState(false);
  const bmDropdownRef = useRef(null);
  useEffect(() => {
    if (!user || !id) return;
    pb.collection("bookmarks").getFirstListItem(`user = "${user.id}" && animeId = "${id}"`, {
      requestKey: `ai-bm-${id}`
    }).then(rec => {
      setBookmarkId(rec.id);
      setCurrentStatus(rec.status);
    }).catch(() => {
      setBookmarkId(null);
      setCurrentStatus(null);
    });
  }, [user, id]);
  useEffect(() => {
    if (!bmDropdownOpen) return;
    const handler = e => {
      if (bmDropdownRef.current && !bmDropdownRef.current.contains(e.target)) setBmDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bmDropdownOpen]);
  const handleBmStatusSelect = async status => {
    if (!user) {
      openLogin();
      return;
    }
    setBmSaving(true);
    setBmDropdownOpen(false);
    try {
      if (bookmarkId) {
        if (status === currentStatus) {
          await pb.collection("bookmarks").delete(bookmarkId);
          setBookmarkId(null);
          setCurrentStatus(null);
        } else {
          const rec = await pb.collection("bookmarks").update(bookmarkId, {
            status
          });
          setCurrentStatus(rec.status);
        }
      } else {
        const rec = await pb.collection("bookmarks").create({
          user: user.id,
          animeId: id,
          animeTitle: animeInfo?.title || "",
          thumbnail: animeInfo?.poster || "",
          status
        });
        setBookmarkId(rec.id);
        setCurrentStatus(rec.status);
      }
    } catch (err) {
      console.error("Bookmark error:", err);
      notify("error", "Failed to update list.");
    } finally {
      setBmSaving(false);
    }
  };
  useEffect(() => {
    if (id === "404-not-found-page") {
      return null;
    } else {
      const fetchAnimeInfo = async () => {
        setLoading(true);
        try {
          const data = await getAnimeInfo(id, random);
          setSeasons(data?.seasons);
          setAnimeInfo(data);
          if (random && data?.link) {
            navigate(`/${data.link}`, {
              replace: true
            });
            return;
          }
        } catch (err) {
          setError(err);
          notify("error", err?.message || "Failed to load anime info");
        } finally {
          setLoading(false);
        }
      };
      fetchAnimeInfo();
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }, [id, random]);
  useEffect(() => {
    if (animeInfo && (location.pathname === `/${animeInfo.link}` || location.pathname === `/${animeInfo.id}`)) {
      document.title = `Watch ${animeInfo.title} English Sub/Dub online Free on ${website_name}`;
    }
    return () => {
      document.title = `${website_name} | Free anime streaming platform`;
    };
  }, [animeInfo, location.pathname]);
  useEffect(() => {
    if (!loading && !error && animeInfo?.link && paramId !== animeInfo.link) {
      navigate(`/${animeInfo.link}`, {
        replace: true
      });
    }
  }, [animeInfo, loading, error, paramId, navigate]);
  useEffect(() => {
    if (!loading && !error && !animeInfo) {
      navigate("/404-not-found-page");
    }
  }, [loading, error, animeInfo, navigate]);
  if (loading) return <Loader type="animeInfo" />;
  if (error) {
    return <Error />;
  }
  if (!animeInfo) {
    return null;
  }
  const {
    title,
    japanese_title,
    poster,
    animeInfo: info
  } = animeInfo;
  const tags = [{
    condition: info.tvInfo?.rating,
    bgColor: "#ffffff",
    text: info.tvInfo?.rating
  }, {
    condition: info.tvInfo?.quality,
    bgColor: "#cae962",
    text: info.tvInfo?.quality
  }, {
    condition: info.tvInfo?.sub,
    icon: faClosedCaptioning,
    bgColor: "#B0E3AF",
    text: info.tvInfo?.sub
  }, {
    condition: info.tvInfo?.dub,
    icon: faMicrophone,
    bgColor: "#B9E7FF",
    text: info.tvInfo?.dub
  }];
  return <>
      <div className="relative grid grid-cols-[minmax(0,75%),minmax(0,25%)] h-fit overflow-hidden text-white -mx-[50px] [width:calc(100%+100px)] max-[578px]:mx-0 max-[578px]:w-full max-[1200px]:flex max-[1200px]:flex-col">
        <img src={`${poster}`} alt={`${title} Poster`} className="absolute inset-0 object-cover w-full h-full filter grayscale blur-lg z-[-900]" />
        <div className="flex items-start z-10 px-14 py-[70px] bg-[#252434] bg-opacity-70 gap-x-8 max-[1024px]:px-6 max-[1024px]:py-10 max-[1024px]:gap-x-4 max-[575px]:flex-col max-[575px]:items-center max-[575px]:justify-center">
          <div className="relative w-[180px] h-[270px] max-[575px]:w-[140px] max-[575px]:h-[200px] flex-shrink-0">
            <img src={`${poster}`} alt={`${title} Poster`} className="w-full h-full object-cover object-center flex-shrink-0" />
            {animeInfo.adultContent && <div className="text-white px-2 rounded-md bg-[#FF5700] absolute top-2 left-2 flex items-center justify-center text-[14px] font-bold">
                18+
              </div>}
          </div>
          <div className="flex flex-col ml-4 gap-y-5 max-[575px]:items-center max-[575px]:justify-center max-[575px]:mt-6 max-[1200px]:ml-0">
            <ul className="flex gap-x-2 items-center w-fit max-[1200px]:hidden">
              {[["Home", "home"], [info.tvInfo?.showType, info.tvInfo?.showType]].map(([text, link], index) => <li key={index} className="flex gap-x-3 items-center">
                  <Link to={`/${link}`} className="text-white hover:text-[#cae962] text-[15px] font-semibold">
                    {text}
                  </Link>
                  <div className="dot mt-[1px] bg-white"></div>
                </li>)}
              <p className="font-light text-[15px] text-gray-300 line-clamp-1 max-[575px]:leading-5">
                {language === "EN" ? title : japanese_title}
              </p>
            </ul>
            <h1 className="text-4xl font-semibold max-[1200px]:text-3xl max-[575px]:text-2xl max-[575px]:text-center  max-[575px]:leading-7">
              {language === "EN" ? title : japanese_title}
            </h1>
            <div className="flex flex-wrap w-fit gap-x-[2px] mt-3 max-[575px]:mx-auto max-[575px]:mt-0 gap-y-[3px] max-[320px]:justify-center">
              {tags.map(({
              condition,
              icon,
              bgColor,
              text
            }, index) => condition && <Tag key={index} index={index} bgColor={bgColor} icon={icon} text={text} />)}
              <div className="flex w-fit items-center ml-1">
                {[info.tvInfo?.showType, info.tvInfo?.duration].map((item, index) => item && <div key={index} className="px-1 h-fit flex items-center gap-x-2 w-fit">
                        <div className="dot mt-[2px]"></div>
                        <p className="text-[14px]">{item}</p>
                      </div>)}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              {animeInfo?.animeInfo?.Status?.toLowerCase() !== "not-yet-aired" ? <Link to={`/watch/${animeInfo.link || animeInfo.id}`} className="flex gap-x-2 px-6 py-2 bg-[#cae962] w-fit text-black items-center rounded-3xl">
                  <FontAwesomeIcon icon={faPlay} className="text-[14px] mt-[1px]" />
                  <p className="text-lg font-medium">Watch Now</p>
                </Link> : <Link to={`/${animeInfo.link || animeInfo.id}`} className="flex gap-x-2 px-6 py-2 bg-[#cae962] w-fit text-black items-center rounded-3xl">
                  <p className="text-lg font-medium">Not released</p>
                </Link>}
              <div ref={bmDropdownRef} style={{
              position: "relative"
            }}>
                <button onClick={() => {
                if (!user) {
                  openLogin();
                  return;
                }
                setBmDropdownOpen(o => !o);
              }} disabled={bmSaving} className={`flex gap-x-2 px-5 py-2 w-fit items-center rounded-3xl border transition-colors ${currentStatus ? "bg-[#cae962] border-[#cae962] text-black" : "border-white/20 text-white hover:bg-white/10"}`}>
                  <FontAwesomeIcon icon={currentStatus ? faCheck : faPlus} className="text-[14px]" />
                  <p className="text-[15px] font-medium">
                    {currentStatus ? STATUS_OPTIONS.find(s => s.value === currentStatus)?.label : "Add to list"}
                  </p>
                  <FontAwesomeIcon icon={faChevronDown} className="text-[11px]" />
                </button>

                {bmDropdownOpen && <div style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                background: "#2a2c31",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                overflow: "hidden",
                zIndex: 99999,
                minWidth: "160px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.6)"
              }}>
                    {STATUS_OPTIONS.map(opt => <button key={opt.value} onClick={() => handleBmStatusSelect(opt.value)} style={{
                  display: "block",
                  width: "100%",
                  padding: "9px 16px",
                  textAlign: "left",
                  background: currentStatus === opt.value ? "rgba(202,233,98,0.15)" : "transparent",
                  color: currentStatus === opt.value ? "#cae962" : "#e0e0e0",
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: currentStatus === opt.value ? 700 : 400
                }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"} onMouseLeave={e => e.currentTarget.style.background = currentStatus === opt.value ? "rgba(202,233,98,0.15)" : "transparent"}>
                        {currentStatus === opt.value ? "✓ " : ""}{opt.label}
                      </button>)}
                    {currentStatus && <button onClick={() => handleBmStatusSelect(currentStatus)} style={{
                  display: "block",
                  width: "100%",
                  padding: "9px 16px",
                  textAlign: "left",
                  background: "transparent",
                  color: "#e9376b",
                  fontSize: "14px",
                  border: "none",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer"
                }} onMouseEnter={e => e.currentTarget.style.background = "rgba(233,55,107,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        Remove
                      </button>}
                  </div>}
              </div>
            </div>
            {info?.Overview && <div className="text-[14px] mt-2 max-[575px]:hidden">
                {info.Overview.length > 270 ? <>
                    {isFull ? info.Overview : `${info.Overview.slice(0, 270)}...`}
                    <span className="text-[13px] font-bold hover:cursor-pointer" onClick={() => setIsFull(!isFull)}>
                      {isFull ? "- Less" : "+ More"}
                    </span>
                  </> : info.Overview}
              </div>}
            <p className="text-[14px] max-[575px]:hidden">
              {`${website_name} is the best site to watch `}
              <span className="font-bold">{title}</span>
              {` SUB online, or you can even watch `}
              <span className="font-bold">{title}</span>
              {` DUB in HD quality.`}
            </p>
            <div className="flex gap-x-4 items-center mt-4 max-[575px]:w-full max-[575px]:justify-center max-[320px]:hidden">
              <img src="https://i.postimg.cc/d34WWyNQ/share-icon.gif" alt="Share Anime" className="w-[60px] h-auto rounded-full max-[1024px]:w-[40px]" />
              <div className="flex flex-col w-fit">
                <p className="text-[15px] font-bold text-[#cae962]">
                  Share Anime
                </p>
                <p className="text-[16px] text-white">to your friends</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#4c4b57c3] flex items-center px-8 max-[1200px]:py-10 max-[1200px]:bg-[#363544e0] max-[575px]:p-4">
          <div className="w-full flex flex-col h-fit gap-y-3">
            {info?.Overview && <div className="custom-xl:hidden max-h-[150px] overflow-hidden">
                <p className="text-[13px] font-bold">Overview:</p>
                <div className="max-h-[110px] mt-2 overflow-y-scroll">
                  <p className="text-[14px] font-light">{info.Overview}</p>
                </div>
              </div>}
            {[{
            label: "Japanese",
            value: info?.Japanese
          }, {
            label: "Synonyms",
            value: info?.Synonyms
          }, {
            label: "Aired",
            value: info?.Aired
          }, {
            label: "Premiered",
            value: info?.Premiered
          }, {
            label: "Duration",
            value: info?.Duration
          }, {
            label: "Status",
            value: info?.Status
          }, {
            label: "MAL Score",
            value: info?.["MAL Score"]
          }].map(({
            label,
            value
          }, index) => <InfoItem key={index} label={label} value={value} isProducer={false} />)}
            {info?.Genres && <div className="flex gap-x-2 py-2 custom-xl:border-t custom-xl:border-b custom-xl:border-white/20 max-[1200px]:border-none">
                <p>Genres:</p>
                <div className="flex flex-wrap gap-2">
                  {info.Genres.map((genre, index) => <Link to={`/genre/${genre.split(" ").join("-")}`} key={index} className="text-[14px] font-semibold px-2 py-[1px] border border-gray-400  hover:text-[#cae962]">
                      {genre}
                    </Link>)}
                </div>
              </div>}
            {[{
            label: "Studios",
            value: info?.Studios
          }, {
            label: "Producers",
            value: info?.Producers
          }].map(({
            label,
            value
          }, index) => <InfoItem key={index} label={label} value={value} />)}
            <p className="text-[14px] mt-4 custom-xl:hidden">
              {`${website_name} is the best site to watch `}
              <span className="font-bold">{title}</span>
              {` SUB online, or you can even watch `}
              <span className="font-bold">{title}</span>
              {` DUB in HD quality.`}
            </p>
          </div>
        </div>
      </div>
      <div className="w-full px-4 grid grid-cols-[minmax(0,75%),minmax(0,25%)] gap-x-6 max-[1200px]:flex flex-col">
        <div>
          {seasons?.length > 0 && <div className="flex flex-col gap-y-7 mt-8">
              <h1 className="w-fit text-2xl text-[#cae962] max-[478px]:text-[18px] font-bold">
                More Seasons
              </h1>
              <div className="flex flex-wrap gap-4 max-[575px]:grid max-[575px]:grid-cols-3 max-[575px]:gap-3 max-[480px]:grid-cols-2">
                {seasons.map((season, index) => <Link to={`/${season.link || season.id}`} key={index} className={`relative w-[20%] h-[60px] rounded-lg overflow-hidden cursor-pointer group ${paramId === (season.link || String(season.id)) ? "border border-[#cae962]" : ""} max-[1200px]:w-[140px] max-[575px]:w-full`}>
                    <p className={`text-[13px] text-center font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-2 z-30 line-clamp-2 group-hover:text-[#cae962] ${paramId === (season.link || String(season.id)) ? "text-[#cae962]" : "text-white"}`}>
                      {season.season}
                    </p>
                    <div className="absolute inset-0 z-10 bg-[url('https://i.postimg.cc/pVGY6RXd/thumb.png')] bg-repeat"></div>
                    <img src={season.season_poster} alt="" className="w-full h-full object-cover blur-[3px] opacity-50" />
                  </Link>)}
              </div>
            </div>}
          {animeInfo?.ani_id && <Voiceactor animeInfo={animeInfo} />}
          {animeInfo?.recommended_data?.length > 0 && <CategoryCard label="Recommended for you" data={animeInfo.recommended_data} limit={Math.min(animeInfo.recommended_data.length, 12)} showViewMore={false} className={"mt-8"} />}
        </div>
        <div>
          {homeInfo && homeInfo.trending?.length > 0 && <Sidecard label="Most Popular" data={homeInfo.trending.slice(0, 10)} className="mt-[40px]" limit={10} />}
        </div>
      </div>
    </>;
}
export default AnimeInfo;
