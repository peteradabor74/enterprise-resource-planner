/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'FINANCE_OFFICER' | 'CONTRACT_OFFICER';
export type Department = 'EXECUTIVE' | 'HR' | 'FINANCE' | 'SALES' | 'ENGINEERING' | 'SUPPORT';
export type Seniority = 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: Department;
  seniority: Seniority;
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
  username?: string;
  password?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  device: string;
  ipAddress: string;
  activeSince: string;
  lastActive: string;
}

export type ContractStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
export type SlaLevel = 'GOLD' | 'SILVER' | 'BRONZE';
export type BillingFrequency = 'MONTHLY' | 'ONCE' | 'MILESTONE';

export interface Contract {
  id: string;
  title: string;
  clientName: string;
  value: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  slaLevel: SlaLevel;
  billingFrequency: BillingFrequency;
}

export interface SupportTicket {
  id: string;
  contractId: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  assignedTo: string; // userId
  createdAt: string;
}

export interface ProjectMilestone {
  id: string;
  contractId: string;
  title: string;
  value: number;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED';
  completedAt?: string;
}

export interface Message {
  id: string;
  contractId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface EmployeeProfile {
  id: string; // matches User.id
  title: string;
  reportsTo?: string; // userId (manager)
  salary: number; // monthly salary
  joinDate: string;
  bankDetails: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string; // User.id
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveType: 'SICK' | 'VACATION' | 'PERSONAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  approvedBy?: string; // User.id
}

export interface PayrollRun {
  id: string;
  period: string; // e.g. "2026-06"
  amountPaid: number;
  runDate: string;
  status: 'DRAFT' | 'PAID';
}

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface LedgerAccount {
  code: string; // e.g. "1000-Cash", "4000-Revenue"
  name: string;
  type: AccountType;
  balance: number;
}

export interface LedgerTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  accountCode: string;
  referenceType: 'REVENUE_MILESTONE' | 'EXPENSE_PAYROLL' | 'MANUAL';
  referenceId: string;
}

export interface QueuedNotification {
  id: string;
  type: 'EMAIL' | 'SMS';
  recipient: string;
  subject?: string;
  body: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  attempts: number;
  scheduledAt: string;
  sentAt?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM:SS
  checkOut?: string; // HH:MM:SS
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'REMOTE';
  notes?: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  activeContracts: number;
  totalEmployees: number;
  pendingTickets: number;
  pendingLeaves: number;
}
