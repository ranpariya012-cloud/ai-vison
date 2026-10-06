/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  FaceDetectionData,
  HandDetectionData,
  VisionDetectionSummary,
  OverlayVisibilitySettings,
  ModelLoadingStatus,
} from '../types/vision';
import { loadVisionModels, VisionModels } from '../vision/modelLoader';
import { processFaceLandmarkerResult } from '../vision/faceDetection';
import { processHandLandmarkerResult } from '../vision/handDetection';
import { renderDetections } from '../vision/drawing';

interface UseVisionDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  isFrontCamera: boolean;
  overlaySettings: OverlayVisibilitySettings;
}

export function useVisionDetection({
  videoRef,
  canvasRef,
  isCameraActive,
  isFrontCamera,
  overlaySettings,
}: UseVisionDetectionProps) {
  const [modelStatus, setModelStatus] = useState<ModelLoadingStatus>('uninitialized');
  const [modelStatusMessage, setModelStatusMessage] = useState('Initializing AI models...');
  const [isPaused, setIsPaused] = useState(false);

  // Throttled summary state for React UI dashboard
  const [summary, setSummary] = useState<VisionDetectionSummary>({
    facesCount: 0,
    eyesCount: 0,
    handsCount: 0,
    leftHandFingers: null,
    rightHandFingers: null,
    totalRaisedFingers: 0,
    fps: 0,
    inferenceTimeMs: 0,
  });

  const [detectedFaces, setDetectedFaces] = useState<FaceDetectionData[]>([]);
  const [detectedHands, setDetectedHands] = useState<HandDetectionData[]>([]);

  const modelsRef = useRef<VisionModels | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const lastUiUpdateRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsCalcRef = useRef<number>(performance.now());
  const currentFpsRef = useRef<number>(0);

  // Keep latest props in refs to avoid restarting detection loop
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const isFrontCameraRef = useRef(isFrontCamera);
  isFrontCameraRef.current = isFrontCamera;

  const overlaySettingsRef = useRef(overlaySettings);
  overlaySettingsRef.current = overlaySettings;

  // Initialize models once on mount
  useEffect(() => {
    let isCancelled = false;

    async function init() {
      try {
        const models = await loadVisionModels((status, msg) => {
          if (!isCancelled) {
            setModelStatus(status);
            if (msg) setModelStatusMessage(msg);
          }
        });
        if (!isCancelled) {
          modelsRef.current = models;
          setModelStatus('ready');
          setModelStatusMessage('All AI models ready');
        }
      } catch (err) {
        if (!isCancelled) {
          setModelStatus('error');
          setModelStatusMessage(
            err instanceof Error ? err.message : 'AI vision model could not be loaded.'
          );
        }
      }
    }

    init();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Detection loop
  const runDetectionLoop = useCallback(() => {
    if (!isRunningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const models = modelsRef.current;

    if (
      video &&
      canvas &&
      models &&
      video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      !video.paused &&
      !video.ended &&
      !isPausedRef.current
    ) {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      if (videoWidth > 0 && videoHeight > 0) {
        // Sync canvas resolution with actual video stream resolution
        if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
          canvas.width = videoWidth;
          canvas.height = videoHeight;
        }

        const ctx = canvas.getContext('2d', { alpha: true });
        if (ctx) {
          const startTime = performance.now();
          const timestamp = performance.now();

          // 1. Run Face Landmarker
          let faces: FaceDetectionData[] = [];
          try {
            const faceResult = models.faceLandmarker.detectForVideo(video, timestamp);
            faces = processFaceLandmarkerResult(faceResult);
          } catch (e) {
            // Transient frame detection error (e.g. timestamp monotonicity)
          }

          // 2. Run Hand Landmarker
          let hands: HandDetectionData[] = [];
          try {
            const handResult = models.handLandmarker.detectForVideo(video, timestamp);
            hands = processHandLandmarkerResult(handResult, isFrontCameraRef.current);
          } catch (e) {
            // Transient frame detection error
          }

          const inferenceDuration = performance.now() - startTime;

          // 3. Render Canvas Overlays
          renderDetections({
            ctx,
            width: videoWidth,
            height: videoHeight,
            isMirrored: isFrontCameraRef.current,
            faces,
            hands,
            settings: overlaySettingsRef.current,
          });

          // FPS calculation
          frameCountRef.current++;
          const now = performance.now();
          if (now - lastFpsCalcRef.current >= 1000) {
            currentFpsRef.current = Math.round(
              (frameCountRef.current * 1000) / (now - lastFpsCalcRef.current)
            );
            frameCountRef.current = 0;
            lastFpsCalcRef.current = now;
          }

          // Throttle React state updates to ~15 Hz (every 66ms) to keep UI ultra smooth
          if (now - lastUiUpdateRef.current >= 66) {
            lastUiUpdateRef.current = now;

            // Calculate eye count
            let totalEyes = 0;
            for (const face of faces) {
              if (face.eyes.leftEyeDetected) totalEyes++;
              if (face.eyes.rightEyeDetected) totalEyes++;
            }

            // Calculate finger totals
            let leftHandCount: number | 'Uncertain' | null = null;
            let rightHandCount: number | 'Uncertain' | null = null;
            let hasUncertainHand = false;
            let totalRaised = 0;

            for (const hand of hands) {
              if (hand.fingerCountResult.uncertain) {
                hasUncertainHand = true;
                if (hand.handedness === 'Left') leftHandCount = 'Uncertain';
                if (hand.handedness === 'Right') rightHandCount = 'Uncertain';
              } else {
                totalRaised += hand.fingerCountResult.count;
                if (hand.handedness === 'Left') leftHandCount = hand.fingerCountResult.count;
                if (hand.handedness === 'Right') rightHandCount = hand.fingerCountResult.count;
              }
            }

            const totalRaisedDisplay: number | 'Uncertain' = hasUncertainHand
              ? 'Uncertain'
              : totalRaised;

            setSummary({
              facesCount: faces.length,
              eyesCount: totalEyes,
              handsCount: hands.length,
              leftHandFingers: leftHandCount,
              rightHandFingers: rightHandCount,
              totalRaisedFingers: hands.length > 0 ? totalRaisedDisplay : 0,
              fps: currentFpsRef.current,
              inferenceTimeMs: Math.round(inferenceDuration),
            });

            setDetectedFaces(faces);
            setDetectedHands(hands);
          }
        }
      }
    } else if (isPausedRef.current && canvas) {
      // If paused, keep whatever was last rendered or clear if camera stopped
    }

    if (isRunningRef.current) {
      animFrameIdRef.current = requestAnimationFrame(runDetectionLoop);
    }
  }, [videoRef, canvasRef]);

  // Start / Stop detection loop based on camera status and model readiness
  useEffect(() => {
    if (isCameraActive && modelStatus === 'ready') {
      isRunningRef.current = true;
      animFrameIdRef.current = requestAnimationFrame(runDetectionLoop);
    } else {
      isRunningRef.current = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      // Clear canvas if camera is not active
      if (!isCameraActive && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    return () => {
      isRunningRef.current = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isCameraActive, modelStatus, runDetectionLoop, canvasRef]);

  const pauseDetection = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeDetection = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resetDetection = useCallback(() => {
    setIsPaused(false);
    setSummary({
      facesCount: 0,
      eyesCount: 0,
      handsCount: 0,
      leftHandFingers: null,
      rightHandFingers: null,
      totalRaisedFingers: 0,
      fps: 0,
      inferenceTimeMs: 0,
    });
    setDetectedFaces([]);
    setDetectedHands([]);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [canvasRef]);

  return {
    modelStatus,
    modelStatusMessage,
    isPaused,
    summary,
    detectedFaces,
    detectedHands,
    pauseDetection,
    resumeDetection,
    resetDetection,
  };
}
