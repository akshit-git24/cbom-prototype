'use client';

import React, { useState, useMemo, useRef } from 'react';
import AppNav from '@/app/components/navbar';

// ============================================================================
// Self-Contained UI Primitives (Guarantees zero-dependency compilation)
// ============================================================================

function Background({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative min-h-screen bg-black text-slate-100 font-sans antialiased selection:bg-white/20 selection:text-white ${className}`}>
      {/* Background grid overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-[linear-gradient(to_right,#21262d_1px,transparent_1px),linear-gradient(to_bottom,#21262d_1px,transparent_1px)] bg-[size:48px_48px]" 
        aria-hidden="true" 
      />
      {/* Ambient background glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary';
}

function Button({ children, className = '', variant = 'default', ...props }: ButtonProps) {
  let baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:pointer-events-none disabled:opacity-50';

  let variantStyles = '';
  if (variant === 'default') {
    variantStyles =
      'bg-white text-black hover:bg-white/90 shadow-[0_0_25px_rgba(255,255,255,0.35)] hover:shadow-[0_0_35px_rgba(255,255,255,0.55)]';
  } else if (variant === 'outline') {
    variantStyles =
      'border border-white/20 bg-black/60 hover:bg-white/10 text-white backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]';
  } else if (variant === 'secondary') {
    variantStyles = 'bg-slate-800 text-slate-100 hover:bg-slate-700';
  }

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ============================================================================
// Graph Data Types & Mock Graph Definitions
// ============================================================================

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';
export type NodeType = 'system' | 'library' | 'artefact';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  riskLevel: RiskLevel;
  x: number;
  y: number;
  description: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  riskLevel: RiskLevel;
}

const GRAPH_NODES: GraphNode[] = [
  // COLUMN 1: SYSTEMS (Left - x: 120)
  {
    id: 'sys-auth',
    label: 'Authentication Gateway',
    type: 'system',
    riskLevel: 'critical',
    x: 120,
    y: 100,
    description: 'Public-facing IAM proxy handling SSO sessions and JWT tokens.',
  },
  {
    id: 'sys-payments',
    label: 'Payment Processor API',
    type: 'system',
    riskLevel: 'critical',
    x: 120,
    y: 260,
    description: 'PCI-DSS compliant payment gateway handling credit card transactions.',
  },
  {
    id: 'sys-audit',
    label: 'Audit Logging Microservice',
    type: 'system',
    riskLevel: 'high',
    x: 120,
    y: 420,
    description: 'Internal telemetry service recording system events and access logs.',
  },

  // COLUMN 2: LIBRARIES (Middle - x: 480)
  {
    id: 'lib-pycrypto',
    label: 'PyCryptodome 3.10.1',
    type: 'library',
    riskLevel: 'critical',
    x: 480,
    y: 90,
    description: 'Python cryptographic library used for JWT signing and RSA key generation.',
  },
  {
    id: 'lib-bouncy',
    label: 'Bouncy Castle 1.68',
    type: 'library',
    riskLevel: 'critical',
    x: 480,
    y: 220,
    description: 'Java cryptographic provider underpinning payment payload encryption.',
  },
  {
    id: 'lib-openssl',
    label: 'OpenSSL 1.1.1k',
    type: 'library',
    riskLevel: 'high',
    x: 480,
    y: 350,
    description: 'Legacy OpenSSL library installed in base container images.',
  },
  {
    id: 'lib-sodium',
    label: 'libsodium 1.0.18',
    type: 'library',
    riskLevel: 'none',
    x: 480,
    y: 480,
    description: 'Modern cryptographic library using quantum-resistant symmetric defaults.',
  },

  // COLUMN 3: ARTEFACTS / PRIMITIVES (Right - x: 840)
  {
    id: 'art-rsa2048',
    label: 'RSA-2048 Key',
    type: 'artefact',
    riskLevel: 'critical',
    x: 840,
    y: 80,
    description: 'Vulnerable to Shor\'s algorithm (complete key recovery).',
  },
  {
    id: 'art-ecdsa256',
    label: 'ECDSA P-256',
    type: 'artefact',
    riskLevel: 'critical',
    x: 840,
    y: 200,
    description: 'Elliptic curve signatures broken by quantum computers.',
  },
  {
    id: 'art-sha1',
    label: 'SHA-1 Digest',
    type: 'artefact',
    riskLevel: 'high',
    x: 840,
    y: 320,
    description: 'Deprecated hash algorithm with known collision vulnerabilities.',
  },
  {
    id: 'art-aes256',
    label: 'AES-256-GCM',
    type: 'artefact',
    riskLevel: 'none',
    x: 840,
    y: 440,
    description: 'Symmetric cipher with 128-bit quantum security under Grover\'s algorithm.',
  },
];

const GRAPH_EDGES: GraphEdge[] = [
  // System -> Library Edges
  { id: 'e1', from: 'sys-auth', to: 'lib-pycrypto', riskLevel: 'critical' },
  { id: 'e2', from: 'sys-auth', to: 'lib-openssl', riskLevel: 'high' },
  { id: 'e3', from: 'sys-payments', to: 'lib-bouncy', riskLevel: 'critical' },
  { id: 'e4', from: 'sys-payments', to: 'lib-sodium', riskLevel: 'none' },
  { id: 'e5', from: 'sys-audit', to: 'lib-pycrypto', riskLevel: 'high' },
  { id: 'e6', from: 'sys-audit', to: 'lib-openssl', riskLevel: 'high' },

  // Library -> Artefact Edges
  { id: 'e7', from: 'lib-pycrypto', to: 'art-rsa2048', riskLevel: 'critical' },
  { id: 'e8', from: 'lib-bouncy', to: 'art-ecdsa256', riskLevel: 'critical' },
  { id: 'e9', from: 'lib-openssl', to: 'art-sha1', riskLevel: 'high' },
  { id: 'e10', from: 'lib-sodium', to: 'art-aes256', riskLevel: 'none' },
];

const RISK_COLOR_MAP: Record<RiskLevel, { stroke: string; fill: string; badgeBg: string; text: string }> = {
  critical: {
    stroke: '#ef4444',
    fill: 'rgba(239, 68, 68, 0.15)',
    badgeBg: 'bg-red-950/80 border-red-800/60 text-red-300',
    text: 'text-red-400',
  },
  high: {
    stroke: '#f59e0b',
    fill: 'rgba(245, 158, 11, 0.15)',
    badgeBg: 'bg-amber-950/80 border-amber-800/60 text-amber-300',
    text: 'text-amber-400',
  },
  medium: {
    stroke: '#60a5fa',
    fill: 'rgba(96, 165, 250, 0.15)',
    badgeBg: 'bg-blue-950/80 border-blue-800/60 text-blue-300',
    text: 'text-blue-400',
  },
  low: {
    stroke: '#94a3b8',
    fill: 'rgba(148, 163, 184, 0.15)',
    badgeBg: 'bg-slate-800 border-slate-700 text-slate-300',
    text: 'text-slate-400',
  },
  none: {
    stroke: '#334155',
    fill: 'rgba(51, 65, 85, 0.2)',
    badgeBg: 'bg-slate-900 border-slate-800 text-slate-400',
    text: 'text-slate-400',
  },
};

// ============================================================================
// Main Page Component
// ============================================================================

export default function RiskGraphPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('sys-auth');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);

  // Active selected node object
  const selectedNode = useMemo(
    () => GRAPH_NODES.find((n) => n.id === selectedNodeId) || null,
    [selectedNodeId]
  );

  // Derive connected nodes & edges for highlighting
  const connectedEdgeIds = useMemo(() => {
    const targetId = hoveredNodeId || selectedNodeId;
    if (!targetId) return new Set<string>();

    const connected = new Set<string>();
    
    // BFS/DFS trace to find all connected direct edges
    GRAPH_EDGES.forEach((e) => {
      if (e.from === targetId || e.to === targetId) {
        connected.add(e.id);
      }
    });

    // If selected target is a system, also trace down to artefacts
    const libraryIds = GRAPH_EDGES.filter((e) => e.from === targetId).map((e) => e.to);
    GRAPH_EDGES.forEach((e) => {
      if (libraryIds.includes(e.from)) {
        connected.add(e.id);
      }
    });

    // If selected target is an artefact, trace back up to systems
    const parentLibIds = GRAPH_EDGES.filter((e) => e.to === targetId).map((e) => e.from);
    GRAPH_EDGES.forEach((e) => {
      if (parentLibIds.includes(e.to)) {
        connected.add(e.id);
      }
    });

    return connected;
  }, [selectedNodeId, hoveredNodeId]);

  // Derive connected nodes set
  const connectedNodeIds = useMemo(() => {
    const targetId = hoveredNodeId || selectedNodeId;
    if (!targetId) return new Set<string>();

    const nodes = new Set<string>([targetId]);
    GRAPH_EDGES.forEach((e) => {
      if (connectedEdgeIds.has(e.id)) {
        nodes.add(e.from);
        nodes.add(e.to);
      }
    });
    return nodes;
  }, [connectedEdgeIds, selectedNodeId, hoveredNodeId]);

  // Derive downstream risk artefacts for selected node
  const exposedArtefacts = useMemo(() => {
    if (!selectedNode) return [];

    if (selectedNode.type === 'artefact') {
      return [selectedNode];
    }

    if (selectedNode.type === 'system') {
      // Find libraries this system depends on
      const libIds = GRAPH_EDGES.filter((e) => e.from === selectedNode.id).map((e) => e.to);
      // Find artefacts those libraries use
      const artIds = GRAPH_EDGES.filter((e) => libIds.includes(e.from)).map((e) => e.to);
      return GRAPH_NODES.filter((n) => artIds.includes(n.id));
    }

    if (selectedNode.type === 'library') {
      // Find artefacts this library uses directly
      const artIds = GRAPH_EDGES.filter((e) => e.from === selectedNode.id).map((e) => e.to);
      return GRAPH_NODES.filter((n) => artIds.includes(n.id));
    }

    return [];
  }, [selectedNode]);

  return (
    <>
      <AppNav />
      <Background>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col gap-8">
        
        {/* 1. HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex flex-col gap-1">
            <h1
              className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]"
              style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
            >
              Risk Propagation Graph
            </h1>
            <p className="text-xs font-mono text-slate-400 max-w-2xl leading-relaxed">
              Trace how quantum risk flows from vulnerable cryptographic primitives up through dependency libraries to top-level system architectures.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <a href="/scan">
              <Button type="button" className="text-xs px-4 py-2.5 rounded-xl">
                + New scan
              </Button>
            </a>
          </div>
        </header>

        {/* 2. LEGEND */}
        <section className="bg-black/60 border border-white/15 rounded-2xl p-4 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          
          {/* Risk Colors */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-400 font-semibold">Risk Level:</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="text-red-400">Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              <span className="text-amber-400">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
              <span className="text-slate-400">Not Vulnerable</span>
            </div>
          </div>

          {/* Node Shapes/Columns */}
          <div className="flex items-center gap-6 text-slate-400 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-white/10 border border-white/30" />
              <span>1. Systems</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-white/10 border border-white/30" />
              <span>2. Libraries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rotate-45 bg-white/10 border border-white/30" />
              <span>3. Cryptographic Primitives</span>
            </div>
          </div>
        </section>

        {/* 3. GRAPH CANVAS & SELECTED NODE PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SVG Graph Viewport (Span 8) */}
          <section className="lg:col-span-8 bg-black/60 border border-white/15 rounded-2xl p-4 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] relative overflow-hidden">
            
            {/* Header Column Labels */}
            <div className="grid grid-cols-3 text-center text-[10px] font-mono text-slate-400 border-b border-white/10 pb-3 mb-2 uppercase tracking-wider">
              <span>Target Systems</span>
              <span>Dependency Libraries</span>
              <span>Crypto Primitives</span>
            </div>

            {/* Scrollable Canvas Area */}
            <div
              ref={graphContainerRef}
              className="overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing pb-2"
            >
              <svg
                viewBox="0 0 960 560"
                className="w-full min-w-[700px] h-auto select-none"
                style={{ maxHeight: '560px' }}
              >
                <defs>
                  {/* Arrowhead Markers */}
                  <marker
                    id="arrow-critical"
                    viewBox="0 0 10 10"
                    refX="28"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                  </marker>

                  <marker
                    id="arrow-high"
                    viewBox="0 0 10 10"
                    refX="28"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                  </marker>

                  <marker
                    id="arrow-none"
                    viewBox="0 0 10 10"
                    refX="28"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
                  </marker>
                </defs>

                {/* 1. DRAW EDGES */}
                <g className="edges">
                  {GRAPH_EDGES.map((edge) => {
                    const fromNode = GRAPH_NODES.find((n) => n.id === edge.from);
                    const toNode = GRAPH_NODES.find((n) => n.id === edge.to);
                    if (!fromNode || !toNode) return null;

                    const isConnected = connectedEdgeIds.has(edge.id);
                    const hasActiveSelection = selectedNodeId || hoveredNodeId;

                    // Smooth cubic bezier curve connecting node columns
                    const deltaX = toNode.x - fromNode.x;
                    const pathData = `M ${fromNode.x} ${fromNode.y} C ${fromNode.x + deltaX * 0.5} ${fromNode.y}, ${toNode.x - deltaX * 0.5} ${toNode.y}, ${toNode.x} ${toNode.y}`;

                    const colors = RISK_COLOR_MAP[edge.riskLevel];

                    return (
                      <path
                        key={edge.id}
                        d={pathData}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth={isConnected ? 3 : 1}
                        strokeOpacity={hasActiveSelection ? (isConnected ? 0.95 : 0.1) : 0.4}
                        markerEnd={`url(#arrow-${edge.riskLevel === 'critical' ? 'critical' : edge.riskLevel === 'high' ? 'high' : 'none'})`}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </g>

                {/* 2. DRAW NODES */}
                <g className="nodes">
                  {GRAPH_NODES.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const isHovered = hoveredNodeId === node.id;
                    const isConnected = connectedNodeIds.has(node.id);
                    const hasActiveSelection = selectedNodeId || hoveredNodeId;

                    const opacity = hasActiveSelection ? (isConnected ? 1 : 0.25) : 1;
                    const colors = RISK_COLOR_MAP[node.riskLevel];

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => setSelectedNodeId(node.id)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedNodeId(node.id);
                          }
                        }}
                        className="cursor-pointer focus:outline-none transition-all duration-300"
                        style={{ opacity }}
                      >
                        <title>{`${node.label} (${node.riskLevel.toUpperCase()}) - ${node.description}`}</title>

                        {/* Node Background Shape */}
                        {node.type === 'system' && (
                          <rect
                            x={-80}
                            y={-24}
                            width={160}
                            height={48}
                            rx={8}
                            fill={colors.fill}
                            stroke={colors.stroke}
                            strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                            className="transition-all"
                          />
                        )}

                        {node.type === 'library' && (
                          <rect
                            x={-75}
                            y={-22}
                            width={150}
                            height={44}
                            rx={22}
                            fill={colors.fill}
                            stroke={colors.stroke}
                            strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                            className="transition-all"
                          />
                        )}

                        {node.type === 'artefact' && (
                          <polygon
                            points="-70,-20 70,-20 80,0 70,20 -70,20 -80,0"
                            fill={colors.fill}
                            stroke={colors.stroke}
                            strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                            className="transition-all"
                          />
                        )}

                        {/* Node Active Glow Ring */}
                        {isSelected && (
                          <circle
                            r={36}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            className="animate-spin"
                            style={{ animationDuration: '10s' }}
                          />
                        )}

                        {/* Node Text Label */}
                        <text
                          textAnchor="middle"
                          dy="4"
                          fill="#ffffff"
                          fontSize="11"
                          fontFamily="IBM Plex Mono, monospace"
                          fontWeight={isSelected ? '600' : '400'}
                          className="pointer-events-none drop-shadow-md"
                        >
                          {node.label.length > 18 ? `${node.label.slice(0, 16)}...` : node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            <div className="pt-2 text-center text-[10px] font-mono text-slate-500">
              Click or hover any node to trace risk propagation vectors across components
            </div>
          </section>

          {/* 4. SELECTED NODE PANEL (Span 4) */}
          <aside className="lg:col-span-4 bg-black/60 border border-white/15 rounded-2xl p-6 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] flex flex-col justify-between min-h-[480px]">
            {selectedNode ? (
              <div className="flex flex-col gap-6">
                
                {/* Header Info */}
                <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                      Selected Node Analysis
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${RISK_COLOR_MAP[selectedNode.riskLevel].badgeBg}`}>
                      {selectedNode.riskLevel} risk
                    </span>
                  </div>

                  <h2
                    className="text-xl font-bold text-white tracking-tight"
                    style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                  >
                    {selectedNode.label}
                  </h2>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Node Metadata List */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">Architecture Layer:</span>
                    <span className="text-white capitalize font-semibold">{selectedNode.type}</span>
                  </div>

                  {/* Connected Exposed Artefacts List */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col gap-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Exposed Cryptographic Primitives ({exposedArtefacts.length})
                    </span>

                    {exposedArtefacts.length > 0 ? (
                      <ul className="space-y-2 pt-1">
                        {exposedArtefacts.map((art) => (
                          <li
                            key={art.id}
                            className="flex items-center justify-between bg-black/80 p-2 rounded-lg border border-white/10"
                          >
                            <span className="text-white text-xs font-semibold">{art.label}</span>
                            <span className={`text-[10px] font-bold ${RISK_COLOR_MAP[art.riskLevel].text}`}>
                              {art.riskLevel.toUpperCase()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-slate-500 italic">No vulnerable primitives detected.</span>
                    )}
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="pt-2">
                  <a
                    href="/artefacts"
                    className="inline-flex items-center gap-1 text-xs font-mono text-slate-300 hover:text-white transition-colors underline decoration-white/30"
                  >
                    Inspect in artefacts table →
                  </a>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 font-mono text-xs gap-2">
                <span>No node selected</span>
                <span className="text-[11px] text-slate-600">Select a system or library node in the graph</span>
              </div>
            )}

            {/* Panel Footer */}
            <div className="pt-4 border-t border-white/10 text-[10px] font-mono text-slate-500 flex justify-between">
              <span>GRAPH_ENGINE v2.1</span>
              <span>NODES: {GRAPH_NODES.length}</span>
            </div>
          </aside>

        </div>

        {/* FOOTER */}
        <footer className="flex items-center justify-between text-xs font-mono text-slate-500 pt-4 border-t border-white/10">
          <span>CBOM ASSESSMENT ENGINE v1.4.2</span>
          <span>SYSTEM exposure: INTERNAL</span>
        </footer>

      </div>
      </Background>
    </>
  );
}