'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Circle, Clock, MinusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/hooks/use-sessions';
import type { SessionQuestion } from '@/types';

/* ------------------------------------------------------------------ */
/*  Section config                                                     */
/* ------------------------------------------------------------------ */
const SECTION_META: Record<
  string,
  { label: string; order: number }
> = {
  BASE: { label: 'Base Questions', order: 0 },
  INDUSTRY: { label: 'Industry Questions', order: 1 },
  CHALLENGE_BONUS: { label: 'Challenge & Bonus Questions', order: 2 },
};

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    COMPLETED: {
      bg: 'bg-[#0D9488]/10',
      text: 'text-[#0D9488]',
      label: 'Completed',
    },
    IN_PROGRESS: {
      bg: 'bg-[#D97706]/10',
      text: 'text-[#D97706]',
      label: 'In Progress',
    },
    ABANDONED: {
      bg: 'bg-[#A8A29E]/10',
      text: 'text-[#78716C]',
      label: 'Abandoned',
    },
    PENDING_TEMPLATE: {
      bg: 'bg-[#A8A29E]/10',
      text: 'text-[#78716C]',
      label: 'Pending',
    },
  };

  const c = config[status] ?? config.PENDING_TEMPLATE;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Answer renderers                                                   */
/* ------------------------------------------------------------------ */
function TextAnswer({ value }: { value: string }) {
  return (
    <div className="rounded-lg bg-[#F5F5F4] px-4 py-3 text-[15px] leading-relaxed text-[#44403C]">
      {value}
    </div>
  );
}

function SingleChoiceAnswer({
  value,
  options,
}: {
  value: string;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const selected = option === value;
        return (
          <div
            key={option}
            className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-[15px] ${
              selected
                ? 'bg-[#0D9488]/5 font-medium text-[#1C1917]'
                : 'text-[#A8A29E]'
            }`}
          >
            <span
              className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                selected
                  ? 'border-[#0D9488] bg-[#0D9488]'
                  : 'border-[#D6D3D1]'
              }`}
            >
              {selected && (
                <Circle className="h-2 w-2 fill-white text-white" />
              )}
            </span>
            {option}
          </div>
        );
      })}
    </div>
  );
}

function MultiChoiceAnswer({
  value,
  options,
}: {
  value: string[];
  options: string[];
}) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const selected = value.includes(option);
        return (
          <div
            key={option}
            className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-[15px] ${
              selected
                ? 'bg-[#0D9488]/5 font-medium text-[#1C1917]'
                : 'text-[#A8A29E]'
            }`}
          >
            <span
              className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border-2 ${
                selected
                  ? 'border-[#0D9488] bg-[#0D9488]'
                  : 'border-[#D6D3D1]'
              }`}
            >
              {selected && <Check className="h-3 w-3 text-white" />}
            </span>
            {option}
          </div>
        );
      })}
    </div>
  );
}

