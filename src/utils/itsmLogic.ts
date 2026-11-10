import {
  Ticket,
  FilterState,
  Agent,
  Impact,
  Urgency,
  ChangeType,
  RiskLevel,
} from '../types/itsm.ts';

export function filterTickets(tickets: Ticket[], filters: FilterState): Ticket[] {
  return tickets.filter((ticket) => {
    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchKey = ticket.key.toLowerCase().includes(q);
      const matchTitle = ticket.title.toLowerCase().includes(q);
      const matchDesc = ticket.description.toLowerCase().includes(q);
      const matchReporter = ticket.reporter.name.toLowerCase().includes(q);
      const matchAssignee = ticket.assignee?.name.toLowerCase().includes(q) ?? false;
      const matchType = ticket.requestType.toLowerCase().includes(q);
      if (!matchKey && !matchTitle && !matchDesc && !matchReporter && !matchAssignee && !matchType) {
        return false;
      }
    }

    // Assignee
    if (filters.assigneeId !== 'all') {
      if (filters.assigneeId === 'unassigned') {
        if (ticket.assignee !== null) return false;
      } else {
        if (ticket.assignee?.id !== filters.assigneeId) return false;
      }
    }

    // Status
    if (filters.status !== 'all' && ticket.status !== filters.status) {
      return false;
    }

    // Request type
    if (filters.requestType !== 'all' && ticket.requestType !== filters.requestType) {
      return false;
    }

    // Priority
    if (filters.priority !== 'all' && ticket.priority !== filters.priority) {
      return false;
    }

    // Date range
    if (filters.dateRange !== 'all') {
      const ticketCreatedTime = new Date(ticket.createdAt).getTime();
      const now = Date.now();
      const msPerDay = 24 * 60 * 60 * 1000;
      const days =
        filters.dateRange === 'last-7-days'
          ? 7
          : filters.dateRange === 'last-30-days'
          ? 30
          : 90;

      if (now - ticketCreatedTime > days * msPerDay) {
        return false;
      }
    }

    return true;
  });
}

export interface KpiMetrics {
  closedLast7Days: number;
  updatedLast7Days: number;
  createdLast7Days: number;
  dueNext7Days: number;
  slaBreachedCount: number;
  criticalIncidentsCount: number;
}

export function calculateKpiMetrics(tickets: Ticket[], nowMs: number = Date.now()): KpiMetrics {
  const ms7Days = 7 * 24 * 60 * 60 * 1000;

  let closedLast7Days = 0;
  let updatedLast7Days = 0;
  let createdLast7Days = 0;
  let dueNext7Days = 0;
  let slaBreachedCount = 0;
  let criticalIncidentsCount = 0;

  for (const t of tickets) {
    const createdTime = new Date(t.createdAt).getTime();
    const updatedTime = new Date(t.updatedAt).getTime();
    const dueTime = new Date(t.dueDate).getTime();

    const isClosedOrResolved =
      t.status === 'Resolved' ||
      t.status === 'Closed' ||
      t.status === 'แก้ไขแล้ว' ||
      t.status === 'ปิดงานแล้ว';

    if (isClosedOrResolved && nowMs - updatedTime <= ms7Days) {
      closedLast7Days++;
    }

    if (nowMs - updatedTime <= ms7Days) {
      updatedLast7Days++;
    }

    if (nowMs - createdTime <= ms7Days) {
      createdLast7Days++;
    }

    if (!isClosedOrResolved) {
      if (dueTime >= nowMs && dueTime - nowMs <= ms7Days) {
        dueNext7Days++;
      }
      if (t.slaRemainingMinutes < 0) {
        slaBreachedCount++;
      }
      if (t.priority === 'P1 - Critical' || t.priority === 'P1 - วิกฤต') {
        criticalIncidentsCount++;
      }
    }
  }

  return {
    closedLast7Days,
    updatedLast7Days,
    createdLast7Days,
    dueNext7Days,
    slaBreachedCount,
    criticalIncidentsCount,
  };
}

export interface CsatMetrics {
  averageRating: number;
  positivePercentage: number;
  totalRatings: number;
  ratingsDistribution: Record<number, number>; // 1 to 5
}

export function calculateCsatMetrics(tickets: Ticket[]): CsatMetrics {
  let sum = 0;
  let count = 0;
  let positiveCount = 0;
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const t of tickets) {
    if (typeof t.csatScore === 'number' && t.csatScore >= 1 && t.csatScore <= 5) {
      sum += t.csatScore;
      count++;
      dist[t.csatScore] = (dist[t.csatScore] || 0) + 1;
      if (t.csatScore >= 4) {
        positiveCount++;
      }
    }
  }

  return {
    averageRating: count > 0 ? Number((sum / count).toFixed(1)) : 0,
    positivePercentage: count > 0 ? Math.round((positiveCount / count) * 100) : 0,
    totalRatings: count,
    ratingsDistribution: dist,
  };
}

