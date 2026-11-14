import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Scissors,
  Ruler,
  Layers,
  Sparkles,
  Copy,
  CheckCircle2,
  ArrowRight,
  Info,
  HelpCircle,
  Shirt,
} from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

interface GarmentPreset {
  id: string;
  name: string;
  category: string;
  baseYards45: number;
  baseYards60: number;
  liningYards: number;
  interfacingYards: number;
  cuttingTip: string;
}

const PRESETS: GarmentPreset[] = [
  {
    id: '3_piece_kaftan',
    name: '3-Piece Kaftan / Senator Set',
    category: 'Men / Unisex Bespoke',
    baseYards45: 5.0,
    baseYards60: 4.0,
    liningYards: 1.5,
    interfacingYards: 1.0,
    cuttingTip: 'Cut tunic front on straight grain. Match chest pocket pattern to placket.',
  },
  {
    id: '2_piece_suit',
    name: '2-Piece Bespoke Suit (Jacket & Trousers)',
    category: 'Formal Tailoring',
    baseYards45: 4.5,
    baseYards60: 3.5,
    liningYards: 2.2,
    interfacingYards: 1.5,
    cuttingTip: 'Use full floating canvas interfacing on jacket chest piece. Allow 5cm trouser hem turn-up.',
  },
  {
    id: 'agbada_grand',
    name: 'Grand Agbada (4-Piece Robe, Tunic & Trousers)',
    category: 'Traditional Ceremonial',
    baseYards45: 8.0,
    baseYards60: 6.5,
    liningYards: 2.0,
    interfacingYards: 1.5,
    cuttingTip: 'Cut wide cape folds with generous shoulder sweep. Reinforce neck embroidery region with heavy backing.',
  },
  {
    id: 'kaba_slit',
    name: 'Kaba & Slit (Traditional 2-Piece)',
    category: 'Women Couture',
    baseYards45: 6.0,
    baseYards60: 4.5,
    liningYards: 2.0,
    interfacingYards: 1.0,
    cuttingTip: 'Ensure African Wax print motifs mirror evenly on the bust darts and central skirt split.',
  },
  {
    id: 'evening_gown',
    name: 'Corset Mermaid Evening Gown',
    category: 'Bridal & Red Carpet',
    baseYards45: 6.5,
    baseYards60: 5.0,
    liningYards: 3.0,
    interfacingYards: 1.8,
    cuttingTip: 'Cut mermaid flare panels on the true 45° bias grain for fluid drape. Bone corset seams vertically.',
  },
  {
    id: 'trousers',
    name: 'Bespoke Trousers / Slacks',
    category: 'Separate Essentials',
    baseYards45: 2.5,
    baseYards60: 1.8,
    liningYards: 0.5,
    interfacingYards: 0.4,
    cuttingTip: 'Align crease line strictly parallel to fabric selvage to avoid leg twisting.',
  },
  {
    id: 'shirt_long',
    name: 'Long-Sleeve Tailored Shirt',
    category: 'Separate Essentials',
    baseYards45: 2.7,
    baseYards60: 2.0,
    liningYards: 0.0,
    interfacingYards: 0.5,
    cuttingTip: 'Cut split yoke on the bias for shoulder flex and comfort.',
  },
  {
    id: 'pencil_skirt',
    name: 'High-Waist Fitted Pencil Skirt',
    category: 'Separate Essentials',
    baseYards45: 2.0,
    baseYards60: 1.5,
    liningYards: 1.2,
    interfacingYards: 0.3,
    cuttingTip: 'Add 5cm walking vent allowance at back center seam.',
  },
];

