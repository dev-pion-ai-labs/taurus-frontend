'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Mail,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Cpu,
  Lightbulb,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { useDiscoveryScan, useDiscoveryReport } from '@/hooks/use-discovery';
import type { DiscoveryReport } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const MATURITY_LABELS: Record<string, string> = {
  AI_UNAWARE: 'AI Unaware',
  AI_CURIOUS: 'AI Curious',
  AI_EXPERIMENTING: 'AI Experimenting',
  AI_SCALING: 'AI Scaling',
  AI_NATIVE: 'AI Native',
};

const MATURITY_COLORS: Record<string, string> = {
  AI_UNAWARE: '#dc2626',
  AI_CURIOUS: '#f59e0b',
  AI_EXPERIMENTING: '#d97706',
  AI_SCALING: '#22c55e',
  AI_NATIVE: '#16a34a',
};

function ScoreGauge({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626';

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#E7E5E4"
          strokeWidth="10"
        />
        <motion.circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          transform="rotate(-90 90 90)"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-[#1C1917]">{score}</span>
        <span className="text-sm text-[#78716C]">out of 100</span>
      </div>
    </div>
  );
}

const SCANNING_STEPS = [
  'Scanning website...',
  'Detecting tech stack...',
  'Analyzing AI signals...',
  'Generating insights...',
];

function ScanningState() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < SCANNING_STEPS.length - 1 ? s + 1 : s));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-20"
    >
      <Loader2 className="h-12 w-12 animate-spin text-[#7c3aed]" />
      <div className="text-center">
        <p className="text-lg font-semibold text-[#1C1917]">
          {SCANNING_STEPS[step]}
        </p>
        <p className="mt-1 text-sm text-[#78716C]">
          This typically takes 30-60 seconds
        </p>
      </div>
      <div className="flex gap-2">
        {SCANNING_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors duration-300 ${
              i <= step ? 'bg-[#7c3aed]' : 'bg-[#E7E5E4]'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ResultsView({ report }: { report: DiscoveryReport }) {
  const maturityLabel =
    MATURITY_LABELS[report.maturityLevel || ''] || report.maturityLevel || 'Unknown';
  const maturityColor =
    MATURITY_COLORS[report.maturityLevel || ''] || '#78716C';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-3xl space-y-8 px-4 pb-20"
    >
      {/* Score */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center gap-4 rounded-xl border border-[#E7E5E4] bg-white p-8"
      >
        <ScoreGauge score={report.score ?? 0} />
        <div
          className="rounded-full px-4 py-1 text-sm font-semibold text-white"
          style={{ backgroundColor: maturityColor }}
        >
          {maturityLabel}
        </div>
        {report.industry && (
          <p className="text-sm text-[#78716C]">
            Detected industry: {report.industry}
            {report.companySize && ` · ${report.companySize} employees`}
          </p>
        )}
      </motion.div>

      {/* Summary */}
      {report.summary && (
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-[#E7E5E4] bg-white p-6"
        >
          <h3 className="mb-3 text-lg font-semibold text-[#1C1917]">
            Executive Summary
          </h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[#3f3f46]">
            {report.summary}
          </p>
        </motion.div>
      )}

      {/* Tech Stack */}
      {report.techStack && report.techStack.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-[#E7E5E4] bg-white p-6"
        >
          <div className="mb-3 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#7c3aed]" />
            <h3 className="text-lg font-semibold text-[#1C1917]">
              Detected Tech Stack
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.techStack.map((tool, i) => (
              <span
                key={i}
                className="rounded-full border border-[#E7E5E4] bg-[#FAFAF9] px-3 py-1 text-sm text-[#1C1917]"
              >
                {tool.name}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Signals */}
      {report.aiSignals && report.aiSignals.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-[#E7E5E4] bg-white p-6"
        >
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#16a34a]" />
            <h3 className="text-lg font-semibold text-[#1C1917]">
              AI Signals Detected
            </h3>
          </div>
          <ul className="space-y-2">
            {report.aiSignals.map((signal, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#3f3f46]">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#16a34a]" />
                <span>
                  <strong className="text-[#1C1917]">
                    {signal.type.replace(/_/g, ' ')}:
                  </strong>{' '}
                  {signal.detail}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Recommendations */}
      {report.recommendations && report.recommendations.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-[#E7E5E4] bg-white p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-[#d97706]" />
            <h3 className="text-lg font-semibold text-[#1C1917]">
              Recommendations
            </h3>
          </div>
          <div className="space-y-3">
            {report.recommendations.map((rec, i) => (
              <div
                key={i}
                className="rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-[#1C1917]">{rec.title}</h4>
                  {rec.priority && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        rec.priority === 'HIGH'
                          ? 'bg-red-50 text-red-700'
                          : rec.priority === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {rec.priority}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[#78716C]">{rec.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl border-2 border-[#7c3aed] bg-[#7c3aed]/5 p-8 text-center"
      >
        <h3 className="text-xl font-bold text-[#1C1917]">
          Want the full picture?
        </h3>
        <p className="mt-2 text-sm text-[#78716C]">
          This is a preliminary scan based on public information. Get a
          comprehensive AI transformation report with department-level scoring
          and a dollar-quantified roadmap.
        </p>
        <a
          href="/login"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6d28d9]"
        >
          Start Full Consultation
          <ArrowRight className="h-4 w-4" />
        </a>
      </motion.div>
    </motion.div>
  );
}

export default function DiscoveryPage() {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [scanId, setScanId] = useState<string | null>(null);

  const scan = useDiscoveryScan();
  const { data: report } = useDiscoveryReport(scanId);

  const isScanning =
    scan.isPending || (report?.status === 'GENERATING');
  const hasResults = report?.status === 'COMPLETED';
  const hasFailed = scan.isError || report?.status === 'FAILED';

  const handleScan = () => {
    if (!url.trim()) return;
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    scan.mutate(
      { url: normalized, email: email || undefined },
      {
        onSuccess: (data) => setScanId(data.id),
      },
    );
  };

  const handleRetry = () => {
    setScanId(null);
    scan.reset();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:py-20">
      {/* Hero */}
      {!isScanning && !hasResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7c3aed]/10">
            <Globe className="h-8 w-8 text-[#7c3aed]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1C1917] lg:text-4xl">
            AI Readiness Scanner
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-[#78716C]">
            Paste your company website and get an instant AI maturity score with
            actionable recommendations. No sign-up required.
          </p>

          <div className="mx-auto mt-8 max-w-md space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8A29E]" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="yourcompany.com"
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  className="w-full rounded-lg border border-[#E7E5E4] bg-white py-3 pl-10 pr-4 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
                />
              </div>
              <button
                onClick={handleScan}
                disabled={!url.trim() || scan.isPending}
                className="shrink-0 rounded-lg bg-[#7c3aed] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6d28d9] disabled:opacity-50"
              >
                Scan
              </button>
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8A29E]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional — we'll send you the results)"
                className="w-full rounded-lg border border-[#E7E5E4] bg-white py-3 pl-10 pr-4 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
              />
            </div>
          </div>

          {hasFailed && (
            <div className="mx-auto mt-6 flex max-w-md items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                {scan.error instanceof Error
                  ? scan.error.message
                  : 'Scan failed. The website may be unreachable.'}
              </span>
              <button
                onClick={handleRetry}
                className="ml-auto flex items-center gap-1 font-medium text-red-800 hover:underline"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Scanning */}
      {isScanning && <ScanningState />}

      {/* Results */}
      {hasResults && report && <ResultsView report={report} />}
    </div>
  );
}
