# Backend Guide

**Last generated:** 2026-02-18T10:08:34.654Z

## Entry points
- `src/server.js`: starts DB/Redis + HTTP server + Socket.IO
- `src/app.js`: middleware + routes

## Modules
- `/api/v1/weather` → `krishiconnect-backend/src/modules/weather/weather.routes.js`
- `/api/v1/users` → `krishiconnect-backend/src/modules/user/user.routes.js`
- `/api/v1/qa` → `krishiconnect-backend/src/modules/qa/qa.routes.js`
- `/api/v1/posts` → `krishiconnect-backend/src/modules/post/post.routes.js`
- `/api/v1/notifications` → `krishiconnect-backend/src/modules/notification/notification.routes.js`
- `/api/v1/market` → `krishiconnect-backend/src/modules/market/market.routes.js`
- `/api/v1/chat` → `krishiconnect-backend/src/modules/chat/chat.routes.js`
- `/api/v1/auth` → `krishiconnect-backend/src/modules/auth/auth.routes.js`

## Email/OTP
- `src/config/nodemailer.js`
- `src/services/emailService.js`
- `src/services/otpService.js`
