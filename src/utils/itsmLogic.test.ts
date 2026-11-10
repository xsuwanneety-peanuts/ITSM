import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterTickets,
  calculateKpiMetrics,
  calculateCsatMetrics,
  calculateAgentWorkloads,
  calculateChangeRiskScore,
  formatSlaCountdown,
  calculateHealthSummary,
  classifyIssueRuleBased,
} from './itsmLogic.ts';
import { Ticket, Agent, FilterState, HealthCheckService } from '../types/itsm.ts';

const mockAgent: Agent = {
  id: 'agt-1',
  name: 'ศศิธร เชน',
  email: 'sasithorn.c@company.co.th',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  role: 'หัวหน้าฝ่ายปฏิบัติการไอที (IT Lead)',
  department: 'โครงสร้างพื้นฐานไอที',
  activeTicketsCount: 2,
  maxCapacity: 5,
};

const mockTickets: Ticket[] = [
  {
    id: 't-1',
    key: 'SUP-101',
    title: 'สัญญาณ VPN หลุดบ่อยครั้งในโซน APAC',
    description: 'พนักงานไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ระบบพัฒนาภายในได้',
    category: 'incident',
    requestType: 'ตั้งค่าและเชื่อมต่อ VPN บริษัท',
    status: 'กำลังดำเนินการ',
    priority: 'P2 - สูง',
    urgency: 'High',
    impact: 'Medium',
    assignee: mockAgent,
    reporter: {
      name: 'สมเกียรติ มั่นคง',
      email: 'somkiat@company.co.th',
      avatar: '',
      department: 'ฝ่ายขาย',
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    slaRemainingMinutes: 120,
    slaTargetMinutes: 480,
    comments: [],
    tags: ['vpn', 'network'],
  },
  {
    id: 't-2',
    key: 'SUP-102',
    title: 'ขอสิทธิ์ผู้ดูแลระบบ Production Cloud Run',
    description: 'ต้องการสิทธิ์ตรวจสอบความหน่วงของระบบ',
    category: 'service_request',
    requestType: 'ขอสิทธิ์ผู้ดูแลระบบ',
    status: 'แก้ไขแล้ว',
    priority: 'P3 - ปานกลาง',
    urgency: 'Medium',
    impact: 'Low',
    assignee: mockAgent,
    reporter: {
      name: 'อลิสา พงษ์ไพศาล',
      email: 'alisa@company.co.th',
      avatar: '',
      department: 'ฝ่ายวิศวกรรม',
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    slaRemainingMinutes: 300,
    slaTargetMinutes: 600,
    csatScore: 5,
    csatComment: 'แก้ไขรวดเร็วมาก เจ้าหน้าที่บริการดีเยี่ยม',
    comments: [],
    tags: ['access', 'gcp'],
  },
  {
    id: 't-3',
    key: 'SUP-103',
    title: 'ฐานข้อมูลระบบผลิตมีหน่วยความจำสูงผิดปกติ',
    description: 'หน่วยความจำแตะระดับ 94%',
    category: 'incident',
    requestType: 'แจ้งปัญหาระบบหรือบริการขัดข้อง',
    status: 'เปิดใหม่',
    priority: 'P1 - วิกฤต',
    urgency: 'Critical',
    impact: 'Extensive',
    assignee: null,
    reporter: {
      name: 'ระบบแจ้งเตือนอัตโนมัติ',
      email: 'alert@company.co.th',
      avatar: '',
      department: 'IT Ops',
    },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    slaRemainingMinutes: -45, // Breached
    slaTargetMinutes: 60,
    comments: [],
    tags: ['database', 'outage'],
  },
];

test('calculateKpiMetrics counts created, closed, updated, and SLA breached correctly', () => {
  const kpi = calculateKpiMetrics(mockTickets, Date.now());
  assert.equal(kpi.createdLast7Days, 3);
  assert.equal(kpi.closedLast7Days, 1);
  assert.equal(kpi.updatedLast7Days, 3);
  assert.equal(kpi.slaBreachedCount, 1);
  assert.equal(kpi.criticalIncidentsCount, 1);
});

test('calculateCsatMetrics aggregates positive feedback and average score', () => {
  const csat = calculateCsatMetrics(mockTickets);
  assert.equal(csat.totalRatings, 1);
  assert.equal(csat.averageRating, 5);
  assert.equal(csat.positivePercentage, 100);
});

test('calculateAgentWorkloads computes utilization accurately', () => {
  const workloads = calculateAgentWorkloads(mockTickets, [mockAgent]);
  assert.equal(workloads.length, 1);
  assert.equal(workloads[0].assignedCount, 1);
  assert.equal(workloads[0].utilizationRate, 20); // 1 / 5 = 20%
});

test('filterTickets correctly filters by priority and search text', () => {
  const defaultFilters: FilterState = {
    dateRange: 'all',
    assigneeId: 'all',
    status: 'all',
    requestType: 'all',
    priority: 'all',
    searchQuery: '',
  };

  const priorityP1Filtered = filterTickets(mockTickets, {
    ...defaultFilters,
    priority: 'P1 - วิกฤต',
  });
  assert.equal(priorityP1Filtered.length, 1);
  assert.equal(priorityP1Filtered[0].key, 'SUP-103');

  const searchFiltered = filterTickets(mockTickets, {
    ...defaultFilters,
    searchQuery: 'VPN',
  });
  assert.equal(searchFiltered.length, 1);
  assert.equal(searchFiltered[0].key, 'SUP-101');
});

test('calculateChangeRiskScore maps impact and urgency correctly', () => {
  assert.equal(calculateChangeRiskScore('Low', 'Low', 'Standard'), 'Low');
  assert.equal(calculateChangeRiskScore('High', 'Medium', 'Normal'), 'High');
  assert.equal(calculateChangeRiskScore('Extensive', 'Critical', 'Emergency'), 'High');
  assert.equal(calculateChangeRiskScore('Extensive', 'High', 'Normal'), 'Very High');
});

test('formatSlaCountdown displays remaining time and breached status in Thai', () => {
  const breached = formatSlaCountdown(-90);
  assert.equal(breached.isBreached, true);
  assert.equal(breached.label, 'เกินกำหนด 1 ชม. 30 นาที');

  const remaining = formatSlaCountdown(75);
  assert.equal(remaining.isBreached, false);
  assert.equal(remaining.isWarning, false);
  assert.equal(remaining.label, 'เหลือ 1 ชม. 15 นาที');
});

test('calculateHealthSummary computes service health metrics and uptime correctly', () => {
  const sampleServices: HealthCheckService[] = [
    {
      id: 's1',
      name: 'API Gateway',
      serviceKey: 'API-1',
      endpoint: '/healthz',
      category: 'gateway',
      status: 'operational',
      statusCode: 200,
      latencyMs: 30,
      uptimePercentage: 100,
      lastChecked: 'now',
      message: 'OK',
      region: 'apac',
    },
    {
      id: 's2',
      name: 'VPN Node',
      serviceKey: 'VPN-2',
      endpoint: '/vpn',
      category: 'network',
      status: 'degraded',
      statusCode: 504,
      latencyMs: 1500,
      uptimePercentage: 90,
      lastChecked: 'now',
      message: 'Degraded',
      region: 'bkk',
    },
  ];

  const summary = calculateHealthSummary(sampleServices);
  assert.equal(summary.total, 2);
  assert.equal(summary.operational, 1);
  assert.equal(summary.degraded, 1);
  assert.equal(summary.avgLatency, 765);
  assert.equal(summary.overallUptime, 95);
  assert.equal(summary.isAllHealthy, false);
});

test('classifyIssueRuleBased correctly triages VPN and Admin access keywords in Thai', () => {
  const vpnTriage = classifyIssueRuleBased('VPN สำนักงานใหญ่หลุดบ่อยมาก SSH ไม่ได้');
  assert.equal(vpnTriage.category, 'incident');
  assert.equal(vpnTriage.priority, 'P2 - สูง');
  assert.equal(vpnTriage.confidence >= 0.95, true);

  const adminTriage = classifyIssueRuleBased('ขอสิทธิ์ผู้ดูแลระบบ AWS Production ชั่วคราว');
  assert.equal(adminTriage.category, 'service_request');
  assert.equal(adminTriage.priority, 'P2 - สูง');

  const passwordTriage = classifyIssueRuleBased('ลืมรหัสผ่าน Okta 2FA เข้าเครื่องไม่ได้');
  assert.equal(passwordTriage.category, 'service_request');
  assert.equal(passwordTriage.priority, 'P3 - ปานกลาง');
});
