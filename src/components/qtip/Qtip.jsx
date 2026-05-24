import BouncingLoader from "../ui/bouncingloader/Bouncingloader";
import getQtip from "@/src/utils/getQtip.utils";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faStar, faClosedCaptioning, faMicrophone, faPlus, faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useLanguage } from "@/src/context/LanguageContext";
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
function Qtip({
  id
}) {
  const [qtip, setQtip] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    language
  } = useLanguage();
  const [error, setError] = useState(null);
  const {
    user
  } = useAuth();
  const {
    openLogin
  } = useAuthModal();
  const [bookmarkId, setBookmarkId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    if (!user || !id) return;
    pb.collection("bookmarks").getFirstListItem(`user = "${user.id}" && animeId = "${id}"`, {
      requestKey: `qtip-bm-${id}`
    }).then(rec => {
      setBookmarkId(rec.id);
      setCurrentStatus(rec.status);
    }).catch(() => {
      setBookmarkId(null);
      setCurrentStatus(null);
    });
  }, [user, id]);
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);
  const handleStatusSelect = async (e, status) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openLogin();
      return;
    }
    setSaving(true);
    setDropdownOpen(false);
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
          animeTitle: qtip?.title || "",
          thumbnail: qtip?.poster || "",
          status
        });
        setBookmarkId(rec.id);
        setCurrentStatus(rec.status);
      }
    } catch (err) {
      console.error("Bookmark error:", err);
    } finally {
      setSaving(false);
    }
  };
  useEffect(() => {
    const fetchQtipInfo = async () => {
      if (!id || typeof id === "string" && id.trim() === "") {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getQtip(id);
        setQtip(data);
      } catch (err) {
        console.error("Error fetching anime info:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQtipInfo();
  }, [id]);
  if (!loading && (error || !qtip)) return null;
  const isListed = !!currentStatus;
  const statusLabel = STATUS_OPTIONS.find(s => s.value === currentStatus)?.label;
  return <div className="w-[320px] h-fit rounded-xl p-4 flex justify-center items-center bg-[#3e3c50] bg-opacity-70 backdrop-blur-[3px] z-50">
    {loading || !qtip ? <BouncingLoader /> : <div className="w-full flex flex-col justify-start gap-y-2">
      <h1 className="text-xl font-semibold text-white text-[13px] leading-6">
        {language === "JP" ? qtip.japanese_title || qtip.romaji || qtip.title_romaji || qtip.title : qtip.title}
      </h1>
      <div className="w-full flex items-center relative mt-2">
        {qtip?.rating && <div className="flex gap-x-2 items-center">
          <FontAwesomeIcon icon={faStar} className="text-[#ffc107]" />
          <p className="text-[#b7b7b8]">{qtip.rating}</p>
        </div>}
        <div className="flex ml-4 gap-x-[1px] overflow-hidden rounded-md items-center h-fit">
          {qtip?.quality && <div className="bg-[#cae962] px-[7px] w-fit flex justify-center items-center py-[1px] text-black">
            <p className="text-[12px] font-semibold">{qtip.quality}</p>
          </div>}
          <div className="flex gap-x-[1px] w-fit items-center py-[1px]">
            {qtip?.subCount && <div className="flex gap-x-1 justify-center items-center bg-[#B0E3AF] px-[7px] text-black">
              <FontAwesomeIcon icon={faClosedCaptioning} className="text-[13px]" />
              <p className="text-[13px] font-semibold">{qtip.subCount}</p>
            </div>}
            {qtip?.dubCount && <div className="flex gap-x-1 justify-center items-center bg-[#B9E7FF] px-[7px] text-black">
              <FontAwesomeIcon icon={faMicrophone} className="text-[13px]" />
              <p className="text-[13px] font-semibold">{qtip.dubCount}</p>
            </div>}
            {qtip?.episodeCount && <div className="flex gap-x-1 justify-center items-center bg-[#a199a3] px-[7px] text-black">
              <p className="text-[13px] font-semibold">{qtip.episodeCount}</p>
            </div>}
          </div>
          {qtip?.type && <div className="absolute right-0 top-0 justify-center items-center rounded-sm bg-[#cae962] px-[6px] text-black">
            <p className="font-semibold text-[13px]">{qtip.type}</p>
          </div>}
        </div>
      </div>
      {qtip?.description && <p className="text-[#d7d7d8] text-[13px] leading-4 font-light line-clamp-3 mt-1">
        {qtip.description}
      </p>}
      <div className="flex flex-col mt-1">
        {qtip?.Synonyms && <div className="leading-4">
          <span className="text-[#b7b7b8] text-[13px]">Synonyms:&nbsp;</span>
          <span className="text-[13px]">{qtip.Synonyms}</span>
        </div>}
        {qtip?.airedDate && <div className="leading-4">
          <span className="text-[#b7b7b8] text-[13px]">Aired:&nbsp;</span>
          <span className="text-[13px]">{qtip.airedDate}</span>
        </div>}
        {qtip?.status && <div className="leading-4">
          <span className="text-[#b7b7b8] text-[13px]">Status:&nbsp;</span>
          <span className="text-[13px]">{qtip.status}</span>
        </div>}
        {qtip?.genres && <div className="leading-4 flex flex-wrap text-wrap">
          <span className="text-[#b7b7b8] text-[13px]">Genres:&nbsp;</span>
          {qtip.genres.map((genre, index) => <Link to={`/genre/${genre}`} key={index} className="text-[13px] hover:text-[#cae962]">
            <span>{genre}{index === qtip.genres.length - 1 ? "" : ","}&nbsp;</span>
          </Link>)}
        </div>}
      </div>
      <div className="flex items-center gap-x-2 mt-4 w-full">
        <Link to={qtip.watchLink} className="flex-1 flex justify-center items-center gap-x-2 bg-[#cae962] py-[9px] rounded-3xl">
          <FontAwesomeIcon icon={faPlay} className="text-[14px] text-black" />
          <p className="text-[14px] font-semibold text-black">Watch Now</p>
        </Link>

        <div ref={dropdownRef} style={{
          position: "relative"
        }}>
          <button onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            if (!user) {
              openLogin();
              return;
            }
            setDropdownOpen(o => !o);
          }} disabled={saving} title={isListed ? `Listed as ${statusLabel}` : "Add to list"} className={`flex justify-center items-center gap-x-1.5 px-3 py-[9px] rounded-3xl border transition-all duration-200 text-[13px] font-semibold whitespace-nowrap ${isListed ? "bg-[#cae962] border-[#cae962] text-black" : "bg-transparent border-[#cae962] text-[#cae962] hover:bg-[#cae962] hover:text-black"}`}>
            <FontAwesomeIcon icon={isListed ? faCheck : faPlus} className="text-[13px]" />
            {isListed ? statusLabel : "Add"}
            <FontAwesomeIcon icon={faChevronDown} className="text-[10px] ml-0.5" />
          </button>

          {dropdownOpen && <div style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            right: 0,
            background: "#2a2c31",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            overflow: "hidden",
            zIndex: 99999,
            minWidth: "148px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
          }}>
            {STATUS_OPTIONS.map(opt => <button key={opt.value} onClick={e => handleStatusSelect(e, opt.value)} style={{
              display: "block",
              width: "100%",
              padding: "8px 14px",
              textAlign: "left",
              background: currentStatus === opt.value ? "rgba(202,233,98,0.15)" : "transparent",
              color: currentStatus === opt.value ? "#cae962" : "#e0e0e0",
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
              fontWeight: currentStatus === opt.value ? 700 : 400
            }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"} onMouseLeave={e => e.currentTarget.style.background = currentStatus === opt.value ? "rgba(202,233,98,0.15)" : "transparent"}>
              {currentStatus === opt.value ? "✓ " : ""}{opt.label}
            </button>)}
            {isListed && <button onClick={e => handleStatusSelect(e, currentStatus)} style={{
              display: "block",
              width: "100%",
              padding: "8px 14px",
              textAlign: "left",
              background: "transparent",
              color: "#e9376b",
              fontSize: "13px",
              border: "none",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              fontWeight: 400
            }} onMouseEnter={e => e.currentTarget.style.background = "rgba(233,55,107,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              Remove
            </button>}
          </div>}
        </div>
      </div>
    </div>}
  </div>;
}
export default Qtip;