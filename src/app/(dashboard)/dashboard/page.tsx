'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  Plus,
  Loader2,
  ClipboardList,
  Eye,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

import { useMe } from '@/hooks/use-user';
import { useSessions, useStartSession } from '@/hooks/use-sessions';
import { useOrgMembers } from '@/hooks/use-organizations';
import { useExecutiveDashboard } from '@/hooks/use-executive-dashboard';
import { useCountUp } from '@/hooks/use-count-up';
import { formatDollar, getScoreColor, getMaturityColor } from '@/lib/format';
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

import type { ConsultationSession, ExecutiveDashboard } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_COLOR: Record<string, string> = {
  LEADING: '#16a34a',
  ON_TRACK: '#d97706',
  LAGGING: '#dc2626',
};

function TrendArrow({ trend }: { trend: 'UP' | 'DOWN' | 'STABLE' }) {
  if (trend === 'UP') return <TrendingUp className="h-3.5 w-3.5 text-[#16a34a]" />;
  if (trend === 'DOWN') return <TrendingDown className="h-3.5 w-3.5 text-[#dc2626]" />;
  return <Minus className="h-3.5 w-3.5 text-[#78716C]" />;
}

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
// Maturity Gauge (80px SVG circle)
// ---------------------------------------------------------------------------

function MaturityGauge({ score, color }: { score: number; color: string }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score, 100) / 100;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg width={80} height={80} viewBox="0 0 80 80" className="shrink-0">
      {/* Background circle */}
      <circle
        cx={40}
        cy={40}
        r={radius}
        fill="none"
        stroke="#E7E5E4"
        strokeWidth={6}
      />
      {/* Progress circle */}
      <motion.circle
        cx={40}
        cy={40}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        transform="rotate(-90 40 40)"
      />
      {/* Score text */}
      <text
        x={40}
        y={40}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[16px] font-bold"
        fill="#1C1917"
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Executive Overview Section
// ---------------------------------------------------------------------------

