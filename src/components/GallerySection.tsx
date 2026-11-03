import React, { useState } from 'react';
import {
  Camera,
  Download,
  Upload,
  Trash2,
  CheckSquare,
  Sparkles,
  RefreshCw,
  Sliders,
  Check,
} from 'lucide-react';
import JSZip from 'jszip';
import { DramaFrame } from '../types/natok';

interface GallerySectionProps {
  frames: DramaFrame[];
  setFrames: React.Dispatch<React.SetStateAction<DramaFrame[]>>;
  onGenerateWithUnique: () => void;
  onUploadCustomPhotos: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  frames,
  setFrames,
  onGenerateWithUnique,
  onUploadCustomPhotos,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'duplicate' | 'unique'>('all');
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(90); // default 90%
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const similarityLevels = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  // Dynamic filter based on similarity
  const isFrameDuplicate = (frame: DramaFrame) => {
    return Boolean(frame.isDuplicate && (frame.similarityScore || 90) >= similarityThreshold);
  };

  const duplicateFrames = frames.filter(isFrameDuplicate);
  const uniqueFrames = frames.filter((f) => !isFrameDuplicate(f));

  const displayedFrames =
    activeFilter === 'duplicate'
      ? duplicateFrames
      : activeFilter === 'unique'
      ? uniqueFrames
      : frames;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Select all or toggle
  const handleSelectAll = () => {
    const allSelected = frames.every((f) => f.selected);
    setFrames((prev) => prev.map((f) => ({ ...f, selected: !allSelected })));
  };

  // Auto select duplicates
  const handleAutoSelectDuplicates = () => {
    setFrames((prev) =>
      prev.map((f) => ({
        ...f,
        selected: isFrameDuplicate(f),
      }))
    );
    showToast(`${duplicateFrames.length}টি ডুপ্লিকেট ফ্রেম সিলেক্ট করা হয়েছে`);
  };

  // Auto delete duplicates
  const handleAutoDeleteDuplicates = () => {
    const count = duplicateFrames.length;
    setFrames((prev) => prev.filter((f) => !isFrameDuplicate(f)));
    showToast(`${count}টি ডুপ্লিকেট ও অনুরূপ ছবি সফলভাবে ডিলিট করা হয়েছে!`);
  };

  // Clear all frames
  const handleClearAll = () => {
    const count = frames.length;
    setFrames([]);
    showToast(`সবগুলো (${count}) ফ্রেম মুছে ফেলা হয়েছে`);
  };

  // Download real ZIP archive with JSZip
  const handleDownloadZip = async () => {
    if (frames.length === 0) return;
    setIsZipping(true);
    showToast(`ZIP ফাইল তৈরির প্রস্তুতি চলছে... (মোট ${frames.length}টি ফ্রেম)`);

    try {
      const zip = new JSZip();
      const folder = zip.folder('Natok_Frames');

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const base64Data = frame.dataUrl.split(',')[1];
        if (base64Data && folder) {
          folder.file(`Frame_${String(i + 1).padStart(3, '0')}_${frame.timestamp.replace(':', '_')}.jpg`, base64Data, { base64: true });
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drama_frames_archive_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`ZIP ফাইল সফলভাবে তৈরি হয়েছে এবং ডাউনলোড শুরু হয়েছে!`);
    } catch (err) {
      console.error(err);
      showToast('ZIP ফাইল তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setIsZipping(false);
    }
  };

  // Replace single frame
  const handleReplaceFrame = (frameId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      setFrames((prev) =>
        prev.map((f) => (f.id === frameId ? { ...f, dataUrl, isDuplicate: false } : f))
      );
      showToast('ফ্রেম সফলভাবে পরিবর্তন করা হয়েছে!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full space-y-3 pb-8 select-none">
      {/* Top Header Information */}
      <div className="bg-[#171227] rounded-xl p-3 border border-purple-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              Gallery <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950 border border-purple-700 text-purple-300">Total: {frames.length}</span>
            </h2>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">
          ভিডিওর সমস্ত দৃশ্য ও ক্রপ করা ক্যারেক্টার ফ্রেমের তালিকা
        </p>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg bg-[#241a3d] border border-purple-800/60 text-xs font-semibold text-gray-200 hover:text-white"
          >
            <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
            <span>Select All</span>
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping || frames.length === 0}
            className="flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 text-xs font-bold text-white shadow-md shadow-purple-900/30 hover:opacity-90 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isZipping ? 'Zipping...' : `Download ZIP (${frames.length})`}</span>
          </button>

          <label className="flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg bg-[#142338] border border-cyan-800/60 text-xs font-semibold text-cyan-300 hover:bg-[#1a304e] cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onUploadCustomPhotos}
              className="hidden"
            />
          </label>

          <button
            onClick={handleClearAll}
            className="flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg bg-[#271017] border border-rose-900/50 text-xs font-semibold text-rose-300 hover:bg-[#381521]"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="bg-[#171227] rounded-xl p-3 border border-purple-900/40 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>ফিল্টার:</span>
          </div>
          <button
            onClick={onGenerateWithUnique}
            className="flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ইউনিক ছবি দিয়ে Video Generate</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-semibold">
          <button
            onClick={() => setActiveFilter('all')}
            className={`py-1.5 rounded-lg border transition ${
              activeFilter === 'all'
                ? 'bg-purple-600 border-purple-400 text-white shadow-sm'
                : 'bg-[#120d20] border-purple-900/40 text-gray-300'
            }`}
          >
            সব ছবি ({frames.length})
          </button>
          <button
            onClick={() => setActiveFilter('duplicate')}
            className={`py-1.5 rounded-lg border transition ${
              activeFilter === 'duplicate'
                ? 'bg-rose-600 border-rose-400 text-white shadow-sm'
                : 'bg-[#120d20] border-purple-900/40 text-gray-300'
            }`}
          >
            ডুপ্লিকেট ছবি ({duplicateFrames.length})
          </button>
          <button
            onClick={() => setActiveFilter('unique')}
            className={`py-1.5 rounded-lg border transition ${
              activeFilter === 'unique'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm'
                : 'bg-[#120d20] border-purple-900/40 text-gray-300'
            }`}
          >
            ইউনিক ছবি ({uniqueFrames.length})
          </button>
        </div>

        {/* Similarity Threshold Bar */}
        <div className="pt-1 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-gray-300">
            <span className="font-medium text-amber-300">কতটা মিল:</span>
            <span className="font-mono font-bold text-amber-400">{similarityThreshold}%</span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 text-center">
            {similarityLevels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSimilarityThreshold(lvl)}
                className={`py-0.5 rounded text-[10px] font-semibold border transition ${
                  similarityThreshold === lvl
                    ? 'bg-amber-500 border-amber-300 text-black font-bold shadow-sm'
                    : 'bg-[#120d20] border-purple-900/30 text-gray-400 hover:text-white'
                }`}
              >
                {lvl}%
              </button>
            ))}
          </div>
        </div>

