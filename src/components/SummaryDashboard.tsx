import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Lock,
  Link2,
  MoreHorizontal,
  Edit2,
  MessageSquareQuote,
  Info,
  Calendar,
  CheckCircle2,
  FileText,
  Clock,
  Zap,
  Star,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  BarChart2,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';
import {
  Ticket,
  TicketStatus,
  Agent,
  FilterState,
} from '../types/itsm.ts';
import {
  filterTickets,
  calculateKpiMetrics,
  calculateCsatMetrics,
  calculateAgentWorkloads,
  calculateRequestTypeBreakdown,
  calculateStatusBreakdown,
} from '../utils/itsmLogic.ts';
import { REQUEST_TYPE_DEFINITIONS } from '../data/seedData.ts';
import { KanbanBoardView } from './KanbanBoardView.tsx';

interface SummaryDashboardProps {
  tickets: Ticket[];
  agents: Agent[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onTicketClick: (ticket: Ticket) => void;
  onNavigateToQueues: (filterPreset?: Partial<FilterState>) => void;
  onUpdateTicketStatus?: (ticketId: string, newStatus: TicketStatus) => void;
  onOpenCreateTicketModal?: (prefillStatus?: TicketStatus) => void;
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  tickets,
  agents,
  filters,
  setFilters,
  onTicketClick,
  onNavigateToQueues,
  onUpdateTicketStatus,
  onOpenCreateTicketModal,
}) => {
  const [dashboardMode, setDashboardMode] = useState<'metrics' | 'kanban'>('metrics');
  const [showEmptySimulated, setShowEmptySimulated] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  // Apply filters
  const filteredTickets = showEmptySimulated ? [] : filterTickets(tickets, filters);
  const kpi = calculateKpiMetrics(filteredTickets);
  const csat = calculateCsatMetrics(filteredTickets);
  const workloads = calculateAgentWorkloads(filteredTickets, agents);
  const requestTypes = calculateRequestTypeBreakdown(filteredTickets);
  const statusBreakdown = calculateStatusBreakdown(filteredTickets);

  const resetFilters = () => {
    setFilters({
      dateRange: 'last-30-days',
      assigneeId: 'all',
      status: 'all',
      requestType: 'all',
      priority: 'all',
      searchQuery: '',
    });
    setShowEmptySimulated(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FBFBFC] px-6 md:px-8 py-6 font-sans">
      {/* Top Breadcrumb & Title Bar */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <nav className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
            <span className="hover:text-red-600 hover:underline cursor-pointer">พื้นที่ระบบ</span>
            <span>/</span>
            <span className="hover:text-red-600 hover:underline cursor-pointer">ฝ่ายสนับสนุนไอที</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">ภาพรวม (Summary)</h1>
        </div>

        {/* Top actions: Give feedback, About this page */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <button
            type="button"
            onClick={() => alert('บันทึกข้อเสนอแนะเรียบร้อยแล้ว ขอบคุณที่ร่วมพัฒนาแพลตฟอร์มไอทีองค์กร')}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
          >
            <MessageSquareQuote className="h-4 w-4 text-slate-500" />
            <span>ส่งข้อเสนอแนะ</span>
          </button>
          <button
            type="button"
            onClick={() => setShowInfoBanner((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
          >
            <Info className="h-4 w-4 text-slate-500" />
            <span>เกี่ยวกับหน้านี้</span>
          </button>
        </div>
      </div>

      {/* Info Banner if toggled */}
      {showInfoBanner && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50/70 p-3.5 text-xs text-red-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="rounded-full bg-red-600/10 p-1 text-red-700">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold">แดชบอร์ดฝ่ายสนับสนุนไอทีองค์กร (ITSM):</span> สรุปสถานะตัวชี้วัด ITIL แบบเรียลไทม์ ตรวจสอบข้อตกลงระดับการให้บริการ (SLA) วัดความพึงพอใจลูกค้า (CSAT) และติดตามความจุทีมงาน
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowInfoBanner(false)}
            className="rounded px-2 py-0.5 text-red-700 hover:bg-red-100 font-semibold cursor-pointer"
          >
            ซ่อน
          </button>
        </div>
      )}

      {/* Tabs Row - Corporate Red Accent & Mode Switcher */}
      <div className="mt-5 flex flex-wrap items-center justify-between border-b border-slate-200 gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setDashboardMode('metrics')}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
              dashboardMode === 'metrics'
                ? 'border-red-600 text-red-700 bg-red-50/40 rounded-t'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>ภาพรวมตัวชี้วัด (Summary)</span>
          </button>

          <button
            type="button"
            onClick={() => setDashboardMode('kanban')}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
              dashboardMode === 'kanban'
                ? 'border-red-600 text-red-700 bg-red-50/40 rounded-t'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>กระดานคัมบัง (Kanban Board)</span>
            <span className="rounded-full bg-red-100 px-1.5 py-0.2 text-[10px] font-bold text-red-700">
              {tickets.length}
            </span>
          </button>
        </div>

        {/* View Switcher Segments */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold mb-1">
          <button
            type="button"
            onClick={() => setDashboardMode('metrics')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              dashboardMode === 'metrics'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>สรุปสถิติ</span>
          </button>
          <button
            type="button"
            onClick={() => setDashboardMode('kanban')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              dashboardMode === 'kanban'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>คัมบังบอร์ด</span>
          </button>
        </div>
      </div>

      {dashboardMode === 'kanban' ? (
        <div className="mt-5">
          <KanbanBoardView
            tickets={filteredTickets}
            agents={agents}
            onTicketClick={onTicketClick}
            onUpdateTicketStatus={onUpdateTicketStatus || (() => {})}
            onCreateTicketInStatus={onOpenCreateTicketModal}
          />
        </div>
      ) : (
        <>

      {/* Filter Bar (Matching Image 1 in Corporate Red theme) */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* วันที่สร้างงาน */}
          <div className="relative">
            <select
              value={filters.dateRange}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRange: e.target.value as FilterState['dateRange'],
                }))
              }
              className="appearance-none rounded-md border border-slate-300 bg-white py-1.5 pl-3 pr-8 font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-red-500 focus:outline-hidden cursor-pointer"
            >
              <option value="last-7-days">วันที่สร้างงาน: 7 วันที่ผ่านมา</option>
              <option value="last-30-days">วันที่สร้างงาน: 30 วันที่ผ่านมา</option>
              <option value="last-90-days">วันที่สร้างงาน: 90 วันที่ผ่านมา</option>
              <option value="all">วันที่สร้างงาน: ข้อมูลทั้งหมด</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* ผู้รับผิดชอบ */}
          <div className="relative">
            <select
              value={filters.assigneeId}
              onChange={(e) => setFilters((prev) => ({ ...prev, assigneeId: e.target.value }))}
              className="appearance-none rounded-md border border-slate-300 bg-white py-1.5 pl-3 pr-8 font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-red-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">ผู้รับผิดชอบ: ทั้งหมด</option>
              <option value="unassigned">ผู้รับผิดชอบ: ยังไม่ได้มอบหมาย</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* สถานะงาน */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="appearance-none rounded-md border border-slate-300 bg-white py-1.5 pl-3 pr-8 font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-red-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">สถานะงาน: ทั้งหมด</option>
              <option value="เปิดใหม่">เปิดใหม่ (Open)</option>
              <option value="กำลังดำเนินการ">กำลังดำเนินการ (In Progress)</option>
              <option value="รออนุมัติ">รออนุมัติ (Pending Approval)</option>
              <option value="รอลูกค้า">รอลูกค้า (Waiting for Customer)</option>
              <option value="แก้ไขแล้ว">แก้ไขแล้ว (Resolved)</option>
              <option value="ปิดงานแล้ว">ปิดงานแล้ว (Closed)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* ประเภทคำขอ */}
          <div className="relative">
            <select
              value={filters.requestType}
              onChange={(e) => setFilters((prev) => ({ ...prev, requestType: e.target.value }))}
              className="appearance-none rounded-md border border-slate-300 bg-white py-1.5 pl-3 pr-8 font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-red-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">ประเภทคำขอ: ทั้งหมด</option>
              {REQUEST_TYPE_DEFINITIONS.map((def) => (
                <option key={def.name} value={def.name}>
                  {def.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* ระดับความสำคัญ */}
          <div className="relative">
            <select
              value={filters.priority}
              onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
              className="appearance-none rounded-md border border-slate-300 bg-white py-1.5 pl-3 pr-8 font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-red-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">ระดับความสำคัญ: ทั้งหมด</option>
              <option value="P1 - วิกฤต">P1 - วิกฤต (Critical)</option>
              <option value="P2 - สูง">P2 - สูง (High)</option>
              <option value="P3 - ปานกลาง">P3 - ปานกลาง (Medium)</option>
              <option value="P4 - ต่ำ">P4 - ต่ำ (Low)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* ปุ่มรีเซ็ตค่าเริ่มต้น */}
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-md px-2.5 py-1.5 font-bold text-red-600 hover:bg-red-50 hover:underline transition-colors cursor-pointer"
          >
            รีเซ็ตเป็นค่าเริ่มต้น
          </button>
        </div>

        {/* Right Toolbar Tools */}
        <div className="flex items-center gap-1.5 text-slate-500">
          {/* Toggle between live data and screenshot-empty state */}
          <button
            type="button"
            onClick={() => setShowEmptySimulated((prev) => !prev)}
            className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all border ${
              showEmptySimulated
                ? 'bg-red-100 text-red-800 border-red-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-700'
            }`}
            title="สลับมุมมองระหว่างข้อมูลจริงและมุมมองว่าง 0 งานตามรูปตัวอย่าง"
          >
            {showEmptySimulated ? 'แสดง: หน้าว่าง 0 งาน' : 'แสดง: ข้อมูลจริง ITSM'}
          </button>

          <button
            type="button"
            onClick={() => setIsLocked((prev) => !prev)}
            className="rounded-md p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title={isLocked ? 'แดชบอร์ดถูกล็อก' : 'แดชบอร์ดสามารถปรับแต่งได้'}
          >
            <Lock className={`h-4 w-4 ${isLocked ? 'text-slate-500' : 'text-red-600'}`} />
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="rounded-md p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title={copiedLink ? 'คัดลอกลิงก์แล้ว!' : 'คัดลอกลิงก์แดชบอร์ด'}
          >
            <Link2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => alert('เข้าสู่โหมดปรับแต่งเลย์เอาต์แดชบอร์ด')}
            className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-400" />
            <span>แก้ไข</span>
          </button>

          <button
            type="button"
            className="rounded-md p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="ตัวเลือกเพิ่มเติม"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Top 4 Metric KPI Cards (White & Red Corporate Style) */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: ปิดงานแล้ว */}
        <div
          onClick={() => onNavigateToQueues({ status: 'แก้ไขแล้ว' })}
          className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-red-400 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 group-hover:border-red-200 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 group-hover:text-red-700 transition-colors">
                  {showEmptySimulated ? 0 : kpi.closedLast7Days}
                </span>
                <span className="text-xs font-semibold text-slate-600">รายการ</span>
              </div>
              <p className="text-xs text-slate-500">ปิดงานแล้วใน 7 วันที่ผ่านมา</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-red-600 transition-all" />
        </div>

        {/* Card 2: อัปเดตงานแล้ว */}
        <div
          onClick={() => onNavigateToQueues()}
          className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-red-400 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 group-hover:border-red-200 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
              <Edit2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 group-hover:text-red-700 transition-colors">
                  {showEmptySimulated ? 0 : kpi.updatedLast7Days}
                </span>
                <span className="text-xs font-semibold text-slate-600">รายการ</span>
              </div>
              <p className="text-xs text-slate-500">อัปเดตงานใน 7 วันที่ผ่านมา</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-red-600 transition-all" />
        </div>

        {/* Card 3: สร้างงานใหม่ */}
        <div
          onClick={() => onNavigateToQueues()}
          className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-red-400 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 group-hover:border-red-200 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 group-hover:text-red-700 transition-colors">
                  {showEmptySimulated ? 0 : kpi.createdLast7Days}
                </span>
                <span className="text-xs font-semibold text-slate-600">รายการ</span>
              </div>
              <p className="text-xs text-slate-500">สร้างใหม่ใน 7 วันที่ผ่านมา</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-red-600 transition-all" />
        </div>

        {/* Card 4: ครบกำหนดส่ง */}
        <div
          onClick={() => onNavigateToQueues()}
          className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-red-400 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 group-hover:border-red-200 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 group-hover:text-red-700 transition-colors">
                  {showEmptySimulated ? 0 : kpi.dueNext7Days}
                </span>
                <span className="text-xs font-semibold text-slate-600">รายการ</span>
              </div>
              <p className="text-xs text-slate-500">ครบกำหนดใน 7 วันข้างหน้า</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-red-600 transition-all" />
        </div>
      </div>

      {/* 4 Main Widget Cards (White & Red Corporate Layout) */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Widget 1: Customer satisfaction (CSAT) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <Zap className="h-4 w-4 fill-red-500 text-red-600" />
                <span>ความพึงพอใจของผู้ใช้บริการ (CSAT)</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                วัดระดับความพึงพอใจเพื่อยกระดับการให้บริการไอทีอย่างต่อเนื่อง
              </p>
            </div>
            <button
              type="button"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="ตัวเลือกวิดเจ็ต"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 min-h-[200px] flex items-center justify-center">
            {showEmptySimulated || csat.totalRatings === 0 ? (
              // Exact "No data available" card from Image 1 in Thai
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400 mb-2">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">ไม่มีข้อมูลแสดงในขณะนี้</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  ลองปรับเปลี่ยนตัวกรองแดชบอร์ดหรือเลือกช่วงเวลาใหม่
                </p>
              </div>
            ) : (
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-extrabold text-red-600 tracking-tight">
                      {csat.averageRating}
                    </span>
                    <div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(csat.averageRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">
                        จากผลประเมินทั้งหมด {csat.totalRatings} ครั้ง
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                      {csat.positivePercentage}% พึงพอใจมาก
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">เป้าหมาย ITIL: &gt; 90%</p>
                  </div>
                </div>

                {/* Rating Distribution Bars in Corporate Red */}
                <div className="space-y-1.5 text-xs">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = csat.ratingsDistribution[stars] || 0;
                    const pct = csat.totalRatings > 0 ? (count / csat.totalRatings) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="w-14 text-slate-500 font-medium">{stars} ดาว</span>
                        <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-red-600 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right font-bold text-slate-700">{count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Recent Quote */}
                <div className="rounded-md border border-red-100 bg-red-50/50 p-2.5 text-xs text-slate-700 italic">
                  &ldquo;คุณณัฐพรช่วยสแกน QR Code และสอนใช้งานอย่างรวดเร็ว บริการยอดเยี่ยมมากครับ&rdquo;
                  <span className="block not-italic text-[11px] font-medium text-slate-500 mt-1">
                    — เลียม เฉิน (ฝ่ายการตลาด) ตั๋วรหัส SUP-105
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Widget 2: Request Type */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <Zap className="h-4 w-4 fill-red-500 text-red-600" />
                <span>สัดส่วนประเภทคำขอ (Request Type)</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">งานที่เปิดอยู่จำแนกตามประเภทคำขอ</p>
            </div>
            <button
              type="button"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="ตัวเลือกวิดเจ็ต"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 min-h-[200px] flex items-center justify-center">
            {showEmptySimulated || requestTypes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400 mb-2">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">ไม่มีข้อมูลแสดงในขณะนี้</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  ลองปรับเปลี่ยนตัวกรองแดชบอร์ดหรือเลือกช่วงเวลาใหม่
                </p>
              </div>
            ) : (
              <div className="w-full space-y-3">
                {requestTypes.slice(0, 5).map((item) => {
                  const maxCount = Math.max(...requestTypes.map((r) => r.count), 1);
                  const pct = Math.round((item.count / maxCount) * 100);

                  const categoryColor =
                    item.category === 'incident'
                      ? 'bg-red-600'
                      : item.category === 'change'
                      ? 'bg-amber-500'
                      : item.category === 'problem'
                      ? 'bg-purple-600'
                      : 'bg-red-500';

                  return (
                    <div
                      key={item.name}
                      onClick={() => onNavigateToQueues({ requestType: item.name })}
                      className="group cursor-pointer rounded-md p-1.5 hover:bg-red-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800 group-hover:text-red-700 transition-colors truncate max-w-[280px]">
                          {item.name}
                        </span>
                        <span className="font-bold text-slate-600">
                          {item.count} รายการ
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${categoryColor}`}
                          style={{ width: `${Math.max(12, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => onNavigateToQueues()}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    ดูคิวงานทั้งหมดทุกหมวดหมู่ในหน้าคิวงาน &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Widget 3: Status overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <Zap className="h-4 w-4 fill-red-500 text-red-600" />
                <span>ภาพรวมสถานะงาน (Status overview)</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                สรุปสถานะของงานทั้งหมดในระบบเพื่อติดตามความคืบหน้า
              </p>
            </div>
            <button
              type="button"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="ตัวเลือกวิดเจ็ต"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 min-h-[200px] flex items-center justify-center">
            {showEmptySimulated ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400 mb-2">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">ไม่มีข้อมูลแสดงในขณะนี้</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  ลองปรับเปลี่ยนตัวกรองแดชบอร์ดหรือเลือกช่วงเวลาใหม่
                </p>
              </div>
            ) : (
              <div className="w-full space-y-2.5">
                {statusBreakdown.map((item) => {
                  const statusColors: Record<string, { bg: string; text: string; badge: string }> = {
                    'เปิดใหม่': { bg: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-50 border-red-200' },
                    'กำลังดำเนินการ': { bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50 border-amber-200' },
                    'รออนุมัติ': { bg: 'bg-purple-500', text: 'text-purple-700', badge: 'bg-purple-50 border-purple-200' },
                    'รอลูกค้า': { bg: 'bg-slate-600', text: 'text-slate-700', badge: 'bg-slate-100 border-slate-200' },
                    'รอทีมสนับสนุน': { bg: 'bg-rose-500', text: 'text-rose-700', badge: 'bg-rose-50 border-rose-200' },
                    'แก้ไขแล้ว': { bg: 'bg-emerald-600', text: 'text-emerald-700', badge: 'bg-emerald-50 border-emerald-200' },
                    'ปิดงานแล้ว': { bg: 'bg-slate-400', text: 'text-slate-600', badge: 'bg-slate-100 border-slate-200' },
                  };

                  const color = statusColors[item.status] || { bg: 'bg-slate-400', text: 'text-slate-700', badge: 'bg-slate-100' };

                  return (
                    <div
                      key={item.status}
                      onClick={() => onNavigateToQueues({ status: item.status })}
                      className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs hover:bg-red-50/40 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${color.bg}`} />
                        <span className="font-bold text-slate-800">{item.status}</span>
                      </div>
                      <span className={`rounded-md border px-2.5 py-0.5 font-bold ${color.badge} ${color.text}`}>
                        {item.count}
                      </span>
                    </div>
                  );
                })}

                <div className="pt-2 text-center border-t border-slate-100 mt-2">
                  <button
                    type="button"
                    onClick={() => setDashboardMode('kanban')}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>เปิดดูกระดานคัมบัง (Kanban Board)</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Widget 4: Team Workload */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <Zap className="h-4 w-4 fill-red-500 text-red-600" />
                <span>ภาระงานของทีม (Team Workload)</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">ตรวจสอบความจุและปริมาณงานของวิศวกรไอที</p>
            </div>
            <button
              type="button"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="ตัวเลือกวิดเจ็ต"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 min-h-[200px] flex items-center justify-center">
            {showEmptySimulated ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400 mb-2">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">ไม่มีข้อมูลแสดงในขณะนี้</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  ลองปรับเปลี่ยนตัวกรองแดชบอร์ดหรือเลือกช่วงเวลาใหม่
                </p>
              </div>
            ) : (
              <div className="w-full space-y-3">
                {workloads.map(({ agent, assignedCount, utilizationRate, criticalCount }) => {
                  const isHighLoad = utilizationRate >= 80;
                  return (
                    <div
                      key={agent.id}
                      onClick={() => onNavigateToQueues({ assigneeId: agent.id })}
                      className="group rounded-lg p-2 hover:bg-red-50/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={agent.avatar}
                            alt={agent.name}
                            className="h-6 w-6 rounded-full border border-slate-200 object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-800 group-hover:text-red-700 transition-colors">
                              {agent.name}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-1.5">({agent.role})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {criticalCount > 0 && (
                            <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                              {criticalCount} วิกฤต
                            </span>
                          )}
                          <span className="font-bold text-slate-700">
                            {assignedCount}/{agent.maxCapacity} งาน
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isHighLoad ? 'bg-red-600' : 'bg-red-500'
                            }`}
                            style={{ width: `${utilizationRate}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-[11px] font-bold text-slate-600">
                          {utilizationRate}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
