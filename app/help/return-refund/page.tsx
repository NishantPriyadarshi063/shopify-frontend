"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/ui/PageContainer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FileCollector } from "@/components/help/FileCollector";
import { checkOrder, createHelpRequest, getUploadUrl, uploadFileToUrl } from "@/lib/api";
import type { HelpRequestType } from "@/lib/api";

const QUERY_TYPES: { value: HelpRequestType; label: string }[] = [
  { value: "return", label: "Return order" },
  { value: "exchange", label: "Exchange" },
  { value: "refund", label: "Refund" },
  { value: "cancel", label: "Cancel order" },
];

export default function ReturnExchangeRefundPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const initialType = useMemo(() => {
    const t = QUERY_TYPES.find((q) => q.value === typeParam);
    return t ? t.value : "return";
  }, [typeParam]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    query_type: initialType as HelpRequestType,
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
        type: form.query_type,
        customer_email: form.customer_email.trim(),
        customer_name: form.customer_name.trim(),
        order_number: form.order_number.replace(/^#/, "").trim(),
        customer_phone: form.customer_phone.trim() || undefined,
        reason: form.reason.trim() || undefined,
      });
      for (const file of files) {
        const { upload_url } = await getUploadUrl(req.id, {
          name: file.name,
          type: file.type,
          size: file.size,
        });
        await uploadFileToUrl(upload_url, file);
      }
      router.push(
        `/help/success?id=${req.id}&type=${form.query_type}&email=${encodeURIComponent(form.customer_email.trim())}`
      );
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
          { href: "/", label: "Help" },
          { label: "Return order / Exchange / Refund / Cancel" },
        ]}
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
          Return order / Exchange / Refund / Cancel
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Choose your request type below and fill in the details. Add photos when needed for return, exchange, or refund.
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

          <div>
            <label htmlFor="query_type" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              Request type
            </label>
            <select
              id="query_type"
              required
              value={form.query_type}
              onChange={(e) => setForm((p) => ({ ...p, query_type: e.target.value as HelpRequestType }))}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            >
              {QUERY_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

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
            placeholder={
              form.query_type === "exchange"
                ? "Which item you’re returning and what you’d like instead."
                : "Why are you returning or requesting a refund? Product condition, wrong item, etc."
            }
            value={form.reason}
            onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            rows={4}
          />
          <FileCollector files={files} onFilesChange={setFiles} />
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
