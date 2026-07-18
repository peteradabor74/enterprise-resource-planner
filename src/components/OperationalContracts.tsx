/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Contract, ProjectMilestone, SupportTicket, Message, User, ContractStatus, SlaLevel, BillingFrequency } from '../types';
import { 
  Briefcase, 
  Plus, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Send, 
  AlertCircle, 
  LifeBuoy, 
  DollarSign,
  FileSpreadsheet,
  ArrowRightLeft,
  ChevronRight,
  Printer
} from 'lucide-react';

interface OperationalContractsProps {
  currentUser: User;
  contracts: Contract[];
  milestones: ProjectMilestone[];
  tickets: SupportTicket[];
  users: User[];
  onAddContract: (data: any) => Promise<void>;
  onCompleteMilestone: (id: string) => Promise<any>;
  onSendMessage: (contractId: string, content: string) => Promise<void>;
  onAddTicket: (data: any) => Promise<void>;
  onUpdateTicketStatus: (id: string, status: any) => Promise<void>;
  activeContractId: string | null;
  setActiveContractId: (id: string | null) => void;
}

export default function OperationalContracts({
  currentUser,
  contracts,
  milestones,
  tickets,
  users,
  onAddContract,
  onCompleteMilestone,
  onSendMessage,
  onAddTicket,
  onUpdateTicketStatus,
  activeContractId,
  setActiveContractId
}: OperationalContractsProps) {
  // UI Tabs / Modals state
  const [activeTab, setActiveTab] = useState<'agreements' | 'tickets'>('agreements');
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [activeReceiptMilestone, setActiveReceiptMilestone] = useState<{ milestone: ProjectMilestone; contract: Contract } | null>(null);
  
  // New Contract Form State
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newValue, setNewValue] = useState(50000);
  const [newStart, setNewStart] = useState('2026-07-01');
  const [newEnd, setNewEnd] = useState('2027-06-30');
  const [newSla, setNewSla] = useState<SlaLevel>('SILVER');
  const [newBilling, setNewBilling] = useState<BillingFrequency>('MILESTONE');

  // New Support Ticket Form State
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newTicketContract, setNewTicketContract] = useState('');
  const [newTicketAssignee, setNewTicketAssignee] = useState('');

  // Active Contract Detail States
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [ledgerAuditInfo, setLedgerAuditInfo] = useState<any>(null);

  // Fetch contract chats
  const loadContractChat = async (contractId: string) => {
    try {
      const res = await fetch(`/api/contracts/${contractId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Failed to load messages', e);
    }
  };

  const handleContractSelect = (id: string) => {
    setActiveContractId(id);
    loadContractChat(id);
    setLedgerAuditInfo(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeContractId) return;
    
    await onSendMessage(activeContractId, newMessageText);
    setNewMessageText('');
    loadContractChat(activeContractId);
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newClient) return;

    await onAddContract({
      title: newTitle,
      clientName: newClient,
      value: Number(newValue),
      startDate: newStart,
      endDate: newEnd,
      status: 'PENDING',
      slaLevel: newSla,
      billingFrequency: newBilling
    });

    // Clear form
    setNewTitle('');
    setNewClient('');
    setShowAddContractModal(false);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle || !newTicketDesc || !newTicketContract || !newTicketAssignee) return;

    await onAddTicket({
      contractId: newTicketContract,
      title: newTicketTitle,
      description: newTicketDesc,
      priority: newTicketPriority,
      assignedTo: newTicketAssignee,
      status: 'OPEN'
    });

    setNewTicketTitle('');
    setNewTicketDesc('');
    setShowAddTicketModal(false);
  };

  const handleBillMilestone = async (milestoneId: string) => {
    const milestone = await onCompleteMilestone(milestoneId);
    if (milestone) {
      // Create visual ledger audit tracking feedback for double entry
      setLedgerAuditInfo({
        milestoneTitle: milestone.title,
        value: milestone.value,
        debitAccount: '1000-Cash (Operating Banking Account)',
        creditAccount: '4000-Revenue (Milestone Invoiced Revenue)',
        timestamp: new Date().toISOString()
      });
      // reload chat if the selected contract matches
      if (activeContractId) {
        loadContractChat(activeContractId);
      }
    }
  };

  const isContractOfficer = currentUser.role === 'ADMIN' || currentUser.role === 'CONTRACT_OFFICER' || currentUser.role === 'MANAGER';
  const selectedContract = contracts.find(c => c.id === activeContractId);
  const selectedContractMilestones = milestones.filter(m => m.contractId === activeContractId);

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('agreements')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'agreements'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Client Agreements & Billing
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'tickets'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <LifeBuoy className="w-3.5 h-3.5" />
              SLA Tickets ({tickets.filter(t => t.status !== 'RESOLVED').length})
            </span>
          </button>
        </div>

        <div>
          {activeTab === 'agreements' ? (
            <button
              onClick={() => setShowAddContractModal(true)}
              disabled={!isContractOfficer}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Initiate SLA Contract
            </button>
          ) : (
            <button
              onClick={() => setShowAddTicketModal(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Raise Support Incident
            </button>
          )}
        </div>
      </div>

      {activeTab === 'agreements' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 print:hidden">
          {/* Contracts List */}
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">SLA Customer Contracts</h3>
              <div className="divide-y divide-slate-50 max-h-[550px] overflow-y-auto pr-1">
                {contracts.map((c) => {
                  const isActive = activeContractId === c.id;
                  const contractMilestones = milestones.filter(m => m.contractId === c.id);
                  const completed = contractMilestones.filter(m => m.status === 'COMPLETED').length;
                  const total = contractMilestones.length;

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleContractSelect(c.id)}
                      className={`py-3.5 px-3 rounded-lg cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isActive
                          ? 'bg-indigo-50/50 border border-indigo-100/50'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 text-sm truncate">{c.clientName}</div>
                        <div className="text-xs text-slate-500 font-medium truncate mb-2">{c.title}</div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                            c.slaLevel === 'GOLD' ? 'bg-amber-100 text-amber-800' :
                            c.slaLevel === 'SILVER' ? 'bg-slate-100 text-slate-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {c.slaLevel} SLA
                          </span>
                          <span className="text-slate-400 font-bold">•</span>
                          <span className="text-indigo-600 font-semibold font-mono">£{c.value.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                          c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' :
                          c.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700' :
                          c.status === 'TERMINATED' ? 'bg-red-50 text-red-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {c.status}
                        </span>
                        {total > 0 && (
                          <div className="text-[10px] text-slate-400 font-medium">
                            Milestones: {completed}/{total}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contract Billing & Comms details */}
          <div className="xl:col-span-2 space-y-6">
            {selectedContract ? (
              <div className="space-y-6">
                {/* General Info & Ledgers Visual Hook */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase">
                        SLA Level: {selectedContract.slaLevel}
                      </span>
                      <h2 className="text-lg font-bold text-slate-800 mt-1">{selectedContract.title}</h2>
                      <p className="text-xs text-slate-500">Client Account: {selectedContract.clientName}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-slate-400">Total Valuation</div>
                      <div className="text-xl font-bold text-slate-800 font-mono">£{selectedContract.value.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Billing Model: {selectedContract.billingFrequency}</div>
                    </div>
                  </div>

                  {/* DOUBLE ENTRY LIVE BOOKING NOTIFICATION */}
                  {ledgerAuditInfo && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-xs animate-fadeIn">
                      <ArrowRightLeft className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-semibold text-emerald-800">Double-Entry Ledger Booked Successfully</p>
                        <p className="text-emerald-700">
                          Completion of <span className="font-semibold">{ledgerAuditInfo.milestoneTitle}</span> has automatically generated equal Debit and Credit accounts inside our Financial Monolith:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 bg-white/60 p-2.5 rounded-lg border border-emerald-100 font-mono text-[11px] text-slate-700">
                          <div>
                            <span className="font-bold text-indigo-700 uppercase">[DEBIT] Asset Account:</span>
                            <br />
                            {ledgerAuditInfo.debitAccount}
                            <br />
                            <span className="font-semibold text-slate-900">+£{ledgerAuditInfo.value.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="font-bold text-amber-700 uppercase">[CREDIT] Revenue Account:</span>
                            <br />
                            {ledgerAuditInfo.creditAccount}
                            <br />
                            <span className="font-semibold text-slate-900">+£{ledgerAuditInfo.value.toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-emerald-600 italic pt-1">
                          Audit Trail ID: tx-{Date.now().toString().slice(0, 8)} • Background notifications queued to Finance & CFO.
                        </p>
                      </div>
                    </div>
                  )}

                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                    Billing Milestones & General Ledger Triggers
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="pb-2">Milestone / Scope Details</th>
                          <th className="pb-2">Target Date</th>
                          <th className="pb-2 text-right">Value</th>
                          <th className="pb-2 text-right">Action Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs">
                        {selectedContractMilestones.map((milestone) => (
                          <tr key={milestone.id} className="hover:bg-slate-50/50">
                            <td className="py-3 font-semibold text-slate-700">{milestone.title}</td>
                            <td className="py-3 text-slate-500">{milestone.dueDate}</td>
                            <td className="py-3 text-right font-mono font-medium text-slate-800">£{milestone.value.toLocaleString()}</td>
                            <td className="py-3 text-right">
                              {milestone.status === 'COMPLETED' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-semibold text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Billed ({milestone.completedAt})
                                  </span>
                                  <button
                                    onClick={() => setActiveReceiptMilestone({ milestone, contract: selectedContract! })}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-indigo-600 rounded text-[11px] font-semibold border border-slate-200 transition-all cursor-pointer"
                                    title="Print Invoice / Reconciled Receipt"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                                    Receipt
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleBillMilestone(milestone.id)}
                                  disabled={!isContractOfficer}
                                  className="px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white disabled:opacity-50 disabled:hover:bg-indigo-50 disabled:hover:text-indigo-600 rounded text-[11px] font-semibold border border-indigo-100 hover:border-indigo-600 transition-all cursor-pointer"
                                  title="Mark complete to bill client and adjust ledger balances"
                                >
                                  Complete & Bill
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {selectedContractMilestones.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-slate-400 italic">No milestones defined for this contract.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Operations Chat Room */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">Project Operations Feed</h3>
                      <p className="text-xs text-slate-400">Collaborative timeline and transaction summaries</p>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 space-y-4 max-h-[300px] overflow-y-auto mb-4">
                    {messages.map((m) => {
                      const isMe = m.senderId === currentUser.id;
                      return (
                        <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="text-[10px] text-slate-400 font-medium mb-1">
                            {m.senderName} • {new Date(m.createdAt).toLocaleTimeString()}
                          </div>
                          <div className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                            isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-3xs'
                          }`}>
                            {m.content}
                          </div>
                        </div>
                      );
                    })}
                    {messages.length === 0 && (
                      <div className="text-center py-6 text-slate-400 italic text-xs">
                        No communication transcripts yet. Initiate discussion below.
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Share a milestone progress report, operational update or query..."
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 text-xs rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                    <button
                      type="submit"
                      className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm text-center">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-slate-800 text-lg">Operational Dashboard</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1">
                  Select an SLA Agreement from the sidebar directory to run customer billing triggers, review delivery milestones, or access the active communication logs.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Support Tickets Area */
        <div className="grid grid-cols-1 gap-6 print:hidden">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <LifeBuoy className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-800">Support Incidents & SLA Compliance</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">SLA Agreement / Customer</th>
                    <th className="pb-3">Support Ticket</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Assigned Analyst</th>
                    <th className="pb-3">Ticket Status</th>
                    <th className="pb-3 text-right">Escalation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {tickets.map((t) => {
                    const contract = contracts.find(c => c.id === t.contractId);
                    const analyst = users.find(u => u.id === t.assignedTo);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="py-4">
                          <div className="font-medium text-slate-900">{contract ? contract.clientName : 'Tyrell BioTech'}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{contract ? contract.title : 'External SLA'}</div>
                        </td>
                        <td className="py-4">
                          <div className="font-semibold text-slate-800">{t.title}</div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-sm">{t.description}</p>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.priority === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-100' :
                            t.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={analyst?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                              alt={analyst?.fullName || 'Analyst'}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="font-medium text-slate-600">{analyst ? analyst.fullName : 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            t.status === 'OPEN' ? 'bg-orange-50 text-orange-700 border border-orange-100 animate-pulse' :
                            t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {t.status === 'OPEN' && (
                              <button
                                onClick={() => onUpdateTicketStatus(t.id, 'IN_PROGRESS')}
                                className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 rounded hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                              >
                                Accept SLA
                              </button>
                            )}
                            {t.status !== 'RESOLVED' && (
                              <button
                                onClick={() => onUpdateTicketStatus(t.id, 'RESOLVED')}
                                className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                              >
                                Resolve Incident
                              </button>
                            )}
                            {t.status === 'RESOLVED' && (
                              <span className="text-slate-400 italic">SLA Met</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SLA Contract Modal */}
      {showAddContractModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl max-w-md w-full p-6 animate-scaleIn">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Draft SLA Service Agreement</h3>
            <form onSubmit={handleCreateContract} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Contract / Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infrastructure Disaster Recovery SLA"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Client Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wayne Enterprises"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Valuation (£ GBP)</label>
                  <input
                    type="number"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">SLA Tier</label>
                  <select
                    value={newSla}
                    onChange={(e) => setNewSla(e.target.value as SlaLevel)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
                  >
                    <option value="GOLD">GOLD (Highest Priority)</option>
                    <option value="SILVER">SILVER (Standard SLA)</option>
                    <option value="BRONZE">BRONZE (Basic Support)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Billing Milestones Mode</label>
                <select
                  value={newBilling}
                  onChange={(e) => setNewBilling(e.target.value as BillingFrequency)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                >
                  <option value="MILESTONE">Milestone Completed Billing</option>
                  <option value="MONTHLY">Monthly Flat Billing</option>
                  <option value="ONCE">Upfront Single Billing</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddContractModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Execute SLA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support Ticket Modal */}
      {showAddTicketModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl max-w-md w-full p-6 animate-scaleIn">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Raise Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Customer SLA Agreement</label>
                <select
                  required
                  value={newTicketContract}
                  onChange={(e) => setNewTicketContract(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden"
                >
                  <option value="">-- Choose Contract --</option>
                  {contracts.map(c => (
                    <option key={c.id} value={c.id}>{c.clientName} - {c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Incident Headline / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SSL Certificate Expiry Alert on Main Gateway"
                  value={newTicketTitle}
                  onChange={(e) => setNewTicketTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Detailed Log / Description</label>
                <textarea
                  required
                  placeholder="Describe the issue, including error logs or symptoms..."
                  value={newTicketDesc}
                  onChange={(e) => setNewTicketDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Incident Priority</label>
                  <select
                    value={newTicketPriority}
                    onChange={(e) => setNewTicketPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  >
                    <option value="HIGH">HIGH (Urgent SLA Breach)</option>
                    <option value="MEDIUM">MEDIUM (Standard Incident)</option>
                    <option value="LOW">LOW (Non-impact update)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assign Analyst</label>
                  <select
                    required
                    value={newTicketAssignee}
                    onChange={(e) => setNewTicketAssignee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  >
                    <option value="">-- Choose Staff --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTicketModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Dispatch Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {activeReceiptMilestone && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:bg-white print:fixed print:inset-0 print:p-0 print:z-55">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-scaleIn print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full">
            
            {/* Header / Receipt Metadata */}
            <div className="flex justify-between items-start border-b-2 border-dashed border-slate-200 pb-5 mb-5 print:border-slate-300">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs">ERP</div>
                  <span className="font-extrabold text-slate-800 text-sm tracking-tight font-sans">AETHERIS ENTERPRISE</span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Transaction Receipt</p>
                <p className="text-[10px] text-slate-500">VAT Registration No: GB 123 4567 89</p>
              </div>
              <div className="text-right space-y-0.5">
                <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-full border border-emerald-100 uppercase print:border-slate-300">
                  RECONCILED
                </span>
                <p className="text-[10px] text-slate-400 font-mono">ID: REC-2026-{activeReceiptMilestone.milestone.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-[10px] text-slate-500 font-mono">{activeReceiptMilestone.milestone.completedAt || new Date().toISOString().split('T')[0]}</p>
              </div>
            </div>

            {/* Bill To & SLA Details */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100 print:bg-white print:border-slate-200">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">CLIENT ACCOUNT</p>
                <p className="font-bold text-slate-800 text-sm">{activeReceiptMilestone.contract.clientName}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">SLA Tier: {activeReceiptMilestone.contract.slaLevel}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">CONTRACT / PROJECT</p>
                <p className="font-semibold text-slate-700 truncate">{activeReceiptMilestone.contract.title}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Billing Terms: {activeReceiptMilestone.contract.billingFrequency}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="space-y-3 mb-6">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Itemized Ledger Charges</p>
              <div className="border border-slate-100 rounded-lg overflow-hidden print:border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100/50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider print:bg-slate-50">
                      <th className="p-2.5">Scope / Completed Milestone</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-2.5">
                        <span className="font-semibold">{activeReceiptMilestone.milestone.title}</span>
                        <p className="text-[9px] text-slate-400 mt-0.5">SLA milestone met & certified</p>
                      </td>
                      <td className="p-2.5 text-center font-mono">1</td>
                      <td className="p-2.5 text-right font-mono">£{activeReceiptMilestone.milestone.value.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-mono font-semibold">£{activeReceiptMilestone.milestone.value.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Block */}
            <div className="flex justify-end mb-6">
              <div className="w-1/2 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">£{activeReceiptMilestone.milestone.value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>VAT (0% Exempt):</span>
                  <span className="font-mono">£0.00</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between text-slate-800 font-extrabold text-sm">
                  <span>Total Reconciled:</span>
                  <span className="font-mono text-indigo-600 font-bold">£{activeReceiptMilestone.milestone.value.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* General Ledger Postings References */}
            <div className="border border-slate-150 rounded-xl p-3 bg-slate-50/50 text-[11px] mb-6 print:bg-white print:border-slate-200">
              <p className="font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[9px] flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3 text-emerald-600" />
                Dual-Entry Ledger Reconciliations
              </p>
              <div className="grid grid-cols-2 gap-3 text-slate-600 font-mono text-[10px]">
                <div>
                  <span className="text-indigo-600 font-bold">[DEBIT]</span> Cash Asset Account
                  <p className="text-slate-800 font-semibold mt-0.5">1000-Cash (Operating Banking Account)</p>
                  <p className="text-slate-900 font-bold mt-0.5">+£{activeReceiptMilestone.milestone.value.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-amber-600 font-bold">[CREDIT]</span> Revenue Account
                  <p className="text-slate-800 font-semibold mt-0.5">4000-Revenue (Milestone Invoiced Revenue)</p>
                  <p className="text-slate-900 font-bold mt-0.5">+£{activeReceiptMilestone.milestone.value.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Receipt Footer Info */}
            <div className="text-center text-[10px] text-slate-400 space-y-1 border-t border-slate-100 pt-4 mb-6 print:border-slate-200 print:text-slate-500">
              <p className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">Aetheris Monolith Ltd</p>
              <p>Level 42, The Shard, 32 London Bridge St, London SE1 9SG</p>
              <p>Support: support@enterprise.com • Web: enterprise-monolith.io</p>
            </div>

            {/* Action Buttons (Hidden on Print) */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 print:hidden">
              <button
                type="button"
                onClick={() => setActiveReceiptMilestone(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Receipt
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
