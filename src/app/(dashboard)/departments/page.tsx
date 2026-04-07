'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, type Variants } from 'framer-motion';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Building,
  Workflow as WorkflowIcon,
  Users,
  Clock,
  Loader2,
  AlertCircle,
  Zap,
} from 'lucide-react';

import {
  useDepartments,
  useCreateDepartment,
  useDeleteDepartment,
  useCreateWorkflow,
  useDeleteWorkflow,
} from '@/hooks/use-departments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import type { Department, Workflow, AutomationLevel, WorkflowPriority } from '@/types';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const deptSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  headcount: z.string().optional(),
  avgSalary: z.string().optional(),
});

type DeptFormData = z.infer<typeof deptSchema>;

const workflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  weeklyHours: z.string().optional(),
  peopleInvolved: z.string().optional(),
  automationLevel: z.string().optional(),
  painPoints: z.string().optional(),
  priority: z.string().optional(),
});

type WorkflowFormData = z.infer<typeof workflowSchema>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AUTOMATION_LABELS: Record<AutomationLevel, string> = {
  NONE: 'No automation',
  LOW: 'Minimal (< 25%)',
  MODERATE: 'Some (25-50%)',
  HIGH: 'Mostly (50-80%)',
  FULL: 'Fully automated',
};

const AUTOMATION_COLORS: Record<AutomationLevel, string> = {
  NONE: 'bg-red-50 text-red-700 border-red-200',
  LOW: 'bg-orange-50 text-orange-700 border-orange-200',
  MODERATE: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FULL: 'bg-green-50 text-green-800 border-green-200',
};

const PRIORITY_COLORS: Record<WorkflowPriority, string> = {
  LOW: 'bg-stone-100 text-stone-600',
  MEDIUM: 'bg-blue-50 text-blue-700',
  HIGH: 'bg-orange-50 text-orange-700',
  CRITICAL: 'bg-red-50 text-red-700',
};

const SUGGESTED_DEPARTMENTS = [
  'Sales',
  'Marketing',
  'Customer Support',
  'Engineering',
  'Product',
  'Operations',
  'Finance',
  'HR',
];

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ---------------------------------------------------------------------------
// Add Department Form
// ---------------------------------------------------------------------------

