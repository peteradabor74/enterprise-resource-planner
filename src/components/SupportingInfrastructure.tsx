/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QueuedNotification, DashboardMetrics } from '../types';
import { 
  Mail, 
  Send, 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Building,
  Briefcase,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface SupportingInfrastructureProps {
  notifications: QueuedNotification[];
  dashboardMetrics: DashboardMetrics;
  monthlyTrend: { month: string; revenue: number; expenses: number }[];
  clientRevenueShare: { name: string; title: string; value: number; revenueRecognized: number; status: string }[];
  onFlushQueue: () => Promise<void>;
  onRefresh: () => void;
}

const COLORS = ['#4f46e5', '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

export default function SupportingInfrastructure({
  notifications,
  dashboardMetrics,
  monthlyTrend,
  clientRevenueShare,
  onFlushQueue,
  onRefresh
}: SupportingInfrastructureProps) {
  const [activeTab, setActiveTab] = useState<'comms' | 'analytics'>('analytics');
  const [isFlushing, setIsFlushing] = useState(false);

  const handleFlush = async () => {
    setIsFlushing(true);
    await onFlushQueue();
    setIsFlushing(false);
  };

  const netIncome = dashboardMetrics.totalRevenue - dashboardMetrics.totalExpenses;

  return (
    <div className="space-y-6">
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              Reporting & Analytics
            </span>
          </button>
          <button
            onClick={() => setActiveTab('comms')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'comms'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Transactional Mail Queue ({notifications.filter(n => n.status === 'PENDING').length})
            </span>
          </button>
        </div>

        <div>
          {activeTab === 'comms' ? (
            <button
              onClick={handleFlush}
              disabled={isFlushing || notifications.filter(n => n.status === 'PENDING').length === 0}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {isFlushing ? 'Disbursing Queue...' : 'Dispatched Mail Now'}
            </button>
          ) : (
            <button
              onClick={onRefresh}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Recompile Data
            </button>
          )}
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <div className="space-y-6">
          {/* Executive Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="text-slate-400 text-xs font-semibold uppercase">Total Milestone Revenue</div>
              <div className="text-2xl font-bold text-slate-800 font-mono mt-1">£{dashboardMetrics.totalRevenue.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                Invoiced & Booked
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="text-slate-400 text-xs font-semibold uppercase">Workforce Salary Expenses</div>
              <div className="text-2xl font-bold text-slate-800 font-mono mt-1">£{dashboardMetrics.totalExpenses.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 font-medium mt-1.5">Disbursed payroll</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="text-slate-400 text-xs font-semibold uppercase">Operating Net Income</div>
              <div className={`text-2xl font-bold font-mono mt-1 ${netIncome >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                £{netIncome.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-1.5">Pre-tax corporate profit</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="text-slate-400 text-xs font-semibold uppercase">Operating Volumes</div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-medium text-slate-600">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{dashboardMetrics.activeContracts} Contracts</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{dashboardMetrics.totalEmployees} Employees</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{dashboardMetrics.pendingTickets} SLA Tickets</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{dashboardMetrics.pendingLeaves} Absences</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Bar chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Financial Core Performance Timeline</h3>
              <div className="h-72 text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyTrend}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `£${v/1000}k`} />
                    <Tooltip formatter={(v) => [`£${v.toLocaleString()}`, undefined]} labelStyle={{ color: '#334155', fontWeight: 'bold' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar name="Recognized Revenue" dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar name="Payroll Operating Outflow" dataKey="expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Contract Allocation Pie Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Contract Backlog Revenue Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2 h-72 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={clientRevenueShare}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {clientRevenueShare.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`£${v.toLocaleString()}`, 'Valuation']} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>

                <div className="md:col-span-1 space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {clientRevenueShare.map((entry, index) => (
                    <div key={entry.name} className="text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="truncate">{entry.name}</span>
                      </div>
                      <div className="pl-4 font-mono text-[10px] text-slate-400 font-semibold">
                        SLA Val: £{entry.value.toLocaleString()}
                        <br />
                        <span className="text-indigo-600">Billed: £{entry.revenueRecognized.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Comms Queue view */
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Transactional Messaging Dispatch logs</h2>
              <p className="text-xs text-slate-400">Asynchronous background communications queues (Email & SMS notifications)</p>
            </div>
          </div>

          <div className="space-y-4">
            {notifications.map((not) => (
              <div key={not.id} className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between gap-4 text-xs transition-colors">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-bold font-mono">
                      {not.type}
                    </span>
                    <span className="font-bold text-slate-700">Recipient: {not.recipient}</span>
                    <span className="text-slate-400 font-bold">•</span>
                    <span className="text-slate-400 font-semibold font-mono">Log: {not.id}</span>
                  </div>

                  {not.subject && (
                    <div className="font-bold text-slate-800 text-sm">Subject: {not.subject}</div>
                  )}
                  <p className="text-slate-600 leading-relaxed font-medium bg-white p-2.5 rounded-lg border border-slate-100 max-w-2xl">{not.body}</p>

                  <div className="text-[10px] text-slate-400 font-semibold">
                    Scheduled At: {new Date(not.scheduledAt).toLocaleString()}
                    {not.sentAt && ` • Delivered At: ${new Date(not.sentAt).toLocaleString()}`}
                  </div>
                </div>

                <div className="shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-bold text-[10px] uppercase ${
                    not.status === 'SENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                  }`}>
                    {not.status === 'SENT' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        Dispatched
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        Queued
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-12 text-slate-400 italic">No transactional logs compiled yet. Trigger operations above.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
