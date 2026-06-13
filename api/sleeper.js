export default async function handler(req, res) {
  // Allow all origins (this is your own app hitting Sleeper)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: "Missing path param" });
  }

  const sleeperUrl = `https://api.sleeper.app/v1/${Array.isArray(path) ? path.join("/") : path}`;

  try {
    const upstream = await fetch(sleeperUrl, {
      headers: { "User-Agent": "dispersal-draft-app" },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `Sleeper returned ${upstream.status}` });
    }

    const data = await upstream.json();
    // Cache aggressively for players endpoint (large payload, rarely changes)
    if (sleeperUrl.includes("/players/nfl")) {
      res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    } else {
      res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate");
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
