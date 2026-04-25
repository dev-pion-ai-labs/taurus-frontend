'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, MessageSquare, Network, Workflow as WorkflowIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/consultation/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDepartments } from '@/hooks/use-departments';
import { useSessions, useStartSession } from '@/hooks/use-sessions';
import type {
  ConsultationScope,
  ConsultationSession,
  Department,
  Workflow,
} from '@/types';

type ScopeTab = ConsultationScope;

const TAB_LABEL: Record<ScopeTab, string> = {
  ORG: 'Organisation',
  DEPARTMENT: 'Department',
  WORKFLOW: 'Workflow',
};

const TAB_DESCRIPTION: Record<ScopeTab, string> = {
  ORG: 'A company-wide consultation. Covers strategy, maturity, and roadmap across the entire organisation.',
  DEPARTMENT:
    'Scoped to a single department. Questions and the report focus only on that team’s workflows, headcount, and pain points.',
  WORKFLOW:
    'Scoped to a single workflow. Deep-dive into one specific process — the tightest grounding for actionable recommendations.',
};

export default function ConsultationsPage() {
  const [tab, setTab] = useState<ScopeTab>('ORG');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1917]">Consultations</h1>
        <p className="mt-1 text-sm text-[#78716C]">
          Run a consultation at the right level of detail — organisation, department, or a single workflow.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ScopeTab)}>
        <TabsList>
          <TabsTrigger value="ORG" className="gap-2">
            <MessageSquare className="h-4 w-4" /> {TAB_LABEL.ORG}
          </TabsTrigger>
          <TabsTrigger value="DEPARTMENT" className="gap-2">
            <Network className="h-4 w-4" /> {TAB_LABEL.DEPARTMENT}
          </TabsTrigger>
          <TabsTrigger value="WORKFLOW" className="gap-2">
            <WorkflowIcon className="h-4 w-4" /> {TAB_LABEL.WORKFLOW}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ORG" className="mt-6">
          <OrgPanel />
        </TabsContent>
        <TabsContent value="DEPARTMENT" className="mt-6">
          <DepartmentPanel />
        </TabsContent>
        <TabsContent value="WORKFLOW" className="mt-6">
          <WorkflowPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Org panel
// ---------------------------------------------------------------------------

