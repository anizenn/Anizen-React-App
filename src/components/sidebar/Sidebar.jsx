import { FaAngleLeft, FaComments } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRandom } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "@/src/context/LanguageContext";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cleanupScrollbar, toggleScrollbar } from "@/src/helper/toggleScrollbar";
import { animekaiClient } from "@/src/services/animekai/index.js";
import notify from "@/src/utils/Toast";
const GENRE_COLORS = ["#d0e6a5", "#ffdd95", "#fc887b", "#ccabda", "#abccd8", "#d8b2ab", "#86e3ce"];
const NAV_LINKS = [{
  name: "Home",
  path: "/home"
}, {
  name: "Movies",
  path: "/movie"
}, {
  name: "TV Series",
  path: "/tv"
}, {
  name: "OVAs",
  path: "/ova"
}, {
  name: "ONAs",
  path: "/ona"
}, {
  name: "Specials",
  path: "/special"
}];
const Sidebar = ({
  isOpen,
  onClose
}) => {
  const {
    language,
    toggleLanguage
  } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  useEffect(() => {
    let cancelled = false;
    animekaiClient.genres().then(data => {
      if (cancelled) return;
      const list = Array.isArray(data) ? data : data?.results ?? [];
      setGenres(list.map(g => g.charAt(0).toUpperCase() + g.slice(1)).filter(Boolean));
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    toggleScrollbar(isOpen);
    return () => cleanupScrollbar();
  }, [isOpen]);
  useEffect(() => {
    onClose();
  }, [location, onClose]);
  const handleGenreClick = genre => {
    onClose();
    navigate(`/genre/${genre.toLowerCase().split(" ").join("-")}`);
  };
  const handleRandomClick = () => {
    onClose();
    if (location.pathname === "/random") {
      window.location.reload();
    } else {
      navigate("/random");
    }
  };
  const isActive = path => location.pathname === path;
  return <div className="fixed top-0 left-0 h-full flex transition-transform duration-500 ease-in-out" style={{
    zIndex: 1000200,
    transform: isOpen ? "translateX(0)" : "translateX(-350px)"
  }}>
      <div className="flex flex-col overflow-y-auto gap-4 py-0" style={{
      width: "260px",
      backgroundColor: "#2a2c31",
      height: "100vh"
    }}>
        <div className="px-4 pt-8">
          <button onClick={onClose} className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-[20px] whitespace-nowrap" style={{
          backgroundColor: "#4a4b51"
        }}>
            <FaAngleLeft />
            Close menu
          </button>
        </div>
        <div className="flex items-center justify-center gap-6 px-4 py-3 lg:hidden" style={{
        backgroundColor: "rgba(0,0,0,0.2)"
      }}>
          <button onClick={handleRandomClick} className="flex flex-col items-center text-[12px] text-white gap-[2px] cursor-pointer">
            <FontAwesomeIcon icon={faRandom} style={{
            color: "#cae962",
            fontSize: "18px"
          }} />
            <p>Random</p>
          </button>
          <div className="flex flex-col items-center text-[12px] text-white gap-[2px]">
            <div className="flex">
              {["EN", "JP"].map((lang, i) => <button key={lang} onClick={() => toggleLanguage(lang)} className={`px-1 py-[1px] text-xs font-bold
                    ${i === 0 ? "rounded-l-[3px]" : "rounded-r-[3px]"}
                    ${language === lang ? "text-black" : "bg-gray-600 text-white"}`} style={language === lang ? {
              backgroundColor: "#cae962"
            } : {}}>
                  {lang}
                </button>)}
            </div>
            <p>Anime name</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4">
          <button onClick={() => notify("info", "🚧 Community is under development — coming soon!")} className="flex items-center justify-center gap-2 text-white text-[13px] font-medium h-9 rounded-[20px] w-full" style={{
          backgroundColor: "#222327"
        }}>
            <FaComments size={14} color="#cae962" />
            Community
          </button>
        </div>
        <nav>
          {NAV_LINKS.map(item => <Link key={item.name} to={item.path} className="flex items-center w-full px-4 py-4 text-sm font-semibold transition-colors hover:text-[#cae962]" style={{
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          borderLeft: isActive(item.path) ? "3px solid #cae962" : "3px solid transparent",
          backgroundColor: isActive(item.path) ? "rgba(202,233,98,0.07)" : "transparent",
          color: isActive(item.path) ? "#cae962" : "#ffffff"
        }}>
              {item.name}
            </Link>)}
          <div className="w-full px-4 py-4 text-white" style={{
          borderBottom: "1px solid rgba(255,255,255,0.05)"
        }}>
            <p className="text-sm font-semibold mb-3">Genre</p>
            <div className="flex flex-wrap">
              {genres.length > 0 ? genres.map((genre, idx) => <span key={genre} onClick={() => handleGenreClick(genre)} className="w-[49%] mr-[1%] py-[6px] px-[15px] text-xs cursor-pointer hover:underline" style={{
              color: GENRE_COLORS[idx % GENRE_COLORS.length]
            }}>
                    {genre}
                  </span>) : <span className="text-xs text-gray-500 px-[15px]">Loading genres...</span>}
            </div>
          </div>
        </nav>
      </div>
    </div>;
};
export default Sidebar;
