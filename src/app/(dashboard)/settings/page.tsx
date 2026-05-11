'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, type Variants } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ProviderIcon,
  getProviderBrand,
} from '@/components/integrations/provider-brand';
import {
  brandedSuccessToast,
  brandedErrorToast,
} from '@/components/integrations/branded-toast';

import { useMe, useUpdateMe } from '@/hooks/use-user';
import {
  useIntegrations,
  useGetAuthorizeUrl,
  useDisconnectIntegration,
  useConnectIntegration,
} from '@/hooks/use-integrations';
import {
  useOrganization,
  useUpdateOrg,
  useOrgMembers,
} from '@/hooks/use-organizations';
import { COMPANY_SIZES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import type { User, IntegrationProvider } from '@/types';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const orgSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  size: z.string().optional(),
});

type OrgFormData = z.infer<typeof orgSchema>;

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
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RoleBadge({ role }: { role: User['role'] }) {
  if (role === 'ADMIN') {
    return (
      <Badge className="bg-[#1C1917] text-white">Admin</Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[#57534E]">
      Member
    </Badge>
  );
}

function MembersTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="ml-auto h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile Tab
// ---------------------------------------------------------------------------

function ProfileTab({ user }: { user: User }) {
  const updateMe = useUpdateMe();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
    },
  });

  // Reset form when user data changes (e.g. after save)
  useEffect(() => {
    reset({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
    });
  }, [user.firstName, user.lastName, reset]);

  const onSubmit = (data: ProfileFormData) => {
    updateMe.mutate(data, {
      onSuccess: () => {
        toast.success('Profile updated');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update profile');
      },
    });
  };

  return (
    <motion.div variants={itemVariants}>
      <div className="rounded-xl border border-[#E7E5E4] bg-white p-6">
        <h3 className="mb-6 text-[15px] font-semibold text-[#1C1917]">
          Profile Information
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email — read-only */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1C1917]">Email</Label>
            <Input
              value={user.email}
              disabled
              className="h-10 rounded-lg border-[#E7E5E4] bg-[#FAFAF9] text-[#78716C]"
            />
          </div>

          {/* First name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1C1917]">
              First name
            </Label>
            <Input
              {...register('firstName')}
              className="h-10 rounded-lg border-[#E7E5E4]"
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1C1917]">
              Last name
            </Label>
            <Input
              {...register('lastName')}
              className="h-10 rounded-lg border-[#E7E5E4]"
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>

          {/* Save */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={!isDirty || updateMe.isPending}
              className="rounded-full bg-[#1C1917] px-5 text-white hover:bg-[#1C1917]/90"
            >
              {updateMe.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Organization Tab
// ---------------------------------------------------------------------------

function OrganizationTab({ user }: { user: User }) {
  const isAdmin = user.role === 'ADMIN';
  const orgId = user.organizationId;

  const { data: org, isLoading: orgLoading } = useOrganization(orgId);
  const updateOrg = useUpdateOrg(orgId);

  const [membersPage, setMembersPage] = useState(1);
  const { data: members, isLoading: membersLoading } = useOrgMembers(
    orgId,
    membersPage
  );

  const membersList = Array.isArray(members) ? members : [];
  const hasNextPage = membersList.length >= 20;
  const hasPrevPage = membersPage > 1;

  // Org edit form (admin only)
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: '',
      size: '',
    },
  });

  const currentSize = watch('size');

  // Sync form with fetched org data
  useEffect(() => {
    if (org) {
      reset({
        name: org.name ?? '',
        size: org.size ?? '',
      });
    }
  }, [org, reset]);

  const onOrgSubmit = (data: OrgFormData) => {
    updateOrg.mutate(
      { name: data.name, size: data.size || undefined },
      {
        onSuccess: () => {
          toast.success('Organization updated');
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update organization');
        },
      }
    );
  };

  if (orgLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-[#E7E5E4] bg-white p-6">
          <div className="space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="rounded-xl border border-[#E7E5E4] bg-white p-6">
        <p className="text-sm text-[#78716C]">No organization found.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Organization info card */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl border border-[#E7E5E4] bg-white p-6"
      >
        <h3 className="mb-6 text-[15px] font-semibold text-[#1C1917]">
          Organization Details
        </h3>

        {isAdmin ? (
          <form onSubmit={handleSubmit(onOrgSubmit)} className="space-y-5">
            {/* Org name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1C1917]">
                Organization name
              </Label>
              <Input
                {...register('name')}
                className="h-10 rounded-lg border-[#E7E5E4]"
                placeholder="Enter organization name"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Industry — always read-only */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1C1917]">
                Industry
              </Label>
              <div className="flex h-10 items-center">
                <span className="inline-block rounded-full bg-[#F5F5F4] px-3 py-1 text-[13px] font-medium text-[#57534E]">
                  {org.industry?.name ?? 'N/A'}
                </span>
              </div>
            </div>

            {/* Size — editable dropdown */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1C1917]">
                Company size
              </Label>
              <Select
                value={currentSize ?? ""}
                onValueChange={(val) => {
                  if (val) setValue('size', val, { shouldDirty: true });
                }}
              >
                <SelectTrigger className="flex h-10 w-full items-center justify-between rounded-lg border border-[#E7E5E4] bg-white px-3 text-sm text-[#1C1917]">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} employees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Save */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={!isDirty || updateOrg.isPending}
                className="rounded-full bg-[#1C1917] px-5 text-white hover:bg-[#1C1917]/90"
              >
                {updateOrg.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          /* MEMBER read-only view */
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#78716C]">
                Organization name
              </Label>
              <p className="text-[14px] font-medium text-[#1C1917]">
                {org.name}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#78716C]">
                Industry
              </Label>
              <div>
                <span className="inline-block rounded-full bg-[#F5F5F4] px-3 py-1 text-[13px] font-medium text-[#57534E]">
                  {org.industry?.name ?? 'N/A'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#78716C]">
                Company size
              </Label>
              <p className="text-[14px] font-medium text-[#1C1917]">
                {org.size ? `${org.size} employees` : 'Not set'}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Members card */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl border border-[#E7E5E4] bg-white p-6"
      >
        <h3 className="mb-4 text-[15px] font-semibold text-[#1C1917]">
          Team Members
        </h3>

        {membersLoading ? (
          <MembersTableSkeleton />
        ) : membersList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-[13px] text-[#78716C]">No members found</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#F5F5F4] hover:bg-transparent">
                  <TableHead className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#78716C]">
                    Name
                  </TableHead>
                  <TableHead className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#78716C]">
                    Email
                  </TableHead>
                  <TableHead className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#78716C]">
                    Role
                  </TableHead>
                  <TableHead className="text-right text-[13px] font-medium uppercase tracking-[0.05em] text-[#78716C]">
                    Joined
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersList.map((member) => (
                  <TableRow
                    key={member.id}
                    className="border-b border-[#F5F5F4] hover:bg-[#FAFAF9]"
                  >
                    <TableCell className="text-[14px] font-medium text-[#1C1917]">
                      {[member.firstName, member.lastName]
                        .filter(Boolean)
                        .join(' ') || 'Unnamed'}
                    </TableCell>
                    <TableCell className="text-[14px] text-[#57534E]">
                      {member.email}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={member.role} />
                    </TableCell>
                    <TableCell className="text-right text-[14px] text-[#57534E]">
                      {formatDate(member.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {(hasPrevPage || hasNextPage) && (
              <div className="mt-4 flex items-center justify-between border-t border-[#F5F5F4] pt-4">
                <span className="text-[13px] text-[#78716C]">
                  Page {membersPage}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!hasPrevPage}
                    onClick={() => setMembersPage((p) => Math.max(1, p - 1))}
                    className="rounded-full"
                  >
                    <ChevronLeft className="mr-1 h-3 w-3" />
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!hasNextPage}
                    onClick={() => setMembersPage((p) => p + 1)}
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
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Integrations Tab
// ---------------------------------------------------------------------------

const INTEGRATION_CATALOG: {
  provider: IntegrationProvider;
  name: string;
  description: string;
  category: string;
  color: string;
}[] = [
  {
    provider: 'SLACK',
    name: 'Slack',
    description: 'Get AI transformation updates and alerts in your Slack channels.',
    category: 'Communication',
    color: '#4A154B',
  },
  {
    provider: 'MICROSOFT_TEAMS',
    name: 'Microsoft Teams',
    description: 'Receive deployment notifications and team updates in Teams.',
    category: 'Communication',
    color: '#5B5FC7',
  },
  {
    provider: 'JIRA',
    name: 'Jira',
    description: 'Sync transformation actions with your Jira board automatically.',
    category: 'Project Management',
    color: '#0052CC',
  },
  {
    provider: 'GOOGLE_DRIVE',
    name: 'Google Drive',
    description: 'Import documents and export reports directly to Drive.',
    category: 'Storage',
    color: '#0F9D58',
  },
  {
    provider: 'SALESFORCE',
    name: 'Salesforce',
    description: 'Connect CRM data to enhance AI transformation insights.',
    category: 'CRM',
    color: '#00A1E0',
  },
  {
    provider: 'HUBSPOT',
    name: 'HubSpot',
    description: 'Sync marketing and sales data for transformation analysis.',
    category: 'CRM',
    color: '#FF7A59',
  },
  {
    provider: 'ZAPIER',
    name: 'Zapier',
    description: 'Connect Taurus with 5,000+ apps via automated workflows.',
    category: 'Automation',
    color: '#FF4A00',
  },
  {
    provider: 'NOTION',
    name: 'Notion',
    description: 'Sync implementation plans and checklists to Notion pages.',
    category: 'Productivity',
    color: '#000000',
  },
];

// Providers wired up server-side. Cards outside this set render as
// "Coming Soon" so users don't get a backend "OAuth not supported" toast.
const SUPPORTED_PROVIDERS: ReadonlySet<IntegrationProvider> = new Set([
  'SLACK',
  'GOOGLE_DRIVE',
  'JIRA',
  'NOTION',
  'HUBSPOT',
  'SALESFORCE',
]);

function prettyName(provider: IntegrationProvider): string {
  return provider
    .split('_')
    .map((p) => p.charAt(0) + p.slice(1).toLowerCase())
    .join(' ');
}

function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface DisconnectTarget {
  id: string;
  provider: IntegrationProvider;
  name: string;
}

function IntegrationsTab() {
  const { data: connections, isLoading } = useIntegrations();
  const getAuthorizeUrl = useGetAuthorizeUrl();
  const disconnectIntegration = useDisconnectIntegration();
  const connectIntegration = useConnectIntegration();

  // Provider whose OAuth flow is currently in flight. Per-card so other
  // cards stay interactive while one is connecting / completing callback.
  const [pendingProvider, setPendingProvider] =
    useState<IntegrationProvider | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] =
    useState<DisconnectTarget | null>(null);

  // Check URL for OAuth callback code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const stateParam = params.get('state');

    if (code && stateParam) {
      try {
        // State payload may be either legacy plain-base64 JSON or the new
        // "h1:<sig>:<body>" form. We only need the provider hint for UX —
        // the real verification happens server-side in the callback.
        let provider: IntegrationProvider | null = null;
        try {
          const parts = stateParam.split(':');
          const body = parts.length === 3 ? parts[2] : stateParam;
          const decoded = JSON.parse(atob(body));
          provider = decoded.provider as IntegrationProvider;
        } catch {
          /* ignore — fall through to connect attempt without local provider hint */
        }
        if (provider) setPendingProvider(provider);

        connectIntegration.mutate(
          {
            provider: provider ?? '',
            code,
            redirectUri: `${window.location.origin}/settings?tab=integrations`,
            state: stateParam,
          },
          {
            onSuccess: (data) => {
              if (data.provider) {
                brandedSuccessToast(
                  data.provider,
                  `${prettyName(data.provider)} connected`,
                  data.externalTeamName
                    ? `Connected to ${data.externalTeamName}.`
                    : 'You can now use it across Taurus.',
                );
              }
              window.history.replaceState({}, '', '/settings?tab=integrations');
              setPendingProvider(null);
            },
            onError: () => {
              if (provider) {
                brandedErrorToast(
                  provider,
                  `Couldn't connect ${prettyName(provider)}`,
                  'The authorization code may have expired — please try again.',
                );
              } else {
                toast.error('Failed to connect — please try again');
              }
              window.history.replaceState({}, '', '/settings?tab=integrations');
              setPendingProvider(null);
            },
          },
        );
      } catch {
        // Invalid state, ignore
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const connectionMap = new Map(
    (connections ?? []).map((c) => [c.provider, c]),
  );

  function handleConnect(provider: IntegrationProvider) {
    const redirectUri = `${window.location.origin}/settings?tab=integrations`;
    setPendingProvider(provider);

    getAuthorizeUrl.mutate(
      { provider, redirectUri },
      {
        onSuccess: (data) => {
          // Full-page redirect; pending state implicitly cleared on unmount.
          window.location.href = data.url;
        },
        onError: (err) => {
          brandedErrorToast(
            provider,
            `${prettyName(provider)} isn't configured`,
            err.message ||
              'OAuth credentials are missing on the server — please contact your admin.',
          );
          setPendingProvider(null);
        },
      },
    );
  }

  function confirmDisconnect() {
    if (!disconnectTarget) return;
    const target = disconnectTarget;
    setDisconnectingId(target.id);
    disconnectIntegration.mutate(target.id, {
      onSuccess: () => {
        brandedSuccessToast(
          target.provider,
          `${target.name} disconnected`,
          'Tokens have been revoked locally. You can reconnect anytime.',
        );
        setDisconnectingId(null);
        setDisconnectTarget(null);
      },
      onError: () => {
        brandedErrorToast(
          target.provider,
          `Failed to disconnect ${target.name}`,
          'Please try again in a moment.',
        );
        setDisconnectingId(null);
      },
    });
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-[#E7E5E4] bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[15px] font-semibold text-[#1C1917]">
                Integrations
              </h3>
              <p className="text-sm text-[#78716C] mt-1">
                Connect your tools to streamline your AI transformation workflow.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-xl border border-[#E7E5E4] bg-white p-4"
                >
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="mt-2 h-7 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {INTEGRATION_CATALOG.map((integration) => {
                const connection = connectionMap.get(integration.provider);
                const isConnected = connection?.status === 'CONNECTED';
                const isExpired = connection?.status === 'EXPIRED' || connection?.status === 'ERROR';
                const supported = SUPPORTED_PROVIDERS.has(integration.provider);
                const isPending = pendingProvider === integration.provider;
                const brand = getProviderBrand(integration.provider);

                // Connected: brand-tinted gradient. Expired: amber wash so
                // it's visually distinct from a healthy connection but
                // doesn't read as "broken/red". Default: clean white card.
                const cardStyle: React.CSSProperties = isConnected
                  ? {
                      background: brand.gradient,
                      borderColor: `${brand.accent}40`,
                    }
                  : isExpired
                    ? {
                        background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                        borderColor: '#FCD34D',
                      }
                    : {};

                return (
                  <motion.div
                    key={integration.provider}
                    variants={itemVariants}
                    whileHover={supported && !isConnected ? { y: -1 } : undefined}
                    className={`group relative flex items-start gap-4 rounded-xl border p-4 transition-all ${
                      isConnected || isExpired
                        ? ''
                        : supported
                          ? 'border-[#E7E5E4] bg-white hover:border-[#D6D3D1] hover:shadow-sm'
                          : 'border-[#E7E5E4] bg-[#FAFAF9] opacity-75'
                    }`}
                    style={cardStyle}
                  >
                    {isConnected && (
                      <div
                        className="absolute left-0 top-4 bottom-4 w-px rounded-r-full opacity-40"
                        style={{ backgroundColor: brand.accent }}
                        aria-hidden
                      />
                    )}

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ${
                        isConnected ? '' : 'ring-[#E7E5E4]'
                      }`}
                      style={
                        isConnected
                          ? { boxShadow: `0 0 0 1px ${brand.accent}33, 0 1px 2px rgba(0,0,0,0.04)` }
                          : undefined
                      }
                    >
                      <ProviderIcon
                        provider={integration.provider}
                        className="w-6 h-6"
                        muted={!supported && !isConnected}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p
                          className="text-sm font-semibold"
                          style={{ color: isConnected ? brand.ink : '#1C1917' }}
                        >
                          {integration.name}
                        </p>
                        <span className="text-[10px] font-medium text-[#A8A29E] bg-white/70 px-2 py-0.5 rounded-full ring-1 ring-[#E7E5E4]/60">
                          {integration.category}
                        </span>
                        {isConnected && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              color: brand.accent,
                              backgroundColor: `${brand.accent}15`,
                              border: `1px solid ${brand.accent}33`,
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: brand.accent }}
                            />
                            Connected
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Reconnect needed
                          </span>
                        )}
                        {!supported && !isConnected && !isExpired && (
                          <span className="text-[10px] font-semibold text-[#78716C] bg-[#F5F5F4] border border-[#E7E5E4] px-2 py-0.5 rounded-full">
                            Coming soon
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs mt-1 leading-relaxed"
                        style={{
                          color: isConnected ? `${brand.ink}CC` : '#78716C',
                        }}
                      >
                        {integration.description}
                      </p>

                      {isConnected && connection && (
                        <div className="mt-2.5 flex items-center gap-2 text-[11px]" style={{ color: `${brand.ink}AA` }}>
                          {connection.externalTeamName && (
                            <>
                              <span className="font-semibold" style={{ color: brand.ink }}>
                                {connection.externalTeamName}
                              </span>
                              <span>·</span>
                            </>
                          )}
                          <span>Connected {formatRelativeDate(connection.connectedAt)}</span>
                        </div>
                      )}

                      {isConnected ? (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs rounded-full bg-white/80 hover:bg-white border-[#E7E5E4] text-[#57534E] hover:text-red-700 hover:border-red-200"
                            onClick={() =>
                              setDisconnectTarget({
                                id: connection!.id,
                                provider: integration.provider,
                                name: integration.name,
                              })
                            }
                            disabled={disconnectingId === connection!.id}
                          >
                            {disconnectingId === connection!.id && (
                              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                            )}
                            Disconnect
                          </Button>
                        </div>
                      ) : isExpired ? (
                        <Button
                          size="sm"
                          className="mt-3 h-8 text-xs rounded-full bg-amber-600 hover:bg-amber-700 text-white"
                          onClick={() => handleConnect(integration.provider)}
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                          ) : (
                            <ExternalLink className="w-3 h-3 mr-1.5" />
                          )}
                          {isPending ? 'Reconnecting…' : 'Reconnect'}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 h-8 text-xs rounded-full"
                          onClick={() => handleConnect(integration.provider)}
                          disabled={!supported || isPending}
                        >
                          {isPending ? (
                            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                          ) : (
                            <ExternalLink className="w-3 h-3 mr-1.5" />
                          )}
                          {isPending ? 'Connecting…' : supported ? 'Connect' : 'Coming soon'}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* API Access */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-[#E7E5E4] bg-white p-6">
          <h3 className="text-[15px] font-semibold text-[#1C1917] mb-2">
            API Access
          </h3>
          <p className="text-sm text-[#78716C] mb-4">
            Access the Taurus API to build custom integrations and automations.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => toast.info('API access coming soon — contact us for early access.')}
          >
            Generate API Key
          </Button>
        </div>
      </motion.div>

      {/* Disconnect confirmation */}
      <Dialog
        open={disconnectTarget !== null}
        onOpenChange={(open) => {
          if (!open && !disconnectingId) setDisconnectTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          {disconnectTarget && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm"
                    style={{
                      boxShadow: `0 0 0 1px ${getProviderBrand(disconnectTarget.provider).accent}33`,
                    }}
                  >
                    <ProviderIcon provider={disconnectTarget.provider} className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle>Disconnect {disconnectTarget.name}?</DialogTitle>
                    <DialogDescription className="mt-1">
                      Taurus will stop sending and receiving data from{' '}
                      <span className="font-semibold text-[#1C1917]">
                        {disconnectTarget.name}
                      </span>
                      . You can reconnect anytime — your settings are preserved.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <DialogFooter className="mt-2">
                <Button
                  variant="outline"
                  onClick={() => setDisconnectTarget(null)}
                  disabled={disconnectingId === disconnectTarget.id}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDisconnect}
                  disabled={disconnectingId === disconnectTarget.id}
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {disconnectingId === disconnectTarget.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Disconnecting…
                    </>
                  ) : (
                    'Disconnect'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const VALID_TABS = ['profile', 'organization', 'integrations'] as const;
type SettingsTab = (typeof VALID_TABS)[number];

export default function SettingsPage() {
  const { data: user, isLoading } = useMe();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab');
  const urlTab: SettingsTab = (VALID_TABS as readonly string[]).includes(
    tabParam ?? '',
  )
    ? (tabParam as SettingsTab)
    : 'profile';

  const [activeTab, setActiveTab] = useState<SettingsTab>(urlTab);

  // Sync from URL (e.g. OAuth callback redirects to ?tab=integrations)
  useEffect(() => {
    if (urlTab !== activeTab) setActiveTab(urlTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as SettingsTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.replace(`/settings?${params.toString()}`, { scroll: false });
  };

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-3xl">
        <Skeleton className="mb-6 h-8 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-56" />
          <div className="rounded-xl border border-[#E7E5E4] bg-white p-6">
            <div className="space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-3xl"
    >
      {/* Page title */}
      <motion.h1
        variants={itemVariants}
        className="mb-6 text-[24px] font-semibold text-[#1C1917]"
      >
        Settings
      </motion.h1>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <motion.div variants={itemVariants}>
          <TabsList variant="line" className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
        </motion.div>

        <TabsContent value="profile">
          <ProfileTab user={user} />
        </TabsContent>

        <TabsContent value="organization">
          <OrganizationTab user={user} />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
