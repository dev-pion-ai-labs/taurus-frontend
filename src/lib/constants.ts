export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
] as const;

export const SESSION_STATUS_LABELS: Record<string, string> = {
  PENDING_TEMPLATE: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ABANDONED: 'Abandoned',
  FAILED: 'Failed',
};

export const TEMPLATE_STATUS_LABELS: Record<string, string> = {
  GENERATING: 'Generating',
  ACTIVE: 'Active',
  DEPRECATED: 'Deprecated',
};

export const SCALE_LABELS: Record<number, string> = {
  1: 'Not at all',
  2: 'Slightly',
  3: 'Moderately',
  4: 'Very',
  5: 'Fully mature',
};

// Onboarding Questionnaire Constants

export const QUESTIONNAIRE_STEPS = [
  { id: 1, label: 'Company Basics', description: 'Name, industry, and size of your organization' },
  { id: 2, label: 'Business Context', description: 'What your company does and how it generates revenue' },
  { id: 3, label: 'Challenges', description: 'Current pain points and bottlenecks to solve' },
  { id: 4, label: 'Data Sources', description: 'What data your organization has available' },
  { id: 5, label: 'Documents', description: 'Upload files to give AI deeper context' },
  { id: 6, label: 'Tech Stack', description: 'Tools and platforms you currently use' },
  { id: 7, label: 'Goals', description: 'What you want to achieve with AI' },
] as const;

export const CHALLENGE_OPTIONS = [
  'Inefficient manual processes',
  'High customer acquisition cost',
  'Poor data visibility & analytics',
  'Slow decision-making',
  'Inconsistent customer experience',
  'Difficulty scaling operations',
  'Employee productivity bottlenecks',
  'Revenue forecasting inaccuracy',
  'High operational costs',
  'Compliance & regulatory overhead',
] as const;

export const DATA_AVAILABILITY_OPTIONS = [
  'Customer data (CRM records)',
  'Sales & revenue data',
  'Internal documents & SOPs',
  'Customer conversations (emails, chats)',
  'Marketing & campaign data',
  'Financial reports & statements',
  'Product usage / analytics data',
  'Employee / HR data',
  'Supply chain / inventory data',
  'Survey & feedback data',
] as const;

export const TOOL_OPTIONS = [
  'Salesforce',
  'HubSpot',
  'Google Analytics',
  'Slack',
  'Microsoft Teams',
  'Notion',
  'Jira / Asana',
  'Mailchimp / SendGrid',
  'Stripe / PayPal',
  'QuickBooks / Xero',
  'Shopify / WooCommerce',
  'Zendesk / Intercom',
  'AWS / GCP / Azure',
  'Tableau / Power BI',
  'SAP / Oracle ERP',
] as const;

export const GOAL_OPTIONS = [
  'Automate repetitive tasks',
  'Reduce operational costs',
  'Accelerate revenue growth',
  'Improve customer experience',
  'Enhance data-driven decisions',
  'Streamline internal workflows',
  'Generate content at scale',
  'Improve forecasting accuracy',
  'Reduce response times',
  'Scale without adding headcount',
] as const;

export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/csv': ['.csv'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
