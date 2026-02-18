# Field Audit & Mismatch Report — KrishiConnect

**Date:** 2025-02-18  
**Scope:** Frontend (krishiconnect-web) + Backend (krishiconnect-backend). Zero UI changes; Nodemailer OTP integration added on backend only.

---

## 1. FRONTEND FIELD AUDIT

### FORM #1: User Registration (2 steps)

| Property | Value |
|----------|--------|
| Component Path | `krishiconnect-web/src/pages/Register.jsx` |
| Form Steps | Step 1: Account details → Step 2: OTP verification |
| Submission (Step 1) | `POST /api/v1/auth/register` |
| Submission (Step 2) | `POST /api/v1/auth/verify-otp` |
| HTTP Method | POST |
| API Client | `authService.register()`, `authService.verifyOTP()` (axios via `api.js`) |

#### Step 1 – Input fields

| Field | Name | Type | Required | Validation | Error message | State |
|-------|------|------|----------|------------|---------------|-------|
| 1 | phoneNumber | tel | YES | Regex `^[6-9]\d{9}$` (10 digits, Indian) | "Invalid phone number" | step1Form |
| 2 | name | text | YES | min 2 chars | "Name must be at least 2 characters" | step1Form |
| 3 | password | password | YES | min 6 chars | "Password must be at least 6 characters" | step1Form |
| 4 | confirmPassword | password | YES | min 6 + match password | "Passwords don't match" | step1Form |
| 5 | location.state | select | NO | optional | - | step1Form |
| 6 | location.district | text | NO | optional | - | step1Form |

- **Submit button:** "Send OTP" — loading state "Sending OTP...", disabled when `loading \|\| !passwordsMatch`.
- **Success:** Step 2 shown, toast "OTP sent to your phone!", OTP timer 60s, resend allowed after timer.
- **Error:** Toast from `err.response?.data?.message` or "Registration failed".

#### Step 2 – OTP verification

| Field | Name | Type | Required | Validation | Error message | State |
|-------|------|------|----------|------------|---------------|-------|
| 1 | otp | text | YES | length 6, numeric | "OTP must be 6 digits" | step2Form |

- **Submit button:** "Verify & Register" — disabled when loading / errors / empty otp.
- **Success:** `setAuth(user, tokens.accessToken, tokens.refreshToken)`, toast "Registration successful!", `navigate('/feed')`.
- **Resend:** Calls `authService.register(registrationData)` again, timer reset 60s.

---

### FORM #2: Login

| Property | Value |
|----------|--------|
| Component Path | `krishiconnect-web/src/pages/Login.jsx` |
| Submission Endpoint | `POST /api/v1/auth/login` |
| HTTP Method | POST |

| Field | Name | Type | Required | Validation | Error message |
|-------|------|------|----------|------------|---------------|
| 1 | phoneNumber | tel | YES | Regex `^[6-9]\d{9}$` | "Invalid phone number" |
| 2 | password | password | YES | min 1 (required) | "Password required" |

- **Submit:** "Login to Account". Success: setAuth, toast, navigate `/feed`. Error: toast from API or "Login failed".
- **Forgot password:** Link `href="#forgot"` only (no page/flow yet).

---

### FORM #3: Profile (edit bio)

| Property | Value |
|----------|--------|
| Component Path | `krishiconnect-web/src/pages/Profile.jsx` |
| API | GET `/users/me` or `/users/:id`; bio update not wired to API (toast only) |

- **Bio edit:** Local state `editedBio`; "Save" does not call backend (placeholder).

---

### Frontend validation rules summary

| Field | Frontend rule | Required | Max length | Messages |
|-------|----------------|----------|------------|----------|
| phoneNumber | `^[6-9]\d{9}$` | YES | 10 | Invalid phone number |
| name | min 2 | YES | (none) | Name must be at least 2 characters |
| password | min 6 | YES | (none) | Password must be at least 6 characters |
| confirmPassword | min 6, match | YES | - | Passwords don't match |
| location.state | optional | NO | - | - |
| location.district | optional | NO | - | - |
| otp | length 6 | YES | 6 | OTP must be 6 digits |

