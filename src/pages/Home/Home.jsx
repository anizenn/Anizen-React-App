import Spotlight from "@/src/components/spotlight/Spotlight.jsx";
import Trending from "@/src/components/trending/Trending.jsx";
import Cart from "@/src/components/cart/Cart.jsx";
import CategoryCard from "@/src/components/categorycard/CategoryCard.jsx";
import Topten from "@/src/components/topten/Topten.jsx";
import Loader from "@/src/components/Loader/Loader.jsx";
import Error from "@/src/components/error/Error.jsx";
import { useHomeInfo } from "@/src/context/HomeInfoContext.jsx";
import ContinueWatching from "@/src/components/continue/ContinueWatching";
import { useState, useEffect, useCallback } from "react";
import { fetchLatestTab } from "@/src/utils/getLatestUpdates.utils.js";
import notify from "@/src/utils/Toast";
function Home() {
  const {
    homeInfo,
    homeInfoLoading,
    error
  } = useHomeInfo();
  const [latestItems, setLatestItems] = useState([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [latestTab, setLatestTab] = useState("all");
  const [latestPage, setLatestPage] = useState(1);
  const [latestHasNext, setLatestHasNext] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setLatestLoading(true);
    fetchLatestTab(latestTab, latestPage).then(({
      items,
      hasNextPage
    }) => {
      if (cancelled) return;
      setLatestItems(items);
      setLatestHasNext(hasNextPage);
      setLatestLoading(false);
    }).catch(err => {
      notify("error", err?.message || "Failed to load latest updates");
      if (!cancelled) setLatestLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [latestTab, latestPage]);
  const handleLatestTabChange = useCallback(tab => {
    setLatestTab(tab.toLowerCase());
    setLatestPage(1);
  }, []);
  const handleLatestPageChange = useCallback(newPage => {
    setLatestPage(newPage);
  }, []);
  if (homeInfoLoading) return <Loader type="home" />;
  if (error) return <Error />;
  if (!homeInfo) return <Error error="404" />;
  return <>
      <Spotlight spotlights={homeInfo.spotlights} />
      <div className="px-4 w-full">
        <ContinueWatching />
        <Trending trending={homeInfo.trending} />
        <div className="mt-10 grid grid-cols-4 gap-6 max-[1200px]:grid-cols-2 max-[1200px]:mt-12 max-md:grid-cols-1">
          <Cart label="New Releases" data={homeInfo.new_releases} path="new-releases" />
          <Cart label="Recently Added" data={homeInfo.recently_added} path="recent" />
          <Cart label="Upcoming" data={homeInfo.upcoming} path="upcoming" />
          <Cart label="Completed" data={homeInfo.latest_completed} path="completed" />
        </div>
        <div className="w-full grid grid-cols-[minmax(0,75%),minmax(0,25%)] gap-x-6 max-[1200px]:flex flex-col">
          <div>
            <CategoryCard label="Latest Updates" data={latestItems} className={"mt-[60px]"} path="latest" showFilter={true} isLoading={latestLoading} externalPage={latestPage} externalHasNext={latestHasNext} onExternalPageChange={handleLatestPageChange} onExternalTabChange={handleLatestTabChange} />
          </div>
          <div className="w-full mt-[60px]">
            <Topten data={homeInfo.topten} />
          </div>
        </div>
      </div>
    </>;
}
export default Home;
