'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, type Variants } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

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

function IntegrationsTab() {
  const { data: connections, isLoading } = useIntegrations();
  const getAuthorizeUrl = useGetAuthorizeUrl();
  const disconnectIntegration = useDisconnectIntegration();
  const connectIntegration = useConnectIntegration();

  // Check URL for OAuth callback code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const stateParam = params.get('state');

    if (code && stateParam) {
      try {
        const state = JSON.parse(atob(stateParam));
        const provider = state.provider as string;

        connectIntegration.mutate(
          {
            provider,
            code,
            redirectUri: `${window.location.origin}/settings?tab=integrations`,
            state: stateParam,
          },
          {
            onSuccess: () => {
              toast.success(`${provider.replace(/_/g, ' ')} connected successfully`);
              // Clean URL
              window.history.replaceState({}, '', '/settings?tab=integrations');
            },
            onError: () => {
              toast.error('Failed to connect — please try again');
              window.history.replaceState({}, '', '/settings?tab=integrations');
            },
          },
        );
      } catch {
        // Invalid state, ignore
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const connectedMap = new Map(
    (connections ?? [])
      .filter((c) => c.status === 'CONNECTED')
      .map((c) => [c.provider, c]),
  );

  function handleConnect(provider: IntegrationProvider) {
    const redirectUri = `${window.location.origin}/settings?tab=integrations`;

    getAuthorizeUrl.mutate(
      { provider, redirectUri },
      {
        onSuccess: (data) => {
          // Redirect to OAuth provider
          window.location.href = data.url;
        },
        onError: (err) => {
          toast.error(
            err.message || `${provider} is not configured yet — add OAuth credentials to enable.`,
          );
        },
      },
    );
  }

  function handleDisconnect(id: string, name: string) {
    disconnectIntegration.mutate(id, {
      onSuccess: () => toast.success(`${name} disconnected`),
      onError: () => toast.error(`Failed to disconnect ${name}`),
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
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {INTEGRATION_CATALOG.map((integration) => {
                const connected = connectedMap.get(integration.provider);

                return (
                  <motion.div
                    key={integration.provider}
                    variants={itemVariants}
                    className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                      connected
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-[#E7E5E4] hover:border-[#D6D3D1]'
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold"
                      style={{ backgroundColor: integration.color }}
                    >
                      {integration.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#1C1917]">
                          {integration.name}
                        </p>
                        <span className="text-[10px] font-medium text-[#A8A29E] bg-[#F5F5F4] px-2 py-0.5 rounded-full">
                          {integration.category}
                        </span>
                        {connected && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
                        {integration.description}
                      </p>
                      {connected ? (
                        <div className="mt-3">
                          {connected.externalTeamName && (
                            <p className="text-xs text-[#57534E] mb-2">
                              <span className="text-[#A8A29E]">Connected to: </span>
                              <span className="font-semibold text-[#1C1917]">
                                {connected.externalTeamName}
                              </span>
                            </p>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleDisconnect(connected.id, integration.name)
                            }
                            disabled={disconnectIntegration.isPending}
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 h-8 text-xs rounded-full"
                          onClick={() => handleConnect(integration.provider)}
                          disabled={getAuthorizeUrl.isPending}
                        >
                          {getAuthorizeUrl.isPending ? (
                            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                          ) : (
                            <ExternalLink className="w-3 h-3 mr-1.5" />
                          )}
                          Connect
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
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { data: user, isLoading } = useMe();

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
      <Tabs defaultValue="profile">
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
