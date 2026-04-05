'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, type Variants } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

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

import type { User } from '@/types';

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
                value={currentSize || undefined}
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
          </TabsList>
        </motion.div>

        <TabsContent value="profile">
          <ProfileTab user={user} />
        </TabsContent>

        <TabsContent value="organization">
          <OrganizationTab user={user} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
