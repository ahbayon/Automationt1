/**
 * Audio synthesis utility for dramatic Natok background music,
 * sound effects (3D subscribe bell, cinematic hits), and Bengali voiceover fallback.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying = false;
  private bgmIntervalId: any = null;
  private currentBgmId: string = 'none';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play realistic dramatic Natok background music using Web Audio oscillator chords & filtered rhythms
  public playBGM(bgmId: string) {
    this.stopBGM();
    if (bgmId === 'none' || !bgmId) return;

    this.initContext();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    this.currentBgmId = bgmId;

    const ctx = this.ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.25, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.bgmGain = masterGain;

    // Pattern generator for dramatic tension
    let step = 0;
    const playBar = () => {
      if (!this.isBgmPlaying || !this.ctx) return;

      const now = this.ctx.currentTime;
      const rootFreq = bgmId.includes('Schizo') ? 110 : bgmId.includes('SLAVA') ? 130 : 98; // A2, C3, G2
      const chordOffsets = [0, 3, 7, 10]; // Minor 7th chord for deep suspense

      // Sub Bass Pad
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const noteGain = ctx.createGain();

      osc.type = bgmId.includes('SLAVA') ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(rootFreq * (chordOffsets[step % 4] / 12 + 1), now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 1.8);

      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.18, now + 0.1);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 2.0);

      // Atmospheric high tension shimmer (Bengali dramatic serial violin style)
      if (step % 2 === 0) {
        const violinOsc = ctx.createOscillator();
        const violinGain = ctx.createGain();
        violinOsc.type = 'triangle';
        violinOsc.frequency.setValueAtTime(rootFreq * 4, now);
        // Add subtle vibrato
        violinOsc.frequency.linearRampToValueAtTime(rootFreq * 4 + 4, now + 0.4);
        violinOsc.frequency.linearRampToValueAtTime(rootFreq * 4 - 4, now + 0.8);

        violinGain.gain.setValueAtTime(0, now);
        violinGain.gain.linearRampToValueAtTime(0.06, now + 0.2);
        violinGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        violinOsc.connect(violinGain);
        violinGain.connect(masterGain);

        violinOsc.start(now);
        violinOsc.stop(now + 1.8);
      }

      step++;
    };

    playBar();
    this.bgmIntervalId = setInterval(playBar, 1200);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    if (this.bgmGain) {
      try {
        this.bgmGain.disconnect();
      } catch (e) {
        // ignore
      }
      this.bgmGain = null;
    }
  }

  public isPlayingBGM(): boolean {
    return this.isBgmPlaying;
  }

  // Play YouTube Subscribe Bell Ding Sound
  public playSubscribeBell() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1480, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.8);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  // Play Dramatic Whoosh / Hit Sound (used for Natok hook transitions)
  public playDramaticHit() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.6);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  // Speak Bengali Text using Web Speech API fallback
  public speakBengali(text: string, voiceId?: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'bn-BD';

    // Find Bengali voice or high quality fallback
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find((v) => v.lang.startsWith('bn')) ||
                    voices.find((v) => v.lang.includes('IN') || v.lang.includes('BD')) ||
                    voices[0];

    if (bnVoice) {
      utterance.voice = bnVoice;
    }

    if (voiceId === 'Kore' || voiceId?.includes('Nobanita') || voiceId?.includes('Tanishaa')) {
      utterance.pitch = 1.15; // female
      utterance.rate = 1.0;
    } else {
      utterance.pitch = 0.9; // male dramatic
      utterance.rate = 1.0;
    }

    utterance.onend = () => {
      onEnd?.();
    };
    utterance.onerror = () => {
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioSynth = new AudioSynthesizer();
