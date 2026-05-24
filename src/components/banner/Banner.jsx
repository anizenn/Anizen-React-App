import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faClosedCaptioning, faMicrophone, faCalendar, faClock } from "@fortawesome/free-solid-svg-icons";
import { FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useLanguage } from "@/src/context/LanguageContext";
import "./Banner.css";
function Banner({
  item,
  index
}) {
  const {
    language
  } = useLanguage();
  return <section className="px-4 spotlight w-full h-full">
      <img src={`${item.banner}`} alt={item.title} className="absolute right-0 object-cover h-full w-4/5 max-[1200px]:w-full" />
      <div className="spotlight-overlay"></div>
      <div className="absolute flex flex-col left-0 bottom-8 max-xl:bottom-4 w-[55%] max-xl:w-[50%] max-lg:w-[72%] max-md:w-[90%] max-sm:w-[95%] p-4 z-10">
        <p className="text-[#cae962] font-semibold text-lg max-lg:text-[15px]">
          #{index + 1} Spotlight
        </p>
        <h3 className="text-white line-clamp-2 font-bold  text-left text-5xl max-xl:text-[2.75rem] max-lg:text-3xl max-md:text-2xl max-sm:text-xl">
          {language === 'JP' ? item.japanese_title || item.romaji || item.title_romaji || item.title : item.title}
        </h3>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-5 max-lg:mt-3 max-[575px]:hidden">
          {item.tvInfo && <>
              {item.tvInfo?.showType && <div className="flex items-center gap-x-1">
                  <FontAwesomeIcon icon={faPlay} className="text-[8px] bg-white px-[4px] py-[3px] rounded-full" />
                  <p className="text-white text-[16px]">
                    {item.tvInfo?.showType}
                  </p>
                </div>}

              {item.tvInfo?.duration && <div className="flex items-center gap-x-1">
                  <FontAwesomeIcon icon={faClock} className="text-white text-[14px]" />
                  <p className="text-white text-[17px]">
                    {item.tvInfo?.duration}
                  </p>
                </div>}

              {item.tvInfo?.releaseDate && <div className="flex items-center gap-x-1 max-sm:hidden">
                  <FontAwesomeIcon icon={faCalendar} className="text-white text-[14px]" />
                  <p className="text-white text-[16px]">
                    {item.tvInfo?.releaseDate}
                  </p>
                </div>}

              <div className="flex items-center gap-x-2">
                {item.tvInfo?.quality && <div className="bg-[#cae962] py-[1px] px-[6px] rounded-md w-fit text-[11px] font-bold h-fit">
                    {item.tvInfo?.quality}
                  </div>}
                <div className="flex rounded-[5px] overflow-hidden">
                  {item.tvInfo?.episodeInfo?.sub && <div className="flex space-x-1 justify-center items-center bg-[#B0E3AF] px-[4px]">
                      <FontAwesomeIcon icon={faClosedCaptioning} className="text-[12px]" />
                      <p className="text-[12px] font-bold">
                        {item.tvInfo?.episodeInfo?.sub}
                      </p>
                    </div>}

                  {item.tvInfo?.episodeInfo?.dub && <div className="flex space-x-1 justify-center items-center bg-[#B9E7FF] px-[4px]">
                      <FontAwesomeIcon icon={faMicrophone} className="text-[12px]" />
                      <p className="text-[12px] font-semibold">
                        {item.tvInfo?.episodeInfo?.dub}
                      </p>
                    </div>}
                </div>
              </div>
            </>}
        </div>
        <p className="text-white/80 text-[15px] mt-5 text-left line-clamp-2 max-md:hidden">
          {item.description}
        </p>
        <div className="flex flex-wrap gap-3 mt-7 max-md:mt-5">
          <Link to={`/watch/${item.link || item.id}`} className="flex items-center bg-[#cae962] px-5 py-2.5 rounded-full gap-x-2 hover:bg-[#b8d44e] transition-colors">
            <FontAwesomeIcon icon={faPlay} className="text-[8px] bg-black px-[6px] py-[6px] rounded-full text-[#cae962]" />
            <span className="font-semibold text-black text-[15px]">Watch Now</span>
          </Link>
          <Link to={`/${item.link || item.id}`} className="flex bg-white/10 hover:bg-white/20 items-center px-5 py-2.5 rounded-full gap-x-2 transition-colors">
            <p className="text-white font-semibold text-[15px]">Detail</p>
            <FaChevronRight className="text-white" />
          </Link>
        </div>
      </div>
    </section>;
}
export default Banner;
