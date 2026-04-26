'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Loader2, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ProgressHeader } from '@/components/consultation/progress-header';
import { QuestionRenderer } from '@/components/consultation/question-renderer';
import {
  useSession,
  useCurrentQuestion,
  useSubmitAnswer,
  useStartSession,
} from '@/hooks/use-sessions';
import { useReport, useRegenerateReport } from '@/hooks/use-report';
import { useMe } from '@/hooks/use-user';
import type { SessionQuestion } from '@/types';

/* ------------------------------------------------------------------ */
/*  Waiting screen — PENDING_TEMPLATE                                  */
/* ------------------------------------------------------------------ */
function WaitingScreen({
  startedAt,
}: {
  sessionId: string;
  startedAt: string;
}) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);
  const startSession = useStartSession();

  useEffect(() => {
    const elapsed = Date.now() - new Date(startedAt).getTime();
    const remaining = Math.max(0, 120_000 - elapsed);
    const timer = setTimeout(() => setTimedOut(true), remaining);
    return () => clearTimeout(timer);
  }, [startedAt]);

  if (timedOut) {
    return (
      <StatusScreen
        icon={<AlertTriangle className="h-7 w-7 text-destructive" />}
        iconBg="bg-destructive/10"
        title="Generation is taking longer than expected"
        description="We weren't able to generate your industry-specific questions. This could be a temporary issue. You can try starting a new consultation or go back to the dashboard."
        primary={
          <Button
            onClick={async () => {
              try {
                const newSession = await startSession.mutateAsync({});
                router.push(`/consultation/${newSession.id}`);
              } catch {
                toast.error('Failed to start a new consultation');
              }
            }}
            disabled={startSession.isPending}
            className="h-10 rounded-full px-6"
          >
            {startSession.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting…
              </span>
            ) : (
              'Try New Consultation'
            )}
          </Button>
        }
        secondary={<DashboardLink />}
      />
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="relative mb-8">
        <div className="h-16 w-16 rounded-full border-2 border-border" />
        <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-foreground" />
        <div className="absolute -inset-3 animate-pulse rounded-full border border-border/60" />
      </div>
      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-accent-foreground/15 bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
        <Sparkles className="h-3 w-3" />
        Personalising
      </div>
      <h2 className="mt-3 mb-2 text-xl font-semibold text-foreground">
        Preparing your consultation
      </h2>
      <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
        We&apos;re generating industry-specific questions tailored to your
        organisation. This usually takes less than a minute.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Completed screen                                                   */
/* ------------------------------------------------------------------ */
function CompletedScreen({
  sessionId,
  totalQuestions,
  startedAt,
  completedAt,
}: {
  sessionId: string;
  totalQuestions: number;
  startedAt: string;
  completedAt: string | null;
}) {
  const router = useRouter();
  const { data: user } = useMe();
  const { data: reportData } = useReport(sessionId);
  const regenerateReport = useRegenerateReport(sessionId);

  const isAdmin = user?.role === 'ADMIN';

  const timeTaken = (() => {
    if (!completedAt || !startedAt) return null;
    const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return 'Less than a minute';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  })();

  const reportStatus = reportData?.status ?? null;

  const renderReportSection = () => {
    if (reportStatus === 'COMPLETED') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link href={`/consultation/${sessionId}/report`}>
            <Button className="h-11 rounded-full px-8">
              View Your Transformation Roadmap
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      );
    }

    if (reportStatus === 'GENERATING') {
      return <ReportPlaceholder text="Your Transformation Roadmap is being generated…" />;
    }

    if (reportStatus === 'FAILED') {
      return (
        <div className="mb-8 rounded-xl border border-border bg-card px-5 py-4 shadow-xs">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium">Report generation failed</p>
            </div>
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                disabled={regenerateReport.isPending}
                onClick={() => {
                  regenerateReport.mutate(undefined, {
                    onError: () => toast.error('Failed to regenerate report'),
                  });
                }}
                className="rounded-full px-4 text-xs"
              >
                {regenerateReport.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Regenerating…
                  </span>
                ) : (
                  'Try Again'
                )}
              </Button>
            )}
          </div>
        </div>
      );
    }

    return <ReportPlaceholder text="Your AI transformation report is being generated…" />;
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-chart-1 shadow-lg shadow-chart-1/20"
      >
        <Check className="h-10 w-10 text-white" strokeWidth={3} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="mb-2 text-2xl font-semibold text-foreground">
          Consultation Complete
        </h2>

        <div className="mb-6 space-y-1 text-[15px] text-muted-foreground">
          <p>{totalQuestions} questions answered</p>
          {timeTaken && <p>Time taken: {timeTaken}</p>}
        </div>

        {renderReportSection()}

        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={() => router.push('/dashboard')}
            variant={reportStatus === 'COMPLETED' ? 'outline' : 'default'}
            className="h-10 rounded-full px-6"
          >
            Back to Dashboard
          </Button>
          <Link
            href={`/consultation/${sessionId}/review`}
            className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Review Answers
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function ReportPlaceholder({ text }: { text: string }) {
  return (
    <div className="mb-8 rounded-xl border border-border bg-card px-5 py-4 shadow-xs">
      <p className="text-sm text-muted-foreground">{text}</p>
      <div className="mt-3 flex items-center justify-center gap-1.5">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-1" />
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-1 [animation-delay:150ms]" />
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-1 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Abandoned screen                                                   */
/* ------------------------------------------------------------------ */
function AbandonedScreen() {
  const router = useRouter();
  return (
    <StatusScreen
      icon={<RotateCcw className="h-7 w-7 text-stone-400" />}
      iconBg="bg-muted"
      title="This consultation was abandoned"
      description="You can start a new consultation or return to your dashboard."
      primary={
        <Button
          onClick={() => router.push('/dashboard')}
          className="h-10 rounded-full px-6"
        >
          Start New Consultation
        </Button>
      }
      secondary={<DashboardLink />}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Failed screen — template generation error                          */
/* ------------------------------------------------------------------ */
function FailedScreen() {
  const router = useRouter();
  const startSession = useStartSession();
  return (
    <StatusScreen
      icon={<AlertTriangle className="h-7 w-7 text-destructive" />}
      iconBg="bg-destructive/10"
      title="Something went wrong"
      description="We couldn't generate the questions for your consultation due to a system error. Please try starting a new session."
      primary={
        <Button
          onClick={async () => {
            try {
              const s = await startSession.mutateAsync({});
              router.push(`/consultation/${s.id}`);
            } catch {
              toast.error('Failed to start a new consultation');
            }
          }}
          disabled={startSession.isPending}
          className="h-10 rounded-full px-6"
        >
          {startSession.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting…
            </span>
          ) : (
            'Try New Consultation'
          )}
        </Button>
      }
      secondary={<DashboardLink />}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Status screen wrapper — shared shell for waiting/abandoned/failed  */
/* ------------------------------------------------------------------ */
function StatusScreen({
  icon,
  iconBg,
  title,
  description,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full ${iconBg}`}>
        {icon}
      </div>
      <h2 className="mb-2 text-xl font-semibold text-foreground">{title}</h2>
      <p className="mb-8 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="flex flex-col items-center gap-3">
        {primary}
        {secondary}
      </div>
    </div>
  );
}

function DashboardLink() {
  return (
    <Link
      href="/dashboard"
      className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
    >
      Back to Dashboard
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  In-progress question flow                                          */
/* ------------------------------------------------------------------ */
function QuestionFlow({
  sessionId,
  question,
  progress,
  scopeLabel,
}: {
  sessionId: string;
  question: SessionQuestion;
  progress: { answered: number; total: number };
  scopeLabel?: string | null;
}) {
  const [answer, setAnswer] = useState<string | string[] | number | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const [direction, setDirection] = useState(1);
  const [prevQuestionId, setPrevQuestionId] = useState(question.id);
  const submitAnswer = useSubmitAnswer(sessionId);

  if (prevQuestionId !== question.id) {
    setPrevQuestionId(question.id);
    setAnswer(null);
    setShowCheck(false);
  }

  const isAnswerEmpty =
    answer === null ||
    answer === '' ||
    (Array.isArray(answer) && answer.length === 0);

  const handleSubmit = useCallback(async () => {
    if (isAnswerEmpty) return;
    try {
      setShowCheck(true);
      setDirection(1);
      await submitAnswer.mutateAsync({
        questionId: question.id,
        value: answer!,
      });
    } catch {
      setShowCheck(false);
    }
  }, [answer, isAnswerEmpty, question.id, submitAnswer]);

  const handleSkip = useCallback(async () => {
    try {
      setDirection(1);
      await submitAnswer.mutateAsync({
        questionId: question.id,
        value: '',
      });
    } catch {
      // handled by mutation
    }
  }, [question.id, submitAnswer]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 24 : -24, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -24 : 24, opacity: 0 }),
  };

  const questionText = question.question?.questionText ?? question.adaptiveText ?? '';
  const isOptional = !(question.question?.isRequired ?? true);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[600px]">
        <ProgressHeader
          answered={progress.answered}
          total={progress.total}
          section={question.section}
          scopeLabel={scopeLabel}
        />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={question.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs sm:p-8">
              <div className="mb-6 flex items-start justify-between gap-3">
                <h2 className="flex-1 text-[22px] font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
                  {questionText}
                </h2>
                {isOptional ? (
                  <span className="mt-1 shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Optional
                  </span>
                ) : null}
              </div>

              <div>
                <QuestionRenderer
                  question={question}
                  value={answer}
                  onChange={setAnswer}
                />
              </div>
            </div>

            {/* Footer: inline on desktop, sticky on mobile */}
            <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8">
              <Button
                onClick={handleSubmit}
                disabled={isAnswerEmpty || submitAnswer.isPending}
                className="h-11 w-full min-w-[180px] rounded-full px-8 text-sm font-medium sm:w-auto"
              >
                {showCheck ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Submitted
                  </motion.span>
                ) : submitAnswer.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Submit Answer
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              {isOptional && (
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={submitAnswer.isPending}
                  className="text-sm font-medium text-stone-400 transition-colors hover:text-muted-foreground disabled:opacity-50"
                >
                  Skip this question
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function ConsultationPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const { data: session, isLoading: sessionLoading } = useSession(sessionId);
  const { data: currentQuestion, isLoading: questionLoading } =
    useCurrentQuestion(sessionId);

  const status = currentQuestion?.status ?? session?.status;

  if (sessionLoading || questionLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading consultation…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <StatusScreen
        icon={<AlertTriangle className="h-7 w-7 text-stone-400" />}
        iconBg="bg-muted"
        title="Consultation not found"
        description="This consultation session does not exist or you do not have access to it."
        primary={
          <Link href="/dashboard">
            <Button className="h-10 rounded-full px-6">Back to Dashboard</Button>
          </Link>
        }
      />
    );
  }

  if (status === 'PENDING_TEMPLATE') {
    return <WaitingScreen sessionId={sessionId} startedAt={session.startedAt} />;
  }

  if (status === 'ABANDONED') {
    return <AbandonedScreen />;
  }

  if (status === 'FAILED') {
    return <FailedScreen />;
  }

  if (status === 'COMPLETED') {
    return (
      <CompletedScreen
        sessionId={sessionId}
        totalQuestions={currentQuestion?.progress?.answered ?? session._count?.questions ?? 0}
        startedAt={session.startedAt}
        completedAt={session.completedAt}
      />
    );
  }

  if (status === 'IN_PROGRESS' && currentQuestion?.question) {
    const scopeLabel =
      session?.scope === 'WORKFLOW' && session.workflow
        ? `${session.workflow.name}${
            session.department ? ` · ${session.department.name}` : ''
          }`
        : session?.scope === 'DEPARTMENT' && session.department
          ? session.department.name
          : null;

    return (
      <QuestionFlow
        sessionId={sessionId}
        question={currentQuestion.question}
        progress={currentQuestion.progress}
        scopeLabel={scopeLabel}
      />
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
