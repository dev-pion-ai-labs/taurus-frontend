'use client';

import { formatDollar } from '@/lib/format';
import { AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import type { TrackerStats } from '@/types';

interface TrackerStatsBannerProps {
  stats: TrackerStats;
}

export function TrackerStatsBanner({ stats }: TrackerStatsBannerProps) {
  const pct =
    stats.valueIdentified > 0
      ? Math.round((stats.valueRealized / stats.valueIdentified) * 100)
      : 0;

  return (
    <div className="rounded-xl border border-[#E7E5E4] bg-white p-4">
      {/* Value realized progress */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-[#1C1917]">
            {formatDollar(stats.valueRealized)}{' '}
            <span className="text-[#A8A29E] font-normal">
              of {formatDollar(stats.valueIdentified)} realized
            </span>
          </p>
        </div>
        <span className="text-sm font-bold text-[#1C1917]">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-[#F5F5F4] rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 text-sm">
          <Zap className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-semibold text-[#1C1917]">{stats.activeActions}</span>
          <span className="text-[#78716C]">active</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-semibold text-[#1C1917]">{stats.completedActions}</span>
          <span className="text-[#78716C]">completed</span>
        </div>
        {stats.blockedCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span className="font-semibold text-red-600">{stats.blockedCount}</span>
            <span className="text-[#78716C]">blocked</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-sm ml-auto">
          <span className="text-[#A8A29E]">{stats.total} total actions</span>
        </div>
      </div>
    </div>
  );
}
