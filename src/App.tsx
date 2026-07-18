/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  UserSession, 
  Contract, 
  ProjectMilestone, 
  SupportTicket, 
  EmployeeProfile, 
  LeaveRequest, 
  PayrollRun, 
  LedgerAccount, 
  LedgerTransaction, 
  QueuedNotification, 
  DashboardMetrics,
  AttendanceRecord
} from './types';
import { 
  Users, 
  Briefcase, 
  Landmark, 
  Activity, 
  ShieldAlert, 
  RefreshCw, 
  LogOut,
  Laptop,
  CheckCircle,
  HelpCircle,
  Menu,
  ChevronDown,
  LockKeyhole,
  LayoutGrid
} from 'lucide-react';
import IdentityAccess from './components/IdentityAccess';
import OperationalContracts from './components/OperationalContracts';
import WorkforceHRMS from './components/WorkforceHRMS';
import FinancialLedger from './components/FinancialLedger';
import SupportingInfrastructure from './components/SupportingInfrastructure';
import DashboardBento from './components/DashboardBento';
import LoginScreen from './components/LoginScreen';

type ActiveDomain = 'dashboard' | 'identity' | 'operational' | 'workforce' | 'financial' | 'infrastructure';

export default function App() {
  // Navigation State
  const [activeDomain, setActiveDomain] = useState<ActiveDomain>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Unified Server Data States
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [accounts, setAccounts] = useState<LedgerAccount[]>([]);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [notifications, setNotifications] = useState<QueuedNotification[]>([]);
  
  // Analytics
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [contractDistribution, setContractDistribution] = useState<any[]>([]);

  // Local Loading States
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeContractId, setActiveContractId] = useState<string | null>(null);

  // Load all isolated domain states from server API
  const fetchAllData = async () => {
    setIsRefreshing(true);
    try {
      const [
        meRes,
        usersRes,
        sessionsRes,
        contractsRes,
        milestonesRes,
        ticketsRes,
        employeesRes,
        leavesRes,
        payrollRes,
        attendanceRes,
        accountsRes,
        transactionsRes,
        notificationsRes,
        metricsRes,
        trendRes,
        distRes
      ] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/users'),
        fetch('/api/auth/sessions'),
        fetch('/api/contracts'),
        fetch('/api/contracts/milestones'),
        fetch('/api/tickets'),
        fetch('/api/employees'),
        fetch('/api/leaves'),
        fetch('/api/payroll'),
        fetch('/api/attendance'),
        fetch('/api/finance/accounts'),
        fetch('/api/finance/transactions'),
        fetch('/api/notifications'),
        fetch('/api/analytics/dashboard'),
        fetch('/api/analytics/monthly'),
        fetch('/api/analytics/distribution')
      ]);

      if (meRes.ok) setCurrentUser(await meRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      if (contractsRes.ok) setContracts(await contractsRes.json());
      if (milestonesRes.ok) setMilestones(await milestonesRes.json());
      if (ticketsRes.ok) setTickets(await ticketsRes.json());
      if (employeesRes.ok) setEmployees(await employeesRes.json());
      if (leavesRes.ok) setLeaves(await leavesRes.json());
      if (payrollRes.ok) setPayrollRuns(await payrollRes.json());
      if (attendanceRes.ok) setAttendance(await attendanceRes.json());
      if (accountsRes.ok) setAccounts(await accountsRes.json());
      if (transactionsRes.ok) setTransactions(await transactionsRes.json());
      if (notificationsRes.ok) setNotifications(await notificationsRes.json());
      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (trendRes.ok) setMonthlyTrend(await trendRes.json());
      if (distRes.ok) setContractDistribution(await distRes.json());
    } catch (error) {
      console.error('Failed compiling full-stack domain matrices:', error);
    } finally {
      setIsRefreshing(false);
      setIsInitializing(false);
    }
  };

  // Handler: Mark or Update attendance
  const handleMarkAttendance = async (attendanceData: any) => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData)
      });
      if (response.ok) {
        await fetchAllData();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to register attendance.');
      }
    } catch (e) {
      console.error('Attendance sync failure', e);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handler: Switch Active user persona (Simulated Login / RBAC swap)
  const handleSwitchPersona = async (userId: string) => {
    try {
      const response = await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          device: 'Aetheris Client DevConsole',
          ip: `82.114.10.${Math.floor(Math.random() * 254) + 1}`
        })
      });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error('Identity swap failed', e);
    }
  };

  // Handler: Update User Access Roles
  const handleUpdateUserRole = async (id: string, role: string, department: string, seniority: string) => {
    try {
      const response = await fetch(`/api/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, department, seniority })
      });
      if (response.ok) {
        await fetchAllData();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to update credentials.');
      }
    } catch (e) {
      console.error('Permission sync failed', e);
    }
  };

  // Handler: Register New Contract SLA
  const handleAddContract = async (contractData: any) => {
    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData)
      });
      if (response.ok) {
        const newCon = await response.json();
        // automatically generate milestones for new contract as example
        await Promise.all([
          fetch('/api/contracts/milestones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contractId: newCon.id,
              title: 'Phase 1 Architecture Audit & Handshake',
              value: Math.floor(contractData.value * 0.3),
              dueDate: '2026-08-15'
            })
          }),
          fetch('/api/contracts/milestones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contractId: newCon.id,
              title: 'Phase 2 Live Deploy & Hardening',
              value: Math.floor(contractData.value * 0.7),
              dueDate: '2026-11-30'
            })
          })
        ]);
        await fetchAllData();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed signing agreement.');
      }
    } catch (e) {
      console.error('Agreement handshake failed', e);
    }
  };

  // Handler: Complete and bill milestone (Ledger Triggers)
  const handleCompleteMilestone = async (id: string) => {
    try {
      const response = await fetch(`/api/contracts/milestones/${id}/complete`, {
        method: 'POST'
      });
      if (response.ok) {
        const finishedMilestone = await response.json();
        await fetchAllData();
        return finishedMilestone;
      } else {
        const err = await response.json();
        alert(err.error || 'Milestone completion failed.');
        return null;
      }
    } catch (e) {
      console.error('SLA Billing failing:', e);
      return null;
    }
  };

  // Handler: Send project chat message
  const handleSendMessage = async (contractId: string, content: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/contracts/${contractId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, senderId: currentUser.id })
      });
      if (response.ok) {
        // Just reload chat locally inside subcomponent instead of full refetch
      }
    } catch (e) {
      console.error('SLA Chat failing:', e);
    }
  };

  // Handler: Add Support ticket
  const handleAddTicket = async (ticketData: any) => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error('Ticket dispatch failure', e);
    }
  };

  // Handler: Update Support Ticket Status
  const handleUpdateTicketStatus = async (id: string, status: any) => {
    try {
      const response = await fetch(`/api/tickets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error('Ticket update failure', e);
    }
  };

  // Handler: Add HR Absence request
  const handleAddLeaveRequest = async (leaveData: any) => {
    try {
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveData)
      });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error('Leave dispatch failure', e);
    }
  };

  // Handler: Approve Leave request
  const handleApproveLeave = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/leaves/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error('Leave approval failure', e);
    }
  };

  // Handler: Add new Employee profile & ERP user
  const handleAddEmployee = async (employeeData: any) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });
      if (response.ok) {
        await fetchAllData();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to add employee.');
      }
    } catch (e) {
      console.error('Employee creation failure', e);
    }
  };

  // Handler: Update Employee profile & ERP user details
  const handleUpdateEmployee = async (id: string, employeeData: any) => {
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });
      if (response.ok) {
        await fetchAllData();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to update employee.');
      }
    } catch (e) {
      console.error('Employee update failure', e);
    }
  };

  // Handler: Delete Employee profile & ERP user
  const handleDeleteEmployee = async (id: string) => {
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchAllData();
        return true;
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to delete employee.');
        return false;
      }
    } catch (e) {
      console.error('Employee deletion failure', e);
      return false;
    }
  };

  // Handler: Disburse salary payroll (Finance Trigger)
  const handleExecutePayroll = async (period: string) => {
    try {
      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period })
      });
      const data = await response.json();
      await fetchAllData();
      return data;
    } catch (e) {
      console.error('Payroll dispatch failure', e);
      return { error: 'Network communication failure.' };
    }
  };

  // Handler: Post Manual double-entry leg
  const handleAddManualJournal = async (journalData: any) => {
    try {
      const response = await fetch('/api/finance/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(journalData)
      });
      const data = await response.ok ? await response.json() : await response.json();
      await fetchAllData();
      return data;
    } catch (e) {
      console.error('Journal dispatch failure', e);
      return { error: 'Ledger database pipeline interrupted.' };
    }
  };

  // Handler: Manual flusher background notifications
  const handleFlushQueue = async () => {
    try {
      const response = await fetch('/api/notifications/flush', { method: 'POST' });
      if (response.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error('Comms flush failure', e);
    }
  };

  // Handler: Secure Logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        setCurrentUser(null);
      }
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h1 className="text-lg font-bold font-sans tracking-wide">AETHERIS MONOLITH CORE</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">Loading full-stack modular enterprise schemas...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(user) => { setCurrentUser(user); fetchAllData(); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* Sidebar Navigation */}
      <div className={`w-64 bg-slate-900 flex flex-col text-white shrink-0 fixed inset-y-0 z-50 md:sticky md:top-0 md:h-screen transition-transform duration-200 print:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-sm text-white shadow-md">ERP</div>
            <span className="font-bold text-lg tracking-tight">Aetheris</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white" title="Close Menu">
            <LogOut className="w-5 h-5 rotate-180" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-3 mb-2">Departments & Modules</div>
          <button
            onClick={() => { setActiveDomain('dashboard'); setSidebarOpen(false); }}
            className={`w-full text-left rounded-lg p-3 flex items-center gap-3 transition-all cursor-pointer ${
              activeDomain === 'dashboard'
                ? 'bg-slate-800 text-white font-medium shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <LayoutGrid className={`w-4 h-4 ${activeDomain === 'dashboard' ? 'text-blue-400' : 'text-slate-500'}`} />
            <span className="text-sm font-semibold">Bento Dashboard</span>
          </button>

          <button
            onClick={() => { setActiveDomain('identity'); setSidebarOpen(false); }}
            className={`w-full text-left rounded-lg p-3 flex items-center gap-3 transition-all cursor-pointer ${
              activeDomain === 'identity'
                ? 'bg-slate-800 text-white font-medium shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${activeDomain === 'identity' ? 'bg-blue-400' : 'bg-transparent border border-slate-500'}`}></div>
            <span className="text-sm">Identity & Access</span>
          </button>
          
          <button
            onClick={() => { setActiveDomain('operational'); setSidebarOpen(false); }}
            className={`w-full text-left rounded-lg p-3 flex items-center gap-3 transition-all cursor-pointer ${
              activeDomain === 'operational'
                ? 'bg-slate-800 text-white font-medium shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${activeDomain === 'operational' ? 'bg-blue-400' : 'bg-transparent border border-slate-500'}`}></div>
            <span className="text-sm">Contracts & Tickets</span>
          </button>

          <button
            onClick={() => { setActiveDomain('workforce'); setSidebarOpen(false); }}
            className={`w-full text-left rounded-lg p-3 flex items-center gap-3 transition-all cursor-pointer ${
              activeDomain === 'workforce'
                ? 'bg-slate-800 text-white font-medium shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${activeDomain === 'workforce' ? 'bg-blue-400' : 'bg-transparent border border-slate-500'}`}></div>
            <span className="text-sm">Workforce HRMS</span>
          </button>

          <button
            onClick={() => { setActiveDomain('financial'); setSidebarOpen(false); }}
            className={`w-full text-left rounded-lg p-3 flex items-center gap-3 transition-all cursor-pointer ${
              activeDomain === 'financial'
                ? 'bg-slate-800 text-white font-medium shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${activeDomain === 'financial' ? 'bg-blue-400' : 'bg-transparent border border-slate-500'}`}></div>
            <span className="text-sm">Financial Ledger</span>
          </button>

          <button
            onClick={() => { setActiveDomain('infrastructure'); setSidebarOpen(false); }}
            className={`w-full text-left rounded-lg p-3 flex items-center gap-3 transition-all cursor-pointer ${
              activeDomain === 'infrastructure'
                ? 'bg-slate-800 text-white font-medium shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${activeDomain === 'infrastructure' ? 'bg-blue-400' : 'bg-transparent border border-slate-500'}`}></div>
            <span className="text-sm">Support & Reports</span>
          </button>
        </nav>

        {/* Profile Identity / Switcher at Sidebar Bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs border border-slate-600 shrink-0 font-bold text-blue-400">
                {currentUser ? currentUser.fullName.split(' ').map((n: string) => n[0]).join('') : 'JD'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">{currentUser?.fullName || 'Julian D.'}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest truncate">{currentUser?.role || 'Admin / HR Tech'}</span>
              </div>
            </div>
            
            <div className="mt-1">
              <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">Active Persona (RBAC)</label>
              <select
                value={currentUser?.id || ''}
                onChange={(e) => handleSwitchPersona(e.target.value)}
                className="w-full bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-semibold text-xs border border-slate-700 rounded-lg p-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-800 text-slate-100 text-xs">
                    {u.fullName} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleLogout}
              className="mt-1 w-full py-2 bg-slate-800 hover:bg-rose-950/45 hover:text-rose-400 hover:border-rose-900/40 text-slate-300 font-semibold rounded-lg text-[10px] flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              title="Secure Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out of Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40 print:hidden">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-slate-500 hover:text-slate-800" title="Open Menu">
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-slate-400 text-sm font-medium hidden sm:inline">System Overview</span>
            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>
            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold uppercase tracking-wider">
              {currentUser?.department || 'PUBLIC'} Live Session
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Communication Status</p>
              <p className="text-xs font-bold font-mono text-emerald-600">SECURE DISPATCH ACTIVE</p>
            </div>
            <button
              onClick={fetchAllData}
              disabled={isRefreshing}
              className="w-8 h-8 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Recompile Ledger"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Content View Container */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Overlay background for sidebar on mobile */}
          {sidebarOpen && (
            <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/50 z-40 md:hidden animate-fade-in" />
          )}

          {currentUser ? (
            <div className="space-y-6">
              {activeDomain === 'dashboard' && (
                <DashboardBento
                  currentUser={currentUser}
                  contracts={contracts}
                  metrics={metrics || {
                    totalRevenue: 0,
                    totalExpenses: 0,
                    netIncome: 0,
                    activeContracts: 0,
                    totalEmployees: 0,
                    pendingTickets: 0,
                    pendingLeaves: 0
                  }}
                  leaves={leaves}
                  users={users}
                  notifications={notifications}
                  monthlyTrend={monthlyTrend}
                  onNavigate={(domain) => setActiveDomain(domain)}
                  onRefresh={fetchAllData}
                />
              )}

              {activeDomain === 'identity' && (
                <IdentityAccess
                  currentUser={currentUser}
                  users={users}
                  sessions={sessions}
                  onUpdateUserRole={handleUpdateUserRole}
                  onRefresh={fetchAllData}
                />
              )}

              {activeDomain === 'operational' && (
                <OperationalContracts
                  currentUser={currentUser}
                  contracts={contracts}
                  milestones={milestones}
                  tickets={tickets}
                  users={users}
                  onAddContract={handleAddContract}
                  onCompleteMilestone={handleCompleteMilestone}
                  onSendMessage={handleSendMessage}
                  onAddTicket={handleAddTicket}
                  onUpdateTicketStatus={handleUpdateTicketStatus}
                  activeContractId={activeContractId}
                  setActiveContractId={setActiveContractId}
                />
              )}

              {activeDomain === 'workforce' && (
                <WorkforceHRMS
                  currentUser={currentUser}
                  employees={employees}
                  leaves={leaves}
                  payrollRuns={payrollRuns}
                  users={users}
                  attendance={attendance}
                  onMarkAttendance={handleMarkAttendance}
                  onAddLeaveRequest={handleAddLeaveRequest}
                  onApproveLeave={handleApproveLeave}
                  onExecutePayroll={handleExecutePayroll}
                  onAddEmployee={handleAddEmployee}
                  onUpdateEmployee={handleUpdateEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                />
              )}

              {activeDomain === 'financial' && (
                <FinancialLedger
                  currentUser={currentUser}
                  accounts={accounts}
                  transactions={transactions}
                  onAddManualJournal={handleAddManualJournal}
                  onRefresh={fetchAllData}
                />
              )}

              {activeDomain === 'infrastructure' && metrics && (
                <SupportingInfrastructure
                  notifications={notifications}
                  dashboardMetrics={metrics}
                  monthlyTrend={monthlyTrend}
                  clientRevenueShare={contractDistribution}
                  onFlushQueue={handleFlushQueue}
                  onRefresh={fetchAllData}
                />
              )}
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-xl flex items-start gap-3 text-rose-800">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Security Context Violation</p>
                <p className="text-xs text-rose-700 mt-1">
                  Active identity context is missing. Please select a user persona from the sidebar to authenticate.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Compact Status Footer */}
        <footer className="bg-white border-t border-slate-200 py-3 text-center text-[11px] text-slate-400 shrink-0 print:hidden">
          <div className="px-8 flex justify-between items-center">
            <div className="flex items-center gap-1.5 font-mono font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Ledger Node: Active</span>
            </div>
            <div className="hidden sm:block font-medium">
              <span>Aetheris Enterprise Resource Monolith • London HQ Gateway</span>
            </div>
            <div className="flex items-center gap-1 text-slate-300">
              <span>Vite + React 18 + Express</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
