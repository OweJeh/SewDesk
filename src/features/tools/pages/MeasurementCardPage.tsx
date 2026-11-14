// ==============================================================================
// SEWDESK – DIGITAL MEASUREMENT CARD (CLIENT SELF-VIEW LINK)
// Luxury branded measurement card shareable via secure link or WhatsApp
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Ruler,
  Share2,
  Printer,
  Copy,
  CheckCircle2,
  MessageSquare,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from '@/components/common/QRCodeSVG';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { ProUpgradeModal } from '@/components/common/ProUpgradeModal';
import { db } from '@/offline/database/dexie-db';
import { formatDate, copyToClipboard } from '@/lib/utils';
import type { Customer, MeasurementSet, MeasurementValue } from '@/types';

interface EncodedCardData {
  studio: string;
  client: string;
  number?: string;
  date: string;
  unit: string;
  values: { name: string; value: number }[];
  notes?: string;
}

export const MeasurementCardPage: React.FC = () => {
  const { currentBusiness, hasActiveSubscription } = useCurrentBusiness();
  const [searchParams] = useSearchParams();

  const customerIdParam = searchParams.get('customerId') || '';
  const setIdParam = searchParams.get('setId') || '';
  const dataParam = searchParams.get('data') || '';
  const isClientView = searchParams.get('view') === 'client';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerIdParam);
  const [sets, setSets] = useState<MeasurementSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState(setIdParam);
  const [values, setValues] = useState<MeasurementValue[]>([]);

  // Encoded state if loaded from shared link
  const [sharedData, setSharedData] = useState<EncodedCardData | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const bizId = currentBusiness?.id || '';

  // Decode from dataParam if present
  useEffect(() => {
    if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(dataParam))));
        setSharedData(decoded);
      } catch (e) {
        console.error('Failed to parse shared measurement card', e);
      }
    }
  }, [dataParam]);

  // Load customers for atelier view
  useEffect(() => {
    if (!bizId || dataParam) return;
    db.customers
      .where('business_id')
      .equals(bizId)
      .toArray()
      .then((rows) => {
        setCustomers(rows);
        if (!selectedCustomerId && rows.length > 0) {
          setSelectedCustomerId(rows[0].id);
        }
      });
  }, [bizId, selectedCustomerId, dataParam]);

  // Load measurement sets for selected customer
  useEffect(() => {
    if (!selectedCustomerId || dataParam) return;
    db.measurementSets
      .where('customer_id')
      .equals(selectedCustomerId)
      .reverse()
      .sortBy('created_at')
      .then((setRows) => {
        setSets(setRows);
        if (setRows.length > 0) {
          if (!selectedSetId || !setRows.some((s) => s.id === selectedSetId)) {
            setSelectedSetId(setRows[0].id);
          }
        } else {
          setSelectedSetId('');
          setValues([]);
        }
      });
  }, [selectedCustomerId, dataParam, selectedSetId]);

  // Load values for selected set
  useEffect(() => {
    if (!selectedSetId || dataParam) return;
    db.measurementValues
      .where('measurement_set_id')
      .equals(selectedSetId)
      .toArray()
      .then(setValues);
  }, [selectedSetId, dataParam]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const selectedSet = sets.find((s) => s.id === selectedSetId);

  // Resolved display info
  const studioName =
    sharedData?.studio || currentBusiness?.business_name || 'SEWDESK ATELIER';
  const clientName = sharedData?.client || selectedCustomer?.full_name || 'Client';
  const clientNumber = sharedData?.number || selectedCustomer?.customer_number || '';
  const dateStr = sharedData?.date || (selectedSet ? formatDate(selectedSet.created_at) : '');
  const unit = sharedData?.unit || values[0]?.original_unit || 'cm';
  const displayValues = sharedData?.values
    ? sharedData.values
    : values.map((v) => ({ name: v.field_name, value: v.original_value }));
  const notes = sharedData?.notes || selectedSet?.fit_notes || '';

  // Generate self-contained shareable URL with encoded data
  const generateShareUrl = () => {
    const payload: EncodedCardData = {
      studio: studioName,
      client: clientName,
      number: clientNumber,
      date: dateStr,
      unit,
      values: displayValues,
      notes: notes || undefined,
    };
    try {
      const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      return `${window.location.origin}/share/measurements?data=${base64}&view=client`;
    } catch {
      return window.location.href;
    }
  };

  const shareUrl = generateShareUrl();

  const handleCopyLink = async () => {
    await copyToClipboard(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const generateWhatsAppMessage = () => {
    const lines = [
      `📐 *Official Measurement Card — ${studioName}*`,
      `Client: ${clientName} (${clientNumber})`,
      `Date: ${dateStr}`,
      `Unit: ${unit}`,
      '',
      '*Recorded Dimensions:*',
      ...displayValues.map((v) => `• ${v.name}: ${v.value} ${unit}`),
      '',
      `🔗 *View your verified digital card online:*`,
      shareUrl,
      '',
      `_Crafted with precision by ${studioName} on SewDesk_`,
    ];
    return lines.join('\n');
  };

  const handleCopySummary = async () => {
    await copyToClipboard(generateWhatsAppMessage());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const phone = selectedCustomer?.whatsapp || selectedCustomer?.phone || '';
    const digits = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(generateWhatsAppMessage());
    const waUrl = digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className={`space-y-6 max-w-4xl mx-auto print:p-0 print:m-0 print:max-w-none ${isClientView ? 'py-8 px-4' : ''}`}>
      {/* Top Controls - hidden in client-view and print */}
      {!isClientView && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-black tracking-tight">Digital Measurement Card</h1>
              {hasActiveSubscription ? (
                <Badge variant="success">Pro Feature</Badge>
              ) : (
                <Badge variant="warning">Free</Badge>
              )}
            </div>
            <p className="text-xs text-[#777777] mt-0.5">
              Client self-view link: share verified dimensions with traveling clients or overseas shoppers.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print Card
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!hasActiveSubscription) {
                  setShowUpgradeModal(true);
                  return;
                }
                handleCopyLink();
              }}
              className={`${
                copiedLink ? 'border-emerald-600 text-emerald-700 bg-emerald-50 font-bold' : ''
              } ${!hasActiveSubscription ? 'opacity-70 hover:opacity-100 text-neutral-600' : ''}`}
              leftIcon={copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            >
              <span>{copiedLink ? 'Link Copied!' : 'Copy Client Link'}</span>
              {!hasActiveSubscription && (
                <span className="ml-1 text-[9px] font-bold px-1 rounded bg-black text-white">PRO</span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              className={copiedText ? 'border-emerald-600 text-emerald-700 bg-emerald-50 font-bold' : ''}
              leftIcon={copiedText ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            >
              {copiedText ? 'Summary Copied!' : 'Copy Dimensions'}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!hasActiveSubscription) {
                  setShowUpgradeModal(true);
                  return;
                }
                handleWhatsAppShare();
              }}
              className={`bg-[#25D366] hover:bg-[#1ebe5d] text-white ${
                !hasActiveSubscription ? 'opacity-70 hover:opacity-100' : ''
              }`}
              leftIcon={<MessageSquare className="w-4 h-4" />}
            >
              <span>Share via WhatsApp</span>
              {!hasActiveSubscription && (
                <span className="ml-1 text-[9px] font-bold px-1 rounded bg-black text-white">PRO</span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Selectors - hidden in client-view and print */}
      {!isClientView && !dataParam && (
        <Card className="border-[#E5E5E5] print:hidden">
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                Select Client
              </label>
              <div className="relative">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-black bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.customer_number})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                Measurement Session
              </label>
              <div className="relative">
                <select
                  value={selectedSetId}
                  onChange={(e) => setSelectedSetId(e.target.value)}
                  disabled={sets.length === 0}
                  className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-black bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-black disabled:bg-neutral-100"
                >
                  {sets.length === 0 ? (
                    <option value="">No measurement sets recorded</option>
                  ) : (
                    sets.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.garment_type
                          ? s.session_name.replace(/^Body Fitting/i, s.garment_type)
                          : s.session_name || 'Fitting Session'} — {formatDate(s.created_at)}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branded Digital Card Display */}
      <div className="flex justify-center print:block print:w-full">
        <div
          id="printable-measurement-card"
          className="measurement-card w-full max-w-xl bg-white border border-[#E5E5E5] rounded-2xl shadow-lg p-6 sm:p-8 space-y-6 print:border print:border-black print:rounded-xl print:shadow-none print:w-full print:max-w-none print:p-6 print:m-0"
        >
          {/* Client View Action Bar */}
          {isClientView && (
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] print:hidden">
              <span className="text-xs font-bold text-neutral-500">Client Measurement Card</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                  className={copiedLink ? 'border-emerald-600 text-emerald-700 bg-emerald-50 text-xs h-7' : 'text-xs h-7'}
                  leftIcon={copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                  className="text-xs h-7"
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                >
                  Save PDF
                </Button>
              </div>
            </div>
          )}

          {/* Studio Header */}
          <div className="flex items-start justify-between border-b border-[#E5E5E5] pb-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#777777] block">
                Official Measurement Record
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight mt-0.5">
                {studioName}
              </h2>
              <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
                Verified Atelier Specification
              </span>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="uppercase font-mono text-[10px]">
                Unit: {unit}
              </Badge>
            </div>
          </div>

          {/* Client Specs */}
          <div className="grid grid-cols-2 gap-4 bg-[#FAFAFA] p-4 rounded-xl border border-[#E5E5E5]">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">Client</span>
              <span className="text-sm font-black text-black block">{clientName}</span>
              {clientNumber && (
                <span className="text-[10px] font-mono text-neutral-400 block">{clientNumber}</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">Date Measured</span>
              <span className="text-xs font-bold text-black block">{dateStr || 'Current'}</span>
              <span className="text-[10px] text-emerald-600 font-semibold block">Tailor Calibrated</span>
            </div>
          </div>

          {/* Measurement Grid */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-black uppercase tracking-wider">
              Anatomical Dimensions
            </div>
            {displayValues.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400 italic">
                No individual measurement values recorded for this session.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {displayValues.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#F5F5F5] rounded-xl border border-[#E5E5E5] flex flex-col justify-between"
                  >
                    <span className="text-[10px] uppercase font-semibold text-neutral-600 truncate block">
                      {item.name}
                    </span>
                    <div className="flex items-baseline justify-between mt-1.5">
                      <span className="text-lg font-black text-black">{item.value}</span>
                      <span className="text-[10px] font-mono text-neutral-400">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Posture & Fitting Notes */}
          {notes && (
            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">
                Fit & Posture Notes
              </span>
              <p className="text-xs text-neutral-700 italic leading-relaxed">{notes}</p>
            </div>
          )}

          {/* QR Code and Studio Stamp */}
          <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 border border-[#E5E5E5] rounded-lg bg-white shrink-0">
                <QRCodeSVG value={shareUrl} size={64} />
              </div>
              <div className="text-[10px] text-neutral-500 leading-tight">
                <span className="font-bold text-black block">Digital Verification</span>
                Scan with phone camera to view and download this card anytime.
              </div>
            </div>
            <div className="text-right text-[10px] text-neutral-400">
              <span className="font-bold text-neutral-600 block">SEWDESK CERTIFIED</span>
              <span>Precision Atelier System</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Feature Upgrade Popup */}
      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Digital Measurement Card"
        featureDescription="Upgrade to Pro Studio to share verified digital measurement cards and links with traveling clients and overseas fabric buyers."
      />
    </div>
  );
};
