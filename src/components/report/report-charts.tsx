'use client';

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { formatDollar, getScoreColor } from '@/lib/format';
import type {
  TransformationReport,
  DepartmentScore,
  Recommendation,
  Phase,
} from '@/types';

/* ------------------------------------------------------------------ */
/*  Design Tokens                                                      */
/* ------------------------------------------------------------------ */

const COLORS = {
  efficiency: '#2563EB',
  growth: '#16a34a',
  experience: '#9333EA',
  intelligence: '#d97706',
  teal: '#0D9488',
  rose: '#E11D48',
  blue: '#2563EB',
  indigo: '#6366F1',
  slate: '#475569',
};

const CATEGORY_COLORS: Record<string, string> = {
  EFFICIENCY: COLORS.efficiency,
  GROWTH: COLORS.growth,
  EXPERIENCE: COLORS.experience,
  INTELLIGENCE: COLORS.intelligence,
};

const CATEGORY_LABELS: Record<string, string> = {
  EFFICIENCY: 'Efficiency',
  GROWTH: 'Growth',
  EXPERIENCE: 'Experience',
  INTELLIGENCE: 'Intelligence',
};

/* ------------------------------------------------------------------ */
/*  Chart Card wrapper                                                 */
/* ------------------------------------------------------------------ */

