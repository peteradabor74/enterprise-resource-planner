/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import {
  User,
  UserSession,
  Contract,
  ContractStatus,
  SupportTicket,
  ProjectMilestone,
  Message,
  EmployeeProfile,
  LeaveRequest,
  PayrollRun,
  LedgerAccount,
  LedgerTransaction,
  QueuedNotification,
  DashboardMetrics,
  AttendanceRecord
} from '../src/types';

// Define the file path for persistent JSON storage
const DB_FILE = path.join(process.cwd(), 'server', 'database.json');

// Interface for the complete database state
interface DbState {
  users: User[];
  sessions: UserSession[];
  contracts: Contract[];
  tickets: SupportTicket[];
  milestones: ProjectMilestone[];
  messages: Message[];
  employees: EmployeeProfile[];
  leaves: LeaveRequest[];
  payrollRuns: PayrollRun[];
  accounts: LedgerAccount[];
  transactions: LedgerTransaction[];
  notifications: QueuedNotification[];
  attendance?: AttendanceRecord[];
}

// Initial seed data to represent a living, fully functional enterprise ecosystem
const initialSeedData: DbState = {
  users: [
    { id: 'usr-1', email: 'admin@enterprise.com', username: 'pendragon', password: 'admin123', fullName: 'Arthur Pendragon', role: 'ADMIN', department: 'EXECUTIVE', seniority: 'EXECUTIVE', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120' },
    { id: 'usr-2', email: 'hr@enterprise.com', username: 'gwenivere', password: 'password123', fullName: 'Gwenivere Vance', role: 'MANAGER', department: 'HR', seniority: 'LEAD', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120' },
    { id: 'usr-3', email: 'finance@enterprise.com', username: 'lancelot', password: 'password123', fullName: 'Lancelot du Lac', role: 'FINANCE_OFFICER', department: 'FINANCE', seniority: 'LEAD', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120' },
    { id: 'usr-4', email: 'contracts@enterprise.com', username: 'merlin', password: 'password123', fullName: 'Merlin Ambrosius', role: 'CONTRACT_OFFICER', department: 'SUPPORT', seniority: 'LEAD', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120' },
    { id: 'usr-5', email: 'alice@enterprise.com', username: 'alice', password: 'password123', fullName: 'Alice Liddell', role: 'EMPLOYEE', department: 'ENGINEERING', seniority: 'SENIOR', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120' },
    { id: 'usr-6', email: 'bob@enterprise.com', username: 'bob', password: 'password123', fullName: 'Robert Grantham', role: 'EMPLOYEE', department: 'SUPPORT', seniority: 'MID', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120' },
    { id: 'usr-7', email: 'carol@enterprise.com', username: 'carol', password: 'password123', fullName: 'Carol Danvers', role: 'EMPLOYEE', department: 'SALES', seniority: 'JUNIOR', status: 'ACTIVE', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120' }
  ],
  sessions: [
    { id: 'ses-1', userId: 'usr-1', device: 'MacBook Pro - Chrome (London)', ipAddress: '194.22.4.99', activeSince: '2026-07-17T08:30:00Z', lastActive: '2026-07-17T11:45:00Z' },
    { id: 'ses-2', userId: 'usr-3', device: 'ThinkPad - Firefox (Paris)', ipAddress: '82.44.112.5', activeSince: '2026-07-17T09:15:00Z', lastActive: '2026-07-17T11:32:00Z' },
    { id: 'ses-3', userId: 'usr-5', device: 'Ubuntu workstation - VSCode (Munich)', ipAddress: '46.99.12.23', activeSince: '2026-07-17T07:45:00Z', lastActive: '2026-07-17T10:15:00Z' }
  ],
  contracts: [
    { id: 'con-1', title: 'Global Cloud Platform Migration', clientName: 'Acme Corporation', value: 120000, startDate: '2026-06-01', endDate: '2027-05-31', status: 'ACTIVE', slaLevel: 'GOLD', billingFrequency: 'MILESTONE' },
    { id: 'con-2', title: 'Enterprise Network Security Audit', clientName: 'Cyberdyne Systems', value: 45000, startDate: '2026-07-01', endDate: '2026-12-31', status: 'ACTIVE', slaLevel: 'SILVER', billingFrequency: 'MONTHLY' },
    { id: 'con-3', title: 'Smart Grid ERP Integration Consultancy', clientName: 'Stark Industries', value: 180000, startDate: '2026-08-01', endDate: '2027-07-31', status: 'PENDING', slaLevel: 'GOLD', billingFrequency: 'MILESTONE' },
    { id: 'con-4', title: 'Legacy Systems Decommissioning', clientName: 'Tyrell BioTech', value: 60000, startDate: '2026-01-01', endDate: '2026-06-30', status: 'COMPLETED', slaLevel: 'BRONZE', billingFrequency: 'ONCE' }
  ],
  tickets: [
    { id: 'tkt-1', contractId: 'con-1', title: 'VPN Gateway Access Failures', description: 'Engineers from Acme cannot connect to the staging subnet since this morning. Suspect routing table typo in development VPC.', priority: 'HIGH', status: 'OPEN', assignedTo: 'usr-5', createdAt: '2026-07-17T09:00:00Z' },
    { id: 'tkt-2', contractId: 'con-2', title: 'Weekly Firewall Intrusion Logs Audit', description: 'Routine check of logs under SLA level SILVER is due today. Request logs from corporate IT manager.', priority: 'MEDIUM', status: 'IN_PROGRESS', assignedTo: 'usr-6', createdAt: '2026-07-16T14:30:00Z' },
    { id: 'tkt-3', contractId: 'con-1', title: 'Billing Discrepancy on Milestone 1', description: 'Acme accounts payable is asking if the invoice details include the VAT exemption clause.', priority: 'LOW', status: 'RESOLVED', assignedTo: 'usr-3', createdAt: '2026-07-15T11:00:00Z' }
  ],
  milestones: [
    { id: 'mil-1', contractId: 'con-1', title: 'Architecture Review and VPC Blueprint', value: 30000, dueDate: '2026-06-15', status: 'COMPLETED', completedAt: '2026-06-14' },
    { id: 'mil-2', contractId: 'con-1', title: 'Core IAM and Active Directory Federation', value: 40000, dueDate: '2026-07-10', status: 'COMPLETED', completedAt: '2026-07-09' },
    { id: 'mil-3', contractId: 'con-1', title: 'Database Live Sharding Migration', value: 50000, dueDate: '2026-10-31', status: 'PENDING' },
    { id: 'mil-4', contractId: 'con-2', title: 'Penetration Testing and Remediation Plan', value: 20000, dueDate: '2026-09-15', status: 'PENDING' },
    { id: 'mil-5', contractId: 'con-4', title: 'Decommissioning Sign-off', value: 60000, dueDate: '2026-06-25', status: 'COMPLETED', completedAt: '2026-06-25' }
  ],
  messages: [
    { id: 'msg-1', contractId: 'con-1', senderId: 'usr-1', senderName: 'Arthur Pendragon', content: 'VPC migration architecture approved. We are initiating AD Federation.', createdAt: '2026-06-10T14:30:00Z' },
    { id: 'msg-2', contractId: 'con-1', senderId: 'usr-5', senderName: 'Alice Liddell', content: 'VPC subnets deployed. Security groups hardened. Handing over to AD team.', createdAt: '2026-06-13T09:12:00Z' },
    { id: 'msg-3', contractId: 'con-2', senderId: 'usr-6', senderName: 'Robert Grantham', content: 'Awaiting network diagrams from Cyberdyne to proceed with audit.', createdAt: '2026-07-14T10:00:00Z' }
  ],
  employees: [
    { id: 'usr-1', title: 'Chief Executive Officer', reportsTo: undefined, salary: 15000, joinDate: '2025-01-01', bankDetails: 'IBAN: GB99 enterprise-exec-0001' },
    { id: 'usr-2', title: 'Human Resources Lead', reportsTo: 'usr-1', salary: 8000, joinDate: '2025-02-15', bankDetails: 'IBAN: GB99 enterprise-hr-0002' },
    { id: 'usr-3', title: 'Chief Financial Officer', reportsTo: 'usr-1', salary: 9500, joinDate: '2025-01-10', bankDetails: 'IBAN: GB99 enterprise-finance-0003' },
    { id: 'usr-4', title: 'Contracts Delivery Officer', reportsTo: 'usr-1', salary: 8500, joinDate: '2025-03-01', bankDetails: 'IBAN: GB99 enterprise-contracts-0004' },
    { id: 'usr-5', title: 'Senior Software Architect', reportsTo: 'usr-4', salary: 9000, joinDate: '2025-05-10', bankDetails: 'IBAN: GB99 enterprise-staff-0005' },
    { id: 'usr-6', title: 'System Support Specialist', reportsTo: 'usr-4', salary: 5000, joinDate: '2025-08-01', bankDetails: 'IBAN: GB99 enterprise-staff-0006' },
    { id: 'usr-7', title: 'Junior Sales Executive', reportsTo: 'usr-1', salary: 4000, joinDate: '2026-03-15', bankDetails: 'IBAN: GB99 enterprise-staff-0007' }
  ],
  leaves: [
    { id: 'lv-1', employeeId: 'usr-5', employeeName: 'Alice Liddell', startDate: '2026-08-05', endDate: '2026-08-15', leaveType: 'VACATION', status: 'PENDING', reason: 'Summer holiday trip to Japan with family.' },
    { id: 'lv-2', employeeId: 'usr-6', employeeName: 'Robert Grantham', startDate: '2026-07-10', endDate: '2026-07-12', leaveType: 'SICK', status: 'APPROVED', reason: 'Wisdom tooth extraction surgery.', approvedBy: 'usr-2' },
    { id: 'lv-3', employeeId: 'usr-7', employeeName: 'Carol Danvers', startDate: '2026-09-01', endDate: '2026-09-02', leaveType: 'PERSONAL', status: 'PENDING', reason: 'Attending sibling graduation.' }
  ],
  payrollRuns: [
    { id: 'pay-1', period: '2026-05', amountPaid: 51000, runDate: '2026-05-28', status: 'PAID' },
    { id: 'pay-2', period: '2026-06', amountPaid: 53000, runDate: '2026-06-28', status: 'PAID' },
    { id: 'pay-3', period: '2026-07', amountPaid: 53000, runDate: '2026-07-28', status: 'DRAFT' }
  ],
  accounts: [
    { code: '1000-Cash', name: 'Corporate Operating Bank Account', type: 'ASSET', balance: 250000 },
    { code: '1100-AccountsReceivable', name: 'Trade Debtors & Client Invoices', type: 'ASSET', balance: 50000 },
    { code: '2000-AccountsPayable', name: 'Suppliers & Creditors Liability', type: 'LIABILITY', balance: 0 },
    { code: '3000-RetainedEarnings', name: 'Accumulated Corporate Reserves', type: 'EQUITY', balance: 196000 },
    { code: '4000-Revenue', name: 'Contract Milestone Invoiced Revenue', type: 'REVENUE', balance: 130000 }, // con-1 mil-1 (30k) + con-1 mil-2 (40k) + con-4 mil-5 (60k) = 130k
    { code: '5000-PayrollExpense', name: 'Workforce Salaries Expense', type: 'EXPENSE', balance: 26000 }  // May payroll expenses (26k) or Jun payroll expenses (27k) etc.
  ],
  transactions: [
    // Double entry logs
    { id: 'tx-1a', date: '2026-06-14', description: 'Acme Milestone 1 VPC Blueprint Complete (Debit Cash)', amount: 30000, type: 'DEBIT', accountCode: '1000-Cash', referenceType: 'REVENUE_MILESTONE', referenceId: 'mil-1' },
    { id: 'tx-1b', date: '2026-06-14', description: 'Acme Milestone 1 VPC Blueprint Complete (Credit Revenue)', amount: 30000, type: 'CREDIT', accountCode: '4000-Revenue', referenceType: 'REVENUE_MILESTONE', referenceId: 'mil-1' },
    
    { id: 'tx-2a', date: '2026-06-25', description: 'Tyrell BioTech Milestone Decommission Complete (Debit Cash)', amount: 60000, type: 'DEBIT', accountCode: '1000-Cash', referenceType: 'REVENUE_MILESTONE', referenceId: 'mil-5' },
    { id: 'tx-2b', date: '2026-06-25', description: 'Tyrell BioTech Milestone Decommission Complete (Credit Revenue)', amount: 60000, type: 'CREDIT', accountCode: '4000-Revenue', referenceType: 'REVENUE_MILESTONE', referenceId: 'mil-5' },

    { id: 'tx-3a', date: '2026-07-09', description: 'Acme Milestone 2 IAM Federation Complete (Debit Cash)', amount: 40000, type: 'DEBIT', accountCode: '1000-Cash', referenceType: 'REVENUE_MILESTONE', referenceId: 'mil-2' },
    { id: 'tx-3b', date: '2026-07-09', description: 'Acme Milestone 2 IAM Federation Complete (Credit Revenue)', amount: 40000, type: 'CREDIT', accountCode: '4000-Revenue', referenceType: 'REVENUE_MILESTONE', referenceId: 'mil-2' },

    { id: 'tx-4a', date: '2026-06-28', description: 'Workforce Payroll Run June 2026 (Debit Salary Expense)', amount: 26000, type: 'DEBIT', accountCode: '5000-PayrollExpense', referenceType: 'EXPENSE_PAYROLL', referenceId: 'pay-2' },
    { id: 'tx-4b', date: '2026-06-28', description: 'Workforce Payroll Run June 2026 (Credit Operating Cash)', amount: 26000, type: 'CREDIT', accountCode: '1000-Cash', referenceType: 'EXPENSE_PAYROLL', referenceId: 'pay-2' }
  ],
  notifications: [
    { id: 'not-1', type: 'EMAIL', recipient: 'admin@enterprise.com', subject: 'System Initialization', body: 'Enterprise Resource Monolith system database mounted and seeded successfully.', status: 'SENT', attempts: 1, scheduledAt: '2026-07-17T01:30:00Z', sentAt: '2026-07-17T01:30:05Z' },
    { id: 'not-2', type: 'EMAIL', recipient: 'hr@enterprise.com', subject: 'New Leave Request Alert', body: 'Employee Alice Liddell has requested Vacation from 2026-08-05 to 2026-08-15. Pending review.', status: 'PENDING', attempts: 0, scheduledAt: '2026-07-17T09:05:00Z' }
  ],
  attendance: [
    { id: 'att-1', employeeId: 'usr-5', employeeName: 'Alice Liddell', date: '2026-07-17', checkIn: '09:02:15', checkOut: '17:30:00', status: 'PRESENT', notes: 'Arrived on time, worked on cloud migration.' },
    { id: 'att-2', employeeId: 'usr-6', employeeName: 'Robert Grantham', date: '2026-07-17', checkIn: '08:45:00', checkOut: '17:00:00', status: 'PRESENT', notes: 'Routine network support tasks.' },
    { id: 'att-3', employeeId: 'usr-7', employeeName: 'Carol Danvers', date: '2026-07-17', checkIn: '09:45:00', checkOut: '18:15:00', status: 'LATE', notes: 'Stuck in traffic, notified manager.' }
  ]
};

// Helper to load or initialize the DB state
export function loadDb(): DbState {
  try {
    if (!fs.existsSync(DB_FILE)) {
      // Ensure the directory exists
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSeedData, null, 2), 'utf-8');
      return initialSeedData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const state = JSON.parse(data);
    
    // Auto-migrate users with credentials if missing
    let usersUpdated = false;
    state.users = state.users.map((u: any) => {
      let changed = false;
      if (u.id === 'usr-1' && (u.username !== 'pendragon' || u.password !== 'admin123')) {
        u.username = 'pendragon';
        u.password = 'admin123';
        changed = true;
      } else if (!u.username || !u.password) {
        if (u.id === 'usr-2') { u.username = 'gwenivere'; u.password = 'password123'; }
        else if (u.id === 'usr-3') { u.username = 'lancelot'; u.password = 'password123'; }
        else if (u.id === 'usr-4') { u.username = 'merlin'; u.password = 'password123'; }
        else if (u.id === 'usr-5') { u.username = 'alice'; u.password = 'password123'; }
        else if (u.id === 'usr-6') { u.username = 'bob'; u.password = 'password123'; }
        else if (u.id === 'usr-7') { u.username = 'carol'; u.password = 'password123'; }
        else { u.username = u.email.split('@')[0]; u.password = 'password123'; }
        changed = true;
      }
      if (changed) usersUpdated = true;
      return u;
    });

    if (!state.attendance) {
      state.attendance = [
        { id: 'att-1', employeeId: 'usr-5', employeeName: 'Alice Liddell', date: '2026-07-17', checkIn: '09:02:15', checkOut: '17:30:00', status: 'PRESENT', notes: 'Arrived on time, worked on cloud migration.' },
        { id: 'att-2', employeeId: 'usr-6', employeeName: 'Robert Grantham', date: '2026-07-17', checkIn: '08:45:00', checkOut: '17:00:00', status: 'PRESENT', notes: 'Routine network support tasks.' },
        { id: 'att-3', employeeId: 'usr-7', employeeName: 'Carol Danvers', date: '2026-07-17', checkIn: '09:45:00', checkOut: '18:15:00', status: 'LATE', notes: 'Stuck in traffic, notified manager.' }
      ];
      usersUpdated = true;
    }

    if (usersUpdated) {
      saveDb(state);
    }
    return state;
  } catch (error) {
    console.error('Failed to load database. Returning in-memory seed state.', error);
    return initialSeedData;
  }
}

// Helper to save DB state
export function saveDb(state: DbState): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write database to filesystem.', error);
  }
}

// DB Instance API
export const db = {
  // --- USERS & ACCESS ---
  getUsers: () => loadDb().users,
  getUserById: (id: string) => loadDb().users.find(u => u.id === id),
  getSessions: () => loadDb().sessions,
  createSession: (userId: string, device: string, ipAddress: string) => {
    const state = loadDb();
    const session: UserSession = {
      id: `ses-${Date.now()}`,
      userId,
      device,
      ipAddress,
      activeSince: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    state.sessions.unshift(session);
    saveDb(state);
    return session;
  },
  deleteSession: (id: string) => {
    const state = loadDb();
    state.sessions = state.sessions.filter(s => s.id !== id);
    saveDb(state);
  },
  updateUserRole: (id: string, role: any, department: any, seniority: any) => {
    const state = loadDb();
    const idx = state.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      state.users[idx] = { ...state.users[idx], role, department, seniority };
      saveDb(state);
      db.queueNotification('EMAIL', state.users[idx].email, 'Access Permission Update', `Your company ERP roles have been modified. New role: ${role}. Department: ${department}.`);
      return state.users[idx];
    }
    return null;
  },

  // --- OPERATIONAL (CONTRACTS & SUPPORT) ---
  getContracts: () => loadDb().contracts,
  getMilestones: () => loadDb().milestones,
  getTickets: () => loadDb().tickets,
  getMessages: (contractId: string) => loadDb().messages.filter(m => m.contractId === contractId),
  
  createContract: (contractData: Omit<Contract, 'id'>) => {
    const state = loadDb();
    const contract: Contract = {
      ...contractData,
      id: `con-${Date.now()}`
    };
    state.contracts.unshift(contract);
    saveDb(state);

    // Queue audit log notification
    db.queueNotification('EMAIL', 'contracts@enterprise.com', 'New Client Agreement Created', `A new operational agreement "${contract.title}" has been signed for ${contract.clientName} with an SLA level of ${contract.slaLevel}.`);
    return contract;
  },

  updateContractStatus: (id: string, status: ContractStatus) => {
    const state = loadDb();
    const idx = state.contracts.findIndex(c => c.id === id);
    if (idx !== -1) {
      state.contracts[idx].status = status;
      saveDb(state);
      return state.contracts[idx];
    }
    return null;
  },

  createMilestone: (milestoneData: Omit<ProjectMilestone, 'id' | 'status'>) => {
    const state = loadDb();
    const milestone: ProjectMilestone = {
      ...milestoneData,
      id: `mil-${Date.now()}`,
      status: 'PENDING'
    };
    state.milestones.push(milestone);
    saveDb(state);
    return milestone;
  },

  completeMilestone: (id: string) => {
    const state = loadDb();
    const milestoneIdx = state.milestones.findIndex(m => m.id === id);
    if (milestoneIdx === -1 || state.milestones[milestoneIdx].status === 'COMPLETED') {
      return null;
    }

    const milestone = state.milestones[milestoneIdx];
    milestone.status = 'COMPLETED';
    milestone.completedAt = new Date().toISOString().split('T')[0];

    const contract = state.contracts.find(c => c.id === milestone.contractId);
    const contractTitle = contract ? contract.title : 'External Contract';

    // TRIGGER DOUBLE ENTRY GENERAL LEDGER ENTRIES!
    // Debit: 1000-Cash (Asset increases on billing completion)
    // Credit: 4000-Revenue (Revenue increases)
    const cashAcct = state.accounts.find(a => a.code === '1000-Cash');
    const revAcct = state.accounts.find(a => a.code === '4000-Revenue');

    if (cashAcct) cashAcct.balance += milestone.value;
    if (revAcct) revAcct.balance += milestone.value;

    const txIdDebit = `tx-${Date.now()}-a`;
    const txIdCredit = `tx-${Date.now()}-b`;

    const debitTx: LedgerTransaction = {
      id: txIdDebit,
      date: milestone.completedAt,
      description: `Billing Milestone "${milestone.title}" Complete - [${contractTitle}] (Debit Cash)`,
      amount: milestone.value,
      type: 'DEBIT',
      accountCode: '1000-Cash',
      referenceType: 'REVENUE_MILESTONE',
      referenceId: milestone.id
    };

    const creditTx: LedgerTransaction = {
      id: txIdCredit,
      date: milestone.completedAt,
      description: `Billing Milestone "${milestone.title}" Complete - [${contractTitle}] (Credit Revenue)`,
      amount: milestone.value,
      type: 'CREDIT',
      accountCode: '4000-Revenue',
      referenceType: 'REVENUE_MILESTONE',
      referenceId: milestone.id
    };

    state.transactions.unshift(debitTx, creditTx);
    saveDb(state);

    // Queue notification
    db.queueNotification(
      'EMAIL', 
      'finance@enterprise.com', 
      'SLA Milestone Billing Executed', 
      `Milestone "${milestone.title}" under project "${contractTitle}" marked complete. Revenue of £${milestone.value.toLocaleString()} booked to General Ledger. Cash balance debited.`
    );

    return milestone;
  },

  createTicket: (ticketData: Omit<SupportTicket, 'id' | 'createdAt'>) => {
    const state = loadDb();
    const ticket: SupportTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    state.tickets.unshift(ticket);
    saveDb(state);

    const contract = state.contracts.find(c => c.id === ticket.contractId);
    const client = contract ? contract.clientName : 'Client';
    const assigned = state.users.find(u => u.id === ticket.assignedTo);
    
    if (assigned) {
      db.queueNotification('EMAIL', assigned.email, `Assigned Ticket: ${ticket.title}`, `You have been assigned support ticket "${ticket.title}" for ${client}. Priority: ${ticket.priority}.`);
    }

    return ticket;
  },

  updateTicketStatus: (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => {
    const state = loadDb();
    const idx = state.tickets.findIndex(t => t.id === id);
    if (idx !== -1) {
      state.tickets[idx].status = status;
      saveDb(state);
      return state.tickets[idx];
    }
    return null;
  },

  createMessage: (contractId: string, senderId: string, content: string) => {
    const state = loadDb();
    const sender = state.users.find(u => u.id === senderId);
    const msg: Message = {
      id: `msg-${Date.now()}`,
      contractId,
      senderId,
      senderName: sender ? sender.fullName : 'System',
      content,
      createdAt: new Date().toISOString()
    };
    state.messages.push(msg);
    saveDb(state);
    return msg;
  },

  // --- HRMS (EMPLOYEE, LEAVES, PAYROLL) ---
  getEmployees: () => {
    const state = loadDb();
    return state.employees.map(emp => {
      const user = state.users.find(u => u.id === emp.id);
      return {
        ...emp,
        fullName: user ? user.fullName : 'Unknown Employee',
        email: user ? user.email : '',
        department: user ? user.department : 'SUPPORT',
        status: user ? user.status : 'INACTIVE',
        role: user ? user.role : 'EMPLOYEE'
      };
    });
  },

  updateEmployeeProfile: (id: string, profileData: Partial<EmployeeProfile>) => {
    const state = loadDb();
    const idx = state.employees.findIndex(e => e.id === id);
    if (idx !== -1) {
      state.employees[idx] = { ...state.employees[idx], ...profileData };
      saveDb(state);
      return state.employees[idx];
    }
    return null;
  },

  createEmployee: (data: any) => {
    const state = loadDb();
    const newId = `usr-${Date.now()}`;
    
    const newUser: User = {
      id: newId,
      email: data.email || `${newId}@enterprise.com`,
      fullName: data.fullName || 'New Employee',
      role: data.role || 'EMPLOYEE',
      department: data.department || 'SUPPORT',
      seniority: data.seniority || 'MID',
      status: data.status || 'ACTIVE',
      avatar: data.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120`
    };
    
    const newProfile: EmployeeProfile = {
      id: newId,
      title: data.title || 'Specialist',
      reportsTo: data.reportsTo || undefined,
      salary: Number(data.salary) || 4000,
      joinDate: data.joinDate || new Date().toISOString().split('T')[0],
      bankDetails: data.bankDetails || 'IBAN: GB99 enterprise-staff-xxxx'
    };
    
    state.users.push(newUser);
    state.employees.push(newProfile);
    saveDb(state);
    
    return {
      ...newProfile,
      fullName: newUser.fullName,
      email: newUser.email,
      department: newUser.department,
      status: newUser.status,
      role: newUser.role,
      seniority: newUser.seniority
    };
  },

  updateEmployee: (id: string, data: any) => {
    const state = loadDb();
    const userIdx = state.users.findIndex(u => u.id === id);
    const empIdx = state.employees.findIndex(e => e.id === id);
    
    if (userIdx !== -1) {
      state.users[userIdx] = {
        ...state.users[userIdx],
        fullName: data.fullName !== undefined ? data.fullName : state.users[userIdx].fullName,
        email: data.email !== undefined ? data.email : state.users[userIdx].email,
        role: data.role !== undefined ? data.role : state.users[userIdx].role,
        department: data.department !== undefined ? data.department : state.users[userIdx].department,
        seniority: data.seniority !== undefined ? data.seniority : state.users[userIdx].seniority,
        status: data.status !== undefined ? data.status : state.users[userIdx].status,
        avatar: data.avatar !== undefined ? data.avatar : state.users[userIdx].avatar
      };
    }
    
    if (empIdx !== -1) {
      state.employees[empIdx] = {
        ...state.employees[empIdx],
        title: data.title !== undefined ? data.title : state.employees[empIdx].title,
        reportsTo: data.reportsTo ? data.reportsTo : undefined,
        salary: data.salary !== undefined ? Number(data.salary) : state.employees[empIdx].salary,
        joinDate: data.joinDate !== undefined ? data.joinDate : state.employees[empIdx].joinDate,
        bankDetails: data.bankDetails !== undefined ? data.bankDetails : state.employees[empIdx].bankDetails
      };
    }
    
    saveDb(state);
    
    const u = state.users.find(usr => usr.id === id);
    const e = state.employees.find(emp => emp.id === id);
    if (!u || !e) return null;
    return {
      ...e,
      fullName: u.fullName,
      email: u.email,
      department: u.department,
      status: u.status,
      role: u.role,
      seniority: u.seniority
    };
  },

  deleteEmployee: (id: string) => {
    const state = loadDb();
    
    state.users = state.users.filter(u => u.id !== id);
    state.employees = state.employees.filter(e => e.id !== id);
    state.sessions = state.sessions.filter(s => s.userId !== id);
    state.leaves = state.leaves.filter(l => l.employeeId !== id);
    
    saveDb(state);
    return true;
  },

  getLeaves: () => loadDb().leaves,
  
  createLeaveRequest: (leaveData: Omit<LeaveRequest, 'id' | 'status' | 'employeeName'>) => {
    const state = loadDb();
    const user = state.users.find(u => u.id === leaveData.employeeId);
    const leave: LeaveRequest = {
      ...leaveData,
      id: `lv-${Date.now()}`,
      employeeName: user ? user.fullName : 'Employee',
      status: 'PENDING'
    };
    state.leaves.unshift(leave);
    saveDb(state);

    // Alert HR
    db.queueNotification('EMAIL', 'hr@enterprise.com', 'New Employee Absence Request', `Employee ${leave.employeeName} requested ${leave.leaveType} leave from ${leave.startDate} to ${leave.endDate}. Reason: ${leave.reason}`);
    return leave;
  },

  approveLeaveRequest: (id: string, approvedBy: string, status: 'APPROVED' | 'REJECTED') => {
    const state = loadDb();
    const idx = state.leaves.findIndex(l => l.id === id);
    if (idx !== -1) {
      state.leaves[idx].status = status;
      state.leaves[idx].approvedBy = approvedBy;
      
      const empUser = state.users.find(u => u.id === state.leaves[idx].employeeId);
      saveDb(state);

      if (empUser) {
        db.queueNotification('EMAIL', empUser.email, `Leave Request ${status}`, `Your absence request for ${state.leaves[idx].startDate} to ${state.leaves[idx].endDate} has been ${status.toLowerCase()} by HR administration.`);
      }

      return state.leaves[idx];
    }
    return null;
  },

  getPayrollRuns: () => loadDb().payrollRuns,

  executePayroll: (period: string, initiatorId: string) => {
    const state = loadDb();
    // Check if payroll already exists for period and is PAID
    const existing = state.payrollRuns.find(p => p.period === period);
    if (existing && existing.status === 'PAID') {
      return { error: 'Payroll has already been generated and paid for this period.' };
    }

    // Sum all active employee salaries
    const activeUserIds = state.users.filter(u => u.status === 'ACTIVE').map(u => u.id);
    const activeEmployees = state.employees.filter(e => activeUserIds.includes(e.id));
    const payrollTotalAmount = activeEmployees.reduce((sum, emp) => sum + emp.salary, 0);

    if (payrollTotalAmount === 0) {
      return { error: 'No active employee payroll found to execute.' };
    }

    let run: PayrollRun;
    if (existing) {
      existing.status = 'PAID';
      existing.amountPaid = payrollTotalAmount;
      existing.runDate = new Date().toISOString().split('T')[0];
      run = existing;
    } else {
      run = {
        id: `pay-${Date.now()}`,
        period,
        amountPaid: payrollTotalAmount,
        runDate: new Date().toISOString().split('T')[0],
        status: 'PAID'
      };
      state.payrollRuns.unshift(run);
    }

    // TRIGGER DOUBLE ENTRY GENERAL LEDGER EXPENSE!
    // Debit: 5000-PayrollExpense (Expenses increase)
    // Credit: 1000-Cash (Cash Asset decreases to fund employee bank accounts)
    const cashAcct = state.accounts.find(a => a.code === '1000-Cash');
    const payAcct = state.accounts.find(a => a.code === '5000-PayrollExpense');

    if (cashAcct) cashAcct.balance -= payrollTotalAmount;
    if (payAcct) payAcct.balance += payrollTotalAmount;

    const txIdDebit = `tx-${Date.now()}-pay-d`;
    const txIdCredit = `tx-${Date.now()}-pay-c`;

    const debitTx: LedgerTransaction = {
      id: txIdDebit,
      date: run.runDate,
      description: `Payroll Run Period [${period}] Distribution (Debit Payroll Expense)`,
      amount: payrollTotalAmount,
      type: 'DEBIT',
      accountCode: '5000-PayrollExpense',
      referenceType: 'EXPENSE_PAYROLL',
      referenceId: run.id
    };

    const creditTx: LedgerTransaction = {
      id: txIdCredit,
      date: run.runDate,
      description: `Payroll Run Period [${period}] Distribution (Credit Operating Cash)`,
      amount: payrollTotalAmount,
      type: 'CREDIT',
      accountCode: '1000-Cash',
      referenceType: 'EXPENSE_PAYROLL',
      referenceId: run.id
    };

    state.transactions.unshift(debitTx, creditTx);
    saveDb(state);

    // Queue system-wide notifications for everyone paid
    activeEmployees.forEach(emp => {
      const empUser = state.users.find(u => u.id === emp.id);
      if (empUser) {
        db.queueNotification('EMAIL', empUser.email, 'Payslip Available', `Hello ${empUser.fullName}, your payslip for period ${period} is ready. Net salary of £${emp.salary.toLocaleString()} has been dispatched to ${emp.bankDetails}.`);
      }
    });

    db.queueNotification('EMAIL', 'admin@enterprise.com', 'Payroll Distribution Dispatched', `Workforce payroll run for period ${period} completed by CFO. Total cash disbursed: £${payrollTotalAmount.toLocaleString()}.`);

    return run;
  },

  // --- ATTENDANCE ---
  getAttendance: () => loadDb().attendance || [],
  markAttendance: (record: { employeeId: string; employeeName: string; date: string; checkIn: string; checkOut?: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'REMOTE'; notes?: string }) => {
    const state = loadDb();
    if (!state.attendance) {
      state.attendance = [];
    }
    const idx = state.attendance.findIndex(
      r => r.employeeId === record.employeeId && r.date === record.date
    );

    if (idx !== -1) {
      state.attendance[idx] = {
        ...state.attendance[idx],
        ...record,
        id: state.attendance[idx].id
      };
    } else {
      const newRecord: AttendanceRecord = {
        ...record,
        id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      };
      state.attendance.unshift(newRecord);
    }
    saveDb(state);
    return state.attendance;
  },

  // --- GENERAL LEDGER ---
  getAccounts: () => loadDb().accounts,
  getTransactions: () => loadDb().transactions,

  createManualTransaction: (txData: { date: string, description: string, amount: number, debitAccountCode: string, creditAccountCode: string }) => {
    const state = loadDb();
    const debitAccount = state.accounts.find(a => a.code === txData.debitAccountCode);
    const creditAccount = state.accounts.find(a => a.code === txData.creditAccountCode);

    if (!debitAccount || !creditAccount) {
      return { error: 'Invalid ledger accounts supplied for double entry.' };
    }

    // Apply adjustments: Debit increases assets/expenses, decreases liabilities/equity/revenue
    if (debitAccount.type === 'ASSET' || debitAccount.type === 'EXPENSE') {
      debitAccount.balance += txData.amount;
    } else {
      debitAccount.balance -= txData.amount;
    }

    // Credit increases liabilities/equity/revenue, decreases assets/expenses
    if (creditAccount.type === 'LIABILITY' || creditAccount.type === 'EQUITY' || creditAccount.type === 'REVENUE') {
      creditAccount.balance += txData.amount;
    } else {
      creditAccount.balance -= txData.amount;
    }

    const refId = `man-${Date.now()}`;
    const txIdD = `tx-${Date.now()}-man-d`;
    const txIdC = `tx-${Date.now()}-man-c`;

    const debitTx: LedgerTransaction = {
      id: txIdD,
      date: txData.date,
      description: `${txData.description} (Debit ${debitAccount.name})`,
      amount: txData.amount,
      type: 'DEBIT',
      accountCode: txData.debitAccountCode,
      referenceType: 'MANUAL',
      referenceId: refId
    };

    const creditTx: LedgerTransaction = {
      id: txIdC,
      date: txData.date,
      description: `${txData.description} (Credit ${creditAccount.name})`,
      amount: txData.amount,
      type: 'CREDIT',
      accountCode: txData.creditAccountCode,
      referenceType: 'MANUAL',
      referenceId: refId
    };

    state.transactions.unshift(debitTx, creditTx);
    saveDb(state);

    db.queueNotification('EMAIL', 'finance@enterprise.com', 'Manual Ledger Entry Booked', `Manual adjustment booked: "${txData.description}" of £${txData.amount.toLocaleString()}.`);

    return { debitTx, creditTx };
  },

  // --- INFRASTRUCTURE: NOTIFICATIONS QUEUE ---
  getNotifications: () => loadDb().notifications,
  
  queueNotification: (type: 'EMAIL' | 'SMS', recipient: string, subject: string, body: string) => {
    const state = loadDb();
    const notification: QueuedNotification = {
      id: `not-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      recipient,
      subject,
      body,
      status: 'PENDING',
      attempts: 0,
      scheduledAt: new Date().toISOString()
    };
    state.notifications.unshift(notification);
    saveDb(state);
    
    // Process queue immediately (simulated background worker)
    setTimeout(() => {
      try {
        const localState = loadDb();
        const found = localState.notifications.find(n => n.id === notification.id);
        if (found) {
          found.status = 'SENT';
          found.attempts = 1;
          found.sentAt = new Date().toISOString();
          saveDb(localState);
        }
      } catch (err) {
        console.error('Asynchronous notification worker failure:', err);
      }
    }, 4000); // Deliver in 4 seconds to make the queue logs visual to the user!
    
    return notification;
  },

  // Process all pending notifications immediately
  flushNotificationQueue: () => {
    const state = loadDb();
    let count = 0;
    state.notifications.forEach(n => {
      if (n.status === 'PENDING') {
        n.status = 'SENT';
        n.attempts += 1;
        n.sentAt = new Date().toISOString();
        count++;
      }
    });
    if (count > 0) {
      saveDb(state);
    }
    return count;
  },

  // --- REPORTING & ANALYTICS ---
  getDashboardMetrics: (): DashboardMetrics => {
    const state = loadDb();
    
    // Revenue is total of account 4000-Revenue balance
    const revAccount = state.accounts.find(a => a.code === '4000-Revenue');
    const totalRevenue = revAccount ? revAccount.balance : 0;

    // Expenses is total of account 5000-PayrollExpense balance
    const expAccount = state.accounts.find(a => a.code === '5000-PayrollExpense');
    const totalExpenses = expAccount ? expAccount.balance : 0;

    const netIncome = totalRevenue - totalExpenses;

    const activeContracts = state.contracts.filter(c => c.status === 'ACTIVE').length;
    const totalEmployees = state.employees.length;
    const pendingTickets = state.tickets.filter(t => t.status !== 'RESOLVED').length;
    const pendingLeaves = state.leaves.filter(l => l.status === 'PENDING').length;

    return {
      totalRevenue,
      totalExpenses,
      netIncome,
      activeContracts,
      totalEmployees,
      pendingTickets,
      pendingLeaves
    };
  },

  getMonthlyAnalytics: () => {
    // Return analytical timeline compilation of revenues vs expenses
    return [
      { month: 'Jan 2026', revenue: 0, expenses: 0 },
      { month: 'Feb 2026', revenue: 0, expenses: 0 },
      { month: 'Mar 2026', revenue: 0, expenses: 0 },
      { month: 'Apr 2026', revenue: 0, expenses: 0 },
      { month: 'May 2026', revenue: 60000, expenses: 26000 }, // con-4 complete milestone 5 (60k)
      { month: 'Jun 2026', revenue: 30000, expenses: 0 }, // con-1 milestone 1 (30k)
      { month: 'Jul 2026', revenue: 40000, expenses: 0 }  // con-1 milestone 2 (40k)
    ];
  },

  getContractDistribution: () => {
    const state = loadDb();
    return state.contracts.map(c => {
      const contractMilestones = state.milestones.filter(m => m.contractId === c.id);
      const completedVal = contractMilestones.filter(m => m.status === 'COMPLETED').reduce((sum, m) => sum + m.value, 0);
      return {
        name: c.clientName,
        title: c.title,
        value: c.value,
        revenueRecognized: completedVal,
        status: c.status
      };
    });
  }
};
