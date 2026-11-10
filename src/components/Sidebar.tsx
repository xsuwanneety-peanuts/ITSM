import React from 'react';
import {
  LifeBuoy,
  LayoutDashboard,
  Inbox,
  AlertOctagon,
  Users2,
  BarChart3,
  GitPullRequest,
  BookOpen,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Settings,
  Activity,
  Bot,
} from 'lucide-react';

export type NavItem =
  | 'summary'
  | 'queues'
  | 'service_requests'
  | 'incidents'
  | 'workforce'
  | 'reports'
  | 'operations'
  | 'knowledge_base'
  | 'monitoring'
  | 'ai_portal'
  | 'settings';

interface SidebarProps {
  activeNav: NavItem;
  setActiveNav: (nav: NavItem) => void;
  openIncidentsCount: number;
  openTicketsCount: number;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  setActiveNav,
  openIncidentsCount,
  openTicketsCount,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  onMobileClose,
}) => {

  const handleNavSelect = (nav: NavItem) => {
    setActiveNav(nav);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-2xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 md:z-10 flex flex-col border-r border-slate-200 bg-white text-slate-700 transition-all duration-200 select-none ${
          isMobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-16' : 'md:w-64 md:min-w-[256px]'}`}
      >
        {/* Collapse Toggle Handle */}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          title="ดับเบิลคลิกเพื่อย่อแถบเมนู (Ctrl + [)"
          aria-label={isCollapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'}
          className="absolute -right-3 top-16 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 shadow-xs hover:border-red-400 hover:text-red-600 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        {/* Project Header - White & Corporate Red theme */}
        <div className="flex h-14 items-center justify-between border-b border-slate-200/80 px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-600 text-white shadow-xs">
              <LifeBuoy className="h-4.5 w-4.5 stroke-[2.2]" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm tracking-tight truncate">ฝ่ายสนับสนุนไอที</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-none truncate">ITSM Service Desk</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 text-[13px] font-medium text-slate-700">
          {/* เริ่มต้นใช้งาน */}
          <button
            type="button"
            onClick={() => handleNavSelect('summary')}
            className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-red-50/50 hover:text-red-700 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="เริ่มต้นใช้งาน (Get started)"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-slate-400" />
            {!isCollapsed && <span className="text-slate-600">เริ่มต้นใช้งาน</span>}
          </button>

          {/* ภาพรวม (Summary) - Active State in Corporate Red */}
          <button
            type="button"
            onClick={() => handleNavSelect('summary')}
            className={`relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left font-semibold transition-colors ${
              activeNav === 'summary'
                ? 'bg-red-50 text-red-700 font-bold'
                : 'text-slate-700 hover:bg-slate-100/80'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="ภาพรวม (Summary)"
          >
            {activeNav === 'summary' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-red-600" />
            )}
            <LayoutDashboard
              className={`h-4 w-4 shrink-0 ${activeNav === 'summary' ? 'text-red-600' : 'text-slate-500'}`}
            />
            {!isCollapsed && <span>ภาพรวม (Summary)</span>}
          </button>

          {/* คิวงาน (Queues) */}
          <button
            type="button"
            onClick={() => handleNavSelect('queues')}
            className={`relative flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors ${
              activeNav === 'queues'
                ? 'bg-red-50 text-red-700 font-bold'
                : 'text-slate-700 hover:bg-slate-100/80'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="คิวงาน (Queues)"
          >
            {activeNav === 'queues' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-red-600" />
            )}
            <div className="flex items-center gap-2.5 truncate">
              <Inbox
                className={`h-4 w-4 shrink-0 ${activeNav === 'queues' ? 'text-red-600' : 'text-slate-500'}`}
              />
              {!isCollapsed && <span className="truncate">คิวงาน (Queues)</span>}
            </div>
            {!isCollapsed && (
              <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                {openTicketsCount}
              </span>
            )}
          </button>

          <div className="my-2 border-t border-slate-200/70" />

          {/* คำขอบริการ (Service Requests) */}
          <button
            type="button"
            onClick={() => handleNavSelect('service_requests')}
            className={`relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors ${
              activeNav === 'service_requests'
                ? 'bg-red-50 text-red-700 font-bold'
                : 'text-slate-700 hover:bg-slate-100/80'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="คำขอบริการ (Service requests)"
          >
            {activeNav === 'service_requests' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-red-600" />
            )}
            <Inbox
              className={`h-4 w-4 shrink-0 ${activeNav === 'service_requests' ? 'text-red-600' : 'text-slate-500'}`}
            />
            {!isCollapsed && <span>คำขอบริการ</span>}
          </button>

          {/* เหตุขัดข้อง (Incidents) */}
          <button
            type="button"
            onClick={() => handleNavSelect('incidents')}
            className={`relative flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors ${
              activeNav === 'incidents'
                ? 'bg-red-50 text-red-700 font-bold'
                : 'text-slate-700 hover:bg-slate-100/80'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="เหตุขัดข้อง (Incidents)"
          >
            {activeNav === 'incidents' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-red-600" />
            )}
            <div className="flex items-center gap-2.5 truncate">
              <AlertOctagon
                className={`h-4 w-4 shrink-0 ${activeNav === 'incidents' ? 'text-red-600' : 'text-red-500'}`}
              />
              {!isCollapsed && <span className="truncate">เหตุขัดข้อง</span>}
            </div>
            {!isCollapsed && openIncidentsCount > 0 && (
              <span className="ml-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {openIncidentsCount}
              </span>
            )}
          </button>

          {/* กำลังพล (Workforce) */}
          <button
            type="button"
            onClick={() => handleNavSelect('workforce')}
            className={`relative flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors ${
              activeNav === 'workforce'
                ? 'bg-red-50 text-red-700 font-bold'
                : 'text-slate-700 hover:bg-slate-100/80'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="กำลังพล (Workforce)"
          >
            {activeNav === 'workforce' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-red-600" />
            )}
            <div className="flex items-center gap-2.5 truncate">
              <Users2
                className={`h-4 w-4 shrink-0 ${activeNav === 'workforce' ? 'text-red-600' : 'text-slate-500'}`}
              />
              {!isCollapsed && <span className="truncate">กำลังพล (Workforce)</span>}
            </div>
            {!isCollapsed && (
              <span className="ml-1 rounded-sm bg-red-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-800">
                ใหม่
              </span>
            )}
          </button>

          {/* รายงาน (Reports) */}
          <button
            type="button"
            onClick={() => handleNavSelect('reports')}
            className={`relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors ${
              activeNav === 'reports'
                ? 'bg-red-50 text-red-700 font-bold'
                : 'text-slate-700 hover:bg-slate-100/80'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="รายงานสถิติ (Reports)"
          >
            {activeNav === 'reports' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-red-600" />
            )}
            <BarChart3
              className={`h-4 w-4 shrink-0 ${activeNav === 'reports' ? 'text-red-600' : 'text-slate-500'}`}
            />
            {!isCollapsed && <span>รายงานสถิติ</span>}
          </button>

          {/* การเปลี่ยนแปลงระบบ (Operations / CAB) */}
          <button
            type="button"
            onClick={() => handleNavSelect('operations')}
            className={`relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors ${
              activeNav === 'operations'
                ? 'bg-red-50 text-red-700 font-bold'
                : 'text-slate-700 hover:bg-slate-100/80'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="การจัดการการเปลี่ยนแปลง (Change Management)"
          >
            {activeNav === 'operations' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-red-600" />
            )}
            <GitPullRequest
              className={`h-4 w-4 shrink-0 ${activeNav === 'operations' ? 'text-red-600' : 'text-slate-500'}`}
            />
            {!isCollapsed && <span>ขออนุมัติการเปลี่ยนแปลง</span>}
          </button>

          {/* ฐานความรู้ (Knowledge Base) */}
          <button
            type="button"
            onClick={() => handleNavSelect('knowledge_base')}
            className={`relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors ${
              activeNav === 'knowledge_base'
                ? 'bg-red-50 text-red-700 font-bold'
                : 'text-slate-700 hover:bg-slate-100/80'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="ฐานความรู้ไอที (Knowledge Base)"
          >
            {activeNav === 'knowledge_base' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-red-600" />
            )}
            <BookOpen
              className={`h-4 w-4 shrink-0 ${activeNav === 'knowledge_base' ? 'text-red-600' : 'text-slate-500'}`}
            />
            {!isCollapsed && <span>ฐานความรู้ไอที</span>}
          </button>

          {/* การเฝ้าระวัง & API Health Check */}
          <button
            type="button"
            onClick={() => handleNavSelect('monitoring')}
            className={`relative flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors ${
              activeNav === 'monitoring'
                ? 'bg-red-50 text-red-700 font-bold'
                : 'text-slate-700 hover:bg-slate-100/80'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="เฝ้าระวัง & ตรวจสอบ API (Noti Monitoring & API Health Check)"
          >
            {activeNav === 'monitoring' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-red-600" />
            )}
            <div className="flex items-center gap-2.5 truncate">
              <Activity
                className={`h-4 w-4 shrink-0 ${activeNav === 'monitoring' ? 'text-red-600' : 'text-slate-500'}`}
              />
              {!isCollapsed && <span className="truncate">เฝ้าระวัง & API Health</span>}
            </div>
            {!isCollapsed && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                1 แจ้งเตือน
              </span>
            )}
          </button>

          {/* ศูนย์บริการ AI (AI Request & Portal) */}
          <button
            type="button"
            onClick={() => handleNavSelect('ai_portal')}
            className={`relative flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors ${
              activeNav === 'ai_portal'
                ? 'bg-red-50 text-red-700 font-bold'
                : 'text-slate-700 hover:bg-slate-100/80'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="ศูนย์บริการ AI (AI Request & AI Portal)"
          >
            {activeNav === 'ai_portal' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-red-600" />
            )}
            <div className="flex items-center gap-2.5 truncate">
              <Bot
                className={`h-4 w-4 shrink-0 ${activeNav === 'ai_portal' ? 'text-red-600' : 'text-slate-500'}`}
              />
              {!isCollapsed && <span className="truncate">ศูนย์บริการ AI (AI Portal)</span>}
            </div>
            {!isCollapsed && (
              <span className="ml-1 rounded-sm bg-red-600 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-white">
                AI
              </span>
            )}
          </button>

          {/* ตั้งค่าระบบ (Settings) */}
          <button
            type="button"
            onClick={() => handleNavSelect('settings')}
            className={`relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors ${
              activeNav === 'settings'
                ? 'bg-red-50 text-red-700 font-bold'
                : 'text-slate-700 hover:bg-slate-100/80'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="ตั้งค่าระบบ (Settings)"
          >
            {activeNav === 'settings' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-red-600" />
            )}
            <Settings
              className={`h-4 w-4 shrink-0 ${activeNav === 'settings' ? 'text-red-600' : 'text-slate-500'}`}
            />
            {!isCollapsed && <span>ตั้งค่าระบบ</span>}
          </button>


        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="border-t border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-500 space-y-1">
            <div className="flex items-center justify-between text-slate-700 hover:text-red-600 cursor-pointer">
              <span className="font-semibold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                ระบบไอทีพร้อมให้บริการ (99.98%)
              </span>
              <ExternalLink className="h-3 w-3" />
            </div>
            <div className="text-[11px] text-slate-400">มาตรฐาน ITIL Service Management</div>
          </div>
        )}
      </aside>
    </>
  );
};
