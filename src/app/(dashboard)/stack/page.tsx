'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  DollarSign,
  Users,
  Star,
  Lightbulb,
  X,
} from 'lucide-react';
import {
  useStackInventory,
  useStackSummary,
  useStackRecommendations,
  useAddTool,
  useUpdateTool,
  useRemoveTool,
  useSyncStack,
} from '@/hooks/use-stack';
import { formatDollar, getImpactColor, getEffortColor } from '@/lib/format';
import type { ToolEntry, ToolCategory, ToolStatus } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const CATEGORY_LABELS: Record<string, string> = {
  AI_PLATFORM: 'AI Platform',
  AUTOMATION: 'Automation',
  ANALYTICS: 'Analytics',
  CRM: 'CRM',
  COMMUNICATION: 'Communication',
  DEVELOPMENT: 'Development',
  SECURITY: 'Security',
  INDUSTRY_SPECIFIC: 'Industry',
  OTHER: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700',
  EVALUATING: 'bg-amber-50 text-amber-700',
  IDENTIFIED: 'bg-blue-50 text-blue-700',
  DEPRECATED: 'bg-gray-100 text-gray-500',
};

const SOURCE_LABELS: Record<string, string> = {
  ONBOARDING: 'Onboarding',
  CONSULTATION: 'Consultation',
  DISCOVERY: 'Discovery',
  RECOMMENDATION: 'Report',
  MANUAL: 'Manual',
};

const CATEGORIES: ToolCategory[] = [
  'AI_PLATFORM', 'AUTOMATION', 'ANALYTICS', 'CRM',
  'COMMUNICATION', 'DEVELOPMENT', 'SECURITY', 'INDUSTRY_SPECIFIC', 'OTHER',
];

const STATUSES: ToolStatus[] = ['IDENTIFIED', 'EVALUATING', 'ACTIVE', 'DEPRECATED'];

interface ToolFormData {
  name: string;
  category: string;
  status: string;
  monthlyCost: string;
  userCount: string;
  rating: string;
  notes: string;
}

const emptyForm: ToolFormData = {
  name: '', category: 'OTHER', status: 'IDENTIFIED',
  monthlyCost: '', userCount: '', rating: '', notes: '',
};

