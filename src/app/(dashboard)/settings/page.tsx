'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, type Variants } from 'framer-motion';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Trash2,
  RefreshCw,
} from 'lucide-react';

import { useMe, useUpdateMe } from '@/hooks/use-user';
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

import {
  useIntegrations,
  useTestConnection,
  useDisconnectIntegration,
  useConnectApiKey,
  getOAuthConnectUrl,
} from '@/hooks/use-integrations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { User, OrgIntegration, IntegrationProvider } from '@/types';

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

const PROVIDERS: {
  id: IntegrationProvider;
  name: string;
  description: string;
  authMethod: 'oauth' | 'api_key';
}[] = [
  {
    id: 'SLACK',
    name: 'Slack',
    description: 'Create channels, post messages, and manage webhooks',
    authMethod: 'oauth',
  },
  {
    id: 'GITHUB',
    name: 'GitHub',
    description: 'Manage repos, workflows, and webhooks',
    authMethod: 'oauth',
  },
  {
    id: 'MAKE',
    name: 'Make',
    description: 'Create and manage automation scenarios',
    authMethod: 'api_key',
  },
  {
    id: 'NOTION',
    name: 'Notion',
    description: 'Create pages, databases, and documentation from deployment plans',
    authMethod: 'api_key',
  },
  {
    id: 'ZAPIER',
    name: 'Zapier',
    description: 'Connect apps and automate workflows',
    authMethod: 'api_key',
  },
];

function StatusIndicator({ status }: { status: OrgIntegration['status'] }) {
  switch (status) {
    case 'CONNECTED':
      return (
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Connected
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
          <AlertTriangle className="h-3.5 w-3.5" />
          Expired
        </span>
      );
    case 'ERROR':
      return (
        <span className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <XCircle className="h-3.5 w-3.5" />
          Error
        </span>
      );
    case 'REVOKED':
      return (
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#78716C]">
          <XCircle className="h-3.5 w-3.5" />
          Revoked
        </span>
      );
    default:
      return null;
  }
}

function getMetadataLabel(integration: OrgIntegration): string | null {
  const meta = integration.metadata as Record<string, unknown> | null;
  if (!meta) return null;

  switch (integration.provider) {
    case 'SLACK':
      return meta.team_name ? `Workspace: ${meta.team_name}` : null;
    case 'GITHUB':
      return meta.login ? `Account: ${meta.login}` : null;
    case 'MAKE':
      return meta.name ? `User: ${meta.name}` : null;
    case 'NOTION':
      return meta.ownerName ? `Integration: ${meta.ownerName}` : null;
    default:
      return null;
  }
}

