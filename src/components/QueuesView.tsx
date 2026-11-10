import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  ArrowUpDown,
  Plus,
  ShieldAlert,
  GitPullRequest,
  HelpCircle,
  Laptop,
  Wifi,
  Key,
  HardDrive,
  Briefcase,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { Ticket, FilterState, Agent, TicketStatus, Priority } from '../types/itsm.ts';
import { formatSlaCountdown } from '../utils/itsmLogic.ts';

interface QueuesViewProps {
  tickets: Ticket[];
  agents: Agent[];
  onSelectTicket: (ticket: Ticket) => void;
  onCreateTicketClick: () => void;
  categoryFilter?: string;
}

export const QueuesView: React.FC<QueuesViewProps> = ({
  tickets,
  agents,
  onSelectTicket,
  onCreateTicketClick,
  categoryFilter,
}) => {
  const [activeQueueTab, setActiveQueueTab] = useState<'all' | 'my' | 'unassigned' | 'incidents' | 'changes' | 'breached'>('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Filter based on active queue sub-tab & search
  const filteredTickets = tickets.filter((t) => {
    if (categoryFilter && t.category !== categoryFilter) return false;

    const isClosedOrResolved =
      t.status === 'Resolved' ||
      t.status === 'Closed' ||
      t.status === 'แก้ไขแล้ว' ||
      t.status === 'ปิดงานแล้ว';

    if (activeQueueTab === 'all') {
      if (t.status === 'Closed' || t.status === 'ปิดงานแล้ว') return false;
    } else if (activeQueueTab === 'my') {
      if (t.assignee?.id !== 'agt-1') return false;
    } else if (activeQueueTab === 'unassigned') {
      if (t.assignee !== null) return false;
    } else if (activeQueueTab === 'incidents') {
      if (t.category !== 'incident') return false;
    } else if (activeQueueTab === 'changes') {
      if (t.category !== 'change') return false;
    } else if (activeQueueTab === 'breached') {
      if (t.slaRemainingMinutes >= 0) return false;
    }

    if (statusFilter !== 'all') {
      if (t.status !== statusFilter) return false;
    }
    if (priorityFilter !== 'all') {
      if (t.priority !== priorityFilter) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchKey = t.key.toLowerCase().includes(q);
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchType = t.requestType.toLowerCase().includes(q);
      const matchReporter = t.reporter.name.toLowerCase().includes(q);
      if (!matchKey && !matchTitle && !matchType && !matchReporter) return false;
    }

    return true;
  });

  const getPriorityBadge = (priority: Priority) => {
    if (priority === 'P1 - Critical' || priority === 'P1 - วิกฤต') {
      return (
        <span className="inline-flex whitespace-nowrap items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800 border border-red-200">
          <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
          P1 วิกฤต
        </span>
      );
    }
    if (priority === 'P2 - High' || priority === 'P2 - สูง') {
      return (
        <span className="inline-flex whitespace-nowrap items-center gap-1 rounded bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-800">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
          P2 สูง
        </span>
      );
    }
    if (priority === 'P3 - Medium' || priority === 'P3 - ปานกลาง') {
      return (
        <span className="inline-flex whitespace-nowrap items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          P3 ปานกลาง
        </span>
      );
    }
    return (
      <span className="inline-flex whitespace-nowrap items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        P4 ต่ำ
      </span>
    );
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
      case 'เปิดใหม่':
        return <span className="inline-flex whitespace-nowrap rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-[11px] font-bold text-red-700">เปิดใหม่</span>;
      case 'In Progress':
      case 'กำลังดำเนินการ':
        return <span className="inline-flex whitespace-nowrap rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800">กำลังดำเนินการ</span>;
      case 'Pending Approval':
      case 'รออนุมัติ':
        return <span className="inline-flex whitespace-nowrap rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-[11px] font-bold text-purple-700">รออนุมัติ (CAB)</span>;
      case 'Waiting for Customer':
      case 'รอลูกค้า':
        return <span className="inline-flex whitespace-nowrap rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">รอลูกค้า</span>;
      case 'Waiting for Support':
      case 'รอทีมสนับสนุน':
        return <span className="inline-flex whitespace-nowrap rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-semibold text-rose-700">รอทีมสนับสนุน</span>;
      case 'Resolved':
      case 'แก้ไขแล้ว':
        return <span className="inline-flex whitespace-nowrap rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">แก้ไขแล้ว</span>;
      case 'Closed':
      case 'ปิดงานแล้ว':
        return <span className="inline-flex whitespace-nowrap rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-500">ปิดงานแล้ว</span>;
      default:
        return <span className="inline-flex whitespace-nowrap rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{status}</span>;
    }
  };

  const getTypeIcon = (category: string) => {
    switch (category) {
      case 'incident':
        return <ShieldAlert className="h-4 w-4 text-red-600" />;
      case 'change':
        return <GitPullRequest className="h-4 w-4 text-amber-600" />;
      case 'problem':
        return <AlertTriangle className="h-4 w-4 text-purple-600" />;
      case 'post_incident_review':
        return <FileText className="h-4 w-4 text-slate-600" />;
      default:
        return <HelpCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      {/* Queues Header */}
      <div className="border-b border-slate-200 px-6 md:px-8 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {categoryFilter === 'incident'
                ? 'คิวงานเหตุขัดข้อง (Incidents Queue)'
                : categoryFilter === 'service_request'
                ? 'คิวงานคำขอบริการทั่วไป (Service Requests)'
                : categoryFilter === 'change'
                ? 'คิวงานขออนุมัติการเปลี่ยนแปลง (Change Requests)'
                : 'คิวงานฝ่ายสนับสนุนไอที (Service Management Queues)'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              คัดกรอง มอบหมาย แก้ไขเหตุขัดข้อง และจัดการคำขอบริการไอทีตามกำหนด SLA
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateTicketClick}
            className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.8]" />
            <span>สร้างงานใหม่</span>
          </button>
        </div>

        {/* Queue Sub-Tabs */}
        <div className="mt-4 flex flex-wrap gap-1 border-b border-slate-200/80 -mb-5 pb-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveQueueTab('all')}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              activeQueueTab === 'all'
                ? 'bg-red-50 text-red-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            งานที่เปิดอยู่ทั้งหมด ({tickets.filter((t) => t.status !== 'Closed' && t.status !== 'ปิดงานแล้ว').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveQueueTab('my')}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              activeQueueTab === 'my'
                ? 'bg-red-50 text-red-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            งานของฉัน ({tickets.filter((t) => t.assignee?.id === 'agt-1').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveQueueTab('unassigned')}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              activeQueueTab === 'unassigned'
                ? 'bg-red-50 text-red-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ยังไม่มีผู้รับผิดชอบ ({tickets.filter((t) => t.assignee === null).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveQueueTab('incidents')}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              activeQueueTab === 'incidents'
                ? 'bg-red-50 text-red-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            เหตุขัดข้องเร่งด่วน ({tickets.filter((t) => t.category === 'incident').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveQueueTab('changes')}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              activeQueueTab === 'changes'
                ? 'bg-red-50 text-red-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            รออนุมัติ CAB ({tickets.filter((t) => t.status === 'Pending Approval' || t.status === 'รออนุมัติ').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveQueueTab('breached')}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              activeQueueTab === 'breached'
                ? 'bg-red-600 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            เกินกำหนด SLA ({tickets.filter((t) => t.slaRemainingMinutes < 0).length})
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/70 px-6 md:px-8 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาตามรหัสตั๋ว, หัวเรื่อง, ผู้แจ้ง..."
              className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs placeholder-slate-400 focus:border-red-500 focus:outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700"
          >
            <option value="all">สถานะ: ทั้งหมด</option>
            <option value="เปิดใหม่">เปิดใหม่</option>
            <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
            <option value="รออนุมัติ">รออนุมัติ</option>
            <option value="รอลูกค้า">รอลูกค้า</option>
            <option value="แก้ไขแล้ว">แก้ไขแล้ว</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700"
          >
            <option value="all">ระดับความสำคัญ: ทั้งหมด</option>
            <option value="P1 - วิกฤต">P1 วิกฤต</option>
            <option value="P2 - สูง">P2 สูง</option>
            <option value="P3 - ปานกลาง">P3 ปานกลาง</option>
            <option value="P4 - ต่ำ">P4 ต่ำ</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          พบ <span className="font-bold text-red-700">{filteredTickets.length}</span> รายการ
        </div>
      </div>

      {/* Ticket Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-[#FAFAFA] border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-2.5 pl-6 md:pl-8 pr-3 w-28">รหัสตั๋ว</th>
              <th className="py-2.5 px-3">หัวเรื่องคำขอ</th>
              <th className="py-2.5 px-3 w-40">ประเภทคำขอ</th>
              <th className="py-2.5 px-3 w-32">สถานะ</th>
              <th className="py-2.5 px-3 w-32">ความสำคัญ</th>
              <th className="py-2.5 px-3 w-44">เวลา SLA</th>
              <th className="py-2.5 px-3 w-36">ผู้รับผิดชอบ</th>
              <th className="py-2.5 pr-6 md:pr-8 pl-3 w-36">ผู้แจ้งคำขอ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <Clock className="mx-auto h-8 w-8 mb-2 text-slate-300" />
                  <p className="font-bold text-slate-700">ไม่พบรายการงานตามเงื่อนไขที่เลือก</p>
                  <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนแท็บหรือล้างคำค้นหา</p>
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => {
                const sla = formatSlaCountdown(ticket.slaRemainingMinutes);
                return (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className="hover:bg-red-50/40 cursor-pointer transition-colors group"
                  >
                    {/* Key */}
                    <td className="py-3 pl-6 md:pl-8 pr-3 font-bold text-red-700 group-hover:underline">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(ticket.category)}
                        <span>{ticket.key}</span>
                      </div>
                    </td>

                    {/* Summary */}
                    <td className="py-3 px-3 max-w-md">
                      <div className="font-bold text-slate-900 truncate">{ticket.title}</div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{ticket.description}</div>
                    </td>

                    {/* Request Type */}
                    <td className="py-3 px-3 text-slate-600 font-medium truncate">
                      {ticket.requestType}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {getStatusBadge(ticket.status)}
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3">
                      {getPriorityBadge(ticket.priority)}
                    </td>

                    {/* SLA Timer in Thai */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Clock
                          className={`h-3.5 w-3.5 ${
                            sla.isBreached
                              ? 'text-red-600'
                              : sla.isWarning
                              ? 'text-amber-500'
                              : 'text-slate-400'
                          }`}
                        />
                        <span
                          className={`font-bold ${
                            sla.isBreached
                              ? 'text-red-700'
                              : sla.isWarning
                              ? 'text-amber-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {sla.label}
                        </span>
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-3">
                      {ticket.assignee ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={ticket.assignee.avatar}
                            alt={ticket.assignee.name}
                            className="h-5 w-5 rounded-full object-cover border border-slate-200"
                          />
                          <span className="truncate font-semibold text-slate-800">{ticket.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 italic">
                          ยังไม่มอบหมาย
                        </span>
                      )}
                    </td>

                    {/* Reporter */}
                    <td className="py-3 pr-6 md:pr-8 pl-3 text-slate-600 truncate">
                      <div className="font-semibold text-slate-800 truncate">{ticket.reporter.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{ticket.reporter.department}</div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
