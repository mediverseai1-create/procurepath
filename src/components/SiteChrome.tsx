import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-lg font-semibold ${light ? "text-white" : "text-ink"}`}>
      <span aria-hidden className={`grid h-6 w-6 place-items-center rounded text-xs font-bold ${light ? "bg-white text-brand-deep" : "bg-brand text-white"}`}>P</span>
      ProcurePath
    </Link>
  );
}

export function Header({ dark = false }: { dark?: boolean }) {
  const link = dark ? "text-white/85 hover:text-white" : "text-muted hover:text-ink";
  return (
    <header className={dark ? "hero-bg" : "border-b border-line"}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo light={dark} />
        <nav aria-label="Main" className="flex items-center gap-4 text-sm sm:gap-6">
          <Link href="/#platform" className={`hidden sm:inline ${link}`}>Platform</Link>
          <Link href="/pricing" className={link}>Pricing</Link>
          <Link href="/about" className={`hidden sm:inline ${link}`}>About</Link>
          <Link href="/login" className={link}>Sign in</Link>
          <Link href="/signup" className={dark ? "rounded-[5px] bg-white px-3 py-1.5 font-medium text-brand-deep" : "btn-primary btn-sm"}>Start free</Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted sm:flex-row sm:justify-between">
        <div><Logo /><p className="mt-2 max-w-xs">Intake-to-pay procurement for growing teams.</p></div>
        <div className="flex gap-8">
          <Link href="/pricing">Pricing</Link><Link href="/about">About</Link>
          <Link href="/contact">Contact</Link><Link href="/login">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}
