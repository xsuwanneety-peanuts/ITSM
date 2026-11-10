import React, { useState } from 'react';
import {
  Ticket,
  TicketStatus,
  Agent,
  FilterState,
  Priority,
} from '../types/itsm.ts';
import { formatSlaCountdown } from '../utils/itsmLogic.ts';
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Clock,
  User,
  ArrowRight,
  ChevronDown,
  Layers,
  CheckCircle2,
  HelpCircle,
  Shield,
  Briefcase,
  GitPullRequest,
  FileText,
  AlertOctagon,
} from 'lucide-react';

interface KanbanBoardViewProps {
  tickets: Ticket[];
  agents: Agent[];
  onTicketClick: (ticket: Ticket) => void;
  onUpdateTicketStatus: (ticketId: string, newStatus: TicketStatus) => void;
  onCreateTicketInStatus?: (status: TicketStatus) => void;
}

interface ColumnConfig {
  id: string;
  title: string;
  subtitle: string;
  statuses: TicketStatus[];
  targetStatus: TicketStatus;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  columnBg: string;
}

const KANBAN_COLUMNS: ColumnConfig[] = [
  {
    id: 'open',
    title: 'เปิดใหม่',
    subtitle: 'Open',
    statuses: ['Open', 'เปิดใหม่'],
    targetStatus: 'เปิดใหม่',
    accentColor: 'border-slate-300',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    columnBg: 'bg-slate-50/80',
  },
  {
    id: 'in_progress',
    title: 'กำลังดำเนินการ',
    subtitle: 'In Progress',
    statuses: ['In Progress', 'กำลังดำเนินการ'],
    targetStatus: 'กำลังดำเนินการ',
    accentColor: 'border-amber-300',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    columnBg: 'bg-amber-50/30',
  },
  {
    id: 'pending_approval',
    title: 'รออนุมัติ',
    subtitle: 'Pending Approval',
    statuses: ['Pending Approval', 'รออนุมัติ'],
    targetStatus: 'รออนุมัติ',
    accentColor: 'border-purple-300',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    columnBg: 'bg-purple-50/30',
  },
  {
    id: 'waiting',
    title: 'รอลูกค้า / รอข้อมูล',
    subtitle: 'Waiting',
    statuses: ['Waiting for Customer', 'Waiting for Support', 'รอลูกค้า', 'รอทีมสนับสนุน'],
    targetStatus: 'รอลูกค้า',
    accentColor: 'border-sky-300',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
    columnBg: 'bg-sky-50/30',
  },
  {
    id: 'resolved',
    title: 'แก้ไขแล้ว / ปิดงาน',
    subtitle: 'Resolved',
    statuses: ['Resolved', 'Closed', 'แก้ไขแล้ว', 'ปิดงานแล้ว'],
    targetStatus: 'แก้ไขแล้ว',
    accentColor: 'border-emerald-300',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    columnBg: 'bg-emerald-50/30',
  },
];

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  tickets,
  agents,
  onTicketClick,
  onUpdateTicketStatus,
  onCreateTicketInStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<string | null>(null);

  // Filter tickets for Kanban
  const filteredTickets = tickets.filter((ticket) => {
    if (selectedAssignee !== 'all') {
      if (selectedAssignee === 'unassigned') {
        if (ticket.assignee) return false;
      } else if (ticket.assignee?.id !== selectedAssignee) {
        return false;
      }
    }

    if (selectedPriority !== 'all') {
      if (!ticket.priority.includes(selectedPriority)) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchKey = ticket.key.toLowerCase().includes(q);
      const matchTitle = ticket.title.toLowerCase().includes(q);
      const matchReporter = ticket.reporter.name.toLowerCase().includes(q);
      const matchAssignee = ticket.assignee?.name.toLowerCase().includes(q) ?? false;
      if (!matchKey && !matchTitle && !matchReporter && !matchAssignee) return false;
    }

    return true;
  });

  const getPriorityBadge = (priority: Priority) => {
    if (priority.includes('P1') || priority.includes('วิกฤต')) {
      return (
        <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
          <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
          P1 วิกฤต
        </span>
      );
    }
    if (priority.includes('P2') || priority.includes('สูง')) {
      return (
        <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
          P2 สูง
        </span>
      );
    }
    if (priority.includes('P3') || priority.includes('ปานกลาง')) {
      return (
        <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700">
          P3 ปานกลาง
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600">
        P4 ต่ำ
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'incident':
        return <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />;
      case 'change':
        return <GitPullRequest className="h-3.5 w-3.5 text-amber-600 shrink-0" />;
      case 'problem':
        return <AlertOctagon className="h-3.5 w-3.5 text-purple-600 shrink-0" />;
      case 'post_incident_review':
        return <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />;
      default:
        return <HelpCircle className="h-3.5 w-3.5 text-slate-500 shrink-0" />;
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    e.dataTransfer.setData('text/plain', ticketId);
    setDraggedTicketId(ticketId);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setActiveDropColumn(colId);
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TicketStatus) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('text/plain') || draggedTicketId;
    if (ticketId) {
      onUpdateTicketStatus(ticketId, targetStatus);
    }
    setDraggedTicketId(null);
    setActiveDropColumn(null);
  };

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Kanban Filter Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตั๋ว, รหัส SUP-..., ผู้แจ้ง..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Filter Assignee */}
          <div className="relative">
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="appearance-none rounded-lg border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-red-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">ผู้รับผิดชอบ: ทั้งหมด</option>
              <option value="unassigned">ยังไม่ได้มอบหมาย</option>
              {agents.map((agt) => (
                <option key={agt.id} value={agt.id}>
                  {agt.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Filter Priority */}
          <div className="relative">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="appearance-none rounded-lg border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-red-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">ความสำคัญ: ทั้งหมด</option>
              <option value="P1">P1 วิกฤต</option>
              <option value="P2">P2 สูง</option>
              <option value="P3">P3 ปานกลาง</option>
              <option value="P4">P4 ต่ำ</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
          </div>

          {(searchQuery || selectedAssignee !== 'all' || selectedPriority !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedAssignee('all');
                setSelectedPriority('all');
              }}
              className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline px-2 cursor-pointer"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>แสดง <strong className="text-slate-800">{filteredTickets.length}</strong> จาก {tickets.length} รายการ</span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden sm:inline text-[11px] text-slate-400">💡 ลากการ์ดเพื่อเปลี่ยนสถานะงาน</span>
        </div>
      </div>

      {/* 5-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 flex-1 items-start overflow-x-auto pb-6">
        {KANBAN_COLUMNS.map((col) => {
          const colTickets = filteredTickets.filter((t) =>
            col.statuses.includes(t.status)
          );
          const isDropActive = activeDropColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.targetStatus)}
              className={`flex flex-col rounded-2xl border ${
                isDropActive ? 'border-red-500 ring-2 ring-red-200' : col.accentColor
              } ${col.columnBg} p-3 transition-all min-h-[480px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 tracking-tight">
                    {col.title}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${col.badgeBg} ${col.badgeText}`}
                  >
                    {colTickets.length}
                  </span>
                </div>
                {onCreateTicketInStatus && (
                  <button
                    type="button"
                    onClick={() => onCreateTicketInStatus(col.targetStatus)}
                    className="rounded p-1 text-slate-400 hover:bg-white hover:text-red-600 shadow-2xs transition-colors cursor-pointer"
                    title={`เพิ่มงานในสถานะ ${col.title}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[640px] pr-0.5">
                {colTickets.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200/90 p-6 text-center text-slate-400 text-xs">
                    <p className="font-medium">ไม่มีงานในสถานะนี้</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">ลากงานมาวางเพื่อเปลี่ยนสถานะ</p>
                  </div>
                ) : (
                  colTickets.map((ticket) => {
                    const slaInfo = formatSlaCountdown(ticket.slaRemainingMinutes);
                    const isP1 = ticket.priority.includes('P1') || ticket.priority.includes('วิกฤต');

                    return (
                      <div
                        key={ticket.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ticket.id)}
                        onClick={() => onTicketClick(ticket)}
                        className={`group relative rounded-xl border ${
                          isP1
                            ? 'border-red-300 bg-white hover:border-red-500'
                            : 'border-slate-200 bg-white hover:border-red-400'
                        } p-3.5 shadow-2xs hover:shadow-sm transition-all cursor-grab active:cursor-grabbing select-none`}
                      >
                        {/* Top: Key, Category Icon & Priority */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {getCategoryIcon(ticket.category)}
                            <span className="font-mono text-[11px] font-bold text-red-700">
                              {ticket.key}
                            </span>
                          </div>
                          <div>{getPriorityBadge(ticket.priority)}</div>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                          {ticket.title}
                        </h4>

                        {/* Request Type tag */}
                        <div className="mt-2 text-[10px] text-slate-500 truncate bg-slate-50 rounded px-1.5 py-0.5 border border-slate-100">
                          {ticket.requestType}
                        </div>

                        {/* Footer: SLA & Assignee */}
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                          {/* SLA */}
                          <div
                            className={`flex items-center gap-1 font-semibold ${
                              slaInfo.isBreached
                                ? 'text-red-600'
                                : ticket.slaRemainingMinutes <= 60
                                ? 'text-amber-600'
                                : 'text-slate-500'
                            }`}
                          >
                            <Clock className="h-3 w-3 shrink-0" />
                            <span className="text-[10px] truncate max-w-[95px]">
                              {slaInfo.label}
                            </span>
                          </div>

                          {/* Assignee Avatar */}
                          <div className="flex items-center gap-1.5">
                            {ticket.assignee ? (
                              <img
                                src={ticket.assignee.avatar}
                                alt={ticket.assignee.name}
                                title={`ผู้รับผิดชอบ: ${ticket.assignee.name}`}
                                className="h-5 w-5 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <span
                                title="ยังไม่มอบหมาย"
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-[10px]"
                              >
                                <User className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Move Status Selector */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2.5 pt-2 border-t border-dashed border-slate-100 flex items-center justify-between text-[10px]"
                        >
                          <span className="text-slate-400">ย้ายไป:</span>
                          <select
                            value={ticket.status}
                            onChange={(e) =>
                              onUpdateTicketStatus(
                                ticket.id,
                                e.target.value as TicketStatus
                              )
                            }
                            className="appearance-none rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-0.5 text-slate-700 font-medium cursor-pointer focus:outline-hidden focus:border-red-500"
                          >
                            <option value="เปิดใหม่">เปิดใหม่</option>
                            <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                            <option value="รออนุมัติ">รออนุมัติ</option>
                            <option value="รอลูกค้า">รอลูกค้า</option>
                            <option value="แก้ไขแล้ว">แก้ไขแล้ว</option>
                            <option value="ปิดงานแล้ว">ปิดงานแล้ว</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
