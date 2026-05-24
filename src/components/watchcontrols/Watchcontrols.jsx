import { faBackward, faForward } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
const ToggleButton = ({
  label,
  isActive,
  onClick
}) => <button className="flex items-center gap-x-1.5 whitespace-nowrap" onClick={onClick}>
    <span className="capitalize text-[13px] max-sm:text-[11px]">{label}</span>
    <span className={`text-[13px] max-sm:text-[11px] font-semibold ${isActive ? "text-[#cae962]" : "text-red-400"}`}>
      {isActive ? "on" : "off"}
    </span>
  </button>;
export default function WatchControls({
  autoPlay,
  setAutoPlay,
  autoSkipIntro,
  setAutoSkipIntro,
  autoNext,
  setAutoNext,
  episodeId,
  episodes = [],
  onButtonClick
}) {
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(episodes?.findIndex(episode => String(episode.number) === String(episodeId)));
  useEffect(() => {
    if (episodes?.length > 0) {
      const newIndex = episodes.findIndex(episode => String(episode.number) === String(episodeId));
      setCurrentEpisodeIndex(newIndex);
    }
  }, [episodeId, episodes]);
  return <div className="bg-[#11101A] w-full flex justify-between items-center flex-wrap gap-y-3 px-4 py-3 max-[1200px]:bg-[#14151A]">
      <div className="flex gap-x-3 gap-y-2 flex-wrap items-center">
        <ToggleButton label="auto play" isActive={autoPlay} onClick={() => setAutoPlay(prev => !prev)} />
        <ToggleButton label="auto skip intro & outro" isActive={autoSkipIntro} onClick={() => setAutoSkipIntro(prev => !prev)} />
        <ToggleButton label="auto next" isActive={autoNext} onClick={() => setAutoNext(prev => !prev)} />
      </div>
      <div className="flex gap-x-5 max-sm:gap-x-4 shrink-0">
        <button onClick={() => {
        if (currentEpisodeIndex > 0) {
          onButtonClick(String(episodes[currentEpisodeIndex - 1].number));
        }
      }} disabled={currentEpisodeIndex <= 0}>
          <FontAwesomeIcon icon={faBackward} className="text-[20px] max-[575px]:text-[16px] text-white" />
        </button>
        <button onClick={() => {
        if (currentEpisodeIndex < episodes?.length - 1) {
          onButtonClick(String(episodes[currentEpisodeIndex + 1].number));
        }
      }} disabled={currentEpisodeIndex >= episodes?.length - 1}>
          <FontAwesomeIcon icon={faForward} className="text-[20px] max-[575px]:text-[16px] text-white" />
        </button>
      </div>
    </div>;
}
