/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Face Mesh landmark indices
export const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10
];

export const LEFT_EYE_INDICES = [
  33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33
];

export const RIGHT_EYE_INDICES = [
  362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398, 362
];

export const LIPS_INDICES = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291,
  375, 321, 405, 314, 17, 84, 181, 91, 146, 61
];

export const NOSE_TIP_INDEX = 1;
export const NOSE_BRIDGE_INDICES = [168, 6, 197, 195, 5, 4, 1, 19, 94, 2];

// Key landmarks for rapid feature visualization
export const FACE_KEY_POINTS = {
  leftEyeCenter: 159,
  rightEyeCenter: 386,
  leftEyePupil: 468, // if 478 landmarks
  rightEyePupil: 473,
  noseTip: 1,
  mouthCenter: 13,
  chin: 152,
  forehead: 10,
};

// Hand landmarks indices
export const HAND_LANDMARK = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_FINGER_MCP: 5,
  INDEX_FINGER_PIP: 6,
  INDEX_FINGER_DIP: 7,
  INDEX_FINGER_TIP: 8,
  MIDDLE_FINGER_MCP: 9,
  MIDDLE_FINGER_PIP: 10,
  MIDDLE_FINGER_DIP: 11,
  MIDDLE_FINGER_TIP: 12,
  RING_FINGER_MCP: 13,
  RING_FINGER_PIP: 14,
  RING_FINGER_DIP: 15,
  RING_FINGER_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
} as const;

export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm connections
  [5, 9], [9, 13], [13, 17], [0, 17],
];

export const FINGER_TIPS = [
  { name: 'thumb', tip: HAND_LANDMARK.THUMB_TIP, ip: HAND_LANDMARK.THUMB_IP, mcp: HAND_LANDMARK.THUMB_MCP, cmc: HAND_LANDMARK.THUMB_CMC },
  { name: 'index', tip: HAND_LANDMARK.INDEX_FINGER_TIP, dip: HAND_LANDMARK.INDEX_FINGER_DIP, pip: HAND_LANDMARK.INDEX_FINGER_PIP, mcp: HAND_LANDMARK.INDEX_FINGER_MCP },
  { name: 'middle', tip: HAND_LANDMARK.MIDDLE_FINGER_TIP, dip: HAND_LANDMARK.MIDDLE_FINGER_DIP, pip: HAND_LANDMARK.MIDDLE_FINGER_PIP, mcp: HAND_LANDMARK.MIDDLE_FINGER_MCP },
  { name: 'ring', tip: HAND_LANDMARK.RING_FINGER_TIP, dip: HAND_LANDMARK.RING_FINGER_DIP, pip: HAND_LANDMARK.RING_FINGER_PIP, mcp: HAND_LANDMARK.RING_FINGER_MCP },
  { name: 'pinky', tip: HAND_LANDMARK.PINKY_TIP, dip: HAND_LANDMARK.PINKY_DIP, pip: HAND_LANDMARK.PINKY_PIP, mcp: HAND_LANDMARK.PINKY_MCP },
] as const;
