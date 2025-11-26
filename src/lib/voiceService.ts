/**
 * Enhanced Voice AI Service
 * 
 * Features:
 * - Continuous conversation mode (like ChatGPT voice)
 * - ElevenLabs-style natural speech synthesis
 * - Web Speech API for speech-to-text
 * - Automatic silence detection for turn-taking
 * - Voice activity detection with audio visualization
 * - Auto-restart recognition for seamless conversation
 */

// ==================== TYPES ====================
export interface VoiceConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  silenceThreshold?: number; // ms of silence to detect end of speech
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
  mode: 'idle' | 'listening' | 'processing' | 'speaking';
}

export type VoiceEventType = 
  | 'transcription'
  | 'finalTranscription'
  | 'speechStart'
  | 'speechEnd'
  | 'silenceDetected'
  | 'modeChange'
  | 'error'
  | 'stateChange';

export type VoiceEventCallback = (
  event: VoiceEventType,
  data: TranscriptionResult | VoiceState | Error | string
) => void;

// ==================== ENHANCED VOICE SERVICE ====================
class VoiceAIService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private callbacks: VoiceEventCallback[] = [];
  private currentTranscript: string = '';
  private isInitialized: boolean = false;
  
  // Continuous conversation mode
  private continuousMode: boolean = false;
  private autoRestartEnabled: boolean = true;
  private silenceTimer: NodeJS.Timeout | null = null;
  private silenceThreshold: number = 2000; // 2 seconds of silence = end of speech
  private lastSpeechTime: number = 0;
  
  // Error handling and retry
  private networkRetryCount: number = 0;
  private maxNetworkRetries: number = 3;
  private networkRetryDelay: number = 1000; // ms
  
  // Rapid restart detection
  private lastStartTime: number = 0;
  private rapidRestartCount: number = 0;
  private maxRapidRestarts: number = 5;
  private rapidRestartWindow: number = 2000; // ms - if 5 restarts in 2 seconds, something's wrong
  
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
    mode: 'idle',
  };

  // Voice preferences for natural speech
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private voiceRate: number = 0.95; // Slightly slower for natural feel
  private voicePitch: number = 1.0;
  private voiceVolume: number = 1.0;

  /**
   * Initialize voice services
   */
  async initialize(config: VoiceConfig = {}): Promise<boolean> {
    try {
      // Check browser support first
      const support = VoiceAIService.isSupported();
      if (!support.speechRecognition) {
        console.warn('Speech Recognition not supported in this browser');
        this.updateState({ error: 'Speech recognition not supported in this browser' });
        return false;
      }

      // Set silence threshold from config
      if (config.silenceThreshold) {
        this.silenceThreshold = config.silenceThreshold;
      }

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
        console.log('✅ Speech recognition initialized');
      } else {
        console.warn('Speech Recognition not supported');
        return false;
      }

      // Initialize Speech Synthesis
      if (window.speechSynthesis) {
        this.synthesis = window.speechSynthesis;
        await this.loadVoices();
        console.log('✅ Speech synthesis initialized');
      }

      // Initialize Audio Context for visualization
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;
        console.log('✅ Audio context initialized');
      } catch (e) {
        console.warn('Audio context not available:', e);
      }

      this.isInitialized = true;
      console.log('✅ Voice service fully initialized');
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
      const now = Date.now();
      
      // Check for rapid restart pattern (indicates a problem)
      if (now - this.lastStartTime < this.rapidRestartWindow) {
        this.rapidRestartCount++;
        if (this.rapidRestartCount >= this.maxRapidRestarts) {
          console.warn('⚠️ Rapid restart loop detected, stopping continuous mode');
          this.autoRestartEnabled = false;
          this.continuousMode = false;
          this.updateState({ 
            isListening: false, 
            mode: 'idle',
            error: 'Speech recognition keeps restarting. Please try again.'
          });
          this.emit('error', new Error('Speech recognition unstable - please try again'));
          try {
            this.recognition?.stop();
          } catch (e) {
            // Ignore
          }
          return;
        }
      } else {
        // Reset if enough time has passed
        this.rapidRestartCount = 0;
      }
      this.lastStartTime = now;
      
      console.log('🎤 Speech recognition started');
      this.networkRetryCount = 0; // Reset retry counter on successful start
      this.updateState({ isListening: true, error: null, mode: 'listening' });
      this.emit('speechStart', this.state);
    };

    this.recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      
      // Auto-restart if in continuous mode and not speaking
      if (this.continuousMode && this.autoRestartEnabled && !this.state.isSpeaking) {
        // Add increasing delay to prevent rapid restart loops
        const timeSinceStart = Date.now() - this.lastStartTime;
        const minSessionTime = 500; // Require at least 500ms of listening
        
        if (timeSinceStart < minSessionTime) {
          // Session ended too quickly - something might be wrong
          const delay = Math.min(1000 + (this.rapidRestartCount * 500), 3000);
          console.log(`🔄 Quick session end, waiting ${delay}ms before restart...`);
          setTimeout(() => {
            if (this.continuousMode && this.autoRestartEnabled && !this.state.isSpeaking) {
              this.startRecognition();
            }
          }, delay);
        } else {
          // Normal restart
          console.log('🔄 Auto-restarting recognition...');
          setTimeout(() => {
            if (this.continuousMode && this.autoRestartEnabled && !this.state.isSpeaking) {
              this.startRecognition();
            }
          }, 100);
        }
      } else {
        this.updateState({ 
          isListening: false, 
          mode: this.state.isSpeaking ? 'speaking' : 'idle' 
        });
        this.emit('speechEnd', this.state);
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

      // Update last speech time and reset silence timer
      this.lastSpeechTime = Date.now();
      this.resetSilenceTimer();

      // Emit interim results
      if (interimTranscript) {
        const fullTranscript = this.currentTranscript + interimTranscript;
        this.emit('transcription', {
          transcript: fullTranscript,
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
      console.warn('Speech recognition error:', error);
      
      // Handle specific errors
      switch (error) {
        case 'no-speech':
          // Not an error, just no speech detected - restart if continuous
          this.networkRetryCount = 0; // Reset on successful connection
          if (this.continuousMode && this.autoRestartEnabled) {
            setTimeout(() => this.startRecognition(), 100);
          }
          return;
        case 'aborted':
          // Intentionally stopped, ignore
          return;
        case 'not-allowed':
          this.updateState({ error: 'Microphone access denied. Please allow microphone access.' });
          this.emit('error', new Error(error));
          break;
        case 'network':
          // Network errors are common with cloud speech recognition
          // Try to recover automatically
          console.log(`🌐 Network error (attempt ${this.networkRetryCount + 1}/${this.maxNetworkRetries})`);
          
          if (this.networkRetryCount < this.maxNetworkRetries && this.continuousMode && this.autoRestartEnabled) {
            this.networkRetryCount++;
            // Exponential backoff
            const delay = this.networkRetryDelay * Math.pow(2, this.networkRetryCount - 1);
            console.log(`🔄 Retrying in ${delay}ms...`);
            setTimeout(() => {
              if (this.continuousMode && this.autoRestartEnabled) {
                this.startRecognition();
              }
            }, delay);
            return; // Don't emit error yet, we're retrying
          } else if (this.networkRetryCount >= this.maxNetworkRetries) {
            this.networkRetryCount = 0;
            this.updateState({ error: 'Network error. Speech recognition unavailable. Please check your connection and try again.' });
            this.emit('error', new Error('Network error - max retries exceeded'));
          }
          return;
        case 'audio-capture':
          this.updateState({ error: 'No microphone detected.' });
          this.emit('error', new Error(error));
          break;
        case 'service-not-allowed':
          // Browser doesn't allow speech recognition or quota exceeded
          this.updateState({ error: 'Speech recognition service not available. Try using Chrome.' });
          this.emit('error', new Error(error));
          break;
        default:
          // For unknown errors, try to recover in continuous mode
          if (this.continuousMode && this.autoRestartEnabled && this.networkRetryCount < this.maxNetworkRetries) {
            this.networkRetryCount++;
            setTimeout(() => this.startRecognition(), this.networkRetryDelay);
            return;
          }
          this.updateState({ error: `Recognition error: ${error}` });
          this.emit('error', new Error(error));
      }
    };
  }

  /**
   * Reset silence detection timer
   */
  private resetSilenceTimer(): void {
    this.clearSilenceTimer();
    
    this.silenceTimer = setTimeout(() => {
      if (this.currentTranscript.trim() && this.state.isListening) {
        console.log('🤫 Silence detected - user may be done speaking');
        this.emit('silenceDetected', this.currentTranscript.trim());
      }
    }, this.silenceThreshold);
  }

  /**
   * Clear silence timer
   */
  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  /**
   * Internal method to start recognition safely
   */
  private startRecognition(): void {
    if (!this.recognition) return;
    
    try {
      this.recognition.start();
    } catch (error) {
      // Already started or other error - try to restart
      try {
        this.recognition.stop();
        setTimeout(() => {
          try {
            this.recognition?.start();
          } catch (e) {
            console.warn('Could not restart recognition:', e);
          }
        }, 100);
      } catch (e) {
        console.warn('Recognition control error:', e);
      }
    }
  }

  /**
   * Start continuous conversation mode (like ChatGPT voice)
   */
  async startContinuousMode(): Promise<void> {
    console.log('🎙️ Starting continuous conversation mode');
    this.continuousMode = true;
    this.autoRestartEnabled = true;
    this.rapidRestartCount = 0; // Reset rapid restart counter
    this.lastStartTime = 0;
    await this.startListening();
  }

  /**
   * Stop continuous conversation mode
   */
  stopContinuousMode(): void {
    console.log('🛑 Stopping continuous conversation mode');
    this.continuousMode = false;
    this.autoRestartEnabled = false;
    this.stopListening();
  }

  /**
   * Check if in continuous mode
   */
  isContinuousMode(): boolean {
    return this.continuousMode;
  }

  /**
   * Set silence threshold for auto-detection
   */
  setSilenceThreshold(ms: number): void {
    this.silenceThreshold = Math.max(500, Math.min(5000, ms));
  }

  /**
   * Load available voices - prefer natural sounding ones (ElevenLabs quality)
   */
  private async loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      const loadVoicesInternal = () => {
        const voices = this.synthesis?.getVoices() || [];
        
        // Priority order for natural-sounding voices (like ElevenLabs)
        const voicePreferences = [
          // Premium/Neural voices first
          (v: SpeechSynthesisVoice) => v.name.includes('Neural') && v.lang.startsWith('en'),
          (v: SpeechSynthesisVoice) => v.name.includes('Natural') && v.lang.startsWith('en'),
          (v: SpeechSynthesisVoice) => v.name.includes('Premium') && v.lang.startsWith('en'),
          (v: SpeechSynthesisVoice) => v.name.includes('Enhanced') && v.lang.startsWith('en'),
          // Google voices (good quality)
          (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('en-US'),
          (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('en'),
          // Microsoft voices
          (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.lang.startsWith('en'),
          // Any remote/cloud voice (usually better quality)
          (v: SpeechSynthesisVoice) => !v.localService && v.lang.startsWith('en'),
          // Fallback to any English voice
          (v: SpeechSynthesisVoice) => v.lang.startsWith('en-US'),
          (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
        ];

        // Find best voice
        for (const preference of voicePreferences) {
          const voice = voices.find(preference);
          if (voice) {
            this.preferredVoice = voice;
            console.log('🔊 Selected high-quality voice:', voice.name);
            break;
          }
        }

        if (!this.preferredVoice && voices.length > 0) {
          this.preferredVoice = voices[0];
          console.log('🔊 Using default voice:', voices[0].name);
        }
        
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
    // Auto-initialize if not done
    if (!this.isInitialized) {
      console.log('🔧 Auto-initializing voice service...');
      const success = await this.initialize();
      if (!success) {
        throw new Error('Failed to initialize voice service');
      }
    }

    if (!this.recognition) {
      throw new Error('Speech recognition not available in this browser');
    }

    if (this.state.isListening) {
      console.log('Already listening');
      return;
    }

    // Request microphone access
    try {
      if (!this.mediaStream) {
        console.log('🎤 Requesting microphone access...');
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        });
        console.log('✅ Microphone access granted');
      }
      
      // Resume audio context if suspended
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Connect to audio analyser for visualization
      if (this.audioContext && this.analyser && this.mediaStream) {
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        source.connect(this.analyser);
        this.startAudioLevelMonitoring();
      }
    } catch (error) {
      console.error('Microphone access error:', error);
      this.updateState({ error: 'Microphone access denied' });
      throw new Error('Microphone access denied. Please allow microphone access in your browser settings.');
    }

    this.currentTranscript = '';
    this.updateState({ isListening: true, error: null, mode: 'listening' });
    
    this.startRecognition();
  }

  /**
   * Stop listening
   */
  stopListening(): string {
    const transcript = this.currentTranscript.trim();
    
    this.autoRestartEnabled = false;
    this.clearSilenceTimer();
    
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore
      }
    }
    
    this.updateState({ isListening: false, mode: 'idle' });
    this.stopAudioLevelMonitoring();
    
    return transcript;
  }

  /**
   * Pause listening temporarily (during AI speaking)
   */
  pauseListening(): void {
    this.autoRestartEnabled = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore
      }
    }
  }

  /**
   * Resume listening after pause
   */
  resumeListening(): void {
    if (this.continuousMode) {
      this.autoRestartEnabled = true;
      this.startRecognition();
    }
  }

  /**
   * Speak text using TTS with ElevenLabs-style natural speech
   */
  async speak(text: string, options: { 
    rate?: number; 
    pitch?: number; 
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
  } = {}): Promise<void> {
    if (!this.synthesis) {
      console.warn('Speech synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();
    
    // Pause listening while speaking (like ChatGPT)
    const wasListening = this.state.isListening;
    if (wasListening) {
      this.pauseListening();
    }
    
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.voice = this.preferredVoice;
      utterance.rate = options.rate ?? this.voiceRate;
      utterance.pitch = options.pitch ?? this.voicePitch;
      utterance.volume = options.volume ?? this.voiceVolume;
      
      utterance.onstart = () => {
        console.log('🔊 Speaking:', text.substring(0, 50) + '...');
        this.updateState({ isSpeaking: true, mode: 'speaking' });
        options.onStart?.();
      };
      
      utterance.onend = () => {
        console.log('🔊 Finished speaking');
        this.updateState({ isSpeaking: false, mode: wasListening ? 'listening' : 'idle' });
        options.onEnd?.();
        
        // Resume listening if in continuous mode
        if (this.continuousMode && wasListening) {
          setTimeout(() => {
            if (this.continuousMode) {
              this.resumeListening();
            }
          }, 300);
        }
        
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.warn('Speech synthesis error:', event.error);
        this.updateState({ isSpeaking: false, mode: 'idle' });
        
        // Resume listening even on error
        if (this.continuousMode && wasListening) {
          this.resumeListening();
        }
        
        resolve(); // Resolve instead of reject to not break the flow
      };
      
      this.synthesis!.speak(utterance);
    });
  }

  /**
   * Speak with natural pauses between sentences (ElevenLabs-style)
   */
  async speakNaturally(text: string, options: {
    onStart?: () => void;
    onEnd?: () => void;
    onSentence?: (sentence: string) => void;
  } = {}): Promise<void> {
    // Split into sentences for natural pauses
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    options.onStart?.();
    this.updateState({ isSpeaking: true, mode: 'speaking' });
    
    // Pause listening while speaking
    const wasListening = this.state.isListening;
    if (wasListening) {
      this.pauseListening();
    }
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;
      
      options.onSentence?.(sentence);
      
      await this.speak(sentence, {
        rate: 0.92, // Slightly slower for natural feel
        pitch: 1.0,
      });
      
      // Natural pause between sentences (150-250ms)
      if (i < sentences.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 180));
      }
    }
    
    this.updateState({ isSpeaking: false, mode: wasListening ? 'listening' : 'idle' });
    options.onEnd?.();
    
    // Resume listening if continuous mode
    if (this.continuousMode && wasListening) {
      setTimeout(() => {
        if (this.continuousMode) {
          this.resumeListening();
        }
      }, 300);
    }
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.updateState({ isSpeaking: false, mode: 'idle' });
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
        this.updateState({ audioLevel: 0 });
        return;
      }
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate RMS for better audio level representation
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const normalizedLevel = Math.min(100, (rms / 128) * 100);
      
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
  private emit(event: VoiceEventType, data: TranscriptionResult | VoiceState | Error | string): void {
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
   * Set volume
   */
  setVolume(volume: number): void {
    this.voiceVolume = Math.max(0, Math.min(1, volume));
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
   * Check if initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopContinuousMode();
    this.stopListening();
    this.stopSpeaking();
    this.closeWebRTC();
    this.clearSilenceTimer();
    
    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
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