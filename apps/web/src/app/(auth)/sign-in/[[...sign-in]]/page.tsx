"use client";

import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/ui/modern-login-signup";
import { useEffect, useState } from "react";

// Reads the returning-user name stored by the sign-up flow.
// Returns null on first-ever visit (new users) or if the value was never set.
function useReturningUser(): string | null {
  const [name] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("devverse_user_name");
    } catch {
      return null;
    }
  });

  return name;
}

export default function SignInPage() {
  const returningUserName = useReturningUser();

  return (
    <AuthShell mode="login" returningUserName={returningUserName}>
      <SignIn
        appearance={{
          elements: {
            rootBox: {
              width: "100%",
              margin: "0 auto",
            },
            card: {
              background: "transparent",
              border: "none",
              boxShadow: "none",
              backdropFilter: "none",
              width: "100%",
            },
            headerTitle: {
              color: "white",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            },
            headerSubtitle: {
              color: "rgba(255,255,255,0.6)",
            },
            socialButtonsBlockButton: {
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              color: "white",
              fontWeight: 500,
              backdropFilter: "blur(8px)",
            },
            socialButtonsBlockButtonText: {
              color: "white",
            },
            dividerLine: {
              background: "rgba(255,255,255,0.1)",
            },
            dividerText: {
              color: "rgba(255,255,255,0.4)",
            },
            formFieldLabel: {
              color: "rgba(255,255,255,0.8)",
              fontWeight: 500,
            },
            formFieldInput: {
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px",
              color: "white",
            },
            formButtonPrimary: {
              background: "linear-gradient(135deg, #3b82f6, #7c3aed)",
              borderRadius: "10px",
              fontWeight: 600,
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
            },
            footerActionLink: {
              color: "#818cf8",
            },
            footerActionText: {
              color: "rgba(255,255,255,0.5)",
            },
            identityPreviewText: { color: "white" },
            identityPreviewEditButtonIcon: { color: "white" },
          },
        }}
      />
    </AuthShell>
  );
}
