/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import dotenv from 'dotenv';
import cors from 'cors';

const PORT: number = Number(process.env.PORT) || 5000;

dotenv.config();

// Simple in-memory global state tracking the "Active Session User" to allow switching personas in the UI
let activeUserId = ''; // Default empty: requires credentials login

async function startServer() {
  const app = express();
 
 app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

  // Support JSON and urlencoded request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173' 
}));

  // --- API ROUTING SECTION ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'ERP Modular Monolith' });
  });

  // --- IDENTITY & ACCESS CONTROL (AUTH & RBAC) ---
  app.get('/api/auth/me', (req, res) => {
    const user = db.getUserById(activeUserId);
    if (!user) {
      return res.status(401).json({ error: 'Active user session not found.' });
    }
    res.json(user);
  });

  app.post('/api/auth/login', (req, res) => {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required.' });
    }

    const allUsers = db.getUsers();
    const user = allUsers.find(u => 
      (u.username?.toLowerCase() === usernameOrEmail.toLowerCase() || u.email.toLowerCase() === usernameOrEmail.toLowerCase()) && 
      u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email/username and password.' });
    }

    activeUserId = user.id;

    const session = db.createSession(
      user.id,
      'Aetheris Web Console',
      req.ip || '127.0.0.1'
    );

    res.json({ user, session });
  });

  app.post('/api/auth/logout', (req, res) => {
    activeUserId = '';
    res.json({ success: true });
  });

  app.post('/api/auth/switch', (req, res) => {
    const { userId, device, ip } = req.body;
    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Target user not found.' });
    }
    
    activeUserId = userId;
    
    // Track session login in the logs
    const session = db.createSession(
      userId, 
      device || 'Browser Agent', 
      ip || '127.0.0.1'
    );
    
    res.json({ user, session });
  });

  app.get('/api/auth/sessions', (req, res) => {
    const sessions = db.getSessions();
    res.json(sessions);
  });

  app.get('/api/users', (req, res) => {
    res.json(db.getUsers());
  });

  app.patch('/api/users/:id/role', (req, res) => {
    const { id } = req.params;
    const { role, department, seniority } = req.body;
    const updated = db.updateUserRole(id, role, department, seniority);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updated);
  });

  // --- OPERATIONAL MANAGEMENT (CONTRACTS, MILESTONES, MESSAGES, TICKETS) ---
  app.get('/api/contracts', (req, res) => {
    res.json(db.getContracts());
  });

  app.post('/api/contracts', (req, res) => {
    try {
      const contract = db.createContract(req.body);
      res.status(201).json(contract);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch('/api/contracts/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const contract = db.updateContractStatus(id, status);
    if (!contract) return res.status(404).json({ error: 'Contract not found' });
    res.json(contract);
  });

  app.get('/api/contracts/milestones', (req, res) => {
    res.json(db.getMilestones());
  });

  app.post('/api/contracts/milestones', (req, res) => {
    const milestone = db.createMilestone(req.body);
    res.status(201).json(milestone);
  });

  app.post('/api/contracts/milestones/:id/complete', (req, res) => {
    const { id } = req.params;
    const milestone = db.completeMilestone(id);
    if (!milestone) {
      return res.status(400).json({ error: 'Milestone not found, or has already been billed.' });
    }
    res.json(milestone);
  });

  app.get('/api/contracts/:id/messages', (req, res) => {
    const { id } = req.params;
    res.json(db.getMessages(id));
  });

  app.post('/api/contracts/:id/messages', (req, res) => {
    const { id } = req.params;
    const { content, senderId } = req.body;
    const msg = db.createMessage(id, senderId || activeUserId, content);
    res.status(201).json(msg);
  });

  app.get('/api/tickets', (req, res) => {
    res.json(db.getTickets());
  });

  app.post('/api/tickets', (req, res) => {
    const ticket = db.createTicket(req.body);
    res.status(201).json(ticket);
  });

  app.patch('/api/tickets/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const ticket = db.updateTicketStatus(id, status);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  });

  // --- WORKFORCE MANAGEMENT (HRMS) ---
  app.get('/api/employees', (req, res) => {
    res.json(db.getEmployees());
  });

  app.post('/api/employees', (req, res) => {
    try {
      const created = db.createEmployee(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed creating employee.' });
    }
  });

  app.put('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const updated = db.updateEmployee(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.json(updated);
  });

  app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    if (id === activeUserId) {
      return res.status(400).json({ error: 'Cannot delete the currently logged-in active user persona.' });
    }
    db.deleteEmployee(id);
    res.json({ success: true });
  });

  app.patch('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const updated = db.updateEmployeeProfile(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.json(updated);
  });

  app.get('/api/leaves', (req, res) => {
    res.json(db.getLeaves());
  });

  app.post('/api/leaves', (req, res) => {
    const leave = db.createLeaveRequest(req.body);
    res.status(201).json(leave);
  });

  app.post('/api/leaves/:id/approve', (req, res) => {
    const { id } = req.params;
    const { status, approvedBy } = req.body; // 'APPROVED' | 'REJECTED'
    const leave = db.approveLeaveRequest(id, approvedBy || activeUserId, status);
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });
    res.json(leave);
  });

  app.get('/api/payroll', (req, res) => {
    res.json(db.getPayrollRuns());
  });

  app.post('/api/payroll', (req, res) => {
    const { period } = req.body;
    const result = db.executePayroll(period, activeUserId);
    if ('error' in result) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // --- ATTENDANCE ---
  app.get('/api/attendance', (req, res) => {
    res.json(db.getAttendance());
  });

  app.post('/api/attendance', (req, res) => {
    try {
      const updated = db.markAttendance(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to mark attendance.' });
    }
  });

  // --- FINANCIAL INTEGRITY (GENERAL LEDGER) ---
  app.get('/api/finance/accounts', (req, res) => {
    res.json(db.getAccounts());
  });

  app.get('/api/finance/transactions', (req, res) => {
    res.json(db.getTransactions());
  });

  app.post('/api/finance/journal', (req, res) => {
    const result = db.createManualTransaction(req.body);
    if ('error' in result) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // --- SUPPORTING INFRASTRUCTURE: COMMUNICATIONS ---
  app.get('/api/notifications', (req, res) => {
    res.json(db.getNotifications());
  });

  app.post('/api/notifications/flush', (req, res) => {
    const flushedCount = db.flushNotificationQueue();
    res.json({ success: true, count: flushedCount });
  });

  // --- REPORTING & ANALYTICS ---
  app.get('/api/analytics/dashboard', (req, res) => {
    res.json(db.getDashboardMetrics());
  });

  app.get('/api/analytics/monthly', (req, res) => {
    res.json(db.getMonthlyAnalytics());
  });

  app.get('/api/analytics/distribution', (req, res) => {
    res.json(db.getContractDistribution());
  });


  // --- FRONTEND SERVING WITH VITE INTEGRATION ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For React SPA Routing support
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Enterprise ERP Server booted on port ${PORT} [NODE_ENV=${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer().catch(err => {
  console.error('Fatal: Server failed to start:', err);
});
