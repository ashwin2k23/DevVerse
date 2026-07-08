'use client';

import { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { SocketProvider } from "@/context/SocketContext";
import UserSync from "@/components/shared/UserSync";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      <UserSync />
      <div style={{ minHeight: "100vh", background: "var(--background)" }}>
        <Navbar />
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px",
            paddingTop: 88,
          }}
        >
          {/* Top horizontal sidebar */}
          <div style={{ marginBottom: 12 }} className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Main content */}
          <main style={{ minWidth: 0, paddingBottom: 80 }}>
            {children}
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <BottomNav />
      </div>
    </SocketProvider>
  );
}