---

## 2. BACKEND FIELD AUDIT

### Endpoint #1: POST /api/v1/auth/register

| Property | Value |
|----------|--------|
| Controller | `authController.register` |
| Service | `authService.register(userData)` |
| Auth required | NO |
| Rate limiting | authLimiter (5 per 15 min) |
| Validation | `registerSchema` (Joi) |

**Request body (validation):**

| Field | Type | Required | Rules | Backend storage |
|-------|------|----------|--------|-----------------|
| phoneNumber | string | YES | Pattern `^[6-9]\d{9}$` | Temp Redis/memory, then User.phoneNumber |
| name | string | YES | trim, max 100 | User.name |
| password | string | YES | min 6 | Hashed (bcrypt), User.password |
| location | object | NO | state, district, village | User.location |

**Flow:** Check phone not registered → generate OTP (Twilio SMS) → store temp user in Redis → return `{ otpSent: true, phoneNumber }`.  
**Responses:** 201 success; 409 phone already registered; 400 validation; 500 server error.

---

### Endpoint #2: POST /api/v1/auth/verify-otp

| Property | Value |
|----------|--------|
| Controller | `authController.verifyOTP` |
| Validation | `verifyOTPSchema`: phoneNumber, otp (length 6) |

**Request body:** phoneNumber, otp.  
**Flow:** Verify OTP from Redis → load temp user → create User → generate tokens → return user + tokens.  
**Responses:** 200 success; 400 invalid/expired OTP or session; 429 too many attempts.

---

### Endpoint #3: POST /api/v1/auth/login

| Property | Value |
|----------|--------|
| Validation | `loginSchema`: phoneNumber (pattern), password required |

**Flow:** Find user by phone → check not banned → compare password → tokens → lastLogin updated.  
**Responses:** 200 user + tokens; 401 invalid credentials; 403 banned.

---

### Endpoint #4: POST /api/v1/auth/refresh-token

**Body:** refreshToken. Returns new accessToken.

---

### Endpoint #5: POST /api/v1/auth/logout

**Auth:** Required. Body/header: refreshToken. Removes token / blacklists.

---

### Backend validation rules (Joi)

| Field | Rule | Notes |
|-------|------|--------|
| phoneNumber | pattern `^[6-9]\d{9}$`, required | Indian 10-digit |
| name | required, trim, max 100 | |
| password | min 6, required | register only |
| location | object { state, district, village } | optional |
| otp | length 6, required | verify-otp |
| refreshToken | required | refresh-token |

**Existing but unused in routes:** `forgotPasswordSchema` (phoneNumber), `resetPasswordSchema` (phoneNumber, otp, newPassword min 6).

---

## 3. DATABASE (USER) SCHEMA

**ORM:** Mongoose. **Model:** `modules/user/user.model.js`

| Column | Type | Required | Unique | Default | Notes |
|--------|------|----------|--------|--------|-------|
| phoneNumber | String | YES | YES | - | Index, validated 6-9 + 9 digits |
| email | String | NO | YES (sparse) | - | Optional |
| password | String | NO | - | - | select: false, bcrypt in pre-save |
| name | String | YES | - | - | trim, maxlength 100 |
| avatar | Object | - | - | - | url, publicId |
| bio | String | - | - | - | maxlength 500 |
| location | Object | - | - | - | state, district, village, coordinates |
| ... | (farmSize, crops, languages, isExpert, stats, preferences, refreshTokens, lastLogin, isActive, isBanned, etc.) | | | | |

**New columns added for OTP/email (Phase 2):**  
emailVerified (Boolean), verificationStatus (enum), lastPasswordChangeAt (Date). lastLogin already exists.

---

## 4. FIELD MISMATCH ANALYSIS

