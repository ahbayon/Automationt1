import React from 'react';
import { X, Film, Upload, Check, Folder } from 'lucide-react';
import { BUNDLED_VIDEO_PATH } from '../utils/sampleData';

interface VideoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (url: string, name: string) => void;
  currentVideoName?: string;
}

export const VideoPickerModal: React.FC<VideoPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectVideo,
  currentVideoName,
}) => {
  if (!isOpen) return null;

  const sampleDramas = [
    {
      id: 'duniya_takar_golam',
      name: 'দুনিয়া টাকার গোলাম',
      size: '472 MB',
      time: '3:53 PM',
      url: BUNDLED_VIDEO_PATH,
    },
    {
      id: 'fire_ashar_golpo',
      name: 'ফিরে আসার গল্প',
      size: '393 MB',
      time: '12:51 PM',
      url: BUNDLED_VIDEO_PATH,
    },
  ];

  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onSelectVideo(url, file.name);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md bg-[#120e21] border border-cyan-800/80 rounded-2xl shadow-2xl overflow-hidden text-gray-200">
        {/* Header - Android Files Style */}
        <div className="px-4 py-3 bg-[#18132d] border-b border-purple-950 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Folder className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-xs font-bold text-white">Select Video File</h3>
              <p className="text-[10px] text-gray-400">Redmi Note 10 &gt; FILES &gt; Videos</p>
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
        <div className="p-4 space-y-3">
          <p className="text-[11px] text-gray-300">
            রিভিউ বা ভিডিও তৈরির জন্য নাটক সিলেক্ট করুন অথবা আপনার ফোন থেকে ভিডিও ফাইল আপলোড করুন:
          </p>

          {/* Sample Videos List */}
          <div className="space-y-2">
            {sampleDramas.map((drama) => {
              const isSelected = currentVideoName === drama.name;
              return (
                <div
                  key={drama.id}
                  onClick={() => {
                    onSelectVideo(drama.url, drama.name);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-500 shadow-md shadow-cyan-900/30'
                      : 'bg-[#18122c] border-purple-900/40 hover:border-purple-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-600/60 flex items-center justify-center text-red-400 shadow-sm">
                      <Film className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{drama.name}</span>
                        {isSelected && <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500 text-black font-extrabold">ACTIVE</span>}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {drama.size} • {drama.time}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-cyan-400" />}
                </div>
              );
            })}
          </div>

          {/* Upload From Device Button */}
          <label className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-purple-900/40 transition">
            <Upload className="w-4 h-4 text-cyan-300" />
            <span>Upload Video from Device / Gallery</span>
            <input
              type="file"
              accept="video/*"
              onChange={handleDeviceUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#18132d] border-t border-purple-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
