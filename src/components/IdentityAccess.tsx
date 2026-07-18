/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserSession, UserRole, Department, Seniority } from '../types';
import { Shield, Key, Users, UsersRound, Settings2, Laptop, Globe, UserCheck, RefreshCw } from 'lucide-react';

interface IdentityAccessProps {
  currentUser: User;
  users: User[];
  sessions: UserSession[];
  onUpdateUserRole: (id: string, role: UserRole, department: Department, seniority: Seniority) => void;
  onRefresh: () => void;
}

export default function IdentityAccess({
  currentUser,
  users,
  sessions,
  onUpdateUserRole,
  onRefresh
}: IdentityAccessProps) {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('EMPLOYEE');
  const [editDept, setEditDept] = useState<Department>('SUPPORT');
  const [editSeniority, setEditSeniority] = useState<Seniority>('MID');
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = (user: User) => {
    setEditingUserId(user.id);
    setEditRole(user.role);
    setEditDept(user.department);
    setEditSeniority(user.seniority);
  };

  const saveEdit = async (id: string) => {
    setIsSaving(true);
    await onUpdateUserRole(id, editRole, editDept, editSeniority);
    setEditingUserId(null);
    setIsSaving(false);
  };

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Users Management Column */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Corporate Directory</h2>
              <p className="text-xs text-slate-500">Departmental assignments and active system privileges</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-100 transition-colors"
            title="Refresh Directory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
          <Shield className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-900">Role-Based Access Control (RBAC):</span>{' '}
            Permissions are enforced at the API level. Only users assigned the <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-md font-mono">ADMIN</span> role can modify user departments, roles, or seniority clearances.
            {!isAdmin && (
              <p className="mt-1 text-amber-600 font-medium">
                ⚠️ Your current active persona ({currentUser.fullName}) is not an Admin. Access level editing is disabled.
              </p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">User / Identity</th>
                <th className="pb-3">Role Designation</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Seniority Level</th>
                <th className="pb-3 text-right pr-2">Clearance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {users.map((user) => {
                const isSelf = user.id === currentUser.id;
                const isEditing = editingUserId === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                          alt={user.fullName}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                        />
                        <div>
                          <div className="font-medium text-slate-900 flex items-center gap-1.5">
                            {user.fullName}
                            {isSelf && (
                              <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-normal">
                                active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      {isEditing ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as UserRole)}
                          className="bg-white border border-slate-200 text-xs rounded-lg p-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="MANAGER">MANAGER</option>
                          <option value="FINANCE_OFFICER">FINANCE_OFFICER</option>
                          <option value="CONTRACT_OFFICER">CONTRACT_OFFICER</option>
                          <option value="EMPLOYEE">EMPLOYEE</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-medium ${
                          user.role === 'ADMIN' ? 'bg-red-50 text-red-700 border border-red-100' :
                          user.role === 'MANAGER' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          user.role === 'FINANCE_OFFICER' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          user.role === 'CONTRACT_OFFICER' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-xs font-medium text-slate-600">
                      {isEditing ? (
                        <select
                          value={editDept}
                          onChange={(e) => setEditDept(e.target.value as Department)}
                          className="bg-white border border-slate-200 text-xs rounded-lg p-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="EXECUTIVE">EXECUTIVE</option>
                          <option value="HR">HR</option>
                          <option value="FINANCE">FINANCE</option>
                          <option value="SALES">SALES</option>
                          <option value="ENGINEERING">ENGINEERING</option>
                          <option value="SUPPORT">SUPPORT</option>
                        </select>
                      ) : (
                        user.department
                      )}
                    </td>
                    <td className="py-4">
                      {isEditing ? (
                        <select
                          value={editSeniority}
                          onChange={(e) => setEditSeniority(e.target.value as Seniority)}
                          className="bg-white border border-slate-200 text-xs rounded-lg p-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="EXECUTIVE">EXECUTIVE</option>
                          <option value="LEAD">LEAD</option>
                          <option value="SENIOR">SENIOR</option>
                          <option value="MID">MID</option>
                          <option value="JUNIOR">JUNIOR</option>
                        </select>
                      ) : (
                        <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          {user.seniority}
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right pr-2">
                      {isAdmin ? (
                        isEditing ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => saveEdit(user.id)}
                              disabled={isSaving}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(user)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded text-xs font-medium border border-slate-200 hover:border-indigo-100 transition-all"
                          >
                            <Settings2 className="w-3 h-3" />
                            Manage
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-slate-300 italic">No Clearance</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sessions & Token Audit Column */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-lg">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Session Audit Logs</h2>
              <p className="text-xs text-slate-500">Live active tokens and trace identifiers</p>
            </div>
          </div>

          <div className="space-y-4">
            {sessions.map((session) => {
              const sessionUser = users.find(u => u.id === session.userId);
              return (
                <div key={session.id} className="p-4 bg-slate-50 hover:bg-slate-50/80 rounded-xl border border-slate-100 text-xs transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-slate-800">
                        {sessionUser ? sessionUser.fullName : 'Identity unknown'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      ID: {session.id}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{session.device}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>IP Address: {session.ipAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Authenticated: {new Date(session.activeSince).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
            <UsersRound className="w-3.5 h-3.5" />
            <span>Monolith identity isolation checks active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
