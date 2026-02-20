"use client";

import { useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/ui/PageContainer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5300";

interface StatusResponse {
  id: string;
  reference: string;
  type: string;
  status: string;
  customer_name: string;
  order_number: string;
  created_at: string;
  updated_at: string;
}

export default function StatusPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<StatusResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!orderNumber.trim() || !email.trim()) {
      setError("Please enter both order number and email.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        order_number: orderNumber.trim(),
        email: email.trim(),
      });
      const res = await fetch(`${API_BASE}/api/help-requests/status?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not find a request for those details.");
        return;
      }

      setResult(data as StatusResponse);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
            Check request status
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Enter your order number and email to see the latest status of your help request.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-[var(--error)]/30 bg-red-50 px-4 py-3 text-sm text-[var(--error)]" role="alert">
              {error}
            </div>
          )}
          <Input
            label="Order number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. 1001"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Button type="submit" loading={loading} fullWidth>
            Check status
          </Button>
        </form>

        {result && (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
              <p className="text-sm text-[var(--muted)] mb-1">
                Reference: <span className="font-mono text-[var(--foreground)]">{result.reference}</span>
              </p>
              <p className="text-[var(--foreground)] font-medium">
                {result.type.charAt(0).toUpperCase() + result.type.slice(1)} request for order #{result.order_number}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Status: <span className="font-semibold text-[var(--foreground)]">{result.status}</span>
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Submitted on {new Date(result.created_at).toLocaleString()}
              </p>
            </div>
            {result.status === "rejected" && (
              <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted)]">
                You can submit a new request from the{" "}
                <Link href="/" className="font-medium text-[var(--accent)] hover:underline">
                  help page
                </Link>{" "}
                if you’d like to try again.
              </p>
            )}
            <p className="text-center">
              <Link
                href={`/help/success?id=${result.id}&type=${result.type}&email=${encodeURIComponent(email.trim())}`}
                className="text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Message us about this request →
              </Link>
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

