import { MegaUp } from "./megaup.js";
const PROXY_BASE = import.meta.env.VITE_ANIMEKAI_PROXY || "/anikai";
async function proxyFetchText(path) {
  const res = await fetch(`${PROXY_BASE}${path}`);
  if (!res.ok) throw new Error(`anikai fetch error ${res.status}: ${path}`);
  return res.text();
}
async function proxyFetchJson(path) {
  const res = await fetch(`${PROXY_BASE}${path}`);
  if (!res.ok) throw new Error(`anikai fetch error ${res.status}: ${path}`);
  const text = await res.text();
  if (text.trimStart().startsWith("<")) {
    console.warn(`[animekai] got HTML instead of JSON — stale session? (${path})`);
    return {
      result: ""
    };
  }
  return JSON.parse(text);
}
function parseHTML(html) {
  return new DOMParser().parseFromString(html, "text/html");
}
function qsa(doc, sel) {
  return Array.from(doc.querySelectorAll(sel));
}
function qs(doc, sel) {
  return doc?.querySelector(sel) ?? null;
}
function attr(el, name) {
  return el?.getAttribute(name) ?? null;
}
function text(el) {
  return el?.textContent?.trim() ?? "";
}
async function scrapeCardPage(path) {
  try {
    const html = await proxyFetchText(path);
    const doc = parseHTML(html);
    const pagination = qs(doc, "ul.pagination");
    const activePage = qs(pagination, ".page-item.active span.page-link");
    const currentPage = parseInt(text(activePage)) || 0;
    const nextHref = attr(qs(pagination, ".page-item.active + .page-item a.page-link"), "href");
    const hasNextPage = !!nextHref?.split("page=")[1];
    const lastHref = attr(qs(pagination, ".page-item:last-child a.page-link"), "href");
    const totalPages = parseInt(lastHref?.split("page=")[1]) || currentPage;
    const results = qsa(doc, ".aitem").map(card => {
      const atag = qs(card, "div.inner > a");
      const infoEl = qs(card, ".info");
      const infoChildren = infoEl ? Array.from(infoEl.children) : [];
      const id = attr(atag, "href")?.replace("/watch/", "") ?? "";
      const type = infoChildren[infoChildren.length - 1]?.textContent?.trim() ?? "";
      return {
        id,
        title: text(qs(card, "a.title")) || text(atag),
        url: `https://anikai.to${attr(atag, "href")}`,
        image: attr(qs(card, "img"), "data-src") || attr(qs(card, "img"), "src"),
        japaneseTitle: attr(qs(card, "a.title"), "data-jp")?.trim(),
        type,
        sub: parseInt(text(qs(card, ".info span.sub"))) || 0,
        dub: parseInt(text(qs(card, ".info span.dub"))) || 0,
        episodes: parseInt(infoChildren[infoChildren.length - 2]?.textContent?.trim()) || parseInt(text(qs(card, ".info span.sub"))) || 0
      };
    });
    return {
      currentPage: results.length === 0 ? 0 : currentPage,
      hasNextPage: results.length === 0 ? false : hasNextPage,
      totalPages: results.length === 0 ? 0 : totalPages,
      results
    };
  } catch (err) {
    console.error(`AnimeKai scrapeCardPage error (${path}):`, err);
    return {
      currentPage: 0,
      hasNextPage: false,
      totalPages: 0,
      results: []
    };
  }
}
const animekaiClient = {
  search: (query, page = 1) => scrapeCardPage(`/browser?keyword=${encodeURIComponent(query.replace(/[\W_]+/g, "+"))}&page=${Math.max(1, page)}`),
  trending: (page = 1) => scrapeCardPage(`/trending?page=${Math.max(1, page)}`),
  recentEpisodes: (page = 1) => scrapeCardPage(`/updates?page=${Math.max(1, page)}`),
  recentAdded: (page = 1) => scrapeCardPage(`/recent?page=${Math.max(1, page)}`),
  completed: (page = 1) => scrapeCardPage(`/completed?page=${Math.max(1, page)}`),
  newReleases: (page = 1) => scrapeCardPage(`/new-releases?page=${Math.max(1, page)}`),
  movies: (page = 1) => scrapeCardPage(`/movie?page=${Math.max(1, page)}`),
  tv: (page = 1) => scrapeCardPage(`/tv?page=${Math.max(1, page)}`),
  ova: (page = 1) => scrapeCardPage(`/ova?page=${Math.max(1, page)}`),
  ona: (page = 1) => scrapeCardPage(`/ona?page=${Math.max(1, page)}`),
  specials: (page = 1) => scrapeCardPage(`/special?page=${Math.max(1, page)}`),
  genreSearch: (genre, page = 1) => scrapeCardPage(`/genres/${genre}?page=${Math.max(1, page)}`),
  random: async () => {
    try {
      const page = Math.floor(Math.random() * 10) + 1;
      const data = await scrapeCardPage(`/updates?page=${page}`);
      const results = data?.results ?? [];
      if (!results.length) {
        const fallback = await scrapeCardPage("/updates?page=1");
        const items = fallback?.results ?? [];
        if (!items.length) return null;
        return items[Math.floor(Math.random() * items.length)].id;
      }
      return results[Math.floor(Math.random() * results.length)].id;
    } catch (err) {
      console.error("AnimeKai random error:", err);
      return null;
    }
  },
  latestUpdates: async (tabId = "all-updates", page = 1) => {
    try {
      const safeTab = ["all-updates", "sub-updates", "dub-updates", "china-updates"].includes(tabId) ? tabId : "all-updates";
      const data = await proxyFetchJson(`/ajax/home/items?name=${safeTab}&page=${Math.max(1, page)}`);
      const html = typeof data.result?.html === "string" ? data.result.html : typeof data.result === "string" ? data.result : "";
      if (!html) return {
        currentPage: page,
        hasNextPage: false,
        totalPages: page,
        results: []
      };
      const doc = parseHTML(html);
      const PAGE_SIZE = 12;
      const results = qsa(doc, ".aitem").map(card => {
        const atag = qs(card, "div.inner > a");
        const infoEl = qs(card, ".info");
        const infoChildren = infoEl ? Array.from(infoEl.children) : [];
        const id = (attr(atag, "href")?.replace("/watch/", "") ?? "").split("#")[0];
        return {
          id,
          title: text(qs(card, "a.title")) || text(atag),
          url: `https://anikai.to/watch/${id}`,
          image: attr(qs(card, "img"), "data-src") || attr(qs(card, "img"), "src"),
          japaneseTitle: attr(qs(card, "a.title"), "data-jp")?.trim(),
          type: infoChildren[infoChildren.length - 1]?.textContent?.trim() ?? "",
          sub: parseInt(text(qs(card, ".info span.sub"))) || 0,
          dub: parseInt(text(qs(card, ".info span.dub"))) || 0,
          episodes: parseInt(infoChildren[infoChildren.length - 2]?.textContent?.trim()) || parseInt(text(qs(card, ".info span.sub"))) || 0
        };
      });
      const hasNextPage = results.length >= PAGE_SIZE;
      const totalPages = hasNextPage ? page + 1 : page;
      return {
        currentPage: results.length === 0 ? 0 : page,
        hasNextPage: results.length === 0 ? false : hasNextPage,
        totalPages: results.length === 0 ? 0 : totalPages,
        results
      };
    } catch (err) {
      console.error(`AnimeKai latestUpdates error (${tabId}):`, err);
      return {
        currentPage: 0,
        hasNextPage: false,
        totalPages: 0,
        results: []
      };
    }
  },
  genres: async () => {
    try {
      const html = await proxyFetchText("/home");
      const doc = parseHTML(html);
      return qsa(doc, "#menu ul.c4 li a").map(a => text(a).toLowerCase());
    } catch (err) {
      console.error("AnimeKai genres error:", err);
      return [];
    }
  },
  topSearch: async () => {
    try {
      const html = await proxyFetchText("/home");
      const doc = parseHTML(html);
      const selectors = [".searches a", ".top-search a", ".search-bx .searches a", ".search-form ~ div a", ".top-search-items a", ".search-suggestions a", "form ~ div a[href*='/watch/']"];
      for (const sel of selectors) {
        const links = qsa(doc, sel);
        if (links.length > 0) {
          return links.map(a => ({
            id: attr(a, "href")?.replace("/watch/", "") ?? "",
            title: text(a),
            link: `/watch/${attr(a, "href")?.replace("/watch/", "")}`
          })).filter(item => item.id && item.title);
        }
      }
      console.warn("AnimeKai topSearch: no selector matched, falling back to spotlight");
      return [];
    } catch (err) {
      console.error("AnimeKai topSearch error:", err);
      return [];
    }
  },
  schedule: async (date = new Date().toISOString().split("T")[0]) => {
    try {
      const tz = 5.5;
      const timestamp = Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000);
      const data = await proxyFetchJson(`/ajax/schedule/items?tz=${tz}&time=${timestamp}`);
      let html = data.result;
      if (typeof html === "object" && html.html) html = html.html;
      if (typeof html !== "string") return [];
      const doc = parseHTML(html);
      return qsa(doc, "ul li").map(li => {
        const titleEl = qs(li, "span.title");
        const spans = Array.from(li.querySelectorAll("span"));
        const timeEl = qs(li, "span.time");
        const dataTime = attr(timeEl, "data-time") ?? attr(qs(li, "[data-time]"), "data-time");
        return {
          id: attr(qs(li, "a"), "href")?.split("/")[2]?.split("?")[0],
          title: text(titleEl),
          japaneseTitle: attr(titleEl, "data-jp"),
          airingTimestamp: dataTime ? parseInt(dataTime, 10) : null,
          airingTime: text(timeEl),
          airingEpisode: text(spans[spans.length - 1]).replace("EP ", "")
        };
      });
    } catch (err) {
      console.error("AnimeKai schedule error:", err);
      return [];
    }
  },
  spotlight: async () => {
    try {
      const html = await proxyFetchText("/home");
      const doc = parseHTML(html);
      return qsa(doc, "div.swiper-wrapper > div.swiper-slide").map(slide => {
        const titleEl = qs(slide, "div.detail > p.title");
        const id = attr(qs(slide, "div.swiper-ctrl > a.btn"), "href")?.replace("/watch/", "");
        const style = attr(slide, "style") || "";
        const banner = style.match(/background-image:\s*url\(["']?(.+?)["']?\)/)?.[1] || null;
        const infoChildren = Array.from(qs(slide, "div.detail > .info")?.children ?? []);
        return {
          id,
          title: text(titleEl),
          japaneseTitle: attr(titleEl, "data-jp"),
          banner,
          url: `https://anikai.to/watch/${id}`,
          type: infoChildren[infoChildren.length - 2]?.textContent?.trim() ?? "",
          genres: (infoChildren[infoChildren.length - 1]?.textContent?.trim() ?? "").split(",").map(g => g.trim()),
          releaseDate: (() => {
            const divs = Array.from(qs(slide, "div.detail > div.mics")?.querySelectorAll("div") ?? []);
            const d = divs.find(el => el.textContent?.includes("Release"));
            return text(d?.querySelector("span") ?? null);
          })(),
          quality: (() => {
            const divs = Array.from(qs(slide, "div.detail > div.mics")?.querySelectorAll("div") ?? []);
            const d = divs.find(el => el.textContent?.includes("Quality"));
            return text(d?.querySelector("span") ?? null);
          })(),
          sub: parseInt(text(qs(slide, "div.detail > div.info > span.sub"))) || 0,
          dub: parseInt(text(qs(slide, "div.detail > div.info > span.dub"))) || 0,
          description: text(qs(slide, "div.detail > p.desc"))
        };
      });
    } catch (err) {
      console.error("AnimeKai spotlight error:", err);
      return [];
    }
  },
  suggestions: async query => {
    try {
      const data = await proxyFetchJson(`/ajax/anime/search?keyword=${encodeURIComponent(query.replace(/[\W_]+/g, "+"))}`);
      const htmlContent = typeof data.result?.html === "string" ? data.result.html : typeof data.result === "string" ? data.result : "";
      const doc = parseHTML(htmlContent);
      return qsa(doc, "a.aitem").map(card => {
        const titleEl = qs(card, ".title");
        const infoChildren = Array.from(qs(card, ".info")?.children ?? []);
        const id = attr(card, "href")?.split("/")[2];
        return {
          id,
          title: text(titleEl),
          url: `https://anikai.to/watch/${id}`,
          japaneseTitle: attr(titleEl, "data-jp") || null,
          image: attr(qs(card, ".poster img"), "src"),
          type: infoChildren[infoChildren.length - 3]?.textContent?.trim() ?? "",
          year: infoChildren[infoChildren.length - 2]?.textContent?.trim() ?? "",
          sub: parseInt(text(qs(card, ".info span.sub"))) || 0,
          dub: parseInt(text(qs(card, ".info span.dub"))) || 0,
          episodes: parseInt(infoChildren[infoChildren.length - 4]?.textContent?.trim()) || 0
        };
      });
    } catch (err) {
      console.error("AnimeKai suggestions error:", err);
      return [];
    }
  },
  info: async id => {
    try {
      const animeSlug = id.split("$")[0];
      const html = await proxyFetchText(`/watch/${animeSlug}`);
      const doc = parseHTML(html);
      const entityScroll = qs(doc, ".entity-scroll");
      const infoBox = qs(entityScroll, ".info");
      const announcementTimeEl = qs(doc, "#announcement .local-time[data-time]") ?? qs(doc, "#announcement [data-time]") ?? qs(doc, ".count-down[data-to]");
      const rawTime = attr(announcementTimeEl, "data-time") ?? attr(announcementTimeEl, "data-to");
      const nextEpisodeTimestamp = rawTime ? parseInt(rawTime, 10) : null;
      const info = {
        id: animeSlug,
        title: text(qs(entityScroll, ".title")),
        japaneseTitle: attr(qs(entityScroll, ".title"), "data-jp")?.trim(),
        image: attr(qs(doc, "div.poster > div > img"), "src"),
        description: text(qs(entityScroll, ".desc")),
        type: (infoBox?.lastElementChild?.textContent?.trim() ?? "").toUpperCase(),
        url: `https://anikai.to/watch/${animeSlug}`,
        hasSub: !!qs(entityScroll, ".info > span.sub"),
        hasDub: !!qs(entityScroll, ".info > span.dub"),
        genres: [],
        status: null,
        season: null,
        duration: null,
        malId: null,
        anilistId: null,
        nextEpisodeTimestamp,
        recommendations: [],
        relations: [],
        episodes: [],
        totalEpisodes: 0
      };
      info.subOrDub = info.hasSub && info.hasDub ? "both" : info.hasDub ? "dub" : "sub";
      qsa(doc, ".entity-scroll > .detail div").forEach(div => {
        const t = div.textContent?.trim() ?? "";
        if (t.startsWith("Genres:")) info.genres = t.replace("Genres:", "").split(",").map(g => g.trim());
        const spanText = text(qs(div, "span"));
        if (t.includes("Status")) info.status = spanText;
        if (t.includes("Premiered")) info.season = spanText;
        if (t.includes("Duration")) info.duration = spanText;
        qsa(div, "a").forEach(a => {
          const href = attr(a, "href") ?? "";
          if (href.includes("myanimelist")) info.malId = href.match(/anime\/(\d+)/)?.[1] ?? null;
          if (href.includes("anilist")) info.anilistId = href.match(/anime\/(\d+)/)?.[1] ?? null;
        });
      });
      info.recommendations = qsa(doc, "section.sidebar-section:not(#related-anime) .aitem-col .aitem").map(a => {
        const recId = attr(a, "href")?.replace("/watch/", "");
        const infoChildren = Array.from(qs(a, ".info")?.children ?? []);
        return {
          id: recId,
          title: text(qs(a, ".title")),
          url: `https://anikai.to${attr(a, "href")}`,
          image: attr(a, "style")?.match(/background-image:\s*url\('(.+?)'\)/)?.[1] ?? attr(qs(a, "img"), "src"),
          japaneseTitle: attr(qs(a, ".title"), "data-jp")?.trim(),
          type: infoChildren[infoChildren.length - 1]?.textContent?.trim() ?? "",
          sub: parseInt(text(qs(a, ".info span.sub"))) || 0,
          dub: parseInt(text(qs(a, ".info span.dub"))) || 0,
          episodes: parseInt(infoChildren[infoChildren.length - 2]?.textContent?.trim()) || 0
        };
      });
      info.relations = qsa(doc, "section#related-anime .aitem-col a.aitem").map(a => {
        const relId = attr(a, "href")?.replace("/watch/", "") ?? "";
        const bolds = qsa(a, ".info span > b");
        let episodes = 0,
          type = "",
          relationType = "";
        bolds.forEach(b => {
          const t = text(b);
          if (b.classList.contains("text-muted")) relationType = t;else if (/^\d+$/.test(t)) episodes = parseInt(t);else type = t;
        });
        return {
          id: relId,
          title: text(qs(a, ".title")),
          url: `https://anikai.to${attr(a, "href")}`,
          image: attr(a, "style")?.match(/background-image:\s*url\('(.+?)'\)/)?.[1],
          japaneseTitle: attr(qs(a, ".title"), "data-jp")?.trim(),
          type: type.toUpperCase(),
          sub: parseInt(text(qs(a, ".info .sub"))) || 0,
          dub: parseInt(text(qs(a, ".info .dub"))) || 0,
          relationType,
          episodes
        };
      });
      const aniId = attr(qs(doc, ".rate-box#anime-rating"), "data-id");
      if (!aniId) return info;
      const epToken = await MegaUp.generateToken(aniId);
      const epData = await proxyFetchJson(`/ajax/episodes/list?ani_id=${aniId}&_=${epToken}`);
      const epHtml = epData.result;
      if (typeof epHtml === "string") {
        const epDoc = parseHTML(epHtml);
        const subCount = parseInt(text(qs(entityScroll, ".info > span.sub"))) || 0;
        const dubCount = parseInt(text(qs(entityScroll, ".info > span.dub"))) || 0;
        info.episodes = qsa(epDoc, "div.eplist > ul > li > a").map(el => {
          const num = attr(el, "num");
          const token = attr(el, "token");
          const number = parseInt(num);
          return {
            id: `${animeSlug}$ep=${num}$token=${token}`,
            number,
            title: text(qs(el, "span")) || `Episode ${number}`,
            isFiller: el.classList.contains("filler"),
            isSubbed: number <= subCount,
            isDubbed: number <= dubCount,
            url: `https://anikai.to/watch/${animeSlug}?ep=${num}`
          };
        });
        info.totalEpisodes = info.episodes.length;
      }
      return info;
    } catch (err) {
      console.error("AnimeKai info error:", err);
      return null;
    }
  },
  servers: async (episodeId, type = "hardsub") => {
    try {
      const token = episodeId.split("$token=")[1];
      if (!token) return [];
      const ajaxToken = await MegaUp.generateToken(token);
      const data = await proxyFetchJson(`/ajax/links/list?token=${token}&_=${ajaxToken}`);
      if (typeof data.result !== "string") return [];
      const doc = parseHTML(data.result);
      const targetGroups = type === "dub" ? [{
        id: "dub",
        type: "dub"
      }] : [{
        id: "sub",
        type: "hardsub"
      }, {
        id: "softsub",
        type: "softsub"
      }];
      const servers = [];
      for (const group of targetGroups) {
        const items = qsa(doc, `.server-items.lang-group[data-id="${group.id}"] .server`);
        for (const item of items) {
          const lid = attr(item, "data-lid");
          if (!lid) continue;
          const viewToken = await MegaUp.generateToken(lid);
          const viewData = await proxyFetchJson(`/ajax/links/view?id=${lid}&_=${viewToken}`);
          const decoded = await MegaUp.decodeIframeData(viewData.result);
          const suffix = group.type === "hardsub" ? " (HardSub)" : group.type === "softsub" ? " (SoftSub)" : "";
          servers.push({
            name: `megaup ${text(item)}${suffix}`.toLowerCase(),
            url: decoded.url,
            type: group.type,
            intro: {
              start: decoded.skip.intro[0],
              end: decoded.skip.intro[1]
            },
            outro: {
              start: decoded.skip.outro[0],
              end: decoded.skip.outro[1]
            }
          });
        }
      }
      return servers;
    } catch (err) {
      console.error("AnimeKai servers error:", err);
      return [];
    }
  },
  watch: async (episodeId, type = "hardsub") => {
    try {
      const token = episodeId.split("$token=")[1];
      if (!token) return {
        isDub: false,
        results: []
      };
      const ajaxToken = await MegaUp.generateToken(token);
      const data = await proxyFetchJson(`/ajax/links/list?token=${token}&_=${ajaxToken}`);
      if (typeof data.result !== "string") return {
        isDub: false,
        results: []
      };
      const doc = parseHTML(data.result);
      const isDub = type === "dub";
      const targetGroups = isDub ? [{
        id: "dub",
        label: "dub",
        subType: null
      }] : [{
        id: "sub",
        label: "hardsub",
        subType: "hard"
      }, {
        id: "softsub",
        label: "softsub",
        subType: "soft"
      }];
      const results = [];
      const seen = new Set();
      let globalIntro = null,
        globalOutro = null;
      for (const group of targetGroups) {
        const items = qsa(doc, `.server-items.lang-group[data-id="${group.id}"] .server`);
        for (const item of items) {
          const lid = attr(item, "data-lid");
          if (!lid || seen.has(lid)) continue;
          seen.add(lid);
          const viewToken = await MegaUp.generateToken(lid);
          const viewData = await proxyFetchJson(`/ajax/links/view?id=${lid}&_=${viewToken}`);
          const decoded = await MegaUp.decodeIframeData(viewData.result);
          const videoSources = await MegaUp.extract(decoded.url);
          if (!globalIntro && !globalOutro) {
            globalIntro = decoded.skip.intro;
            globalOutro = decoded.skip.outro;
          }
          const suffix = group.label === "hardsub" ? " (HardSub)" : group.label === "softsub" ? " (SoftSub)" : " (Dub)";
          results.push({
            name: `MegaUp ${text(item)}${suffix}`,
            iframe: decoded.url,
            sources: videoSources.sources,
            subtitles: (videoSources.subtitles || []).map(s => ({
              ...s,
              type: group.subType || "none"
            })),
            download: videoSources.download
          });
        }
      }
      return {
        isDub,
        results,
        ...(globalIntro ? {
          intro: globalIntro
        } : {}),
        ...(globalOutro ? {
          outro: globalOutro
        } : {})
      };
    } catch (err) {
      console.error("AnimeKai watch error:", err);
      return {
        isDub: false,
        results: []
      };
    }
  }
};
export default animekaiClient;
