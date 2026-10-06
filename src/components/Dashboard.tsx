/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  VisionDetectionSummary,
  OverlayVisibilitySettings,
  FaceDetectionData,
  HandDetectionData,
  CameraStatus,
  ModelLoadingStatus,
} from '../types/vision';
import {
  User,
  Eye,
  Hand,
  Hash,
  Video,
  Layers,
  Activity,
  CheckSquare,
  Square,
} from 'lucide-react';

interface DashboardProps {
  summary: VisionDetectionSummary;
  faces: FaceDetectionData[];
  hands: HandDetectionData[];
  cameraStatus: CameraStatus;
  modelStatus: ModelLoadingStatus;
  overlaySettings: OverlayVisibilitySettings;
  onToggleOverlay: (key: keyof OverlayVisibilitySettings) => void;
  isFrontCamera: boolean;
  videoDimensions: { width: number; height: number };
}

export const Dashboard: React.FC<DashboardProps> = ({
  summary,
  faces,
  hands,
  cameraStatus,
  modelStatus,
  overlaySettings,
  onToggleOverlay,
  isFrontCamera,
  videoDimensions,
}) => {
  const isCameraActive = cameraStatus === 'active';

  return (
    <div className="space-y-4">
      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* FACE CARD */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
              FACES
            </span>
            <User className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">
              {isCameraActive ? summary.facesCount : 0}
            </span>
            <span className="text-xs text-slate-400">detected</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Confidence</span>
            <span className="text-cyan-300 tabular-nums">
              {faces.length > 0
                ? `${Math.round(faces[0].confidence * 100)}%`
                : '—'}
            </span>
          </div>
        </div>

        {/* EYES CARD */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
              EYES
            </span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">
              {isCameraActive ? summary.eyesCount : 0}
            </span>
            <span className="text-xs text-slate-400">tracked</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Visibility</span>
            <span className="text-emerald-300">
              {summary.eyesCount > 0 ? 'Clear' : 'Not detected'}
            </span>
          </div>
        </div>

        {/* HANDS CARD */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
              HANDS
            </span>
            <Hand className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">
              {isCameraActive ? summary.handsCount : 0}
            </span>
            <span className="text-xs text-slate-400">of 2 max</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Identified</span>
            <span className="text-sky-300">
              {hands.length === 0
                ? 'None'
                : hands.map((h) => h.handedness[0]).join(', ') + ' Hand'}
            </span>
          </div>
        </div>

        {/* FINGERS CARD */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
              RAISED FINGERS
            </span>
            <Hash className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">
              {isCameraActive
                ? typeof summary.totalRaisedFingers === 'number'
                  ? summary.totalRaisedFingers
                  : '—'
                : 0}
            </span>
            <span className="text-xs text-slate-400">
              {summary.totalRaisedFingers === 'Uncertain'
                ? 'Uncertain'
                : 'total fingers'}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>L / R Hands</span>
            <span className="text-amber-300 tabular-nums">
              {summary.leftHandFingers !== null
                ? `L: ${summary.leftHandFingers}`
                : 'L: —'}{' '}
              ·{' '}
              {summary.rightHandFingers !== null
                ? `R: ${summary.rightHandFingers}`
                : 'R: —'}
            </span>
          </div>
        </div>
      </div>

      {/* Hand & Finger Extension Matrix */}
      {isCameraActive && hands.length > 0 && (
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Hand className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-mono">
                Finger Extension Matrix
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Geometric Joint Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hands.map((hand, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800/90 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        hand.handedness === 'Left' ? 'bg-sky-400' : 'bg-purple-400'
                      }`}
                    />
                    <span className="text-xs font-bold text-white font-mono">
                      {hand.handedness} Hand
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Raised:{' '}
                    <strong className="text-cyan-300 font-semibold">
                      {hand.fingerCountResult.uncertain
                        ? 'Uncertain'
                        : `${hand.fingerCountResult.count} / 5`}
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 mt-2">
                  {hand.fingerCountResult.fingers.map((f) => (
                    <div
                      key={f.name}
                      className={`flex flex-col items-center justify-center p-2 rounded-md border text-center transition-all ${
                        f.isExtended
                          ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className="text-[10px] font-mono uppercase tracking-wider mb-0.5">
                        {f.label}
                      </span>
                      <span className="text-xs font-bold font-mono">
                        {f.isExtended ? 'UP' : 'DOWN'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SYSTEM STATUS & HARDWARE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* CAMERA STATUS CARD */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
              CAMERA FEED
            </span>
            <Video className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-bold text-white">
              {cameraStatus === 'active'
                ? 'Active'
                : cameraStatus === 'requesting'
                ? 'Connecting...'
                : 'Inactive'}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Orientation</span>
            <span>{isFrontCamera ? 'Front (Selfie)' : 'Rear (World)'}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Stream Resolution</span>
            <span className="tabular-nums">
              {videoDimensions.width > 0
                ? `${videoDimensions.width} × ${videoDimensions.height}`
                : '—'}
            </span>
          </div>
        </div>

        {/* AI ENGINE CARD */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
              AI ENGINE
            </span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-bold text-white">
              {modelStatus === 'ready'
                ? 'Models Ready'
                : modelStatus === 'error'
                ? 'Load Error'
                : 'Loading...'}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Runtime</span>
            <span>MediaPipe WASM (Client)</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Inference Latency</span>
            <span className="tabular-nums text-cyan-300">
              {summary.inferenceTimeMs > 0 ? `${summary.inferenceTimeMs} ms` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* OVERLAY VISIBILITY TOGGLES */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-mono">
            Detection Overlays
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {/* Face Box */}
          <button
            onClick={() => onToggleOverlay('showFaceBox')}
            aria-pressed={overlaySettings.showFaceBox}
            className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              overlaySettings.showFaceBox
                ? 'bg-cyan-950/60 border-cyan-700/80 text-cyan-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {overlaySettings.showFaceBox ? (
              <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <span className="truncate">Face Box</span>
          </button>

          {/* Face Landmarks */}
          <button
            onClick={() => onToggleOverlay('showFaceLandmarks')}
            aria-pressed={overlaySettings.showFaceLandmarks}
            className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              overlaySettings.showFaceLandmarks
                ? 'bg-cyan-950/60 border-cyan-700/80 text-cyan-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {overlaySettings.showFaceLandmarks ? (
              <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <span className="truncate">Face Landmarks</span>
          </button>

          {/* Eye Landmarks */}
          <button
            onClick={() => onToggleOverlay('showEyeLandmarks')}
            aria-pressed={overlaySettings.showEyeLandmarks}
            className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              overlaySettings.showEyeLandmarks
                ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {overlaySettings.showEyeLandmarks ? (
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <span className="truncate">Eye Landmarks</span>
          </button>

          {/* Hand Skeleton */}
          <button
            onClick={() => onToggleOverlay('showHandSkeleton')}
            aria-pressed={overlaySettings.showHandSkeleton}
            className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              overlaySettings.showHandSkeleton
                ? 'bg-sky-950/60 border-sky-700/80 text-sky-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {overlaySettings.showHandSkeleton ? (
              <CheckSquare className="w-4 h-4 text-sky-400 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <span className="truncate">Hand Skeleton</span>
          </button>

          {/* Finger Labels */}
          <button
            onClick={() => onToggleOverlay('showFingerLabels')}
            aria-pressed={overlaySettings.showFingerLabels}
            className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              overlaySettings.showFingerLabels
                ? 'bg-amber-950/60 border-amber-700/80 text-amber-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {overlaySettings.showFingerLabels ? (
              <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <span className="truncate">Finger Labels</span>
          </button>
        </div>
      </div>
    </div>
  );
};