        {/* Duplicate Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-bold">
          <button
            onClick={handleAutoSelectDuplicates}
            className="py-2 rounded-lg bg-amber-600/90 hover:bg-amber-600 text-black border border-amber-400 flex items-center justify-center space-x-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>ডুপ্লিকেট অটো সিলেক্ট</span>
          </button>
          <button
            onClick={handleAutoDeleteDuplicates}
            className="py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 flex items-center justify-center space-x-1.5 shadow-md shadow-rose-600/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ডুপ্লিকেট অটো ডিলেট ({duplicateFrames.length})</span>
          </button>
        </div>
      </div>

      {/* Frames Grid */}
      {displayedFrames.length === 0 ? (
        <div className="bg-[#171227] rounded-xl p-8 border border-purple-900/40 text-center space-y-3">
          <Camera className="w-10 h-10 text-gray-500 mx-auto" />
          <p className="text-xs font-semibold text-gray-300">No frames in the gallery</p>
          <p className="text-[11px] text-gray-500">Capture frames from Video Cropper or upload photos to Gallery</p>
          <label className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Upload Photos to Gallery</span>
            <input type="file" accept="image/*" multiple onChange={onUploadCustomPhotos} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {displayedFrames.map((frame, idx) => {
            const isDup = isFrameDuplicate(frame);
            return (
              <div
                key={frame.id}
                className={`relative rounded-xl overflow-hidden bg-[#100b1d] border transition-all duration-200 group ${
                  frame.selected
                    ? 'border-purple-400 ring-2 ring-purple-500/50'
                    : isDup
                    ? 'border-rose-900/80 hover:border-rose-700'
                    : 'border-purple-900/40 hover:border-purple-600'
                }`}
              >
                {/* 16:9 Image Thumbnail */}
                <div className="aspect-video w-full relative overflow-hidden bg-black">
                  <img
                    src={frame.dataUrl}
                    alt={`Frame ${frame.frameNumber}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />

                  {/* Frame Number Badge */}
                  <div className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-amber-300 border border-white/10 font-mono">
                    {String(frame.frameNumber).padStart(2, '0')}
                  </div>

                  {/* Replace Button with File Input */}
                  <label
                    title="Replace this frame"
                    className="absolute top-1.5 right-8 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/80 hover:bg-purple-950 text-cyan-300 border border-cyan-800/60 cursor-pointer flex items-center space-x-0.5"
                  >
                    <span>REPLACE</span>
                    <RefreshCw className="w-2.5 h-2.5 ml-0.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleReplaceFrame(frame.id, e)}
                      className="hidden"
                    />
                  </label>

                  {/* Checkbox Select */}
                  <button
                    onClick={() =>
                      setFrames((prev) =>
                        prev.map((f) => (f.id === frame.id ? { ...f, selected: !f.selected } : f))
                      )
                    }
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded bg-black/80 border border-white/20 flex items-center justify-center text-white"
                  >
                    {frame.selected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>

                  {/* Duplicate Badge */}
                  {isDup && (
                    <div className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-800/60">
                      ডুপ্লিকেট (#{frame.duplicateOf || 1} - {frame.similarityScore || 94}%)
                    </div>
                  )}

                  {/* Timestamp Bottom Right */}
                  <div className="absolute bottom-1.5 right-1.5 text-[9px] font-mono px-1 py-0.5 rounded bg-black/70 text-gray-300">
                    {frame.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto z-50 bg-[#1c1432]/95 backdrop-blur-md border border-purple-500/60 rounded-xl px-4 py-2 text-xs font-medium text-purple-200 text-center shadow-2xl flex items-center justify-center space-x-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
