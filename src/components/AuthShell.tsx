import { Logo } from "@/components/SiteChrome";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hero-bg hidden p-10 text-white md:flex md:flex-col md:justify-between">
        <Logo light />
        <p className="max-w-sm text-2xl font-light">AI that analyzes every request, vendor and invoice, so your team controls spend before it happens.</p>
      </div>
      <div className="flex flex-col px-4 py-6">
        <div className="mb-8 md:hidden"><Logo /></div>
        <main className="flex flex-1 items-center">{children}</main>
      </div>
    </div>
  );
}
