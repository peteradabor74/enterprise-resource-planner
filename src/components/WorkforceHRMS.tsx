/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, EmployeeProfile, LeaveRequest, PayrollRun, AttendanceRecord } from '../types';
import { 
  Users2, 
  Plus, 
  Calendar, 
  Check, 
  X, 
  DollarSign, 
  Building2, 
  FileText, 
  Landmark, 
  ArrowRightLeft,
  Briefcase,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  List,
  LayoutGrid,
  Search,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';

interface WorkforceHRMSProps {
  currentUser: User;
  employees: (EmployeeProfile & { fullName: string; email: string; department: string; status: string; role: string })[];
  leaves: LeaveRequest[];
  payrollRuns: PayrollRun[];
  users: User[];
  attendance?: AttendanceRecord[];
  onMarkAttendance: (data: any) => Promise<void>;
  onAddLeaveRequest: (data: any) => Promise<void>;
  onApproveLeave: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
  onExecutePayroll: (period: string) => Promise<any>;
  onAddEmployee: (data: any) => Promise<void>;
  onUpdateEmployee: (id: string, data: any) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<boolean>;
}

export default function WorkforceHRMS({
  currentUser,
  employees,
  leaves,
  payrollRuns,
  users,
  attendance = [],
  onMarkAttendance,
  onAddLeaveRequest,
  onApproveLeave,
  onExecutePayroll,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee
}: WorkforceHRMSProps) {
  const [activeTab, setActiveTab] = useState<'roster' | 'leaves' | 'payroll' | 'attendance'>('roster');
  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);

  // Attendance Form & Filters State
  const [attEmployeeId, setAttEmployeeId] = useState('');
  const [attDate, setAttDate] = useState('2026-07-17');
  const [attStatus, setAttStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE' | 'REMOTE'>('PRESENT');
  const [attCheckIn, setAttCheckIn] = useState('09:00:00');
  const [attCheckOut, setAttCheckOut] = useState('17:00:00');
  const [attNotes, setAttNotes] = useState('');
  const [attSearchQuery, setAttSearchQuery] = useState('');

  // Search & View modes for employee roster
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list'); // Default to list view as requested
  
  // Modals for employee CRUD
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<any | null>(null);
  
  // Employee Form fields (Add & Edit)
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formRole, setFormRole] = useState<'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'FINANCE_OFFICER' | 'CONTRACT_OFFICER'>('EMPLOYEE');
  const [formDepartment, setFormDepartment] = useState<'EXECUTIVE' | 'HR' | 'FINANCE' | 'SALES' | 'ENGINEERING' | 'SUPPORT'>('SUPPORT');
  const [formSeniority, setFormSeniority] = useState<'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE'>('MID');
  const [formSalary, setFormSalary] = useState(4000);
  const [formJoinDate, setFormJoinDate] = useState('2026-07-17');
  const [formBankDetails, setFormBankDetails] = useState('');
  const [formReportsTo, setFormReportsTo] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

  const openAddEmployeeModal = () => {
    setFormFullName('');
    setFormEmail('');
    setFormTitle('');
    setFormRole('EMPLOYEE');
    setFormDepartment('SUPPORT');
    setFormSeniority('MID');
    setFormSalary(4000);
    setFormJoinDate(new Date().toISOString().split('T')[0]);
    setFormBankDetails('');
    setFormReportsTo('');
    setFormStatus('ACTIVE');
    setShowAddEmployeeModal(true);
  };

  const openEditEmployeeModal = (emp: any) => {
    setEditingEmployeeId(emp.id);
    setFormFullName(emp.fullName || '');
    setFormEmail(emp.email || '');
    setFormTitle(emp.title || '');
    setFormRole(emp.role || 'EMPLOYEE');
    setFormDepartment(emp.department || 'SUPPORT');
    setFormSeniority(emp.seniority || 'MID');
    setFormSalary(emp.salary || 4000);
    setFormJoinDate(emp.joinDate || '');
    setFormBankDetails(emp.bankDetails || '');
    setFormReportsTo(emp.reportsTo || '');
    setFormStatus(emp.status || 'ACTIVE');
    setShowEditEmployeeModal(true);
  };

  const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName || !formEmail || !formTitle) {
      alert('Please fill out all required fields.');
      return;
    }
    await onAddEmployee({
      fullName: formFullName,
      email: formEmail,
      title: formTitle,
      role: formRole,
      department: formDepartment,
      seniority: formSeniority,
      salary: Number(formSalary),
      joinDate: formJoinDate,
      bankDetails: formBankDetails,
      reportsTo: formReportsTo || undefined,
      status: formStatus
    });
    setShowAddEmployeeModal(false);
  };

  const handleEditEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployeeId) return;
    if (!formFullName || !formEmail || !formTitle) {
      alert('Please fill out all required fields.');
      return;
    }
    await onUpdateEmployee(editingEmployeeId, {
      fullName: formFullName,
      email: formEmail,
      title: formTitle,
      role: formRole,
      department: formDepartment,
      seniority: formSeniority,
      salary: Number(formSalary),
      joinDate: formJoinDate,
      bankDetails: formBankDetails,
      reportsTo: formReportsTo || undefined,
      status: formStatus
    });
    setShowEditEmployeeModal(false);
    setEditingEmployeeId(null);
  };

  const handleDeleteEmployeeClick = async (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to completely deprovision employee "${name}" from all registries?`)) {
      await onDeleteEmployee(id);
    }
  };
  
  // Leave request form state
  const [leaveType, setLeaveType] = useState<'SICK' | 'VACATION' | 'PERSONAL'>('VACATION');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-10');
  const [reason, setReason] = useState('');

  // Payroll form state
  const [payrollPeriod, setPayrollPeriod] = useState('2026-07');
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollSuccessInfo, setPayrollSuccessInfo] = useState<any>(null);

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    await onAddLeaveRequest({
      employeeId: currentUser.id,
      startDate,
      endDate,
      leaveType,
      reason
    });

    setReason('');
    setShowAddLeaveModal(false);
  };

  const handleRunPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayrollLoading(true);
    setPayrollSuccessInfo(null);

    const result = await onExecutePayroll(payrollPeriod);
    if (result && !result.error) {
      setPayrollSuccessInfo({
        period: result.period,
        amountPaid: result.amountPaid,
        debitAccount: '5000-PayrollExpense (Workforce Salaries Expense)',
        creditAccount: '1000-Cash (Corporate Operating Bank Account)',
        runDate: result.runDate
      });
    } else if (result && result.error) {
      alert(result.error);
    }
    setPayrollLoading(false);
  };

  const handleMarkAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attEmployeeId) {
      alert('Please select a staff member first.');
      return;
    }
    const emp = employees.find(e => e.id === attEmployeeId);
    if (!emp) {
      alert('Selected staff member not found in roster.');
      return;
    }
    await onMarkAttendance({
      employeeId: attEmployeeId,
      employeeName: emp.fullName,
      date: attDate,
      checkIn: attCheckIn,
      checkOut: attCheckOut || undefined,
      status: attStatus,
      notes: attNotes
    });
    setAttNotes('');
  };

  const handleSelfClockIn = async () => {
    const timeStr = new Date().toTimeString().split(' ')[0]; // HH:MM:SS
    await onMarkAttendance({
      employeeId: currentUser.id,
      employeeName: currentUser.fullName,
      date: '2026-07-17', // Today's simulated date
      checkIn: timeStr,
      status: 'PRESENT',
      notes: 'Self clock-in via Workforce DevConsole'
    });
  };

  const handleSelfClockOut = async (myTodayRecord: AttendanceRecord) => {
    const timeStr = new Date().toTimeString().split(' ')[0]; // HH:MM:SS
    await onMarkAttendance({
      ...myTodayRecord,
      checkOut: timeStr,
      notes: myTodayRecord.notes ? `${myTodayRecord.notes} (Clocked out at ${timeStr})` : `Clocked out at ${timeStr}`
    });
  };

  const isHRManager = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER' || currentUser.department === 'HR';
  const isCFO = currentUser.role === 'ADMIN' || currentUser.role === 'FINANCE_OFFICER';

  return (
    <div className="space-y-6">
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'roster'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5" />
              Roster & Profile Cards
            </span>
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'leaves'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Absence Requests ({leaves.filter(l => l.status === 'PENDING').length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'payroll'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Payroll Runs
            </span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'attendance'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Attendance Logs
            </span>
          </button>
        </div>

        <div className="flex gap-2">
          {activeTab === 'roster' && isHRManager && (
            <button
              onClick={openAddEmployeeModal}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Add Employee
            </button>
          )}
          {activeTab === 'leaves' && (
            <button
              onClick={() => setShowAddLeaveModal(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Request Leave Block
            </button>
          )}
        </div>
      </div>

      {activeTab === 'roster' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Company Hierarchy & Staff Clearance</h2>
              <p className="text-xs text-slate-400">Payroll parameters and structural reporting channels</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff by name, title, department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-slate-50/50"
                />
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-lg shrink-0">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-indigo-600 shadow-3xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white text-indigo-600 shadow-3xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Cards View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {(() => {
            const filteredEmployees = employees.filter(emp => 
              emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              emp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
              emp.email.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredEmployees.length === 0) {
              return (
                <div className="py-12 text-center text-slate-500">
                  <p className="text-sm font-medium">No employees found matching "{searchQuery}"</p>
                  <p className="text-xs text-slate-400 mt-1">Try refining your search keyword</p>
                </div>
              );
            }

            if (viewMode === 'list') {
              return (
                <div className="overflow-x-auto -mx-6">
                  <div className="inline-block min-w-full align-middle px-6">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                          <th className="py-3 px-4 rounded-l-lg">Staff Member</th>
                          <th className="py-3 px-4">Title & Grade</th>
                          <th className="py-3 px-4">Department</th>
                          <th className="py-3 px-4">Reporting Line</th>
                          <th className="py-3 px-4">Base Salary</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right rounded-r-lg">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredEmployees.map((emp) => {
                          const manager = users.find(u => u.id === emp.reportsTo);
                          const userObj = users.find(u => u.id === emp.id);
                          return (
                            <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors text-xs text-slate-600">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={userObj?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                                    alt={emp.fullName}
                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                                  />
                                  <div>
                                    <div className="font-semibold text-slate-800">{emp.fullName}</div>
                                    <div className="text-[10px] text-slate-400">{emp.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-medium">
                                <div>{emp.title}</div>
                                <div className="text-[10px] text-slate-400 font-mono capitalize">{emp.role.toLowerCase()}</div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-sm font-bold uppercase font-mono">
                                  {emp.department}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-700">
                                {manager ? manager.fullName : 'Independent / Board'}
                              </td>
                              <td className="py-3 px-4 font-mono font-medium">
                                {isHRManager || isCFO || emp.id === currentUser.id 
                                  ? `£${emp.salary.toLocaleString()}/mo` 
                                  : '••••••'}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  emp.status === 'ACTIVE' 
                                    ? 'bg-emerald-50 text-emerald-700' 
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {emp.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setViewingEmployee(emp)}
                                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openEditEmployeeModal(emp)}
                                    className={`p-1.5 rounded-lg transition-all ${
                                      isHRManager 
                                        ? 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100 cursor-pointer' 
                                        : 'text-slate-300 cursor-not-allowed opacity-50'
                                    }`}
                                    disabled={!isHRManager}
                                    title={isHRManager ? "Edit Employee" : "HR Clearance Required"}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEmployeeClick(emp.id, emp.fullName)}
                                    className={`p-1.5 rounded-lg transition-all ${
                                      isHRManager && emp.id !== currentUser.id
                                        ? 'text-slate-500 hover:text-rose-600 hover:bg-slate-100 cursor-pointer' 
                                        : 'text-slate-300 cursor-not-allowed opacity-50'
                                    }`}
                                    disabled={!isHRManager || emp.id === currentUser.id}
                                    title={
                                      emp.id === currentUser.id 
                                        ? "Cannot Delete Yourself" 
                                        : isHRManager 
                                          ? "Delete Employee" 
                                          : "HR Clearance Required"
                                    }
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            // Cards View
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEmployees.map((emp) => {
                  const manager = users.find(u => u.id === emp.reportsTo);
                  const userObj = users.find(u => u.id === emp.id);
                  return (
                    <div key={emp.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/30 hover:border-indigo-200 hover:bg-slate-50/60 transition-all flex flex-col justify-between space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3.5">
                          <img
                            src={userObj?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                            alt={emp.fullName}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm">{emp.fullName}</h3>
                            <p className="text-xs text-slate-500 font-medium">{emp.title}</p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-sm font-bold uppercase font-mono">
                                {emp.department}
                              </span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm font-bold font-mono">
                                {emp.role}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                          emp.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {emp.status}
                        </span>
                      </div>

                      <div className="border-t border-slate-100 pt-3.5 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Reporting Line:</span>
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            {manager ? manager.fullName : 'Independent / Board'}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Clearance Base Salary:</span>
                          <span className="font-mono font-semibold text-slate-800">
                            {isHRManager || isCFO || emp.id === currentUser.id 
                              ? `£${emp.salary.toLocaleString()} / mo` 
                              : '•••••• [Protected]'}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Employee Since:</span>
                          <span className="text-slate-600 font-medium">{emp.joinDate}</span>
                        </div>

                        <div className="flex justify-between items-start">
                          <span className="text-slate-400 font-medium shrink-0">Disbursement Bank:</span>
                          <span className="font-mono text-slate-500 text-[10px] text-right truncate max-w-[160px]" title={emp.bankDetails}>
                            {isHRManager || isCFO || emp.id === currentUser.id 
                              ? emp.bankDetails 
                              : '••••••••••••'}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3 flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingEmployee(emp)}
                          className="px-2 py-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => openEditEmployeeModal(emp)}
                          className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                            isHRManager 
                              ? 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100 cursor-pointer' 
                              : 'text-slate-300 cursor-not-allowed opacity-50'
                          }`}
                          disabled={!isHRManager}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEmployeeClick(emp.id, emp.fullName)}
                          className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                            isHRManager && emp.id !== currentUser.id
                              ? 'text-slate-500 hover:text-rose-600 hover:bg-slate-100 cursor-pointer' 
                              : 'text-slate-300 cursor-not-allowed opacity-50'
                          }`}
                          disabled={!isHRManager || emp.id === currentUser.id}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Absence & Leave Approval Flow</h2>
            <p className="text-xs text-slate-400">Departmental absence coverage calendars</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Staff Member</th>
                  <th className="pb-3">Absence Block</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Submittal Reason</th>
                  <th className="pb-3">Clearance Status</th>
                  <th className="pb-3 text-right pr-2">HR Management Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {leaves.map((leave) => {
                  const empUser = users.find(u => u.id === leave.employeeId);
                  return (
                    <tr key={leave.id} className="hover:bg-slate-50/50">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={empUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                            alt={leave.employeeName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="font-semibold text-slate-800">{leave.employeeName}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="font-medium text-slate-600">{leave.startDate} to {leave.endDate}</span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          leave.leaveType === 'VACATION' ? 'bg-indigo-50 text-indigo-700' :
                          leave.leaveType === 'SICK' ? 'bg-red-50 text-red-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="py-4 max-w-xs truncate text-slate-500" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-bold text-[10px] uppercase ${
                          leave.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          leave.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        {leave.status === 'PENDING' ? (
                          isHRManager ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => onApproveLeave(leave.id, 'APPROVED')}
                                className="p-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded border border-emerald-100 transition-colors cursor-pointer"
                                title="Approve Leave Request"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onApproveLeave(leave.id, 'REJECTED')}
                                className="p-1 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded border border-red-100 transition-colors cursor-pointer"
                                title="Reject Leave Request"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">HR approval required</span>
                          )
                        ) : (
                          <span className="text-slate-400 italic">Decided</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Dispatch Center */}
          <div className="xl:col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-fit">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Automated Payroll Dispatch</h3>
                <p className="text-xs text-slate-400">Disburse workforce bank clearances</p>
              </div>
            </div>

            {/* General info */}
            <div className="mb-6 text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <p className="font-semibold text-slate-800">Monolith Financial Integrity Check:</p>
              <p>
                Triggering a monthly payroll automatically sums all currently active employees base salaries. Upon CFO or Executive clearance, a general ledger offset is immediately recorded.
              </p>
            </div>

            {payrollSuccessInfo && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-xs">
                <ArrowRightLeft className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-emerald-800">Payroll General Ledger Offset</p>
                  <p className="text-emerald-700">
                    Disbursement of <span className="font-bold">£{payrollSuccessInfo.amountPaid.toLocaleString()}</span> for period {payrollSuccessInfo.period} was logged:
                  </p>
                  <div className="space-y-1.5 mt-2 bg-white/60 p-2 rounded-lg border border-emerald-100 font-mono text-[10px] text-slate-700">
                    <div>
                      <span className="font-bold text-red-700">[DEBIT] Expense Account:</span>
                      <br />
                      {payrollSuccessInfo.debitAccount}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">[CREDIT] Cash Asset Asset:</span>
                      <br />
                      {payrollSuccessInfo.creditAccount}
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-600 italic pt-1">
                    Worker salaries dispatched. Employee payslip transactional emails queued.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleRunPayroll} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Billing/Salary Period</label>
                <select
                  value={payrollPeriod}
                  onChange={(e) => setPayrollPeriod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 font-semibold"
                >
                  <option value="2026-06">June 2026</option>
                  <option value="2026-07">July 2026</option>
                  <option value="2026-08">August 2026</option>
                </select>
              </div>

              {isCFO ? (
                <button
                  type="submit"
                  disabled={payrollLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {payrollLoading ? 'Processing Ledger Books...' : 'Verify & Disburse Salaries'}
                </button>
              ) : (
                <div className="p-3 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-100 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Only members with CFO or Admin credentials have clearance to execute payroll distributions.</span>
                </div>
              )}
            </form>
          </div>

          {/* Historical Run Audit Column */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Disbursement Registry Logs</h3>
                  <p className="text-xs text-slate-400">Historical corporate salary audit trail</p>
                </div>
              </div>

              <div className="space-y-3">
                {payrollRuns.map((run) => (
                  <div key={run.id} className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs transition-all">
                    <div>
                      <div className="font-bold text-slate-800">Payroll Cycle: {run.period}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Disburse Date: {run.runDate}</div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-slate-800 font-mono">£{run.amountPaid.toLocaleString()}</div>
                        <div className="text-[9px] text-indigo-600 font-semibold uppercase">Total Dispatch</div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                        run.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                      }`}>
                        {run.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs">
              <Landmark className="w-4 h-4" />
              <span>Full compliance double-entry ledger tracing active</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left/Form Column */}
          <div className="space-y-6">
            {/* Quick Self Clock */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Your Daily Desk Clock
              </h3>
              
              {(() => {
                const todayRecord = attendance.find(
                  r => r.employeeId === currentUser.id && r.date === '2026-07-17'
                );
                return (
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col items-center text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Simulated Today</span>
                      <span className="text-xl font-mono font-bold text-slate-800 mt-1">2026-07-17</span>
                      
                      <div className="mt-4 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${todayRecord ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className="text-xs font-semibold text-slate-600">
                          {todayRecord ? (
                            todayRecord.checkOut ? `Fully Clocked: ${todayRecord.checkIn} - ${todayRecord.checkOut}` : `Active Duty: Checked-in at ${todayRecord.checkIn}`
                          ) : 'Not Clocked In Today'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSelfClockIn}
                        disabled={!!todayRecord}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          todayRecord 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs'
                        }`}
                      >
                        Clock In
                      </button>
                      <button
                        onClick={() => todayRecord && handleSelfClockOut(todayRecord)}
                        disabled={!todayRecord || !!todayRecord.checkOut}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          (!todayRecord || !!todayRecord.checkOut)
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs'
                        }`}
                      >
                        Clock Out
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Admin/Manager Mark Attendance Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Register Attendance</h3>
                  <p className="text-[10px] text-slate-400">Record custom employee presence records</p>
                </div>
              </div>

              <form onSubmit={handleMarkAttendanceSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Employee *</label>
                  <select
                    required
                    value={attEmployeeId}
                    onChange={(e) => {
                      setAttEmployeeId(e.target.value);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
                  >
                    <option value="">-- Choose Staff Member --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.title})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Log Date</label>
                    <input
                      type="date"
                      required
                      value={attDate}
                      onChange={(e) => setAttDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Duty Status</label>
                    <select
                      value={attStatus}
                      onChange={(e) => setAttStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
                    >
                      <option value="PRESENT">Present (In Office)</option>
                      <option value="REMOTE">Remote (WFH)</option>
                      <option value="LATE">Late (Tardy)</option>
                      <option value="ABSENT">Unexcused Absence</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Check In Time</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 09:00:00"
                      value={attCheckIn}
                      onChange={(e) => setAttCheckIn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Check Out Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 17:00:00"
                      value={attCheckOut}
                      onChange={(e) => setAttCheckOut(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Operational Duty Notes</label>
                  <textarea
                    placeholder="Describe tasks completed, reasons for tardiness or WFH project codes..."
                    value={attNotes}
                    onChange={(e) => setAttNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 h-20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Post Operational Attendance
                </button>
              </form>
            </div>
          </div>

          {/* Right/List Column */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Attendance registry logs</h3>
                  <p className="text-[10px] text-slate-400">Enterprise desk access audit trail</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search logs by staff name..."
                    value={attSearchQuery}
                    onChange={(e) => setAttSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="space-y-3.5 overflow-y-auto max-h-[60vh]">
                {(() => {
                  const filteredAttendance = attendance.filter(rec =>
                    rec.employeeName.toLowerCase().includes(attSearchQuery.toLowerCase())
                  );

                  if (filteredAttendance.length === 0) {
                    return (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        No attendance logs match your search.
                      </div>
                    );
                  }

                  return filteredAttendance.map((rec) => (
                    <div key={rec.id} className="p-4 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 uppercase border border-slate-300">
                          {rec.employeeName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{rec.employeeName}</div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <span className="font-semibold">{rec.date}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {rec.checkIn} - {rec.checkOut || 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center sm:justify-end gap-3 shrink-0">
                        {rec.notes && (
                          <span className="max-w-xs text-[10px] text-slate-500 bg-white border border-slate-100 p-1.5 rounded-lg italic">
                            "{rec.notes}"
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                          rec.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          rec.status === 'LATE' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          rec.status === 'REMOTE' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {rec.status}
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Duty verification systems synchronized with payroll calculations</span>
            </div>
          </div>
        </div>
      )}

      {/* Leave Request modal */}
      {showAddLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl max-w-md w-full p-6 animate-scaleIn">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Request Absence Clearance</h3>
            <form onSubmit={handleCreateLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Absence Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800 font-medium"
                >
                  <option value="VACATION">Vacation Block</option>
                  <option value="SICK">Medical/Sick Leave</option>
                  <option value="PERSONAL">Personal/Compassionate Day</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Absence Start</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Absence End</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reason / Coverage Outline</label>
                <textarea
                  required
                  placeholder="Outline your absence reasons and which team member will cover your responsibilities..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 h-24 font-medium"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLeaveModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl max-w-lg w-full p-6 animate-scaleIn max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Employee Profile</h3>
            <form onSubmit={handleAddEmployeeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="j.doe@enterprise.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Corporate Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Senior Operations Lead"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">System Security Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800 font-medium"
                  >
                    <option value="EMPLOYEE">Employee (Standard Staff)</option>
                    <option value="MANAGER">Manager (Line Approver)</option>
                    <option value="FINANCE_OFFICER">Finance Officer (Payroll Cleared)</option>
                    <option value="CONTRACT_OFFICER">Contract Officer</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800 font-medium"
                  >
                    <option value="SUPPORT">Support</option>
                    <option value="ENGINEERING">Engineering</option>
                    <option value="SALES">Sales</option>
                    <option value="FINANCE">Finance</option>
                    <option value="HR">HR</option>
                    <option value="EXECUTIVE">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Seniority Grade</label>
                  <select
                    value={formSeniority}
                    onChange={(e) => setFormSeniority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800 font-medium"
                  >
                    <option value="JUNIOR">Junior</option>
                    <option value="MID">Mid Level</option>
                    <option value="SENIOR">Senior</option>
                    <option value="LEAD">Team Lead</option>
                    <option value="EXECUTIVE">Executive Director</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Base Salary (GBP/mo)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formSalary}
                    onChange={(e) => setFormSalary(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Corporate Join Date</label>
                  <input
                    type="date"
                    required
                    value={formJoinDate}
                    onChange={(e) => setFormJoinDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reports To / Manager</label>
                  <select
                    value={formReportsTo}
                    onChange={(e) => setFormReportsTo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800 font-medium"
                  >
                    <option value="">None (Independent / Board)</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.title})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Disbursement Bank Details</label>
                <input
                  type="text"
                  placeholder="e.g. IBAN: GB99 WEST 1234 5678 9012 34"
                  value={formBankDetails}
                  onChange={(e) => setFormBankDetails(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Employment Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800 font-medium"
                >
                  <option value="ACTIVE">ACTIVE (Onboarded)</option>
                  <option value="INACTIVE">INACTIVE (Offboarded/Suspended)</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee modal */}
      {showEditEmployeeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl max-w-lg w-full p-6 animate-scaleIn max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Employee Profile</h3>
            <form onSubmit={handleEditEmployeeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Corporate Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">System Security Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800 font-medium"
                  >
                    <option value="EMPLOYEE">Employee (Standard Staff)</option>
                    <option value="MANAGER">Manager (Line Approver)</option>
                    <option value="FINANCE_OFFICER">Finance Officer (Payroll Cleared)</option>
                    <option value="CONTRACT_OFFICER">Contract Officer</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800 font-medium"
                  >
                    <option value="SUPPORT">Support</option>
                    <option value="ENGINEERING">Engineering</option>
                    <option value="SALES">Sales</option>
                    <option value="FINANCE">Finance</option>
                    <option value="HR">HR</option>
                    <option value="EXECUTIVE">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Seniority Grade</label>
                  <select
                    value={formSeniority}
                    onChange={(e) => setFormSeniority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800 font-medium"
                  >
                    <option value="JUNIOR">Junior</option>
                    <option value="MID">Mid Level</option>
                    <option value="SENIOR">Senior</option>
                    <option value="LEAD">Team Lead</option>
                    <option value="EXECUTIVE">Executive Director</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Base Salary (GBP/mo)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formSalary}
                    onChange={(e) => setFormSalary(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Corporate Join Date</label>
                  <input
                    type="date"
                    required
                    value={formJoinDate}
                    onChange={(e) => setFormJoinDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reports To / Manager</label>
                  <select
                    value={formReportsTo}
                    onChange={(e) => setFormReportsTo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800 font-medium"
                  >
                    <option value="">None (Independent / Board)</option>
                    {employees.filter(emp => emp.id !== editingEmployeeId).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.title})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Disbursement Bank Details</label>
                <input
                  type="text"
                  value={formBankDetails}
                  onChange={(e) => setFormBankDetails(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Employment Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden text-slate-800 font-medium"
                >
                  <option value="ACTIVE">ACTIVE (Onboarded)</option>
                  <option value="INACTIVE">INACTIVE (Offboarded/Suspended)</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditEmployeeModal(false);
                    setEditingEmployeeId(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Detail Modal */}
      {viewingEmployee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl max-w-md w-full p-6 animate-scaleIn">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-800">Employee Corporate Record</h3>
              <button 
                onClick={() => setViewingEmployee(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 mb-6">
              <img
                src={users.find(u => u.id === viewingEmployee.id)?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                alt={viewingEmployee.fullName}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-50 mb-3"
              />
              <h4 className="font-bold text-slate-800 text-base">{viewingEmployee.fullName}</h4>
              <p className="text-xs text-indigo-600 font-semibold">{viewingEmployee.title}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">{viewingEmployee.email}</p>

              <div className="flex items-center gap-1.5 mt-3">
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                  {viewingEmployee.department}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold font-mono">
                  {viewingEmployee.role}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  viewingEmployee.status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {viewingEmployee.status}
                </span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Seniority Grade:</span>
                <span className="font-bold text-slate-700 capitalize">{viewingEmployee.seniority.toLowerCase()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Reporting Line:</span>
                <span className="font-bold text-slate-700">
                  {users.find(u => u.id === viewingEmployee.reportsTo)?.fullName || 'Independent / Board'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Clearance Base Salary:</span>
                <span className="font-mono font-bold text-slate-800">
                  {isHRManager || isCFO || viewingEmployee.id === currentUser.id 
                    ? `£${viewingEmployee.salary.toLocaleString()} / mo` 
                    : '•••••• [Protected]'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Employee Since:</span>
                <span className="text-slate-700 font-bold">{viewingEmployee.joinDate}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Disbursement Bank Details:</span>
                <span className="font-mono text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 text-[11px] select-all">
                  {isHRManager || isCFO || viewingEmployee.id === currentUser.id 
                    ? viewingEmployee.bankDetails || 'No bank record attached.'
                    : '•••••••••••• [Protected]'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
