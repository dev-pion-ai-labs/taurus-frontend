// User
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'ADMIN' | 'MEMBER';
  organizationId: string | null;
  organization: Organization | null;
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
}

export interface SessionQuestion {
  id: string;
  sessionId: string;
  questionId: string;
  section: 'BASE' | 'INDUSTRY' | 'CHALLENGE_BONUS';
  orderIndex: number;
  answer: { value: string | string[] | number } | null;
  answeredAt: string | null;
  skipped: boolean;
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
