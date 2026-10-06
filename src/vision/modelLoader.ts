/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FilesetResolver,
  FaceLandmarker,
  HandLandmarker,
} from '@mediapipe/tasks-vision';
import { ModelLoadingStatus } from '../types/vision';

// Primary local assets and fallback CDN URLs
const LOCAL_WASM_PATH = '/wasm';
const CDN_WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';

const LOCAL_FACE_MODEL = '/models/face_landmarker.task';
const CDN_FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

const LOCAL_HAND_MODEL = '/models/hand_landmarker.task';
const CDN_HAND_MODEL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export interface VisionModels {
  faceLandmarker: FaceLandmarker;
  handLandmarker: HandLandmarker;
}

let cachedModels: VisionModels | null = null;
let loadingPromise: Promise<VisionModels> | null = null;

export async function loadVisionModels(
  onStatusChange?: (status: ModelLoadingStatus, message?: string) => void
): Promise<VisionModels> {
  if (cachedModels) {
    onStatusChange?.('ready', 'All AI models ready');
    return cachedModels;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      onStatusChange?.('loading-wasm', 'Initializing WebAssembly vision engine...');
      
      let visionFileset;
      try {
        visionFileset = await FilesetResolver.forVisionTasks(LOCAL_WASM_PATH);
      } catch (localWasmErr) {
        console.warn('Local WASM files failed to initialize, falling back to CDN:', localWasmErr);
        visionFileset = await FilesetResolver.forVisionTasks(CDN_WASM_PATH);
      }

      onStatusChange?.('loading-face', 'Loading Face Landmarker model...');
      
      // Determine working model path (local first, fallback to CDN)
      let faceModelPath = LOCAL_FACE_MODEL;
      try {
        const headResp = await fetch(LOCAL_FACE_MODEL, { method: 'HEAD' });
        if (!headResp.ok) faceModelPath = CDN_FACE_MODEL;
      } catch {
        faceModelPath = CDN_FACE_MODEL;
      }

      let faceLandmarker: FaceLandmarker;
      try {
        faceLandmarker = await FaceLandmarker.createFromOptions(visionFileset, {
          baseOptions: {
            modelAssetPath: faceModelPath,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 2,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
      } catch (gpuErr) {
        console.warn('FaceLandmarker GPU delegate failed, falling back to CPU:', gpuErr);
        faceLandmarker = await FaceLandmarker.createFromOptions(visionFileset, {
          baseOptions: {
            modelAssetPath: faceModelPath,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numFaces: 2,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      }

      onStatusChange?.('loading-hand', 'Loading Hand Landmarker model...');

      let handModelPath = LOCAL_HAND_MODEL;
      try {
        const headResp = await fetch(LOCAL_HAND_MODEL, { method: 'HEAD' });
        if (!headResp.ok) handModelPath = CDN_HAND_MODEL;
      } catch {
        handModelPath = CDN_HAND_MODEL;
      }

      let handLandmarker: HandLandmarker;
      try {
        handLandmarker = await HandLandmarker.createFromOptions(visionFileset, {
          baseOptions: {
            modelAssetPath: handModelPath,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      } catch (gpuErr) {
        console.warn('HandLandmarker GPU delegate failed, falling back to CPU:', gpuErr);
        handLandmarker = await HandLandmarker.createFromOptions(visionFileset, {
          baseOptions: {
            modelAssetPath: handModelPath,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      }

      onStatusChange?.('ready', 'All AI models ready');

      cachedModels = { faceLandmarker, handLandmarker };
      return cachedModels;
    } catch (error) {
      console.error('Failed to load MediaPipe vision models:', error);
      onStatusChange?.('error', error instanceof Error ? error.message : 'AI vision model could not be loaded.');
      loadingPromise = null;
      throw error;
    }
  })();

  return loadingPromise;
}
