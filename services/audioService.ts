
class AudioService {
  private context: AudioContext | null = null;

  private init() {
    if (this.context) return;
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive'
      });
    } catch (e) {
      console.warn("AudioContext no soportado");
    }
  }

  async resume() {
    this.init();
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume().catch(console.error);
    }
  }

  private playTone(freq: number, dur: number, vol: number = 0.1) {
    this.init();
    if (!this.context || this.context.state !== 'running') return;

    try {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.context.currentTime);
      
      gain.gain.setValueAtTime(vol, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + dur / 1000);

      osc.connect(gain);
      gain.connect(this.context.destination);

      osc.start();
      osc.stop(this.context.currentTime + dur / 1000);
    } catch (e) {
      // Silencioso para no interrumpir el flujo del entrenamiento
    }
  }

  playCountdownBeep() {
    this.playTone(880, 100, 0.05);
  }

  playSegmentEndBeep() {
    this.playTone(1200, 400, 0.1);
  }
}

export const audioService = new AudioService();
