"use client";

import React, { useState } from "react";
import { Layers, Smartphone, MapPin, Globe, CreditCard, ShieldAlert } from "lucide-react";

interface EntityGraphProps {
  suspectEntity?: string;
  targetMuleAccount?: string;
  transactionIds: string[];
}

export const EntityGraph: React.FC<EntityGraphProps> = ({
  suspectEntity = "Suspect Syndicate Alpha",
  targetMuleAccount = "mule.paytm@axisbank",
  transactionIds,
}) => {
  const [selectedNode, setSelectedNode] = useState<{ label: string; type: string; detail: string } | null>(null);

  // Layout node coordinates around center (250, 160)
  const center = { x: 250, y: 160 };

  const satellites = [
    { id: "node-mule", label: targetMuleAccount, type: "MULE_ACCOUNT", x: 120, y: 70, color: "#f43f5e", detail: "Primary target beneficiary UPI VPA flagged across multiple bank reporting nodes" },
    { id: "node-ip1", label: "198.51.100.18 (VPN)", type: "NETWORK_IP", x: 380, y: 70, color: "#a855f7", detail: "Datacenter exit node detected across 8 rapid transaction hops" },
    { id: "node-dev1", label: "fp-hash-88f1c4e", type: "DEVICE_FP", x: 100, y: 250, color: "#3b82f6", detail: "Android 14 Chrome hardware hash linked to SIM-swap profile" },
    { id: "node-geo1", label: "Mumbai ↔ Dubai", type: "GEO_HOP", x: 390, y: 250, color: "#10b981", detail: "Impossible travel jump of 1,930 km within 35-minute delta" },
    ...transactionIds.slice(0, 3).map((tid, idx) => ({
      id: `node-${tid}`,
      label: tid,
      type: "TRANSACTION",
      x: 250 + (idx === 0 ? -120 : idx === 1 ? 120 : 0),
      y: idx === 2 ? 290 : 160 + (idx === 0 ? -90 : 90),
      color: "#06b6d4",
      detail: `Linked disputed transaction evidence record in case dossier (${tid})`,
    })),
  ];

  return (
    <div className="p-4 rounded-2xl bg-[#0d0d10] border border-[#222226] space-y-3 font-mono">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-zinc-200 uppercase flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-300" />
          <span>Entity Relationship Intelligence Graph</span>
        </h4>
        <span className="text-[10px] text-zinc-500">Interactive SVG Node Topology</span>
      </div>

      <div className="relative border border-[#222226] rounded-xl bg-[#08080a] overflow-hidden">
        <svg viewBox="0 0 500 320" className="w-full h-72">
          {/* Background grid */}
          <defs>
            <pattern id="graph-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#222226" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="500" height="320" fill="url(#graph-grid)" opacity="0.6" />

          {/* Links from center to satellites */}
          {satellites.map((node) => (
            <line
              key={`link-${node.id}`}
              x1={center.x}
              y1={center.y}
              x2={node.x}
              y2={node.y}
              stroke={node.color}
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.5"
            />
          ))}

          {/* Center Hub Node */}
          <g
            className="cursor-pointer"
            onClick={() =>
              setSelectedNode({
                label: suspectEntity,
                type: "SYNDICATE_ENTITY",
                detail: `Central target entity coordinating mule account extraction: ${targetMuleAccount}`,
              })
            }
          >
            <circle
              cx={center.x}
              cy={center.y}
              r="26"
              fill="#0f172a"
              stroke="#06b6d4"
              strokeWidth="2.5"
              className="hover:stroke-cyan-300"
            />
            <circle cx={center.x} cy={center.y} r="32" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.3" className="animate-ping" />
            <text x={center.x} y={center.y + 4} fill="#e2e8f0" fontSize="9" textAnchor="middle" fontWeight="bold">
              TARGET
            </text>
          </g>

          {/* Satellite Nodes */}
          {satellites.map((node) => (
            <g
              key={node.id}
              className="cursor-pointer"
              onClick={() => setSelectedNode({ label: node.label, type: node.type, detail: node.detail })}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r="18"
                fill="#121215"
                stroke={node.color}
                strokeWidth="2"
                className="hover:scale-110 transition-transform"
              />
              <text x={node.x} y={node.y + 3} fill="#f8fafc" fontSize="8" textAnchor="middle">
                {node.type.slice(0, 4)}
              </text>
              <text x={node.x} y={node.y + 28} fill="#94a3b8" fontSize="8" textAnchor="middle">
                {node.label.length > 14 ? node.label.slice(0, 12) + "…" : node.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Selected Node Inspector Flyout */}
        {selectedNode && (
          <div className="absolute bottom-2 left-2 right-2 p-3 rounded-lg bg-[#0e0e11] border border-[#27272a] shadow-2xl backdrop-blur-md flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-300 font-bold block">{selectedNode.type}</span>
              <span className="font-semibold text-zinc-100">{selectedNode.label}</span>
              <p className="text-[11px] text-zinc-400">{selectedNode.detail}</p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-500 hover:text-white px-2 py-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
