/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface BoundingBox {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export interface EyeLandmarks {
  leftEye: NormalizedLandmark[];
  rightEye: NormalizedLandmark[];
  leftEyeCenter: NormalizedLandmark;
  rightEyeCenter: NormalizedLandmark;
  leftEyeDetected: boolean;
  rightEyeDetected: boolean;
}

export interface FaceDetectionData {
  boundingBox: BoundingBox;
  landmarks: NormalizedLandmark[];
  center: NormalizedLandmark;
  confidence: number;
  eyes: EyeLandmarks;
}

export type FingerName = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';

export interface FingerStatus {
  name: FingerName;
  label: string;
  isExtended: boolean;
  tipLandmark: NormalizedLandmark;
  mcpLandmark: NormalizedLandmark;
}

export interface FingerCountResult {
  count: number;
  uncertain: boolean;
  confidence: number;
  fingers: FingerStatus[];
  reason?: string;
}

export type Handedness = 'Left' | 'Right' | 'Unknown';

export interface HandDetectionData {
  handedness: Handedness;
  confidence: number;
  landmarks: NormalizedLandmark[];
  worldLandmarks?: NormalizedLandmark[];
  boundingBox: BoundingBox;
  fingerCountResult: FingerCountResult;
}

export interface VisionDetectionSummary {
  facesCount: number;
  eyesCount: number;
  handsCount: number;
  leftHandFingers: number | 'Uncertain' | null;
  rightHandFingers: number | 'Uncertain' | null;
  totalRaisedFingers: number | 'Uncertain';
  fps: number;
  inferenceTimeMs: number;
}

export interface OverlayVisibilitySettings {
  showFaceBox: boolean;
  showFaceLandmarks: boolean;
  showEyeLandmarks: boolean;
  showHandSkeleton: boolean;
  showFingerLabels: boolean;
}

export type CameraFacing = 'user' | 'environment';

export type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'stopped'
  | 'paused'
  | 'error';

export type ModelLoadingStatus =
  | 'uninitialized'
  | 'loading-wasm'
  | 'loading-face'
  | 'loading-hand'
  | 'ready'
  | 'error';

export interface CameraErrorDetails {
  type: 'permission' | 'notFound' | 'unsupported' | 'inUse' | 'unknown';
  message: string;
}
