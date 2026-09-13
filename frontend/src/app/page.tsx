"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

import AccordionSection from "@/components/AccordionSection";

const FieldReportForm = dynamic(
  () => import("@/components/FieldReportForm"),
  { ssr: false }
);

export default function LandingPage() {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  return (
    <>
      <style>{`#global-top-bar { display: none !important; }`}</style>

{/*  ================= TOP NOTIFICATION / PROTOTYPE ENVIRONMENT BANNER =================  */}
<div className="bg-[#0b192c] border-b border-slate-800 text-xs font-mono text-slate-300 py-2 px-4 sm:px-6">
<div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
<div className="flex items-center gap-2">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 font-medium">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        ● PROTOTYPE ENVIRONMENT (SIH 2026)
      </span>
<span className="text-slate-500 hidden md:inline">|</span>
<span className="text-slate-400 hidden md:inline">Active Priority Sectors: Sikkim (NH-10 Sevoke–Gangtok Corridor) &amp; Arunachal Pradesh (NH-13 Trans-Arunachal Highway)</span>
</div>
<div className="flex items-center gap-3 text-slate-400">
<span className="tabular-nums" id="liveClock">21:42:52 IST</span>
<span className="">•</span>
<span className="text-sky-400 font-medium">Cloud Engine Ready</span>
</div>
</div>
</div>
{/*  ================= SECTION 1: INSTITUTIONAL HEADER & NAVIGATION =================  */}
<header className="sticky top-0 z-40 w-full bg-[#080e18]/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex items-center justify-between h-20 gap-4">
{/*  NETRA Brand & Logo  */}
<a className="flex items-center gap-3 shrink-0" href="#">
<div className="relative">
<img alt="NETRA Mark" className="h-10 w-10 object-contain rounded-lg border border-slate-700 bg-[#0b192c] p-1" src="https://lh3.googleusercontent.com/aida/AEtjO1UgE-d-780gVnmSHM-O8fugCbjOeLAfZa36OfkgRkNOHH6I8gMYOrQ4uSs1VpIFseTqsCJY14UrsVOCpI8flQ5Gz57sD0xVB47U8D8G7pqJgNXGmO6lCCXqZoDNMCDZm_fUS9M8ciawLaozcyNUezesx712HwxZ6xsyMQan7gBwOWYix82QAb1wqPj1fEpuZbM5mEZqyY6Ca3jSLcRG-m36aD7_UTNZJ-jzi0YqLRJqrevgvjHz5_5cqg" />
<span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-[#080e18]"></span>
</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-2">
<span className="font-extrabold text-xl tracking-tight text-white font-mono">
              NETRA
            </span>
<span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700 font-semibold uppercase">SIH 2026</span>
</div>
<span className="text-[11px] font-medium text-slate-400 hidden sm:inline-block">Nature's Early Threat Recognition &amp; Alert · AI-Driven Disaster Intelligence</span>
</div>
</a>
{/*  Primary Navigation  */}
<nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
<a className="text-white hover:text-sky-400 transition-colors font-semibold" href="#">Home</a>
<a className="hover:text-sky-400 transition-colors" href="#how-it-works">How It Works</a>
<a className="hover:text-sky-400 transition-colors" href="#risk-map-preview">Risk Intelligence</a>
<a className="hover:text-sky-400 transition-colors" href="#doctrine-pipeline">Core Doctrine</a>
<a className="hover:text-sky-400 transition-colors" href="#report-incident">Report Incident</a>
<a className="hover:text-sky-400 transition-colors" href="#decision-support">Decision Support</a>
<a className="hover:text-sky-400 transition-colors" href="#data-sources">Data Sources</a>
</nav>
{/*  Language & Auth Triggers  */}
<div className="flex items-center gap-3 shrink-0">
<div className="hidden sm:flex items-center text-xs font-medium bg-[#0b192c] px-2 py-1.5 rounded border border-slate-800 text-slate-300">
<button className="text-sky-400 font-semibold px-1">EN</button>
<span className="text-slate-600">/</span>
<button className="px-1 hover:text-white">हिंदी</button>
</div>
<a className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors" href="#report-incident">
<span className="material-symbols-outlined text-[16px] text-rose-400">photo_camera</span>
<span className="">Report Incident</span>
</a>
{/*  Prominent Role Selection Sign-In Button  */}
<button className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md border border-sky-400/40" onClick="() => setIsRoleModalOpen(true)">
<span className="material-symbols-outlined text-[16px]">account_circle</span>
<span className="">Sign In</span>
</button>
</div>
</div>
</div>
</header>
<main className="w-full">
{/*  ================= SECTION 2: HERO SECTION WITH NATURAL HIMALAYAN PHOTOGRAPHY =================  */}
<section className="relative w-full min-h-[580px] lg:min-h-[640px] flex items-center bg-[#080e18] overflow-hidden">
{/*  Himalayan Landscape Photo Background (Image 7)  */}
<div className="absolute inset-0 z-0">
<img alt="Himalayan and Northeast India mountain terrain" className="w-full h-full object-cover object-center brightness-[0.55] contrast-105" src="/landslide-bg.jpg" />
{/*  Soft Linear Atmospheric Gradient  */}
<div className="absolute inset-0 bg-gradient-to-r from-[#080e18]/95 via-[#080e18]/85 to-[#080e18]/50"></div>
<div className="absolute inset-0 bg-gradient-to-t from-[#080e18] via-transparent to-[#080e18]/40"></div>
</div>
{/*  Hero Content  */}
<div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
<div className="max-w-3xl">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0b192c]/90 border border-slate-700 text-sky-400 font-mono text-xs mb-4">
<span className="w-2 h-2 rounded-full bg-emerald-400"></span>
<span className="">● PROTOTYPE ENVIRONMENT (SIH 2026)</span>
</div>
<h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
          See the Risk.<br />
<span className="text-amber-400">Know Ahead.</span><br />
<span className="text-emerald-400">Respond Faster.</span>
</h1>
<p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl">NETRA combines terrain, rainfall, satellite and field intelligence to identify landslide risk, verify emerging incidents and support faster disaster response across vulnerable regions of Northeast India.</p>
{/*  Primary Call to Action Buttons  */}
<div className="mt-8 flex flex-wrap items-center gap-4">
<a className="inline-flex items-center gap-2 px-6 py-3.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md border border-rose-500" href="#report-incident">
<span className="material-symbols-outlined text-[18px]">photo_camera</span>
<span className="">REPORT AN INCIDENT</span>
</a>
<a className="inline-flex items-center gap-2 px-6 py-3.5 rounded bg-[#0b192c] hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold tracking-wide transition-all border border-slate-700" href="#risk-map-preview">
<span className="material-symbols-outlined text-[18px] text-sky-400">map</span>
<span className="">EXPLORE RISK MAP</span>
</a>
<button className="inline-flex items-center gap-2 px-5 py-3.5 rounded bg-sky-900/40 hover:bg-sky-900/60 text-sky-300 text-xs font-semibold tracking-wide transition-all border border-sky-600/40" onClick="() => setIsRoleModalOpen(true)">
<span className="material-symbols-outlined text-[18px]">login</span>
<span className="">SIGN IN AS CITIZEN OR OFFICIAL</span>
</button>
</div>
{/*  Metric Indicator Badges  */}
<div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl pt-6 border-t border-slate-800/80"><div className="bg-[#0b192c]/80 backdrop-blur p-3 rounded-lg border border-slate-800">
  <span className="text-[11px] text-slate-400 block uppercase font-medium">Terrain</span>
  <div className="text-sm font-bold text-white mt-0.5">Elevation • Slope</div>
  <span className="text-[10px] text-slate-500">Baseline morphology models</span>
</div>
<div className="bg-[#0b192c]/80 backdrop-blur p-3 rounded-lg border border-slate-800">
  <span className="text-[11px] text-slate-400 block uppercase font-medium">Rainfall Intelligence</span>
  <div className="text-sm font-bold text-amber-400 mt-0.5">Latest Observation</div>
  <span className="text-[10px] text-slate-500">IMD AWS &amp; Doppler • Demo Data</span>
</div>
<div className="bg-[#0b192c]/80 backdrop-blur p-3 rounded-lg border border-slate-800">
  <span className="text-[11px] text-slate-400 block uppercase font-medium">Satellite</span>
  <div className="text-sm font-bold text-sky-400 mt-0.5">Earth Observation</div>
  <span className="text-[10px] text-slate-500">Periodic radar &amp; displacement index</span>
</div>
<div className="bg-[#0b192c]/80 backdrop-blur p-3 rounded-lg border border-slate-800">
  <span className="text-[11px] text-slate-400 block uppercase font-medium">Field Evidence</span>
  <div className="text-sm font-bold text-emerald-400 mt-0.5">Geo-Tagged Reports</div>
  <span className="text-[10px] text-slate-500">GPS + Photo / Video</span>
</div></div>
</div>
</div>
</section>
{/*  ================= SECTION 3: WHAT NETRA DOES =================  */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-b border-slate-800">
<div className="text-center max-w-3xl mx-auto mb-16">
<span className="text-xs font-mono uppercase tracking-widest text-sky-400 bg-sky-950/60 px-3 py-1 rounded-full border border-sky-800 font-semibold">Prototype Operational Architecture</span>
<h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">What NETRA Delivers</h2>
<p className="text-slate-300 mt-3 text-base sm:text-lg leading-relaxed">An end-to-end framework transforming high-altitude environmental signals into actionable, verified field response across vulnerable North Eastern transit routes.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
{/*  PREDICT  */}
<div className="bg-[#0b192c] rounded-xl p-8 border border-slate-800 hover:border-amber-500/60 transition-all flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
<span className="material-symbols-outlined text-[28px]">insights</span>
</div>
<span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">01 · Early Susceptibility</span>
<h3 className="text-xl font-bold text-white mt-1 mb-3">PREDICT</h3>
<p className="text-slate-300 text-sm leading-relaxed">
            Evaluates slope stability and pore-water pressure using hydro-mechanical models to identify high-risk zones before detachment begins.
          </p>
</div>
<div className="mt-8 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400 flex items-center justify-between">
<span className="">Susceptibility Index</span>
<span className="text-amber-400 font-semibold">P1 to P4 Grids</span>
</div>
</div>
{/*  DETECT  */}
<div className="bg-[#0b192c] rounded-xl p-8 border border-slate-800 hover:border-sky-500/60 transition-all flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-lg bg-sky-950/40 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-5">
<span className="material-symbols-outlined text-[28px]">satellite_alt</span>
</div>
<span className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wider">Operational Monitoring</span>
<h3 className="text-xl font-bold text-white mt-1 mb-3">DETECT</h3>
<p className="text-slate-300 text-sm leading-relaxed">
            Continuously monitors regional automated weather stations (IMD AWS), radar rainfall grids, and satellite surface displacement scans.
          </p>
</div>
<div className="mt-8 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400 flex items-center justify-between">
<span className="">Update Cadence</span>
<span className="text-sky-400 font-semibold">Operational Monitoring</span>
</div>
</div>
{/*  VERIFY  */}
<div className="bg-[#0b192c] rounded-xl p-8 border border-slate-800 hover:border-emerald-500/60 transition-all flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
<span className="material-symbols-outlined text-[28px]">fact_check</span>
</div>
<span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">03 · Ground Truth</span>
<h3 className="text-xl font-bold text-white mt-1 mb-3">VERIFY</h3>
<p className="text-slate-300 text-sm leading-relaxed">
            Eliminates computer false-alarms by cross-referencing predictive alerts with geo-tagged photos uploaded by highway patrol and citizens.
          </p>
</div>
<div className="mt-8 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400 flex items-center justify-between">
<span className="">Corroboration</span>
<span className="text-emerald-400 font-semibold">GPS + Photo / Video</span>
</div>
</div>
{/*  RESPOND  */}
<div className="bg-[#0b192c] rounded-xl p-8 border border-slate-800 hover:border-rose-500/60 transition-all flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-lg bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5">
<span className="material-symbols-outlined text-[28px]">emergency</span>
</div>
<span className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-wider">04 · Swift Intervention</span>
<h3 className="text-xl font-bold text-white mt-1 mb-3">RESPOND</h3>
<p className="text-slate-300 text-sm leading-relaxed">
            Supplies authorized emergency response teams with recommended transit diversions, warning broadcasts, and clearway equipment staging.
          </p>
</div>
<div className="mt-8 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400 flex items-center justify-between">
<span className="">Operational Protocol</span>
<span className="text-rose-400 font-semibold">Authorized Intervention</span>
</div>
</div>
</div>
</section>
{/*  ================= SECTION 4: HOW IT WORKS PIPELINE =================  */}
<section className="py-20 sm:py-28 border-b border-slate-800 bg-[#060c14]" id="how-it-works">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
<div>
<span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-medium">// SYSTEM PROCESSING PIPELINE</span>
<h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">How NETRA Works</h2>
<p className="text-slate-300 text-base mt-2 max-w-2xl leading-relaxed">From spaceborne radar interferometry down to verified on-ground highway traffic management.</p>
</div>
<div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-[#0b192c] px-3.5 py-2 rounded-lg border border-slate-800">
<span className="material-symbols-outlined text-[16px] text-sky-400">sync</span>
<span className="">End-to-End Processing Flow</span>
</div>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
{/*  Step 1  */}
<div className="bg-[#0b192c] rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-3">
<span className="font-bold text-sky-400">STAGE 01</span>
<span className="material-symbols-outlined text-[20px]">cloud_download</span>
</div>
<h4 className="font-bold text-base text-white">Data Ingestion</h4>
<p className="text-xs text-slate-400 mt-2 leading-relaxed">Multispectral satellite raster, radar grids, and automated weather station telemetry.</p>
</div>
<span className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">Automated Intake</span>
</div>
{/*  Step 2  */}
<div className="bg-[#0b192c] rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-3">
<span className="font-bold text-sky-400">STAGE 02</span>
<span className="material-symbols-outlined text-[20px]">tune</span>
</div>
<h4 className="font-bold text-base text-white">Preprocessing</h4>
<p className="text-xs text-slate-400 mt-2 leading-relaxed">Cloud DEM slope gradient calculations and root-zone moisture indexing via GEE.</p>
</div>
<span className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">Spatial Geometry</span>
</div>
{/*  Step 3  */}
<div className="bg-[#0b192c] rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-3">
<span className="font-bold text-amber-400">STAGE 03</span>
<span className="material-symbols-outlined text-[20px]">analytics</span>
</div>
<h4 className="font-bold text-base text-white">Numerical Prediction</h4>
<p className="text-xs text-slate-400 mt-2 leading-relaxed">Hydro-mechanical factor of safety (FoS) computation across corridor cells.</p>
</div>
<span className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-amber-400 font-semibold">P1–P4 Risk Grids</span>
</div>
{/*  Step 4  */}
<div className="bg-[#0b192c] rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-3">
<span className="font-bold text-sky-400">STAGE 04</span>
<span className="material-symbols-outlined text-[20px]">campaign</span>
</div>
<h4 className="font-bold text-base text-white">Advisory Alert</h4>
<p className="text-xs text-slate-400 mt-2 leading-relaxed">Preliminary corridor notice dispatched to local emergency control centers.</p>
</div>
<span className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-sky-400">Early Notification</span>
</div>
{/*  Step 5  */}
<div className="bg-[#0b192c] rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-3">
<span className="font-bold text-emerald-400">STAGE 05</span>
<span className="material-symbols-outlined text-[20px]">verified</span>
</div>
<h4 className="font-bold text-base text-white">Field Ground Truth</h4>
<p className="text-xs text-slate-400 mt-2 leading-relaxed">Highway patrol reconnaissance and community photo/video corroboration.</p>
</div>
<span className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400">Physical Ground Check</span>
</div>
{/*  Step 6  */}
<div className="bg-[#0b192c] rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-3">
<span className="font-bold text-rose-400">STAGE 06</span>
<span className="material-symbols-outlined text-[20px]">traffic</span>
</div>
<h4 className="font-bold text-base text-white">Authorized Action</h4>
<p className="text-xs text-slate-400 mt-2 leading-relaxed">Official traffic diversion, excavator mobilization, and community broadcasts.</p>
</div>
<span className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-rose-400">Statutory Response</span>
</div>
</div>
</div>
</section>
{/*  ================= SECTION 5: RISK INTELLIGENCE MAP PREVIEW =================  */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-b border-slate-800" id="risk-map-preview">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
<div>
<div className="flex items-center gap-2 flex-wrap">
<span className="px-2.5 py-1 rounded bg-sky-950 text-sky-300 border border-sky-800 text-xs font-mono font-semibold uppercase tracking-wider">GIS WORKSPACE PREVIEW</span>
<span className="px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-800 text-xs font-mono font-semibold uppercase">[DEMO DATA · PROTOTYPE ENVIRONMENT]</span>
<span className="text-xs font-mono text-slate-400">EPSG:32645 · UTM 45N (Eastern Himalayan Sector)</span>
</div>
<h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">Operational Risk Intelligence Map</h2>
<p className="text-slate-300 text-base mt-2 max-w-2xl leading-relaxed">Topographic simulation with active telemetry feeds, predicted hazard zones, and ground-truth verified incident beacons across Sikkim &amp; Arunachal Pradesh.</p>
</div>
<div className="flex items-center gap-3 flex-wrap">
<div className="bg-[#0b192c] px-4 py-2.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
<span className="text-slate-500">CURSOR: </span>
<span className="text-sky-300 font-semibold tabular-nums" id="mapCursorReadout">27.3867° N, 88.4331° E (El: 1720m)</span>
</div>
<a className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-md" href="#risk-map-preview" onClick="() => {}">
<span className="">Open Full GIS Workspace</span>
<span className="material-symbols-outlined text-[16px]">arrow_outward</span>
</a>
</div>
</div>
{/*  GIS Map Container  */}
<div className="w-full bg-[#070f1a] rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative min-h-[560px] flex flex-col" id="mapArea" onMouseMove="(e) => {}">
{/*  Top GIS Controls Toolbar  */}
<div className="bg-[#0b192c] px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-20">
<div className="flex items-center gap-3">
<span className="text-xs font-mono text-slate-200 font-semibold flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
<span className="">ACTIVE SECTOR: Sikkim (NH-10 Sevoke–Gangtok) &amp; Arunachal Pradesh (NH-13 Bhalukpong–Tawang)</span>
</span>
<span className="text-[10px] font-mono text-slate-500 hidden lg:inline">(Cross-region demo / prototype example: Uttarakhand NH-58 baseline)</span>
</div>
{/*  Interactive Layer Toggles  */}
<div className="flex items-center gap-2 text-xs font-mono flex-wrap">
<button className="px-3 py-1.5 rounded bg-sky-950 border border-sky-500 text-sky-300 font-medium flex items-center gap-1.5" id="toggleSusceptibility" onClick="() => {}">
<span className="w-2 h-2 rounded-full bg-sky-400"></span> Susceptibility Contours
          </button>
<button className="px-3 py-1.5 rounded bg-[#070f1a] border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5" id="toggleRainfall" onClick="() => {}">
<span className="w-2 h-2 rounded-full bg-amber-400"></span> Rain Isohyets (IMD [DEMO])
          </button>
<button className="px-3 py-1.5 rounded bg-[#070f1a] border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5" id="toggleHighways" onClick="() => {}">
<span className="w-2 h-2 rounded-full bg-slate-400"></span> Highway Arteries (NH-10 &amp; NH-13)
          </button>
</div>
</div>
{/*  Map Graphic Canvas  */}
<div className="relative flex-1 w-full min-h-[480px] bg-[#091424] flex items-center justify-center overflow-hidden select-none">
<div className="absolute inset-0 grid-matrix-bg opacity-30 pointer-events-none"></div>
{/*  Clean Topographic SVG Map Representation  */}
<svg className="w-full h-full absolute inset-0 opacity-75 pointer-events-none" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 560" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient cx="38%" cy="44%" id="heatConfirmed" r="22%">
<stop offset="0%" stopColor="#ef4444" stopOpacity="0.85"></stop>
<stop offset="60%" stopColor="#ef4444" stopOpacity="0.3"></stop>
<stop offset="100%" stopColor="#ef4444" stopOpacity="0"></stop>
</radialGradient>
<radialGradient cx="72%" cy="62%" id="heatPredicted" r="24%">
<stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85"></stop>
<stop offset="55%" stopColor="#f59e0b" stopOpacity="0.25"></stop>
<stop offset="100%" stopColor="#f59e0b" stopOpacity="0"></stop>
</radialGradient>
</defs>
{/*  Elevation Contours (Teesta / Kameng Valley Basins)  */}
<path d="M-50 110 Q 250 20 520 120 T 1050 80" fill="none" stroke="#1e324d" strokeWidth="1.2"></path>
<path d="M-50 170 Q 280 70 540 180 T 1050 140" fill="none" stroke="#1e324d" strokeWidth="1.2"></path>
<path d="M-50 240 Q 260 130 500 250 T 1050 190" fill="none" stroke="#253e61" strokeWidth="1.3"></path>
<path d="M-50 310 Q 300 210 560 330 T 1050 260" fill="none" stroke="#253e61" strokeWidth="1.3"></path>
<path d="M-50 390 Q 230 290 520 410 T 1050 340" fill="none" stroke="#1e324d" strokeWidth="1.2"></path>
<path d="M-50 470 Q 320 370 580 490 T 1050 420" fill="none" stroke="#1e324d" strokeWidth="1.2"></path>
{/*  Mountain River Gorge (Teesta River Canyon / Rangeet Confluence)  */}
<path d="M 10 560 C 180 480 310 410 410 320 C 500 220 570 110 610 0 L 635 0 C 590 110 520 230 430 330 C 330 420 200 490 25 565 Z" fill="#0284c7" fillOpacity="0.3"></path>
{/*  Heat Risk Layers  */}
<g id="svgHeatLayer">
<rect fill="url(#heatConfirmed)" height="560" width="1000" x="0" y="0"></rect>
<rect fill="url(#heatPredicted)" height="560" width="1000" x="0" y="0"></rect>
</g>
{/*  Highway Arteries (NH-10 Sevoke-Gangtok & NH-13 Trans-Arunachal)  */}
<g id="svgHighwaysLayer">
<path d="M 60 520 C 180 450 320 390 410 310 C 490 230 580 190 700 170 C 810 150 870 80 930 30" fill="none" stroke="#64748b" strokeDasharray="8,5" strokeWidth="2.5"></path>
{/*  Blocked / Affected Road Segment (NH-10 KM 29 29th Mile)  */}
<path d="M 360 360 Q 385 335 410 310" fill="none" stroke="#ef4444" strokeLinecap="round" strokeWidth="6"></path>
</g>
</svg>
{/*  BEACON 1: P1 CONFIRMED RUNOUT (Critical Red)  */}
<div className="absolute top-[38%] left-[36%] flex flex-col items-center z-20 group cursor-pointer" onClick="() => {}">
<div className="relative flex items-center justify-center">
<span className="animate-ping absolute h-8 w-8 rounded-full bg-rose-500 opacity-75"></span>
<div className="h-8 w-8 rounded-full bg-rose-600 border-2 border-white text-white flex items-center justify-center shadow-lg">
<span className="material-symbols-outlined text-[18px]">warning</span>
</div>
</div>
{/*  Incident Popup Card  */}
<div className="mt-2 bg-[#0b192c] text-white p-4 rounded-xl border border-rose-500/80 w-64 shadow-2xl" id="cardConfirmed">
<div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
<span className="text-[11px] font-mono font-bold text-rose-400">P1 · CONFIRMED BLOCKADE</span>
<span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">NH-10 KM 29</span>
</div>
<p className="text-xs font-semibold text-white">Debris Flow &amp; Road Blocked</p>
<p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Field verified with geo-tagged photo at 09:40 IST. Heavy clearance earthmover dispatched.</p>
<span className="mt-2 inline-block text-[10px] font-mono text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">[DEMO INCIDENT DATA]</span>
</div>
</div>
{/*  BEACON 2: P2 PREDICTED RISK (Amber Marker)  */}
<div className="absolute top-[58%] left-[68%] flex flex-col items-center z-20 group cursor-pointer" onClick="() => {}">
<div className="relative flex items-center justify-center">
<span className="animate-ping absolute h-8 w-8 rounded-full bg-amber-400 opacity-60"></span>
<div className="h-8 w-8 rounded-full bg-amber-500 border-2 border-white text-white flex items-center justify-center shadow-lg">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</div>
</div>
{/*  Incident Popup Card  */}
<div className="mt-2 bg-[#0b192c] text-white p-4 rounded-xl border border-amber-500/80 w-64 shadow-2xl" id="cardPredicted">
<div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
<span className="text-[11px] font-mono font-bold text-amber-400">P2 · PREDICTED HIGH RISK</span>
<span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">NH-13 BHALUKPONG</span>
</div>
<p className="text-xs font-semibold text-white">Pore Pressure &amp; Rain Stress</p>
<p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Cumulative 24h rainfall &gt;125mm. Patrol inspection dispatched to check slope scarp.</p>
<span className="mt-2 inline-block text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">[SIMULATED TELEMETRY]</span>
</div>
</div>
{/*  Elevation Datum Stamp  */}
<div className="absolute bottom-3 left-3 bg-[#0b192c]/95 px-3.5 py-2 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
          Contour Interval: 20m · Teesta / Kameng River Corridors
        </div>
</div>
{/*  Explicit Standardized P1-P4 Priority Legend  */}
<div className="bg-[#0b192c] px-5 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-300">
<div className="flex items-center gap-6 flex-wrap">
<span className="text-slate-400 font-bold uppercase text-[11px] tracking-wider">STANDARDIZED PRIORITY INDEX:</span>
<div className="flex items-center gap-2">
<span className="w-3.5 h-3.5 rounded-sm bg-rose-600"></span>
<span className=""><strong>P1:</strong> Immediate Intervention (Critical Red — Blockade Confirmed)</span>
</div>
<div className="flex items-center gap-2">
<span className="w-3.5 h-3.5 rounded-sm bg-amber-500"></span>
<span className=""><strong>P2:</strong> High Priority (Warning Amber — Field Recon Dispatched)</span>
</div>
<div className="flex items-center gap-2">
<span className="w-3.5 h-3.5 rounded-sm bg-sky-500"></span>
<span className=""><strong>P3:</strong> Monitor (Advisory Blue — Rain Threshold Exceeded)</span>
</div>
<div className="flex items-center gap-2">
<span className="w-3.5 h-3.5 rounded-sm bg-emerald-500"></span>
<span className=""><strong>P4:</strong> Normal Surveillance (Safe Green — Routine Monitoring)</span>
</div>
</div>
<div className="text-slate-400 text-[11px]"><span className="text-sky-400 font-semibold">Prototype GIS Data Feed</span></div>
</div>
</div>
</section>
{/*  ================= SECTION 6: CORE DOCTRINE: PREDICTION ≠ CONFIRMATION =================  */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-b border-slate-800" id="doctrine-pipeline">
<div className="bg-[#0b192c] rounded-2xl p-8 sm:p-12 border border-slate-800 shadow-xl">
<div className="max-w-3xl">
<span className="text-xs font-mono uppercase tracking-widest text-amber-400 bg-amber-950/60 px-3 py-1 rounded border border-amber-800 font-semibold">CORE OPERATIONAL DOCTRINE</span>
<h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-4">
          FROM PREDICTION TO VERIFIED ACTION
        </h2>
<p className="text-xl font-semibold text-amber-400 mt-2 font-mono">Prediction ≠ Confirmation</p>
<div className="mt-4 p-4 rounded-xl bg-[#080e18] border-l-4 border-amber-500 text-slate-200 text-base leading-relaxed">
<strong>Clarifying Callout:</strong> AI identifies risk. Field evidence confirms what is happening on the ground. Statutory enforcement and road closures are never automated purely on algorithmic predictions.
        </div>
</div>
{/*  5-Step Operational Lifecycle Grid  */}
<div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
{/*  Step 1: PREDICTED (Amber)  */}
<div className="bg-[#080e18] border-2 border-amber-500/40 hover:border-amber-500/80 transition-colors rounded-xl p-5 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-amber-400 mb-3">
<span className="text-xs font-mono font-bold">STEP 1</span>
<span className="material-symbols-outlined text-[22px]">insights</span>
</div>
<h4 className="text-base font-bold text-white mb-2">PREDICTED</h4>
<span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block mb-2 font-semibold">Amber Warning</span>
<p className="text-xs text-slate-300 leading-relaxed">
              Numerical slope stability models &amp; satellite radar precipitation threshold alerts trigger corridor advisory.
            </p>
</div>
<div className="mt-6 pt-3 border-t border-slate-800 text-[11px] font-mono text-amber-300 font-medium">
            Model Alert Generated
          </div>
</div>
{/*  Step 2: FIELD EVIDENCE (Blue)  */}
<div className="bg-[#080e18] border-2 border-sky-500/40 hover:border-sky-500/80 transition-colors rounded-xl p-5 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-sky-400 mb-3">
<span className="text-xs font-mono font-bold">STEP 2</span>
<span className="material-symbols-outlined text-[22px]">photo_camera</span>
</div>
<h4 className="text-base font-bold text-white mb-2">FIELD EVIDENCE</h4>
<span className="text-[11px] font-mono text-sky-400 uppercase tracking-wider block mb-2 font-semibold">Blue Observations</span>
<p className="text-xs text-slate-300 leading-relaxed">
              Geo-tagged photos, video uploads, and visual drone recon from highway patrol inspection teams on site.
            </p>
</div>
<div className="mt-6 pt-3 border-t border-slate-800 text-[11px] font-mono text-sky-300 font-medium">
            Recon Evidence Captured
          </div>
</div>
{/*  Step 3: VERIFICATION (Slate/Purple)  */}
<div className="bg-[#080e18] border-2 border-slate-700 hover:border-slate-500 transition-colors rounded-xl p-5 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-slate-300 mb-3">
<span className="text-xs font-mono font-bold">STEP 3</span>
<span className="material-symbols-outlined text-[22px]">rule</span>
</div>
<h4 className="text-base font-bold text-white mb-2">VERIFICATION</h4>
<span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Spatial Cross-Match</span>
<p className="text-xs text-slate-300 leading-relaxed">Spatial matching of device GPS coordinates with predictive hazard zones and reported slope features.</p>
</div>
<div className="mt-6 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 font-medium">
            Algorithmic Corroboration
          </div>
</div>
{/*  Step 4: CONFIRMED / DISMISSED (Red / Slate)  */}
<div className="bg-[#080e18] border-2 border-rose-500/40 hover:border-rose-500/80 transition-colors rounded-xl p-5 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-rose-400 mb-3">
<span className="text-xs font-mono font-bold">STEP 4</span>
<span className="material-symbols-outlined text-[22px]">fact_check</span>
</div>
<h4 className="text-base font-bold text-white mb-2">CONFIRMED / DISMISSED</h4>
<span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider block mb-2 font-semibold">Red Truth / False Alarm</span>
<p className="text-xs text-slate-300 leading-relaxed">
              Incident officially logged into active ground-truth register, or closed as benign false alarm without disrupting traffic.
            </p>
</div>
<div className="mt-6 pt-3 border-t border-slate-800 text-[11px] font-mono text-rose-300 font-medium">
            Ground Truth Authenticated
          </div>
</div>
{/*  Step 5: RESPONSE (Green)  */}
<div className="bg-[#080e18] border-2 border-emerald-500/40 hover:border-emerald-500/80 transition-colors rounded-xl p-5 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-emerald-400 mb-3">
<span className="text-xs font-mono font-bold">STEP 5</span>
<span className="material-symbols-outlined text-[22px]">traffic</span>
</div>
<h4 className="text-base font-bold text-white mb-2">RESPONSE ACTION</h4>
<span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-2 font-semibold">Green Intervention</span>
<p className="text-xs text-slate-300 leading-relaxed">
              Authorized emergency executive enacts statutory traffic diversion, mobilizes earthmovers, and notifies travelers.
            </p>
</div>
<div className="mt-6 pt-3 border-t border-slate-800 text-[11px] font-mono text-emerald-300 font-medium">
            Statutory Deployment
          </div>
</div>
</div>
</div>
</section>
{/*  ================= SECTION 7: GEO-TAGGED GROUND REPORTING & OFFLINE-FIRST =================  */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-b border-slate-800 py-20" id="report-incident">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
{/*  Left Column: Step-by-Step Flow & Offline Explanation  */}
<div className="lg:col-span-7">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-medium mb-3">
<span className="material-symbols-outlined text-[16px] text-rose-400">add_a_photo</span>
<span className="">CITIZEN &amp; PATROL REPORTING MODULE</span>
</div>
<h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Geo-Tagged Ground Reporting &amp; Offline-First Architecture
        </h2>
<p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
          Deep mountain gorges often lack mobile cellular reception. NETRA’s web app caches submissions securely in the local browser database and synchronizes immediately when connectivity is restored.
        </p>
{/*  6 Step Multi-Step Flow  */}
<div className="mt-6 space-y-3 font-sans">
<div className="flex items-start gap-3">
<span className="w-6 h-6 rounded-full bg-slate-800 text-sky-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">1</span>
<div>
<span className="text-sm font-semibold text-white">Capture</span>
<p className="text-xs text-slate-400">Photograph fallen boulders, tension cracks, or mud accumulation.</p>
</div>
</div>
<div className="flex items-start gap-3">
<span className="w-6 h-6 rounded-full bg-slate-800 text-sky-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">2</span>
<div>
<span className="text-sm font-semibold text-white">Location Lock</span>
<p className="text-xs text-slate-400">Location captured from device GPS with photo/video evidence.</p>
</div>
</div>
<div className="flex items-start gap-3">
<span className="w-6 h-6 rounded-full bg-slate-800 text-sky-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">3</span>
<div>
<span className="text-sm font-semibold text-white">Incident Type Selection</span>
<p className="text-xs text-slate-400">Select road obstruction severity, mudflow, or structural scarp damage.</p>
</div>
</div>
<div className="flex items-start gap-3">
<span className="w-6 h-6 rounded-full bg-slate-800 text-sky-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">4</span>
<div>
<span className="text-sm font-semibold text-white">Submit / Local Cache</span>
<p className="text-xs text-slate-400">Stored safely on device if in poor network, or sent directly to server.</p>
</div>
</div>
<div className="flex items-start gap-3">
<span className="w-6 h-6 rounded-full bg-slate-800 text-sky-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">5</span>
<div>
<span className="text-sm font-semibold text-white">Spatial Match</span>
<p className="text-xs text-slate-400">Automatically intersects coordinates with predictive model grids.</p>
</div>
</div>
<div className="flex items-start gap-3">
<span className="w-6 h-6 rounded-full bg-slate-800 text-sky-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">6</span>
<div>
<span className="text-sm font-semibold text-white">Authority Review</span>
<p className="text-xs text-slate-400">Incident escalates to response queue with photographic evidence.</p>
</div>
</div>
</div>
{/*  Offline Sync Progression Bar  */}
<div className="mt-8 p-4 rounded-xl bg-[#0b192c] border border-slate-800">
<div className="flex items-center justify-between text-xs font-mono mb-2">
<span className="text-slate-400 font-semibold">OFFLINE QUEUE PROGRESSION:</span>
<div className="flex items-center gap-2">
<button className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px] hover:bg-slate-700" onClick="() => {}">Simulate Offline</button>
<button className="px-2 py-1 rounded bg-sky-900/60 text-sky-300 text-[11px] hover:bg-sky-900" onClick="() => {}">Simulate Online</button>
</div>
</div>
<div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono mt-3">
<div className="p-2 rounded bg-slate-800/80 border border-slate-700 text-slate-300" id="stepSaved">
<span className="">Saved Locally</span>
</div>
<div className="p-2 rounded bg-slate-800/80 border border-slate-700 text-slate-400" id="stepWaiting">
<span className="">Waiting Network</span>
</div>
<div className="p-2 rounded bg-slate-800/80 border border-slate-700 text-slate-400" id="stepAutoSync">
<span className="">Auto Sync</span>
</div>
<div className="p-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-semibold" id="stepSynced">
<span className="">✓ Synced</span>
</div>
</div>
<p className="text-xs text-slate-400 mt-3" id="syncStatusDesc">Status: Connection active. Reports transmit immediately with captured device GPS coordinates.</p>
</div>
</div>
{/*  Right Column: Clean Incident Report Form  */}
<div className="lg:col-span-5 flex justify-center">
<div className="w-full max-w-md bg-[#0b192c] rounded-xl border border-slate-800 p-6 shadow-xl text-white">
<div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-rose-400 text-[20px]">add_a_photo</span>
<span className="text-sm font-bold text-white">Submit Incident Observation</span>
</div>
<span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">GPS READY</span>
</div>
<form className="space-y-4 text-xs font-sans" onSubmit="event.preventDefault(); () => {};">
<div>
<label className="block text-slate-300 font-medium mb-1">Incident Category *</label>
<select className="w-full bg-[#080e18] border border-slate-700 rounded-lg p-2.5 text-slate-200 text-xs focus:border-sky-500 focus:ring-0">
<option>Active Debris Runout / Highway Blocked</option>
<option>Tension Cracks on Road Surface (&gt;5cm)</option>
<option>Rockfall Impact on Shoulder</option>
<option>High Turbidity / Muddy River Flow</option>
<option>Retaining Wall Cracking</option>
</select>
</div>
<div>
<label className="block text-slate-300 font-medium mb-1">Observation Photo / Evidence *</label>
<div className="border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-lg p-4 text-center cursor-pointer bg-[#080e18]">
<span className="material-symbols-outlined text-[28px] text-slate-400">cloud_upload</span>
<p className="text-xs text-slate-300 mt-1 font-medium">Click to select photo or take picture</p>
<p className="text-[10px] text-slate-500 mt-0.5">Photo/video metadata preserved where available.</p>
</div>
</div>
<div>
<label className="block text-slate-300 font-medium mb-1">Location (Device GPS)</label>
<div className="w-full bg-[#080e18] border border-slate-700 rounded-lg p-2.5 text-slate-300 font-mono text-xs flex justify-between items-center">
<span className="">27.3389° N, 88.6065° E (Sikkim NH-10 Corridor, Km 29)</span>
<span className="material-symbols-outlined text-[16px] text-emerald-400">my_location</span>
</div>
</div>
<div>
<label className="block text-slate-300 font-medium mb-1">Road Condition Impact</label>
<div className="grid grid-cols-3 gap-2 text-center text-xs">
<label className="p-2 rounded bg-[#080e18] border border-slate-700 cursor-pointer hover:border-slate-500">
<input className="hidden" name="road_impact" type="radio" />
<span className="">Partial Lane</span>
</label>
<label className="p-2 rounded bg-sky-950 border border-sky-500 text-sky-200 font-semibold cursor-pointer">
<input checked="" className="hidden" name="road_impact" type="radio" />
<span className="">Total Block</span>
</label>
<label className="p-2 rounded bg-[#080e18] border border-slate-700 cursor-pointer hover:border-slate-500">
<input className="hidden" name="road_impact" type="radio" />
<span className="">Culvert Threat</span>
</label>
</div>
</div>
<button className="w-full py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-md flex items-center justify-center gap-2 mt-2" id="submitBtn" type="submit">
<span className="material-symbols-outlined text-[16px]">send</span>
<span className="">Submit Ground Verification</span>
</button>
<span className="text-[10px] text-slate-500 text-center block">Submissions are reviewed by highway control room</span>
</form>
</div>
</div>
</div>
</section>
{/*  ================= SECTION 8: FOR RESPONSE TEAMS & DECISION SUPPORT =================  */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-b border-slate-800" id="decision-support">
<div className="max-w-3xl mb-14">
<span className="text-xs font-mono uppercase tracking-widest text-sky-400 bg-sky-950/60 px-3 py-1 rounded border border-sky-800 font-semibold">Authorized Operations Interface</span>
<h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
        Response Team Command Center &amp; Decision Support
      </h2>
<p className="text-slate-300 text-base sm:text-lg mt-3 leading-relaxed">
        A dedicated environment for authorized emergency officers to monitor active Himalayan corridors, review verified ground observations, and execute official safety actions.
      </p>
</div>
{/*  Clear Separation: AI Recommendations vs Official Statutory Action  */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
{/*  AI Recommendation Card  */}
<div className="bg-[#0b192c] rounded-xl p-8 border border-slate-800 hover:border-amber-500/40 transition-colors shadow-lg">
<div className="flex items-center gap-2.5 mb-4">
<span className="material-symbols-outlined text-amber-400 text-[24px]">smart_toy</span>
<h3 className="text-base font-bold text-amber-400 uppercase font-mono tracking-wider">AI SYSTEM RECOMMENDATION</h3>
</div>
<p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Algorithmic hazard projections suggest non-binding operational actions based on rain accumulation, soil saturation, and slope instability factors.
        </p>
<div className="space-y-4 text-xs">
<div className="p-4 rounded-lg bg-[#080e18] border-l-4 border-rose-500">
<div className="font-semibold text-rose-300 text-sm">Recommendation: Restrict Night Transit (NH-10 Km 29 Sector)</div>
<p className="text-slate-300 text-xs mt-1 leading-relaxed">Sevoke–Rangpo stretch showing cumulative 24h rainfall &gt;130mm and early slope micro-displacement.</p>
<span className="text-[10px] font-mono text-slate-500 mt-2 block">Priority Rating: P1 Immediate Assessment Needed</span>
</div>
<div className="p-4 rounded-lg bg-[#080e18] border-l-4 border-amber-500">
<div className="font-semibold text-amber-300 text-sm">Recommendation: Pre-position Earthmoving Excavator (NH-13 Bhalukpong)</div>
<p className="text-slate-300 text-xs mt-1 leading-relaxed">Stage clearway plant at Tipi junction for rapid rockfall mitigation if tension cracks widen.</p>
<span className="text-[10px] font-mono text-slate-500 mt-2 block">Priority Rating: P2 High Priority Field Standby</span>
</div>
</div>
</div>
{/*  Official Action Card  */}
<div className="bg-[#0b192c] rounded-xl p-8 border border-slate-800 hover:border-emerald-500/40 transition-colors shadow-lg">
<div className="flex items-center gap-2.5 mb-4">
<span className="material-symbols-outlined text-emerald-400 text-[24px]">gavel</span>
<h3 className="text-base font-bold text-emerald-400 uppercase font-mono tracking-wider">OFFICIAL RESPONSE ACTION</h3>
</div>
<p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Authorized officials evaluate recommendations alongside on-ground corroboration and make the final statutory operational decisions under the Disaster Management Framework.
        </p>
<div className="p-5 rounded-xl bg-[#080e18] border border-slate-700">
<div className="flex items-center justify-between text-xs mb-3">
<span className="font-bold text-white text-sm">Corridor Advisory: Sikkim NH-10</span>
<span className="text-emerald-400 font-mono text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">Awaiting Officer Signature</span>
</div>
<p className="text-xs text-slate-300 mb-5 leading-relaxed">
            Authorized Executive Engineer or District Incident Commander reviews ground photographs, confirms detour routes via Melli/Kalimpong, and enacts public transit safety advisory.
          </p>
<div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
<button className="px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold font-mono tracking-wide transition-colors shadow-md" onClick="openRoleModal('response')">
              Access Incident Command Workspace
            </button>
<span className="text-[11px] text-slate-400 font-mono">Authorized access credentials required</span>
</div>
</div>
</div>
</div>
</section>
{/*  ================= SECTION 9: DATA & INTELLIGENCE SOURCES =================  */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-b border-slate-800" id="data-sources">
<div className="text-center max-w-2xl mx-auto mb-14">
<span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-medium">// OPEN DATA INTEGRATION</span>
<h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">Data &amp; Intelligence Sources</h2>
<p className="text-slate-300 text-base mt-2 leading-relaxed">Attributed open geospatial repositories and telemetry networks driving predictive models.</p>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
<div className="bg-[#0b192c] p-6 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-bold text-white text-base">GSI Bhukosh</span>
<span className="material-symbols-outlined text-[20px] text-sky-400">public</span>
</div>
<p className="text-xs text-slate-300 leading-relaxed">
            Baseline National Landslide Susceptibility Mapping (NLSM), regional bedrock lithology, and structural fault line boundaries across North Eastern states.
          </p>
</div>
<span className="mt-5 text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800">Geological Survey of India</span>
</div>
<div className="bg-[#0b192c] p-6 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-bold text-white text-base">IMD Doppler &amp; AWS</span>
<span className="material-symbols-outlined text-[20px] text-sky-400">thunderstorm</span>
</div>
<p className="text-xs text-slate-300 leading-relaxed">Rainfall observations and weather information used for landslide risk assessment.</p>
</div>
<span className="mt-5 text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800">India Meteorological Dept</span>
</div>
<div className="bg-[#0b192c] p-6 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-bold text-white text-base">ISRO NISAR / Sentinel-1</span>
<span className="material-symbols-outlined text-[20px] text-sky-400">satellite</span>
</div>
<p className="text-xs text-slate-300 leading-relaxed">
            Synthetic Aperture Radar (SAR) interferometry for detecting millimeter-scale slope surface displacement across vulnerable gorge slopes.
          </p>
</div>
<span className="mt-5 text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800">Space Applications Feeds</span>
</div>
<div className="bg-[#0b192c] p-6 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-bold text-white text-base">Google Earth Engine</span>
<span className="material-symbols-outlined text-[20px] text-sky-400">cloud_done</span>
</div>
<p className="text-xs text-slate-300 leading-relaxed">
            High-throughput cloud geospatial processing platform for computing DEM slope curvature, drainage accumulation, and hydrological flow paths.
          </p>
</div>
<span className="mt-5 text-[11px] font-mono text-sky-400 pt-3 border-t border-slate-800 font-semibold">Cloud Geospatial Processing Platform</span>
</div>
<div className="bg-[#0b192c] p-6 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-bold text-white text-base">NCS Seismology</span>
<span className="material-symbols-outlined text-[20px] text-sky-400">waves</span>
</div>
<p className="text-xs text-slate-300 leading-relaxed">
            Seismic event catalogs from National Center for Seismology to account for earthquake-induced ground shaking and micro-tremor triggers.
          </p>
</div>
<span className="mt-5 text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800">Ministry of Earth Sciences</span>
</div>
<div className="bg-[#0b192c] p-6 rounded-xl border border-slate-800 flex flex-col justify-between lg:col-span-3 hover:border-slate-700 transition-colors">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-bold text-white text-base">Field Patrols &amp; Community Ground Reports</span>
<span className="material-symbols-outlined text-[20px] text-emerald-400">groups</span>
</div>
<p className="text-xs text-slate-300 leading-relaxed">
            Highway maintenance crews, local taxi unions, and mountain community volunteers submitting verified geo-tagged photographs and video clips to ground-truth numerical model predictions.
          </p>
</div>
<span className="mt-5 text-[11px] font-mono text-emerald-400 pt-3 border-t border-slate-800 font-medium">Community Ground Truth Corroboration Layer</span>
</div>
</div>
</section>
{/*  ================= SECTION 10: ACTION BANNER =================  */}
<section className="bg-[#060c14] text-white py-16">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
<span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono mb-4 border border-slate-700">
<span className="w-2 h-2 rounded-full bg-emerald-400"></span>
<span className="">SMART INDIA HACKATHON 2026 EVALUATION PROTOTYPE</span>
</span>
<h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
        Supporting Safer Mountain Transit Corridors
      </h2>
<p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
        A credible synthesis of predictive modeling and verified ground reconnaissance for vulnerable Himalayan communities.
      </p>
<div className="mt-8 flex flex-wrap justify-center items-center gap-4">
<a className="px-6 py-3.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-md" href="#report-incident">
          Report an Incident
        </a>
<button className="px-6 py-3.5 rounded bg-[#0b192c] hover:bg-slate-800 text-white font-semibold text-xs transition-colors border border-slate-700" onClick="() => setIsRoleModalOpen(true)">
          Sign In to NETRA
        </button>
</div>
</div>
</section>
</main>
{/*  ================= INSTITUTIONAL FOOTER =================  */}
<footer className="bg-[#04080e] border-t border-slate-800 py-12 text-slate-400">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80 text-sm">
<div className="md:col-span-1">
<div className="flex items-center gap-2 mb-3">
<img alt="NETRA Mark" className="h-8 w-8 object-contain rounded border border-slate-700" src="https://lh3.googleusercontent.com/aida/AEtjO1UgE-d-780gVnmSHM-O8fugCbjOeLAfZa36OfkgRkNOHH6I8gMYOrQ4uSs1VpIFseTqsCJY14UrsVOCpI8flQ5Gz57sD0xVB47U8D8G7pqJgNXGmO6lCCXqZoDNMCDZm_fUS9M8ciawLaozcyNUezesx712HwxZ6xsyMQan7gBwOWYix82QAb1wqPj1fEpuZbM5mEZqyY6Ca3jSLcRG-m36aD7_UTNZJ-jzi0YqLRJqrevgvjHz5_5cqg" />
<span className="font-extrabold text-lg tracking-tight text-white font-mono">NETRA</span>
</div>
<p className="text-xs text-slate-500 leading-relaxed">
          Nature's Early Threat Recognition &amp; Alert. SIH 2026 prototype for early landslide risk identification and verified community response.
        </p>
</div>
<div>
<h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider mb-3">PLATFORM DIRECTORY</h4>
<ul className="space-y-2 text-xs font-mono">
<li className=""><a className="hover:text-sky-400" href="#">Home</a></li>
<li className=""><a className="hover:text-sky-400" href="#how-it-works">How It Works</a></li>
<li className=""><a className="hover:text-sky-400" href="#risk-map-preview">Risk Intelligence</a></li>
<li className=""><a className="hover:text-sky-400" href="#doctrine-pipeline">Core Doctrine</a></li>
<li className=""><a className="hover:text-sky-400" href="#report-incident">Report Incident</a></li>
</ul>
</div>
<div>
<h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider mb-3">STANDARDS &amp; PROTOCOLS</h4>
<ul className="space-y-2 text-xs font-mono text-slate-500">
<li className="">• OGC WMS/WFS Interoperable</li>
<li className="">• GeoJSON RFC 7946 Standard</li>
<li className="">• Coordinate Datum: EPSG:4326</li>
<li className="">• Offline IndexedDB Storage</li>
</ul>
</div>
<div>
<h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider mb-3">PROTOTYPE NOTICE</h4>
<p className="text-xs text-slate-500 leading-relaxed">
          Developed strictly for Smart India Hackathon evaluation purposes. Telemetry layers demonstrate proof-of-concept multi-source data ingestion and field-grounded corroboration.
        </p>
</div>
</div>
<div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
<div>
<span className="">© 2026 NETRA Project · SIH 2026 Prototype Evaluation</span>
</div>
<div className="flex items-center gap-4">
<span className="text-emerald-400">● DEMO MODE</span>
<span className="">Open Geospatial Architecture</span>
</div>
</div>
</div>
</footer>
{/*  ================= SECTION 2 EDIT: DEDICATED ROLE-BASED SIGN-IN GATEWAY MODAL =================  */}
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 hidden" id="roleGatewayModal">
<div className="w-full max-w-2xl bg-[#0b192c] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden relative">
{/*  Close Modal Button  */}
<button className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/80 border border-slate-700" onClick="closeRoleModal()">
<span className="material-symbols-outlined text-[20px]">close</span>
</button>
{/*  VIEW A: ROLE SELECTION CARDS (Default View)  */}
<div className="p-6 sm:p-8" id="viewRoleSelect">
{/*  Top Gateway Header  */}
<div className="text-center max-w-md mx-auto mb-8">
<div className="inline-flex items-center justify-center p-2 rounded-xl bg-[#080e18] border border-slate-700 mb-3">
<img alt="NETRA Mark" className="h-10 w-10 object-contain rounded" src="https://lh3.googleusercontent.com/aida/AEtjO1UgE-d-780gVnmSHM-O8fugCbjOeLAfZa36OfkgRkNOHH6I8gMYOrQ4uSs1VpIFseTqsCJY14UrsVOCpI8flQ5Gz57sD0xVB47U8D8G7pqJgNXGmO6lCCXqZoDNMCDZm_fUS9M8ciawLaozcyNUezesx712HwxZ6xsyMQan7gBwOWYix82QAb1wqPj1fEpuZbM5mEZqyY6Ca3jSLcRG-m36aD7_UTNZJ-jzi0YqLRJqrevgvjHz5_5cqg" />
</div>
<h3 className="text-2xl font-extrabold text-white tracking-tight">WELCOME TO NETRA</h3>
<p className="text-slate-400 text-xs sm:text-sm mt-1">Choose your role to continue to the appropriate workspace</p>
</div>
{/*  2 Dedicated Role Cards  */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
{/*  CARD 1: PUBLIC / CITIZEN  */}
<div className="bg-[#080e18] rounded-xl p-6 border-2 border-emerald-500/40 hover:border-emerald-500 transition-all flex flex-col justify-between group">
<div>
<div className="flex items-center justify-between mb-3">
<span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                FOR CITIZENS &amp; COMMUNITY
              </span>
<span className="material-symbols-outlined text-emerald-400 text-[22px]">person</span>
</div>
<h4 className="text-lg font-bold text-white">PUBLIC / CITIZEN</h4>
<p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Report incidents, upload geo-tagged photos or videos, view local risk and receive public alerts.
            </p>
<div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5 font-medium">
<div className="flex items-center gap-1.5">
<span className="text-emerald-400">✓</span> Report an Incident
              </div>
<div className="flex items-center gap-1.5">
<span className="text-emerald-400">✓</span> View Local Risk
              </div>
<div className="flex items-center gap-1.5">
<span className="text-emerald-400">✓</span> Receive Alerts
              </div>
<div className="flex items-center gap-1.5">
<span className="text-emerald-400">✓</span> Submit Geo-tagged Evidence
              </div>
</div>
</div>
<div className="mt-6 pt-2">
<button className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono tracking-wide transition-colors flex items-center justify-center gap-1.5" onClick="switchRoleView('citizen')">
<span className="">PUBLIC SIGN IN</span>
<span className="">→</span>
</button>
</div>
</div>
{/*  CARD 2: RESPONSE TEAM  */}
<div className="bg-[#080e18] rounded-xl p-6 border-2 border-sky-500/40 hover:border-sky-500 transition-all flex flex-col justify-between group">
<div>
<div className="flex items-center justify-between mb-3">
<span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                AUTHORIZED PERSONNEL
              </span>
<span className="material-symbols-outlined text-sky-400 text-[22px]">shield</span>
</div>
<h4 className="text-lg font-bold text-white">RESPONSE TEAM</h4>
<p className="text-xs text-slate-300 mt-2 leading-relaxed">
              For authorized personnel to monitor, verify and respond to disaster incidents across districts.
            </p>
<div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5 font-medium">
<div className="flex items-center gap-1.5">
<span className="text-sky-400">✓</span> Command Center Access
              </div>
<div className="flex items-center gap-1.5">
<span className="text-sky-400">✓</span> Real-Time Risk Intelligence
              </div>
<div className="flex items-center gap-1.5">
<span className="text-sky-400">✓</span> Incident Verification &amp; Coordination
              </div>
<div className="flex items-center gap-1.5">
<span className="text-sky-400">✓</span> Statutory Response Action
              </div>
</div>
</div>
<div className="mt-6 pt-2">
<button className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold font-mono tracking-wide transition-colors flex items-center justify-center gap-1.5" onClick="switchRoleView('response')">
<span className="">RESPONSE TEAM SIGN IN</span>
<span className="">→</span>
</button>
</div>
</div>
</div>
{/*  Sub-links  */}
<div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
<a className="hover:text-sky-400" href="#how-it-works" onClick="closeRoleModal()">New here? Learn how NETRA works →</a>
<button className="hover:text-white" onClick="closeRoleModal()">← Back to NETRA</button>
</div>
</div>
{/*  VIEW B: PUBLIC / CITIZEN SIGN IN FORM  */}
<div className="p-6 sm:p-8 hidden" id="viewCitizenAuth">
<div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-emerald-400">person</span>
<div>
<h4 className="font-bold text-white text-base">Public / Citizen Access</h4>
<p className="text-xs text-slate-400">Sign in with mobile OTP or continue as guest to report</p>
</div>
</div>
<button className="text-xs font-mono text-slate-400 hover:text-white" onClick="switchRoleView('select')">← Change Role</button>
</div>
<form className="space-y-4" onSubmit="event.preventDefault(); alert('Signed in as Community Contributor.'); closeRoleModal();">
<div>
<label className="block text-xs font-medium text-slate-300 mb-1">Mobile Number (For verification OTP)</label>
<div className="flex gap-2">
<span className="px-3 py-2 bg-[#080e18] border border-slate-700 rounded-lg text-xs font-mono text-slate-400 flex items-center">+91</span>
<input className="flex-1 bg-[#080e18] border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-emerald-500 focus:ring-0" placeholder="Enter 10-digit mobile" required="" type="tel" />
</div>
</div>
<button className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors" type="submit">
          Request OTP &amp; Continue
        </button>
<div className="relative flex py-2 items-center">
<div className="flex-grow border-t border-slate-800"></div>
<span className="flex-shrink mx-3 text-[11px] text-slate-500 font-mono">OR</span>
<div className="flex-grow border-t border-slate-800"></div>
</div>
<button className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors" onClick="alert('Continuing as Guest reporter with local GPS storage.'); closeRoleModal();" type="button">
          Continue as Guest (Direct Photo Upload)
        </button>
</form>
</div>
{/*  VIEW C: RESPONSE TEAM OFFICIAL AUTHENTICATION FORM  */}
<div className="p-6 sm:p-8 hidden" id="viewResponseAuth">
<div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-sky-400">shield</span>
<div>
<h4 className="font-bold text-white text-base">Authorized Personnel Command Gateway</h4>
<p className="text-xs text-slate-400">For District Incident Commanders, Engineers &amp; Emergency Teams</p>
</div>
</div>
<button className="text-xs font-mono text-slate-400 hover:text-white" onClick="switchRoleView('select')">← Change Role</button>
</div>
<form className="space-y-4" onSubmit="event.preventDefault(); alert('Authenticated successfully into NETRA Command Center.'); closeRoleModal();">
<div>
<label className="block text-xs font-medium text-slate-300 mb-1">Official ID / Service Number</label>
<input className="w-full bg-[#080e18] border border-slate-700 rounded-lg p-2.5 text-white text-xs font-mono focus:border-sky-500 focus:ring-0" placeholder="e.g. UK-EOC-8492 or SIKKIM-TF-10" required="" type="text" />
</div>
<div>
<label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
<input className="w-full bg-[#080e18] border border-slate-700 rounded-lg p-2.5 text-white text-xs font-mono focus:border-sky-500 focus:ring-0" placeholder="••••••••••••" required="" type="password" />
</div>
<div className="flex items-center justify-between text-xs text-slate-400">
<label className="flex items-center gap-2 cursor-pointer">
<input className="rounded bg-[#080e18] border-slate-700 text-sky-600 focus:ring-0" type="checkbox" />
<span className="">Remember terminal</span>
</label>
<a className="text-sky-400 hover:underline text-[11px]" href="#">Help with credentials</a>
</div>
<button className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold font-mono tracking-wider transition-colors shadow-md" type="submit">
          SIGN IN TO COMMAND CENTER
        </button>
</form>
</div>
</div>
</div>
{/*  ================= JAVASCRIPT LOGIC =================  */}






    </>
  );
}
