"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUploadUrl, uploadFileToUrl } from "@/lib/api";

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm";

interface ImageUploadProps {
  requestId: string;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  onError?: (message: string) => void;
}

export function ImageUpload({
  requestId,
  onUploadStart,
  onUploadEnd,
  onError,
}: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback(
    async (newFiles: FileList | null) => {
      if (!newFiles?.length) return;
      const list = Array.from(newFiles).filter((f) => {
        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
          onError?.(`${f.name} is larger than ${MAX_SIZE_MB}MB`);
          return false;
        }
        return true;
      });
      const combined = [...files, ...list].slice(0, MAX_FILES);
      setFiles(combined);

      if (combined.length > files.length) {
        setUploading(true);
        onUploadStart?.();
        try {
          for (let i = files.length; i < combined.length; i++) {
            const file = combined[i];
            const { upload_url } = await getUploadUrl(requestId, {
              name: file.name,
              type: file.type,
              size: file.size,
            });
            await uploadFileToUrl(upload_url, file);
          }
        } catch (e) {
          onError?.(e instanceof Error ? e.message : "Upload failed");
        } finally {
          setUploading(false);
          onUploadEnd?.();
        }
      }
    },
    [files, requestId, onError, onUploadStart, onUploadEnd]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--foreground)]">
        Product photos / videos (optional)
      </label>
      <p className="text-sm text-[var(--muted)]">
        Upload up to {MAX_FILES} files (max {MAX_SIZE_MB}MB each). Helps us check condition.
      </p>
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        animate={{ borderColor: dragOver ? "var(--accent)" : "var(--border)" }}
        className="rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-6 text-center transition-colors"
      >
        <input
          type="file"
          accept={ACCEPT}
          multiple
          onChange={(e) => addFiles(e.target.files)}
          disabled={uploading || files.length >= MAX_FILES}
          className="sr-only"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-sm font-medium text-[var(--accent)] hover:underline disabled:pointer-events-none disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Choose files or drag and drop"}
        </label>
      </motion.div>
      <AnimatePresence mode="popLayout">
        {files.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file, i) => (
              <motion.li
                key={`${file.name}-${i}`}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              >
                <span className="truncate text-[var(--foreground)]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="shrink-0 text-[var(--muted)] hover:text-[var(--error)] transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  Remove
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
