/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import {
  HandDetectionData,
  NormalizedLandmark,
  Handedness,
} from '../types/vision';
import { calculateBoundingBox } from '../utils/geometry';
import { calculateRaisedFingers } from './fingerCounting';

/**
 * Processes HandLandmarkerResult into structured HandDetectionData
 * Accounts for camera mirroring so user sees their actual anatomical hand labeled
 */
export function processHandLandmarkerResult(
  result: HandLandmarkerResult,
  isFrontCamera = true
): HandDetectionData[] {
  if (!result || !result.landmarks || result.landmarks.length === 0) {
    return [];
  }

  const hands: HandDetectionData[] = [];

  for (let i = 0; i < result.landmarks.length; i++) {
    const rawLandmarks = result.landmarks[i];
    if (!rawLandmarks || rawLandmarks.length === 0) continue;

    const landmarks: NormalizedLandmark[] = rawLandmarks.map((lm) => ({
      x: lm.x,
      y: lm.y,
      z: lm.z,
      visibility: lm.visibility ?? 1,
    }));

    // Bounding box from hand landmarks
    const boundingBox = calculateBoundingBox(landmarks, 0.04);

    // Extract handedness and confidence score
    let rawHandedness = 'Unknown';
    let confidence = 0.9;

    if (result.handednesses && result.handednesses[i] && result.handednesses[i][0]) {
      const category = result.handednesses[i][0];
      rawHandedness = category.displayName || category.categoryName || 'Unknown';
      confidence = category.score ?? 0.9;
    }

    // MediaPipe HandLandmarker handedness is determined assuming an unmirrored input image.
    // For front camera mirrored view, if MediaPipe says "Left", from user's perspective it's actually their Left hand
    // (since selfie flip swaps perceived left and right). MediaPipe's raw classification accounts for camera view.
    let handedness: Handedness = 'Unknown';
    if (rawHandedness === 'Left' || rawHandedness === 'Right') {
      // In front camera selfie mode, flip classification so the user's anatomical hand matches the label
      if (isFrontCamera) {
        handedness = rawHandedness === 'Left' ? 'Right' : 'Left';
      } else {
        handedness = rawHandedness as Handedness;
      }
    }

    // Calculate raised fingers with geometry
    const fingerCountResult = calculateRaisedFingers(
      landmarks,
      handedness,
      confidence
    );

    hands.push({
      handedness,
      confidence,
      landmarks,
      boundingBox,
      fingerCountResult,
    });
  }

  return hands;
}
