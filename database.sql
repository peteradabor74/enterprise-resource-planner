-- ====================================================================
-- AETHERIS RESOURCE MONOLITH - ENTERPRISE DATABASE SCHEMA & SEED DATA
-- Target Compatibility: PostgreSQL / MySQL / Standard Relational SQL
-- File: database.sql
-- ====================================================================

-- Disable foreign key checks for clean setup if supported
-- FOR PostgreSQL: SET session_replication_role = 'replica';
-- FOR MySQL: SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS queued_notifications CASCADE;
DROP TABLE IF EXISTS ledger_transactions CASCADE;
DROP TABLE IF EXISTS ledger_accounts CASCADE;
DROP TABLE IF EXISTS payroll_runs CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS employee_profiles CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS project_milestones CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Re-enable foreign key checks if supported
-- FOR PostgreSQL: SET session_replication_role = 'origin';
-- FOR MySQL: SET FOREIGN_KEY_CHECKS = 1;


-- ==========================================
-- 1. USERS & CREDENTIALS TABLE
-- ==========================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ADMIN, MANAGER, EMPLOYEE, FINANCE_OFFICER, CONTRACT_OFFICER
    department VARCHAR(50) NOT NULL, -- EXECUTIVE, HR, FINANCE, SALES, ENGINEERING, SUPPORT
    seniority VARCHAR(50) NOT NULL, -- JUNIOR, MID, SENIOR, LEAD, EXECUTIVE
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    avatar VARCHAR(255)
);

-- ==========================================
-- 2. SESSIONS AUDIT LOG
-- ==========================================
CREATE TABLE sessions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    device VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50) NOT NULL,
    active_since TIMESTAMP NOT NULL,
    last_active TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- 3. CLIENT CONTRACTS TABLE
-- ==========================================
CREATE TABLE contracts (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- PENDING, ACTIVE, COMPLETED, TERMINATED
    sla_level VARCHAR(20) NOT NULL, -- GOLD, SILVER, BRONZE
    billing_frequency VARCHAR(50) NOT NULL -- MONTHLY, ONCE, MILESTONE
);

