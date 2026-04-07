'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  FileText,
  FileSpreadsheet,
  File,
  CloudUpload,
} from 'lucide-react';
import { toast } from 'sonner';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useUploadDocument, useDeleteDocument } from '@/hooks/use-onboarding';
import { MAX_FILE_SIZE } from '@/lib/constants';

interface StepDocumentsProps {
  onNext: () => void;
  onBack: () => void;
  isSaving: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.includes('pdf'))
    return <FileText className="h-5 w-5 text-[#EF4444]" />;
  if (
    type.includes('csv') ||
    type.includes('spreadsheet') ||
    type.includes('excel')
  )
    return <FileSpreadsheet className="h-5 w-5 text-[#16A34A]" />;
  return <File className="h-5 w-5 text-[#3B82F6]" />;
}

const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.csv,.xls,.xlsx';

export function StepDocuments({ onNext, onBack, isSaving }: StepDocumentsProps) {
  const { documents, addDocument, removeDocument } = useOnboardingStore();
  const uploadDoc = useUploadDocument();
  const deleteDoc = useDeleteDocument();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      Array.from(files).forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} exceeds the 10MB limit`);
          return;
        }

        const fileKey = `${file.name}-${file.size}`;
        setUploadingFiles((prev) => new Set(prev).add(fileKey));

        uploadDoc.mutate(file, {
          onSuccess: (doc) => {
            addDocument(doc);
            setUploadingFiles((prev) => {
              const next = new Set(prev);
              next.delete(fileKey);
              return next;
            });
          },
          onError: (error) => {
            toast.error(`Failed to upload ${file.name}: ${error.message}`);
            setUploadingFiles((prev) => {
              const next = new Set(prev);
              next.delete(fileKey);
              return next;
            });
          },
        });
      });
    },
    [uploadDoc, addDocument]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemove = (id: string) => {
    deleteDoc.mutate(id, {
      onSuccess: () => removeDocument(id),
      onError: () => {
        removeDocument(id);
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1C1917]">
          Upload Documents
        </h2>
        <p className="mt-2 text-sm text-[#78716C]">
          Share relevant documents so AI can understand your business deeply. This step is optional.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 transition-all ${
          isDragging
            ? 'border-[#1C1917] bg-[#FAFAF9] scale-[1.01]'
            : 'border-[#D6D3D1] bg-[#FAFAF9] hover:border-[#A8A29E] hover:bg-[#F5F5F4]'
        }`}
      >
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
            isDragging ? 'bg-[#1C1917]' : 'bg-[#E7E5E4] group-hover:bg-[#D6D3D1]'
          }`}
        >
          <CloudUpload
            className={`h-6 w-6 transition-colors ${
              isDragging ? 'text-white' : 'text-[#78716C]'
            }`}
          />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#1C1917]">
          Drag & drop your files here
        </p>
        <p className="mt-1.5 text-xs text-[#A8A29E]">
          or click to browse
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {['PDF', 'DOC', 'CSV', 'XLS'].map((ext) => (
            <span
              key={ext}
              className="rounded-md bg-[#E7E5E4] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#78716C]"
            >
              {ext}
            </span>
          ))}
          <span className="rounded-md bg-[#E7E5E4] px-2 py-0.5 text-[10px] font-medium text-[#78716C]">
            Max 10MB
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Uploading + uploaded files */}
      {(uploadingFiles.size > 0 || documents.length > 0) && (
        <div className="space-y-2">
          {documents.length > 0 && (
            <p className="text-xs font-semibold uppercase tracking-wider text-[#A8A29E]">
              {documents.length} file{documents.length > 1 ? 's' : ''} uploaded
            </p>
          )}

          {/* Uploading */}
          {Array.from(uploadingFiles).map((key) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-xl border border-[#E7E5E4] bg-white px-4 py-3"
            >
              <Loader2 className="h-4 w-4 animate-spin text-[#78716C]" />
              <span className="flex-1 truncate text-sm text-[#78716C]">
                Uploading...
              </span>
            </div>
          ))}

          {/* Uploaded */}
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-xl border border-[#E7E5E4] bg-white px-4 py-3 transition-colors hover:bg-[#FAFAF9]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F4]">
                {getFileIcon(doc.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-[#1C1917]">
                  {doc.name}
                </p>
                <p className="text-xs text-[#A8A29E]">
                  {formatFileSize(doc.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(doc.id)}
                className="shrink-0 rounded-lg p-1.5 text-[#A8A29E] transition-colors hover:bg-[#FEE2E2] hover:text-[#EF4444]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="inline-flex h-11 items-center gap-2 text-sm font-semibold text-[#78716C] transition-colors hover:text-[#1C1917] disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={isSaving || uploadingFiles.size > 0}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1C1917] px-6 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : documents.length > 0 ? (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              Skip for now
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
