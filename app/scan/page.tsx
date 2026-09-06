'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { MagneticButton } from "@/components/ui/magnetic-button";
import AppNav from '@/app/components/navbar';

interface UploadedFile {
  id: string;
  name: string;
  sizeFormatted: string;
}

export default function StartScanPage() {
  // Source Selection State
  const [activeTab, setActiveTab] = useState<'github' | 'local' | 'upload'>('github');
  const [githubUrl, setGithubUrl] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scan Targets State
  const [scanTargets, setScanTargets] = useState({
    sourceCode: true,
    binaries: true,
    dependencies: true,
    containers: true,
  });

  // Metadata Tagging State
  const [exposureTag, setExposureTag] = useState<'internal' | 'external'>('internal');

  // Live Progress State
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('Initializing workspace sandbox...');
  const [artefactsFound, setArtefactsFound] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Validate current active tab input
  const isSourceValid = useCallback(() => {
    if (activeTab === 'github') {
      return githubUrl.trim().toLowerCase().startsWith('https://github.com/');
    }
    if (activeTab === 'local') {
      return localPath.trim().length > 0;
    }
    if (activeTab === 'upload') {
      return uploadedFiles.length > 0;
    }
    return false;
  }, [activeTab, githubUrl, localPath, uploadedFiles]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFileList = (fileList: FileList | File[]) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map((file, idx) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${idx}`,
      name: file.name,
      sizeFormatted: formatFileSize(file.size),
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileList(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileList(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Toggle Target Checkboxes
  const toggleTarget = (key: keyof typeof scanTargets) => {
    setScanTargets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Start Simulated Scan Pipeline
  const handleStartScan = () => {
    if (!isSourceValid() || isScanning) return;

    setIsScanning(true);
    setProgress(0);
    setArtefactsFound(0);
    setIsComplete(false);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setTimeout(() => {
        setProgress(100);
        setArtefactsFound(47);
        setCurrentStage('Done.');
        setIsScanning(false);
        setIsComplete(true);
      }, 800);
      return;
    }

    const stages = [
      { threshold: 15, label: 'Parsing source tree & AST structure...' },
      { threshold: 35, label: 'Scanning for known crypto calls (RSA, ECC, AES)...' },
      { threshold: 60, label: 'Checking dependency tree & SBOM manifests...' },
      { threshold: 80, label: 'Applying Mosca\'s inequality & scoring risk...' },
      { threshold: 95, label: 'Generating CycloneDX CBOM report...' },
      { threshold: 100, label: 'Done.' },
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 4) + 2;

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setProgress(100);
        setArtefactsFound(47);
        setCurrentStage('Done.');
        setIsScanning(false);
        setIsComplete(true);
      } else {
        setProgress(currentProgress);

        const activeStage = stages.find((s) => currentProgress <= s.threshold);
        if (activeStage) {
          setCurrentStage(activeStage.label);
        }

        if (currentProgress > 20) {
          setArtefactsFound(Math.floor((currentProgress / 100) * 47));
        }
      }
    }, 120);
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans antialiased selection:bg-white/20 selection:text-white">
      {/* Dynamic keyframes — mirrors main page */}
      <style>{`
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #000000; }
        @keyframes scanline {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(1000%); opacity: 0; }
        }
        .animate-scan { animation: scanline 4s cubic-bezier(0.4,0,0.6,1) infinite; }
        @media (prefers-reduced-motion: reduce) { .animate-scan { animation: none; } }
      `}</style>

      {/* Canvas ripple background */}
      <BackgroundRippleEffect />

      {/* Ambient glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/[0.03] rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-1/3 left-1/4 w-[400px] h-[250px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Navbar */}
      <AppNav />

      {/* Content layer */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16 flex flex-col gap-8">

        {/* HEADER */}
        <header className="flex flex-col items-start gap-3">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Start a new scan
          </h1>

          <p className="text-white/60 text-sm sm:text-base max-w-2xl leading-relaxed">
            Configure your target repository, binary, or dependency manifests to inventory cryptographic usage and evaluate post-quantum migration urgency.
          </p>
        </header>

        {/* MAIN SCAN FORM PANEL */}
        <div className="bg-black/60 border border-white/15 rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.12)] flex flex-col gap-8 relative overflow-hidden">
          {/* Glossy top sheen */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* SECTION 1: SOURCE INPUT */}
          <section className="flex flex-col gap-4">
            <label className="text-xs font-mono uppercase tracking-wider text-white/70 font-semibold">
              01 / Select Scan Target Source
            </label>

            {/* Segmented Tab Control */}
            <div
              className="grid grid-cols-3 gap-1 bg-black/80 p-1 rounded-xl border border-white/10"
              role="tablist"
              aria-label="Scan source options"
            >
              {(['github', 'local', 'upload'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/40 ${
                    activeTab === tab
                      ? 'bg-white/10 text-white shadow-sm border border-white/20'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  {tab === 'github' ? 'GitHub URL' : tab === 'local' ? 'Local Path' : 'Upload Files'}
                </button>
              ))}
            </div>

            {/* Tab 1: GitHub URL */}
            {activeTab === 'github' && (
              <div className="flex flex-col gap-2 mt-1">
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/org/repo"
                  disabled={isScanning}
                  className="w-full bg-black/80 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all disabled:opacity-50"
                  aria-label="GitHub Repository URL"
                />
                <p className="text-xs text-white/40">
                  We'll clone this into a temporary sandbox directory, scan for cryptographic primitives, and clean up afterward.
                </p>
              </div>
            )}

            {/* Tab 2: Local Path */}
            {activeTab === 'local' && (
              <div className="flex flex-col gap-2 mt-1">
                <input
                  type="text"
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  placeholder="/Users/you/projects/crypto-service"
                  disabled={isScanning}
                  className="w-full bg-black/80 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all disabled:opacity-50"
                  aria-label="Local filesystem path"
                />
                <p className="text-xs text-white/40">
                  Provide an absolute path on your local system or runner. Only works when running the CBOM tool locally.
                </p>
              </div>
            )}

            {/* Tab 3: Upload Files */}
            {activeTab === 'upload' && (
              <div className="flex flex-col gap-3 mt-1">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center gap-3 transition-colors ${
                    isDragging
                      ? 'border-white/50 bg-white/5'
                      : 'border-white/15 bg-black/60 hover:border-white/30'
                  }`}
                >
                  <p className="text-sm text-white/80 font-medium">
                    Drag and drop source files, binaries, or SBOM manifests here
                  </p>
                  <p className="text-xs text-white/40">
                    Supports .py, .cpp, .go, .java, .bin, .json, .bom, .lock
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={isScanning}
                  />

                  <MagneticButton>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isScanning}
                      className="mt-1 text-xs px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/40"
                    >
                      Browse files
                    </button>
                  </MagneticButton>
                </div>

                {/* Uploaded File List */}
                {uploadedFiles.length > 0 && (
                  <ul className="flex flex-col gap-2 mt-2">
                    {uploadedFiles.map((file) => (
                      <li
                        key={file.id}
                        className="flex items-center justify-between bg-black/80 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-mono"
                      >
                        <span className="text-white truncate max-w-xs sm:max-w-md">
                          {file.name}
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-white/40">{file.sizeFormatted}</span>
                          {!isScanning && (
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="text-white/30 hover:text-red-400 transition-colors p-1 focus:outline-none focus:ring-1 focus:ring-white/30 rounded"
                              aria-label={`Remove ${file.name}`}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>

          <hr className="border-white/10" />

          {/* SECTION 2: SCAN TARGETS */}
          <section className="flex flex-col gap-4">
            <label className="text-xs font-mono uppercase tracking-wider text-white/70 font-semibold">
              02 / Configure Inspection Layers
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                {
                  key: 'sourceCode' as const,
                  title: 'Source code (Python/C++)',
                  desc: 'Scans ASTs, function calls, and imported crypto libraries.',
                },
                {
                  key: 'binaries' as const,
                  title: 'Compiled binaries',
                  desc: 'Analyzes ELF/PE headers, symbol tables, and static links.',
                },
                {
                  key: 'dependencies' as const,
                  title: 'Dependencies / SBOM',
                  desc: 'Parses package manifests (npm, PyPI, Cargo, Go) for legacy crypto.',
                },
                {
                  key: 'containers' as const,
                  title: 'Container images',
                  desc: 'Inspects filesystem layers for embedded certs and OpenSSL binaries.',
                },
              ]).map(({ key, title, desc }) => (
                <label
                  key={key}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    scanTargets[key]
                      ? 'bg-white/5 border-white/20'
                      : 'bg-black/40 border-white/8 opacity-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={scanTargets[key]}
                    onChange={() => toggleTarget(key)}
                    disabled={isScanning}
                    className="mt-1 h-4 w-4 rounded border-white/30 bg-black accent-white focus:ring-white/40 focus:ring-offset-black"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-white">{title}</span>
                    <span className="text-xs text-white/40 leading-snug">{desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <hr className="border-white/10" />

          {/* SECTION 3: METADATA & RISK TAGGING */}
          <section className="flex flex-col gap-3">
            <label className="text-xs font-mono uppercase tracking-wider text-white/70 font-semibold">
              03 / System Exposure Tagging
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/60 p-4 rounded-xl border border-white/10">
              <div className="flex flex-col gap-0.5 max-w-md">
                <span className="text-sm font-medium text-white">
                  Tag this target system as:
                </span>
                <span className="text-xs text-white/40">
                  Influences Mosca's inequality weighting based on internet exposure and attack surface.
                </span>
              </div>

              <select
                value={exposureTag}
                onChange={(e) => setExposureTag(e.target.value as 'internal' | 'external')}
                disabled={isScanning}
                className="bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50 cursor-pointer"
                aria-label="Exposure Tagging"
              >
                <option value="internal">Internal (Backend, APIs, private tooling)</option>
                <option value="external">External-facing (Public web apps, edge proxies)</option>
              </select>
            </div>
          </section>

          {/* SECTION 4: TRIGGER & PROGRESS */}
          <div className="pt-2 flex flex-col gap-6">
            {!isComplete ? (
              <MagneticButton>
                <button
                  type="button"
                  onClick={handleStartScan}
                  disabled={!isSourceValid() || isScanning}
                  className="w-full py-3.5 text-sm font-semibold rounded-xl bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.35)] hover:shadow-[0_0_40px_rgba(255,255,255,0.55)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                >
                  {isScanning ? 'Scanning Target...' : 'Start Scan'}
                </button>
              </MagneticButton>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold shrink-0 border border-emerald-500/30">
                    ✓
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-emerald-200">
                      Scan complete — 47 artefacts found
                    </span>
                    <span className="text-xs text-emerald-400/80 font-mono">
                      CycloneDX CBOM generated successfully.
                    </span>
                  </div>
                </div>

                <Link href="/dashboard" className="w-full sm:w-auto">
                  <MagneticButton>
                    <button
                      type="button"
                      className="w-full sm:w-auto text-xs px-5 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                    >
                      View dashboard
                    </button>
                  </MagneticButton>
                </Link>
              </div>
            )}

            {/* LIVE PROGRESS PANEL */}
            {(isScanning || isComplete) && (
              <div className="p-5 bg-black/80 border border-white/10 rounded-2xl flex flex-col gap-4 font-mono text-xs relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Progress Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${
                        isComplete ? 'bg-emerald-400 text-emerald-400' : 'bg-white animate-pulse'
                      }`}
                    />
                    <span className="text-white font-semibold uppercase tracking-wider">
                      {isComplete ? 'SCAN COMPLETED' : 'SCAN PIPELINE ACTIVE'}
                    </span>
                  </div>
                  <span className="text-white/60 font-bold">{progress}%</span>
                </div>

                {/* Progress Bar */}
                <div
                  className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="bg-white h-full transition-all duration-150 ease-out shadow-[0_0_10px_rgba(255,255,255,0.6)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Telemetry Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-white/40 pt-1">
                  <span className="text-white/70 truncate max-w-md">
                    Stage: {currentStage}
                  </span>
                  <span className="text-white font-semibold shrink-0">
                    Artefacts found so far: {artefactsFound}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* FOOTER METADATA */}
        <footer className="flex items-center justify-between text-xs font-mono text-white/30 px-1">
          <span>PIPELINE ENGINE v1.4.2</span>
          <span>FORMAT: CYCLONEDX 1.6</span>
        </footer>

      </div>
    </div>
  );
}
