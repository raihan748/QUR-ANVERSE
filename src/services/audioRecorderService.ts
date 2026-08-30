// Audio Recorder & Real-time Decibel Visualizer Service
// Uses Web Audio API & MediaRecorder for 100% browser compatibility

export class AudioRecorderService {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private recordedBlobUrl: string | null = null;
  private animFrameId: number | null = null;

  public async startRecording(
    onVolumeUpdateOrOptions?: ((volume: number) => void) | {
      onVolumeUpdate?: (volume: number) => void;
      enableMediaRecorder?: boolean;
      boostGain?: boolean;
    }
  ): Promise<boolean> {
    const onVolumeUpdate = typeof onVolumeUpdateOrOptions === 'function'
      ? onVolumeUpdateOrOptions
      : onVolumeUpdateOrOptions?.onVolumeUpdate;
    const enableMediaRecorder = typeof onVolumeUpdateOrOptions === 'object' && onVolumeUpdateOrOptions !== null
      ? (onVolumeUpdateOrOptions.enableMediaRecorder ?? false)
      : false;
    const boostGain = typeof onVolumeUpdateOrOptions === 'object' && onVolumeUpdateOrOptions !== null
      ? (onVolumeUpdateOrOptions.boostGain ?? true)
      : true;

    try {
      this.stopRecording();
      if (this.recordedBlobUrl) {
        URL.revokeObjectURL(this.recordedBlobUrl);
        this.recordedBlobUrl = null;
      }
      this.audioChunks = [];

      // Request microphone access with tuned sensitivity constraints for mobile devices
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: !boostGain, // Disable harsh hardware noise suppression when boost is active
          autoGainControl: true
        }
      });

      // Web Audio API Analyser for real-time decibel tracking
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        
        let targetNode: AudioNode = source;
        if (boostGain) {
          const gainNode = this.audioContext.createGain();
          gainNode.gain.value = 1.8; // Boost sensitivity for mobile / ambient noise
          source.connect(gainNode);
          targetNode = gainNode;
        }

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.1; // Instant dynamic response without sluggish lag
        targetNode.connect(this.analyser);

        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }

        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);

        const checkVolume = () => {
          if (!this.analyser || !this.dataArray) return;
          this.analyser.getByteFrequencyData(this.dataArray as any);

          // Focus on human vocal frequencies (bins 2 to 45: ~100Hz to 3.5kHz)
          let sum = 0;
          let peak = 0;
          const endBin = Math.min(45, this.dataArray.length);
          const startBin = 2;
          const count = endBin - startBin;

          for (let i = startBin; i < endBin; i++) {
            const val = this.dataArray[i];
            sum += val;
            if (val > peak) peak = val;
          }
          const avg = sum / (count || 1);
          
          // Instant responsive decibel curve (0-100)
          const energy = peak * 0.7 + avg * 0.3;
          const normalizedVol = Math.min(100, Math.max(0, Math.round((energy / 140) * 100)));

          if (onVolumeUpdate) {
            onVolumeUpdate(normalizedVol);
          }

          this.animFrameId = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      }

      // MediaRecorder only when explicitly requested (to prevent audio starvation on mobile)
      if (enableMediaRecorder && typeof MediaRecorder !== 'undefined') {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

        this.mediaRecorder = mimeType
          ? new MediaRecorder(this.mediaStream, { mimeType })
          : new MediaRecorder(this.mediaStream);

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.start(100);
      }

      return true;
    } catch (err) {
      console.warn('Microphone access error:', err);
      return false;
    }
  }

  public stopRecording(): Promise<string | null> {
    return new Promise((resolve) => {
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }

      if (this.audioContext && this.audioContext.state !== 'closed') {
        try {
          this.audioContext.close();
        } catch {}
        this.audioContext = null;
      }

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
          if (this.recordedBlobUrl) {
            URL.revokeObjectURL(this.recordedBlobUrl);
          }
          this.recordedBlobUrl = URL.createObjectURL(blob);
          resolve(this.recordedBlobUrl);
        };

        try {
          this.mediaRecorder.stop();
        } catch {
          resolve(null);
        }
      } else {
        resolve(this.recordedBlobUrl);
      }

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
        this.mediaStream = null;
      }
    });
  }

  public getRecordedAudioUrl(): string | null {
    return this.recordedBlobUrl;
  }
}

export const audioRecorder = new AudioRecorderService();
