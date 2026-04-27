'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ChevronRight,
  GitBranch,
  Loader2,
  Sparkles,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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

const SCOPE_LABEL: Record<ScopeTab, string> = {
  ORG: 'organisation',
  DEPARTMENT: 'department',
  WORKFLOW: 'workflow',
};

const HERO_TITLE: Record<ScopeTab, string> = {
  ORG: 'Organisation consultation',
  DEPARTMENT: 'Department consultation',
  WORKFLOW: 'Workflow consultation',
};

const HERO_DESCRIPTION: Record<ScopeTab, string> = {
  ORG: 'A company-wide consultation. Covers strategy, maturity, and roadmap across the entire organisation.',
  DEPARTMENT:
    'Scoped to a single department. Questions and the report focus only on that team’s workflows, headcount, and pain points.',
  WORKFLOW:
    'Scoped to a single workflow. Deep-dive into one specific process — the tightest grounding for actionable recommendations.',
};

const SCOPE_ICON: Record<ScopeTab, React.ComponentType<{ className?: string }>> = {
  ORG: Building2,
  DEPARTMENT: Users,
  WORKFLOW: GitBranch,
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
          Run a consultation at the right level of detail — organisation, department, or a single workflow.
        </p>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ScopeTab)}>
        <div className="border-b border-border">
          <TabsList variant="line" className="h-10 gap-2 p-0">
            <TabsTrigger value="ORG" className="h-10 gap-2 px-3 text-[13px]">
              <Building2 className="h-4 w-4" /> {TAB_LABEL.ORG}
            </TabsTrigger>
            <TabsTrigger value="DEPARTMENT" className="h-10 gap-2 px-3 text-[13px]">
              <Users className="h-4 w-4" /> {TAB_LABEL.DEPARTMENT}
            </TabsTrigger>
            <TabsTrigger value="WORKFLOW" className="h-10 gap-2 px-3 text-[13px]">
              <GitBranch className="h-4 w-4" /> {TAB_LABEL.WORKFLOW}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ORG" className="pt-5">
          <OrgPanel />
        </TabsContent>
        <TabsContent value="DEPARTMENT" className="pt-5">
          <DepartmentPanel />
        </TabsContent>
        <TabsContent value="WORKFLOW" className="pt-5">
          <WorkflowPanel />
        </TabsContent>
      </Tabs>

      <ScopeLevelGrid />

      <TipBanner />
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
      <HeroCard scope="ORG">
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
              Start Organisation Consultation <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </HeroCard>

      <PastSessions
        scope="ORG"
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

  const controls =
    departments.isLoading ? (
      <Skeleton className="h-10 w-[240px]" />
    ) : deptList.length === 0 ? (
      <EmptyDepartmentsHint />
    ) : (
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={departmentId}
          onValueChange={(v) => setDepartmentId(v ?? '')}
        >
          <SelectTrigger className="h-10 w-[240px] bg-card">
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
              Start Department Consultation <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    );

  return (
    <div className="flex flex-col gap-5">
      <HeroCard scope="DEPARTMENT">{controls}</HeroCard>

      <PastSessions
        scope="DEPARTMENT"
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

  const controls =
    departments.isLoading ? (
      <Skeleton className="h-10 w-[240px]" />
    ) : deptList.length === 0 ? (
      <EmptyDepartmentsHint />
    ) : (
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={departmentId}
          onValueChange={(v) => {
            setDepartmentId(v ?? '');
            setWorkflowId('');
          }}
        >
          <SelectTrigger className="h-10 w-[200px] bg-card">
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
          <SelectTrigger className="h-10 w-[220px] bg-card">
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
              Start Workflow Consultation <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    );

  return (
    <div className="flex flex-col gap-5">
      <HeroCard scope="WORKFLOW">{controls}</HeroCard>

      <PastSessions
        scope="WORKFLOW"
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

function HeroCard({
  scope,
  children,
}: {
  scope: ScopeTab;
  children: React.ReactNode;
}) {
  const Icon = SCOPE_ICON[scope];
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-muted/60 to-transparent"
      />
      <div className="relative flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-accent text-accent-foreground">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
              {HERO_TITLE[scope]}
            </h2>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
              {HERO_DESCRIPTION[scope]}
            </p>
          </div>
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    </div>
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
  scope,
  sessions,
  loading,
  filterLabel,
}: {
  scope: ScopeTab;
  sessions: ConsultationSession[];
  loading: boolean;
  filterLabel?: string | null;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-[13px] font-semibold tracking-tight text-foreground">
          Past sessions <span className="text-muted-foreground">· {SCOPE_LABEL[scope]}</span>
          {filterLabel ? (
            <span className="ml-2 rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-normal text-foreground">
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
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
          No consultations yet at this scope.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {sessions.map((s) => {
            const Icon = SCOPE_ICON[s.scope];
            return (
              <li key={s.id}>
                <Link
                  href={`/consultation/${s.id}`}
                  className="flex items-center justify-between gap-3 py-3 text-[13px] transition-colors hover:bg-muted/40 -mx-2 px-2 rounded-md"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-accent text-accent-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground">
                        {scopeTitle(s)}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {formatStarted(s.startedAt)}
                        {s._count?.questions
                          ? ` · ${s._count.questions} questions`
                          : ''}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ScopeLevelGrid() {
  const items: {
    scope: ScopeTab;
    title: string;
    description: string;
  }[] = [
    {
      scope: 'ORG',
      title: 'Organisation level',
      description:
        'Get the big picture. Ideal for strategy, maturity assessments, and roadmap planning.',
    },
    {
      scope: 'DEPARTMENT',
      title: 'Department level',
      description:
        'Focus on what matters. Deep-dive into a single department’s workflows, headcount, and pain points.',
    },
    {
      scope: 'WORKFLOW',
      title: 'Workflow level',
      description:
        'Zoom in on a single workflow. Uncover actionable insights and optimisation opportunities.',
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ scope, title, description }) => {
        const Icon = SCOPE_ICON[scope];
        return (
          <div
            key={scope}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 text-accent-foreground" />
              <h3 className="text-[13px] font-semibold tracking-tight text-foreground">
                {title}
              </h3>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function TipBanner() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-[13px]">
      <span className="inline-flex items-center gap-1.5 font-semibold text-accent-foreground">
        <Sparkles className="h-3.5 w-3.5" /> Tip
      </span>
      <span className="text-muted-foreground">
        Not sure which level to start with? Begin with an organisation consultation for a comprehensive overview.
      </span>
    </div>
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
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