export interface AgentWorkload {
  agent: Agent;
  assignedCount: number;
  utilizationRate: number; // 0 - 100%
  criticalCount: number;
}

export function calculateAgentWorkloads(tickets: Ticket[], agents: Agent[]): AgentWorkload[] {
  return agents.map((agent) => {
    const assigned = tickets.filter(
      (t) =>
        t.assignee?.id === agent.id &&
        t.status !== 'Closed' &&
        t.status !== 'Resolved' &&
        t.status !== 'ปิดงานแล้ว' &&
        t.status !== 'แก้ไขแล้ว'
    );
    const critical = assigned.filter(
      (t) => t.priority === 'P1 - Critical' || t.priority === 'P1 - วิกฤต'
    ).length;
    const utilizationRate = Math.min(
      100,
      Math.round((assigned.length / Math.max(1, agent.maxCapacity)) * 100)
    );

    return {
      agent,
      assignedCount: assigned.length,
      utilizationRate,
      criticalCount: critical,
    };
  });
}

export function calculateRequestTypeBreakdown(tickets: Ticket[]): { name: string; count: number; category: string }[] {
  const counts: Record<string, { count: number; category: string }> = {};

  for (const t of tickets) {
    const isInactive =
      t.status === 'Closed' ||
      t.status === 'Resolved' ||
      t.status === 'ปิดงานแล้ว' ||
      t.status === 'แก้ไขแล้ว';

    if (!isInactive) {
      const type = t.requestType || 'คำขอทั่วไป';
      if (!counts[type]) {
        counts[type] = { count: 0, category: t.category };
      }
      counts[type].count += 1;
    }
  }

  return Object.entries(counts)
    .map(([name, data]) => ({ name, count: data.count, category: data.category }))
    .sort((a, b) => b.count - a.count);
}

export function calculateStatusBreakdown(tickets: Ticket[]): { status: string; count: number }[] {
  const statusCounts: Record<string, number> = {
    'เปิดใหม่': 0,
    'กำลังดำเนินการ': 0,
    'รออนุมัติ': 0,
    'รอลูกค้า': 0,
    'รอทีมสนับสนุน': 0,
    'แก้ไขแล้ว': 0,
    'ปิดงานแล้ว': 0,
  };

  for (const t of tickets) {
    // Map English or Thai statuses
    let mapped = t.status;
    if (t.status === 'Open') mapped = 'เปิดใหม่';
    else if (t.status === 'In Progress') mapped = 'กำลังดำเนินการ';
    else if (t.status === 'Pending Approval') mapped = 'รออนุมัติ';
    else if (t.status === 'Waiting for Customer') mapped = 'รอลูกค้า';
    else if (t.status === 'Waiting for Support') mapped = 'รอทีมสนับสนุน';
    else if (t.status === 'Resolved') mapped = 'แก้ไขแล้ว';
    else if (t.status === 'Closed') mapped = 'ปิดงานแล้ว';

    if (statusCounts[mapped] !== undefined) {
      statusCounts[mapped]++;
    } else {
      statusCounts[mapped] = 1;
    }
  }

  return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
}

export function calculateChangeRiskScore(
  impact: Impact,
  urgency: Urgency,
  changeType: ChangeType
): RiskLevel {
  if (changeType === 'Emergency') {
    return 'High';
  }
  if (impact === 'Extensive' || (impact === 'High' && urgency === 'Critical')) {
    return 'Very High';
  }
  if (impact === 'High' || urgency === 'Critical' || urgency === 'High') {
    return 'High';
  }
  if (impact === 'Medium' || urgency === 'Medium') {
    return 'Medium';
  }
  return 'Low';
}

export function formatSlaCountdown(minutes: number): { label: string; isBreached: boolean; isWarning: boolean } {
  if (minutes < 0) {
    const overdue = Math.abs(minutes);
    const hrs = Math.floor(overdue / 60);
    const mins = overdue % 60;
    return {
      label: `เกินกำหนด ${hrs > 0 ? `${hrs} ชม. ` : ''}${mins} นาที`,
      isBreached: true,
      isWarning: false,
    };
  }

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const isWarning = minutes <= 60;

  return {
    label: `เหลือ ${hrs > 0 ? `${hrs} ชม. ` : ''}${mins} นาที`,
    isBreached: false,
    isWarning,
  };
}
