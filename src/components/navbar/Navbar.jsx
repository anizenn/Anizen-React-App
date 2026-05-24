import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faRandom } from "@fortawesome/free-solid-svg-icons";
import { FaDiscord, FaTelegramPlane, FaRedditAlien, FaInstagram } from "react-icons/fa";
import { useLanguage } from "@/src/context/LanguageContext";
import { useAuth } from "@/src/context/AuthContext";
import { useAuthModal } from "@/src/context/AuthModalContext";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import NavbarAvatar from "./NavbarAvatar";
import { SearchProvider } from "@/src/context/SearchContext";
import WebSearch from "../searchbar/WebSearch";
import MobileSearch from "../searchbar/MobileSearch";
function Navbar() {
  const location = useLocation();
  const {
    language,
    toggleLanguage
  } = useLanguage();
  const {
    isAuthenticated
  } = useAuth();
  const {
    openLogin
  } = useAuthModal();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const isHomePage = location.pathname === "/" || location.pathname === "/home";
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("body-hidden");
    } else {
      document.body.classList.remove("body-hidden");
    }
  }, [isSidebarOpen]);
  const handleRandomClick = () => {
    if (location.pathname === "/random") window.location.reload();
  };
  return <SearchProvider>
      {createPortal(<>
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          {isSidebarOpen && <div className="fixed inset-0 z-[1000100]" style={{
        background: "rgba(32, 33, 37, 0.65)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)"
      }} onClick={closeSidebar} />}
        </>, document.body)}

      <nav style={{
      backgroundColor: isHomePage ? "transparent" : "",
      position: "relative",
      zIndex: 1000000
    }} className="w-full max-[1299px]:bg-[#2a2c31]">
        <div className="flex items-center justify-between pl-5 h-[70px] w-full max-w-[2048px] mx-auto max-[578px]:h-[50px] max-[578px]:pl-5 max-[578px]:pr-5">
          <div className="flex items-center gap-5">
            <FontAwesomeIcon icon={faBars} className="text-2xl text-white cursor-pointer shrink-0" onClick={() => setIsSidebarOpen(true)} />

            <Link to="/home" className="flex items-center h-14 shrink-0 max-[578px]:h-[34px]">
              <img src="/logo.png" alt="Anizen Logo" className="h-full w-auto object-contain" />
            </Link>
            <div className="w-[clamp(180px,20vw,290px)] shrink-0 max-[768px]:hidden">
              <WebSearch />
            </div>
            <div className="flex items-center gap-1 shrink-0 max-[1300px]:hidden">
              {[{
              Icon: FaDiscord,
              bg: "#6f85d5",
              href: "https://discord.gg/REyGDnC4VU"
            }, {
              Icon: FaTelegramPlane,
              bg: "#08c",
              href: "https://t.me/share/url?url=https%3A%2F%2Fanizen.site&text=AniZen%20-%20Watch%20Free%20Anime%20Online%2C%20Stream%20Subbed%20%26%20Dubbed%20Anime%20in%20HD"
            }, {
              Icon: FaRedditAlien,
              bg: "#ff3c1f",
              href: "https://www.reddit.com/submit?url=https%3A%2F%2Fanizen.site&title=AniZen%20-%20Watch%20Free%20Anime%20Online%2C%20Stream%20Subbed%20%26%20Dubbed%20Anime%20in%20HD"
            }, {
              Icon: FaInstagram,
              bg: "#e1306c",
              href: "https://instagram.com/chad.daydreams"
            }].map(({
              Icon,
              bg,
              href
            }, i) => <a key={i} href={href} target="_blank" rel="noreferrer">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm shrink-0" style={{
                backgroundColor: bg
              }}>
                    <Icon />
                  </div>
                </a>)}
            </div>

            <div className="flex items-center gap-4 shrink-0 max-[760px]:hidden">
              <Link to={location.pathname === "/random" ? "#" : "/random"} onClick={handleRandomClick} className="flex flex-col items-center text-[11px] text-white gap-[2px]">
                <FontAwesomeIcon icon={faRandom} style={{
                color: "#cae962",
                fontSize: "18px"
              }} />
                <p>Random</p>
              </Link>

              <div className="flex flex-col items-center text-[11px] text-white gap-[2px]">
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
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden max-[768px]:flex items-center justify-center w-[40px] h-[40px] rounded-full text-white cursor-pointer" style={{
            background: "rgba(255,255,255,0.1)"
          }}>
              <WebSearch variant="icon" />
            </div>
            {isAuthenticated ? <NavbarAvatar /> : <button onClick={openLogin} className="flex items-center justify-center w-auto h-10 px-4 rounded-[5px] text-black font-bold text-sm cursor-pointer max-[1300px]:h-[35px] max-[1300px]:text-xs" style={{
            backgroundColor: "#cae962"
          }}>
                Login
              </button>}
          </div>
        </div>
        <MobileSearch />
      </nav>
    </SearchProvider>;
}
export default Navbar;