function ChartCard({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`rounded-xl border border-[#E7E5E4] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}
    >
      <div className="mb-5">
        <h3 className="text-[14px] font-semibold text-[#1C1917]">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-[12px] text-[#A8A29E]">{subtitle}</p>
        )}
      </div>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom Tooltip                                                     */
/* ------------------------------------------------------------------ */

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = formatDollar,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  valueFormatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 shadow-lg">
      {label && (
        <p className="mb-1 text-[12px] font-medium text-[#1C1917]">{label}</p>
      )}
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-1.5 text-[11px] text-[#78716C]">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {valueFormatter(entry.value ?? 0)}
        </p>
      ))}
    </div>
  );
}

function ScoreTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  return (
    <ChartTooltip
      active={active}
      payload={payload}
      label={label}
      valueFormatter={(v) => `${Math.round(v)}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  1. Value Distribution Donut                                        */
/* ------------------------------------------------------------------ */

function ValueDistributionChart({
  efficiencyValue,
  growthValue,
}: {
  efficiencyValue: number;
  growthValue: number;
}) {
  const data = useMemo(
    () => [
      { name: 'Efficiency', value: efficiencyValue },
      { name: 'Growth', value: growthValue },
    ],
    [efficiencyValue, growthValue]
  );

  const total = efficiencyValue + growthValue;
  const colors = [COLORS.efficiency, COLORS.growth];

  return (
    <ChartCard title="Value Distribution" subtitle="Efficiency vs Growth value breakdown">
      <div className="flex items-center gap-6">
        <div className="h-[180px] w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                animationBegin={200}
                animationDuration={1000}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-3">
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#A8A29E]">
              Total Value
            </p>
            <p className="text-xl font-bold text-[#1C1917]">
              {formatDollar(total)}
            </p>
          </div>
          <div className="space-y-2">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: colors[i] }}
                />
                <span className="text-[12px] text-[#78716C]">{d.name}</span>
                <span className="ml-auto text-[12px] font-semibold text-[#1C1917]">
                  {formatDollar(d.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Department Score Comparison                                     */
/* ------------------------------------------------------------------ */

function DepartmentScoreChart({
  departments,
}: {
  departments: DepartmentScore[];
}) {
  const data = useMemo(
    () =>
      [...departments]
        .sort((a, b) => b.score - a.score)
        .map((d) => ({
          department: d.department.length > 14 ? d.department.slice(0, 14) + '…' : d.department,
          score: d.score,
          fill: getScoreColor(d.score),
        })),
    [departments]
  );

  return (
    <ChartCard
      title="Department Scores"
      subtitle="AI readiness by department"
    >
      <div style={{ height: Math.max(180, departments.length * 40) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <YAxis
              dataKey="department"
              type="category"
              width={110}
              tick={{ fontSize: 11, fill: '#44403C' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ScoreTooltip />} cursor={{ fill: '#F5F5F4' }} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1000}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Department Value Breakdown (Stacked Bar)                        */
/* ------------------------------------------------------------------ */

function DepartmentValueChart({
  departments,
}: {
  departments: DepartmentScore[];
}) {
  const data = useMemo(
    () =>
      [...departments]
        .sort((a, b) => (b.efficiencyValue + b.growthValue) - (a.efficiencyValue + a.growthValue))
        .map((d) => ({
          department: d.department.length > 12 ? d.department.slice(0, 12) + '…' : d.department,
          Efficiency: d.efficiencyValue,
          Growth: d.growthValue,
        })),
    [departments]
  );

  return (
    <ChartCard
      title="Value by Department"
      subtitle="Efficiency + Growth value per department"
    >
      <div style={{ height: Math.max(200, departments.length * 44) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#78716C' }}
              tickFormatter={(v) => formatDollar(v)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="department"
              type="category"
              width={100}
              tick={{ fontSize: 11, fill: '#44403C' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F5F5F4' }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: '#78716C' }}
            />
            <Bar dataKey="Efficiency" stackId="value" fill={COLORS.efficiency} radius={[0, 0, 0, 0]} barSize={20} animationDuration={1000} />
            <Bar dataKey="Growth" stackId="value" fill={COLORS.growth} radius={[0, 4, 4, 0]} barSize={20} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/*  4. Category Distribution Donut                                     */
/* ------------------------------------------------------------------ */

function CategoryDistributionChart({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    recommendations.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return Object.entries(counts).map(([cat, count]) => ({
      name: CATEGORY_LABELS[cat] || cat,
      value: count,
      color: CATEGORY_COLORS[cat] || '#78716C',
    }));
  }, [recommendations]);

  return (
    <ChartCard
      title="Recommendation Breakdown"
      subtitle="Distribution across categories"
    >
      <div className="flex items-center gap-6">
        <div className="h-[180px] w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                animationBegin={200}
                animationDuration={1000}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={
                  <ChartTooltip
                    valueFormatter={(v) => `${v} recommendation${v !== 1 ? 's' : ''}`}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#A8A29E]">
            {recommendations.length} Total
          </p>
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-[12px] text-[#78716C]">{d.name}</span>
              <span className="ml-auto text-[12px] font-semibold text-[#1C1917]">
                {d.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/*  5. Automation Potential (Horizontal Bar)                           */
/* ------------------------------------------------------------------ */

function AutomationPotentialChart({
  departments,
}: {
  departments: DepartmentScore[];
}) {
  const data = useMemo(
    () =>
      departments
        .filter((d) => d.workflows.length > 0)
        .map((d) => {
          const avgPotential =
            d.workflows.reduce((sum, w) => sum + w.automationPotential, 0) /
            d.workflows.length;
          const totalHours = d.workflows.reduce(
            (sum, w) => sum + w.weeklyHoursSaved,
            0
          );
          return {
            department: d.department.length > 14 ? d.department.slice(0, 14) + '…' : d.department,
            'Avg. Automation': Math.round(avgPotential),
            'Hours Saved/wk': totalHours,
          };
        })
        .sort((a, b) => b['Avg. Automation'] - a['Avg. Automation']),
    [departments]
  );

  return (
    <ChartCard
      title="Automation Landscape"
      subtitle="Average automation potential & weekly hours saved"
    >
      <div style={{ height: Math.max(180, data.length * 44) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <YAxis
              dataKey="department"
              type="category"
              width={110}
              tick={{ fontSize: 11, fill: '#44403C' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ScoreTooltip />} cursor={{ fill: '#F5F5F4' }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Avg. Automation" fill={COLORS.teal} radius={[0, 4, 4, 0]} barSize={14} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Hours saved summary row */}
      <div className="mt-4 flex flex-wrap gap-3 border-t border-[#E7E5E4] pt-4">
        {data.map((d) => (
          <div
            key={d.department}
            className="flex items-center gap-1.5 rounded-full bg-[#F5F5F4] px-2.5 py-1"
          >
            <span className="text-[11px] text-[#78716C]">{d.department}</span>
            <span className="text-[11px] font-semibold text-[#0D9488]">
              {d['Hours Saved/wk']}h/wk
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/*  6. Implementation Value Curve (Area Chart)                         */
/* ------------------------------------------------------------------ */

function ImplementationValueChart({ phases }: { phases: Phase[] }) {
  const data = useMemo(() => {
    let cumulative = 0;
    return phases.map((p) => {
      cumulative += p.totalValue;
      return {
        phase: p.name,
        'Phase Value': p.totalValue,
        'Cumulative Value': cumulative,
      };
    });
  }, [phases]);

  return (
    <ChartCard
      title="Implementation Value Curve"
      subtitle="Projected value realization across phases"
      className="col-span-full"
    >
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="cumulativeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.2} />
                <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="phaseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.15} />
                <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
            <XAxis
              dataKey="phase"
              tick={{ fontSize: 11, fill: '#44403C' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#78716C' }}
              tickFormatter={(v) => formatDollar(v)}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="Cumulative Value"
              stroke={COLORS.teal}
              strokeWidth={2}
              fill="url(#cumulativeGrad)"
              animationDuration={1200}
            />
            <Area
              type="monotone"
              dataKey="Phase Value"
              stroke={COLORS.blue}
              strokeWidth={2}
              fill="url(#phaseGrad)"
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/*  7. Impact vs Value scatter-like summary                            */
/* ------------------------------------------------------------------ */

function RecommendationImpactChart({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  const data = useMemo(() => {
    const impactOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const effortOrder = { LOW: 1, MEDIUM: 2, HIGH: 3 };

    return [...recommendations]
      .sort((a, b) => b.annualValue - a.annualValue)
      .slice(0, 8)
      .map((r) => ({
        title:
          r.title.length > 28 ? r.title.slice(0, 28) + '…' : r.title,
        'Annual Value': r.annualValue,
        impact: impactOrder[r.impact],
        effort: effortOrder[r.effort],
        fill: CATEGORY_COLORS[r.category] || '#78716C',
      }));
  }, [recommendations]);

  return (
    <ChartCard
      title="Top Recommendations by Value"
      subtitle="Highest annual value opportunities"
    >
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
            <XAxis
              dataKey="title"
              tick={{ fontSize: 10, fill: '#44403C' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#78716C' }}
              tickFormatter={(v) => formatDollar(v)}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F5F5F4' }} />
            <Bar dataKey="Annual Value" radius={[4, 4, 0, 0]} barSize={28} animationDuration={1000}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/* ================================================================== */
/*  Composite Section Components                                       */
/* ================================================================== */

export function ValueOverviewSection({
  report,
}: {
  report: TransformationReport;
}) {
  if (!report.totalEfficiencyValue && !report.totalGrowthValue) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="mb-4 text-[15px] font-semibold text-[#1C1917]">
        Value Overview
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ValueDistributionChart
          efficiencyValue={report.totalEfficiencyValue ?? 0}
          growthValue={report.totalGrowthValue ?? 0}
        />
        {report.departmentScores && report.departmentScores.length > 0 && (
          <DepartmentValueChart departments={report.departmentScores} />
        )}
      </div>
    </motion.section>
  );
}

export function DepartmentAnalyticsSection({
  departments,
}: {
  departments: DepartmentScore[];
}) {
  if (!departments.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="mb-4 text-[15px] font-semibold text-[#1C1917]">
        Department Analytics
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DepartmentScoreChart departments={departments} />
        <AutomationPotentialChart departments={departments} />
      </div>
    </motion.section>
  );
}

export function RecommendationAnalyticsSection({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  if (!recommendations.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="mb-4 text-[15px] font-semibold text-[#1C1917]">
        Recommendation Analytics
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CategoryDistributionChart recommendations={recommendations} />
        <RecommendationImpactChart recommendations={recommendations} />
      </div>
    </motion.section>
  );
}

export function ImplementationAnalyticsSection({
  phases,
}: {
  phases: Phase[];
}) {
  if (!phases.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="mb-4 text-[15px] font-semibold text-[#1C1917]">
        Implementation Analytics
      </h2>
      <ImplementationValueChart phases={phases} />
    </motion.section>
  );
}
