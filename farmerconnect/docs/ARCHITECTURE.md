# Architecture

**Last generated:** 2026-02-18T10:08:34.654Z

## High-level

```
React (Vite)  --->  Express API (/api/v1)  ---> MongoDB (Mongoose)
                     |        |
                     |        +--> Redis (optional)
                     +--> Socket.IO
                     +--> Nodemailer (SMTP)
                     +--> Twilio (optional)
```

## Auth flows
- Phone registration: `POST /auth/register` → SMS OTP → `POST /auth/verify-otp`
- Email registration: `POST /auth/register` (with email) → Email OTP → `POST /auth/verify-registration-otp`
- Forgot password (email OTP): `POST /auth/forgot-password` → `POST /auth/reset-password`
