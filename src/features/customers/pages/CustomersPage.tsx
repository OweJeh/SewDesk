import React, { useState, useEffect } from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { db } from '@/offline/database/dexie-db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { currentBusiness, refreshBusiness } = useCurrentBusiness();
  const { user } = useAuth();
  const isLive = isSupabaseConfigured();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [measurementProfile, setMeasurementProfile] = useState('Standard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slotsUsed = currentBusiness?.customer_slots_used ?? 0;
  const isAllowanceExceeded = slotsUsed >= 100;

  const loadCustomers = async () => {
    if (!currentBusiness) return;
    try {
      if (isLive) {
        const { data } = await supabase
          .from('customers')
          .select('*')
          .eq('business_id', currentBusiness.id)
          .is('archived_at', null)
          .order('created_at', { ascending: false });

        if (data) {
          setCustomers(data as Customer[]);
          return;
        }
      }

      // Offline / Local
      const localCustomers = await db.customers
        .where('business_id')
        .equals(currentBusiness.id)
        .toArray();
      setCustomers(localCustomers);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [currentBusiness?.id]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness || !user) return;
    setError(null);

    // Entitlement Check for 100 customer allowance
    if (isAllowanceExceeded) {
      setError(
        'Free customer allowance limit (100) reached. An active paid subscription (GHS 150/mo) is required to register customer #101.'
      );
      return;
    }

    if (!fullName.trim() || !phone.trim()) {
      setError('Full Name and Phone Number are required.');
      return;
    }

    setIsLoading(true);
    try {
      const nextSeq = slotsUsed + 1;
      const customerNum = `CUST-${String(nextSeq).padStart(4, '0')}`;
      const newCust: Customer = {
        id: crypto.randomUUID(),
        business_id: currentBusiness.id,
        customer_number: customerNum,
        full_name: fullName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || null,
        email: email.trim() || null,
        measurement_profile: measurementProfile,
        location: location.trim() || null,
        notes: notes.trim() || null,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };

      if (isLive) {
        const { error: insErr } = await supabase.from('customers').insert(newCust);
        if (insErr) throw insErr;

        // Atomically update slot count on business
        await supabase
          .from('businesses')
          .update({ customer_slots_used: nextSeq })
          .eq('id', currentBusiness.id);
      }

      // Save locally
      await db.customers.put(newCust);
      // Update business in Dexie
      await db.businesses.update(currentBusiness.id, {
        customer_slots_used: nextSeq,
      });

      await refreshBusiness();
      setCustomers((prev) => [newCust, ...prev]);

      // Reset form
      setFullName('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setLocation('');
      setNotes('');
      setIsModalOpen(false);
    } catch (err) {
      setError((err as Error).message || 'Failed to save customer.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.customer_number.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black">Customer Directory</h1>
            <Badge variant="outline" className="text-[10px]">
              {customers.length} Recorded
            </Badge>
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Maintain complete body dimension history, contact details, and orders for your clients.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Add Customer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone number, or CUST ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E5E5] text-xs text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Customer List Table or Empty State */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto text-neutral-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-black">No customers found</h3>
            <p className="text-xs text-[#777777] mt-1 max-w-sm mx-auto">
              {searchTerm
                ? 'No clients match your search criteria. Try a different query.'
                : 'Your customer registry is empty. Register your first customer to begin recording tailored measurements.'}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add First Customer
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[#777777] uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Profile Type</th>
                  <th className="px-5 py-3">Registered</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-neutral-500">
                      {cust.customer_number}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-black">{cust.full_name}</div>
                      {cust.location && (
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{cust.location}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-neutral-400" />
                        <span>{cust.phone}</span>
                      </div>
                      {cust.email && (
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{cust.email}</span>
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
                      <span className="text-xs font-semibold text-black hover:underline cursor-pointer">
                        View Profile &rarr;
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Customer"
        description="Add client details to start capturing measurements and generating tailored orders."
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Kwame Asante"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+233 20 000 0000"
            />
            <Input
              label="WhatsApp (Optional)"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+233 20 000 0000"
            />
          </div>

          <Input
            label="Email Address (Optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kwame@example.com"
          />

          <Input
            label="Location / Delivery Address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="East Legon, Accra"
          />

          <div>
            <label className="block text-xs font-medium text-neutral-800 mb-1.5">
              Measurement Profile Template
            </label>
            <select
              value={measurementProfile}
              onChange={(e) => setMeasurementProfile(e.target.value)}
              className="flex h-11 w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="Male Bespoke">Male Bespoke (Suits, Kaftans, Shirts, Trousers)</option>
              <option value="Female Bespoke">Female Bespoke (Gowns, Kaba & Slit, Corsets)</option>
              <option value="Children">Children (Boys / Girls)</option>
              <option value="Standard">Standard Unisex</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading}>
              Save Customer Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
