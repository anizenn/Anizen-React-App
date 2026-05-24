import React, { useCallback, useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClosedCaptioning, faMicrophone, faPlay, faChevronLeft, faChevronRight as faChevronRightSolid } from "@fortawesome/free-solid-svg-icons";
import { FaChevronRight } from "react-icons/fa";
import "./CategoryCard.css";
import { useLanguage } from "@/src/context/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import Qtip from "../qtip/Qtip";
import useToolTipPosition from "@/src/hooks/useToolTipPosition";
const FILTER_TABS = ["All", "Sub", "Dub", "China"];
const ITEMS_PER_PAGE = 12;
const CategoryCard = React.memo(({
  label,
  data,
  showViewMore = true,
  className,
  categoryPage = false,
  cardStyle,
  path,
  limit,
  showFilter = false,
  isLoading = false,
  externalPage,
  externalHasNext,
  onExternalPageChange,
  onExternalTabChange
}) => {
  const {
    language
  } = useLanguage();
  const navigate = useNavigate();
  const [showPlay, setShowPlay] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const isServerPaginated = showFilter && typeof externalPage === "number";
  const filteredData = useMemo(() => {
    if (isServerPaginated) return Array.isArray(data) ? data : [];
    if (!showFilter) return Array.isArray(data) ? data : data?.all ?? [];
    if (!data || typeof data === "object" && !Array.isArray(data)) {
      return data?.[activeFilter.toLowerCase()] ?? data?.all ?? [];
    }
    if (activeFilter === "All") return data;
    if (activeFilter === "Sub") return data.filter(item => item.tvInfo?.sub);
    if (activeFilter === "Dub") return data.filter(item => item.tvInfo?.dub);
    if (activeFilter === "China") return data.filter(item => item.tvInfo?.showType?.toLowerCase().includes("china") || item.type?.toLowerCase().includes("china") || item.country?.toLowerCase().includes("china"));
    return data;
  }, [data, activeFilter, showFilter, isServerPaginated]);
  useEffect(() => {
    if (!isServerPaginated) setCurrentPage(1);
  }, [activeFilter, isServerPaginated]);
  const resolvedPage = isServerPaginated ? externalPage : currentPage;
  const resolvedTotalPages = isServerPaginated ? externalHasNext ? resolvedPage + 1 : resolvedPage : Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = useMemo(() => {
    if (isServerPaginated) return filteredData;
    if (!showFilter) return filteredData;
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage, showFilter, isServerPaginated]);
  const handleFilterChange = tab => {
    setActiveFilter(tab);
    if (isServerPaginated && onExternalTabChange) onExternalTabChange(tab);
  };
  const handlePrev = () => {
    if (isServerPaginated) {
      if (onExternalPageChange && resolvedPage > 1) onExternalPageChange(resolvedPage - 1);
    } else {
      setCurrentPage(p => Math.max(1, p - 1));
    }
  };
  const handleNext = () => {
    if (isServerPaginated) {
      if (onExternalPageChange && resolvedPage < resolvedTotalPages) onExternalPageChange(resolvedPage + 1);
    } else {
      setCurrentPage(p => Math.min(resolvedTotalPages, p + 1));
    }
  };
  if (!showFilter && limit) {
    const arr = Array.isArray(data) ? data : data?.all ?? [];
    data = arr.slice(0, limit);
  }
  const displayData = showFilter ? paginatedData : data;
  const [itemsToRender, setItemsToRender] = useState({
    firstRow: [],
    remainingItems: []
  });
  const getItemsToRender = useCallback(() => {
    if (categoryPage) {
      const firstRow = window.innerWidth > 758 && displayData.length > 4 ? displayData.slice(0, 4) : [];
      const remainingItems = window.innerWidth > 758 && displayData.length > 4 ? displayData.slice(4) : displayData.slice(0);
      return {
        firstRow,
        remainingItems
      };
    }
    return {
      firstRow: [],
      remainingItems: displayData.slice(0)
    };
  }, [categoryPage, displayData]);
  useEffect(() => {
    const handleResize = () => {
      setItemsToRender(getItemsToRender());
    };
    const newItems = getItemsToRender();
    setItemsToRender(prev => {
      if (JSON.stringify(prev.firstRow) !== JSON.stringify(newItems.firstRow) || JSON.stringify(prev.remainingItems) !== JSON.stringify(newItems.remainingItems)) {
        return newItems;
      }
      return prev;
    });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [getItemsToRender]);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const {
    tooltipPosition,
    tooltipHorizontalPosition,
    cardRefs
  } = useToolTipPosition(hoveredItem, displayData);
  const handleMouseEnter = (item, index) => {
    const timeout = setTimeout(() => {
      setHoveredItem(item.id + index);
      setShowPlay(true);
    }, 400);
    setHoverTimeout(timeout);
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout);
    setHoveredItem(null);
    setShowPlay(false);
  };
  return <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl text-[#cae962] max-[478px]:text-[18px] capitalize">
            {label}
          </h1>
          {showFilter ? <div className="flex items-center gap-x-2">
              <ul className="flex justify-between w-fit bg-[#2a2c31] rounded-[4px] text-sm font-bold">
                {FILTER_TABS.map((tab, index) => <li key={tab} className={`cursor-pointer p-2 px-3 transition-all duration-200 ${activeFilter === tab ? "bg-[#cae962] text-[#000000]" : "text-white hover:text-[#cae962]"} ${index === 0 ? "rounded-l-[4px]" : ""} ${index === FILTER_TABS.length - 1 ? "rounded-r-[4px]" : ""} ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`} onClick={() => !isLoading && handleFilterChange(tab)}>
                    {tab}
                  </li>)}
              </ul>
              <button onClick={handlePrev} disabled={resolvedPage === 1 || isLoading} className={`w-7 h-7 flex items-center justify-center rounded-sm border transition-all duration-200 ${resolvedPage === 1 || isLoading ? "border-gray-700 text-gray-700 cursor-not-allowed" : "border-gray-500 text-gray-300 hover:border-[#cae962] hover:text-[#cae962]"}`}>
                <FontAwesomeIcon icon={faChevronLeft} className="text-[11px]" />
              </button>
              <div className="relative group/page">
                <button onClick={handleNext} disabled={resolvedPage >= resolvedTotalPages || isLoading} className={`w-7 h-7 flex items-center justify-center rounded-sm border transition-all duration-200 ${resolvedPage >= resolvedTotalPages || isLoading ? "border-gray-700 text-gray-700 cursor-not-allowed" : "border-gray-500 text-gray-300 hover:border-[#cae962] hover:text-[#cae962]"}`}>
                  <FontAwesomeIcon icon={faChevronRightSolid} className="text-[11px]" />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-[2px] bg-white text-black text-[11px] font-semibold rounded whitespace-nowrap opacity-0 group-hover/page:opacity-100 transition-opacity duration-150 pointer-events-none">
                  Page {resolvedPage}
                </div>
              </div>
            </div> : showViewMore && <Link to={`/${path}`} className="flex w-fit items-baseline h-fit rounded-3xl gap-x-1 group">
                <p className="text-white text-[12px] font-semibold h-fit leading-0 group-hover:text-[#cae962] transition-all ease-out">
                  View more
                </p>
                <FaChevronRight className="text-white text-[10px] group-hover:text-[#cae962] transition-all ease-out" />
              </Link>}
        </div>
        <div className={`relative transition-opacity duration-200 ${isLoading ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
          {categoryPage && <div className={`grid grid-cols-4 gap-x-3 gap-y-8 transition-all duration-300 ease-in-out ${categoryPage && itemsToRender.firstRow.length > 0 ? "mt-8 max-[758px]:hidden" : ""}`}>
              {itemsToRender.firstRow.map((item, index) => <div key={index} className="flex flex-col transition-transform duration-300 ease-in-out" style={{
          height: "fit-content"
        }} ref={el => cardRefs.current[index] = el}>
                  <div className="w-full relative group hover:cursor-pointer" onClick={() => navigate(path === "upcoming" ? `/${item.link || item.id}` : `/watch/${item.link || item.id}`)} onMouseEnter={() => handleMouseEnter(item, index)} onMouseLeave={handleMouseLeave}>
                    {hoveredItem === item.id + index && showPlay && <FontAwesomeIcon icon={faPlay} className="text-[40px] text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000]" />}

                    <div className="overlay"></div>
                    <div className="overflow-hidden">
                      <img src={`${item.poster}`} alt={item.title} className={`w-full h-[320px] object-cover max-[1200px]:h-[35vw] max-[758px]:h-[45vw] max-[478px]:h-[60vw] group-hover:blur-[7px] transform transition-all duration-300 ease-in-out ultra-wide:h-[400px] ${cardStyle}`} />
                    </div>
                    {(item.tvInfo?.rating === "18+" || item?.adultContent === true) && <div className="text-white px-2 rounded-md bg-[#FF5700] absolute top-2 left-2 flex items-center justify-center text-[14px] font-bold">
                          18+
                        </div>}
                    <div className="absolute left-2 bottom-3 flex items-center justify-center w-fit space-x-1 z-[100] max-[270px]:flex-col max-[270px]:gap-y-[3px]">
                      {item.tvInfo?.sub && <div className="flex space-x-1 justify-center items-center bg-[#B0E3AF] rounded-[2px] px-[4px] text-black py-[2px]">
                          <FontAwesomeIcon icon={faClosedCaptioning} className="text-[12px]" />
                          <p className="text-[12px] font-bold">
                            {item.tvInfo?.sub}
                          </p>
                        </div>}
                      {item.tvInfo?.dub && <div className="flex space-x-1 justify-center items-center bg-[#B9E7FF] rounded-[2px] px-[8px] text-black py-[2px]">
                          <FontAwesomeIcon icon={faMicrophone} className="text-[12px]" />
                          <p className="text-[12px] font-bold">
                            {item.tvInfo?.dub}
                          </p>
                        </div>}
                      {item.tvInfo?.eps && <div className="flex space-x-1 justify-center items-center bg-[#a9a6b16f] rounded-[2px] px-[8px] text-white py-[2px]">
                          <p className="text-[12px] font-extrabold">
                            {item.tvInfo?.eps}
                          </p>
                        </div>}
                    </div>
                    {hoveredItem === item.id + index && window.innerWidth > 1024 && <div className={`absolute ${tooltipPosition} ${tooltipHorizontalPosition} z-[100000] transform transition-all duration-300 ease-in-out ${hoveredItem === item.id + index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                          <Qtip id={item.id} />
                        </div>}
                  </div>
                  <Link to={`/${item.link || item.id}`} className="text-white font-semibold mt-1 item-title hover:text-[#cae962] hover:cursor-pointer">
                    <div className="line-clamp-1">
                      {language === 'JP' ? item.japanese_title || item.romaji || item.title_romaji || item.title : item.title}
                    </div>
                  </Link>
                  {item.description && <div className="line-clamp-3 text-[13px] font-extralight text-[#b1b0b0] max-[1200px]:hidden">
                      {item.description}
                    </div>}
                  <div className="flex items-center gap-x-2 w-full mt-2 overflow-hidden">
                    {item.tvInfo?.showType && <div className="text-gray-400 text-[14px] text-nowrap overflow-hidden text-ellipsis">
                        {item.tvInfo.showType.split(" ").shift()}
                      </div>}
                    {item.tvInfo?.showType && item.tvInfo?.duration && item.tvInfo.duration !== "m" && item.tvInfo.duration !== "?" && <div className="dot"></div>}
                    {item.tvInfo?.duration && item.tvInfo.duration !== "m" && item.tvInfo.duration !== "?" && <div className="text-gray-400 text-[14px] text-nowrap overflow-hidden text-ellipsis">
                        {item.tvInfo.duration}
                      </div>}
                  </div>
                </div>)}
            </div>}
          <div className="grid grid-cols-6 gap-x-3 gap-y-8 mt-6 transition-all duration-300 ease-in-out max-[1400px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-2">
            {itemsToRender.remainingItems.map((item, index) => {
          const flatIndex = index + itemsToRender.firstRow.length;
          return <div key={index} className="flex flex-col transition-transform duration-300 ease-in-out" style={{
            height: "fit-content"
          }} ref={el => cardRefs.current[flatIndex] = el}>
                  <div className="w-full relative group hover:cursor-pointer" onClick={() => navigate(path === "upcoming" ? `/${item.link || item.id}` : `/watch/${item.link || item.id}`)} onMouseEnter={() => handleMouseEnter(item, flatIndex)} onMouseLeave={handleMouseLeave}>
                    {hoveredItem === item.id + flatIndex && showPlay && <FontAwesomeIcon icon={faPlay} className="text-[40px] text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000]" />}
                    <div className="overlay"></div>
                    <div className="overflow-hidden">
                      <img src={`${item.poster}`} alt={item.title} className={`w-full h-[250px] object-cover max-[1200px]:h-[35vw] max-[758px]:h-[45vw] max-[478px]:h-[60vw] ${cardStyle} group-hover:blur-[7px] transform transition-all duration-300 ease-in-out `} />
                    </div>
                    {(item.tvInfo?.rating === "18+" || item?.adultContent === true) && <div className="text-white px-2 rounded-md bg-[#FF5700] absolute top-2 left-2 flex items-center justify-center text-[14px] font-bold">
                          18+
                        </div>}
                    <div className="absolute left-2 bottom-4 flex items-center justify-center w-fit space-x-1 z-[100] max-[270px]:flex-col max-[270px]:gap-y-[3px]">
                      {item.tvInfo?.sub && <div className="flex space-x-1 justify-center items-center bg-[#B0E3AF] rounded-[2px] px-[4px] text-black py-[2px]">
                          <FontAwesomeIcon icon={faClosedCaptioning} className="text-[12px]" />
                          <p className="text-[12px] font-bold">
                            {item.tvInfo?.sub}
                          </p>
                        </div>}
                      {item.tvInfo?.dub && <div className="flex space-x-1 justify-center items-center bg-[#B9E7FF] rounded-[2px] px-[8px] text-black py-[2px]">
                          <FontAwesomeIcon icon={faMicrophone} className="text-[12px]" />
                          <p className="text-[12px] font-bold">
                            {item.tvInfo?.dub}
                          </p>
                        </div>}
                      {item.tvInfo?.eps && <div className="flex space-x-1 justify-center items-center bg-[#a9a6b16f] rounded-[2px] px-[8px] text-white py-[2px]">
                          <p className="text-[12px] font-extrabold">
                            {item.tvInfo?.eps}
                          </p>
                        </div>}
                    </div>
                    {hoveredItem === item.id + flatIndex && window.innerWidth > 1024 && <div className={`absolute ${tooltipPosition} ${tooltipHorizontalPosition} z-[100000] transform transition-all duration-300 ease-in-out ${hoveredItem === item.id + flatIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                          <Qtip id={item.id} />
                        </div>}
                  </div>
                  <Link to={`/${item.link || item.id}`} className="text-white font-semibold mt-1 item-title hover:text-[#cae962] hover:cursor-pointer">
                    <div className="line-clamp-1">
                      {language === 'JP' ? item.japanese_title || item.romaji || item.title_romaji || item.title : item.title}
                    </div>
                  </Link>
                  <div className="flex items-center gap-x-2 w-full mt-2 overflow-hidden">
                    {item.tvInfo?.showType && <div className="text-gray-400 text-[14px] text-nowrap overflow-hidden text-ellipsis">
                        {item.tvInfo.showType.split(" ").shift()}
                      </div>}
                    {item.tvInfo?.showType && item.tvInfo?.duration && item.tvInfo.duration !== "m" && item.tvInfo.duration !== "?" && <div className="dot"></div>}
                    {item.tvInfo?.duration && item.tvInfo.duration !== "m" && item.tvInfo.duration !== "?" && <div className="text-gray-400 text-[14px] text-nowrap overflow-hidden text-ellipsis">
                        {item.tvInfo.duration}
                      </div>}
                  </div>
                </div>;
        })}
          </div>
        </div>
      </div>;
});
CategoryCard.displayName = "CategoryCard";
export default CategoryCard;
