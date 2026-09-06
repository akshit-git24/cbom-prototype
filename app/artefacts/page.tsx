'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';

// ============================================================================
// Embedded Self-Contained UI Components (Guarantees zero-dependency compilation)
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
// Types & Mock Data (22 Artefacts)
// ============================================================================

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type ArtefactType = 'algorithm' | 'key' | 'certificate' | 'protocol' | 'library' | 'cloud_service';
export type AlgorithmClass = 'asymmetric' | 'symmetric' | 'hash';
export type SourceOrigin = 'source' | 'binary' | 'container' | 'dependency';

export interface Recommendation {
  replacement: string;
  latencyNote: string;
  costNote: string;
}

export interface Artefact {
  id: string;
  name: string;
  type: ArtefactType;
  location: {
    source: SourceOrigin;
    path: string;
    line?: number;
  };
  quantumVulnerable: boolean;
  algorithmClass: AlgorithmClass;
  confidence: number; // 0.0 to 1.0
  riskLevel: RiskLevel;
  detectionMethod: string;
  recommendation: Recommendation | null;
}

const MOCK_ARTEFACTS: Artefact[] = [
  {
    id: 'art-101',
    name: 'RSA-2048',
    type: 'key',
    location: { source: 'source', path: 'src/auth/jwt_verifier.py', line: 42 },
    quantumVulnerable: true,
    algorithmClass: 'asymmetric',
    confidence: 0.98,
    riskLevel: 'critical',
    detectionMethod: 'static_ast_pattern',
    recommendation: {
      replacement: 'ML-DSA-65 (Dilithium3)',
      latencyNote: '+12% signature generation CPU cycle count',
      costNote: 'Public key size increases from 256 bytes to 1,952 bytes',
    },
  },
  {
    id: 'art-102',
    name: 'ECDSA P-256',
    type: 'algorithm',
    location: { source: 'source', path: 'services/identity/crypto_signer.go', line: 118 },
    quantumVulnerable: true,
    algorithmClass: 'asymmetric',
    confidence: 0.95,
    riskLevel: 'critical',
    detectionMethod: 'static_ast_pattern',
    recommendation: {
      replacement: 'ML-DSA-44 (Dilithium2)',
      latencyNote: '+8% processing overhead',
      costNote: 'Requires updating API schema headers for larger signature payload',
    },
  },
  {
    id: 'art-103',
    name: 'Diffie-Hellman (DH-2048)',
    type: 'protocol',
    location: { source: 'container', path: 'infra/k8s/ingress_tls.yaml', line: 18 },
    quantumVulnerable: true,
    algorithmClass: 'asymmetric',
    confidence: 0.92,
    riskLevel: 'critical',
    detectionMethod: 'x509_parse',
    recommendation: {
      replacement: 'ML-KEM-768 (Kyber768) Hybrid',
      latencyNote: '+1 font-end handshake roundtrip (1.2ms added latency)',
      costNote: 'Minimal compute cost increase; client TLS 1.3 handshake compatibility required',
    },
  },
  {
    id: 'art-104',
    name: 'RSA-4096',
    type: 'certificate',
    location: { source: 'source', path: 'certs/production_root_ca.crt' },
    quantumVulnerable: true,
    algorithmClass: 'asymmetric',
    confidence: 0.99,
    riskLevel: 'high',
    detectionMethod: 'x509_parse',
    recommendation: {
      replacement: 'SLH-DSA-SHA2-128s (Sphincs+)',
      latencyNote: '+45ms Root CA certificate re-signing latency',
      costNote: 'Stateless hash-based signatures; zero state tracking required',
    },
  },
  {
    id: 'art-105',
    name: 'SHA-1',
    type: 'algorithm',
    location: { source: 'source', path: 'legacy/utils/hash_checksum.cpp', line: 89 },
    quantumVulnerable: false,
    algorithmClass: 'hash',
    confidence: 0.89,
    riskLevel: 'high',
    detectionMethod: 'static_ast_pattern',
    recommendation: null,
  },
  {
    id: 'art-106',
    name: '3DES (Triple DES)',
    type: 'algorithm',
    location: { source: 'binary', path: 'bin/legacy_payment_gateway.elf' },
    quantumVulnerable: false,
    algorithmClass: 'symmetric',
    confidence: 0.91,
    riskLevel: 'high',
    detectionMethod: 'entropy_ml_classifier',
    recommendation: null,
  },
  {
    id: 'art-107',
    name: 'ECDH-P384',
    type: 'protocol',
    location: { source: 'source', path: 'services/gateway/tls_config.go', line: 64 },
    quantumVulnerable: true,
    algorithmClass: 'asymmetric',
    confidence: 0.97,
    riskLevel: 'critical',
    detectionMethod: 'static_ast_pattern',
    recommendation: {
      replacement: 'ML-KEM-1024 (Kyber1024)',
      latencyNote: '+2.1ms handshake negotiation overhead',
      costNote: 'Recommended for high-security level 5 parameter matching',
    },
  },
  {
    id: 'art-108',
    name: 'AES-128-CBC',
    type: 'algorithm',
    location: { source: 'source', path: 'services/storage/s3_encrypt.go', line: 204 },
    quantumVulnerable: false,
    algorithmClass: 'symmetric',
    confidence: 0.88,
    riskLevel: 'medium',
    detectionMethod: 'static_ast_pattern',
    recommendation: null,
  },
  {
    id: 'art-109',
    name: 'OpenSSL 1.1.1k',
    type: 'library',
    location: { source: 'container', path: 'containers/api-server/Dockerfile', line: 12 },
    quantumVulnerable: true,
    algorithmClass: 'asymmetric',
    confidence: 0.99,
    riskLevel: 'medium',
    detectionMethod: 'dependency_tree_parse',
    recommendation: {
      replacement: 'OpenSSL 3.4+ / OQS Provider (liboqs)',
      latencyNote: 'Library upgrade required to enable post-quantum providers',
      costNote: 'Upstream OS package update required in Docker base image',
    },
  },
  {
    id: 'art-110',
    name: 'MD5',
    type: 'algorithm',
    location: { source: 'source', path: 'src/cache/etags.py', line: 54 },
    quantumVulnerable: false,
    algorithmClass: 'hash',
    confidence: 0.94,
    riskLevel: 'medium',
    detectionMethod: 'static_ast_pattern',
    recommendation: null,
  },
  {
    id: 'art-111',
    name: 'AES-256-GCM',
    type: 'algorithm',
    location: { source: 'source', path: 'services/vault/kms_client.go', line: 76 },
    quantumVulnerable: false,
    algorithmClass: 'symmetric',
    confidence: 0.99,
    riskLevel: 'low',
    detectionMethod: 'static_ast_pattern',
    recommendation: null,
  },
  {
    id: 'art-112',
    name: 'SHA-384',
    type: 'algorithm',
    location: { source: 'source', path: 'src/security/audit_logger.py', line: 102 },
    quantumVulnerable: false,
    algorithmClass: 'hash',
    confidence: 0.96,
    riskLevel: 'low',
    detectionMethod: 'static_ast_pattern',
    recommendation: null,
  },
  {
    id: 'art-113',
    name: 'Ed25519',
    type: 'key',
    location: { source: 'source', path: 'services/ssh/authorized_keys.go', line: 31 },
    quantumVulnerable: true,
    algorithmClass: 'asymmetric',
    confidence: 0.94,
    riskLevel: 'high',
    detectionMethod: 'static_ast_pattern',
    recommendation: {
      replacement: 'ML-DSA-44 or SLH-DSA-SHA2-128f',
      latencyNote: 'Sub-millisecond verification time',
      costNote: 'Replace SSH host keys across cluster deployment configs',
    },
  },
  {
    id: 'art-114',
    name: 'AWS KMS (SYMMETRIC_DEFAULT)',
    type: 'cloud_service',
    location: { source: 'source', path: 'terraform/modules/kms/main.tf', line: 45 },
    quantumVulnerable: false,
    algorithmClass: 'symmetric',
    confidence: 0.91,
    riskLevel: 'low',
    detectionMethod: 'cloud_infra_scanner',
    recommendation: null,
  },
  {
    id: 'art-115',
    name: 'X25519 Key Exchange',
    type: 'protocol',
    location: { source: 'binary', path: 'bin/wireguard_tunnel.so' },
    quantumVulnerable: true,
    algorithmClass: 'asymmetric',
    confidence: 0.93,
    riskLevel: 'high',
    detectionMethod: 'entropy_ml_classifier',
    recommendation: {
      replacement: 'ML-KEM-768 Hybrid WireGuard',
      latencyNote: '+0.4ms handshake overhead',
      costNote: 'Dual-key state encapsulation overhead',
    },
  },
  {
    id: 'art-116',
    name: 'RC4 (Arcfour)',
    type: 'algorithm',
    location: { source: 'source', path: 'legacy/stream/cipher_stream.c', line: 112 },
    quantumVulnerable: false,
    algorithmClass: 'symmetric',
    confidence: 0.87,
    riskLevel: 'high',
    detectionMethod: 'static_ast_pattern',
    recommendation: null,
  },
  {
    id: 'art-117',
    name: 'PyCryptodome 3.10.1',
    type: 'library',
    location: { source: 'dependency', path: 'requirements.txt', line: 14 },
    quantumVulnerable: true,
    algorithmClass: 'asymmetric',
    confidence: 0.99,
    riskLevel: 'medium',
    detectionMethod: 'dependency_tree_parse',
    recommendation: {
      replacement: 'PyCryptodome 3.20+ with PQC Bindings',
      latencyNote: 'Zero-downtime Python dependency bump',
      costNote: 'Requires testing crypto primitive exports',
    },
  },
  {
    id: 'art-118',
    name: 'TLS 1.0 Cipher Suites',
    type: 'protocol',
    location: { source: 'container', path: 'infra/nginx/nginx.conf', line: 28 },
    quantumVulnerable: true,
    algorithmClass: 'asymmetric',
    confidence: 0.98,
    riskLevel: 'critical',
    detectionMethod: 'static_ast_pattern',
    recommendation: {
      replacement: 'TLS 1.3 with Hybrid Post-Quantum Key Exchange',
      latencyNote: 'Enforces TLS 1.3 1-RTT handshake performance',
      costNote: 'Drops legacy browser clients unable to negotiate TLS 1.3',
    },
  },
  {
    id: 'art-119',
    name: 'DSA-1024',
    type: 'key',
    location: { source: 'source', path: 'legacy/gpg/keys.pgp' },
    quantumVulnerable: true,
    algorithmClass: 'asymmetric',
    confidence: 0.96,
    riskLevel: 'critical',
    detectionMethod: 'x509_parse',
    recommendation: {
      replacement: 'ML-DSA-65',
      latencyNote: 'Significantly improves signature throughput over legacy DSA',
      costNote: 'Deprecated standard; requires immediate key revoke/re-issue',
    },
  },
  {
    id: 'art-120',
    name: 'ChaCha20-Poly1305',
    type: 'algorithm',
    location: { source: 'source', path: 'services/mobile_api/aead.go', line: 52 },
    quantumVulnerable: false,
    algorithmClass: 'symmetric',
    confidence: 0.97,
    riskLevel: 'low',
    detectionMethod: 'static_ast_pattern',
    recommendation: null,
  },
  {
    id: 'art-121',
    name: 'SHA-512/256',
    type: 'algorithm',
    location: { source: 'source', path: 'services/blockchain/block_hasher.rs', line: 140 },
    quantumVulnerable: false,
    algorithmClass: 'hash',
    confidence: 0.99,
    riskLevel: 'low',
    detectionMethod: 'static_ast_pattern',
    recommendation: null,
  },
  {
    id: 'art-122',
    name: 'Bouncy Castle 1.68',
    type: 'library',
    location: { source: 'dependency', path: 'pom.xml', line: 45 },
    quantumVulnerable: true,
    algorithmClass: 'asymmetric',
    confidence: 0.99,
    riskLevel: 'medium',
    detectionMethod: 'dependency_tree_parse',
    recommendation: {
      replacement: 'Bouncy Castle 1.78+ (PQC Provider Included)',
      latencyNote: 'Provides native Java implementations for Kyber & Dilithium',
      costNote: 'Requires update to Java 11+ runtime environment',
    },
  },
];

