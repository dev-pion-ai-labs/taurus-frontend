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
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  AlertCircle,
  Calendar,
  BarChart3,
  Loader2,
} from 'lucide-react';
import {
  useStackInventory,
  useStackSummary,
  useStackRecommendations,
  useAddTool,
  useUpdateTool,
  useRemoveTool,
  useSyncStack,
  useSpendTrends,
  useToolROI,
  useToolOverlaps,
  useUpcomingRenewals,
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

type StackTab = 'inventory' | 'spend' | 'roi' | 'overlaps' | 'renewals';

export default function StackPage() {
  const [activeTab, setActiveTab] = useState<StackTab>('inventory');
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

  const { data: spendTrends } = useSpendTrends();
  const { data: roi } = useToolROI();
  const { data: overlaps, isLoading: overlapsLoading } = useToolOverlaps();
  const { data: renewals } = useUpcomingRenewals();

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

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 border-b border-[#E7E5E4]">
        {([
          { key: 'inventory', label: 'Inventory' },
          { key: 'spend', label: 'Spend' },
          { key: 'roi', label: 'ROI' },
          { key: 'overlaps', label: 'Overlaps' },
          { key: 'renewals', label: 'Renewals' },
        ] as { key: StackTab; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-[#1C1917] text-[#1C1917]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab: Inventory */}
      {activeTab === 'inventory' && <>

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

      </>}

      {/* Tab: Spend Trends */}
      {activeTab === 'spend' && (
        <motion.div variants={itemVariants} className="space-y-4">
          {!spendTrends?.monthly?.length ? (
            <div className="py-16 text-center rounded-xl border border-[#E7E5E4] bg-white">
              <DollarSign className="mx-auto h-10 w-10 text-[#A8A29E]" />
              <p className="mt-3 text-sm font-medium text-[#78716C]">No spend data yet</p>
              <p className="mt-1 text-xs text-[#A8A29E]">Log monthly spend records for your tools to see trends here</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#1C1917]" />
                <h2 className="text-lg font-semibold text-[#1C1917]">Monthly Spend Trends</h2>
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                  spendTrends.trend === 'UP' ? 'bg-red-50 text-red-700' :
                  spendTrends.trend === 'DOWN' ? 'bg-green-50 text-green-700' :
                  'bg-gray-50 text-gray-700'
                }`}>
                  {spendTrends.trend === 'UP' && <TrendingUp className="inline h-3 w-3 mr-1" />}
                  {spendTrends.trend === 'DOWN' && <TrendingDown className="inline h-3 w-3 mr-1" />}
                  {spendTrends.trend === 'STABLE' && <Minus className="inline h-3 w-3 mr-1" />}
                  {spendTrends.trend}
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#E7E5E4] bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]">
                      <th className="px-4 py-3 text-left font-medium text-[#78716C]">Month</th>
                      <th className="px-4 py-3 text-right font-medium text-[#78716C]">Total</th>
                      <th className="px-4 py-3 text-left font-medium text-[#78716C]">Breakdown</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spendTrends.monthly.map((m) => (
                      <tr key={m.month} className="border-b border-[#E7E5E4] last:border-0">
                        <td className="px-4 py-3 font-medium text-[#1C1917]">{m.month}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#1C1917]">{formatDollar(m.total)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {m.byTool.slice(0, 4).map((t) => (
                              <span key={t.name} className="rounded-full bg-[#F5F5F4] px-2 py-0.5 text-xs text-[#78716C]">
                                {t.name}: ${t.amount.toLocaleString()}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Tab: ROI */}
      {activeTab === 'roi' && (
        <motion.div variants={itemVariants} className="space-y-4">
          {!roi?.tools?.length ? (
            <div className="py-16 text-center rounded-xl border border-[#E7E5E4] bg-white">
              <Target className="mx-auto h-10 w-10 text-[#A8A29E]" />
              <p className="mt-3 text-sm font-medium text-[#78716C]">No active tools with cost data</p>
              <p className="mt-1 text-xs text-[#A8A29E]">Add monthly costs to active tools to calculate ROI</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-[#E7E5E4] bg-white p-4">
                  <div className="text-xs text-[#78716C]">Total Annual Cost</div>
                  <p className="mt-1 text-2xl font-bold text-[#1C1917]">{formatDollar(roi.totalAnnualCost)}</p>
                </div>
                <div className="rounded-xl border border-[#E7E5E4] bg-white p-4">
                  <div className="text-xs text-[#78716C]">Total Estimated Value</div>
                  <p className="mt-1 text-2xl font-bold text-[#16a34a]">{formatDollar(roi.totalEstimatedValue)}</p>
                </div>
                <div className="rounded-xl border border-[#E7E5E4] bg-white p-4">
                  <div className="text-xs text-[#78716C]">Net ROI</div>
                  <p className={`mt-1 text-2xl font-bold ${roi.totalEstimatedValue > roi.totalAnnualCost ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                    {roi.totalAnnualCost > 0 ? `${Math.round(((roi.totalEstimatedValue - roi.totalAnnualCost) / roi.totalAnnualCost) * 100)}%` : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#E7E5E4] bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]">
                      <th className="px-4 py-3 text-left font-medium text-[#78716C]">Tool</th>
                      <th className="px-4 py-3 text-right font-medium text-[#78716C]">Monthly</th>
                      <th className="px-4 py-3 text-right font-medium text-[#78716C]">Annual</th>
                      <th className="px-4 py-3 text-right font-medium text-[#78716C]">Value</th>
                      <th className="px-4 py-3 text-right font-medium text-[#78716C]">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roi.tools.map((t) => (
                      <tr key={t.name} className="border-b border-[#E7E5E4] last:border-0">
                        <td className="px-4 py-3 font-medium text-[#1C1917]">{t.name}</td>
                        <td className="px-4 py-3 text-right text-[#78716C]">{formatDollar(t.monthlyCost)}</td>
                        <td className="px-4 py-3 text-right text-[#1C1917]">{formatDollar(t.annualCost)}</td>
                        <td className="px-4 py-3 text-right text-[#1C1917]">{formatDollar(t.estimatedValue)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            t.roiStatus === 'POSITIVE' ? 'bg-green-50 text-green-700' :
                            t.roiStatus === 'NEGATIVE' ? 'bg-red-50 text-red-700' :
                            'bg-gray-50 text-gray-500'
                          }`}>
                            {t.roi !== null ? `${t.roi}%` : 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Tab: Overlaps */}
      {activeTab === 'overlaps' && (
        <motion.div variants={itemVariants} className="space-y-4">
          {overlapsLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#78716C]" />
              <p className="mt-3 text-sm text-[#78716C]">Analyzing tool overlaps with AI...</p>
            </div>
          ) : !overlaps?.overlaps?.length ? (
            <div className="py-16 text-center rounded-xl border border-[#E7E5E4] bg-white">
              <Layers className="mx-auto h-10 w-10 text-[#A8A29E]" />
              <p className="mt-3 text-sm font-medium text-[#78716C]">No overlaps detected</p>
              <p className="mt-1 text-xs text-[#A8A29E]">{overlaps?.summary || 'Your stack looks well-optimized'}</p>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-[#E7E5E4] bg-white p-4">
                <p className="text-sm text-[#44403C]">{overlaps.summary}</p>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {overlaps.overlaps.map((o, i) => (
                  <div key={i} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {o.tools.map((t) => (
                            <span key={t} className="rounded-full bg-white border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800">
                              {t}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm font-medium text-amber-900">Overlap: {o.capability}</p>
                        <p className="mt-1 text-sm text-amber-700">{o.recommendation}</p>
                      </div>
                      {o.potentialSaving > 0 && (
                        <span className="shrink-0 text-sm font-semibold text-green-700">
                          Save {formatDollar(o.potentialSaving)}/mo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Tab: Renewals */}
      {activeTab === 'renewals' && (
        <motion.div variants={itemVariants} className="space-y-4">
          {!renewals?.length ? (
            <div className="py-16 text-center rounded-xl border border-[#E7E5E4] bg-white">
              <Calendar className="mx-auto h-10 w-10 text-[#A8A29E]" />
              <p className="mt-3 text-sm font-medium text-[#78716C]">No upcoming renewals</p>
              <p className="mt-1 text-xs text-[#A8A29E]">Add contract end dates to tools to track renewals</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#E7E5E4] bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]">
                    <th className="px-4 py-3 text-left font-medium text-[#78716C]">Tool</th>
                    <th className="px-4 py-3 text-left font-medium text-[#78716C]">Contract End</th>
                    <th className="px-4 py-3 text-right font-medium text-[#78716C]">Monthly Cost</th>
                    <th className="px-4 py-3 text-right font-medium text-[#78716C]">Utilization</th>
                    <th className="px-4 py-3 text-left font-medium text-[#78716C]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {renewals.map((tool) => {
                    const daysUntil = tool.contractEndDate
                      ? Math.ceil((new Date(tool.contractEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : null;
                    return (
                      <tr key={tool.id} className="border-b border-[#E7E5E4] last:border-0">
                        <td className="px-4 py-3 font-medium text-[#1C1917]">{tool.name}</td>
                        <td className="px-4 py-3 text-[#1C1917]">
                          {tool.contractEndDate ? new Date(tool.contractEndDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-[#1C1917]">
                          {tool.monthlyCost != null ? `$${tool.monthlyCost.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {tool.utilizationPercent != null ? (
                            <span className={`font-medium ${
                              tool.utilizationPercent >= 60 ? 'text-[#16a34a]' :
                              tool.utilizationPercent >= 30 ? 'text-[#d97706]' : 'text-[#dc2626]'
                            }`}>
                              {tool.utilizationPercent}%
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            daysUntil != null && daysUntil <= 7 ? 'bg-red-50 text-red-700' :
                            daysUntil != null && daysUntil <= 30 ? 'bg-amber-50 text-amber-700' :
                            'bg-blue-50 text-blue-700'
                          }`}>
                            {daysUntil != null ? `${daysUntil} days left` : 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
