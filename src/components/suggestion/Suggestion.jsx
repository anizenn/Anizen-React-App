import getSearchSuggestion from "@/src/utils/getSearchSuggestion.utils";
import { useEffect, useState } from "react";
import BouncingLoader from "../ui/bouncingloader/Bouncingloader";
import { FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useLanguage } from "@/src/context/LanguageContext";
function Suggestion({
  keyword,
  className
}) {
  const {
    language
  } = useLanguage();
  const [suggestion, setSuggestion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!keyword?.trim()) return;
    const controller = new AbortController();
    const fetchSearchSuggestion = async () => {
      setLoading(true);
      setSuggestion([]);
      setError(null);
      try {
        const data = await getSearchSuggestion(keyword);
        if (controller.signal.aborted) return;
        setSuggestion(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Error fetching search suggestion info:", err);
        setError(err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchSearchSuggestion();
    return () => controller.abort();
  }, [keyword]);
  return <div className={`bg-[#2a2c31] ${className} flex ${loading ? "justify-center py-7" : "justify-start"} items-center`} style={{
    boxShadow: "0 20px 20px rgba(0, 0, 0, .3)"
  }}>
      {loading ? <BouncingLoader /> : error ? <div className="p-3 text-sm text-red-400">Error loading suggestions</div> : suggestion.length > 0 ? <div className="w-full flex flex-col pt-2 overflow-y-auto">
          {suggestion.map((item, index) => {
        const showType = item.tvInfo?.showType;
        const duration = item.tvInfo?.duration;
        const releaseDate = item.animeInfo?.Premiered || item.animeInfo?.Aired;
        const hasInfo = releaseDate || showType || duration;
        return <Link to={`/${item.link || item.id}`} key={item.id || index} className="group py-2 flex items-start gap-x-3 hover:bg-[#3c3a5e] cursor-pointer px-[10px]" style={{
          borderBottom: index === suggestion.length - 1 ? "none" : "1px dashed rgba(255, 255, 255, .075)"
        }}>
                <img src={item.poster} className="w-[50px] h-[75px] flex-shrink-0 object-cover" alt="" onError={e => {
            e.target.src = "https://i.postimg.cc/HnHKvHpz/no-avatar.jpg";
          }} />
                <div className="flex flex-col gap-y-[2px]">
                  {item.title && <h1 className="line-clamp-1 leading-5 font-bold text-[15px] group-hover:text-[#cae962]">
                      {language === 'JP' ? item.japanese_title || item.romaji || item.title_romaji || item.title : item.title}
                    </h1>}
                  {hasInfo && <div className="flex gap-x-[5px] items-center w-full justify-start mt-[4px]">
                      {releaseDate && <p className="leading-5 text-[13px] font-light text-[#aaaaaa]">
                          {releaseDate}
                        </p>}
                      {releaseDate && showType && <span className="dot" />}
                      {showType && <p className="leading-5 text-[13px] font-medium group-hover:text-[#cae962]">
                          {showType}
                        </p>}
                      {(releaseDate || showType) && duration && <span className="dot" />}
                      {duration && <p className="leading-5 text-[13px] font-light text-[#aaaaaa]">
                          {duration}
                        </p>}
                    </div>}
                </div>
              </Link>;
      })}

          <Link className="w-full flex py-4 justify-center items-center bg-[#cae962]" to={`/search?keyword=${encodeURIComponent(keyword)}`}>
            <div className="flex w-fit items-center gap-x-2">
              <p className="text-[17px] font-light text-black">View all results</p>
              <FaChevronRight className="text-black text-[12px] font-black mt-[2px]" />
            </div>
          </Link>
        </div> : <p className="text-[17px] p-3">No results found!</p>}
    </div>;
}
export default Suggestion;
