// Direct backend calls: same host as the page, port 5300. Backend has CORS enabled.
export function getApiBase(): string {
  if (typeof window !== "undefined")
    return `${window.location.protocol}//${window.location.hostname}:5300`;
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5300";
}

export type HelpRequestType = 'cancel' | 'return' | 'refund' | 'exchange';

export interface CreateHelpRequestBody {
  type: HelpRequestType;
  customer_email: string;
  customer_phone?: string;
  customer_name: string;
  order_number: string;
  reason?: string;
}

export interface HelpRequestResponse {
  id: string;
  type: HelpRequestType;
  status: string;
  customer_email: string;
  customer_name: string;
  order_number: string;
  created_at: string;
}

export interface CheckOrderResponse {
  order_number: string;
  has_open_request: boolean;
}

export interface UploadUrlResponse {
  attachment_id: string;
  upload_url: string;
  blob_path: string;
  expires_in_minutes: number;
}

export async function checkOrder(orderNumber: string): Promise<CheckOrderResponse> {
  const res = await fetch(
    `${getApiBase()}/api/help-requests/check?order_number=${encodeURIComponent(orderNumber)}`
  );
  if (!res.ok) throw new Error('Failed to check order');
  return res.json();
}

export async function createHelpRequest(
  body: CreateHelpRequestBody
): Promise<HelpRequestResponse> {
  const res = await fetch(`${getApiBase()}/api/help-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 409) throw new Error(data.error || 'Order already has an open request');
    throw new Error(data.error || 'Failed to submit request');
  }
  return data;
}

export async function getUploadUrl(
  requestId: string,
  file: { name: string; type?: string; size?: number }
): Promise<UploadUrlResponse> {
  const res = await fetch(`${getApiBase()}/api/help-requests/${requestId}/attachments/upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_name: file.name,
      content_type: file.type,
      file_size_bytes: file.size,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get upload URL');
  return data;
}

export async function uploadFileToUrl(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!res.ok) throw new Error('Failed to upload file');
}
