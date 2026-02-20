"use client";

// Policy URLs from env (NEXT_PUBLIC_* for client). Fallback to placeholder.
const BASE = typeof process.env.NEXT_PUBLIC_STORE_URL !== "undefined"
  ? process.env.NEXT_PUBLIC_STORE_URL
  : "https://www.tiltingheads.com";

const POLICY_LINKS = [
  { label: "Return Policy", href: process.env.NEXT_PUBLIC_RETURN_POLICY_URL || `${BASE}/policies/refund-policy` },
  { label: "Refund Policy", href: process.env.NEXT_PUBLIC_REFUND_POLICY_URL || `${BASE}/policies/refund-policy` },
  { label: "Privacy Policy", href: process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || `${BASE}/policies/privacy-policy` },
  { label: "Contact", href: process.env.NEXT_PUBLIC_CONTACT_URL || `${BASE}/pages/contact` },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--card)]/50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          {POLICY_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} Tilting Heads. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
