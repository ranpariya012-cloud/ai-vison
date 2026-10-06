/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CameraStatus, ModelLoadingStatus } from '../types/vision';

interface StatusIndicatorProps {
  cameraStatus: CameraStatus;
  modelStatus: ModelLoadingStatus;
  isPaused: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  cameraStatus,
  modelStatus,
  isPaused,
}) => {
  if (modelStatus === 'error') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono font-medium tracking-tight">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        <span>MODEL ERROR</span>
      </div>
    );
  }

  if (modelStatus !== 'ready') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs font-mono font-medium tracking-tight">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>LOADING MODELS</span>
      </div>
    );
  }

  if (cameraStatus === 'requesting') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 text-xs font-mono font-medium tracking-tight">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>STARTING CAMERA</span>
      </div>
    );
  }

  if (cameraStatus === 'active') {
    if (isPaused) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs font-mono font-medium tracking-tight">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>DETECTION PAUSED</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-mono font-medium tracking-tight shadow-sm shadow-emerald-950/50">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-emerald-200">AI DETECTION ACTIVE</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 text-xs font-mono font-medium tracking-tight">
      <span className="w-2 h-2 rounded-full bg-slate-600" />
      <span>STANDBY</span>
    </div>
  );
};
