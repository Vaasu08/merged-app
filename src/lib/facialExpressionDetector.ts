// Dynamic imports to avoid build-time issues with TensorFlow.js and MediaPipe
let tf: typeof import('@tensorflow/tfjs');
let faceLandmarksDetection: typeof import('@tensorflow-models/face-landmarks-detection');

export interface ExpressionData {
  blink: boolean;
  mouth_open: boolean;
  mouth_ratio: number;
  smile: boolean;
  surprised: boolean;
  frowning: boolean;
}

export interface PostureData {
  slouch_level: 'GOOD' | 'MILD' | 'MODERATE' | 'SEVERE';
  slouching: boolean;
  slouch_score: number;
  forward_head_posture: boolean;
  asymmetric_shoulders: boolean;
  spine_alignment_diff: number;
}

class FacialExpressionDetector {
  private detector: any = null;
  private isRunning: boolean = false;
  
  // Key landmark indices
  private readonly LEFT_EYE = [33, 160, 158, 133, 153, 144];
  private readonly RIGHT_EYE = [362, 385, 387, 263, 373, 380];
  private readonly MOUTH = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405];
  
  // Posture landmarks (for MediaPipe Pose)
  private readonly NOSE = 1;
  private readonly LEFT_SHOULDER = 11;
  private readonly RIGHT_SHOULDER = 12;
  private readonly LEFT_HIP = 23;
  private readonly RIGHT_HIP = 24;

  async initialize(): Promise<boolean> {
    try {
      // Dynamic import to avoid build issues
      if (!tf) {
        tf = await import('@tensorflow/tfjs');
      }
      if (!faceLandmarksDetection) {
        faceLandmarksDetection = await import('@tensorflow-models/face-landmarks-detection');
      }
      
      // Check if the module loaded correctly
      if (!faceLandmarksDetection || !(faceLandmarksDetection as any).SupportedModels) {
        console.error('Face landmarks detection module not loaded correctly');
        return false;
      }
      
      // Get the model - the API uses SupportedModels.MediaPipeFaceMesh
      const model = (faceLandmarksDetection as any).SupportedModels.MediaPipeFaceMesh;
      if (!model) {
        console.error('MediaPipeFaceMesh model not found in SupportedModels');
        return false;
      }
      
      // Try multiple solution paths in case CDN is blocked
      const solutionPaths = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619',
        'node_modules/@mediapipe/face_mesh'
      ];
      
      let lastError: Error | null = null;
      
      for (const solutionPath of solutionPaths) {
        try {
          const detectorConfig: any = {
            runtime: 'mediapipe' as const,
            solutionPath: solutionPath,
            maxFaces: 1,
            refineLandmarks: true,
          };
          
          // Use createDetector (correct API for v1.0.6)
          this.detector = await (faceLandmarksDetection as any).createDetector(model, detectorConfig);
          
          // Verify detector was created
          if (this.detector && typeof this.detector.estimateFaces === 'function') {
            console.log('✅ Face mesh detector initialized successfully with path:', solutionPath);
            return true;
          } else {
            throw new Error('Detector created but estimateFaces method not available');
          }
        } catch (error: any) {
          lastError = error;
          console.warn(`Failed to initialize with solutionPath: ${solutionPath}`, error?.message || error);
          continue; // Try next path
        }
      }
      
      // If all paths failed, log the last error
      console.error('❌ All initialization attempts failed. Last error:', lastError);
      return false;
    } catch (error: any) {
      console.error('❌ Error initializing detector:', error?.message || error);
      return false;
    }
  }

  private calculateDistance(point1: [number, number], point2: [number, number]): number {
    return Math.sqrt(
      Math.pow(point1[0] - point2[0], 2) + 
      Math.pow(point1[1] - point2[1], 2)
    );
  }

  private calculateAspectRatio(eyePoints: [number, number][]): number {
    // Vertical distances
    const vertical1 = this.calculateDistance(eyePoints[1], eyePoints[5]);
    const vertical2 = this.calculateDistance(eyePoints[2], eyePoints[4]);
    // Horizontal distance
    const horizontal = this.calculateDistance(eyePoints[0], eyePoints[3]);
    
    // EAR formula (Eye Aspect Ratio)
    const ear = (vertical1 + vertical2) / (2 * horizontal);
    return ear;
  }

  detectExpressions(landmarks: Array<[number, number, number?]>): ExpressionData {
    const expressions: ExpressionData = {
      blink: false,
      mouth_open: false,
      mouth_ratio: 0,
      smile: false,
      surprised: false,
      frowning: false
    };
    
    // Convert landmarks to array
    const lmArray = landmarks.map(lm => [lm[0], lm[1]] as [number, number]);
    
    // Eye aspect ratio for blink detection
    const leftEye = this.LEFT_EYE.map(i => lmArray[i]);
    const rightEye = this.RIGHT_EYE.map(i => lmArray[i]);
    
    const leftEar = this.calculateAspectRatio(leftEye);
    const rightEar = this.calculateAspectRatio(rightEye);
    expressions.blink = (leftEar + rightEar) / 2 < 0.15;
    
    // Mouth opening detection
    const mouthTop = lmArray[13];
    const mouthBottom = lmArray[14];
    const mouthLeft = lmArray[78];
    const mouthRight = lmArray[308];
    
    if (mouthTop && mouthBottom && mouthLeft && mouthRight) {
      const verticalMouth = this.calculateDistance(mouthTop, mouthBottom);
      const horizontalMouth = this.calculateDistance(mouthLeft, mouthRight);
      const mouthRatio = verticalMouth / (horizontalMouth + 1e-5);
      
      expressions.mouth_open = mouthRatio > 0.5;
      expressions.mouth_ratio = mouthRatio;
    }
    
    // Smile detection
    const mouthLeftUp = lmArray[57];
    const mouthRightUp = lmArray[287];
    const mouthCenterUp = lmArray[0];
    
    if (mouthLeftUp && mouthRightUp && mouthCenterUp) {
      const leftCornerDist = mouthCenterUp[1] - mouthLeftUp[1];
      const rightCornerDist = mouthCenterUp[1] - mouthRightUp[1];
      expressions.smile = (leftCornerDist < -5 && rightCornerDist < -5);
    }
    
    // Eyebrow height detection
    const leftEyebrow = this.averagePoints([70, 63, 105, 66, 107].map(i => lmArray[i]).filter(Boolean) as [number, number][]);
    const rightEyebrow = this.averagePoints([300, 293, 332, 297, 338].map(i => lmArray[i]).filter(Boolean) as [number, number][]);
    const nose = lmArray[this.NOSE];
    
    if (leftEyebrow && rightEyebrow && nose) {
      const leftEyebrowHeight = nose[1] - leftEyebrow[1];
      const rightEyebrowHeight = nose[1] - rightEyebrow[1];
      const avgEyebrowHeight = (leftEyebrowHeight + rightEyebrowHeight) / 2;
      
      expressions.surprised = avgEyebrowHeight < -30;
      expressions.frowning = avgEyebrowHeight > 30;
    }
    
    return expressions;
  }

  private averagePoints(points: [number, number][]): [number, number] | null {
    if (points.length === 0) return null;
    const sum = points.reduce((acc, point) => [acc[0] + point[0], acc[1] + point[1]], [0, 0]);
    return [sum[0] / points.length, sum[1] / points.length];
  }

  detectSlouch(landmarks: Array<[number, number, number?]>): PostureData {
    const posture: PostureData = {
      slouch_level: 'GOOD',
      slouching: false,
      slouch_score: 0,
      forward_head_posture: false,
      asymmetric_shoulders: false,
      spine_alignment_diff: 0
    };
    
    const lmArray = landmarks.map(lm => [lm[0], lm[1]] as [number, number]);
    
    // Get key facial landmarks for posture analysis
    const nose = lmArray[this.NOSE]; // Nose tip
    const chin = lmArray[175] || lmArray[199]; // Chin point
    const forehead = lmArray[10] || lmArray[151]; // Forehead center
    const leftCheek = lmArray[116]; // Left cheek
    const rightCheek = lmArray[345]; // Right cheek
    
    if (!nose || !chin || !forehead) {
      return posture;
    }
    
    // Calculate face orientation and head position
    let slouchScore = 0;
    const issues: string[] = [];
    
    // 1. Forward Head Posture Detection
    // Measure the forward projection of the head by comparing nose position to face center
    const faceCenterX = (leftCheek && rightCheek) 
      ? (leftCheek[0] + rightCheek[0]) / 2 
      : nose[0];
    const faceCenterY = (forehead && chin) 
      ? (forehead[1] + chin[1]) / 2 
      : nose[1];
    
    // Forward head is detected when nose is significantly forward of the face center
    // In normalized coordinates, we check the vertical position difference
    const verticalHeadPosition = Math.abs(nose[1] - faceCenterY);
    const horizontalHeadPosition = Math.abs(nose[0] - faceCenterX);
    
    // If head is too far down (high Y value) relative to face center, it indicates slouching
    const headDownAngle = nose[1] - forehead[1]; // Positive means head is tilted down
    const forwardHeadThreshold = 0.05; // 5% of frame height
    const isForwardHead = headDownAngle > forwardHeadThreshold || verticalHeadPosition > 0.08;
    
    if (isForwardHead) {
      slouchScore += 40;
      issues.push('forward_head');
    }
    
    // 2. Head Tilt Detection (asymmetric posture)
    // Check if the face is tilted by comparing left and right facial features
    if (leftCheek && rightCheek && forehead && chin) {
      // Check vertical alignment of facial features (eye level)
      // Use eye corner landmarks for better detection
      const leftEyeOuter = lmArray[33]; // Left eye outer corner
      const rightEyeOuter = lmArray[263]; // Right eye outer corner
      
      if (leftEyeOuter && rightEyeOuter) {
        const eyeLevelDiff = Math.abs(leftEyeOuter[1] - rightEyeOuter[1]);
        // In normalized coordinates, significant difference indicates head tilt
        if (eyeLevelDiff > 0.03) { // 3% difference indicates tilt
          posture.asymmetric_shoulders = true; // Indicates asymmetric posture
          slouchScore += 25;
          issues.push('head_tilt');
        }
      }
      
      // Also check cheek symmetry for additional posture detection
      if (leftCheek && rightCheek) {
        const cheekLevelDiff = Math.abs(leftCheek[1] - rightCheek[1]);
        if (cheekLevelDiff > 0.04) {
          slouchScore += 15;
          if (!posture.asymmetric_shoulders) {
            posture.asymmetric_shoulders = true;
          }
        }
      }
    }
    
    // 3. Neck Angle Detection (using chin to nose angle)
    // A good posture has the chin relatively aligned with the neck area
    // If chin is too forward or too far back, it indicates poor posture
    if (chin && nose) {
      const chinNoseDistance = this.calculateDistance(chin, nose);
      const chinNoseAngle = Math.atan2(chin[1] - nose[1], Math.abs(chin[0] - nose[0]));
      
      // Poor posture: chin too far down or forward
      const chinForwardThreshold = 0.04;
      if (chin[1] - nose[1] > chinForwardThreshold) {
        slouchScore += 20;
        issues.push('chin_forward');
      }
    }
    
    // 4. Overall Face Alignment
    // Check if face is centered and upright
    const faceVerticalAlignment = Math.abs(faceCenterX - 0.5); // 0.5 is center in normalized coords
    if (faceVerticalAlignment > 0.15) {
      slouchScore += 15;
      issues.push('face_off_center');
    }
    
    // Calculate spine alignment approximation (using face verticality)
    const faceVertical = Math.abs(forehead[1] - chin[1]);
    const faceHorizontal = Math.abs(leftCheek && rightCheek ? rightCheek[0] - leftCheek[0] : 0);
    const faceAspectRatio = faceVertical / (faceHorizontal + 0.01);
    
    // If face is too horizontally elongated, it might indicate leaning
    if (faceAspectRatio < 1.1) {
      slouchScore += 10;
      issues.push('face_rotation');
    }
    
    posture.spine_alignment_diff = Math.abs(faceVerticalAlignment * 100); // Percentage
    
    // Normalize slouch score to 0-100
    slouchScore = Math.min(100, Math.max(0, slouchScore));
    
    // Determine slouch level based on score
    if (slouchScore >= 70) {
      posture.slouch_level = 'SEVERE';
      posture.slouching = true;
    } else if (slouchScore >= 50) {
      posture.slouch_level = 'MODERATE';
      posture.slouching = true;
    } else if (slouchScore >= 30) {
      posture.slouch_level = 'MILD';
      posture.slouching = true;
    } else {
      posture.slouch_level = 'GOOD';
      posture.slouching = false;
    }
    
    posture.slouch_score = slouchScore;
    posture.forward_head_posture = isForwardHead;
    
    return posture;
  }

  drawFaceMesh(ctx: CanvasRenderingContext2D, landmarks: Array<[number, number, number?]>, canvasWidth: number, canvasHeight: number): void {
    const lmArray = landmarks.map(lm => [lm[0] * canvasWidth, lm[1] * canvasHeight]);
    
    // Draw face outline
    const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];
    
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    if (faceOval.length > 0 && lmArray[faceOval[0]]) {
      ctx.moveTo(lmArray[faceOval[0]][0], lmArray[faceOval[0]][1]);
      
      for (let i = 1; i < faceOval.length; i++) {
        if (lmArray[faceOval[i]]) {
          ctx.lineTo(lmArray[faceOval[i]][0], lmArray[faceOval[i]][1]);
        }
      }
      ctx.stroke();
    }
  }

  displayExpressions(ctx: CanvasRenderingContext2D, expressions: ExpressionData): void {
    let yOffset = 30;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#00FF00';
    
    for (const [key, value] of Object.entries(expressions)) {
      let text: string;
      if (typeof value === 'boolean') {
        text = `${key}: ${value ? 'YES' : 'NO'}`;
      } else {
        text = `${key}: ${value.toFixed(2)}`;
      }
      ctx.fillText(text, 10, yOffset);
      yOffset += 25;
    }
  }

  displayPosture(ctx: CanvasRenderingContext2D, posture: PostureData): void {
    let yOffset = 180;
    
    // Color based on slouch level
    let color: string;
    if (posture.slouch_level === 'GOOD') {
      color = '#00FF00'; // Green
    } else if (posture.slouch_level === 'MILD') {
      color = '#FFFF00'; // Yellow
    } else if (posture.slouch_level === 'MODERATE') {
      color = '#FFA500'; // Orange
    } else {
      color = '#FF0000'; // Red
    }
    
    ctx.fillStyle = color;
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`POSTURE: ${posture.slouch_level}`, 10, yOffset);
    
    yOffset += 35;
    ctx.font = '16px Arial';
    ctx.fillText(`Slouch Score: ${posture.slouch_score.toFixed(0)}/100`, 10, yOffset);
    
    yOffset += 25;
    const forwardHeadText = posture.forward_head_posture ? 'Forward Head: YES' : 'Forward Head: NO';
    ctx.fillText(forwardHeadText, 10, yOffset);
    
    yOffset += 25;
    const asymmetricText = posture.asymmetric_shoulders ? 'Asymmetric: YES' : 'Asymmetric: NO';
    ctx.fillText(asymmetricText, 10, yOffset);
  }

  async run(
    videoElement: HTMLVideoElement, 
    canvasElement: HTMLCanvasElement,
    onDetection?: (expressions: ExpressionData, posture: PostureData) => void
  ): Promise<void> {
    if (!this.detector) {
      const initialized = await this.initialize();
      if (!initialized) {
        console.error('Failed to initialize face detector');
        return;
      }
    }
    
    if (!this.detector) return;
    
    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }
    
    this.isRunning = true;
    
    const detectFrame = async () => {
      if (!this.isRunning || !this.detector || !ctx) return;
      
      // Get actual video dimensions
      const videoWidth = videoElement.videoWidth || 640;
      const videoHeight = videoElement.videoHeight || 480;
      
      // Set canvas size to match video display size (not video stream size to prevent scaling blur)
      // Use the video element's client dimensions for display
      const displayWidth = videoElement.clientWidth || videoWidth;
      const displayHeight = videoElement.clientHeight || videoHeight;
      
      // Set canvas size to match display size
      if (canvasElement.width !== displayWidth || canvasElement.height !== displayHeight) {
        canvasElement.width = displayWidth;
        canvasElement.height = displayHeight;
      }
      
      // Clear canvas - don't draw video frame, only overlay
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      // Use high quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      try {
        // Detect face landmarks - try different API patterns
        let predictions: any;
        
        try {
          // Try newer API with object parameter
          predictions = await (this.detector as any).estimateFaces({
            input: videoElement,
            flipHorizontal: false,
            staticImageMode: false
          });
        } catch (e1) {
          try {
            // Try older API with direct element
            predictions = await (this.detector as any).estimateFaces(videoElement);
          } catch (e2) {
            console.error('Face detection failed:', e2);
            requestAnimationFrame(detectFrame);
            return;
          }
        }
        
        if (predictions && predictions.length > 0) {
          // Handle different response formats
          const face = predictions[0];
          let keypoints: Array<{ x: number; y: number; z?: number }>;
          
          if (face.keypoints) {
            keypoints = face.keypoints;
          } else if (face.scaledMesh) {
            keypoints = face.scaledMesh;
          } else if (Array.isArray(face.landmarks)) {
            keypoints = face.landmarks;
          } else {
            keypoints = [];
          }
          
          if (keypoints.length > 0) {
            // Normalize keypoints to [0, 1] range if needed
            const landmarks = keypoints.map(kp => {
              let x = kp.x;
              let y = kp.y;
              // Normalize if values are in pixel coordinates
              if (kp.x > 1 || kp.y > 1) {
                x = kp.x / videoElement.videoWidth;
                y = kp.y / videoElement.videoHeight;
              }
              const z = kp.z || 0;
              return [x, y, z] as [number, number, number?];
            });
          
            // Draw face mesh overlay only (not the video frame)
            // Landmarks are in normalized [0,1] coordinates, drawFaceMesh will scale them
            this.drawFaceMesh(ctx, landmarks, canvasElement.width, canvasElement.height);
            
            // Detect expressions
            const expressions = this.detectExpressions(landmarks);
            
            // Detect slouch
            const posture = this.detectSlouch(landmarks);
            
            // Display info (optional - can be removed if not needed visually)
            // this.displayExpressions(ctx, expressions);
            // this.displayPosture(ctx, posture);
            
            // Callback with detection data
            if (onDetection) {
              onDetection(expressions, posture);
            }
          }
        }
      } catch (error) {
        console.error('Error during detection:', error);
      }
      
      if (this.isRunning) {
        requestAnimationFrame(detectFrame);
      }
    };
    
    detectFrame();
  }

  stop(): void {
    this.isRunning = false;
  }

  isDetectorReady(): boolean {
    return this.detector !== null;
  }
}

// Export singleton instance
export const facialExpressionDetector = new FacialExpressionDetector();
export default facialExpressionDetector;

