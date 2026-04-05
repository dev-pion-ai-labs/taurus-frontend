'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Loader2,
  FileText,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuthStore } from '@/stores/auth-store';
import { useTemplates, useTemplate, useRegenerateTemplate } from '@/hooks/use-templates';
import { StatusBadge } from '@/components/consultation/status-badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import type { ConsultationTemplate, TemplateQuestion } from '@/types';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

// ---------------------------------------------------------------------------
// Type badge
// ---------------------------------------------------------------------------

function TypeBadge({ type }: { type: 'BASE' | 'INDUSTRY' }) {
  if (type === 'BASE') {
    return (
      <span className="inline-flex items-center rounded-full border border-[#D6D3D1] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#57534E]">
        Base
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-[#1C1917] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
      Industry
    </span>
  );
}

// ---------------------------------------------------------------------------
// Question type badge
// ---------------------------------------------------------------------------

function QuestionTypeBadge({ type }: { type: string }) {
  const label = type.replace(/_/g, ' ');
  return (
    <span className="inline-flex items-center rounded-md bg-[#F5F5F4] px-2 py-0.5 text-[11px] font-medium text-[#57534E]">
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function TemplatesLoadingSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-[#F5F5F4] hover:bg-transparent">
          {['Type', 'Industry', 'Status', 'Version', 'Questions', 'Actions'].map(
            (col) => (
              <TableHead
                key={col}
                className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#78716C]"
              >
                {col}
              </TableHead>
            )
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i} className="border-b border-[#F5F5F4]">
            <TableCell>
              <Skeleton className="h-5 w-20 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-28" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-20 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-8" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-8" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-7 w-24 rounded-lg" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F4]">
        <FileText className="h-8 w-8 text-[#A8A29E]" />
      </div>
      <h3 className="mb-1 text-[15px] font-semibold text-[#1C1917]">
        No templates found
      </h3>
      <p className="max-w-xs text-[13px] text-[#78716C]">
        Templates will appear here once they are created.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Regenerate confirm dialog
// ---------------------------------------------------------------------------

function RegenerateDialog({ templateId }: { templateId: string }) {
  const [open, setOpen] = useState(false);
  const { mutate: regenerate, isPending } = useRegenerateTemplate(templateId);

  const handleConfirm = () => {
    regenerate(undefined, {
      onSuccess: () => {
        toast.success('Template regenerated');
        setOpen(false);
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to regenerate template'
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="rounded-full px-3 text-xs" />
        }
      >
        <RefreshCw className="mr-1 h-3 w-3" />
        Regenerate
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Regenerate Template</DialogTitle>
          <DialogDescription>
            This will generate a new version of questions for this industry.
            Existing sessions won&apos;t be affected. Continue?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-[#1C1917] text-white hover:bg-[#1C1917]/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Template detail dialog
// ---------------------------------------------------------------------------

function TemplateDetailDialog({ templateId }: { templateId: string }) {
  const [open, setOpen] = useState(false);
  const { data: template, isLoading } = useTemplate(open ? templateId : null);

  const questions = (template?.questions ?? []).sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="rounded-full px-3 text-xs" />
        }
      >
        <Eye className="mr-1 h-3 w-3" />
        View
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Template Details</DialogTitle>
          {template && (
            <DialogDescription>
              <span className="inline-flex items-center gap-2">
                <TypeBadge type={template.type} />
                <StatusBadge status={template.status} />
                <span className="text-[13px] text-[#78716C]">
                  v{template.version}
                </span>
                {template.industry && (
                  <span className="text-[13px] text-[#78716C]">
                    &middot; {template.industry.name}
                  </span>
                )}
              </span>
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[13px] text-[#78716C]">
              No questions found for this template.
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            {questions.map((q: TemplateQuestion, idx: number) => (
              <div
                key={q.id}
                className="rounded-lg border border-[#F5F5F4] bg-[#FAFAF9] p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Question number */}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1C1917] text-[11px] font-semibold text-white">
                    {idx + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    {/* Question text */}
                    <p className="text-[14px] font-medium leading-snug text-[#1C1917]">
                      {q.questionText}
                    </p>

                    {/* Meta row */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <QuestionTypeBadge type={q.questionType} />
                      {q.isRequired ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#EA580C]">
                          <CheckCircle2 className="h-3 w-3" />
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#A8A29E]">
                          <AlertCircle className="h-3 w-3" />
                          Optional
                        </span>
                      )}
                    </div>

                    {/* Options (if any) */}
                    {q.options && q.options.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A8A29E]">
                          Options
                        </p>
                        <ul className="space-y-1">
                          {q.options.map((opt, oi) => (
                            <li
                              key={oi}
                              className="flex items-center gap-2 text-[13px] text-[#57534E]"
                            >
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D6D3D1]" />
                              {opt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Templates table
// ---------------------------------------------------------------------------

function TemplatesTable({
  templates,
}: {
  templates: ConsultationTemplate[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-[#F5F5F4] hover:bg-transparent">
          <TableHead className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#78716C]">
            Type
          </TableHead>
          <TableHead className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#78716C]">
            Industry
          </TableHead>
          <TableHead className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#78716C]">
            Status
          </TableHead>
          <TableHead className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#78716C]">
            Version
          </TableHead>
          <TableHead className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#78716C]">
            Questions
          </TableHead>
          <TableHead className="text-right text-[13px] font-medium uppercase tracking-[0.05em] text-[#78716C]">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => (
          <TableRow
            key={template.id}
            className="border-b border-[#F5F5F4] hover:bg-[#FAFAF9]"
          >
            <TableCell>
              <TypeBadge type={template.type} />
            </TableCell>
            <TableCell className="text-[14px] text-[#1C1917]">
              {template.industry?.name ?? (
                <span className="text-[#A8A29E]">&mdash;</span>
              )}
            </TableCell>
            <TableCell>
              <StatusBadge status={template.status} />
            </TableCell>
            <TableCell className="text-[14px] text-[#57534E]">
              v{template.version}
            </TableCell>
            <TableCell className="text-[14px] text-[#57534E]">
              {template._count?.questions ?? template.questions?.length ?? 0}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <TemplateDetailDialog templateId={template.id} />
                {template.type === 'INDUSTRY' && (
                  <RegenerateDialog templateId={template.id} />
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ---------------------------------------------------------------------------
// Access denied
// ---------------------------------------------------------------------------

function AccessDenied() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="mb-2 text-[20px] font-semibold text-[#1C1917]">
          Access Denied
        </h2>
        <p className="max-w-sm text-[14px] text-[#78716C]">
          You do not have permission to access this page. Only administrators can
          manage templates.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminTemplatesPage() {
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const { data: templates, isLoading } = useTemplates(page);

  // Admin-only check
  if (user && user.role !== 'ADMIN') {
    return <AccessDenied />;
  }

  const templateList = Array.isArray(templates) ? templates : [];
  const hasNextPage = templateList.length >= 20;
  const hasPrevPage = page > 1;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-6xl"
    >
      {/* Page title */}
      <motion.h1
        variants={itemVariants}
        className="mb-6 text-[24px] font-semibold text-[#1C1917]"
      >
        Template Management
      </motion.h1>

      {/* Templates card */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl border border-[#E7E5E4] bg-white p-6"
      >
        {isLoading ? (
          <TemplatesLoadingSkeleton />
        ) : templateList.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <TemplatesTable templates={templateList} />

            {/* Pagination */}
            {(hasPrevPage || hasNextPage) && (
              <div className="mt-4 flex items-center justify-between border-t border-[#F5F5F4] pt-4">
                <span className="text-[13px] text-[#78716C]">Page {page}</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!hasPrevPage}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-full"
                  >
                    <ChevronLeft className="mr-1 h-3 w-3" />
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!hasNextPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-full"
                  >
                    Next
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
