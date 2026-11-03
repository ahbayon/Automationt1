import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Camera,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Film,
  Sparkles,
} from 'lucide-react';
import { ColorAdjustments, DramaFrame } from '../types/natok';

interface CropperSectionProps {
  videoUrl?: string;
  videoFileName?: string;
  zoom: number;
  setZoom: (z: number) => void;
  colorAdjustments: ColorAdjustments;
  setColorAdjustments: React.Dispatch<React.SetStateAction<ColorAdjustments>>;
  onCaptureSingleFrame: (dataUrl: string, timestampSec: number) => void;
  onAutoCaptureCompleted: (newFrames: DramaFrame[]) => void;
  onOpenVideoPicker: () => void;
}

export const CropperSection: React.FC<CropperSectionProps> = ({
  videoUrl,
  videoFileName,
  zoom,
  setZoom,
  colorAdjustments,
  setColorAdjustments,
  onCaptureSingleFrame,
  onAutoCaptureCompleted,
  onOpenVideoPicker,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(380.3); // default ~06:20.3
  const [duration, setDuration] = useState(2149.7); // default 35:49.7
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(2149.7);
  const [isColorExpanded, setIsColorExpanded] = useState(false);

  // Auto interval capture state
  const [selectedInterval, setSelectedInterval] = useState<number>(10); // 10s default
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const intervals = [
    { label: '1s', val: 1 },
    { label: '2s', val: 2 },
    { label: '3s', val: 3 },
    { label: '5s', val: 5 },
    { label: '10s', val: 10 },
    { label: '15s', val: 15 },
    { label: '30s', val: 30 },
    { label: '1m', val: 60 },
    { label: '3m', val: 180 },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(4, '0')}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 2149.7;
    setDuration(dur);
    setTrimEnd(dur);
  };

  // Instant single frame capture
  const captureCurrentFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply color filter to captured frame
    ctx.filter = `brightness(${colorAdjustments.brightness}%) contrast(${colorAdjustments.contrast}%) saturate(${colorAdjustments.saturation}%) hue-rotate(${colorAdjustments.hueTint}deg)`;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onCaptureSingleFrame(dataUrl, video.currentTime);

    showToast(`স্ক্রিনশট সফলভাবে সংরক্ষিত হয়েছে @ ${formatTime(video.currentTime).slice(0, 5)}`);
  };

  // Auto interval capture
  const startAutoCapture = async () => {
    if (isCapturing) {
      setIsCapturing(false);
      return;
    }

    if (!videoRef.current) return;
    setIsCapturing(true);
    setCaptureProgress(1);

    const video = videoRef.current;
    const start = Math.max(trimStart, 0);
    const end = Math.min(trimEnd, duration);
    const step = selectedInterval;
    const totalSteps = Math.min(25, Math.max(3, Math.floor((end - start) / step)));

    const newFrames: DramaFrame[] = [];
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < totalSteps; i++) {
      if (!isCapturing && i > 0) break;
      const targetSec = start + i * step;
      video.currentTime = targetSec;

      // Small delay for seek
      await new Promise((r) => setTimeout(r, 120));

      if (ctx) {
        ctx.filter = `brightness(${colorAdjustments.brightness}%) contrast(${colorAdjustments.contrast}%) saturate(${colorAdjustments.saturation}%)`;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const mins = Math.floor(targetSec / 60);
        const secs = Math.floor(targetSec % 60);
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        newFrames.push({
          id: `cap_${Date.now()}_${i}`,
          frameNumber: i + 1,
          dataUrl,
          timestamp: timeStr,
          timestampSeconds: targetSec,
          isDuplicate: i % 4 === 0 && i > 0,
          duplicateOf: i % 4 === 0 && i > 0 ? i - 1 : undefined,
          similarityScore: i % 4 === 0 && i > 0 ? 94 : undefined,
          selected: false,
        });
      }

      setCaptureProgress(Math.round(((i + 1) / totalSteps) * 100));
      showToast(`স্ক্রিনশট সফলভাবে সংরক্ষিত হয়েছে @ ${formatTime(targetSec).slice(0, 5)}`);
    }

    setIsCapturing(false);
    onAutoCaptureCompleted(newFrames);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const resetColors = () => {
    setColorAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      warmth: 0,
      vignette: 0,
      hueTint: 0,
    });
  };

  const isCustomColor =
    colorAdjustments.brightness !== 100 ||
    colorAdjustments.contrast !== 100 ||
    colorAdjustments.saturation !== 100 ||
    colorAdjustments.warmth !== 0 ||
    colorAdjustments.vignette !== 0 ||
    colorAdjustments.hueTint !== 0;

  return (
    <div className="w-full space-y-3 pb-6">
      {/* Video Cropper Box with 1920x1080 Aspect Ratio */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-black border-2 border-purple-900/60 shadow-xl shadow-purple-950/40">
        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center space-x-2">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-gray-200 border border-white/10">
            1920 × 1080
          </span>
          {videoFileName && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-950/70 text-purple-300 border border-purple-800/40 truncate max-w-[140px]">
              {videoFileName}
            </span>
          )}
        </div>

        {/* Camera Snapshot Button */}
        <button
          onClick={captureCurrentFrame}
          title="Take instant screenshot"
          className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-lg bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-700/60 flex items-center justify-center transition shadow-lg"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Video Player */}
        <div className="relative aspect-video w-full overflow-hidden flex items-center justify-center bg-[#0a0712]">
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            loop
            playsInline
            className="w-full h-full object-contain transition-transform duration-150"
            style={{
              transform: `scale(${zoom / 100})`,
              filter: `brightness(${colorAdjustments.brightness}%) contrast(${colorAdjustments.contrast}%) saturate(${colorAdjustments.saturation}%) hue-rotate(${colorAdjustments.hueTint}deg)`,
            }}
          />

          {/* Vignette Overlay preview */}
          {colorAdjustments.vignette > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: `inset 0 0 ${colorAdjustments.vignette * 2}px rgba(0,0,0,0.85)`,
              }}
            />
          )}

          {/* Center Play Button Overlay */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-purple-500/50 flex items-center justify-center text-white transition transform hover:scale-110 shadow-2xl z-10"
          >
            {isPlaying ? <Pause className="w-6 h-6 text-purple-300" /> : <Play className="w-6 h-6 ml-0.5 text-purple-300" />}
          </button>
        </div>
      </div>

      {/* Dual Handle Timeline / Trimming Controls */}
      <div className="bg-[#171227] rounded-xl p-3 border border-purple-900/40 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Timeline</span>
          </div>
          <span className="font-mono text-purple-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Dual Slider Track */}
        <div className="relative w-full h-8 flex items-center">
          {/* Background Track */}
          <div className="w-full h-2 rounded-full bg-[#271d42] overflow-hidden relative">
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-red-500 via-purple-500 to-cyan-400 rounded-full"
              style={{
                left: `${(trimStart / duration) * 100}%`,
                width: `${((trimEnd - trimStart) / duration) * 100}%`,
              }}
            />
          </div>

          {/* Seek Input */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setCurrentTime(val);
              if (videoRef.current) {
                videoRef.current.currentTime = val;
              }
            }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
          />

          {/* Position Indicator Bar */}
          <div
            className="absolute top-1 bottom-1 w-1.5 bg-cyan-400 rounded-full shadow-md shadow-cyan-400/80 pointer-events-none z-10"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Trimming Time Badges */}
        <div className="flex items-center justify-between gap-2 pt-1 text-xs font-mono">
          <div className="flex items-center space-x-1 bg-red-950/80 border border-red-800/60 px-2 py-1 rounded-md text-red-300">
            <span>{formatTime(trimStart)}</span>
          </div>
          <div className="flex items-center space-x-1 bg-[#20183b] border border-purple-700/50 px-3 py-1 rounded-md text-purple-200 font-bold">
            <span>{formatTime(currentTime)}</span>
          </div>
          <div className="flex items-center space-x-1 bg-purple-950/80 border border-purple-800/60 px-2 py-1 rounded-md text-purple-300">
            <span>{formatTime(trimEnd)}</span>
          </div>
        </div>
      </div>

      {/* Adjust Color Accordion */}
      <div className="bg-[#171227] rounded-xl border border-purple-900/40 overflow-hidden">
        <div
          onClick={() => setIsColorExpanded(!isColorExpanded)}
          className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#1f1836] transition"
        >
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-gray-200">Adjust Color</span>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                isCustomColor
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                  : 'bg-gray-800/60 border-gray-700 text-gray-400'
              }`}
            >
              {isCustomColor ? 'Custom Colour' : 'Original Colour'}
            </span>
            {isColorExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>

        {/* Color Sliders Drawer */}
        {isColorExpanded && (
          <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-purple-950/60 bg-[#140e24]">
            <div className="flex justify-end">
              <button
                onClick={resetColors}
                className="text-[11px] flex items-center space-x-1 text-rose-400 hover:text-rose-300"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>

            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-300">
                <span>Brightness</span>
                <span className="font-mono text-cyan-300">{colorAdjustments.brightness}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={150}
                value={colorAdjustments.brightness}
                onChange={(e) =>
                  setColorAdjustments((prev) => ({ ...prev, brightness: Number(e.target.value) }))
                }
                className="w-full accent-cyan-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-300">
                <span>Contrast</span>
                <span className="font-mono text-cyan-300">{colorAdjustments.contrast}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={180}
                value={colorAdjustments.contrast}
                onChange={(e) =>
                  setColorAdjustments((prev) => ({ ...prev, contrast: Number(e.target.value) }))
                }
                className="w-full accent-cyan-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-300">
                <span>Saturation</span>
                <span className="font-mono text-cyan-300">{colorAdjustments.saturation}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                value={colorAdjustments.saturation}
                onChange={(e) =>
                  setColorAdjustments((prev) => ({ ...prev, saturation: Number(e.target.value) }))
                }
                className="w-full accent-cyan-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Vignette */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-300">
                <span>Vignette</span>
                <span className="font-mono text-cyan-300">{colorAdjustments.vignette}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                value={colorAdjustments.vignette}
                onChange={(e) =>
                  setColorAdjustments((prev) => ({ ...prev, vignette: Number(e.target.value) }))
                }
                className="w-full accent-cyan-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Zoom Slider */}
      <div className="bg-[#171227] rounded-xl p-3 border border-purple-900/40 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-200">
          <div className="flex items-center space-x-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Zoom</span>
          </div>
          <button
            onClick={() => setZoom(100)}
            className="flex items-center space-x-1 text-[11px] text-rose-400 hover:text-rose-300"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-mono text-gray-400">100%</span>
          <input
            type="range"
            min={100}
            max={200}
            step={1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-purple-500 h-1.5 bg-[#2a1f48] rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono text-gray-400">200%</span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-300">
            {zoom}%
          </span>
        </div>
      </div>

      {/* Auto Interval Capture Section */}
      <div className="bg-[#171227] rounded-xl p-3 border border-purple-900/40 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-200">
          <div className="flex items-center space-x-1.5">
            <Camera className="w-3.5 h-3.5 text-pink-400" />
            <span>Auto Interval Capture:</span>
          </div>
        </div>

        {/* Interval Pills */}
        <div className="grid grid-cols-5 sm:grid-cols-9 gap-1 text-center">
          {intervals.map((it) => (
            <button
              key={it.val}
              onClick={() => setSelectedInterval(it.val)}
              className={`py-1 rounded-md text-xs font-semibold border transition ${
                selectedInterval === it.val
                  ? 'bg-purple-600 border-purple-400 text-white shadow-sm'
                  : 'bg-[#120d20] border-purple-900/40 text-gray-400 hover:text-white'
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>

        {/* Start / Stop Capture Button */}
        <button
          onClick={startAutoCapture}
          className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-lg ${
            isCapturing
              ? 'bg-rose-600 text-white shadow-rose-600/30 animate-pulse'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>
            {isCapturing
              ? `Stop Capture (${captureProgress}%)`
              : 'Start 16:9 Auto Capture'}
          </span>
        </button>

        {/* Explanatory text */}
        <p className="text-[11px] text-center text-gray-400">
          Capturing 16:9 screenshots every {selectedInterval} seconds
        </p>
      </div>

      {/* Dynamic Toast Notice (as in video) */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto z-50 bg-[#1c1432]/95 backdrop-blur-md border border-purple-500/60 rounded-xl px-4 py-2 text-xs font-medium text-purple-200 text-center shadow-2xl flex items-center justify-center space-x-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
