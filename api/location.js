// Vercel serverless: saytga kirgan foydalanuvchi lokatsiyasini Telegram'ga yuboradi.
// Har kirish tashrif hisoblagichini oshiradi va "Odam kirdi!" xabari Telegram'ga boradi.
// Doimiy hisob uchun: Vercel da KV (Upstash Redis) yaratib,
//   KV_REST_API_URL va KV_REST_API_TOKEN env'larini o'rnatish mumkin.
// Ukazatel yo'q bo'lsa, /tmp fayl ishlatiladi (Vercel'da vaqtinchalik).

const fs = require("fs");

async function readCounter() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) {
    try {
      const r = await fetch(url + "/get/portfolio_visits", {
        headers: { Authorization: "Bearer " + token },
      });
      const d = await r.json();
      const v = parseInt(d && d.result, 10);
      return Number.isFinite(v) ? v : 0;
    } catch (e) {}
  }
  try {
    const v = parseInt(fs.readFileSync("/tmp/portfolio_visits.txt", "utf8"), 10);
    return Number.isFinite(v) ? v : 0;
  } catch (e) {
    return 0;
  }
}

async function incrCounter() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) {
    try {
      const r = await fetch(url + "/incr/portfolio_visits", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
      const d = await r.json();
      const v = parseInt(d && d.result, 10);
      if (Number.isFinite(v)) return v;
    } catch (e) {}
  }
  let n = 0;
  try {
    n = parseInt(fs.readFileSync("/tmp/portfolio_visits.txt", "utf8"), 10) || 0;
  } catch (e) {}
  n += 1;
  try {
    fs.writeFileSync("/tmp/portfolio_visits.txt", String(n));
  } catch (e) {}
  return n;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  } catch (e) {
    return res.status(400).json({ ok: false, error: "Bad JSON" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN || "8953191527:AAG47EPG2pAilNv51te4CVdWVonB8e5yxbU";
  const chatId = process.env.TELEGRAM_CHAT_ID || "8030572845";

  const lat = Number(body.lat);
  const lon = Number(body.lon);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon) &&
    Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
  const latS = hasCoords ? lat.toFixed(5) : String(body.lat || "?");
  const lonS = hasCoords ? lon.toFixed(5) : String(body.lon || "?");

  const country = String(body.country || "").slice(0, 60);
  const city = String(body.city || "").slice(0, 60);
  const region = String(body.region || "").slice(0, 60);
  const lang = String(body.lang || "uz").slice(0, 8);
  const ua = String(body.ua || "").slice(0, 140);
  const ip = String(body.ip || "?").slice(0, 60);

  const locPart = [city, region, country].filter(Boolean).join(", ") || "Noma'lum";

  const total = await incrCounter();

  const text =
    "👤 Odam kirdi! Portfolio'ga yangi tashrif (jami: " + total + ")\n\n" +
    "📍 Joylashuv: " + locPart + "\n" +
    "🌐 Koordinata: " + latS + ", " + lonS + "\n" +
    "🗣 Til: " + lang + "\n" +
    "💻 Brauzer: " + ua + "\n" +
    "🔢 IP: " + ip + "\n" +
    "🕒 Sana: " + new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });

  try {
    if (hasCoords) {
      await fetch("https://api.telegram.org/bot" + token + "/sendLocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, latitude: lat, longitude: lon }),
      });
    }
    const r = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: text }),
    });
    const d = await r.json();
    if (!d.ok) {
      return res.status(502).json({ ok: false, error: "Telegram error" });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false, error: "Telegram unreachable" });
  }
};