| Field | Frontend | Backend | Match? | Issue | Fix |
|-------|----------|---------|--------|-------|-----|
| phoneNumber | regex 10 digits | same pattern | ✓ | - | None |
| name | min 2 | required, max 100 | ✓ | Frontend no max | Optional: add maxLength 100 |
| password | min 6 | min 6 | ✓ | - | None |
| confirmPassword | match | not sent | ✓ | - | None |
| location.state | optional | optional | ✓ | - | None |
| location.district | optional | optional | ✓ | - | None |
| otp | length 6 | length 6 | ✓ | - | None |

**Summary:** No blocking mismatches. Frontend and backend align for phone-based registration and login. Optional improvement: add name max length 100 on frontend.

---

## 5. NEW BACKEND ADDITIONS (NO UI CHANGES)

- **Nodemailer:** Config, email service, HTML/text templates for registration OTP and password-reset OTP.
- **OTP model (Mongoose):** Email OTP only (id, userId, email, hashed otpCode, otpType, expiresAt, isVerified, verificationAttempts). Phone OTP remains in Redis.
- **User model:** emailVerified, verificationStatus, lastPasswordChangeAt.
- **Routes:** POST forgot-password (email), POST reset-password (otpId, otp, newPassword), POST resend-otp (otpId). Registration and verify-otp unchanged (phone flow).
- **Rate limiters:** registerLimiter, forgotPasswordLimiter (used on auth routes).
- **Duplicate email send:** Prevented via Redis key or in-memory window (no EventLog in project).

Existing forms and buttons behave the same; new email OTP and forgot-password are available for future UI or API consumers.

---

## 6. IMPLEMENTATION SUMMARY (Nodemailer + Email OTP)

### Created

- **`krishiconnect-backend/src/config/nodemailer.js`** – Nodemailer transporter (SMTP from env).
- **`krishiconnect-backend/src/services/emailService.js`** – `sendEmail`, `sendEmailOnce` (Redis duplicate prevention).
- **`krishiconnect-backend/src/services/emailTemplates.js`** – `getRegistrationOTPTemplate`, `getPasswordResetOTPTemplate`.
- **`krishiconnect-backend/src/services/otpService.js`** – Generate/send/verify/resend/invalidate email OTP (bcrypt hashed, stored in MongoDB).
- **`krishiconnect-backend/src/modules/auth/otp.model.js`** – Mongoose OTP model (userId, email, otpCode, otpType, expiresAt, isVerified, verificationAttempts).

### Modified

- **`krishiconnect-backend/src/modules/user/user.model.js`** – Added `emailVerified`, `verificationStatus`, `lastPasswordChangeAt`.
- **`krishiconnect-backend/src/modules/auth/auth.service.js`** – Added `forgotPasswordEmail`, `resetPasswordWithOTP`, `resendEmailOTP`.
- **`krishiconnect-backend/src/modules/auth/auth.controller.js`** – Added `forgotPassword`, `resetPasswordWithOTP`, `resendOTP`.
- **`krishiconnect-backend/src/modules/auth/auth.validation.js`** – Added `forgotPasswordEmailSchema`, `resetPasswordWithOTPSchema`, `resendOTPSchema`.
- **`krishiconnect-backend/src/modules/auth/auth.routes.js`** – Added POST `/forgot-password`, `/reset-password`, `/resend-otp`; `registerLimiter`, `forgotPasswordLimiter` on register and forgot-password.
- **`krishiconnect-backend/src/middlewares/rateLimit.middleware.js`** – Added `registerLimiter` (5/hour), `forgotPasswordLimiter` (3/hour).
- **`krishiconnect-backend/.env.example`** – Added `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL`.

### API (email OTP – no UI changes)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/forgot-password` | `{ email }` | Send password-reset OTP to email (if user exists). Returns `{ otpId, expiresIn }`. |
| POST | `/api/v1/auth/reset-password` | `{ otpId, otp, newPassword }` | Verify OTP and set new password. |
| POST | `/api/v1/auth/resend-otp` | `{ otpId }` | Resend email OTP for same request. |

Existing **phone** registration and **verify-otp** flow unchanged; UI unchanged.
