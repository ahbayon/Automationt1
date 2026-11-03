import React, { useState } from 'react';
import { X, Upload, Trash2, Image as ImageIcon, Check } from 'lucide-react';
import { DramaFrame, ExtraFrameConfig } from '../types/natok';

interface ExtraFrameModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ExtraFrameConfig;
  onSaveConfig: (cfg: ExtraFrameConfig) => void;
  frames: DramaFrame[];
}

export const ExtraFrameModal: React.FC<ExtraFrameModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  frames,
}) => {
  const [selectedFrameId, setSelectedFrameId] = useState<string>(
    config.frameId || (frames[0]?.id ?? '')
  );
  const [customImageUrl, setCustomImageUrl] = useState<string | undefined>(
    config.customImageUrl
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(config.durationMinutes || 1);

  if (!isOpen) return null;

  const quickPresets = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60];

  const selectedFrame = frames.find((f) => f.id === selectedFrameId) || frames[0];
  const displayImage = customImageUrl || selectedFrame?.dataUrl;
  const displayTimestamp = selectedFrame?.timestamp || '33:10';

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setCustomImageUrl(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      enabled: true,
      frameId: selectedFrameId,
      customImageUrl,
      timestamp: displayTimestamp,
      durationMinutes,
    });
    onClose();
  };

  const handleRemove = () => {
    onSaveConfig({
      enabled: false,
      frameId: undefined,
      customImageUrl: undefined,
      timestamp: '00:00',
      durationMinutes: 1,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg bg-[#140f24] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-gray-200">
        {/* Header */}
        <div className="px-4 py-3 bg-[#1d1633] border-b border-purple-950 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-amber-500 text-black font-black text-xs flex items-center justify-center">
              B
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">
                Extra Frame (ভিডিও শেষে আলাদা ফ্রেম)
              </h3>
              <p className="text-[10px] text-gray-400">
                Voiceover ও মূল ভিডিও শেষ হওয়ার পর আলাদা দৃশ্য হিসেবে প্রদর্শিত হবে
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Step 1: Select Picture */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span>১. ফ্রেম পিকচার নির্বাচন করুন (Select Picture):</span>
            </div>

            <div className="flex items-center space-x-2">
              <label className="flex-1 py-2 px-3 rounded-xl bg-[#221840] hover:bg-[#2b1f50] border border-purple-700/60 text-xs font-bold text-purple-200 flex items-center justify-center space-x-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload from Device / Gallery</span>
                <input type="file" accept="image/*" onChange={handleCustomUpload} className="hidden" />
              </label>

              <button
                onClick={handleRemove}
                className="py-2 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-xs font-bold text-rose-300 flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>

            {/* Selected Frame Banner */}
            {displayImage && (
              <div className="p-2.5 rounded-xl bg-[#0c0916] border border-amber-500/30 flex items-center space-x-3">
                <img
                  src={displayImage}
                  alt="Extra frame preview"
                  className="w-20 h-12 object-cover rounded-lg border border-white/10"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Scene @ {displayTimestamp}</span>
                  </div>
                  <div className="text-[11px] text-amber-400 font-mono">
                    Duration: {durationMinutes} Minute(s) ({durationMinutes * 60}s)
                  </div>
                </div>
              </div>
            )}

            {/* Gallery Horizontal Frames Picker */}
            <div className="space-y-1 pt-1">
              <div className="text-[11px] text-gray-400">
                অথবা গ্যালারির ছবি থেকে চাপ দিয়ে বেছে নিন: ({frames.length} available)
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
                {frames.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setSelectedFrameId(f.id);
                      setCustomImageUrl(undefined);
                    }}
                    className={`relative w-16 h-10 shrink-0 rounded-lg overflow-hidden border transition ${
                      selectedFrameId === f.id && !customImageUrl
                        ? 'border-amber-400 ring-2 ring-amber-400/50'
                        : 'border-purple-900/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={f.dataUrl} alt={f.id} className="w-full h-full object-cover" />
                    {selectedFrameId === f.id && !customImageUrl && (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-amber-400 font-bold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Extra Frame Duration Slider */}
          <div className="space-y-2 pt-1 border-t border-purple-900/40">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span>২. ভিডিও শেষে কত মিনিট ফ্রেম যুক্ত থাকবে:</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-black text-amber-400">{durationMinutes} মিনিট</span>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600">
                  ({durationMinutes}m)
                </span>
                <span className="text-[10px] text-gray-400">
                  {Math.round((durationMinutes / 60) * 100)}%
                </span>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={1}
              max={60}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 1)}
              className="w-full accent-amber-400 h-2 bg-[#2a1f48] rounded-lg cursor-pointer"
            />

            {/* Quick Presets Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 text-center">
              {quickPresets.map((m) => (
                <button
                  key={m}
                  onClick={() => setDurationMinutes(m)}
                  className={`py-1 rounded text-[11px] font-bold border transition ${
                    durationMinutes === m
                      ? 'bg-amber-500 border-amber-300 text-black shadow-sm'
                      : 'bg-[#18112d] border-purple-900/40 text-gray-400 hover:text-white'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Output Information Callout Box */}
          <div className="p-3 rounded-xl bg-[#0d0918] border border-amber-600/30 text-[11px] text-amber-200/90 leading-relaxed">
            <strong className="text-amber-400 font-bold">আউটপুট তথ্য:</strong> এই পিকচারটি মূল ভয়েস ও প্রজেক্টের ভিডিওর ঠিক শেষে আলাদা ফ্রেম হিসেবে যোগ হবে এবং Full HD (1920×1080) রেজোলিউশনে এক্সপোর্ট ফাইলটি আউটপুট হবে (৫০% অডিও সহ)।
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#1d1633] border-t border-purple-950 flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300"
          >
            বাতিল
          </button>
          <button
            onClick={handleSave}
            className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg shadow-amber-500/30 uppercase tracking-wider"
          >
            ঠিক আছে (Save & Done)
          </button>
        </div>
      </div>
    </div>
  );
};
