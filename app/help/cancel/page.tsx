"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/ui/PageContainer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { checkOrder, createHelpRequest } from "@/lib/api";

export default function CancelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    order_number: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { has_open_request } = await checkOrder(form.order_number);
      if (has_open_request) {
        setError("This order already has an open request. Please wait for it to be processed or contact support.");
        setLoading(false);
        return;
      }
      const req = await createHelpRequest({
        type: "cancel",
        customer_email: form.customer_email.trim(),
        customer_name: form.customer_name.trim(),
        order_number: form.order_number.replace(/^#/, "").trim(),
        customer_phone: form.customer_phone.trim() || undefined,
        reason: form.reason.trim() || undefined,
      });
      router.push(`/help/success?id=${req.id}&type=cancel&email=${encodeURIComponent(form.customer_email.trim())}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: "Help", href: "/" },
          { label: "Cancel order" },
        ]}
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
          Cancel order
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          We’ll process your cancellation as soon as possible.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div
              className="rounded-xl border border-[var(--error)]/30 bg-red-50 px-4 py-3 text-sm text-[var(--error)]"
              role="alert"
            >
              {error}
            </div>
          )}
          <Input
            label="Order number"
            placeholder="e.g. 1001 or #1001"
            value={form.order_number}
            onChange={(e) => setForm((p) => ({ ...p, order_number: e.target.value }))}
            required
          />
          <Input
            label="Full name"
            placeholder="As on order"
            value={form.customer_name}
            onChange={(e) => setForm((p) => ({ ...p, customer_name: e.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="Email used for the order"
            value={form.customer_email}
            onChange={(e) => setForm((p) => ({ ...p, customer_email: e.target.value }))}
            required
          />
          <Input
            label="Phone (optional)"
            type="tel"
            placeholder="For faster follow-up"
            value={form.customer_phone}
            onChange={(e) => setForm((p) => ({ ...p, customer_phone: e.target.value }))}
          />
          <Textarea
            label="Reason (optional)"
            placeholder="Why do you want to cancel?"
            value={form.reason}
            onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            rows={4}
          />
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <Button type="submit" loading={loading} fullWidth size="lg">
              Submit request
            </Button>
            <Link
              href="/"
              className="text-center text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Back to help options
            </Link>
          </div>
        </form>
      </motion.div>
    </PageContainer>
  );
}
