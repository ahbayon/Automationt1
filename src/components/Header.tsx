import React from 'react';
import {
  Crop,
  Sparkles,
  Image as ImageIcon,
  Video,
  Upload,
  Layers,
  RotateCcw,
  Key,
  Sliders,
  Smartphone,
  Monitor,
  Wifi,
  BatteryCharging,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'crop' | 'generate' | 'gallery';
  setActiveTab: (tab: 'crop' | 'generate' | 'gallery') => void;
  galleryCount: number;
  hasVideoSelected: boolean;
  onSelectVideoClick: () => void;
  onUploadPhotosClick: () => void;
  onOpenExtraFrameModal: () => void;
  onOpenApiKeyModal: () => void;
  onResetProject: () => void;
  isAndroidView: boolean;
  setIsAndroidView: (val: boolean) => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  galleryCount,
  hasVideoSelected,
  onSelectVideoClick,
  onUploadPhotosClick,
  onOpenExtraFrameModal,
  onOpenApiKeyModal,
  onResetProject,
  isAndroidView,
  setIsAndroidView,
  hasApiKey,
}) => {
  return (
    <header className="w-full bg-[#120f1d] border-b border-purple-950/60 sticky top-0 z-40 select-none">
      {/* Android Device Status Bar (When in phone preview mode) */}
      {isAndroidView && (
        <div className="bg-[#0a0712] px-4 py-1 text-[11px] font-medium text-gray-400 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-200">5:48 PM</span>
            <span className="text-[10px] text-gray-400">0.0KB/s</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">4G</span>
            <div className="flex items-center space-x-0.5">
              <span className="text-[10px] font-bold">88%</span>
              <BatteryCharging className="w-3.5 h-3.5 text-green-400" />
            </div>
          </div>
        </div>
      )}

      {/* Main Top Header Bar */}
      <div className="px-3 py-2 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 p-[1.5px] shadow-lg shadow-purple-600/30">
            <div className="w-full h-full bg-[#161226] rounded-[10px] flex items-center justify-center">
              <Video className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              Natok Automation
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-sm shadow-amber-500/20">
                PRO
              </span>
            </h1>
          </div>
        </div>

        {/* Right side quick actions */}
        <div className="flex items-center space-x-1.5">
          {/* Toggle Android device frame / Desktop mode */}
          <button
            onClick={() => setIsAndroidView(!isAndroidView)}
            title={isAndroidView ? 'Switch to Full Width View' : 'Switch to Android Mobile View'}
            className="flex items-center space-x-1 text-[11px] px-2 py-1 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-300 hover:bg-purple-900/40 hover:text-white transition"
          >
            {isAndroidView ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAndroidView ? 'Full' : 'Android'}</span>
          </button>

          {/* Custom API / Gemini API button */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center space-x-1 text-[11px] font-medium px-2.5 py-1 rounded-lg border transition ${
              hasApiKey
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'bg-purple-950/40 border-purple-700/50 text-purple-300 hover:bg-purple-900/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom API</span>
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Action Tabs Toolbar */}
      <div className="px-2 pb-2.5 pt-1 overflow-x-auto no-scrollbar flex items-center space-x-1.5 text-xs font-semibold">
        {/* Crop Tab */}
        <button
          onClick={() => setActiveTab('crop')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition shrink-0 ${
            activeTab === 'crop'
              ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/40 font-bold'
              : 'bg-[#1b152d] border-purple-900/50 text-gray-300 hover:text-white hover:bg-[#231b3b]'
          }`}
        >
          <Crop className="w-3.5 h-3.5" />
          <span>Crop</span>
        </button>

        {/* Generate Studio Tab */}
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition shrink-0 ${
            activeTab === 'generate'
              ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/40 font-bold'
              : 'bg-[#1b152d] border-purple-900/50 text-gray-300 hover:text-white hover:bg-[#231b3b]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate</span>
        </button>

        {/* Gallery Tab with count */}
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition shrink-0 ${
            activeTab === 'gallery'
              ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/40 font-bold'
              : 'bg-[#1b152d] border-purple-900/50 text-gray-300 hover:text-white hover:bg-[#231b3b]'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Gallery ({galleryCount})</span>
        </button>

        {/* Change Video / Select Video */}
        <button
          onClick={onSelectVideoClick}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#142338] border border-cyan-800/60 text-cyan-300 hover:bg-[#1a304e] hover:text-cyan-100 transition shrink-0"
        >
          <Video className="w-3.5 h-3.5 text-cyan-400" />
          <span>{hasVideoSelected ? 'Change Video' : 'Select Video File'}</span>
        </button>

        {/* Upload Photos */}
        <button
          onClick={onUploadPhotosClick}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1b152d] border border-purple-900/50 text-gray-300 hover:text-white hover:bg-[#231b3b] transition shrink-0"
        >
          <Upload className="w-3.5 h-3.5 text-pink-400" />
          <span>Upload Photos</span>
        </button>

        {/* Extra Frame Modal Trigger */}
        <button
          onClick={onOpenExtraFrameModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-950/60 to-purple-950/60 border border-amber-600/50 text-amber-300 hover:border-amber-400 transition shrink-0"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Extra Frame</span>
        </button>

        {/* Reset Project */}
        <button
          onClick={onResetProject}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#271017] border border-rose-900/50 text-rose-300 hover:bg-[#381521] hover:text-white transition shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
          <span>Reset</span>
        </button>

        {/* API Key Modal Button */}
        <button
          onClick={onOpenApiKeyModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#112423] border border-teal-800/60 text-teal-300 hover:bg-[#163332] transition shrink-0"
        >
          <Key className="w-3.5 h-3.5 text-teal-400" />
          <span>API Key</span>
        </button>
      </div>
    </header>
  );
};
