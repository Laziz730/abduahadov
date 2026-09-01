// Vercel serverless: Telegram bot webhook.
// Bot'ga kirgan har bir foydalanuvchidan lokatsiya tugma orqali so'raladi.
// Joylashuv kelganda — xarita + ma'lumot asosiy chat'ga (ega) yuboriladi.
// Webhook o'rnatish:
//   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<DOMEN>/api/webhook

async function tg(method, params) {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8953191527:AAG47EPG2pAilNv51te4CVdWVonB8e5yxbU";
  const r = await fetch("https://api.telegram.org/bot" + token + "/" + method, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return r.json();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  const owner = Number(process.env.TELEGRAM_CHAT_ID || "8030572845");
  const data = req.body || {};
  const msg = data.message || data.edited_message || {};
  if (!msg || !msg.chat) return res.status(200).json({ ok: true });

  const chat = msg.chat;
  const from = msg.from || {};
  const who = ([from.first_name, from.last_name].filter(Boolean).join(" ") || from.username || "Foydalanuvchi");

  try {
    if (msg.location) {
      const lat = msg.location.latitude;
      const lon = msg.location.longitude;
      await tg("sendLocation", { chat_id: owner, latitude: lat, longitude: lon });
      await tg("sendMessage", {
        chat_id: owner,
        text:
          "📍 " + who + " joylashuvini yubordi\n" +
          "🌐 " + lat + ", " + lon + "\n" +
          "🆔 chatID: " + chat.id + "\n" +
          "🕒 " + new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" }),
      });
      await tg("sendMessage", {
        chat_id: chat.id,
        text: "✅ Joylashuvingiz qabul qilindi. Rahmat!",
      });
    } else {
      const kb = {
        keyboard: [[{ text: "📍 Joylashuvni yuborish", request_location: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      };
      await tg("sendMessage", {
        chat_id: chat.id,
        text:
          "Salom, " + who + "! 👋\n\n" +
          "Portfolio saytiga xush kelibsiz.\n" +
          "Qayerda turganingizni ko'rsatish uchun pastdagi tugmani bosing:",
        reply_markup: kb,
      });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(200).json({ ok: true, error: String(e && e.message) });
  }
};