function AddDepartmentForm({ existingNames }: { existingNames: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const createDept = useCreateDepartment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeptFormData>({
    resolver: zodResolver(deptSchema),
  });

  const onSubmit = (data: DeptFormData) => {
    const headcount = data.headcount ? parseInt(data.headcount, 10) : undefined;
    const avgSalary = data.avgSalary ? parseFloat(data.avgSalary) : undefined;
    createDept.mutate(
      {
        name: data.name,
        headcount: headcount && !isNaN(headcount) ? headcount : undefined,
        avgSalary: avgSalary && !isNaN(avgSalary) ? avgSalary : undefined,
      },
      {
        onSuccess: () => {
          toast.success(`${data.name} department added`);
          reset();
          setIsOpen(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const suggestions = SUGGESTED_DEPARTMENTS.filter(
    (s) => !existingNames.includes(s),
  );

  if (!isOpen) {
    return (
      <motion.div variants={itemVariants}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#D6D3D1] bg-[#FAFAF9] py-4 text-sm font-medium text-[#78716C] transition-colors hover:border-[#A8A29E] hover:text-[#57534E]"
        >
          <Plus className="h-4 w-4" />
          Add Department
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl border border-[#E7E5E4] bg-white p-5"
    >
      <h3 className="mb-4 text-[15px] font-semibold text-[#1C1917]">
        Add Department
      </h3>

      {suggestions.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-[#78716C]">
            Quick add
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  createDept.mutate(
                    { name },
                    {
                      onSuccess: () => toast.success(`${name} added`),
                      onError: (err) => toast.error(err.message),
                    },
                  );
                }}
                className="rounded-full border border-[#E7E5E4] bg-[#FAFAF9] px-3 py-1 text-[13px] text-[#44403C] transition-colors hover:bg-[#F5F5F4]"
              >
                + {name}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-sm text-[#1C1917]">Department name *</Label>
            <Input {...register('name')} placeholder="e.g. Sales" className="h-9 text-sm" />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-[#1C1917]">Headcount</Label>
            <Input {...register('headcount')} type="number" placeholder="e.g. 12" className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-[#1C1917]">Avg salary ($)</Label>
            <Input {...register('avgSalary')} type="number" placeholder="e.g. 75000" className="h-9 text-sm" />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button
            type="submit"
            size="sm"
            disabled={createDept.isPending}
            className="rounded-full bg-[#1C1917] text-white hover:bg-[#1C1917]/90"
          >
            {createDept.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => { reset(); setIsOpen(false); }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Add Workflow Form
// ---------------------------------------------------------------------------

function AddWorkflowForm({ departmentId }: { departmentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const createWorkflow = useCreateWorkflow();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: { automationLevel: 'NONE', priority: 'MEDIUM' },
  });

  const onSubmit = (data: WorkflowFormData) => {
    const weeklyHours = data.weeklyHours ? parseFloat(data.weeklyHours) : undefined;
    const peopleInvolved = data.peopleInvolved ? parseInt(data.peopleInvolved, 10) : undefined;
    createWorkflow.mutate(
      {
        departmentId,
        name: data.name,
        description: data.description || undefined,
        weeklyHours: weeklyHours && !isNaN(weeklyHours) ? weeklyHours : undefined,
        peopleInvolved: peopleInvolved && !isNaN(peopleInvolved) ? peopleInvolved : undefined,
        automationLevel: data.automationLevel || 'NONE',
        painPoints: data.painPoints || undefined,
        priority: data.priority || 'MEDIUM',
      },
      {
        onSuccess: () => {
          toast.success('Workflow added');
          reset({ automationLevel: 'NONE', priority: 'MEDIUM' });
          setIsOpen(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#D6D3D1] bg-[#FAFAF9]/50 py-3 text-[13px] font-medium text-[#78716C] transition-all hover:border-[#E11D48]/30 hover:bg-[#FFF1F2]/30 hover:text-[#E11D48]"
      >
        <Plus className="h-3.5 w-3.5" />
        Add workflow
      </button>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[#E7E5E4] bg-white shadow-sm">
      {/* Form header */}
      <div className="flex items-center gap-2.5 border-b border-[#F5F5F4] bg-gradient-to-r from-[#FFF1F2] to-[#FAFAF9] px-5 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E11D48]/10">
          <Zap className="h-3.5 w-3.5 text-[#E11D48]" />
        </div>
        <h4 className="text-[14px] font-semibold text-[#1C1917]">New Workflow</h4>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5">
        {/* Workflow identity */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#1C1917]">Workflow name <span className="text-[#E11D48]">*</span></Label>
            <Input {...register('name')} placeholder="e.g. Lead qualification, Invoice processing" className="h-10 rounded-lg border-[#E7E5E4] bg-[#FAFAF9] text-sm transition-colors focus:bg-white" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#1C1917]">Description</Label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Briefly describe what this workflow involves..."
              className="w-full rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] px-3 py-2.5 text-sm text-[#1C1917] outline-none transition-colors placeholder:text-[#A8A29E] focus:border-[#1C1917] focus:bg-white focus:ring-2 focus:ring-[#1C1917]/10"
            />
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-[13px] font-medium text-[#1C1917]">
              <Clock className="h-3.5 w-3.5 text-[#A8A29E]" />
              Hours/week
            </Label>
            <Input {...register('weeklyHours')} type="number" placeholder="20" className="h-10 rounded-lg border-[#E7E5E4] bg-[#FAFAF9] text-sm transition-colors focus:bg-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-[13px] font-medium text-[#1C1917]">
              <Users className="h-3.5 w-3.5 text-[#A8A29E]" />
              People involved
            </Label>
            <Input {...register('peopleInvolved')} type="number" placeholder="4" className="h-10 rounded-lg border-[#E7E5E4] bg-[#FAFAF9] text-sm transition-colors focus:bg-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-[13px] font-medium text-[#1C1917]">
              <Zap className="h-3.5 w-3.5 text-[#A8A29E]" />
              Automation
            </Label>
            <Select value={watch('automationLevel') ?? 'NONE'} onValueChange={(v) => setValue('automationLevel', v ?? undefined)}>
              <SelectTrigger className="h-10 rounded-lg border-[#E7E5E4] bg-[#FAFAF9] text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(AUTOMATION_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-[13px] font-medium text-[#1C1917]">
              <AlertCircle className="h-3.5 w-3.5 text-[#A8A29E]" />
              Priority
            </Label>
            <Select value={watch('priority') ?? 'MEDIUM'} onValueChange={(v) => setValue('priority', v ?? undefined)}>
              <SelectTrigger className="h-10 rounded-lg border-[#E7E5E4] bg-[#FAFAF9] text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pain points */}
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-[#1C1917]">Pain points</Label>
          <textarea
            {...register('painPoints')}
            rows={2}
            placeholder="What's slow, broken, or frustrating about this workflow?"
            className="w-full rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] px-3 py-2.5 text-sm text-[#1C1917] outline-none transition-colors placeholder:text-[#A8A29E] focus:border-[#1C1917] focus:bg-white focus:ring-2 focus:ring-[#1C1917]/10"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-[#F5F5F4] pt-4">
          <Button type="submit" size="sm" disabled={createWorkflow.isPending} className="rounded-lg bg-[#1C1917] px-5 text-white hover:bg-[#1C1917]/90">
            {createWorkflow.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Add Workflow
          </Button>
          <button
            type="button"
            onClick={() => { reset(); setIsOpen(false); }}
            className="text-[13px] font-medium text-[#78716C] transition-colors hover:text-[#1C1917]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Workflow row
// ---------------------------------------------------------------------------

function WorkflowRow({ workflow }: { workflow: Workflow }) {
  const deleteWorkflow = useDeleteWorkflow();

  return (
    <div className="flex items-start gap-3 rounded-lg border border-[#F5F5F4] bg-white px-4 py-3">
      <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[#E11D48]" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-medium text-[#1C1917]">{workflow.name}</span>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${AUTOMATION_COLORS[workflow.automationLevel]}`}>
            {AUTOMATION_LABELS[workflow.automationLevel]}
          </span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_COLORS[workflow.priority]}`}>
            {workflow.priority}
          </span>
        </div>
        {workflow.description && (
          <p className="mt-0.5 text-[13px] text-[#57534E]">{workflow.description}</p>
        )}
        <div className="mt-1.5 flex items-center gap-4 text-[12px] text-[#A8A29E]">
          {workflow.weeklyHours != null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {workflow.weeklyHours}h/week
            </span>
          )}
          {workflow.peopleInvolved != null && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {workflow.peopleInvolved} people
            </span>
          )}
        </div>
        {workflow.painPoints && (
          <p className="mt-1.5 flex items-start gap-1.5 text-[12px] text-[#78716C]">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
            {workflow.painPoints}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => deleteWorkflow.mutate(workflow.id, {
          onSuccess: () => toast.success('Workflow deleted'),
          onError: (err) => toast.error(err.message),
        })}
        className="shrink-0 rounded-lg p-1.5 text-[#A8A29E] transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Department card
// ---------------------------------------------------------------------------

function DepartmentCard({ department }: { department: Department }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const deleteDept = useDeleteDepartment();

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl border border-[#E7E5E4] bg-white"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0 text-[#78716C]"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF1F2]">
          <Building className="h-4.5 w-4.5 text-[#E11D48]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-[#1C1917]">{department.name}</h3>
          <div className="flex items-center gap-3 text-[12px] text-[#A8A29E]">
            {department.headcount != null && (
              <span>{department.headcount} people</span>
            )}
            {department.avgSalary != null && (
              <span>${department.avgSalary.toLocaleString()}/yr avg</span>
            )}
            <span>{department.workflows.length} workflow{department.workflows.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => deleteDept.mutate(department.id, {
            onSuccess: () => toast.success(`${department.name} deleted`),
            onError: (err) => toast.error(err.message),
          })}
          className="shrink-0 rounded-lg p-2 text-[#A8A29E] transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Workflows */}
      {isExpanded && (
        <div className="border-t border-[#F5F5F4] px-5 py-4">
          {department.workflows.length > 0 ? (
            <div className="space-y-2">
              {department.workflows.map((w) => (
                <WorkflowRow key={w.id} workflow={w} />
              ))}
            </div>
          ) : (
            <p className="py-2 text-center text-[13px] text-[#A8A29E]">
              No workflows mapped yet. Add one below.
            </p>
          )}
          <div className="mt-3">
            <AddWorkflowForm departmentId={department.id} />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function DepartmentsPage() {
  const { data: departments, isLoading } = useDepartments();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="mb-6 h-8 w-64" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  const existingNames = (departments || []).map((d) => d.name);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-4xl"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-[24px] font-semibold text-[#1C1917]">
          Departments & Workflows
        </h1>
        <p className="mt-1 text-[14px] text-[#78716C]">
          Map your organization's departments and key workflows. This data powers the AI Transformation Roadmap.
        </p>
      </motion.div>

      {/* Stats bar */}
      {departments && departments.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            {
              label: 'Departments',
              value: departments.length,
              icon: Building,
            },
            {
              label: 'Total Headcount',
              value: departments.reduce((s, d) => s + (d.headcount || 0), 0),
              icon: Users,
            },
            {
              label: 'Workflows',
              value: departments.reduce((s, d) => s + d.workflows.length, 0),
              icon: WorkflowIcon,
            },
            {
              label: 'Hours/week mapped',
              value: departments.reduce(
                (s, d) =>
                  s +
                  d.workflows.reduce((ws, w) => ws + (w.weeklyHours || 0), 0),
                0,
              ),
              icon: Clock,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-[#E7E5E4] bg-white px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-[#A8A29E]" />
                <span className="text-[12px] font-medium uppercase tracking-wider text-[#78716C]">
                  {label}
                </span>
              </div>
              <p className="mt-1 text-[22px] font-bold text-[#1C1917]">
                {value}
              </p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Department list */}
      <div className="space-y-4">
        {(departments || []).map((dept) => (
          <DepartmentCard key={dept.id} department={dept} />
        ))}
        <AddDepartmentForm existingNames={existingNames} />
      </div>
    </motion.div>
  );
}
