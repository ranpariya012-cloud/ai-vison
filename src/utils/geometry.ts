/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NormalizedLandmark, BoundingBox } from '../types/vision';

/**
 * Computes 2D Euclidean distance between two normalized landmarks
 */
export function distance2D(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Computes 3D Euclidean distance between two normalized landmarks
 */
export function distance3D(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Computes bounding box from a collection of normalized landmarks
 */
export function calculateBoundingBox(
  landmarks: NormalizedLandmark[],
  padding = 0.04
): BoundingBox {
  if (landmarks.length === 0) {
    return { originX: 0, originY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const pt of landmarks) {
    if (pt.x < minX) minX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y > maxY) maxY = pt.y;
  }

  const paddedMinX = Math.max(0, minX - padding);
  const paddedMinY = Math.max(0, minY - padding);
  const paddedMaxX = Math.min(1, maxX + padding);
  const paddedMaxY = Math.min(1, maxY + padding);

  return {
    originX: paddedMinX,
    originY: paddedMinY,
    width: paddedMaxX - paddedMinX,
    height: paddedMaxY - paddedMinY,
  };
}

/**
 * Calculates centroid of a set of landmarks
 */
export function calculateCentroid(landmarks: NormalizedLandmark[]): NormalizedLandmark {
  if (landmarks.length === 0) return { x: 0.5, y: 0.5, z: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;

  for (const pt of landmarks) {
    sumX += pt.x;
    sumY += pt.y;
    sumZ += pt.z ?? 0;
  }

  const count = landmarks.length;
  return {
    x: sumX / count,
    y: sumY / count,
    z: sumZ / count,
  };
}

/**
 * Computes the angle in degrees between vector BA and vector BC at point B
 */
export function calculateAngle(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark
): number {
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v2x = c.x - b.x;
  const v2y = c.y - b.y;

  const dot = v1x * v2x + v1y * v2y;
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

  if (mag1 === 0 || mag2 === 0) return 0;
  const cosVal = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return (Math.acos(cosVal) * 180) / Math.PI;
}
