const express = require("express");
const fetch = require("node-fetch");

const app = express();

// ✅ MAIN PROXY
app.get("/proxy", async (req, res) => {
  const url = req.query.url;

  if (!url) return res.status(400).send("No URL provided");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "VLC/3.0.18",
        "Referer": "https://google.com",
        "Origin": "*"
      }
    });

    // Allow browser access
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    // Pipe stream directly (best performance)
    response.body.pipe(res);

  } catch (err) {
    console.log("Proxy error:", err.message);
    res.status(500).send("Stream error");
  }
});

// ✅ PLAYLIST REWRITE (VERY IMPORTANT 🔥)
app.get("/playlist", async (req, res) => {
  const url = req.query.url;

  if (!url) return res.send("No playlist URL");

  try {
    const data = await fetch(url).then(r => r.text());

    const proxied = data.replace(
      /(https?:\/\/[^\s]+)/g,
      (match) =>
        `${req.protocol}://${req.get("host")}/proxy?url=${encodeURIComponent(match)}`
    );

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(proxied);

  } catch (e) {
    res.send("Playlist error");
  }
});

// ✅ KEEP ALIVE ROUTE (for UptimeRobot)
app.get("/ping", (req, res) => {
  res.send("OK");
});

// ✅ ROOT
app.get("/", (req, res) => {
  res.send("IPTV Proxy Running ✅");
});

// ✅ SELF PING (extra protection)
setInterval(async () => {
  try {
    await fetch("https://your-app.onrender.com/ping");
    console.log("Self ping success");
  } catch (e) {
    console.log("Self ping failed");
  }
}, 300000); // every 5 minutes

// ✅ START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
