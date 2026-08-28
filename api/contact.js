// Vercel serverless funktsiya: portfolio aloqa formasini Telegram'ga yuboradi.
// Sozlamalar: odatda Vercel Settings -> Environment Variables orqali:
//   TELEGRAM_BOT_TOKEN = @BotFather dan olingan token
//   TELEGRAM_CHAT_ID   = xabarlar boradigan chat/user ID (masalan @userinfobot dan)
// Aks holda quyidagi default qiymatlar ishlatiladi. Defaultlar public repo'da
// ochiq ko'rinadi — production uchun env o'rnatish tavsiya etiladi.

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

  // Honeypot — botlar to'ldiradigan yashirin maydon
  if (body.website) {
    return res.status(200).json({ ok: true, ignored: true });
  }

  const name = String(body.name || "").trim().slice(0, 60);
  const contact = String(body.contact || "").trim().slice(0, 80);
  const message = String(body.message || "").trim().slice(0, 1000);
  const lang = String(body.lang || "uz");

  if (!name || !contact || !message) {
    return res.status(400).json({ ok: false, error: "Missing fields" });
  }

  // Oddiy tezlik cheklovi (masalan 10 daqiqada 15 tadan oshmasin)
  const ip = (req.headers["x-forwarded-for"] || "?")
    .toString().split(",")[0].trim();
  const now = Date.now();
  const key = ip + ":" + Math.floor(now / (10 * 60 * 1000));
  const limits = global.__contactLimits || (global.__contactLimits = {});
  limits[key] = (limits[key] || 0) + 1;
  if (limits[key] > 15) {
    return res.status(429).json({ ok: false, error: "Too many requests" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN || "8953191527:AAG47EPG2pAilNv51te4CVdWVonB8e5yxbU";
  const chatId = process.env.TELEGRAM_CHAT_ID || "8030572845";

  const text =
    "🌟 *Yangi portfolio xabari* (" + lang.toUpperCase() + ")\n\n" +
    "👤 Ism: " + name + "\n" +
    "📞 Aloqa: " + contact + "\n\n" +
    "💬 Xabar:\n" + message;

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