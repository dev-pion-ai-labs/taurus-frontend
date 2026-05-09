'use client';

import { toast } from 'sonner';
import type { IntegrationProvider } from '@/types';
import { getProviderBrand, ProviderIcon } from './provider-brand';

/**
 * Provider-themed sonner toasts. The icon + accent ring make it instantly
 * obvious *which* integration the message refers to (vs. a generic green
 * checkmark) — useful when several actions are in flight at once.
 */

export function brandedSuccessToast(
  provider: IntegrationProvider,
  title: string,
  description?: string,
) {
  const { accent, gradient } = getProviderBrand(provider);
  toast.custom(
    (t) => (
      <div
        className="flex items-start gap-3 rounded-xl border p-3.5 shadow-lg backdrop-blur"
        style={{
          background: gradient,
          borderColor: `${accent}33`,
          minWidth: 320,
        }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm"
          style={{ boxShadow: `0 0 0 1px ${accent}22` }}
        >
          <ProviderIcon provider={provider} className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1C1917] leading-tight">{title}</p>
          {description && (
            <p className="text-xs text-[#57534E] mt-0.5 leading-snug">{description}</p>
          )}
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="text-[#A8A29E] hover:text-[#57534E] text-xs leading-none mt-0.5"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    ),
    { duration: 4000 },
  );
}

export function brandedErrorToast(
  provider: IntegrationProvider,
  title: string,
  description?: string,
) {
  const { accent } = getProviderBrand(provider);
  toast.custom(
    (t) => (
      <div
        className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 shadow-lg"
        style={{ minWidth: 320 }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm"
          style={{ boxShadow: `0 0 0 1px ${accent}33` }}
        >
          <ProviderIcon provider={provider} className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-900 leading-tight">{title}</p>
          {description && (
            <p className="text-xs text-red-700 mt-0.5 leading-snug">{description}</p>
          )}
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="text-red-400 hover:text-red-600 text-xs leading-none mt-0.5"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    ),
    { duration: 5000 },
  );
}
