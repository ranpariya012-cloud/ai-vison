/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CameraStatus,
  ModelLoadingStatus,
  CameraErrorDetails,
} from '../types/vision';
import {
  Camera,
  AlertTriangle,
  RotateCw,
  Loader2,
  Lock,
  Cpu,
} from 'lucide-react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  cameraStatus: CameraStatus;
  modelStatus: ModelLoadingStatus;
  modelStatusMessage: string;
  isFrontCamera: boolean;
  cameraError: CameraErrorDetails | null;
  onStartCamera: () => void;
  fps: number;
  inferenceTimeMs: number;
  videoDimensions: { width: number; height: number };
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  canvasRef,
  cameraStatus,
  modelStatus,
  modelStatusMessage,
  isFrontCamera,
  cameraError,
  onStartCamera,
  fps,
  inferenceTimeMs,
  videoDimensions,
}) => {
  const isModelsReady = modelStatus === 'ready';
  const isCameraActive = cameraStatus === 'active';
  const isCameraLoading = cameraStatus === 'requesting';

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[72vh] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/90 shadow-2xl flex items-center justify-center">
      {/* Background grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a15_1px,transparent_1px),linear-gradient(to_bottom,#0f172a15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isCameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'
        } ${isFrontCamera ? '-scale-x-100' : ''}`}
      />

      {/* Transparent Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-10 transition-opacity duration-300 ${
          isCameraActive ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Corner targeting reticles for futuristic camera frame aesthetic */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-500/50 pointer-events-none z-20" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-500/50 pointer-events-none z-20" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-500/50 pointer-events-none z-20" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-500/50 pointer-events-none z-20" />

      {/* HUD Telemetry Banner when camera is active */}
      {isCameraActive && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-cyan-300/90 bg-slate-950/75 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-cyan-900/40 z-20 pointer-events-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE FEED</span>
            </span>
            <span className="text-slate-600">·</span>
            <span>{isFrontCamera ? 'FRONT (MIRRORED)' : 'ENVIRONMENT'}</span>
            {videoDimensions.width > 0 && (
              <>
                <span className="text-slate-600">·</span>
                <span>
                  {videoDimensions.width}×{videoDimensions.height}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span>
              FPS: <strong className="font-semibold text-white">{fps}</strong>
            </span>
            <span className="text-slate-600">·</span>
            <span>
              LATENCY:{' '}
              <strong className="font-semibold text-white">{inferenceTimeMs}ms</strong>
            </span>
          </div>
        </div>
      )}

      {/* Error State UI */}
      {cameraError && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-950/50">
            {cameraError.type === 'permission' ? (
              <Lock className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-base font-semibold text-white font-['Chakra_Petch',sans-serif] mb-2">
            {cameraError.type === 'permission'
              ? 'Camera Access Denied'
              : cameraError.type === 'notFound'
              ? 'No Camera Found'
              : cameraError.type === 'unsupported'
              ? 'Browser Unsupported'
              : 'Camera Error'}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            {cameraError.message}
          </p>
          <button
            onClick={onStartCamera}
            disabled={!isModelsReady}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-medium text-sm transition-colors shadow-lg shadow-cyan-950/50 cursor-pointer disabled:opacity-50"
          >
            <RotateCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Model Loading Screen */}
      {!isModelsReady && modelStatus !== 'error' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/70 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-4 shadow-xl shadow-cyan-950/40">
            <Cpu className="w-7 h-7 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white font-['Chakra_Petch',sans-serif] mb-1">
            Loading Vision Engine
          </h3>
          <p className="text-xs font-mono text-cyan-300/80 mb-5 max-w-xs">
            {modelStatusMessage}
          </p>
          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300 ${
                modelStatus === 'loading-wasm'
                  ? 'w-1/4'
                  : modelStatus === 'loading-face'
                  ? 'w-1/2'
                  : modelStatus === 'loading-hand'
                  ? 'w-4/5'
                  : 'w-full'
              }`}
            />
          </div>
        </div>
      )}

      {/* Model Loading Error */}
      {modelStatus === 'error' && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white font-['Chakra_Petch',sans-serif] mb-2">
            AI Vision Model Error
          </h3>
          <p className="text-sm text-slate-300 mb-4">{modelStatusMessage}</p>
          <p className="text-xs text-slate-400">
            Please ensure you have an active internet connection to download
            the computer vision models.
          </p>
        </div>
      )}

      {/* Idle / Camera Off State */}
      {isModelsReady && !isCameraActive && !cameraError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-xl">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white font-['Chakra_Petch',sans-serif] mb-1">
            Camera Inactive
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mb-6">
            Click Start Camera below to activate real-time face, eye, hand, and
            finger tracking directly inside your browser.
          </p>
          <button
            onClick={onStartCamera}
            disabled={isCameraLoading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 active:scale-95 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-950/60 cursor-pointer disabled:opacity-50"
          >
            {isCameraLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Starting Camera...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span>Start Camera</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
