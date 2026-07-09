import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/ui/gaming-login";

export default function SignInPage() {
  return (
    <AuthShell mode="login" videoUrl="/auth-bg.mp4">
      <SignIn
        appearance={{
        elements: {
            rootBox: {
              width: "100%",
            },
            card: {
              background: "rgba(0,0,0,0)",
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
