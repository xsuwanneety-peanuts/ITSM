import React from 'react';
import {
  Search,
  Plus,
  HelpCircle,
  Bell,
  MessageSquare,
  ShieldCheck,
  User,
  SlidersHorizontal,
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onCreateTicketClick: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  portalMode: 'agent' | 'customer';
  setPortalMode: (mode: 'agent' | 'customer') => void;
  totalOpenTickets: number;
  breachedSlaCount: number;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onCreateTicketClick,
  searchQuery,
  setSearchQuery,
  portalMode,
  setPortalMode,
  totalOpenTickets,
  breachedSlaCount,
  onToggleSidebar,
}) => {
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getViewLabel = (view: string) => {
    switch (view) {
      case 'summary': return 'ภาพรวม (Summary)';
      case 'queues': return 'คิวงาน (Queues)';
      case 'service_requests': return 'คำขอบริการ (Service Requests)';
      case 'incidents': return 'เหตุขัดข้อง (Incidents)';
      case 'workforce': return 'กำลังพล (Workforce)';
      case 'reports': return 'รายงานสถิติ (Reports)';
      case 'operations': return 'ขออนุมัติการเปลี่ยนแปลง (Operations)';
      case 'knowledge_base': return 'ฐานความรู้ไอที (Knowledge Base)';
      default: return view;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-2xs">
      {/* Left side: Mobile menu toggle, Breadcrumb & Context */}
      <div className="flex items-center gap-2.5">
        {portalMode === 'agent' && onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden rounded-md p-1.5 text-slate-600 hover:bg-red-50 hover:text-red-700"
            title="เปิด/ปิด แถบเมนู"
            aria-label="เปิด/ปิด แถบเมนู"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        )}

        <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-none">
          <span className="hover:text-red-600 cursor-pointer hidden sm:inline">พื้นที่ระบบ</span>
          <span className="mx-2 text-slate-300 hidden sm:inline">/</span>
          <span className="font-semibold text-slate-800">ฝ่ายสนับสนุนไอที</span>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-red-600 font-bold truncate">
            {portalMode === 'customer' ? 'พอร์ทัลบริการตนเอง' : getViewLabel(currentView)}
          </span>
        </nav>

        {breachedSlaCount > 0 && (
          <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700 border border-red-200 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
            {breachedSlaCount} เคสเกินกำหนด SLA
          </span>
        )}
      </div>

      {/* Middle: Fast Search */}
      <div className="relative hidden lg:block w-80 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาตั๋ว, รายละเอียด, รหัส SUP-... (Ctrl+K)"
          className="w-full rounded-md border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-12 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-red-500 transition-all"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-2xs">
          ⌘K
        </kbd>
      </div>

      {/* Right side: Mode Switcher, Quick Create, Actions */}
      <div className="flex items-center gap-2.5">
        {/* Toggle Mode: Agent Workspace vs Customer Portal */}
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100/90 text-xs">
          <button
            type="button"
            onClick={() => setPortalMode('agent')}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
              portalMode === 'agent'
                ? 'bg-white text-red-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            เจ้าหน้าที่ไอที
          </button>
          <button
            type="button"
            onClick={() => setPortalMode('customer')}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
              portalMode === 'customer'
                ? 'bg-white text-red-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ผู้ใช้งานทั่วไป
          </button>
        </div>

        {/* Create Work Item (Corporate Red Primary Button) */}
        <button
          type="button"
          onClick={onCreateTicketClick}
          className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:bg-red-800 transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.8]" />
          <span>สร้างงานใหม่</span>
        </button>

        {/* Notifications & User Avatar */}
        <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
          <button
            type="button"
            className="relative rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700 transition-colors"
            title="การแจ้งเตือน"
            aria-label="การแจ้งเตือน"
          >
            <Bell className="h-4 w-4" />
            {totalOpenTickets > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600" />
            )}
          </button>

          {/* User profile avatar */}
          <div className="ml-1 flex items-center gap-2 pl-1" title="ศศิธร เชน (IT Operations Lead)">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
              alt="ศศิธร เชน"
              className="h-7 w-7 rounded-full border-2 border-red-500 object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