const RISK_WEIGHTS: Record<RiskLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

type SortKey = 'name' | 'type' | 'location' | 'algorithmClass' | 'riskLevel' | 'confidence';

// ============================================================================
// Main Client Page Component
// ============================================================================

export default function ArtefactsPage() {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [quantumOnly, setQuantumOnly] = useState(false);

  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>('riskLevel');
  const [sortAscending, setSortAscending] = useState(false);

  // Detail Drawer state
  const [selectedArtefact, setSelectedArtefact] = useState<Artefact | null>(null);

  // Ref for focus trap management
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRowRef = useRef<HTMLTableRowElement | null>(null);

  // Check if any filter is active
  const isFiltered = searchTerm.trim() !== '' || riskFilter !== 'all' || typeFilter !== 'all' || quantumOnly;

  const clearFilters = () => {
    setSearchTerm('');
    setRiskFilter('all');
    setTypeFilter('all');
    setQuantumOnly(false);
  };

  // Filter & Sort Logic
  const filteredAndSortedArtefacts = useMemo(() => {
    return MOCK_ARTEFACTS.filter((item) => {
      // Text Search Filter (Name or Path)
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesPath = item.location.path.toLowerCase().includes(query);
        if (!matchesName && !matchesPath) return false;
      }

      // Risk Filter
      if (riskFilter !== 'all' && item.riskLevel !== riskFilter) {
        return false;
      }

      // Type Filter
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }

      // Quantum Vulnerable Only Filter
      if (quantumOnly && !item.quantumVulnerable) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let result = 0;

      if (sortKey === 'riskLevel') {
        result = RISK_WEIGHTS[b.riskLevel] - RISK_WEIGHTS[a.riskLevel];
      } else if (sortKey === 'confidence') {
        result = b.confidence - a.confidence;
      } else if (sortKey === 'name') {
        result = a.name.localeCompare(b.name);
      } else if (sortKey === 'type') {
        result = a.type.localeCompare(b.type);
      } else if (sortKey === 'algorithmClass') {
        result = a.algorithmClass.localeCompare(b.algorithmClass);
      } else if (sortKey === 'location') {
        result = a.location.path.localeCompare(b.location.path);
      }

      return sortAscending ? -result : result;
    });
  }, [searchTerm, riskFilter, typeFilter, quantumOnly, sortKey, sortAscending]);

  // Handle Sort Toggle
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAscending(!sortAscending);
    } else {
      setSortKey(key);
      setSortAscending(false); // default descending for new keys
    }
  };

  // Drawer Keyboard Navigation & Focus Trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedArtefact) {
        closeDrawer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedArtefact]);

  const openDrawer = (artefact: Artefact, e: React.MouseEvent<HTMLTableRowElement> | React.KeyboardEvent<HTMLTableRowElement>) => {
    triggerRowRef.current = e.currentTarget as HTMLTableRowElement;
    setSelectedArtefact(artefact);
  };

  const closeDrawer = () => {
    setSelectedArtefact(null);
    if (triggerRowRef.current) {
      triggerRowRef.current.focus();
    }
  };

  return (
    <Background className="py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-8">
        
        {/* 1. HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex flex-col gap-1">
            <h1
              className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]"
              style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
            >
              Cryptographic Artefacts
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Showing <span className="text-slate-200 font-semibold">{filteredAndSortedArtefacts.length}</span> of{' '}
              <span className="text-slate-200">{MOCK_ARTEFACTS.length}</span> detected cryptographic assets
            </p>
          </div>

          <a href="/reports" className="self-start sm:self-auto">
            <Button type="button" className="text-xs px-4 py-2.5 rounded-xl">
              Export report →
            </Button>
          </a>
        </header>

        {/* 2. FILTER BAR */}
        <section className="bg-black/60 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            
            {/* Search Input (Span 4) */}
            <div className="lg:col-span-4 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by algorithm or file path..."
                className="w-full bg-black/80 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-white transition-all"
                aria-label="Search artefacts"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-mono"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Risk Level Dropdown (Span 3) */}
            <div className="lg:col-span-3">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
                aria-label="Filter by Risk Level"
              >
                <option value="all">Risk Level: All</option>
                <option value="critical">Risk Level: Critical</option>
                <option value="high">Risk Level: High</option>
                <option value="medium">Risk Level: Medium</option>
                <option value="low">Risk Level: Low</option>
              </select>
            </div>

            {/* Type Dropdown (Span 3) */}
            <div className="lg:col-span-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
                aria-label="Filter by Type"
              >
                <option value="all">Type: All Assets</option>
                <option value="algorithm">Type: Algorithm</option>
                <option value="key">Type: Key</option>
                <option value="certificate">Type: Certificate</option>
                <option value="protocol">Type: Protocol</option>
                <option value="library">Type: Library</option>
                <option value="cloud_service">Type: Cloud Service</option>
              </select>
            </div>

            {/* Quantum Vulnerable Checkbox (Span 2) */}
            <div className="lg:col-span-2 flex items-center gap-2 px-1">
              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={quantumOnly}
                  onChange={(e) => setQuantumOnly(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-white/20 bg-black text-white focus:ring-white focus:ring-offset-black"
                />
                <span className="text-[11px]">PQC Vulnerable Only</span>
              </label>
            </div>
          </div>

          {/* Active Filter Clear Link */}
          {isFiltered && (
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono">
              <span className="text-slate-400 text-[11px]">
                Active filters applied
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="text-slate-300 hover:text-white underline decoration-white/30 text-[11px] transition-colors focus:outline-none focus:ring-1 focus:ring-white rounded px-1"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>

        {/* 3. TABLE SECTION */}
        <section className="bg-black/60 border border-white/15 rounded-2xl overflow-hidden backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-white/15 bg-black/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  
                  {/* Column 1: Name */}
                  <th className="py-3.5 px-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-white transition-colors focus:outline-none"
                    >
                      <span>Artefact Name</span>
                      {sortKey === 'name' && (
                        <span>{sortAscending ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>

                  {/* Column 2: Type */}
                  <th className="py-3.5 px-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort('type')}
                      className="flex items-center gap-1 hover:text-white transition-colors focus:outline-none"
                    >
                      <span>Type</span>
                      {sortKey === 'type' && (
                        <span>{sortAscending ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>

                  {/* Column 3: Location */}
                  <th className="py-3.5 px-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort('location')}
                      className="flex items-center gap-1 hover:text-white transition-colors focus:outline-none"
                    >
                      <span>Location</span>
                      {sortKey === 'location' && (
                        <span>{sortAscending ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>

                  {/* Column 4: Algorithm Class */}
                  <th className="py-3.5 px-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort('algorithmClass')}
                      className="flex items-center gap-1 hover:text-white transition-colors focus:outline-none"
                    >
                      <span>Class</span>
                      {sortKey === 'algorithmClass' && (
                        <span>{sortAscending ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>

                  {/* Column 5: Risk Level */}
                  <th className="py-3.5 px-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort('riskLevel')}
                      className="flex items-center gap-1 hover:text-white transition-colors focus:outline-none"
                    >
                      <span>Risk Level</span>
                      {sortKey === 'riskLevel' && (
                        <span>{sortAscending ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>

                  {/* Column 6: Confidence (Hidden on mobile) */}
                  <th className="py-3.5 px-4 font-semibold hidden md:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort('confidence')}
                      className="flex items-center gap-1 hover:text-white transition-colors focus:outline-none"
                    >
                      <span>Confidence</span>
                      {sortKey === 'confidence' && (
                        <span>{sortAscending ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 font-mono">
                {filteredAndSortedArtefacts.length > 0 ? (
                  filteredAndSortedArtefacts.map((item) => (
                    <tr
                      key={item.id}
                      tabIndex={0}
                      onClick={(e) => openDrawer(item, e)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openDrawer(item, e);
                        }
                      }}
                      className="hover:bg-white/10 focus:bg-white/10 focus:outline-none transition-colors cursor-pointer group"
                    >
                      {/* Name & Quantum Badge */}
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-white transition-colors">
                            {item.name}
                          </span>
                          {item.quantumVulnerable && (
                            <span
                              className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]"
                              title="Vulnerable to Shor's Algorithm"
                            />
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 text-slate-400 capitalize text-[11px]">
                        {item.type.replace('_', ' ')}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] max-w-xs truncate" title={item.location.path}>
                        <span>{item.location.path}</span>
                        {item.location.line && (
                          <span className="text-slate-600 font-normal">:{item.location.line}</span>
                        )}
                      </td>

                      {/* Algorithm Class */}
                      <td className="py-3.5 px-4 text-slate-300 text-[11px] capitalize">
                        {item.algorithmClass}
                      </td>

                      {/* Risk Level Badge */}
                      <td className="py-3.5 px-4">
                        {item.riskLevel === 'critical' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-950/80 text-red-300 border border-red-800/60 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                            CRITICAL
                          </span>
                        )}
                        {item.riskLevel === 'high' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                            HIGH
                          </span>
                        )}
                        {item.riskLevel === 'medium' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60">
                            MEDIUM
                          </span>
                        )}
                        {item.riskLevel === 'low' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            LOW
                          </span>
                        )}
                      </td>

                      {/* Confidence Score Bar (Hidden on Mobile) */}
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/10">
                            <div
                              className="bg-white h-full rounded-full"
                              style={{ width: `${item.confidence * 100}%` }}
                            />
                          </div>
                          <span>{Math.round(item.confidence * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* Empty State */
                  <tr>
                    <td colSpan={6} className="py-12 px-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <p className="text-sm font-mono text-slate-400">
                          No artefacts match these filters
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={clearFilters}
                          className="text-xs px-4 py-2 rounded-xl"
                        >
                          Clear filters
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="flex items-center justify-between text-xs font-mono text-slate-500 pt-4 border-t border-white/10">
          <span>CBOM ASSESSMENT ENGINE v1.4.2</span>
          <span>SYSTEM exposure: INTERNAL</span>
        </footer>

      </div>

      {/* 4. DETAIL DRAWER (SLIDE-OVER OVERLAY) */}
      {selectedArtefact && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Semi-transparent backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Details for ${selectedArtefact.name}`}
            className="relative z-10 w-full max-w-lg bg-black/95 border-l border-white/15 p-6 md:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl h-full backdrop-blur-2xl"
          >
            {/* Top Bar: Close Button */}
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Artefact Details
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDrawer}
                  className="text-xs px-2.5 py-1 rounded-lg"
                  aria-label="Close drawer"
                >
                  ✕ Close
                </Button>
              </div>

              {/* Title & Quantum Badge */}
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center justify-between">
                  <h2
                    className="text-2xl font-bold text-white tracking-tight"
                    style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                  >
                    {selectedArtefact.name}
                  </h2>
                  
                  {selectedArtefact.riskLevel === 'critical' && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-red-950/80 text-red-300 border border-red-800/60">
                      CRITICAL RISK
                    </span>
                  )}
                  {selectedArtefact.riskLevel === 'high' && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                      HIGH RISK
                    </span>
                  )}
                  {selectedArtefact.riskLevel === 'medium' && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60">
                      MEDIUM RISK
                    </span>
                  )}
                  {selectedArtefact.riskLevel === 'low' && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      LOW RISK
                    </span>
                  )}
                </div>

                {selectedArtefact.quantumVulnerable && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 font-mono text-xs flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span>Quantum-Vulnerable (Shor's Algorithm Exposure)</span>
                  </div>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="space-y-4 font-mono text-xs">
                {/* Location */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold">Location / Path</span>
                  <span className="text-white text-xs break-all">
                    {selectedArtefact.location.path}
                    {selectedArtefact.location.line && `:${selectedArtefact.location.line}`}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    Origin: {selectedArtefact.location.source} layer
                  </span>
                </div>

                {/* Class & Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold">Asset Type</span>
                    <span className="text-white capitalize">{selectedArtefact.type.replace('_', ' ')}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold">Algorithm Class</span>
                    <span className="text-white capitalize">{selectedArtefact.algorithmClass}</span>
                  </div>
                </div>

                {/* Detection Method & Confidence */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold">Detection Engine</span>
                    <span className="text-white">{selectedArtefact.detectionMethod}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold">Confidence Score</span>
                    <span className="text-slate-200 font-bold">{Math.round(selectedArtefact.confidence * 100)}%</span>
                  </div>
                </div>

                {/* PQC Recommendation Panel */}
                {selectedArtefact.recommendation ? (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/20 flex flex-col gap-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      NIST PQC Migration Path
                    </span>

                    <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                      <span>Recommended Replacement:</span>
                      <span className="bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 text-emerald-300">
                        {selectedArtefact.recommendation.replacement}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-300 pt-2 border-t border-white/10 leading-relaxed font-sans">
                      <p>
                        <strong className="font-mono text-slate-200">Latency Note:</strong>{' '}
                        {selectedArtefact.recommendation.latencyNote}
                      </p>
                      <p>
                        <strong className="font-mono text-slate-200">Cost / Payload Note:</strong>{' '}
                        {selectedArtefact.recommendation.costNote}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 text-slate-400 text-xs font-sans">
                    Symmetric or cryptographic primitive does not require immediate post-quantum replacement. Ensure key sizes meet Grover mitigation thresholds (AES-256 / SHA-384).
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 border-t border-white/10 mt-6 flex justify-between items-center">
              <span className="font-mono text-[10px] text-slate-500">ID: {selectedArtefact.id}</span>
              <Button
                type="button"
                onClick={closeDrawer}
                className="text-xs px-5 py-2.5 rounded-xl"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </Background>
  );
}