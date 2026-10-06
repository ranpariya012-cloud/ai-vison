/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CameraFacing, CameraErrorDetails } from '../types/vision';

/**
 * Checks if the browser supports camera access
 */
export function isCameraSupported(): boolean {
  return !!(
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

/**
 * Requests media stream with fallback resolutions
 */
export async function getCameraStream(
  facingMode: CameraFacing = 'user'
): Promise<MediaStream> {
  if (!isCameraSupported()) {
    throw new Error('UNSUPPORTED_BROWSER');
  }

  // Attempt 720p 16:9 / 4:3 high quality first, then standard fallback
  const constraintsList: MediaStreamConstraints[] = [
    {
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30, max: 60 },
      },
      audio: false,
    },
    {
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    },
    {
      video: {
        facingMode: facingMode,
      },
      audio: false,
    },
    {
      video: true,
      audio: false,
    },
  ];

  let lastError: unknown = null;

  for (const constraints of constraintsList) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (err) {
      lastError = err;
      // If permission was denied, do not keep trying looser constraints
      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('FAILED_TO_OBTAIN_STREAM');
}

/**
 * Stops all tracks in a MediaStream
 */
export function stopCameraStream(stream: MediaStream | null): void {
  if (!stream) return;
  try {
    const tracks = stream.getTracks();
    for (const track of tracks) {
      track.stop();
    }
  } catch (err) {
    console.error('Error stopping stream tracks:', err);
  }
}

/**
 * Maps standard DOM exceptions to user-facing error details
 */
export function parseCameraError(error: unknown): CameraErrorDetails {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return {
          type: 'permission',
          message:
            'Camera permission was denied. Please allow camera access in your browser settings.',
        };
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return {
          type: 'notFound',
          message: 'No camera device was found on this device.',
        };
      case 'NotReadableError':
      case 'TrackStartError':
        return {
          type: 'inUse',
          message:
            'The camera is currently in use by another application or tab.',
        };
      case 'OverconstrainedError':
        return {
          type: 'unknown',
          message: 'Camera does not satisfy requested resolution constraints.',
        };
      default:
        return {
          type: 'unknown',
          message:
            error.message || 'Something went wrong while starting the camera.',
        };
    }
  }

  if (error instanceof Error && error.message === 'UNSUPPORTED_BROWSER') {
    return {
      type: 'unsupported',
      message: 'Your browser does not support camera access.',
    };
  }

  return {
    type: 'unknown',
    message: 'Something went wrong while starting the camera.',
  };
}
