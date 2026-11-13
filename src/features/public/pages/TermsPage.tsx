import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-black">Terms of Service</h1>
      <div className="prose text-xs sm:text-sm text-neutral-700 space-y-4">
        <p>Last updated: January 2025</p>
        <p>
          Welcome to SewDesk. By registering a business workspace or using our tailoring software, you agree to these terms.
        </p>
        <h3 className="text-base font-bold text-black pt-2">1. Subscription Allowance & Monetisation</h3>
        <p>
          Each registered business receives an authoritative lifetime allowance of 100 registered customer profiles free of charge. From customer #101, an active paid subscription (GHS 150/month) is required. Archiving or deleting customer records does not reset or reduce your lifetime allowance count.
        </p>
        <h3 className="text-base font-bold text-black pt-2">2. Data Ownership & Expiry</h3>
        <p>
          You retain complete ownership of all measurements and customer records. In the event of subscription expiry, your historical business records remain fully accessible, viewable, and exportable.
        </p>
      </div>
    </div>
  );
};

