import React, { useState } from 'react';
import {
  Search,
  HelpCircle,
  UserX,
  Wifi,
  Shield,
  Key,
  UserPlus,
  Briefcase,
  Package,
  Laptop,
  Mail,
  Smartphone,
  AlertTriangle,
  HardDrive,
  GitPullRequest,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { REQUEST_TYPE_DEFINITIONS } from '../data/seedData.ts';
import { Ticket, TicketCategory, Priority } from '../types/itsm.ts';

interface CustomerPortalViewProps {
  onTicketSubmitted: (ticket: Ticket) => void;
  mySubmittedTickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  onTicketSubmitted,
  mySubmittedTickets,
  onSelectTicket,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRequestType, setSelectedRequestType] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'HelpCircle': return <HelpCircle className="h-5 w-5 text-red-600" />;
      case 'UserX': return <UserX className="h-5 w-5 text-amber-600" />;
      case 'Wifi': return <Wifi className="h-5 w-5 text-emerald-600" />;
      case 'Shield': return <Shield className="h-5 w-5 text-red-700" />;
      case 'Key': return <Key className="h-5 w-5 text-purple-600" />;
      case 'UserPlus': return <UserPlus className="h-5 w-5 text-rose-600" />;
      case 'Briefcase': return <Briefcase className="h-5 w-5 text-red-800" />;
      case 'Package': return <Package className="h-5 w-5 text-pink-600" />;
      case 'Laptop': return <Laptop className="h-5 w-5 text-slate-800" />;
      case 'Mail': return <Mail className="h-5 w-5 text-slate-700" />;
      case 'Smartphone': return <Smartphone className="h-5 w-5 text-red-600" />;
      case 'AlertTriangle': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'HardDrive': return <HardDrive className="h-5 w-5 text-red-500" />;
      case 'GitPullRequest': return <GitPullRequest className="h-5 w-5 text-amber-600" />;
      default: return <HelpCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const filteredItems = REQUEST_TYPE_DEFINITIONS.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedRequestType) return;

    const def = REQUEST_TYPE_DEFINITIONS.find((d) => d.name === selectedRequestType);
    const category = (def?.category || 'service_request') as TicketCategory;
    const priority = (def?.defaultPriority || 'P3 - ปานกลาง') as Priority;

    const newTicket: Ticket = {
      id: `t-${Date.now()}`,
      key: `SUP-${Math.floor(200 + Math.random() * 800)}`,
      title: title.trim(),
      description: description.trim() || `คำร้องขอบริการตนเองสำหรับ ${selectedRequestType}`,
      category,
      requestType: selectedRequestType,
      status: 'เปิดใหม่',
      priority,
      urgency: 'Medium',
      impact: 'Medium',
      assignee: null,
      reporter: {
        name: 'อเล็กซานเดอร์ รอย (คุณ)',
        email: 'alexandre.roy@company.co.th',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        department: 'ฝ่ายปฏิบัติการทั่วไป',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      slaRemainingMinutes: def?.defaultSlaHours ? def.defaultSlaHours * 60 : 480,
      slaTargetMinutes: def?.defaultSlaHours ? def.defaultSlaHours * 60 : 480,
      comments: [],
      tags: ['portal', selectedRequestType.toLowerCase().replace(/\s+/g, '-')],
    };

    onTicketSubmitted(newTicket);
    setSubmittedSuccess(true);
    setTitle('');
    setDescription('');
    setTimeout(() => {
      setSelectedRequestType(null);
      setSubmittedSuccess(false);
    }, 1800);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAFA] pb-16 font-sans">
      {/* Hero Banner with Corporate White & Red Accents */}
      <div className="border-b border-slate-200 bg-white py-12 px-8 text-center shadow-2xs">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 mb-3">
          ฝ่ายสนับสนุนและบริการไอทีองค์กร
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          IT Service Center
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
          ต้องการความช่วยเหลือด้านไอที ขอสิทธิ์ซอฟต์แวร์ อุปกรณ์ หรือแจ้งปัญหาระบบ เลือกรายการด้านล่างนี้ได้ทันที
        </p>

        {/* Global Search Bar */}
        <div className="relative mx-auto mt-6 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาบริการ, ซอฟต์แวร์, บัญชีผู้ใช้, อุปกรณ์ไอที..."
            className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-800 shadow-xs placeholder-slate-400 focus:border-red-500 focus:outline-hidden focus:ring-2 focus:ring-red-100 transition-all"
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Request Form Dialog if selected */}
        {selectedRequestType && (
          <div className="mb-10 rounded-2xl border border-red-200 bg-white p-6 shadow-md transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-slate-900 text-base">{selectedRequestType}</span>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
                  ยื่นคำขอใหม่
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequestType(null)}
                className="text-xs text-slate-400 hover:text-red-700 font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>

            {submittedSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2 animate-bounce" />
                <h3 className="font-bold text-slate-900 text-sm">ส่งคำขอเรียบร้อยแล้ว!</h3>
                <p className="text-xs text-slate-500 mt-1">วิศวกรไอทีได้รับเรื่องและเริ่มนับเวลา SLA แล้วครับ</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    หัวเรื่องคำขอของคุณ <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="สรุปปัญหาหรือความต้องการของคุณโดยย่อ"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ระบุรายละเอียดเพิ่มเติม</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="โปรดระบุชื่อโปรแกรม รหัสเครื่อง หมายเลขโต๊ะทำงาน หรือเหตุผลความจำเป็น..."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRequestType(null)}
                    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-red-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-red-700 cursor-pointer"
                  >
                    ส่งคำขอรับบริการ
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Section: Service Request Catalog (matching image 2 types) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">แคตตาล็อกคำขอบริการไอที (Service Request Catalog)</h2>
            <span className="text-xs text-slate-400">บริการมาตรฐานพร้อมรับประกันเวลาแก้ไข (SLA)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems
              .filter((item) => item.category === 'service_request')
              .map((item) => (
                <div
                  key={item.name}
                  onClick={() => setSelectedRequestType(item.name)}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-red-400 hover:shadow-xs cursor-pointer transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-red-50 p-2.5 border border-red-100 group-hover:bg-red-100 transition-colors">
                      {getIcon(item.icon)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs group-hover:text-red-700 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-medium">
                    <span>เป้าหมาย SLA: แก้ไขภายใน {item.defaultSlaHours} ชม.</span>
                    <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Section: Report Incidents & Problems (matching image 2) */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>แจ้งปัญหาระบบหรืออุปกรณ์ชำรุดเสียหาย (Incidents)</span>
            </h2>
            <span className="text-xs text-red-600 font-bold">ช่องทางเร่งด่วน P1/P2</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems
              .filter((item) => item.category === 'incident')
              .map((item) => (
                <div
                  key={item.name}
                  onClick={() => setSelectedRequestType(item.name)}
                  className="group flex flex-col justify-between rounded-2xl border border-red-200 bg-white p-4 shadow-2xs hover:border-red-400 hover:shadow-xs cursor-pointer transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-red-50 p-2.5 border border-red-100 group-hover:bg-red-100 transition-colors">
                      {getIcon(item.icon)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs group-hover:text-red-700 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-red-100 pt-2 text-[10px] text-red-700 font-bold">
                    <span>การตอบสนองเร่งด่วน: {item.defaultPriority}</span>
                    <span className="flex items-center gap-1">แจ้งเรื่องทันที &rarr;</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* User's recent requests */}
        {mySubmittedTickets.length > 0 && (
          <div className="mt-12 border-t border-slate-200 pt-8">
            <h3 className="text-sm font-bold text-slate-900 mb-3">คำขอที่คุณส่งไปล่าสุด</h3>
            <div className="space-y-2">
              {mySubmittedTickets.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTicket(t)}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 hover:border-red-400 cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-red-700">{t.key}</span>
                    <span className="font-medium text-slate-800">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-700">
                      {t.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