function ExecutiveOverview({ data }: { data: ExecutiveDashboard }) {
  const animatedValue = useCountUp(data.totalValueIdentified ?? 0, 1500, true);
  const scoreColor = getScoreColor(data.currentScore ?? 0);
  const maturityColor = getMaturityColor(data.maturityLevel ?? '');

  const scoreTrend = (() => {
    if (data.previousScore === null || data.currentScore === null) return null;
    if (data.currentScore > data.previousScore) return 'UP' as const;
    if (data.currentScore < data.previousScore) return 'DOWN' as const;
    return 'STABLE' as const;
  })();

  const topRecs = (data.topRecommendations ?? []).slice(0, 5);

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl border border-[#E7E5E4] bg-white p-6"
    >
      {/* Top row: Gauge + Stats + Heatmap */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr_1fr]">
        {/* Left: Gauge + maturity */}
        <div className="flex items-center gap-4">
          <MaturityGauge score={data.currentScore ?? 0} color={scoreColor} />
          <div className="flex flex-col gap-1">
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium text-white"
              style={{ backgroundColor: maturityColor }}
            >
              {data.maturityLevel}
            </span>
            <div className="flex items-center gap-1.5 text-[13px] text-[#78716C]">
              {scoreTrend === 'UP' && (
                <>
                  <TrendingUp className="h-3.5 w-3.5 text-[#16a34a]" />
                  <span className="text-[#16a34a]">Up from {data.previousScore}</span>
                </>
              )}
              {scoreTrend === 'DOWN' && (
                <>
                  <TrendingDown className="h-3.5 w-3.5 text-[#dc2626]" />
                  <span className="text-[#dc2626]">Down from {data.previousScore}</span>
                </>
              )}
              {scoreTrend === 'STABLE' && (
                <>
                  <Minus className="h-3.5 w-3.5 text-[#78716C]" />
                  <span>No change</span>
                </>
              )}
              {scoreTrend === null && (
                <span>First assessment</span>
              )}
            </div>
          </div>
        </div>

        {/* Middle: Stat cards */}
        <div className="flex items-center gap-4">
          <div className="flex-1 rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A8A29E]">
              Total Value Identified
            </p>
            <p className="mt-1 text-[20px] font-bold text-[#1C1917]">
              {formatDollar(Math.round(animatedValue))}
            </p>
          </div>
          <div className="flex-1 rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A8A29E]">
              Recommendations
            </p>
            <p className="mt-1 text-[20px] font-bold text-[#1C1917]">
              {data.totalRecommendations}
            </p>
          </div>
        </div>

        {/* Right: Department heatmap */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A8A29E]">
            Departments
          </p>
          <div className="space-y-1.5">
            {data.departmentScores.map((dept) => (
              <div key={dept.department} className="flex items-center gap-2">
                <span className="w-20 truncate text-[12px] text-[#57534E]">
                  {dept.department}
                </span>
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-[#F5F5F4]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: STATUS_COLOR[dept.status] ?? '#78716C' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(dept.score, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
                <span className="w-7 text-right text-[11px] font-medium text-[#1C1917]">
                  {Math.round(dept.score)}
                </span>
                <TrendArrow trend={dept.trend} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Recommendations */}
      {topRecs.length > 0 && (
        <div className="mt-6 border-t border-[#F5F5F4] pt-4">
          <h4 className="mb-3 text-[13px] font-semibold text-[#1C1917]">
            Top Recommendations
          </h4>
          <div className="space-y-2">
            {topRecs.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-lg bg-[#FAFAF9] px-3 py-2"
              >
                <span className="flex-1 text-[13px] text-[#1C1917]">{rec.title}</span>
                <span className="rounded-full bg-[#F5F5F4] px-2 py-0.5 text-[11px] font-medium text-[#57534E]">
                  {rec.department}
                </span>
                <span className="text-[12px] font-medium text-[#1C1917]">
                  {formatDollar(rec.annualValue)}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                  style={{
                    backgroundColor:
                      rec.impact === 'HIGH'
                        ? '#16a34a'
                        : rec.impact === 'MEDIUM'
                          ? '#d97706'
                          : '#78716C',
                  }}
                >
                  {rec.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Full Report link */}
      <div className="mt-4 flex justify-end">
        <Link
          href="/dashboard/report"
          className="flex items-center gap-1 text-[13px] font-medium text-[#1C1917] underline-offset-4 transition-colors hover:underline"
        >
          View Full Report
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SessionsLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="ml-auto h-7 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function EmptySessionsState({ onStart, isLoading }: { onStart: () => void; isLoading: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F4]">
        <ClipboardList className="h-8 w-8 text-[#A8A29E]" style={{ width: 48, height: 48 }} />
      </div>
      <h3 className="mb-1 text-[15px] font-semibold text-[#1C1917]">No consultations yet</h3>
      <p className="mb-6 max-w-xs text-[13px] text-[#78716C]">
        Start your first AI transformation consultation to assess your organization&apos;s readiness.
      </p>
      <Button
        disabled={isLoading}
        onClick={onStart}
        className="rounded-full bg-[#1C1917] px-5 text-white hover:bg-[#1C1917]/90"
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Start Consultation
      </Button>
    </div>
  );
}

function SessionsTable({
  sessions,
  onNavigate,
}: {
  sessions: ConsultationSession[];
  onNavigate: (path: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-[#F5F5F4] hover:bg-transparent">
          <TableHead
            className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#78716C]"
          >
            Date
          </TableHead>
          <TableHead
            className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#78716C]"
          >
            Status
          </TableHead>
          <TableHead
            className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#78716C]"
          >
            Questions
          </TableHead>
          <TableHead
            className="text-right text-[13px] font-medium uppercase tracking-[0.05em] text-[#78716C]"
          >
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow
            key={session.id}
            className="cursor-pointer border-b border-[#F5F5F4] hover:bg-[#FAFAF9]"
            onClick={() => onNavigate(`/consultation/${session.id}`)}
          >
            <TableCell className="text-[14px] text-[#1C1917]">
              {formatRelativeDate(session.startedAt)}
            </TableCell>
            <TableCell>
              <StatusBadge status={session.status} />
            </TableCell>
            <TableCell className="text-[14px] text-[#57534E]">
              {session._count?.questions ?? session.questions?.length ?? 0}
            </TableCell>
            <TableCell className="text-right">
              <div
                className="flex items-center justify-end gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {session.status === 'IN_PROGRESS' && (
                  <Button
                    size="sm"
                    className="rounded-full bg-[#1C1917] px-3 text-xs text-white hover:bg-[#1C1917]/90"
                    onClick={() => onNavigate(`/consultation/${session.id}`)}
                  >
                    Continue
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
                {session.status === 'COMPLETED' && (
                  <>
                    {/* Report actions */}
                    {session.report?.status === 'COMPLETED' && (
                      <Button
                        size="sm"
                        className="rounded-full bg-[#1C1917] px-3 text-xs text-white hover:bg-[#1C1917]/90"
                        onClick={() =>
                          onNavigate(`/consultation/${session.id}/report`)
                        }
                      >
                        View Report
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                    {session.report?.status === 'GENERATING' && (
                      <span className="flex items-center gap-1.5 text-xs text-[#78716C]">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Generating...
                      </span>
                    )}
                    {session.report?.status === 'FAILED' && (
                      <span className="text-xs font-medium text-[#dc2626]">
                        Failed
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full px-3 text-xs"
                      onClick={() => onNavigate(`/consultation/${session.id}`)}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full px-3 text-xs"
                      onClick={() => onNavigate(`/consultation/${session.id}/review`)}
                    >
                      Review
                    </Button>
                  </>
                )}
                {session.status !== 'IN_PROGRESS' && session.status !== 'COMPLETED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full px-3 text-xs"
                    onClick={() => onNavigate(`/consultation/${session.id}`)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>
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
// Main page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  // Data fetching
  const { data: user, isLoading: userLoading } = useMe();
  const { data: sessions, isLoading: sessionsLoading } = useSessions(page);
  const { mutate: startSession, isPending: isStarting } = useStartSession();
  const { data: execData, isLoading: execLoading } = useExecutiveDashboard();

  const org = user?.organization ?? null;
  const orgMembers = useOrgMembers(org?.id, 1);

  // Handlers
  const handleStartSession = () => {
    startSession(undefined, {
      onSuccess: (session) => {
        router.push(`/consultation/${session.id}`);
      },
    });
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  // Pagination helpers
  const sessionList = Array.isArray(sessions) ? sessions : [];
  const hasNextPage = sessionList.length >= 20;
  const hasPrevPage = page > 1;

  const showExecOverview =
    !execLoading && execData && execData.currentScore !== null;

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
        Dashboard
      </motion.h1>

      {/* AI Transformation Overview — only when data exists */}
      {showExecOverview && <ExecutiveOverview data={execData} />}

      {/* Layout grid */}
      <div className={`grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] ${showExecOverview ? 'mt-4' : ''}`}>
        {/* ---- Main column ---- */}
        <div className="flex flex-col gap-4">
          {/* Welcome section */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-[#E7E5E4] bg-white p-6"
          >
            {userLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-4 w-40" />
              </div>
            ) : (
              <>
                <h2 className="text-[24px] font-semibold text-[#1C1917]">
                  Welcome back, {user?.firstName ?? 'there'}
                </h2>
                {org && (
                  <p className="mt-1 text-[14px] text-[#78716C]">
                    {org.name} &middot; {org.industry?.name}
                  </p>
                )}
              </>
            )}
          </motion.div>

          {/* Quick actions */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-[#E7E5E4] bg-white p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-[#1C1917]">
                  Start New Consultation
                </h3>
                <p className="mt-0.5 text-[13px] text-[#78716C]">
                  Begin a new AI transformation assessment for your organization
                </p>
              </div>
              <Button
                disabled={isStarting}
                onClick={handleStartSession}
                className="shrink-0 rounded-full bg-[#1C1917] px-5 text-white hover:bg-[#1C1917]/90"
              >
                {isStarting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {isStarting ? 'Creating...' : 'New Consultation'}
              </Button>
            </div>
          </motion.div>

          {/* Past sessions */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-[#E7E5E4] bg-white p-6"
          >
            <h3 className="mb-4 text-[15px] font-semibold text-[#1C1917]">
              Consultation Sessions
            </h3>

            {sessionsLoading ? (
              <SessionsLoadingSkeleton />
            ) : sessionList.length === 0 ? (
              <EmptySessionsState onStart={handleStartSession} isLoading={isStarting} />
            ) : (
              <>
                <SessionsTable sessions={sessionList} onNavigate={handleNavigate} />

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
        </div>

        {/* ---- Sidebar column ---- */}
        <div className="flex flex-col gap-4">
          {/* Organization info card */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-[#E7E5E4] bg-white p-6"
          >
            <h3 className="mb-4 text-[15px] font-semibold text-[#1C1917]">
              Organization
            </h3>

            {userLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-20" />
              </div>
            ) : org ? (
              <div className="space-y-4">
                {/* Org name */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F4]">
                    <Building2 className="h-4 w-4 text-[#78716C]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A8A29E]">
                      Name
                    </p>
                    <p className="text-[14px] font-medium text-[#1C1917]">{org.name}</p>
                  </div>
                </div>

                {/* Industry */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F4]">
                    <Briefcase className="h-4 w-4 text-[#78716C]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A8A29E]">
                      Industry
                    </p>
                    <span className="mt-0.5 inline-block rounded-full bg-[#F5F5F4] px-2.5 py-0.5 text-[12px] font-medium text-[#57534E]">
                      {org.industry?.name}
                    </span>
                  </div>
                </div>

                {/* Members */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F4]">
                    <Users className="h-4 w-4 text-[#78716C]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A8A29E]">
                      Members
                    </p>
                    <span className="block text-[14px] font-medium text-[#1C1917]">
                      {orgMembers.isLoading ? (
                        <Skeleton className="inline-block h-4 w-8" />
                      ) : (
                        Array.isArray(orgMembers.data) ? orgMembers.data.length : 0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-[#78716C]">No organization found.</p>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
