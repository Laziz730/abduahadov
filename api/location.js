// Vercel serverless: saytga kirgan foydalanuvchi lokatsiyasini Telegram'ga yuboradi.
// Tashrif hisoblagichi — hits.sh (doimiy, bepul, sertifikatsiz) orqali saqlanadi.
// Har kirishda "Odam kirdi! (jami N)" xabari Telegram'ga boradi.
const HITS_URL = "https://hits.sh/abduahadov.wwwi.uz.svg?label=&color=7c3aed&style=flat-square&logoColor=white";

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

  const country = String(body.country || "").slice(0, 60);
  const city = String(body.city || "").slice(0, 60);
  const region = String(body.region || "").slice(0, 60);
  const lang = String(body.lang || "uz").slice(0, 8);
  const ua = String(body.ua || "").slice(0, 140);

  // IP — App Vercel tizimida 'x-forwarded-for' header'dan olinadi (mening server chaqiruvlarim tashlanadi)
  const fwd = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const useIp = fwd && fwd !== "::1" && fwd !== "127.0.0.1" ? fwd : String(body.ip || "?").slice(0, 60);
  const ip = useIp.slice(0, 60);

  const locPart = [city, region, country].filter(Boolean).join(", ") || "Noma'lum";

  const total = await hitsTotal();

  const text =
    "👤 Odam kirdi! Portfolio'ga yangi tashrif (jami: " + total + ")\n\n" +
    "🔢 IP: " + ip + "\n" +
    "📍 Joylashuv: " + locPart + "\n" +
    "🗣 Til: " + lang + "\n" +
    "💻 Brauzer: " + ua + "\n" +
    "🕒 Sana: " + new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });

  try {
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