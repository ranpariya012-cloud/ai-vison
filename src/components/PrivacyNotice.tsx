/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Cpu, HardDrive } from 'lucide-react';

export const PrivacyNotice: React.FC = () => {
  return (
    <footer className="mt-8 pt-6 border-t border-slate-800/60 text-xs text-slate-400">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="leading-relaxed">
            Camera processing is performed locally in your browser whenever
            supported. Camera frames are not stored by this application.
          </p>
        </div>

        <div className="flex items-center gap-4 text-slate-400 shrink-0 font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Client WebAssembly</span>
          </span>
          <span className="text-slate-700" aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            <span>Zero Server Frames</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
