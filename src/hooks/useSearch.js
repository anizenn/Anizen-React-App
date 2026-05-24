import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useSearchContext } from "@/src/context/SearchContext";
const useSearch = () => {
  const {
    isSearchVisible,
    setIsSearchVisible
  } = useSearchContext();
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState("");
  const suggestionRefs = useRef([]);
  const location = useLocation();
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue);
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [searchValue]);
  useEffect(() => {
    setIsSearchVisible(false);
    if (location.pathname === "/search") {
      const params = new URLSearchParams(location.search);
      const keyword = params.get("keyword") || "";
      setSearchValue(keyword);
      setDebouncedValue(keyword);
    } else if (!location.pathname.startsWith("/watch")) {
      setSearchValue("");
      setDebouncedValue("");
    }
  }, [location, setIsSearchVisible]);
  useEffect(() => {
    const handleClickOutside = event => {
      const isInsideSuggestionBox = suggestionRefs.current.some(ref => ref && ref.contains(event.target));
      const isInsideInput = document.activeElement === event.target;
      if (!isInsideSuggestionBox && !isInsideInput) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const addSuggestionRef = useCallback(ref => {
    if (ref && !suggestionRefs.current.includes(ref)) {
      suggestionRefs.current.push(ref);
    }
  }, []);
  return {
    isSearchVisible,
    setIsSearchVisible,
    searchValue,
    setSearchValue,
    isFocused,
    setIsFocused,
    debouncedValue,
    suggestionRefs,
    addSuggestionRef
  };
};
export default useSearch;
