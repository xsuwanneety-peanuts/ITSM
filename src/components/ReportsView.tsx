import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import { Ticket } from '../types/itsm.ts';

interface ReportsViewProps {
  tickets: Ticket[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ tickets }) => {
  const resolved = tickets.filter(
    (t) =>
      t.status === 'Resolved' ||
      t.status === 'Closed' ||
      t.status === 'แก้ไขแล้ว' ||
      t.status === 'ปิดงานแล้ว'
  );
  const breached = tickets.filter((t) => t.slaRemainingMinutes < 0);
  const total = tickets.length;
  const slaCompliancePct = total > 0 ? Math.round(((total - breached.length) / total) * 100) : 100;

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAFA] p-6 md:p-8 font-sans">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-red-100 p-2 text-red-700">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">รายงานประสิทธิภาพการให้บริการไอที</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            สถิติการรักษาข้อตกลงระดับการให้บริการ (SLA), เวลาเฉลี่ยในการกู้คืนระบบ (MTTR) และการวิเคราะห์ความพึงพอใจ
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('กำลังส่งออกรายงานสรุปสำหรับผู้บริหารในรูปแบบ CSV...')}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:border-red-400 hover:text-red-700 transition-colors cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>ส่งออกรายงาน (Export CSV)</span>
        </button>
      </div>

      {/* KPI Tiles */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">การรักษาข้อตกลง SLA</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600">{slaCompliancePct}%</span>
            <span className="text-xs font-bold text-emerald-600">+1.8% เทียบเดือนก่อน</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">เป้าหมายมาตรฐาน: &gt; 95%</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">เวลาเฉลี่ยในการแก้ไข (MTTR)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">3.4 ชม.</span>
            <span className="text-xs font-bold text-emerald-600">เร็วขึ้น 24 นาที</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">ระยะเวลาเฉลี่ยต่อเหตุขัดข้อง</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">แก้ไขสำเร็จในครั้งแรก (FCR)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">76%</span>
            <span className="text-xs font-semibold text-slate-500">Tier-1 Service Desk</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">แก้ไขได้ทันทีโดยไม่ต้องส่งต่อ</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ปริมาณคำขอสะสม 30 วัน</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-700">{total * 14}</span>
            <span className="text-xs font-bold text-slate-600">คำขอ</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">รวมเว็บ, อีเมล และ Slack</p>
        </div>
      </div>

      {/* Ticket Ingestion Channels */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">สัดส่วนคำขอตามช่องทางที่ส่งเรื่องเข้ามา</h3>
          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>พอร์ทัลบริการตนเอง (Customer Portal)</span>
                <span className="text-slate-600">58% (420 รายการ)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-red-600" style={{ width: '58%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>อีเมลฝ่ายสนับสนุน (helpdesk@enterprise.co.th)</span>
                <span className="text-slate-600">24% (174 รายการ)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500" style={{ width: '24%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Slack Bot อัตโนมัติ (#it-support)</span>
                <span className="text-slate-600">14% (101 รายการ)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-purple-500" style={{ width: '14%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>ระบบตรวจจับความผิดปกติอัตโนมัติ (Opsgenie)</span>
                <span className="text-slate-600">4% (29 รายการ)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-rose-500" style={{ width: '4%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">จำแนกสาเหตุที่เกินกำหนดเวลา SLA</h3>
          <div className="space-y-3 text-xs">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">การจัดส่งอุปกรณ์จากคู่ค้าภายนอกล่าช้า</span>
                <p className="text-[11px] text-slate-400">ห่วงโซ่อุปทานฮาร์ดแวร์และศุลกากร</p>
              </div>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">4 รายการ</span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">ผู้ให้บริการ SaaS รายใหญ่ภายนอกขัดข้อง</span>
                <p className="text-[11px] text-slate-400">ระบบคลาวด์ Okta / Cloudflare เกิดเหตุขัดข้องทั่วโลก</p>
              </div>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">2 รายการ</span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">รอข้อมูลยืนยันตัวตนจากผู้รับบริการ</span>
                <p className="text-[11px] text-slate-400">ตั๋วอยู่ในสถานะ 'รอลูกค้า' (ระบบหยุดนับเวลา SLA ชั่วคราว)</p>
              </div>
              <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">พักเวลา SLA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
