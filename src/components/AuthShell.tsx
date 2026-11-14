import { Logo } from "@/components/SiteChrome";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hero-bg hidden p-10 text-white md:flex md:flex-col md:justify-between">
        <Logo light />
        <p className="max-w-sm text-2xl font-light">From first request to matched invoice, in one connected path.</p>
      </div>
      <main className="flex items-center px-4 py-12">{children}</main>
    </div>
  );
}
