// Vercel serverless funktsiya: portfolio bahosini Telegram'ga mirror qiladi.
// Sozlamalar: TELEGRAM_BOT_TOKEN va TELEGRAM_CHAT_ID env yoki default (kod ichida).
// Asosiy saqlash kvdb.io da bo'ladi; bu faqat egasiga jonli bildirish uchun.

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

  // Oddiy tezlik cheklovi
  const ip = (req.headers["x-forwarded-for"] || "?")
    .toString().split(",")[0].trim();
  const now = Date.now();
  const key = ip + ":" + Math.floor(now / (10 * 60 * 1000));
  const limits = global.__ratingLimits || (global.__ratingLimits = {});
  limits[key] = (limits[key] || 0) + 1;
  if (limits[key] > 10) {
    return res.status(429).json({ ok: false, error: "Too many requests" });
  }

  const stars = parseInt(body.stars, 10);
  if (!(stars >= 1 && stars <= 5)) {
    return res.status(400).json({ ok: false, error: "Bad stars" });
  }
  const comment = String(body.comment || "").trim().slice(0, 400);

  const token = process.env.TELEGRAM_BOT_TOKEN || "8953191527:AAG47EPG2pAilNv51te4CVdWVonB8e5yxbU";
  const chatId = process.env.TELEGRAM_CHAT_ID || "8030572845";

  const starsLine = "⭐".repeat(stars) + "☆".repeat(5 - stars);
  const text =
    "⭐ Yangi portfolio bahosi\n\n" +
    "Baho: " + starsLine + " (" + stars + "/5)\n" +
    (comment ? "💬 Izoh:\n" + comment : "");

  try {
    const r = await fetch(
      "https://api.telegram.org/bot" + token + "/sendMessage",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: text }),
      }
    );
    const data = await r.json();
    if (!data.ok) {
      return res.status(502).json({ ok: false, error: "Telegram error" });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false, error: "Telegram unreachable" });
  }
};