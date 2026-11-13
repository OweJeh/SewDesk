import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { customerService } from '@/features/customers/services/customerService';
import type { Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { currentBusiness } = useCurrentBusiness();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'id'>('newest');
  const [isLoading, setIsLoading] = useState(true);

  const slotsUsed = currentBusiness?.customer_slots_used ?? 0;

  useEffect(() => {
    if (currentBusiness) {
      setIsLoading(true);
      customerService.getCustomers(currentBusiness.id).then((list) => {
        setCustomers(list);
        setIsLoading(false);
      });
    }
  }, [currentBusiness]);

  const filtered = customers
    .filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        c.full_name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.customer_number.toLowerCase().includes(q);

      const matchesCat =
        categoryFilter === 'all' ||
        c.measurement_profile?.toLowerCase().includes(categoryFilter.toLowerCase());

      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
      if (sortBy === 'id') return a.customer_number.localeCompare(b.customer_number);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black">Customer Directory</h1>
            <Badge variant="outline" className="text-[10px]">
              {customers.length} Registered
            </Badge>
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Maintain complete body dimension history, order logs, and contact details for your tailoring clients.
          </p>
        </div>

        <Link to="/app/customers/new">
          <Button size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
            Register Customer
          </Button>
        </Link>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client name, phone number, or CUST ID..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-[#E5E5E5] rounded-md focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 text-xs border border-[#E5E5E5] rounded-md bg-white text-neutral-700 focus:outline-none focus:border-black"
            >
              <option value="all">All Categories</option>
              <option value="male">Male Bespoke</option>
              <option value="female">Female Bespoke</option>
              <option value="children">Children</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 px-3 text-xs border border-[#E5E5E5] rounded-md bg-white text-neutral-700 focus:outline-none focus:border-black"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="id">Sort: Customer ID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer List Table or Empty State */}
      {isLoading ? (
        <div className="min-h-[250px] flex items-center justify-center bg-white border border-[#E5E5E5] rounded-xl">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Loading customer directory...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto text-neutral-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-black">No customers found</h3>
            <p className="text-xs text-[#777777] mt-1 max-w-sm mx-auto">
              {searchTerm
                ? 'No clients match your filter criteria.'
                : 'Your studio client registry is empty. Register your first customer to capture their body dimensions.'}
            </p>
          </div>
          <Link to="/app/customers/new">
            <Button size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
              Register First Customer
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[#777777] uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Phone & WA</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Registered</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filtered.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => navigate(`/app/customers/${cust.id}`)}
                    className="hover:bg-neutral-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 font-mono text-[11px] text-neutral-500">
                      {cust.customer_number}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-black group-hover:underline">
                        {cust.full_name}
                      </div>
                      {cust.location && (
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{cust.location}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3 h-3 text-neutral-400" />
                        <span>{cust.phone}</span>
                      </div>
                      {cust.whatsapp && (
                        <div className="text-[10px] text-green-700 font-medium mt-0.5">
                          WhatsApp enabled
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className="text-[10px]">
                        {cust.measurement_profile || 'Standard'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-neutral-500">
                      {formatDate(cust.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs font-semibold text-black group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                        Open Profile <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
