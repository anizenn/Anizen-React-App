const API_BASE = "https://enc-dec.app/api";
export const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " + "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
export class MegaUp {
  static async generateToken(n) {
    const res = await fetch(`${API_BASE}/enc-kai?text=${encodeURIComponent(n)}`);
    const data = await res.json();
    return data.result;
  }
  static async decodeIframeData(n) {
    const res = await fetch(`${API_BASE}/dec-kai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: n
      })
    });
    const data = await res.json();
    return data.result;
  }
  static async decode(n) {
    const res = await fetch(`${API_BASE}/dec-mega`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: n,
        agent: USER_AGENT
      })
    });
    const data = await res.json();
    return data.result;
  }
  static async extract(videoUrl) {
    const url = videoUrl.replace("/e/", "/media/");
    const res = await fetch(url, {
      headers: {
        Connection: "keep-alive",
        "User-Agent": USER_AGENT
      }
    });
    const data = await res.json();
    const decrypted = await this.decode(data.result);
    return {
      sources: decrypted.sources.map(s => ({
        url: s.file,
        isM3U8: s.file.includes(".m3u8")
      })),
      subtitles: (decrypted.tracks || []).map(t => ({
        kind: t.kind,
        url: t.file,
        lang: t.label
      })),
      download: decrypted.download
    };
  }
}
