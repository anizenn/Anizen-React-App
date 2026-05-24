import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import getCategoryInfo from "@/src/utils/getCategoryInfo.utils";
import CategoryCard from "@/src/components/categorycard/CategoryCard";
import Loader from "@/src/components/Loader/Loader";
import Error from "@/src/components/error/Error";
import PageSlider from "@/src/components/pageslider/PageSlider";
const LETTERS = [{
  label: "All",
  path: ""
}, {
  label: "0-9",
  path: "0-9"
}, ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => ({
  label: l,
  path: l
}))];
function AtoZ({
  path
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const page = parseInt(searchParams.get("page")) || 1;
  const currentLetter = path.split("/").pop() ?? "";
  const effectivePath = currentLetter === "" ? "az-list/all" : path;
  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getCategoryInfo(effectivePath, page);
        if (!cancelled) {
          setCategoryInfo(data.response);
          setTotalPages(data.pageInfo.totalPages);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    window.scrollTo(0, 0);
    return () => {
      cancelled = true;
    };
  }, [effectivePath, page]);
  if (loading) return <Loader type="AtoZ" />;
  if (error) return <Error />;
  if (!categoryInfo) return null;
  return <div className="max-w-[1260px] mx-auto px-[10px] flex flex-col  max-md:mt-[50px]">
      <ul className="flex gap-x-2 mt-[50px] items-center w-fit max-[1200px]:hidden">
        <li className="flex gap-x-3 items-center">
          <Link to="/home" className="text-white hover:text-[#cae962] text-[17px]">
            Home
          </Link>
          <div className="dot mt-[1px] bg-white" />
        </li>
        <li className="font-light">A-Z List</li>
      </ul>
      <div className="flex flex-col gap-y-5 mt-6">
        <h1 className="font-bold text-2xl text-[#cae962] max-[478px]:text-[18px]">
          Sort By Letters
        </h1>
        <div className="flex gap-x-[7px] flex-wrap gap-y-2">
          {LETTERS.map(({
          label,
          path: letterPath
        }) => {
          const isActive = currentLetter.toLowerCase() === letterPath.toLowerCase();
          return <Link key={label} to={`/az-list/${letterPath}`} className={`text-md py-1 px-4 rounded-md font-bold transition-all ease-out
                  ${isActive ? "bg-[#cae962] text-white" : "bg-[#33353c] hover:bg-[#cae962] hover:text-white"}`}>
                {label}
              </Link>;
        })}
        </div>
      </div>
      <div className="w-full flex flex-col gap-y-8">
        {categoryInfo.length > 0 && <CategoryCard data={categoryInfo} limit={categoryInfo.length} showViewMore={false} className="mt-0" cardStyle="max-[1400px]:h-[35vw]" />}
        <PageSlider page={page} totalPages={totalPages} handlePageChange={newPage => setSearchParams({
        page: newPage
      })} />
      </div>
    </div>;
}
export default AtoZ;
