import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.08),_transparent_50%)]" />
      <div className="relative z-10">
        <SignUp
          forceRedirectUrl="/onboarding"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card border border-border shadow-xl shadow-black/20",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton:
                "bg-secondary border-border text-foreground hover:bg-accent",
              socialButtonsBlockButtonText: "text-foreground font-medium",
              formFieldLabel: "text-foreground",
              formFieldInput:
                "bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:ring-primary",
              footerActionLink: "text-primary hover:text-primary/80",
              formButtonPrimary:
                "bg-primary text-primary-foreground hover:bg-primary/80",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground",
              identityPreviewText: "text-foreground",
              identityPreviewEditButton: "text-primary",
              formFieldAction: "text-primary",
              alert: "bg-destructive/10 text-destructive border-destructive/20",
            },
          }}
        />
      </div>
    </div>
  );
}
