// User
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'ADMIN' | 'MEMBER';
  organizationId: string | null;
  organization: Organization | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Organization
export interface Organization {
  id: string;
  name: string;
  industryId: string;
  size: string | null;
  industry: Industry;
  createdAt: string;
  updatedAt: string;
}

// Industry
export interface Industry {
  id: string;
  name: string;
  normalizedKey: string;
  aliases: string[];
  createdAt: string;
}

// Templates
export interface ConsultationTemplate {
  id: string;
  type: 'BASE' | 'INDUSTRY';
  status: 'GENERATING' | 'ACTIVE' | 'DEPRECATED';
  version: number;
  industryId: string | null;
  industry: Industry | null;
  questions?: TemplateQuestion[];
  _count?: { questions: number };
  createdAt: string;
}

export interface TemplateQuestion {
  id: string;
  templateId: string;
  questionText: string;
  questionType: 'TEXT' | 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'SCALE';
  options: string[] | null;
  orderIndex: number;
  isRequired: boolean;
  metadata: unknown;
}

// Sessions
export interface ConsultationSession {
  id: string;
  organizationId: string;
  userId: string;
  status: 'PENDING_TEMPLATE' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'FAILED';
  startedAt: string;
  completedAt: string | null;
  questions: SessionQuestion[];
  organization: Organization;
  user?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;
  _count?: { questions: number };
  report?: {
    id: string;
    status: ReportStatus;
  } | null;
}

export interface SessionQuestion {
  id: string;
  sessionId: string;
  questionId: string | null;
  section: 'BASE' | 'INDUSTRY' | 'CHALLENGE_BONUS' | 'PERSONALIZED' | 'ADAPTIVE';
  orderIndex: number;
  answer: { value: string | string[] | number } | null;
  answeredAt: string | null;
  skipped: boolean;
  isAdaptive?: boolean;
  question: TemplateQuestion;
}

export interface CurrentQuestionResponse {
  status: string;
  question: SessionQuestion | null;
  progress: { answered: number; total: number };
}

