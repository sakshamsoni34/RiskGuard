"use client";

import React from "react";
import { GeoLocation } from "@/types/fraud";
import { MapPin, Globe2, ShieldAlert, ShieldCheck, Navigation, Radio, AlertTriangle } from "lucide-react";

interface GeoThreatMapProps {
  location: GeoLocation;
  homeCity?: string;
  homeCountry?: string;
}

export const GeoThreatMap: React.FC<GeoThreatMapProps> = ({
  location,
  homeCity = "Mumbai",
  homeCountry = "India",
}) => {
  const isImpossibleTravel = location.distanceFromHomeKm > 1000;
  const isDomestic = location.distanceFromHomeKm <= 200;

  // Approximate relative coordinates for visual SVG schematic
  // Origin anchor (Mumbai)
  const homeX = 360;
  const homeY = 120;

  // Destination point
  let targetX = 360;
  let targetY = 120;

  if (location.city.toLowerCase().includes("lagos")) {
    targetX = 140;
    targetY = 150;
  } else if (location.city.toLowerCase().includes("moscow")) {
    targetX = 280;
    targetY = 50;
  } else if (location.city.toLowerCase().includes("singapore")) {
    targetX = 430;
    targetY = 160;
  } else if (location.city.toLowerCase().includes("bucharest")) {
    targetX = 260;
    targetY = 70;
  } else if (location.city.toLowerCase().includes("bengaluru")) {
    targetX = 365;
    targetY = 145;
  } else if (location.city.toLowerCase().includes("delhi")) {
    targetX = 355;
    targetY = 95;
  } else if (location.city.toLowerCase().includes("hyderabad")) {
    targetX = 365;
    targetY = 135;
  } else {
    targetX = 370;
    targetY = 125;
  }

  // Calculate curve control point
  const midX = (homeX + targetX) / 2;
  const midY = Math.min(homeY, targetY) - (isImpossibleTravel ? 45 : 15);
  const pathD = `M ${homeX} ${homeY} Q ${midX} ${midY} ${targetX} ${targetY}`;

  return (
    <div className="rounded-xl border border-[#222226] bg-[#0d0d10] p-4.5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#222226] pb-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-[#18181c] border border-[#27272a] flex items-center justify-center text-zinc-300">
            <Globe2 className="h-3.5 w-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Geospatial Telemetry & Travel Velocity
            </h4>
            <p className="text-[11px] text-zinc-400">
              Correlating IP location hops against cardholder behavioral billing anchor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isImpossibleTravel ? (
            <span className="inline-flex items-center gap-1 rounded bg-rose-950/70 border border-rose-800/50 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
              <AlertTriangle className="h-3 w-3 text-rose-400" />
              Impossible Travel
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              Domestic Velocity
            </span>
          )}
        </div>
      </div>

      {/* SVG Vector Map Schematics */}
      <div className="relative h-44 w-full rounded-lg border border-slate-800 bg-[#070c16] overflow-hidden flex items-center justify-center">
        {/* Ambient Grid Lines */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px]" />

        <svg viewBox="0 0 500 200" className="w-full h-full">
          {/* Arc path */}
          {isImpossibleTravel && (
            <>
              <path
                d={pathD}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
              <path
                d={pathD}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="6"
                strokeOpacity="0.15"
              />
            </>
          )}

          {!isImpossibleTravel && (
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
          )}

          {/* Home Anchor Node */}
          <g transform={`translate(${homeX}, ${homeY})`}>
            <circle r="8" fill="#6366f1" fillOpacity="0.25" />
            <circle r="4" fill="#818cf8" />
            <text x="8" y="14" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              Anchor: {homeCity}
            </text>
          </g>

          {/* Target Location Node */}
          <g transform={`translate(${targetX}, ${targetY})`}>
            <circle
              r="10"
              fill={isImpossibleTravel ? "#f43f5e" : "#10b981"}
              fillOpacity="0.3"
              className={isImpossibleTravel ? "animate-ping" : ""}
            />
            <circle r="5" fill={isImpossibleTravel ? "#fb7185" : "#34d399"} />
            <text
              x="8"
              y="-6"
              fill={isImpossibleTravel ? "#fca5a5" : "#a7f3d0"}
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {location.city}, {location.country}
            </text>
          </g>
        </svg>

        {/* Floating Distance Badge */}
        <div className="absolute bottom-2.5 right-3 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-300 shadow-lg">
          Jump Distance: <span className="font-bold text-white">{location.distanceFromHomeKm.toLocaleString()} km</span>
        </div>
      </div>

      {/* Origin Indicators Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
          <div className="text-[10px] text-slate-500 font-mono">CONNECTION IP</div>
          <div className="font-mono text-slate-200 mt-0.5 truncate">{location.ipAddress}</div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
          <div className="text-[10px] text-slate-500 font-mono">PROXY / VPN STATUS</div>
          <div
            className={`font-semibold mt-0.5 ${
              location.isVpnOrProxy ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {location.isVpnOrProxy ? "Masked (Anonymous VPN/Tor)" : "Clean Residential ISP"}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
          <div className="text-[10px] text-slate-500 font-mono">TRAVEL SPEED EVALUATION</div>
          <div
            className={`font-semibold mt-0.5 ${
              isImpossibleTravel ? "text-rose-400" : "text-slate-200"
            }`}
          >
            {isImpossibleTravel ? "Speed > Mach 2 (Physical Impossibility)" : "Permissible Travel Speed"}
          </div>
        </div>
      </div>
    </div>
  );
};
