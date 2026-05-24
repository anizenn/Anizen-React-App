import { createContext, useContext, useState, useEffect } from "react";
import getHomeInfo from "../utils/getHomeInfo.utils.js";
const HomeInfoContext = createContext();
const isValidHomeInfo = data => {
  if (!data || typeof data !== "object") return false;
  return Object.values(data).some(value => Array.isArray(value) && value.length > 0 || typeof value === "object" && value !== null && Object.keys(value).length > 0);
};
export const HomeInfoProvider = ({
  children
}) => {
  const [homeInfo, setHomeInfo] = useState(null);
  const [homeInfoLoading, setHomeInfoLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const fetchHomeInfo = async () => {
      setHomeInfoLoading(true);
      try {
        const data = await getHomeInfo();
        if (cancelled) return;
        if (isValidHomeInfo(data)) {
          setHomeInfo(data);
          setError(null);
        } else {
          setError(new Error("Invalid or empty home data"));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching home info:", err);
          setError(err);
        }
      } finally {
        if (!cancelled) setHomeInfoLoading(false);
      }
    };
    fetchHomeInfo();
    return () => {
      cancelled = true;
    };
  }, []);
  return <HomeInfoContext.Provider value={{
    homeInfo,
    homeInfoLoading,
    error
  }}>
      {children}
    </HomeInfoContext.Provider>;
};
export const useHomeInfo = () => useContext(HomeInfoContext);
