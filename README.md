# Remita - Digital Money Transfer Platform

A modern, Material Design 3-inspired frontend for cross-border money transfers built with Next.js 16, TypeScript, and Tailwind CSS.

## 🎯 Features

- **P2P Wallet Transfers** - Send money to other users instantly
- **SEPA Deposits** - Add funds via bank transfer (EUR)
- **Transaction History** - Track all your transfers and deposits
- **Bank Account Management** - Register your IBAN for deposits
- **Auth0 Authentication** - Secure OAuth-based access
- **Material Design 3 UI** - Modern, accessible design system
- **Mobile Responsive** - Works seamlessly on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Material Design 3
- **Animations**: Framer Motion
- **State**: React Query
- **Authentication**: Auth0
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

Open [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **`FRONTEND_SETUP.md`** - Complete implementation guide with code examples
- **`SETUP_NEXT_STEPS.md`** - Development roadmap and component checklist

## 🚀 Implementation Status

✅ Next.js 16 + TypeScript + Tailwind CSS + Turbopack
✅ Material Design 3 system implemented
✅ Auth0 authentication integrated
✅ Deposit, Send, Transactions, Accounts management pages
✅ All UI components with Material Design 3 compliance
✅ Real transaction data (no mocks)
✅ Production-ready build (0 TypeScript errors)

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

**Enterprise-grade digital remittances platform. 🚀**
