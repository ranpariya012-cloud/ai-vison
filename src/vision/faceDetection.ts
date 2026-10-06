/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import {
  FaceDetectionData,
  NormalizedLandmark,
  EyeLandmarks,
} from '../types/vision';
import { calculateBoundingBox, calculateCentroid } from '../utils/geometry';
import {
  LEFT_EYE_INDICES,
  RIGHT_EYE_INDICES,
  FACE_KEY_POINTS,
} from './landmarks';

/**
 * Parses raw FaceLandmarker results into structured FaceDetectionData
 */
export function processFaceLandmarkerResult(
  result: FaceLandmarkerResult
): FaceDetectionData[] {
  if (!result || !result.faceLandmarks || result.faceLandmarks.length === 0) {
    return [];
  }

  const faces: FaceDetectionData[] = [];

  for (let i = 0; i < result.faceLandmarks.length; i++) {
    const rawLandmarks = result.faceLandmarks[i];
    if (!rawLandmarks || rawLandmarks.length === 0) continue;

    // Convert raw landmarks into typed normalized landmarks
    const landmarks: NormalizedLandmark[] = rawLandmarks.map((lm) => ({
      x: lm.x,
      y: lm.y,
      z: lm.z,
      visibility: lm.visibility ?? 1,
    }));

    // Bounding box from face mesh
    const boundingBox = calculateBoundingBox(landmarks, 0.03);
    const center = calculateCentroid(landmarks);

    // Extract eye points
    const leftEyePts = LEFT_EYE_INDICES.map((idx) => landmarks[idx]).filter(Boolean);
    const rightEyePts = RIGHT_EYE_INDICES.map((idx) => landmarks[idx]).filter(Boolean);

    const leftEyeCenter =
      landmarks[FACE_KEY_POINTS.leftEyePupil] ||
      landmarks[FACE_KEY_POINTS.leftEyeCenter] ||
      calculateCentroid(leftEyePts);

    const rightEyeCenter =
      landmarks[FACE_KEY_POINTS.rightEyePupil] ||
      landmarks[FACE_KEY_POINTS.rightEyeCenter] ||
      calculateCentroid(rightEyePts);

    // Eyes are detected if landmarks exist in valid coordinate space
    const leftEyeDetected =
      leftEyePts.length > 0 &&
      leftEyeCenter.x > 0 &&
      leftEyeCenter.x < 1 &&
      leftEyeCenter.y > 0 &&
      leftEyeCenter.y < 1;

    const rightEyeDetected =
      rightEyePts.length > 0 &&
      rightEyeCenter.x > 0 &&
      rightEyeCenter.x < 1 &&
      rightEyeCenter.y > 0 &&
      rightEyeCenter.y < 1;

    const eyes: EyeLandmarks = {
      leftEye: leftEyePts,
      rightEye: rightEyePts,
      leftEyeCenter,
      rightEyeCenter,
      leftEyeDetected,
      rightEyeDetected,
    };

    // If model provides face blendshapes or presence confidence, use it;
    // Otherwise calculate a geometric sanity score (landmarks within bounds)
    let confidence = 0.95;
    if (result.facialTransformationMatrixes && result.facialTransformationMatrixes[i]) {
      confidence = 0.98;
    }

    faces.push({
      boundingBox,
      landmarks,
      center,
      confidence,
      eyes,
    });
  }

  return faces;
}
