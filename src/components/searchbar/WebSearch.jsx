import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Suggestion from "../suggestion/Suggestion";
import useSearch from "@/src/hooks/useSearch";
import { useNavigate } from "react-router-dom";
function WebSearch({
  variant = 'default'
}) {
  const navigate = useNavigate();
  const {
    setIsSearchVisible,
    searchValue,
    setSearchValue,
    isFocused,
    setIsFocused,
    debouncedValue,
    suggestionRefs,
    addSuggestionRef
  } = useSearch();
  const handleSearchClick = () => {
    if (variant === 'icon') {
      setIsSearchVisible(prev => !prev);
    } else if (searchValue.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchValue)}`);
    }
  };
  if (variant === 'icon') {
    return <div onClick={handleSearchClick}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-lg text-white hover:text-[#cae962]" />
            </div>;
  }
  return <div className="flex items-center relative w-full">
            <div className="flex w-full overflow-hidden duration-200">
                <input type="text" className="bg-white px-3 py-[7px] text-black focus:outline-none w-full text-sm placeholder:text-gray-400" placeholder="Search anime..." value={searchValue} onChange={e => setSearchValue(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => {
        setTimeout(() => {
          const isInsideSuggestionBox = suggestionRefs.current.some(ref => ref && ref.contains(document.activeElement));
          if (!isInsideSuggestionBox) {
            setIsFocused(false);
          }
        }, 100);
      }} onKeyDown={e => {
        if (e.key === 'Enter' && searchValue.trim()) {
          navigate(`/search?keyword=${encodeURIComponent(searchValue)}`);
        }
      }} />
                <button className="bg-white px-3 flex items-center justify-center group transition-colors duration-200 shrink-0" onClick={handleSearchClick}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[14px] text-black transition-colors duration-200" />
                </button>
            </div>
            {searchValue.trim() && isFocused && <div ref={addSuggestionRef} className="absolute z-[100000] top-full w-full">
                    <Suggestion keyword={debouncedValue} className="w-full" />
                </div>}
        </div>;
}
export default WebSearch;
