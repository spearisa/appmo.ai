const express = require("express");
const cors = require("cors");
const path = require("path");
const { Readable } = require("stream");

const app = express();
const PORT = Number(process.env.APPMO_FUNCTIONAL_PORT ?? 3001);
const NEXT_API_BASE =
  process.env.APPMO_NEXT_API_BASE ?? "http://localhost:3000";

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const forwardRequest = async (req, res, method, endpoint) => {
  try {
    const upstream = await fetch(`${NEXT_API_BASE}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": req.headers["x-forwarded-for"] ?? req.ip,
      },
      body: JSON.stringify(req.body),
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (key.toLowerCase() === "transfer-encoding") return;
      res.setHeader(key, value);
    });

    if (!upstream.body) {
      const text = await upstream.text();
      res.send(text);
      return;
    }

    const nodeStream = Readable.fromWeb(upstream.body);
    nodeStream.on("error", (error) => {
      console.error("Upstream stream error:", error);
      if (!res.headersSent) {
        res.status(500);
      }
      res.end(
        JSON.stringify({
          ok: false,
          message: "Upstream stream failed.",
        })
      );
    });

    nodeStream.pipe(res);
  } catch (error) {
    console.error("Forward proxy error:", error);
    res.status(500).json({
      ok: false,
      message:
        error?.message ||
        "Failed to reach the Appmo backend. Ensure the Next.js app is running.",
    });
  }
};

app.post("/api/ask-ai", async (req, res) => {
  await forwardRequest(req, res, "POST", "/api/ask-ai");
});

app.put("/api/ask-ai", async (req, res) => {
  await forwardRequest(req, res, "PUT", "/api/ask-ai");
});

app.put("/api/re-design", async (req, res) => {
  await forwardRequest(req, res, "PUT", "/api/re-design");
});

app.listen(PORT, () => {
  console.log(
    `🚀 Appmo Functional Server proxy running on http://localhost:${PORT}`
  );
  console.log(
    `🔁 Forwarding AI requests to ${NEXT_API_BASE}/api/ask-ai (no mock generator)`
  );
});

module.exports = app;
