import React, { useState } from 'react';
import {
  Agent,
  TicketCategory,
  Priority,
  RequestTypeDefinition,
  SlaPolicy,
  SystemConfig,
} from '../types/itsm.ts';
import {
  Settings,
  FolderTree,
  Users2,
  Clock,
  BellRing,
  Building,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  Shield,
  Key,
  Laptop,
  Mail,
  Smartphone,
  HardDrive,
  GitPullRequest,
  Search,
  FileText,
  UserPlus,
  Check,
  X,
  ExternalLink,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface SettingsViewProps {
  requestTypes: RequestTypeDefinition[];
  setRequestTypes: React.Dispatch<React.SetStateAction<RequestTypeDefinition[]>>;
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  slaPolicies: SlaPolicy[];
  setSlaPolicies: React.Dispatch<React.SetStateAction<SlaPolicy[]>>;
  systemConfig: SystemConfig;
  setSystemConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
}

type SettingsTab = 'categories' | 'members' | 'sla' | 'integrations' | 'organization';

export const SettingsView: React.FC<SettingsViewProps> = ({
  requestTypes,
  setRequestTypes,
  agents,
  setAgents,
  slaPolicies,
  setSlaPolicies,
  systemConfig,
  setSystemConfig,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('categories');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Filter for request types tab
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [typeSearch, setTypeSearch] = useState('');

  // New Request Type Modal State
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCategory, setNewTypeCategory] = useState<TicketCategory>('service_request');
  const [newTypeDescription, setNewTypeDescription] = useState('');
  const [newTypePriority, setNewTypePriority] = useState<Priority>('P3 - ปานกลาง');
  const [newTypeSlaHours, setNewTypeSlaHours] = useState<number>(24);
  const [newTypeDept, setNewTypeDept] = useState('ฝ่ายบริการช่วยเหลือไอที');

  // New Member Modal State
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberDept, setNewMemberDept] = useState('ฝ่ายบริการช่วยเหลือไอที');
  const [newMemberCapacity, setNewMemberCapacity] = useState<number>(6);
  const [newMemberAvatar, setNewMemberAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');

  const showToast = (message: string) => {
    setSaveToast(message);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Add new request type handler
  const handleAddRequestType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    const newDef: RequestTypeDefinition = {
      id: `rt-${Date.now()}`,
      name: newTypeName.trim(),
      category: newTypeCategory,
      description: newTypeDescription.trim() || 'คำขอบริการไอทีมาตรฐาน',
      defaultPriority: newTypePriority,
      defaultSlaHours: Number(newTypeSlaHours) || 24,
      icon: 'HelpCircle',
      department: newTypeDept,
      enabled: true,
    };

    setRequestTypes((prev) => [newDef, ...prev]);
    setIsAddTypeModalOpen(false);
    setNewTypeName('');
    setNewTypeDescription('');
    showToast(`เพิ่มประเภทคำขอ "${newDef.name}" สำเร็จ`);
  };

  // Add new IT agent handler
  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    const newAgt: Agent = {
      id: `agt-${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      avatar: newMemberAvatar,
      role: newMemberRole.trim() || 'เจ้าหน้าที่สนับสนุนไอที',
      department: newMemberDept,
      activeTicketsCount: 0,
      maxCapacity: Number(newMemberCapacity) || 6,
    };

    setAgents((prev) => [...prev, newAgt]);
    setIsAddMemberModalOpen(false);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('');
    showToast(`เพิ่มสมาชิกทีม "${newAgt.name}" สำเร็จ`);
  };

  // Filtered Request Types
  const filteredTypes = requestTypes.filter((rt) => {
    if (selectedCategoryFilter !== 'all' && rt.category !== selectedCategoryFilter) {
      return false;
    }
    if (typeSearch.trim()) {
      const q = typeSearch.toLowerCase();
      return (
        rt.name.toLowerCase().includes(q) ||
        rt.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAFA] p-6 md:p-8 font-sans">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl animate-fade-in border border-slate-700">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-red-100 p-2 text-red-700">
              <Settings className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              ตั้งค่าระบบฝ่ายสนับสนุนไอที (ITSM Settings)
            </h1>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-800">
              เฉพาะเจ้าหน้าที่ไอที
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            จัดการหมวดหมู่คำขอ สมาชิกทีมวิศวกรไอที นโยบายข้อตกลง SLA การเชื่อมต่อแจ้งเตือน และข้อมูลองค์กร
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-6 flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-red-600 text-red-700 font-bold bg-red-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <FolderTree className="h-4 w-4" />
          <span>หมวดหมู่ & ประเภทคำขอ ({requestTypes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'members'
              ? 'border-red-600 text-red-700 font-bold bg-red-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Users2 className="h-4 w-4" />
          <span>สมาชิกทีมไอที ({agents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sla')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'sla'
              ? 'border-red-600 text-red-700 font-bold bg-red-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>นโยบายกำหนดเวลา SLA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'integrations'
              ? 'border-red-600 text-red-700 font-bold bg-red-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <BellRing className="h-4 w-4" />
          <span>การแจ้งเตือน & การเชื่อมต่อ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('organization')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'organization'
              ? 'border-red-600 text-red-700 font-bold bg-red-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>ข้อมูลองค์กร & ธีม</span>
        </button>
      </div>

      {/* TAB 1: Categories & Request Types */}
      {activeTab === 'categories' && (
        <div className="mt-6 space-y-6">
          {/* Top Actions & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={typeSearch}
                  onChange={(e) => setTypeSearch(e.target.value)}
                  placeholder="ค้นหาชื่อประเภทคำขอ..."
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white py-1.5 px-3 text-xs text-slate-700 font-medium cursor-pointer focus:border-red-500 focus:outline-hidden"
              >
                <option value="all">หมวดหมู่ทั้งหมด</option>
                <option value="service_request">คำขอบริการไอที (Service Request)</option>
                <option value="incident">เหตุขัดข้อง (Incident)</option>
                <option value="problem">ปัญหาเชิงระบบ (Problem)</option>
                <option value="change">การขอเปลี่ยนแปลงระบบ (Change)</option>
                <option value="post_incident_review">ทบทวนหลังเกิดเหตุ (PIR)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsAddTypeModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>เพิ่มประเภทคำขอใหม่</span>
            </button>
          </div>

          {/* Request Types Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">ชื่อประเภทคำขอ</th>
                  <th className="py-3 px-4">หมวดหมู่ ITIL</th>
                  <th className="py-3 px-4">เป้าหมาย SLA (ชั่วโมง)</th>
                  <th className="py-3 px-4">ความสำคัญเริ่มต้น</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTypes.map((rt, idx) => (
                  <tr key={rt.id || idx} className="hover:bg-red-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{rt.name}</div>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5 max-w-md line-clamp-1">
                        {rt.description}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                        {rt.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Clock className="h-3.5 w-3.5 text-red-600" />
                        <span>{rt.defaultSlaHours} ชม.</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          rt.defaultPriority.includes('P1')
                            ? 'bg-red-100 text-red-700'
                            : rt.defaultPriority.includes('P2')
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rt.defaultPriority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const newHours = prompt(
                            `แก้ไขเวลาเป้าหมาย SLA สำหรับ "${rt.name}" (ชั่วโมง):`,
                            String(rt.defaultSlaHours)
                          );
                          if (newHours && !isNaN(Number(newHours))) {
                            setRequestTypes((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, defaultSlaHours: Number(newHours) } : item
                              )
                            );
                            showToast(`อัปเดต SLA เป็น ${newHours} ชั่วโมง เรียบร้อย`);
                          }
                        }}
                        className="rounded px-2.5 py-1 text-slate-600 hover:bg-slate-100 hover:text-red-700 font-medium cursor-pointer"
                      >
                        แก้ไข SLA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Members & Agents */}
      {activeTab === 'members' && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                รายชื่อวิศวกรและเจ้าหน้าที่สนับสนุนไอที ({agents.length} ท่าน)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                กำหนดบทบาท สังกัดฝ่าย และขีดความจุงานสูงสุด (Max Capacity) ต่อท่าน
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddMemberModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>เพิ่มสมาชิกทีมไอที</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => {
              const utilPercent = Math.round((agent.activeTicketsCount / agent.maxCapacity) * 100);
              return (
                <div
                  key={agent.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-red-100"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{agent.name}</h3>
                      <p className="text-xs text-red-700 font-medium truncate">{agent.role}</p>
                      <p className="text-[11px] text-slate-400 truncate">{agent.department}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>อีเมล:</span>
                      <span className="font-mono text-[11px] text-slate-800">{agent.email}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>ภาระงานปัจจุบัน:</span>
                      <span className="font-bold text-slate-800">
                        {agent.activeTicketsCount} / {agent.maxCapacity} งาน ({utilPercent}%)
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${Math.min(utilPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const newCap = prompt(`กำหนดขีดความจุสูงสุด (งาน) ของ ${agent.name}:`, String(agent.maxCapacity));
                        if (newCap && !isNaN(Number(newCap))) {
                          setAgents((prev) =>
                            prev.map((a) => (a.id === agent.id ? { ...a, maxCapacity: Number(newCap) } : a))
                          );
                          showToast(`อัปเดตขีดความจุของ ${agent.name} เป็น ${newCap} งาน`);
                        }
                      }}
                      className="text-red-700 hover:text-red-800 font-bold hover:underline cursor-pointer"
                    >
                      ปรับขีดความจุงาน
                    </button>
                    <span className="text-[11px] text-slate-400">สถานะ: พร้อมรับงาน</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SLA Policies */}
      {activeTab === 'sla' && (
        <div className="mt-6 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              นโยบายข้อตกลงระดับการให้บริการ (SLA Service Level Agreement)
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              กำหนดเป้าหมายเวลาตอบสนองครั้งแรก (First Response) และเวลาแก้ปัญหาเสร็จสิ้น (Resolution Target) ตามระดับความสำคัญ ITIL
            </p>

            <div className="space-y-4">
              {slaPolicies.map((policy, idx) => (
                <div
                  key={policy.priority}
                  className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-bold ${
                          policy.priority.includes('P1')
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : policy.priority.includes('P2')
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {policy.priority}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{policy.description}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">เวลาตอบสนองแรก</span>
                      <div className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <input
                          type="number"
                          value={policy.responseTimeMinutes}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSlaPolicies((prev) =>
                              prev.map((p, i) => (i === idx ? { ...p, responseTimeMinutes: val } : p))
                            );
                          }}
                          className="w-16 rounded border border-slate-300 bg-white px-2 py-1 text-center font-bold text-slate-800 focus:border-red-500 focus:outline-hidden"
                        />
                        <span>นาที</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">เวลาแก้ไขเสร็จสิ้น</span>
                      <div className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <input
                          type="number"
                          value={policy.resolutionTimeHours}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSlaPolicies((prev) =>
                              prev.map((p, i) => (i === idx ? { ...p, resolutionTimeHours: val } : p))
                            );
                          }}
                          className="w-16 rounded border border-slate-300 bg-white px-2 py-1 text-center font-bold text-slate-800 focus:border-red-500 focus:outline-hidden"
                        />
                        <span>ชั่วโมง</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => showToast(`บันทึกการตั้งค่านโยบาย ${policy.priority} เรียบร้อย`)}
                      className="rounded-lg bg-slate-200 hover:bg-slate-300 px-3 py-1.5 font-bold text-slate-700 cursor-pointer text-xs mt-3 sm:mt-0"
                    >
                      บันทึก
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Integrations */}
      {activeTab === 'integrations' && (
        <div className="mt-6 space-y-5">
          {/* Opsgenie Integration */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-100 p-2.5 text-red-600">
                  <AlertOctagon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">การเชื่อมต่อแจ้งเตือนเหตุวิกฤต Opsgenie</h3>
                  <p className="text-xs text-slate-500">โทรแจ้งเตือน On-call ทันทีเมื่อเกิดเคสระดับ P1 วิกฤต</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemConfig.opsgenieEnabled}
                  onChange={(e) => {
                    setSystemConfig((prev) => ({ ...prev, opsgenieEnabled: e.target.checked }));
                    showToast(e.target.checked ? 'เปิดใช้งาน Opsgenie เรียบร้อย' : 'ปิดใช้งาน Opsgenie');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
              </label>
            </div>
            <div className="text-xs space-y-1">
              <label className="font-semibold text-slate-700">Opsgenie API Key / Webhook URL</label>
              <input
                type="text"
                value={systemConfig.opsgenieApiKey}
                onChange={(e) => setSystemConfig((prev) => ({ ...prev, opsgenieApiKey: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 focus:border-red-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Slack Integration */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-2.5 text-purple-600">
                  <BellRing className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">การแจ้งเตือน Slack Channel</h3>
                  <p className="text-xs text-slate-500">ส่งข้อความเตือนเมื่อมีการสร้างตั๋วใหม่หรือสถานะตั๋วเปลี่ยน</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemConfig.slackEnabled}
                  onChange={(e) => {
                    setSystemConfig((prev) => ({ ...prev, slackEnabled: e.target.checked }));
                    showToast(e.target.checked ? 'เปิดใช้งาน Slack Alerts' : 'ปิดใช้งาน Slack Alerts');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
              </label>
            </div>
            <div className="text-xs space-y-1">
              <label className="font-semibold text-slate-700">ชื่อช่องทาง Slack (Target Channel)</label>
              <input
                type="text"
                value={systemConfig.slackChannel}
                onChange={(e) => setSystemConfig((prev) => ({ ...prev, slackChannel: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-red-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Organization & Theme */}
      {activeTab === 'organization' && (
        <div className="mt-6 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">ข้อมูลทั่วไปของหน่วยงานสนับสนุนไอที</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">ชื่อองค์กร / ฝ่ายสนับสนุน</label>
                <input
                  type="text"
                  value={systemConfig.orgName}
                  onChange={(e) => setSystemConfig((prev) => ({ ...prev, orgName: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-red-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">อีเมลส่วนกลางฝ่ายสนับสนุน (Helpdesk Email)</label>
                <input
                  type="email"
                  value={systemConfig.helpdeskEmail}
                  onChange={(e) => setSystemConfig((prev) => ({ ...prev, helpdeskEmail: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-red-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-semibold text-slate-700">เวลาทำการมาตรฐาน (Business Hours)</label>
                <input
                  type="text"
                  value={systemConfig.operatingHours}
                  onChange={(e) => setSystemConfig((prev) => ({ ...prev, operatingHours: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-red-500 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Corporate Theme Preview */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="font-bold text-xs text-slate-900 mb-2">ธีมและโทนสีองค์กร (Corporate Identity)</h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                  <div className="h-6 w-6 rounded-full bg-red-600 border-2 border-white shadow-xs" />
                  <span className="text-xs font-bold text-slate-800">สีแดงองค์กร (#DC2626)</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                  <div className="h-6 w-6 rounded-full bg-white border-2 border-slate-300 shadow-xs" />
                  <span className="text-xs font-bold text-slate-800">สีขาวสะอาดตา (#FFFFFF / #FAFAFA)</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => showToast('บันทึกข้อมูลองค์กรเรียบร้อยแล้ว')}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 cursor-pointer"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: เพิ่มประเภทคำขอใหม่ */}
      {isAddTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 font-sans animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-red-600" />
                <span>เพิ่มประเภทคำขอไอทีใหม่ (New Request Type)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddTypeModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddRequestType} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ชื่อประเภทคำขอ *</label>
                <input
                  type="text"
                  required
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="เช่น ขอสิทธิ์เข้าถึง Tableau หรือ ขอเปลี่ยนจอภาพใหม่..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">หมวดหมู่ ITIL *</label>
                  <select
                    value={newTypeCategory}
                    onChange={(e) => setNewTypeCategory(e.target.value as TicketCategory)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 font-medium focus:border-red-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="service_request">คำขอบริการ (Service Request)</option>
                    <option value="incident">เหตุขัดข้อง (Incident)</option>
                    <option value="problem">ปัญหาเชิงระบบ (Problem)</option>
                    <option value="change">ขอเปลี่ยนแปลงระบบ (Change)</option>
                    <option value="post_incident_review">ทบทวนหลังเกิดเหตุ (PIR)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ความสำคัญเริ่มต้น</label>
                  <select
                    value={newTypePriority}
                    onChange={(e) => setNewTypePriority(e.target.value as Priority)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 font-medium focus:border-red-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="P1 - วิกฤต">P1 - วิกฤต</option>
                    <option value="P2 - สูง">P2 - สูง</option>
                    <option value="P3 - ปานกลาง">P3 - ปานกลาง</option>
                    <option value="P4 - ต่ำ">P4 - ต่ำ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">เป้าหมายเวลา SLA (ชั่วโมง)</label>
                  <input
                    type="number"
                    min={1}
                    value={newTypeSlaHours}
                    onChange={(e) => setNewTypeSlaHours(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">สังกัดทีมรับผิดชอบ</label>
                  <input
                    type="text"
                    value={newTypeDept}
                    onChange={(e) => setNewTypeDept(e.target.value)}
                    placeholder="ฝ่ายบริการช่วยเหลือไอที"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">คำอธิบายและคำแนะนำสำหรับผู้ใช้</label>
                <textarea
                  rows={2}
                  value={newTypeDescription}
                  onChange={(e) => setNewTypeDescription(e.target.value)}
                  placeholder="ระบุสิ่งที่ผู้แจ้งจะได้รับและขั้นตอนเบื้องต้น..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-red-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddTypeModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-red-700 cursor-pointer"
                >
                  บันทึกประเภทคำขอ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: เพิ่มสมาชิกทีมไอทีใหม่ */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 font-sans animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-red-600" />
                <span>เพิ่มสมาชิกทีมวิศวกรไอที (New IT Member)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddMemberModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddAgent} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ชื่อ - นามสกุล *</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="เช่น นฤมล เกษมสุข"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">อีเมลองค์กร *</label>
                  <input
                    type="email"
                    required
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="narumon.k@enterprise.co.th"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ตำแหน่ง / บทบาท *</label>
                  <input
                    type="text"
                    required
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    placeholder="วิศวกรระบบความปลอดภัยอาวุโส"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">สังกัดฝ่าย / แผนก</label>
                  <select
                    value={newMemberDept}
                    onChange={(e) => setNewMemberDept(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 font-medium focus:border-red-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="ฝ่ายบริการช่วยเหลือไอที">ฝ่ายบริการช่วยเหลือไอที</option>
                    <option value="ฝ่ายโครงสร้างพื้นฐานไอที">ฝ่ายโครงสร้างพื้นฐานไอที</option>
                    <option value="ฝ่ายความปลอดภัยไซเบอร์">ฝ่ายความปลอดภัยไซเบอร์</option>
                    <option value="ฝ่ายบริหารจัดการสิทธิ์เข้าถึง">ฝ่ายบริหารจัดการสิทธิ์เข้าถึง</option>
                    <option value="ฝ่ายวิศวกรรมแพลตฟอร์ม">ฝ่ายวิศวกรรมแพลตฟอร์ม</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ขีดความจุงานสูงสุด (งาน)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newMemberCapacity}
                    onChange={(e) => setNewMemberCapacity(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-red-700 cursor-pointer"
                >
                  เพิ่มสมาชิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
