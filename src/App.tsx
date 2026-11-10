import React, { useState } from 'react';
import {
  Sidebar,
  NavItem,
} from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { SummaryDashboard } from './components/SummaryDashboard.tsx';
import { QueuesView } from './components/QueuesView.tsx';
import { TicketDetailModal } from './components/TicketDetailModal.tsx';
import { CreateTicketModal } from './components/CreateTicketModal.tsx';
import { CustomerPortalView } from './components/CustomerPortalView.tsx';
import { ChangeManagementView } from './components/ChangeManagementView.tsx';
import { WorkforceView } from './components/WorkforceView.tsx';
import { KnowledgeBaseView } from './components/KnowledgeBaseView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import {
  Ticket,
  Agent,
  FilterState,
} from './types/itsm.ts';
import {
  SEED_AGENTS,
  INITIAL_TICKETS,
} from './data/seedData.ts';


export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [agents, setAgents] = useState<Agent[]>(SEED_AGENTS);
  const [activeNav, setActiveNav] = useState<NavItem>('summary');
  const [portalMode, setPortalMode] = useState<'agent' | 'customer'>('agent');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Global Filter State for Summary Dashboard
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'last-30-days',
    assigneeId: 'all',
    status: 'all',
    requestType: 'all',
    priority: 'all',
    searchQuery: '',
  });

  const openTickets = tickets.filter(
    (t) => t.status !== 'Closed' && t.status !== 'Resolved' && t.status !== 'ปิดงานแล้ว' && t.status !== 'แก้ไขแล้ว'
  );
  const openIncidents = tickets.filter(
    (t) =>
      t.category === 'incident' &&
      t.status !== 'Closed' &&
      t.status !== 'Resolved' &&
      t.status !== 'ปิดงานแล้ว' &&
      t.status !== 'แก้ไขแล้ว'
  );
  const breachedTickets = tickets.filter(
    (t) =>
      t.slaRemainingMinutes < 0 &&
      t.status !== 'Closed' &&
      t.status !== 'Resolved' &&
      t.status !== 'ปิดงานแล้ว' &&
      t.status !== 'แก้ไขแล้ว'
  );

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    );
    setSelectedTicket(updatedTicket);
  };

  const handleCreateTicket = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  const handleNavigateToQueuesWithPreset = (preset?: Partial<FilterState>) => {
    if (preset) {
      setFilters((prev) => ({ ...prev, ...preset }));
    }
    setActiveNav('queues');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-800 font-sans antialiased">
      {/* Left Sidebar (Only visible in Agent Workspace) */}
      {portalMode === 'agent' && (
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          openIncidentsCount={openIncidents.length}
          openTicketsCount={openTickets.length}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main App Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Global Header */}
        <Header
          currentView={portalMode === 'customer' ? 'Customer Self-Service Portal' : activeNav}
          onCreateTicketClick={() => setIsCreateModalOpen(true)}
          searchQuery={filters.searchQuery}
          setSearchQuery={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
          portalMode={portalMode}
          setPortalMode={setPortalMode}
          totalOpenTickets={openTickets.length}
          breachedSlaCount={breachedTickets.length}
          onToggleSidebar={() => setMobileMenuOpen((prev) => !prev)}
        />

        {/* View Switcher */}
        {portalMode === 'customer' ? (
          <CustomerPortalView
            onTicketSubmitted={handleCreateTicket}
            mySubmittedTickets={tickets.filter(
              (t) =>
                t.reporter.name.includes('อเล็กซานเดอร์ รอย') ||
                t.reporter.name.includes('Alexandre Roy') ||
                t.tags.includes('portal')
            )}
            onSelectTicket={(ticket) => setSelectedTicket(ticket)}
          />
        ) : (
          <>
            {activeNav === 'summary' && (
              <SummaryDashboard
                tickets={tickets}
                agents={agents}
                filters={filters}
                setFilters={setFilters}
                onTicketClick={(ticket) => setSelectedTicket(ticket)}
                onNavigateToQueues={handleNavigateToQueuesWithPreset}
              />
            )}

            {activeNav === 'queues' && (
              <QueuesView
                tickets={tickets}
                agents={agents}
                onSelectTicket={(ticket) => setSelectedTicket(ticket)}
                onCreateTicketClick={() => setIsCreateModalOpen(true)}
              />
            )}

            {activeNav === 'service_requests' && (
              <QueuesView
                tickets={tickets}
                agents={agents}
                categoryFilter="service_request"
                onSelectTicket={(ticket) => setSelectedTicket(ticket)}
                onCreateTicketClick={() => setIsCreateModalOpen(true)}
              />
            )}

            {activeNav === 'incidents' && (
              <QueuesView
                tickets={tickets}
                agents={agents}
                categoryFilter="incident"
                onSelectTicket={(ticket) => setSelectedTicket(ticket)}
                onCreateTicketClick={() => setIsCreateModalOpen(true)}
              />
            )}

            {activeNav === 'workforce' && (
              <WorkforceView
                agents={agents}
                tickets={tickets}
                onSelectAgentTickets={(agentId) => {
                  setFilters((prev) => ({ ...prev, assigneeId: agentId }));
                  setActiveNav('queues');
                }}
              />
            )}

            {activeNav === 'operations' && (
              <ChangeManagementView
                tickets={tickets}
                onSelectTicket={(ticket) => setSelectedTicket(ticket)}
                onUpdateTicket={handleUpdateTicket}
                onCreateChangeClick={() => setIsCreateModalOpen(true)}
              />
            )}

            {activeNav === 'reports' && <ReportsView tickets={tickets} />}

            {activeNav === 'knowledge_base' && (
              <KnowledgeBaseView onOpenCreateTicket={() => setIsCreateModalOpen(true)} />
            )}
          </>
        )}
      </div>

      {/* Ticket Detail Drawer/Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateTicket={handleUpdateTicket}
          agents={agents}
        />
      )}

      {/* Create Work Item Modal */}
      {isCreateModalOpen && (
        <CreateTicketModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateTicket={handleCreateTicket}
          agents={agents}
        />
      )}
    </div>
  );
}
