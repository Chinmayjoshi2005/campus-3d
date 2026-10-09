"use client";

import { useState, useMemo } from "react";
import { Search, X, MapPin, Navigation, Route } from "lucide-react";
import type { Destination } from "@/lib/campus/types";
import { DESTINATIONS, FLOORS, campusPathfinder } from "@/lib/campus/navigation-data";
import { NeoCard } from "../neo-brutal/neo-card";

interface IndoorNavigationProps {
  currentFloorId: number;
  selectedDestination: Destination | null;
  onSelectDestination: (dest: Destination | null) => void;
  onConfirmFloorTransfer?: (floorId: number) => void;
}

export function IndoorNavigation({
  currentFloorId,
  selectedDestination,
  onSelectDestination,
  onConfirmFloorTransfer,
}: IndoorNavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterFloor, setFilterFloor] = useState<number | "all">("all");
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [pendingFloorTransfer, setPendingFloorTransfer] = useState<number | null>(null);

  // Filter list matching search query, type, and floor
  const filteredDestinations = useMemo(() => {
    return DESTINATIONS.filter((dest) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dest.roomNumber && dest.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        filterType === "all" ||
        (filterType === "room" && (dest.type === "room" || dest.type === "facility")) ||
        (filterType === "office" && dest.type === "office") ||
        (filterType === "department" && dest.type === "department") ||
        (filterType === "faculty" && dest.type === "faculty");

      const matchesFloor = filterFloor === "all" || dest.floorId === filterFloor;

      return matchesSearch && matchesType && matchesFloor;
    });
  }, [searchQuery, filterType, filterFloor]);

  // Compute route summary when destination is selected
  const routeSummary = useMemo(() => {
    if (!selectedDestination || !selectedDestination.nodeId) return null;
    const path = campusPathfinder.findShortestPath("N-ENT-01", selectedDestination.nodeId);
    if (!path.nodeIds || path.nodeIds.length === 0) return null;

    const steps = path.nodeIds.map((id) => {
      const node = campusPathfinder.getNode(id);
      return node ? node.name : id;
    });

    return {
      steps,
      distance: Math.round(path.totalDistance * 10), // meters approximation
    };
  }, [selectedDestination]);

  const handleSelect = (dest: Destination) => {
    if (dest.floorId !== currentFloorId && onConfirmFloorTransfer) {
      setPendingFloorTransfer(dest.floorId);
      setShowTransferDialog(true);
    }
    onSelectDestination(dest);
  };

  const handleConfirmTransfer = () => {
    if (pendingFloorTransfer !== null && onConfirmFloorTransfer) {
      onConfirmFloorTransfer(pendingFloorTransfer);
    }
    setShowTransferDialog(false);
    setPendingFloorTransfer(null);
  };

  const handleCancelTransfer = () => {
    setShowTransferDialog(false);
    setPendingFloorTransfer(null);
    onSelectDestination(null);
  };

  const targetFloorLabel =
    pendingFloorTransfer !== null
      ? FLOORS.find((f) => f.id === pendingFloorTransfer)?.label || `Floor ${pendingFloorTransfer}`
      : "";

  return (
    <div className="flex flex-col gap-4 w-full pointer-events-auto">
      {/* Search Input Dock */}
      <NeoCard className="p-4 neo-card-pink">
        <div className="relative flex items-center mb-3">
          <Search className="absolute left-3 w-5 h-5 text-black" />
          <input
            id="campus-search"
            type="text"
            className="w-full pl-10 pr-10 py-2 border-2 border-black font-bold text-sm bg-white text-black placeholder-gray-700 focus:outline-none focus:bg-yellow-50 focus:ring-2 focus:ring-yellow-400"
            placeholder="Search rooms, faculty, departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search destinations"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 p-1 hover:bg-gray-100 border border-black rounded"
              aria-label="Clear search query"
            >
              <X className="w-3 h-3 text-black" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {[
            { id: "all", label: "All" },
            { id: "room", label: "Rooms" },
            { id: "department", label: "Depts" },
            { id: "faculty", label: "Faculty" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilterType(id)}
              className={`px-2.5 py-1 text-[10px] font-black uppercase border-2 border-black transition-colors ${
                filterType === id
                  ? "bg-[#ffe600] text-black shadow-[1px_1px_0px_#000]"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Floor Filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase text-black">
          <span className="mr-1">Floor:</span>
          <button
            onClick={() => setFilterFloor("all")}
            className={`px-2 py-0.5 border border-black ${
              filterFloor === "all" ? "bg-black text-white" : "bg-white hover:bg-gray-100"
            }`}
          >
            All
          </button>
          {FLOORS.slice(0, 3).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterFloor(f.id)}
              className={`px-2 py-0.5 border border-black ${
                filterFloor === f.id ? "bg-black text-white" : "bg-white hover:bg-gray-100"
              }`}
            >
              {f.id === 0 ? "G" : `${f.id}F`}
            </button>
          ))}
        </div>

        {/* Live matching results list */}
        {filteredDestinations.length > 0 && (
          <ul
            className="mt-3 border-2 border-black divide-y-2 divide-black bg-white max-h-52 overflow-y-auto"
            role="listbox"
          >
            {filteredDestinations.slice(0, 20).map((dest) => (
              <li key={dest.id} role="option" aria-selected={selectedDestination?.id === dest.id}>
                <button
                  onClick={() => handleSelect(dest)}
                  className={`w-full text-left px-3.5 py-2 font-bold text-xs flex justify-between items-center transition-colors text-black ${
                    selectedDestination?.id === dest.id ? "bg-[#4ecdc4]" : "hover:bg-[#ffe600]"
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="block font-black truncate">{dest.name}</span>
                    <span className="block text-[10px] text-gray-700 font-medium truncate">
                      {dest.description}
                    </span>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 bg-black text-white text-[9px] uppercase font-black tracking-wider">
                    {FLOORS.find((f) => f.id === dest.floorId)?.label.split(" ")[0]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </NeoCard>

      {/* Destination detail card with Pathfinding Route */}
      {selectedDestination && !showTransferDialog && (
        <NeoCard className="p-4 neo-card-yellow">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-700 tracking-wider">
                Active Selection
              </p>
              <h3 className="text-base font-black uppercase mt-1 flex items-center gap-1.5 text-black">
                <MapPin className="w-4 h-4 text-red-600" />
                {selectedDestination.name}
              </h3>
              <p className="text-xs font-bold text-gray-800 mt-1">
                {selectedDestination.description}
              </p>
            </div>
            <button
              onClick={() => onSelectDestination(null)}
              className="p-1 hover:bg-gray-100 border-2 border-black shadow-[1px_1px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none bg-white"
              aria-label="Clear active destination"
            >
              <X className="w-3.5 h-3.5 text-black" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t-2 border-black">
            <span className="px-2 py-0.5 bg-black text-white text-[9px] uppercase font-black tracking-wider">
              {FLOORS.find((f) => f.id === selectedDestination.floorId)?.label}
            </span>
            {selectedDestination.contact && (
              <span className="px-2 py-0.5 bg-white border border-black text-black text-[9px] font-mono font-bold">
                Tel: {selectedDestination.contact}
              </span>
            )}
          </div>

          {/* Route path guidance */}
          {routeSummary && routeSummary.steps.length > 0 && (
            <div className="mt-3 p-2.5 bg-white border-2 border-black text-black text-xs font-bold">
              <div className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-700 mb-1.5">
                <Route className="w-3.5 h-3.5 text-teal-600" />
                Path from Campus Entrance (~{routeSummary.distance}m)
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-gray-900">
                {routeSummary.steps.map((step, idx) => (
                  <li key={idx} className="truncate">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </NeoCard>
      )}

      {/* Cross-Floor Transfer Dialog Modal */}
      {showTransferDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 pointer-events-auto">
          <NeoCard className="max-w-sm w-full p-6 neo-card-orange text-center">
            <div className="w-12 h-12 bg-white border-4 border-black rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-lg font-black uppercase text-black mb-2">
              Floor Transfer Required
            </h3>
            <p className="text-xs font-bold text-gray-900 leading-relaxed mb-6">
              <span className="font-black text-black">{selectedDestination?.name}</span> is located on the{" "}
              <span className="font-black text-black">{targetFloorLabel}</span>.
              <br />
              Switch view to this floor?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleCancelTransfer}
                className="px-4 py-2 border-4 border-black text-xs font-black uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-white text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransfer}
                className="px-4 py-2 border-4 border-black bg-[#ffe600] text-xs font-black uppercase tracking-wider hover:bg-yellow-300 transition-colors shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-black"
              >
                Go to Floor
              </button>
            </div>
          </NeoCard>
        </div>
      )}
    </div>
  );
}
