'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  HelpCircle,
  Loader2,
  MessageSquare,
  Network,
  Workflow as WorkflowIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
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
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
          Consultations
        </h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Run a consultation at the right level — organisation, department, or workflow.
        </p>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ScopeTab)}>
        <div className="flex items-end justify-between gap-3 border-b border-border">
          <TabsList variant="line" className="h-10 gap-2 p-0">
            <TabsTrigger value="ORG" className="h-10 gap-2 px-3 text-[13px]">
              <MessageSquare className="h-4 w-4" /> {TAB_LABEL.ORG}
            </TabsTrigger>
            <TabsTrigger value="DEPARTMENT" className="h-10 gap-2 px-3 text-[13px]">
              <Network className="h-4 w-4" /> {TAB_LABEL.DEPARTMENT}
            </TabsTrigger>
            <TabsTrigger value="WORKFLOW" className="h-10 gap-2 px-3 text-[13px]">
              <WorkflowIcon className="h-4 w-4" /> {TAB_LABEL.WORKFLOW}
            </TabsTrigger>
          </TabsList>

          <ScopeHelp scope={tab} />
        </div>

        <TabsContent value="ORG" className="pt-4">
          <OrgPanel />
        </TabsContent>
        <TabsContent value="DEPARTMENT" className="pt-4">
          <DepartmentPanel />
        </TabsContent>
        <TabsContent value="WORKFLOW" className="pt-4">
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
    <div className="flex flex-col gap-5">
      <ActionBar>
        <Button
          onClick={handleStart}
          disabled={startSession.isPending}
          className="h-10 gap-1.5"
        >
          {startSession.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Starting…
            </>
          ) : (
            <>
              Start Consultation <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </ActionBar>

      <PastSessions
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
  const selectedDept = deptList.find((d) => d.id === departmentId);

  return (
    <div className="flex flex-col gap-5">
      <ActionBar>
        {departments.isLoading ? (
          <Skeleton className="h-10 w-[240px]" />
        ) : deptList.length === 0 ? (
          <EmptyDepartmentsHint />
        ) : (
          <>
            <Select
              value={departmentId}
              onValueChange={(v) => setDepartmentId(v ?? '')}
            >
              <SelectTrigger className="h-10 w-[240px]">
                <SelectValue placeholder="Select a department…">
                  {selectedDept?.name}
                </SelectValue>
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
              className="h-10 gap-1.5"
            >
              {startSession.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Starting…
                </>
              ) : (
                <>
                  Start Consultation <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </>
        )}
      </ActionBar>

      <PastSessions
        sessions={sessions.data ?? []}
        loading={sessions.isLoading}
        filterLabel={selectedDept ? selectedDept.name : null}
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
  const selectedDept = deptList.find((d) => d.id === departmentId);
  const workflows: Workflow[] = selectedDept?.workflows ?? [];
  const selectedWorkflow = workflows.find((w) => w.id === workflowId);

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
    <div className="flex flex-col gap-5">
      <ActionBar>
        {departments.isLoading ? (
          <Skeleton className="h-10 w-[240px]" />
        ) : deptList.length === 0 ? (
          <EmptyDepartmentsHint />
        ) : (
          <>
            <Select
              value={departmentId}
              onValueChange={(v) => {
                setDepartmentId(v ?? '');
                setWorkflowId('');
              }}
            >
              <SelectTrigger className="h-10 w-[200px]">
                <SelectValue placeholder="Department…">
                  {selectedDept?.name}
                </SelectValue>
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
              <SelectTrigger className="h-10 w-[220px]">
                <SelectValue
                  placeholder={
                    !departmentId
                      ? 'Pick a department first'
                      : workflows.length === 0
                        ? 'No workflows here'
                        : 'Workflow…'
                  }
                >
                  {selectedWorkflow?.name}
                </SelectValue>
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

            <Button
              onClick={handleStart}
              disabled={!departmentId || !workflowId || startSession.isPending}
              className="h-10 gap-1.5"
            >
              {startSession.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Starting…
                </>
              ) : (
                <>
                  Start Consultation <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </>
        )}
      </ActionBar>

      <PastSessions
        sessions={sessions.data ?? []}
        loading={sessions.isLoading}
        filterLabel={selectedWorkflow ? selectedWorkflow.name : null}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared parts
// ---------------------------------------------------------------------------

function ActionBar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

function ScopeHelp({ scope }: { scope: ScopeTab }) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`About ${TAB_LABEL[scope]} consultation`}
            className="mb-1 inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          />
        }
      >
        <HelpCircle className="h-3.5 w-3.5" />
        About
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px]">
        <PopoverHeader>
          <PopoverTitle>{TAB_LABEL[scope]} consultation</PopoverTitle>
        </PopoverHeader>
        <PopoverDescription>{TAB_DESCRIPTION[scope]}</PopoverDescription>
      </PopoverContent>
    </Popover>
  );
}

function EmptyDepartmentsHint() {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
      No departments yet —{' '}
      <Link
        className="font-medium text-accent-foreground hover:underline"
        href="/departments"
      >
        add departments and workflows
      </Link>{' '}
      first.
    </div>
  );
}

function PastSessions({
  sessions,
  loading,
  filterLabel,
}: {
  sessions: ConsultationSession[];
  loading: boolean;
  filterLabel?: string | null;
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Past sessions
          {filterLabel ? (
            <span className="ml-2 rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-foreground">
              {filterLabel}
            </span>
          ) : null}
        </h2>
        {!loading && sessions.length > 0 ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            {sessions.length}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-1">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
          No consultations yet at this scope.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {sessions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/consultation/${s.id}`}
                className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13px] transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground">
                    {scopeTitle(s)}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {formatStarted(s.startedAt)}
                    {s._count?.questions ? ` · ${s._count.questions} questions` : ''}
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
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

function formatStarted(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
