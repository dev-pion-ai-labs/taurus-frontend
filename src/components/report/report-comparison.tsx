'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatDollar, getScoreColor } from '@/lib/format';
import type { ExecutiveDashboard } from '@/types';

/* ------------------------------------------------------------------ */
/*  Tooltip                                                            */
/* ------------------------------------------------------------------ */

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-[12px] font-medium text-[#1C1917]">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-[11px] text-[#78716C]">
          Score: <span className="font-semibold text-[#1C1917]">{Math.round(entry.value ?? 0)}</span>
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trend Icon                                                         */
/* ------------------------------------------------------------------ */

function TrendIcon({ trend }: { trend: 'UP' | 'DOWN' | 'STABLE' }) {
  if (trend === 'UP')
    return <TrendingUp className="h-3.5 w-3.5 text-[#16a34a]" />;
  if (trend === 'DOWN')
    return <TrendingDown className="h-3.5 w-3.5 text-[#dc2626]" />;
  return <Minus className="h-3.5 w-3.5 text-[#78716C]" />;
}

/* ------------------------------------------------------------------ */
/*  Delta Badge                                                        */
/* ------------------------------------------------------------------ */

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  const delta = current - previous;
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[12px] font-medium text-[#78716C]">
        <Minus className="h-3 w-3" /> No change
      </span>
    );
  }
  const isPositive = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[12px] font-semibold ${
        isPositive ? 'text-[#16a34a]' : 'text-[#dc2626]'
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="h-3.5 w-3.5" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5" />
      )}
      {isPositive ? '+' : ''}
      {delta}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Score History Line Chart                                           */
/* ------------------------------------------------------------------ */

function ScoreHistoryChart({
  history,
}: {
  history: { date: string; score: number }[];
}) {
  const data = useMemo(
    () =>
      history.map((h) => ({
        date: new Date(h.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        Score: h.score,
      })),
    [history]
  );

  if (data.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-[#E7E5E4] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      <h3 className="mb-1 text-[14px] font-semibold text-[#1C1917]">
        Score Trend
      </h3>
      <p className="mb-5 text-[12px] text-[#A8A29E]">
        AI maturity score over time
      </p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0D9488" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#0D9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#44403C' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#78716C' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<TrendTooltip />} />
            <Line
              type="monotone"
              dataKey="Score"
              stroke="#0D9488"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#0D9488', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#0D9488', strokeWidth: 2, stroke: '#fff' }}
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Department Trends Table                                            */
/* ------------------------------------------------------------------ */

function DepartmentTrendsTable({
  departments,
}: {
  departments: ExecutiveDashboard['departmentScores'];
}) {
  if (!departments.length) return null;

  const statusColors: Record<string, string> = {
    LEADING: '#16a34a',
    ON_TRACK: '#d97706',
    LAGGING: '#dc2626',
  };

  const statusLabels: Record<string, string> = {
    LEADING: 'Leading',
    ON_TRACK: 'On Track',
    LAGGING: 'Lagging',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-xl border border-[#E7E5E4] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      <h3 className="mb-1 text-[14px] font-semibold text-[#1C1917]">
        Department Trends
      </h3>
      <p className="mb-5 text-[12px] text-[#A8A29E]">
        Performance trajectory across departments
      </p>
      <div className="space-y-3">
        {departments.map((dept) => (
          <div
            key={dept.department}
            className="flex items-center gap-3 rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#1C1917]">
                  {dept.department}
                </span>
                <div className="flex items-center gap-2">
                  <TrendIcon trend={dept.trend} />
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: statusColors[dept.status] || '#78716C' }}
                  >
                    {statusLabels[dept.status] || dept.status}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E7E5E4]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: getScoreColor(dept.score) }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${dept.score}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <span
                  className="text-[12px] font-bold"
                  style={{ color: getScoreColor(dept.score) }}
                >
                  {dept.score}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  KPI Delta Cards                                                    */
/* ------------------------------------------------------------------ */

function KpiDeltaCards({
  dashboard,
}: {
  dashboard: ExecutiveDashboard;
}) {
  const kpis = [
    {
      label: 'Current Score',
      value: dashboard.currentScore ?? 0,
      previous: dashboard.previousScore ?? 0,
      format: (v: number) => `${Math.round(v)}`,
    },
    {
      label: 'Total Value',
      value: dashboard.totalValueIdentified ?? 0,
      previous: null as number | null,
      format: formatDollar,
    },
    {
      label: 'Sessions',
      value: dashboard.sessionsCompleted,
      previous: null as number | null,
      format: (v: number) => `${v}`,
    },
    {
      label: 'Recommendations',
      value: dashboard.totalRecommendations,
      previous: null as number | null,
      format: (v: number) => `${v}`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-xl border border-[#E7E5E4] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-[#A8A29E]">
            {kpi.label}
          </p>
          <p className="text-lg font-bold text-[#1C1917]">
            {kpi.format(kpi.value)}
          </p>
          {kpi.previous !== null && (
            <div className="mt-1">
              <DeltaBadge current={kpi.value} previous={kpi.previous} />
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
}

/* ================================================================== */
/*  Main Comparison Section                                            */
/* ================================================================== */

export function ReportComparisonSection({
  dashboard,
}: {
  dashboard: ExecutiveDashboard | undefined;
}) {
  if (!dashboard) return null;

  const hasHistory =
    dashboard.scoreHistory && dashboard.scoreHistory.length >= 2;
  const hasDeptTrends =
    dashboard.departmentScores && dashboard.departmentScores.length > 0;

  if (!hasHistory && !hasDeptTrends) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-[15px] font-semibold text-[#1C1917]">
          Historical Comparison
        </h2>
        <span className="rounded-full bg-[#0D9488]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#0D9488]">
          Trends
        </span>
      </div>

      <div className="space-y-4">
        {/* KPI summary cards */}
        <KpiDeltaCards dashboard={dashboard} />

        {/* Charts grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {hasHistory && (
            <ScoreHistoryChart history={dashboard.scoreHistory} />
          )}
          {hasDeptTrends && (
            <DepartmentTrendsTable departments={dashboard.departmentScores} />
          )}
        </div>
      </div>
    </motion.section>
  );
}
