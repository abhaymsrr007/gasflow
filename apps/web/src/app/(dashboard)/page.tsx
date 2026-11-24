'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiClient('/reports/dashboard');
        setData(res.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading dashboard...</div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">Error: {error}</div>;

  const statCards = [
    { title: "Aaj ki Deliveries", value: data?.today?.totalDeliveries || 0, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Aaj ki Sales", value: `₹ ${data?.today?.totalSalesPaise ? (Number(data.today.totalSalesPaise) / 100).toFixed(2) : '0.00'}`, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Pending Payments", value: `₹ ${data?.pendingPaymentsPaise ? (Number(data.pendingPaymentsPaise) / 100).toFixed(2) : '0.00'}`, color: "text-red-600", bg: "bg-red-50" },
    { title: "Active Trips", value: data?.activeTrips || 0, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Aaj ke business ka summary.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <div className={`w-4 h-4 rounded-full ${card.color.replace('text-', 'bg-')}`}></div>
              </div>
              <p className="text-slate-500 text-sm font-medium">{card.title}</p>
            </div>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder for Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          Abhi koi recent activity nahi hai.
        </div>
      </div>
    </div>
  );
}