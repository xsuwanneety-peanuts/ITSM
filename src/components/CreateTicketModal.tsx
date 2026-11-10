import React, { useState } from 'react';
import {
  X,
  Plus,
  HelpCircle,
  ShieldAlert,
  GitPullRequest,
  AlertTriangle,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  Ticket,
  TicketCategory,
  Priority,
  Urgency,
  Impact,
  Agent,
  ChangeType,
} from '../types/itsm.ts';
import { REQUEST_TYPE_DEFINITIONS } from '../data/seedData.ts';
import { calculateChangeRiskScore } from '../utils/itsmLogic.ts';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTicket: (ticket: Ticket) => void;
  agents: Agent[];
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onCreateTicket,
  agents,
}) => {
  if (!isOpen) return null;

  const [category, setCategory] = useState<TicketCategory>('service_request');
  const [requestType, setRequestType] = useState('ขอความช่วยเหลือด้านไอที (Get IT help)');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('Medium');
  const [impact, setImpact] = useState<Impact>('Medium');
  const [assigneeId, setAssigneeId] = useState('unassigned');

  // Change management fields
  const [changeType, setChangeType] = useState<ChangeType>('Normal');
  const [backoutPlan, setBackoutPlan] = useState('');
  const [plannedDate, setPlannedDate] = useState('2026-11-15');

  // Incident specific
  const [affectedServices, setAffectedServices] = useState('ระบบเกตเวย์ VPN');

  const availableRequestTypes = REQUEST_TYPE_DEFINITIONS.filter((r) => r.category === category);

  const calculateAutoPriority = (u: Urgency, i: Impact): Priority => {
    if (u === 'Critical' || i === 'Extensive') return 'P1 - วิกฤต';
    if (u === 'High' || i === 'High') return 'P2 - สูง';
    if (u === 'Medium' || i === 'Medium') return 'P3 - ปานกลาง';
    return 'P4 - ต่ำ';
  };

  const autoPriority = calculateAutoPriority(urgency, impact);

  const handleCategorySwitch = (cat: TicketCategory) => {
    setCategory(cat);
    const firstMatching = REQUEST_TYPE_DEFINITIONS.find((r) => r.category === cat);
    if (firstMatching) {
      setRequestType(firstMatching.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedAgent = agents.find((a) => a.id === assigneeId) || null;
    const ticketKey = `SUP-${Math.floor(100 + Math.random() * 900)}`;

    const newTicket: Ticket = {
      id: `t-${Date.now()}`,
      key: ticketKey,
      title: title.trim(),
      description: description.trim() || 'ไม่มีรายละเอียดเพิ่มเติม',
      category,
      requestType,
      status: category === 'change' ? 'รออนุมัติ' : 'เปิดใหม่',
      priority: autoPriority,
      urgency,
      impact,
      assignee: assignedAgent,
      reporter: {
        name: 'อเล็กซานเดอร์ รอย (ผู้ใช้งาน)',
        email: 'alexandre.roy@company.co.th',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        department: 'ฝ่ายปฏิบัติการทั่วไป',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      slaRemainingMinutes: autoPriority === 'P1 - วิกฤต' ? 120 : 480,
      slaTargetMinutes: autoPriority === 'P1 - วิกฤต' ? 120 : 480,
      comments: [],
      tags: [category, requestType.toLowerCase().replace(/\s+/g, '-')],
    };

    if (category === 'change') {
      newTicket.changeMetadata = {
        changeType,
        riskLevel: calculateChangeRiskScore(impact, urgency, changeType),
        plannedStartTime: new Date(plannedDate).toISOString(),
        plannedEndTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        backoutPlan: backoutPlan || 'ย้อนกลับการปรับปรุงด้วย GitOps Snapshot ภายใน 5 นาที',
        impactAssessment: `ประเมินผลกระทบระดับ ${impact} สำหรับช่วงเวลาเร่งด่วน ${urgency}`,
        approvalStatus: 'Pending',
      };
    }

    if (category === 'incident') {
      newTicket.incidentMetadata = {
        affectedServices: affectedServices.split(',').map((s) => s.trim()),
        impactedUserCount: urgency === 'Critical' ? 250 : 25,
        isMajorIncident: autoPriority === 'P1 - วิกฤต',
        opsgenieEscalated: autoPriority === 'P1 - วิกฤต',
      };
    }

    onCreateTicket(newTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-label="สร้างงานใหม่"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">สร้างงานใหม่ (Create Work Item)</h2>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
              ฝ่ายสนับสนุนไอทีองค์กร
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Category Tabs */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              หมวดหมู่งาน ITIL
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleCategorySwitch('service_request')}
                className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 font-bold transition-all cursor-pointer ${
                  category === 'service_request'
                    ? 'border-red-600 bg-red-50 text-red-700 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <HelpCircle className="h-4 w-4" />
                <span>คำขอบริการ</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySwitch('incident')}
                className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 font-bold transition-all cursor-pointer ${
                  category === 'incident'
                    ? 'border-red-600 bg-red-50 text-red-700 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                <span>เหตุขัดข้อง</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySwitch('change')}
                className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 font-bold transition-all cursor-pointer ${
                  category === 'change'
                    ? 'border-red-600 bg-red-50 text-red-700 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GitPullRequest className="h-4 w-4" />
                <span>ขอเปลี่ยนแปลง</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySwitch('problem')}
                className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 font-bold transition-all cursor-pointer ${
                  category === 'problem'
                    ? 'border-red-600 bg-red-50 text-red-700 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>ปัญหาเชิงลึก (RCA)</span>
              </button>
            </div>
          </div>

          {/* Request Type Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ประเภทคำขอ</label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 focus:border-red-500 focus:outline-hidden"
            >
              {availableRequestTypes.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} — {t.description}
                </option>
              ))}
            </select>
          </div>

          {/* Summary */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              หัวเรื่องคำขอ <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น การเชื่อมต่อ VPN หลุดบ่อย หรือ ขอสิทธิ์เข้าถึงฐานข้อมูล"
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 placeholder-slate-400 focus:border-red-500 focus:outline-hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">รายละเอียดเพิ่มเติม</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุข้อความแจ้งเตือนความผิดพลาด รหัสข้อผิดพลาด หรือเหตุผลความจำเป็น..."
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 placeholder-slate-400 focus:border-red-500 focus:outline-hidden"
            />
          </div>

          {/* Urgency & Impact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ความเร่งด่วน</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as Urgency)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800"
              >
                <option value="Low">ต่ำ (Low)</option>
                <option value="Medium">ปานกลาง (Medium)</option>
                <option value="High">สูง (High)</option>
                <option value="Critical">วิกฤต (Critical)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ขอบเขตผลกระทบ</label>
              <select
                value={impact}
                onChange={(e) => setImpact(e.target.value as Impact)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800"
              >
                <option value="Low">ผู้ใช้รายบุคคล (Low)</option>
                <option value="Medium">ระดับแผนก (Medium)</option>
                <option value="High">หลายบริการพร้อมกัน (High)</option>
                <option value="Extensive">ส่งผลต่อทั้งองค์กร (Extensive)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ระดับความสำคัญคำนวณอัตโนมัติ</label>
              <div className="flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 font-extrabold text-red-700">
                {autoPriority}
              </div>
            </div>
          </div>

          {/* Extra fields if Change Request */}
          {category === 'change' && (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-3.5 space-y-3">
              <div className="font-bold text-red-900">ข้อมูลคณะกรรมการอนุมัติการเปลี่ยนแปลง (CAB Review)</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ประเภทการเปลี่ยนแปลง</label>
                  <select
                    value={changeType}
                    onChange={(e) => setChangeType(e.target.value as ChangeType)}
                    className="w-full rounded-md border border-slate-300 bg-white p-1.5"
                  >
                    <option value="Standard">Standard (มาตรฐาน อนุมัติล่วงหน้า)</option>
                    <option value="Normal">Normal (ต้องผ่านการพิจารณา CAB)</option>
                    <option value="Emergency">Emergency (ฉุกเฉิน กู้คืนระบบทันที)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">วันที่บำรุงรักษาที่วางแผน</label>
                  <input
                    type="date"
                    value={plannedDate}
                    onChange={(e) => setPlannedDate(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">แผนย้อนกลับ (Backout Plan)</label>
                <input
                  type="text"
                  value={backoutPlan}
                  onChange={(e) => setBackoutPlan(e.target.value)}
                  placeholder="เช่น สลับเส้นทางกลับโหนดสำรองภายใน 3 นาที"
                  className="w-full rounded-md border border-slate-300 bg-white p-1.5"
                />
              </div>
            </div>
          )}

          {/* Extra fields if Incident */}
          {category === 'incident' && (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-3.5 space-y-2">
              <div className="font-bold text-red-900">ระบบหรือบริการที่ได้รับผลกระทบ</div>
              <input
                type="text"
                value={affectedServices}
                onChange={(e) => setAffectedServices(e.target.value)}
                placeholder="เช่น ระบบเครือข่าย VPN, ฐานข้อมูลหลัก, เซิร์ฟเวอร์อีเมล"
                className="w-full rounded-md border border-slate-300 bg-white p-1.5"
              />
            </div>
          )}

          {/* Assignee */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ผู้รับผิดชอบงาน</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800"
            >
              <option value="unassigned">ยังไม่มอบหมาย (ส่งเข้าคิวกลาง)</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.role})
                </option>
              ))}
            </select>
          </div>

          {/* Footer Submit */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 cursor-pointer"
            >
              ยืนยันการสร้างงาน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
