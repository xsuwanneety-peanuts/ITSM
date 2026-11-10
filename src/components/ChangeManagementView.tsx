import React from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Ticket } from '../types/itsm.ts';

interface ChangeManagementViewProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  onUpdateTicket: (updated: Ticket) => void;
  onCreateChangeClick: () => void;
}

export const ChangeManagementView: React.FC<ChangeManagementViewProps> = ({
  tickets,
  onSelectTicket,
  onUpdateTicket,
  onCreateChangeClick,
}) => {
  const changeTickets = tickets.filter((t) => t.category === 'change');

  const handleQuickApprove = (ticket: Ticket, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!ticket.changeMetadata) return;

    const updated: Ticket = {
      ...ticket,
      status: 'กำลังดำเนินการ',
      changeMetadata: {
        ...ticket.changeMetadata,
        approvalStatus: 'Approved',
        approvedBy: 'ศศิธร เชน (ประธานคณะกรรมการ CAB)',
        approvalDate: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateTicket(updated);
  };

  const handleQuickReject = (ticket: Ticket, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!ticket.changeMetadata) return;

    const updated: Ticket = {
      ...ticket,
      status: 'ปิดงานแล้ว',
      changeMetadata: {
        ...ticket.changeMetadata,
        approvalStatus: 'Rejected',
        approvedBy: 'ศศิธร เชน (CAB)',
        approvalDate: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateTicket(updated);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAFA] p-6 md:p-8 font-sans">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-red-100 p-2 text-red-700">
              <GitPullRequest className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              การจัดการการเปลี่ยนแปลงและคณะกรรมการ CAB (Change Management)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            เวิร์กโฟลว์การขออนุมัติตามมาตรฐาน ITIL, ประเมินความเสี่ยงอัตโนมัติ, ตรวจสอบผ่าน Bitbucket/Jenkins CI/CD และกำหนดหน้าต่างบำรุงรักษา
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateChangeClick}
          className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
        >
          <GitPullRequest className="h-4 w-4" />
          <span>ยื่นขออนุมัติการเปลี่ยนแปลง (RFC)</span>
        </button>
      </div>

      {/* CI/CD Integration Banner (Corporate White & Red style) */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>การเชื่อมต่อระบบ CI/CD</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">พร้อมใช้งาน</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 leading-relaxed">
            เชื่อมต่อ Webhook กับ Bitbucket Pipelines, GitHub Actions และ Jenkins สำเร็จ
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>องค์ประชุมคณะกรรมการ CAB</span>
            <span className="font-bold text-red-600">2 จาก 3 ท่าน</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 leading-relaxed">
            รอบการประชุมพิจารณาประจำสัปดาห์: ทุกวันพฤหัสบดี เวลา 14:00 น.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>ช่วงเวลาหยุดการปรับปรุง (Freeze)</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">ไม่มีช่วง Freeze</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 leading-relaxed">
            ช่วงงดเว้นการเปลี่ยนแปลงครั้งถัดไป: รอบสิ้นไตรมาสที่ 4 (25 ธ.ค. - 2 ม.ค.)
          </div>
        </div>
      </div>

      {/* Changes List */}
      <div className="mt-8 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">รายการคำขอเปลี่ยนแปลงระบบที่เปิดอยู่ (Active RFCs)</h2>

        {changeTickets.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            <GitPullRequest className="mx-auto h-8 w-8 mb-2 text-slate-300" />
            <p className="font-bold text-slate-700">ไม่มีคำขอเปลี่ยนแปลงระบบที่เปิดอยู่</p>
            <p className="text-xs text-slate-400 mt-1">ยื่นคำขอ RFC เพื่อให้ระบบประเมินความเสี่ยงและส่งต่อคณะกรรมการ</p>
          </div>
        ) : (
          changeTickets.map((ticket) => {
            const meta = ticket.changeMetadata;
            const isApproved = meta?.approvalStatus === 'Approved';
            const isRejected = meta?.approvalStatus === 'Rejected';
            const isPending = !isApproved && !isRejected;

            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-red-400 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="font-extrabold text-red-700 text-sm">{ticket.key}</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-red-700 transition-colors">
                        {ticket.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ticket.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Risk Badge */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        meta?.riskLevel === 'Very High' || meta?.riskLevel === 'High'
                          ? 'bg-red-100 text-red-800'
                          : meta?.riskLevel === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      ความเสี่ยง: {meta?.riskLevel || 'ปกติ'}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isRejected
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {isApproved ? 'อนุมัติแล้ว' : isRejected ? 'ไม่อนุมัติ' : 'รอการพิจารณา CAB'}
                    </span>
                  </div>
                </div>

                {/* Sub details: Backout Plan, Planned Window, Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>เวลาดำเนินการ: {meta?.plannedStartTime ? new Date(meta.plannedStartTime).toLocaleDateString('th-TH') : 'ตามกำหนด'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                      <span>แผนย้อนกลับ: {meta?.backoutPlan ? 'เตรียมไว้แล้ว' : 'อัตโนมัติ'}</span>
                    </div>
                    {meta?.approvedBy && (
                      <div className="text-emerald-700 font-bold">
                        ผู้อนุมัติ: {meta.approvedBy}
                      </div>
                    )}
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleQuickApprove(ticket, e)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>อนุมัติคำขอ (Approve)</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleQuickReject(ticket, e)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-3.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>ปฏิเสธ (Reject)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
