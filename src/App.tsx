import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { CropperSection } from './components/CropperSection';
import { GallerySection } from './components/GallerySection';
import { GeneratorSection } from './components/GeneratorSection';
import { ExtraFrameModal } from './components/ExtraFrameModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { VideoExportModal } from './components/VideoExportModal';
import { VideoPickerModal } from './components/VideoPickerModal';
import { MusicModeModal } from './components/MusicModeModal';
import { VideoProject, DramaFrame, ExtraFrameConfig } from './types/natok';
import {
  getInitialDramaFrames,
  DEFAULT_SCRIPT,
  BUNDLED_VIDEO_PATH,
  GEMINI_VOICES,
} from './utils/sampleData';
import { audioSynth } from './utils/audioSynthesizer';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'crop' | 'generate' | 'gallery'>('crop');
  const [isAndroidView, setIsAndroidView] = useState<boolean>(true);
  const [hasEnvKey, setHasEnvKey] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('natok_api_key') || '');

  // Modals state
  const [isExtraFrameOpen, setIsExtraFrameOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isVideoPickerOpen, setIsVideoPickerOpen] = useState(false);
  const [isVideoExportOpen, setIsVideoExportOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isAiExpanding, setIsAiExpanding] = useState(false);
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  // Hidden photo upload input ref
  const photoUploadInputRef = useRef<HTMLInputElement | null>(null);

  // Main Video Project State
  const [project, setProject] = useState<VideoProject>(() => {
    return {
      title: 'দুনিয়া টাকার গোলাম',
      videoSourceUrl: BUNDLED_VIDEO_PATH,
      videoFileName: 'দুনিয়া টাকার গোলাম.mp4',
      videoDuration: 2149.7, // 35:49.7
      trimStart: 0,
      trimEnd: 2149.7,
      zoom: 132,
      colorAdjustments: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        warmth: 0,
        vignette: 0,
        hueTint: 0,
      },
      frames: getInitialDramaFrames(),
      autoCaptureInterval: 10,
      script: DEFAULT_SCRIPT,
      scriptDurationTarget: 1, // 1 minute
      showCc: true,
      bgmId: 'bgm_epic',
      hookSettings: {
        channelName: 'Natok Review',
        watermarkPercent: 35,
        duration: '10s',
        durationSeconds: 10,
        loadingStyle: 'rgb',
        loadingDuration: 4,
        borderLight: true,
        framePreset: 'Duniya Takar Golam',
        speed: 1.4,
        reScanIndex: 0,
      },
      playbackSpeed: 1.0,
      overlay: 'rain',
      fxStyle: 'drama_pro',
      selectedVoice: GEMINI_VOICES[2], // Zephyr (recommended)
      voiceProvider: 'gemini',
      extraFrame: {
        enabled: true,
        timestamp: '33:10',
        durationMinutes: 1,
      },
      exportResolution: '1080p',
    };
  });

  // Check API status from server on mount
  useEffect(() => {
    fetch('/api/ai/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasEnvKey) {
          setHasEnvKey(true);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (message: string) => {
    setToastBanner(message);
    setTimeout(() => setToastBanner(null), 3800);
  };

  // Reset project data (matches video timestamp 08:23)
  const handleResetProject = () => {
    audioSynth.stopBGM();
    audioSynth.stopSpeaking();
    setProject({
      title: 'দুনিয়া টাকার গোলাম',
      videoSourceUrl: BUNDLED_VIDEO_PATH,
      videoFileName: 'দুনিয়া টাকার গোলাম.mp4',
      videoDuration: 2149.7,
      trimStart: 0,
      trimEnd: 2149.7,
      zoom: 100,
      colorAdjustments: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        warmth: 0,
        vignette: 0,
        hueTint: 0,
      },
      frames: getInitialDramaFrames(),
      autoCaptureInterval: 10,
      script: DEFAULT_SCRIPT,
      scriptDurationTarget: 1,
      showCc: true,
      bgmId: 'none',
      hookSettings: {
        channelName: 'Natok Review',
        watermarkPercent: 35,
        duration: 'off',
        durationSeconds: 0,
        loadingStyle: 'rgb',
        loadingDuration: 4,
        borderLight: false,
        framePreset: 'Duniya Takar Golam',
        speed: 1.0,
        reScanIndex: 0,
      },
      playbackSpeed: 1.0,
      overlay: 'none',
      fxStyle: 'drama_pro',
      selectedVoice: GEMINI_VOICES[2],
      voiceProvider: 'gemini',
      extraFrame: {
        enabled: false,
        timestamp: '00:00',
        durationMinutes: 1,
      },
      exportResolution: '1080p',
    });
    showToast('অ্যাপের সব ফাইল রিসেট করা হয়েছে');
  };

  // Save API Key
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('natok_api_key', key);
      showToast('API Key সফলভাবে সেভ ও সক্রিয় হয়েছে!');
    } else {
      localStorage.removeItem('natok_api_key');
      showToast('API Key সফলভাবে রিসেট হয়েছে');
    }
  };

  // Expand script with Gemini AI
  const handleExpandScriptWithAi = async (durationMinutes: number) => {
    setIsAiExpanding(true);
    showToast('AI দিয়ে স্ক্রিপ্ট তৈরি করা হচ্ছে...');

    try {
      const response = await fetch('/api/ai/expand-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: project.script,
          durationMinutes,
          dramaTitle: project.title,
          customApiKey: apiKey || undefined,
        }),
      });

      const data = await response.json();
      if (data.success && data.script) {
        setProject((prev) => ({ ...prev, script: data.script }));
        showToast('স্ক্রিপ্ট সফলভাবে এক্সপ্যান্ড করা হয়েছে!');
      } else {
        showToast(data.error || 'স্ক্রিপ্ট তৈরিতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      showToast('স্ক্রিপ্ট সার্ভারে কানেক্ট করতে সমস্যা হয়েছে');
    } finally {
      setIsAiExpanding(false);
    }
  };

  // Capture single frame from cropper
  const handleCaptureSingleFrame = (dataUrl: string, timestampSec: number) => {
    const mins = Math.floor(timestampSec / 60);
    const secs = Math.floor(timestampSec % 60);
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const newFrame: DramaFrame = {
      id: `frame_${Date.now()}`,
      frameNumber: project.frames.length + 1,
      dataUrl,
      timestamp: timeStr,
      timestampSeconds: timestampSec,
      isDuplicate: false,
      selected: false,
    };

    setProject((prev) => ({
      ...prev,
      frames: [newFrame, ...prev.frames],
    }));
  };

  // Auto capture completed from cropper
  const handleAutoCaptureCompleted = (newFrames: DramaFrame[]) => {
    setProject((prev) => ({
      ...prev,
      frames: [...newFrames, ...prev.frames],
    }));
    setActiveTab('gallery');
    showToast(`${newFrames.length}টি ফ্রেম সফলভাবে গ্যালারিতে সংরক্ষিত হয়েছে!`);
  };

  // Upload Custom Photos
  const handleUploadCustomPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFrames: DramaFrame[] = [];
    let count = 0;

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const dataUrl = loadEvent.target?.result as string;
        newFrames.push({
          id: `custom_${Date.now()}_${idx}`,
          frameNumber: project.frames.length + idx + 1,
          dataUrl,
          timestamp: 'Uploaded',
          timestampSeconds: 0,
          isDuplicate: false,
          selected: false,
        });

        count++;
        if (count === files.length) {
          setProject((prev) => ({
            ...prev,
            frames: [...newFrames, ...prev.frames],
          }));
          setActiveTab('gallery');
          showToast(`${count}টি ছবি গ্যালারিতে যোগ করা হয়েছে!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Select video from picker modal
  const handleSelectVideoFile = (url: string, name: string) => {
    setProject((prev) => ({
      ...prev,
      videoSourceUrl: url,
      videoFileName: name,
      title: name.replace(/\.[^/.]+$/, ''),
    }));
    showToast(`ভিডিও নির্বাচিত হয়েছে: ${name}`);
  };

  // Save extra frame config
  const handleSaveExtraFrame = (cfg: ExtraFrameConfig) => {
    setProject((prev) => ({
      ...prev,
      extraFrame: cfg,
    }));
    showToast('Gallery থেকে Extra Frame সিলেক্ট করা হয়েছে!');
  };

  return (
    <div className="min-h-screen w-full bg-[#07040e] text-white flex flex-col items-center justify-start">
      {/* Container - Handles either Android Device View or Full Width */}
      <div
        className={`w-full transition-all duration-300 ${
          isAndroidView
            ? 'max-w-[460px] my-0 sm:my-4 rounded-none sm:rounded-[36px] border-0 sm:border-[8px] sm:border-[#2b2440] shadow-2xl bg-[#0e0a1b] overflow-hidden min-h-[92vh] flex flex-col'
            : 'max-w-5xl mx-auto px-2 sm:px-4 py-2 flex flex-col min-h-screen'
        }`}
      >
        {/* Header Toolbar */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          galleryCount={project.frames.length}
          hasVideoSelected={Boolean(project.videoSourceUrl)}
          onSelectVideoClick={() => setIsVideoPickerOpen(true)}
          onUploadPhotosClick={() => photoUploadInputRef.current?.click()}
          onOpenExtraFrameModal={() => setIsExtraFrameOpen(true)}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          onResetProject={handleResetProject}
          isAndroidView={isAndroidView}
          setIsAndroidView={setIsAndroidView}
          hasApiKey={Boolean(apiKey || hasEnvKey)}
        />

        {/* Hidden Photos Upload Input */}
        <input
          ref={photoUploadInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUploadCustomPhotos}
          className="hidden"
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 overflow-y-auto">
          {activeTab === 'crop' && (
            <CropperSection
              videoUrl={project.videoSourceUrl}
              videoFileName={project.videoFileName}
              zoom={project.zoom}
              setZoom={(z) => setProject((prev) => ({ ...prev, zoom: z }))}
              colorAdjustments={project.colorAdjustments}
              setColorAdjustments={(adj) =>
                setProject((prev) => ({
                  ...prev,
                  colorAdjustments: typeof adj === 'function' ? adj(prev.colorAdjustments) : adj,
                }))
              }
              onCaptureSingleFrame={handleCaptureSingleFrame}
              onAutoCaptureCompleted={handleAutoCaptureCompleted}
              onOpenVideoPicker={() => setIsVideoPickerOpen(true)}
            />
          )}

          {activeTab === 'generate' && (
            <GeneratorSection
              project={project}
              setProject={setProject}
              onStartExport={() => setIsVideoExportOpen(true)}
              onOpenExtraFrameModal={() => setIsExtraFrameOpen(true)}
              onExpandScriptWithAi={handleExpandScriptWithAi}
              isAiExpanding={isAiExpanding}
              onStartAiMusicModal={() => setIsMusicModalOpen(true)}
            />
          )}

          {activeTab === 'gallery' && (
            <GallerySection
              frames={project.frames}
              setFrames={(updater) =>
                setProject((prev) => ({
                  ...prev,
                  frames: typeof updater === 'function' ? updater(prev.frames) : updater,
                }))
              }
              onGenerateWithUnique={() => {
                setActiveTab('generate');
                showToast('ইউনিক ছবি দিয়ে ভিডিও জেনারেটরে যাওয়া হয়েছে!');
              }}
              onUploadCustomPhotos={handleUploadCustomPhotos}
            />
          )}
        </main>

        {/* Android Bottom Navigation Bar (Shown in Android View) */}
        {isAndroidView && (
          <div className="bg-[#0b0817] px-10 py-3 border-t border-purple-950 flex items-center justify-between text-gray-400 select-none">
            {/* Back (Triangle) */}
            <button
              onClick={() => {
                if (activeTab === 'gallery') setActiveTab('crop');
                else if (activeTab === 'generate') setActiveTab('crop');
              }}
              className="p-1 hover:text-white transition"
            >
              <div className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[12px] border-r-gray-400 active:border-r-white" />
            </button>

            {/* Home (Circle) */}
            <button
              onClick={() => setActiveTab('crop')}
              className="p-1 hover:text-white transition"
            >
              <div className="w-4 h-4 rounded-full border-2 border-gray-400 active:border-white" />
            </button>

            {/* Recents (Square) */}
            <button
              onClick={() => setIsVideoPickerOpen(true)}
              className="p-1 hover:text-white transition"
            >
              <div className="w-3.5 h-3.5 rounded-sm border-2 border-gray-400 active:border-white" />
            </button>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* 1. Video Picker Modal */}
      <VideoPickerModal
        isOpen={isVideoPickerOpen}
        onClose={() => setIsVideoPickerOpen(false)}
        onSelectVideo={handleSelectVideoFile}
        currentVideoName={project.videoFileName}
      />

      {/* 2. Extra Frame Modal */}
      <ExtraFrameModal
        isOpen={isExtraFrameOpen}
        onClose={() => setIsExtraFrameOpen(false)}
        config={project.extraFrame}
        onSaveConfig={handleSaveExtraFrame}
        frames={project.frames}
      />

      {/* 3. API Key Setup Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentApiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        hasEnvKey={hasEnvKey}
      />

      {/* 4. Full Video Export Screen */}
      <VideoExportModal
        isOpen={isVideoExportOpen}
        onClose={() => setIsVideoExportOpen(false)}
        project={project}
      />

      {/* 5. AI Music Mode Modal */}
      <MusicModeModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        characterImage={project.frames[0]?.dataUrl}
        dramaTitle={project.title}
      />

      {/* Global Toast Banner */}
      {toastBanner && (
        <div className="fixed bottom-14 sm:bottom-6 inset-x-4 max-w-sm mx-auto z-50 bg-[#1e1538]/95 backdrop-blur-md border border-purple-500/80 rounded-2xl p-3 text-xs font-semibold text-purple-200 text-center shadow-2xl flex items-center justify-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastBanner}</span>
        </div>
      )}
    </div>
  );
}
