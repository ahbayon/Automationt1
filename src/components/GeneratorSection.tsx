import React, { useState } from 'react';
import {
  Sparkles,
  Subtitles,
  Layers,
  Music,
  Play,
  Pause,
  Upload,
  RotateCcw,
  Volume2,
  Video,
  ChevronDown,
  Tv,
  Check,
  FileAudio,
} from 'lucide-react';
import {
  VideoProject,
  BgmTrack,
  VoiceOption,
  OverlayEffect,
  FxStyle,
  ExportResolution,
} from '../types/natok';
import { BGM_PRESETS, GEMINI_VOICES, BROWSER_VOICES } from '../utils/sampleData';
import { audioSynth } from '../utils/audioSynthesizer';

interface GeneratorSectionProps {
  project: VideoProject;
  setProject: React.Dispatch<React.SetStateAction<VideoProject>>;
  onStartExport: () => void;
  onOpenExtraFrameModal: () => void;
  onExpandScriptWithAi: (targetMinutes: number) => Promise<void>;
  isAiExpanding: boolean;
  onStartAiMusicModal: () => void;
}

export const GeneratorSection: React.FC<GeneratorSectionProps> = ({
  project,
  setProject,
  onStartExport,
  onOpenExtraFrameModal,
  onExpandScriptWithAi,
  isAiExpanding,
  onStartAiMusicModal,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingBgm, setIsPlayingBgm] = useState(false);
  const [audioSeek, setAudioSeek] = useState(0);
  const [isSpeedDropdownOpen, setIsSpeedDropdownOpen] = useState(false);
  const [isOverlayDropdownOpen, setIsOverlayDropdownOpen] = useState(false);
  const [isFxDropdownOpen, setIsFxDropdownOpen] = useState(false);
  const [isResolutionDropdownOpen, setIsResolutionDropdownOpen] = useState(false);

  // Hook mini player state
  const [isHookPlaying, setIsHookPlaying] = useState(false);
  const [hookTime, setHookTime] = useState(0);

  const speedOptions = [1.0, 1.2, 1.3, 1.4, 1.5, 1.6];
  const overlayOptions: { label: string; val: OverlayEffect }[] = [
    { label: 'None', val: 'none' },
    { label: 'Rain', val: 'rain' },
    { label: 'Snow', val: 'snow' },
    { label: 'Embers', val: 'embers' },
    { label: 'Dust', val: 'dust' },
    { label: 'Love', val: 'love' },
    { label: 'Damage film', val: 'damage_film' },
    { label: 'Glowing...', val: 'glowing' },
  ];
  const fxOptions: { label: string; val: FxStyle; desc: string }[] = [
    { label: 'Drama Pro', val: 'drama_pro', desc: 'Recommended for TV Serial & Natok' },
    { label: 'Classic', val: 'classic', desc: 'AI Music & Song Generation' },
    { label: 'Cinematic', val: 'cinematic', desc: 'News style and Movie Recaps' },
  ];

  // BGM selection and preview
  const handleSelectBgm = (bgmId: string) => {
    setProject((prev) => ({ ...prev, bgmId }));
    if (bgmId === 'none') {
      audioSynth.stopBGM();
      setIsPlayingBgm(false);
    } else {
      audioSynth.playBGM(bgmId);
      setIsPlayingBgm(true);
    }
  };

  const toggleBgmPlayback = () => {
    if (isPlayingBgm) {
      audioSynth.stopBGM();
      setIsPlayingBgm(false);
    } else {
      audioSynth.playBGM(project.bgmId);
      setIsPlayingBgm(true);
    }
  };

  // Preview Voice Sample
  const handleSelectVoice = (voice: VoiceOption) => {
    setProject((prev) => ({ ...prev, selectedVoice: voice }));
    audioSynth.speakBengali(voice.sampleText, voice.voiceId);
  };

  // Audio waveform seek simulation
  const togglePlayScriptAudio = () => {
    if (isPlayingAudio) {
      audioSynth.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      audioSynth.speakBengali(project.script, project.selectedVoice.voiceId, () => {
        setIsPlayingAudio(false);
        setAudioSeek(0);
      });
    }
  };

  // Custom Audio File Import
  const handleImportAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProject((prev) => ({
        ...prev,
        script: `[আমদানি করা অডিও: ${file.name}] ${prev.script}`,
      }));
    }
  };

  // Estimated script duration
  const wordsCount = project.script.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.max(10, Math.round((wordsCount / 130) * 60));
  const estimatedMinutesStr = estimatedSeconds >= 60 ? `~${Math.round(estimatedSeconds / 60)}m` : `~${estimatedSeconds}s`;

  return (
    <div className="w-full space-y-3 pb-8 select-none">
      {/* 1. VOICEOVER NARRATION SCRIPT SECTION */}
      <div className="bg-[#171227] rounded-xl p-3.5 border border-purple-900/40 space-y-3">
        {/* Top Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <span className="text-gray-200 uppercase tracking-wider text-[11px] font-bold">
            VOICEOVER NARRATION SCRIPT:
          </span>

          <div className="flex items-center space-x-1.5">
            {/* Expand Script (Gemini AI) */}
            <button
              onClick={() => onExpandScriptWithAi(project.scriptDurationTarget || 1)}
              disabled={isAiExpanding}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-[11px] shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAiExpanding ? 'Expanding...' : 'Expand Script'}</span>
            </button>

            {/* Subtitles CC Toggle */}
            <button
              onClick={() => setProject((prev) => ({ ...prev, showCc: !prev.showCc }))}
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg border text-[11px] transition ${
                project.showCc
                  ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 font-bold'
                  : 'bg-[#120d20] border-purple-900/50 text-gray-400'
              }`}
            >
              <Subtitles className="w-3 h-3" />
              <span>CC</span>
            </button>

            {/* Duration Input & Badge */}
            <div className="flex items-center space-x-1 bg-[#120d20] border border-purple-900/50 rounded-lg px-2 py-1 text-[11px]">
              <span className="text-gray-400">Duration</span>
              <input
                type="number"
                min={1}
                max={60}
                value={project.scriptDurationTarget}
                onChange={(e) =>
                  setProject((prev) => ({
                    ...prev,
                    scriptDurationTarget: Math.max(1, parseInt(e.target.value) || 1),
                  }))
                }
                className="w-8 bg-transparent text-center font-mono font-bold text-cyan-300 outline-none"
              />
              <span className="text-[10px] text-gray-400 font-mono font-semibold">{estimatedMinutesStr}</span>
            </div>

            {/* Extra Frame Quick Badge */}
            <button
              onClick={onOpenExtraFrameModal}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-950/40 border border-amber-600/50 text-amber-300 text-[11px] font-semibold hover:border-amber-400"
            >
              <Layers className="w-3 h-3 text-amber-400" />
              <span>Extra Frame ({project.extraFrame.durationMinutes}m)</span>
            </button>
          </div>
        </div>

        {/* Script Textarea */}
        <div className="relative">
          <textarea
            rows={4}
            value={project.script}
            onChange={(e) => setProject((prev) => ({ ...prev, script: e.target.value }))}
            placeholder="Enter script here (or import voice to auto-fill)..."
            className="w-full bg-[#100b1d] border border-purple-900/60 rounded-xl p-3 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 leading-relaxed font-sans"
          />
        </div>

        {/* Waveform audio player bar */}
        <div className="flex items-center space-x-2 pt-1">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayScriptAudio}
            className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/30"
          >
            {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Waveform track */}
          <div className="flex-1 h-6 bg-[#100b1d] rounded-lg border border-purple-950/60 flex items-center px-2 space-x-1 overflow-hidden">
            {Array.from({ length: 42 }).map((_, i) => {
              const h = Math.sin(i * 0.4) * 10 + 12;
              const active = (i / 42) * 100 <= (audioSeek || (isPlayingAudio ? 60 : 25));
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    active ? 'bg-purple-400' : 'bg-[#291e45]'
                  }`}
                  style={{ height: `${h}px` }}
                />
              );
            })}
          </div>

          <span className="text-[11px] font-mono text-gray-400 shrink-0">
            0:00 / {estimatedSeconds >= 60 ? `0${Math.floor(estimatedSeconds / 60)}:${String(estimatedSeconds % 60).padStart(2, '0')}` : `00:${String(estimatedSeconds).padStart(2, '0')}`}
          </span>

          {/* Import Voice Audio button */}
          <label className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#201738] border border-purple-800/60 text-purple-300 hover:text-white text-xs font-semibold cursor-pointer shrink-0">
            <Upload className="w-3 h-3" />
            <span>Import</span>
            <input type="file" accept="audio/*" onChange={handleImportAudio} className="hidden" />
          </label>
        </div>
      </div>

      {/* 2. BACKGROUND MUSIC (BGM) */}
      <div className="bg-[#171227] rounded-xl p-3.5 border border-purple-900/40 space-y-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-200">
          <Music className="w-3.5 h-3.5 text-pink-400" />
          <span>BACKGROUND MUSIC</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Dropdown Selector */}
          <div className="relative flex-1">
            <select
              value={project.bgmId}
              onChange={(e) => handleSelectBgm(e.target.value)}
              className="w-full bg-[#100b1d] border border-purple-900/60 rounded-xl px-3 py-2 text-xs font-medium text-gray-200 appearance-none focus:outline-none focus:border-purple-500 cursor-pointer pr-8"
            >
              {BGM_PRESETS.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#171227] text-gray-200">
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Play/Pause BGM Preview */}
          <button
            onClick={toggleBgmPlayback}
            className={`px-3 py-2 rounded-xl border flex items-center space-x-1 text-xs font-semibold transition ${
              isPlayingBgm
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-purple-950/60 border-purple-800 text-purple-300 hover:bg-purple-900'
            }`}
          >
            {isPlayingBgm ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlayingBgm ? 'Pause' : 'Play'}</span>
          </button>

          {/* Custom BGM Upload */}
          <label className="px-3 py-2 rounded-xl bg-[#201738] border border-purple-800/60 text-purple-300 hover:text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  BGM_PRESETS.push({
                    id: `custom_${Date.now()}`,
                    name: file.name,
                    duration: 'Custom',
                    url,
                    isCustom: true,
                    genre: 'Custom Upload',
                  });
                  handleSelectBgm(`custom_${Date.now()}`);
                }
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 3. H-CONTROL (Hook Video Settings) */}
      <div className="bg-[#171227] rounded-xl p-3.5 border border-purple-900/40 space-y-3">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-gradient-to-r from-pink-600 to-rose-600 text-white font-extrabold text-[11px] shadow-sm">
              H-CONTROL
            </span>
            <div className="flex items-center space-x-1 bg-[#100b1d] border border-purple-900/50 rounded-lg px-2 py-0.5 text-[11px]">
              <span className="text-gray-400">Channel</span>
              <input
                type="text"
                value={project.hookSettings.channelName}
                onChange={(e) =>
                  setProject((prev) => ({
                    ...prev,
                    hookSettings: { ...prev.hookSettings, channelName: e.target.value },
                  }))
                }
                className="w-24 bg-transparent text-cyan-300 font-bold outline-none text-[11px]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                audioSynth.playDramaticHit();
                setProject((prev) => ({
                  ...prev,
                  hookSettings: {
                    ...prev.hookSettings,
                    reScanIndex: prev.hookSettings.reScanIndex + 1,
                  },
                }));
              }}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px]"
            >
              <span>Input Hook</span>
            </button>
            <button
              onClick={() => {
                audioSynth.playDramaticHit();
                setProject((prev) => ({
                  ...prev,
                  hookSettings: {
                    ...prev.hookSettings,
                    reScanIndex: prev.hookSettings.reScanIndex + 1,
                  },
                }));
              }}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* Loading Effect & Border Light & Frame Preset Row */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {/* Loading Effect Bar */}
          <div className="bg-[#100b1d] rounded-lg p-2 border border-purple-900/50 flex items-center justify-between">
            <span className="text-[11px] text-gray-300">Loading</span>
            <div className="w-12 h-3 rounded bg-gradient-to-r from-red-500 via-amber-400 to-cyan-400 animate-pulse" />
          </div>

          {/* Border Light Toggle */}
          <button
            onClick={() =>
              setProject((prev) => ({
                ...prev,
                hookSettings: {
                  ...prev.hookSettings,
                  borderLight: !prev.hookSettings.borderLight,
                },
              }))
            }
            className={`rounded-lg p-2 border flex items-center justify-center space-x-1 text-[11px] font-bold transition ${
              project.hookSettings.borderLight
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-400/20'
                : 'bg-[#100b1d] border-purple-900/50 text-gray-400'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                project.hookSettings.borderLight ? 'bg-cyan-400 animate-ping' : 'bg-gray-600'
              }`}
            />
            <span>Border Light</span>
          </button>

          {/* Frame Preset Dropdown */}
          <div className="relative">
            <select
              value={project.hookSettings.framePreset}
              onChange={(e) =>
                setProject((prev) => ({
                  ...prev,
                  hookSettings: { ...prev.hookSettings, framePreset: e.target.value },
                }))
              }
              className="w-full h-full bg-[#100b1d] border border-purple-900/50 rounded-lg px-2 text-[11px] font-semibold text-emerald-400 appearance-none pr-6 cursor-pointer"
            >
              <option value="Duniya Takar Golam">Duniya Takar Golam</option>
              <option value="Dui Prithibir Raja">Dui Prithibir Raja</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Hook Duration Selector Pills */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-xs font-semibold">
          {[
            { label: 'Off (0s)', val: 'off', sec: 0 },
            { label: '10 Seconds', val: '10s', sec: 10 },
            { label: '30 Seconds', val: '30s', sec: 30 },
            { label: '1 Minute', val: '1m', sec: 60 },
            { label: '2 Minutes', val: '2m', sec: 120 },
            { label: '3 Minutes', val: '3m', sec: 180 },
          ].map((dur) => (
            <button
              key={dur.val}
              onClick={() =>
                setProject((prev) => ({
                  ...prev,
                  hookSettings: {
                    ...prev.hookSettings,
                    duration: dur.val as any,
                    durationSeconds: dur.sec,
                  },
                }))
              }
              className={`py-1.5 rounded-lg border transition ${
                project.hookSettings.duration === dur.val
                  ? 'bg-rose-600 border-rose-400 text-white font-bold shadow-sm'
                  : 'bg-[#100b1d] border-purple-900/40 text-gray-400 hover:text-white'
              }`}
            >
              {dur.label}
            </button>
          ))}
        </div>

        {/* Mini Hook Player (If Hook is not off) */}
        {project.hookSettings.duration !== 'off' && (
          <div className="relative aspect-video max-h-48 rounded-xl overflow-hidden bg-black border border-purple-800/60 flex items-center justify-center">
            {/* Re-Scan Button Top Left */}
            <button
              onClick={() => {
                audioSynth.playDramaticHit();
                setProject((prev) => ({
                  ...prev,
                  hookSettings: {
                    ...prev.hookSettings,
                    reScanIndex: prev.hookSettings.reScanIndex + 1,
                  },
                }));
              }}
              className="absolute top-2 left-2 z-10 px-2 py-1 rounded bg-black/70 backdrop-blur-sm border border-white/20 text-[10px] font-bold text-gray-200 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              <span>Re-Scan</span>
            </button>

            {/* Live Speed Badge Top Right */}
            <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold shadow-md animate-pulse">
              1.4x Live
            </div>

            {/* Thumbnail Preview */}
            <img
              src={
                project.frames[project.hookSettings.reScanIndex % Math.max(1, project.frames.length)]
                  ?.dataUrl || ''
              }
              alt="Hook scene"
              className="w-full h-full object-cover"
            />

            {/* Play Button */}
            <button
              onClick={() => setIsHookPlaying(!isHookPlaying)}
              className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/70 border border-white/30 flex items-center justify-center text-white"
            >
              {isHookPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Bottom Timer */}
            <div className="absolute bottom-2 inset-x-0 mx-auto text-center font-mono text-xs text-white bg-black/60 px-3 py-0.5 rounded-full w-max border border-white/10">
              00:00 / 00:{String(project.hookSettings.durationSeconds).padStart(2, '0')}
            </div>
          </div>
        )}
      </div>

      {/* 4. SPEED, OVERLAY & FX STYLE ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Speed Selector */}
        <div className="bg-[#171227] rounded-xl p-2.5 border border-purple-900/40 relative">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
            SPEED:
          </label>
          <div className="relative">
            <select
              value={project.playbackSpeed}
              onChange={(e) =>
                setProject((prev) => ({ ...prev, playbackSpeed: parseFloat(e.target.value) }))
              }
              className="w-full bg-[#100b1d] border border-purple-900/60 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-400 appearance-none pr-6 cursor-pointer"
            >
              {speedOptions.map((s) => (
                <option key={s} value={s}>
                  {s.toFixed(1)}x
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Overlay Selector */}
        <div className="bg-[#171227] rounded-xl p-2.5 border border-purple-900/40 relative">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
            OVERLAY:
          </label>
          <div className="relative">
            <select
              value={project.overlay}
              onChange={(e) =>
                setProject((prev) => ({ ...prev, overlay: e.target.value as OverlayEffect }))
              }
              className="w-full bg-[#100b1d] border border-purple-900/60 rounded-lg px-2.5 py-1.5 text-xs font-bold text-cyan-400 appearance-none pr-6 cursor-pointer"
            >
              {overlayOptions.map((o) => (
                <option key={o.val} value={o.val}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* FX Style Selector */}
        <div className="bg-[#171227] rounded-xl p-2.5 border border-purple-900/40 relative">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              FX STYLE:
            </label>
            {project.fxStyle === 'classic' && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-950 text-pink-300 font-bold">
                Song Mode
              </span>
            )}
          </div>
          <div className="relative">
            <select
              value={project.fxStyle}
              onChange={(e) => {
                const val = e.target.value as FxStyle;
                setProject((prev) => ({ ...prev, fxStyle: val }));
                if (val === 'classic') {
                  onStartAiMusicModal();
                }
              }}
              className="w-full bg-[#100b1d] border border-purple-900/60 rounded-lg px-2.5 py-1.5 text-xs font-bold text-purple-300 appearance-none pr-6 cursor-pointer"
            >
              {fxOptions.map((f) => (
                <option key={f.val} value={f.val}>
                  {f.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 5. VOICE SETTINGS */}
      <div className="bg-[#171227] rounded-xl p-3.5 border border-purple-900/40 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-gray-200">VOICE SETTINGS</span>
          </div>

          {/* Engine Selector */}
          <div className="flex items-center space-x-1 bg-[#100b1d] border border-purple-900/50 p-0.5 rounded-lg text-[10px] font-bold">
            <button
              onClick={() => setProject((prev) => ({ ...prev, voiceProvider: 'gemini' }))}
              className={`px-2 py-0.5 rounded ${
                project.voiceProvider === 'gemini'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Gemini Studio
            </button>
            <button
              onClick={() => setProject((prev) => ({ ...prev, voiceProvider: 'browser' }))}
              className={`px-2 py-0.5 rounded ${
                project.voiceProvider === 'browser'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Browser Voice
            </button>
          </div>
        </div>

        {/* Voice Character Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {(project.voiceProvider === 'gemini' ? GEMINI_VOICES : BROWSER_VOICES).map((voice) => {
            const isSelected = project.selectedVoice.voiceId === voice.voiceId;
            return (
              <button
                key={voice.id}
                onClick={() => handleSelectVoice(voice)}
                className={`p-2 rounded-xl border text-left transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-700 border-purple-400 text-white shadow-md shadow-purple-600/30'
                    : 'bg-[#120d20] border-purple-900/40 text-gray-300 hover:text-white hover:border-purple-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>{voice.name}</span>
                    {voice.recommended && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-black font-extrabold">
                        REC
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 capitalize">{voice.gender} Voice</div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-purple-950 text-purple-300'
                  }`}
                >
                  <Volume2 className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. RESOLUTION SELECTOR & BIG VIDEO EXPORT BUTTON */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
        {/* Resolution Dropdown */}
        <div className="w-full sm:w-48 relative">
          <select
            value={project.exportResolution}
            onChange={(e) =>
              setProject((prev) => ({ ...prev, exportResolution: e.target.value as ExportResolution }))
            }
            className="w-full bg-[#171227] border-2 border-emerald-500/50 rounded-2xl px-3 py-3 text-xs font-bold text-emerald-300 appearance-none pr-8 cursor-pointer shadow-lg"
          >
            <option value="1080p">1080p HD (RECOMMENDED)</option>
            <option value="720p">720p (Balanced HD)</option>
            <option value="480p">480p (Super Fast)</option>
          </select>
          <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Big Glowing Video Export Button */}
        <button
          onClick={onStartExport}
          className="w-full flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl shadow-fuchsia-600/40 transition transform active:scale-98"
        >
          <Video className="w-5 h-5 animate-pulse" />
          <span>Video Export</span>
        </button>
      </div>
    </div>
  );
};
