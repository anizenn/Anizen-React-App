import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SplashScreen.css";
import logoTitle from "@/src/config/logoTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowRight, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import getTopSearch from "@/src/utils/getTopSearch.utils";
const NAV_LINKS = [{
  to: "/home",
  label: "Home"
}, {
  to: "/movie",
  label: "Movies"
}, {
  to: "/tv",
  label: "TV Series"
}, {
  to: "/trending",
  label: "Trending"
}, {
  to: "/updates",
  label: "Updates"
}];
const useTopSearch = () => {
  const [topSearch, setTopSearch] = useState([]);
  useEffect(() => {
    const fetchTopSearch = async () => {
      const data = await getTopSearch();
      if (data) setTopSearch(data);
    };
    fetchTopSearch();
  }, []);
  return topSearch;
};
const SHARE_LINKS = [{
  label: "Facebook",
  count: "3.1k",
  href: "https://www.facebook.com/sharer.php?t=AniZen%20-%20Watch%20Anime%20Online%20Free&u=https%3A%2F%2Fanizen.site",
  bg: "bg-[#1877f2] hover:bg-[#1565d8]",
  icon: <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
        <path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.988H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
}, {
  label: "X",
  count: "10.6k",
  href: "https://x.com/i/flow/login?redirect_after_login=%2Fintent%2Ftweet%3Ftext%3DAniZen%26url%3Dhttps%253A%252F%252Fanizen.site",
  bg: "bg-black hover:bg-neutral-800 border border-white/10",
  icon: <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
}, {
  label: "Messenger",
  count: "2.1k",
  href: "https://www.facebook.com/share_as_message/?link=https%3A%2F%2Fanizen.site&app_id=291494419107518",
  bg: "bg-[#0084ff] hover:bg-[#0070dd]",
  icon: <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.913 1.454 5.512 3.726 7.21V22l3.405-1.869c.909.252 1.87.387 2.869.387 5.523 0 10-4.145 10-9.259C22 6.145 17.523 2 12 2zm1.007 12.47l-2.548-2.717-4.97 2.717 5.467-5.803 2.61 2.717 4.908-2.717-5.467 5.803z" />
      </svg>
}, {
  label: "Reddit",
  count: "4.4k",
  href: "https://www.reddit.com/submit?title=AniZen&url=https%3A%2F%2Fanizen.site&type=LINK",
  bg: "bg-[#ff4500] hover:bg-[#e03d00]",
  icon: <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
}, {
  label: "WhatsApp",
  count: "592",
  href: "https://web.whatsapp.com/send?text=https%3A%2F%2Fanizen.site",
  bg: "bg-[#25d366] hover:bg-[#1dbd58]",
  icon: <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.427A9.959 9.959 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.72 0-3.328-.463-4.713-1.27l-.337-.202-3.506 1.005 1.006-3.417-.221-.351A7.951 7.951 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z" />
      </svg>
}, {
  label: "Telegram",
  count: null,
  href: "https://t.me/share/url?url=https%3A%2F%2Fanizen.site",
  bg: "bg-[#229ed9] hover:bg-[#1a8bbf]",
  icon: <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
}];
function SplashScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const topSearch = useTopSearch();
  const handleSearchSubmit = useCallback(() => {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return;
    const queryParam = encodeURIComponent(trimmedSearch);
    navigate(`/search?keyword=${queryParam}`);
  }, [search, navigate]);
  const handleKeyDown = useCallback(e => {
    if (e.key === "Enter") handleSearchSubmit();
  }, [handleSearchSubmit]);
  return <div className="w-full pt-0 min-[780px]:pt-20">
      <div className="w-[1300px] mx-auto relative overflow-hidden max-[1350px]:w-full max-[1350px]:px-8 max-[1200px]:min-h-fit max-[780px]:px-4 max-[520px]:px-4">
        <nav className="relative w-full">
          <div className="w-fit flex gap-x-12 mx-auto font-semibold max-[780px]:hidden">
            {NAV_LINKS.map(link => <Link key={link.to} to={link.to} className="hover:text-[#cae962]">
                {link.label}
              </Link>)}
          </div>

          <div className="max-[780px]:block hidden max-[520px]:px-4 max-[520px]:text-sm">
            <button onClick={() => setIsModalOpen(true)} className="p-2 focus:outline-none flex items-center gap-x-2 transition-colors duration-200 group">
              <svg className="w-6 h-6 text-white transition-colors duration-200 max-[520px]:w-5 max-[520px]:h-5 group-hover:text-[#cae962]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-white font-semibold transition-colors duration-200 group-hover:text-[#cae962]">
                Menu
              </span>
            </button>
          </div>

          {isModalOpen && <div className="max-[780px]:block w-full hidden absolute z-50 top-10">
              <div className="bg-[#101010fa] rounded-xl w-full p-6 flex flex-col gap-y-5 items-center">
                <button onClick={() => setIsModalOpen(false)} className="self-end text-black text-xl absolute top-0 right-0 bg-white px-3 py-1 rounded-tr-xl rounded-bl-xl font-bold">
                  &times;
                </button>
                {NAV_LINKS.map(link => <Link key={link.to} to={link.to} onClick={() => setIsModalOpen(false)} className="hover:text-[#cae962] text-white text-lg">
                    {link.label}
                  </Link>)}
              </div>
            </div>}
        </nav>

        <div className="splashscreen min-h-[480px] min-[1200px]:min-h-[520px] bg-[#33353c] rounded-[40px] flex relative mt-7 max-[780px]:w-full items-stretch max-[780px]:rounded-[30px] max-[520px]:rounded-none max-[520px]:min-h-fit max-[520px]:pb-4 max-[520px]:mt-4">
          <div className="h-auto flex flex-col w-[700px] relative z-40 px-20 py-20 left-0 max-[1200px]:py-12 max-[780px]:px-12 max-[520px]:py-4 max-[520px]:px-8">
            <Link to="/home" className="block max-[520px]:text-center">
              <img src="/logo.png" alt="AniZen Logo" className="h-14 max-[520px]:h-10 max-[520px]:mx-auto object-contain" />
            </Link>
            <div className="w-full flex gap-x-3 mt-6">
              <input type="text" placeholder="Search anime..." className="w-full py-3 px-6 rounded-xl bg-white text-[18px] text-black" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleKeyDown} />
              <button className="bg-[#cae962] text-white py-3 px-4 rounded-xl font-extrabold group" onClick={handleSearchSubmit}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-lg text-black group-hover:text-white max-[600px]:mt-[7px]" />
              </button>
            </div>
            <div className="mt-6">
              <span className="text-[12px] font-bold tracking-widest text-white/40">Top Search:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {topSearch.slice(0, 5).map((item, index) => <Link key={index} to={item.link} className="text-[13px] px-3 py-1 rounded-full bg-white/10 text-white/80 hover:bg-[#cae962] hover:text-black transition-colors duration-150 font-medium">
                    {item.title}
                  </Link>)}
              </div>
            </div>
            <div className="mt-8 flex max-[780px]:left-10">
              <Link to="/home" className="max-[520px]:w-full">
                <div className="bg-[#cae962] text-black py-4 px-4 rounded-xl font-bold text-[20px] max-[520px]:text-center max-[520px]:font-medium max-[520px]:text-[17px]">
                  Watch anime
                  <FontAwesomeIcon icon={faCircleArrowRight} className="ml-2 text-black" />
                </div>
              </Link>
            </div>
          </div>
          <div className="h-full w-[660px] absolute right-0 overflow-hidden rounded-r-[40px] max-[780px]:hidden">
            <img src="/anw-min.webp" alt="Splash" className="absolute inset-0 w-full h-full object-cover object-center" />
            <div className="splashoverlay" />
          </div>
        </div>
      </div>

      <div className="mt-10 pb-10 w-[1300px] mx-auto max-[1350px]:w-full max-[1350px]:px-8 max-[780px]:px-4 max-[520px]:px-3">

        <div className="hidden min-[780px]:block mb-8">
          <div className="flex items-center gap-6  rounded-2xl px-8 py-6 w-full">
            <div className="flex items-center gap-3 shrink-0">
              <img src="https://i.postimg.cc/d34WWyNQ/share-icon.gif" alt="Share AniZen" className="w-[48px] h-[48px] rounded-full" />
              <div>
                <p className="text-[#cae962] font-semibold text-sm leading-tight">Share AniZen</p>
                <p className="text-white/40 text-xs">to your friends</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {SHARE_LINKS.map(s => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 ${s.bg} text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-all duration-200 hover:scale-105`}>
                  {s.icon}
                  {s.count && <span>{s.count}</span>}
                </a>)}
            </div>
          </div>
        </div>

        <div className="rounded-xl px-2 py-6 max-[520px]:px-4 text-white/70 leading-relaxed">
          <h2 className="text-white text-2xl max-[520px]:text-xl font-bold mb-4">
            AniZen – The best site to watch anime online for Free
          </h2>
          <p className="text-base max-[520px]:text-sm mb-3">
            Did you know that anime-related searches have surpassed 1 billion monthly queries on Google? Anime is beloved worldwide, and it&apos;s no surprise that free anime streaming sites have grown rapidly.
          </p>
          <p className="text-base max-[520px]:text-sm mb-3">
            Not all streaming sites are created equal — that&apos;s why we built AniZen to be the best free anime streaming experience for fans everywhere.
          </p>

          <h3 className="text-white text-2xl max-[520px]:text-xl font-bold mt-8 mb-3">1/ What is AniZen?</h3>
          <p className="text-base max-[520px]:text-sm mb-3">
            AniZen is a free site to watch anime — subbed or dubbed — in ultra HD quality, with no registration or payment required. Our goal is to keep the experience clean, fast, and accessible for every fan.
          </p>

          <h3 className="text-white text-2xl max-[520px]:text-xl font-bold mt-8 mb-3">2/ Is AniZen safe?</h3>
          <p className="text-base max-[520px]:text-sm mb-3">
            Yes. We actively scan and review all content to keep the site safe and clean. If you ever encounter anything suspicious, please report it and we&apos;ll remove it immediately.
          </p>

          <h3 className="text-white text-2xl max-[520px]:text-xl font-bold mt-8 mb-4">3/ So what makes AniZen the best site to watch anime free online?</h3>
          <p className="text-base max-[520px]:text-sm mb-4">
            Before building AniZen, we studied many free anime sites and kept only the best practices. Here&apos;s what sets us apart:
          </p>
          <ul className="space-y-3 text-base max-[520px]:text-sm">
            <li><span className="text-white font-bold">Safety:</span> We do our best to avoid harmful or intrusive ads.</li>
            <li><span className="text-white font-bold">Content library:</span> Browse popular, classic, and new titles across action, drama, kids, fantasy, horror, mystery, romance, school, comedy, music, and more — all with English subtitles or dubbed in many languages.</li>
            <li><span className="text-white font-bold">Quality &amp; resolution:</span> All titles stream in excellent resolution. Choose from 360p, 720p, or 1080p depending on your connection speed.</li>
            <li><span className="text-white font-bold">Streaming experience:</span> Faster loading speeds compared to other anime sites. Downloading is just as easy as streaming — save videos to watch offline anytime.</li>
            <li><span className="text-white font-bold">Updates:</span> New titles and episode requests fulfilled daily — you&apos;ll never run out of what to watch.</li>
            <li><span className="text-white font-bold">User interface:</span> Simple and intuitive for all users. Search by title, browse categories, or scroll for new releases.</li>
            <li><span className="text-white font-bold">Device compatibility:</span> Works on both mobile and desktop. For the best experience, we recommend using a desktop.</li>
            <li><span className="text-white font-bold">Customer care:</span> Active 24/7. Contact us anytime for help, queries, or broken link reports — we&apos;re quick to respond.</li>
          </ul>

          <p className="text-base max-[520px]:text-sm mt-6">
            If you&apos;re looking for a trustworthy and safe site for anime streaming, give AniZen a try. And if you like us, please help us spread the word and don&apos;t forget to bookmark our site!
          </p>
          <p className="text-base max-[520px]:text-sm mt-3">Thank you!</p>

          <p className="mt-8 text-center text-white/40 text-sm">© {logoTitle} All rights reserved.</p>
        </div>
      </div>
    </div>;
}
export default SplashScreen;
