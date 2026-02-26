"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/ui/PageContainer";
import { Chat } from "@/components/chat/Chat";

const typeLabels: Record<string, string> = {
  cancel: "Cancel order",
  return: "Return order",
  exchange: "Exchange",
  refund: "Refund",
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const type = searchParams.get("type") || "request";
  const email = searchParams.get("email");

  return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-light)] text-4xl text-[var(--accent)]"
          aria-hidden
        >
          ✓
        </motion.div>
        <h1 className="mt-6 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
          Request received
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Your {typeLabels[type] || type} request has been submitted. We’ll get back to you soon.
        </p>
        {id && (
          <p className="mt-2 text-sm text-[var(--muted)]">
            Reference: <span className="font-mono text-[var(--foreground)]">{id.slice(0, 8)}…</span>
          </p>
        )}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-8 text-lg font-semibold text-white shadow-sm transition-all hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          >
            Back to help
          </Link>
          <Link
            href="https://www.tiltingheads.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-[var(--border)] bg-[var(--card)] px-8 text-lg font-semibold text-[var(--foreground)] transition-all hover:border-[var(--accent)] hover:bg-[var(--border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          >
            Continue shopping
          </Link>
        </div>
        {id && email && (
          <div className="mt-12 w-full max-w-2xl">
            <h2 className="mb-4 text-xl font-semibold text-[var(--foreground)]">
              Chat with support
            </h2>
            <Chat requestId={id} customerEmail={email} />
          </div>
        )}
      </motion.div>
  );
}

export default function SuccessPage() {
  return (
    <PageContainer className="flex flex-col items-center justify-center text-center">
      <Suspense fallback={<div className="text-[var(--muted)]">Loading…</div>}>
        <SuccessContent />
      </Suspense>
    </PageContainer>
  );
}
