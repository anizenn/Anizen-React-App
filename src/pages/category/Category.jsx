import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import getCategoryInfo from "@/src/utils/getCategoryInfo.utils";
import CategoryCard from "@/src/components/categorycard/CategoryCard";
import Genre from "@/src/components/genres/Genre";
import Topten from "@/src/components/topten/Topten";
import Error from "@/src/components/error/Error";
import { useHomeInfo } from "@/src/context/HomeInfoContext";
import PageSlider from "@/src/components/pageslider/PageSlider";
import SidecardLoader from "@/src/components/Loader/Sidecard.loader";
import CategoryCardLoader from "@/src/components/Loader/CategoryCard.loader";
import notify from "@/src/utils/Toast";
function Category({
  path,
  label
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const page = parseInt(searchParams.get("page")) || 1;
  const {
    homeInfo,
    homeInfoLoading
  } = useHomeInfo();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      setLoading(true);
      try {
        const data = await getCategoryInfo(path, page);
        setCategoryInfo(data?.response ?? []);
        setTotalPages(data?.pageInfo?.lastPage ?? data?.pageInfo?.totalPages ?? 0);
        setLoading(false);
      } catch (err) {
        setError(err);
        notify("error", err?.message || "Failed to load category");
      }
    };
    fetchCategoryInfo();
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [path, page]);
  useEffect(() => {
    if (error) {
      navigate("/error-page");
    }
  }, [error, navigate]);
  useEffect(() => {
    if (!loading && !error && !categoryInfo) {
      navigate("/404-not-found-page");
    }
  }, [loading, error, categoryInfo, navigate]);
  if (error) {
    return <Error />;
  }
  if (!categoryInfo && !loading) {
    return null;
  }
  const handlePageChange = newPage => {
    setSearchParams({
      page: newPage
    });
  };
  return <div className="w-full flex flex-col gap-y-4 mt-6 max-md:mt-4">
      <div className="w-full px-4 grid grid-cols-[minmax(0,75%),minmax(0,25%)] gap-x-6 max-[1200px]:flex max-[1200px]:flex-col max-[1200px]:gap-y-10">
        <div>
          {loading ? <CategoryCardLoader className="mt-5" /> : page > totalPages ? <p className="font-bold text-2xl text-[#cae962] max-[478px]:text-[18px] max-[300px]:leading-6">
              You came a long way, go back <br className="max-[300px]:hidden" />
              nothing is here
            </p> : <>
              {categoryInfo && categoryInfo.length > 0 && <CategoryCard label={label.split("/").pop()} data={categoryInfo} showViewMore={false} className={"mt-0"} categoryPage={true} path={path} />}
              <PageSlider page={page} totalPages={totalPages} handlePageChange={handlePageChange} />
            </>}
        </div>

        <div className="w-full flex flex-col gap-y-10">
          {homeInfoLoading && !homeInfo ? <SidecardLoader /> : <>
              {homeInfo?.topten && <Topten data={homeInfo.topten} className="mt-0" />}
              {homeInfo?.genres && <Genre data={homeInfo.genres} />}
            </>}
        </div>
      </div>
    </div>;
}
export default Category;
