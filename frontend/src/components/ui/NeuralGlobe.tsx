"use client";

import React, { useRef, useEffect } from "react";

interface Node3D {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  pulsePhase: number;
  pulseSpeed: number;
  connections: number[];
}

interface Pulse3D {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  color: string;
}

interface NeuralGlobeProps {
  size?: number;
  className?: string;
  nodeCount?: number;
}

export function NeuralGlobe({
  size = 680,
  className = "",
  nodeCount = 130,
}: NeuralGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isDestroyed = false;

    // Handle High DPI displays
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvasWidth = size;
    const canvasHeight = size;

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // 1. Generate nodes on sphere using Fibonacci spiral distribution
    const nodes: Node3D[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      nodes.push({
        x,
        y,
        z,
        baseRadius: 1.6 + Math.random() * 1.6,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        connections: [],
      });
    }

    // 2. Connect nearest neighbors (distance threshold)
    const maxConnectionDistance = 0.42;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxConnectionDistance && nodes[i].connections.length < 5) {
          nodes[i].connections.push(j);
        }
      }
    }

    // 3. Synaptic signal pulses
    const pulses: Pulse3D[] = [];
    const pulseColors = ["#818cf8", "#38bdf8", "#a78bfa", "#6ee7b7"];

    const spawnPulse = () => {
      if (pulses.length >= 24) return;
      const from = Math.floor(Math.random() * nodes.length);
      const connections = nodes[from].connections;
      if (connections.length === 0) return;
      const to = connections[Math.floor(Math.random() * connections.length)];

      pulses.push({
        fromNode: from,
        toNode: to,
        progress: 0,
        speed: 0.008 + Math.random() * 0.012,
        color: pulseColors[Math.floor(Math.random() * pulseColors.length)],
      });
    };

    // Pre-populate some pulses
    for (let i = 0; i < 16; i++) {
      spawnPulse();
    }

    // 4. Stable stationary rotation & subtle mouse parallax
    let rotationY = 0;
    const tiltX = 0.28; // ~16 deg axial tilt
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetParallaxX = ((e.clientX / innerWidth) - 0.5) * 0.2;
      targetParallaxY = ((e.clientY / innerHeight) - 0.5) * 0.15;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 5. Render Loop
    const sphereRadius = size * 0.36;
    const focalLength = size * 0.85;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const render = () => {
      if (isDestroyed) return;

      // Slow, steady stationary rotation around central axis
      rotationY += 0.0022;

      // Smooth parallax easing
      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.04;
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.04;

      const totalAngleX = tiltX + currentParallaxY;
      const totalAngleY = rotationY + currentParallaxX;

      const cosY = Math.cos(totalAngleY);
      const sinY = Math.sin(totalAngleY);
      const cosX = Math.cos(totalAngleX);
      const sinX = Math.sin(totalAngleX);

      // Randomly spawn new synaptic pulses
      if (Math.random() < 0.25) {
        spawnPulse();
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Core ambient glow behind sphere
      const ambientGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        sphereRadius * 0.1,
        centerX,
        centerY,
        sphereRadius * 1.15
      );
      ambientGlow.addColorStop(0, "rgba(79, 70, 229, 0.18)");
      ambientGlow.addColorStop(0.4, "rgba(99, 102, 241, 0.08)");
      ambientGlow.addColorStop(0.75, "rgba(56, 189, 248, 0.03)");
      ambientGlow.addColorStop(1, "transparent");

      ctx.fillStyle = ambientGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Project each 3D node
      interface ProjectedNode {
        px: number;
        py: number;
        pz: number;
        scale: number;
        alpha: number;
        radius: number;
        origNode: Node3D;
      }

      const projected: ProjectedNode[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // 3D Rotation around Y then X
        const x1 = n.x * cosY + n.z * sinY;
        const z1 = -n.x * sinY + n.z * cosY;

        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;
        const x2 = x1;

        // Perspective scale
        const scale = focalLength / (focalLength + z2 * sphereRadius);
        const px = centerX + x2 * sphereRadius * scale;
        const py = centerY + y2 * sphereRadius * scale;

        // Depth alpha: front nodes are crisp, back nodes are faint
        const normalizedZ = (z2 + 1) / 2; // 0 (far) to 1 (near)
        const alpha = Math.max(0.12, Math.min(0.95, normalizedZ * 0.85 + 0.1));

        // Pulsing radius
        n.pulsePhase += n.pulseSpeed;
        const pulse = 1 + 0.22 * Math.sin(n.pulsePhase);
        const radius = n.baseRadius * scale * pulse;

        projected.push({
          px,
          py,
          pz: z2,
          scale,
          alpha,
          radius,
          origNode: n,
        });
      }

      // Draw equatorial & latitude orbital guidance rings (faint 3D circles)
      const drawOrbitRing = (tilt: number, dash: number[], color: string, ringRadius: number) => {
        ctx.save();
        ctx.beginPath();
        const steps = 60;
        for (let s = 0; s <= steps; s++) {
          const theta = (s / steps) * Math.PI * 2;
          const rx = Math.cos(theta);
          const ry = 0;
          const rz = Math.sin(theta);

          const rx1 = rx * cosY + rz * sinY;
          const rz1 = -rx * sinY + rz * cosY;

          const ry2 = ry * Math.cos(tilt) - rz1 * Math.sin(tilt);
          const rz2 = ry * Math.sin(tilt) + rz1 * Math.cos(tilt);

          const rScale = focalLength / (focalLength + rz2 * ringRadius);
          const rpx = centerX + rx1 * ringRadius * rScale;
          const rpy = centerY + ry2 * ringRadius * rScale;

          if (s === 0) ctx.moveTo(rpx, rpy);
          else ctx.lineTo(rpx, rpy);
        }
        ctx.setLineDash(dash);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      };

      drawOrbitRing(totalAngleX, [4, 6], "rgba(99, 102, 241, 0.14)", sphereRadius * 1.05);
      drawOrbitRing(totalAngleX + 0.5, [2, 8], "rgba(56, 189, 248, 0.09)", sphereRadius * 1.15);

      // Draw Synaptic Connection Lines (sorted by average depth)
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (const targetIdx of p1.origNode.connections) {
          const p2 = projected[targetIdx];
          if (!p2) continue;

          const avgZ = (p1.pz + p2.pz) / 2;
          const normZ = (avgZ + 1) / 2; // 0 to 1
          const lineAlpha = Math.max(0.04, Math.min(0.45, normZ * 0.45));

          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);

          // Subtle gradient on connection line
          const lineGrad = ctx.createLinearGradient(p1.px, p1.py, p2.px, p2.py);
          lineGrad.addColorStop(0, `rgba(99, 102, 241, ${lineAlpha})`);
          lineGrad.addColorStop(1, `rgba(56, 189, 248, ${lineAlpha * 0.85})`);

          ctx.strokeStyle = lineGrad;
          ctx.lineWidth = Math.max(0.6, 1.2 * p1.scale);
          ctx.stroke();
        }
      }

      // Draw Traveling Synaptic Signal Pulses
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(p, 1);
          continue;
        }

        const p1 = projected[pulse.fromNode];
        const p2 = projected[pulse.toNode];
        if (!p1 || !p2) continue;

        const currentX = p1.px + (p2.px - p1.px) * pulse.progress;
        const currentY = p1.py + (p2.py - p1.py) * pulse.progress;
        const currentZ = p1.pz + (p2.pz - p1.pz) * pulse.progress;

        const pulseNormZ = (currentZ + 1) / 2;
        const pulseAlpha = Math.max(0.1, Math.min(0.95, pulseNormZ));

        // Draw pulse particle with glowing trail
        ctx.beginPath();
        ctx.arc(currentX, currentY, 2.2 * p1.scale, 0, Math.PI * 2);
        ctx.fillStyle = pulse.color;
        ctx.globalAlpha = pulseAlpha;
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // Draw Neural Nodes (front-to-back sorting for crisp rendering)
      projected.sort((a, b) => a.pz - b.pz);

      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];

        // Outer glow halo on front nodes
        if (p.pz > 0.2) {
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.radius * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha * 0.18})`;
          ctx.fill();
        }

        // Inner solid node
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.radius, 0, Math.PI * 2);

        if (p.pz > 0) {
          ctx.fillStyle = `rgba(224, 231, 255, ${p.alpha})`; // crisp warm white/indigo
        } else {
          ctx.fillStyle = `rgba(129, 140, 248, ${p.alpha * 0.75})`;
        }
        ctx.fill();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [size, nodeCount]);

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block pointer-events-none" />
    </div>
  );
}
