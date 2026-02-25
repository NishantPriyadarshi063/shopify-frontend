"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/ui/PageContainer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

const choices = [
  {
    title: "Return order",
    description: "Return a product. Add a photo so we can check the condition.",
    href: "/help/return",
    icon: "↩",
  },
  {
    title: "Request refund",
    description: "Request a refund. Share details and optional photos if needed.",
    href: "/help/refund",
    icon: "₹",
  },
];

export default function ReturnRefundChoicePage() {
  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { href: "/", label: "Help" },
          { label: "Return order / Request refund" },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
          Return order / Request refund
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Choose what you need below.
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Want to <strong className="text-[var(--foreground)]">exchange</strong> an item? Choose Return or Refund and in the reason field mention which item you’re returning and what you’d like instead. We’ll process the return/refund and arrange the new item with you (e.g. via payment link or COD).
        </p>
      </motion.div>

      <ul className="space-y-4" role="list">
        {choices.map((item, i) => (
          <motion.li
            key={item.href}
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
    </PageContainer>
  );
}
