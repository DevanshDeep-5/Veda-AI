'use client';

import { useCallback } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { useAssignmentStore } from '../../stores/assignmentStore';
import { cn } from '../../lib/utils';

export default function FileUpload() {
  const { file, setFile } = useAssignmentStore();

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files[0];
      if (dropped) setFile(dropped);
    },
    [setFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        Study Material <span className="text-slate-500">(Optional)</span>
      </label>

      {file ? (
        /* File preview */
        <div className="flex items-center gap-3 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3">
          <FileText className="h-5 w-5 shrink-0 text-brand-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{file.name}</p>
            <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-surface hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            'group relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-surface-border bg-surface/30 px-6 py-8 text-center transition-all',
            'hover:border-brand-500/50 hover:bg-brand-500/5'
          )}
        >
          <input
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleChange}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary transition-transform group-hover:scale-110">
            <Upload className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">
              Drop your file here, or{' '}
              <span className="text-brand-400">browse</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">PDF, TXT, DOC, DOCX up to 10MB</p>
          </div>
        </div>
      )}
    </div>
  );
}
