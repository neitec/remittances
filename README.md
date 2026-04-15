# Remittances MVP - Digital Money Transfer Platform

A modern, Revolut-inspired frontend for cross-border money transfers built with Next.js 14, TypeScript, and Tailwind CSS.

## 🎯 Features

- **P2P Wallet Transfers** - Send money to other users instantly
- **SEPA Deposits** - Add funds via bank transfer (EUR)
- **Transaction History** - Track all your transfers and deposits
- **Bank Account Management** - Register your IBAN for deposits
- **API Key Authentication** - Secure, token-based access
- **Professional UI** - Enterprise-grade design inspired by Revolut
- **Mobile Responsive** - Works seamlessly on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **State**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Deployment**: Vercel

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and use API key: `rem-test-key-spain-001`

## 📚 Documentation

- **`FRONTEND_SETUP.md`** - Complete implementation guide with code examples
- **`SETUP_NEXT_STEPS.md`** - Development roadmap and component checklist

## 🚀 Implementation Status

✅ Next.js 14 + TypeScript + Tailwind CSS
✅ shadcn/ui components installed
✅ Dependencies: axios, zustand, react-query, zod, react-hook-form
✅ Directory structure created
⏳ Components to be implemented following `SETUP_NEXT_STEPS.md`

## 📦 Scripts

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Lint code
```

## 🔗 Backend

Connects to: `http://localhost:3001/api` (configurable in `.env.local`)

---

**Ready for enterprise-grade frontend implementation! 🚀**
