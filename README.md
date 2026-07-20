# 🚀 DevVerse — Full-Stack Developer Social Platform

DevVerse is a modern, interactive, and beautifully styled social networking platform built specifically for developers to showcase projects, host/RSVP to events, join communities, post thoughts, and chat in real-time.

---

## 🔗 Live Deployments

| Resource | Live Link | Hosting Platform |
| :--- | :--- | :--- |
| **🌐 Frontend (Web App)** | [https://devverse-ashwin2k23.vercel.app](https://devverse-ashwin2k23.vercel.app) | **Vercel** |
| **🔌 Backend (Express API)** | [https://api-production-5e2c1.up.railway.app](https://api-production-5e2c1.up.railway.app) | **Railway** |
| **💾 Database (SQL)** | SQLite / libSQL Client | **Turso Cloud** |

---

## ✨ Features

- **📂 Project Showcase**: Display your work with beautiful galleries, live demo links, GitHub integration, and rich tech stack tags.
- **⚡ First-time Signup Redirect**: Detects brand new registrations on login/sync and immediately routes them to the profile setup screen first.
- **🔄 Live Profile Synchronization**: Real-time database profile context sync (`username`, `avatarUrl`) propagating across the navbar, sidebar, bottomnav, and dashboard pages instantly.
- **👥 Developer Communities**: Join topic-based forums (e.g. React, DevOps, UI/UX). Post, discuss, join, or leave communities with strict role validation.
- **💬 Real-time Chat**: Connect in real-time with direct messaging, online status tracking, typing indicators, and read receipts powered by WebSockets.
- **🎮 Gamification & Achievements**: Maintain streaks, earn developer experience levels, and unlock sidebar achievements with a space-saving collapsible list grid.
- **🔒 Hardened Error Handling**: Full debug logging on the server with strict response sanitization. Suppresses and overrides raw database errors (SQLite/Prisma client stack traces) to client-safe generic responses globally.
- **🛠️ Zero Hardcoded Credentials**: Strictly isolates keys, secrets, and connection parameters within private environment files (`.env`), verified under strict `.gitignore` configurations.

---

## 🛠️ Technology Stack

- **Monorepo Architecture**: Managed with `pnpm workspaces` & `turborepo`
- **Frontend**: Next.js 14, TailwindCSS, Framer Motion, Radix UI, Lucide Icons, Clerk Auth Client
- **Backend**: Node.js, Express, Socket.io (WebSockets), Clerk SDK
- **Database ORM**: Prisma client with libSQL driver adapter (SQLite locally, Turso in production)
- **Media Uploads**: Cloudinary Image API

---

## 📂 Project Directory Structure

```text
devverse/
├── apps/
│   ├── api/                   # Backend Express server (Socket.io, controllers, routes, prisma adapters)
│   └── web/                   # Frontend Next.js client (App router, components, contexts, hooks)
├── packages/
│   └── shared/                # Shared TypeScript types, utility definitions, and configurations
├── prisma/
│   └── schema.prisma          # Shared database schema models (User, Profile, Follower, Notification, etc.)
├── .env.example               # Reference guide for setting up local environment variables
├── pnpm-workspace.yaml        # PNPM Workspace packages mapping
└── turbo.json                 # Turborepo task pipeline management
```

---

## 💻 Local Development Setup

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **pnpm** installed.

### 2. Configure Environment Variables
Copy `.env.example` to the respective workspaces:
- Copy the backend vars to `apps/api/.env`
- Copy the frontend vars to `apps/web/.env.local`

### 3. Install Dependencies
Run from the root directory:
```bash
pnpm install
```

### 4. Push Local Database Schema
```bash
pnpm db:push
```

### 5. Run the Application
Start both the API and Web Client dev servers simultaneously:
```bash
pnpm dev
```
- Frontend client runs at: `http://localhost:3000`
- Backend API server runs at: `http://localhost:4000`

