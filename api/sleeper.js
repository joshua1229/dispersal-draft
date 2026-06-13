export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  let { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: "Missing path param" });
  }

  // Normalize — could be string or array (Vercel catch-all)
  if (Array.isArray(path)) path = path.join("/");

  // Strip leading slash just in case
  path = path.replace(/^\/+/, "");

  const sleeperUrl = `https://api.sleeper.app/v1/${path}`;

  try {
    const upstream = await fetch(sleeperUrl, {
      headers: { "User-Agent": "dispersal-draft-app" },
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `Sleeper returned ${upstream.status}`,
        sleeperUrl,
        body: text.slice(0, 200),
      });
    }

    const data = JSON.parse(text);

    if (sleeperUrl.includes("/players/nfl")) {
      res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    } else {
      res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate");
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message, sleeperUrl });
  }
}
