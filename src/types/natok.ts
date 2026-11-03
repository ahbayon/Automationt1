export interface DramaFrame {
  id: string;
  frameNumber: number;
  dataUrl: string;
  timestamp: string; // e.g. "06:20"
  timestampSeconds: number;
  isDuplicate?: boolean;
  duplicateOf?: number;
  similarityScore?: number; // e.g. 94%
  selected?: boolean;
}

export interface BgmTrack {
  id: string;
  name: string;
  duration: string;
  url?: string;
  isCustom?: boolean;
  genre: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  provider: 'gemini' | 'browser' | 'elevenlabs';
  voiceId: string;
  gender: 'female' | 'male';
  recommended?: boolean;
  sampleText: string;
}

export interface ColorAdjustments {
  brightness: number; // 0 - 200 (default 100)
  contrast: number;   // 0 - 200 (default 100)
  saturation: number; // 0 - 200 (default 100)
  warmth: number;     // -50 - 50 (default 0)
  vignette: number;   // 0 - 100 (default 0)
  hueTint: number;    // -180 - 180 (default 0)
}

export interface HookSettings {
  channelName: string;
  watermarkPercent: number; // e.g. 35
  duration: 'off' | '10s' | '30s' | '1m' | '2m' | '3m';
  durationSeconds: number;
  loadingStyle: string;
  loadingDuration: number;
  borderLight: boolean;
  framePreset: string; // 'Duniya Takar Golam' | 'Dui Prithibir Raja'
  speed: number; // 1.4x default for hook
  reScanIndex: number;
}

export interface ExtraFrameConfig {
  enabled: boolean;
  frameId?: string;
  customImageUrl?: string;
  timestamp: string;
  durationMinutes: number; // 1 - 60
}

export type OverlayEffect = 'none' | 'rain' | 'snow' | 'embers' | 'dust' | 'love' | 'damage_film' | 'glowing';
export type FxStyle = 'drama_pro' | 'classic' | 'cinematic';
export type ExportResolution = '480p' | '720p' | '1080p';

export interface VideoProject {
  title: string;
  videoSourceUrl?: string;
  videoFileName?: string;
  videoDuration: number; // total duration in seconds
  trimStart: number;
  trimEnd: number;
  zoom: number; // 100 - 200
  colorAdjustments: ColorAdjustments;
  frames: DramaFrame[];
  autoCaptureInterval: number; // e.g. 10 seconds
  script: string;
  scriptDurationTarget: number; // e.g. 30 sec or 3 min
  showCc: boolean; // subtitles toggle
  bgmId: string;
  hookSettings: HookSettings;
  playbackSpeed: number; // 1.0, 1.2, 1.4, etc.
  overlay: OverlayEffect;
  fxStyle: FxStyle;
  selectedVoice: VoiceOption;
  voiceProvider: 'gemini' | 'browser';
  extraFrame: ExtraFrameConfig;
  exportResolution: ExportResolution;
}