function ScaleAnswer({ value }: { value: number }) {
  const max = 5;
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < value;
        return (
          <span
            key={i}
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
              filled
                ? 'border-[#0D9488] bg-[#0D9488] text-white'
                : 'border-[#D6D3D1] bg-white text-[#A8A29E]'
            }`}
          >
            {i + 1}
          </span>
        );
      })}
      <span className="ml-2 text-sm text-[#78716C]">{value} / {max}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Question card                                                      */
/* ------------------------------------------------------------------ */
function QuestionCard({
  sq,
  index,
}: {
  sq: SessionQuestion;
  index: number;
}) {
  const { question, answer, skipped, answeredAt } = sq;

  return (
    <div className="rounded-[12px] border border-[#E7E5E4] bg-white p-6">
      {/* Question header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="text-[16px] font-medium leading-snug text-[#1C1917]">
          <span className="mr-2 text-[#A8A29E]">Q{index}.</span>
          {question.questionText}
        </p>
        {skipped && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F5F5F4] px-2.5 py-0.5 text-xs font-medium text-[#A8A29E]">
            <MinusCircle className="h-3 w-3" />
            Skipped
          </span>
        )}
      </div>

      {/* Answer */}
      {!skipped && answer != null && (
        <div className="mb-3">
          {question.questionType === 'TEXT' && (
            <TextAnswer value={answer.value as string} />
          )}
          {question.questionType === 'SINGLE_CHOICE' && (
            <SingleChoiceAnswer
              value={answer.value as string}
              options={question.options ?? []}
            />
          )}
          {question.questionType === 'MULTI_CHOICE' && (
            <MultiChoiceAnswer
              value={answer.value as string[]}
              options={question.options ?? []}
            />
          )}
          {question.questionType === 'SCALE' && (
            <ScaleAnswer value={answer.value as number} />
          )}
        </div>
      )}

      {/* Timestamp */}
      {answeredAt && (
        <div className="flex items-center gap-1.5 text-xs text-[#A8A29E]">
          <Clock className="h-3 w-3" />
          {new Date(answeredAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */
function ReviewSkeleton() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="mb-6">
        <Skeleton className="mb-4 h-4 w-36" />
        <Skeleton className="h-7 w-56" />
      </div>

      {/* Info bar skeleton */}
      <div className="mb-8 flex items-center gap-4 rounded-[12px] border border-[#E7E5E4] bg-white px-6 py-4">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Section + cards skeleton */}
      {[1, 2].map((section) => (
        <div key={section} className="mb-8">
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="space-y-4">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="rounded-[12px] border border-[#E7E5E4] bg-white p-6"
              >
                <Skeleton className="mb-4 h-5 w-4/5" />
                <Skeleton className="mb-2 h-12 w-full rounded-lg" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Error state                                                        */
/* ------------------------------------------------------------------ */
function ErrorState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F4]">
        <MinusCircle className="h-7 w-7 text-[#A8A29E]" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-[#1C1917]">
        Session not found
      </h2>
      <p className="mb-8 max-w-sm text-[15px] text-[#78716C]">
        This consultation session does not exist or you do not have access to it.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center justify-center rounded-full bg-[#1C1917] px-6 text-sm font-medium text-white transition-colors hover:bg-[#1C1917]/90"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { data: session, isLoading, isError } = useSession(id);

  /* Group questions by section */
  const grouped = useMemo(() => {
    if (!session?.questions) return [];

    const map = new Map<string, SessionQuestion[]>();
    for (const sq of session.questions) {
      const group = map.get(sq.section) ?? [];
      group.push(sq);
      map.set(sq.section, group);
    }

    // Sort groups by predefined order, questions by orderIndex
    return Array.from(map.entries())
      .sort(
        ([a], [b]) =>
          (SECTION_META[a]?.order ?? 99) - (SECTION_META[b]?.order ?? 99)
      )
      .map(([section, questions]) => ({
        section,
        label: SECTION_META[section]?.label ?? section,
        questions: questions.sort((a, b) => a.orderIndex - b.orderIndex),
      }));
  }, [session?.questions]);

  /* Answered count */
  const answeredCount = useMemo(() => {
    if (!session?.questions) return 0;
    return session.questions.filter(
      (q) => q.answer != null && !q.skipped
    ).length;
  }, [session?.questions]);

  /* Running question number across sections */
  const questionNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    let counter = 1;
    for (const group of grouped) {
      for (const sq of group.questions) {
        map.set(sq.id, counter);
        counter++;
      }
    }
    return map;
  }, [grouped]);

  /* ---- Loading ---- */
  if (isLoading) {
    return <ReviewSkeleton />;
  }

  /* ---- Error / Not found ---- */
  if (isError || !session) {
    return <ErrorState />;
  }

  /* ---- Render ---- */
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#78716C] transition-colors hover:text-[#1C1917]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-[24px] font-semibold leading-tight text-[#1C1917]">
          Consultation Review
        </h1>
      </div>

      {/* Session info bar */}
      <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[12px] border border-[#E7E5E4] bg-white px-6 py-4">
        <StatusBadge status={session.status} />

        {session.completedAt && (
          <span className="flex items-center gap-1.5 text-sm text-[#78716C]">
            <Clock className="h-3.5 w-3.5" />
            Completed{' '}
            {new Date(session.completedAt).toLocaleDateString(undefined, {
              dateStyle: 'medium',
            })}
          </span>
        )}

        <span className="text-sm text-[#78716C]">
          {answeredCount} of {session.questions.length} questions answered
        </span>
      </div>

      {/* Grouped questions */}
      {grouped.map((group) => (
        <section key={group.section} className="mb-8">
          <h2 className="mb-4 text-[15px] font-semibold uppercase tracking-wide text-[#78716C]">
            {group.label}
          </h2>
          <div className="space-y-4">
            {group.questions.map((sq) => (
              <QuestionCard
                key={sq.id}
                sq={sq}
                index={questionNumberMap.get(sq.id) ?? 0}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
