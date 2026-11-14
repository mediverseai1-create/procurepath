import Link from "next/link";

const S = "M18.6 6.2C18.2 5 17 4.4 15.4 4.4c-1.9 0-3.1.9-3.1 2.2 0 1.4 1.3 1.8 3.1 2 1.8.2 3.1.6 3.1 2 0 1.3-1.2 2.2-3.1 2.2-1.6 0-2.8-.6-3.2-1.8";

export function LogoMark({ light = false, size = 28 }: { light?: boolean; size?: number }) {
  const stroke = light ? "#0b1670" : "#fff";
  const accent = light ? "#2b45d8" : "#7dd3fc";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={light ? "lg-l" : "lg-d"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3d5af1" />
          <stop offset="1" stopColor="#0b1670" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={light ? "#fff" : `url(#lg-d)`} />
      <g fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d={S} transform="translate(0 .6)" />
        <path d={S} transform="translate(0 12.4)" />
      </g>
      <path d="M22.5 22.5l4.2-4.2m0 0h-3.2m3.2 0v3.2" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
          <Link href="/pricing">Pricing</Link>
          <Link href="/about">Company</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/signup">Sign up</Link>
        </nav>
      </div>
    </footer>
  );
}
