'use client';

import { useState } from 'react';
import { Shield, Plus } from 'lucide-react';

export default function RolesPage() {
  const [roles, setRoles] = useState([
    { id: '1', name: 'owner', permissions: ['*'], isSystem: true },
    { id: '2', name: 'manager', permissions: ['customer:view', 'delivery:view', 'staff:manage'], isSystem: true },
    { id: '3', name: 'accountant', permissions: ['invoice:view', 'payment:collect'], isSystem: true },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
          <p className="text-slate-500 text-sm mt-1">Manage system and custom roles.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Custom Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                  <Shield className="w-5 h-5" />
                </div>
                {role.isSystem && (
                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">SYSTEM</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 capitalize">{role.name}</h3>
              <p className="text-sm text-slate-500 mt-2">
                {role.permissions.includes('*') ? 'All Access' : `${role.permissions.length} permissions granted`}
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Manage Permissions →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}