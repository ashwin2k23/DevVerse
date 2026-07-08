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

## 🛠️ Technology Stack

- **Monorepo Structure**: Managed with `pnpm workspaces` & `turborepo`
- **Frontend**: Next.js 14, TailwindCSS, Framer Motion, Radix UI
- **Backend**: Node.js, Express, Socket.io (Real-time WebSockets)
- **Database ORM**: Prisma client with libSQL driver adapter
- **Authentication**: Clerk User Management & Session Sync
- **Media Uploads**: Cloudinary Image API

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
Start both the API and Web App dev servers simultaneously:
```bash
pnpm dev
```
- Frontend runs at: `http://localhost:3000`
- Backend runs at: `http://localhost:4000`
