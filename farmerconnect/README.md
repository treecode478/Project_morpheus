# 🌾 KrishiConnect

Production-grade social platform for Indian farmers.

**Last docs update:** 2026-02-18T10:08:34.654Z  
**Docs version:** 1.0.1

## Project structure

- `krishiconnect-backend/`: Node.js + Express API
- `krishiconnect-web/`: React (Vite) frontend
- `docs/`: Generated project documentation

## Quick start

### Backend

```bash
cd krishiconnect-backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd krishiconnect-web
npm install
cp .env.example .env
npm run dev
```

## Documentation

- Docs index: `docs/INDEX.md`

From backend folder:

```bash
npm run update-docs
npm run docs:watch
npm run verify-docs
```
