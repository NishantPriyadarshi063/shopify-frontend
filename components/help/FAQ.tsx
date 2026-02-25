"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ_ITEMS = [
  {
    q: "How long do refunds take?",
    a: "Once we approve your refund request, we process it within 3–5 business days. The money may take a few more days to appear in your account depending on your bank or payment provider.",
  },
  {
    q: "How do I check my request status?",
    a: "Use “Check request status” on this page and enter your order number and the email you used when placing the order. You can also use the link we sent you in the confirmation email.",
  },
  {
    q: "Can I cancel my order after it has shipped?",
    a: "Cancellation is for orders that haven’t shipped yet. If your order has already shipped, you can request a return or refund using the options above and we’ll guide you through the process.",
  },
  {
    q: "Do I need to add photos for a return or refund?",
    a: "Photos aren’t required but they help us process returns and refunds faster, especially for damaged or incorrect items. You can add up to 5 images when submitting your request.",
  },
  {
    q: "Can I exchange an item for a different one?",
    a: "Yes. Choose “Return order” or “Request refund”, fill the form, and in the reason field mention which item you want to return and which product you’d like instead. We’ll refund that item and arrange the new product with you (e.g. payment link, QR, or cash on delivery) via email or phone.",
  },
  {
    q: "I have more than one issue with my order. What should I do?",
    a: "Submit one request and describe all issues in the reason field. If you need both a return and a refund, choose the option that fits best and add details in your message. Our team will handle it.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mt-16 border-t border-[var(--border)] pt-12" aria-label="Frequently asked questions">
      <h2 className="text-xl font-bold text-[var(--foreground)] sm:text-2xl">
        Frequently asked questions
      </h2>
      <ul className="mt-6 space-y-2" role="list">
        {FAQ_ITEMS.map((item, i) => (
          <li
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
              aria-expanded={openIndex === i}
              aria-controls={`faq-answer-${i}`}
              id={`faq-question-${i}`}
            >
              <span className="font-medium">{item.q}</span>
              <span className="shrink-0 text-[var(--muted)]" aria-hidden>
                {openIndex === i ? "−" : "+"}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {openIndex === i && (
                <motion.div
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-labelledby={`faq-question-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-4 pt-0 text-sm text-[var(--muted)] leading-relaxed">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </section>
  );
}
