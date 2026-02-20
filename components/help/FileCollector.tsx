"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm";

interface FileCollectorProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  error?: string;
}

export function FileCollector({ files, onFilesChange, error }: FileCollectorProps) {
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles?.length) return;
      const list = Array.from(newFiles).filter((f) => f.size <= MAX_SIZE_MB * 1024 * 1024);
      onFilesChange([...files, ...list].slice(0, MAX_FILES));
    },
    [files, onFilesChange]
  );

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--foreground)]">
        Product photos / videos (optional)
      </label>
      <p className="text-sm text-[var(--muted)]">
        Up to {MAX_FILES} files, max {MAX_SIZE_MB}MB each. We’ll upload them after you submit.
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
          disabled={files.length >= MAX_FILES}
          className="sr-only"
          id="file-collect"
        />
        <label
          htmlFor="file-collect"
          className="cursor-pointer text-sm font-medium text-[var(--accent)] hover:underline disabled:pointer-events-none disabled:opacity-50"
        >
          Choose files or drag and drop
        </label>
      </motion.div>
      {error && (
        <p className="text-sm text-[var(--error)]" role="alert">{error}</p>
      )}
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
