const pageTemplate = "__PAGE_TEMPLATE__";
const accessToken = "__ACCESS_COUNT__";

async function incrementAccess(env) {
  if (!env?.DB) return null;

  try {
    await env.DB.prepare(
      "INSERT INTO portfolio_counters(id,access_count) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET access_count=access_count+1"
    ).run();
    const row = await env.DB.prepare(
      "SELECT access_count FROM portfolio_counters WHERE id = 1"
    ).first();
    const value = Number(row?.access_count);
    return Number.isFinite(value) ? value : null;
  } catch (error) {
    console.error("ACCESS counter unavailable", error);
    return null;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/googlea0bbe41035910ac1.html") {
      return new Response(request.method === "HEAD" ? null : "google-site-verification: googlea0bbe41035910ac1.html", {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" },
      });
    }
    if (url.pathname !== "/" && url.pathname !== "/index.html") {
      return new Response("Not found", { status: 404 });
    }

    const count = await incrementAccess(env);
    const displayCount = count == null ? "–" : count.toLocaleString("en-US");
    const body = pageTemplate.replaceAll(accessToken, displayCount);

    return new Response(body, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store, no-cache, must-revalidate",
        pragma: "no-cache",
        expires: "0",
      },
    });
  },
};