function ToolDialog({
  open,
  tool,
  onClose,
  onSubmit,
  isPending,
}: {
  open: boolean;
  tool: ToolEntry | null;
  onClose: () => void;
  onSubmit: (data: ToolFormData) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<ToolFormData>(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(
        tool
          ? {
              name: tool.name,
              category: tool.category,
              status: tool.status,
              monthlyCost: tool.monthlyCost?.toString() || '',
              userCount: tool.userCount?.toString() || '',
              rating: tool.rating?.toString() || '',
              notes: tool.notes || '',
            }
          : emptyForm,
      );
    }
  }, [open, tool]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1C1917]">
            {tool ? 'Edit Tool' : 'Add Tool'}
          </h2>
          <button onClick={onClose} className="text-[#78716C] hover:text-[#1C1917]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Tool name"
            className="w-full rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#7c3aed] focus:outline-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#7c3aed] focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#7c3aed] focus:outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              value={form.monthlyCost}
              onChange={(e) => setForm({ ...form, monthlyCost: e.target.value })}
              placeholder="$/month"
              className="rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#7c3aed] focus:outline-none"
            />
            <input
              type="number"
              value={form.userCount}
              onChange={(e) => setForm({ ...form, userCount: e.target.value })}
              placeholder="Users"
              className="rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#7c3aed] focus:outline-none"
            />
            <input
              type="number"
              min="1"
              max="5"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              placeholder="Rating 1-5"
              className="rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#7c3aed] focus:outline-none"
            />
          </div>

          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#7c3aed] focus:outline-none"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#E7E5E4] px-4 py-2 text-sm font-medium text-[#78716C] hover:bg-[#FAFAF9]"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={!form.name.trim() || isPending}
            className="rounded-lg bg-[#1C1917] px-4 py-2 text-sm font-medium text-white hover:bg-[#292524] disabled:opacity-50"
          >
            {isPending ? 'Saving...' : tool ? 'Update' : 'Add Tool'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function StackPage() {
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolEntry | null>(null);

  const { data: tools, isLoading } = useStackInventory({
    category: filterCategory || undefined,
    status: filterStatus || undefined,
  });
  const { data: summary } = useStackSummary();
  const { data: recommendations } = useStackRecommendations();

  const addTool = useAddTool();
  const updateTool = useUpdateTool();
  const removeTool = useRemoveTool();
  const syncStack = useSyncStack();

  const handleSubmit = (form: ToolFormData) => {
    const payload = {
      name: form.name,
      category: form.category,
      status: form.status,
      monthlyCost: form.monthlyCost ? parseFloat(form.monthlyCost) : undefined,
      userCount: form.userCount ? parseInt(form.userCount) : undefined,
      rating: form.rating ? parseInt(form.rating) : undefined,
      notes: form.notes || undefined,
    };

    if (editingTool) {
      updateTool.mutate(
        { toolId: editingTool.id, ...payload },
        { onSuccess: () => { setDialogOpen(false); setEditingTool(null); } },
      );
    } else {
      addTool.mutate(payload, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const handleEdit = (tool: ToolEntry) => {
    setEditingTool(tool);
    setDialogOpen(true);
  };

  const handleDelete = (tool: ToolEntry) => {
    if (confirm(`Remove "${tool.name}" from your stack?`)) {
      removeTool.mutate(tool.id);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1917]">Stack Intelligence</h1>
          <p className="text-sm text-[#78716C]">
            Track your AI tool inventory, spend, and recommendations
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => syncStack.mutate()}
            disabled={syncStack.isPending}
            className="flex items-center gap-2 rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm font-medium text-[#78716C] hover:bg-[#FAFAF9] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncStack.isPending ? 'animate-spin' : ''}`} />
            Sync
          </button>
          <button
            onClick={() => { setEditingTool(null); setDialogOpen(true); }}
            className="flex items-center gap-2 rounded-lg bg-[#1C1917] px-3 py-2 text-sm font-medium text-white hover:bg-[#292524]"
          >
            <Plus className="h-4 w-4" />
            Add Tool
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      {summary && (
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total Tools', value: summary.totalTools, icon: Layers },
            { label: 'Monthly Spend', value: formatDollar(summary.monthlySpend), icon: DollarSign },
            { label: 'Annual Spend', value: formatDollar(summary.annualSpend), icon: DollarSign },
            { label: 'Active', value: summary.byStatus?.ACTIVE || 0, icon: Star },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[#E7E5E4] bg-white p-4">
              <div className="flex items-center gap-2 text-[#78716C]">
                <stat.icon className="h-4 w-4" />
                <span className="text-xs">{stat.label}</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-[#1C1917]">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex gap-3">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#1C1917] focus:border-[#7c3aed] focus:outline-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#1C1917] focus:border-[#7c3aed] focus:outline-none"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </motion.div>

      {/* Tools Table */}
      <motion.div
        variants={itemVariants}
        className="overflow-hidden rounded-xl border border-[#E7E5E4] bg-white"
      >
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-[#F5F5F4]" />
            ))}
          </div>
        ) : !tools?.length ? (
          <div className="py-16 text-center">
            <Layers className="mx-auto h-10 w-10 text-[#A8A29E]" />
            <p className="mt-3 text-sm font-medium text-[#78716C]">
              No tools in your stack yet
            </p>
            <p className="mt-1 text-xs text-[#A8A29E]">
              Add tools manually or sync from your reports and onboarding data
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]">
                <th className="px-4 py-3 text-left font-medium text-[#78716C]">Name</th>
                <th className="px-4 py-3 text-left font-medium text-[#78716C]">Category</th>
                <th className="px-4 py-3 text-left font-medium text-[#78716C]">Status</th>
                <th className="px-4 py-3 text-left font-medium text-[#78716C]">Source</th>
                <th className="px-4 py-3 text-right font-medium text-[#78716C]">Cost/mo</th>
                <th className="px-4 py-3 text-right font-medium text-[#78716C]">Users</th>
                <th className="px-4 py-3 text-right font-medium text-[#78716C]" />
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr key={tool.id} className="border-b border-[#E7E5E4] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-4 py-3 font-medium text-[#1C1917]">{tool.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#F5F5F4] px-2 py-0.5 text-xs text-[#78716C]">
                      {CATEGORY_LABELS[tool.category] || tool.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[tool.status] || ''}`}>
                      {tool.status.charAt(0) + tool.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#78716C]">
                    {SOURCE_LABELS[tool.source] || tool.source}
                  </td>
                  <td className="px-4 py-3 text-right text-[#1C1917]">
                    {tool.monthlyCost != null ? `$${tool.monthlyCost.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-[#1C1917]">
                    {tool.userCount ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleEdit(tool)}
                        className="rounded p-1 text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#1C1917]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tool)}
                        className="rounded p-1 text-[#78716C] hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-[#d97706]" />
            <h2 className="text-lg font-semibold text-[#1C1917]">
              Recommended Tools
            </h2>
            <span className="rounded-full bg-[#d97706]/10 px-2 py-0.5 text-xs font-medium text-[#d97706]">
              From Report
            </span>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#E7E5E4] bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-[#1C1917]">{rec.title}</h3>
                  <span className="text-sm font-semibold text-[#16a34a]">
                    {formatDollar(rec.annualValue)}/yr
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#78716C]">{rec.description}</p>
                <div className="mt-2 flex gap-2">
                  <span className="rounded-full bg-[#F5F5F4] px-2 py-0.5 text-xs text-[#78716C]">
                    {rec.department}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ color: getImpactColor(rec.impact), backgroundColor: `${getImpactColor(rec.impact)}10` }}
                  >
                    {rec.impact} impact
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ color: getEffortColor(rec.effort), backgroundColor: `${getEffortColor(rec.effort)}10` }}
                  >
                    {rec.effort} effort
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Dialog */}
      <ToolDialog
        open={dialogOpen}
        tool={editingTool}
        onClose={() => { setDialogOpen(false); setEditingTool(null); }}
        onSubmit={handleSubmit}
        isPending={addTool.isPending || updateTool.isPending}
      />
    </motion.div>
  );
}
