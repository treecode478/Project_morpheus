# Troubleshooting

**Last generated:** 2026-02-18T10:08:34.654Z

## Email not sending
- Check `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` in backend `.env`.

## Phone OTP not verifying
- Ensure Redis is reachable if you rely on strict OTP verification.
