import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-black">Privacy Policy</h1>
      <div className="prose text-xs sm:text-sm text-neutral-700 space-y-4">
        <p>Last updated: January 2025</p>
        <p>
          At SewDesk, we hold the privacy and data security of your tailoring business and your clients' body measurements in the highest regard.
        </p>
        <h3 className="text-base font-bold text-black pt-2">1. Multi-Tenant Data Isolation</h3>
        <p>
          All business data—including customer details, body measurements, garment designs, and payment ledgers—is segregated at the database level using PostgreSQL Row Level Security. No other business workspace can ever access your data.
        </p>
        <h3 className="text-base font-bold text-black pt-2">2. Offline Local Storage</h3>
        <p>
          SewDesk utilizes IndexedDB on your browser to support offline operations. Local records remain encrypted in your local browser storage and are transmitted securely over TLS when syncing with our servers.
        </p>
      </div>
    </div>
  );
};
