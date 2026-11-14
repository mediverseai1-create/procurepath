import AuthShell from "@/components/AuthShell";
import AuthForm from "@/components/AuthForm";

const errors: Record<string, string> = {
  link: "That link is invalid or has expired. Request a new one.",
  config: "The app is not connected to Supabase yet. Set the environment variables.",
  noorg: "Your account has no workspace. Contact support.",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthShell><AuthForm mode="login" initialError={error ? errors[error] : undefined} /></AuthShell>;
}
