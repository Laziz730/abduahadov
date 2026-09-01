// Vercel serverless: saytga kirganlar umumiy sonini qaytaradi.
// Ukazatel saqlash: KV (Upstash Redis) env'lar bo'lsa — doimiy, bo'lmasa /tmp.
const fs = require("fs");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) {
    try {
      const r = await fetch(url + "/get/portfolio_visits", {
        headers: { Authorization: "Bearer " + token },
      });
      const d = await r.json();
      const v = parseInt(d && d.result, 10);
      if (Number.isFinite(v)) {
        return res.status(200).json({ ok: true, visits: v });
      }
    } catch (e) {}
  }

  try {
    const v = parseInt(fs.readFileSync("/tmp/portfolio_visits.txt", "utf8"), 10);
    if (Number.isFinite(v)) {
      return res.status(200).json({ ok: true, visits: v });
    }
  } catch (e) {}

  return res.status(200).json({ ok: true, visits: 0 });
};