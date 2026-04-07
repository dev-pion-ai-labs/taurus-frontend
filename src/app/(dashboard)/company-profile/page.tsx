'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Building2,
  Target,
  Database,
  Wrench,
  Rocket,
  FileText,
  AlertTriangle,
  Zap,
  TrendingUp,
  ChevronRight,
  Sparkles,
  BarChart3,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import { useOnboardingProfile, useOnboardingInsights } from '@/hooks/use-onboarding';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import type { OnboardingInsights } from '@/types';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
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
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ImpactBadge({ impact }: { impact: string }) {
  const styles: Record<string, string> = {
    HIGH: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-stone-100 text-stone-600 border-stone-200',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${styles[impact] || styles.LOW}`}
    >
      {impact}
    </span>
  );
}

function TimeframeBadge({ timeframe }: { timeframe: string }) {
  const labels: Record<string, string> = {
    SHORT: '< 3 months',
    MEDIUM: '3-6 months',
    LONG: '6-12 months',
  };
  return (
    <span className="inline-flex items-center text-[12px] text-[#78716C]">
      {labels[timeframe] || timeframe}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section card wrapper
// ---------------------------------------------------------------------------

function SectionCard({
  icon: Icon,
  title,
  children,
  className = '',
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-xl border border-[#E7E5E4] bg-white p-6 ${className}`}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF1F2]">
          <Icon className="h-4 w-4 text-[#E11D48]" />
        </div>
        <h3 className="text-[15px] font-semibold text-[#1C1917]">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Tag list
// ---------------------------------------------------------------------------

function TagList({ items, custom }: { items: string[]; custom?: string | null }) {
  const all = [...items];
  if (custom && custom.trim()) {
    all.push(custom);
  }

  if (all.length === 0) {
    return <p className="text-sm text-[#A8A29E] italic">None specified</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {all.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-full border border-[#E7E5E4] bg-[#FAFAF9] px-3 py-1 text-[13px] font-medium text-[#44403C]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Readiness score gauge
// ---------------------------------------------------------------------------

function ReadinessGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626';
  const label =
    score >= 70 ? 'Strong' : score >= 40 ? 'Moderate' : 'Early Stage';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-32">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#F5F5F4"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px] font-bold text-[#1C1917]">{score}</span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#78716C]">
            / 100
          </span>
        </div>
      </div>
      <span
        className="text-[13px] font-semibold"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Insights panel
// ---------------------------------------------------------------------------

function InsightsPanel({ insights, isLoading, onRetry }: {
  insights: OnboardingInsights | undefined;
  isLoading: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="rounded-xl border border-[#E7E5E4] bg-gradient-to-br from-white to-[#FFF1F2]/30 p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF1F2]">
              <Sparkles className="h-4 w-4 text-[#E11D48]" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1C1917]">AI Insights</h3>
          </div>
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#E11D48]" />
            <p className="text-sm text-[#78716C]">Analyzing your company profile with AI...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!insights) {
    return (
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-dashed border-[#D6D3D1] bg-[#FAFAF9] p-6 text-center">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-[#A8A29E]" />
          <p className="mb-3 text-sm text-[#78716C]">
            AI insights could not be generated. Try again.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="rounded-full"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Summary + Readiness Score */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl border border-[#E7E5E4] bg-gradient-to-br from-white to-[#FFF1F2]/30 p-6"
      >
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF1F2]">
            <Sparkles className="h-4 w-4 text-[#E11D48]" />
          </div>
          <h3 className="text-[15px] font-semibold text-[#1C1917]">AI Insights</h3>
          <span className="ml-auto text-[11px] font-medium text-[#A8A29E] uppercase tracking-wider">
            Powered by Claude
          </span>
        </div>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <ReadinessGauge score={insights.readinessScore} />
          <div className="flex-1">
            <h4 className="mb-1.5 text-[13px] font-semibold uppercase tracking-wider text-[#78716C]">
              Executive Summary
            </h4>
            <p className="text-[14px] leading-relaxed text-[#44403C]">
              {insights.summary}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Top Opportunities */}
      <SectionCard icon={TrendingUp} title="Top Opportunities">
        <div className="space-y-3">
          {insights.topOpportunities.map((opp, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-[#F5F5F4] bg-[#FAFAF9] p-3.5"
            >
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFF1F2] text-[12px] font-bold text-[#E11D48]">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-semibold text-[#1C1917]">
                    {opp.title}
                  </span>
                  <ImpactBadge impact={opp.impact} />
                  <TimeframeBadge timeframe={opp.timeframe} />
                </div>
                <p className="text-[13px] leading-relaxed text-[#57534E]">
                  {opp.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Quick Wins + Risks side by side */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SectionCard icon={Zap} title="Quick Wins (30 days)">
          <ul className="space-y-2.5">
            {insights.quickWins.map((win, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="text-[13px] leading-relaxed text-[#44403C]">{win}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard icon={AlertTriangle} title="Key Risks & Gaps">
          <ul className="space-y-2.5">
            {insights.risks.map((risk, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span className="text-[13px] leading-relaxed text-[#44403C]">{risk}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Next Steps */}
      <SectionCard icon={ChevronRight} title="Recommended Next Steps">
        <ol className="space-y-3">
          {insights.recommendedNextSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1C1917] text-[12px] font-bold text-white">
                {i + 1}
              </span>
              <span className="text-[13px] leading-relaxed text-[#44403C] pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </SectionCard>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="rounded-xl border border-[#E7E5E4] bg-white p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function CompanyProfilePage() {
  const { data: profile, isLoading: profileLoading } = useOnboardingProfile();
  const {
    data: insights,
    isLoading: insightsLoading,
    refetch: refetchInsights,
    isError: insightsError,
  } = useOnboardingInsights();

  const [activeTab, setActiveTab] = useState<'profile' | 'insights'>('profile');

  if (profileLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-[24px] font-semibold text-[#1C1917]">
          Company Profile
        </h1>
        <div className="rounded-xl border border-dashed border-[#D6D3D1] bg-[#FAFAF9] p-12 text-center">
          <Building2 className="mx-auto mb-3 h-10 w-10 text-[#A8A29E]" />
          <p className="text-sm text-[#78716C]">
            No onboarding data found. Complete the questionnaire first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-4xl"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-[#1C1917]">
            {profile.companyName || 'Company Profile'}
          </h1>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            {profile.industry && (
              <Badge className="bg-[#FFF1F2] text-[#E11D48] hover:bg-[#FFF1F2]">
                {profile.industry.name}
              </Badge>
            )}
            {profile.customIndustry && (
              <Badge variant="outline" className="text-[#57534E]">
                {profile.customIndustry}
              </Badge>
            )}
            {profile.companySize && (
              <Badge variant="outline" className="text-[#57534E]">
                {profile.companySize} employees
              </Badge>
            )}
            <span className="text-[12px] text-[#A8A29E]">
              Completed {formatDate(profile.completedAt)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tab toggle */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="inline-flex rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-[#1C1917] shadow-sm'
                : 'text-[#78716C] hover:text-[#44403C]'
            }`}
          >
            <Building2 className="mr-1.5 inline-block h-3.5 w-3.5" />
            Company Data
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insights')}
            className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-all ${
              activeTab === 'insights'
                ? 'bg-white text-[#1C1917] shadow-sm'
                : 'text-[#78716C] hover:text-[#44403C]'
            }`}
          >
            <Sparkles className="mr-1.5 inline-block h-3.5 w-3.5" />
            AI Insights
          </button>
        </div>
      </motion.div>

      {/* Content */}
      {activeTab === 'profile' ? (
        <motion.div
          key="profile"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* Business Context */}
          <SectionCard icon={Building2} title="Business Context">
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-[#78716C]">
                  Business Description
                </h4>
                <p className="text-[14px] leading-relaxed text-[#44403C]">
                  {profile.businessDescription || 'Not provided'}
                </p>
              </div>
              <div>
                <h4 className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-[#78716C]">
                  Revenue Streams
                </h4>
                <p className="text-[14px] leading-relaxed text-[#44403C]">
                  {profile.revenueStreams || 'Not provided'}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Challenges + Goals side by side */}
          <div className="grid gap-4 sm:grid-cols-2">
            <SectionCard icon={Target} title="Key Challenges">
              <TagList
                items={profile.challenges.selected}
                custom={profile.challenges.custom}
              />
            </SectionCard>

            <SectionCard icon={Rocket} title="AI Goals">
              <TagList
                items={profile.goals.selected}
                custom={profile.goals.custom}
              />
            </SectionCard>
          </div>

          {/* Data + Tools side by side */}
          <div className="grid gap-4 sm:grid-cols-2">
            <SectionCard icon={Database} title="Available Data">
              <TagList
                items={profile.dataAvailability.selected}
                custom={profile.dataAvailability.custom}
              />
            </SectionCard>

            <SectionCard icon={Wrench} title="Tools & Tech Stack">
              <TagList
                items={profile.tools.selected}
                custom={profile.tools.custom}
              />
            </SectionCard>
          </div>

          {/* Documents */}
          {profile.documents.length > 0 && (
            <SectionCard icon={FileText} title="Uploaded Documents">
              <div className="space-y-2">
                {profile.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 rounded-lg border border-[#F5F5F4] bg-[#FAFAF9] px-4 py-3"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-[#E11D48]" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[14px] font-medium text-[#1C1917]">
                        {doc.name}
                      </p>
                      <p className="text-[12px] text-[#A8A29E]">
                        {formatFileSize(doc.size)} &middot; {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </motion.div>
      ) : (
        <InsightsPanel
          insights={insightsError ? undefined : insights}
          isLoading={insightsLoading}
          onRetry={() => refetchInsights()}
        />
      )}
    </motion.div>
  );
}
