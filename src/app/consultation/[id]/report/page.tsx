'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  ChevronDown,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  BarChart3,
  Target,
  Zap,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useReport, useRegenerateReport } from '@/hooks/use-report';
import { useExecutiveDashboard } from '@/hooks/use-executive-dashboard';
import { useCountUp } from '@/hooks/use-count-up';
import {
  formatDollar,
  getScoreColor,
  getMaturityColor,
} from '@/lib/format';
import { useAuthStore } from '@/stores/auth-store';
import {
  ValueOverviewSection,
  DepartmentAnalyticsSection,
  RecommendationAnalyticsSection,
  ImplementationAnalyticsSection,
} from '@/components/report/report-charts';
import { PdfExportButton } from '@/components/report/pdf-export';
import { ReportComparisonSection } from '@/components/report/report-comparison';
import type {
  TransformationReport,
  DepartmentScore,
  Recommendation,
  Phase,
} from '@/types';

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const expandVariants: Variants = {
  collapsed: { height: 0, opacity: 0, overflow: 'hidden' },
  expanded: {
    height: 'auto',
    opacity: 1,
    overflow: 'hidden',
    transition: { height: { duration: 0.35, ease: 'easeOut' }, opacity: { duration: 0.25, delay: 0.1 } },
  },
};

/* ------------------------------------------------------------------ */
/*  Category metadata                                                  */
/* ------------------------------------------------------------------ */

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  EFFICIENCY: { label: 'Efficiency', icon: Zap, color: '#2563EB' },
  GROWTH: { label: 'Growth', icon: TrendingUp, color: '#16a34a' },
  EXPERIENCE: { label: 'Experience', icon: Target, color: '#9333EA' },
  INTELLIGENCE: { label: 'Intelligence', icon: Lightbulb, color: '#d97706' },
};

const FILTER_TABS = ['ALL', 'EFFICIENCY', 'GROWTH', 'EXPERIENCE', 'INTELLIGENCE'] as const;

/* ------------------------------------------------------------------ */
/*  Circular Score Gauge                                               */
/* ------------------------------------------------------------------ */

