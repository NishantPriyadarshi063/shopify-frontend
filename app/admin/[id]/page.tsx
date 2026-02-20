"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Chat } from "@/components/chat/Chat";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5300";

interface HelpRequest {
  id: string;
  type: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  order_number: string;
  reason: string | null;
  admin_notes: string | null;
  shopify_order_id?: string | null;
  shopify_shop?: string | null;
  created_at: string;
  updated_at: string;
  attachments?: {
    id: string;
    read_url: string;
    file_name?: string | null;
    content_type?: string | null;
  }[];
}

export default function AdminRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<null | "lookup" | "return" | "cancel" | "refund" | "complete" | "reject">(null);
  const [actionError, setActionError] = useState("");
  const [shopifyAdminUrl, setShopifyAdminUrl] = useState<string | null>(null);

  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundOrderLoading, setRefundOrderLoading] = useState(false);
  const [refundOrderError, setRefundOrderError] = useState("");
  const [refundOrder, setRefundOrder] = useState<{
    order_id: number;
    order_name: string;
    currency: string;
    line_items: Array<{ id: number; title: string; variant_title?: string; quantity: number; price: string }>;
    admin_url: string;
  } | null>(null);
  const [refundQuantities, setRefundQuantities] = useState<Record<number, number>>({});
  const [refundRestockType, setRefundRestockType] = useState<string>("no_restock");
  const [refundNote, setRefundNote] = useState("");
  const [refundAmountManual, setRefundAmountManual] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setToken(localStorage.getItem("admin_token"));
  }, [mounted]);

  useEffect(() => {
    if (token && requestId) {
      fetchRequest();
    }
  }, [token, requestId]);

  const fetchRequest = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/help-requests/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch request");
      const data = await res.json();
      setRequest(data);
      if (data?.shopify_order_id && data?.shopify_shop) {
        setShopifyAdminUrl(`https://${data.shopify_shop}/admin/orders/${data.shopify_order_id}`);
      }
    } catch (e) {
      setError("Failed to load request details");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const callAdminApi = async (path: string, init?: RequestInit) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...(init ?? {}),
      headers: {
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  const lookupShopifyOrder = async () => {
    setActionError("");
    setActionLoading("lookup");
    try {
      const data = await callAdminApi(`/api/help-requests/${requestId}/shopify/lookup`, { method: "POST" });
      if (data?.shopify?.admin_url) setShopifyAdminUrl(data.shopify.admin_url);
      // Refresh request so we have shopify_order_id stored
      await fetchRequest();
    } catch (e: any) {
      setActionError(e.message || "Failed to lookup Shopify order");
    } finally {
      setActionLoading(null);
    }
  };

  const markReturnInitiated = async () => {
    setActionError("");
    setActionLoading("return");
    try {
      await callAdminApi(`/api/help-requests/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "in_progress" }),
      });
      await fetchRequest();
    } catch (e: any) {
      setActionError(e.message || "Failed to mark return");
    } finally {
      setActionLoading(null);
    }
  };

  const cancelInShopify = async () => {
    setActionError("");
    setActionLoading("cancel");
    try {
      const data = await callAdminApi(`/api/help-requests/${requestId}/shopify/cancel`, { method: "POST" });
      if (data?.shopify?.admin_url) setShopifyAdminUrl(data.shopify.admin_url);
      await fetchRequest();
    } catch (e: any) {
      setActionError(e.message || "Failed to cancel in Shopify");
    } finally {
      setActionLoading(null);
    }
  };

  const openRefundModal = async () => {
    setActionError("");
    setRefundModalOpen(true);
    setRefundOrder(null);
    setRefundOrderError("");
    setRefundQuantities({});
    setRefundNote("");
    setRefundAmountManual("");
    setRefundOrderLoading(true);
    try {
      const data = await callAdminApi(`/api/help-requests/${requestId}/shopify/order`);
      setRefundOrder(data);
      const qty: Record<number, number> = {};
      (data.line_items || []).forEach((li: { id: number }) => {
        qty[li.id] = 0;
      });
      setRefundQuantities(qty);
      if (data.admin_url) setShopifyAdminUrl(data.admin_url);
    } catch (e: any) {
      setRefundOrderError(e.message || "Could not load order. Fetch Shopify order first.");
    } finally {
      setRefundOrderLoading(false);
    }
  };

  const submitRefund = async () => {
    if (!refundOrder) return;
    const refundLineItems = refundOrder.line_items
      .map((li) => ({ lineItemId: li.id, quantity: refundQuantities[li.id] ?? 0 }))
      .filter((x) => x.quantity > 0);
    if (refundLineItems.length === 0) {
      setActionError("Select at least one item to refund.");
      return;
    }
    setActionError("");
    setActionLoading("refund");
    try {
      const manualAmount =
        refundAmountManual.trim() !== ""
          ? parseFloat(refundAmountManual.trim())
          : undefined;
      const data = await callAdminApi(`/api/help-requests/${requestId}/shopify/refund`, {
        method: "POST",
        body: JSON.stringify({
          refundLineItems,
          restockType: refundRestockType,
          note: refundNote || undefined,
          ...(manualAmount != null && !Number.isNaN(manualAmount) && manualAmount > 0
            ? { refundAmount: manualAmount }
            : {}),
        }),
      });
      if (data?.shopify?.admin_url) setShopifyAdminUrl(data.shopify.admin_url);
      setRefundModalOpen(false);
      await fetchRequest();
    } catch (e: any) {
      setActionError(e.message || "Failed to refund in Shopify");
    } finally {
      setActionLoading(null);
    }
  };

  const markCompleted = async () => {
    setActionError("");
    setActionLoading("complete");
    try {
      await callAdminApi(`/api/help-requests/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      await fetchRequest();
    } catch (e: any) {
      setActionError(e.message || "Failed to mark completed");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectRequest = async () => {
    setActionError("");
    setActionLoading("reject");
    try {
      await callAdminApi(`/api/help-requests/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "rejected" }),
      });
      await fetchRequest();
    } catch (e: any) {
      setActionError(e.message || "Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  if (!mounted || !token) {
    return (
      <PageContainer>
        <div className="mx-auto max-w-sm">
          <p className="text-[var(--muted)]">Loading...</p>
        </div>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <p className="text-[var(--muted)]">Loading request details...</p>
      </PageContainer>
    );
  }

  if (error || !request) {
    return (
      <PageContainer>
        <div className="mx-auto max-w-sm">
          <p className="text-[var(--error)]">{error || "Request not found"}</p>
          <Link href="/admin" className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline">
            ← Back to admin
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-base text-[var(--muted)] hover:text-[var(--foreground)]">
              ← Back to admin
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">Request Details</h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Request Info */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
              <h2 className="mb-4 text-xl font-semibold text-[var(--foreground)]">Request Information</h2>

              {/* Actions */}
              <div className="mb-5 space-y-3">
                {actionError && (
                  <div className="rounded-lg border border-[var(--error)]/30 bg-red-50 px-3 py-2 text-sm text-[var(--error)]" role="alert">
                    {actionError}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={lookupShopifyOrder}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === "lookup" ? "Looking up…" : "Fetch Shopify order"}
                  </Button>
                  {shopifyAdminUrl && (
                    <a
                      href={shopifyAdminUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center justify-center rounded-xl border-2 border-[var(--border)] bg-[var(--card)] px-4 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)]"
                    >
                      Open in Shopify
                    </a>
                  )}

                  {/* Shopify-like flow */}
                  {request.type === "return" && request.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={markReturnInitiated}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === "return" ? "Updating…" : "Return"}
                    </Button>
                  )}

                  {/* Refund button appears AFTER Return is initiated, like Shopify */}
                  {request.status !== "completed" && request.status !== "rejected" &&
                    (request.type === "refund" ||
                      (request.type === "return" && (request.status === "in_progress" || request.status === "approved"))) && (
                    <Button
                      size="sm"
                      onClick={openRefundModal}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === "refund" ? "Refunding…" : "Refund"}
                    </Button>
                  )}

                  {request.type === "cancel" && request.status !== "completed" && request.status !== "rejected" && (
                    <Button
                      size="sm"
                      onClick={cancelInShopify}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === "cancel" ? "Cancelling…" : "Cancel order"}
                    </Button>
                  )}

                  {request.status !== "completed" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={markCompleted}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === "complete" ? "Updating…" : "Mark completed"}
                    </Button>
                  )}
                  {request.status !== "rejected" && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={rejectRequest}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === "reject" ? "Updating…" : "Reject"}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Return only updates this request’s status (nothing is sent to Shopify yet). Click Refund to process the refund in Shopify. Cancel order only works for unfulfilled orders. “Fetch Shopify order” finds the order from the order number.
                </p>
              </div>

              <dl className="space-y-3">
                <div>
                  <dt className="text-base font-medium text-[var(--muted)]">Type</dt>
                  <dd className="mt-1 text-base text-[var(--foreground)] capitalize">{request.type}</dd>
                </div>
                <div>
                  <dt className="text-base font-medium text-[var(--muted)]">Status</dt>
                  <dd className="mt-1">
                    <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)]">
                      {request.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-base font-medium text-[var(--muted)]">Order Number</dt>
                  <dd className="mt-1 font-mono text-base text-[var(--foreground)]">#{request.order_number}</dd>
                </div>
                <div>
                  <dt className="text-base font-medium text-[var(--muted)]">Customer Name</dt>
                  <dd className="mt-1 text-base text-[var(--foreground)]">{request.customer_name}</dd>
                </div>
                <div>
                  <dt className="text-base font-medium text-[var(--muted)]">Customer Email</dt>
                  <dd className="mt-1 text-base text-[var(--foreground)] break-all">{request.customer_email}</dd>
                </div>
                {request.customer_phone && (
                  <div>
                    <dt className="text-base font-medium text-[var(--muted)]">Customer Phone</dt>
                    <dd className="mt-1 text-base text-[var(--foreground)]">{request.customer_phone}</dd>
                  </div>
                )}
                {request.reason && (
                  <div>
                    <dt className="text-base font-medium text-[var(--muted)]">Reason</dt>
                    <dd className="mt-1 text-base text-[var(--foreground)] whitespace-pre-wrap">{request.reason}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-base font-medium text-[var(--muted)]">Created</dt>
                  <dd className="mt-1 text-base text-[var(--foreground)]">
                    {new Date(request.created_at).toLocaleString()}
                  </dd>
                </div>
                {request.attachments && request.attachments.length > 0 && (
                  <div>
                    <dt className="text-base font-medium text-[var(--muted)]">Attachments</dt>
                    <dd className="mt-2 flex flex-wrap gap-3">
                      {request.attachments.map((a) => (
                        <a
                          key={a.id}
                          href={a.read_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block h-24 w-24 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]"
                        >
                          <img
                            src={a.read_url}
                            alt={a.file_name || "Attachment"}
                            className="h-24 w-24 object-cover transition-transform group-hover:scale-105"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                              const parent = (e.currentTarget as HTMLImageElement).parentElement;
                              const fallback = parent?.querySelector("[data-fallback]") as HTMLElement | null;
                              fallback?.classList.remove("hidden");
                              fallback?.classList.add("flex");
                            }}
                          />
                          <div
                            data-fallback
                            className="absolute inset-0 hidden items-center justify-center p-2 text-center text-xs text-[var(--muted)]"
                          >
                            {a.file_name || "Attachment"}
                          </div>
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Chat */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Chat</h2>
            <Chat requestId={requestId} adminToken={token} />
          </div>
        </div>
      </div>

      {/* Refund modal: select items and quantities */}
      {refundModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setRefundModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="refund-modal-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
            <h2 id="refund-modal-title" className="mb-4 text-xl font-semibold text-[var(--foreground)]">
              Refund in Shopify
            </h2>
            {refundOrderLoading && (
              <p className="text-[var(--muted)]">Loading order…</p>
            )}
            {refundOrderError && !refundOrderLoading && (
              <div className="mb-4 rounded-lg border border-[var(--error)]/30 bg-red-50 px-3 py-2 text-sm text-[var(--error)]">
                {refundOrderError}
              </div>
            )}
            {refundOrder && !refundOrderLoading && (
              <>
                <p className="mb-3 text-sm text-[var(--muted)]">
                  Select quantity to refund per item. Leave at 0 to exclude.
                </p>
                <div className="space-y-4">
                  {refundOrder.line_items.map((li) => (
                    <div
                      key={li.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[var(--foreground)]">{li.title}</p>
                        {li.variant_title && (
                          <p className="text-sm text-[var(--muted)]">{li.variant_title}</p>
                        )}
                        <p className="text-sm text-[var(--muted)]">
                          {refundOrder.currency} {li.price} × {li.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label htmlFor={`refund-qty-${li.id}`} className="text-sm text-[var(--muted)]">
                          Refund:
                        </label>
                        <input
                          id={`refund-qty-${li.id}`}
                          type="number"
                          min={0}
                          max={li.quantity}
                          value={refundQuantities[li.id] ?? 0}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (!Number.isNaN(v))
                              setRefundQuantities((prev) => ({ ...prev, [li.id]: Math.max(0, Math.min(li.quantity, v)) }));
                          }}
                          className="w-16 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-[var(--foreground)]"
                        />
                        <span className="text-sm text-[var(--muted)]">/ {li.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <label htmlFor="refund-restock" className="mb-1 block text-sm font-medium text-[var(--muted)]">
                    Restock items
                  </label>
                  <select
                    id="refund-restock"
                    value={refundRestockType}
                    onChange={(e) => setRefundRestockType(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)]"
                  >
                    <option value="no_restock">Do not restock</option>
                    <option value="return">Return</option>
                    <option value="cancel">Cancel</option>
                  </select>
                </div>
                <div className="mt-3">
                  <label htmlFor="refund-note" className="mb-1 block text-sm font-medium text-[var(--muted)]">
                    Reason for refund (optional)
                  </label>
                  <textarea
                    id="refund-note"
                    value={refundNote}
                    onChange={(e) => setRefundNote(e.target.value)}
                    placeholder="Only you and other staff can see this."
                    rows={2}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
                  />
                </div>
                {(() => {
                  const suggestedTotal = refundOrder.line_items.reduce(
                    (sum, li) => sum + parseFloat(li.price) * (refundQuantities[li.id] ?? 0),
                    0
                  );
                  return (
                    <>
                      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                        <p className="text-sm text-[var(--muted)]">
                          Suggested total:{" "}
                          <span className="font-semibold text-[var(--foreground)]">
                            {refundOrder.currency} {suggestedTotal.toFixed(2)}
                          </span>
                        </p>
                      </div>
                      <div className="mt-3">
                        <label htmlFor="refund-amount-manual" className="mb-1 block text-sm font-medium text-[var(--muted)]">
                          Refund amount (optional)
                        </label>
                        <input
                          id="refund-amount-manual"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder={suggestedTotal.toFixed(2)}
                          value={refundAmountManual}
                          onChange={(e) => setRefundAmountManual(e.target.value)}
                          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)]"
                        />
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          Leave empty to use suggested total. Enter a number to refund a specific amount (e.g. 42.00).
                        </p>
                        {refundAmountManual.trim() !== "" &&
                          !Number.isNaN(parseFloat(refundAmountManual)) &&
                          Math.abs(parseFloat(refundAmountManual) - suggestedTotal) > 0.01 && (
                            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                              The amount you’re refunding is different from the suggested total.
                            </p>
                          )}
                      </div>
                      <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                        <p className="text-sm text-[var(--muted)]">
                          Refund total:{" "}
                          <span className="font-semibold text-[var(--foreground)]">
                            {refundOrder.currency}{" "}
                            {refundAmountManual.trim() !== "" &&
                            !Number.isNaN(parseFloat(refundAmountManual)) &&
                            parseFloat(refundAmountManual) > 0
                              ? parseFloat(refundAmountManual).toFixed(2)
                              : suggestedTotal.toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </>
                  );
                })()}
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setRefundModalOpen(false)} disabled={actionLoading !== null}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={submitRefund}
                    disabled={actionLoading !== null || refundOrder.line_items.every((li) => (refundQuantities[li.id] ?? 0) === 0)}
                  >
                    {actionLoading === "refund" ? "Refunding…" : "Refund"}
                  </Button>
                </div>
              </>
            )}
            {!refundOrder && !refundOrderLoading && !refundOrderError && (
              <div className="flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => setRefundModalOpen(false)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
