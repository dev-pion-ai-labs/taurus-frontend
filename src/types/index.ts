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
  overallScore: number | null;
  maturityLevel: string | null;
  totalEfficiencyValue: number | null;
  totalGrowthValue: number | null;
  totalAiValue: number | null;
  fteRedeployable: number | null;
  executiveSummary: {
    summary: string;
    keyFindings: string[];
  } | null;
  departmentScores: DepartmentScore[] | null;
  recommendations: Recommendation[] | null;
  implementationPlan: Phase[] | null;
  generatedAt: string | null;
  createdAt: string;
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
