import Link from "next/link";

export function LogoMark({ light = false, size = 28 }: { light?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path fill={light ? "#fff" : "#2b45d8"} d="M4 4h22L4 26z" />
      <path fill={light ? "#8ea2ff" : "#0b1670"} d="M28 6v22H6z" />
      <path fill={light ? "#0b1670" : "#fff"} fillRule="evenodd" transform="translate(-.9 0)" d="M11 8h7a4.75 4.75 0 0 1 0 9.5h-3.5V24H11zM14.5 11.25v3h3.25a1.5 1.5 0 0 0 0-3z" />
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
