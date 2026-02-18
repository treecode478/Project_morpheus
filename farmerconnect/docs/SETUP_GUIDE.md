# Setup Guide

**Last generated:** 2026-02-18T10:08:34.654Z

## Prerequisites
- Node.js 18+
- MongoDB 7+
- Redis 7+ (optional)

## Backend

```bash
cd farmerconnect/krishiconnect-backend
npm install
cp .env.example .env
npm run dev
```

API base: `http://localhost:5000/api/v1`

## Frontend

```bash
cd farmerconnect/krishiconnect-web
npm install
cp .env.example .env
npm run dev
```

## Docs auto-update

Run from backend folder:

```bash
npm run update-docs
npm run docs:watch
npm run verify-docs
```
