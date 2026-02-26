"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/ui/PageContainer";
import { FAQ } from "@/components/help/FAQ";

const options = [
  {
    type: "request" as const,
    title: "Return order / Exchange / Refund / Cancel",
    description: "Return a product, exchange for another, request a refund, or cancel an order. Choose your request type in the form.",
    href: "/help/return-refund",
    icon: "↩",
  },
  {
    type: "status" as const,
    title: "Check request status",
    description: "See the latest status of an existing cancel, return, or refund request.",
    href: "/help/status",
    icon: "ⓘ",
  },
];

export default function Home() {
  return (
    <PageContainer>
      <header className="mb-10 sm:mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl"
        >
          How can we help?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mt-2 text-lg text-[var(--muted)]"
        >
          Choose an option below. We’ll get back to you within 24–48 hours.
        </motion.p>
      </header>

      <ul className="space-y-4 sm:space-y-5" role="list">
        {options.map((item, i) => (
          <motion.li
            key={item.type}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 * (i + 1) }}
          >
            <Link
              href={item.href}
              className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6 shadow-[var(--shadow)] transition-all duration-200 hover:border-[var(--accent)] hover:shadow-[var(--shadow-lg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-light)] text-xl text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white"
                aria-hidden
              >
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  {item.title}
                </h2>
                <p className="mt-1 text-[var(--muted)]">
                  {item.description}
                </p>
              </div>
              <span className="shrink-0 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" aria-hidden>
                →
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>

      <FAQ />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-10 text-center text-sm text-[var(--muted)]"
      >
        Need something else?{" "}
        <a
          href="https://www.tiltingheads.com/pages/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--accent)] hover:underline"
        >
          Contact us
        </a>
      </motion.p>
    </PageContainer>
  );
}
