/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Contract, 
  DashboardMetrics, 
  LeaveRequest, 
  User, 
  QueuedNotification 
} from '../types';
import { 
  Briefcase, 
  Users, 
  Mail, 
  TrendingUp, 
  Landmark, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface DashboardBentoProps {
  currentUser: User | null;
  contracts: Contract[];
  metrics: DashboardMetrics;
  leaves: LeaveRequest[];
  users: User[];
  notifications: QueuedNotification[];
  monthlyTrend: { month: string; revenue: number; expenses: number }[];
  onNavigate: (domain: 'identity' | 'operational' | 'workforce' | 'financial' | 'infrastructure') => void;
  onRefresh: () => void;
}

export default function DashboardBento({
  currentUser,
  contracts,
  metrics,
  leaves,
  users,
  notifications,
  monthlyTrend,
  onNavigate,
  onRefresh
}: DashboardBentoProps) {
  // Pending notifications
  const pendingNotificationsCount = notifications.filter(n => n.status === 'PENDING').length;

  // Active contracts list for table
  const activeContractsList = contracts.slice(0, 3);

  // Workforce snapshot online users
  const onlineUsers = users.filter(u => u.status === 'ACTIVE').slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Dynamic Header Overlay */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {currentUser?.fullName || 'Operator'}
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Here's a unified real-time bento overview of the Aetheris ERP monolith.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            Refresh Core Feeds
          </button>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,_auto)]">
        
        {/* Card 1: Operational Management Hub (Client Contracts Table) */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="md:col-span-8 md:row-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  Operational Management
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Active SLA Agreements and Deliverables</p>
              </div>
              <button 
                onClick={() => onNavigate('operational')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Manage Contracts
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="pb-2 font-semibold">Client Entity</th>
                    <th className="pb-2 font-semibold">Agreement Type</th>
                    <th className="pb-2 font-semibold text-right">Valuation</th>
                    <th className="pb-2 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-50">
                  {activeContractsList.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-bold text-slate-700">{c.clientName}</td>
                      <td className="py-3 text-slate-500">{c.title}</td>
                      <td className="py-3 font-mono font-semibold text-slate-800 text-right">£{c.value.toLocaleString()}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          c.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {activeContractsList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                        No active contracts registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>SLA Standard compliance tier: <strong className="text-slate-600">Gold/Platinum</strong></span>
            <span className="font-mono text-[10px] text-indigo-600 font-bold bg-indigo-50/50 px-2 py-0.5 rounded">
              {metrics.activeContracts} Total Live Agreements
            </span>
          </div>
        </motion.div>

        {/* Card 2: Workforce Management (HRMS Overview in stunning Indigo gradient) */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="md:col-span-4 md:row-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-200" />
                  Workforce Management
                </h3>
                <p className="text-xs text-indigo-100/70 mt-0.5">HRMS Staffing & Coverage Status</p>
              </div>
              <button 
                onClick={() => onNavigate('workforce')}
                className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Go to Workforce HRMS"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-indigo-500/30 pb-2">
                <span className="text-indigo-100">Total Workforce Headcount</span>
                <span className="font-mono font-bold text-base">{metrics.totalEmployees} Staff</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-indigo-500/30 pb-2">
                <span className="text-indigo-100">Pending Absences</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${metrics.pendingLeaves > 0 ? 'bg-amber-400 text-slate-900 animate-pulse' : 'bg-indigo-500 text-indigo-100'}`}>
                  {metrics.pendingLeaves} requests
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-indigo-100">Next Payroll Period</span>
                <span className="font-mono font-semibold text-indigo-100">Active Cycle</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-indigo-500/30 flex items-center gap-3">
            <div className="flex -space-x-2">
              {onlineUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="w-7 h-7 rounded-full bg-slate-700 border-2 border-indigo-600 flex items-center justify-center text-[9px] font-bold text-white uppercase"
                  title={user.fullName}
                >
                  {user.fullName.split(' ').map(n => n[0]).join('')}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-indigo-100/80 font-medium">
              +{users.length} authenticated ERP accounts
            </span>
          </div>
        </motion.div>

        {/* Card 3: SMTP / Comm Engine (Queue status & SMTP Uptime) */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-xs"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${pendingNotificationsCount > 0 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Messaging Dispatcher</h4>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {pendingNotificationsCount > 0 ? `${pendingNotificationsCount} Mail queues pending` : 'All background logs dispatched'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold font-mono text-emerald-600 block">99.9%</span>
            <span className="text-[8px] uppercase tracking-wider text-slate-400">SMTP Active</span>
          </div>
        </motion.div>

        {/* Card 4: Financial Ledger Status Summary */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="md:col-span-4 md:row-span-2 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  Financial Integrity
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">General Ledger & Distribution</p>
              </div>
              <button 
                onClick={() => onNavigate('financial')}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Go to Financial Ledger"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Billed Revenue</span>
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight block">£{metrics.totalRevenue.toLocaleString()}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />
                    +12.4%
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">SLA Milestone realization</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Workforce Outflows</span>
                  <span className="text-rose-600 font-mono font-bold">£{metrics.totalExpenses.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${Math.min(100, (metrics.totalExpenses / (metrics.totalRevenue || 1)) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Pre-tax Profitability:</span>
              <span className={`font-mono font-bold ${metrics.netIncome >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                £{metrics.netIncome.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Card 5: Core Operations Health Check (SLA, Tickets, Incidents) */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-xs"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${metrics.pendingTickets > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Incident Coverage</h4>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {metrics.pendingTickets > 0 ? `${metrics.pendingTickets} Live active tickets` : 'All customer systems stable'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800 block">100%</span>
            <span className="text-[8px] uppercase tracking-wider text-slate-400">Response Rate</span>
          </div>
        </motion.div>

        {/* Card 6: Reporting & Analytics Trend Engine (Modern Slate Dark theme) */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="md:col-span-8 md:row-span-2 bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xs overflow-hidden"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Reporting & Analytics Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Historical realization and operational efficiency curve</p>
              </div>
              <button 
                onClick={() => onNavigate('infrastructure')}
                className="text-xs font-bold bg-slate-800 text-indigo-200 px-3 py-1.5 rounded-lg hover:bg-slate-750 transition-colors cursor-pointer"
              >
                Detailed BI Reporting
              </button>
            </div>

            <div className="h-44 text-xs mt-2 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => `£${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    formatter={(v) => [`£${v.toLocaleString()}`, 'Value']}
                  />
                  <Area name="Realized Milestone Revenue" type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 mt-4 text-xs">
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Resource Allocation</p>
              <p className="text-sm font-bold font-mono text-white mt-0.5">84% Optimal</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">SLA Guarantee rate</p>
              <p className="text-sm font-bold font-mono text-white mt-0.5">99.8% Perfect</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Compliance Checklist</p>
              <p className="text-sm font-bold font-mono text-emerald-400 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                SAFE / AUDITED
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
