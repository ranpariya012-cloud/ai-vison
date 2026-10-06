/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CameraStatus, CameraFacing } from '../types/vision';
import {
  Camera,
  CameraOff,
  SwitchCamera,
  Pause,
  Play,
  RotateCcw,
  Loader2,
} from 'lucide-react';

interface ControlPanelProps {
  cameraStatus: CameraStatus;
  facingMode: CameraFacing;
  isPaused: boolean;
  isModelsReady: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onSwitchCamera: () => void;
  onPauseDetection: () => void;
  onResumeDetection: () => void;
  onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  cameraStatus,
  facingMode,
  isPaused,
  isModelsReady,
  onStartCamera,
  onStopCamera,
  onSwitchCamera,
  onPauseDetection,
  onResumeDetection,
  onReset,
}) => {
  const isCameraActive = cameraStatus === 'active';
  const isCameraRequesting = cameraStatus === 'requesting';

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Camera Start / Stop */}
        <div className="flex items-center gap-2">
          {!isCameraActive ? (
            <button
              onClick={onStartCamera}
              disabled={!isModelsReady || isCameraRequesting}
              aria-label="Start Camera"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-medium text-xs sm:text-sm transition-all shadow-md shadow-cyan-950/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isCameraRequesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Start Camera</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onStopCamera}
              aria-label="Stop Camera"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 active:bg-rose-700 text-white font-medium text-xs sm:text-sm transition-all shadow-md shadow-rose-950/40 cursor-pointer whitespace-nowrap"
            >
              <CameraOff className="w-4 h-4" />
              <span>Stop Camera</span>
            </button>
          )}

          {/* Switch Camera */}
          <button
            onClick={onSwitchCamera}
            disabled={!isModelsReady || isCameraRequesting}
            aria-label="Switch Camera"
            title={`Currently ${facingMode === 'user' ? 'Front camera' : 'Rear camera'}. Click to switch.`}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700/60 font-medium text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <SwitchCamera className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">
              {facingMode === 'user' ? 'Rear Cam' : 'Front Cam'}
            </span>
            <span className="sm:hidden">Switch</span>
          </button>
        </div>

        {/* Detection Controls & Reset */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume Detection */}
          {isCameraActive && (
            <button
              onClick={isPaused ? onResumeDetection : onPauseDetection}
              aria-label={isPaused ? 'Resume Detection' : 'Pause Detection'}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                isPaused
                  ? 'bg-amber-600/90 hover:bg-amber-500 text-white'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 text-amber-200" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 text-amber-400" />
                  <span>Pause</span>
                </>
              )}
            </button>
          )}

          {/* Reset */}
          <button
            onClick={onReset}
            aria-label="Reset Camera and Detection"
            title="Stop camera and reset all detection results"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 font-medium text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
