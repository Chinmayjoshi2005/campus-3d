"use client";

import { useRef, useState, useEffect } from "react";
import { Maximize2, RotateCcw, HelpCircle, Gamepad2, Compass, Sparkles, CheckCircle2 } from "lucide-react";
import { NeoCard } from "../neo-brutal/neo-card";

interface UnityPlayerProps {
  initialMode?: "explore" | "game";
  onModeChange?: (mode: "explore" | "game") => void;
}

export function UnityPlayer({
  initialMode = "explore",
  onModeChange,
}: UnityPlayerProps) {
  const [mode, setMode] = useState<"explore" | "game">(initialMode);
  const [isLoading, setIsLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleModeSwitch = (newMode: "explore" | "game") => {
    setMode(newMode);
    if (onModeChange) onModeChange(newMode);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = "/unity/index.html";
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col bg-slate-950 select-none overflow-hidden"
    >
      {/* Control Topbar */}
      <div className="z-20 flex flex-wrap items-center justify-between gap-3 p-3 bg-black/80 backdrop-blur-md border-b-4 border-black text-white">
        <div className="flex items-center gap-2">
          {/* Mode Selector Buttons */}
          <button
            onClick={() => handleModeSwitch("explore")}
            className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              mode === "explore"
                ? "bg-[#ffe600] text-black"
                : "bg-slate-800 text-white hover:bg-slate-700"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Campus Explore Mode
          </button>

          <button
            onClick={() => handleModeSwitch("game")}
            className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              mode === "game"
                ? "bg-[#4ecdc4] text-black"
                : "bg-slate-800 text-white hover:bg-slate-700"
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            Game Mode
          </button>
        </div>

        {/* Status Badge & Helper Actions */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 border border-slate-700 text-[10px] font-bold text-slate-300 rounded">
            <Sparkles className="w-3 h-3 text-[#ffe600]" />
            Blender College Model
          </span>

          <button
            onClick={() => setShowHelp((prev) => !prev)}
            className="p-1.5 border-2 border-black bg-white text-black hover:bg-yellow-300 transition-colors shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
            title="Controls Guide"
            aria-label="Controls Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleReload}
            className="p-1.5 border-2 border-black bg-white text-black hover:bg-yellow-300 transition-colors shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
            title="Reload 3D Engine"
            aria-label="Reload 3D Engine"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleFullscreen}
            className="p-1.5 border-2 border-black bg-[#ffe600] text-black hover:bg-yellow-400 transition-colors shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Unity Canvas Frame */}
      <div className="relative flex-1 w-full h-full bg-[#0f172a]">
        <iframe
          ref={iframeRef}
          src="/unity/index.html"
          title="Unity Campus Experience"
          className="w-full h-full border-0 block"
          allow="fullscreen; autoplay"
          onLoad={() => setIsLoading(false)}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
            <div className="w-16 h-16 border-4 border-black border-t-[#ffe600] rounded-full animate-spin mb-4" />
            <h3 className="text-xl font-black uppercase text-white tracking-wide">
              Initializing 3D Campus
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-2 max-w-sm">
              Loading WebGL engine and Blender college digital twin...
            </p>
          </div>
        )}

        {/* Controls Help Modal */}
        {showHelp && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <NeoCard className="max-w-md w-full p-6 neo-card-yellow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-black uppercase text-black flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-black" />
                  Navigation & Controls
                </h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-2 py-0.5 border-2 border-black bg-white font-black text-xs hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs font-bold text-gray-900">
                <div className="p-3 bg-white border-2 border-black flex justify-between items-center">
                  <span>Movement:</span>
                  <span className="px-2 py-1 bg-black text-white font-mono text-[10px] rounded">
                    W / A / S / D or Arrow Keys
                  </span>
                </div>
                <div className="p-3 bg-white border-2 border-black flex justify-between items-center">
                  <span>Camera Look:</span>
                  <span className="px-2 py-1 bg-black text-white font-mono text-[10px] rounded">
                    Mouse Drag / Cursor
                  </span>
                </div>
                <div className="p-3 bg-white border-2 border-black flex justify-between items-center">
                  <span>Sprint / Run:</span>
                  <span className="px-2 py-1 bg-black text-white font-mono text-[10px] rounded">
                    Left Shift
                  </span>
                </div>
                <div className="p-3 bg-white border-2 border-black flex justify-between items-center">
                  <span>Jump:</span>
                  <span className="px-2 py-1 bg-black text-white font-mono text-[10px] rounded">
                    Spacebar
                  </span>
                </div>
              </div>

              <div className="mt-5 p-3 bg-black text-white text-[11px] font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4ecdc4] shrink-0" />
                <span>
                  Click inside the canvas to lock keyboard focus. Press ESC to release.
                </span>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="mt-4 w-full py-2 border-4 border-black bg-[#4ecdc4] text-black font-black uppercase tracking-wider hover:bg-teal-300 transition-colors shadow-[2px_2px_0px_#000000]"
              >
                Got It
              </button>
            </NeoCard>
          </div>
        )}
      </div>
    </div>
  );
}
