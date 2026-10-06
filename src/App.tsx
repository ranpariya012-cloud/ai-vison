/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback } from 'react';
import { useCamera } from './hooks/useCamera';
import { useVisionDetection } from './hooks/useVisionDetection';
import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { ControlPanel } from './components/ControlPanel';
import { Dashboard } from './components/Dashboard';
import { PrivacyNotice } from './components/PrivacyNotice';
import { OverlayVisibilitySettings } from './types/vision';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Overlay visibility toggles
  const [overlaySettings, setOverlaySettings] = useState<OverlayVisibilitySettings>({
    showFaceBox: true,
    showFaceLandmarks: true,
    showEyeLandmarks: true,
    showHandSkeleton: true,
    showFingerLabels: true,
  });

  const handleToggleOverlay = useCallback((key: keyof OverlayVisibilitySettings) => {
    setOverlaySettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // Camera Management
  const {
    videoRef,
    status: cameraStatus,
    facingMode,
    error: cameraError,
    startCamera,
    stopCamera,
    switchCamera,
    clearError,
    isFrontCamera,
    videoDimensions,
  } = useCamera();

  // Vision Detection Pipeline
  const {
    modelStatus,
    modelStatusMessage,
    isPaused,
    summary,
    detectedFaces,
    detectedHands,
    pauseDetection,
    resumeDetection,
    resetDetection,
  } = useVisionDetection({
    videoRef,
    canvasRef,
    isCameraActive: cameraStatus === 'active',
    isFrontCamera,
    overlaySettings,
  });

  // Master Reset
  const handleReset = useCallback(() => {
    stopCamera();
    clearError();
    resetDetection();
  }, [stopCamera, clearError, resetDetection]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <Header
        cameraStatus={cameraStatus}
        modelStatus={modelStatus}
        isPaused={isPaused}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Responsive Layout: Desktop 2-Column (Left: Camera, Right: Dashboard) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
          {/* LEFT COLUMN: Camera Stream & Control Panel */}
          <section
            aria-label="Live Camera Stream and Controls"
            className="lg:col-span-7 flex flex-col gap-4"
          >
            <CameraView
              videoRef={videoRef}
              canvasRef={canvasRef}
              cameraStatus={cameraStatus}
              modelStatus={modelStatus}
              modelStatusMessage={modelStatusMessage}
              isFrontCamera={isFrontCamera}
              cameraError={cameraError}
              onStartCamera={startCamera}
              fps={summary.fps}
              inferenceTimeMs={summary.inferenceTimeMs}
              videoDimensions={videoDimensions}
            />

            <ControlPanel
              cameraStatus={cameraStatus}
              facingMode={facingMode}
              isPaused={isPaused}
              isModelsReady={modelStatus === 'ready'}
              onStartCamera={startCamera}
              onStopCamera={stopCamera}
              onSwitchCamera={switchCamera}
              onPauseDetection={pauseDetection}
              onResumeDetection={resumeDetection}
              onReset={handleReset}
            />
          </section>

          {/* RIGHT COLUMN: Real-Time Telemetry Dashboard */}
          <section
            aria-label="Real-Time Detection Dashboard"
            className="lg:col-span-5 flex flex-col gap-4"
          >
            <Dashboard
              summary={summary}
              faces={detectedFaces}
              hands={detectedHands}
              cameraStatus={cameraStatus}
              modelStatus={modelStatus}
              overlaySettings={overlaySettings}
              onToggleOverlay={handleToggleOverlay}
              isFrontCamera={isFrontCamera}
              videoDimensions={videoDimensions}
            />
          </section>
        </div>

        {/* Privacy Notice & Security Disclaimer */}
        <PrivacyNotice />
      </main>
    </div>
  );
}
