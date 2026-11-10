import React, { useState } from 'react';
import {
  X,
  Clock,
  User,
  AlertTriangle,
  GitPullRequest,
  CheckCircle2,
  MessageSquare,
  Lock,
  Send,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Calendar,
  Tag,
  Star,
  Users,
} from 'lucide-react';
import {
  Ticket,
  Agent,
  TicketStatus,
  Priority,
  TicketComment,
} from '../types/itsm.ts';
import { formatSlaCountdown } from '../utils/itsmLogic.ts';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onUpdateTicket: (updated: Ticket) => void;
  agents: Agent[];
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  onUpdateTicket,
  agents,
}) => {
  if (!ticket) return null;

  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [isMajorIncidentAlert, setIsMajorIncidentAlert] = useState(
    ticket.incidentMetadata?.isMajorIncident || false
  );

  const sla = formatSlaCountdown(ticket.slaRemainingMinutes);

  const handleStatusChange = (newStatus: TicketStatus) => {
    const updated: Ticket = {
      ...ticket,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    onUpdateTicket(updated);
  };

  const handlePriorityChange = (newPriority: Priority) => {
    const updated: Ticket = {
      ...ticket,
      priority: newPriority,
      updatedAt: new Date().toISOString(),
    };
    onUpdateTicket(updated);
  };

  const handleAssigneeChange = (agentId: string) => {
    const selected = agents.find((a) => a.id === agentId) || null;
    const updated: Ticket = {
      ...ticket,
      assignee: selected,
      updatedAt: new Date().toISOString(),
    };
    onUpdateTicket(updated);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: TicketComment = {
      id: `c-${Date.now()}`,
      author: 'ศศิธร เชน',
      authorRole: 'หัวหน้าฝ่ายปฏิบัติการไอที (IT Lead)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isInternal: isInternalComment,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated: Ticket = {
      ...ticket,
      comments: [...ticket.comments, newComment],
      updatedAt: new Date().toISOString(),
    };

    onUpdateTicket(updated);
    setCommentText('');
  };

  const handleApproveChange = (status: 'Approved' | 'Rejected') => {
    if (!ticket.changeMetadata) return;
    const updated: Ticket = {
      ...ticket,
      status: status === 'Approved' ? 'กำลังดำเนินการ' : 'ปิดงานแล้ว',
      changeMetadata: {
        ...ticket.changeMetadata,
        approvalStatus: status,
        approvedBy: 'ศศิธร เชน (ประธานคณะกรรมการ CAB)',
        approvalDate: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateTicket(updated);
  };

  const handleToggleMajorIncident = () => {
    const nextState = !isMajorIncidentAlert;
    setIsMajorIncidentAlert(nextState);
    const updated: Ticket = {
      ...ticket,
      priority: nextState ? 'P1 - วิกฤต' : ticket.priority,
      incidentMetadata: {
        ...ticket.incidentMetadata,
        affectedServices: ticket.incidentMetadata?.affectedServices || ['เกตเวย์หลัก'],
        impactedUserCount: ticket.incidentMetadata?.impactedUserCount || 100,
        isMajorIncident: nextState,
        opsgenieEscalated: nextState,
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateTicket(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
      <div
        className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-xl bg-white shadow-2xl overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-label={`รายละเอียดตั๋ว ${ticket.key}`}
      >
        {/* Top Header - White & Red Accent */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-6 py-3.5">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-red-700 tracking-tight text-sm">{ticket.key}</span>
            <span className="text-slate-300">/</span>
            <span className="rounded bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-bold text-red-800">
              {ticket.requestType}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Major Incident Alert Banner if active */}
        {isMajorIncidentAlert && (
          <div className="flex items-center justify-between bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-inner">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 animate-bounce" />
              <span>ประกาศเหตุการณ์วิกฤต (Major Incident) — ระบบแจ้งเตือน Opsgenie Active | ผู้บัญชาการ: ศศิธร เชน</span>
            </div>
            <button
              type="button"
              onClick={handleToggleMajorIncident}
              className="rounded bg-red-800 px-2.5 py-1 text-[11px] hover:bg-red-900 cursor-pointer"
            >
              ลดระดับความรุนแรง
            </button>
          </div>
        )}

        {/* Main Content: 2-Column Split */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column: Details & Comments */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-snug">{ticket.title}</h2>
              <p className="mt-2 text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                {ticket.description}
              </p>
            </div>

            {/* Change Management Metadata Box if RFC */}
            {ticket.category === 'change' && ticket.changeMetadata && (
              <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-900">
                    <GitPullRequest className="h-4 w-4 text-red-600" />
                    <span>การประเมินการเปลี่ยนแปลงระบบโดยคณะกรรมการ (CAB Review)</span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      ticket.changeMetadata.approvalStatus === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ticket.changeMetadata.approvalStatus === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    สถานะการอนุมัติ: {ticket.changeMetadata.approvalStatus === 'Approved' ? 'อนุมัติแล้ว' : ticket.changeMetadata.approvalStatus === 'Rejected' ? 'ไม่อนุมัติ' : 'รอการพิจารณา'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">ระดับความเสี่ยง:</span>
                    <span className="ml-1.5 font-bold text-slate-900">{ticket.changeMetadata.riskLevel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">ประเภทคำขอ:</span>
                    <span className="ml-1.5 font-semibold text-slate-900">{ticket.changeMetadata.changeType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">ช่วงเวลาบำรุงรักษา:</span>
                    <span className="ml-1.5 font-medium text-slate-700">
                      {new Date(ticket.changeMetadata.plannedStartTime).toLocaleDateString('th-TH')} (Maintenance window)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">แผนย้อนกลับ (Backout):</span>
                    <span className="ml-1.5 font-medium text-slate-700">{ticket.changeMetadata.backoutPlan}</span>
                  </div>
                </div>

                {ticket.changeMetadata.approvalStatus === 'Pending' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-red-200/60">
                    <button
                      type="button"
                      onClick={() => handleApproveChange('Approved')}
                      className="rounded bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      อนุมัติการเปลี่ยนแปลง (Approve RFC)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveChange('Rejected')}
                      className="rounded bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      ปฏิเสธคำขอ (Reject)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Incident Metadata Box if Incident */}
            {ticket.category === 'incident' && (
              <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <div className="flex items-center gap-1.5 text-red-700">
                    <ShieldAlert className="h-4 w-4 text-red-600" />
                    <span>ข้อมูลปฏิบัติการกู้คืนเหตุขัดข้อง</span>
                  </div>
                  {!isMajorIncidentAlert && (
                    <button
                      type="button"
                      onClick={handleToggleMajorIncident}
                      className="rounded bg-red-100 px-2.5 py-1 font-bold text-red-800 hover:bg-red-200 transition-colors cursor-pointer"
                    >
                      ยกระดับสู่วิกฤต (Opsgenie Escalation)
                    </button>
                  )}
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold">ระบบที่ได้รับผลกระทบ: </span>
                  {ticket.incidentMetadata?.affectedServices.join(', ') || 'เกตเวย์และบริการเครือข่าย'}
                </div>
                {ticket.incidentMetadata?.workaround && (
                  <div className="text-slate-700">
                    <span className="font-semibold text-emerald-800">วิธีแก้ไขชั่วคราว: </span>
                    {ticket.incidentMetadata.workaround}
                  </div>
                )}
              </div>
            )}

            {/* Activity & Comments Stream */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">บันทึกกิจกรรมและความเห็น</h3>
                <span className="text-xs text-slate-500">{ticket.comments.length} ข้อความ</span>
              </div>

              {/* Add comment box */}
              <form onSubmit={handleAddComment} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsInternalComment(false)}
                      className={`rounded px-3 py-1 font-bold transition-colors cursor-pointer ${
                        !isInternalComment ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ตอบกลับผู้ใช้บริการ
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInternalComment(true)}
                      className={`flex items-center gap-1 rounded px-3 py-1 font-bold transition-colors cursor-pointer ${
                        isInternalComment ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Lock className="h-3 w-3" />
                      <span>บันทึกภายใน (Internal Note)</span>
                    </button>
                  </div>
                  {isInternalComment && (
                    <span className="text-[11px] text-amber-800 font-semibold">มองเห็นเฉพาะทีมงานไอที</span>
                  )}
                </div>

                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    isInternalComment
                      ? 'บันทึกความคืบหน้าภายในทีมไอที...'
                      : 'พิมพ์ข้อความแจ้งเตือนหรือตอบกลับผู้รับบริการ...'
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:outline-hidden"
                />

                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    <Send className="h-3 w-3" />
                    <span>บันทึก{isInternalComment ? 'บันทึกช่วยจำ' : 'ข้อความ'}</span>
                  </button>
                </div>
              </form>

              {/* Existing Comments List */}
              <div className="space-y-3">
                {ticket.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`rounded-xl border p-3.5 text-xs ${
                      comment.isInternal
                        ? 'border-amber-200 bg-amber-50/70'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="h-6 w-6 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-bold text-slate-800">{comment.author}</span>
                        <span className="text-[11px] text-slate-400">({comment.authorRole})</span>
                        {comment.isInternal && (
                          <span className="rounded bg-amber-200/90 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                            บันทึกภายใน
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line pl-8">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Status, Priority, SLA, Assignee & ITIL Controls */}
          <div className="w-80 border-l border-slate-200 bg-slate-50/70 p-6 space-y-5 overflow-y-auto text-xs">
            {/* สถานะงาน */}
            <div>
              <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wider text-[11px]">
                สถานะงาน (Status)
              </label>
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="w-full rounded-md border border-slate-300 bg-white py-1.5 px-3 font-bold text-slate-800 shadow-2xs hover:bg-slate-50 focus:border-red-500 focus:outline-hidden cursor-pointer"
              >
                <option value="เปิดใหม่">เปิดใหม่ (Open)</option>
                <option value="กำลังดำเนินการ">กำลังดำเนินการ (In Progress)</option>
                <option value="รออนุมัติ">รออนุมัติ (Pending Approval)</option>
                <option value="รอลูกค้า">รอลูกค้า (Waiting for Customer)</option>
                <option value="รอทีมสนับสนุน">รอทีมสนับสนุน (Waiting for Support)</option>
                <option value="แก้ไขแล้ว">แก้ไขแล้ว (Resolved)</option>
                <option value="ปิดงานแล้ว">ปิดงานแล้ว (Closed)</option>
              </select>
            </div>

            {/* SLA Clock Box */}
            <div className="rounded-xl border border-red-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-600">เวลาเป้าหมาย SLA</span>
                <Clock
                  className={`h-4 w-4 ${
                    sla.isBreached
                      ? 'text-red-600'
                      : sla.isWarning
                      ? 'text-amber-500'
                      : 'text-red-500'
                  }`}
                />
              </div>
              <div
                className={`text-base font-extrabold ${
                  sla.isBreached
                    ? 'text-red-700'
                    : sla.isWarning
                    ? 'text-amber-700'
                    : 'text-slate-900'
                }`}
              >
                {sla.label}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                กำหนดการแก้ปัญหา: {Math.round(ticket.slaTargetMinutes / 60)} ชั่วโมง
              </p>
            </div>

            {/* ระดับความสำคัญ */}
            <div>
              <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wider text-[11px]">
                ระดับความสำคัญ (Priority)
              </label>
              <select
                value={ticket.priority}
                onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                className="w-full rounded-md border border-slate-300 bg-white py-1.5 px-3 font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 focus:border-red-500 focus:outline-hidden cursor-pointer"
              >
                <option value="P1 - วิกฤต">P1 - วิกฤต (Critical)</option>
                <option value="P2 - สูง">P2 - สูง (High)</option>
                <option value="P3 - ปานกลาง">P3 - ปานกลาง (Medium)</option>
                <option value="P4 - ต่ำ">P4 - ต่ำ (Low)</option>
              </select>
            </div>

            {/* ผู้รับผิดชอบ */}
            <div>
              <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wider text-[11px]">
                ผู้รับผิดชอบ (Assignee)
              </label>
              <select
                value={ticket.assignee?.id || 'unassigned'}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white py-1.5 px-3 font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 focus:border-red-500 focus:outline-hidden cursor-pointer"
              >
                <option value="unassigned">ยังไม่มอบหมาย</option>
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.role})
                  </option>
                ))}
              </select>
            </div>

            {/* ข้อมูลผู้แจ้ง */}
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                ผู้แจ้งคำขอ (Reporter)
              </label>
              <div className="flex items-center gap-2">
                <img
                  src={ticket.reporter.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={ticket.reporter.name}
                  className="h-7 w-7 rounded-full object-cover border border-slate-200"
                />
                <div className="truncate">
                  <div className="font-bold text-slate-800 truncate">{ticket.reporter.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{ticket.reporter.department}</div>
                </div>
              </div>
            </div>

            {/* ผลประเมินความพึงพอใจ */}
            {ticket.csatScore && (
              <div className="border-t border-slate-200 pt-4 space-y-1.5">
                <label className="block text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  คะแนนความพึงพอใจ (CSAT)
                </label>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${s <= (ticket.csatScore || 0) ? 'fill-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                  <span className="ml-1 text-xs font-bold text-slate-800">{ticket.csatScore}.0</span>
                </div>
                {ticket.csatComment && (
                  <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">
                    &ldquo;{ticket.csatComment}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* ข้อมูลเวลา */}
            <div className="border-t border-slate-200 pt-4 space-y-1 text-[11px] text-slate-400">
              <div>สร้างเมื่อ: {new Date(ticket.createdAt).toLocaleString('th-TH')}</div>
              <div>อัปเดตล่าสุด: {new Date(ticket.updatedAt).toLocaleString('th-TH')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
