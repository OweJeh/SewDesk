import React, { useState, useEffect } from 'react';
import { db } from '@/offline/database/dexie-db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Business } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Building2, Search, ShieldCheck } from 'lucide-react';

export const PlatformBusinessesPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const isLive = isSupabaseConfigured();

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        if (isLive) {
          const { data } = await supabase.from('businesses').select('*').order('created_at', { ascending: false });
          if (data) setBusinesses(data as Business[]);
          return;
        }
        const localB = await db.businesses.toArray();
        setBusinesses(localB);
      } catch (err) {
        console.error('Error fetching businesses:', err);
      }
    };
    fetchBusinesses();
  }, [isLive]);

  const filtered = businesses.filter((b) =>
    b.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Registered Studios</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Overview of all active and onboarded tailoring businesses on SewDesk.
          </p>
        </div>
        <Badge variant="outline" className="border-neutral-700 text-neutral-300 text-xs">
          {businesses.length} Tenants
        </Badge>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter businesses by studio name, email, or city..."
            className="w-full pl-9 pr-4 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-700"
          />
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Business Name</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Slots Used</th>
                <th className="px-5 py-3">Tier</th>
                <th className="px-5 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-neutral-800/40">
                  <td className="px-5 py-3.5 font-semibold text-white">{b.business_name}</td>
                  <td className="px-5 py-3.5">{b.city}, {b.country}</td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-neutral-400">{b.contact_email}</td>
                  <td className="px-5 py-3.5 font-mono">
                    <span className={b.customer_slots_used >= 100 ? 'text-red-400' : 'text-neutral-200'}>
                      {b.customer_slots_used}
                    </span>
                    <span className="text-neutral-500"> / 100</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="outline" className="border-neutral-700 text-[10px]">
                      {b.customer_slots_used >= 100 ? 'PAID REQ' : 'FREE'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-500 font-mono text-[11px]">
                    {formatDate(b.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

