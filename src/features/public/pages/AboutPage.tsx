import React from 'react';
import { Logo } from '@/components/ui/logo';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="text-[10px]">Brand Story & Vision</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black">
          About SewDesk
        </h1>
        <p className="text-base text-[#777777] max-w-2xl mx-auto">
          MEASURE. MANAGE. CREATE. Your Digital Tailoring Workspace.
        </p>
      </div>

      <div className="prose prose-neutral max-w-none text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-6">
        <p>
          SewDesk is a multi-tenant digital workspace created to empower tailors, seamstresses, bespoke fashion designers, and atelier workshops. For decades, the craft of tailoring has relied on handwritten notebooks, dog-eared measurement registers, paper order receipts, and scattered WhatsApp chats.
        </p>

        <p>
          When a measurement book is misplaced, years of client trust and anatomical history are lost. When an order slip is stained with chalk or damaged, workshop miscommunication leads to expensive fabric waste.
        </p>

        <h3 className="text-lg font-bold text-black pt-4">Our Core Product Principles</h3>
        <ul className="space-y-2 list-none pl-0">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <span><strong>Artisanal Simplicity:</strong> Intuitive enough for a tailor with limited technical experience, yet sophisticated enough for high-end fashion studios.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <span><strong>Permanent Client History:</strong> Previous body measurements are never silently overwritten. Every historical order permanently references the exact measurement set used.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <span><strong>Offline-Aware Architecture:</strong> Tailoring workshops in emerging markets often experience intermittent connectivity. SewDesk preserves drafts locally and synchronizes automatically upon reconnection.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <span><strong>Generous Monetisation:</strong> The first 100 client registrations are 100% free forever for every studio, ensuring emerging tailors can build viable businesses without upfront barriers.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

