import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Music, Sparkles, Download, Volume2 } from 'lucide-react';
import { audioSynth } from '../utils/audioSynthesizer';

interface MusicModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterImage?: string;
  dramaTitle: string;
}

export const MusicModeModal: React.FC<MusicModeModalProps> = ({
  isOpen,
  onClose,
  characterImage,
  dramaTitle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [songTitle, setSongTitle] = useState(`${dramaTitle} - নাটক স্পেশাল গান (AI Song)`);
  const [lyrics, setLyrics] = useState(
    `টাকার এই দুনিয়ায় স্বার্থের খেলা,\nআপন মানুষ অচেনা হয় আঁধার বেলা।\nমায়ার বাঁধন ছিঁড়ে যায় যে নিমিষে,\nহৃদয় কাঁদে নিরবে চোখের জলে ভেসে...`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (isPlaying) {
      audioSynth.stopBGM();
      setIsPlaying(false);
    } else {
      audioSynth.playBGM('bgm_slava');
      setIsPlaying(true);
    }
  };

  // Circular audio spectrum visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const render = () => {
      time += 0.05;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Dark background with starry glow
      ctx.fillStyle = '#080511';
      ctx.fillRect(0, 0, w, h);

      const numBars = 48;
      const radius = 70;

      // Draw equalizer circular sound bars
      for (let i = 0; i < numBars; i++) {
        const angle = (i / numBars) * Math.PI * 2;
        const amp = isPlaying ? Math.sin(time * 3 + i * 0.4) * 20 + 25 : 8;

        const x1 = cx + Math.cos(angle) * radius;
        const y1 = cy + Math.sin(angle) * radius;
        const x2 = cx + Math.cos(angle) * (radius + amp);
        const y2 = cy + Math.sin(angle) * (radius + amp);

        const hue = (i * 7 + time * 40) % 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 65%)`;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Center circle character frame
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 6, 0, Math.PI * 2);
      ctx.clip();

      if (characterImage) {
        const img = new Image();
        img.src = characterImage;
        ctx.drawImage(img, cx - radius, cy - radius, radius * 2, radius * 2);
      } else {
        ctx.fillStyle = '#3b0764';
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NATOK', cx, cy + 6);
      }
      ctx.restore();

      // Border ring
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 6, 0, Math.PI * 2);
      ctx.stroke();

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      audioSynth.stopBGM();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, characterImage]);

  const handleGenerateNewSong = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dramaTitle }),
      });
      const data = await res.json();
      if (data.text) {
        setLyrics(data.text);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-md bg-[#110c22] border-2 border-fuchsia-600/60 rounded-2xl shadow-2xl p-4 space-y-3 text-gray-200">
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-2">
          <div className="flex items-center space-x-2">
            <Music className="w-5 h-5 text-fuchsia-400" />
            <h3 className="text-xs font-bold text-white">AI নাটক গান ও মিউজিক মোড (Classic)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Animated Circular Soundbar Canvas */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-purple-900/60 flex items-center justify-center">
          <canvas ref={canvasRef} width={480} height={270} className="w-full h-full object-contain" />

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white flex items-center justify-center shadow-lg shadow-fuchsia-600/40"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        </div>

        {/* Song Title & Lyrics */}
        <div className="space-y-1.5">
          <input
            type="text"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            className="w-full bg-[#17122b] border border-purple-900/60 rounded-lg px-2.5 py-1.5 text-xs font-bold text-fuchsia-300"
          />
          <textarea
            rows={3}
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            className="w-full bg-[#17122b] border border-purple-900/60 rounded-lg p-2 text-xs text-gray-300 font-sans"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-1">
          <button
            onClick={handleGenerateNewSong}
            disabled={isGenerating}
            className="flex-1 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isGenerating ? 'জেনারেট হচ্ছে...' : 'নতুন লিরিক্স জেনারেট'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
