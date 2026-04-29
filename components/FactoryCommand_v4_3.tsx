'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BatteryCharging,
  Boxes,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CircuitBoard,
  Clock3,
  Cpu,
  Database,
  DollarSign,
  Droplets,
  Factory,
  Fuel,
  Gauge,
  GitBranch,
  Layers,
  LineChart as LineChartIcon,
  MapPin,
  Package,
  Pickaxe,
  RadioTower,
  Route,
  Settings2,
  Ship,
  SlidersHorizontal,
  Sparkles,
  Truck,
  Warehouse,
  Waves,
  X,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type StageId =
  | 'pad'
  | 'drilling'
  | 'completion'
  | 'production'
  | 'gathering'
  | 'treatment'
  | 'storage';

type ScenarioId =
  | 'normal'
  | 'sandDelay'
  | 'fracBottleneck'
  | 'batteryConstraint'
  | 'evacuationConstraint'
  | 'optimizationRecovery';

type TimeRange = 'Live' | '24H' | '7D' | '30D';
type ViewMode = 'Digital Twin' | 'Constraint Lens' | 'Margin Lens';
type RiskLevel = 'low' | 'guarded' | 'elevated' | 'critical';
type MaterialId =
  | 'sand'
  | 'water'
  | 'diesel'
  | 'casing'
  | 'cement'
  | 'barite'
  | 'chemicals'
  | 'tubing'
  | 'spares';

type WellState = 'planned' | 'pad-ready' | 'drilling' | 'completion' | 'flowback' | 'online' | 'constrained';
type TruckStatus = 'Moving' | 'Queued' | 'Loading' | 'Unloading' | 'Delayed' | 'At Gate' | 'Released';
type AssetType = 'pad' | 'well' | 'rig' | 'fracSpread' | 'battery' | 'plant' | 'line' | 'tank' | 'batch' | 'kpi';

type WhatIfControls = {
  sandDeliveryDelay: number;
  waterAvailability: number;
  dieselAvailability: number;
  rigEfficiency: number;
  fracSpreadProductivity: number;
  truckCongestion: number;
  batteryCapacityConstraint: number;
  evacuationCapacity: number;
  productionUpliftTarget: number;
};

type StageDefinition = {
  id: StageId;
  name: string;
  short: string;
  purpose: string;
  icon: LucideIcon;
  primaryMaterial: MaterialId;
};

type Pad = {
  id: string;
  name: string;
  sector: string;
  x: number;
  y: number;
  wells: number;
  currentStage: StageId;
  constructionProgress: number;
  readiness: number;
  earthworks: number;
  dieselUsed: number;
  waterDemand: number;
  crew: number;
  daysToRig: number;
  linkedBattery: string;
  riskBase: number;
};

type Well = {
  id: string;
  padId: string;
  slot: number;
  state: WellState;
  measuredDepth: number;
  planDepth: number;
  lateralLength: number;
  fracStage: number;
  stagesPlanned: number;
  productionBpd: number;
  gasMcfd: number;
  waterBpd: number;
  uptime: number;
  lift: 'Natural Flow' | 'ESP' | 'Rod Pump' | 'Gas Lift';
  batteryId: string;
  startupLagDays: number;
};

type Rig = {
  id: string;
  padId: string;
  contractor: string;
  utilization: number;
  measuredDepth: number;
  planDepth: number;
  cycleDays: number;
  status: 'Drilling Curve' | 'Lateral' | 'Move' | 'Casing' | 'Waiting on Cement';
};

type FracSpread = {
  id: string;
  padId: string;
  wellId: string;
  stagesToday: number;
  continuity: number;
  pressurePsi: number;
  crew: string;
  status: 'Pumping' | 'Wireline' | 'Sand Watch' | 'Water Watch' | 'Crew Change';
};

type TruckItem = {
  id: string;
  contractor: string;
  driver: string;
  category: string;
  material: MaterialId;
  cargo: string;
  quantity: number;
  unit: string;
  origin: string;
  destination: string;
  linkedPad: string;
  linkedWell?: string;
  etaMinutes: number;
  queueMinutes: number;
  dwellMinutes: number;
  status: TruckStatus;
  orderStatus: 'Released' | 'Validated' | 'Pending Gate' | 'SAP Blocked' | 'Priority';
  delayReason: string;
  impact: string;
  route: number;
  progress: number;
  risk: number;
};

type Battery = {
  id: string;
  name: string;
  x: number;
  y: number;
  connectedPads: string[];
  capacityBpd: number;
  throughputBase: number;
  pressurePsi: number;
  oilCut: number;
  gasShare: number;
  waterShare: number;
};

type Plant = {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'Crude Treatment' | 'Gas Compression' | 'Water Treatment';
  capacity: number;
  inlet: number;
  outlet: number;
  compressionLoad: number;
  specReady: number;
};

type Tank = {
  id: string;
  name: string;
  x: number;
  y: number;
  capacityKbbl: number;
  fillKbbl: number;
  inboundKbbl: number;
  outboundKbbl: number;
  destination: string;
  price: number;
};

type InventoryItem = {
  id: MaterialId;
  name: string;
  unit: string;
  stock: number;
  plannedConsumption: number;
  inbound: number;
  outbound: number;
  coverageDays: number;
  risk: number;
  dependentPads: string[];
  nextStockoutHours: number;
  description: string;
};

type SystemMetrics = {
  totalWellsProgram: number;
  wellsOnline: number;
  wellsDrilling: number;
  wellsCompletion: number;
  wellsDelayed: number;
  padsActive: number;
  fracStagesToday: number;
  trucksActive: number;
  queuedTrucks: number;
  delayedTrucks: number;
  trucksRequired: number;
  truckQueueTime: number;
  inventoryCoverageDays: number;
  inventoryRisk: number;
  fracContinuityRisk: number;
  drillingScheduleConfidence: number;
  currentProduction: number;
  forecastProduction: number;
  productionDelta: number;
  batteryUtilization: number;
  evacuationUtilization: number;
  storagePressure: number;
  deliveredCost: number;
  marginImpact: number;
  scheduleDelay: number;
  bottleneckSeverity: number;
  downstreamImpactScore: number;
  riskLevel: RiskLevel;
  activeWells: number;
  capitalEfficiency: number;
};

type SelectedAsset = {
  type: AssetType;
  id: string;
  label?: string;
};

type AiRecommendation = {
  driver: string;
  immediateImpact: string;
  secondaryImpact: string;
  downstreamImpact: string;
  costImpact: string;
  marginImpact: string;
  scheduleImpact: string;
  recommendation: string;
  confidence: number;
  urgency: RiskLevel;
  priority: string;
  propagationPath: Array<{ label: string; value: string; risk: number }>;
};

type StageState = StageDefinition & {
  status: string;
  liveMetric: string;
  risk: number;
  progress: number;
  downstreamCount: number;
  affected: string;
};

type EventItem = {
  id: string;
  stage: StageId;
  severity: RiskLevel;
  title: string;
  detail: string;
  minutesAgo: number;
  targetType: 'pad' | 'well' | 'truck' | 'material' | 'battery' | 'plant' | 'tank';
  targetId: string;
};

const LOGO_URL = 'https://images.aiworkify.com/pluspetrol-project/pluspetrol-isologo.png';
const PROGRAM_WELLS = 600;

const STAGES: StageDefinition[] = [
  {
    id: 'pad',
    name: 'Pad Construction',
    short: 'Pad Build',
    purpose: 'Civil readiness, earthworks, water access, and rig handoff.',
    icon: Pickaxe,
    primaryMaterial: 'diesel',
  },
  {
    id: 'drilling',
    name: 'Drilling',
    short: 'Drilling',
    purpose: 'Rig cycle time, depth delivery, casing, mud, and wellbore quality.',
    icon: Gauge,
    primaryMaterial: 'casing',
  },
  {
    id: 'completion',
    name: 'Completion / Fracture',
    short: 'Frac',
    purpose: 'Stage execution, sand/water/diesel flows, and frac continuity.',
    icon: Zap,
    primaryMaterial: 'sand',
  },
  {
    id: 'production',
    name: 'Production',
    short: 'Production',
    purpose: 'Wells online, uptime, artificial lift, flowback, and forecast.',
    icon: Activity,
    primaryMaterial: 'tubing',
  },
  {
    id: 'gathering',
    name: 'Gathering & Batteries',
    short: 'Batteries',
    purpose: 'Flowline pressure, separation capacity, and connected well intake.',
    icon: GitBranch,
    primaryMaterial: 'spares',
  },
  {
    id: 'treatment',
    name: 'Treatment & Evacuation',
    short: 'Evacuation',
    purpose: 'Treatment plants, compression, trunk routes, and spec readiness.',
    icon: Factory,
    primaryMaterial: 'chemicals',
  },
  {
    id: 'storage',
    name: 'Storage & Dispatch',
    short: 'Dispatch',
    purpose: 'Tank fill, batch movement, title transfer, netback, and margin.',
    icon: Warehouse,
    primaryMaterial: 'diesel',
  },
];

const SCENARIOS: Record<ScenarioId, { label: string; summary: string; controls: WhatIfControls }> = {
  normal: {
    label: 'Normal Scaling',
    summary: 'Balanced field growth with manageable logistics load.',
    controls: {
      sandDeliveryDelay: 0.7,
      waterAvailability: 98,
      dieselAvailability: 94,
      rigEfficiency: 94,
      fracSpreadProductivity: 92,
      truckCongestion: 24,
      batteryCapacityConstraint: 8,
      evacuationCapacity: 98,
      productionUpliftTarget: 7,
    },
  },
  sandDelay: {
    label: 'Sand Delay',
    summary: 'Sand convoys slow, stage continuity decays, startup slips.',
    controls: {
      sandDeliveryDelay: 3.3,
      waterAvailability: 96,
      dieselAvailability: 91,
      rigEfficiency: 92,
      fracSpreadProductivity: 89,
      truckCongestion: 62,
      batteryCapacityConstraint: 12,
      evacuationCapacity: 95,
      productionUpliftTarget: 6,
    },
  },
  fracBottleneck: {
    label: 'Frac Bottleneck',
    summary: 'Completion capacity limits conversion of drilled wells to production.',
    controls: {
      sandDeliveryDelay: 1.8,
      waterAvailability: 87,
      dieselAvailability: 86,
      rigEfficiency: 101,
      fracSpreadProductivity: 74,
      truckCongestion: 48,
      batteryCapacityConstraint: 10,
      evacuationCapacity: 97,
      productionUpliftTarget: 9,
    },
  },
  batteryConstraint: {
    label: 'Battery Constraint',
    summary: 'Gathering load converts production upside into surface bottleneck risk.',
    controls: {
      sandDeliveryDelay: 0.8,
      waterAvailability: 99,
      dieselAvailability: 92,
      rigEfficiency: 96,
      fracSpreadProductivity: 95,
      truckCongestion: 31,
      batteryCapacityConstraint: 31,
      evacuationCapacity: 91,
      productionUpliftTarget: 17,
    },
  },
  evacuationConstraint: {
    label: 'Evacuation Constraint',
    summary: 'Treatment and trunk capacity restrain storage, dispatch, and margin.',
    controls: {
      sandDeliveryDelay: 1.0,
      waterAvailability: 96,
      dieselAvailability: 92,
      rigEfficiency: 94,
      fracSpreadProductivity: 93,
      truckCongestion: 35,
      batteryCapacityConstraint: 18,
      evacuationCapacity: 74,
      productionUpliftTarget: 13,
    },
  },
  optimizationRecovery: {
    label: 'Optimization Recovery',
    summary: 'Gate automation and re-routing restore stage rhythm and margin.',
    controls: {
      sandDeliveryDelay: 0.2,
      waterAvailability: 105,
      dieselAvailability: 102,
      rigEfficiency: 108,
      fracSpreadProductivity: 106,
      truckCongestion: 13,
      batteryCapacityConstraint: 4,
      evacuationCapacity: 108,
      productionUpliftTarget: 18,
    },
  },
};

const MATERIAL_META: Record<MaterialId, { name: string; unit: string; icon: LucideIcon; accent: string }> = {
  sand: { name: 'Sand', unit: 'kt', icon: Package, accent: '#f59e0b' },
  water: { name: 'Water', unit: 'kbbl', icon: Droplets, accent: '#06b6d4' },
  diesel: { name: 'Diesel', unit: 'kbbl', icon: Fuel, accent: '#64748b' },
  casing: { name: 'Casing', unit: 'joints', icon: Boxes, accent: '#2563eb' },
  cement: { name: 'Cement', unit: 't', icon: Package, accent: '#94a3b8' },
  barite: { name: 'Barite', unit: 't', icon: Boxes, accent: '#8b5cf6' },
  chemicals: { name: 'Chemicals', unit: 'm3', icon: Database, accent: '#10b981' },
  tubing: { name: 'Tubing', unit: 'joints', icon: Layers, accent: '#0ea5e9' },
  spares: { name: 'Critical Spares', unit: 'kits', icon: Settings2, accent: '#ef4444' },
};

const toneClasses: Record<RiskLevel, { bg: string; text: string; border: string; dot: string; fill: string }> = {
  low: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    fill: 'from-emerald-400 to-cyan-400',
  },
  guarded: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    dot: 'bg-cyan-500',
    fill: 'from-cyan-400 to-blue-400',
  },
  elevated: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    fill: 'from-amber-400 to-orange-400',
  },
  critical: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    fill: 'from-rose-500 to-red-500',
  },
};

