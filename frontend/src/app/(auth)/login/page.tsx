import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="Sign in"
      subtitle="Pick up right where your queue left off."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-ink underline hover:no-underline">
            Create one
          </a>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
