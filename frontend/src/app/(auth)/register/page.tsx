import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="GET STARTED"
      title="Create your account"
      subtitle="Set up SocialPilot for your team or your clients."
      footer={
        <>
          Already have an account?{" "}
          <a href="/login" className="text-ink underline hover:no-underline">
            Sign in
          </a>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
