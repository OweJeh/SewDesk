// ==============================================================================
// SEWDESK – PHOTO VAULT PAGE
// Fabric swatch, style inspiration, pattern photos + client posture photos
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Lock, Trash2, Image, ChevronDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { db } from '@/offline/database/dexie-db';
import { generateUUID } from '@/lib/utils';
import type { OrderAttachment, CustomerPosturePhoto } from '@/types';

type VaultTab = 'attachments' | 'posture';
type AttachmentType = OrderAttachment['attachment_type'];
type PostureView = CustomerPosturePhoto['view_angle'];

function dataUrlToSize(url: string): string {
  const bytes = Math.round((url.length * 3) / 4 / 1024);
  return bytes > 1024 ? `${(bytes / 1024).toFixed(1)} MB` : `${bytes} KB`;
}

export const PhotoVaultPage: React.FC = () => {
  const { currentBusiness, hasActiveSubscription } = useCurrentBusiness();
  const bizId = currentBusiness?.id ?? '';

  const [activeTab, setActiveTab] = useState<VaultTab>('attachments');

  // Order Attachments state
  const [orders, setOrders] = useState<{ id: string; order_number: string; customer_name: string }[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [attachments, setAttachments] = useState<OrderAttachment[]>([]);
  const [uploadType, setUploadType] = useState<AttachmentType>('fabric_swatch');
  const [caption, setCaption] = useState('');
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const attachInputRef = useRef<HTMLInputElement>(null);

  // Posture Photos state
  const [customers, setCustomers] = useState<{ id: string; full_name: string; customer_number: string }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [posturePhotos, setPosturePhotos] = useState<CustomerPosturePhoto[]>([]);
  const [uploadAngle, setUploadAngle] = useState<PostureView>('front');
  const [uploadingPosture, setUploadingPosture] = useState(false);
  const postureInputRef = useRef<HTMLInputElement>(null);

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Load orders
  useEffect(() => {
    if (!bizId) return;
    db.orders
      .where('business_id')
      .equals(bizId)
      .toArray()
      .then((rows) => {
        setOrders(
          rows.map((o: any) => ({
            id: o.id,
            order_number: o.order_number,
            customer_name: o.customer_name || '',
          }))
        );
      });
  }, [bizId]);

  // Load customers
  useEffect(() => {
    if (!bizId) return;
    db.customers
      .where('business_id')
      .equals(bizId)
      .toArray()
      .then((rows) => {
        setCustomers(
          rows.map((c: any) => ({
            id: c.id,
            full_name: c.full_name,
            customer_number: c.customer_number,
          }))
        );
      });
  }, [bizId]);

  // Load attachments for selected order
  useEffect(() => {
    if (!selectedOrderId) { setAttachments([]); return; }
    db.orderAttachments.where('order_id').equals(selectedOrderId).toArray().then(setAttachments);
  }, [selectedOrderId]);

  // Load posture photos for selected customer
  useEffect(() => {
    if (!selectedCustomerId) { setPosturePhotos([]); return; }
    db.customerPhotos.where('customer_id').equals(selectedCustomerId).toArray().then(setPosturePhotos);
  }, [selectedCustomerId]);

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOrderId || !bizId) return;
    setUploadingAttachment(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        const record: OrderAttachment = {
          id: generateUUID(),
          business_id: bizId,
          order_id: selectedOrderId,
          file_url: dataUrl,
          attachment_type: uploadType,
          caption: caption || null,
          uploaded_by: 'local',
          created_at: new Date().toISOString(),
        };
        await db.orderAttachments.add(record);
        setAttachments((prev) => [...prev, record]);
        setCaption('');
        setUploadingAttachment(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingAttachment(false);
    }
    e.target.value = '';
  };

  const handlePostureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCustomerId || !bizId) return;
    setUploadingPosture(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        const record: CustomerPosturePhoto = {
          id: generateUUID(),
          business_id: bizId,
          customer_id: selectedCustomerId,
          photo_url: dataUrl,
          view_angle: uploadAngle,
          notes: null,
          created_at: new Date().toISOString(),
        };
        await db.customerPhotos.add(record);
        setPosturePhotos((prev) => [...prev, record]);
        setUploadingPosture(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingPosture(false);
    }
    e.target.value = '';
  };

  const deleteAttachment = async (id: string) => {
    await db.orderAttachments.delete(id);
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const deletePosture = async (id: string) => {
    await db.customerPhotos.delete(id);
    setPosturePhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const ATTACH_LABELS: Record<AttachmentType, string> = {
    fabric_swatch: 'Fabric Swatch',
    style_inspiration: 'Style Inspiration',
    pattern: 'Pattern / Draft',
  };

  const ANGLE_LABELS: Record<PostureView, string> = {
    front: 'Front View',
    side: 'Side View',
    back: 'Back View',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-black tracking-tight">Photo Vault</h1>
            {hasActiveSubscription ? (
              <Badge variant="success">Pro</Badge>
            ) : (
              <Badge variant="warning">Free</Badge>
            )}
          </div>
          <p className="text-xs text-[#777777] mt-0.5">
            Fabric swatches, style inspiration, pattern photos, and client posture documentation.
          </p>
        </div>
        <Camera className="w-6 h-6 text-neutral-400" />
      </div>

      {/* Free tier banner */}
      {!hasActiveSubscription && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-800">Free Plan:</span>
            <span className="text-amber-700 ml-1">
              Photos are stored locally on this device. Upgrade to Pro to sync photos to the cloud and access them from any device.
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#F5F5F5] rounded-xl w-fit">
        {(['attachments', 'posture'] as VaultTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === t ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'
            }`}
          >
            {t === 'attachments' ? 'Order Attachments' : 'Client Posture Photos'}
          </button>
        ))}
      </div>

      {/* ── ORDER ATTACHMENTS ── */}
      {activeTab === 'attachments' && (
        <div className="space-y-4">
          {/* Select Order */}
          <Card className="border-[#E5E5E5]">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">Select Order</label>
                <div className="relative">
                  <select
                    className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-black bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-black"
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                  >
                    <option value="">— choose an order —</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.order_number} {o.customer_name ? `– ${o.customer_name}` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {selectedOrderId && (
                <>
                  {/* Upload Controls */}
                  <div className="space-y-3 pt-2 border-t border-[#E5E5E5]">
                    <div className="flex gap-2 flex-wrap">
                      {(Object.keys(ATTACH_LABELS) as AttachmentType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setUploadType(t)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                            uploadType === t
                              ? 'bg-black text-white border-black'
                              : 'border-[#E5E5E5] text-neutral-600 hover:border-black'
                          }`}
                        >
                          {ATTACH_LABELS[t]}
                        </button>
                      ))}
                    </div>
                    <input
                      ref={attachInputRef}
                      type="text"
                      placeholder="Caption (optional)"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <input
                      type="file"
                      id="attach-upload"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleAttachmentUpload}
                    />
                    <Button
                      size="sm"
                      onClick={() => document.getElementById('attach-upload')?.click()}
                      disabled={uploadingAttachment}
                    >
                      <Upload className="w-4 h-4 mr-1.5" />
                      {uploadingAttachment ? 'Saving...' : `Add ${ATTACH_LABELS[uploadType]}`}
                    </Button>
                  </div>

                  {/* Attachments Grid */}
                  {attachments.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      {attachments.map((a) => (
                        <div
                          key={a.id}
                          className="relative group rounded-xl overflow-hidden border border-[#E5E5E5] bg-[#F5F5F5] aspect-square cursor-pointer"
                          onClick={() => setLightboxUrl(a.file_url)}
                        >
                          <img
                            src={a.file_url}
                            alt={a.caption || a.attachment_type}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <div className="text-[10px] text-white font-semibold">{ATTACH_LABELS[a.attachment_type]}</div>
                            {a.caption && <div className="text-[9px] text-white/80">{a.caption}</div>}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteAttachment(a.id); }}
                            className="absolute top-1.5 right-1.5 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
                      <Image className="w-8 h-8 mb-2 opacity-40" />
                      <span className="text-xs">No photos attached to this order yet.</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── CLIENT POSTURE PHOTOS ── */}
      {activeTab === 'posture' && (
        <div className="space-y-4">
          <Card className="border-[#E5E5E5]">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">Select Client</label>
                <div className="relative">
                  <select
                    className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-black bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-black"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                  >
                    <option value="">— choose a client —</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name} ({c.customer_number})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {selectedCustomerId && (
                <>
                  <div className="space-y-3 pt-2 border-t border-[#E5E5E5]">
                    <div className="flex gap-2">
                      {(Object.keys(ANGLE_LABELS) as PostureView[]).map((v) => (
                        <button
                          key={v}
                          onClick={() => setUploadAngle(v)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                            uploadAngle === v
                              ? 'bg-black text-white border-black'
                              : 'border-[#E5E5E5] text-neutral-600 hover:border-black'
                          }`}
                        >
                          {ANGLE_LABELS[v]}
                        </button>
                      ))}
                    </div>
                    <input
                      type="file"
                      id="posture-upload"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handlePostureUpload}
                    />
                    <Button
                      size="sm"
                      onClick={() => document.getElementById('posture-upload')?.click()}
                      disabled={uploadingPosture}
                    >
                      <Camera className="w-4 h-4 mr-1.5" />
                      {uploadingPosture ? 'Saving...' : `Capture ${ANGLE_LABELS[uploadAngle]}`}
                    </Button>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      Posture photos help ensure accurate shoulder pitch, armhole depth, and silhouette adjustments — especially useful for apprentice tailors referencing the master's notes.
                    </p>
                  </div>

                  {/* Posture Grid grouped by angle */}
                  {(['front', 'side', 'back'] as PostureView[]).map((angle) => {
                    const photos = posturePhotos.filter((p) => p.view_angle === angle);
                    return (
                      <div key={angle}>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                          {ANGLE_LABELS[angle]}
                        </div>
                        {photos.length === 0 ? (
                          <div className="text-xs text-neutral-400 italic mb-3">No {ANGLE_LABELS[angle].toLowerCase()} photo yet.</div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {photos.map((p) => (
                              <div
                                key={p.id}
                                className="relative group rounded-lg overflow-hidden border border-[#E5E5E5] aspect-square cursor-pointer"
                                onClick={() => setLightboxUrl(p.photo_url)}
                              >
                                <img src={p.photo_url} alt={angle} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                                <button
                                  onClick={(e) => { e.stopPropagation(); deletePosture(p.id); }}
                                  className="absolute top-1 right-1 p-0.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="Photo"
            className="max-w-full max-h-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white bg-white/10 rounded-full p-2 hover:bg-white/20"
            onClick={() => setLightboxUrl(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