export const YardageEstimatorPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedPresetId, setSelectedPresetId] = useState<string>('3_piece_kaftan');
  const [fabricWidth, setFabricWidth] = useState<'45' | '60'>('45');
  const [clientHeight, setClientHeight] = useState<'short' | 'average' | 'tall'>('average');
  const [clientBuild, setClientBuild] = useState<'slim' | 'medium' | 'full'>('medium');
  const [patternType, setPatternType] = useState<'plain' | 'directional' | 'large_plaid'>('plain');
  const [copied, setCopied] = useState(false);

  const currentPreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  // Calculation Engine
  const baseEstimate = fabricWidth === '45' ? currentPreset.baseYards45 : currentPreset.baseYards60;

  let heightMultiplier = 1.0;
  if (clientHeight === 'short') heightMultiplier = 0.93;
  if (clientHeight === 'tall') heightMultiplier = 1.12;

  let buildMultiplier = 1.0;
  if (clientBuild === 'slim') buildMultiplier = 0.95;
  if (clientBuild === 'full') buildMultiplier = 1.15;

  let patternMultiplier = 1.0;
  if (patternType === 'directional') patternMultiplier = 1.10; // +10% matching
  if (patternType === 'large_plaid') patternMultiplier = 1.18; // +18% matching

  const finalYards = Math.round(baseEstimate * heightMultiplier * buildMultiplier * patternMultiplier * 10) / 10;
  const finalMeters = Math.round(finalYards * 0.9144 * 10) / 10;

  const handleCopy = async () => {
    const text = `SewDesk Cut Estimation: ${currentPreset.name} (${fabricWidth}" Fabric Width) requires approx. ${finalYards} Yards (${finalMeters}m). Pattern Matching: ${patternType}. Lining: ${currentPreset.liningYards} yds.`;
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black">
              Fabric Yardage & Cut Estimator
            </h1>
            <Badge variant="default" className="text-[10px]">
              Atelier Tool
            </Badge>
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Calculate accurate yardage, meters, and grainline layout requirements before taking or cutting fabric.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/app/orders/new')}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Create New Order
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Select Garment Type */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
              1. Choose Garment Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESETS.map((p) => {
                const isSelected = p.id === selectedPresetId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPresetId(p.id)}
                    className={`p-3.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-black bg-black text-white shadow-sm'
                        : 'border-[#E5E5E5] bg-white text-neutral-800 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{p.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span
                      className={`text-[10px] block mt-0.5 ${
                        isSelected ? 'text-neutral-300' : 'text-neutral-500'
                      }`}
                    >
                      {p.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Fabric Width & Pattern Characteristics */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
              2. Fabric Width & Characteristics
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Fabric Width (Bolt Size)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFabricWidth('45')}
                    className={`py-2 px-3 rounded-md text-xs font-medium border text-center transition-colors ${
                      fabricWidth === '45'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-neutral-700 border-[#E5E5E5] hover:bg-neutral-50'
                    }`}
                  >
                    45" (African Wax / Silk)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFabricWidth('60')}
                    className={`py-2 px-3 rounded-md text-xs font-medium border text-center transition-colors ${
                      fabricWidth === '60'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-neutral-700 border-[#E5E5E5] hover:bg-neutral-50'
                    }`}
                  >
                    60" (Suiting / Crepe)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Pattern / Print Repeat
                </label>
                <select
                  value={patternType}
                  onChange={(e) => setPatternType(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-[#E5E5E5] bg-white px-3 text-xs text-neutral-800 focus:outline-none focus:border-black"
                >
                  <option value="plain">Solid / Plain / Small Non-Directional (+0%)</option>
                  <option value="directional">Directional Floral / Wax Motif (+10%)</option>
                  <option value="large_plaid">Large Tartan / Striped Check (+18%)</option>
                </select>
              </div>
            </div>

            {/* 3. Client Stature & Proportions */}
            <div className="pt-2 border-t border-[#E5E5E5] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Client Height
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['short', 'average', 'tall'] as const).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setClientHeight(h)}
                      className={`py-1.5 text-xs capitalize rounded border ${
                        clientHeight === h
                          ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                          : 'bg-white text-neutral-700 border-[#E5E5E5]'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Client Body Build
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['slim', 'medium', 'full'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setClientBuild(b)}
                      className={`py-1.5 text-xs capitalize rounded border ${
                        clientBuild === b
                          ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                          : 'bg-white text-neutral-700 border-[#E5E5E5]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Result Card */}
        <div className="space-y-4">
          <div className="bg-black text-white rounded-xl p-6 shadow-md space-y-5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                Recommended Main Fabric
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-extrabold font-mono text-white">{finalYards}</span>
                <span className="text-lg font-semibold text-neutral-300">Yards</span>
                <span className="text-sm font-mono text-neutral-400">({finalMeters} m)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-neutral-300">
                <span>Body Fabric Width:</span>
                <span className="font-mono font-bold text-white">{fabricWidth} Inches</span>
              </div>

              {currentPreset.liningYards > 0 && (
                <div className="flex justify-between items-center text-neutral-300">
                  <span>Suggested Lining:</span>
                  <span className="font-mono font-bold text-white">{currentPreset.liningYards} Yards</span>
                </div>
              )}

              {currentPreset.interfacingYards > 0 && (
                <div className="flex justify-between items-center text-neutral-300">
                  <span>Interfacing / Stiffener:</span>
                  <span className="font-mono font-bold text-white">{currentPreset.interfacingYards} Yards</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <Button
                variant="outline"
                className="w-full bg-white text-black hover:bg-neutral-100"
                onClick={handleCopy}
                leftIcon={copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied to Clipboard!' : 'Copy Cut Specification'}
              </Button>
            </div>
          </div>

          {/* Master Tailor's Grainline Tip */}
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-4 text-xs text-neutral-700 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-black text-[11px] uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-neutral-600" />
              <span>Cutting & Grainline Advice</span>
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              {currentPreset.cuttingTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

