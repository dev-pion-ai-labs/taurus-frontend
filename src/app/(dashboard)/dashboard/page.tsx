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
  Shield,
  AlertTriangle,
  Download,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
} from 'lucide-react';

import { useMe } from '@/hooks/use-user';
import { useSessions, useStartSession } from '@/hooks/use-sessions';
import { useOrgMembers } from '@/hooks/use-organizations';
import { useExecutiveDashboard } from '@/hooks/use-executive-dashboard';
import {
  useMaturityTrend,
  useRoadmapProgress,
  useValueRealization,
  useSprintVelocity,
  useStackOverview,
  useTeamReadiness,
  useRiskOverview,
} from '@/hooks/use-dashboard-analytics';
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

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
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

// ---------------------------------------------------------------------------
// Dashboard Analytics (Recharts)
// ---------------------------------------------------------------------------

const CHART_COLORS = ['#7c3aed', '#2563eb', '#16a34a', '#d97706', '#dc2626', '#06b6d4'];

const STATUS_CHART_COLORS: Record<string, string> = {
  BACKLOG: '#A8A29E',
  THIS_SPRINT: '#2563eb',
  IN_PROGRESS: '#d97706',
  AWAITING_APPROVAL: '#7c3aed',
  DEPLOYED: '#16a34a',
  VERIFIED: '#059669',
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E7E5E4] bg-white p-5">
      <h4 className="mb-4 text-[14px] font-semibold text-[#1C1917]">{title}</h4>
      {children}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-[#E7E5E4] bg-white p-5">
      <Skeleton className="mb-4 h-4 w-40" />
      <div className="space-y-3">
        <div className="flex items-end gap-2">
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

function ExecutiveOverviewSkeleton() {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl border border-[#E7E5E4] bg-white p-6"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr_1fr]">
        {/* Gauge placeholder */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        {/* Stat cards */}
        <div className="flex items-center gap-4">
          <div className="flex-1 rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] p-4">
            <Skeleton className="mb-2 h-3 w-28" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex-1 rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] p-4">
            <Skeleton className="mb-2 h-3 w-28" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        {/* Department heatmap */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-3 w-7" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Recommendations skeleton */}
      <div className="mt-6 border-t border-[#F5F5F4] pt-4">
        <Skeleton className="mb-3 h-4 w-36" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function MaturityTrendTab() {
  const { data, isLoading } = useMaturityTrend();
  if (isLoading) return <ChartSkeleton />;
  if (!data?.length) return <p className="py-8 text-center text-sm text-[#78716C]">No maturity data yet. Complete a consultation to see trends.</p>;

  return (
    <ChartCard title="AI Maturity Score Over Time">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(v) => new Date(String(v)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            tick={{ fontSize: 11, fill: '#78716C' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #E7E5E4', fontSize: 13 }}
            labelFormatter={(v) => new Date(String(v)).toLocaleDateString()}
            formatter={(v) => [`${v}/100`, 'Score']}
          />
          <Area type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2} fill="url(#scoreGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function RoadmapProgressTab() {
  const { data, isLoading } = useRoadmapProgress();
  if (isLoading) return <ChartSkeleton />;
  if (!data) return <p className="py-8 text-center text-sm text-[#78716C]">No roadmap data yet.</p>;

  const pieData = Object.entries(data.byStatus).map(([status, val]) => ({
    name: status.replace(/_/g, ' '),
    value: val.count,
    color: STATUS_CHART_COLORS[status] || '#A8A29E',
  }));

  return (
    <ChartCard title="Roadmap Progress">
      <div className="flex flex-col items-center gap-6 lg:flex-row">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2}>
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E7E5E4', fontSize: 13 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          <div className="text-center lg:text-left">
            <span className="text-3xl font-bold text-[#1C1917]">{data.completionRate}%</span>
            <span className="ml-1 text-sm text-[#78716C]">complete</span>
          </div>
          <p className="text-sm text-[#78716C]">
            {data.completedActions} of {data.totalActions} actions deployed or verified
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-[#78716C]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

function ValueRealizationTab() {
  const { data, isLoading } = useValueRealization();
  if (isLoading) return <ChartSkeleton />;
  if (!data) return <p className="py-8 text-center text-sm text-[#78716C]">No value data yet.</p>;

  return (
    <ChartCard title="Value Realization">
      <div className="mb-4 flex gap-6">
        <div>
          <p className="text-xs text-[#78716C]">Estimated</p>
          <p className="text-lg font-bold text-[#1C1917]">{formatDollar(data.totalEstimated)}</p>
        </div>
        <div>
          <p className="text-xs text-[#78716C]">Realized</p>
          <p className="text-lg font-bold text-[#16a34a]">{formatDollar(data.totalRealized)}</p>
        </div>
        <div>
          <p className="text-xs text-[#78716C]">Rate</p>
          <p className="text-lg font-bold text-[#1C1917]">{data.realizationRate}%</p>
        </div>
      </div>
      {data.timeline.length > 0 ? (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data.timeline}>
            <defs>
              <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={(v) => new Date(String(v)).toLocaleDateString(undefined, { month: 'short' })}
              tick={{ fontSize: 11, fill: '#78716C' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tickFormatter={(v) => formatDollar(Number(v))} tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E7E5E4', fontSize: 13 }} formatter={(v) => [formatDollar(Number(v)), 'Cumulative']} />
            <Area type="monotone" dataKey="cumulative" stroke="#16a34a" strokeWidth={2} fill="url(#valueGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <p className="py-4 text-center text-sm text-[#78716C]">Deploy actions to see value timeline</p>
      )}
    </ChartCard>
  );
}

function SprintVelocityTab() {
  const { data, isLoading } = useSprintVelocity();
  if (isLoading) return <ChartSkeleton />;
  if (!data?.sprints?.length) return <p className="py-8 text-center text-sm text-[#78716C]">No completed sprints yet.</p>;

  const trendColor = data.trend === 'IMPROVING' ? '#16a34a' : data.trend === 'DECLINING' ? '#dc2626' : '#78716C';

  return (
    <ChartCard title="Sprint Velocity">
      <div className="mb-4 flex items-center gap-4">
        <div>
          <p className="text-xs text-[#78716C]">Avg Velocity</p>
          <p className="text-lg font-bold text-[#1C1917]">{data.averageVelocity} actions/sprint</p>
        </div>
        <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ color: trendColor, backgroundColor: `${trendColor}15` }}>
          {data.trend.replace(/_/g, ' ')}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data.sprints}>
          <XAxis dataKey="sprint" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E7E5E4', fontSize: 13 }} />
          <Bar dataKey="completedActions" name="Completed" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          <Bar dataKey="totalActions" name="Total" fill="#E7E5E4" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function StackOverviewTab() {
  const { data, isLoading } = useStackOverview();
  if (isLoading) return <ChartSkeleton />;
  if (!data || data.totalTools === 0) return <p className="py-8 text-center text-sm text-[#78716C]">No tools in your stack. <a href="/stack" className="text-[#7c3aed] hover:underline">Add tools</a></p>;

  const pieData = Object.entries(data.byCategory).map(([cat, count], i) => ({
    name: cat.replace(/_/g, ' '),
    value: count,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <ChartCard title="Stack Overview">
      <div className="flex flex-col items-center gap-6 lg:flex-row">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2}>
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E7E5E4', fontSize: 13 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-[#78716C]">Total Tools</p>
              <p className="text-xl font-bold text-[#1C1917]">{data.totalTools}</p>
            </div>
            <div>
              <p className="text-xs text-[#78716C]">Monthly</p>
              <p className="text-xl font-bold text-[#1C1917]">{formatDollar(data.monthlySpend)}</p>
            </div>
            <div>
              <p className="text-xs text-[#78716C]">Active</p>
              <p className="text-xl font-bold text-[#16a34a]">{data.activeTools}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-[#78716C]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

function DashboardAnalytics() {
  const [activeTab, setActiveTab] = useState('maturity');

  const tabs = [
    { key: 'maturity', label: 'Maturity Trend' },
    { key: 'roadmap', label: 'Roadmap' },
    { key: 'value', label: 'Value' },
    { key: 'velocity', label: 'Velocity' },
    { key: 'stack', label: 'Stack' },
  ];

  return (
    <motion.div variants={itemVariants} className="mt-4 rounded-xl border border-[#E7E5E4] bg-white p-6">
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-[#F5F5F4] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-[#1C1917] shadow-sm'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'maturity' && <MaturityTrendTab />}
      {activeTab === 'roadmap' && <RoadmapProgressTab />}
      {activeTab === 'value' && <ValueRealizationTab />}
      {activeTab === 'velocity' && <SprintVelocityTab />}
      {activeTab === 'stack' && <StackOverviewTab />}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Team Readiness & Risk Overview Row
// ---------------------------------------------------------------------------

function TeamReadinessAndRiskRow() {
  const { data: readiness } = useTeamReadiness();
  const { data: risk } = useRiskOverview();
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const { accessToken } = useAuthStore.getState();
      const res = await fetch('/api/v1/dashboard/export?format=pdf', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taurus-board-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Board report exported');
    } catch {
      toast.error('Failed to export board report');
    } finally {
      setExporting(false);
    }
  };

  const READINESS_COLORS = {
    READY: '#16a34a',
    DEVELOPING: '#d97706',
    NOT_READY: '#dc2626',
  };

  return (
    <motion.div variants={itemVariants} className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Team Readiness */}
      <div className="rounded-xl border border-[#E7E5E4] bg-white p-5 lg:col-span-1">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[#1C1917]">Team Readiness</h3>
          {readiness && (
            <span className="text-[11px] text-[#78716C]">
              {readiness.memberCount} members
            </span>
          )}
        </div>
        {readiness ? (
          <div className="space-y-2">
            <div className="mb-3 text-center">
              <span className="text-3xl font-bold text-[#1C1917]">{readiness.overallReadiness}</span>
              <span className="text-sm text-[#78716C]">/100</span>
            </div>
            {readiness.departments.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-[13px]">
                <span className="text-[#44403C]">{d.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#1C1917]">{d.score}</span>
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
                    style={{ backgroundColor: READINESS_COLORS[d.readinessStatus] }}
                  >
                    {d.readinessStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#78716C]">No readiness data yet</p>
        )}
      </div>

      {/* Risk Overview */}
      <div className="rounded-xl border border-[#E7E5E4] bg-white p-5 lg:col-span-1">
        <h3 className="mb-3 text-[13px] font-semibold text-[#1C1917]">Risk Overview</h3>
        {risk ? (
          <div className="space-y-3">
            <div className="mb-3 text-center">
              <span className={`text-3xl font-bold ${
                risk.riskScore <= 20 ? 'text-[#16a34a]' :
                risk.riskScore <= 50 ? 'text-[#d97706]' :
                'text-[#dc2626]'
              }`}>{risk.riskScore}</span>
              <span className="text-sm text-[#78716C]"> risk score</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-[#F5F5F4] px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 text-[#dc2626]" />
                <div>
                  <p className="text-xs text-[#78716C]">Blocked</p>
                  <p className="text-sm font-semibold text-[#1C1917]">{risk.blockedActions}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-[#F5F5F4] px-3 py-2">
                <Clock className="h-3.5 w-3.5 text-[#d97706]" />
                <div>
                  <p className="text-xs text-[#78716C]">Stalled</p>
                  <p className="text-sm font-semibold text-[#1C1917]">{risk.stalledActions}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-[#F5F5F4] px-3 py-2">
                <DollarSign className="h-3.5 w-3.5 text-[#78716C]" />
                <div>
                  <p className="text-xs text-[#78716C]">Untracked</p>
                  <p className="text-sm font-semibold text-[#1C1917]">{risk.untrackedSpendTools}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-[#F5F5F4] px-3 py-2">
                <Calendar className="h-3.5 w-3.5 text-[#3b82f6]" />
                <div>
                  <p className="text-xs text-[#78716C]">Renewals</p>
                  <p className="text-sm font-semibold text-[#1C1917]">{risk.upcomingRenewals}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#78716C]">No risk data yet</p>
        )}
      </div>

      {/* Board Report Export */}
      <div className="rounded-xl border border-[#E7E5E4] bg-white p-5 flex flex-col items-center justify-center gap-4 lg:col-span-1">
        <Shield className="h-10 w-10 text-[#A8A29E]" />
        <div className="text-center">
          <h3 className="text-[13px] font-semibold text-[#1C1917]">Board Report</h3>
          <p className="mt-1 text-xs text-[#78716C]">
            Export a presentation-ready PDF with maturity scores, value metrics, and recommendations
          </p>
        </div>
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="flex items-center gap-2 rounded-lg bg-[#1C1917] px-4 py-2 text-sm font-medium text-white hover:bg-[#292524] disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exporting ? 'Generating...' : 'Export PDF'}
        </button>
      </div>
    </motion.div>
  );
}

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

      {/* AI Transformation Overview */}
      {execLoading ? (
        <ExecutiveOverviewSkeleton />
      ) : showExecOverview ? (
        <ExecutiveOverview data={execData} />
      ) : null}

      {/* Analytics Section */}
      {execLoading ? (
        <motion.div variants={itemVariants} className="mt-4 rounded-xl border border-[#E7E5E4] bg-white p-6">
          <div className="mb-4 flex gap-1 rounded-lg bg-[#F5F5F4] p-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-md" />
            ))}
          </div>
          <ChartSkeleton />
        </motion.div>
      ) : showExecOverview ? (
        <DashboardAnalytics />
      ) : null}

      {/* Team Readiness & Risk Overview */}
      {showExecOverview && <TeamReadinessAndRiskRow />}

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
