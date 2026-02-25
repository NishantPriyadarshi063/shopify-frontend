"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { getApiBase } from "@/lib/api";

interface HelpRequest {
  id: string;
  type: string;
  status: string;
  customer_name: string;
  customer_email: string;
  order_number: string;
  created_at: string;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setToken(localStorage.getItem("admin_token"));
  }, [mounted]);

  useEffect(() => {
    if (token) fetchRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filterType, filterStatus, searchQuery]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Login failed");
        return;
      }
      localStorage.setItem("admin_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("admin_refresh_token", data.refresh_token);
      }
      setToken(data.access_token);
    } catch {
      setLoginError("Could not reach server. Is the backend running?");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("admin_refresh_token");
    
    // Call backend to revoke refresh token (best effort, don't block on failure)
    if (refreshToken) {
      try {
        await fetch(`${getApiBase()}/api/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch {
        // Ignore errors - still clear local storage
      }
    }
    
    // Clear tokens from localStorage
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
    setToken(null);
    setRequests([]);
  };

  const fetchRequests = async () => {
    const t = localStorage.getItem("admin_token");
    if (!t) return;
    setLoadingRequests(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.set("type", filterType);
      if (filterStatus) params.set("status", filterStatus);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      const qs = params.toString();
      const res = await fetch(`${getApiBase()}/api/help-requests${qs ? `?${qs}` : ""}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  if (!mounted || token === null) {
    return (
      <PageContainer>
        <div className="mx-auto max-w-sm">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Admin</h1>
          <p className="mt-1 text-[var(--muted)]">Log in to view help requests.</p>
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            {loginError && (
              <p className="text-sm text-[var(--error)]" role="alert">{loginError}</p>
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" loading={loginLoading} fullWidth>
              Log in
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            <Link href="/" className="hover:text-[var(--foreground)]">← Back to help</Link>
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Admin</h1>
            <p className="mt-1 text-base text-[var(--muted)]">View and manage help requests.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={fetchRequests} disabled={loadingRequests}>
              {loadingRequests ? "Loading…" : "Refresh list"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            Search:
            <input
              type="text"
              placeholder="Order # or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), setSearchQuery(searchInput.trim()))}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--foreground)] w-40 sm:w-48"
            />
            <Button variant="secondary" size="sm" onClick={() => setSearchQuery(searchInput.trim())}>
              Search
            </Button>
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            Type:
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--foreground)]"
            >
              <option value="">All</option>
              <option value="cancel">Cancel</option>
              <option value="return">Return</option>
              <option value="refund">Refund</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            Status:
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--foreground)]"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>

        {requests.length === 0 && !loadingRequests && (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-[var(--muted)]">
            No requests yet. Click “Refresh list” after customers submit from the help page.
          </p>
        )}

        {requests.length > 0 && (
          <ul className="space-y-3">
            {requests.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)] transition-all hover:shadow-[var(--shadow-lg)]"
              >
                <Link href={`/admin/${r.id}`} className="block">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-base font-semibold text-[var(--foreground)]">{r.customer_name}</span>
                      <span className="mx-2 text-[var(--muted)]">·</span>
                      <span className="text-base text-[var(--muted)]">Order #{r.order_number}</span>
                    </div>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
                      {r.type} · {r.status}
                    </span>
                  </div>
                  <p className="mt-1 text-base text-[var(--muted)]">{r.customer_email}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="text-center text-sm text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--foreground)]">← Back to help</Link>
        </p>
      </div>
    </PageContainer>
  );
}