function ScoreGauge({ score, size = 120 }: { score: number; size?: number }) {
  const animatedScore = useCountUp(score, 1800, true);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E7E5E4"
          strokeWidth={10}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        />
      </svg>
      {/* Score label centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#1C1917]">
          {Math.round(animatedScore)}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#78716C]">
          Score
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card with animated counter                                    */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon: Icon,
  format = 'dollar',
  accent = false,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  format?: 'dollar' | 'fte';
  accent?: boolean;
}) {
  const animated = useCountUp(value, 1600, true);

  const formatted =
    format === 'dollar'
      ? formatDollar(Math.round(animated))
      : `${animated.toFixed(1)} FTEs`;

  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? 'border-[#1C1917] bg-[#1C1917] text-white'
          : 'border-[#E7E5E4] bg-white text-[#1C1917]'
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon
          className={`h-4 w-4 ${accent ? 'text-white/70' : 'text-[#78716C]'}`}
        />
        <span
          className={`text-[12px] font-medium uppercase tracking-wider ${
            accent ? 'text-white/70' : 'text-[#78716C]'
          }`}
        >
          {label}
        </span>
      </div>
      <p className="text-xl font-bold">{formatted}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Impact / Effort / Category badges                                  */
/* ------------------------------------------------------------------ */

function ImpactBadge({ impact }: { impact: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const bgMap = { HIGH: 'bg-[#16a34a]', MEDIUM: 'bg-[#d97706]', LOW: 'bg-[#78716C]' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white ${bgMap[impact]}`}>
      {impact} Impact
    </span>
  );
}

function EffortBadge({ effort }: { effort: 'LOW' | 'MEDIUM' | 'HIGH' }) {
  const bgMap = { LOW: 'bg-[#16a34a]', MEDIUM: 'bg-[#d97706]', HIGH: 'bg-[#dc2626]' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white ${bgMap[effort]}`}>
      {effort} Effort
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const meta = CATEGORY_META[category];
  if (!meta) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
      style={{ backgroundColor: meta.color }}
    >
      <meta.icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function TimeframeBadge({ timeframe }: { timeframe: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#E7E5E4] bg-[#F5F5F4] px-2.5 py-0.5 text-[11px] font-medium text-[#44403C]">
      {timeframe}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 1: Hero — Maturity Score + Financial KPIs                  */
/* ------------------------------------------------------------------ */

function HeroSection({ report }: { report: TransformationReport }) {
  const maturityColor = getMaturityColor(report.maturityLevel ?? '');

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="mb-8 flex flex-col items-center gap-5">
        <motion.div variants={itemVariants}>
          <ScoreGauge score={report.overallScore ?? 0} />
        </motion.div>

        <motion.div variants={itemVariants} className="text-center">
          <span
            className="inline-block rounded-full px-4 py-1.5 text-[13px] font-semibold text-white"
            style={{ backgroundColor: maturityColor }}
          >
            {report.maturityLevel}
          </span>
          <p className="mt-2 text-[13px] text-[#78716C]">AI Maturity Level</p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            label="Total AI Value"
            value={report.totalAiValue ?? 0}
            icon={DollarSign}
            accent
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            label="Efficiency"
            value={report.totalEfficiencyValue ?? 0}
            icon={Zap}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            label="Growth"
            value={report.totalGrowthValue ?? 0}
            icon={TrendingUp}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            label="Redeployable"
            value={report.fteRedeployable ?? 0}
            icon={Users}
            format="fte"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 2: Executive Summary                                       */
/* ------------------------------------------------------------------ */

function ExecutiveSummarySection({
  executiveSummary,
}: {
  executiveSummary: NonNullable<TransformationReport['executiveSummary']>;
}) {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.h2
        variants={itemVariants}
        className="mb-4 text-[15px] font-semibold text-[#1C1917]"
      >
        Executive Summary
      </motion.h2>
      <motion.div
        variants={itemVariants}
        className="rounded-xl border border-[#E7E5E4] bg-white p-6"
      >
        <p className="mb-5 text-[15px] leading-relaxed text-[#44403C]">
          {executiveSummary.summary}
        </p>

        {executiveSummary.keyFindings.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[12px] font-medium uppercase tracking-wider text-[#78716C]">
              Key Findings
            </h3>
            <ul className="space-y-2.5">
              {executiveSummary.keyFindings.map((finding, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex items-start gap-2.5"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" />
                  <span className="text-[14px] leading-relaxed text-[#44403C]">
                    {finding}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 3: Department Scores                                       */
/* ------------------------------------------------------------------ */

function DepartmentScoreRow({
  dept,
  index,
  isExpanded,
  onToggle,
}: {
  dept: DepartmentScore;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const barColor = getScoreColor(dept.score);

  return (
    <div className="rounded-xl border border-[#E7E5E4] bg-white">
      {/* Clickable header row */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-[#FAFAF9]"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[#1C1917]">
              {dept.department}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-[#78716C]">
                {formatDollar(dept.efficiencyValue)} eff. + {formatDollar(dept.growthValue)} growth
              </span>
              <span
                className="text-[15px] font-bold"
                style={{ color: barColor }}
              >
                {dept.score}
              </span>
            </div>
          </div>

          {/* Animated bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#F5F5F4]">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: barColor }}
              initial={{ width: 0 }}
              whileInView={{ width: `${dept.score}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
            />
          </div>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#A8A29E] transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expandable workflow breakdown */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            variants={expandVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
          >
            <div className="border-t border-[#E7E5E4] px-4 pb-4 pt-3">
              {/* Current vs Potential */}
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-[#FEF2F2]/50 p-3">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-[#78716C]">
                    Current State
                  </p>
                  <p className="text-[13px] leading-relaxed text-[#44403C]">
                    {dept.currentState}
                  </p>
                </div>
                <div className="rounded-lg bg-[#F0FDF4]/50 p-3">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-[#78716C]">
                    Potential State
                  </p>
                  <p className="text-[13px] leading-relaxed text-[#44403C]">
                    {dept.potentialState}
                  </p>
                </div>
              </div>

              {/* Workflows */}
              <h4 className="mb-3 text-[12px] font-medium uppercase tracking-wider text-[#78716C]">
                Workflow Analysis
              </h4>
              <div className="space-y-3">
                {dept.workflows.map((wf, wfIdx) => (
                  <div
                    key={wfIdx}
                    className="rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] p-3"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h5 className="text-[13px] font-semibold text-[#1C1917]">
                        {wf.name}
                      </h5>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <EffortBadge effort={wf.effort} />
                        <TimeframeBadge timeframe={wf.timeframe} />
                      </div>
                    </div>

                    <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-medium text-[#A8A29E]">Current Process</p>
                        <p className="text-[12px] leading-relaxed text-[#44403C]">{wf.currentProcess}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-[#A8A29E]">AI Opportunity</p>
                        <p className="text-[12px] leading-relaxed text-[#44403C]">{wf.aiOpportunity}</p>
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Automation potential mini-bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-[#78716C]">
                          Automation
                        </span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#E7E5E4]">
                          <motion.div
                            className="h-full rounded-full bg-[#1C1917]"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${wf.automationPotential}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-[#1C1917]">
                          {wf.automationPotential}%
                        </span>
                      </div>

                      <span className="text-[11px] text-[#78716C]">
                        {wf.weeklyHoursSaved}h/wk saved
                      </span>
                      <span className="text-[11px] font-semibold text-[#16a34a]">
                        {formatDollar(wf.annualValueSaved)}/yr
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DepartmentScoresSection({
  departments,
}: {
  departments: DepartmentScore[];
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleDept = (dept: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept);
      else next.add(dept);
      return next;
    });
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <motion.h2
        variants={itemVariants}
        className="mb-4 text-[15px] font-semibold text-[#1C1917]"
      >
        Department Analysis
      </motion.h2>
      <div className="space-y-3">
        {departments.map((dept, i) => (
          <motion.div key={dept.department} variants={itemVariants}>
            <DepartmentScoreRow
              dept={dept}
              index={i}
              isExpanded={expanded.has(dept.department)}
              onToggle={() => toggleDept(dept.department)}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 4: Recommendations                                        */
/* ------------------------------------------------------------------ */

function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="rounded-xl border border-[#E7E5E4] bg-white p-5"
    >
      {/* Top row: category + department */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <CategoryBadge category={rec.category} />
        <span className="rounded-full bg-[#F5F5F4] px-2.5 py-0.5 text-[11px] font-medium text-[#44403C]">
          {rec.department}
        </span>
      </div>

      {/* Title + description */}
      <h3 className="mb-1.5 text-[15px] font-semibold text-[#1C1917]">
        {rec.title}
      </h3>
      <p className="mb-4 text-[13px] leading-relaxed text-[#78716C]">
        {rec.description}
      </p>

      {/* Badges row */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <ImpactBadge impact={rec.impact} />
        <EffortBadge effort={rec.effort} />
      </div>

      {/* Value + timeline */}
      <div className="flex items-center justify-between border-t border-[#E7E5E4] pt-3">
        <span className="text-[14px] font-semibold text-[#1C1917]">
          {formatDollar(rec.annualValue)}/yr
        </span>
        <span className="flex items-center gap-1 text-[12px] text-[#78716C]">
          <Clock className="h-3.5 w-3.5" />
          {rec.timeToImplement}
        </span>
      </div>

      {/* Prerequisites */}
      {rec.prerequisites.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {rec.prerequisites.map((prereq, i) => (
            <span
              key={i}
              className="rounded-md bg-[#F5F5F4] px-2 py-0.5 text-[10px] font-medium text-[#78716C]"
            >
              {prereq}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function RecommendationsSection({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const sorted = useMemo(
    () => [...recommendations].sort((a, b) => b.annualValue - a.annualValue),
    [recommendations]
  );

  const filtered = useMemo(
    () =>
      activeFilter === 'ALL'
        ? sorted
        : sorted.filter((r) => r.category === activeFilter),
    [sorted, activeFilter]
  );

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <motion.h2
        variants={itemVariants}
        className="mb-4 text-[15px] font-semibold text-[#1C1917]"
      >
        Recommendations
      </motion.h2>

      {/* Filter tabs */}
      <motion.div
        variants={itemVariants}
        className="mb-5 flex flex-wrap gap-2"
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveFilter(tab)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
              activeFilter === tab
                ? 'bg-[#1C1917] text-white'
                : 'bg-[#F5F5F4] text-[#78716C] hover:bg-[#E7E5E4] hover:text-[#44403C]'
            }`}
          >
            {tab === 'ALL' ? 'All' : CATEGORY_META[tab]?.label ?? tab}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((rec, i) => (
          <RecommendationCard key={rec.id} rec={rec} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-[13px] text-[#A8A29E]">
          No recommendations in this category.
        </p>
      )}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 5: Implementation Roadmap                                  */
/* ------------------------------------------------------------------ */

function PhaseCard({
  phase,
  index,
  total,
  isExpanded,
  onToggle,
}: {
  phase: Phase;
  index: number;
  total: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isFirst = index === 0;

  return (
    <div className="flex flex-1 flex-col">
      {/* Connector line (desktop) */}
      <div className="relative flex items-center justify-center pb-4">
        {/* Horizontal line connecting phases */}
        {index > 0 && (
          <div className="absolute right-1/2 top-5 hidden h-0.5 w-full bg-[#E7E5E4] md:block" />
        )}
        {index < total - 1 && (
          <div className="absolute left-1/2 top-5 hidden h-0.5 w-full bg-[#E7E5E4] md:block" />
        )}
        {/* Vertical line connecting phases (mobile) */}
        {index > 0 && (
          <div className="absolute bottom-full left-5 h-4 w-0.5 bg-[#E7E5E4] md:hidden" />
        )}

        {/* Phase number circle */}
        <div
          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-bold ${
            isFirst
              ? 'bg-[#1C1917] text-white'
              : 'border-2 border-[#E7E5E4] bg-white text-[#44403C]'
          }`}
        >
          {phase.phase}
        </div>
      </div>

      {/* Phase card */}
      <button
        type="button"
        onClick={onToggle}
        className={`flex-1 rounded-xl border p-4 text-left transition-colors hover:bg-[#FAFAF9] ${
          isFirst
            ? 'border-[#1C1917] bg-white shadow-sm'
            : 'border-[#E7E5E4] bg-white'
        }`}
      >
        <h3 className="mb-1 text-[14px] font-semibold text-[#1C1917]">
          {phase.name}
        </h3>
        <p className="mb-2 text-[12px] font-medium text-[#78716C]">
          {phase.timeframe}
        </p>
        <p className="mb-3 text-[12px] leading-relaxed text-[#A8A29E]">
          {phase.focus}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#1C1917]">
            {formatDollar(phase.totalValue)}
          </span>
          <span className="text-[11px] text-[#78716C]">
            {phase.actions.length} action{phase.actions.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-center">
          <ChevronDown
            className={`h-4 w-4 text-[#A8A29E] transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Expanded actions */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            variants={expandVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="mt-2"
          >
            <div className="rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] p-3">
              <div className="space-y-2">
                {phase.actions.map((action, aIdx) => (
                  <div
                    key={aIdx}
                    className="rounded-lg bg-white p-3 border border-[#E7E5E4]"
                  >
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <h4 className="text-[13px] font-medium text-[#1C1917]">
                        {action.title}
                      </h4>
                      <EffortBadge effort={action.effort} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-[#F5F5F4] px-2 py-0.5 text-[10px] font-medium text-[#44403C]">
                        {action.department}
                      </span>
                      <span className="text-[12px] font-semibold text-[#16a34a]">
                        {formatDollar(action.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImplementationRoadmapSection({ phases }: { phases: Phase[] }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const togglePhase = (phaseNum: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(phaseNum)) next.delete(phaseNum);
      else next.add(phaseNum);
      return next;
    });
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <motion.h2
        variants={itemVariants}
        className="mb-4 text-[15px] font-semibold text-[#1C1917]"
      >
        Implementation Roadmap
      </motion.h2>

      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 md:flex-row"
      >
        {phases.map((phase, i) => (
          <PhaseCard
            key={phase.phase}
            phase={phase}
            index={i}
            total={phases.length}
            isExpanded={expanded.has(phase.phase)}
            onToggle={() => togglePhase(phase.phase)}
          />
        ))}
      </motion.div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading state                                                      */
/* ------------------------------------------------------------------ */

function GeneratingState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      {/* Animated spinner + pulse ring */}
      <div className="relative mb-8">
        <div className="h-16 w-16 rounded-full border-2 border-[#E7E5E4]" />
        <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-[#1C1917]" />
        <div className="absolute -inset-3 animate-pulse rounded-full border border-[#E7E5E4]/50" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-[#1C1917]">
        Your AI Transformation Roadmap is being generated...
      </h2>
      <p className="mb-6 max-w-md text-[15px] leading-relaxed text-[#78716C]">
        This usually takes 1-2 minutes
      </p>
      <div className="flex items-center justify-center gap-1.5">
        <div className="h-2 w-2 animate-pulse rounded-full bg-[#1C1917]" />
        <div className="h-2 w-2 animate-pulse rounded-full bg-[#1C1917] [animation-delay:150ms]" />
        <div className="h-2 w-2 animate-pulse rounded-full bg-[#1C1917] [animation-delay:300ms]" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Error state                                                        */
/* ------------------------------------------------------------------ */

function ErrorState({ sessionId }: { sessionId: string }) {
  const user = useAuthStore((s) => s.user);
  const regenerate = useRegenerateReport(sessionId);
  const isAdmin = user?.role === 'ADMIN';

  const handleRegenerate = async () => {
    try {
      await regenerate.mutateAsync();
      toast.success('Report regeneration started');
    } catch {
      toast.error('Failed to regenerate report');
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF2F2]">
        <AlertTriangle className="h-7 w-7 text-[#dc2626]" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-[#1C1917]">
        Report generation failed
      </h2>
      <p className="mb-8 max-w-md text-[15px] leading-relaxed text-[#78716C]">
        We were unable to generate your transformation report. This could be due to a temporary issue.
      </p>
      <div className="flex flex-col items-center gap-3">
        {isAdmin && (
          <Button
            onClick={handleRegenerate}
            disabled={regenerate.isPending}
            className="h-10 rounded-full bg-[#1C1917] px-6 text-sm font-medium text-white hover:bg-[#1C1917]/90"
          >
            {regenerate.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Regenerating...
              </span>
            ) : (
              'Try Again'
            )}
          </Button>
        )}
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
/*  Not found state                                                    */
/* ------------------------------------------------------------------ */

function NotFoundState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F4]">
        <BarChart3 className="h-7 w-7 text-[#A8A29E]" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-[#1C1917]">
        Report not found
      </h2>
      <p className="mb-8 max-w-md text-[15px] leading-relaxed text-[#78716C]">
        This report does not exist or has not been generated yet.
      </p>
      <Link href="/dashboard">
        <Button className="h-10 rounded-full bg-[#1C1917] px-6 text-sm font-medium text-white hover:bg-[#1C1917]/90">
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Initial loading skeleton                                           */
/* ------------------------------------------------------------------ */

function LoadingSkeleton() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1C1917] border-t-transparent" />
        <p className="text-sm text-[#78716C]">Loading report...</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Completed report view                                              */
/* ------------------------------------------------------------------ */

function CompletedReport({ report }: { report: TransformationReport }) {
  const reportRef = useRef<HTMLDivElement>(null);
  const { data: dashboard, isLoading: dashboardLoading } = useExecutiveDashboard();

  return (
    <div
      className="relative w-[100vw] pb-16"
      style={{ left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}
    >
      <div ref={reportRef} className="mx-auto max-w-4xl space-y-12 px-6">
          {/* Back link + Export button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#78716C] transition-colors hover:text-[#1C1917]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <PdfExportButton reportRef={reportRef} report={report} />
          </motion.div>

          {/* Page title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center"
          >
            <h1 className="mb-1 text-2xl font-bold text-[#1C1917]">
              AI Transformation Report
            </h1>
            {report.generatedAt && (
              <p className="text-[13px] text-[#A8A29E]">
                Generated on{' '}
                {new Date(report.generatedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </motion.div>

          {/* 1. Hero: Score + KPIs */}
          <HeroSection report={report} />

          {/* 2. Value Overview Charts */}
          <ValueOverviewSection report={report} />

          {/* 3. Executive Summary */}
          {report.executiveSummary && (
            <ExecutiveSummarySection executiveSummary={report.executiveSummary} />
          )}

          {/* 4. Department Scores */}
          {report.departmentScores && report.departmentScores.length > 0 && (
            <DepartmentScoresSection departments={report.departmentScores} />
          )}

          {/* 5. Department Analytics Charts */}
          {report.departmentScores && report.departmentScores.length > 0 && (
            <DepartmentAnalyticsSection departments={report.departmentScores} />
          )}

          {/* 6. Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <RecommendationsSection recommendations={report.recommendations} />
          )}

          {/* 7. Recommendation Analytics Charts */}
          {report.recommendations && report.recommendations.length > 0 && (
            <RecommendationAnalyticsSection recommendations={report.recommendations} />
          )}

          {/* 8. Implementation Roadmap */}
          {report.implementationPlan && report.implementationPlan.length > 0 && (
            <ImplementationRoadmapSection phases={report.implementationPlan} />
          )}

          {/* 9. Implementation Analytics Chart */}
          {report.implementationPlan && report.implementationPlan.length > 0 && (
            <ImplementationAnalyticsSection phases={report.implementationPlan} />
          )}

          {/* 10. Historical Comparison */}
          <ReportComparisonSection dashboard={dashboard} isLoading={dashboardLoading} />

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-4 border-t border-[#E7E5E4] pt-10 text-center"
          >
            <p className="text-[14px] text-[#78716C]">
              Ready to start your AI transformation journey?
            </p>
            <Link href="/dashboard">
              <Button className="h-10 rounded-full bg-[#1C1917] px-6 text-sm font-medium text-white hover:bg-[#1C1917]/90">
                <span className="flex items-center gap-2">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = React.use(params);
  const { data: report, isLoading, isError } = useReport(sessionId);

  // Initial loading
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // 404 / fetch error
  if (isError || !report) {
    return <NotFoundState />;
  }

  // Report is generating
  if (report.status === 'GENERATING') {
    return <GeneratingState />;
  }

  // Report generation failed
  if (report.status === 'FAILED') {
    return <ErrorState sessionId={sessionId} />;
  }

  // Completed
  return <CompletedReport report={report} />;
}