-- ==========================================
-- 4. SUPPORT TICKETS
-- ==========================================
CREATE TABLE support_tickets (
    id VARCHAR(50) PRIMARY KEY,
    contract_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL, -- HIGH, MEDIUM, LOW
    status VARCHAR(50) NOT NULL, -- OPEN, IN_PROGRESS, RESOLVED
    assigned_to VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================
-- 5. PROJECT MILESTONES
-- ==========================================
CREATE TABLE project_milestones (
    id VARCHAR(50) PRIMARY KEY,
    contract_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- PENDING, COMPLETED
    completed_at DATE,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

-- ==========================================
-- 6. CONTRACT COLLABORATION MESSAGES
-- ==========================================
CREATE TABLE messages (
    id VARCHAR(50) PRIMARY KEY,
    contract_id VARCHAR(50) NOT NULL,
    sender_id VARCHAR(50),
    sender_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================
-- 7. EMPLOYEE COMPENSATION PROFILE (HRMS)
-- ==========================================
CREATE TABLE employee_profiles (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    reports_to VARCHAR(50),
    salary DECIMAL(15, 2) NOT NULL,
    join_date DATE NOT NULL,
    bank_details VARCHAR(255) NOT NULL,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reports_to) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================
-- 8. LEAVE REQUESTS (HRMS)
-- ==========================================
CREATE TABLE leave_requests (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type VARCHAR(50) NOT NULL, -- SICK, VACATION, PERSONAL
    status VARCHAR(50) NOT NULL, -- PENDING, APPROVED, REJECTED
    reason TEXT NOT NULL,
    approved_by VARCHAR(50),
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================
-- 9. PAYROLL RUNS (FINANCIALS)
-- ==========================================
CREATE TABLE payroll_runs (
    id VARCHAR(50) PRIMARY KEY,
    period VARCHAR(20) NOT NULL, -- e.g. "2026-06"
    amount_paid DECIMAL(15, 2) NOT NULL,
    run_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL -- DRAFT, PAID
);

-- ==========================================
-- 10. CHART OF ACCOUNTS (FINANCIAL GENERAL LEDGER)
-- ==========================================
CREATE TABLE ledger_accounts (
    code VARCHAR(50) PRIMARY KEY, -- e.g. "1000-Cash"
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00
);

-- ==========================================
-- 11. DOUBLE-ENTRY LEDGER TRANSACTIONS AUDIT
-- ==========================================
CREATE TABLE ledger_transactions (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- DEBIT, CREDIT
    account_code VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50) NOT NULL, -- REVENUE_MILESTONE, EXPENSE_PAYROLL, MANUAL
    reference_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (account_code) REFERENCES ledger_accounts(code) ON DELETE CASCADE
);

-- ==========================================
-- 12. QUEUED SYSTEM NOTIFICATIONS (OUTBOX)
-- ==========================================
CREATE TABLE queued_notifications (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- EMAIL, SMS
    recipient VARCHAR(100) NOT NULL,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL, -- PENDING, SENT, FAILED
    attempts INT DEFAULT 0,
    scheduled_at TIMESTAMP NOT NULL,
    sent_at TIMESTAMP
);

-- ==========================================
-- 13. ATTENDANCE CLOCK IN/OUT RECORDS
-- ==========================================
CREATE TABLE attendance_records (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    check_in TIME NOT NULL,
    check_out TIME,
    status VARCHAR(20) NOT NULL, -- PRESENT, ABSENT, LATE, REMOTE
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ====================================================================
--                       SEED INITIAL DATA SET
-- ====================================================================

-- 1. Users & Passwords Seed
INSERT INTO users (id, email, username, password, full_name, role, department, seniority, status, avatar) VALUES
('usr-1', 'admin@enterprise.com', 'pendragon', 'admin123', 'Arthur Pendragon', 'ADMIN', 'EXECUTIVE', 'EXECUTIVE', 'ACTIVE', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120'),
('usr-2', 'hr@enterprise.com', 'gwenivere', 'password123', 'Gwenivere Vance', 'MANAGER', 'HR', 'LEAD', 'ACTIVE', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'),
('usr-3', 'finance@enterprise.com', 'lancelot', 'password123', 'Lancelot du Lac', 'FINANCE_OFFICER', 'FINANCE', 'LEAD', 'ACTIVE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'),
('usr-4', 'contracts@enterprise.com', 'merlin', 'password123', 'Merlin Ambrosius', 'CONTRACT_OFFICER', 'SUPPORT', 'LEAD', 'ACTIVE', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120'),
('usr-5', 'alice@enterprise.com', 'alice', 'password123', 'Alice Liddell', 'EMPLOYEE', 'ENGINEERING', 'SENIOR', 'ACTIVE', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120'),
('usr-6', 'bob@enterprise.com', 'bob', 'password123', 'Robert Grantham', 'EMPLOYEE', 'SUPPORT', 'MID', 'ACTIVE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120'),
('usr-7', 'carol@enterprise.com', 'carol', 'password123', 'Carol Danvers', 'EMPLOYEE', 'SALES', 'JUNIOR', 'ACTIVE', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120');

-- 2. Sessions Log Seed
INSERT INTO sessions (id, user_id, device, ip_address, active_since, last_active) VALUES
('ses-1', 'usr-1', 'MacBook Pro - Chrome (London)', '194.22.4.99', '2026-07-17 08:30:00', '2026-07-17 11:45:00'),
('ses-2', 'usr-3', 'ThinkPad - Firefox (Paris)', '82.44.112.5', '2026-07-17 09:15:00', '2026-07-17 11:32:00'),
('ses-3', 'usr-5', 'Ubuntu workstation - VSCode (Munich)', '46.99.12.23', '2026-07-17 07:45:00', '2026-07-17 10:15:00');

-- 3. Contracts Seed
INSERT INTO contracts (id, title, client_name, value, start_date, end_date, status, sla_level, billing_frequency) VALUES
('con-1', 'Global Cloud Platform Migration', 'Acme Corporation', 120000.00, '2026-06-01', '2027-05-31', 'ACTIVE', 'GOLD', 'MILESTONE'),
('con-2', 'Enterprise Network Security Audit', 'Cyberdyne Systems', 45000.00, '2026-07-01', '2026-12-31', 'ACTIVE', 'SILVER', 'MONTHLY'),
('con-3', 'Smart Grid ERP Integration Consultancy', 'Stark Industries', 180000.00, '2026-08-01', '2027-07-31', 'PENDING', 'GOLD', 'MILESTONE'),
('con-4', 'Legacy Systems Decommissioning', 'Tyrell BioTech', 60000.00, '2026-01-01', '2026-06-30', 'COMPLETED', 'BRONZE', 'ONCE');

-- 4. Tickets Seed
INSERT INTO support_tickets (id, contract_id, title, description, priority, status, assigned_to, created_at) VALUES
('tkt-1', 'con-1', 'VPN Gateway Access Failures', 'Engineers from Acme cannot connect to the staging subnet since this morning. Suspect routing table typo in development VPC.', 'HIGH', 'OPEN', 'usr-5', '2026-07-17 09:00:00'),
('tkt-2', 'con-2', 'Weekly Firewall Intrusion Logs Audit', 'Routine check of logs under SLA level SILVER is due today. Request logs from corporate IT manager.', 'MEDIUM', 'IN_PROGRESS', 'usr-6', '2026-07-16 14:30:00'),
('tkt-3', 'con-1', 'Billing Discrepancy on Milestone 1', 'Acme accounts payable is asking if the invoice details include the VAT exemption clause.', 'LOW', 'RESOLVED', 'usr-3', '2026-07-15 11:00:00');

-- 5. Milestones Seed
INSERT INTO project_milestones (id, contract_id, title, value, due_date, status, completed_at) VALUES
('mil-1', 'con-1', 'Architecture Review and VPC Blueprint', 30000.00, '2026-06-15', 'COMPLETED', '2026-06-14'),
('mil-2', 'con-1', 'Core IAM and Active Directory Federation', 40000.00, '2026-07-10', 'COMPLETED', '2026-07-09'),
('mil-3', 'con-1', 'Database Live Sharding Migration', 50000.00, '2026-10-31', 'PENDING', NULL),
('mil-4', 'con-2', 'Penetration Testing and Remediation Plan', 20000.00, '2026-09-15', 'PENDING', NULL),
('mil-5', 'con-4', 'Decommissioning Sign-off', 60000.00, '2026-06-25', 'COMPLETED', '2026-06-25');

-- 6. Messages Seed
INSERT INTO messages (id, contract_id, sender_id, sender_name, content, created_at) VALUES
('msg-1', 'con-1', 'usr-1', 'Arthur Pendragon', 'VPC migration architecture approved. We are initiating AD Federation.', '2026-06-10 14:30:00'),
('msg-2', 'con-1', 'usr-5', 'Alice Liddell', 'VPC subnets deployed. Security groups hardened. Handing over to AD team.', '2026-06-13 09:12:00'),
('msg-3', 'con-2', 'usr-6', 'Robert Grantham', 'Awaiting network diagrams from Cyberdyne to proceed with audit.', '2026-07-14 10:00:00');

-- 7. Employees Profile Seed
INSERT INTO employee_profiles (id, title, reports_to, salary, join_date, bank_details) VALUES
('usr-1', 'Chief Executive Officer', NULL, 15000.00, '2025-01-01', 'IBAN: GB99 enterprise-exec-0001'),
('usr-2', 'Human Resources Lead', 'usr-1', 8000.00, '2025-02-15', 'IBAN: GB99 enterprise-hr-0002'),
('usr-3', 'Chief Financial Officer', 'usr-1', 9500.00, '2025-01-10', 'IBAN: GB99 enterprise-finance-0003'),
('usr-4', 'Contracts Delivery Officer', 'usr-1', 8500.00, '2025-03-01', 'IBAN: GB99 enterprise-contracts-0004'),
('usr-5', 'Senior Software Architect', 'usr-4', 9000.00, '2025-05-10', 'IBAN: GB99 enterprise-staff-0005'),
('usr-6', 'System Support Specialist', 'usr-4', 5000.00, '2025-08-01', 'IBAN: GB99 enterprise-staff-0006'),
('usr-7', 'Junior Sales Executive', 'usr-1', 4000.00, '2026-03-15', 'IBAN: GB99 enterprise-staff-0007');

-- 8. Leaves Seed
INSERT INTO leave_requests (id, employee_id, employee_name, start_date, end_date, leave_type, status, reason, approved_by) VALUES
('lv-1', 'usr-5', 'Alice Liddell', '2026-08-05', '2026-08-15', 'VACATION', 'PENDING', 'Summer holiday trip to Japan with family.', NULL),
('lv-2', 'usr-6', 'Robert Grantham', '2026-07-10', '2026-07-12', 'SICK', 'APPROVED', 'Wisdom tooth extraction surgery.', 'usr-2'),
('lv-3', 'usr-7', 'Carol Danvers', '2026-09-01', '2026-09-02', 'PERSONAL', 'PENDING', 'Attending sibling graduation.', NULL);

-- 9. Payroll Runs Seed
INSERT INTO payroll_runs (id, period, amount_paid, run_date, status) VALUES
('pay-1', '2026-05', 51000.00, '2026-05-28', 'PAID'),
('pay-2', '2026-06', 53000.00, '2026-06-28', 'PAID'),
('pay-3', '2026-07', 53000.00, '2026-07-28', 'DRAFT');

-- 10. Ledger Accounts Seed
INSERT INTO ledger_accounts (code, name, type, balance) VALUES
('1000-Cash', 'Corporate Operating Bank Account', 'ASSET', 250000.00),
('1100-AccountsReceivable', 'Trade Debtors & Client Invoices', 'ASSET', 50000.00),
('2000-AccountsPayable', 'Suppliers & Creditors Liability', 'LIABILITY', 0.00),
('3000-RetainedEarnings', 'Accumulated Corporate Reserves', 'EQUITY', 196000.00),
('4000-Revenue', 'Contract Milestone Invoiced Revenue', 'REVENUE', 130000.00),
('5000-PayrollExpense', 'Workforce Salaries Expense', 'EXPENSE', 26000.00);

-- 11. Ledger Transactions Seed
INSERT INTO ledger_transactions (id, date, description, amount, type, account_code, reference_type, reference_id) VALUES
('tx-1a', '2026-06-14', 'Acme Milestone 1 VPC Blueprint Complete (Debit Cash)', 30000.00, 'DEBIT', '1000-Cash', 'REVENUE_MILESTONE', 'mil-1'),
('tx-1b', '2026-06-14', 'Acme Milestone 1 VPC Blueprint Complete (Credit Revenue)', 30000.00, 'CREDIT', '4000-Revenue', 'REVENUE_MILESTONE', 'mil-1'),
('tx-2a', '2026-06-25', 'Tyrell BioTech Milestone Decommission Complete (Debit Cash)', 60000.00, 'DEBIT', '1000-Cash', 'REVENUE_MILESTONE', 'mil-5'),
('tx-2b', '2026-06-25', 'Tyrell BioTech Milestone Decommission Complete (Credit Revenue)', 60000.00, 'CREDIT', '4000-Revenue', 'REVENUE_MILESTONE', 'mil-5'),
('tx-3a', '2026-07-09', 'Acme Milestone 2 IAM Federation Complete (Debit Cash)', 40000.00, 'DEBIT', '1000-Cash', 'REVENUE_MILESTONE', 'mil-2'),
('tx-3b', '2026-07-09', 'Acme Milestone 2 IAM Federation Complete (Credit Revenue)', 40000.00, 'CREDIT', '4000-Revenue', 'REVENUE_MILESTONE', 'mil-2'),
('tx-4a', '2026-06-28', 'Workforce Payroll Run June 2026 (Debit Salary Expense)', 26000.00, 'DEBIT', '5000-PayrollExpense', 'EXPENSE_PAYROLL', 'pay-2'),
('tx-4b', '2026-06-28', 'Workforce Payroll Run June 2026 (Credit Operating Cash)', 26000.00, 'CREDIT', '1000-Cash', 'EXPENSE_PAYROLL', 'pay-2');

-- 12. Queued Notifications Seed
INSERT INTO queued_notifications (id, type, recipient, subject, body, status, attempts, scheduled_at, sent_at) VALUES
('not-1', 'EMAIL', 'admin@enterprise.com', 'System Initialization', 'Enterprise Resource Monolith system database mounted and seeded successfully.', 'SENT', 1, '2026-07-17 01:30:00', '2026-07-17 01:30:05'),
('not-2', 'EMAIL', 'hr@enterprise.com', 'New Leave Request Alert', 'Employee Alice Liddell has requested Vacation from 2026-08-05 to 2026-08-15. Pending review.', 'PENDING', 0, '2026-07-17 09:05:00', NULL);

-- 13. Attendance Records Seed
INSERT INTO attendance_records (id, employee_id, employee_name, date, check_in, check_out, status, notes) VALUES
('att-1', 'usr-5', 'Alice Liddell', '2026-07-17', '09:02:15', '17:30:00', 'PRESENT', 'Arrived on time, worked on cloud migration.'),
('att-2', 'usr-6', 'Robert Grantham', '2026-07-17', '08:45:00', '17:00:00', 'PRESENT', 'Routine network support tasks.'),
('att-3', 'usr-7', 'Carol Danvers', '2026-07-17', '09:45:00', '18:15:00', 'LATE', 'Stuck in traffic, notified manager.');

-- ====================================================================
--                         INDEX OPTIMIZATIONS
-- ====================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_milestones_contract ON project_milestones(contract_id);
CREATE INDEX idx_tickets_contract ON support_tickets(contract_id);
CREATE INDEX idx_transactions_account ON ledger_transactions(account_code);
CREATE INDEX idx_attendance_employee ON attendance_records(employee_id);
