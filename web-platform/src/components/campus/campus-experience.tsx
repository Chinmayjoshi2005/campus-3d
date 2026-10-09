"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Compass, Gamepad2, Search, X } from "lucide-react";
import { UnityPlayer } from "./unity-player";
import { IndoorNavigation } from "./indoor-navigation";
import type { Destination } from "@/lib/campus/types";

export function CampusExperience() {
  const searchParams = useSearchParams();
  const queryMode = searchParams.get("mode");

  const [activeTab, setActiveTab] = useState<"explore" | "game" | "directory">("explore");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [activeFloorId, setActiveFloorId] = useState(0);
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);

  useEffect(() => {
    if (queryMode === "game") {
      setActiveTab("game");
    } else if (queryMode === "directory" || queryMode === "indoor") {
      setActiveTab("directory");
    } else {
      setActiveTab("explore");
    }
  }, [queryMode]);

  return (
    <div className="relative w-full h-[calc(100vh-80px)] bg-slate-950 overflow-hidden font-sans flex flex-col">
      {/* Top Header Mode Dock */}
      <div className="z-30 flex items-center justify-between px-4 py-2.5 bg-black/90 border-b-4 border-black backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("explore")}
            className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              activeTab === "explore"
                ? "bg-[#ffe600] text-black"
                : "bg-white text-black hover:bg-yellow-100"
            }`}
          >
            <Compass className="w-4 h-4" />
            3D Explore Mode
          </button>

          <button
            onClick={() => setActiveTab("game")}
            className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              activeTab === "game"
                ? "bg-[#4ecdc4] text-black"
                : "bg-white text-black hover:bg-teal-100"
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            Game Mode
          </button>

          <button
            onClick={() => setActiveTab("directory")}
            className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              activeTab === "directory"
                ? "bg-[#ff6b9d] text-black"
                : "bg-white text-black hover:bg-pink-100"
            }`}
          >
            <Search className="w-4 h-4" />
            Campus Directory
          </button>
        </div>

        {/* Quick Search Drawer Trigger (visible during 3D modes) */}
        {activeTab !== "directory" && (
          <button
            onClick={() => setIsSearchDrawerOpen((prev) => !prev)}
            className="px-3 py-1.5 border-2 border-black bg-white text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-yellow-200 shadow-[2px_2px_0px_#000000]"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search Rooms / Faculty</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* 3D Unity Canvas View for Explore & Game */}
        {(activeTab === "explore" || activeTab === "game") && (
          <div className="w-full h-full">
            <UnityPlayer
              initialMode={activeTab}
              onModeChange={(newMode) => setActiveTab(newMode)}
            />
          </div>
        )}

        {/* Directory View (Dedicated tab) */}
        {activeTab === "directory" && (
          <div className="w-full h-full overflow-y-auto bg-[#dff4ff] p-6 lg:p-10 flex justify-center">
            <div className="max-w-2xl w-full">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-black text-white text-xs font-black uppercase tracking-widest mb-2">
                  Live Campus Directory
                </span>
                <h1 className="text-3xl font-black uppercase tracking-tight text-black">
                  Rooms, Faculty & Departments
                </h1>
                <p className="text-xs font-bold text-gray-800 mt-1">
                  Search across all college facilities, classrooms, department hubs, and faculty offices.
                </p>
              </div>

              <IndoorNavigation
                currentFloorId={activeFloorId}
                selectedDestination={selectedDestination}
                onSelectDestination={setSelectedDestination}
                onConfirmFloorTransfer={setActiveFloorId}
              />
            </div>
          </div>
        )}

        {/* Floating Search Panel / Drawer during 3D modes */}
        {activeTab !== "directory" && isSearchDrawerOpen && (
          <div className="absolute top-4 right-4 z-40 max-w-sm w-full animate-in fade-in slide-in-from-right duration-200">
            <div className="relative">
              <button
                onClick={() => setIsSearchDrawerOpen(false)}
                className="absolute -top-3 -right-3 z-50 p-1.5 bg-black text-white border-2 border-white rounded-full hover:bg-red-600 transition-colors"
                aria-label="Close search panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <IndoorNavigation
                currentFloorId={activeFloorId}
                selectedDestination={selectedDestination}
                onSelectDestination={(dest) => {
                  setSelectedDestination(dest);
                  if (dest) setActiveFloorId(dest.floorId);
                }}
                onConfirmFloorTransfer={setActiveFloorId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
