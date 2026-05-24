export default function getServers(has_sub = true, has_dub = false) {
  const servers = [];
  if (has_sub) {
    servers.push({
      serverName: "MegaUp",
      data_id: "mk-hardsub",
      type: "sub"
    });
    servers.push({
      serverName: "MegaUp SoftSub",
      data_id: "mk-softsub",
      type: "sub"
    });
  }
  if (has_dub) {
    servers.push({
      serverName: "MegaUp",
      data_id: "mk-dub",
      type: "dub"
    });
  }
  return servers;
}
