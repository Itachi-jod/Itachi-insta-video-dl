const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Function to extract direct video URL from Instatik HTML
function extractVideoUrl(html) {
  // Match all dl.php?url=ENCODED_URL
  const matches = [...html.matchAll(/<a[^>]+href="dl\.php\?url=([^"]+)"/g)];
  if (!matches || matches.length === 0) return null;

  // Take the last one (for Stories/Reels with multiple videos)
  const encodedUrl = matches[matches.length - 1][1];
  return decodeURIComponent(encodedUrl); // decode to get full direct URL
}

// POST endpoint for Instagram download
app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ status: false, message: "URL is required" });

  try {
    const response = await axios.post(
      "https://instatik.app/core/ajax.php",
      new URLSearchParams({ url, host: "instagram" }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const html = response.data;
    const videoUrl = extractVideoUrl(html);

    if (!videoUrl) return res.status(404).json({ status: false, message: "Video not found" });

    res.json({ status: true, url: videoUrl });

  } catch (err) {
    console.error("Axios error:", err.message);
    res.status(500).json({ status: false, message: "Failed to fetch video" });
  }
});

// GET endpoint for browser testing
app.get("/download", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: false, message: "URL is required" });

  try {
    const response = await axios.post(
      "https://instatik.app/core/ajax.php",
      new URLSearchParams({ url, host: "instagram" }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const html = response.data;
    const videoUrl = extractVideoUrl(html);

    if (!videoUrl) return res.status(404).json({ status: false, message: "Video not found" });

    res.json({ status: true, url: videoUrl });

  } catch (err) {
    console.error("Axios error:", err.message);
    res.status(500).json({ status: false, message: "Failed to fetch video" });
  }
});

// Health check
app.get("/", (req, res) => res.send("Instagram Video API is running"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
~/insta-api $
