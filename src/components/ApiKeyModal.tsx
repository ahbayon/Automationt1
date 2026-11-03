import React, { useState, useEffect } from 'react';
import { X, Key, Eye, EyeOff, Clipboard, Check, ExternalLink, RotateCcw } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string;
  onSaveApiKey: (key: string) => void;
  hasEnvKey: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentApiKey,
  onSaveApiKey,
  hasEnvKey,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(currentApiKey || '');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    setApiKeyInput(currentApiKey);
  }, [currentApiKey]);

  if (!isOpen) return null;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setApiKeyInput(text.trim());
      }
    } catch (e) {
      // ignore
    }
  };

  const handleSave = async () => {
    onSaveApiKey(apiKeyInput.trim());
    onClose();
  };

  const handleReset = () => {
    setApiKeyInput('');
    onSaveApiKey('');
    setTestResult('ডিফল্ট সিস্টেমে রিসেট করা হয়েছে');
  };

  const isDefaultActive = !apiKeyInput && hasEnvKey;
  const isCustomActive = Boolean(apiKeyInput);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md bg-[#130d22] border border-purple-500/50 rounded-2xl shadow-2xl overflow-hidden text-gray-200">
        {/* Header */}
        <div className="px-4 py-3 bg-[#1c1333] border-b border-purple-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-400 flex items-center justify-center text-purple-300">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Gemini API Key সেট করুন</h3>
              <p className="text-[10px] text-gray-400">Google AI Studio Key Setup</p>
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
        <div className="p-4 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  isCustomActive || isDefaultActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-bold text-gray-200">
                {isCustomActive
                  ? 'কাস্টম কী সক্রিয়'
                  : isDefaultActive
                  ? 'ডিফল্ট কী সক্রিয়'
                  : 'কী সংযুক্ত নেই'}
              </span>
            </div>

            {isCustomActive && (
              <button
                onClick={handleReset}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>রিসেট</span>
              </button>
            )}
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            স্ক্রিপ্ট তৈরি ও AI ভয়েস ব্যবহারের জন্য আপনার নিজস্ব Google AI Studio Gemini API Key পেস্ট করুন:
          </p>

          {/* Key Input Box */}
          <div className="relative flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#0d0818] border border-purple-800/80 rounded-xl px-3 py-2.5 text-xs text-purple-200 font-mono focus:outline-none focus:border-purple-400 pr-20"
            />
            <div className="absolute right-2 flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handlePaste}
                title="Paste from clipboard"
                className="p-1.5 text-purple-400 hover:text-purple-200"
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Help link */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-gray-400">কী নেই?</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1 underline"
            >
              <span>Google AI Studio থেকে ফ্রি Key নিন</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#1c1333] border-t border-purple-900/60 flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300"
          >
            বাতিল
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
          >
            সেভ করুন (Save)
          </button>
        </div>
      </div>
    </div>
  );
};
