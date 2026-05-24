import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
};

app.use("/*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

function buildUrl(base, strippedPath, rawUrl) {
  const { search } = new URL(rawUrl);
  return `${base}${strippedPath}${search}`;
}

app.all("/anikoto/*", async (c) => {
  const strippedPath = c.req.path.replace(/^\/anikoto/, "") || "/";
  const url = buildUrl("https://anikotoapi.site", strippedPath, c.req.url);
  const rawBody = (c.req.method !== "GET" && c.req.method !== "HEAD")
    ? await c.req.raw.arrayBuffer()
    : undefined;

  try {
    const res = await fetch(url, {
      method: c.req.method,
      headers: {
        ...HEADERS,
        Origin: "https://megaplay.buzz",
        Referer: "https://megaplay.buzz/",
        Accept: "application/json, */*",
      },
      body: rawBody,
    });

    const ct = res.headers.get("Content-Type");
    return new Response(await res.arrayBuffer(), {
      status: res.status,
      headers: {
        ...(ct && { "Content-Type": ct }),
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    return c.json({ error: "Proxy failed", detail: err.message }, 502);
  }
});

app.get("/proxy/anilist/*", async (c) => {
  const strippedPath = c.req.path.replace(/^\/proxy\/anilist/, "") || "/";
  const url = `https://s4.anilist.co${strippedPath}`;

  try {
    const res = await fetch(url, { headers: { "User-Agent": HEADERS["User-Agent"] } });
    const ct = res.headers.get("Content-Type");
    return new Response(await res.arrayBuffer(), {
      status: res.status,
      headers: {
        ...(ct && { "Content-Type": ct }),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    return c.json({ error: "Proxy failed", detail: err.message }, 502);
  }
});

app.get("/", (c) => c.json({ status: "ok", proxy: "anizen worker" }));
app.all("*", (c) => c.json({ error: "Not found" }, 404));

export default app;
