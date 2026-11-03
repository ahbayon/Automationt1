import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  EyeOff,
  Square,
  Sparkles,
  Download,
  Play,
  RotateCcw,
  CheckCircle2,
  Tv,
} from 'lucide-react';
import { VideoProject } from '../types/natok';
import { VideoRendererEngine } from '../utils/videoRenderer';
import { audioSynth } from '../utils/audioSynthesizer';

interface VideoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject;
}

export const VideoExportModal: React.FC<VideoExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [currentStep, setCurrentStep] = useState<'tts' | 'capture' | 'shuffle' | 'rendering' | 'completed'>('tts');
  const [progressPercent, setProgressPercent] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalEstimatedSeconds, setTotalEstimatedSeconds] = useState(43);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<VideoRendererEngine | null>(null);
  const loadedImagesRef = useRef<HTMLImageElement[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  if (!isOpen) return null;

  // Initialize export pipeline
  useEffect(() => {
    let isCancelled = false;

    const startPipeline = async () => {
      setProgressPercent(0);
      setElapsedSeconds(0);
      setExportedVideoUrl(null);
      setExportedBlob(null);

      // Play background music if enabled
      if (project.bgmId !== 'none') {
        audioSynth.playBGM(project.bgmId);
      }

      // Step 1: TTS Voice Generation
      setCurrentStep('tts');
      for (let p = 0; p <= 25; p += 5) {
        if (isCancelled) return;
        setProgressPercent(p);
        await new Promise((r) => setTimeout(r, 120));
      }

      // Step 2: Frame Capture
      setCurrentStep('capture');
      // Pre-load all project frame images
      const loaded: HTMLImageElement[] = [];
      for (const f of project.frames) {
        const img = new Image();
        img.src = f.dataUrl;
        await new Promise((r) => {
          img.onload = () => r(null);
          img.onerror = () => r(null);
        });
        loaded.push(img);
      }
      loadedImagesRef.current = loaded;

      for (let p = 25; p <= 50; p += 5) {
        if (isCancelled) return;
        setProgressPercent(p);
        await new Promise((r) => setTimeout(r, 100));
      }

      // Step 3: Shuffling & Sequence
      setCurrentStep('shuffle');
      for (let p = 50; p <= 75; p += 5) {
        if (isCancelled) return;
        setProgressPercent(p);
        await new Promise((r) => setTimeout(r, 100));
      }

      // Step 4: Real Canvas Rendering & MediaRecorder recording
      setCurrentStep('rendering');

      if (canvasRef.current) {
        const engine = new VideoRendererEngine(canvasRef.current);
        engineRef.current = engine;

        // Start MediaRecorder export recording
        engine.startExportRecording().then((blob) => {
          if (!isCancelled) {
            const url = URL.createObjectURL(blob);
            setExportedBlob(blob);
            setExportedVideoUrl(url);
            setCurrentStep('completed');
            setProgressPercent(100);

            // Auto trigger download
            const a = document.createElement('a');
            a.href = url;
            const resName = project.exportResolution === '1080p' ? '1080pHD' : project.exportResolution;
            a.download = `Drama_${Math.floor(Date.now() / 1000)}_${resName}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setToastMessage(`Saved to Downloads/NatokAutomationPro: Drama_1800_${resName}.mp4`);
          }
        }).catch((e) => {
          console.error('Export error:', e);
        });

        // Loop animation through slides
        const renderDuration = 18; // 18 seconds simulated export run
        const startTimestamp = Date.now();
        startTimeRef.current = startTimestamp;

        const loop = () => {
          if (isCancelled) return;
          const now = Date.now();
          const elapsed = (now - startTimestamp) / 1000;
          setElapsedSeconds(Math.floor(elapsed));

          const curPercent = Math.min(99, Math.round(75 + (elapsed / renderDuration) * 25));
          setProgressPercent(curPercent);

          // Determine current frame
          const slideDuration = 3.2; // 3.2s per slide
          const frameIndex = Math.floor(elapsed / slideDuration) % Math.max(1, loadedImagesRef.current.length);
          const currentImg = loadedImagesRef.current[frameIndex] || null;
          const slideProgress = (elapsed % slideDuration) / slideDuration;

          // Split script into sentences for captions
          const sentences = project.script.split(/[।!?\n]/).filter((s) => s.trim().length > 0);
          const captionIndex = Math.floor(elapsed / 4) % Math.max(1, sentences.length);
          const currentCaption = sentences[captionIndex] || 'আজকের পর্বে যা দেখেছিলেন...';

          engine.drawFrame(
            currentImg,
            slideProgress,
            {
              frames: project.frames,
              overlay: project.overlay,
              showCc: project.showCc,
              scriptText: project.script,
              channelName: project.hookSettings.channelName,
              borderLight: project.hookSettings.borderLight,
              hookEnabled: project.hookSettings.duration !== 'off',
              hookDuration: project.hookSettings.durationSeconds,
              extraFrameEnabled: project.extraFrame.enabled,
              extraFrameDataUrl: project.extraFrame.customImageUrl,
              zoomFactor: project.zoom,
              fps: 30,
            },
            elapsed,
            currentCaption
          );

          if (elapsed < renderDuration) {
            animationFrameRef.current = requestAnimationFrame(loop);
          } else {
            engine.stopExportRecording();
          }
        };

        animationFrameRef.current = requestAnimationFrame(loop);
      }
    };

    startPipeline();

    return () => {
      isCancelled = true;
      audioSynth.stopBGM();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (engineRef.current) {
        engineRef.current.stopExportRecording();
      }
    };
  }, [isOpen]);

  const handleStopExport = () => {
    audioSynth.stopBGM();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (engineRef.current) {
      engineRef.current.stopExportRecording();
    }
    onClose();
  };

  const formatSec = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md select-none overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e0a1b] border-2 border-purple-800/80 rounded-2xl shadow-2xl p-3 sm:p-4 space-y-3">
        {/* Top Active Configuration Badges */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px] font-bold">
          {project.extraFrame.enabled && (
            <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600 shrink-0">
              Extra Frame ({project.extraFrame.durationMinutes}m)
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700 shrink-0">
            {project.exportResolution === '1080p' ? '1080p HD' : project.exportResolution}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700 shrink-0">
            Subscribe (30s)
          </span>
          {project.overlay !== 'none' && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 shrink-0 capitalize">
              {project.overlay}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 shrink-0">
            {project.hookSettings.framePreset}
          </span>
          {project.hookSettings.duration !== 'off' && (
            <span className="px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-700 shrink-0">
              Hook Video ({project.hookSettings.duration})
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-700 shrink-0">
            Zoom {project.zoom}%
          </span>
          <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700 shrink-0">
            Drama Pro
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700 shrink-0">
            Slide 3.2s
          </span>
          <span className="px-2 py-0.5 rounded-full bg-gray-900 text-gray-300 border border-gray-700 shrink-0">
            Original Colour
          </span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700 shrink-0">
            BGM ({project.bgmId !== 'none' ? 'On' : 'Off'})
          </span>
        </div>

        {/* Center Live Video Preview Box */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-purple-900/60 flex items-center justify-center shadow-inner">
          {/* Eye Icon to Toggle Live Preview */}
          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            title="Toggle Live Preview (Save CPU)"
            className="absolute top-2.5 right-2.5 z-30 w-8 h-8 rounded-lg bg-black/60 hover:bg-black/90 backdrop-blur-md text-gray-300 border border-white/20 flex items-center justify-center transition"
          >
            {showLivePreview ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4 text-rose-400" />}
          </button>

          {/* Real Rendering Canvas */}
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className={`w-full h-full object-contain ${showLivePreview ? 'block' : 'hidden'}`}
          />

          {/* Fallback Screen when Live Preview is Hidden (as shown in video at 09:41) */}
          {!showLivePreview && (
            <div className="flex flex-col items-center justify-center space-y-2 text-center p-4">
              <div className="w-14 h-14 rounded-full bg-rose-950/80 border-2 border-rose-500/80 flex items-center justify-center text-rose-400 font-black text-2xl shadow-lg shadow-rose-900/40 animate-pulse">
                B
              </div>
              <div className="text-xs font-bold text-gray-300">Live Preview is Hidden</div>
              <p className="text-[10px] text-gray-500">সিপিইউ ও পাওয়ার বাঁচাতে লাইভ ভিউ অফ করা হয়েছে</p>
            </div>
          )}

          {/* Resolution Badge at Bottom Left */}
          <div className="absolute bottom-2.5 left-2.5 z-20 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/10 text-[10px] font-mono font-bold text-purple-300">
            Rendering {project.exportResolution === '1080p' ? '1080p HD' : project.exportResolution}
          </div>

          {/* Elapsed Timer Bottom Right */}
          <div className="absolute bottom-2.5 right-2.5 z-20 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/10 text-[10px] font-mono font-bold text-cyan-300">
            {formatSec(elapsedSeconds)} / 00:18
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-400">
            <span>01:43</span>
            <span className="text-purple-300 font-extrabold">{progressPercent}%</span>
            <span>00:19</span>
          </div>

          {/* Glowing Progress Track */}
          <div className="w-full h-2 rounded-full bg-[#1b1430] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Pipeline Step Indicators */}
        <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
          <div
            className={`py-2 rounded-xl border transition ${
              currentStep === 'tts'
                ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/40'
                : 'bg-[#150f24] border-purple-900/40 text-gray-400'
            }`}
          >
            TTS Voice
          </div>
          <div
            className={`py-2 rounded-xl border transition ${
              currentStep === 'capture'
                ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/40'
                : 'bg-[#150f24] border-purple-900/40 text-gray-400'
            }`}
          >
            Frame Capture
          </div>
          <div
            className={`py-2 rounded-xl border transition ${
              currentStep === 'shuffle'
                ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/40'
                : 'bg-[#150f24] border-purple-900/40 text-gray-400'
            }`}
          >
            Shuffling
          </div>
          <div
            className={`py-2 rounded-xl border transition ${
              currentStep === 'rendering' || currentStep === 'completed'
                ? 'bg-rose-600 border-rose-400 text-white shadow-md shadow-rose-600/40 animate-pulse'
                : 'bg-[#150f24] border-purple-900/40 text-gray-400'
            }`}
          >
            Rendering
          </div>
        </div>

        {/* Action Button: Stop Video Export (Red button) */}
        {currentStep !== 'completed' ? (
          <button
            onClick={handleStopExport}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-red-600/40"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop Video Export ({progressPercent}%)</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <div className="text-xs font-bold text-emerald-200">ভিডিও এক্সপোর্ট সফল হয়েছে!</div>
              <div className="text-[11px] text-gray-300 font-mono">
                Saved to Downloads/NatokAutomationPro: Drama_1800_{project.exportResolution === '1080p' ? '1080pHD' : project.exportResolution}.mp4
              </div>
            </div>

            <div className="flex space-x-2">
              {exportedVideoUrl && (
                <a
                  href={exportedVideoUrl}
                  download={`Natok_Review_1080p_${Date.now()}.webm`}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Again</span>
                </a>
              )}
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {toastMessage && (
          <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-500/80 text-xs text-purple-200 text-center shadow-lg font-mono">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
