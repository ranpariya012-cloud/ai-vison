/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  CameraFacing,
  CameraStatus,
  CameraErrorDetails,
} from '../types/vision';
import {
  getCameraStream,
  stopCameraStream,
  parseCameraError,
  isCameraSupported,
} from '../utils/camera';

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  status: CameraStatus;
  facingMode: CameraFacing;
  error: CameraErrorDetails | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  switchCamera: () => Promise<void>;
  clearError: () => void;
  isFrontCamera: boolean;
  videoDimensions: { width: number; height: number };
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [facingMode, setFacingMode] = useState<CameraFacing>('user');
  const [error, setError] = useState<CameraErrorDetails | null>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      stopCameraStream(streamRef.current);
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setStatus('stopped');
  }, []);

  const startCameraWithFacing = useCallback(
    async (facing: CameraFacing) => {
      if (!isCameraSupported()) {
        setError({
          type: 'unsupported',
          message: 'Your browser does not support camera access.',
        });
        setStatus('error');
        return;
      }

      try {
        setStatus('requesting');
        setError(null);

        // Stop existing stream if active
        if (streamRef.current) {
          stopCameraStream(streamRef.current);
          streamRef.current = null;
        }

        const newStream = await getCameraStream(facing);
        streamRef.current = newStream;
        setStream(newStream);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              setVideoDimensions({
                width: videoRef.current.videoWidth || 640,
                height: videoRef.current.videoHeight || 480,
              });
              videoRef.current
                .play()
                .catch((playErr) => console.warn('Video play interrupted:', playErr));
            }
          };
        }

        setStatus('active');
      } catch (err) {
        const errorDetails = parseCameraError(err);
        console.error('Camera startup error:', err);
        setError(errorDetails);
        setStatus('error');
        stopCamera();
      }
    },
    [stopCamera]
  );

  const startCamera = useCallback(async () => {
    await startCameraWithFacing(facingMode);
  }, [facingMode, startCameraWithFacing]);

  const switchCamera = useCallback(async () => {
    const nextFacing: CameraFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    if (status === 'active' || status === 'requesting') {
      await startCameraWithFacing(nextFacing);
    }
  }, [facingMode, status, startCameraWithFacing]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopCameraStream(streamRef.current);
        streamRef.current = null;
      }
    };
  }, []);

  return {
    videoRef,
    stream,
    status,
    facingMode,
    error,
    startCamera,
    stopCamera,
    switchCamera,
    clearError,
    isFrontCamera: facingMode === 'user',
    videoDimensions,
  };
}
