// Vercel serverless: saytga kirgan foydalanuvchi lokatsiyasini Telegram'ga yuboradi.
// Tashrif hisoblagichi — hits.sh (doimiy, bepul, sertifikatsiz) orqali saqlanadi.
// Har kirishda "Odam kirdi! (jami N)" xabari Telegram'ga boradi.
const HITS_URL = "https://hits.sh/abduahadov.wwwi.uz.svg?label=x&color=7c3aed&style=flat-square";

async function hitsTotal() {
  try {
    const r = await fetch(HITS_URL);
    const t = await r.text();
    const m = t.match(/[0-9,]+/);
    if (m) return m[0];
  } catch (e) {}
  return "?";
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

  const total = await hitsTotal();

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