export interface SubmitAnswerResponse {
  status: 'IN_PROGRESS' | 'COMPLETED';
  nextQuestion: SessionQuestion | null;
  progress?: { answered: number; total: number };
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API envelope
export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Onboarding Questionnaire
export interface OnboardingData {
  companyName: string;
  companyUrl: string;
  industryId: string;
  customIndustry: string;
  companySize: string;
  businessDescription: string;
  revenueStreams: string;
  selectedChallenges: string[];
  customChallenges: string;
  availableData: string[];
  customDataSources: string;
  selectedTools: string[];
  customTools: string;
  selectedGoals: string[];
  customGoals: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  url?: string;
}

export interface OnboardingStatus {
  completed: boolean;
  currentStep: number;
  data: Partial<OnboardingData> | null;
  documents: UploadedDocument[];
}

export interface OnboardingSubmitResponse {
  success: boolean;
  message: string;
}

// Onboarding Profile (display-ready)
export interface OnboardingProfile {
  companyName: string | null;
  companyUrl: string | null;
  industry: { id: string; name: string } | null;
  customIndustry: string | null;
  companySize: string | null;
  businessDescription: string | null;
  revenueStreams: string | null;
  challenges: { selected: string[]; custom: string | null };
  dataAvailability: { selected: string[]; custom: string | null };
  tools: { selected: string[]; custom: string | null };
  goals: { selected: string[]; custom: string | null };
  documents: UploadedDocument[];
  completedAt: string;
}

// Departments & Workflows
export type AutomationLevel = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'FULL';
export type WorkflowPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Workflow {
  id: string;
  departmentId: string;
  name: string;
  description: string | null;
  weeklyHours: number | null;
  peopleInvolved: number | null;
  automationLevel: AutomationLevel;
  painPoints: string | null;
  priority: WorkflowPriority;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  headcount: number | null;
  avgSalary: number | null;
  notes: string | null;
  workflows: Workflow[];
  _count?: { workflows: number };
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentSummary {
  departmentCount: number;
  totalHeadcount: number;
  totalWorkflows: number;
  totalWeeklyHours: number;
  automationBreakdown: Record<AutomationLevel, number>;
  departments: {
    id: string;
    name: string;
    headcount: number | null;
    avgSalary: number | null;
    workflowCount: number;
    weeklyHours: number;
    workflows: Pick<
      Workflow,
      'id' | 'name' | 'description' | 'weeklyHours' | 'peopleInvolved' | 'automationLevel' | 'painPoints' | 'priority'
    >[];
  }[];
}

// AI-generated insights
export interface OnboardingInsights {
  summary: string;
  readinessScore: number;
  topOpportunities: {
    title: string;
    description: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    timeframe: 'SHORT' | 'MEDIUM' | 'LONG';
  }[];
  quickWins: string[];
  risks: string[];
  recommendedNextSteps: string[];
}

// ─── Website Scraping ──────────────────────────────────

export type ScrapingStatus = 'NOT_STARTED' | 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface ScrapedWebsiteData {
  title?: string;
  description?: string;
  keywords?: string[];
  headings?: string[];
  mainContent?: string;
  socialLinks?: string[];
  contactInfo?: {
    emails?: string[];
    phones?: string[];
    email?: string;
    phone?: string;
  };
  metadata?: {
    url?: string;
    scrapedAt?: string;
    language?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    statusCode?: number;
    contentType?: string;
    pagesDiscovered?: number;
    pagesScraped?: number;
  };
  businessData?: {
    companyInfo?: {
      name?: string;
      mission?: string;
      industry?: string;
      companySize?: string;
      founded?: string;
      headquarters?: string;
    };
    products?: Array<{ name?: string; description?: string; category?: string }>;
    services?: Array<{ name?: string; description?: string }>;
    businessModel?: { type?: string; revenueStreams?: string[] };
    challenges?: string[];
    goals?: string[];
    technologies?: string[];
    aiDetected?: boolean;
    aiMentions?: string[];
    automationDetected?: boolean;
    automationMentions?: string[];
  };
  links?: string[];
  images?: string[];
  branding?: any;
  error?: string;
}

export interface ScrapingStatusResponse {
  status: ScrapingStatus;
  companyUrl: string | null;
  scrapedContent: ScrapedWebsiteData | null;
  scrapedAt: string | null;
}

// ─── Transformation Report ─────────────────────────────

export type ReportStatus = 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface TransformationReport {
  id: string;
  sessionId: string;
  organizationId: string;
  status: ReportStatus;
  // Legacy fields — populated for backward-compatible rendering
  overallScore: number | null;
  maturityLevel: string | null;
  totalEfficiencyValue: number | null;
  totalGrowthValue: number | null;
  totalAiValue: number | null;
  executiveSummary: {
    summary: string;
    keyFindings: string[];
  } | null;
  departmentScores: DepartmentScore[] | null;
  recommendations: Recommendation[] | null;
  implementationPlan: Phase[] | null;
  // New briefing fields (optional — present on reports generated after the
  // briefing rework; absent on legacy reports)
  companyType?: CompanyType | null;
  primaryAudience?: PrimaryAudience | null;
  reportGoal?: ReportGoal | null;
  thesis?: string | null;
  bigMove?: string | null;
  totalAiValueLow?: number | null;
  totalAiValueHigh?: number | null;
  confidenceNote?: ConfidenceNote | null;
  snapshot?: ReportSnapshot | null;
  executiveBrief?: ExecutiveBrief | null;
  decisionBlocks?: DecisionBlock[] | null;
  assumptionsAndLimits?: AssumptionsAndLimitations | null;
  peerContext?: PeerContext | null;
  generatedAt: string | null;
  createdAt: string;
}

// ─── Briefing types ───────────────────────────────────────

export type CompanyType =
  | 'Enterprise'
  | 'ProfServices'
  | 'Startup'
  | 'ProductTech';
export type PrimaryAudience = 'CLevel' | 'Partner' | 'Founder';
export type ReportGoal = 'Decide' | 'Align' | 'Validate' | 'Explore';
export type ConfidenceNote =
  | 'data-grounded'
  | 'directional'
  | 'order-of-magnitude';
export type MaturityStage = 'Early' | 'Working' | 'Scaling' | 'Native';

export interface ValueRange {
  low: number;
  high: number;
  logic: string;
  assumptions: string[];
  confidenceNote: ConfidenceNote;
}

export interface MaturityLadder {
  stage: MaturityStage;
  evidence: string;
  gaps: string;
}

export interface SnapshotStat {
  label: string;
  value: string;
}

export interface ReportSnapshot {
  headline: string;
  bottomLine: string;
  keyStats: SnapshotStat[];
  watchouts: string[];
  readingTime: string;
  confidenceNote: ConfidenceNote;
}

export interface ExecutiveBrief {
  thesis: string;
  bigMove: string;
  decisionsRequired: string[];
  valueSummary: ValueRange;
  portfolioMaturity: MaturityLadder;
  deliveryMaturity: MaturityLadder;
}

export interface ExecutionBlocker {
  blocker: string;
  category: 'organizational' | 'technical' | 'behavioral';
  mitigation: string;
}

export interface NinetyDayAction {
  title: string;
  ownerRole: string;
  week: string;
  successSignal: string;
}

export interface NinetyDayPlan {
  objective: string;
  actions: NinetyDayAction[];
}

export interface RiskTradeoff {
  risk: string;
  resistanceSource: string;
  mitigation: string;
}

export interface DecisionBlock {
  id: string;
  decision: string;
  whyNow: {
    urgency: string;
    costOfInaction: string;
  };
  value: ValueRange;
  ownership: {
    accountableRole: string;
    supportingRoles: string[];
  };
  executionReality: ExecutionBlocker[];
  ninetyDayPlan: NinetyDayPlan;
  proofPoint: {
    metric: string;
    threshold: string;
    reviewBy: string;
  };
  dependencies: string[];
  risksAndTradeoffs: RiskTradeoff[];
}

export interface AssumptionsAndLimitations {
  scopeOfInputData: string;
  uncertaintyNotes: string[];
  validationRequired: string[];
}

export interface PeerContext {
  note: string;
  confidence: 'directional' | 'none';
  sources: string[];
}

export interface DepartmentScore {
  department: string;
  score: number;
  maturityLevel: string;
  currentState: string;
  potentialState: string;
  efficiencyValue: number;
  growthValue: number;
  workflows: WorkflowAnalysis[];
}

export interface WorkflowAnalysis {
  name: string;
  currentProcess: string;
  aiOpportunity: string;
  automationPotential: number;
  weeklyHoursSaved: number;
  annualValueSaved: number;
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  timeframe: 'WEEKS' | 'MONTHS' | 'QUARTER';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  department: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  annualValue: number;
  timeToImplement: string;
  prerequisites: string[];
  category: 'EFFICIENCY' | 'GROWTH' | 'EXPERIENCE' | 'INTELLIGENCE';
}

export interface Phase {
  phase: number;
  name: string;
  timeframe: string;
  focus: string;
  totalValue: number;
  actions: PhaseAction[];
}

export interface PhaseAction {
  title: string;
  department: string;
  value: number;
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
}

// ─── Executive Dashboard ────────────────────────────────

export interface ExecutiveDashboard {
  currentScore: number | null;
  previousScore: number | null;
  maturityLevel: string | null;
  scoreHistory: { date: string; score: number }[];
  totalValueIdentified: number | null;
  efficiencyValue: number | null;
  growthValue: number | null;
  sessionsCompleted: number;
  totalRecommendations: number;
  departmentScores: {
    department: string;
    score: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    status: 'LEADING' | 'ON_TRACK' | 'LAGGING';
  }[];
  topRecommendations: {
    title: string;
    department: string;
    annualValue: number;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    effort: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
  tracker: {
    valueRealized: number;
    valueIdentified: number;
    activeActions: number;
    completedActions: number;
    blockedActions: number;
    totalActions: number;
  };
}

// ─── Transformation Tracker ──────────────────────────────

export type ActionStatus =
  | 'BACKLOG'
  | 'THIS_SPRINT'
  | 'IN_PROGRESS'
  | 'AWAITING_APPROVAL'
  | 'DEPLOYED'
  | 'VERIFIED';

export type ActionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EstimatedEffort = 'HOURS' | 'DAYS' | 'WEEKS' | 'MONTHS';

export type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED';

export interface ActionAssignee {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface TransformationAction {
  id: string;
  organizationId: string;
  sessionId: string | null;
  sourceRecommendationId: string | null;
  title: string;
  description: string | null;
  department: string | null;
  category: string | null;
  status: ActionStatus;
  assigneeId: string | null;
  priority: ActionPriority;
  estimatedValue: number | null;
  actualValue: number | null;
  estimatedEffort: EstimatedEffort | null;
  phase: number | null;
  orderIndex: number;
  dueDate: string | null;
  startedAt: string | null;
  deployedAt: string | null;
  verifiedAt: string | null;
  blockerNote: string | null;
  sprintId: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: ActionAssignee | null;
  sprint: { id: string; name: string } | null;
  _count?: { comments: number };
  comments?: ActionComment[];
}

export interface Sprint {
  id: string;
  organizationId: string;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  goal: string | null;
  status: SprintStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { actions: number };
}

export interface ActionComment {
  id: string;
  actionId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: ActionAssignee;
}

export interface TrackerBoard {
  columns: Record<ActionStatus, TransformationAction[]>;
}

export interface TrackerStats {
  total: number;
  byStatus: Record<ActionStatus, number>;
  valueIdentified: number;
  valueRealized: number;
  blockedCount: number;
  activeActions: number;
  completedActions: number;
}

// ─── AI Discovery (Module 1) ────────────────────────────

export type DiscoveryStatus = 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface DiscoveryReport {
  id: string;
  url: string;
  domain: string;
  email: string | null;
  organizationId: string | null;
  score: number | null;
  maturityLevel: string | null;
  industry: string | null;
  companySize: string | null;
  techStack: { name: string; category: string }[] | null;
  aiSignals: { type: string; detail: string }[] | null;
  summary: string | null;
  recommendations: { title: string; description: string; priority: string }[] | null;
  status: DiscoveryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveryScanResponse {
  id: string;
  status: DiscoveryStatus;
  url: string;
  domain: string;
}

// ─── AI Stack Intelligence (Module 6) ──────────────────

export type ToolCategory =
  | 'AI_PLATFORM' | 'AUTOMATION' | 'ANALYTICS' | 'CRM'
  | 'COMMUNICATION' | 'DEVELOPMENT' | 'SECURITY'
  | 'INDUSTRY_SPECIFIC' | 'OTHER';

export type ToolSource = 'ONBOARDING' | 'CONSULTATION' | 'DISCOVERY' | 'RECOMMENDATION' | 'MANUAL';

export type ToolStatus = 'IDENTIFIED' | 'EVALUATING' | 'ACTIVE' | 'DEPRECATED';

export interface ToolEntry {
  id: string;
  organizationId: string;
  name: string;
  category: ToolCategory;
  source: ToolSource;
  sourceId: string | null;
  status: ToolStatus;
  departmentIds: string[] | null;
  monthlyCost: number | null;
  userCount: number | null;
  rating: number | null;
  notes: string | null;
  utilizationPercent: number | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  renewalAlertDays: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface StackSummary {
  totalTools: number;
  monthlySpend: number;
  annualSpend: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  avgUtilization: number | null;
}

export interface StackRecommendation {
  title: string;
  description: string;
  department: string;
  annualValue: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface StackSyncResult {
  onboarding: number;
  report: number;
  discovery: number;
  total: number;
}

// ─── Extended Dashboard Analytics ──────────────────────

export interface MaturityTrendPoint {
  date: string;
  score: number | null;
  maturityLevel: string | null;
  change: number;
}

export interface RoadmapProgress {
  totalActions: number;
  completedActions: number;
  completionRate: number;
  byStatus: Record<string, { count: number; value: number }>;
  byDepartment: Record<string, { total: number; completed: number }>;
}

export interface ValueRealization {
  totalEstimated: number;
  totalRealized: number;
  realizationRate: number;
  timeline: { date: string; cumulative: number }[];
}

export interface SprintVelocity {
  sprints: {
    sprint: string;
    number: number;
    startDate: string;
    endDate: string;
    totalActions: number;
    completedActions: number;
    valueDelivered: number;
  }[];
  averageVelocity: number;
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'INSUFFICIENT_DATA';
}

export interface StackOverview {
  totalTools: number;
  monthlySpend: number;
  annualSpend: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  activeTools: number;
}

// ─── Phase 1 New Types ─────────────────────────────────

export interface SprintSuggestion {
  name: string;
  goal: string;
  suggestedActions: string[];
  rationale: string;
  estimatedValue: number;
}

export interface SpendRecord {
  id: string;
  toolEntryId: string;
  organizationId: string;
  month: string;
  amount: number;
  notes: string | null;
  createdAt: string;
  toolEntry: { name: string; category: string };
}

export interface SpendTrends {
  monthly: {
    month: string;
    total: number;
    byTool: { name: string; amount: number }[];
  }[];
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface ToolROI {
  tools: {
    name: string;
    monthlyCost: number;
    annualCost: number;
    estimatedValue: number;
    roi: number | null;
    roiStatus: 'POSITIVE' | 'NEGATIVE' | 'UNKNOWN';
  }[];
  totalAnnualCost: number;
  totalEstimatedValue: number;
}

export interface ToolOverlapResult {
  overlaps: {
    tools: string[];
    capability: string;
    recommendation: string;
    potentialSaving: number;
  }[];
  summary: string;
}

export interface TeamReadiness {
  departments: {
    name: string;
    score: number;
    maturityLevel: string;
    readinessStatus: 'READY' | 'DEVELOPING' | 'NOT_READY';
  }[];
  overallReadiness: number;
  memberCount: number;
}

export interface RiskOverview {
  blockedActions: number;
  stalledActions: number;
  untrackedSpendTools: number;
  upcomingRenewals: number;
  riskScore: number;
}

// ─── Implementation Engine (Module 4) ──────────────────

export type DeploymentPlanStatus =
  | 'DRAFT'
  | 'PLANNING'
  | 'PLAN_READY'
  | 'APPROVED'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'FAILED';

export type ArtifactType =
  | 'IMPLEMENTATION_GUIDE'
  | 'CONFIGURATION_TEMPLATE'
  | 'INTEGRATION_CHECKLIST'
  | 'VENDOR_EVALUATION'
  | 'CODE_SNIPPET'
  | 'CUSTOM';

export interface DeploymentPlanStep {
  stepNumber: number;
  title: string;
  description: string;
  estimatedDuration: string;
  dependencies: number[];
}

export interface DeploymentPlanRisk {
  risk: string;
  mitigation: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export type DeploymentStepStatus =
  | 'pending'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface DeploymentStepPlan {
  provider: IntegrationProvider;
  tool: string;
  params: Record<string, unknown>;
  dependsOn?: number[];
  description?: string;
  // Runtime state — populated by the backend PlanExecutor after Deploy.
  status?: DeploymentStepStatus;
  result?: unknown;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface DeploymentPlan {
  id: string;
  organizationId: string;
  actionId: string;
  userId: string;
  status: DeploymentPlanStatus;
  title: string;
  summary: string | null;
  steps: DeploymentPlanStep[] | null;
  prerequisites: string[] | null;
  risks: DeploymentPlanRisk[] | null;
  estimatedDuration: string | null;
  suggestedArtifacts: ArtifactType[] | null;
  deploymentSteps: DeploymentStepPlan[] | null;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectionNote: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  action: Pick<TransformationAction, 'id' | 'title' | 'status' | 'department'>;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  artifacts?: DeploymentArtifact[];
  _count?: { artifacts: number };
}

export interface DeploymentArtifact {
  id: string;
  planId: string;
  type: ArtifactType;
  title: string;
  content: string;
  metadata: unknown;
  checklistState: Record<string, boolean> | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistUpdateResponse {
  id: string;
  checklistState: Record<string, boolean>;
  progress: { checked: number; total: number };
}

export interface DeployResponse {
  id: string;
  deployed: boolean;
}

export interface CreatePlanResponse {
  id: string;
  status: DeploymentPlanStatus;
}

export interface PlanActionResponse {
  id: string;
  status: DeploymentPlanStatus;
}

// ─── Integrations ────────────────────────────────────────

export type IntegrationProvider =
  | 'SLACK'
  | 'GOOGLE_DRIVE'
  | 'MICROSOFT_TEAMS'
  | 'JIRA'
  | 'SALESFORCE'
  | 'HUBSPOT'
  | 'ZAPIER'
  | 'NOTION';

export type IntegrationStatus = 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED' | 'ERROR';

export interface IntegrationConnection {
  id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  externalTeamName: string | null;
  scope: string | null;
  connectedAt: string;
  connectedBy: string;
  user: { firstName: string | null; lastName: string | null; email: string };
}
