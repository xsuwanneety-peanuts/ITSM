export type TicketCategory =
  | 'service_request'
  | 'incident'
  | 'problem'
  | 'change'
  | 'post_incident_review';

export type TicketStatus =
  | 'Open'
  | 'In Progress'
  | 'Pending Approval'
  | 'Waiting for Customer'
  | 'Waiting for Support'
  | 'Resolved'
  | 'Closed'
  | 'เปิดใหม่'
  | 'กำลังดำเนินการ'
  | 'รออนุมัติ'
  | 'รอลูกค้า'
  | 'รอทีมสนับสนุน'
  | 'แก้ไขแล้ว'
  | 'ปิดงานแล้ว';

export type Priority =
  | 'P1 - Critical'
  | 'P2 - High'
  | 'P3 - Medium'
  | 'P4 - Low'
  | 'P1 - วิกฤต'
  | 'P2 - สูง'
  | 'P3 - ปานกลาง'
  | 'P4 - ต่ำ';

export type Urgency = 'Low' | 'Medium' | 'High' | 'Critical';
export type Impact = 'Low' | 'Medium' | 'High' | 'Extensive';

export type ChangeType = 'Standard' | 'Normal' | 'Emergency';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  activeTicketsCount: number;
  maxCapacity: number;
}

export interface TicketComment {
  id: string;
  author: string;
  authorRole: string;
  avatar: string;
  isInternal: boolean;
  text: string;
  createdAt: string;
}

export interface ChangeMetadata {
  changeType: ChangeType;
  riskLevel: RiskLevel;
  plannedStartTime: string;
  plannedEndTime: string;
  backoutPlan: string;
  impactAssessment: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvalDate?: string;
}

export interface IncidentMetadata {
  affectedServices: string[];
  impactedUserCount: number;
  isMajorIncident: boolean;
  rootCause?: string;
  workaround?: string;
  opsgenieEscalated?: boolean;
}

export interface Ticket {
  id: string;
  key: string; // e.g. SUP-101
  title: string;
  description: string;
  category: TicketCategory;
  requestType: string;
  status: TicketStatus;
  priority: Priority;
  urgency: Urgency;
  impact: Impact;
  assignee: Agent | null;
  reporter: {
    name: string;
    email: string;
    avatar: string;
    department: string;
  };
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  slaRemainingMinutes: number; // positive = time left, negative = breached
  slaTargetMinutes: number;
  csatScore?: number; // 1-5
  csatComment?: string;
  comments: TicketComment[];
  tags: string[];
  changeMetadata?: ChangeMetadata;
  incidentMetadata?: IncidentMetadata;
}

export interface FilterState {
  dateRange: 'last-7-days' | 'last-30-days' | 'last-90-days' | 'all';
  assigneeId: string; // 'all' | 'unassigned' | agentId
  status: string; // 'all' | status
  requestType: string; // 'all' | requestType
  priority: string; // 'all' | priority
  searchQuery: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  snippet: string;
  content: string;
  author: string;
  views: number;
  helpfulCount: number;
  updatedAt: string;
}
