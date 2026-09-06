import React from 'react';

// ============================================================================
// Self-Contained UI Primitives (Guarantees zero-dependency compilation)
// ============================================================================

function Background({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative min-h-screen bg-black text-slate-100 font-sans antialiased selection:bg-white/20 selection:text-white ${className}`}>
      {/* Subtle background grid pattern */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-[linear-gradient(to_right,#21262d_1px,transparent_1px),linear-gradient(to_bottom,#21262d_1px,transparent_1px)] bg-[size:48px_48px]" 
        aria-hidden="true" 
      />
      {/* Ambient glass glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary';
  asChild?: boolean;
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
// Types & Mock Data Dataset
// ============================================================================

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type ArtefactType = 'algorithm' | 'key' | 'certificate' | 'protocol' | 'library' | 'cloud_service';
export type AlgorithmClass = 'asymmetric' | 'symmetric' | 'hash';

export interface Artefact {
  id: string;
  name: string;
  type: ArtefactType;
  riskLevel: RiskLevel;
  algorithmClass: AlgorithmClass;
  location: string;
}

const MOCK_ARTEFACTS: Artefact[] = [
  {
    id: 'art-001',
    name: 'RSA-2048',
    type: 'key',
    riskLevel: 'critical',
    algorithmClass: 'asymmetric',
    location: 'src/auth/jwt_verifier.py:42',
  },
  {
    id: 'art-002',
    name: 'ECDSA P-256',
    type: 'algorithm',
    riskLevel: 'critical',
    algorithmClass: 'asymmetric',
    location: 'services/identity/crypto_signer.go:118',
  },
  {
    id: 'art-003',
    name: 'Diffie-Hellman (DH-2048)',
    type: 'protocol',
    riskLevel: 'critical',
    algorithmClass: 'asymmetric',
    location: 'infra/k8s/ingress_tls.yaml:18',
  },
  {
    id: 'art-004',
    name: 'RSA-4096',
    type: 'certificate',
    riskLevel: 'high',
    algorithmClass: 'asymmetric',
    location: 'certs/production_root_ca.crt',
  },
  {
    id: 'art-005',
    name: 'SHA-1',
    type: 'algorithm',
    riskLevel: 'high',
    algorithmClass: 'hash',
    location: 'legacy/utils/hash_checksum.cpp:89',
  },
  {
    id: 'art-006',
    name: '3DES (Triple DES)',
    type: 'algorithm',
    riskLevel: 'high',
    algorithmClass: 'symmetric',
    location: 'src/payment/cipher_pad.py:15',
  },
  {
    id: 'art-007',
    name: 'AES-128-CBC',
    type: 'algorithm',
    riskLevel: 'medium',
    algorithmClass: 'symmetric',
    location: 'services/storage/s3_encrypt.go:204',
  },
  {
    id: 'art-008',
    name: 'OpenSSL 1.1.1k',
    type: 'library',
    riskLevel: 'medium',
    algorithmClass: 'asymmetric',
    location: 'containers/api-server/Dockerfile:12',
  },
  {
    id: 'art-009',
    name: 'MD5',
    type: 'algorithm',
    riskLevel: 'medium',
    algorithmClass: 'hash',
    location: 'src/cache/etags.py:54',
  },
  {
    id: 'art-010',
    name: 'AES-256-GCM',
    type: 'algorithm',
    riskLevel: 'low',
    algorithmClass: 'symmetric',
    location: 'services/vault/kms_client.go:76',
  },
  {
    id: 'art-011',
    name: 'SHA-384',
    type: 'algorithm',
    riskLevel: 'low',
    algorithmClass: 'hash',
    location: 'src/security/audit_logger.py:102',
  },
  {
    id: 'art-012',
    name: 'AWS KMS (SYMMETRIC_DEFAULT)',
    type: 'cloud_service',
    riskLevel: 'low',
    algorithmClass: 'symmetric',
    location: 'terraform/modules/kms/main.tf:45',
  },
];

// Helper: Risk weight sorting order
const RISK_WEIGHTS: Record<RiskLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// ============================================================================
// Main Page Server Component
// ============================================================================

export default function DashboardPage() {
  // Derive aggregate metrics dynamically from dataset
  const totalArtefacts = MOCK_ARTEFACTS.length;

  const criticalCount = MOCK_ARTEFACTS.filter((a) => a.riskLevel === 'critical').length;
  const highCount = MOCK_ARTEFACTS.filter((a) => a.riskLevel === 'high').length;
  const mediumCount = MOCK_ARTEFACTS.filter((a) => a.riskLevel === 'medium').length;
  const lowCount = MOCK_ARTEFACTS.filter((a) => a.riskLevel === 'low').length;

  // Quantum-vulnerable = asymmetric algorithms (vulnerable to Shor's Algorithm)
  const quantumVulnerableCount = MOCK_ARTEFACTS.filter(
    (a) => a.algorithmClass === 'asymmetric'
  ).length;

  const symmetricCount = MOCK_ARTEFACTS.filter((a) => a.algorithmClass === 'symmetric').length;
  const hashCount = MOCK_ARTEFACTS.filter((a) => a.algorithmClass === 'hash').length;

  // Percentage calculations
  const criticalPct = Math.round((criticalCount / totalArtefacts) * 100);
  const highPct = Math.round((highCount / totalArtefacts) * 100);
  const mediumPct = Math.round((mediumCount / totalArtefacts) * 100);
  const lowPct = Math.round((lowCount / totalArtefacts) * 100);

  // Top 5 highest risk items
  const recentFindings = [...MOCK_ARTEFACTS]
    .sort((a, b) => RISK_WEIGHTS[b.riskLevel] - RISK_WEIGHTS[a.riskLevel])
    .slice(0, 5);

  return (
    <Background className="py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
        
        {/* 1. TOP BAR */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex flex-col gap-1">
            <h1
              className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]"
              style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
            >
              Dashboard
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Last scan: <span className="text-slate-200">2 minutes ago</span> ·{' '}
              <span className="text-slate-200 font-semibold">{totalArtefacts} total artefacts</span> evaluated
            </p>
          </div>

          <a href="/scan" className="self-start sm:self-auto">
            <Button type="button" className="text-xs px-4 py-2.5 rounded-xl">
              + New scan
            </Button>
          </a>
        </header>

        {/* 2. SUMMARY CARDS ROW (Asymmetric Sizing) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Large Primary Card (Span 5) */}
          <div className="md:col-span-5 bg-black/60 border border-white/15 rounded-2xl p-6 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  CRYPTOGRAPHIC INVENTORY
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                  CYCLONEDX 1.6
                </span>
              </div>
              <p className="text-xs text-slate-400">Total detected keys, algorithms, & certificates</p>
            </div>

            <div className="my-6">
              <div
                className="text-5xl sm:text-6xl font-bold text-white tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                {totalArtefacts}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-2">
                Across 12 source files & container manifests
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-red-400">{criticalPct}% Critical Exposure</span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-400">{highPct}% High Risk</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{lowPct + mediumPct}% Standard</span>
            </div>
          </div>

          {/* Three Smaller Cards (Span 7 - Grid of 3) */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Critical Count Card */}
            <div className="bg-black/60 border border-red-500/30 rounded-2xl p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(239,68,68,0.1)] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-red-400 font-semibold uppercase tracking-wider">
                  Critical
                </span>
                <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              </div>
              <div
                className="text-4xl font-bold text-white my-1"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                {criticalCount}
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Immediate Shor's algorithm breakdown risk
              </p>
            </div>

            {/* High Count Card */}
            <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.1)] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  High Risk
                </span>
                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              </div>
              <div
                className="text-4xl font-bold text-white my-1"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                {highCount}
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Deprecated hashes or short key lengths
              </p>
            </div>

            {/* Quantum-Vulnerable Card */}
            <div className="bg-black/60 border border-white/20 rounded-2xl p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.05)] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-white font-semibold uppercase tracking-wider">
                  Quantum-Vuln
                </span>
                <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              </div>
              <div
                className="text-4xl font-bold text-white my-1"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                {quantumVulnerableCount}
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Asymmetric primitives requiring PQC migration
              </p>
            </div>
          </div>
        </section>

        {/* 3. RISK BREAKDOWN CHARTS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Risk Level Distribution (Horizontal Stacked / Segment Bar) */}
          <div className="bg-black/60 border border-white/15 rounded-2xl p-6 backdrop-blur-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  Risk Level Breakdown
                </h2>
                <span className="text-xs font-mono text-slate-400">{totalArtefacts} total</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Categorized via Mosca's inequality weighting</p>

              {/* Segmented Horizontal Bar */}
              <div className="w-full h-4 bg-slate-900 rounded-lg overflow-hidden flex border border-white/10 p-0.5 gap-0.5 my-4">
                <div
                  style={{ width: `${criticalPct}%` }}
                  className="bg-red-500 h-full rounded-l transition-all shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  title={`Critical: ${criticalCount}`}
                />
                <div
                  style={{ width: `${highPct}%` }}
                  className="bg-amber-400 h-full transition-all shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  title={`High: ${highCount}`}
                />
                <div
                  style={{ width: `${mediumPct}%` }}
                  className="bg-blue-400 h-full transition-all"
                  title={`Medium: ${mediumCount}`}
                />
                <div
                  style={{ width: `${lowPct}%` }}
                  className="bg-slate-500 h-full rounded-r transition-all"
                  title={`Low: ${lowCount}`}
                />
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 font-mono text-xs">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-red-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Critical ({criticalCount})</span>
                </div>
                <span className="text-[10px] text-slate-500">{criticalPct}%</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>High ({highCount})</span>
                </div>
                <span className="text-[10px] text-slate-500">{highPct}%</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  <span>Medium ({mediumCount})</span>
                </div>
                <span className="text-[10px] text-slate-500">{mediumPct}%</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  <span>Low ({lowCount})</span>
                </div>
                <span className="text-[10px] text-slate-500">{lowPct}%</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Risk-by-Type / Algorithm Class */}
          <div className="bg-black/60 border border-white/15 rounded-2xl p-6 backdrop-blur-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  Cryptographic Class Exposure
                </h2>
                <span className="text-xs font-mono text-slate-400">PQC Threat Matrix</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Asymmetric vs Symmetric vs Hashing algorithms</p>

              {/* Grouped Bar Bars */}
              <div className="space-y-3 font-mono text-xs">
                {/* Asymmetric Bar */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="font-semibold text-white">Asymmetric (Shor's Threat)</span>
                    <span>{quantumVulnerableCount} ({Math.round((quantumVulnerableCount / totalArtefacts) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
                    <div
                      style={{ width: `${(quantumVulnerableCount / totalArtefacts) * 100}%` }}
                      className="bg-white h-full rounded-full shadow-[0_0_8px_#ffffff]"
                    />
                  </div>
                </div>

                {/* Symmetric Bar */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Symmetric (Grover's Weakened)</span>
                    <span>{symmetricCount} ({Math.round((symmetricCount / totalArtefacts) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
                    <div
                      style={{ width: `${(symmetricCount / totalArtefacts) * 100}%` }}
                      className="bg-slate-400 h-full rounded-full"
                    />
                  </div>
                </div>

                {/* Hash Bar */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Hashing Primitives</span>
                    <span>{hashCount} ({Math.round((hashCount / totalArtefacts) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
                    <div
                      style={{ width: `${(hashCount / totalArtefacts) * 100}%` }}
                      className="bg-slate-600 h-full rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-4 border-t border-white/10 mt-4 leading-relaxed">
              *Asymmetric primitives require immediate replacement with NIST ML-KEM / ML-DSA standards.
            </p>
          </div>
        </section>

        {/* 4. QUICK NAV ROW */}
        <section className="flex flex-col gap-3">
          <h2
            className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold"
          >
            Quick Navigation & Analytics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Link Card 1 */}
            <a
              href="/artefacts"
              className="p-4 bg-black/60 border border-white/15 rounded-xl hover:border-white/40 hover:bg-white/5 transition-all group flex flex-col gap-1 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-bold text-sm text-white group-hover:text-white transition-colors"
                  style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  View all artefacts →
                </span>
                <span className="font-mono text-xs text-slate-500">{totalArtefacts} items</span>
              </div>
              <p className="text-xs text-slate-400 leading-snug">
                Filter and inspect all detected algorithms, keys, and certificates.
              </p>
            </a>

            {/* Link Card 2 */}
            <a
              href="/risk-graph"
              className="p-4 bg-black/60 border border-white/15 rounded-xl hover:border-white/40 hover:bg-white/5 transition-all group flex flex-col gap-1 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-bold text-sm text-white group-hover:text-white transition-colors"
                  style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  View risk graph →
                </span>
                <span className="font-mono text-xs text-slate-500">Dependency tree</span>
              </div>
              <p className="text-xs text-slate-400 leading-snug">
                Map call graphs and trace crypto propagation across microservices.
              </p>
            </a>

            {/* Link Card 3 */}
            <a
              href="/reports"
              className="p-4 bg-black/60 border border-white/15 rounded-xl hover:border-white/40 hover:bg-white/5 transition-all group flex flex-col gap-1 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-bold text-sm text-white group-hover:text-white transition-colors"
                  style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  View reports →
                </span>
                <span className="font-mono text-xs text-slate-500">CycloneDX CBOM</span>
              </div>
              <p className="text-xs text-slate-400 leading-snug">
                Export executive PDFs and standardized machine-readable manifests.
              </p>
            </a>
          </div>
        </section>

        {/* 5. RECENT FINDINGS PREVIEW */}
        <section className="bg-black/60 border border-white/15 rounded-2xl p-6 backdrop-blur-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2
                className="text-lg font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                Top Vulnerable Findings
              </h2>
              <p className="text-xs text-slate-400">Highest-priority cryptographic migration candidates</p>
            </div>

            <a
              href="/artefacts"
              className="text-xs font-mono text-slate-300 hover:text-white transition-colors underline decoration-white/30"
            >
              View all →
            </a>
          </div>

          {/* Compact Preview Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Artefact Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {recentFindings.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    {/* Name */}
                    <td className="py-3 px-3 font-semibold text-white">
                      {item.name}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3 text-slate-400 capitalize">
                      {item.type.replace('_', ' ')}
                    </td>

                    {/* Risk Level Badge */}
                    <td className="py-3 px-3">
                      {item.riskLevel === 'critical' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-950/80 text-red-300 border border-red-800/60">
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

                    {/* Location String */}
                    <td className="py-3 px-3 text-slate-400 text-[11px] truncate max-w-xs">
                      {item.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-right">
            <a
              href="/artefacts"
              className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              Showing 5 of {totalArtefacts} total findings · View full inventory →
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="flex items-center justify-between text-xs font-mono text-slate-500 pt-4 border-t border-white/10">
          <span>CBOM ASSESSMENT ENGINE v1.4.2</span>
          <span>SYSTEM exposure: INTERNAL</span>
        </footer>

      </div>
    </Background>
  );
}