'use client';

import type { IntegrationProvider } from '@/types';

/**
 * Brand assets for each integration provider.
 *
 * - `Icon`: an inline SVG component that renders the provider's mark.
 *   Sized via the parent container (uses `width`/`height` 100%).
 * - `gradient`: tailwind-friendly inline-style gradient used as the card
 *   background when a connection is active. Brand-toned but kept subtle so
 *   text stays readable on light backgrounds.
 * - `accent`: solid brand color, used for borders, dots, ring on toasts.
 *
 * SVG paths are simplified brand glyphs — recognisable but small enough to
 * inline. Replace with full official marks if a brand kit becomes available.
 */

interface BrandSpec {
  Icon: React.FC<{ className?: string }>;
  /** CSS gradient, applied via style.background on connected cards */
  gradient: string;
  /** Solid brand colour used for accents (border, ring, dot) */
  accent: string;
  /** Slightly tinted text colour readable on the gradient */
  ink: string;
}

const SlackIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#E01E5A" d="M5.04 15.16a2.52 2.52 0 0 1-2.52 2.52A2.52 2.52 0 0 1 0 15.16a2.52 2.52 0 0 1 2.52-2.52h2.52v2.52Zm1.27 0a2.52 2.52 0 0 1 2.52-2.52 2.52 2.52 0 0 1 2.52 2.52v6.31A2.52 2.52 0 0 1 8.83 24a2.52 2.52 0 0 1-2.52-2.52v-6.32Z" />
    <path fill="#36C5F0" d="M8.83 5.04a2.52 2.52 0 0 1-2.52-2.52A2.52 2.52 0 0 1 8.83 0a2.52 2.52 0 0 1 2.52 2.52v2.52H8.83Zm0 1.27a2.52 2.52 0 0 1 2.52 2.52 2.52 2.52 0 0 1-2.52 2.52H2.52A2.52 2.52 0 0 1 0 8.83a2.52 2.52 0 0 1 2.52-2.52h6.31Z" />
    <path fill="#2EB67D" d="M18.96 8.83a2.52 2.52 0 0 1 2.52-2.52A2.52 2.52 0 0 1 24 8.83a2.52 2.52 0 0 1-2.52 2.52h-2.52V8.83Zm-1.27 0a2.52 2.52 0 0 1-2.52 2.52 2.52 2.52 0 0 1-2.52-2.52V2.52A2.52 2.52 0 0 1 15.17 0a2.52 2.52 0 0 1 2.52 2.52v6.31Z" />
    <path fill="#ECB22E" d="M15.17 18.96a2.52 2.52 0 0 1 2.52 2.52A2.52 2.52 0 0 1 15.17 24a2.52 2.52 0 0 1-2.52-2.52v-2.52h2.52Zm0-1.27a2.52 2.52 0 0 1-2.52-2.52 2.52 2.52 0 0 1 2.52-2.52h6.31A2.52 2.52 0 0 1 24 15.17a2.52 2.52 0 0 1-2.52 2.52h-6.31Z" />
  </svg>
);

const NotionIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#FFF" d="M2 2h20v20H2z" />
    <path fill="#000" d="M4.46 3.43c.7.57 1 .53 2.27.45L18.7 3.16c.26 0 .04-.26-.04-.3L16.69.46c-.4-.3-.92-.65-1.92-.57L3.32 1.78c-.43.04-.52.26-.35.43Zm.7 2.7v12.2c0 .65.34 .9 1.1.86l13.16-.78c.78-.04.87-.51.87-1.04V5.25c0-.52-.2-.8-.65-.77L4.94 5.27c-.5 0-.78.27-.78.86Zm12.86.65c.09.4 0 .82-.4.86l-.6.13v8.94c-.52.27-1 .43-1.4.43-.65 0-.82-.21-1.3-.82l-3.95-6.18v5.97l1.22.27s0 .73-1.03.73l-2.83.18c-.09-.18 0-.65.3-.73l.81-.21V7.91l-1.13-.09c-.09-.4.13-.99.74-1.04l3.04-.18 4.18 6.36v-5.6l-1.04-.13c-.09-.51.27-.86.74-.91l2.65-.18Z" />
  </svg>
);

const JiraIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="jira-a" x1="22.034" x2="17.118" y1="11.39" y2="16.42" gradientUnits="userSpaceOnUse">
        <stop offset=".18" stopColor="#0052CC" />
        <stop offset="1" stopColor="#2684FF" />
      </linearGradient>
      <linearGradient id="jira-b" x1="2.114" x2="6.94" y1="12.671" y2="7.6" gradientUnits="userSpaceOnUse">
        <stop offset=".18" stopColor="#0052CC" />
        <stop offset="1" stopColor="#2684FF" />
      </linearGradient>
    </defs>
    <path fill="#2684FF" d="M11.53 2H1.06a4.69 4.69 0 0 0 4.69 4.69h1.93v1.86a4.69 4.69 0 0 0 4.69 4.69V2.81a.81.81 0 0 0-.84-.81Z" />
    <path fill="url(#jira-a)" d="M16.76 7.21H6.29a4.69 4.69 0 0 0 4.69 4.69h1.93v1.86a4.69 4.69 0 0 0 4.69 4.69V8.02a.81.81 0 0 0-.84-.81Z" />
    <path fill="url(#jira-b)" d="M22 12.42H11.53a4.69 4.69 0 0 0 4.69 4.69h1.93v1.86A4.69 4.69 0 0 0 22.84 23.66V13.23a.81.81 0 0 0-.84-.81Z" />
  </svg>
);

const GoogleDriveIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#0066DA" d="M1.81 15.12 2.86 16.94c.22.39.54.69.92.91L7.36 11H0c0 .43.11.86.33 1.25Z" />
    <path fill="#00AC47" d="M12 5 8.27 11h7.46L12 5Z" />
    <path fill="#EA4335" d="M15.73 11h7.36c0-.43-.11-.86-.33-1.25l-3.58-6.21a2.51 2.51 0 0 0-.92-.91L15.73 11Z" />
    <path fill="#00832D" d="M12 5 8.27 11l-3.49-6.07c.22-.21.54-.41.92-.41H14.3c.38 0 .7.2.92.41L12 5Z" />
    <path fill="#2684FC" d="M19.36 17.85a2.51 2.51 0 0 0 .92-.91l.43-.74 2.06-3.57c.22-.39.33-.82.33-1.25h-7.37l1.57 3.08 2.06 3.39Z" />
    <path fill="#FFBA00" d="M3.78 17.85 7.36 11l3.73 6.07-3.58 6.21a2.51 2.51 0 0 1-.92-.41l-2.81-4.92c-.22-.21-.54-.41-.92-.41V18a2.51 2.51 0 0 0 .92.41Z" />
  </svg>
);

const SalesforceIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#00A1E0" d="M9.86 6.59a4.18 4.18 0 0 1 3.05-1.31 4.25 4.25 0 0 1 3.69 2.13 5.13 5.13 0 0 1 2.1-.45 5.18 5.18 0 0 1 0 10.36 5.07 5.07 0 0 1-1.02-.1 3.79 3.79 0 0 1-3.27 1.91 3.74 3.74 0 0 1-1.65-.38 4.31 4.31 0 0 1-3.99 2.66 4.36 4.36 0 0 1-4.07-2.83 4 4 0 0 1-.84.09 4.13 4.13 0 0 1-2-7.74 4.74 4.74 0 0 1 8.0-4.34Z" />
  </svg>
);

const HubSpotIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#FF7A59" d="M18.16 9.4V7a1.84 1.84 0 0 0 1.06-1.66v-.06a1.84 1.84 0 0 0-1.84-1.84h-.06a1.84 1.84 0 0 0-1.84 1.84v.06A1.84 1.84 0 0 0 16.54 7v2.4a5.22 5.22 0 0 0-2.48 1.09L7.51 5.4a2.07 2.07 0 1 0-1.07 1.32l6.45 5.02a5.22 5.22 0 0 0 .08 5.89l-1.96 1.96a1.69 1.69 0 0 0-.49-.07 1.7 1.7 0 1 0 1.7 1.7c0-.17-.03-.33-.07-.49l1.94-1.94a5.23 5.23 0 1 0 4.07-9.39Zm-.81 7.83a2.68 2.68 0 1 1 0-5.36 2.68 2.68 0 0 1 0 5.36Z" />
  </svg>
);

const ZapierIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#FF4A00" d="M14.92 12 19 12.97a7.9 7.9 0 0 1-.58 2.21l-3.7-1.68 2.49 3.18a8 8 0 0 1-1.6 1.6l-3.18-2.49 1.68 3.7a7.9 7.9 0 0 1-2.2.58L11 16h-.02l-.97 4.08a7.9 7.9 0 0 1-2.21-.58l1.68-3.7-3.18 2.49a8 8 0 0 1-1.6-1.6l2.49-3.18-3.7 1.68a7.9 7.9 0 0 1-.58-2.2L7 12.02V12L2.92 11.03a7.9 7.9 0 0 1 .58-2.21l3.7 1.68L4.7 7.32a8 8 0 0 1 1.6-1.6l3.18 2.49-1.68-3.7a7.9 7.9 0 0 1 2.2-.58L11 7.98h.02l.97-4.08a7.9 7.9 0 0 1 2.21.58l-1.68 3.7 3.18-2.49a8 8 0 0 1 1.6 1.6l-2.49 3.18 3.7-1.68c.31.7.5 1.44.58 2.2L14.92 12Z" />
  </svg>
);

const TeamsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#5059C9" d="M19.19 8.04h-3.55a1.95 1.95 0 0 0-1.95 1.95v6.5a3.42 3.42 0 0 0 3.42 3.42 3.42 3.42 0 0 0 3.42-3.42v-6.5a1.95 1.95 0 0 0-1.34-1.95Zm-2.4-.78a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z" />
    <path fill="#7B83EB" d="M11.6 7.26a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Zm1.78.78H5.13a1.34 1.34 0 0 0-1.31 1.36v8.18A6.27 6.27 0 0 0 9.36 23.5a6.27 6.27 0 0 0 5.36-5.92V9.4c0-.75-.6-1.36-1.34-1.36Z" />
    <path fill="#FFF" d="M11.95 10.42v6.95H9.7v-2.46H6.92v2.46H4.66v-6.95h2.26v2.51H9.7v-2.51h2.25Z" />
  </svg>
);

const FALLBACK_ICON: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className} />
);

const BRANDS: Record<IntegrationProvider, BrandSpec> = {
  SLACK: {
    Icon: SlackIcon,
    gradient: 'linear-gradient(135deg, #FFF7F9 0%, #FFEBF1 50%, #F4E8FF 100%)',
    accent: '#4A154B',
    ink: '#3A0F3A',
  },
  NOTION: {
    Icon: NotionIcon,
    gradient: 'linear-gradient(135deg, #FAFAF7 0%, #F0EDE4 100%)',
    accent: '#000000',
    ink: '#1F1F1F',
  },
  JIRA: {
    Icon: JiraIcon,
    gradient: 'linear-gradient(135deg, #EEF4FF 0%, #DCE9FF 100%)',
    accent: '#0052CC',
    ink: '#0A2A5E',
  },
  GOOGLE_DRIVE: {
    Icon: GoogleDriveIcon,
    gradient: 'linear-gradient(135deg, #F0FFF4 0%, #E0F4FF 50%, #FFF4E6 100%)',
    accent: '#0F9D58',
    ink: '#0B6E3F',
  },
  SALESFORCE: {
    Icon: SalesforceIcon,
    gradient: 'linear-gradient(135deg, #EAF8FF 0%, #D6EFFF 100%)',
    accent: '#00A1E0',
    ink: '#024E6E',
  },
  HUBSPOT: {
    Icon: HubSpotIcon,
    gradient: 'linear-gradient(135deg, #FFF4EE 0%, #FFE4D2 100%)',
    accent: '#FF7A59',
    ink: '#7A2E10',
  },
  ZAPIER: {
    Icon: ZapierIcon,
    gradient: 'linear-gradient(135deg, #FFF1EA 0%, #FFE0CD 100%)',
    accent: '#FF4A00',
    ink: '#7A2300',
  },
  MICROSOFT_TEAMS: {
    Icon: TeamsIcon,
    gradient: 'linear-gradient(135deg, #F0F1FA 0%, #E2E5F8 100%)',
    accent: '#5059C9',
    ink: '#262C7A',
  },
};

export function getProviderBrand(provider: IntegrationProvider): BrandSpec {
  return BRANDS[provider] ?? { Icon: FALLBACK_ICON, gradient: 'transparent', accent: '#78716C', ink: '#1C1917' };
}

interface ProviderIconProps {
  provider: IntegrationProvider;
  className?: string;
  /** Render in greyscale (e.g. for "coming soon" states) */
  muted?: boolean;
}

export function ProviderIcon({ provider, className = 'w-6 h-6', muted = false }: ProviderIconProps) {
  const { Icon } = getProviderBrand(provider);
  return (
    <div
      className={className}
      style={muted ? { filter: 'grayscale(1) opacity(0.5)' } : undefined}
    >
      <Icon className="w-full h-full" />
    </div>
  );
}
