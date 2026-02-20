"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const LOGO_SRC = "/assets/th logo-01.png";
const SHOP_URL = "https://www.tiltingheads.com/";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--card)]/80">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 rounded"
        >
          <Image
            src={LOGO_SRC}
            alt="Tilting Heads"
            width={120}
            height={40}
            className="h-8 w-auto object-contain logo-invert"
            priority
          />
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors hidden sm:inline"
          >
            Admin
          </Link>
          <ThemeToggle />
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          >
            Buy Product
          </a>
        </nav>
      </div>
    </header>
  );
}