const stageAccent: Record<StageId, string> = {
  pad: '#0ea5e9',
  drilling: '#2563eb',
  completion: '#f59e0b',
  production: '#10b981',
  gathering: '#06b6d4',
  treatment: '#8b5cf6',
  storage: '#ef4444',
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pct(value: number, decimals = 0) {
  return `${value.toFixed(decimals)}%`;
}

function compact(value: number, decimals = 0) {
  return new Intl.NumberFormat('en-US', {
    notation: Math.abs(value) >= 100000 ? 'compact' : 'standard',
    maximumFractionDigits: decimals,
  }).format(value);
}

function currency(value: number, decimals = 2) {
  return `${value < 0 ? '-' : ''}$${Math.abs(value).toFixed(decimals)}`;
}

function riskFromScore(score: number): RiskLevel {
  if (score >= 76) return 'critical';
  if (score >= 52) return 'elevated';
  if (score >= 28) return 'guarded';
  return 'low';
}

function deterministicNoise(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function wave(seed: number, tick: number, amplitude = 1) {
  return Math.sin((seed * 19.7 + tick * 0.42) % 100) * amplitude;
}

function generatePads(): Pad[] {
  const sectors = ['Aguada Norte', 'Loma Alta', 'Bajo Oeste', 'Central Block', 'Eastern Stepout', 'Sur Pad Cluster'];
  return Array.from({ length: 96 }, (_, index) => {
    const col = index % 12;
    const row = Math.floor(index / 12);
    const wells = index < 24 ? 7 : 6;
    const stageIndex = index % STAGES.length;
    const currentStage = STAGES[stageIndex].id;
    const jitterX = (deterministicNoise(index + 4) - 0.5) * 4;
    const jitterY = (deterministicNoise(index + 19) - 0.5) * 4;
    const progress = clamp(32 + stageIndex * 10 + deterministicNoise(index + 9) * 38, 8, 99);

    return {
      id: `PAD-${String(index + 1).padStart(2, '0')}`,
      name: `Pad ${String(index + 1).padStart(2, '0')}`,
      sector: sectors[index % sectors.length],
      x: 70 + col * 72 + jitterX,
      y: 60 + row * 55 + jitterY,
      wells,
      currentStage,
      constructionProgress: currentStage === 'pad' ? progress : clamp(85 + deterministicNoise(index) * 15, 0, 100),
      readiness: clamp(42 + progress * 0.62 + deterministicNoise(index + 14) * 18, 0, 100),
      earthworks: clamp(progress + deterministicNoise(index + 3) * 12, 0, 100),
      dieselUsed: 18 + deterministicNoise(index + 7) * 36,
      waterDemand: 7 + deterministicNoise(index + 15) * 18,
      crew: 14 + Math.floor(deterministicNoise(index + 22) * 22),
      daysToRig: clamp(0.7 + (100 - progress) / 14 + deterministicNoise(index + 2) * 2.4, 0, 12),
      linkedBattery: `B-${String((index % 10) + 1).padStart(2, '0')}`,
      riskBase: clamp(18 + deterministicNoise(index + 44) * 58, 8, 88),
    };
  });
}

function generateWells(pads: Pad[]): Well[] {
  const statesByStage: Record<StageId, WellState[]> = {
    pad: ['planned', 'pad-ready', 'planned', 'planned'],
    drilling: ['drilling', 'drilling', 'pad-ready', 'planned'],
    completion: ['completion', 'flowback', 'completion', 'drilling'],
    production: ['online', 'online', 'flowback', 'constrained'],
    gathering: ['online', 'constrained', 'online', 'flowback'],
    treatment: ['online', 'online', 'constrained', 'online'],
    storage: ['online', 'online', 'online', 'constrained'],
  };

  return pads.flatMap((pad, padIndex) =>
    Array.from({ length: pad.wells }, (_, slot) => {
      const seed = padIndex * 17 + slot * 13;
      const state = statesByStage[pad.currentStage][slot % statesByStage[pad.currentStage].length];
      const planDepth = 5100 + deterministicNoise(seed + 1) * 900;
      const measuredDepth = state === 'drilling' ? planDepth * (0.42 + deterministicNoise(seed + 2) * 0.48) : planDepth;
      const onlineFactor = state === 'online' ? 1 : state === 'constrained' ? 0.62 : state === 'flowback' ? 0.28 : 0;
      return {
        id: `${pad.id}-H${String(slot + 1).padStart(2, '0')}`,
        padId: pad.id,
        slot: slot + 1,
        state,
        measuredDepth,
        planDepth,
        lateralLength: 2350 + deterministicNoise(seed + 3) * 900,
        fracStage: Math.floor(8 + deterministicNoise(seed + 4) * 44),
        stagesPlanned: 46 + Math.floor(deterministicNoise(seed + 5) * 18),
        productionBpd: onlineFactor * (520 + deterministicNoise(seed + 6) * 850),
        gasMcfd: onlineFactor * (900 + deterministicNoise(seed + 7) * 1300),
        waterBpd: onlineFactor * (90 + deterministicNoise(seed + 8) * 280),
        uptime: clamp(78 + deterministicNoise(seed + 9) * 21 - (state === 'constrained' ? 18 : 0), 45, 99.8),
        lift: (['Natural Flow', 'ESP', 'Gas Lift', 'Rod Pump'] as const)[Math.floor(deterministicNoise(seed + 10) * 4)],
        batteryId: pad.linkedBattery,
        startupLagDays: clamp(deterministicNoise(seed + 11) * 5.8 + (state === 'completion' ? 1.2 : 0), 0, 8),
      };
    }),
  );
}

function generateBatteries(pads: Pad[]): Battery[] {
  return Array.from({ length: 10 }, (_, index) => {
    const connectedPads = pads.filter((pad) => pad.linkedBattery === `B-${String(index + 1).padStart(2, '0')}`).map((pad) => pad.id);
    return {
      id: `B-${String(index + 1).padStart(2, '0')}`,
      name: `Battery ${String(index + 1).padStart(2, '0')}`,
      x: 105 + (index % 5) * 180 + deterministicNoise(index + 91) * 14,
      y: 315 + Math.floor(index / 5) * 80 + deterministicNoise(index + 92) * 20,
      connectedPads,
      capacityBpd: 36000 + deterministicNoise(index + 93) * 18000,
      throughputBase: 23000 + deterministicNoise(index + 94) * 21000,
      pressurePsi: 420 + deterministicNoise(index + 95) * 220,
      oilCut: 62 + deterministicNoise(index + 96) * 18,
      gasShare: 15 + deterministicNoise(index + 97) * 9,
      waterShare: 12 + deterministicNoise(index + 98) * 13,
    };
  });
}

function generatePlants(): Plant[] {
  return [
    {
      id: 'PLT-01',
      name: 'Crude Treatment North',
      x: 240,
      y: 210,
      type: 'Crude Treatment',
      capacity: 170000,
      inlet: 132000,
      outlet: 126000,
      compressionLoad: 62,
      specReady: 96,
    },
    {
      id: 'PLT-02',
      name: 'Gas Compression Hub',
      x: 520,
      y: 185,
      type: 'Gas Compression',
      capacity: 240000,
      inlet: 184000,
      outlet: 178000,
      compressionLoad: 74,
      specReady: 92,
    },
    {
      id: 'PLT-03',
      name: 'Central Evacuation Plant',
      x: 720,
      y: 290,
      type: 'Crude Treatment',
      capacity: 210000,
      inlet: 168000,
      outlet: 162000,
      compressionLoad: 68,
      specReady: 94,
    },
  ];
}

function generateTanks(): Tank[] {
  return Array.from({ length: 8 }, (_, index) => ({
    id: `TK-${String(index + 1).padStart(2, '0')}`,
    name: `Tank ${String(index + 1).padStart(2, '0')}`,
    x: 120 + (index % 4) * 185,
    y: 210 + Math.floor(index / 4) * 130,
    capacityKbbl: 85 + deterministicNoise(index + 300) * 55,
    fillKbbl: 38 + deterministicNoise(index + 301) * 82,
    inboundKbbl: 8 + deterministicNoise(index + 302) * 18,
    outboundKbbl: 7 + deterministicNoise(index + 303) * 22,
    destination: ['Terminal Norte', 'Export Blend', 'Refinery Slot A', 'Pipeline Batch 42'][index % 4],
    price: 68 + deterministicNoise(index + 304) * 9,
  }));
}

const BASE_PADS = generatePads();
const BASE_WELLS = generateWells(BASE_PADS);
const BASE_BATTERIES = generateBatteries(BASE_PADS);
const BASE_PLANTS = generatePlants();
const BASE_TANKS = generateTanks();

function getScenarioControls(id: ScenarioId) {
  return { ...SCENARIOS[id].controls };
}

function calculateScheduleImpact(controls: WhatIfControls) {
  const sand = controls.sandDeliveryDelay * 0.38;
  const congestion = controls.truckCongestion * 0.035;
  const water = Math.max(0, 100 - controls.waterAvailability) * 0.04;
  const diesel = Math.max(0, 100 - controls.dieselAvailability) * 0.035;
  const rigGain = Math.max(0, controls.rigEfficiency - 95) * 0.045;
  const fracLoss = Math.max(0, 96 - controls.fracSpreadProductivity) * 0.06;
  return clamp(sand + congestion + water + diesel + fracLoss - rigGain, -0.9, 9.5);
}

function calculateMarginImpact(controls: WhatIfControls, productionDelta: number, deliveredCost: number) {
  const volumeEffect = productionDelta / 10000 * 0.11;
  const costEffect = (deliveredCost - 9.65) * 0.72;
  const evacPenalty = Math.max(0, 100 - controls.evacuationCapacity) * 0.022;
  const optimization = Math.max(0, controls.evacuationCapacity - 100) * 0.015 + Math.max(0, controls.fracSpreadProductivity - 100) * 0.012;
  return clamp(volumeEffect - costEffect - evacPenalty + optimization, -4.8, 3.4);
}

function calculateSystemMetrics(controls: WhatIfControls, scenario: ScenarioId, tick: number): SystemMetrics {
  const sandDelay = controls.sandDeliveryDelay;
  const waterShort = Math.max(0, 100 - controls.waterAvailability) / 100;
  const dieselShort = Math.max(0, 100 - controls.dieselAvailability) / 100;
  const rigFactor = controls.rigEfficiency / 100;
  const fracFactor = controls.fracSpreadProductivity / 100;
  const congestion = controls.truckCongestion / 100;
  const batteryConstraint = controls.batteryCapacityConstraint / 100;
  const evacFactor = controls.evacuationCapacity / 100;
  const uplift = controls.productionUpliftTarget / 100;
  const heartbeat = wave(11, tick, 1);

  const fracContinuityRisk = clamp(
    8 + sandDelay * 9.5 + congestion * 34 + waterShort * 42 + dieselShort * 31 + Math.max(0, 0.94 - fracFactor) * 75,
    0,
    98,
  );
  const drillingScheduleConfidence = clamp(88 * rigFactor - congestion * 10 - dieselShort * 18 + heartbeat * 1.8, 42, 99);
  const scheduleDelay = calculateScheduleImpact(controls);
  const wellsDrilling = Math.round(clamp(44 * rigFactor + 7 - scheduleDelay * 1.2, 22, 66));
  const wellsCompletion = Math.round(clamp(72 * fracFactor - fracContinuityRisk * 0.18 + 12, 32, 96));
  const wellsDelayed = Math.round(clamp(18 + scheduleDelay * 7 + fracContinuityRisk * 0.34 + Math.max(0, 1 - evacFactor) * 38, 4, 126));
  const wellsOnline = Math.round(clamp(326 + uplift * 105 - wellsDelayed * 0.55 + Math.max(0, evacFactor - 1) * 18 + heartbeat * 2, 250, 454));
  const activeWells = wellsOnline + wellsDrilling + wellsCompletion;
  const fracStagesToday = Math.round(
    clamp(212 * fracFactor * (1 - sandDelay * 0.046) * (1 - congestion * 0.16) * (1 - waterShort * 0.42) * (1 - dieselShort * 0.28), 82, 268),
  );
  const trucksRequired = Math.round(clamp(245 + fracStagesToday * 0.72 + controls.truckCongestion * 1.6 + sandDelay * 14, 250, 430));
  const trucksActive = Math.round(clamp(trucksRequired + heartbeat * 7, 250, 398));
  const queuedTrucks = Math.round(clamp(18 + controls.truckCongestion * 0.95 + sandDelay * 11 + waterShort * 28, 8, 132));
  const delayedTrucks = Math.round(clamp(queuedTrucks * 0.34 + sandDelay * 9 + dieselShort * 24, 3, 74));
  const truckQueueTime = clamp(0.4 + sandDelay * 0.52 + congestion * 3.8 + waterShort * 1.6 + heartbeat * 0.08, 0.2, 8.5);
  const inventoryCoverageDays = clamp(
    4.8 - sandDelay * 0.36 - waterShort * 7.2 - dieselShort * 6.1 - congestion * 1.5 - Math.max(0, fracFactor - 1) * 1.1,
    0.35,
    8.5,
  );
  const inventoryRisk = clamp(100 - inventoryCoverageDays * 12 + fracContinuityRisk * 0.26 + queuedTrucks * 0.08, 4, 96);
  const productionBase = 259000 + wellsOnline * 365;
  const productionConstraint = fracContinuityRisk * 270 + Math.max(0, 1 - evacFactor) * 62000 + batteryConstraint * 93000;
  const currentProduction = Math.round(clamp(productionBase * (1 + uplift * 0.55) - productionConstraint + heartbeat * 1400, 245000, 494000));
  const forecastProduction = Math.round(
    clamp(currentProduction + 82000 + controls.productionUpliftTarget * 1700 - scheduleDelay * 4100 - fracContinuityRisk * 540, 290000, 610000),
  );
  const productionDelta = forecastProduction - (474000 + controls.productionUpliftTarget * 900);
  const batteryUtilization = clamp(62 + uplift * 92 + batteryConstraint * 93 + Math.max(0, currentProduction - 390000) / 3100, 38, 108);
  const evacuationUtilization = clamp(58 + currentProduction / 7800 - (evacFactor - 1) * 48 + batteryConstraint * 22, 38, 112);
  const storagePressure = clamp(34 + Math.max(0, evacuationUtilization - 82) * 1.15 + Math.max(0, 1 - evacFactor) * 38, 18, 100);
  const deliveredCost = clamp(9.45 + congestion * 1.55 + sandDelay * 0.22 + Math.max(0, 1 - evacFactor) * 3.1 + batteryConstraint * 1.4 - Math.max(0, fracFactor - 1) * 0.58, 8.85, 15.7);
  const marginImpact = calculateMarginImpact(controls, productionDelta, deliveredCost);
  const bottleneckSeverity = clamp(
    Math.max(fracContinuityRisk, inventoryRisk, batteryUtilization - 10, evacuationUtilization - 6, storagePressure) + (scenario === 'optimizationRecovery' ? -7 : 0),
    0,
    100,
  );
  const downstreamImpactScore = clamp(
    fracContinuityRisk * 0.25 + inventoryRisk * 0.17 + batteryUtilization * 0.19 + evacuationUtilization * 0.19 + storagePressure * 0.12 + scheduleDelay * 5,
    5,
    99,
  );
  const riskLevel = riskFromScore(bottleneckSeverity);
  const capitalEfficiency = clamp(92 + marginImpact * 3.8 - scheduleDelay * 1.8 + (rigFactor - 1) * 18, 58, 106);

  return {
    totalWellsProgram: PROGRAM_WELLS,
    wellsOnline,
    wellsDrilling,
    wellsCompletion,
    wellsDelayed,
    padsActive: 86,
    fracStagesToday,
    trucksActive,
    queuedTrucks,
    delayedTrucks,
    trucksRequired,
    truckQueueTime,
    inventoryCoverageDays,
    inventoryRisk,
    fracContinuityRisk,
    drillingScheduleConfidence,
    currentProduction,
    forecastProduction,
    productionDelta,
    batteryUtilization,
    evacuationUtilization,
    storagePressure,
    deliveredCost,
    marginImpact,
    scheduleDelay,
    bottleneckSeverity,
    downstreamImpactScore,
    riskLevel,
    activeWells,
    capitalEfficiency,
  };
}

function calculateInventoryRisk(material: MaterialId, controls: WhatIfControls, metrics: SystemMetrics, seed: number): InventoryItem {
  const meta = MATERIAL_META[material];
  const baseCoverage: Record<MaterialId, number> = {
    sand: 4.2,
    water: 3.4,
    diesel: 2.9,
    casing: 7.8,
    cement: 6.1,
    barite: 5.2,
    chemicals: 4.7,
    tubing: 8.4,
    spares: 5.6,
  };
  const stockBase: Record<MaterialId, number> = {
    sand: 82,
    water: 310,
    diesel: 34,
    casing: 12400,
    cement: 6900,
    barite: 3300,
    chemicals: 780,
    tubing: 8700,
    spares: 184,
  };
  const consumptionBase: Record<MaterialId, number> = {
    sand: 20.5,
    water: 88,
    diesel: 11.2,
    casing: 1280,
    cement: 780,
    barite: 420,
    chemicals: 120,
    tubing: 760,
    spares: 34,
  };

  const fracLoad = metrics.fracStagesToday / 210;
  const rigLoad = controls.rigEfficiency / 94;
  const congestionPenalty = controls.truckCongestion / 100;
  const materialSpecific = {
    sand: -controls.sandDeliveryDelay * 0.46 - Math.max(0, controls.fracSpreadProductivity - 95) * 0.025 - congestionPenalty * 1.2,
    water: (controls.waterAvailability - 100) * 0.055 - fracLoad * 0.45,
    diesel: (controls.dieselAvailability - 100) * 0.05 - fracLoad * 0.32 - rigLoad * 0.18,
    casing: -Math.max(0, controls.rigEfficiency - 95) * 0.042,
    cement: -Math.max(0, controls.rigEfficiency - 98) * 0.035,
    barite: -Math.max(0, controls.rigEfficiency - 100) * 0.025,
    chemicals: -Math.max(0, metrics.evacuationUtilization - 86) * 0.018,
    tubing: -Math.max(0, controls.productionUpliftTarget - 10) * 0.045,
    spares: -Math.max(0, metrics.batteryUtilization - 82) * 0.028,
  }[material];

  const coverageDays = clamp(baseCoverage[material] + materialSpecific + wave(seed, seed + 4, 0.18), 0.25, 10.5);
  const risk = clamp(100 - coverageDays * 13 + metrics.fracContinuityRisk * (material === 'sand' ? 0.28 : 0.08), 4, 98);
  const dependentPads = BASE_PADS.filter((pad, index) => (index + seed) % (material === 'sand' ? 5 : 7) === 0)
    .slice(0, 7)
    .map((pad) => pad.id);

  return {
    id: material,
    name: meta.name,
    unit: meta.unit,
    stock: Math.round(stockBase[material] * clamp(coverageDays / baseCoverage[material], 0.32, 1.35)),
    plannedConsumption: Math.round(consumptionBase[material] * (material === 'sand' || material === 'water' || material === 'diesel' ? fracLoad : rigLoad)),
    inbound: Math.round(consumptionBase[material] * (0.55 + deterministicNoise(seed + 55) * 0.7)),
    outbound: Math.round(consumptionBase[material] * (0.48 + deterministicNoise(seed + 75) * 0.58)),
    coverageDays,
    risk,
    dependentPads,
    nextStockoutHours: coverageDays * 24,
    description: `${meta.name} governs ${material === 'sand' || material === 'water' || material === 'diesel' ? 'frac stage continuity' : material === 'casing' || material === 'cement' || material === 'barite' ? 'drilling cycle continuity' : 'surface production readiness'}.`,
  };
}

function createInventory(controls: WhatIfControls, metrics: SystemMetrics) {
  return (Object.keys(MATERIAL_META) as MaterialId[]).map((material, index) => calculateInventoryRisk(material, controls, metrics, index + 31));
}

function generateRigs(pads: Pad[], controls: WhatIfControls): Rig[] {
  const drillingPads = pads.filter((pad) => pad.currentStage === 'drilling');
  return Array.from({ length: 10 }, (_, index) => {
    const pad = drillingPads[index % drillingPads.length];
    const seed = index * 23 + 8;
    const planDepth = 5200 + deterministicNoise(seed) * 850;
    return {
      id: `R-${String(index + 1).padStart(2, '0')}`,
      padId: pad.id,
      contractor: ['San Antonio', 'Nabors', 'DLS', 'Helmerich', 'Quilmes Rig Services'][index % 5],
      utilization: clamp(controls.rigEfficiency - 12 + deterministicNoise(seed + 2) * 22, 58, 108),
      measuredDepth: planDepth * clamp(0.55 + deterministicNoise(seed + 3) * 0.42, 0.2, 0.99),
      planDepth,
      cycleDays: clamp(16.5 - controls.rigEfficiency * 0.065 + deterministicNoise(seed + 4) * 4.8, 7.8, 21),
      status: (['Drilling Curve', 'Lateral', 'Move', 'Casing', 'Waiting on Cement'] as const)[index % 5],
    };
  });
}

function generateFracSpreads(wells: Well[], controls: WhatIfControls): FracSpread[] {
  const fracWells = wells.filter((well) => well.state === 'completion' || well.state === 'flowback');
  return Array.from({ length: 5 }, (_, index) => {
    const well = fracWells[index * 3] ?? fracWells[index];
    const seed = index * 41 + 4;
    const statusIndex = Math.floor(clamp((100 - controls.fracSpreadProductivity) / 12 + deterministicNoise(seed) * 3, 0, 4));
    return {
      id: `FS-${String(index + 1).padStart(2, '0')}`,
      padId: well.padId,
      wellId: well.id,
      stagesToday: Math.round(clamp(39 + controls.fracSpreadProductivity * 0.24 - controls.sandDeliveryDelay * 2.1 - controls.truckCongestion * 0.08 + deterministicNoise(seed + 2) * 8, 18, 64)),
      continuity: clamp(104 - controls.sandDeliveryDelay * 10 - controls.truckCongestion * 0.42 - Math.max(0, 100 - controls.waterAvailability) * 0.8, 12, 100),
      pressurePsi: 7800 + deterministicNoise(seed + 3) * 1600 + controls.fracSpreadProductivity * 7,
      crew: ['Alpha', 'Bravo', 'Condor', 'Delta', 'Eagle'][index],
      status: (['Pumping', 'Wireline', 'Sand Watch', 'Water Watch', 'Crew Change'] as const)[statusIndex],
    };
  });
}

function generateTrucks(pads: Pad[], controls: WhatIfControls, metrics: SystemMetrics, tick: number): TruckItem[] {
  const materials: Array<{ id: MaterialId; category: string; unit: string; baseQty: number }> = [
    { id: 'sand', category: 'Sand', unit: 't', baseQty: 42 },
    { id: 'water', category: 'Water', unit: 'bbl', baseQty: 190 },
    { id: 'diesel', category: 'Diesel', unit: 'bbl', baseQty: 70 },
    { id: 'casing', category: 'Casing', unit: 'joints', baseQty: 140 },
    { id: 'cement', category: 'Cement', unit: 't', baseQty: 28 },
    { id: 'barite', category: 'Barite', unit: 't', baseQty: 24 },
    { id: 'chemicals', category: 'Chemicals', unit: 'm3', baseQty: 22 },
    { id: 'tubing', category: 'Tubing', unit: 'joints', baseQty: 110 },
    { id: 'spares', category: 'Spare Parts', unit: 'kits', baseQty: 4 },
    { id: 'chemicals', category: 'Waste / Backhaul', unit: 'm3', baseQty: 30 },
  ];
  const origins = ['Yard A - Añelo', 'Staging Yard B', 'Sand Terminal C', 'Water Hub 02', 'Fuel Farm Norte', 'Casing Yard Oeste'];
  const contractors = ['TransNeuquen', 'LogiFrac', 'Patagonia Cargo', 'Andes Haul', 'Cono Sur Transport', 'Vista Fleet'];
  const delayReasons = [
    'None',
    'Gate validation queue',
    'Route congestion at km 18',
    'Loading bay saturation',
    'Weather hold',
    'SAP release pending',
    'Scale ticket mismatch',
  ];
  const count = clamp(metrics.trucksActive, 250, 398);

  return Array.from({ length: count }, (_, index) => {
    const materialMeta = materials[index % materials.length];
    const destinationPad = pads[(index * 7 + Math.floor(tick / 2)) % pads.length];
    const seed = index * 97 + tick * 3;
    const progress = (deterministicNoise(seed + 1) + tick * 0.018 + index * 0.007) % 1;
    const congestion = controls.truckCongestion / 100;
    const materialDelay = materialMeta.id === 'sand' ? controls.sandDeliveryDelay * 13 : materialMeta.id === 'water' ? Math.max(0, 100 - controls.waterAvailability) * 0.42 : materialMeta.id === 'diesel' ? Math.max(0, 100 - controls.dieselAvailability) * 0.46 : 0;
    const risk = clamp(18 + congestion * 54 + materialDelay * 0.75 + deterministicNoise(seed + 2) * 32, 4, 98);
    const status: TruckStatus = risk > 78 ? 'Delayed' : risk > 62 ? 'Queued' : progress < 0.14 ? 'Loading' : progress > 0.84 ? 'Unloading' : progress > 0.72 ? 'At Gate' : 'Moving';
    const orderStatus = risk > 84 ? 'SAP Blocked' : risk > 70 ? 'Pending Gate' : materialMeta.id === 'sand' && controls.sandDeliveryDelay > 2 ? 'Priority' : progress > 0.7 ? 'Validated' : 'Released';

    return {
      id: `TRK-${String(index + 1).padStart(4, '0')}`,
      contractor: contractors[index % contractors.length],
      driver: ['Luciano M.', 'Mateo R.', 'Valentina C.', 'Joaquín A.', 'Sofía L.', 'Emiliano P.'][index % 6],
      category: materialMeta.category,
      material: materialMeta.id,
      cargo: materialMeta.category,
      quantity: Math.round(materialMeta.baseQty * (0.75 + deterministicNoise(seed + 3) * 0.55)),
      unit: materialMeta.unit,
      origin: origins[index % origins.length],
      destination: destinationPad.name,
      linkedPad: destinationPad.id,
      linkedWell: `${destinationPad.id}-H${String((index % destinationPad.wells) + 1).padStart(2, '0')}`,
      etaMinutes: Math.round(clamp(22 + (1 - progress) * 150 + congestion * 85 + materialDelay, 5, 360)),
      queueMinutes: Math.round(clamp(metrics.truckQueueTime * 20 + deterministicNoise(seed + 4) * 45 + (status === 'Queued' ? 45 : 0), 0, 240)),
      dwellMinutes: Math.round(clamp(12 + deterministicNoise(seed + 5) * 65 + congestion * 40, 4, 160)),
      status,
      orderStatus,
      delayReason: status === 'Delayed' || status === 'Queued' ? delayReasons[Math.min(delayReasons.length - 1, 1 + Math.floor(deterministicNoise(seed + 6) * 6))] : 'None',
      impact:
        materialMeta.id === 'sand'
          ? 'May interrupt stage continuity if gate release misses the pumping window.'
          : materialMeta.id === 'diesel'
            ? 'Reduces uninterrupted pumping and rig auxiliary power coverage.'
            : materialMeta.id === 'water'
              ? 'Constrains water buffer for high-rate frac stages.'
              : 'Affects schedule confidence for linked pad operations.',
      route: index % 7,
      progress,
      risk,
    };
  });
}

function deriveStageStates(metrics: SystemMetrics, controls: WhatIfControls): StageState[] {
  return STAGES.map((stage) => {
    if (stage.id === 'pad') {
      return {
        ...stage,
        status: metrics.scheduleDelay > 3 ? 'Handoff pressure' : 'Rig-ready buildout',
        liveMetric: `${Math.round(82 - metrics.scheduleDelay * 2)}% readiness`,
        risk: clamp(28 + metrics.scheduleDelay * 9 + (100 - controls.dieselAvailability) * 0.4, 4, 94),
        progress: clamp(84 - metrics.scheduleDelay * 3, 52, 98),
        downstreamCount: Math.round(metrics.wellsDrilling + metrics.wellsCompletion * 0.4),
        affected: 'rig handoff',
      };
    }
    if (stage.id === 'drilling') {
      return {
        ...stage,
        status: controls.rigEfficiency > 102 ? 'Accelerating queue' : metrics.drillingScheduleConfidence < 70 ? 'Cycle risk' : 'On sequence',
        liveMetric: `${pct(metrics.drillingScheduleConfidence)} confidence`,
        risk: clamp(100 - metrics.drillingScheduleConfidence + (100 - controls.dieselAvailability) * 0.3, 4, 92),
        progress: clamp(metrics.drillingScheduleConfidence, 42, 99),
        downstreamCount: metrics.wellsCompletion,
        affected: 'completion queue',
      };
    }
    if (stage.id === 'completion') {
      return {
        ...stage,
        status: metrics.fracContinuityRisk > 65 ? 'Continuity threatened' : 'High-rate pumping',
        liveMetric: `${metrics.fracStagesToday} stages today`,
        risk: metrics.fracContinuityRisk,
        progress: clamp(100 - metrics.fracContinuityRisk, 8, 96),
        downstreamCount: metrics.wellsDelayed,
        affected: 'well startup',
      };
    }
    if (stage.id === 'production') {
      return {
        ...stage,
        status: metrics.productionDelta < -15000 ? 'Forecast erosion' : 'Startup conversion',
        liveMetric: `${compact(metrics.currentProduction)} bbl/d`,
        risk: clamp(46 - metrics.marginImpact * 9 + Math.max(0, -metrics.productionDelta) / 850, 8, 96),
        progress: clamp(70 + metrics.productionDelta / 4000, 36, 99),
        downstreamCount: Math.round(metrics.wellsOnline * 0.28),
        affected: 'gathering load',
      };
    }
    if (stage.id === 'gathering') {
      return {
        ...stage,
        status: metrics.batteryUtilization > 91 ? 'Battery limit' : 'Routing balanced',
        liveMetric: `${pct(metrics.batteryUtilization, 1)} battery use`,
        risk: clamp(metrics.batteryUtilization - 18, 6, 98),
        progress: clamp(100 - Math.max(0, metrics.batteryUtilization - 82) * 1.3, 20, 96),
        downstreamCount: Math.round(BASE_BATTERIES.length + metrics.wellsDelayed * 0.12),
        affected: 'evacuation readiness',
      };
    }
    if (stage.id === 'treatment') {
      return {
        ...stage,
        status: metrics.evacuationUtilization > 94 ? 'Evacuation constrained' : 'Spec ready',
        liveMetric: `${pct(metrics.evacuationUtilization, 1)} utilization`,
        risk: clamp(metrics.evacuationUtilization - 14, 6, 99),
        progress: clamp(112 - metrics.evacuationUtilization, 14, 98),
        downstreamCount: Math.round(BASE_TANKS.length * 4 + metrics.storagePressure * 0.2),
        affected: 'storage pressure',
      };
    }
    return {
      ...stage,
      status: metrics.storagePressure > 78 ? 'Dispatch pressure' : 'Batches aligned',
      liveMetric: `${pct(metrics.storagePressure)} storage pressure`,
      risk: metrics.storagePressure,
      progress: clamp(100 - metrics.storagePressure * 0.72, 14, 98),
      downstreamCount: Math.round(12 + Math.max(0, metrics.marginImpact * -3)),
      affected: 'margin capture',
    };
  });
}

function timeRangePoints(range: TimeRange) {
  if (range === 'Live') return 12;
  if (range === '24H') return 16;
  if (range === '7D') return 14;
  return 15;
}

function timeLabel(range: TimeRange, index: number, total: number) {
  if (range === 'Live') return `T-${(total - index - 1) * 5}m`;
  if (range === '24H') return `${Math.round((index / (total - 1)) * 24)}h`;
  if (range === '7D') return `D${index + 1}`;
  return `W${Math.ceil((index + 1) / 4)}`;
}

function createChartDataByStage(stage: StageId, range: TimeRange, metrics: SystemMetrics, controls: WhatIfControls, tick: number) {
  const points = timeRangePoints(range);
  return Array.from({ length: points }, (_, index) => {
    const t = index / Math.max(1, points - 1);
    const oscillation = Math.sin(index * 0.9 + tick * 0.25);
    const lateFactor = t * 0.65 + 0.35;
    const common = {
      label: timeLabel(range, index, points),
      risk: clamp(metrics.downstreamImpactScore * lateFactor + oscillation * 5, 0, 100),
    };

    if (stage === 'pad') {
      return {
        ...common,
        primary: clamp(68 + t * 21 - metrics.scheduleDelay * 1.6 + oscillation * 2, 35, 99),
        secondary: clamp(28 + t * 12 + (100 - controls.dieselAvailability) * 0.6 + oscillation * 1.5, 12, 76),
        tertiary: clamp(6.8 - t * 3.5 + metrics.scheduleDelay * 0.38, 0.5, 10),
        demand: clamp(44 + controls.rigEfficiency * 0.22 + oscillation * 4, 20, 80),
      };
    }
    if (stage === 'drilling') {
      return {
        ...common,
        primary: clamp(3000 + t * 2400 * (controls.rigEfficiency / 100) + oscillation * 140, 1800, 6200),
        secondary: clamp(metrics.drillingScheduleConfidence + oscillation * 3, 35, 100),
        tertiary: clamp(900 + controls.rigEfficiency * 8 + t * 330 + oscillation * 50, 600, 1800),
        demand: clamp(15.5 - controls.rigEfficiency * 0.045 + metrics.scheduleDelay * 0.3 + oscillation * 0.7, 7, 22),
      };
    }
    if (stage === 'completion') {
      return {
        ...common,
        primary: clamp(metrics.fracStagesToday * (0.78 + t * 0.33) + oscillation * 8, 60, 290),
        secondary: clamp(48 + t * 44 - controls.sandDeliveryDelay * 7 - controls.truckCongestion * 0.22 + oscillation * 4, 8, 100),
        tertiary: clamp(18 + metrics.truckQueueTime * 5 + oscillation * 3, 4, 72),
        demand: clamp(140 + controls.fracSpreadProductivity * 1.4 + controls.truckCongestion * 0.8 + oscillation * 9, 90, 300),
      };
    }
    if (stage === 'production') {
      return {
        ...common,
        primary: clamp(metrics.currentProduction / 1000 + t * metrics.productionDelta / 4500 + oscillation * 4, 220, 560),
        secondary: clamp(100 + metrics.forecastProduction / 4500 + t * 20 + oscillation * 3, 80, 190),
        tertiary: clamp(86 - metrics.scheduleDelay * 1.9 + oscillation * 2.5, 55, 99),
        demand: clamp(44 + controls.productionUpliftTarget * 1.8 + oscillation * 4, 20, 90),
      };
    }
    if (stage === 'gathering') {
      return {
        ...common,
        primary: clamp(metrics.batteryUtilization + t * 5 + oscillation * 3.5, 30, 112),
        secondary: clamp(430 + metrics.batteryUtilization * 2 + oscillation * 22, 320, 720),
        tertiary: clamp(100 - metrics.batteryUtilization + 12 + oscillation * 2.2, 0, 70),
        demand: clamp(62 + controls.productionUpliftTarget * 1.1 + oscillation * 5, 35, 110),
      };
    }
    if (stage === 'treatment') {
      return {
        ...common,
        primary: clamp(metrics.evacuationUtilization + t * 4 + oscillation * 2.8, 35, 112),
        secondary: clamp(58 + metrics.evacuationUtilization * 0.42 + oscillation * 3, 35, 98),
        tertiary: clamp(metrics.deliveredCost + t * 0.8 + oscillation * 0.22, 8, 17),
        demand: clamp(82 + controls.productionUpliftTarget * 1.2 - (controls.evacuationCapacity - 100) * 0.6 + oscillation * 5, 45, 130),
      };
    }
    return {
      ...common,
      primary: clamp(metrics.storagePressure + t * 6 + oscillation * 5, 10, 104),
      secondary: clamp(24 + metrics.evacuationUtilization * 0.45 + oscillation * 5, 20, 90),
      tertiary: clamp(metrics.marginImpact + oscillation * 0.26, -5, 4),
      demand: clamp(65 + controls.productionUpliftTarget * 1.6 + metrics.storagePressure * 0.22 + oscillation * 4, 40, 135),
    };
  });
}

function chartSpecsForStage(stage: StageId) {
  const specs: Record<StageId, Array<{ title: string; subtitle: string; unit: string; type: 'area' | 'bar' | 'line' | 'composed'; primary: string; secondary: string }>> = {
    pad: [
      { title: 'Pad Readiness Trend', subtitle: 'earthworks to rig handoff', unit: '%', type: 'area', primary: 'Readiness', secondary: 'Risk' },
      { title: 'Diesel Consumption', subtitle: 'civil fleet demand', unit: 'kbbl', type: 'bar', primary: 'Diesel', secondary: 'Plan' },
      { title: 'Earthworks Progress', subtitle: 'pads cleared and compacted', unit: '%', type: 'line', primary: 'Progress', secondary: 'Constraint' },
      { title: 'Days to Rig Handoff', subtitle: 'readiness lag by cluster', unit: 'days', type: 'composed', primary: 'Days', secondary: 'Demand' },
    ],
    drilling: [
      { title: 'Drilled Depth vs Plan', subtitle: 'measured depth delivery', unit: 'm', type: 'composed', primary: 'Actual MD', secondary: 'Plan' },
      { title: 'Rig Utilization', subtitle: 'active fleet efficiency', unit: '%', type: 'area', primary: 'Utilization', secondary: 'Risk' },
      { title: 'Casing / Mud / Cement', subtitle: 'consumption intensity', unit: 'units', type: 'bar', primary: 'Consumption', secondary: 'Queue' },
      { title: 'Cycle Time by Well', subtitle: 'spud to rig-release', unit: 'days', type: 'line', primary: 'Cycle', secondary: 'Best Path' },
    ],
    completion: [
      { title: 'Frac Stages Completed', subtitle: 'stage velocity', unit: 'stages', type: 'area', primary: 'Stages', secondary: 'Risk' },
      { title: 'Sand Pumped', subtitle: 'sand vs continuity', unit: 'kt', type: 'bar', primary: 'Sand', secondary: 'Demand' },
      { title: 'Water Pumped', subtitle: 'hydration buffer', unit: 'kbbl', type: 'line', primary: 'Water', secondary: 'Constraint' },
      { title: 'Truck Arrivals vs Demand', subtitle: 'gate-release rhythm', unit: 'trucks', type: 'composed', primary: 'Arrivals', secondary: 'Demand' },
    ],
    production: [
      { title: 'Oil / Gas / Water Production', subtitle: 'gross field output', unit: 'kbbl/d', type: 'area', primary: 'Oil', secondary: 'Risk' },
      { title: 'Uptime by Pad', subtitle: 'operational availability', unit: '%', type: 'bar', primary: 'Uptime', secondary: 'Risk' },
      { title: 'Artificial Lift Split', subtitle: 'startup conversion', unit: '%', type: 'line', primary: 'Lifted', secondary: 'Natural' },
      { title: 'Production Forecast', subtitle: 'startup and constraints', unit: 'kbbl/d', type: 'composed', primary: 'Forecast', secondary: 'Plan' },
    ],
    gathering: [
      { title: 'Battery Throughput', subtitle: 'battery loading', unit: '%', type: 'area', primary: 'Utilization', secondary: 'Risk' },
      { title: 'Pressure by Segment', subtitle: 'flowline pressure', unit: 'psi', type: 'line', primary: 'Pressure', secondary: 'Limit' },
      { title: 'Oil/Gas/Water Split', subtitle: 'separation load', unit: '%', type: 'bar', primary: 'Split', secondary: 'Water' },
      { title: 'Spare Capacity', subtitle: 'available surface headroom', unit: '%', type: 'composed', primary: 'Spare', secondary: 'Demand' },
    ],
    treatment: [
      { title: 'Plant Throughput', subtitle: 'treatment inlet and outlet', unit: '%', type: 'area', primary: 'Throughput', secondary: 'Risk' },
      { title: 'Compressor Load', subtitle: 'compression availability', unit: '%', type: 'bar', primary: 'Load', secondary: 'Reserve' },
      { title: 'Evacuation Utilization', subtitle: 'trunk and rights load', unit: '%', type: 'line', primary: 'Utilization', secondary: 'Limit' },
      { title: 'Delivered Cost', subtitle: 'field-to-market cost', unit: '$/bbl', type: 'composed', primary: 'Cost', secondary: 'Demand' },
    ],
    storage: [
      { title: 'Tank Fill', subtitle: 'storage pressure', unit: '%', type: 'area', primary: 'Fill', secondary: 'Risk' },
      { title: 'Batch Movement', subtitle: 'inbound and outbound', unit: 'kbbl', type: 'bar', primary: 'Outbound', secondary: 'Inbound' },
      { title: 'Delivered Volume', subtitle: 'dispatch throughput', unit: 'kbbl/d', type: 'line', primary: 'Volume', secondary: 'Plan' },
      { title: 'Margin / Netback', subtitle: 'realized economics', unit: '$/bbl', type: 'composed', primary: 'Margin', secondary: 'Cost' },
    ],
  };
  return specs[stage];
}
function deriveAIRecommendation(params: {
  activeStage: StageId;
  controls: WhatIfControls;
  metrics: SystemMetrics;
  selectedAsset: SelectedAsset | null;
  selectedTruck: TruckItem | null;
  selectedMaterial: InventoryItem | null;
  scenario: ScenarioId;
}): AiRecommendation {
  const { activeStage, controls, metrics, selectedAsset, selectedTruck, selectedMaterial, scenario } = params;
  const stageName = STAGES.find((stage) => stage.id === activeStage)?.name ?? 'Field System';
  const constraints = [
    { label: 'Sand delivery delay', value: controls.sandDeliveryDelay * 17 + controls.truckCongestion * 0.28, key: 'sand' },
    { label: 'Frac continuity risk', value: metrics.fracContinuityRisk, key: 'frac' },
    { label: 'Battery utilization', value: metrics.batteryUtilization, key: 'battery' },
    { label: 'Evacuation utilization', value: metrics.evacuationUtilization, key: 'evacuation' },
    { label: 'Inventory stress', value: metrics.inventoryRisk, key: 'inventory' },
    { label: 'Schedule delay', value: metrics.scheduleDelay * 12, key: 'schedule' },
  ].sort((a, b) => b.value - a.value);
  const dominant = constraints[0];
  const selectedDriver = selectedTruck
    ? `${selectedTruck.id} ${selectedTruck.cargo} delivery`
    : selectedMaterial
      ? `${selectedMaterial.name} inventory coverage`
      : selectedAsset
        ? `${selectedAsset.label ?? selectedAsset.id} ${selectedAsset.type}`
        : dominant.label;

  let recommendation = 'Synchronize the highest-risk constraint with the next physical handoff and publish a single dispatch priority to field, logistics, and SAP release teams.';
  let immediateImpact = `${stageName} is absorbing the dominant constraint through schedule confidence, queue time, and production conversion.`;
  let secondaryImpact = `Expected startup conversion changes by ${Math.abs(metrics.productionDelta / 1000).toFixed(1)} kbbl/d versus the scaling plan.`;
  let downstreamImpact = `Downstream impact score is ${metrics.downstreamImpactScore.toFixed(0)}/100 across batteries, evacuation, and dispatch.`;
  let priority = dominant.key;

  if (selectedTruck) {
    immediateImpact = `${selectedTruck.id} is ${selectedTruck.status.toLowerCase()} with ${selectedTruck.queueMinutes} min queue and ${selectedTruck.etaMinutes} min ETA to ${selectedTruck.destination}.`;
    secondaryImpact = `${selectedTruck.cargo} is linked to ${selectedTruck.linkedWell}; if late, the affected pad inherits ${Math.max(0.2, selectedTruck.risk / 70).toFixed(1)} hours of execution risk.`;
    downstreamImpact = selectedTruck.material === 'sand'
      ? `Frac continuity risk rises toward ${pct(clamp(metrics.fracContinuityRisk + selectedTruck.risk * 0.08, 0, 100))}; forecast production may lose ${compact(selectedTruck.risk * 42)} bbl/d.`
      : `The downstream effect is concentrated in ${MATERIAL_META[selectedTruck.material].name} coverage and linked pad schedule confidence.`;
    recommendation = selectedTruck.risk > 72
      ? `Pull ${selectedTruck.id} into priority gate release, confirm SAP validation, and route two backup ${selectedTruck.cargo.toLowerCase()} loads to ${selectedTruck.destination}.`
      : `Keep ${selectedTruck.id} on the current lane, but pre-clear unloading documentation before arrival to reduce dwell time.`;
    priority = 'truck';
  } else if (selectedMaterial) {
    immediateImpact = `${selectedMaterial.name} coverage is ${selectedMaterial.coverageDays.toFixed(1)} days with ${selectedMaterial.nextStockoutHours.toFixed(0)} hours to projected stockout.`;
    secondaryImpact = `${selectedMaterial.dependentPads.slice(0, 3).join(', ')} are the nearest dependent pads in the current execution wave.`;
    downstreamImpact = selectedMaterial.id === 'sand'
      ? `At current queue speed, loss of sand coverage can remove ${Math.round(metrics.fracStagesToday * 0.16)} frac stages from today's plan.`
      : `Coverage pressure propagates to schedule confidence, logistics demand, and delivered cost.`;
    recommendation = selectedMaterial.risk > 70
      ? `Re-sequence inbound ${selectedMaterial.name.toLowerCase()} orders, convert one noncritical lane to priority, and release dependent pads by readiness value rather than request time.`
      : `Maintain buffer discipline and keep ${selectedMaterial.name.toLowerCase()} allocation locked to the next two handoffs.`;
    priority = selectedMaterial.id;
  } else if (dominant.key === 'sand' || dominant.key === 'frac') {
    immediateImpact = `Sand delay is ${controls.sandDeliveryDelay.toFixed(1)}h and frac continuity risk is ${pct(metrics.fracContinuityRisk)}.`;
    secondaryImpact = `Completion queue converts ${metrics.wellsCompletion} wells slowly; ${metrics.wellsDelayed} wells are now schedule-sensitive.`;
    downstreamImpact = `Forecast production is ${compact(metrics.forecastProduction)} bbl/d, ${metrics.productionDelta < 0 ? 'below' : 'above'} plan by ${compact(Math.abs(metrics.productionDelta))} bbl/d.`;
    recommendation = `Re-route 14 sand trucks from Staging Yard B, pre-release gate documents, and protect the next ${Math.max(8, Math.round(metrics.fracStagesToday / 18))} pumping stages from idle transitions.`;
  } else if (dominant.key === 'battery') {
    immediateImpact = `Battery utilization is ${pct(metrics.batteryUtilization, 1)} with production uplift target at ${pct(controls.productionUpliftTarget)}.`;
    secondaryImpact = `Connected wells can start, but surface headroom is the limiting conversion step.`;
    downstreamImpact = `Evacuation readiness falls as storage pressure reaches ${pct(metrics.storagePressure)}.`;
    recommendation = `Shift high-water wells to lower-loaded batteries, open temporary routing to B-03/B-08, and defer low-margin startups until spare capacity returns above 14%.`;
  } else if (dominant.key === 'evacuation') {
    immediateImpact = `Evacuation capacity is ${pct(controls.evacuationCapacity)} and utilization is ${pct(metrics.evacuationUtilization, 1)}.`;
    secondaryImpact = `Treatment and trunk rights are now converting production growth into tank pressure.`;
    downstreamImpact = `Delivered cost is ${currency(metrics.deliveredCost)}/bbl and margin impact is ${metrics.marginImpact >= 0 ? '+' : ''}${currency(metrics.marginImpact)}/bbl.`;
    recommendation = `Prioritize spec-ready batches, activate alternate dispatch windows, and rebalance plant inlet nominations before tank pressure exceeds 82%.`;
  } else if (scenario === 'optimizationRecovery') {
    immediateImpact = `Gate automation and route discipline are suppressing queue time to ${metrics.truckQueueTime.toFixed(1)}h.`;
    secondaryImpact = `Completion productivity is converting into production without creating a new storage bottleneck.`;
    downstreamImpact = `Capital efficiency has recovered to ${pct(metrics.capitalEfficiency, 1)} of the scaling model.`;
    recommendation = `Lock the recovered lane rules for 72 hours, then expand automated release validation to water and diesel fleets.`;
  }

  return {
    driver: selectedDriver,
    immediateImpact,
    secondaryImpact,
    downstreamImpact,
    costImpact: `Delivered cost ${currency(metrics.deliveredCost)}/bbl, queue cost component ${(metrics.truckQueueTime * 0.17).toFixed(2)} $/bbl.`,
    marginImpact: `${metrics.marginImpact >= 0 ? '+' : ''}${currency(metrics.marginImpact)}/bbl netback impact versus base plan.`,
    scheduleImpact: `${metrics.scheduleDelay >= 0 ? '+' : ''}${metrics.scheduleDelay.toFixed(1)} days program impact across critical handoffs.`,
    recommendation,
    confidence: clamp(78 + metrics.downstreamImpactScore * 0.18 - (metrics.riskLevel === 'critical' ? 3 : 0), 72, 97),
    urgency: metrics.riskLevel,
    priority,
    propagationPath: [
      { label: 'Driver', value: selectedDriver, risk: clamp(dominant.value, 0, 100) },
      { label: 'Immediate', value: `${pct(metrics.fracContinuityRisk)} frac continuity`, risk: metrics.fracContinuityRisk },
      { label: 'Queue', value: `${metrics.truckQueueTime.toFixed(1)}h avg truck queue`, risk: clamp(metrics.truckQueueTime * 12, 0, 100) },
      { label: 'Startup', value: `${metrics.wellsDelayed} wells delayed`, risk: clamp(metrics.wellsDelayed * 0.82, 0, 100) },
      { label: 'Surface', value: `${pct(Math.max(metrics.batteryUtilization, metrics.evacuationUtilization), 1)} max utilization`, risk: Math.max(metrics.batteryUtilization, metrics.evacuationUtilization) },
      { label: 'Economics', value: `${metrics.marginImpact >= 0 ? '+' : ''}${currency(metrics.marginImpact)}/bbl`, risk: clamp(55 - metrics.marginImpact * 13, 0, 100) },
    ],
  };
}

function createEventStream(metrics: SystemMetrics, controls: WhatIfControls, tick: number): EventItem[] {
  const base: EventItem[] = [
    {
      id: 'EV-01',
      stage: 'pad',
      severity: metrics.scheduleDelay > 3 ? 'elevated' : 'low',
      title: 'Pad 12 ready for rig handoff',
      detail: `Readiness package complete; diesel coverage ${pct(controls.dieselAvailability)}.`,
      minutesAgo: 4 + (tick % 3),
      targetType: 'pad',
      targetId: 'PAD-12',
    },
    {
      id: 'EV-02',
      stage: 'drilling',
      severity: metrics.drillingScheduleConfidence < 72 ? 'elevated' : 'guarded',
      title: 'Rig R-03 reached 4,820 m measured depth',
      detail: `Cycle confidence ${pct(metrics.drillingScheduleConfidence)} after casing release.`,
      minutesAgo: 7 + (tick % 4),
      targetType: 'well',
      targetId: 'PAD-09-H03',
    },
    {
      id: 'EV-03',
      stage: 'completion',
      severity: metrics.fracContinuityRisk > 68 ? 'critical' : 'elevated',
      title: 'Sand convoy delayed at staging yard',
      detail: `Sand delay ${controls.sandDeliveryDelay.toFixed(1)}h; queue time ${metrics.truckQueueTime.toFixed(1)}h.`,
      minutesAgo: 9,
      targetType: 'material',
      targetId: 'sand',
    },
    {
      id: 'EV-04',
      stage: 'completion',
      severity: 'low',
      title: 'Frac stage 37 completed on Well P18-H04',
      detail: `${metrics.fracStagesToday} stages completed today across active spreads.`,
      minutesAgo: 13,
      targetType: 'well',
      targetId: 'PAD-18-H04',
    },
    {
      id: 'EV-05',
      stage: 'completion',
      severity: controls.dieselAvailability < 88 ? 'critical' : 'guarded',
      title: 'Diesel coverage threshold watch',
      detail: `Coverage now linked to pump hours and rig auxiliary power.`,
      minutesAgo: 15,
      targetType: 'material',
      targetId: 'diesel',
    },
    {
      id: 'EV-06',
      stage: 'gathering',
      severity: metrics.batteryUtilization > 91 ? 'critical' : 'guarded',
      title: 'Battery B-07 reached high utilization',
      detail: `Battery system utilization ${pct(metrics.batteryUtilization, 1)}.`,
      minutesAgo: 19,
      targetType: 'battery',
      targetId: 'B-07',
    },
    {
      id: 'EV-07',
      stage: 'treatment',
      severity: metrics.evacuationUtilization > 94 ? 'elevated' : 'low',
      title: 'Water delivery recovered after route reallocation',
      detail: `Evacuation utilization now ${pct(metrics.evacuationUtilization, 1)}.`,
      minutesAgo: 22,
      targetType: 'plant',
      targetId: 'PLT-02',
    },
    {
      id: 'EV-08',
      stage: 'storage',
      severity: metrics.marginImpact < -1.2 ? 'elevated' : 'low',
      title: 'Forecast production updated after completion delay',
      detail: `Margin impact ${metrics.marginImpact >= 0 ? '+' : ''}${currency(metrics.marginImpact)}/bbl.`,
      minutesAgo: 27,
      targetType: 'tank',
      targetId: 'TK-03',
    },
  ];

  return base.sort((a, b) => a.minutesAgo - b.minutesAgo);
}

function riskRingColor(risk: number) {
  const level = riskFromScore(risk);
  if (level === 'critical') return '#ef4444';
  if (level === 'elevated') return '#f59e0b';
  if (level === 'guarded') return '#06b6d4';
  return '#10b981';
}

function getAssetLabel(asset: SelectedAsset | null) {
  if (!asset) return 'No asset selected';
  if (asset.label) return asset.label;
  return `${asset.type.toUpperCase()} ${asset.id}`;
}

function findPad(id: string) {
  return BASE_PADS.find((pad) => pad.id === id);
}

function findWell(id: string) {
  return BASE_WELLS.find((well) => well.id === id) ?? BASE_WELLS.find((well) => well.id.endsWith(id.slice(-3)));
}

function findBattery(id: string) {
  return BASE_BATTERIES.find((battery) => battery.id === id);
}

function findPlant(id: string) {
  return BASE_PLANTS.find((plant) => plant.id === id);
}

function findTank(id: string) {
  return BASE_TANKS.find((tank) => tank.id === id);
}

function impactedPadIds(selectedMaterial: MaterialId | null, inventory: InventoryItem[]) {
  if (!selectedMaterial) return new Set<string>();
  const item = inventory.find((inv) => inv.id === selectedMaterial);
  return new Set(item?.dependentPads ?? []);
}

const rangeOptions: TimeRange[] = ['Live', '24H', '7D', '30D'];
const viewModes: ViewMode[] = ['Digital Twin', 'Constraint Lens', 'Margin Lens'];

function StatusPill({ risk, label }: { risk: number; label?: string }) {
  const level = riskFromScore(risk);
  const tone = toneClasses[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone.bg} ${tone.text} ${tone.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {label ?? level.toUpperCase()}
    </span>
  );
}

function MiniBars({ values, active }: { values: number[]; active?: boolean }) {
  return (
    <div className="flex h-8 items-end gap-0.5">
      {values.map((value, index) => (
        <motion.span
          key={`${value}-${index}`}
          initial={{ height: 4 }}
          animate={{ height: Math.max(4, value) }}
          className={`w-1 rounded-full ${active ? 'bg-cyan-500' : 'bg-slate-300'}`}
        />
      ))}
    </div>
  );
}

function KpiCard({
  title,
  value,
  unit,
  delta,
  risk,
  icon: Icon,
  active,
  onClick,
}: {
  title: string;
  value: string;
  unit?: string;
  delta: string;
  risk: number;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  const level = riskFromScore(risk);
  const tone = toneClasses[level];
  const bars = Array.from({ length: 9 }, (_, index) => clamp(10 + deterministicNoise(index + value.length * 11) * 24 + risk * 0.14, 8, 34));

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative min-h-[116px] overflow-hidden rounded-2xl border bg-white/85 p-3.5 text-left shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_24px_55px_-32px_rgba(14,165,233,0.55)] ${
        active ? 'border-cyan-400 ring-2 ring-cyan-100' : 'border-slate-200/80'
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-blue-400 to-slate-300 opacity-80" />
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-xl border p-2 ${tone.bg} ${tone.border}`}>
            <Icon className={`h-4 w-4 ${tone.text}`} />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</span>
        </div>
        <MiniBars values={bars} active={active} />
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight text-slate-900">{value}</span>
            {unit ? <span className="text-[11px] font-bold text-slate-500">{unit}</span> : null}
          </div>
          <div className={`mt-1 text-xs font-semibold ${delta.startsWith('-') ? 'text-rose-600' : 'text-emerald-600'}`}>{delta}</div>
        </div>
        <StatusPill risk={risk} />
      </div>
    </button>
  );
}

function Header({
  activeScenario,
  onScenarioChange,
  selectedViewMode,
  onViewModeChange,
  metrics,
}: {
  activeScenario: ScenarioId;
  onScenarioChange: (scenario: ScenarioId) => void;
  selectedViewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  metrics: SystemMetrics;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-4 shadow-[0_28px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(37,99,235,0.10),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(240,249,255,0.68))]" />
      <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-inner">
            <img src={LOGO_URL} alt="Pluspetrol" className="h-10 w-10 object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Pluspetrol Well Factory Command</h1>
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-700">
                $12B Scaling Program
              </span>
            </div>
            <p className="mt-1 max-w-3xl text-sm font-medium text-slate-600">
              Real-time orchestration of wells, pads, logistics, inventory, production, and operational impact.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5">
            {(Object.keys(SCENARIOS) as ScenarioId[]).map((scenario) => (
              <button
                key={scenario}
                type="button"
                onClick={() => onScenarioChange(scenario)}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  activeScenario === scenario ? 'bg-slate-950 text-white shadow-lg shadow-slate-400/30' : 'text-slate-600 hover:bg-white hover:text-slate-950'
                }`}
              >
                {SCENARIOS[scenario].label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 rounded-2xl border border-slate-200 bg-white/70 p-1.5">
            {viewModes.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewModeChange(mode)}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  selectedViewMode === mode ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-300/40' : 'text-slate-600 hover:bg-cyan-50 hover:text-cyan-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-4 grid gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Operating mode</div>
          <div className="mt-1 text-sm font-black text-slate-900">{SCENARIOS[activeScenario].summary}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">System pulse</div>
          <div className="mt-1 flex items-center gap-2 text-sm font-black text-slate-900">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            {metrics.activeWells} active well workstreams
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Dominant constraint</div>
          <div className="mt-1 text-sm font-black text-slate-900">
            {metrics.fracContinuityRisk > metrics.batteryUtilization && metrics.fracContinuityRisk > metrics.evacuationUtilization
              ? 'Completion logistics'
              : metrics.batteryUtilization > metrics.evacuationUtilization
                ? 'Battery headroom'
                : 'Evacuation capacity'}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Economic pulse</div>
          <div className={`mt-1 text-sm font-black ${metrics.marginImpact >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {metrics.marginImpact >= 0 ? '+' : ''}{currency(metrics.marginImpact)}/bbl margin impact
          </div>
        </div>
      </div>
    </div>
  );
}
function GlobalKpis({
  metrics,
  activeStage,
  selectedAsset,
  onKpiClick,
}: {
  metrics: SystemMetrics;
  activeStage: StageId;
  selectedAsset: SelectedAsset | null;
  onKpiClick: (id: string) => void;
}) {
  const kpis = [
    { id: 'program', title: 'Total Wells Program', value: String(metrics.totalWellsProgram), unit: 'wells', delta: 'program scope', risk: 8, icon: Layers },
    { id: 'online', title: 'Wells Online', value: String(metrics.wellsOnline), unit: 'wells', delta: `${metrics.productionDelta >= 0 ? '+' : ''}${compact(metrics.productionDelta)} bbl/d`, risk: clamp(62 - metrics.productionDelta / 1000, 8, 96), icon: Activity },
    { id: 'drilling', title: 'Wells Drilling', value: String(metrics.wellsDrilling), unit: 'wells', delta: `${pct(metrics.drillingScheduleConfidence)} confidence`, risk: 100 - metrics.drillingScheduleConfidence, icon: Gauge },
    { id: 'completion', title: 'Wells in Completion', value: String(metrics.wellsCompletion), unit: 'wells', delta: `${metrics.wellsDelayed} delayed`, risk: metrics.fracContinuityRisk, icon: Zap },
    { id: 'pads', title: 'Pads Active', value: String(metrics.padsActive), unit: 'pads', delta: `${metrics.scheduleDelay.toFixed(1)}d impact`, risk: clamp(metrics.scheduleDelay * 10, 4, 90), icon: MapPin },
    { id: 'stages', title: 'Frac Stages Today', value: String(metrics.fracStagesToday), unit: 'stages', delta: `${pct(100 - metrics.fracContinuityRisk)} continuity`, risk: metrics.fracContinuityRisk, icon: Waves },
    { id: 'trucks', title: 'Trucks Active', value: String(metrics.trucksActive), unit: 'units', delta: `${metrics.queuedTrucks} queued`, risk: clamp(metrics.truckQueueTime * 11 + metrics.delayedTrucks * 0.45, 5, 98), icon: Truck },
    { id: 'inventory', title: 'Inventory Risk', value: pct(metrics.inventoryRisk), unit: '', delta: `${metrics.inventoryCoverageDays.toFixed(1)}d coverage`, risk: metrics.inventoryRisk, icon: Database },
    { id: 'current', title: 'Current Production', value: compact(metrics.currentProduction), unit: 'bbl/d', delta: `${metrics.wellsOnline} online`, risk: clamp(58 - metrics.currentProduction / 10000 + metrics.batteryUtilization * 0.2, 6, 94), icon: BarChart3 },
    { id: 'forecast', title: 'Forecast Production', value: compact(metrics.forecastProduction), unit: 'bbl/d', delta: `${metrics.productionDelta >= 0 ? '+' : ''}${compact(metrics.productionDelta)}`, risk: clamp(55 - metrics.productionDelta / 900 + metrics.scheduleDelay * 5, 6, 96), icon: LineChartIcon },
    { id: 'battery', title: 'Battery Utilization', value: pct(metrics.batteryUtilization, 1), unit: '', delta: `${pct(Math.max(0, 100 - metrics.batteryUtilization), 1)} spare`, risk: clamp(metrics.batteryUtilization - 12, 4, 99), icon: BatteryCharging },
    { id: 'evacuation', title: 'Evacuation Utilization', value: pct(metrics.evacuationUtilization, 1), unit: '', delta: `${pct(metrics.storagePressure)} storage`, risk: clamp(metrics.evacuationUtilization - 8, 4, 99), icon: Route },
    { id: 'cost', title: 'Delivered Cost', value: currency(metrics.deliveredCost), unit: '/bbl', delta: `${metrics.truckQueueTime.toFixed(1)}h queue`, risk: clamp((metrics.deliveredCost - 8.5) * 13, 5, 96), icon: DollarSign },
    { id: 'margin', title: 'Margin Impact', value: `${metrics.marginImpact >= 0 ? '+' : ''}${currency(metrics.marginImpact)}`, unit: '/bbl', delta: `${pct(metrics.capitalEfficiency, 1)} cap eff.`, risk: clamp(55 - metrics.marginImpact * 17, 5, 98), icon: CircleDollarSign },
    { id: 'confidence', title: 'Schedule Confidence', value: pct(metrics.drillingScheduleConfidence), unit: '', delta: `${metrics.scheduleDelay >= 0 ? '+' : ''}${metrics.scheduleDelay.toFixed(1)} days`, risk: 100 - metrics.drillingScheduleConfidence + metrics.scheduleDelay * 5, icon: CheckCircle2 },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5">
      {kpis.map((kpi) => (
        <KpiCard
          key={kpi.id}
          {...kpi}
          active={selectedAsset?.type === 'kpi' && selectedAsset.id === kpi.id}
          onClick={() => onKpiClick(kpi.id)}
        />
      ))}
      <div className="hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-4 shadow-[0_18px_45px_-30px_rgba(14,165,233,0.55)] 2xl:block">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-700">Active stage</div>
          <StatusPill risk={metrics.bottleneckSeverity} />
        </div>
        <div className="mt-3 text-lg font-black text-slate-950">{STAGES.find((stage) => stage.id === activeStage)?.name}</div>
        <div className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">
          {metrics.downstreamImpactScore.toFixed(0)}/100 downstream impact score is recalculated from production, logistics, inventory, and surface constraints.
        </div>
      </div>
    </div>
  );
}

function StageSpine({
  stageStates,
  activeStage,
  onStageClick,
}: {
  stageStates: StageState[];
  activeStage: StageId;
  onStageClick: (stage: StageId) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/80 p-3 shadow-[0_20px_55px_-38px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Stage navigation spine</div>
          <div className="text-sm font-semibold text-slate-700">Clicking a stage re-shapes the operating model, charts, risks, and recommendations.</div>
        </div>
        <div className="hidden items-center gap-2 text-xs font-bold text-slate-500 lg:flex">
          <GitBranch className="h-4 w-4 text-cyan-600" /> connected field lifecycle
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-7">
        {stageStates.map((stage, index) => {
          const Icon = stage.icon;
          const active = activeStage === stage.id;
          const level = riskFromScore(stage.risk);
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onStageClick(stage.id)}
              className={`group relative min-h-[150px] overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 ${
                active
                  ? 'border-cyan-400 bg-gradient-to-br from-white via-cyan-50 to-blue-50 shadow-[0_22px_50px_-28px_rgba(14,165,233,0.7)] ring-2 ring-cyan-100'
                  : 'border-slate-200 bg-white/80 hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/30'
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${stageAccent[stage.id]}, rgba(203,213,225,0.2))` }} />
              <div className="flex items-start justify-between gap-2">
                <span className={`rounded-xl border p-2 ${toneClasses[level].bg} ${toneClasses[level].border}`}>
                  <Icon className={`h-4 w-4 ${toneClasses[level].text}`} />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">0{index + 1}</span>
              </div>
              <div className="mt-3 text-sm font-black leading-tight text-slate-950">{stage.name}</div>
              <div className="mt-1 line-clamp-2 text-[11px] font-semibold leading-relaxed text-slate-500">{stage.status}</div>
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="text-xs font-black text-slate-800">{stage.liveMetric}</span>
                <StatusPill risk={stage.risk} label={riskFromScore(stage.risk)} />
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${clamp(stage.progress, 4, 100)}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>{stage.downstreamCount} downstream</span>
                <span className="flex items-center gap-1 text-cyan-700">
                  {stage.affected}
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SvgBackdrop({ activeStage, selectedViewMode }: { activeStage: StageId; selectedViewMode: ViewMode }) {
  const accent = stageAccent[activeStage];
  return (
    <g>
      <defs>
        <linearGradient id="canvasWash" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
        <radialGradient id="stageGlow" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.14" />
          <stop offset="72%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#0f172a" floodOpacity="0.14" />
        </filter>
      </defs>
      <rect x="0" y="0" width="1000" height="520" rx="28" fill="url(#canvasWash)" />
      <rect x="0" y="0" width="1000" height="520" rx="28" fill="url(#stageGlow)" />
      {Array.from({ length: 18 }, (_, index) => (
        <line key={`v-${index}`} x1={index * 60} y1="0" x2={index * 60 + 40} y2="520" stroke="#cbd5e1" strokeOpacity="0.24" strokeWidth="1" />
      ))}
      {Array.from({ length: 10 }, (_, index) => (
        <line key={`h-${index}`} x1="0" y1={index * 58} x2="1000" y2={index * 58} stroke="#cbd5e1" strokeOpacity="0.24" strokeWidth="1" />
      ))}
      {selectedViewMode === 'Constraint Lens' ? (
        <g opacity="0.16">
          <path d="M60 420 C210 260 350 380 530 210 S790 190 930 82" fill="none" stroke="#ef4444" strokeWidth="18" strokeLinecap="round" />
          <path d="M95 88 C270 160 318 115 475 248 S758 310 912 420" fill="none" stroke="#f59e0b" strokeWidth="14" strokeLinecap="round" />
        </g>
      ) : null}
      {selectedViewMode === 'Margin Lens' ? (
        <g opacity="0.18">
          <path d="M90 350 C220 300 340 340 470 250 C620 142 785 190 920 120" fill="none" stroke="#10b981" strokeWidth="16" strokeLinecap="round" />
          <path d="M120 410 C270 385 410 385 560 342 C720 296 825 310 930 262" fill="none" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
}

function CanvasLegend({ activeStage, selectedViewMode, metrics }: { activeStage: StageId; selectedViewMode: ViewMode; metrics: SystemMetrics }) {
  return (
    <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-2xl border border-white/70 bg-white/82 p-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.5)] backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stageAccent[activeStage] }} />
        <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-600">{selectedViewMode}</div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-600">
        <div>
          <div className="text-slate-400">Risk</div>
          <div className={toneClasses[metrics.riskLevel].text}>{metrics.bottleneckSeverity.toFixed(0)}</div>
        </div>
        <div>
          <div className="text-slate-400">Queue</div>
          <div>{metrics.truckQueueTime.toFixed(1)}h</div>
        </div>
        <div>
          <div className="text-slate-400">Margin</div>
          <div className={metrics.marginImpact >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{metrics.marginImpact >= 0 ? '+' : ''}{metrics.marginImpact.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

function PadConstructionView({
  pads,
  inventory,
  selectedAsset,
  selectedMaterial,
  metrics,
  onSelectAsset,
}: {
  pads: Pad[];
  inventory: InventoryItem[];
  selectedAsset: SelectedAsset | null;
  selectedMaterial: MaterialId | null;
  metrics: SystemMetrics;
  onSelectAsset: (asset: SelectedAsset) => void;
}) {
  const impacted = impactedPadIds(selectedMaterial, inventory);
  const visiblePads = pads.filter((pad, index) => pad.currentStage === 'pad' || index % 5 === 0).slice(0, 28);
  return (
    <g>
      <path d="M96 420 C190 368 298 390 384 332 C500 254 615 298 725 206 C805 139 890 120 936 72" fill="none" stroke="#94a3b8" strokeDasharray="8 10" strokeWidth="5" strokeOpacity="0.35" />
      <text x="810" y="70" fill="#64748b" fontSize="12" fontWeight="800">Rig corridor</text>
      {visiblePads.map((pad, index) => {
        const selected = selectedAsset?.type === 'pad' && selectedAsset.id === pad.id;
        const risk = impacted.has(pad.id) ? 82 : clamp(pad.riskBase + metrics.scheduleDelay * 6, 8, 96);
        const color = riskRingColor(risk);
        return (
          <motion.g
            key={pad.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.012 }}
            onClick={() => onSelectAsset({ type: 'pad', id: pad.id, label: pad.name })}
            style={{ cursor: 'pointer' }}
          >
            <rect x={pad.x - 28} y={pad.y - 20} width="56" height="42" rx="12" fill="#ffffff" stroke={selected ? '#0891b2' : color} strokeWidth={selected ? 3 : 1.7} filter="url(#softShadow)" />
            <rect x={pad.x - 22} y={pad.y + 13} width="44" height="4" rx="2" fill="#e2e8f0" />
            <motion.rect x={pad.x - 22} y={pad.y + 13} height="4" rx="2" fill={color} initial={{ width: 0 }} animate={{ width: `${clamp(pad.readiness, 4, 44)}` }} />
            <circle cx={pad.x - 15} cy={pad.y - 6} r="5" fill={color} opacity="0.9" />
            <circle cx={pad.x + 1} cy={pad.y - 6} r="5" fill="#cbd5e1" />
            <circle cx={pad.x + 17} cy={pad.y - 6} r="5" fill="#cbd5e1" />
            <text x={pad.x} y={pad.y + 34} textAnchor="middle" fill="#334155" fontSize="10" fontWeight="800">{pad.name.replace('Pad ', 'P')}</text>
            {impacted.has(pad.id) ? <circle cx={pad.x + 30} cy={pad.y - 20} r="7" fill="#f59e0b" stroke="#fff" strokeWidth="2" /> : null}
          </motion.g>
        );
      })}
      <g transform="translate(70 455)">
        <rect width="260" height="48" rx="18" fill="#ffffff" stroke="#bae6fd" />
        <text x="18" y="20" fill="#0f172a" fontSize="13" fontWeight="900">Pad readiness to rig handoff</text>
        <text x="18" y="36" fill="#64748b" fontSize="11" fontWeight="700">{metrics.scheduleDelay.toFixed(1)} day schedule propagation from civil logistics</text>
      </g>
    </g>
  );
}

function DrillingView({
  rigs,
  wells,
  selectedAsset,
  metrics,
  controls,
  onSelectAsset,
}: {
  rigs: Rig[];
  wells: Well[];
  selectedAsset: SelectedAsset | null;
  metrics: SystemMetrics;
  controls: WhatIfControls;
  onSelectAsset: (asset: SelectedAsset) => void;
}) {
  const activeRigs = rigs.slice(0, 6);
  const profileWells = wells.filter((well) => well.state === 'drilling').slice(0, 7);
  return (
    <g>
      <rect x="0" y="360" width="1000" height="160" fill="#e2e8f0" opacity="0.38" />
      <path d="M0 365 C150 345 260 378 410 360 S670 342 1000 365" fill="none" stroke="#64748b" strokeOpacity="0.36" strokeWidth="4" />
      {activeRigs.map((rig, index) => {
        const pad = findPad(rig.padId);
        const x = 120 + index * 138;
        const selected = selectedAsset?.type === 'rig' && selectedAsset.id === rig.id;
        const risk = clamp(100 - rig.utilization + metrics.scheduleDelay * 7, 4, 96);
        const color = selected ? '#0891b2' : riskRingColor(risk);
        return (
          <motion.g
            key={rig.id}
            onClick={() => onSelectAsset({ type: 'rig', id: rig.id, label: `${rig.id} on ${pad?.name ?? rig.padId}` })}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.04 }}
            style={{ cursor: 'pointer' }}
          >
            <line x1={x} y1="94" x2={x - 28} y2="208" stroke={color} strokeWidth="5" strokeLinecap="round" />
            <line x1={x} y1="94" x2={x + 28} y2="208" stroke={color} strokeWidth="5" strokeLinecap="round" />
            <line x1={x - 42} y1="208" x2={x + 42} y2="208" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
            <line x1={x} y1="94" x2={x} y2="346" stroke="#475569" strokeWidth="3" strokeDasharray="8 6" />
            <motion.circle cx={x} cy={190 + ((rig.measuredDepth / rig.planDepth) * 145)} r="7" fill={color} animate={{ r: [6, 10, 6], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }} />
            <rect x={x - 46} y="222" width="92" height="50" rx="14" fill="#ffffff" stroke={color} strokeWidth={selected ? 3 : 1.5} filter="url(#softShadow)" />
            <text x={x} y="244" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900">{rig.id}</text>
            <text x={x} y="260" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="800">{pct(rig.utilization, 0)} util.</text>
          </motion.g>
        );
      })}
      {profileWells.map((well, index) => {
        const x = 82 + index * 128;
        const y = 375;
        const selected = selectedAsset?.type === 'well' && selectedAsset.id === well.id;
        return (
          <motion.g
            key={well.id}
            onClick={() => onSelectAsset({ type: 'well', id: well.id, label: well.id })}
            style={{ cursor: 'pointer' }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <path d={`M${x} ${y} C${x} 405 ${x + 18} 430 ${x + 58} 442 L${x + 155} 465`} fill="none" stroke={selected ? '#0891b2' : '#2563eb'} strokeWidth={selected ? 5 : 3} strokeLinecap="round" />
            <circle cx={x + 155} cy="465" r="5" fill={selected ? '#0891b2' : '#2563eb'} />
            <text x={x + 48} y="496" fill="#334155" fontSize="10" fontWeight="800">{well.id.split('-').slice(-1)[0]} · {Math.round(well.measuredDepth)}m</text>
          </motion.g>
        );
      })}
      <g transform="translate(710 38)">
        <rect width="220" height="78" rx="22" fill="#ffffff" stroke="#bfdbfe" filter="url(#softShadow)" />
        <text x="18" y="24" fill="#0f172a" fontSize="13" fontWeight="900">Drilling schedule confidence</text>
        <text x="18" y="49" fill="#2563eb" fontSize="24" fontWeight="950">{pct(metrics.drillingScheduleConfidence, 1)}</text>
        <text x="104" y="49" fill="#64748b" fontSize="11" fontWeight="800">Rig efficiency {pct(controls.rigEfficiency)}</text>
      </g>
    </g>
  );
}

function CompletionView({
  fracSpreads,
  trucks,
  selectedAsset,
  selectedTruck,
  selectedMaterial,
  metrics,
  controls,
  onSelectAsset,
  onSelectTruck,
}: {
  fracSpreads: FracSpread[];
  trucks: TruckItem[];
  selectedAsset: SelectedAsset | null;
  selectedTruck: string | null;
  selectedMaterial: MaterialId | null;
  metrics: SystemMetrics;
  controls: WhatIfControls;
  onSelectAsset: (asset: SelectedAsset) => void;
  onSelectTruck: (truck: TruckItem) => void;
}) {
  const visibleTrucks = trucks.filter((truck) => !selectedMaterial || truck.material === selectedMaterial).slice(0, 56);
  const centerX = 500;
  const centerY = 245;
  return (
    <g>
      <path d="M130 120 C260 150 330 210 454 236" fill="none" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" strokeDasharray="12 10" opacity="0.42" />
      <path d="M125 312 C266 284 345 268 455 250" fill="none" stroke="#06b6d4" strokeWidth="7" strokeLinecap="round" strokeDasharray="8 8" opacity="0.42" />
      <path d="M150 422 C300 370 360 305 460 260" fill="none" stroke="#64748b" strokeWidth="6" strokeLinecap="round" strokeDasharray="6 10" opacity="0.38" />
      <rect x="442" y="198" width="178" height="118" rx="28" fill="#ffffff" stroke="#fde68a" strokeWidth="2" filter="url(#softShadow)" />
      <text x="531" y="228" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="950">Active Frac Spread</text>
      <text x="531" y="247" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="800">{fracSpreads[0]?.id} · {pct(fracSpreads[0]?.continuity ?? 0)} continuity</text>
      {Array.from({ length: 9 }, (_, index) => (
        <motion.circle
          key={`pulse-${index}`}
          cx={centerX + index * 12 - 48}
          cy={centerY + Math.sin(index) * 10}
          r="7"
          fill={index < Math.round((100 - metrics.fracContinuityRisk) / 12) ? '#10b981' : '#f59e0b'}
          animate={{ scale: [0.88, 1.25, 0.88], opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.1 }}
        />
      ))}
      <path d="M380 370 C480 392 604 392 718 360" fill="none" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
      {Array.from({ length: 18 }, (_, index) => (
        <circle key={`stage-${index}`} cx={390 + index * 38} cy={370 + Math.sin(index * 0.8) * 12} r="6" fill={index < Math.round(metrics.fracStagesToday / 14) ? '#0ea5e9' : '#cbd5e1'} />
      ))}
      {fracSpreads.map((spread, index) => (
        <motion.g
          key={spread.id}
          onClick={() => onSelectAsset({ type: 'fracSpread', id: spread.id, label: `${spread.id} on ${spread.wellId}` })}
          style={{ cursor: 'pointer' }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          transform={`translate(${680 + (index % 2) * 115} ${98 + Math.floor(index / 2) * 74})`}
        >
          <rect width="96" height="52" rx="16" fill="#fff" stroke={selectedAsset?.id === spread.id ? '#0891b2' : riskRingColor(100 - spread.continuity)} strokeWidth={selectedAsset?.id === spread.id ? 3 : 1.5} />
          <text x="14" y="22" fill="#0f172a" fontSize="12" fontWeight="900">{spread.id}</text>
          <text x="14" y="39" fill="#64748b" fontSize="10" fontWeight="800">{spread.stagesToday} stages</text>
        </motion.g>
      ))}
      {visibleTrucks.map((truck, index) => {
        const routeY = truck.material === 'sand' ? 120 : truck.material === 'water' ? 312 : truck.material === 'diesel' ? 422 : 205;
        const x = 120 + truck.progress * 360 + (index % 5) * 4;
        const y = routeY + Math.sin(truck.progress * Math.PI * 2 + index) * 12;
        const color = selectedTruck === truck.id ? '#0f172a' : MATERIAL_META[truck.material].accent;
        return (
          <motion.g
            key={truck.id}
            onClick={() => onSelectTruck(truck)}
            style={{ cursor: 'pointer' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: truck.status === 'Delayed' ? 0.95 : 0.72 }}
          >
            <rect x={x - 7} y={y - 5} width="14" height="10" rx="3" fill={color} stroke="#fff" strokeWidth="1.5" />
            {truck.risk > 72 ? <circle cx={x + 8} cy={y - 7} r="3.5" fill="#ef4444" /> : null}
          </motion.g>
        );
      })}
      <g transform="translate(54 92)">
        <rect width="142" height="46" rx="16" fill="#fff7ed" stroke="#fed7aa" />
        <text x="16" y="20" fill="#9a3412" fontSize="11" fontWeight="900">Sand delay</text>
        <text x="16" y="36" fill="#0f172a" fontSize="15" fontWeight="950">{controls.sandDeliveryDelay.toFixed(1)}h</text>
      </g>
      <g transform="translate(54 292)">
        <rect width="142" height="46" rx="16" fill="#ecfeff" stroke="#a5f3fc" />
        <text x="16" y="20" fill="#0e7490" fontSize="11" fontWeight="900">Water availability</text>
        <text x="16" y="36" fill="#0f172a" fontSize="15" fontWeight="950">{pct(controls.waterAvailability)}</text>
      </g>
      <g transform="translate(54 402)">
        <rect width="142" height="46" rx="16" fill="#f8fafc" stroke="#cbd5e1" />
        <text x="16" y="20" fill="#475569" fontSize="11" fontWeight="900">Diesel coverage</text>
        <text x="16" y="36" fill="#0f172a" fontSize="15" fontWeight="950">{pct(controls.dieselAvailability)}</text>
      </g>
    </g>
  );
}
function ProductionView({
  wells,
  batteries,
  selectedAsset,
  metrics,
  onSelectAsset,
}: {
  wells: Well[];
  batteries: Battery[];
  selectedAsset: SelectedAsset | null;
  metrics: SystemMetrics;
  onSelectAsset: (asset: SelectedAsset) => void;
}) {
  const onlineWells = wells.filter((well) => well.state === 'online' || well.state === 'constrained' || well.state === 'flowback').slice(0, 72);
  const batteryPositions = new Map(batteries.map((battery, index) => [battery.id, { x: 155 + (index % 5) * 180, y: 390 + Math.floor(index / 5) * 54 }]));
  return (
    <g>
      {batteries.slice(0, 10).map((battery, index) => {
        const pos = batteryPositions.get(battery.id)!;
        const risk = clamp(metrics.batteryUtilization - 20 + deterministicNoise(index) * 18, 4, 98);
        return (
          <motion.g
            key={battery.id}
            onClick={() => onSelectAsset({ type: 'battery', id: battery.id, label: battery.name })}
            style={{ cursor: 'pointer' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <rect x={pos.x - 44} y={pos.y - 24} width="88" height="48" rx="16" fill="#ffffff" stroke={selectedAsset?.id === battery.id ? '#0891b2' : riskRingColor(risk)} strokeWidth={selectedAsset?.id === battery.id ? 3 : 1.5} filter="url(#softShadow)" />
            <text x={pos.x} y={pos.y - 3} textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">{battery.id}</text>
            <text x={pos.x} y={pos.y + 14} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="800">{pct(clamp(metrics.batteryUtilization + deterministicNoise(index) * 8 - 4, 35, 106), 0)}</text>
          </motion.g>
        );
      })}
      {onlineWells.map((well, index) => {
        const col = index % 12;
        const row = Math.floor(index / 12);
        const x = 88 + col * 76 + deterministicNoise(index + 700) * 16;
        const y = 74 + row * 44 + deterministicNoise(index + 701) * 10;
        const batteryPos = batteryPositions.get(well.batteryId) ?? { x: 500, y: 410 };
        const unstable = well.state === 'constrained' || well.uptime < 82;
        const selected = selectedAsset?.type === 'well' && selectedAsset.id === well.id;
        return (
          <motion.g
            key={well.id}
            onClick={() => onSelectAsset({ type: 'well', id: well.id, label: well.id })}
            style={{ cursor: 'pointer' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: selected ? 1.18 : 1 }}
            transition={{ delay: index * 0.006 }}
          >
            <line x1={x} y1={y} x2={batteryPos.x} y2={batteryPos.y - 24} stroke={unstable ? '#f59e0b' : '#0ea5e9'} strokeWidth="1.2" strokeOpacity="0.18" />
            <motion.circle
              cx={x}
              cy={y}
              r={selected ? 10 : 7}
              fill={unstable ? '#f59e0b' : '#10b981'}
              stroke="#fff"
              strokeWidth="2"
              animate={{ opacity: [0.72, 1, 0.72] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.02 }}
            />
            {unstable ? <circle cx={x + 9} cy={y - 7} r="3" fill="#ef4444" /> : null}
          </motion.g>
        );
      })}
      <g transform="translate(62 28)">
        <rect width="250" height="68" rx="22" fill="#ffffff" stroke="#bbf7d0" filter="url(#softShadow)" />
        <text x="18" y="25" fill="#0f172a" fontSize="13" fontWeight="900">Live production conversion</text>
        <text x="18" y="51" fill="#047857" fontSize="26" fontWeight="950">{compact(metrics.currentProduction)} bbl/d</text>
      </g>
      <g transform="translate(740 40)">
        <rect width="205" height="84" rx="24" fill="#ffffff" stroke="#bae6fd" filter="url(#softShadow)" />
        <text x="18" y="25" fill="#0f172a" fontSize="13" fontWeight="900">Forecast delta</text>
        <text x="18" y="52" fill={metrics.productionDelta >= 0 ? '#047857' : '#be123c'} fontSize="24" fontWeight="950">
          {metrics.productionDelta >= 0 ? '+' : ''}{compact(metrics.productionDelta)}
        </text>
        <text x="18" y="70" fill="#64748b" fontSize="11" fontWeight="800">bbl/d vs scaling plan</text>
      </g>
    </g>
  );
}

function GatheringView({
  pads,
  batteries,
  selectedAsset,
  metrics,
  onSelectAsset,
}: {
  pads: Pad[];
  batteries: Battery[];
  selectedAsset: SelectedAsset | null;
  metrics: SystemMetrics;
  onSelectAsset: (asset: SelectedAsset) => void;
}) {
  const visiblePads = pads.filter((pad, index) => pad.currentStage === 'production' || pad.currentStage === 'gathering' || index % 6 === 0).slice(0, 40);
  return (
    <g>
      {BASE_BATTERIES.map((battery, index) => {
        const risk = clamp(metrics.batteryUtilization - 16 + deterministicNoise(index + 8) * 22, 5, 99);
        const selected = selectedAsset?.id === battery.id;
        return (
          <motion.g
            key={battery.id}
            onClick={() => onSelectAsset({ type: 'battery', id: battery.id, label: battery.name })}
            style={{ cursor: 'pointer' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: selected ? 1.08 : 1 }}
          >
            <rect x={battery.x - 52} y={battery.y - 28} width="104" height="56" rx="18" fill="#ffffff" stroke={selected ? '#0891b2' : riskRingColor(risk)} strokeWidth={selected ? 3 : 1.7} filter="url(#softShadow)" />
            <text x={battery.x} y={battery.y - 5} textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="950">{battery.id}</text>
            <text x={battery.x} y={battery.y + 13} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="800">{Math.round(battery.throughputBase / 1000)} kbbl/d</text>
            <path d={`M${battery.x - 38} ${battery.y + 24} L${battery.x + 38} ${battery.y + 24}`} stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
            <path d={`M${battery.x - 38} ${battery.y + 24} L${battery.x - 38 + 76 * clamp(metrics.batteryUtilization / 100, 0, 1)} ${battery.y + 24}`} stroke={riskRingColor(risk)} strokeWidth="5" strokeLinecap="round" />
          </motion.g>
        );
      })}
      {visiblePads.map((pad, index) => {
        const battery = findBattery(pad.linkedBattery) ?? BASE_BATTERIES[0];
        const selected = selectedAsset?.type === 'pad' && selectedAsset.id === pad.id;
        const risk = clamp(metrics.batteryUtilization - 35 + deterministicNoise(index + 19) * 40, 8, 92);
        return (
          <motion.g
            key={pad.id}
            onClick={() => onSelectAsset({ type: 'pad', id: pad.id, label: pad.name })}
            style={{ cursor: 'pointer' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <path d={`M${pad.x} ${pad.y} C${(pad.x + battery.x) / 2} ${pad.y + 50} ${(pad.x + battery.x) / 2} ${battery.y - 50} ${battery.x} ${battery.y - 28}`} fill="none" stroke={riskRingColor(risk)} strokeOpacity="0.28" strokeWidth={selected ? 4 : 2} />
            <circle cx={pad.x} cy={pad.y} r={selected ? 11 : 7} fill="#06b6d4" stroke="#fff" strokeWidth="2" />
          </motion.g>
        );
      })}
      <g transform="translate(55 40)">
        <rect width="235" height="78" rx="24" fill="#ffffff" stroke="#a5f3fc" filter="url(#softShadow)" />
        <text x="18" y="24" fill="#0f172a" fontSize="13" fontWeight="900">Gathering surface load</text>
        <text x="18" y="52" fill="#0891b2" fontSize="25" fontWeight="950">{pct(metrics.batteryUtilization, 1)}</text>
        <text x="110" y="52" fill="#64748b" fontSize="11" fontWeight="800">battery utilization</text>
      </g>
      <g transform="translate(740 42)">
        <rect width="205" height="72" rx="22" fill="#ffffff" stroke="#fed7aa" filter="url(#softShadow)" />
        <text x="18" y="24" fill="#0f172a" fontSize="13" fontWeight="900">Pressure watch</text>
        <text x="18" y="50" fill="#c2410c" fontSize="23" fontWeight="950">{Math.round(420 + metrics.batteryUtilization * 2.1)} psi</text>
      </g>
    </g>
  );
}

function TreatmentView({
  plants,
  metrics,
  selectedAsset,
  onSelectAsset,
}: {
  plants: Plant[];
  metrics: SystemMetrics;
  selectedAsset: SelectedAsset | null;
  onSelectAsset: (asset: SelectedAsset) => void;
}) {
  const routes = [
    { from: [80, 110], to: [240, 210], label: 'North trunk' },
    { from: [120, 390], to: [240, 210], label: 'Oil line A' },
    { from: [390, 360], to: [520, 185], label: 'Gas lift loop' },
    { from: [520, 185], to: [720, 290], label: 'Compression outlet' },
    { from: [720, 290], to: [920, 140], label: 'Export trunk' },
    { from: [720, 290], to: [910, 390], label: 'Alternate dispatch' },
  ];
  return (
    <g>
      {routes.map((route, index) => {
        const risk = clamp(metrics.evacuationUtilization - 20 + index * 5, 6, 99);
        return (
          <motion.g key={route.label} onClick={() => onSelectAsset({ type: 'line', id: route.label, label: route.label })} style={{ cursor: 'pointer' }}>
            <path d={`M${route.from[0]} ${route.from[1]} C${(route.from[0] + route.to[0]) / 2} ${route.from[1] - 50 + index * 12} ${(route.from[0] + route.to[0]) / 2} ${route.to[1] + 50 - index * 8} ${route.to[0]} ${route.to[1]}`} fill="none" stroke={riskRingColor(risk)} strokeWidth={selectedAsset?.id === route.label ? 8 : 5} strokeLinecap="round" strokeOpacity="0.54" />
            <motion.circle
              cx={(route.from[0] + route.to[0]) / 2}
              cy={(route.from[1] + route.to[1]) / 2}
              r="6"
              fill={riskRingColor(risk)}
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.16 }}
            />
          </motion.g>
        );
      })}
      {plants.map((plant, index) => {
        const risk = clamp(metrics.evacuationUtilization - 18 + index * 6, 5, 99);
        const selected = selectedAsset?.type === 'plant' && selectedAsset.id === plant.id;
        return (
          <motion.g
            key={plant.id}
            onClick={() => onSelectAsset({ type: 'plant', id: plant.id, label: plant.name })}
            style={{ cursor: 'pointer' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: selected ? 1.07 : 1 }}
          >
            <rect x={plant.x - 70} y={plant.y - 42} width="140" height="84" rx="24" fill="#ffffff" stroke={selected ? '#0891b2' : riskRingColor(risk)} strokeWidth={selected ? 3 : 1.8} filter="url(#softShadow)" />
            <rect x={plant.x - 48} y={plant.y - 68} width="18" height="34" rx="6" fill="#e2e8f0" stroke="#94a3b8" />
            <rect x={plant.x + 26} y={plant.y - 62} width="18" height="28" rx="6" fill="#e2e8f0" stroke="#94a3b8" />
            <text x={plant.x} y={plant.y - 8} textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="950">{plant.id}</text>
            <text x={plant.x} y={plant.y + 12} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="800">{plant.type}</text>
            <text x={plant.x} y={plant.y + 30} textAnchor="middle" fill={riskRingColor(risk)} fontSize="12" fontWeight="900">{pct(clamp(metrics.evacuationUtilization + index * 2, 35, 108), 0)}</text>
          </motion.g>
        );
      })}
      <g transform="translate(760 42)">
        <rect width="190" height="80" rx="24" fill="#ffffff" stroke="#ddd6fe" filter="url(#softShadow)" />
        <text x="18" y="25" fill="#0f172a" fontSize="13" fontWeight="900">Evacuation readiness</text>
        <text x="18" y="52" fill="#7c3aed" fontSize="24" fontWeight="950">{pct(metrics.evacuationUtilization, 1)}</text>
        <text x="18" y="68" fill="#64748b" fontSize="10" fontWeight="800">utilization across treatment/trunk</text>
      </g>
    </g>
  );
}

function StorageView({
  tanks,
  metrics,
  selectedAsset,
  onSelectAsset,
}: {
  tanks: Tank[];
  metrics: SystemMetrics;
  selectedAsset: SelectedAsset | null;
  onSelectAsset: (asset: SelectedAsset) => void;
}) {
  const destinations = [
    { id: 'DST-01', label: 'Terminal Norte', x: 850, y: 105 },
    { id: 'DST-02', label: 'Export Blend', x: 875, y: 236 },
    { id: 'DST-03', label: 'Pipeline Batch', x: 852, y: 382 },
  ];
  return (
    <g>
      {tanks.map((tank, index) => {
        const fill = clamp((tank.fillKbbl / tank.capacityKbbl) * 100 + metrics.storagePressure * 0.18 - 8, 8, 98);
        const risk = clamp(fill + metrics.evacuationUtilization * 0.17 - 14, 5, 99);
        const selected = selectedAsset?.type === 'tank' && selectedAsset.id === tank.id;
        return (
          <motion.g
            key={tank.id}
            onClick={() => onSelectAsset({ type: 'tank', id: tank.id, label: tank.name })}
            style={{ cursor: 'pointer' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <ellipse cx={tank.x} cy={tank.y - 36} rx="46" ry="16" fill="#ffffff" stroke={selected ? '#0891b2' : riskRingColor(risk)} strokeWidth={selected ? 3 : 1.7} />
            <rect x={tank.x - 46} y={tank.y - 36} width="92" height="78" fill="#ffffff" stroke={selected ? '#0891b2' : riskRingColor(risk)} strokeWidth={selected ? 3 : 1.7} />
            <ellipse cx={tank.x} cy={tank.y + 42} rx="46" ry="16" fill="#ffffff" stroke={selected ? '#0891b2' : riskRingColor(risk)} strokeWidth={selected ? 3 : 1.7} />
            <clipPath id={`tankClip-${tank.id}`}>
              <rect x={tank.x - 44} y={tank.y - 34} width="88" height="76" rx="8" />
            </clipPath>
            <rect x={tank.x - 44} y={tank.y + 42 - fill * 0.76} width="88" height={fill * 0.76} fill={riskRingColor(risk)} opacity="0.28" clipPath={`url(#tankClip-${tank.id})`} />
            <text x={tank.x} y={tank.y} textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="950">{tank.id}</text>
            <text x={tank.x} y={tank.y + 18} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="800">{pct(fill, 0)} fill</text>
          </motion.g>
        );
      })}
      {destinations.map((destination, index) => (
        <motion.g
          key={destination.id}
          onClick={() => onSelectAsset({ type: 'batch', id: destination.id, label: destination.label })}
          style={{ cursor: 'pointer' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <rect x={destination.x - 70} y={destination.y - 26} width="140" height="52" rx="18" fill="#ffffff" stroke="#fecdd3" filter="url(#softShadow)" />
          <text x={destination.x} y={destination.y - 2} textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="950">{destination.label}</text>
          <text x={destination.x} y={destination.y + 15} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="800">title transfer ready</text>
          <path d={`M${BASE_TANKS[index + 1]?.x ?? 500} ${BASE_TANKS[index + 1]?.y ?? 260} C650 ${destination.y} 720 ${destination.y} ${destination.x - 70} ${destination.y}`} fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.36" />
        </motion.g>
      ))}
      <g transform="translate(56 46)">
        <rect width="235" height="76" rx="24" fill="#ffffff" stroke="#fecdd3" filter="url(#softShadow)" />
        <text x="18" y="24" fill="#0f172a" fontSize="13" fontWeight="900">Storage / margin pressure</text>
        <text x="18" y="52" fill={metrics.marginImpact >= 0 ? '#047857' : '#be123c'} fontSize="24" fontWeight="950">
          {metrics.marginImpact >= 0 ? '+' : ''}{currency(metrics.marginImpact)}/bbl
        </text>
      </g>
    </g>
  );
}

function OperatingCanvas({
  activeStage,
  selectedViewMode,
  metrics,
  controls,
  pads,
  wells,
  rigs,
  fracSpreads,
  trucks,
  batteries,
  plants,
  tanks,
  inventory,
  selectedAsset,
  selectedTruck,
  selectedMaterial,
  onSelectAsset,
  onSelectTruck,
}: {
  activeStage: StageId;
  selectedViewMode: ViewMode;
  metrics: SystemMetrics;
  controls: WhatIfControls;
  pads: Pad[];
  wells: Well[];
  rigs: Rig[];
  fracSpreads: FracSpread[];
  trucks: TruckItem[];
  batteries: Battery[];
  plants: Plant[];
  tanks: Tank[];
  inventory: InventoryItem[];
  selectedAsset: SelectedAsset | null;
  selectedTruck: string | null;
  selectedMaterial: MaterialId | null;
  onSelectAsset: (asset: SelectedAsset) => void;
  onSelectTruck: (truck: TruckItem) => void;
}) {
  const stage = STAGES.find((item) => item.id === activeStage)!;
  const Icon = stage.icon;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.55)] backdrop-blur">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white/70 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl border border-cyan-200 bg-cyan-50 p-3 text-cyan-700">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Central interactive operating canvas</div>
            <h2 className="text-lg font-black text-slate-950">{stage.name} digital twin</h2>
            <p className="text-xs font-semibold text-slate-600">{stage.purpose}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">selected: {getAssetLabel(selectedAsset)}</span>
          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-cyan-700">{metrics.trucksActive} active trucks</span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700">{metrics.wellsDelayed} delayed wells</span>
        </div>
      </div>

      <div className="relative h-[560px] w-full overflow-hidden bg-slate-50/60">
        <CanvasLegend activeStage={activeStage} selectedViewMode={selectedViewMode} metrics={metrics} />
        <svg viewBox="0 0 1000 520" className="h-full w-full">
          <SvgBackdrop activeStage={activeStage} selectedViewMode={selectedViewMode} />
          <AnimatePresence mode="wait">
            <motion.g key={activeStage} initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.015 }} transition={{ duration: 0.35 }}>
              {activeStage === 'pad' ? (
                <PadConstructionView pads={pads} inventory={inventory} selectedAsset={selectedAsset} selectedMaterial={selectedMaterial} metrics={metrics} onSelectAsset={onSelectAsset} />
              ) : null}
              {activeStage === 'drilling' ? (
                <DrillingView rigs={rigs} wells={wells} selectedAsset={selectedAsset} metrics={metrics} controls={controls} onSelectAsset={onSelectAsset} />
              ) : null}
              {activeStage === 'completion' ? (
                <CompletionView
                  fracSpreads={fracSpreads}
                  trucks={trucks}
                  selectedAsset={selectedAsset}
                  selectedTruck={selectedTruck}
                  selectedMaterial={selectedMaterial}
                  metrics={metrics}
                  controls={controls}
                  onSelectAsset={onSelectAsset}
                  onSelectTruck={onSelectTruck}
                />
              ) : null}
              {activeStage === 'production' ? (
                <ProductionView wells={wells} batteries={batteries} selectedAsset={selectedAsset} metrics={metrics} onSelectAsset={onSelectAsset} />
              ) : null}
              {activeStage === 'gathering' ? (
                <GatheringView pads={pads} batteries={batteries} selectedAsset={selectedAsset} metrics={metrics} onSelectAsset={onSelectAsset} />
              ) : null}
              {activeStage === 'treatment' ? (
                <TreatmentView plants={plants} metrics={metrics} selectedAsset={selectedAsset} onSelectAsset={onSelectAsset} />
              ) : null}
              {activeStage === 'storage' ? <StorageView tanks={tanks} metrics={metrics} selectedAsset={selectedAsset} onSelectAsset={onSelectAsset} /> : null}
            </motion.g>
          </AnimatePresence>
        </svg>
      </div>
    </div>
  );
}
function LogisticsSimulationLayer({
  trucks,
  selectedTruck,
  selectedMaterial,
  metrics,
  onSelectTruck,
  onSelectMaterial,
}: {
  trucks: TruckItem[];
  selectedTruck: string | null;
  selectedMaterial: MaterialId | null;
  metrics: SystemMetrics;
  onSelectTruck: (truck: TruckItem) => void;
  onSelectMaterial: (material: MaterialId) => void;
}) {
  const filteredTrucks = trucks.filter((truck) => !selectedMaterial || truck.material === selectedMaterial);
  const routeRows = [18, 31, 44, 57, 70, 83];
  const categoryCounts = (Object.keys(MATERIAL_META) as MaterialId[]).map((material) => ({
    material,
    count: trucks.filter((truck) => truck.material === material).length,
    delayed: trucks.filter((truck) => truck.material === material && truck.status === 'Delayed').length,
  }));

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/85 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.55)] backdrop-blur">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-r from-white to-cyan-50/60 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Truck className="h-4 w-4 text-cyan-600" /> Logistics simulation layer
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-600">
            Aggregated live movement of {metrics.trucksActive} active trucks, {metrics.queuedTrucks} queued, and {metrics.delayedTrucks} delayed across field lanes.
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <div className="text-slate-400">active</div>
            <div className="text-slate-950">{metrics.trucksActive}</div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700">
            <div className="text-amber-500">queued</div>
            <div>{metrics.queuedTrucks}</div>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
            <div className="text-rose-500">delayed</div>
            <div>{metrics.delayedTrucks}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="relative h-[280px] overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#f8fafc,#ffffff_45%,#ecfeff)]">
          <div className="absolute left-4 top-4 rounded-2xl border border-slate-200 bg-white/85 px-3 py-2 text-xs font-black text-slate-700 shadow-sm">
            Dispatch lanes · avg queue {metrics.truckQueueTime.toFixed(1)}h
          </div>
          {routeRows.map((row, index) => (
            <div
              key={row}
              className="absolute left-8 right-8 h-px bg-gradient-to-r from-slate-200 via-cyan-300 to-slate-200"
              style={{ top: `${row}%` }}
            >
              <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full border border-cyan-200 bg-white" />
              <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border border-blue-200 bg-white" />
              <span className="absolute left-2 top-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Lane {index + 1}</span>
            </div>
          ))}
          {filteredTrucks.slice(0, 120).map((truck, index) => {
            const row = routeRows[truck.route % routeRows.length];
            const x = clamp(8 + truck.progress * 84 + deterministicNoise(index + 66) * 3, 6, 92);
            const y = clamp(row + (deterministicNoise(index + 88) - 0.5) * 7, 8, 92);
            const selected = selectedTruck === truck.id;
            return (
              <motion.button
                key={truck.id}
                type="button"
                onClick={() => onSelectTruck(truck)}
                className={`absolute rounded-md border shadow-sm ${selected ? 'z-20 h-4 w-6 border-slate-950 bg-slate-950' : 'h-3 w-5 border-white'}`}
                style={{ left: `${x}%`, top: `${y}%`, backgroundColor: selected ? '#0f172a' : MATERIAL_META[truck.material].accent }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: truck.status === 'Delayed' ? 1 : 0.78, scale: selected ? 1.25 : 1 }}
                transition={{ delay: index * 0.002 }}
                title={`${truck.id} · ${truck.cargo}`}
              >
                {truck.risk > 74 ? <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-rose-500 ring-1 ring-white" /> : null}
              </motion.button>
            );
          })}
          <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2 text-xs font-bold text-slate-600">
            <div className="rounded-2xl border border-white/80 bg-white/80 px-3 py-2 backdrop-blur">
              <div className="text-slate-400">Loading points</div>
              <div className="text-slate-900">6 yards · 19 bays</div>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 px-3 py-2 backdrop-blur">
              <div className="text-slate-400">Gate status</div>
              <div className={metrics.truckQueueTime > 3.4 ? 'text-amber-700' : 'text-emerald-700'}>{metrics.truckQueueTime > 3.4 ? 'queue pressure' : 'clearing'}</div>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 px-3 py-2 backdrop-blur">
              <div className="text-slate-400">SAP release</div>
              <div className={metrics.delayedTrucks > 38 ? 'text-rose-700' : 'text-cyan-700'}>{metrics.delayedTrucks > 38 ? 'exceptions' : 'in control'}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {categoryCounts.slice(0, 9).map(({ material, count, delayed }) => {
              const selected = selectedMaterial === material;
              const Icon = MATERIAL_META[material].icon;
              return (
                <button
                  key={material}
                  type="button"
                  onClick={() => onSelectMaterial(material)}
                  className={`rounded-2xl border p-2.5 text-left transition-all ${
                    selected ? 'border-cyan-400 bg-cyan-50 ring-2 ring-cyan-100' : 'border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Icon className="h-4 w-4" style={{ color: MATERIAL_META[material].accent }} />
                    {delayed > 0 ? <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-black text-rose-700">{delayed}</span> : null}
                  </div>
                  <div className="mt-1 text-[11px] font-black text-slate-800">{MATERIAL_META[material].name}</div>
                  <div className="text-[10px] font-bold text-slate-500">{count} trucks</div>
                </button>
              );
            })}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Priority truck queue</div>
              <span className="text-[11px] font-bold text-cyan-700">click any row</span>
            </div>
            <div className="max-h-[135px] space-y-2 overflow-y-auto pr-1">
              {filteredTrucks
                .slice()
                .sort((a, b) => b.risk - a.risk)
                .slice(0, 6)
                .map((truck) => (
                  <button
                    key={truck.id}
                    type="button"
                    onClick={() => onSelectTruck(truck)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-left transition-all ${
                      selectedTruck === truck.id ? 'border-cyan-400 bg-white ring-2 ring-cyan-100' : 'border-slate-200 bg-white hover:border-cyan-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-xs font-black text-slate-900">{truck.id} · {truck.cargo}</div>
                      <div className="truncate text-[11px] font-semibold text-slate-500">{truck.origin} → {truck.destination}</div>
                    </div>
                    <div className="text-right">
                      <div className={truck.status === 'Delayed' ? 'text-xs font-black text-rose-700' : 'text-xs font-black text-slate-800'}>{truck.etaMinutes}m</div>
                      <div className="text-[10px] font-bold text-slate-400">{truck.orderStatus}</div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryModule({
  inventory,
  selectedMaterial,
  metrics,
  onSelectMaterial,
}: {
  inventory: InventoryItem[];
  selectedMaterial: MaterialId | null;
  metrics: SystemMetrics;
  onSelectMaterial: (material: MaterialId) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/85 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.55)] backdrop-blur">
      <div className="flex flex-col gap-2 border-b border-slate-200 bg-gradient-to-r from-white to-blue-50/60 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Database className="h-4 w-4 text-blue-600" /> Inventory and stock cockpit
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-600">Coverage, inbound/outbound allocation, dependent pads, and stockout risk.</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700">
          Field inventory risk <span className={toneClasses[riskFromScore(metrics.inventoryRisk)].text}>{pct(metrics.inventoryRisk)}</span>
        </div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {inventory.map((item) => {
          const selected = selectedMaterial === item.id;
          const Icon = MATERIAL_META[item.id].icon;
          const level = riskFromScore(item.risk);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectMaterial(item.id)}
              className={`group rounded-3xl border p-3 text-left transition-all ${
                selected ? 'border-cyan-400 bg-cyan-50/80 ring-2 ring-cyan-100' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`rounded-2xl border p-2 ${toneClasses[level].bg} ${toneClasses[level].border}`}>
                    <Icon className={`h-4 w-4 ${toneClasses[level].text}`} />
                  </span>
                  <div>
                    <div className="text-sm font-black text-slate-950">{item.name}</div>
                    <div className="text-[11px] font-bold text-slate-500">{item.dependentPads.length} dependent pads</div>
                  </div>
                </div>
                <StatusPill risk={item.risk} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-bold">
                <div>
                  <div className="text-slate-400">stock</div>
                  <div className="text-slate-900">{compact(item.stock)} {item.unit}</div>
                </div>
                <div>
                  <div className="text-slate-400">inbound</div>
                  <div className="text-emerald-700">+{compact(item.inbound)}</div>
                </div>
                <div>
                  <div className="text-slate-400">outbound</div>
                  <div className="text-amber-700">-{compact(item.outbound)}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-black text-slate-600">
                <span>{item.coverageDays.toFixed(1)} coverage days</span>
                <span>{item.nextStockoutHours.toFixed(0)}h stockout</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${toneClasses[level].fill}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${clamp(item.coverageDays * 10, 6, 100)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  suffix,
  help,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  help: string;
  onChange: (value: number) => void;
}) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black text-slate-900">{label}</div>
          <div className="mt-0.5 text-[11px] font-semibold leading-relaxed text-slate-500">{help}</div>
        </div>
        <div className="shrink-0 rounded-xl border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-black text-cyan-700">
          {value.toFixed(step < 1 ? 1 : 0)}{suffix}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-cyan-600"
          style={{ background: `linear-gradient(90deg, #06b6d4 ${percent}%, #e2e8f0 ${percent}%)` }}
        />
      </div>
    </div>
  );
}

function WhatIfConsole({
  controls,
  activeScenario,
  metrics,
  onControlChange,
  onReset,
}: {
  controls: WhatIfControls;
  activeScenario: ScenarioId;
  metrics: SystemMetrics;
  onControlChange: (key: keyof WhatIfControls, value: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/90 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.55)] backdrop-blur">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-white to-cyan-50/70 p-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <SlidersHorizontal className="h-4 w-4 text-cyan-600" /> What-if impact console
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-600">Every slider recalculates logistics, inventory, forecast, cost, margin, AI, and stage risk.</div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50"
        >
          Reset {SCENARIOS[activeScenario].label}
        </button>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-1">
        <SliderControl label="Sand delivery delay" value={controls.sandDeliveryDelay} min={0} max={6} step={0.1} suffix="h" help="Raises queue risk, lowers frac continuity, slips startup." onChange={(value) => onControlChange('sandDeliveryDelay', value)} />
        <SliderControl label="Water availability" value={controls.waterAvailability} min={60} max={115} step={1} suffix="%" help="Controls hydration buffer and frac stage velocity." onChange={(value) => onControlChange('waterAvailability', value)} />
        <SliderControl label="Diesel availability" value={controls.dieselAvailability} min={60} max={115} step={1} suffix="%" help="Affects pumping hours, rigs, civil fleet, and logistics." onChange={(value) => onControlChange('dieselAvailability', value)} />
        <SliderControl label="Rig efficiency" value={controls.rigEfficiency} min={70} max={115} step={1} suffix="%" help="Changes drilled wells, queue growth, and capital efficiency." onChange={(value) => onControlChange('rigEfficiency', value)} />
        <SliderControl label="Frac spread productivity" value={controls.fracSpreadProductivity} min={65} max={115} step={1} suffix="%" help="Changes stage count, sand/water burn, and startup conversion." onChange={(value) => onControlChange('fracSpreadProductivity', value)} />
        <SliderControl label="Truck congestion" value={controls.truckCongestion} min={0} max={100} step={1} suffix="%" help="Increases queue time, dwell, delivered cost, and schedule risk." onChange={(value) => onControlChange('truckCongestion', value)} />
        <SliderControl label="Battery capacity constraint" value={controls.batteryCapacityConstraint} min={0} max={40} step={1} suffix="%" help="Converts production uplift into surface bottleneck risk." onChange={(value) => onControlChange('batteryCapacityConstraint', value)} />
        <SliderControl label="Evacuation capacity" value={controls.evacuationCapacity} min={60} max={120} step={1} suffix="%" help="Controls trunk load, storage pressure, cost, and margin." onChange={(value) => onControlChange('evacuationCapacity', value)} />
        <SliderControl label="Production uplift target" value={controls.productionUpliftTarget} min={0} max={30} step={1} suffix="%" help="Adds wellhead demand, battery load, and dispatch pressure." onChange={(value) => onControlChange('productionUpliftTarget', value)} />
      </div>
      <div className="border-t border-slate-200 bg-slate-50/80 p-4">
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
          <div className="rounded-2xl border border-white bg-white px-2 py-2 shadow-sm">
            <div className="text-slate-400">risk</div>
            <div className={toneClasses[metrics.riskLevel].text}>{metrics.bottleneckSeverity.toFixed(0)}</div>
          </div>
          <div className="rounded-2xl border border-white bg-white px-2 py-2 shadow-sm">
            <div className="text-slate-400">delay</div>
            <div className="text-amber-700">{metrics.scheduleDelay.toFixed(1)}d</div>
          </div>
          <div className="rounded-2xl border border-white bg-white px-2 py-2 shadow-sm">
            <div className="text-slate-400">margin</div>
            <div className={metrics.marginImpact >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{metrics.marginImpact >= 0 ? '+' : ''}{metrics.marginImpact.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
function ImpactPropagationPanel({ ai, metrics, selectedAsset, selectedTruck, selectedMaterial }: { ai: AiRecommendation; metrics: SystemMetrics; selectedAsset: SelectedAsset | null; selectedTruck: TruckItem | null; selectedMaterial: InventoryItem | null }) {
  const urgencyTone = toneClasses[ai.urgency];
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/90 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.55)] backdrop-blur">
      <div className="border-b border-slate-200 bg-gradient-to-br from-white via-cyan-50/70 to-blue-50/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <BrainCircuit className="h-4 w-4 text-cyan-600" /> System consequence engine
          </div>
          <StatusPill risk={metrics.bottleneckSeverity} label={ai.urgency} />
        </div>
        <div className="mt-3 rounded-3xl border border-white/80 bg-white/80 p-3 shadow-inner">
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">selected driver</div>
          <div className="mt-1 text-base font-black leading-tight text-slate-950">{ai.driver}</div>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-slate-600">
            {selectedTruck ? <span className="rounded-full bg-slate-100 px-2 py-1">truck-selected</span> : null}
            {selectedMaterial ? <span className="rounded-full bg-cyan-50 px-2 py-1 text-cyan-700">{selectedMaterial.name}</span> : null}
            {selectedAsset ? <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">{selectedAsset.type}</span> : null}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {[
          ['Immediate impact', ai.immediateImpact],
          ['Secondary impact', ai.secondaryImpact],
          ['Downstream impact', ai.downstreamImpact],
          ['Cost impact', ai.costImpact],
          ['Margin impact', ai.marginImpact],
          ['Schedule impact', ai.scheduleImpact],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</div>
            <div className="mt-1 text-sm font-bold leading-relaxed text-slate-800">{value}</div>
          </div>
        ))}

        <div className={`rounded-3xl border p-4 ${urgencyTone.bg} ${urgencyTone.border}`}>
          <div className="flex items-center justify-between gap-3">
            <div className={`text-[11px] font-black uppercase tracking-[0.16em] ${urgencyTone.text}`}>AI recommended action</div>
            <div className="rounded-full border border-white/70 bg-white/70 px-2.5 py-1 text-[11px] font-black text-slate-700">{ai.confidence.toFixed(0)}% confidence</div>
          </div>
          <div className="mt-2 text-sm font-black leading-relaxed text-slate-950">{ai.recommendation}</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
            <CircuitBoard className="h-4 w-4 text-cyan-600" /> propagation path
          </div>
          <div className="space-y-2">
            {ai.propagationPath.map((step, index) => (
              <div key={`${step.label}-${index}`} className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[11px] font-black text-slate-500 shadow-sm">{index + 1}</div>
                <div className="min-w-0 flex-1 rounded-2xl border border-white bg-white px-3 py-2 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{step.label}</span>
                    <span className="text-[11px] font-black" style={{ color: riskRingColor(step.risk) }}>{step.risk.toFixed(0)}</span>
                  </div>
                  <div className="truncate text-xs font-bold text-slate-800">{step.value}</div>
                </div>
                {index < ai.propagationPath.length - 1 ? <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventStream({ events, onEventClick }: { events: EventItem[]; onEventClick: (event: EventItem) => void }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/90 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.55)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Clock3 className="h-4 w-4 text-cyan-600" /> Operational event stream
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-600">Click an event to focus the related asset and update propagation.</div>
        </div>
      </div>
      <div className="max-h-[410px] space-y-2 overflow-y-auto p-4 pr-2">
        <AnimatePresence initial={false}>
          {events.map((event) => {
            const tone = toneClasses[event.severity];
            const StageIcon = STAGES.find((stage) => stage.id === event.stage)?.icon ?? Activity;
            return (
              <motion.button
                key={event.id}
                type="button"
                onClick={() => onEventClick(event)}
                className="group flex w-full gap-3 rounded-3xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-cyan-200 hover:bg-cyan-50/30"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div className={`mt-0.5 rounded-2xl border p-2 ${tone.bg} ${tone.border}`}>
                  <StageIcon className={`h-4 w-4 ${tone.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-sm font-black text-slate-950">{event.title}</div>
                    <div className="shrink-0 text-[10px] font-black text-slate-400">{event.minutesAgo}m</div>
                  </div>
                  <div className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">{event.detail}</div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    <span>{STAGES.find((stage) => stage.id === event.stage)?.short}</span>
                    <span>·</span>
                    <span>{event.targetType} {event.targetId}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ChartCard({ spec, data, index }: { spec: ReturnType<typeof chartSpecsForStage>[number]; data: Array<Record<string, number | string>>; index: number }) {
  const chartColor = ['#0ea5e9', '#2563eb', '#10b981', '#f59e0b'][index % 4];
  const secondaryColor = ['#94a3b8', '#06b6d4', '#8b5cf6', '#ef4444'][index % 4];
  const gradientId = `chartGradient-${index}-${spec.title.replace(/\s+/g, '')}`;
  const tooltipStyle = {
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    boxShadow: '0 20px 45px -30px rgba(15,23,42,0.35)',
    fontWeight: 700,
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.5)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black text-slate-950">{spec.title}</div>
          <div className="text-xs font-semibold text-slate-500">{spec.subtitle}</div>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-black text-slate-600">{spec.unit}</span>
      </div>
      <div className="h-[205px]">
        <ResponsiveContainer width="100%" height="100%">
          {spec.type === 'bar' ? (
            <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="primary" name={spec.primary} radius={[8, 8, 0, 0]} fill={chartColor} />
              <Bar dataKey="demand" name={spec.secondary} radius={[8, 8, 0, 0]} fill={secondaryColor} opacity={0.42} />
            </BarChart>
          ) : spec.type === 'line' ? (
            <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line dataKey="primary" name={spec.primary} stroke={chartColor} strokeWidth={3} dot={false} type="monotone" />
              <Line dataKey="secondary" name={spec.secondary} stroke={secondaryColor} strokeWidth={2} dot={false} type="monotone" strokeDasharray="5 5" />
            </LineChart>
          ) : spec.type === 'composed' ? (
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="demand" name={spec.secondary} radius={[8, 8, 0, 0]} fill={secondaryColor} opacity={0.24} />
              <Line dataKey="primary" name={spec.primary} stroke={chartColor} strokeWidth={3} dot={false} type="monotone" />
              <Line dataKey="tertiary" name="Constraint" stroke="#ef4444" strokeWidth={2} dot={false} type="monotone" />
            </ComposedChart>
          ) : (
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.36} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area dataKey="primary" name={spec.primary} type="monotone" stroke={chartColor} strokeWidth={3} fill={`url(#${gradientId})`} />
              <Line dataKey="risk" name="Risk" stroke={secondaryColor} strokeWidth={2} dot={false} type="monotone" strokeDasharray="5 5" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AnalyticsDeck({
  activeStage,
  selectedTimeRange,
  onTimeRangeChange,
  chartData,
}: {
  activeStage: StageId;
  selectedTimeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  chartData: Array<Record<string, number | string>>;
}) {
  const specs = chartSpecsForStage(activeStage);
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.55)] backdrop-blur">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-r from-white to-cyan-50/70 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <BarChart3 className="h-4 w-4 text-cyan-600" /> Bottom multi-chart analytics deck
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-600">Stage-aware analytics update with selected time range, scenario, sliders, materials, and assets.</div>
        </div>
        <div className="flex gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5">
          {rangeOptions.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => onTimeRangeChange(range)}
              className={`rounded-xl px-3 py-2 text-xs font-black transition-all ${
                selectedTimeRange === range ? 'bg-slate-950 text-white shadow-lg shadow-slate-400/30' : 'text-slate-600 hover:bg-cyan-50 hover:text-cyan-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-2 2xl:grid-cols-4">
        {specs.map((spec, index) => (
          <ChartCard key={spec.title} spec={spec} data={chartData} index={index} />
        ))}
      </div>
    </div>
  );
}
function DrawerMetric({ label, value, tone = 'slate' }: { label: string; value: string; tone?: 'slate' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue' }) {
  const toneMap = {
    slate: 'text-slate-900 bg-white border-slate-200',
    cyan: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-700 bg-amber-50 border-amber-200',
    rose: 'text-rose-700 bg-rose-50 border-rose-200',
    blue: 'text-blue-700 bg-blue-50 border-blue-200',
  }[tone];
  return (
    <div className={`rounded-2xl border p-3 ${toneMap}`}>
      <div className="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">{label}</div>
      <div className="mt-1 text-sm font-black">{value}</div>
    </div>
  );
}

function DetailGauge({ value, label }: { value: number; label: string }) {
  const level = riskFromScore(value);
  const color = riskRingColor(value);
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</div>
        <span className={toneClasses[level].text}>{value.toFixed(0)}</span>
      </div>
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="90%" innerRadius="68%" outerRadius="100%" barSize={14} data={[{ name: label, value: clamp(value, 0, 100), fill: color }]} startAngle={180} endAngle={0}>
            <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#e2e8f0' }} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MicroTrend({ chartData, title }: { chartData: Array<Record<string, number | string>>; title: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-3">
      <div className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">{title}</div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData.slice(-10)} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="drawerTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" hide />
            <YAxis hide />
            <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', fontWeight: 700 }} />
            <Area type="monotone" dataKey="primary" stroke="#0ea5e9" strokeWidth={3} fill="url(#drawerTrend)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DependencyMap({ steps }: { steps: string[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        <GitBranch className="h-4 w-4 text-cyan-600" /> dependency map
      </div>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-black text-slate-500 shadow-sm">{index + 1}</div>
            <div className="flex-1 rounded-2xl border border-white bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">{step}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailDrawer({
  selectedAsset,
  selectedTruck,
  selectedMaterial,
  inventory,
  metrics,
  controls,
  chartData,
  rigs,
  fracSpreads,
  onClose,
}: {
  selectedAsset: SelectedAsset | null;
  selectedTruck: TruckItem | null;
  selectedMaterial: InventoryItem | null;
  inventory: InventoryItem[];
  metrics: SystemMetrics;
  controls: WhatIfControls;
  chartData: Array<Record<string, number | string>>;
  rigs: Rig[];
  fracSpreads: FracSpread[];
  onClose: () => void;
}) {
  const isOpen = Boolean(selectedAsset || selectedTruck || selectedMaterial);
  const assetPad = selectedAsset?.type === 'pad' ? findPad(selectedAsset.id) : null;
  const assetWell = selectedAsset?.type === 'well' ? findWell(selectedAsset.id) : null;
  const assetRig = selectedAsset?.type === 'rig' ? rigs.find((rig) => rig.id === selectedAsset.id) : null;
  const assetSpread = selectedAsset?.type === 'fracSpread' ? fracSpreads.find((spread) => spread.id === selectedAsset.id) : null;
  const assetBattery = selectedAsset?.type === 'battery' ? findBattery(selectedAsset.id) : null;
  const assetPlant = selectedAsset?.type === 'plant' ? findPlant(selectedAsset.id) : null;
  const assetTank = selectedAsset?.type === 'tank' ? findTank(selectedAsset.id) : null;

  let title = 'Operational Detail';
  let subtitle = 'Selected object dependency and impact profile';
  let risk = metrics.bottleneckSeverity;

  if (selectedTruck) {
    title = selectedTruck.id;
    subtitle = `${selectedTruck.contractor} · ${selectedTruck.cargo} · ${selectedTruck.origin} → ${selectedTruck.destination}`;
    risk = selectedTruck.risk;
  } else if (selectedMaterial) {
    title = selectedMaterial.name;
    subtitle = `${selectedMaterial.coverageDays.toFixed(1)} coverage days · ${selectedMaterial.dependentPads.length} dependent pads`;
    risk = selectedMaterial.risk;
  } else if (assetPad) {
    title = assetPad.name;
    subtitle = `${assetPad.sector} · ${assetPad.wells} wells · ${assetPad.currentStage}`;
    risk = clamp(assetPad.riskBase + metrics.scheduleDelay * 7, 4, 98);
  } else if (assetWell) {
    title = assetWell.id;
    subtitle = `${assetWell.state} · ${Math.round(assetWell.measuredDepth)}m MD · ${assetWell.lift}`;
    risk = assetWell.state === 'constrained' ? 82 : clamp(100 - assetWell.uptime + metrics.batteryUtilization * 0.28, 5, 96);
  } else if (assetRig) {
    title = assetRig.id;
    subtitle = `${assetRig.contractor} · ${assetRig.status} · ${assetRig.padId}`;
    risk = clamp(100 - assetRig.utilization + metrics.scheduleDelay * 8, 5, 96);
  } else if (assetSpread) {
    title = assetSpread.id;
    subtitle = `${assetSpread.wellId} · ${assetSpread.status}`;
    risk = clamp(100 - assetSpread.continuity + metrics.fracContinuityRisk * 0.4, 5, 98);
  } else if (assetBattery) {
    title = assetBattery.name;
    subtitle = `${assetBattery.connectedPads.length} connected pads · ${compact(assetBattery.capacityBpd)} bbl/d capacity`;
    risk = clamp(metrics.batteryUtilization - 12, 5, 99);
  } else if (assetPlant) {
    title = assetPlant.name;
    subtitle = `${assetPlant.type} · ${compact(assetPlant.capacity)} bbl/d capacity`;
    risk = clamp(metrics.evacuationUtilization - 10, 5, 99);
  } else if (assetTank) {
    title = assetTank.name;
    subtitle = `${assetTank.destination} · ${assetTank.capacityKbbl.toFixed(0)} kbbl capacity`;
    risk = clamp(metrics.storagePressure + (assetTank.fillKbbl / assetTank.capacityKbbl) * 22, 5, 99);
  } else if (selectedAsset?.type === 'kpi') {
    title = `KPI Focus: ${selectedAsset.label ?? selectedAsset.id}`;
    subtitle = 'Cross-system drivers currently influencing this indicator';
  }

  const materialForAsset = selectedTruck ? inventory.find((item) => item.id === selectedTruck.material) : selectedMaterial;
  const drawerMetrics = selectedTruck
    ? [
        ['Cargo', `${selectedTruck.quantity} ${selectedTruck.unit} ${selectedTruck.cargo}`, 'cyan' as const],
        ['ETA', `${selectedTruck.etaMinutes} min`, 'slate' as const],
        ['Queue time', `${selectedTruck.queueMinutes} min`, selectedTruck.queueMinutes > 80 ? 'rose' as const : 'amber' as const],
        ['Order status', selectedTruck.orderStatus, selectedTruck.orderStatus === 'SAP Blocked' ? 'rose' as const : 'blue' as const],
        ['Gate status', selectedTruck.status, selectedTruck.status === 'Delayed' ? 'rose' as const : 'emerald' as const],
        ['Linked well', selectedTruck.linkedWell ?? 'unassigned', 'slate' as const],
      ]
    : selectedMaterial
      ? [
          ['Current stock', `${compact(selectedMaterial.stock)} ${selectedMaterial.unit}`, 'cyan' as const],
          ['Planned use', `${compact(selectedMaterial.plannedConsumption)} ${selectedMaterial.unit}/d`, 'slate' as const],
          ['Inbound qty', `+${compact(selectedMaterial.inbound)} ${selectedMaterial.unit}`, 'emerald' as const],
          ['Outbound allocation', `-${compact(selectedMaterial.outbound)} ${selectedMaterial.unit}`, 'amber' as const],
          ['Coverage', `${selectedMaterial.coverageDays.toFixed(1)} days`, selectedMaterial.coverageDays < 2 ? 'rose' as const : 'cyan' as const],
          ['Stockout estimate', `${selectedMaterial.nextStockoutHours.toFixed(0)} hours`, selectedMaterial.nextStockoutHours < 48 ? 'rose' as const : 'slate' as const],
        ]
      : assetPad
        ? [
            ['Wells count', `${assetPad.wells}`, 'cyan' as const],
            ['Stage', assetPad.currentStage, 'slate' as const],
            ['Readiness', pct(assetPad.readiness, 0), assetPad.readiness > 80 ? 'emerald' as const : 'amber' as const],
            ['Days to rig', `${assetPad.daysToRig.toFixed(1)} days`, assetPad.daysToRig > 5 ? 'rose' as const : 'cyan' as const],
            ['Diesel used', `${assetPad.dieselUsed.toFixed(1)} kbbl`, 'amber' as const],
            ['Linked battery', assetPad.linkedBattery, 'blue' as const],
          ]
        : assetWell
          ? [
              ['Lifecycle', assetWell.state, assetWell.state === 'constrained' ? 'rose' as const : 'emerald' as const],
              ['Measured depth', `${Math.round(assetWell.measuredDepth)} m`, 'blue' as const],
              ['Frac stage', `${assetWell.fracStage}/${assetWell.stagesPlanned}`, 'cyan' as const],
              ['Current output', `${Math.round(assetWell.productionBpd)} bbl/d`, 'emerald' as const],
              ['Uptime', pct(assetWell.uptime, 1), assetWell.uptime < 82 ? 'amber' as const : 'emerald' as const],
              ['Battery', assetWell.batteryId, 'slate' as const],
            ]
          : assetRig
            ? [
                ['Utilization', pct(assetRig.utilization, 1), assetRig.utilization > 92 ? 'emerald' as const : 'amber' as const],
                ['Measured depth', `${Math.round(assetRig.measuredDepth)} m`, 'blue' as const],
                ['Plan depth', `${Math.round(assetRig.planDepth)} m`, 'slate' as const],
                ['Cycle time', `${assetRig.cycleDays.toFixed(1)} days`, assetRig.cycleDays > 15 ? 'amber' as const : 'emerald' as const],
                ['Status', assetRig.status, 'cyan' as const],
                ['Pad', assetRig.padId, 'slate' as const],
              ]
            : assetBattery
              ? [
                  ['Throughput', `${compact(assetBattery.throughputBase)} bbl/d`, 'cyan' as const],
                  ['Capacity', `${compact(assetBattery.capacityBpd)} bbl/d`, 'slate' as const],
                  ['Utilization', pct(metrics.batteryUtilization, 1), metrics.batteryUtilization > 90 ? 'rose' as const : 'amber' as const],
                  ['Pressure', `${Math.round(assetBattery.pressurePsi + metrics.batteryUtilization * 1.2)} psi`, 'blue' as const],
                  ['Oil cut', pct(assetBattery.oilCut, 1), 'emerald' as const],
                  ['Connected pads', `${assetBattery.connectedPads.length}`, 'slate' as const],
                ]
              : assetPlant
                ? [
                    ['Inlet', `${compact(assetPlant.inlet)} bbl/d`, 'cyan' as const],
                    ['Outlet', `${compact(assetPlant.outlet)} bbl/d`, 'emerald' as const],
                    ['Utilization', pct(metrics.evacuationUtilization, 1), metrics.evacuationUtilization > 94 ? 'rose' as const : 'amber' as const],
                    ['Compression', pct(assetPlant.compressionLoad, 0), 'blue' as const],
                    ['Spec status', pct(assetPlant.specReady, 0), 'emerald' as const],
                    ['Downstream', `${pct(metrics.storagePressure, 0)} storage`, 'amber' as const],
                  ]
                : assetTank
                  ? [
                      ['Fill', `${assetTank.fillKbbl.toFixed(1)} kbbl`, 'cyan' as const],
                      ['Capacity', `${assetTank.capacityKbbl.toFixed(1)} kbbl`, 'slate' as const],
                      ['Inbound batch', `${assetTank.inboundKbbl.toFixed(1)} kbbl`, 'blue' as const],
                      ['Outbound batch', `${assetTank.outboundKbbl.toFixed(1)} kbbl`, 'emerald' as const],
                      ['Realized price', `${currency(assetTank.price)}/bbl`, 'emerald' as const],
                      ['Destination', assetTank.destination, 'slate' as const],
                    ]
                  : [
                      ['Current production', `${compact(metrics.currentProduction)} bbl/d`, 'emerald' as const],
                      ['Forecast production', `${compact(metrics.forecastProduction)} bbl/d`, 'cyan' as const],
                      ['Schedule impact', `${metrics.scheduleDelay.toFixed(1)} days`, 'amber' as const],
                      ['Battery utilization', pct(metrics.batteryUtilization, 1), 'blue' as const],
                      ['Evacuation utilization', pct(metrics.evacuationUtilization, 1), 'slate' as const],
                      ['Margin impact', `${metrics.marginImpact >= 0 ? '+' : ''}${currency(metrics.marginImpact)}/bbl`, metrics.marginImpact >= 0 ? 'emerald' as const : 'rose' as const],
                    ];

  const dependencySteps = selectedTruck
    ? [
        `${selectedTruck.cargo} truck ${selectedTruck.status.toLowerCase()}`,
        `${selectedTruck.destination} receives material window`,
        `${selectedTruck.linkedWell} stage or handoff protected`,
        `Startup conversion changes forecast production`,
        `Battery and evacuation load recalculated`,
        `Delivered cost and margin updated`,
      ]
    : selectedMaterial
      ? [
          `${selectedMaterial.name} stock and inbound allocation`,
          `${selectedMaterial.dependentPads.slice(0, 2).join(' / ')} dependent pads`,
          `Schedule confidence and truck demand`,
          `Stage continuity or surface readiness`,
          `Production forecast and margin`,
        ]
      : assetBattery
        ? ['Connected wells', 'Flowline pressure', 'Separation capacity', 'Evacuation readiness', 'Storage pressure', 'Margin capture']
        : assetPlant
          ? ['Battery nominations', 'Treatment inlet', 'Spec readiness', 'Trunk utilization', 'Dispatch batch', 'Delivered cost']
          : ['Selected asset', 'Local execution', 'Material/logistics demand', 'Well startup conversion', 'Surface capacity', 'Program economics'];

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          initial={{ x: 540, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 540, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 32 }}
          className="fixed bottom-4 right-4 top-4 z-50 flex w-[min(500px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 shadow-[0_40px_100px_-42px_rgba(15,23,42,0.65)] backdrop-blur-xl"
        >
          <div className="border-b border-slate-200 bg-gradient-to-br from-white via-cyan-50/80 to-blue-50/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">detail drawer</div>
                <h3 className="mt-1 truncate text-xl font-black text-slate-950">{title}</h3>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">{subtitle}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <DrawerMetric label="risk" value={risk.toFixed(0)} tone={risk > 76 ? 'rose' : risk > 52 ? 'amber' : 'cyan'} />
              <DrawerMetric label="schedule" value={`${metrics.scheduleDelay.toFixed(1)}d`} tone={metrics.scheduleDelay > 3 ? 'amber' : 'slate'} />
              <DrawerMetric label="margin" value={`${metrics.marginImpact >= 0 ? '+' : ''}${metrics.marginImpact.toFixed(2)}`} tone={metrics.marginImpact >= 0 ? 'emerald' : 'rose'} />
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-2">
              {drawerMetrics.map(([label, value, tone]) => (
                <DrawerMetric key={label} label={label} value={value} tone={tone} />
              ))}
            </div>

            {selectedTruck ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">logistics detail</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                  <div className="rounded-2xl bg-white p-3">Driver: {selectedTruck.driver}</div>
                  <div className="rounded-2xl bg-white p-3">Contractor: {selectedTruck.contractor}</div>
                  <div className="rounded-2xl bg-white p-3">Loading: {selectedTruck.progress < 0.18 ? 'active' : 'released'}</div>
                  <div className="rounded-2xl bg-white p-3">Unloading: {selectedTruck.progress > 0.78 ? 'arriving' : 'not started'}</div>
                  <div className="col-span-2 rounded-2xl bg-white p-3">Delay reason: {selectedTruck.delayReason}</div>
                  <div className="col-span-2 rounded-2xl bg-white p-3">Operational impact: {selectedTruck.impact}</div>
                </div>
              </div>
            ) : null}

            {materialForAsset ? (
              <div className="rounded-3xl border border-cyan-200 bg-cyan-50/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">linked inventory</div>
                    <div className="text-sm font-black text-slate-950">{materialForAsset.name}</div>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2 text-xs font-black text-cyan-700">{materialForAsset.coverageDays.toFixed(1)} days</div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-cyan-500" style={{ width: `${clamp(materialForAsset.coverageDays * 10, 5, 100)}%` }} />
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              <DetailGauge value={risk} label="asset risk" />
              <DetailGauge value={metrics.downstreamImpactScore} label="downstream" />
            </div>
            <MicroTrend chartData={chartData} title="selected impact trend" />
            <DependencyMap steps={dependencySteps} />

            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">current what-if context</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                <div className="rounded-2xl bg-slate-50 p-3">Sand delay: {controls.sandDeliveryDelay.toFixed(1)}h</div>
                <div className="rounded-2xl bg-slate-50 p-3">Truck congestion: {pct(controls.truckCongestion)}</div>
                <div className="rounded-2xl bg-slate-50 p-3">Battery constraint: {pct(controls.batteryCapacityConstraint)}</div>
                <div className="rounded-2xl bg-slate-50 p-3">Evacuation capacity: {pct(controls.evacuationCapacity)}</div>
              </div>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

function defaultAssetForStage(stage: StageId): SelectedAsset {
  if (stage === 'pad') return { type: 'pad', id: 'PAD-12', label: 'Pad 12' };
  if (stage === 'drilling') return { type: 'rig', id: 'R-03', label: 'Rig R-03' };
  if (stage === 'completion') return { type: 'fracSpread', id: 'FS-01', label: 'Frac Spread FS-01' };
  if (stage === 'production') return { type: 'well', id: 'PAD-18-H04', label: 'Well PAD-18-H04' };
  if (stage === 'gathering') return { type: 'battery', id: 'B-07', label: 'Battery B-07' };
  if (stage === 'treatment') return { type: 'plant', id: 'PLT-03', label: 'Central Evacuation Plant' };
  return { type: 'tank', id: 'TK-03', label: 'Tank TK-03' };
}

function materialStage(material: MaterialId): StageId {
  if (material === 'sand' || material === 'water' || material === 'diesel') return 'completion';
  if (material === 'casing' || material === 'cement' || material === 'barite') return 'drilling';
  if (material === 'tubing') return 'production';
  if (material === 'chemicals') return 'treatment';
  return 'gathering';
}

export default function PluspetrolWellFactoryCommand() {
  const [activeStage, setActiveStage] = useState<StageId>('completion');
  const [activeScenario, setActiveScenario] = useState<ScenarioId>('normal');
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(defaultAssetForStage('completion'));
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialId | null>('sand');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('24H');
  const [selectedViewMode, setSelectedViewMode] = useState<ViewMode>('Digital Twin');
  const [simulationTick, setSimulationTick] = useState(0);
  const [whatIfControls, setWhatIfControls] = useState<WhatIfControls>(() => getScenarioControls('normal'));
  const [activeWorkspace, setActiveWorkspace] = useState<'command' | 'logistics' | 'inventory' | 'network' | 'performance'>('command');
  const [railTab, setRailTab] = useState<'impact' | 'detail' | 'events' | 'whatIf' | 'metrics'>('impact');

  const [logisticsIntensity, setLogisticsIntensity] = useState(0);
  const [inventoryStress, setInventoryStress] = useState(0);
  const [productionDelta, setProductionDelta] = useState(0);
  const [scheduleDelay, setScheduleDelay] = useState(0);
  const [bottleneckSeverity, setBottleneckSeverity] = useState(0);
  const [marginImpact, setMarginImpact] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSimulationTick((tick) => (tick + 1) % 10000);
    }, 2400);
    return () => window.clearInterval(interval);
  }, []);

  const metrics = useMemo(() => calculateSystemMetrics(whatIfControls, activeScenario, simulationTick), [whatIfControls, activeScenario, simulationTick]);
  const rigs = useMemo(() => generateRigs(BASE_PADS, whatIfControls), [whatIfControls]);
  const fracSpreads = useMemo(() => generateFracSpreads(BASE_WELLS, whatIfControls), [whatIfControls]);
  const inventory = useMemo(() => createInventory(whatIfControls, metrics), [whatIfControls, metrics]);
  const trucks = useMemo(() => generateTrucks(BASE_PADS, whatIfControls, metrics, simulationTick), [whatIfControls, metrics, simulationTick]);
  const selectedTruckObject = useMemo(() => trucks.find((truck) => truck.id === selectedTruck) ?? null, [trucks, selectedTruck]);
  const selectedMaterialObject = useMemo(() => inventory.find((item) => item.id === selectedMaterial) ?? null, [inventory, selectedMaterial]);
  const stageStates = useMemo(() => deriveStageStates(metrics, whatIfControls), [metrics, whatIfControls]);
  const chartData = useMemo(() => createChartDataByStage(activeStage, selectedTimeRange, metrics, whatIfControls, simulationTick), [activeStage, selectedTimeRange, metrics, whatIfControls, simulationTick]);
  const events = useMemo(() => createEventStream(metrics, whatIfControls, simulationTick), [metrics, whatIfControls, simulationTick]);
  const ai = useMemo(
    () => deriveAIRecommendation({ activeStage, controls: whatIfControls, metrics, selectedAsset, selectedTruck: selectedTruckObject, selectedMaterial: selectedMaterialObject, scenario: activeScenario }),
    [activeStage, whatIfControls, metrics, selectedAsset, selectedTruckObject, selectedMaterialObject, activeScenario],
  );

  useEffect(() => {
    setLogisticsIntensity(clamp(metrics.trucksActive / 4 + metrics.truckQueueTime * 7, 0, 100));
    setInventoryStress(metrics.inventoryRisk);
    setProductionDelta(metrics.productionDelta);
    setScheduleDelay(metrics.scheduleDelay);
    setBottleneckSeverity(metrics.bottleneckSeverity);
    setMarginImpact(metrics.marginImpact);
  }, [metrics]);

  const workspaceRailDefaults: Record<'command' | 'logistics' | 'inventory' | 'network' | 'performance', 'impact' | 'detail' | 'events' | 'whatIf' | 'metrics'> = {
    command: 'impact',
    logistics: 'whatIf',
    inventory: 'detail',
    network: 'detail',
    performance: 'metrics',
  };

  useEffect(() => {
    setRailTab(workspaceRailDefaults[activeWorkspace]);
  }, [activeWorkspace]);

  const syncWorkspaceForStage = (stage: StageId) => {
    if (stage === 'completion') return 'command' as const;
    if (stage === 'pad' || stage === 'drilling' || stage === 'gathering') return 'network' as const;
    if (stage === 'treatment' || stage === 'storage' || stage === 'production') return 'performance' as const;
    return activeWorkspace;
  };

  const handleScenarioChange = (scenario: ScenarioId) => {
    setActiveScenario(scenario);
    setWhatIfControls(getScenarioControls(scenario));
    setSelectedTruck(null);

    if (scenario === 'sandDelay') {
      setActiveStage('completion');
      setSelectedMaterial('sand');
      setSelectedAsset({ type: 'fracSpread', id: 'FS-01', label: 'Frac Spread FS-01' });
      setSelectedViewMode('Constraint Lens');
      setActiveWorkspace('logistics');
    } else if (scenario === 'batteryConstraint') {
      setActiveStage('gathering');
      setSelectedMaterial('spares');
      setSelectedAsset({ type: 'battery', id: 'B-07', label: 'Battery B-07' });
      setSelectedViewMode('Constraint Lens');
      setActiveWorkspace('network');
    } else if (scenario === 'evacuationConstraint') {
      setActiveStage('treatment');
      setSelectedMaterial('chemicals');
      setSelectedAsset({ type: 'plant', id: 'PLT-03', label: 'Central Evacuation Plant' });
      setSelectedViewMode('Margin Lens');
      setActiveWorkspace('performance');
    } else if (scenario === 'fracBottleneck') {
      setActiveStage('completion');
      setSelectedMaterial('water');
      setSelectedAsset({ type: 'fracSpread', id: 'FS-03', label: 'Frac Spread FS-03' });
      setSelectedViewMode('Constraint Lens');
      setActiveWorkspace('command');
    } else if (scenario === 'optimizationRecovery') {
      setActiveStage('storage');
      setSelectedMaterial('diesel');
      setSelectedAsset({ type: 'tank', id: 'TK-03', label: 'Tank TK-03' });
      setSelectedViewMode('Margin Lens');
      setActiveWorkspace('performance');
    } else {
      setActiveStage('completion');
      setSelectedMaterial('sand');
      setSelectedAsset({ type: 'fracSpread', id: 'FS-01', label: 'Frac Spread FS-01' });
      setSelectedViewMode('Digital Twin');
      setActiveWorkspace('command');
    }
  };

  const handleStageClick = (stage: StageId) => {
    setActiveStage(stage);
    setSelectedTruck(null);
    const material = STAGES.find((item) => item.id === stage)?.primaryMaterial ?? null;
    setSelectedMaterial(material);
    setSelectedAsset(defaultAssetForStage(stage));
    setActiveWorkspace(syncWorkspaceForStage(stage));
  };

  const handleSelectAsset = (asset: SelectedAsset) => {
    setSelectedAsset(asset);
    setSelectedTruck(null);
    if (asset.type === 'battery') {
      setActiveStage('gathering');
      setActiveWorkspace('network');
    }
    if (asset.type === 'plant') {
      setActiveStage('treatment');
      setActiveWorkspace('performance');
    }
    if (asset.type === 'tank' || asset.type === 'batch') {
      setActiveStage('storage');
      setActiveWorkspace('performance');
    }
    if (asset.type === 'rig') {
      setActiveStage('drilling');
      setActiveWorkspace('network');
    }
    if (asset.type === 'fracSpread') {
      setActiveStage('completion');
      setActiveWorkspace('command');
    }
    if (asset.type === 'well') {
      const stage = findWell(asset.id)?.state === 'completion' ? 'completion' : 'production';
      setActiveStage(stage);
      setActiveWorkspace(syncWorkspaceForStage(stage));
    }
  };

  const handleSelectTruck = (truck: TruckItem) => {
    setSelectedTruck(truck.id);
    setSelectedMaterial(truck.material);
    setSelectedAsset({ type: 'pad', id: truck.linkedPad, label: truck.destination });
    setActiveStage(materialStage(truck.material));
    setSelectedViewMode('Constraint Lens');
    setActiveWorkspace('logistics');
  };

  const handleSelectMaterial = (material: MaterialId) => {
    const item = inventory.find((inv) => inv.id === material);
    setSelectedMaterial(material);
    setSelectedTruck(null);
    const stage = materialStage(material);
    setActiveStage(stage);
    setSelectedViewMode(material === 'sand' || material === 'water' || material === 'diesel' ? 'Constraint Lens' : 'Digital Twin');
    setSelectedAsset(item?.dependentPads[0] ? { type: 'pad', id: item.dependentPads[0], label: findPad(item.dependentPads[0])?.name ?? item.dependentPads[0] } : defaultAssetForStage(stage));
    setActiveWorkspace(material === 'sand' || material === 'water' || material === 'diesel' || material === 'cement' || material === 'casing' ? 'inventory' : 'logistics');
  };

  const handleKpiClick = (id: string) => {
    setSelectedTruck(null);
    setSelectedAsset({ type: 'kpi', id, label: id.replace(/([A-Z])/g, ' $1') });
    if (id === 'inventory') {
      const highestRisk = inventory.slice().sort((a, b) => b.risk - a.risk)[0];
      setSelectedMaterial(highestRisk.id);
      setActiveStage(materialStage(highestRisk.id));
      setSelectedViewMode('Constraint Lens');
      setActiveWorkspace('inventory');
    } else if (id === 'trucks' || id === 'completion') {
      setActiveStage('completion');
      setSelectedMaterial('sand');
      setSelectedViewMode('Constraint Lens');
      setActiveWorkspace('logistics');
    } else if (id === 'drilling' || id === 'confidence') {
      setActiveStage('drilling');
      setSelectedMaterial('casing');
      setActiveWorkspace('network');
    } else if (id === 'battery') {
      setActiveStage('gathering');
      setSelectedMaterial('spares');
      setActiveWorkspace('network');
    } else if (id === 'evacuation' || id === 'cost' || id === 'margin') {
      setActiveStage(id === 'margin' ? 'storage' : 'treatment');
      setSelectedMaterial('chemicals');
      setSelectedViewMode('Margin Lens');
      setActiveWorkspace('performance');
    } else if (id === 'online' || id === 'current' || id === 'forecast') {
      setActiveStage('production');
      setSelectedMaterial('tubing');
      setActiveWorkspace('performance');
    } else if (id === 'pads') {
      setActiveStage('pad');
      setSelectedMaterial('diesel');
      setActiveWorkspace('network');
    }
  };

  const handleEventClick = (event: EventItem) => {
    setActiveStage(event.stage);
    setSelectedTruck(null);
    setActiveWorkspace(syncWorkspaceForStage(event.stage));
    if (event.targetType === 'material') {
      handleSelectMaterial(event.targetId as MaterialId);
      return;
    }
    if (event.targetType === 'truck') {
      const truck = trucks.find((item) => item.id === event.targetId);
      if (truck) handleSelectTruck(truck);
      return;
    }
    const typeMap: Record<EventItem['targetType'], AssetType> = {
      pad: 'pad',
      well: 'well',
      truck: 'pad',
      material: 'pad',
      battery: 'battery',
      plant: 'plant',
      tank: 'tank',
    };
    setSelectedAsset({ type: typeMap[event.targetType], id: event.targetId, label: event.title });
  };

  const handleControlChange = (key: keyof WhatIfControls, value: number) => {
    setWhatIfControls((previous) => ({ ...previous, [key]: value }));
    if (key === 'sandDeliveryDelay' || key === 'waterAvailability' || key === 'dieselAvailability' || key === 'truckCongestion') {
      setActiveStage('completion');
      setSelectedMaterial(key === 'waterAvailability' ? 'water' : key === 'dieselAvailability' ? 'diesel' : 'sand');
      setSelectedViewMode('Constraint Lens');
      setActiveWorkspace('logistics');
    } else if (key === 'batteryCapacityConstraint') {
      setActiveStage('gathering');
      setSelectedMaterial('spares');
      setSelectedViewMode('Constraint Lens');
      setActiveWorkspace('network');
    } else if (key === 'evacuationCapacity' || key === 'productionUpliftTarget') {
      setActiveStage(key === 'evacuationCapacity' ? 'treatment' : 'production');
      setSelectedMaterial(key === 'evacuationCapacity' ? 'chemicals' : 'tubing');
      setSelectedViewMode('Margin Lens');
      setActiveWorkspace('performance');
    } else if (key === 'rigEfficiency') {
      setActiveStage('drilling');
      setSelectedMaterial('casing');
      setSelectedViewMode('Digital Twin');
      setActiveWorkspace('network');
    } else if (key === 'fracSpreadProductivity') {
      setActiveStage('completion');
      setSelectedMaterial('sand');
      setSelectedViewMode('Constraint Lens');
      setActiveWorkspace('command');
    }
  };

  const navItems = [
    { id: 'command' as const, label: 'Command', icon: Cpu, subtitle: 'Canvas' },
    { id: 'logistics' as const, label: 'Logistics', icon: Truck, subtitle: 'Movement' },
    { id: 'inventory' as const, label: 'Inventory', icon: Boxes, subtitle: 'Materials' },
    { id: 'network' as const, label: 'Network', icon: GitBranch, subtitle: 'Assets' },
    { id: 'performance' as const, label: 'Performance', icon: BarChart3, subtitle: 'Analytics' },
  ];

  const workspaceMeta = {
    command: { title: 'Command Center', subtitle: 'Central operational monitor, AI consequence engine, and live field context.', tabs: ['impact', 'detail', 'events'] as const },
    logistics: { title: 'Logistics Simulation', subtitle: 'Truck movement, queues, delivery continuity, and dispatch bottlenecks.', tabs: ['whatIf', 'impact', 'detail'] as const },
    inventory: { title: 'Inventory Cockpit', subtitle: 'Coverage, stockout risk, dependent pads, and inbound allocation.', tabs: ['detail', 'impact', 'events'] as const },
    network: { title: 'Field Network', subtitle: 'Pads, wells, gathering nodes, and connected surface assets.', tabs: ['detail', 'events', 'metrics'] as const },
    performance: { title: 'Performance & Economics', subtitle: 'Forecasts, economics, what-if controls, and system-level optimization.', tabs: ['metrics', 'whatIf', 'impact'] as const },
  };

  const activeNav = navItems.find((item) => item.id === activeWorkspace) ?? navItems[0];
  const activeStageDef = STAGES.find((stage) => stage.id === activeStage)!;
  const activeWorkspaceMeta = workspaceMeta[activeWorkspace];
  const visibleEvents = events.slice(0, 5);

  const kpiRibbon = [
    { id: 'online', label: 'Wells Online', value: metrics.wellsOnline.toFixed(0), sub: `${compact(metrics.currentProduction)} bbl/d`, risk: riskFromScore(metrics.wellsDelayed * 0.9) },
    { id: 'drilling', label: 'Wells Drilling', value: metrics.wellsDrilling.toFixed(0), sub: `${pct(metrics.drillingScheduleConfidence, 0)} confidence`, risk: riskFromScore(100 - metrics.drillingScheduleConfidence) },
    { id: 'completion', label: 'Frac Stages', value: metrics.fracStagesToday.toFixed(0), sub: `${metrics.wellsCompletion.toFixed(0)} wells in completion`, risk: riskFromScore(metrics.fracContinuityRisk) },
    { id: 'trucks', label: 'Trucks Active', value: metrics.trucksActive.toFixed(0), sub: `${metrics.queuedTrucks.toFixed(0)} queued`, risk: riskFromScore(metrics.truckQueueTime) },
    { id: 'inventory', label: 'Inventory Risk', value: pct(metrics.inventoryRisk, 0), sub: `${metrics.inventoryCoverageDays.toFixed(1)} days cover`, risk: riskFromScore(metrics.inventoryRisk) },
    { id: 'battery', label: 'Battery Util.', value: pct(metrics.batteryUtilization, 1), sub: 'surface handling', risk: riskFromScore(metrics.batteryUtilization) },
    { id: 'evacuation', label: 'Evacuation Util.', value: pct(metrics.evacuationUtilization, 1), sub: 'treatment + trunk', risk: riskFromScore(metrics.evacuationUtilization) },
    { id: 'margin', label: 'Margin Impact', value: `${metrics.marginImpact >= 0 ? '+' : ''}${metrics.marginImpact.toFixed(2)}`, sub: `$${metrics.deliveredCost.toFixed(2)}/bbl cost`, risk: riskFromScore(Math.abs(metrics.marginImpact) * 18 + metrics.bottleneckSeverity * 0.25) },
  ];

  const systemPulse = [
    { label: 'Operating mode', value: ai.priority, sub: SCENARIOS[activeScenario].summary },
    { label: 'Dominant constraint', value: metrics.fracContinuityRisk > metrics.batteryUtilization && metrics.fracContinuityRisk > metrics.evacuationUtilization ? 'Completion logistics' : metrics.batteryUtilization > metrics.evacuationUtilization ? 'Battery headroom' : 'Evacuation capacity', sub: activeStageDef.name },
    { label: 'Economic pulse', value: `${metrics.marginImpact >= 0 ? '+' : ''}${metrics.marginImpact.toFixed(2)} $/bbl`, sub: `Delivered cost $${metrics.deliveredCost.toFixed(2)}/bbl` },
  ];

  const railMetrics = [
    { label: 'logistics intensity', value: pct(logisticsIntensity, 0), tone: logisticsIntensity > 75 ? 'rose' as const : logisticsIntensity > 52 ? 'amber' as const : 'cyan' as const },
    { label: 'inventory stress', value: pct(inventoryStress, 0), tone: inventoryStress > 75 ? 'rose' as const : inventoryStress > 52 ? 'amber' as const : 'cyan' as const },
    { label: 'production delta', value: `${productionDelta >= 0 ? '+' : ''}${compact(productionDelta)} bbl/d`, tone: productionDelta >= 0 ? 'emerald' as const : 'rose' as const },
    { label: 'schedule delay', value: `${scheduleDelay.toFixed(1)} days`, tone: scheduleDelay > 3 ? 'amber' as const : 'slate' as const },
    { label: 'bottleneck / margin', value: `${bottleneckSeverity.toFixed(0)} · ${marginImpact >= 0 ? '+' : ''}${marginImpact.toFixed(2)}`, tone: marginImpact >= 0 ? 'emerald' as const : 'rose' as const },
    { label: 'system tick', value: `${simulationTick % 100}`, tone: 'blue' as const },
  ];

  const selectedSummaryTitle = selectedTruckObject?.id ?? selectedMaterialObject?.name ?? selectedAsset?.label ?? 'No asset selected';
  const selectedSummarySubtitle = selectedTruckObject
    ? `${selectedTruckObject.contractor} · ${selectedTruckObject.cargo} · ${selectedTruckObject.origin} → ${selectedTruckObject.destination}`
    : selectedMaterialObject
      ? `${selectedMaterialObject.coverageDays.toFixed(1)} coverage days · ${selectedMaterialObject.dependentPads.length} dependent pads`
      : selectedAsset
        ? `${selectedAsset.type} · ${selectedAsset.id}`
        : 'The whole field remains the active context.';

  const WorkspaceChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button type="button" onClick={onClick} className={`rounded-2xl border px-3 py-2 text-xs font-black transition ${active ? 'border-[#001C2E] bg-[#001C2E] text-white shadow-md' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50'}`}>
      {label}
    </button>
  );

  const CompactKpi = ({ item }: { item: (typeof kpiRibbon)[number] }) => {
    const tone = toneClasses[item.risk];
    return (
      <button type="button" onClick={() => handleKpiClick(item.id)} className="group rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-cyan-200 hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">{item.label}</div>
            <div className="mt-1 text-lg font-black leading-none text-[#001C2E]">{item.value}</div>
            <div className="mt-1 truncate text-[10px] font-semibold text-slate-500">{item.sub}</div>
          </div>
          <div className={`h-8 w-1.5 rounded-full bg-gradient-to-b ${tone.fill}`} />
        </div>
      </button>
    );
  };

  const WorkspaceMonitorFrame = ({ children }: { children: React.ReactNode }) => (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_88px] gap-3 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/72 p-3 shadow-[0_18px_50px_-42px_rgba(0,28,46,0.28)]">
      <div className="flex items-start justify-between gap-3 rounded-[1.2rem] border border-slate-200 bg-gradient-to-r from-white to-cyan-50/50 px-4 py-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">workspace monitor</div>
          <div className="mt-1 text-lg font-black text-[#001C2E]">{activeWorkspaceMeta.title}</div>
          <div className="text-xs font-semibold text-slate-500">{activeWorkspaceMeta.subtitle}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500">{activeStageDef.name}</span>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-black text-cyan-700">{selectedViewMode}</span>
        </div>
      </div>
      <div className="min-h-0 overflow-hidden">{children}</div>
      <div className="grid grid-cols-4 gap-2">
        <DrawerMetric label="program scale" value={`${metrics.totalWellsProgram} wells`} tone="blue" />
        <DrawerMetric label="trucks / queue" value={`${metrics.trucksActive} / ${metrics.queuedTrucks}`} tone="cyan" />
        <DrawerMetric label="inventory cover" value={`${metrics.inventoryCoverageDays.toFixed(1)} days`} tone={metrics.inventoryRisk > 70 ? 'rose' : metrics.inventoryRisk > 45 ? 'amber' : 'emerald'} />
        <DrawerMetric label="forecast" value={`${compact(metrics.forecastProduction)} bbl/d`} tone="emerald" />
      </div>
    </div>
  );

  const SelectedDetailCard = () => (
    <div className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-gradient-to-r from-white to-cyan-50/60 px-4 py-3">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">selected operating detail</div>
        <div className="mt-1 text-lg font-black text-[#001C2E]">{selectedSummaryTitle}</div>
        <div className="text-xs font-semibold text-slate-500">{selectedSummarySubtitle}</div>
      </div>
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-3 gap-2">
          <DrawerMetric label="risk" value={metrics.bottleneckSeverity.toFixed(0)} tone={metrics.bottleneckSeverity > 76 ? 'rose' : metrics.bottleneckSeverity > 52 ? 'amber' : 'cyan'} />
          <DrawerMetric label="delay" value={`${metrics.scheduleDelay.toFixed(1)}d`} tone={metrics.scheduleDelay > 3 ? 'amber' : 'slate'} />
          <DrawerMetric label="margin" value={`${metrics.marginImpact >= 0 ? '+' : ''}${metrics.marginImpact.toFixed(2)}`} tone={metrics.marginImpact >= 0 ? 'emerald' : 'rose'} />
        </div>
        {selectedMaterialObject ? (
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-700">linked inventory</div>
                <div className="text-sm font-black text-slate-950">{selectedMaterialObject.name}</div>
              </div>
              <div className="rounded-xl bg-white px-2 py-1 text-[10px] font-black text-cyan-700">{selectedMaterialObject.coverageDays.toFixed(1)} days</div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-cyan-500" style={{ width: `${clamp(selectedMaterialObject.coverageDays * 10, 5, 100)}%` }} />
            </div>
          </div>
        ) : null}
        {selectedTruckObject ? (
          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600">
            <div className="rounded-xl bg-slate-50 p-2">ETA {selectedTruckObject.etaMinutes} min</div>
            <div className="rounded-xl bg-slate-50 p-2">Queue {selectedTruckObject.queueMinutes} min</div>
            <div className="rounded-xl bg-slate-50 p-2">Order {selectedTruckObject.orderStatus}</div>
            <div className="rounded-xl bg-slate-50 p-2">Cargo {selectedTruckObject.quantity} {selectedTruckObject.unit}</div>
          </div>
        ) : null}
        <DependencyMap
          steps={selectedTruckObject
            ? [`${selectedTruckObject.cargo} load`, selectedTruckObject.destination, selectedTruckObject.linkedWell ?? 'linked well', 'startup conversion', 'surface load', 'margin update']
            : selectedMaterialObject
              ? [selectedMaterialObject.name, `${selectedMaterialObject.dependentPads.slice(0, 2).join(' / ')} pads`, 'logistics demand', 'stage continuity', 'production forecast', 'margin']
              : ['selected asset', 'local execution', 'material demand', 'well startup', 'surface capacity', 'program economics']}
        />
      </div>
    </div>
  );

  const MetricsRailCard = () => (
    <div className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">system pulse metrics</div>
        <div className="mt-1 text-lg font-black text-[#001C2E]">Operational interlock</div>
      </div>
      <div className="grid gap-2 p-4">
        {railMetrics.map((item) => (
          <DrawerMetric key={item.label} label={item.label} value={item.value} tone={item.tone} />
        ))}
      </div>
    </div>
  );

  const BottomStrip = () => (
    <div className="grid h-full gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white p-3">
        <StageSpine stageStates={stageStates} activeStage={activeStage} onStageClick={handleStageClick} />
      </div>
      <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">active operating context</div>
        <div className="mt-1 text-lg font-black text-[#001C2E]">{activeStageDef.name}</div>
        <div className="text-xs font-semibold text-slate-500">{activeStageDef.purpose}</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <DrawerMetric label="workspace" value={activeNav.label} tone="blue" />
          <DrawerMetric label="active view" value={selectedViewMode} tone="cyan" />
          <DrawerMetric label="constraint" value={metrics.fracContinuityRisk > metrics.batteryUtilization && metrics.fracContinuityRisk > metrics.evacuationUtilization ? 'Logistics' : metrics.batteryUtilization > metrics.evacuationUtilization ? 'Battery' : 'Evacuation'} tone="amber" />
          <DrawerMetric label="confidence" value={pct(metrics.drillingScheduleConfidence, 0)} tone="emerald" />
        </div>
      </div>
    </div>
  );

  const monitorContent = (() => {
    if (activeWorkspace === 'command') {
      return (
        <OperatingCanvas
          activeStage={activeStage}
          selectedViewMode={selectedViewMode}
          metrics={metrics}
          controls={whatIfControls}
          pads={BASE_PADS}
          wells={BASE_WELLS}
          rigs={rigs}
          fracSpreads={fracSpreads}
          trucks={trucks}
          batteries={BASE_BATTERIES}
          plants={BASE_PLANTS}
          tanks={BASE_TANKS}
          inventory={inventory}
          selectedAsset={selectedAsset}
          selectedTruck={selectedTruck}
          selectedMaterial={selectedMaterial}
          onSelectAsset={handleSelectAsset}
          onSelectTruck={handleSelectTruck}
        />
      );
    }
    if (activeWorkspace === 'logistics') {
      return (
        <LogisticsSimulationLayer
          trucks={trucks}
          selectedTruck={selectedTruck}
          selectedMaterial={selectedMaterial}
          metrics={metrics}
          onSelectTruck={handleSelectTruck}
          onSelectMaterial={handleSelectMaterial}
        />
      );
    }
    if (activeWorkspace === 'inventory') {
      return <InventoryModule inventory={inventory} selectedMaterial={selectedMaterial} metrics={metrics} onSelectMaterial={handleSelectMaterial} />;
    }
    if (activeWorkspace === 'network') {
      return (
        <OperatingCanvas
          activeStage={activeStage}
          selectedViewMode={selectedViewMode}
          metrics={metrics}
          controls={whatIfControls}
          pads={BASE_PADS}
          wells={BASE_WELLS}
          rigs={rigs}
          fracSpreads={fracSpreads}
          trucks={trucks}
          batteries={BASE_BATTERIES}
          plants={BASE_PLANTS}
          tanks={BASE_TANKS}
          inventory={inventory}
          selectedAsset={selectedAsset}
          selectedTruck={selectedTruck}
          selectedMaterial={selectedMaterial}
          onSelectAsset={handleSelectAsset}
          onSelectTruck={handleSelectTruck}
        />
      );
    }
    return <AnalyticsDeck activeStage={activeStage} selectedTimeRange={selectedTimeRange} onTimeRangeChange={setSelectedTimeRange} chartData={chartData} />;
  })();

  const railPanel = (() => {
    if (railTab === 'detail') return <SelectedDetailCard />;
    if (railTab === 'events') return <EventStream events={visibleEvents} onEventClick={handleEventClick} />;
    if (railTab === 'whatIf') return <WhatIfConsole controls={whatIfControls} activeScenario={activeScenario} metrics={metrics} onControlChange={handleControlChange} onReset={() => setWhatIfControls(getScenarioControls(activeScenario))} />;
    if (railTab === 'metrics') return <MetricsRailCard />;
    return <ImpactPropagationPanel ai={ai} metrics={metrics} selectedAsset={selectedAsset} selectedTruck={selectedTruckObject} selectedMaterial={selectedMaterialObject} />;
  })();

  const railPreview = (() => {
    if (railTab !== 'impact' && activeWorkspaceMeta.tabs.includes('impact')) return <ImpactPropagationPanel ai={ai} metrics={metrics} selectedAsset={selectedAsset} selectedTruck={selectedTruckObject} selectedMaterial={selectedMaterialObject} />;
    if (railTab !== 'detail' && activeWorkspaceMeta.tabs.includes('detail')) return <SelectedDetailCard />;
    if (railTab !== 'whatIf' && activeWorkspaceMeta.tabs.includes('whatIf')) return <WhatIfConsole controls={whatIfControls} activeScenario={activeScenario} metrics={metrics} onControlChange={handleControlChange} onReset={() => setWhatIfControls(getScenarioControls(activeScenario))} />;
    if (railTab !== 'metrics' && activeWorkspaceMeta.tabs.includes('metrics')) return <MetricsRailCard />;
    if (railTab !== 'events' && activeWorkspaceMeta.tabs.includes('events')) return <EventStream events={visibleEvents.slice(0, 3)} onEventClick={handleEventClick} />;
    return null;
  })();

  const monitorHeightRow = activeWorkspace === 'performance' ? 'grid-rows-[auto_auto_minmax(0,1fr)_148px]' : 'grid-rows-[auto_auto_minmax(0,1fr)_158px]';

  return (
    <div className="relative h-[100vh] min-h-[740px] w-full overflow-hidden bg-white font-sans text-slate-900 text-[13px]">
      <div style={{ transform: 'scale(0.67)', transformOrigin: 'top left', width: 'calc(100% / 0.67)', height: 'calc(100% / 0.67)' }} className="relative flex flex-col">
        <div className="flex flex-1 w-full flex-col overflow-hidden bg-transparent">
          <div className="grid flex-1 min-h-0 grid-cols-[84px_minmax(0,1fr)] gap-0">
            <aside className="flex h-full flex-col items-center gap-3 border-r border-slate-200 bg-white/90 px-3 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#001C2E] shadow-lg">
              <img src="https://images.aiworkify.com/pluspetrol-project/pluspetrol-isologo.png" alt="Pluspetrol" className="h-7 w-7 object-contain" />
            </div>
            <nav className="mt-2 flex w-full flex-1 flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.id === activeWorkspace;
                return (
                  <button key={item.id} type="button" onClick={() => setActiveWorkspace(item.id)} className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center transition ${active ? 'border-[#001C2E] bg-[#001C2E] text-white shadow-md' : 'border-transparent bg-slate-50 text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-[#001C2E]'}`}>
                    <Icon className="h-4.5 w-4.5" />
                    <span className="text-[9px] font-black uppercase tracking-[0.14em]">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-2 text-center">
              <div className="mx-auto mb-2 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
              <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">tv live</div>
            </div>
          </aside>

          <div className={`grid h-full min-h-0 ${monitorHeightRow} bg-[linear-gradient(180deg,#fbfbfc,#f7f8fb)]`}>
            <header className="border-b border-slate-200 px-4 py-3">
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">600-well operations system</span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{activeNav.label}</span>
                  </div>
                  <h1 className="mt-2 text-[2rem] font-black tracking-tight text-[#001C2E]">Pluspetrol Well Factory Command</h1>
                  <p className="mt-1 max-w-4xl text-xs font-semibold leading-relaxed text-slate-500">Real-time orchestration of wells, pads, logistics, inventory, production, and operational impact. The left menu switches workspaces; the central monitor and right rail change together.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(Object.keys(SCENARIOS) as ScenarioId[]).map((scenario) => <WorkspaceChip key={scenario} label={SCENARIOS[scenario].label} active={activeScenario === scenario} onClick={() => handleScenarioChange(scenario)} />)}
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  {systemPulse.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                      <div className="mt-1 text-sm font-black leading-tight text-slate-900">{item.value}</div>
                      <div className="mt-1 text-[11px] font-semibold leading-tight text-slate-500">{item.sub}</div>
                    </div>
                  ))}
                  <div className="md:col-span-3 flex flex-wrap gap-2 pt-1">
                    {(['Digital Twin', 'Constraint Lens', 'Margin Lens'] as ViewMode[]).map((mode) => <WorkspaceChip key={mode} label={mode} active={selectedViewMode === mode} onClick={() => setSelectedViewMode(mode)} />)}
                  </div>
                </div>
              </div>
            </header>

            <div className="border-b border-slate-200 px-4 py-3">
              <div className="grid gap-2 xl:grid-cols-8">
                {kpiRibbon.map((item) => <CompactKpi key={item.id} item={item} />)}
              </div>
            </div>

            <main className="grid min-h-0 grid-cols-[minmax(0,1fr)_360px] gap-4 p-4">
              <div className="min-h-0">
                <WorkspaceMonitorFrame>
                  <AnimatePresence mode="wait">
                    <motion.div key={activeWorkspace} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="h-full min-h-0 overflow-hidden">
                      {monitorContent}
                    </motion.div>
                  </AnimatePresence>
                </WorkspaceMonitorFrame>
              </div>

              <aside className="min-h-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/72 p-3 shadow-[0_18px_50px_-42px_rgba(0,28,46,0.28)]">
                <div className="flex h-full min-h-0 flex-col gap-3">
                  <div className="rounded-[1.1rem] border border-slate-200 bg-white p-2">
                    <div className="mb-2 px-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">context rail</div>
                    <div className="flex flex-wrap gap-2">
                      {activeWorkspaceMeta.tabs.map((tab) => (
                        <button key={tab} type="button" onClick={() => setRailTab(tab)} className={`rounded-2xl border px-3 py-2 text-[11px] font-black transition ${railTab === tab ? 'border-[#001C2E] bg-[#001C2E] text-white' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-cyan-200 hover:bg-cyan-50'}`}>
                          {tab === 'whatIf' ? 'What-if' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_190px] gap-3 overflow-hidden">
                    <div className="min-h-0 overflow-y-auto pr-1">{railPanel}</div>
                    <div className="min-h-0 overflow-hidden rounded-[1.2rem] border border-slate-200 bg-slate-50/60 p-2">
                      <div className="mb-2 px-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">secondary context</div>
                      <div className="h-full min-h-0 overflow-hidden">{railPreview}</div>
                    </div>
                  </div>
                </div>
              </aside>
            </main>

            <footer className="border-t border-slate-200 p-4">
              <BottomStrip />
            </footer>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
