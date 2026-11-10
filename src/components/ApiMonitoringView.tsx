import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Zap,
  Globe,
  Database,
  Shield,
  Radio,
  ExternalLink,
  Plus,
  Search,
  Bell,
  Check,
  Clock,
  ArrowUpRight,
  Send,
} from 'lucide-react';
import { HealthCheckService, MonitoringAlert, Ticket } from '../types/itsm.ts';

interface ApiMonitoringViewProps {
  services: HealthCheckService[];
  alerts: MonitoringAlert[];
  onOpenCreateTicketForIncident: (preset: {
    title: string;
    description: string;
    category: 'incident';
    priority: 'P1 - วิกฤต' | 'P2 - สูง';
    requestType: string;
    tags: string[];
  }) => void;
  onSelectTicketByKey?: (ticketKey: string) => void;
}

export const ApiMonitoringView: React.FC<ApiMonitoringViewProps> = ({
  services: initialServices,
  alerts: initialAlerts,
  onOpenCreateTicketForIncident,
  onSelectTicketByKey,
}) => {
  const [services, setServices] = useState<HealthCheckService[]>(initialServices);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>(initialAlerts);
  const [isPinging, setIsPinging] = useState(false);
  const [pingedServiceId, setPingedServiceId] = useState<string | null>(null);
  const [alertFilter, setAlertFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState('เมื่อสักครู่');
  const [activeTab, setActiveTab] = useState<'health' | 'noti_stream'>('health');

  // Periodic Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastRefreshedAt(new Date().toLocaleTimeString('th-TH'));
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handlePingAll = () => {
    setIsPinging(true);
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => {
          // slight random jitter to simulate live ping
          const latencyDelta = Math.floor(Math.random() * 9) - 4;
          const newLatency = Math.max(12, s.latencyMs + latencyDelta);
          return {
            ...s,
            latencyMs: s.status === 'degraded' ? s.latencyMs : newLatency,
            lastChecked: 'เมื่อสักครู่',
          };
        })
      );
      setIsPinging(false);
      setLastRefreshedAt(new Date().toLocaleTimeString('th-TH'));
    }, 900);
  };

  const handlePingSingle = (serviceId: string) => {
    setPingedServiceId(serviceId);
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => {
          if (s.id === serviceId) {
            const jitter = Math.floor(Math.random() * 6) - 3;
            return {
              ...s,
              latencyMs: Math.max(14, s.latencyMs + jitter),
              lastChecked: 'เมื่อสักครู่',
            };
          }
          return s;
        })
      );
      setPingedServiceId(null);
    }, 600);
  };

  const handleToggleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: !a.acknowledged } : a))
    );
  };

  const handleSimulateAlert = () => {
    const newAlert: MonitoringAlert = {
      id: `alt-${Date.now()}`,
      timestamp: 'เมื่อสักครู่',
      serviceId: 'svc-1',
      serviceName: 'Core API Gateway',
      severity: 'warning',
      message: `RateLimitWarning: พบอัตราคำขอพุ่งแตะ 2,150 req/s จากซับเน็ตทดสอบ (IP: 192.168.4.11)`,
      source: 'Prometheus',
      acknowledged: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleCreateIncidentFromService = (svc: HealthCheckService) => {
    onOpenCreateTicketForIncident({
      title: `[แจ้งเตือนระบบขัดข้อง] ${svc.name} เกิดปัญหาการตอบสนอง (${svc.statusCode} / ${svc.latencyMs}ms)`,
      description: `ระบบเฝ้าระวังอัตโนมัติพบว่าบริการ ${svc.name} (${svc.serviceKey}) มีสถานะ ${
        svc.status === 'degraded' ? 'ลดทอนประสิทธิภาพ (Degraded)' : 'หยุดการทำงาน (Outage)'
      }\nปลายทาง: ${svc.endpoint}\nภูมิภาค: ${svc.region}\nความหน่วง: ${svc.latencyMs}ms\nรายละเอียด: ${svc.message}`,
      category: 'incident',
      priority: svc.status === 'degraded' ? 'P2 - สูง' : 'P1 - วิกฤต',
      requestType: 'แจ้งปัญหาระบบหรือบริการขัดข้อง (Report a system problem)',
      tags: ['monitoring', 'health-check', svc.category, svc.serviceKey.toLowerCase()],
    });
  };

  const handleCreateIncidentFromAlert = (alert: MonitoringAlert) => {
    onOpenCreateTicketForIncident({
      title: `[Alert จาก ${alert.source}] ${alert.serviceName}: ${alert.message.split(':')[0]}`,
      description: `การแจ้งเตือนจากระบบ ${alert.source}:\nข้อความ: ${alert.message}\nบริการที่ได้รับผลกระทบ: ${alert.serviceName}\nเวลาตรวจพบ: ${alert.timestamp}`,
      category: 'incident',
      priority: alert.severity === 'critical' ? 'P1 - วิกฤต' : 'P2 - สูง',
      requestType: 'แจ้งปัญหาระบบหรือบริการขัดข้อง (Report a system problem)',
      tags: ['alert', alert.source.toLowerCase(), alert.severity],
    });
  };

  const operationalCount = services.filter((s) => s.status === 'operational').length;
  const degradedCount = services.filter((s) => s.status === 'degraded' || s.status === 'outage').length;
  const criticalAlertsCount = alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length;

  const filteredAlerts = alerts.filter((a) => {
    if (alertFilter !== 'all' && a.severity !== alertFilter) return false;
    if (
      searchQuery &&
      !a.message.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getServiceCategoryIcon = (category: string) => {
    switch (category) {
      case 'gateway': return <Globe className="h-4 w-4 text-slate-500" />;
      case 'identity': return <Shield className="h-4 w-4 text-slate-500" />;
      case 'database': return <Database className="h-4 w-4 text-slate-500" />;
      case 'network': return <Radio className="h-4 w-4 text-slate-500" />;
      case 'storage': return <Server className="h-4 w-4 text-slate-500" />;
      default: return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-6 space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-xs">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                การเฝ้าระวัง & ตรวจสอบสุขภาพ API (Noti & API Health Check)
              </h1>
              <p className="text-xs text-slate-500">
                ระบบมอนิเตอร์การตอบสนองของไมโครเซอร์วิส เฝ้าระวังความหน่วง (Latency) และสตรีมแจ้งเตือนสด
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all ${
              autoRefresh
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-300 bg-white text-slate-600'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {autoRefresh ? 'อัปเดตอัตโนมัติ (Live)' : 'หยุดการอัปเดต'}
          </button>

          <button
            type="button"
            onClick={handlePingAll}
            disabled={isPinging}
            className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:bg-red-800 transition-all cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'กำลัง Ping ทุกระบบ...' : 'ทดสอบ Ping ทุกระบบ (Ping All)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>สถานะระบบรวม (System Uptime)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">99.98%</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              ตามเกณฑ์ SLA
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">ตรวจสอบล่าสุด: {lastRefreshedAt}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>บริการที่พร้อมใช้งาน</span>
            <Server className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{operationalCount} / {services.length}</span>
            <span className="text-xs text-slate-500">บริการ</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">
            {degradedCount === 0 ? 'ทุกบริการทำงานปกติ 100%' : `มี ${degradedCount} บริการแจ้งเตือนหน่วงสูง`}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>ความหน่วงเฉลี่ย (Avg Latency)</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">42 ms</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              Edge APAC
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">P95: 115ms | P99: 480ms</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>การแจ้งเตือนวิกฤต (Critical Alerts)</span>
            <AlertTriangle className={`h-4 w-4 ${criticalAlertsCount > 0 ? 'text-red-600 animate-bounce' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${criticalAlertsCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {criticalAlertsCount}
            </span>
            <span className="text-xs text-slate-500">รายการรอดำเนินการ</span>
          </div>
          <p className="mt-1 text-[11px] text-red-600 font-medium">
            {criticalAlertsCount > 0 ? 'ตรวจพบ Packet Loss เกินเกณฑ์' : 'ไม่มีเคสวิกฤติตกค้าง'}
          </p>
        </div>
      </div>

      {/* Tabs Switcher: API Health Checks vs Noti Stream */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'health'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>สถานะไมโครเซอร์วิส & API ({services.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('noti_stream')}
          className={`relative flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'noti_stream'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>สตรีมการแจ้งเตือนสด (Noti Monitoring Stream)</span>
          {alerts.filter((a) => !a.acknowledged).length > 0 && (
            <span className="ml-1 rounded-full bg-red-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
              {alerts.filter((a) => !a.acknowledged).length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: API Health Cards Grid */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-800">
              สถานะการตอบสนองและสุขภาพการเชื่อมต่อ (Real-time Health Check Endpoints)
            </h2>
            <div className="text-xs text-slate-500">
              เกณฑ์ความหน่วง: <span className="font-semibold text-emerald-600">&lt; 100ms (ดีมาก)</span> |{' '}
              <span className="font-semibold text-amber-600">100-300ms (ปกติ)</span> |{' '}
              <span className="font-semibold text-red-600">&gt; 300ms (เฝ้าระวัง)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((svc) => {
              const isDegraded = svc.status === 'degraded' || svc.status === 'outage';
              const isPingingThis = pingedServiceId === svc.id;

              return (
                <div
                  key={svc.id}
                  className={`relative flex flex-col justify-between rounded-xl border bg-white p-4 shadow-2xs transition-all hover:shadow-xs ${
                    isDegraded ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Card Top: Name & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md bg-slate-100 p-1.5 text-slate-700">
                          {getServiceCategoryIcon(svc.category)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{svc.name}</h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span className="font-mono font-semibold text-slate-500">{svc.serviceKey}</span>
                            <span>•</span>
                            <span>{svc.region}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            svc.status === 'operational'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              svc.status === 'operational' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
                            }`}
                          />
                          {svc.statusCode} {svc.status === 'operational' ? 'OK' : 'Warning'}
                        </span>
                      </div>
                    </div>

                    {/* Endpoint */}
                    <div className="mt-3 rounded-md bg-slate-50 p-2 font-mono text-[11px] text-slate-600 truncate border border-slate-100">
                      {svc.endpoint}
                    </div>

                    {/* Metrics Row */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md border border-slate-100 p-2 bg-white">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          ความหน่วง (Latency)
                        </div>
                        <div
                          className={`mt-0.5 text-sm font-black ${
                            svc.latencyMs > 300
                              ? 'text-red-600'
                              : svc.latencyMs > 100
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {svc.latencyMs} ms
                        </div>
                      </div>

                      <div className="rounded-md border border-slate-100 p-2 bg-white">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          ความพร้อมใช้งาน (Uptime)
                        </div>
                        <div className="mt-0.5 text-sm font-black text-slate-800">
                          {svc.uptimePercentage}%
                        </div>
                      </div>
                    </div>

                    {/* Status message */}
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                      {svc.message}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handlePingSingle(svc.id)}
                      disabled={isPingingThis}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`h-3 w-3 ${isPingingThis ? 'animate-spin text-red-600' : ''}`} />
                      <span>{isPingingThis ? 'Ping...' : 'Ping ทดสอบ'}</span>
                    </button>

                    {isDegraded ? (
                      <button
                        type="button"
                        onClick={() => handleCreateIncidentFromService(svc)}
                        className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700 shadow-2xs transition-all cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>เปิด Incident P1/P2</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">ตรวจสอบ: {svc.lastChecked}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Noti Monitoring Alert Stream */}
      {activeTab === 'noti_stream' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-700 mr-1">ตัวกรองระดับ:</span>
              <button
                type="button"
                onClick={() => setAlertFilter('all')}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                  alertFilter === 'all'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ทั้งหมด ({alerts.length})
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('critical')}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                  alertFilter === 'critical'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                🚨 วิกฤต Critical ({alerts.filter((a) => a.severity === 'critical').length})
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('warning')}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                  alertFilter === 'warning'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                ⚠️ แจ้งเตือน Warning ({alerts.filter((a) => a.severity === 'warning').length})
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('info')}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                  alertFilter === 'info'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                ℹ️ ข้อมูล Info ({alerts.filter((a) => a.severity === 'info').length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาข้อความแจ้งเตือน..."
                  className="rounded-md border border-slate-200 bg-slate-50 py-1 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <button
                type="button"
                onClick={handleSimulateAlert}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-red-300 hover:text-red-600 shadow-2xs transition-colors"
                title="จำลองส่งการแจ้งเตือนจากระบบมอนิเตอร์"
              >
                <Zap className="h-3 w-3 text-amber-500" />
                <span>จำลอง Alert ทดสอบ</span>
              </button>
            </div>
          </div>

          {/* Alert Stream List */}
          <div className="space-y-2.5">
            {filteredAlerts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                <p className="mt-2 text-sm font-bold text-slate-800">ไม่พบการแจ้งเตือนในเงื่อนไขนี้</p>
                <p className="text-xs text-slate-400">ระบบทำงานอย่างมีเสถียรภาพ</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                    alert.severity === 'critical'
                      ? 'border-red-300 bg-red-50/40'
                      : alert.severity === 'warning'
                      ? 'border-amber-200 bg-amber-50/30'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        alert.severity === 'critical'
                          ? 'bg-red-600 text-white'
                          : alert.severity === 'warning'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {alert.severity === 'critical' ? (
                        <XCircle className="h-4 w-4" />
                      ) : alert.severity === 'warning' ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Activity className="h-4 w-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs">{alert.serviceName}</span>
                        <span className="rounded-md bg-slate-200/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                          {alert.source}
                        </span>
                        <span className="text-[11px] text-slate-400">• {alert.timestamp}</span>
                        {alert.incidentKey && (
                          <span className="rounded-md bg-red-100 px-1.5 py-0.5 font-bold text-[10px] text-red-800 border border-red-200">
                            เคส: {alert.incidentKey}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-slate-700 font-mono leading-relaxed">
                        {alert.message}
                      </p>
                    </div>
                  </div>

                  {/* Alert Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleAcknowledge(alert.id)}
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold border transition-all ${
                        alert.acknowledged
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                      <span>{alert.acknowledged ? 'รับทราบแล้ว' : 'กดรับทราบ (Ack)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCreateIncidentFromAlert(alert)}
                      className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-2xs hover:bg-red-700 transition-all cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>เปิดตั๋ว Incident</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
