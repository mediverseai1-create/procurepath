import AuthShell from "@/components/AuthShell";
import AuthForm from "@/components/AuthForm";

const errors: Record<string, string> = {
  link: "That link is invalid or has expired. Request a new one.",
  config: "Sign-in is temporarily unavailable. Please try again shortly.",
  noorg: "Your account is not linked to a company. Sign up again or contact your administrator.",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthShell><AuthForm mode="login" initialError={error ? errors[error] : undefined} /></AuthShell>;
}
