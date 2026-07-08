import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "DevVerse — Where Developers Connect & Grow",
    template: "%s | DevVerse",
  },
  description:
    "The modern social platform for developers. Showcase projects, connect with peers, join communities, and participate in coding events.",
  keywords: ["developers", "social", "projects", "community", "coding", "portfolio"],
  authors: [{ name: "DevVerse" }],
  creator: "DevVerse",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devverse.app",
    title: "DevVerse — Where Developers Connect & Grow",
    description: "The modern social platform for developers.",
    siteName: "DevVerse",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevVerse — Where Developers Connect & Grow",
    description: "The modern social platform for developers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fredoka:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--primary)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "14px",
                },
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
