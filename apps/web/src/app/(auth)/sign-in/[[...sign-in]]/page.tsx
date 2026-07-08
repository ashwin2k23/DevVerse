import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
      }}
      className="hero-gradient"
    >
      <SignIn
        appearance={{
          elements: {
            rootBox: { fontFamily: "Inter, sans-serif" },
            card: {
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-xl)",
              background: "var(--surface)",
            },
            headerTitle: { fontWeight: 700, letterSpacing: "-0.02em" },
            socialButtonsBlockButton: {
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              fontWeight: 500,
            },
            formButtonPrimary: {
              background: "var(--accent)",
              borderRadius: "var(--radius)",
              fontWeight: 600,
            },
          },
        }}
      />
    </div>
  );
}
