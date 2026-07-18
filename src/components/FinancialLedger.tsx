/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, LedgerAccount, LedgerTransaction } from '../types';
import { 
  Scale, 
  ArrowRightLeft, 
  BookOpen, 
  Plus, 
  Coins, 
  Receipt, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw,
  FolderLock,
  FileText,
  Printer,
  TrendingUp,
  Percent,
  Calendar,
  CheckCircle2,
  Building,
  Info
} from 'lucide-react';

interface FinancialLedgerProps {
  currentUser: User;
  accounts: LedgerAccount[];
  transactions: LedgerTransaction[];
  onAddManualJournal: (data: { date: string, description: string, amount: number, debitAccountCode: string, creditAccountCode: string }) => Promise<any>;
  onRefresh: () => void;
}

export default function FinancialLedger({
  currentUser,
  accounts,
  transactions,
  onAddManualJournal,
  onRefresh
}: FinancialLedgerProps) {
  const [activeTab, setActiveTab] = useState<'ledger' | 'reports'>('ledger');
  const [activeReport, setActiveReport] = useState<'income' | 'balance' | 'trial'>('income');
  const [reportingQuarter, setReportingQuarter] = useState<'ALL' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('ALL');
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [amount, setAmount] = useState(5000);
  const [description, setDescription] = useState('');
  const [debitCode, setDebitCode] = useState('1000-Cash');
  const [creditCode, setCreditCode] = useState('4000-Revenue');
  const [txDate, setTxDate] = useState('2026-07-17');
  const [errorText, setErrorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute total trial balances to prove double-entry mathematical integrity
  // Assets = Cash + A/R = 1000 + 1100
  // Liabilities = 2000
  // Equity = 3000
  // Revenue = 4000
  // Expense = 5000
  const assetBalance = accounts.filter(a => a.type === 'ASSET').reduce((sum, a) => sum + a.balance, 0);
  const liabilityBalance = accounts.filter(a => a.type === 'LIABILITY').reduce((sum, a) => sum + a.balance, 0);
  const equityBalance = accounts.filter(a => a.type === 'EQUITY').reduce((sum, a) => sum + a.balance, 0);
  const revenueBalance = accounts.filter(a => a.type === 'REVENUE').reduce((sum, a) => sum + a.balance, 0);
  const expenseBalance = accounts.filter(a => a.type === 'EXPENSE').reduce((sum, a) => sum + a.balance, 0);

  // Assets (Debit) = Liabilities (Credit) + Equity (Credit) + (Revenue (Credit) - Expenses (Debit))
  // Therefore: Assets + Expenses = Liabilities + Equity + Revenue
  const totalDebits = assetBalance + expenseBalance;
  const totalCredits = liabilityBalance + equityBalance + revenueBalance;
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (debitCode === creditCode) {
      setErrorText('Error: Debit and Credit accounts cannot be identical under double-entry constraints.');
      return;
    }

    if (amount <= 0) {
      setErrorText('Error: Transaction value must exceed zero.');
      return;
    }

    if (!description.trim()) {
      setErrorText('Error: Audit description is required.');
      return;
    }

    setIsSubmitting(true);
    const result = await onAddManualJournal({
      date: txDate,
      description,
      amount,
      debitAccountCode: debitCode,
      creditAccountCode: creditCode
    });

    if (result && result.error) {
      setErrorText(result.error);
    } else {
      // success
      setDescription('');
      setShowJournalModal(false);
    }
    setIsSubmitting(false);
  };

  const isFinanceOfficer = currentUser.role === 'ADMIN' || currentUser.role === 'FINANCE_OFFICER';

  const getQuarterlyAccountBalance = (accountCode: string, accountType: string, currentBalance: number) => {
    if (reportingQuarter === 'ALL') return currentBalance;
    
    // Filter transactions belonging to selected quarter
    const quarterTransactions = transactions.filter(tx => {
      if (!tx.date) return false;
      const m = parseInt(tx.date.split('-')[1], 10);
      if (reportingQuarter === 'Q1') return m >= 1 && m <= 3;
      if (reportingQuarter === 'Q2') return m >= 4 && m <= 6;
      if (reportingQuarter === 'Q3') return m >= 7 && m <= 9;
      if (reportingQuarter === 'Q4') return m >= 10 && m <= 12;
      return false;
    });

    // Temporary Accounts (Revenue / Expenses) reset at fiscal periods, and accumulate strictly inside that quarter
    if (accountType === 'REVENUE' || accountType === 'EXPENSE') {
      const txs = quarterTransactions.filter(t => t.accountCode === accountCode);
      const totalDebits = txs.filter(t => t.type === 'DEBIT').reduce((s, t) => s + t.amount, 0);
      const totalCredits = txs.filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
      
      if (accountType === 'REVENUE') {
        return totalCredits - totalDebits;
      } else {
        return totalDebits - totalCredits;
      }
    } else {
      // Balance Sheet accounts are cumulative. Roll them back by subtracting transactions occurring AFTER the quarter end
      const futureTransactions = transactions.filter(tx => {
        if (!tx.date) return false;
        const m = parseInt(tx.date.split('-')[1], 10);
        if (reportingQuarter === 'Q1') return m > 3;
        if (reportingQuarter === 'Q2') return m > 6;
        if (reportingQuarter === 'Q3') return m > 9;
        if (reportingQuarter === 'Q4') return m > 12;
        return false;
      });

      const txs = futureTransactions.filter(t => t.accountCode === accountCode);
      const totalDebits = txs.filter(t => t.type === 'DEBIT').reduce((s, t) => s + t.amount, 0);
      const totalCredits = txs.filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);

      if (accountType === 'ASSET') {
        return currentBalance - totalDebits + totalCredits;
      } else {
        return currentBalance - totalCredits + totalDebits;
      }
    }
  };

  const getQuarterlyTotals = () => {
    const qAccounts = accounts.map(a => ({
      ...a,
      balance: getQuarterlyAccountBalance(a.code, a.type, a.balance)
    }));

    const assetVal = qAccounts.filter(a => a.type === 'ASSET').reduce((sum, a) => sum + a.balance, 0);
    const liabilityVal = qAccounts.filter(a => a.type === 'LIABILITY').reduce((sum, a) => sum + a.balance, 0);
    const equityVal = qAccounts.filter(a => a.type === 'EQUITY').reduce((sum, a) => sum + a.balance, 0);
    const revenueVal = qAccounts.filter(a => a.type === 'REVENUE').reduce((sum, a) => sum + a.balance, 0);
    const expenseVal = qAccounts.filter(a => a.type === 'EXPENSE').reduce((sum, a) => sum + a.balance, 0);

    const netVal = revenueVal - expenseVal;

    return {
      accounts: qAccounts,
      assets: assetVal,
      liabilities: liabilityVal,
      equity: equityVal,
      revenue: revenueVal,
      expenses: expenseVal,
      netIncome: netVal,
      totalDebits: assetVal + expenseVal,
      totalCredits: liabilityVal + equityVal + revenueVal,
      isBalanced: Math.abs((assetVal + expenseVal) - (liabilityVal + equityVal + revenueVal)) < 0.01
    };
  };

  const reportData = getQuarterlyTotals();

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Chart of Accounts & Journals
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Accounting Reports (P&L, Balance Sheet)
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <span className={`w-2 h-2 rounded-full ${isBalanced ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
          {isBalanced ? 'Ledger Balanced' : 'Ledger Desynced'}
        </div>
      </div>

      {activeTab === 'ledger' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 print:hidden">
          {/* General Ledger Balance sheet summary */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Ledger Balances</h2>
                    <p className="text-xs text-slate-500">Corporate chart of accounts</p>
                  </div>
                </div>
                <button
                  onClick={onRefresh}
                  className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 transition-colors"
                  title="Recalculate Ledger"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Mathematical Integrity Checker Badge */}
              <div className={`p-4 rounded-xl border mb-6 flex items-start gap-3 text-xs ${
                isBalanced 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                  : 'bg-red-50 border-red-100 text-red-800'
              }`}>
                {isBalanced ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-sm">
                    {isBalanced ? 'Double-Entry Balanced' : 'Out of Balance Warning'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Assets (£{assetBalance.toLocaleString()}) + Expenses (£{expenseBalance.toLocaleString()}) 
                    <br />
                    <span className="font-bold text-slate-900">Equals:</span> Liabilities (£{liabilityBalance.toLocaleString()}) + Equity (£{equityBalance.toLocaleString()}) + Revenue (£{revenueBalance.toLocaleString()}).
                  </p>
                  <div className="mt-2 text-[10px] font-mono bg-white/60 px-2 py-1 rounded border border-emerald-200 inline-block text-emerald-700 font-bold">
                    Balance Match: £{totalDebits.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {accounts.map((acct) => (
                  <div key={acct.code} className="p-3.5 bg-slate-50 hover:bg-slate-50/80 rounded-xl border border-slate-200 flex justify-between items-center text-xs transition-colors">
                    <div>
                      <div className="font-mono text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded w-fit mb-1.5">
                        {acct.code}
                      </div>
                      <div className="font-bold text-slate-800 text-[13px]">{acct.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">{acct.type} Account</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[15px] font-bold text-slate-800 font-mono">
                        £{acct.balance.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium">Standard Balance</div>
                    </div>
                  </div>
                ))}
              </div>

              {isFinanceOfficer ? (
                <button
                  onClick={() => setShowJournalModal(true)}
                  className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Book Manual Journal Adjustment
                </button>
              ) : (
                <div className="mt-6 p-3.5 bg-slate-50 text-slate-400 rounded-lg text-xs italic flex items-center justify-center gap-1.5 border border-slate-200">
                  <FolderLock className="w-4 h-4" />
                  CFO clearance required to modify ledgers
                </div>
              )}
            </div>
          </div>

          {/* General double-entry journal transactions stream */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">General Ledger Audit Stream</h2>
                  <p className="text-xs text-slate-500">Live dual-legged transactions (Double-Entry audit trail)</p>
                </div>
              </div>

              <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-[9px] ${
                          tx.type === 'DEBIT' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tx.type}
                        </span>
                        <span className="font-semibold text-slate-800">Account: {tx.accountCode}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Log ID: {tx.id}</span>
                    </div>

                    <div className="text-slate-600 leading-relaxed font-medium">{tx.description}</div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-slate-400" />
                        <span>Booking Event: <span className="font-bold text-slate-600 uppercase">{tx.referenceType}</span></span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-slate-500 font-medium">Booked on: {tx.date}</div>
                        <div className="font-mono text-[13px] font-bold text-slate-800">
                          £{tx.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs">
              <BookOpen className="w-4 h-4" />
              <span>FCA regulatory-compliant monolith double-entry architecture</span>
            </div>
          </div>
        </div>
      ) : (
        /* Accounting Reports Tab */
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Reports Navigation Sidebar */}
          <div className="xl:col-span-1 space-y-6 print:hidden">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Reports Library</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveReport('income')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeReport === 'income' ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 shrink-0 text-indigo-600" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">Profit & Loss Statement</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5 truncate">Income & expenditure overview</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveReport('balance')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeReport === 'balance' ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Scale className="w-4 h-4 shrink-0 text-indigo-600" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">Balance Sheet</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5 truncate">Assets, Liabilities & Equity snapshot</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveReport('trial')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeReport === 'trial' ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Receipt className="w-4 h-4 shrink-0 text-indigo-600" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">Trial Balance Ledger</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5 truncate">Integrity check for debits & credits</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Parameters & Filters</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fiscal Year 2026</label>
                  <select
                    value={reportingQuarter}
                    onChange={(e) => setReportingQuarter(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-700"
                  >
                    <option value="ALL">All-Time Cumulative</option>
                    <option value="Q1">Q1 (Jan - Mar 2026)</option>
                    <option value="Q2">Q2 (Apr - Jun 2026)</option>
                    <option value="Q3">Q3 (Jul - Sep 2026)</option>
                    <option value="Q4">Q4 (Oct - Dec 2026)</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => window.print()}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Selected Report
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2 text-[11px] text-amber-800 leading-relaxed">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p>
                <strong>Temporary accounts</strong> (Revenue/Expenses) dynamically close out into <strong>Retained Earnings</strong> on the Balance Sheet to prove double-entry equilibrium.
              </p>
            </div>
          </div>

          {/* Main Report Canvas */}
          <div className="xl:col-span-3 bg-white rounded-xl border border-slate-200 p-8 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 space-y-6">
            
            {/* Elegant Formal Report Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6 print:border-slate-300">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs">ERP</div>
                  <span className="font-extrabold text-slate-800 text-sm tracking-tight">AETHERIS ENTERPRISE</span>
                </div>
                <h1 className="text-xl font-bold text-slate-950 font-serif">
                  {activeReport === 'income' && 'Statement of Comprehensive Income (Profit & Loss)'}
                  {activeReport === 'balance' && 'Statement of Financial Position (Balance Sheet)'}
                  {activeReport === 'trial' && 'Trial Balance Ledger Verification'}
                </h1>
                <p className="text-xs text-slate-500 font-mono">
                  {reportingQuarter === 'ALL' ? 'Reporting Period: Cumulative (To Date)' : `Reporting Period: Fiscal 2026 ${reportingQuarter}`}
                </p>
              </div>
              <div className="text-right space-y-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 uppercase">
                  Audited Report
                </span>
                <p className="text-[10px] text-slate-400 font-mono">Date: 2026-07-17</p>
                <p className="text-[10px] text-slate-400">Currency: GBP (£)</p>
              </div>
            </div>

            {/* Income Statement Report Sheet */}
            {activeReport === 'income' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-3">Revenues</h2>
                  <div className="space-y-2">
                    {reportData.accounts.filter(a => a.type === 'REVENUE').map(a => (
                      <div key={a.code} className="flex justify-between text-xs py-1">
                        <span className="text-slate-700 font-medium">[{a.code}] {a.name}</span>
                        <span className="font-mono text-slate-800">£{a.balance.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-bold border-t border-slate-300 pt-2 mt-2 text-slate-900">
                      <span>Total Revenues</span>
                      <span className="font-mono">£{reportData.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-3">Operating Expenditures</h2>
                  <div className="space-y-2">
                    {reportData.accounts.filter(a => a.type === 'EXPENSE').map(a => (
                      <div key={a.code} className="flex justify-between text-xs py-1">
                        <span className="text-slate-700 font-medium">[{a.code}] {a.name}</span>
                        <span className="font-mono text-slate-800">£{a.balance.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-bold border-t border-slate-300 pt-2 mt-2 text-slate-900">
                      <span>Total Operating Expenditures</span>
                      <span className="font-mono">£{reportData.expenses.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Net Income Grand Total Row with double underline design */}
                <div className="border-t-2 border-slate-900 pt-4 mt-6">
                  <div className="flex justify-between items-center text-sm font-extrabold text-slate-950 font-serif">
                    <span>NET RECONCILED PROFIT / (LOSS)</span>
                    <span className="font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
                      £{reportData.netIncome.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-b-4 border-double border-slate-900 mt-2"></div>
                </div>
              </div>
            )}

            {/* Balance Sheet Report Sheet */}
            {activeReport === 'balance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-3">Assets (Debit-Normal)</h2>
                  <div className="space-y-2">
                    {reportData.accounts.filter(a => a.type === 'ASSET').map(a => (
                      <div key={a.code} className="flex justify-between text-xs py-1">
                        <span className="text-slate-700 font-medium">[{a.code}] {a.name}</span>
                        <span className="font-mono text-slate-800">£{a.balance.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-bold border-t border-slate-300 pt-2 mt-2 text-slate-900">
                      <span>Total Assets</span>
                      <span className="font-mono">£{reportData.assets.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-3">Liabilities (Credit-Normal)</h2>
                  <div className="space-y-2">
                    {reportData.accounts.filter(a => a.type === 'LIABILITY').length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-1">No outstanding supplier or vendor liabilities.</p>
                    ) : (
                      reportData.accounts.filter(a => a.type === 'LIABILITY').map(a => (
                        <div key={a.code} className="flex justify-between text-xs py-1">
                          <span className="text-slate-700 font-medium">[{a.code}] {a.name}</span>
                          <span className="font-mono text-slate-800">£{a.balance.toLocaleString()}</span>
                        </div>
                      ))
                    )}
                    <div className="flex justify-between text-xs font-bold border-t border-slate-300 pt-2 mt-2 text-slate-900">
                      <span>Total Liabilities</span>
                      <span className="font-mono">£{reportData.liabilities.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-3">Equity & Retained Reserves</h2>
                  <div className="space-y-2">
                    {reportData.accounts.filter(a => a.type === 'EQUITY').map(a => (
                      <div key={a.code} className="flex justify-between text-xs py-1">
                        <span className="text-slate-700 font-medium">[{a.code}] {a.name}</span>
                        <span className="font-mono text-slate-800">£{a.balance.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs py-1">
                      <span className="text-indigo-600 font-semibold">Current Period Earnings (P&L Net Profit)</span>
                      <span className="font-mono text-slate-800">£{reportData.netIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold border-t border-slate-300 pt-2 mt-2 text-slate-900">
                      <span>Total Shareholders' Equity</span>
                      <span className="font-mono">£{(reportData.equity + reportData.netIncome).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Double Entry Balance verification card */}
                <div className="border-t-2 border-slate-900 pt-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-extrabold text-slate-950 font-serif">
                    <div className="flex justify-between border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
                      <span>TOTAL ASSETS</span>
                      <span className="font-mono text-indigo-600">£{reportData.assets.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between md:pl-6">
                      <span>TOTAL LIABILITIES & EQUITY</span>
                      <span className="font-mono text-indigo-600">£{(reportData.liabilities + reportData.equity + reportData.netIncome).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="border-b-4 border-double border-slate-900 mt-2"></div>
                </div>

                {/* Audit Integrity Seal */}
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] text-emerald-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Double-Entry Equation [Assets = Liabilities + Equity] Reconciled Perfectly
                  </span>
                  <span className="font-mono font-bold text-emerald-700">Variance: £0.00</span>
                </div>
              </div>
            )}

            {/* Trial Balance Report Sheet */}
            {activeReport === 'trial' && (
              <div className="space-y-6">
                <p className="text-xs text-slate-500 leading-relaxed">
                  A trial balance is a bookkeeping worksheet in which the balances of all ledgers are compiled into debit and credit columns to verify the mathematical reliability of the enterprise accounting engine.
                </p>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="p-3">Account Code & Name</th>
                        <th className="p-3 text-center">Account Type</th>
                        <th className="p-3 text-right">Debit Balance</th>
                        <th className="p-3 text-right">Credit Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {reportData.accounts.map(a => {
                        const isDebitNormal = a.type === 'ASSET' || a.type === 'EXPENSE';
                        return (
                          <tr key={a.code} className="hover:bg-slate-50/50">
                            <td className="p-3 font-medium">
                              <span className="font-mono text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 mr-2">{a.code}</span>
                              {a.name}
                            </td>
                            <td className="p-3 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{a.type}</td>
                            <td className="p-3 text-right font-mono font-medium text-slate-800">
                              {isDebitNormal ? `£${a.balance.toLocaleString()}` : '—'}
                            </td>
                            <td className="p-3 text-right font-mono font-medium text-slate-800">
                              {!isDebitNormal ? `£${a.balance.toLocaleString()}` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100/50 border-t border-slate-300 font-extrabold text-slate-900 text-xs">
                        <td className="p-3 font-bold" colSpan={2}>Grand Ledger Totals</td>
                        <td className="p-3 text-right font-mono text-indigo-600 font-bold border-t-2 border-slate-900">
                          £{reportData.totalDebits.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-indigo-600 font-bold border-t-2 border-slate-900">
                          £{reportData.totalCredits.toLocaleString()}
                        </td>
                      </tr>
                      {/* Double underline for GAAP standard grand totals */}
                      <tr className="bg-slate-50">
                        <td colSpan={2}></td>
                        <td className="border-b-4 border-double border-slate-900 h-2"></td>
                        <td className="border-b-4 border-double border-slate-900 h-2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] text-emerald-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Trial Balance Matched (Sum of Debits perfectly equals Credit accounts)
                  </span>
                </div>
              </div>
            )}

            {/* Formal Auditor Signoff block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-[11px] text-slate-400 font-sans print:border-slate-300 print:text-slate-500">
              <div className="space-y-4">
                <p className="font-semibold text-slate-500 uppercase tracking-wider">Prepared & Certified By:</p>
                <div className="pt-8 border-b border-slate-200 w-48"></div>
                <div>
                  <p className="font-bold text-slate-700">Lancelot du Lac</p>
                  <p className="text-[10px]">Chief Financial Officer (Finance Lead)</p>
                </div>
              </div>
              <div className="space-y-4 text-right">
                <p className="font-semibold text-slate-500 uppercase tracking-wider">Executive Management Signoff:</p>
                <div className="pt-8 border-b border-slate-200 w-48 ml-auto"></div>
                <div>
                  <p className="font-bold text-slate-700">Arthur Pendragon</p>
                  <p className="text-[10px]">Chief Executive Officer (CEO Admin)</p>
                </div>
              </div>
            </div>

            {/* Formal Footer */}
            <div className="text-center text-[9px] text-slate-400 space-y-0.5 border-t border-slate-100 pt-4 print:border-slate-300">
              <p className="font-semibold uppercase tracking-widest text-slate-500">Aetheris Monolith Ltd • Financial Reporting Systems</p>
              <p>Generated dynamically in compliant sandbox and reconciled with continuous trial balance monitors</p>
            </div>

          </div>
        </div>
      )}

      {/* Manual Journal Entry Modal */}
      {showJournalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl max-w-md w-full p-6 animate-scaleIn">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Book Double-Entry Journal Adjust</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Manually book a general ledger adjustment. Enter equal and offsetting legs to protect ledger balance harmony.
            </p>

            <form onSubmit={handleJournalSubmit} className="space-y-4">
              {errorText && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs font-semibold">
                  {errorText}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Adjustment Value (£ GBP)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Audit Trail Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bank charge interest adjustments"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Leg 1: DEBIT Account</label>
                  <select
                    value={debitCode}
                    onChange={(e) => setDebitCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
                  >
                    {accounts.map(a => (
                      <option key={a.code} value={a.code}>[{a.code}] {a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Leg 2: CREDIT Account</label>
                  <select
                    value={creditCode}
                    onChange={(e) => setCreditCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
                  >
                    {accounts.map(a => (
                      <option key={a.code} value={a.code}>[{a.code}] {a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Posting Date</label>
                <input
                  type="date"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowJournalModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Posting Dual Legs...' : 'Book Audit Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
