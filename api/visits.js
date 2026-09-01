// Vercel serverless: saytga kirganlar umumiy sonini qaytaradi.
// Hisoblagich — hits.sh (https://hits.sh/abduahadov.wwwi.uz.svg) da doimiy saqlanadi.
const HITS_URL = "https://hits.sh/abduahadov.wwwi.uz.svg?label=&color=7c3aed&style=flat-square&logoColor=white";

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const r = await fetch(HITS_URL);
    const t = await r.text();
    const m = t.match(/[0-9,]+/);
    const v = parseInt((m ? m[0] : "0").replace(/,/g, ""), 10);
    if (Number.isFinite(v)) {
      return res.status(200).json({ ok: true, visits: v });
    }
  } catch (e) {}
  return res.status(200).json({ ok: true, visits: 0 });
};