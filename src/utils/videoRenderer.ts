import { DramaFrame, OverlayEffect } from '../types/natok';

export interface RenderConfig {
  frames: DramaFrame[];
  overlay: OverlayEffect;
  showCc: boolean;
  scriptText: string;
  channelName: string;
  borderLight: boolean;
  hookEnabled: boolean;
  hookDuration: number;
  extraFrameEnabled: boolean;
  extraFrameDataUrl?: string;
  zoomFactor: number;
  fps: number;
}

export class VideoRendererEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private isRendering = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  // Particle systems
  private rainDrops: { x: number; y: number; l: number; v: number }[] = [];
  private embers: { x: number; y: number; s: number; vy: number; vx: number; alpha: number }[] = [];
  private filmScratches: { x: number; width: number; alpha: number }[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.initParticles();
  }

  private initParticles() {
    this.rainDrops = Array.from({ length: 65 }, () => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      l: 15 + Math.random() * 25,
      v: 12 + Math.random() * 16,
    }));

    this.embers = Array.from({ length: 40 }, () => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      s: 2 + Math.random() * 4,
      vy: -(1 + Math.random() * 2.5),
      vx: (Math.random() - 0.5) * 1.5,
      alpha: 0.3 + Math.random() * 0.7,
    }));
  }

  // Draw Ken Burns animated frame on canvas
  public drawFrame(
    image: HTMLImageElement | null,
    progress: number, // 0 to 1 inside current frame duration
    config: RenderConfig,
    elapsedSeconds: number,
    currentCaption: string
  ) {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Image with smooth Zoom & Pan (Ken Burns Effect)
    if (image && image.complete && image.naturalWidth > 0) {
      ctx.save();
      const zoom = 1.0 + (config.zoomFactor / 100 - 1.0) * 0.5 + Math.sin(progress * Math.PI) * 0.08;
      const panX = Math.sin(progress * Math.PI * 0.7) * 20;
      const panY = Math.cos(progress * Math.PI * 0.5) * 12;

      ctx.translate(width / 2 + panX, height / 2 + panY);
      ctx.scale(zoom, zoom);
      ctx.drawImage(image, -width / 2, -height / 2, width, height);
      ctx.restore();
    } else {
      // Dark cinematic fallback
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Neon Border Light (when enabled)
    if (config.borderLight) {
      ctx.save();
      const time = elapsedSeconds * 3;
      const hue1 = (time * 50) % 360;
      const hue2 = (hue1 + 120) % 360;

      const borderGrad = ctx.createLinearGradient(0, 0, width, height);
      borderGrad.addColorStop(0, `hsl(${hue1}, 100%, 60%)`);
      borderGrad.addColorStop(0.5, `hsl(${hue2}, 100%, 65%)`);
      borderGrad.addColorStop(1, `hsl(${hue1}, 100%, 60%)`);

      ctx.lineWidth = 10;
      ctx.strokeStyle = borderGrad;
      ctx.shadowColor = `hsl(${hue1}, 100%, 50%)`;
      ctx.shadowBlur = 18;
      ctx.strokeRect(5, 5, width - 10, height - 10);
      ctx.restore();
    }

    // 3. Overlays
    this.renderOverlay(config.overlay, width, height, elapsedSeconds);

    // 4. Animated 3D SUBSCRIBE Button (Shown during first 30 seconds)
    if (elapsedSeconds <= 30) {
      this.renderSubscribeBanner(width, height, elapsedSeconds);
    }

    // 5. Channel Watermark Top Right
    if (config.channelName) {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      const wmText = `${config.channelName} PRO`;
      ctx.font = 'bold 15px sans-serif';
      const textWidth = ctx.measureText(wmText).width;
      const pad = 12;
      const boxW = textWidth + pad * 2 + 24;
      const boxH = 34;
      const boxX = width - boxW - 20;
      const boxY = 20;

      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      // Red LIVE / Star dot
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(boxX + 16, boxY + boxH / 2, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(wmText, boxX + 30, boxY + boxH / 2 + 5);
      ctx.restore();
    }

    // 6. Bengali Subtitle Captions
    if (config.showCc && currentCaption) {
      this.renderCaptions(currentCaption, width, height);
    }
  }

  // Overlays
  private renderOverlay(type: OverlayEffect, width: number, height: number, elapsed: number) {
    const ctx = this.ctx;

    if (type === 'rain') {
      ctx.save();
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';

      for (const d of this.rainDrops) {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 3, d.y + d.l);
        ctx.stroke();

        d.y += d.v;
        d.x -= 1.5;
        if (d.y > height) {
          d.y = -20;
          d.x = Math.random() * width;
        }
      }
      ctx.restore();
    } else if (type === 'snow') {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (const d of this.rainDrops) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, (d.l / 10), 0, Math.PI * 2);
        ctx.fill();
        d.y += d.v * 0.25;
        d.x += Math.sin(d.y * 0.02) * 1.5;
        if (d.y > height) {
          d.y = -10;
          d.x = Math.random() * width;
        }
      }
      ctx.restore();
    } else if (type === 'embers') {
      ctx.save();
      for (const e of this.embers) {
        ctx.fillStyle = `rgba(251, 146, 60, ${e.alpha})`;
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.s, 0, Math.PI * 2);
        ctx.fill();

        e.y += e.vy;
        e.x += e.vx;
        if (e.y < -10) {
          e.y = height + 10;
          e.x = Math.random() * width;
        }
      }
      ctx.restore();
    } else if (type === 'damage_film') {
      ctx.save();
      // Film grain flicker
      const flickerAlpha = 0.05 + Math.random() * 0.08;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(255, 255, 255, ${flickerAlpha})` : `rgba(0, 0, 0, ${flickerAlpha})`;
      ctx.fillRect(0, 0, width, height);

      // Random scratch vertical lines
      if (Math.random() > 0.4) {
        ctx.strokeStyle = 'rgba(240, 240, 240, 0.25)';
        ctx.lineWidth = 1;
        const scratchX = Math.random() * width;
        ctx.beginPath();
        ctx.moveTo(scratchX, 0);
        ctx.lineTo(scratchX + (Math.random() - 0.5) * 5, height);
        ctx.stroke();
      }
      ctx.restore();
    } else if (type === 'love') {
      ctx.save();
      ctx.fillStyle = 'rgba(244, 63, 94, 0.7)';
      for (const d of this.rainDrops.slice(0, 25)) {
        this.drawHeart(ctx, d.x, d.y, 10);
        d.y -= d.v * 0.15;
        d.x += Math.sin(d.y * 0.05) * 1.2;
        if (d.y < -20) {
          d.y = height + 20;
          d.x = Math.random() * width;
        }
      }
      ctx.restore();
    } else if (type === 'glowing') {
      ctx.save();
      const pulse = 0.2 + Math.sin(elapsed * 2) * 0.1;
      const glowGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.6);
      glowGrad.addColorStop(0, 'rgba(168, 85, 247, 0)');
      glowGrad.addColorStop(1, `rgba(168, 85, 247, ${pulse})`);
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }

  private drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size / 2, -size / 2, -size, size / 3, 0, size);
    ctx.bezierCurveTo(size, size / 3, size / 2, -size / 2, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  // 3D Animated Subscribe Button with Bell
  private renderSubscribeBanner(width: number, height: number, elapsed: number) {
    const ctx = this.ctx;
    ctx.save();

    const scale = 1.0 + Math.sin(elapsed * 4) * 0.04;
    const x = 25;
    const y = 25;
    const btnW = 160;
    const btnH = 40;

    ctx.translate(x + btnW / 2, y + btnH / 2);
    ctx.scale(scale, scale);
    ctx.translate(-(x + btnW / 2), -(y + btnH / 2));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 4, btnW, btnH, 20);
    ctx.fill();

    // Red YouTube Subscribe Pill
    const redGrad = ctx.createLinearGradient(x, y, x, y + btnH);
    redGrad.addColorStop(0, '#ff0033');
    redGrad.addColorStop(1, '#cc0028');
    ctx.fillStyle = redGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, btnW, btnH, 20);
    ctx.fill();

    // YouTube Play Icon
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(x + 12, y + 10, 24, 20, 5);
    ctx.fill();
    ctx.fillStyle = '#cc0028';
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 15);
    ctx.lineTo(x + 20, y + 25);
    ctx.lineTo(x + 30, y + 20);
    ctx.closePath();
    ctx.fill();

    // Text "SUBSCRIBE"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('SUBSCRIBE', x + 44, y + 25);

    // Bell icon
    const bellShake = Math.sin(elapsed * 8) * 0.15;
    ctx.save();
    ctx.translate(x + btnW - 20, y + 20);
    ctx.rotate(bellShake);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -2, 5, Math.PI, 0);
    ctx.lineTo(5, 5);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    // Clapper
    ctx.beginPath();
    ctx.arc(0, 6, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // Bengali Subtitles
  private renderCaptions(captionText: string, width: number, height: number) {
    const ctx = this.ctx;
    ctx.save();

    ctx.font = 'bold 22px "Hind Siliguri", "Kalpurush", sans-serif';
    const textW = ctx.measureText(captionText).width;
    const boxW = Math.min(width - 60, textW + 40);
    const boxH = 46;
    const boxX = (width - boxW) / 2;
    const boxY = height - 70;

    // Background pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.7)'; // Golden yellow border
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.fill();
    ctx.stroke();

    // Bengali Text
    ctx.fillStyle = '#fef08a'; // Golden yellow text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(captionText, width / 2, boxY + boxH / 2);

    ctx.restore();
  }

  // Start MediaRecorder export to create real MP4/WebM video file
  public startExportRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.recordedChunks = [];
      const stream = this.canvas.captureStream(30);

      // Supported mime types check
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      try {
        this.mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4000000 });
      } catch (err) {
        mimeType = '';
        this.mediaRecorder = new MediaRecorder(stream);
      }

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: mimeType || 'video/webm' });
        resolve(blob);
      };

      this.mediaRecorder.onerror = (e) => {
        reject(e);
      };

      this.mediaRecorder.start(200); // 200ms slice
      this.isRendering = true;
    });
  }

  public stopExportRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.isRendering = false;
  }
}
