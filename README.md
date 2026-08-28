# abduaxadov — Portfolio

Abdulaziz Abduahadov | Full-Stack Developer

## Sahifalar
- `index.html` — asosiy portfolio sahifasi (UZ/EN/RU, dark/light rejim, loyihalar, aloqa formasi)
- `cv.html` — rezyume

## Texnologiyalar
- Sof statik HTML/CSS/JS (frontend + SEO meta, JSON-LD)
- `api/contact.js` — Vercel serverless funksiya: aloqa formasini Telegram'ga yuboradi
  (Vercel env: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`)

## Deploy (Vercel)
- `vercel.json`: framework/build `null`, `cleanUrls: true`
- Loyiha sozlamalarida Build Command bo'sh bo'lishi kerak (`vercel build` qo'ymang — xato beradi)