function ApiKeyDialog({
  open,
  onOpenChange,
  provider,
  orgId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: { id: IntegrationProvider; name: string };
  orgId: string | undefined;
}) {
  const [apiKey, setApiKey] = useState('');
  const [label, setLabel] = useState('');
  const connectApiKey = useConnectApiKey(orgId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    connectApiKey.mutate(
      {
        provider: provider.id,
        apiKey: apiKey.trim(),
        label: label.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`${provider.name} connected`);
          setApiKey('');
          setLabel('');
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to connect');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect {provider.name}</DialogTitle>
          <DialogDescription>
            Enter your {provider.name} API key to connect. You can find this in
            your {provider.name} account settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1C1917]">API Key</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key"
              className="h-10 rounded-lg border-[#E7E5E4]"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1C1917]">
              Label <span className="text-[#A8A29E]">(optional)</span>
            </Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={`e.g. "Production ${provider.name}"`}
              className="h-10 rounded-lg border-[#E7E5E4]"
            />
          </div>
          <DialogFooter>
            <DialogClose>
              <Button type="button" variant="outline" className="rounded-full">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!apiKey.trim() || connectApiKey.isPending}
              className="rounded-full bg-[#1C1917] text-white hover:bg-[#1C1917]/90"
            >
              {connectApiKey.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Connect
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function IntegrationsTab({ user }: { user: User }) {
  const orgId = user.organizationId ?? undefined;
  const searchParams = useSearchParams();
  const { data: integrations, isLoading } = useIntegrations(orgId);
  const testConnection = useTestConnection(orgId);
  const disconnect = useDisconnectIntegration(orgId);

  const [testingId, setTestingId] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [apiKeyDialog, setApiKeyDialog] = useState<{
    open: boolean;
    provider: (typeof PROVIDERS)[number] | null;
  }>({ open: false, provider: null });

  // Show toast after OAuth callback redirect
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    if (connected) {
      toast.success(`${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully`);
    } else if (error) {
      toast.error(`Connection failed: ${error}`);
    }
  }, [searchParams]);

  const getIntegration = (provider: IntegrationProvider): OrgIntegration | undefined =>
    integrations?.find(
      (i) => i.provider === provider && i.status !== 'REVOKED',
    );

  const handleConnect = (provider: (typeof PROVIDERS)[number]) => {
    if (!orgId) return;

    if (provider.authMethod === 'api_key') {
      setApiKeyDialog({ open: true, provider });
    } else {
      window.location.href = getOAuthConnectUrl(orgId, provider.id);
    }
  };

  const handleTest = (integrationId: string) => {
    setTestingId(integrationId);
    testConnection.mutate(integrationId, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
        setTestingId(null);
      },
      onError: (err) => {
        toast.error(err.message || 'Connection test failed');
        setTestingId(null);
      },
    });
  };

  const handleDisconnect = (integrationId: string, providerName: string) => {
    if (!confirm(`Disconnect ${providerName}? This will revoke all stored credentials.`)) {
      return;
    }
    setDisconnectingId(integrationId);
    disconnect.mutate(integrationId, {
      onSuccess: () => {
        toast.success(`${providerName} disconnected`);
        setDisconnectingId(null);
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to disconnect');
        setDisconnectingId(null);
      },
    });
  };

  if (isLoading) {
    return (
      <motion.div variants={itemVariants} className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[#E7E5E4] bg-white p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {PROVIDERS.map((provider) => {
          const integration = getIntegration(provider.id);
          const isConnected = integration?.status === 'CONNECTED';
          const isTesting = testingId === integration?.id;
          const isDisconnecting = disconnectingId === integration?.id;
          const metaLabel = integration ? getMetadataLabel(integration) : null;

          return (
            <motion.div
              key={provider.id}
              variants={itemVariants}
              className="rounded-xl border border-[#E7E5E4] bg-white p-5"
            >
              <div className="flex items-center gap-4">
                {/* Provider icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F4] text-sm font-bold text-[#57534E]">
                  {provider.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-[#1C1917]">
                      {provider.name}
                    </p>
                    {integration && <StatusIndicator status={integration.status} />}
                    {provider.authMethod === 'api_key' && !integration && (
                      <span className="rounded bg-[#F5F5F4] px-1.5 py-0.5 text-[10px] font-medium text-[#78716C]">
                        API Key
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#78716C]">
                    {provider.description}
                  </p>
                  {metaLabel && (
                    <p className="mt-0.5 text-[12px] text-[#A8A29E]">
                      {metaLabel}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {isConnected ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs"
                        disabled={isTesting}
                        onClick={() => handleTest(integration!.id)}
                      >
                        {isTesting ? (
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-1.5 h-3 w-3" />
                        )}
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={isDisconnecting}
                        onClick={() =>
                          handleDisconnect(integration!.id, provider.name)
                        }
                      >
                        {isDisconnecting ? (
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1.5 h-3 w-3" />
                        )}
                        Disconnect
                      </Button>
                    </>
                  ) : integration?.status === 'EXPIRED' ? (
                    <Button
                      size="sm"
                      className="rounded-full bg-[#1C1917] text-xs text-white hover:bg-[#1C1917]/90"
                      onClick={() => handleConnect(provider)}
                    >
                      <ExternalLink className="mr-1.5 h-3 w-3" />
                      Reconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="rounded-full bg-[#1C1917] text-xs text-white hover:bg-[#1C1917]/90"
                      onClick={() => handleConnect(provider)}
                    >
                      <ExternalLink className="mr-1.5 h-3 w-3" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* API Key Dialog */}
      {apiKeyDialog.provider && (
        <ApiKeyDialog
          open={apiKeyDialog.open}
          onOpenChange={(open) => setApiKeyDialog({ ...apiKeyDialog, open })}
          provider={apiKeyDialog.provider}
          orgId={orgId}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { data: user, isLoading } = useMe();
  const searchParams = useSearchParams();

  // Auto-switch to integrations tab after OAuth callback
  const defaultTab = useMemo(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    if (connected || error) return 'integrations';
    return searchParams.get('tab') ?? 'profile';
  }, [searchParams]);

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
      <Tabs defaultValue={defaultTab}>
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
          <IntegrationsTab user={user} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
