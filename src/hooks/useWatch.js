import { useState, useEffect, useRef } from "react";
import getAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import getEpisodes from "@/src/utils/getEpisodes.utils";
import getServers from "../utils/getServers.utils";
import notify from "../utils/Toast";
import getStreamInfo from "../utils/getStreamInfo.utils";
export const useWatch = (animeId, initialEpisodeId) => {
  const [error, setError] = useState(null);
  const [buffering, setBuffering] = useState(true);
  const [streamInfo, setStreamInfo] = useState(null);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [episodes, setEpisodes] = useState(null);
  const [animeInfoLoading, setAnimeInfoLoading] = useState(false);
  const [totalEpisodes, setTotalEpisodes] = useState(null);
  const [seasons, setSeasons] = useState(null);
  const [servers, setServers] = useState(null);
  const [isFullOverview, setIsFullOverview] = useState(false);
  const [episodeId, setEpisodeId] = useState(null);
  const [activeEpisodeNum, setActiveEpisodeNum] = useState(null);
  const [activeServerId, setActiveServerId] = useState(null);
  const [serverLoading, setServerLoading] = useState(true);
  const [nextEpisodeSchedule, setNextEpisodeSchedule] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const isStreamFetchInProgress = useRef(false);
  const resetState = () => {
    setEpisodes(null);
    setEpisodeId(null);
    setActiveEpisodeNum(null);
    setServers(null);
    setActiveServerId(null);
    setStreamInfo(null);
    setBuffering(true);
    setServerLoading(true);
    setError(null);
    setAnimeInfo(null);
    setSeasons(null);
    setTotalEpisodes(null);
    setAnimeInfoLoading(true);
    isStreamFetchInProgress.current = false;
  };
  useEffect(() => {
    resetState();
  }, [animeId]);
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setAnimeInfoLoading(true);
        const animeData = await getAnimeInfo(animeId, false);
        setAnimeInfo(animeData);
        setSeasons(animeData?.seasons);
        if (animeData?.nextEpisodeTimestamp) {
          setNextEpisodeSchedule({
            nextEpisodeSchedule: new Date(animeData.nextEpisodeTimestamp * 1000).toISOString()
          });
        }
        const episodesFetchId = animeData?.id || animeId;
        const episodesData = await getEpisodes(episodesFetchId);
        setEpisodes(episodesData?.episodes);
        setTotalEpisodes(episodesData?.totalEpisodes);
        const firstEpNumber = episodesData?.episodes?.[0]?.number ?? null;
        const newEpisodeId = initialEpisodeId || firstEpNumber;
        setEpisodeId(newEpisodeId);
      } catch (err) {
        setError(err.message || "An error occurred.");
        notify("error", err.message || "Failed to load anime data");
      } finally {
        setAnimeInfoLoading(false);
      }
    };
    fetchInitialData();
  }, [animeId, initialEpisodeId]);
  useEffect(() => {
    if (!episodes || !episodeId) {
      setActiveEpisodeNum(null);
      return;
    }
    const activeEpisode = episodes.find(ep => String(ep.number) === String(episodeId));
    const newActiveEpisodeNum = activeEpisode ? activeEpisode.number : null;
    if (activeEpisodeNum !== newActiveEpisodeNum) {
      setActiveEpisodeNum(newActiveEpisodeNum);
    }
  }, [episodeId, episodes]);
  useEffect(() => {
    if (!episodeId) return;
    setActiveServerId(null);
    setServers(null);
    setStreamInfo(null);
    setError(null);
    setBuffering(true);
    isStreamFetchInProgress.current = false;
  }, [episodeId]);
  useEffect(() => {
    if (!episodeId || !episodes) return;
    setError(null);
    setServers(null);
    setStreamInfo(null);
    setBuffering(true);
    setActiveServerId(null);
    isStreamFetchInProgress.current = false;
    const episode = episodes.find(ep => String(ep.number) === String(episodeId));
    if (!episode) {
      setBuffering(false);
      setServerLoading(false);
      setError("Episode data is missing. Please try reloading the page.");
      notify("error", "Episode data is missing. Please try reloading the page.");
      return;
    }
    const serversList = getServers(episode.has_sub, episode.has_dub);
    if (!serversList || serversList.length === 0) {
      setBuffering(false);
      setServerLoading(false);
      setError("No servers available for this episode.");
      notify("warning", "No servers available for this episode.");
      return;
    }
    const savedServerName = localStorage.getItem("server_name");
    const savedServerType = localStorage.getItem("server_type");
    const initialServer = serversList.find(s => s.serverName === savedServerName && s.type === savedServerType) || serversList.find(s => s.serverName === savedServerName) || serversList.find(s => s.type === savedServerType) || serversList[0];
    setServers(serversList);
    setActiveServerId(initialServer?.data_id);
    setServerLoading(false);
  }, [episodeId, episodes, retryCount]);
  useEffect(() => {
    if (!episodeId || !activeServerId || !servers || !episodes || !animeId || isStreamFetchInProgress.current) return;
    const fetchStreamInfo = async () => {
      isStreamFetchInProgress.current = true;
      setBuffering(true);
      try {
        const server = servers.find(srv => srv.data_id === activeServerId);
        if (!server) {
          setError("No server found with the activeServerId.");
          notify("error", "Server not found. Please try another server.");
          return;
        }
        const data = await getStreamInfo(animeId, server.serverName, server.type.toLowerCase(), episodeId, server.quality, animeInfo?.mal_id, server.data_id, animeInfo?.ani_id, animeInfo?.title);
        setStreamInfo(data);
      } catch (err) {
        setError(err.message || "An error occurred.");
        notify("error", err.message || "Failed to load stream");
      } finally {
        setBuffering(false);
        isStreamFetchInProgress.current = false;
      }
    };
    fetchStreamInfo();
  }, [episodeId, activeServerId, servers, episodes, animeId, animeInfo]);
  return {
    error,
    buffering,
    serverLoading,
    streamInfo,
    animeInfo,
    episodes,
    nextEpisodeSchedule,
    animeInfoLoading,
    totalEpisodes,
    seasons,
    servers,
    isFullOverview,
    setIsFullOverview,
    episodeId,
    setEpisodeId,
    activeEpisodeNum,
    setActiveEpisodeNum,
    activeServerId,
    setActiveServerId,
    retry: () => {
      isStreamFetchInProgress.current = false;
      setRetryCount(c => c + 1);
    }
  };
};
