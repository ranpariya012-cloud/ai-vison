/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CameraStatus, ModelLoadingStatus } from '../types/vision';
import { StatusIndicator } from './StatusIndicator';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  cameraStatus: CameraStatus;
  modelStatus: ModelLoadingStatus;
  isPaused: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  cameraStatus,
  modelStatus,
  isPaused,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1 & 2: Brand & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-['Chakra_Petch',sans-serif] truncate">
              AI Vision Detector
            </h1>
          </div>
          <span className="hidden sm:inline text-slate-600 text-sm" aria-hidden="true">·</span>
          <p className="text-xs text-slate-400 truncate">
            Real-Time Face · Eyes · Hands · Fingers Detection
          </p>
        </div>

        {/* Zone 3: Live Status & Privacy Tag */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local Browser Inference</span>
          </div>
          <StatusIndicator
            cameraStatus={cameraStatus}
            modelStatus={modelStatus}
            isPaused={isPaused}
          />
        </div>
      </div>
    </header>
  );
};
