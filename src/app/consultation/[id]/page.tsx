'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Loader2, RotateCcw, AlertTriangle } from 'lucide-react';
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
import type { SessionQuestion } from '@/types';

/* ------------------------------------------------------------------ */
/*  Waiting screen — PENDING_TEMPLATE                                  */
/* ------------------------------------------------------------------ */
function WaitingScreen({
  sessionId,
  startedAt,
}: {
  sessionId: string;
  startedAt: string;
}) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);
  const startSession = useStartSession();

  // Time out after 2 minutes of waiting
  useEffect(() => {
    const elapsed = Date.now() - new Date(startedAt).getTime();
    const remaining = Math.max(0, 120_000 - elapsed);
    const timer = setTimeout(() => setTimedOut(true), remaining);
    return () => clearTimeout(timer);
  }, [startedAt]);

  if (timedOut) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF2F2]">
          <AlertTriangle className="h-7 w-7 text-[#EF4444]" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-[#1C1917]">
          Generation is taking longer than expected
        </h2>
        <p className="mb-8 max-w-md text-[15px] leading-relaxed text-[#78716C]">
          We weren&apos;t able to generate your industry-specific questions.
          This could be a temporary issue. You can try starting a new
          consultation or go back to the dashboard.
        </p>
        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={async () => {
              try {
                const newSession = await startSession.mutateAsync();
                router.push(`/consultation/${newSession.id}`);
              } catch {
                toast.error('Failed to start a new consultation');
              }
            }}
            disabled={startSession.isPending}
            className="h-10 rounded-full bg-[#1C1917] px-6 text-sm font-medium text-white hover:bg-[#1C1917]/90"
          >
            {startSession.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting...
              </span>
            ) : (
              'Try New Consultation'
            )}
          </Button>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[#78716C] underline-offset-4 transition-colors hover:text-[#1C1917] hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      {/* Animated spinner + pulse ring */}
      <div className="relative mb-8">
        <div className="h-16 w-16 rounded-full border-2 border-[#E7E5E4]" />
        <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-[#1C1917]" />
        <div className="absolute -inset-3 animate-pulse rounded-full border border-[#E7E5E4]/50" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-[#1C1917]">
        Preparing your consultation
      </h2>
      <p className="max-w-sm text-[15px] leading-relaxed text-[#78716C]">
        We&apos;re generating industry-specific questions for your consultation.
        This usually takes less than a minute.
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

  const timeTaken = (() => {
    if (!completedAt || !startedAt) return null;
    const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return 'Less than a minute';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  })();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      {/* Scale-in checkmark */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#0D9488]"
      >
        <Check className="h-10 w-10 text-white" strokeWidth={3} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="mb-2 text-2xl font-semibold text-[#1C1917]">
          Consultation Complete
        </h2>

        <div className="mb-6 space-y-1 text-[15px] text-[#78716C]">
          <p>{totalQuestions} questions answered</p>
          {timeTaken && <p>Time taken: {timeTaken}</p>}
        </div>

        <div className="mb-8 rounded-lg border border-[#E7E5E4] bg-white px-5 py-4">
          <p className="text-sm text-[#78716C]">
            Your AI transformation report is being generated...
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0D9488]" />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0D9488] [animation-delay:150ms]" />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0D9488] [animation-delay:300ms]" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={() => router.push('/dashboard')}
            className="h-10 rounded-full bg-[#1C1917] px-6 text-sm font-medium text-white hover:bg-[#1C1917]/90"
          >
            Back to Dashboard
          </Button>
          <Link
            href={`/consultation/${sessionId}/review`}
            className="text-sm font-medium text-[#78716C] underline-offset-4 transition-colors hover:text-[#1C1917] hover:underline"
          >
            Review Answers
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Abandoned screen                                                   */
/* ------------------------------------------------------------------ */
function AbandonedScreen() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F4]">
        <RotateCcw className="h-7 w-7 text-[#A8A29E]" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-[#1C1917]">
        This consultation was abandoned
      </h2>
      <p className="mb-8 max-w-sm text-[15px] text-[#78716C]">
        You can start a new consultation or return to your dashboard.
      </p>
      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={() => router.push('/dashboard')}
          className="h-10 rounded-full bg-[#1C1917] px-6 text-sm font-medium text-white hover:bg-[#1C1917]/90"
        >
          Start New Consultation
        </Button>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-[#78716C] underline-offset-4 transition-colors hover:text-[#1C1917] hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Failed screen — template generation error                          */
/* ------------------------------------------------------------------ */
function FailedScreen() {
  const router = useRouter();
  const startSession = useStartSession();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF2F2]">
        <AlertTriangle className="h-7 w-7 text-[#EF4444]" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-[#1C1917]">
        Something went wrong
      </h2>
      <p className="mb-8 max-w-md text-[15px] leading-relaxed text-[#78716C]">
        We couldn&apos;t generate the questions for your consultation due to a
        system error. Please try starting a new session.
      </p>
      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={async () => {
            try {
              const s = await startSession.mutateAsync();
              router.push(`/consultation/${s.id}`);
            } catch {
              toast.error('Failed to start a new consultation');
            }
          }}
          disabled={startSession.isPending}
          className="h-10 rounded-full bg-[#1C1917] px-6 text-sm font-medium text-white hover:bg-[#1C1917]/90"
        >
          {startSession.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting...
            </span>
          ) : (
            'Try New Consultation'
          )}
        </Button>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-[#78716C] underline-offset-4 transition-colors hover:text-[#1C1917] hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  In-progress question flow                                          */
/* ------------------------------------------------------------------ */
function QuestionFlow({
  sessionId,
  question,
  progress,
}: {
  sessionId: string;
  question: SessionQuestion;
  progress: { answered: number; total: number };
}) {
  const [answer, setAnswer] = useState<string | string[] | number | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward
  const submitAnswer = useSubmitAnswer(sessionId);

  // Reset answer when question changes
  useEffect(() => {
    setAnswer(null);
    setShowCheck(false);
  }, [question.id]);

  const isAnswerEmpty =
    answer === null ||
    answer === '' ||
    (Array.isArray(answer) && answer.length === 0);

  const handleSubmit = useCallback(async () => {
    if (isAnswerEmpty) return;

    try {
      setShowCheck(true);
      // Brief pause for checkmark animation
      await new Promise((resolve) => setTimeout(resolve, 400));
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
      // Submit with a skip value — the backend recognizes empty/skip
      await submitAnswer.mutateAsync({
        questionId: question.id,
        value: '',
      });
    } catch {
      // Error handled by mutation
    }
  }, [question.id, submitAnswer]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <div>
      <ProgressHeader
        answered={progress.answered}
        total={progress.total}
        section={question.section}
      />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={question.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Question text */}
          <h2 className="mb-8 text-xl font-medium leading-relaxed text-[#1C1917]">
            {question.question.questionText}
          </h2>

          {/* Question input */}
          <div className="mb-8">
            <QuestionRenderer
              question={question}
              value={answer}
              onChange={setAnswer}
            />
          </div>

          {/* Submit / Skip */}
          <div className="flex flex-col items-center gap-3">
            {/* Submit button with checkmark state */}
            <Button
              onClick={handleSubmit}
              disabled={isAnswerEmpty || submitAnswer.isPending}
              className="h-11 min-w-[180px] rounded-full bg-[#1C1917] px-8 text-sm font-medium text-white transition-all hover:bg-[#1C1917]/90 disabled:bg-[#E7E5E4] disabled:text-[#A8A29E]"
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
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Submit Answer
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            {/* Skip button */}
            {!question.question.isRequired && (
              <button
                type="button"
                onClick={handleSkip}
                disabled={submitAnswer.isPending}
                className="text-sm font-medium text-[#A8A29E] transition-colors hover:text-[#78716C] disabled:opacity-50"
              >
                Skip this question
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
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

  // Derive status from session + currentQuestion (currentQuestion.status is most up-to-date)
  const status = currentQuestion?.status ?? session?.status;

  if (sessionLoading || questionLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1C1917] border-t-transparent" />
          <p className="text-sm text-[#78716C]">Loading consultation...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-xl font-semibold text-[#1C1917]">
          Consultation not found
        </h2>
        <p className="mb-6 text-[15px] text-[#78716C]">
          This consultation session does not exist or you do not have access to it.
        </p>
        <Link href="/dashboard">
          <Button className="h-10 rounded-full bg-[#1C1917] px-6 text-sm font-medium text-white hover:bg-[#1C1917]/90">
            Back to Dashboard
          </Button>
        </Link>
      </div>
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
        totalQuestions={currentQuestion?.progress.total ?? session._count?.questions ?? 0}
        startedAt={session.startedAt}
        completedAt={session.completedAt}
      />
    );
  }

  // IN_PROGRESS
  if (status === 'IN_PROGRESS' && currentQuestion?.question) {
    return (
      <QuestionFlow
        sessionId={sessionId}
        question={currentQuestion.question}
        progress={currentQuestion.progress}
      />
    );
  }

  // Fallback — should not happen
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-sm text-[#78716C]">Loading...</p>
    </div>
  );
}
