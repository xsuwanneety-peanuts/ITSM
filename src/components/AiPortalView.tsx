import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Users2,
  ListChecks,
  RefreshCw,
  Lightbulb,
  MessageSquare,
  BarChart3,
  Check,
  Plus,
  HelpCircle,
  Clock,
  Flame,
} from 'lucide-react';
import { Ticket, TicketCategory, Priority, Urgency, Impact, Agent, AiTriageResult } from '../types/itsm.ts';

interface AiPortalViewProps {
  agents: Agent[];
  onCreateTicketFromAi: (ticket: Ticket) => void;
  onNavigateToQueues?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SAMPLE_SCENARIOS = [
  {
    label: '🌐 VPN สำนักงานหลุดบ่อย SSH ไม่ได้',
    text: 'สัญญาณ VPN ออฟฟิศกรุงเทพฯ ขาดหายบ่อยมาก วิศวกรที่ทำงานจากบ้านไม่สามารถ SSH เข้าเซิร์ฟเวอร์ staging ได้เลย มีผลกระทบทีมพัฒนา 15 คน',
    department: 'ฝ่ายวิศวกรรมระบบหลัก',
  },
  {
    label: '🔑 ขอสิทธิ์แอดมิน AWS ชั่วคราว 2 วัน',
    text: 'ต้องการขอสิทธิ์ Administrator เข้าจัดการ AWS Production Cloud Run และ S3 เป็นเวลา 48 ชั่วโมง เพื่ออัปเกรดฐานข้อมูลประจำเดือน',
    department: 'ฝ่ายวิศวกรรมแพลตฟอร์ม',
  },
  {
    label: '📺 จอภาพและไมค์ Neat Bar ห้องประชุมบอร์ดรูมไม่ติด',
    text: 'ห้องประชุมบอร์ดบริหาร 4B จอทีวีเปิดไม่ติด และไมโครโฟน Neat Bar ไม่มีไฟสถานะ ผู้บริหารกำลังจะมีการประชุมใหญ่ในอีก 30 นาที',
    department: 'สำนักประธานเจ้าหน้าที่บริหาร',
  },
  {
    label: '💻 ขอเบิก MacBook Pro สำหรับพนักงานใหม่',
    text: 'มี Senior Software Engineer เริ่มงานจันทร์หน้า ต้องการขอเบิกเครื่องคอมพิวเตอร์ MacBook Pro M3 Max พร้อมจอต่อพ่วง 4K และแท่นวาง',
    department: 'ฝ่ายบริหารทรัพยากรบุคคล',
  },
];

export const AiPortalView: React.FC<AiPortalViewProps> = ({
  agents,
  onCreateTicketFromAi,
  onNavigateToQueues,
}) => {
  const [activeTab, setActiveTab] = useState<'triage' | 'chat' | 'metrics'>('triage');

  // Triage state
  const [inputText, setInputText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ฝ่ายวิศวกรรมระบบหลัก');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState<AiTriageResult | null>(null);
  const [ticketCreatedSuccess, setTicketCreatedSuccess] = useState<string | null>(null);

  // Chatbot state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      role: 'assistant',
      content:
        'สวัสดีครับ! ผมคือ **AI IT Helpdesk Assistant** ยินดีช่วยเหลือและตอบคำถามด้านไอที ไม่ว่าจะเป็นการตั้งค่า VPN, รหัสผ่าน, สิทธิ์การใช้งาน, หรือการแก้ไขปัญหาคอมพิวเตอร์เบื้องต้น มีอะไรให้ผมช่วยเหลือวันนี้ครับ?',
      timestamp: 'เมื่อสักครู่',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Analyze request handler
  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setTriageResult(null);
    setTicketCreatedSuccess(null);

    try {
      const res = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: inputText,
          userDepartment: selectedDepartment,
        }),
      });

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const data = await res.json();
      setTriageResult(data);
    } catch (err) {
      console.error('Triage failed:', err);
      // Fallback in case of server failure
      setTriageResult({
        category: 'incident',
        requestType: 'แจ้งปัญหาระบบหรือบริการขัดข้อง (Report a system problem)',
        priority: 'P2 - สูง',
        urgency: 'High',
        impact: 'High',
        title: inputText.slice(0, 45) + '...',
        summary: 'ตรวจพบปัญหาเร่งด่วนที่กระทบการทำงานของระบบและผู้ใช้หลายราย แนะนำให้วิศวกรเข้าตรวจสอบทันที',
        troubleshootingSteps: [
          'ตรวจสอบสถานะการเชื่อมต่อเครือข่ายและการตั้งค่า DNS',
          'รีสตาร์ตบริการหรือโหนดเครือข่ายที่เกี่ยวข้อง',
          'แจ้งเตือนผู้ใช้งานเกี่ยวกับสถานะการแก้ปัญหา',
        ],
        suggestedAssigneeName: 'สมชาย ประเสริฐ (วิศวกรระบบเครือข่าย)',
        confidenceScore: 0.93,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Convert AI result to actual Ticket in the ITSM system
  const handleCreateTicketFromAnalysis = () => {
    if (!triageResult) return;

    // Match suggested agent if possible
    let assignedAgent = agents[0] || null;
    if (triageResult.suggestedAssigneeName) {
      const matched = agents.find((a) =>
        triageResult.suggestedAssigneeName!.includes(a.name)
      );
      if (matched) assignedAgent = matched;
    }

    const ticketKey = `SUP-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket: Ticket = {
      id: `t-ai-${Date.now()}`,
      key: ticketKey,
      title: triageResult.title || inputText.slice(0, 50),
      description: `${inputText}\n\n[ข้อสรุปจาก AI Triage]\n${triageResult.summary}\n\nขั้นตอนแก้ไขที่แนะนำ:\n${triageResult.troubleshootingSteps
        .map((s, idx) => `${idx + 1}. ${s}`)
        .join('\n')}`,
      category: triageResult.category,
      requestType: triageResult.requestType,
      status: 'เปิดใหม่',
      priority: triageResult.priority,
      urgency: triageResult.urgency,
      impact: triageResult.impact,
      assignee: assignedAgent,
      reporter: {
        name: 'อเล็กซานเดอร์ รอย (ผ่าน AI Portal)',
        email: 'alexandre.r@enterprise.co.th',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        department: selectedDepartment,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      slaRemainingMinutes: triageResult.priority.includes('P1') ? 120 : 480,
      slaTargetMinutes: triageResult.priority.includes('P1') ? 120 : 480,
      tags: ['ai-triaged', 'gemini', triageResult.category],
      comments: [
        {
          id: `c-ai-${Date.now()}`,
          author: 'AI Smart Triage (Gemini)',
          authorRole: 'ระบบคัดกรองอัจฉริยะ',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
          isInternal: true,
          text: `คำขอนี้ถูกจำแนกอัตโนมัติด้วยความเชื่อมั่น ${(
            (triageResult.confidenceScore || 0.95) * 100
          ).toFixed(1)}% ความสำคัญระดับ ${triageResult.priority}`,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    onCreateTicketFromAi(newTicket);
    setTicketCreatedSuccess(ticketKey);
  };

  // Chat message send handler
  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      content: chatInput,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = chatInput;
    setChatInput('');
    setIsChatLoading(true);

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          history: historyPayload,
        }),
      });

      if (!res.ok) throw new Error('Chat failed');

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `m-bot-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'รับทราบข้อมูลเรียบร้อยครับ หากต้องการเปิดตั๋วสามารถแจ้งได้ทันทีครับ',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `m-bot-err-${Date.now()}`,
        role: 'assistant',
        content: `ขออภัยครับ กำลังตรวจสอบข้อมูลให้สำหรับ "${currentInput}" แนะนำตรวจสอบการเชื่อมต่อ หรือใช้ฟังก์ชัน "วิเคราะห์คำขอ AI" ด้านบนเพื่อเปิดตั๋วได้ทันทีครับ`,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getPriorityBadgeClass = (p: string) => {
    if (p.includes('P1')) return 'bg-red-600 text-white';
    if (p.includes('P2')) return 'bg-amber-600 text-white';
    if (p.includes('P3')) return 'bg-blue-600 text-white';
    return 'bg-slate-600 text-white';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                ศูนย์บริการอัจฉริยะ AI Portal & AI Request
              </h1>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700 border border-red-200">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500">
              วิเคราะห์คำขอไอทีอัตโนมัติ (Auto-Triage), ประเมินความสำคัญ P1-P4 ตามมาตรฐาน ITIL และแชตช่วยเหลือ 24 ชม.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs font-semibold shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('triage')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
              activeTab === 'triage'
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>วิเคราะห์และสร้างคำขอ AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
              activeTab === 'chat'
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>AI IT Helpdesk Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
              activeTab === 'metrics'
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>สถิติ AI</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI REQUEST AUTO-TRIAGE */}
      {activeTab === 'triage' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Input Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-red-600" />
                  <h2 className="font-bold text-slate-800 text-sm">
                    กรอกรายละเอียดปัญหาหรือคำขอบริการไอที (AI Smart Triage)
                  </h2>
                </div>
                <span className="text-xs text-slate-400">รองรับภาษาไทยธรรมชาติ</span>
              </div>

              {/* Sample Scenarios Quick Select */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  เลือกตัวอย่างสถานการณ์ทดสอบเร็ว:
                </label>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_SCENARIOS.map((sc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setInputText(sc.text);
                        setSelectedDepartment(sc.department);
                      }}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:border-red-400 hover:bg-red-50/50 hover:text-red-700 transition-colors text-left"
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  รายละเอียดปัญหา (Issue Description):
                </label>
                <textarea
                  rows={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="พิมพ์ข้อความอธิบายปัญหา เช่น 'ระบบเครือข่าย VPN กรุงเทพฯ มีอาการหลุดบ่อย SSH เข้าเซิร์ฟเวอร์ไม่ได้' หรือ 'ขอสิทธิ์ผู้ดูแลระบบ AWS ชั่วคราวเพื่อขึ้นระบบใหม่'..."
                  className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    แผนกหรือสังกัดของผู้แจ้ง:
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-red-500 focus:outline-hidden"
                  >
                    <option value="ฝ่ายวิศวกรรมระบบหลัก">ฝ่ายวิศวกรรมระบบหลัก</option>
                    <option value="ฝ่ายวิศวกรรมแพลตฟอร์ม">ฝ่ายวิศวกรรมแพลตฟอร์ม</option>
                    <option value="สำนักประธานเจ้าหน้าที่บริหาร">สำนักประธานเจ้าหน้าที่บริหาร</option>
                    <option value="ฝ่ายบริหารทรัพยากรบุคคล">ฝ่ายบริหารทรัพยากรบุคคล</option>
                    <option value="ฝ่ายการเงินและบัญชี">ฝ่ายการเงินและบัญชี</option>
                    <option value="ฝ่ายขายและการตลาด">ฝ่ายขายและการตลาด</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !inputText.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:bg-red-800 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>AI กำลังวิเคราะห์ ITIL...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>วิเคราะห์คำขอด้วย AI (Analyze)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Success Banner if ticket created */}
            {ticketCreatedSuccess && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">สร้างตั๋วงาน {ticketCreatedSuccess} สำเร็จแล้ว!</h4>
                    <p className="text-xs text-emerald-700">
                      ตั๋วถูกส่งเข้าคิวงานของฝ่ายไอที พร้อมจัดสรรวิศวกรผู้เชี่ยวชาญตามที่ AI แนะนำเรียบร้อย
                    </p>
                  </div>
                </div>

                {onNavigateToQueues && (
                  <button
                    type="button"
                    onClick={onNavigateToQueues}
                    className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
                  >
                    ดูในคิวงาน →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Analysis Result Column (5 cols) */}
          <div className="lg:col-span-5">
            {triageResult ? (
              <div className="rounded-xl border border-red-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      ผลการวิเคราะห์โดย AI
                    </span>
                  </div>
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">
                    ความเชื่อมั่น {((triageResult.confidenceScore || 0.95) * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Title */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    หัวข้อตั๋วที่ AI สรุปให้:
                  </div>
                  <div className="mt-0.5 font-bold text-slate-900 text-sm leading-snug">
                    {triageResult.title}
                  </div>
                </div>

                {/* Priority & Category Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">หมวดหมู่ (Category):</span>
                    <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 font-bold text-slate-800">
                      {triageResult.category === 'incident'
                        ? 'เหตุขัดข้อง (Incident)'
                        : triageResult.category === 'service_request'
                        ? 'คำขอบริการ (Request)'
                        : triageResult.category === 'change'
                        ? 'การเปลี่ยนแปลง (Change)'
                        : 'ปัญหาเรื้อรัง (Problem)'}
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">ระดับความสำคัญ (Priority):</span>
                    <span className={`rounded-md px-2 py-0.5 font-bold ${getPriorityBadgeClass(triageResult.priority)}`}>
                      {triageResult.priority}
                    </span>
                  </div>
                </div>

                {/* Request Type */}
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">ประเภทคำขอ (Request Type):</span>
                  <span className="font-semibold text-slate-800">{triageResult.requestType}</span>
                </div>

                {/* Rationale */}
                <div className="rounded-lg bg-red-50/50 p-3 border border-red-100 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 font-bold text-red-800 mb-1">
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span>เหตุผลการจัดลำดับความสำคัญ:</span>
                  </div>
                  <p className="leading-relaxed">{triageResult.summary}</p>
                </div>

                {/* Troubleshooting Steps */}
                {triageResult.troubleshootingSteps && triageResult.troubleshootingSteps.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <ListChecks className="h-3.5 w-3.5 text-slate-400" />
                      <span>ขั้นตอนแก้ปัญหาเบื้องต้นที่แนะนำ:</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {triageResult.troubleshootingSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded-md">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Assignee */}
                {triageResult.suggestedAssigneeName && (
                  <div className="flex items-center justify-between text-xs rounded-lg border border-slate-200 bg-white p-2.5">
                    <span className="text-slate-500">วิศวกรผู้เชี่ยวชาญที่แนะนำ:</span>
                    <span className="font-bold text-slate-900">{triageResult.suggestedAssigneeName}</span>
                  </div>
                )}

                {/* Create Ticket CTA */}
                <button
                  type="button"
                  onClick={handleCreateTicketFromAnalysis}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:bg-red-800 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>สร้างตั๋วตามที่ AI วิเคราะห์ทันที (+ สร้างตั๋ว)</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400 h-full min-h-[340px]">
                <Bot className="h-10 w-10 text-slate-300 mb-2" />
                <h3 className="font-bold text-slate-700 text-sm">พร้อมสำหรับการวิเคราะห์ด้วย AI</h3>
                <p className="mt-1 text-xs text-slate-400 max-w-xs">
                  พิมพ์ข้อความปัญหาทางด้านซ้าย หรือคลิกตัวอย่างทดสอบ แล้วกด &quot;วิเคราะห์คำขอด้วย AI&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI IT HELPDESK CHAT */}
      {activeTab === 'chat' && (
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-2xs h-[600px] overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs">AI IT Specialist Assistant</h3>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  พร้อมให้บริการแบบเรียลไทม์ 24/7
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setMessages([
                  {
                    id: 'm-reset',
                    role: 'assistant',
                    content: 'ล้างการสนทนาเรียบร้อยครับ มีปัญหาไอทีเรื่องใดให้ผมช่วยเหลือครับ?',
                    timestamp: 'เมื่อสักครู่',
                  },
                ])
              }
              className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
            >
              ล้างการสนทนา
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 bg-white px-4 py-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">คำถามยอดฮิต:</span>
            {[
              'VPN เข้าไม่ได้ต้องทำอย่างไร?',
              'วิธีรีเซ็ตรหัสผ่านอีเมลบริษัท',
              'ขั้นตอนขอสิทธิ์ Admin ชั่วคราว',
              'อุปกรณ์จอภาพห้องประชุมไม่ติด',
            ].map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setChatInput(qp);
                }}
                className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-2xs">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  {msg.content}
                  <div
                    className={`mt-1 text-[9px] ${
                      msg.role === 'user' ? 'text-red-200' : 'text-slate-400'
                    } text-right`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-white text-[11px] font-bold">
                    User
                  </div>
                )}
              </div>
            ))}

            {isChatLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-500 shadow-2xs flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-red-600" />
                  <span>AI กำลังประมวลผลคำตอบ...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-slate-200 bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="พิมพ์คำถามหรือสอบถามปัญหาไอทีที่นี่... (กด Enter เพื่อส่ง)"
                className="flex-1 rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:bg-red-800 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>ส่ง</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: AI METRICS & INSIGHTS */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold">ความแม่นยำการจัดหมวดหมู่ (Accuracy)</div>
              <div className="mt-2 text-2xl font-black text-slate-900">95.4%</div>
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">เทียบกับการตรวจสอบซ้ำโดยเจ้าหน้าที่</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold">ความเร็วการตอบกลับเฉลี่ย</div>
              <div className="mt-2 text-2xl font-black text-slate-900">0.82 วินาที</div>
              <p className="mt-1 text-[11px] text-slate-400">Gemini 3.8 Flash High Throughput</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold">ตั๋วที่จัดหมวดหมู่ผ่าน AI สัปดาห์นี้</div>
              <div className="mt-2 text-2xl font-black text-red-600">142 ตั๋ว</div>
              <p className="mt-1 text-[11px] text-slate-400">ลดภาระงาน Triage เจ้าหน้าที่ 64%</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold">อัตราแก้ไขได้ทันที (Self-service Deflection)</div>
              <div className="mt-2 text-2xl font-black text-slate-900">38.2%</div>
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">ผู้ใช้แก้ปัญหาสำเร็จจากขั้นตอนแนะนำ</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              สัดส่วนประเภทงานที่ AI ช่วยจำแนกมากที่สุด (Top Triaged Categories)
            </h3>
            <div className="space-y-3">
              {[
                { name: 'การเข้าถึงเครือข่ายและความปลอดภัย VPN / Wi-Fi', pct: 36, count: 51 },
                { name: 'การจัดการสิทธิ์และบัญชีผู้ใช้ (IAM / Okta)', pct: 28, count: 40 },
                { name: 'อุปกรณ์ฮาร์ดแวร์และคอมพิวเตอร์พกพา', pct: 22, count: 31 },
                { name: 'คำขอด้านลิขสิทธิ์ซอฟต์แวร์และการขอเปลี่ยนแปลง', pct: 14, count: 20 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{item.name}</span>
                    <span className="font-mono text-slate-500">
                      {item.count} ตั๋ว ({item.pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-red-600 transition-all duration-500"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
