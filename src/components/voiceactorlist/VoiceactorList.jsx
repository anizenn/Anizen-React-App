import { useState, useEffect } from "react";
import fetchVoiceActorInfo from "@/src/utils/getVoiceActor.utils";
import VoiceActorlistLoader from "../Loader/VoiceActorlist.loader";
import { useNavigate } from "react-router-dom";
import Error from "../error/Error";
import { cleanupScrollbar, toggleScrollbar } from "@/src/helper/toggleScrollbar";
import PageSlider from "../pageslider/PageSlider";
const MAX_VISIBLE_VA = 5;
function StackedVoiceActors({
  voiceActors
}) {
  const visible = voiceActors.slice(0, MAX_VISIBLE_VA);
  const overflow = voiceActors.length - MAX_VISIBLE_VA;
  return <div className="flex items-center justify-end">
    <div className="flex flex-row-reverse items-center">
      {overflow > 0 && <span className="w-[38px] h-[38px] rounded-full bg-[#555] text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0 -ml-2 z-[1] border-2 border-[#444445] max-[480px]:w-[28px] max-[480px]:h-[28px] max-[480px]:text-[9px]">
        +{overflow}
      </span>}
      {[...visible].reverse().map((va, index) => <img key={index} src={va.poster} title={va.name} alt={va.name || "Voice Actor"} className="w-[38px] h-[38px] rounded-full flex-shrink-0 object-cover grayscale hover:grayscale-0 hover:opacity-100 opacity-80 transition-all duration-300 ease-in-out max-[480px]:w-[28px] max-[480px]:h-[28px]" style={{
        border: "2px solid rgba(105, 108, 117, 0.8)",
        marginLeft: "-10px",
        zIndex: index
      }} onError={e => {
        e.target.src = "https://i.postimg.cc/HnHKvHpz/no-avatar.jpg";
      }} />)}
    </div>
  </div>;
}
function VoiceactorList({
  id,
  isOpen,
  onClose
}) {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [voiceActorData, setVoiceActorData] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    setPage(1);
  }, [id]);
  useEffect(() => {
    toggleScrollbar(isOpen);
    return () => {
      cleanupScrollbar();
    };
  }, [isOpen]);
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      setLoading(true);
      try {
        const data = await fetchVoiceActorInfo(id, page);
        setVoiceActorData(data.data);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err);
        console.error("Error fetching voice actor info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryInfo();
  }, [page, id]);
  useEffect(() => {
    if (error) navigate("/error-page");
  }, [error, navigate]);
  if (error) return <Error />;
  if (!voiceActorData) return null;
  return <div className="fixed top-0 left-0 w-screen h-screen overflow-y-auto bg-black/80 z-50 flex justify-center py-10 max-[575px]:py-3" style={{
    zIndex: 1000000,
    pointerEvents: "auto"
  }}>
    <div className="w-[920px] h-fit flex flex-col relative backdrop-blur-[3px] rounded-lg p-6 bg-white/10 max-[1000px]:w-[80vw] max-md:w-[90vw] max-[480px]:p-3" style={{
      pointerEvents: "auto"
    }}>
      {!loading && <h2 className="text-2xl font-bold col-span-2 max-[480px]:text-lg">
        Characters & Voice Actors
      </h2>}

      {loading ? <VoiceActorlistLoader /> : <div className="w-full grid grid-cols-2 gap-4 mt-5 max-[1000px]:grid-cols-1">
        {voiceActorData.map((item, index) => <div key={index} className="flex p-4 items-center justify-between py-2 bg-[#444445] rounded-lg min-h-[70px] max-[480px]:p-1 max-[480px]:bg-transparent max-[480px]:rounded-none max-[480px]:border-b border-dotted max-[480px]:pb-4">
          <div className="flex gap-x-2 items-center w-[50%] overflow-hidden">
            <img src={item.character.poster} className="w-[45px] h-[45px] rounded-full flex-shrink-0 object-cover hover:cursor-pointer max-[480px]:w-[30px] max-[480px]:h-[30px]" loading="lazy" onError={e => {
              e.target.src = "https://i.postimg.cc/HnHKvHpz/no-avatar.jpg";
            }} />
            <div className="flex flex-col text-left gap-y-1 w-full overflow-hidden">
              {item.character.name && <h1 className="text-[13px] font-semibold max-[480px]:text-[11px] truncate">
                {item.character.name}
              </h1>}

            </div>
          </div>
          {item.voiceActors?.length > 0 && <div className="w-[50%] flex justify-end overflow-hidden pr-1">
            {item.voiceActors.length === 1 ? <div className="flex items-center gap-x-2 overflow-hidden max-[480px]:flex-col-reverse max-[480px]:items-end max-[480px]:gap-y-1">
              {item.voiceActors[0].name && <p className="text-right text-[13px] max-[480px]:text-[11px] truncate">
                {item.voiceActors[0].name}
              </p>}
              <img src={item.voiceActors[0].poster} alt={item.voiceActors[0].name || "Voice Actor"} title={item.voiceActors[0].name} loading="lazy" className="w-[45px] h-[45px] rounded-full flex-shrink-0 object-cover grayscale hover:grayscale-0 opacity-80 hover:opacity-100 max-[480px]:w-[30px] max-[480px]:h-[30px] transition-all duration-300 ease-in-out" onError={e => {
                e.target.src = "https://i.postimg.cc/HnHKvHpz/no-avatar.jpg";
              }} />
            </div> : <StackedVoiceActors voiceActors={item.voiceActors} />}
          </div>}
        </div>)}
      </div>}
      <div className="bg-white w-[30px] h-[30px] p-2 rounded-full text-3xl absolute z-[1000] top-[-14px] right-[-14px] hover:text-[#cae962] cursor-pointer transform transition-all ease-in-out duration-300 flex items-center justify-center hover:bg-[#cae962] max-md:top-0 max-md:right-0 max-md:rounded-none max-md:rounded-bl-lg max-md:rounded-tr-lg" onClick={onClose}>
        <button className="text-black mb-[6px] font-semibold">&times;</button>
      </div>

      <PageSlider page={page} totalPages={totalPages} handlePageChange={setPage} start={true} style={{
        marginTop: "10px"
      }} />
    </div>
  </div>;
}
export default VoiceactorList;