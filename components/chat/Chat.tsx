"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5300";

interface ChatMessage {
  id: string;
  request_id: string;
  sender: "customer" | "admin";
  sender_id: string | null;
  body: string | null;
  attachment_blob_url: string | null;
  attachment_file_name: string | null;
  attachment_content_type: string | null;
  created_at: string;
}

interface ChatProps {
  requestId: string;
  customerEmail?: string;
  adminToken?: string;
  onNewMessage?: () => void;
}

export function Chat({ requestId, customerEmail, adminToken, onNewMessage }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const isAdmin = !!adminToken;
  const isCustomer = !!customerEmail;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch initial messages
  useEffect(() => {
    fetchMessages();
  }, [requestId, customerEmail, adminToken]);

  // Set up SSE for real-time updates
  useEffect(() => {
    if (!requestId) return;

    const params = new URLSearchParams();
    if (isCustomer) params.set("email", customerEmail!);
    if (isAdmin && adminToken) params.set("token", adminToken);
    const url = `${API_BASE}/api/chat/${requestId}/stream?${params.toString()}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const newMsg = JSON.parse(event.data) as ChatMessage;
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        onNewMessage?.();
      } catch (e) {
        console.error("Failed to parse SSE message:", e);
      }
    };

    eventSource.onerror = () => {
      // SSE connection closed or error - will reconnect automatically
      eventSource.close();
    };

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
    };
  }, [requestId, customerEmail, adminToken, isCustomer, onNewMessage]);

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const url = `${API_BASE}/api/chat/${requestId}/messages${isCustomer ? `?email=${encodeURIComponent(customerEmail!)}` : ""}`;
      const headers: HeadersInit = {};
      if (adminToken) {
        headers.Authorization = `Bearer ${adminToken}`;
      }
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load messages. Please refresh.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setError("");
    try {
      const url = `${API_BASE}/api/chat/${requestId}/messages${isCustomer ? `?email=${encodeURIComponent(customerEmail!)}` : ""}`;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (adminToken) {
        headers.Authorization = `Bearer ${adminToken}`;
      }
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ body: newMessage.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }
      const sentMessage = await res.json();
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
      onNewMessage?.();
    } catch (e: any) {
      setError(e.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <p className="text-[var(--muted)]">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex h-96 flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-[var(--muted)] py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = (isAdmin && msg.sender === "admin") || (isCustomer && msg.sender === "customer");
            const uniqueKey = msg.id && String(msg.id).length > 0 ? msg.id : `msg-${index}-${msg.created_at ?? index}`;
            return (
              <div
                key={uniqueKey}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]"
                  }`}
                >
                  {msg.body && <p className="text-sm whitespace-pre-wrap">{msg.body}</p>}
                  {msg.attachment_blob_url && (
                    <a
                      href={msg.attachment_blob_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block text-xs underline"
                    >
                      📎 {msg.attachment_file_name || "Attachment"}
                    </a>
                  )}
                  <p className={`mt-1 text-xs ${isOwnMessage ? "text-white/70" : "text-[var(--muted)]"}`}>
                    {msg.created_at
                      ? (() => {
                          const d = new Date(msg.created_at);
                          return Number.isNaN(d.getTime()) ? "—" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        })()
                      : "—"}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {error && (
        <div className="px-4 py-2">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}
      <form onSubmit={sendMessage} className="border-t border-[var(--border)] p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            aria-label="Message"
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()} size="sm">
            {sending ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
