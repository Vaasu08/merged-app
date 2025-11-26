/**
 * Voice AI Service
 * 
 * Features:
 * - Web Speech API for speech-to-text
 * - Text-to-speech for AI interviewer
 * - WebRTC for smooth voice streaming
 * - Voice activity detection
 * - Audio visualization
 */

// ==================== TYPES ====================
export interface VoiceConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface TranscriptionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
  timestamp: number;
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  audioLevel: number;
  error: string | null;
}

export type VoiceEventType = 
  | 'transcription'
  | 'finalTranscription'
  | 'speechStart'
  | 'speechEnd'
  | 'error'
  | 'stateChange';

export type VoiceEventCallback = (
  event: VoiceEventType,
  data: TranscriptionResult | VoiceState | Error
) => void;

// ==================== VOICE SERVICE ====================
class VoiceAIService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private callbacks: VoiceEventCallback[] = [];
  private currentTranscript: string = '';
  private isInitialized: boolean = false;
  
  // WebRTC
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  
  // State
  private state: VoiceState = {
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    audioLevel: 0,
    error: null,
  };

  // Voice preferences
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private voiceRate: number = 1.0;
  private voicePitch: number = 1.0;

  /**
   * Initialize voice services
   */
  async initialize(config: VoiceConfig = {}): Promise<boolean> {
    try {
      // Initialize Speech Recognition
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = config.continuous ?? true;
        recognition.interimResults = config.interimResults ?? true;
        recognition.lang = config.language ?? 'en-US';
        // @ts-expect-error - maxAlternatives exists on some implementations
        recognition.maxAlternatives = config.maxAlternatives ?? 1;
        this.recognition = recognition;
        
        this.setupRecognitionHandlers();
      } else {
        console.warn('Speech Recognition not supported');
      }

      // Initialize Speech Synthesis
      if (window.speechSynthesis) {
        this.synthesis = window.speechSynthesis;
        await this.loadVoices();
      }

      // Initialize Audio Context for visualization
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
      } catch (e) {
        console.warn('Audio context not available:', e);
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Voice initialization failed:', error);
      this.updateState({ error: 'Voice initialization failed' });
      return false;
    }
  }

  /**
   * Set up speech recognition event handlers
   */
  private setupRecognitionHandlers(): void {
    if (!this.recognition) return;

    // @ts-expect-error - onstart exists on SpeechRecognition
    this.recognition.onstart = () => {
      this.updateState({ isListening: true, error: null });
      this.emit('speechStart', this.state);
    };

    this.recognition.onend = () => {
      this.updateState({ isListening: false });
      this.emit('speechEnd', this.state);
      
      // Auto-restart if still supposed to be listening
      if (this.state.isListening) {
        setTimeout(() => {
          if (this.state.isListening) {
            this.recognition?.start();
          }
        }, 100);
      }
    };

    // @ts-expect-error - onresult exists on SpeechRecognition
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Emit interim results
      if (interimTranscript) {
        this.emit('transcription', {
          transcript: this.currentTranscript + interimTranscript,
          isFinal: false,
          confidence: event.results[event.results.length - 1][0].confidence || 0.5,
          timestamp: Date.now(),
        });
      }

      // Emit final results
      if (finalTranscript) {
        this.currentTranscript += finalTranscript + ' ';
        this.emit('finalTranscription', {
          transcript: this.currentTranscript.trim(),
          isFinal: true,
          confidence: event.results[event.results.length - 1][0].confidence || 0.8,
          timestamp: Date.now(),
        });
      }
    };

    // @ts-expect-error - onerror exists on SpeechRecognition
    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const error = event.error;
      
      // Ignore no-speech errors (common when user is thinking)
      if (error === 'no-speech') {
        return;
      }
      
      console.error('Recognition error:', error);
      this.updateState({ error: `Recognition error: ${error}` });
      this.emit('error', new Error(error));
    };
  }

  /**
   * Load available voices
   */
  private async loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      const loadVoicesInternal = () => {
        const voices = this.synthesis?.getVoices() || [];
        
        // Prefer natural-sounding English voices
        const preferredVoices = voices.filter(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Natural') || 
           voice.name.includes('Premium') ||
           voice.name.includes('Enhanced') ||
           !voice.localService)
        );
        
        this.preferredVoice = preferredVoices[0] || 
          voices.find(v => v.lang === 'en-US') || 
          voices[0] || null;
        
        resolve();
      };

      if (this.synthesis?.getVoices().length) {
        loadVoicesInternal();
      } else {
        this.synthesis?.addEventListener('voiceschanged', loadVoicesInternal, { once: true });
        // Timeout fallback
        setTimeout(loadVoicesInternal, 1000);
      }
    });
  }

  /**
   * Start listening for speech
   */
  async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not initialized');
    }

    if (this.state.isListening) {
      return;
    }

    // Request microphone access
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Connect to audio analyser for visualization
      if (this.audioContext && this.analyser) {
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        source.connect(this.analyser);
        this.startAudioLevelMonitoring();
      }
    } catch (error) {
      throw new Error('Microphone access denied');
    }

    this.currentTranscript = '';
    this.updateState({ isListening: true, error: null });
    
    try {
      this.recognition.start();
    } catch (error) {
      // Already started, ignore
    }
  }

  /**
   * Stop listening
   */
  stopListening(): string {
    const transcript = this.currentTranscript.trim();
    
    if (this.recognition) {
      this.recognition.stop();
    }
    
    this.updateState({ isListening: false });
    this.stopAudioLevelMonitoring();
    
    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    return transcript;
  }

  /**
   * Speak text using TTS
   */
  async speak(text: string, options: { rate?: number; pitch?: number; volume?: number } = {}): Promise<void> {
    if (!this.synthesis) {
      console.warn('Speech synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();
    
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.voice = this.preferredVoice;
      utterance.rate = options.rate ?? this.voiceRate;
      utterance.pitch = options.pitch ?? this.voicePitch;
      utterance.volume = options.volume ?? 1.0;
      
      utterance.onstart = () => {
        this.updateState({ isSpeaking: true });
      };
      
      utterance.onend = () => {
        this.updateState({ isSpeaking: false });
        resolve();
      };
      
      utterance.onerror = (event) => {
        this.updateState({ isSpeaking: false });
        if (event.error !== 'interrupted') {
          reject(new Error(`Speech error: ${event.error}`));
        } else {
          resolve();
        }
      };
      
      this.synthesis!.speak(utterance);
    });
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.updateState({ isSpeaking: false });
    }
  }

  /**
   * Monitor audio levels for visualization
   */
  private animationFrameId: number | null = null;
  
  private startAudioLevelMonitoring(): void {
    if (!this.analyser) return;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    const monitor = () => {
      if (!this.state.isListening || !this.analyser) {
        return;
      }
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average level
      const average = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
      const normalizedLevel = Math.min(100, (average / 128) * 100);
      
      this.updateState({ audioLevel: normalizedLevel });
      
      this.animationFrameId = requestAnimationFrame(monitor);
    };
    
    monitor();
  }

  private stopAudioLevelMonitoring(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.updateState({ audioLevel: 0 });
  }

  // ==================== WebRTC Support ====================

  /**
   * Initialize WebRTC peer connection for streaming
   */
  async initializeWebRTC(
    iceServers: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }]
  ): Promise<void> {
    this.peerConnection = new RTCPeerConnection({ iceServers });
    
    // Create data channel for low-latency communication
    this.dataChannel = this.peerConnection.createDataChannel('voice', {
      ordered: true,
      maxRetransmits: 3,
    });
    
    this.dataChannel.onopen = () => {
      console.log('WebRTC data channel opened');
    };
    
    this.dataChannel.onmessage = (event) => {
      // Handle incoming messages (e.g., from a server)
      try {
        const data = JSON.parse(event.data);
        this.emit('transcription', data);
      } catch (e) {
        console.warn('Invalid WebRTC message:', e);
      }
    };
    
    // Add audio track
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.mediaStream!);
      });
    }
  }

  /**
   * Get audio stream for WebRTC
   */
  async getAudioStream(): Promise<MediaStream> {
    if (!this.mediaStream) {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Optimal for speech recognition
        },
      });
    }
    return this.mediaStream;
  }

  /**
   * Send audio data via WebRTC data channel
   */
  sendAudioData(data: ArrayBuffer): void {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(data);
    }
  }

  /**
   * Close WebRTC connection
   */
  closeWebRTC(): void {
    this.dataChannel?.close();
    this.peerConnection?.close();
    this.dataChannel = null;
    this.peerConnection = null;
  }

  // ==================== Event System ====================

  /**
   * Subscribe to voice events
   */
  on(callback: VoiceEventCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Emit event to all subscribers
   */
  private emit(event: VoiceEventType, data: TranscriptionResult | VoiceState | Error): void {
    this.callbacks.forEach(callback => {
      try {
        callback(event, data);
      } catch (e) {
        console.error('Voice event callback error:', e);
      }
    });
  }

  /**
   * Update state and emit change
   */
  private updateState(updates: Partial<VoiceState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('stateChange', this.state);
  }

  // ==================== Utility Methods ====================

  /**
   * Get current state
   */
  getState(): VoiceState {
    return { ...this.state };
  }

  /**
   * Get current transcript
   */
  getCurrentTranscript(): string {
    return this.currentTranscript;
  }

  /**
   * Clear current transcript
   */
  clearTranscript(): void {
    this.currentTranscript = '';
  }

  /**
   * Set voice preferences
   */
  setVoicePreferences(rate: number, pitch: number): void {
    this.voiceRate = Math.max(0.5, Math.min(2, rate));
    this.voicePitch = Math.max(0.5, Math.min(2, pitch));
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis?.getVoices() || [];
  }

  /**
   * Set preferred voice
   */
  setVoice(voice: SpeechSynthesisVoice): void {
    this.preferredVoice = voice;
  }

  /**
   * Check if voice services are supported
   */
  static isSupported(): {
    speechRecognition: boolean;
    speechSynthesis: boolean;
    webRTC: boolean;
  } {
    return {
      speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      speechSynthesis: !!window.speechSynthesis,
      webRTC: !!window.RTCPeerConnection,
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopListening();
    this.stopSpeaking();
    this.closeWebRTC();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.callbacks = [];
    this.isInitialized = false;
  }
}

// Export singleton instance
export const voiceService = new VoiceAIService();
export default voiceService;
