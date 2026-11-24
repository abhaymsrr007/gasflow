'use client';

import { useState } from 'react';
import { Plus, Search, Phone } from 'lucide-react';
import { useCreateCustomer, useCustomers } from 'apps/web/src/hooks/useCustomers';

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useCustomers(page, search);
  const createMutation = useCreateCustomer();

  // Form State (Swagger ke hisaab se)
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('dhaba');
  const [creditLimit, setCreditLimit] = useState('0'); // Rupees mein input lenge
  const [openingBalance, setOpeningBalance] = useState('0'); // Rupees mein input lenge

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    
    // Frontend mein Rupees, Backend mein Paise
    const creditLimitPaise = Math.round(parseFloat(creditLimit) * 100);
    const openingBalancePaise = Math.round(parseFloat(openingBalance) * 100);

    createMutation.mutate({
      businessName,
      contactPerson: contactPerson || undefined,
      phone,
      category,
      creditLimitPaise: isNaN(creditLimitPaise) ? 0 : creditLimitPaise,
      openingBalancePaise: isNaN(openingBalancePaise) ? 0 : openingBalancePaise,
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        // Form reset karo
        setBusinessName('');
        setContactPerson('');
        setPhone('');
        setCategory('dhaba');
        setCreditLimit('0');
        setOpeningBalance('0');
      },
      onError: (error: any) => {
        alert(error.message || 'Failed to add customer');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your agency customers</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          placeholder="Search by name or phone..." 
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-6 py-3 font-medium">Business Name</th>
              <th className="px-6 py-3 font-medium">Contact Person</th>
              <th className="px-6 py-3 font-medium">Phone</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : data?.data?.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No customers found.</td></tr>
            ) : (
              data?.data?.map((customer: any) => (
                <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{customer.businessName}</td>
                  <td className="px-6 py-4 text-slate-600">{customer.contactPerson || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" /> {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 capitalize">{customer.category}</td>
                  <td className="px-6 py-4 font-medium text-red-600">
                    ₹ {(Number(customer.openingBalancePaise) / 100).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-slate-500">
        <span>Total: {data?.meta?.total || 0} customers</span>
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50" 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <button 
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50" 
            disabled={page >= (data?.meta?.totalPages || 1)} 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Business Name *</label>
                  <input 
                    type="text" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. Sharma Bhojnalaya"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Contact Person</label>
                  <input 
                    type="text" 
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. Ramesh Sharma"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="10 digit number"
                    required
                    maxLength={10}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="dhaba">Dhaba</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hotel</option>
                    <option value="cafe">Cafe</option>
                    <option value="caterer">Caterer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Credit Limit (₹)</label>
                  <input 
                    type="number" 
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. 5000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Opening Balance (₹)</label>
                  <input 
                    type="number" 
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. 0"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}