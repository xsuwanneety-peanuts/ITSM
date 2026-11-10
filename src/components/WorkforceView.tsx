import React from 'react';
import { Users2 } from 'lucide-react';
import { Agent, Ticket } from '../types/itsm.ts';
import { calculateAgentWorkloads } from '../utils/itsmLogic.ts';

interface WorkforceViewProps {
  agents: Agent[];
  tickets: Ticket[];
  onSelectAgentTickets: (agentId: string) => void;
}

export const WorkforceView: React.FC<WorkforceViewProps> = ({
  agents,
  tickets,
  onSelectAgentTickets,
}) => {
  const workloads = calculateAgentWorkloads(tickets, agents);

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAFA] p-6 md:p-8 font-sans">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-red-100 p-2 text-red-700">
              <Users2 className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">การบริหารจัดการกำลังพล (Workforce)</h1>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-800">
              ฟีเจอร์ใหม่
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            ตรวจสอบความจุภาระงานของวิศวกรไอที และกระจายงานเพื่อรักษาข้อตกลงระดับการให้บริการ (SLA)
          </p>
        </div>
      </div>

      {/* Agents Capacity Grid */}
      <div className="mt-8">
        <h2 className="text-sm font-bold text-slate-900 mb-3">การจัดสรรภาระงานและความจุของวิศวกรแต่ละท่าน</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workloads.map(({ agent, assignedCount, utilizationRate, criticalCount }) => {
            const isOverloaded = utilizationRate >= 80;
            return (
              <div
                key={agent.id}
                onClick={() => onSelectAgentTickets(agent.id)}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-red-400 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="h-11 w-11 rounded-full object-cover border-2 border-slate-200 group-hover:border-red-500 transition-colors"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-red-700 transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-slate-500">{agent.role}</p>
                    <p className="text-[11px] text-slate-400">{agent.department}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">ความจุงานที่ได้รับมอบหมาย</span>
                    <span
                      className={`font-bold ${
                        isOverloaded ? 'text-red-600' : 'text-slate-800'
                      }`}
                    >
                      {utilizationRate}% ({assignedCount} / {agent.maxCapacity} งาน)
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOverloaded ? 'bg-red-600' : 'bg-red-500'
                      }`}
                      style={{ width: `${utilizationRate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>
                      {criticalCount > 0 ? (
                        <span className="text-red-600 font-bold">⚠️ งานวิกฤต P1 จำนวน {criticalCount} งาน</span>
                      ) : (
                        'ไม่มีงานวิกฤตค้าง'
                      )}
                    </span>
                    <span className="text-red-600 font-bold group-hover:underline">
                      เปิดดูคิวงาน &rarr;
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
