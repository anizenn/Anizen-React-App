import { faClosedCaptioning, faFile, faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BouncingLoader from "../ui/bouncingloader/Bouncingloader";
import "./Servers.css";
import { useEffect } from "react";
function Servers({
  servers,
  activeEpisodeNum,
  activeServerId,
  setActiveServerId,
  serverLoading
}) {
  const subServers = servers?.filter(server => server.type === "sub") || [];
  const dubServers = servers?.filter(server => server.type === "dub") || [];
  const rawServers = servers?.filter(server => server.type === "raw") || [];
  useEffect(() => {
    const savedServerName = localStorage.getItem("server_name");
    const savedServerType = localStorage.getItem("server_type");
    if (savedServerName) {
      const matchingServer = servers?.find(server => server.serverName === savedServerName && server.type === savedServerType) || servers?.find(server => server.serverName === savedServerName);
      if (matchingServer) {
        setActiveServerId(matchingServer.data_id);
      } else if (servers && servers.length > 0) {
        setActiveServerId(servers[0].data_id);
      }
    } else if (servers && servers.length > 0) {
      setActiveServerId(servers[0].data_id);
    }
  }, [servers]);
  const handleServerSelect = server => {
    setActiveServerId(server.data_id);
    localStorage.setItem("server_name", server.serverName);
    localStorage.setItem("server_type", server.type);
  };
  return <div className="relative bg-[#11101A] p-4 w-full min-h-[100px] flex justify-center items-center max-[1200px]:bg-[#14151A]">
      {serverLoading ? <div className="w-full h-full rounded-lg flex justify-center items-center max-[600px]:rounded-none">
          <BouncingLoader />
        </div> : servers ? <div className="w-full h-full rounded-lg grid grid-cols-[minmax(0,28%),minmax(0,72%)] overflow-hidden max-[800px]:grid-cols-[minmax(0,38%),minmax(0,62%)] max-[600px]:flex max-[600px]:flex-col max-[600px]:rounded-none">
          <div className="h-full bg-[#cae962] px-4 text-black flex flex-col justify-center items-center gap-y-1.5 max-[600px]:flex-row max-[600px]:bg-[#1e1f27] max-[600px]:gap-x-3 max-[600px]:py-2.5 max-[600px]:px-4 max-[600px]:justify-start">
            <p className="text-center leading-5 font-medium text-[13px] max-[600px]:text-left max-[600px]:text-white max-[600px]:text-[12px]">
              <span className="max-[600px]:hidden">You are watching<br /></span>
              <span className="font-bold max-[600px]:text-[#cae962] max-[600px]:text-[13px]">
                Ep. {activeEpisodeNum}
              </span>
            </p>
            <p className="leading-5 text-[13px] font-medium text-center max-[600px]:hidden">
              If server doesn&apos;t work, try others beside.
            </p>
          </div>
          <div className="bg-[#2a2c31] flex flex-col max-[600px]:h-full max-[600px]:overflow-y-auto">
            {rawServers.length > 0 && <div className={`servers px-2 flex items-center flex-wrap ml-2 max-[600px]:py-2 ${dubServers.length === 0 || subServers.length === 0 ? "h-1/2" : "h-full"}`}>
                <div className="flex items-center gap-x-2">
                  <FontAwesomeIcon icon={faFile} className="text-[#cae962] text-[13px]" />
                  <p className="font-bold text-[14px]">RAW:</p>
                </div>
                <div className="flex gap-x-[7px] ml-8 flex-wrap">
                  {rawServers.map((item, index) => <div key={index} className={`px-6 py-[5px] rounded-lg cursor-pointer ${activeServerId === item?.data_id ? "bg-[#cae962] text-black" : "bg-[#33353c] text-white"} max-[700px]:px-3`} onClick={() => handleServerSelect(item)}>
                      <p className="text-[13px] font-semibold">
                        {item.serverName}
                      </p>
                    </div>)}
                </div>
              </div>}
            {subServers.length > 0 && <div className={`servers px-2 flex items-center flex-wrap ml-2 max-[600px]:py-2 ${dubServers.length === 0 ? "h-1/2" : "h-full"}`}>
                <div className="flex items-center gap-x-2">
                  <FontAwesomeIcon icon={faClosedCaptioning} className="text-[#cae962] text-[13px]" />
                  <p className="font-bold text-[14px]">SUB:</p>
                </div>
                <div className="flex gap-x-[7px] ml-8 flex-wrap">
                  {subServers.map((item, index) => <div key={index} className={`px-6 py-[5px] rounded-lg cursor-pointer ${activeServerId === item?.data_id ? "bg-[#cae962] text-black" : "bg-[#33353c] text-white"} max-[700px]:px-3`} onClick={() => handleServerSelect(item)}>
                      <p className="text-[13px] font-semibold">
                        {item.serverName}
                      </p>
                    </div>)}
                </div>
              </div>}
            {dubServers.length > 0 && <div className={`servers px-2 flex items-center flex-wrap ml-2 max-[600px]:py-2 ${subServers.length === 0 ? "h-1/2 " : "h-full"}`}>
                <div className="flex items-center gap-x-3">
                  <FontAwesomeIcon icon={faMicrophone} className="text-[#cae962] text-[13px]" />
                  <p className="font-bold text-[14px]">DUB:</p>
                </div>
                <div className="flex gap-x-[7px] ml-8 flex-wrap">
                  {dubServers.map((item, index) => <div key={index} className={`px-6 py-[5px] rounded-lg cursor-pointer ${activeServerId === item?.data_id ? "bg-[#cae962] text-black" : "bg-[#33353c] text-white"} max-[700px]:px-3`} onClick={() => handleServerSelect(item)}>
                      <p className="text-[13px] font-semibold">
                        {item.serverName}
                      </p>
                    </div>)}
                </div>
              </div>}
          </div>
        </div> : <p className="text-center font-medium text-[15px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          Could not load servers <br />
          Either reload or try again after sometime
        </p>}
    </div>;
}
export default Servers;
