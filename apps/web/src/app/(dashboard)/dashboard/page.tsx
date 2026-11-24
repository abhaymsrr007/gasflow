'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, TrendingUp, AlertCircle, Truck, ArrowUpRight } from 'lucide-react';
import { useAuth } from 'apps/web/src/context/AuthContext';
import { apiClient } from 'apps/web/src/lib/api';

export default function DashboardPage() { // 👈 Ye default export zaroori hai
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchDashboard = async () => {
        try {
          const res = await apiClient('/reports/dashboard');
          setData(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDashboard();
    }
  }, [user]);

  if (isLoading || loading || !user) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading dashboard...</div>;
  }

  const stats = [
    { title: "Today's Deliveries", value: data?.today?.totalDeliveries || 0, icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Today's Sales", value: `₹${(Number(data?.today?.totalSalesPaise || 0) / 100).toLocaleString('en-IN')}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Pending Payments", value: `₹${(Number(data?.pendingPaymentsPaise || 0) / 100).toLocaleString('en-IN')}`, icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
    { title: "Active Trips", value: data?.activeTrips || 0, icon: Truck, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Here is what's happening with your agency today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
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
    </div>
  );
}