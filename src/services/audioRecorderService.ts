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

  public async startRecording(onVolumeUpdate?: (volume: number) => void): Promise<boolean> {
    try {
      this.stopRecording();
      if (this.recordedBlobUrl) {
        URL.revokeObjectURL(this.recordedBlobUrl);
        this.recordedBlobUrl = null;
      }
      this.audioChunks = [];

      // Request microphone access explicitly
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Web Audio API Analyser for real-time decibel tracking
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);

        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);

        const checkVolume = () => {
          if (!this.analyser || !this.dataArray) return;
          this.analyser.getByteFrequencyData(this.dataArray as any);

          let sum = 0;
          for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
          }
          const average = sum / this.dataArray.length;
          // Scale from 0 to 100
          const normalizedVol = Math.min(100, Math.round((average / 128) * 100));

          if (onVolumeUpdate) {
            onVolumeUpdate(normalizedVol);
          }

          this.animFrameId = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      }

      // MediaRecorder for playback & storage
      if (typeof MediaRecorder !== 'undefined') {
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
