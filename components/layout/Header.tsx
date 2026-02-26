"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const LOGO_SRC = "/assets/th logo-01.jpg";
const SHOP_URL = "https://www.tiltingheads.com/";

export function Header() {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--card)]/80">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 rounded"
        >
          <Image
            src={LOGO_SRC}
            alt="Tilting Heads"
            width={200}
            height={80}
            className="h-12 w-auto object-contain logo-invert sm:h-14"
            priority
          />
        </Link>
        <nav className="ml-auto flex items-center gap-3">
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
