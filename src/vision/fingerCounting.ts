/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  NormalizedLandmark,
  FingerStatus,
  FingerCountResult,
  Handedness,
} from '../types/vision';
import { distance2D } from '../utils/geometry';
import { HAND_LANDMARK } from './landmarks';

/**
 * Calculates whether each finger is extended and the total raised finger count.
 * Accounts for 3D hand orientation, palm facing direction, and camera geometry.
 */
export function calculateRaisedFingers(
  landmarks: NormalizedLandmark[],
  handedness: Handedness,
  handConfidence = 1.0
): FingerCountResult {
  if (!landmarks || landmarks.length < 21) {
    return {
      count: 0,
      uncertain: true,
      confidence: 0,
      fingers: [],
      reason: 'Insufficient landmarks',
    };
  }

  // Check if hand is substantially clipped by the frame edges
  const wrist = landmarks[HAND_LANDMARK.WRIST];
  const indexMcp = landmarks[HAND_LANDMARK.INDEX_FINGER_MCP];
  const middleMcp = landmarks[HAND_LANDMARK.MIDDLE_FINGER_MCP];
  const ringMcp = landmarks[HAND_LANDMARK.RING_FINGER_MCP];
  const pinkyMcp = landmarks[HAND_LANDMARK.PINKY_MCP];

  // Palm dimension scale
  const palmScale = distance2D(wrist, middleMcp);
  if (palmScale < 0.04) {
    return {
      count: 0,
      uncertain: true,
      confidence: handConfidence,
      fingers: [],
      reason: 'Hand too far or too small to resolve',
    };
  }

  // Check boundary clipping on critical landmarks
  const criticalIndices = [
    HAND_LANDMARK.WRIST,
    HAND_LANDMARK.THUMB_TIP,
    HAND_LANDMARK.INDEX_FINGER_TIP,
    HAND_LANDMARK.MIDDLE_FINGER_TIP,
    HAND_LANDMARK.RING_FINGER_TIP,
    HAND_LANDMARK.PINKY_TIP,
  ];

  let boundaryClipped = false;
  for (const idx of criticalIndices) {
    const pt = landmarks[idx];
    if (pt.x < 0.01 || pt.x > 0.99 || pt.y < 0.01 || pt.y > 0.99) {
      boundaryClipped = true;
      break;
    }
  }

  if (boundaryClipped && handConfidence < 0.65) {
    return {
      count: 0,
      uncertain: true,
      confidence: handConfidence,
      fingers: [],
      reason: 'Hand partially outside camera frame',
    };
  }

  // Palm direction determination:
  // Vector from wrist to index MCP vs vector from wrist to pinky MCP
  const vWristToIndex = { x: indexMcp.x - wrist.x, y: indexMcp.y - wrist.y };
  const vWristToPinky = { x: pinkyMcp.x - wrist.x, y: pinkyMcp.y - wrist.y };
  
  // 2D cross product sign indicates palm facing camera vs facing away
  const crossZ = vWristToIndex.x * vWristToPinky.y - vWristToIndex.y * vWristToPinky.x;
  // If crossZ > 0 and right hand, palm is facing forward.
  const isPalmFacingForward = handedness === 'Right' ? crossZ > 0 : crossZ < 0;

  // Evaluate the four standard fingers: Index, Middle, Ring, Pinky
  const fingerDefinitions = [
    {
      name: 'index' as const,
      label: 'Index',
      tip: HAND_LANDMARK.INDEX_FINGER_TIP,
      dip: HAND_LANDMARK.INDEX_FINGER_DIP,
      pip: HAND_LANDMARK.INDEX_FINGER_PIP,
      mcp: HAND_LANDMARK.INDEX_FINGER_MCP,
    },
    {
      name: 'middle' as const,
      label: 'Middle',
      tip: HAND_LANDMARK.MIDDLE_FINGER_TIP,
      dip: HAND_LANDMARK.MIDDLE_FINGER_DIP,
      pip: HAND_LANDMARK.MIDDLE_FINGER_PIP,
      mcp: HAND_LANDMARK.MIDDLE_FINGER_MCP,
    },
    {
      name: 'ring' as const,
      label: 'Ring',
      tip: HAND_LANDMARK.RING_FINGER_TIP,
      dip: HAND_LANDMARK.RING_FINGER_DIP,
      pip: HAND_LANDMARK.RING_FINGER_PIP,
      mcp: HAND_LANDMARK.RING_FINGER_MCP,
    },
    {
      name: 'pinky' as const,
      label: 'Pinky',
      tip: HAND_LANDMARK.PINKY_TIP,
      dip: HAND_LANDMARK.PINKY_DIP,
      pip: HAND_LANDMARK.PINKY_PIP,
      mcp: HAND_LANDMARK.PINKY_MCP,
    },
  ];

  const fingerStatuses: FingerStatus[] = [];

  for (const finger of fingerDefinitions) {
    const tip = landmarks[finger.tip];
    const pip = landmarks[finger.pip];
    const dip = landmarks[finger.dip];
    const mcp = landmarks[finger.mcp];

    const distTipToWrist = distance2D(tip, wrist);
    const distPipToWrist = distance2D(pip, wrist);
    const distTipToMcp = distance2D(tip, mcp);
    const distPipToMcp = distance2D(pip, mcp);

    // Primary condition: tip is further from wrist than PIP
    // Secondary condition: tip is substantially extended beyond MCP compared to PIP
    const isDistExtended = distTipToWrist > distPipToWrist * 1.12 && distTipToMcp > distPipToMcp * 1.15;
    
    // Joint alignment vector check: is tip beyond dip in direction of mcp -> pip?
    const vMcpPip = { x: pip.x - mcp.x, y: pip.y - mcp.y };
    const vPipTip = { x: tip.x - pip.x, y: tip.y - pip.y };
    const dotProduct = vMcpPip.x * vPipTip.x + vMcpPip.y * vPipTip.y;
    const isDirectionConsistent = dotProduct > 0;

    const isExtended = isDistExtended && isDirectionConsistent;

    fingerStatuses.push({
      name: finger.name,
      label: finger.label,
      isExtended,
      tipLandmark: tip,
      mcpLandmark: mcp,
    });
  }

  // Thumb evaluation:
  // Thumb motion is abduction/adduction and flexion across palm.
  const thumbTip = landmarks[HAND_LANDMARK.THUMB_TIP];
  const thumbIp = landmarks[HAND_LANDMARK.THUMB_IP];
  const thumbMcp = landmarks[HAND_LANDMARK.THUMB_MCP];
  const thumbCmc = landmarks[HAND_LANDMARK.THUMB_CMC];

  // Distance from thumb tip to pinky base (when tucked in, this distance shrinks)
  const distThumbTipToPinkyMcp = distance2D(thumbTip, pinkyMcp);
  const distThumbTipToWrist = distance2D(thumbTip, wrist);
  const distThumbIpToWrist = distance2D(thumbIp, wrist);
  const distThumbMcpToWrist = distance2D(thumbMcp, wrist);

  // Distance of palm span (Index MCP to Pinky MCP)
  const palmSpan = distance2D(indexMcp, pinkyMcp);

  // A thumb is extended when:
  // 1. Thumb tip is extended away from wrist relative to thumb IP and MCP
  // 2. Thumb tip is far from the base of the other fingers (not folded across palm)
  const thumbDistanceRatio = distThumbTipToPinkyMcp / (palmSpan || 0.1);
  const thumbRadialExtension = distThumbTipToWrist > distThumbIpToWrist * 1.06;
  const thumbTipToMcpDist = distance2D(thumbTip, thumbMcp);
  const thumbCmcToMcpDist = distance2D(thumbCmc, thumbMcp);
  const thumbUncurled = thumbTipToMcpDist > thumbCmcToMcpDist * 0.95;

  const isThumbExtended =
    thumbRadialExtension &&
    thumbUncurled &&
    thumbDistanceRatio > 1.15;

  fingerStatuses.unshift({
    name: 'thumb',
    label: 'Thumb',
    isExtended: isThumbExtended,
    tipLandmark: thumbTip,
    mcpLandmark: thumbMcp,
  });

  const count = fingerStatuses.filter((f) => f.isExtended).length;

  return {
    count,
    uncertain: false,
    confidence: handConfidence,
    fingers: fingerStatuses,
  };
}
