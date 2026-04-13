const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.get("/proxy", async (req, res) => {
  const url = req.query.url;

  if (!url) return res.send("No URL");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "VLC/3.0.18",
        "Referer": "https://google.com"
      }
    });

    res.set("Access-Control-Allow-Origin", "*");
    response.body.pipe(res);

  } catch (e) {
    res.send("Error loading stream");
  }
});

app.get("/", (req, res) => {
  res.send("IPTV Proxy Running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