function OrgPanel() {
  const router = useRouter();
  const startSession = useStartSession();
  const sessions = useSessions({ scope: 'ORG' });

  const handleStart = () => {
    startSession.mutate(
      { scope: 'ORG' },
      {
        onSuccess: (s) => {
          toast.success('Organisation consultation started');
          router.push(`/consultation/${s.id}`);
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );
  };

  return (
    <div className="space-y-6">
      <ScopeIntro
        title={TAB_LABEL.ORG}
        description={TAB_DESCRIPTION.ORG}
        action={
          <Button onClick={handleStart} disabled={startSession.isPending}>
            {startSession.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting…
              </>
            ) : (
              'Start Org Consultation'
            )}
          </Button>
        }
      />

      <SessionList
        scopeLabel="organisation"
        sessions={sessions.data ?? []}
        loading={sessions.isLoading}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Department panel
// ---------------------------------------------------------------------------

function DepartmentPanel() {
  const router = useRouter();
  const departments = useDepartments();
  const startSession = useStartSession();
  const [departmentId, setDepartmentId] = useState<string>('');

  const sessions = useSessions({
    scope: 'DEPARTMENT',
    departmentId: departmentId || undefined,
  });

  const handleStart = () => {
    if (!departmentId) {
      toast.error('Pick a department first');
      return;
    }
    startSession.mutate(
      { scope: 'DEPARTMENT', departmentId },
      {
        onSuccess: (s) => {
          toast.success('Department consultation started');
          router.push(`/consultation/${s.id}`);
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );
  };

  const deptList = departments.data ?? [];

  return (
    <div className="space-y-6">
      <ScopeIntro
        title={TAB_LABEL.DEPARTMENT}
        description={TAB_DESCRIPTION.DEPARTMENT}
        action={null}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pick a department</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {departments.isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : deptList.length === 0 ? (
            <EmptyDepartmentsHint />
          ) : (
            <>
              <Select
                value={departmentId}
                onValueChange={(v) => setDepartmentId(v ?? '')}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select a department…" />
                </SelectTrigger>
                <SelectContent>
                  {deptList.map((d: Department) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                      {d.headcount != null ? ` · ${d.headcount} ppl` : ''}
                      {d.workflows?.length
                        ? ` · ${d.workflows.length} workflows`
                        : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleStart}
                disabled={!departmentId || startSession.isPending}
              >
                {startSession.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting…
                  </>
                ) : (
                  'Start Department Consultation'
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <SessionList
        scopeLabel={
          departmentId
            ? `department: ${deptList.find((d) => d.id === departmentId)?.name ?? ''}`
            : 'all departments'
        }
        sessions={sessions.data ?? []}
        loading={sessions.isLoading}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Workflow panel
// ---------------------------------------------------------------------------

function WorkflowPanel() {
  const router = useRouter();
  const departments = useDepartments();
  const startSession = useStartSession();
  const [departmentId, setDepartmentId] = useState<string>('');
  const [workflowId, setWorkflowId] = useState<string>('');

  const sessions = useSessions({
    scope: 'WORKFLOW',
    workflowId: workflowId || undefined,
  });

  const deptList = departments.data ?? [];
  const selectedDept = useMemo(
    () => deptList.find((d) => d.id === departmentId),
    [deptList, departmentId],
  );
  const workflows: Workflow[] = selectedDept?.workflows ?? [];

  const handleStart = () => {
    if (!departmentId || !workflowId) {
      toast.error('Pick both a department and a workflow');
      return;
    }
    startSession.mutate(
      { scope: 'WORKFLOW', departmentId, workflowId },
      {
        onSuccess: (s) => {
          toast.success('Workflow consultation started');
          router.push(`/consultation/${s.id}`);
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );
  };

  return (
    <div className="space-y-6">
      <ScopeIntro
        title={TAB_LABEL.WORKFLOW}
        description={TAB_DESCRIPTION.WORKFLOW}
        action={null}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pick a workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {departments.isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : deptList.length === 0 ? (
            <EmptyDepartmentsHint />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Select
                  value={departmentId}
                  onValueChange={(v) => {
                    setDepartmentId(v ?? '');
                    setWorkflowId('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Department…" />
                  </SelectTrigger>
                  <SelectContent>
                    {deptList.map((d: Department) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={workflowId}
                  onValueChange={(v) => setWorkflowId(v ?? '')}
                  disabled={!departmentId || workflows.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !departmentId
                          ? 'Pick a department first'
                          : workflows.length === 0
                            ? 'No workflows in this department'
                            : 'Workflow…'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {workflows.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                        {w.weeklyHours != null ? ` · ${w.weeklyHours}h/wk` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleStart}
                disabled={!departmentId || !workflowId || startSession.isPending}
              >
                {startSession.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting…
                  </>
                ) : (
                  'Start Workflow Consultation'
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <SessionList
        scopeLabel={
          workflowId
            ? `workflow: ${workflows.find((w) => w.id === workflowId)?.name ?? ''}`
            : 'all workflows'
        }
        sessions={sessions.data ?? []}
        loading={sessions.isLoading}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared parts
// ---------------------------------------------------------------------------

function ScopeIntro({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-[#1C1917]">{title} consultation</h2>
          <p className="mt-1 text-sm text-[#78716C]">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

function EmptyDepartmentsHint() {
  return (
    <div className="rounded-lg border border-dashed border-[#E7E5E4] bg-[#FAFAF9] p-6 text-center text-sm text-[#78716C]">
      You haven’t mapped any departments yet.{' '}
      <Link className="font-medium text-[#E11D48] hover:underline" href="/departments">
        Add departments and workflows
      </Link>{' '}
      first, then come back to start a scoped consultation.
    </div>
  );
}

function SessionList({
  scopeLabel,
  sessions,
  loading,
}: {
  scopeLabel: string;
  sessions: ConsultationSession[];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Past sessions · {scopeLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-[#78716C]">No consultations yet at this scope.</p>
        ) : (
          <ul className="divide-y divide-[#E7E5E4]">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/consultation/${s.id}`}
                  className="flex items-center justify-between gap-4 py-3 text-sm hover:bg-[#FAFAF9]"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-[#1C1917]">
                      {scopeTitle(s)}
                    </div>
                    <div className="truncate text-xs text-[#78716C]">
                      Started {new Date(s.startedAt).toLocaleString()}
                      {s._count?.questions ? ` · ${s._count.questions} questions` : ''}
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function scopeTitle(s: ConsultationSession): string {
  if (s.scope === 'WORKFLOW' && s.workflow) {
    return `Workflow · ${s.workflow.name}`;
  }
  if (s.scope === 'DEPARTMENT' && s.department) {
    return `Department · ${s.department.name}`;
  }
  return 'Organisation consultation';
}
