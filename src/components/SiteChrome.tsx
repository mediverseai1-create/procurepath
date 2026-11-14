import Link from "next/link";

export function LogoMark({ light = false, size = 28 }: { light?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="6" fill={light ? "#fff" : "#2b45d8"} />
      <path
        fill={light ? "#0b1670" : "#fff"}
        fillRule="evenodd"
        d="M9 7h6.5a5.5 5.5 0 0 1 0 11H13v7H9zM13 11v3.5h2.5a1.75 1.75 0 0 0 0-3.5z"
      />
    </svg>
  );
}


export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" aria-label="ProcurePath home" className={`flex items-center gap-2 text-lg font-semibold tracking-tight ${light ? "text-white" : "text-ink"}`}>
      <LogoMark light={light} />
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
          <Link href="/about" className={`hidden sm:inline ${link}`}>Company</Link>
          <Link href="/login" className={link}>Sign in</Link>
          <Link href="/signup" className={dark ? "rounded-[5px] bg-white px-3 py-1.5 font-medium text-brand-deep" : "btn-primary btn-sm"}>Sign up</Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:flex-row sm:justify-between">
        <div>
          <Logo />
          <p className="mt-2 max-w-xs">The AI-native procurement platform for finance and operations teams.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2">
          <Link href="/#platform">Platform</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/about">Company</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/signup">Sign up</Link>
        </nav>
      </div>
    </footer>
  );
}
