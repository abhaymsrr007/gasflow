'use client';

import { useEffect, useState } from 'react';
import { Package, TrendingUp, AlertCircle, Truck, ArrowUpRight } from 'lucide-react';
import { useAuth } from 'apps/web/src/context/AuthContext';
import { apiClient } from 'apps/web/src/lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiClient('/reports/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const isDeliveryMan = user.role === 'delivery_man';

  // Delivery Man ke liye Stats
  const deliveryStats = [
    { title: "My Deliveries Today", value: data?.today?.totalDeliveries || 0, icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "My Sales Today", value: `₹${(Number(data?.today?.totalSalesPaise || 0) / 100).toLocaleString('en-IN')}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Active Trip", value: data?.activeTrips || 0, icon: Truck, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  // Owner/Manager ke liye Stats
  const adminStats = [
    { title: "Today's Deliveries", value: data?.today?.totalDeliveries || 0, icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Today's Sales", value: `₹${(Number(data?.today?.totalSalesPaise || 0) / 100).toLocaleString('en-IN')}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Pending Payments", value: `₹${(Number(data?.pendingPaymentsPaise || 0) / 100).toLocaleString('en-IN')}`, icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
    { title: "Active Trips", value: data?.activeTrips || 0, icon: Truck, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  const statsToShow = isDeliveryMan ? deliveryStats : adminStats;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isDeliveryMan ? `Welcome, ${user.fullName}` : 'Overview'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isDeliveryMan ? 'Here is your summary for today.' : "Here is what's happening with your agency today."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isDeliveryMan ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
        {statsToShow.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section (Placeholder for now) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
            <h2 className="text-lg font-semibold text-slate-800">Recent Deliveries</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Package className="w-12 h-12 mb-3 text-slate-300" />
            <p>No recent deliveries found.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
            <h2 className="text-lg font-semibold text-slate-800">
              {isDeliveryMan ? 'My Active Trip' : 'Low Stock Alerts'}
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <AlertCircle className="w-12 h-12 mb-3 text-slate-300" />
            <p>{isDeliveryMan ? 'No active trip assigned.' : 'All stock levels are healthy.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}