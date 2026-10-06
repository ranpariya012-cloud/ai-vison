/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FaceDetectionData,
  HandDetectionData,
  OverlayVisibilitySettings,
  NormalizedLandmark,
} from '../types/vision';
import {
  FACE_OVAL_INDICES,
  LEFT_EYE_INDICES,
  RIGHT_EYE_INDICES,
  LIPS_INDICES,
  NOSE_BRIDGE_INDICES,
  HAND_CONNECTIONS,
} from './landmarks';

interface DrawOptions {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  isMirrored: boolean;
  faces: FaceDetectionData[];
  hands: HandDetectionData[];
  settings: OverlayVisibilitySettings;
}

/**
 * Transforms normalized coordinate (0-1) to canvas pixel coordinate,
 * taking selfie mirroring into account.
 */
function toScreen(
  lm: NormalizedLandmark,
  width: number,
  height: number,
  isMirrored: boolean
): { x: number; y: number } {
  const normX = isMirrored ? 1 - lm.x : lm.x;
  return {
    x: normX * width,
    y: lm.y * height,
  };
}

/**
 * Renders all detection overlays to the 2D canvas context
 */
export function renderDetections({
  ctx,
  width,
  height,
  isMirrored,
  faces,
  hands,
  settings,
}: DrawOptions): void {
  ctx.clearRect(0, 0, width, height);

  // 1. RENDER FACES
  for (const face of faces) {
    const { boundingBox, landmarks, center, confidence, eyes } = face;

    // Face Bounding Box
    if (settings.showFaceBox) {
      const minX = isMirrored ? 1 - (boundingBox.originX + boundingBox.width) : boundingBox.originX;
      const boxX = minX * width;
      const boxY = boundingBox.originY * height;
      const boxW = boundingBox.width * width;
      const boxH = boundingBox.height * height;

      // Cyan futuristic tech border
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.75)'; // cyan-500
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.setLineDash([]);

      // Corner accent brackets
      const bracketLen = Math.min(24, boxW * 0.2, boxH * 0.2);
      ctx.strokeStyle = '#22d3ee'; // cyan-400
      ctx.lineWidth = 2.5;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(boxX, boxY + bracketLen);
      ctx.lineTo(boxX, boxY);
      ctx.lineTo(boxX + bracketLen, boxY);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(boxX + boxW - bracketLen, boxY);
      ctx.lineTo(boxX + boxW, boxY);
      ctx.lineTo(boxX + boxW, boxY + bracketLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(boxX, boxY + boxH - bracketLen);
      ctx.lineTo(boxX, boxY + boxH);
      ctx.lineTo(boxX + bracketLen, boxY + boxH);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(boxX + boxW - bracketLen, boxY + boxH);
      ctx.lineTo(boxX + boxW, boxY + boxH);
      ctx.lineTo(boxX + boxW, boxY + boxH - bracketLen);
      ctx.stroke();

      // Face label badge
      const confPct = Math.round(confidence * 100);
      const labelText = `Face · ${confPct}%`;
      ctx.font = '600 11px "JetBrains Mono", monospace';
      const textMetrics = ctx.measureText(labelText);
      const badgeW = textMetrics.width + 12;
      const badgeH = 18;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(boxX, Math.max(0, boxY - badgeH - 2), badgeW, badgeH);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, Math.max(0, boxY - badgeH - 2), badgeW, badgeH);

      ctx.fillStyle = '#67e8f9';
      ctx.fillText(labelText, boxX + 6, Math.max(0, boxY - badgeH - 2) + 13);

      // Face Center Target Reticle
      const centerPt = toScreen(center, width, height, isMirrored);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerPt.x, centerPt.y, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerPt.x - 9, centerPt.y);
      ctx.lineTo(centerPt.x + 9, centerPt.y);
      ctx.moveTo(centerPt.x, centerPt.y - 9);
      ctx.lineTo(centerPt.x, centerPt.y + 9);
      ctx.stroke();
      ctx.restore();
    }

    // Face Landmarks & Outline
    if (settings.showFaceLandmarks && landmarks.length > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1;

      // Draw silhouette oval
      drawPath(ctx, FACE_OVAL_INDICES, landmarks, width, height, isMirrored);
      // Draw lips outline
      drawPath(ctx, LIPS_INDICES, landmarks, width, height, isMirrored);
      // Draw nose bridge
      drawPath(ctx, NOSE_BRIDGE_INDICES, landmarks, width, height, isMirrored, false);

      // Render subtle key feature points
      ctx.fillStyle = 'rgba(103, 232, 249, 0.8)';
      const sampledIndices = [10, 152, 1, 61, 291, 168, 197, 50, 280];
      for (const idx of sampledIndices) {
        if (landmarks[idx]) {
          const pt = toScreen(landmarks[idx], width, height, isMirrored);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Eye Landmarks
    if (settings.showEyeLandmarks) {
      ctx.save();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)'; // emerald-500
      ctx.lineWidth = 1.5;

      // Left Eye
      if (eyes.leftEyeDetected) {
        drawPath(ctx, LEFT_EYE_INDICES, landmarks, width, height, isMirrored);
        const lPupil = toScreen(eyes.leftEyeCenter, width, height, isMirrored);
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(lPupil.x, lPupil.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Right Eye
      if (eyes.rightEyeDetected) {
        drawPath(ctx, RIGHT_EYE_INDICES, landmarks, width, height, isMirrored);
        const rPupil = toScreen(eyes.rightEyeCenter, width, height, isMirrored);
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(rPupil.x, rPupil.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // 2. RENDER HANDS
  for (const hand of hands) {
    const { handedness, confidence, landmarks, boundingBox, fingerCountResult } = hand;
    const handColor = handedness === 'Left' ? '#38bdf8' : '#a855f7'; // sky-400 vs purple-500
    const handGlow = handedness === 'Left' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(168, 85, 247, 0.3)';

    // Hand Bounding Box
    const minX = isMirrored ? 1 - (boundingBox.originX + boundingBox.width) : boundingBox.originX;
    const boxX = minX * width;
    const boxY = boundingBox.originY * height;
    const boxW = boundingBox.width * width;
    const boxH = boundingBox.height * height;

    ctx.save();
    ctx.strokeStyle = handColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.setLineDash([]);

    // Hand Badge (e.g. "Left Hand · 94% · 3 Extended")
    const confPct = Math.round(confidence * 100);
    const fingersTxt = fingerCountResult.uncertain
      ? 'Uncertain'
      : `${fingerCountResult.count} ${fingerCountResult.count === 1 ? 'finger' : 'fingers'}`;
    const handLabel = `${handedness} Hand · ${confPct}% · ${fingersTxt}`;

    ctx.font = '600 11px "JetBrains Mono", monospace';
    const textMetrics = ctx.measureText(handLabel);
    const badgeW = textMetrics.width + 12;
    const badgeH = 18;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(boxX, Math.max(0, boxY - badgeH - 2), badgeW, badgeH);
    ctx.strokeStyle = handColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, Math.max(0, boxY - badgeH - 2), badgeW, badgeH);

    ctx.fillStyle = handColor;
    ctx.fillText(handLabel, boxX + 6, Math.max(0, boxY - badgeH - 2) + 13);
    ctx.restore();

    // Hand Skeleton Connections
    if (settings.showHandSkeleton && landmarks.length >= 21) {
      ctx.save();
      ctx.strokeStyle = handColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
        const startLm = landmarks[startIdx];
        const endLm = landmarks[endIdx];
        if (!startLm || !endLm) continue;

        const p1 = toScreen(startLm, width, height, isMirrored);
        const p2 = toScreen(endLm, width, height, isMirrored);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Draw Joint Knots
      for (let j = 0; j < landmarks.length; j++) {
        const pt = toScreen(landmarks[j], width, height, isMirrored);
        ctx.fillStyle = j === 0 ? '#f43f5e' : '#ffffff';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, j === 0 ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = handColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Finger Labels & Status
    if (settings.showFingerLabels && fingerCountResult.fingers.length > 0) {
      ctx.save();
      ctx.font = '600 10px "JetBrains Mono", monospace';

      for (const finger of fingerCountResult.fingers) {
        const tipPt = toScreen(finger.tipLandmark, width, height, isMirrored);
        const isUp = finger.isExtended;

        const label = `${finger.label} ${isUp ? '▲' : '▼'}`;
        const labelMetrics = ctx.measureText(label);
        const labelW = labelMetrics.width + 8;
        const labelH = 16;

        // Position label slightly above fingertip
        const labelX = Math.max(4, Math.min(width - labelW - 4, tipPt.x - labelW / 2));
        const labelY = Math.max(16, tipPt.y - 12);

        // Background pill
        ctx.fillStyle = isUp
          ? 'rgba(6, 78, 59, 0.9)' // emerald-900
          : 'rgba(30, 41, 59, 0.85)'; // slate-800
        ctx.strokeStyle = isUp ? '#10b981' : '#64748b';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.roundRect(labelX, labelY - labelH + 3, labelW, labelH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isUp ? '#34d399' : '#94a3b8';
        ctx.fillText(label, labelX + 4, labelY);
      }
      ctx.restore();
    }
  }
}

function drawPath(
  ctx: CanvasRenderingContext2D,
  indices: readonly number[],
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  isMirrored: boolean,
  closePath = true
): void {
  if (indices.length === 0) return;
  const firstLm = landmarks[indices[0]];
  if (!firstLm) return;

  const firstPt = toScreen(firstLm, width, height, isMirrored);
  ctx.beginPath();
  ctx.moveTo(firstPt.x, firstPt.y);

  for (let i = 1; i < indices.length; i++) {
    const lm = landmarks[indices[i]];
    if (!lm) continue;
    const pt = toScreen(lm, width, height, isMirrored);
    ctx.lineTo(pt.x, pt.y);
  }

  if (closePath) {
    ctx.closePath();
  }
  ctx.stroke();
}
