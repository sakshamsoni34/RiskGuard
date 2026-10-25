"use client";

import React from "react";
import { GeoLocation } from "@/types/fraud";
import {
  MapPin,
  Globe2,
  ShieldAlert,
  ShieldCheck,
  Navigation,
  Radio,
  AlertTriangle,
  Wifi,
  Plane,
} from "lucide-react";

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
  const isModerateHop = location.distanceFromHomeKm > 150 && location.distanceFromHomeKm <= 1000;

  // Geographic anchor coordinates mapped to a 520x220 tactical radar viewport
  // Home Anchor (Mumbai, India)
  const homeX = 300;
  const homeY = 135;

  // Destination coordinates calibrated for realistic regional & global visual spread
  const city = (location.city || "").toLowerCase();
  let targetX = 300;
  let targetY = 135;

  if (city.includes("kolkata")) {
    targetX = 405;
    targetY = 110;
  } else if (city.includes("delhi")) {
    targetX = 310;
    targetY = 80;
  } else if (city.includes("bengaluru") || city.includes("bangalore")) {
    targetX = 310;
    targetY = 165;
  } else if (city.includes("hyderabad")) {
    targetX = 330;
    targetY = 145;
  } else if (city.includes("pune")) {
    targetX = 315;
    targetY = 140;
  } else if (city.includes("chennai")) {
    targetX = 335;
    targetY = 165;
  } else if (city.includes("lagos") || city.includes("nigeria")) {
    targetX = 90;
    targetY = 145;
  } else if (city.includes("moscow") || city.includes("russia")) {
    targetX = 220;
    targetY = 45;
  } else if (city.includes("bucharest") || city.includes("romania")) {
    targetX = 180;
    targetY = 65;
  } else if (city.includes("singapore")) {
    targetX = 450;
    targetY = 175;
  } else if (city.includes("dubai") || city.includes("uae")) {
    targetX = 210;
    targetY = 115;
  } else {
    // Default domestic offset
    targetX = 350;
    targetY = 120;
  }

  // Parabolic trajectory arc
  const midX = (homeX + targetX) / 2;
  const midY = Math.min(homeY, targetY) - (isImpossibleTravel ? 50 : 25);
  const pathD = `M ${homeX} ${homeY} Q ${midX} ${midY} ${targetX} ${targetY}`;

  return (
    <div className="rounded-2xl border border-[#222226] bg-[#09090c] p-4.5 space-y-4 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#222226] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-sky-950/60 border border-sky-800/50 flex items-center justify-center text-sky-400">
            <Globe2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Geospatial Risk Vector</span>
              <span className="text-[10px] font-mono text-zinc-400 font-normal">
                (Haversine Analysis)
              </span>
            </h4>
            <p className="text-[11px] text-zinc-400">
              Correlating origin coordinates against cardholder habitual anchor
            </p>
          </div>
        </div>

        <div>
          {isImpossibleTravel ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-950/80 border border-rose-800/60 px-2.5 py-1 text-[10px] font-bold text-rose-300 shadow-sm shadow-rose-950/30">
              <AlertTriangle className="h-3 w-3 text-rose-400" />
              Impossible Travel
            </span>
          ) : isModerateHop ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-950/80 border border-amber-800/60 px-2.5 py-1 text-[10px] font-bold text-amber-300">
              <Plane className="h-3 w-3 text-amber-400" />
              Interstate Hop
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              Domestic Radius
            </span>
          )}
        </div>
      </div>

      {/* Interactive Tactical Radar Schematic Viewport */}
      <div className="relative h-48 w-full rounded-xl border border-[#202028] bg-[#060810] overflow-hidden flex items-center justify-center shadow-inner">
        {/* Radar Concentric Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-96 h-96 rounded-full border border-sky-500/30" />
          <div className="w-64 h-64 rounded-full border border-sky-500/30 absolute" />
          <div className="w-32 h-32 rounded-full border border-sky-500/40 absolute" />
          <div className="w-full h-[1px] bg-sky-500/20 absolute" />
          <div className="h-full w-[1px] bg-sky-500/20 absolute" />
        </div>

        {/* Ambient Grid Lines */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

        <svg viewBox="0 0 520 220" className="w-full h-full relative z-10">
          {/* Subtle continent silhouette hints */}
          <path
            d="M 60 70 Q 110 50 150 90 T 130 160 Q 90 190 70 140 Z"
            fill="#1e293b"
            fillOpacity="0.25"
          />
          <path
            d="M 270 60 Q 340 30 420 50 T 400 130 Q 330 180 290 140 Z"
            fill="#1e293b"
            fillOpacity="0.3"
          />

          {/* Flight Path Arc */}
          {isImpossibleTravel ? (
            <>
              {/* Outer Glow */}
              <path
                d={pathD}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="5"
                strokeOpacity="0.2"
              />
              {/* Animated Dashed Arc */}
              <path
                d={pathD}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
            </>
          ) : (
            <path
              d={pathD}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
          )}

          {/* Anchor Node (Cardholder Home) */}
          <g transform={`translate(${homeX}, ${homeY})`}>
            <circle r="12" fill="#38bdf8" fillOpacity="0.15" />
            <circle r="6" fill="#0284c7" />
            <circle r="2.5" fill="#ffffff" />
            <text
              x="10"
              y="18"
              fill="#94a3b8"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="600"
            >
              Anchor: {homeCity}
            </text>
          </g>

          {/* Target / Origin Node (Threat Session) */}
          <g transform={`translate(${targetX}, ${targetY})`}>
            {/* Pulsing Beacon */}
            <circle
              r="16"
              fill={isImpossibleTravel ? "#f43f5e" : "#38bdf8"}
              fillOpacity="0.2"
              className="animate-ping"
            />
            <circle
              r="8"
              fill={isImpossibleTravel ? "#e11d48" : "#0284c7"}
            />
            <circle r="3.5" fill="#ffffff" />
            <text
              x="12"
              y="-8"
              fill={isImpossibleTravel ? "#fca5a5" : "#bae6fd"}
              fontSize="11"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {location.city}, {location.country}
            </text>
          </g>
        </svg>

        {/* Floating Distance Badge on Radar */}
        <div className="absolute bottom-3 right-3 bg-[#0c101c]/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 shadow-xl backdrop-blur-md flex items-center gap-2 z-20">
          <Navigation className="h-3.5 w-3.5 text-sky-400" />
          <span>
            Jump Distance:{" "}
            <strong className="text-white">
              {location.distanceFromHomeKm.toLocaleString()} km
            </strong>
          </span>
        </div>

        {/* Radar Origin City Callout */}
        <div className="absolute top-3 left-3 bg-[#0c101c]/90 border border-slate-700/80 px-2.5 py-1 rounded-lg text-[11px] font-mono text-zinc-300 shadow-md backdrop-blur-md z-20 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Origin: {location.city}</span>
        </div>
      </div>

      {/* Telemetry Indicator Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="rounded-xl border border-[#202026] bg-[#121217] p-2.5 space-y-1">
          <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
            <Wifi className="h-3 w-3 text-zinc-500" />
            <span>ORIGIN IP</span>
          </div>
          <div className="font-mono text-xs font-bold text-white truncate">
            {location.ipAddress}
          </div>
        </div>

        <div className="rounded-xl border border-[#202026] bg-[#121217] p-2.5 space-y-1">
          <div className="text-[10px] text-zinc-400 font-mono">PROXY / VPN</div>
          <div
            className={`font-semibold text-xs truncate ${
              location.isVpnOrProxy ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {location.isVpnOrProxy ? "Masked Datacenter IP" : "Residential ISP"}
          </div>
        </div>

        <div className="rounded-xl border border-[#202026] bg-[#121217] p-2.5 space-y-1">
          <div className="text-[10px] text-zinc-400 font-mono">TRAVEL VELOCITY</div>
          <div
            className={`font-semibold text-xs truncate ${
              isImpossibleTravel ? "text-rose-400" : "text-zinc-300"
            }`}
          >
            {isImpossibleTravel ? "Mach 2.4 (Impossible)" : "Normal Speed"}
          </div>
        </div>
      </div>
    </div>
  );
};
