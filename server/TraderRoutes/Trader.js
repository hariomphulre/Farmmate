const { sql } = require("../NeonSetup.js");
const express = require("express");
const axios = require("axios");
const cacheService = require("../cacheService");
const router = express.Router();

router.post("/event-schedule", async (req, res) => {
  try {
    const { title, description, eventStartDate, eventEndDate, startTime, endTime, location } = req.body;
    console.log("POST /event-schedule body:", req.body);

    if (!title || !eventStartDate || !eventEndDate) {
      return res.status(400).json({ message: "Title, start date, and end date are required" });
    }

    const result = await sql`
      INSERT INTO events (title, description, event_start_date, event_end_date, start_time, end_time, location)
      VALUES (${title}, ${description}, ${eventStartDate}, ${eventEndDate}, ${startTime}, ${endTime}, ${location})
      RETURNING *;
    `;
    console.log("Event insert result:", result);

    // Invalidate events cache upon new schedule
    await cacheService.del("events:all");

    res.status(200).json({ message: "Event Scheduled Successfully", data: result });
  } catch (error) {
    console.error("Error scheduling events:", error);
    res.status(500).json({ message: "Error in scheduling events", error: error.message });
  }
});

// Fetch all events (cached for 5 minutes)
router.get("/get-events", async (req, res) => {
  try {
    const cacheKey = "events:all";
    const cachedEvents = await cacheService.get(cacheKey);
    if (cachedEvents) {
      return res.status(200).json({ message: "Events fetched successfully", data: cachedEvents, fromCache: true });
    }

    const result = await sql`SELECT * FROM events ORDER BY event_start_date ASC`;
    await cacheService.set(cacheKey, result, 300); // 5 mins TTL

    res.status(200).json({ message: "Events fetched successfully", data: result });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error in fetching events", error: error.message });
  }
});

router.get("/farmer/news", async (req, res) => {
  try {
    const apiKey = process.env.NEWSDATA_API_KEY || req.query.apiKey;
    if (!apiKey) {
      console.error("Missing NewsData.io API key");
      return res.status(400).json({ message: "Missing NewsData.io API key" });
    }

    const { page = 1, q } = req.query;
    const defaultQuery = "maharashtra agriculture OR maharashtra farmer OR महाराष्ट्र शेतकरी OR महाराष्ट्र कृषी";
    const queryTerm = q && q.trim() !== "" ? q : defaultQuery;

    const cacheKey = `news:trader:${page}:${encodeURIComponent(queryTerm)}`;
    const cachedNews = await cacheService.get(cacheKey);
    if (cachedNews) {
      return res.status(200).json({ ...cachedNews, fromCache: true });
    }

    const params = {
      apikey: apiKey,
      q: queryTerm,
      country: "IN",
      language: "hi,en,mr",
      page,
    };

    const url = "https://newsdata.io/api/1/news";
    const response = await axios.get(url, { params });

    const data = response.data || {};
    if (data.status && data.status !== "success") {
      const msg = data.message || data.reason || "NewsData API error";
      console.error("NewsData API error:", msg);
      return res.status(400).json({ message: msg });
    }

    const results = Array.isArray(data.results) ? data.results : [];

    // Normalize news articles
    const articles = results.map((item) => ({
      title: item.title || "Untitled",
      description: item.description || item.content || "",
      source: item.source_id || item.source || "Unknown source",
      publishedAt: item.pubDate || item.pub_date || null,
      url: item.link || item.url || "#",
      imageUrl: item.image_url || item.image || null,
    }));

    const responsePayload = {
      articles,
      total: data.totalResults || data.total_results || articles.length,
      nextPage: data.nextPage || data.next_page || null,
      page: Number(page),
    };

    // Cache for 30 minutes
    await cacheService.set(cacheKey, responsePayload, 1800);

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Error fetching news:", error.response || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || "Failed to fetch news";
    res.status(status).json({ message });
  }
});

module.exports = router;
