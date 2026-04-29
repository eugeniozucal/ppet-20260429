'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Boxes,
  BrainCircuit,
  Building2,
  ChevronRight,
  Clock3,
  Cpu,
  Database,
  Droplets,
  Factory,
  Fuel,
  Gauge,
  GitBranch,
  Layers,
  Package,
  Pickaxe,
  Route,
  Settings2,
  Ship,
  SlidersHorizontal,
  Sparkles,
  Truck,
  Warehouse,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type StageId = 'pad' | 'drilling' | 'completion' | 'production' | 'gathering' | 'treatment' | 'storage';
type WorkspaceId = 'command' | 'logistics' | 'inventory' | 'network' | 'performance';
type ContextPanel = 'impact' | 'detail' | 'events' | 'whatIf' | 'metrics';
type ScenarioId = 'normal' | 'sandDelay' | 'fracBottleneck' | 'batteryConstraint' | 'evacuationConstraint' | 'optimizationRecovery';
type TimeRange = 'Live' | '24H' | '7D' | '30D';
type ViewMode = 'Digital Twin' | 'Constraint Lens' | 'Margin Lens';
type RiskLevel = 'low' | 'guarded' | 'elevated' | 'critical';
type MaterialId = 'sand' | 'water' | 'diesel' | 'casing' | 'cement' | 'barite' | 'chemicals' | 'tubing' | 'spares';
type WellState = 'planned' | 'pad-ready' | 'drilling' | 'completion' | 'flowback' | 'online' | 'constrained';
type AssetType = 'pad' | 'well' | 'rig' | 'fracSpread' | 'battery' | 'plant' | 'tank' | 'truck' | 'material' | 'kpi' | 'event';

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
  primaryDriver: string;
};

type MaterialProfile = {
  id: MaterialId;
  name: string;
  icon: LucideIcon;
  unit: string;
  color: string;
  primaryStage: StageId;
  affectedStages: StageId[];
  driverType: 'completionSupply' | 'waterSupply' | 'fieldFuel' | 'drillingSupply' | 'chemistry' | 'startup' | 'uptime';
};

type Pad = {
  id: string;
  name: string;
  sector: string;
  x: number;
  y: number;
  wells: number;
  currentStage: StageId;
  readiness: number;
  linkedBattery: string;
};

type Well = {
  id: string;
  padId: string;
  state: WellState;
  measuredDepth: number;
  planDepth: number;
  fracStage: number;
  stagesPlanned: number;
  productionBpd: number;
  uptime: number;
  batteryId: string;
};

type Rig = {
  id: string;
  padId: string;
  utilization: number;
  measuredDepth: number;
  planDepth: number;
  cycleDays: number;
  status: 'Curve' | 'Lateral' | 'Casing' | 'Move';
};

type FracSpread = {
  id: string;
  padId: string;
  wellId: string;
  stagesToday: number;
  continuityScore: number;
  pressurePsi: number;
};

type TruckItem = {
  id: string;
  contractor: string;
  driver: string;
  material: MaterialId;
  cargo: string;
  quantity: number;
  unit: string;
  origin: string;
  destination: string;
  linkedPad: string;
  linkedWell: string;
  etaMinutes: number;
  queueMinutes: number;
  dwellMinutes: number;
  status: 'Moving' | 'Queued' | 'Loading' | 'Unloading' | 'Delayed' | 'At Gate' | 'Released';
  orderStatus: 'Released' | 'Priority' | 'Pending Gate' | 'Validated' | 'SAP Blocked';
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
  specReady: number;
};

type Tank = {
  id: string;
  name: string;
  x: number;
  y: number;
  capacityKbbl: number;
  fillKbbl: number;
  destination: string;
  price: number;
};

type InventoryItem = {
  id: MaterialId;
  name: string;
  unit: string;
  icon: LucideIcon;
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
  fracContinuityScore: number;
  drillingScheduleConfidence: number;
  currentProduction: number;
  forecastProduction: number;
  productionDelta: number;
  batteryUtilization: number;
  evacuationUtilization: number;
  storagePressure: number;
  deliveredCost: number;
  marginImpact: number;
  scheduleConfidence: number;
  scheduleDelay: number;
  downstreamImpactScore: number;
  bottleneckSeverity: number;
  capitalEfficiency: number;
  riskLevel: RiskLevel;
  dominantConstraint: string;
  globalConstraint: string;
};

type SelectedAsset = {
  type: AssetType;
  id: string;
  label: string;
};

type EventItem = {
  id: string;
  stage: StageId;
  severity: RiskLevel;
  title: string;
  detail: string;
  minutesAgo: number;
  targetType: AssetType;
  targetId: string;
};

type AiRecommendation = {
  selectedFocus: string;
  localStage: string;
  globalConstraint: string;
  localImpact: string;
  systemImpact: string;
  costImpact: string;
  scheduleImpact: string;
  recommendation: string;
  confidence: number;
  urgency: RiskLevel;
  path: string[];
};

type ChartDatum = {
  label: string;
  primary: number;
  secondary: number;
  tertiary: number;
  demand: number;
  risk: number;
};

type ChartSpec = {
  title: string;
  unit: string;
  type: 'area' | 'bar' | 'line' | 'composed';
  primary: string;
  secondary: string;
};

const LOGO_URL = 'https://images.aiworkify.com/pluspetrol-project/pluspetrol-isologo.png';
const PROGRAM_WELLS = 600;

const STAGES: StageDefinition[] = [
  { id: 'pad', name: 'Pad Construction', short: 'Pad', purpose: 'Civil readiness and rig handoff.', icon: Building2, primaryDriver: 'civil readiness' },
  { id: 'drilling', name: 'Drilling', short: 'Drill', purpose: 'Rig cycle, depth, casing, cement and mud.', icon: Pickaxe, primaryDriver: 'rig cycle' },
  { id: 'completion', name: 'Completion / Fracture', short: 'Frac', purpose: 'Stages, sand, water, diesel and pumping continuity.', icon: Zap, primaryDriver: 'frac continuity' },
  { id: 'production', name: 'Production', short: 'Produce', purpose: 'Well startup, uptime, artificial lift and forecast.', icon: Activity, primaryDriver: 'startup conversion' },
  { id: 'gathering', name: 'Gathering & Batteries', short: 'Gather', purpose: 'Flowline pressure, battery load and separation room.', icon: GitBranch, primaryDriver: 'battery headroom' },
  { id: 'treatment', name: 'Treatment & Evacuation', short: 'Treat', purpose: 'Plant load, compression, spec readiness and trunk rights.', icon: Factory, primaryDriver: 'evacuation capacity' },
  { id: 'storage', name: 'Storage & Dispatch', short: 'Dispatch', purpose: 'Tank fill, nominations, dispatch and netback.', icon: Ship, primaryDriver: 'dispatch sequence' },
];

const MATERIALS: Record<MaterialId, MaterialProfile> = {
  sand: { id: 'sand', name: 'Sand', icon: Package, unit: 't', color: '#f59e0b', primaryStage: 'completion', affectedStages: ['completion', 'production'], driverType: 'completionSupply' },
  water: { id: 'water', name: 'Water', icon: Droplets, unit: 'kbbl', color: '#00B5E2', primaryStage: 'completion', affectedStages: ['completion'], driverType: 'waterSupply' },
  diesel: { id: 'diesel', name: 'Diesel', icon: Fuel, unit: 'bbl', color: '#64748b', primaryStage: 'pad', affectedStages: ['pad', 'drilling', 'completion'], driverType: 'fieldFuel' },
  casing: { id: 'casing', name: 'Casing', icon: Layers, unit: 'joints', color: '#2563eb', primaryStage: 'drilling', affectedStages: ['drilling', 'completion'], driverType: 'drillingSupply' },
  cement: { id: 'cement', name: 'Cement', icon: Warehouse, unit: 't', color: '#94a3b8', primaryStage: 'drilling', affectedStages: ['drilling'], driverType: 'drillingSupply' },
  barite: { id: 'barite', name: 'Barite', icon: Boxes, unit: 't', color: '#8b5cf6', primaryStage: 'drilling', affectedStages: ['drilling'], driverType: 'drillingSupply' },
  chemicals: { id: 'chemicals', name: 'Chemicals', icon: Database, unit: 'm3', color: '#10b981', primaryStage: 'completion', affectedStages: ['completion', 'treatment'], driverType: 'chemistry' },
  tubing: { id: 'tubing', name: 'Tubing', icon: Layers, unit: 'joints', color: '#0ea5e9', primaryStage: 'production', affectedStages: ['production'], driverType: 'startup' },
  spares: { id: 'spares', name: 'Critical Spares', icon: Settings2, unit: 'kits', color: '#ef4444', primaryStage: 'gathering', affectedStages: ['gathering', 'treatment'], driverType: 'uptime' },
};

const SCENARIOS: Record<ScenarioId, { label: string; summary: string; controls: WhatIfControls }> = {
  normal: {
    label: 'Normal Scaling',
    summary: 'Balanced field growth with manageable logistics load.',
    controls: { sandDeliveryDelay: 0.7, waterAvailability: 98, dieselAvailability: 94, rigEfficiency: 94, fracSpreadProductivity: 92, truckCongestion: 24, batteryCapacityConstraint: 8, evacuationCapacity: 98, productionUpliftTarget: 7 },
  },
  sandDelay: {
    label: 'Sand Delay',
    summary: 'Sand convoys slow, stage continuity decays, startup slips.',
    controls: { sandDeliveryDelay: 3.3, waterAvailability: 96, dieselAvailability: 91, rigEfficiency: 92, fracSpreadProductivity: 89, truckCongestion: 62, batteryCapacityConstraint: 12, evacuationCapacity: 95, productionUpliftTarget: 6 },
  },
  fracBottleneck: {
    label: 'Frac Bottleneck',
    summary: 'Completion capacity limits conversion of drilled wells.',
    controls: { sandDeliveryDelay: 1.8, waterAvailability: 87, dieselAvailability: 86, rigEfficiency: 101, fracSpreadProductivity: 74, truckCongestion: 48, batteryCapacityConstraint: 10, evacuationCapacity: 97, productionUpliftTarget: 9 },
  },
  batteryConstraint: {
    label: 'Battery Constraint',
    summary: 'Surface handling converts uplift into bottleneck risk.',
    controls: { sandDeliveryDelay: 0.8, waterAvailability: 99, dieselAvailability: 92, rigEfficiency: 96, fracSpreadProductivity: 95, truckCongestion: 31, batteryCapacityConstraint: 31, evacuationCapacity: 91, productionUpliftTarget: 17 },
  },
  evacuationConstraint: {
    label: 'Evacuation Constraint',
    summary: 'Treatment and trunk rights restrain dispatch and margin.',
    controls: { sandDeliveryDelay: 1.0, waterAvailability: 96, dieselAvailability: 92, rigEfficiency: 94, fracSpreadProductivity: 93, truckCongestion: 35, batteryCapacityConstraint: 18, evacuationCapacity: 74, productionUpliftTarget: 13 },
  },
  optimizationRecovery: {
    label: 'Optimization Recovery',
    summary: 'Gate automation and routing restore rhythm and margin.',
    controls: { sandDeliveryDelay: 0.2, waterAvailability: 105, dieselAvailability: 102, rigEfficiency: 108, fracSpreadProductivity: 106, truckCongestion: 13, batteryCapacityConstraint: 4, evacuationCapacity: 108, productionUpliftTarget: 18 },
  },
};

const rangeOptions: TimeRange[] = ['Live', '24H', '7D', '30D'];

const toneClasses: Record<RiskLevel, { bg: string; text: string; border: string; fill: string; dot: string }> = {
  low: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', fill: 'from-emerald-400 to-cyan-400', dot: 'bg-emerald-500' },
  guarded: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', fill: 'from-cyan-400 to-blue-400', dot: 'bg-cyan-500' },
  elevated: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', fill: 'from-amber-400 to-orange-400', dot: 'bg-amber-500' },
  critical: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', fill: 'from-rose-500 to-red-500', dot: 'bg-rose-500' },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const pct = (value: number, decimals = 0) => `${value.toFixed(decimals)}%`;
const compact = (value: number, decimals = 0) => new Intl.NumberFormat('en-US', { notation: Math.abs(value) >= 100000 ? 'compact' : 'standard', maximumFractionDigits: decimals }).format(value);
const currency = (value: number, decimals = 2) => `${value < 0 ? '-' : ''}$${Math.abs(value).toFixed(decimals)}`;

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
  return Math.sin((seed * 19.7 + tick * 0.33) % 100) * amplitude;
}

function generatePads(): Pad[] {
  const sectors = ['Aguada Norte', 'Loma Alta', 'Bajo Oeste', 'Central Block', 'Eastern Stepout', 'Sur Pad Cluster'];
  return Array.from({ length: 96 }, (_, index) => {
    const stage = STAGES[index % STAGES.length].id;
    return {
      id: `PAD-${String(index + 1).padStart(2, '0')}`,
      name: `Pad ${String(index + 1).padStart(2, '0')}`,
      sector: sectors[index % sectors.length],
      x: 62 + (index % 12) * 72 + (deterministicNoise(index + 4) - 0.5) * 6,
      y: 54 + Math.floor(index / 12) * 55 + (deterministicNoise(index + 9) - 0.5) * 6,
      wells: index < 24 ? 7 : 6,
      currentStage: stage,
      readiness: clamp(50 + (index % 7) * 7 + deterministicNoise(index + 5) * 16, 18, 99),
      linkedBattery: `B-${String((index % 10) + 1).padStart(2, '0')}`,
    };
  });
}

const BASE_PADS = generatePads();

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

  const wells = pads.flatMap((pad, padIndex) =>
    Array.from({ length: pad.wells }, (_, slot) => {
      const seed = padIndex * 17 + slot * 13;
      const state = statesByStage[pad.currentStage][slot % statesByStage[pad.currentStage].length];
      const planDepth = 5100 + deterministicNoise(seed + 1) * 900;
      const onlineFactor = state === 'online' ? 1 : state === 'constrained' ? 0.62 : state === 'flowback' ? 0.28 : 0;
      return {
        id: `${pad.id}-H${String(slot + 1).padStart(2, '0')}`,
        padId: pad.id,
        state,
        measuredDepth: state === 'drilling' ? planDepth * (0.42 + deterministicNoise(seed + 2) * 0.48) : planDepth,
        planDepth,
        fracStage: Math.floor(8 + deterministicNoise(seed + 4) * 44),
        stagesPlanned: 46 + Math.floor(deterministicNoise(seed + 5) * 18),
        productionBpd: onlineFactor * (520 + deterministicNoise(seed + 6) * 850),
        uptime: clamp(78 + deterministicNoise(seed + 9) * 21 - (state === 'constrained' ? 18 : 0), 45, 99.8),
        batteryId: pad.linkedBattery,
      };
    }),
  );

  return wells.slice(0, PROGRAM_WELLS);
}

const BASE_WELLS = generateWells(BASE_PADS);

function generateBatteries(pads: Pad[]): Battery[] {
  return Array.from({ length: 10 }, (_, index) => {
    const id = `B-${String(index + 1).padStart(2, '0')}`;
    return {
      id,
      name: `Battery ${String(index + 1).padStart(2, '0')}`,
      x: 110 + (index % 5) * 170,
      y: 305 + Math.floor(index / 5) * 80,
      connectedPads: pads.filter((pad) => pad.linkedBattery === id).map((pad) => pad.id),
      capacityBpd: 36000 + deterministicNoise(index + 93) * 18000,
      throughputBase: 23000 + deterministicNoise(index + 94) * 21000,
      pressurePsi: 420 + deterministicNoise(index + 95) * 220,
    };
  });
}

const BASE_BATTERIES = generateBatteries(BASE_PADS);

const BASE_PLANTS: Plant[] = [
  { id: 'PLT-01', name: 'Crude Treatment North', x: 240, y: 175, type: 'Crude Treatment', capacity: 170000, inlet: 132000, outlet: 126000, specReady: 96 },
  { id: 'PLT-02', name: 'Gas Compression Hub', x: 510, y: 150, type: 'Gas Compression', capacity: 240000, inlet: 184000, outlet: 178000, specReady: 92 },
  { id: 'PLT-03', name: 'Central Evacuation Plant', x: 700, y: 260, type: 'Crude Treatment', capacity: 210000, inlet: 168000, outlet: 162000, specReady: 94 },
];

const BASE_TANKS: Tank[] = Array.from({ length: 8 }, (_, index) => ({
  id: `TK-${String(index + 1).padStart(2, '0')}`,
  name: `Tank ${String(index + 1).padStart(2, '0')}`,
  x: 120 + (index % 4) * 185,
  y: 190 + Math.floor(index / 4) * 120,
  capacityKbbl: 85 + deterministicNoise(index + 300) * 55,
  fillKbbl: 38 + deterministicNoise(index + 301) * 82,
  destination: ['Terminal Norte', 'Export Blend', 'Refinery Slot A', 'Pipeline Batch 42'][index % 4],
  price: 68 + deterministicNoise(index + 304) * 9,
}));

function getScenarioControls(scenario: ScenarioId) {
  return SCENARIOS[scenario].controls;
}

function calculateScheduleImpact(controls: WhatIfControls) {
  const frac = Math.max(0, 96 - controls.fracSpreadProductivity) * 0.035;
  const sand = controls.sandDeliveryDelay * 0.34;
  const rig = Math.max(0, 94 - controls.rigEfficiency) * 0.026;
  const surface = controls.batteryCapacityConstraint * 0.025 + Math.max(0, 100 - controls.evacuationCapacity) * 0.037;
  return clamp(0.25 + frac + sand + rig + surface + controls.truckCongestion * 0.012, 0, 6.4);
}

function calculateMarginImpact(controls: WhatIfControls, productionDelta: number, deliveredCost: number) {
  const volumeEffect = productionDelta / 100000;
  const costEffect = (deliveredCost - 9.5) * 0.28;
  const evacPenalty = Math.max(0, 95 - controls.evacuationCapacity) * 0.035;
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

  const fracContinuityRisk = clamp(8 + sandDelay * 9.5 + congestion * 34 + waterShort * 42 + dieselShort * 31 + Math.max(0, 0.94 - fracFactor) * 75, 0, 98);
  const fracContinuityScore = clamp(100 - fracContinuityRisk, 0, 100);
  const drillingScheduleConfidence = clamp(88 * rigFactor - congestion * 10 - dieselShort * 18 + heartbeat * 1.8, 42, 99);
  const scheduleDelay = calculateScheduleImpact(controls);
  const wellsDrilling = Math.round(clamp(44 * rigFactor + 7 - scheduleDelay * 1.2, 22, 66));
  const wellsCompletion = Math.round(clamp(72 * fracFactor - fracContinuityRisk * 0.18 + 12, 32, 96));
  const wellsDelayed = Math.round(clamp(18 + scheduleDelay * 7 + fracContinuityRisk * 0.34 + Math.max(0, 1 - evacFactor) * 38, 4, 126));
  const wellsOnline = Math.round(clamp(326 + uplift * 105 - wellsDelayed * 0.55 + Math.max(0, evacFactor - 1) * 18 + heartbeat * 2, 250, 454));
  const fracStagesToday = Math.round(clamp(96 * fracFactor * (1 - sandDelay * 0.052) * (1 - congestion * 0.18) * (1 - waterShort * 0.42) * (1 - dieselShort * 0.28), 46, 132));
  const trucksRequired = Math.round(clamp(232 + fracStagesToday * 1.05 + controls.truckCongestion * 1.5 + sandDelay * 12, 250, 410));
  const trucksActive = Math.round(clamp(trucksRequired + heartbeat * 7, 250, 398));
  const queuedTrucks = Math.round(clamp(18 + controls.truckCongestion * 0.95 + sandDelay * 11 + waterShort * 28, 8, 132));
  const delayedTrucks = Math.round(clamp(queuedTrucks * 0.34 + sandDelay * 9 + dieselShort * 24, 3, 74));
  const truckQueueTime = clamp(0.4 + sandDelay * 0.52 + congestion * 3.8 + waterShort * 1.6 + heartbeat * 0.08, 0.2, 8.5);
  const inventoryCoverageDays = clamp(4.8 - sandDelay * 0.36 - waterShort * 7.2 - dieselShort * 6.1 - congestion * 1.5 - Math.max(0, fracFactor - 1) * 1.1, 0.35, 8.5);
  const inventoryRisk = clamp(100 - inventoryCoverageDays * 12 + fracContinuityRisk * 0.26 + queuedTrucks * 0.08, 4, 96);
  const productionBase = 259000 + wellsOnline * 365;
  const productionConstraint = fracContinuityRisk * 270 + Math.max(0, 1 - evacFactor) * 62000 + batteryConstraint * 93000;
  const currentProduction = Math.round(clamp(productionBase * (1 + uplift * 0.55) - productionConstraint + heartbeat * 1400, 245000, 494000));
  const forecastProduction = Math.round(clamp(currentProduction + 82000 + controls.productionUpliftTarget * 1700 - scheduleDelay * 4100 - fracContinuityRisk * 540, 290000, 610000));
  const productionDelta = forecastProduction - (474000 + controls.productionUpliftTarget * 900);
  const batteryUtilization = clamp(62 + uplift * 92 + batteryConstraint * 93 + Math.max(0, currentProduction - 390000) / 3100, 38, 108);
  const evacuationUtilization = clamp(58 + currentProduction / 7800 - (evacFactor - 1) * 48 + batteryConstraint * 22, 38, 112);
  const storagePressure = clamp(34 + Math.max(0, evacuationUtilization - 82) * 1.15 + Math.max(0, 1 - evacFactor) * 38, 18, 100);
  const deliveredCost = clamp(9.45 + congestion * 1.55 + sandDelay * 0.22 + Math.max(0, 1 - evacFactor) * 3.1 + batteryConstraint * 1.4 - Math.max(0, fracFactor - 1) * 0.58, 8.85, 15.7);
  const marginImpact = calculateMarginImpact(controls, productionDelta, deliveredCost);
  const bottleneckSeverity = clamp(Math.max(fracContinuityRisk, inventoryRisk, batteryUtilization - 10, evacuationUtilization - 6, storagePressure) + (scenario === 'optimizationRecovery' ? -7 : 0), 0, 100);
  const downstreamImpactScore = clamp(fracContinuityRisk * 0.22 + inventoryRisk * 0.18 + Math.max(0, batteryUtilization - 74) * 0.7 + Math.max(0, evacuationUtilization - 80) * 0.82 + Math.max(0, storagePressure - 60) * 0.35, 0, 100);
  const scheduleConfidence = clamp(96 - scheduleDelay * 7.8 - fracContinuityRisk * 0.07 + Math.max(0, rigFactor - 1) * 7, 40, 99);
  const capitalEfficiency = clamp(82 + marginImpact * 3 - scheduleDelay * 1.8 + Math.max(0, controls.rigEfficiency - 100) * 0.6, 55, 104);

  const constraints = [
    { name: 'Completion logistics', score: fracContinuityRisk * 0.72 + truckQueueTime * 7.8 },
    { name: 'Inventory coverage', score: inventoryRisk * 0.82 },
    { name: 'Battery capacity', score: batteryUtilization * 0.82 + batteryConstraint * 24 },
    { name: 'Evacuation / treatment capacity', score: evacuationUtilization * 0.88 + Math.max(0, 92 - controls.evacuationCapacity) * 1.7 },
    { name: 'Rig cycle', score: (100 - drillingScheduleConfidence) * 0.9 },
  ].sort((a, b) => b.score - a.score);
  const dominantConstraint = constraints[0].name;
  const globalConstraint = evacuationUtilization > 94 || controls.evacuationCapacity < 84 ? 'Evacuation / treatment capacity' : dominantConstraint;

  const riskLevel = riskFromScore(bottleneckSeverity);
  return {
    totalWellsProgram: PROGRAM_WELLS,
    wellsOnline,
    wellsDrilling,
    wellsCompletion,
    wellsDelayed,
    padsActive: Math.round(clamp(78 + rigFactor * 7 + fracFactor * 5 - scheduleDelay * 2.2, 54, 96)),
    fracStagesToday,
    trucksActive,
    queuedTrucks,
    delayedTrucks,
    trucksRequired,
    truckQueueTime,
    inventoryCoverageDays,
    inventoryRisk,
    fracContinuityRisk,
    fracContinuityScore,
    drillingScheduleConfidence,
    currentProduction,
    forecastProduction,
    productionDelta,
    batteryUtilization,
    evacuationUtilization,
    storagePressure,
    deliveredCost,
    marginImpact,
    scheduleConfidence,
    scheduleDelay,
    downstreamImpactScore,
    bottleneckSeverity,
    capitalEfficiency,
    riskLevel,
    dominantConstraint,
    globalConstraint,
  };
}


function createInventory(controls: WhatIfControls, metrics: SystemMetrics): InventoryItem[] {
  const baseStocks: Record<MaterialId, number> = { sand: 71000, water: 121000, diesel: 25000, casing: 13100, cement: 6400, barite: 3200, chemicals: 730, tubing: 8600, spares: 174 };
  const consumption: Record<MaterialId, number> = { sand: 17200, water: 39000, diesel: 7900, casing: 920, cement: 710, barite: 370, chemicals: 112, tubing: 690, spares: 28 };
  const demandMultiplier = 0.85 + metrics.fracStagesToday / 110 + controls.productionUpliftTarget / 70;
  return (Object.keys(MATERIALS) as MaterialId[]).map((id, index) => {
    const profile = MATERIALS[id];
    const stress =
      id === 'sand' ? controls.sandDeliveryDelay * 0.16 + controls.truckCongestion / 190 :
      id === 'water' ? Math.max(0, 100 - controls.waterAvailability) / 42 :
      id === 'diesel' ? Math.max(0, 100 - controls.dieselAvailability) / 46 + controls.truckCongestion / 260 :
      id === 'casing' ? Math.max(0, 96 - controls.rigEfficiency) / 58 :
      id === 'chemicals' ? Math.max(0, 96 - controls.fracSpreadProductivity) / 80 :
      id === 'spares' ? controls.batteryCapacityConstraint / 70 :
      0.12;
    const outbound = Math.round(consumption[id] * demandMultiplier * (id === 'casing' || id === 'cement' || id === 'barite' ? controls.rigEfficiency / 100 : 1));
    const inbound = Math.round(outbound * (0.74 + deterministicNoise(index + 101) * 0.42 - stress * 0.16));
    const stock = Math.round(baseStocks[id] * (0.88 + deterministicNoise(index + 77) * 0.22 - stress * 0.24));
    const coverageDays = clamp(stock / Math.max(1, outbound), 0.35, 11.5);
    const risk = clamp(100 - coverageDays * 12 + stress * 32 + metrics.truckQueueTime * 1.8, 5, 98);
    const dependentPads = BASE_PADS.filter((_, padIndex) => (padIndex + index) % 9 === 0).slice(0, 7).map((pad) => pad.id);
    return {
      id,
      name: profile.name,
      unit: profile.unit,
      icon: profile.icon,
      stock,
      plannedConsumption: outbound,
      inbound,
      outbound,
      coverageDays,
      risk,
      dependentPads,
      nextStockoutHours: Math.round(coverageDays * 24),
      description:
        id === 'sand' ? 'Controls frac stage continuity and pumping windows.' :
        id === 'water' ? 'Protects hydration buffer for high-rate frac stages.' :
        id === 'diesel' ? 'Supports pump hours, rig auxiliaries and field fleet endurance.' :
        id === 'casing' ? 'Controls rig sequence and wellbore handoff reliability.' :
        id === 'chemicals' ? 'Supports frac fluid program or treatment specification readiness.' :
        id === 'tubing' ? 'Protects startup readiness and production conversion.' :
        id === 'spares' ? 'Protects rotating equipment and surface uptime.' :
        'Feeds drilling execution and schedule confidence.',
    };
  });
}

function generateRigs(pads: Pad[], controls: WhatIfControls): Rig[] {
  return Array.from({ length: 10 }, (_, index) => {
    const pad = pads[(index * 8 + 4) % pads.length];
    return {
      id: `R-${String(index + 1).padStart(2, '0')}`,
      padId: pad.id,
      utilization: clamp(78 + controls.rigEfficiency * 0.22 + deterministicNoise(index + 40) * 13, 52, 109),
      measuredDepth: 3000 + deterministicNoise(index + 41) * 2500,
      planDepth: 5350 + deterministicNoise(index + 42) * 500,
      cycleDays: clamp(16.2 - controls.rigEfficiency * 0.045 + deterministicNoise(index + 43) * 2.8, 8, 22),
      status: (['Curve', 'Lateral', 'Casing', 'Move'] as Rig['status'][])[index % 4],
    };
  });
}

function generateFracSpreads(wells: Well[], controls: WhatIfControls): FracSpread[] {
  return Array.from({ length: 5 }, (_, index) => {
    const well = wells[150 + index * 17] ?? wells[index];
    const continuityScore = clamp(90 - controls.sandDeliveryDelay * 8 - controls.truckCongestion * 0.2 + controls.fracSpreadProductivity * 0.12, 18, 99);
    return {
      id: `FS-${String(index + 1).padStart(2, '0')}`,
      padId: well.padId,
      wellId: well.id,
      stagesToday: Math.round(clamp(14 + controls.fracSpreadProductivity * 0.08 - controls.sandDeliveryDelay * 0.7 + deterministicNoise(index + 80) * 9, 7, 28)),
      continuityScore,
      pressurePsi: 6200 + deterministicNoise(index + 81) * 1200,
    };
  });
}

function generateTrucks(controls: WhatIfControls, metrics: SystemMetrics, tick: number): TruckItem[] {
  const materialOrder: MaterialId[] = ['sand', 'water', 'diesel', 'casing', 'cement', 'barite', 'chemicals', 'tubing', 'spares', 'spares'];
  const origins = ['Yard A - Añelo', 'Staging Yard B', 'Sand Terminal C', 'Water Hub 02', 'Fuel Farm Norte', 'Casing Yard Oeste'];
  const contractors = ['TransNeuquen', 'LogiFrac', 'Patagonia Cargo', 'Andes Haul', 'Cono Sur Transport', 'Vista Fleet'];
  const drivers = ['Luciano M.', 'Mateo R.', 'Valentina C.', 'Joaquín A.', 'Sofía L.', 'Emiliano P.'];
  const baseQty: Record<MaterialId, number> = { sand: 42, water: 190, diesel: 70, casing: 140, cement: 28, barite: 24, chemicals: 22, tubing: 110, spares: 4 };
  const units: Record<MaterialId, string> = { sand: 't', water: 'bbl', diesel: 'bbl', casing: 'joints', cement: 't', barite: 't', chemicals: 'm3', tubing: 'joints', spares: 'kits' };
  const count = clamp(metrics.trucksActive, 250, 398);
  const livePhase = (tick % 240) / 240;
  return Array.from({ length: count }, (_, index) => {
    const material = materialOrder[index % materialOrder.length];
    const pad = BASE_PADS[(index * 7 + 5) % BASE_PADS.length];
    const seed = index * 97 + 11;
    const progress = (deterministicNoise(seed + 1) + livePhase * (0.16 + (index % 5) * 0.015) + index * 0.004) % 1;
    const materialDelay =
      material === 'sand' ? controls.sandDeliveryDelay * 12 :
      material === 'water' ? Math.max(0, 100 - controls.waterAvailability) * 0.34 :
      material === 'diesel' ? Math.max(0, 100 - controls.dieselAvailability) * 0.38 :
      0;
    const risk = clamp(18 + controls.truckCongestion * 0.52 + materialDelay * 0.72 + deterministicNoise(seed + 2) * 30, 4, 98);
    const status: TruckItem['status'] = risk > 78 ? 'Delayed' : risk > 63 ? 'Queued' : progress < 0.12 ? 'Loading' : progress > 0.87 ? 'Unloading' : progress > 0.74 ? 'At Gate' : 'Moving';
    const orderStatus: TruckItem['orderStatus'] = risk > 84 ? 'SAP Blocked' : risk > 70 ? 'Pending Gate' : material === 'sand' && controls.sandDeliveryDelay > 2 ? 'Priority' : progress > 0.72 ? 'Validated' : 'Released';
    return {
      id: `TRK-${String(index + 1).padStart(4, '0')}`,
      contractor: contractors[index % contractors.length],
      driver: drivers[index % drivers.length],
      material,
      cargo: material === 'spares' && index % 10 === 9 ? 'Waste / Backhaul' : MATERIALS[material].name,
      quantity: Math.round(baseQty[material] * (0.82 + deterministicNoise(seed + 3) * 0.45)),
      unit: units[material],
      origin: origins[index % origins.length],
      destination: pad.name,
      linkedPad: pad.id,
      linkedWell: `${pad.id}-H${String((index % pad.wells) + 1).padStart(2, '0')}`,
      etaMinutes: Math.round(clamp(22 + (1 - progress) * 145 + controls.truckCongestion * 0.78 + materialDelay, 5, 360)),
      queueMinutes: Math.round(clamp(metrics.truckQueueTime * 18 + deterministicNoise(seed + 4) * 36 + (status === 'Queued' ? 42 : 0), 0, 240)),
      dwellMinutes: Math.round(clamp(12 + deterministicNoise(seed + 5) * 56 + controls.truckCongestion * 0.35, 4, 160)),
      status,
      orderStatus,
      delayReason: status === 'Delayed' || status === 'Queued' ? ['Gate validation queue', 'Route congestion at km 18', 'Loading bay saturation', 'SAP release pending'][Math.floor(deterministicNoise(seed + 6) * 4)] : 'None',
      impact:
        material === 'sand' ? 'Frac continuity and pumping window exposure.' :
        material === 'diesel' ? 'Pump hours, rig support and field fleet endurance.' :
        material === 'water' ? 'Hydration buffer for the active frac window.' :
        material === 'casing' ? 'Rig sequence and wellbore handoff reliability.' :
        'Schedule confidence for linked pad operations.',
      route: index % 7,
      progress,
      risk,
    };
  });
}

function createChartData(stage: StageId, range: TimeRange, metrics: SystemMetrics, controls: WhatIfControls, tick: number): ChartDatum[] {
  const points = range === 'Live' ? 10 : range === '24H' ? 12 : range === '7D' ? 14 : 16;
  return Array.from({ length: points }, (_, index) => {
    const t = index / Math.max(1, points - 1);
    const oscillation = Math.sin(index * 0.9 + tick * 0.12);
    const label = range === 'Live' ? `T${index}` : range === '24H' ? `${index * 2}h` : range === '7D' ? `D${index + 1}` : `W${index + 1}`;
    const common = { label, risk: clamp(metrics.downstreamImpactScore * (t * 0.65 + 0.35) + oscillation * 5, 0, 100) };
    if (stage === 'drilling') return { ...common, primary: clamp(3100 + t * 2200 * (controls.rigEfficiency / 100) + oscillation * 120, 1800, 6200), secondary: clamp(metrics.drillingScheduleConfidence + oscillation * 3, 35, 100), tertiary: clamp(900 + controls.rigEfficiency * 8 + t * 330, 600, 1800), demand: clamp(15.5 - controls.rigEfficiency * 0.045 + metrics.scheduleDelay * 0.3, 7, 22) };
    if (stage === 'completion') return { ...common, primary: clamp(metrics.fracStagesToday * (0.78 + t * 0.33) + oscillation * 5, 35, 145), secondary: clamp(metrics.fracContinuityScore + oscillation * 4, 0, 100), tertiary: clamp(metrics.truckQueueTime * 8 + oscillation * 3, 4, 72), demand: clamp(90 + controls.fracSpreadProductivity * 0.8 + controls.truckCongestion * 0.45, 60, 160) };
    if (stage === 'production') return { ...common, primary: clamp(metrics.currentProduction / 1000 + t * metrics.productionDelta / 4500 + oscillation * 4, 220, 560), secondary: clamp(metrics.forecastProduction / 1000 + t * 15, 240, 620), tertiary: clamp(86 - metrics.scheduleDelay * 1.9 + oscillation * 2.5, 55, 99), demand: clamp(44 + controls.productionUpliftTarget * 1.8, 20, 90) };
    if (stage === 'gathering') return { ...common, primary: clamp(metrics.batteryUtilization + t * 5 + oscillation * 3.5, 30, 112), secondary: clamp(430 + metrics.batteryUtilization * 2 + oscillation * 22, 320, 720), tertiary: clamp(100 - metrics.batteryUtilization + 12, 0, 70), demand: clamp(62 + controls.productionUpliftTarget * 1.1, 35, 110) };
    if (stage === 'treatment') return { ...common, primary: clamp(metrics.evacuationUtilization + t * 4 + oscillation * 2.8, 35, 112), secondary: clamp(58 + metrics.evacuationUtilization * 0.42 + oscillation * 3, 35, 98), tertiary: clamp(metrics.deliveredCost + t * 0.8, 8, 17), demand: clamp(82 + controls.productionUpliftTarget * 1.2 - (controls.evacuationCapacity - 100) * 0.6, 45, 130) };
    if (stage === 'storage') return { ...common, primary: clamp(metrics.storagePressure + t * 6 + oscillation * 5, 10, 104), secondary: clamp(24 + metrics.evacuationUtilization * 0.45 + oscillation * 5, 20, 90), tertiary: clamp(metrics.marginImpact + oscillation * 0.26, -5, 4), demand: clamp(65 + controls.productionUpliftTarget * 1.6 + metrics.storagePressure * 0.22, 40, 135) };
    return { ...common, primary: clamp(68 + t * 21 - metrics.scheduleDelay * 1.6 + oscillation * 2, 35, 99), secondary: clamp(28 + t * 12 + (100 - controls.dieselAvailability) * 0.6, 12, 76), tertiary: clamp(6.8 - t * 3.5 + metrics.scheduleDelay * 0.38, 0.5, 10), demand: clamp(44 + controls.rigEfficiency * 0.22, 20, 80) };
  });
}

function chartSpecs(stage: StageId): ChartSpec[] {
  const specs: Record<StageId, ChartSpec[]> = {
    pad: [
      { title: 'Pad readiness', unit: '%', type: 'area', primary: 'Readiness', secondary: 'Risk' },
      { title: 'Diesel demand', unit: 'bbl', type: 'bar', primary: 'Diesel', secondary: 'Plan' },
      { title: 'Rig handoff', unit: 'days', type: 'line', primary: 'Days', secondary: 'Plan' },
      { title: 'Crew load', unit: '%', type: 'composed', primary: 'Crew', secondary: 'Demand' },
    ],
    drilling: [
      { title: 'Depth vs plan', unit: 'm', type: 'composed', primary: 'Actual MD', secondary: 'Plan' },
      { title: 'Rig utilization', unit: '%', type: 'area', primary: 'Utilization', secondary: 'Risk' },
      { title: 'Tubular demand', unit: 'units', type: 'bar', primary: 'Consumption', secondary: 'Queue' },
      { title: 'Cycle time', unit: 'days', type: 'line', primary: 'Cycle', secondary: 'Best Path' },
    ],
    completion: [
      { title: 'Stages completed', unit: 'stages', type: 'area', primary: 'Stages', secondary: 'Risk' },
      { title: 'Sand / water flow', unit: 'loads', type: 'bar', primary: 'Supply', secondary: 'Demand' },
      { title: 'Continuity score', unit: '%', type: 'line', primary: 'Continuity', secondary: 'Constraint' },
      { title: 'Arrivals vs demand', unit: 'trucks', type: 'composed', primary: 'Arrivals', secondary: 'Demand' },
    ],
    production: [
      { title: 'Oil forecast', unit: 'kbbl/d', type: 'area', primary: 'Oil', secondary: 'Risk' },
      { title: 'Uptime by pad', unit: '%', type: 'bar', primary: 'Uptime', secondary: 'Risk' },
      { title: 'Startup conversion', unit: '%', type: 'line', primary: 'Ready', secondary: 'Constraint' },
      { title: 'Forecast vs plan', unit: 'kbbl/d', type: 'composed', primary: 'Forecast', secondary: 'Plan' },
    ],
    gathering: [
      { title: 'Battery load', unit: '%', type: 'area', primary: 'Utilization', secondary: 'Risk' },
      { title: 'Pressure', unit: 'psi', type: 'line', primary: 'Pressure', secondary: 'Limit' },
      { title: 'Separation split', unit: '%', type: 'bar', primary: 'Split', secondary: 'Water' },
      { title: 'Spare capacity', unit: '%', type: 'composed', primary: 'Spare', secondary: 'Demand' },
    ],
    treatment: [
      { title: 'Plant throughput', unit: '%', type: 'area', primary: 'Throughput', secondary: 'Risk' },
      { title: 'Compression load', unit: '%', type: 'bar', primary: 'Load', secondary: 'Reserve' },
      { title: 'Evacuation util.', unit: '%', type: 'line', primary: 'Utilization', secondary: 'Limit' },
      { title: 'Delivered cost', unit: '$/bbl', type: 'composed', primary: 'Cost', secondary: 'Demand' },
    ],
    storage: [
      { title: 'Tank fill', unit: '%', type: 'area', primary: 'Fill', secondary: 'Risk' },
      { title: 'Batch movement', unit: 'kbbl', type: 'bar', primary: 'Outbound', secondary: 'Inbound' },
      { title: 'Delivered volume', unit: 'kbbl/d', type: 'line', primary: 'Volume', secondary: 'Plan' },
      { title: 'Margin / netback', unit: '$/bbl', type: 'composed', primary: 'Margin', secondary: 'Cost' },
    ],
  };
  return specs[stage];
}

function createEvents(metrics: SystemMetrics, controls: WhatIfControls, tick: number): EventItem[] {
  const base: EventItem[] = [
    { id: 'EV-01', stage: 'pad', severity: metrics.scheduleDelay > 3 ? 'elevated' : 'low', title: 'Pad 12 ready for rig handoff', detail: 'Civil package closed, access road released, and fuel/water support available for rig move.', minutesAgo: 4 + (tick % 3), targetType: 'pad', targetId: 'PAD-12' },
    { id: 'EV-02', stage: 'drilling', severity: metrics.drillingScheduleConfidence < 72 ? 'elevated' : 'guarded', title: 'Rig R-03 reached 4,820 m measured depth', detail: `Cycle confidence ${pct(metrics.drillingScheduleConfidence)} after casing release and mud program hold points.`, minutesAgo: 7 + (tick % 4), targetType: 'rig', targetId: 'R-03' },
    { id: 'EV-03', stage: 'completion', severity: metrics.fracContinuityRisk > 68 ? 'critical' : 'elevated', title: 'Sand convoy delayed at staging yard', detail: `Sand delay ${controls.sandDeliveryDelay.toFixed(1)}h; queue time ${metrics.truckQueueTime.toFixed(1)}h.`, minutesAgo: 9, targetType: 'material', targetId: 'sand' },
    { id: 'EV-04', stage: 'completion', severity: 'low', title: 'Frac stage 37 completed on Well PAD-18-H04', detail: `${metrics.fracStagesToday} stages completed today across active spreads.`, minutesAgo: 13, targetType: 'well', targetId: 'PAD-18-H04' },
    { id: 'EV-05', stage: 'completion', severity: controls.dieselAvailability < 88 ? 'critical' : 'guarded', title: 'Diesel coverage threshold watch', detail: 'Fuel coverage is now linked to pump hours, field fleet endurance, and rig support.', minutesAgo: 15, targetType: 'material', targetId: 'diesel' },
    { id: 'EV-06', stage: 'gathering', severity: metrics.batteryUtilization > 91 ? 'critical' : 'guarded', title: 'Battery B-07 reached high utilization', detail: `Battery system utilization ${pct(metrics.batteryUtilization, 1)} with water handling pressure increasing.`, minutesAgo: 19, targetType: 'battery', targetId: 'B-07' },
    { id: 'EV-07', stage: 'completion', severity: 'low', title: 'Frac water routing recovered after route reallocation', detail: `Water availability restored to ${pct(controls.waterAvailability)} for the next pumping window.`, minutesAgo: 22, targetType: 'material', targetId: 'water' },
    { id: 'EV-08', stage: 'production', severity: metrics.marginImpact < -1.2 ? 'elevated' : 'low', title: 'Forecast production updated after completion delay', detail: `Forecast now ${compact(metrics.forecastProduction)} bbl/d with margin impact ${metrics.marginImpact >= 0 ? '+' : ''}${currency(metrics.marginImpact)}/bbl.`, minutesAgo: 27, targetType: 'well', targetId: 'PAD-22-H03' },
  ];
  return base.sort((a, b) => a.minutesAgo - b.minutesAgo);
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
  const { activeStage, controls, metrics, selectedAsset, selectedTruck, selectedMaterial } = params;
  const selectedFocus = selectedTruck?.id ?? selectedMaterial?.name ?? selectedAsset?.label ?? STAGES.find((s) => s.id === activeStage)?.name ?? 'Field system';
  const localStage = selectedMaterial ? STAGES.find((s) => s.id === MATERIALS[selectedMaterial.id].primaryStage)?.name ?? 'Field system' : STAGES.find((s) => s.id === activeStage)?.name ?? 'Field system';
  const globalConstraint = metrics.globalConstraint;

  let localImpact = `${localStage} absorbs the selected focus through schedule confidence, handoff reliability, and production conversion.`;
  let systemImpact = `The global constraint remains ${globalConstraint}; downstream score is ${metrics.downstreamImpactScore.toFixed(0)}/100.`;
  let costImpact = `Delivered cost is ${currency(metrics.deliveredCost)}/bbl and netback impact is ${metrics.marginImpact >= 0 ? '+' : ''}${metrics.marginImpact.toFixed(2)} $/bbl.`;
  let scheduleImpact = `${metrics.scheduleDelay.toFixed(1)} days of program delay across critical handoffs.`;
  let recommendation = 'Synchronize the selected focus with the next physical handoff and publish one priority across field, logistics, and SAP release.';
  let path = ['Selected focus', 'Local operation', 'Handoff', 'Production conversion', 'Surface capacity', 'Netback'];

  if (selectedTruck) {
    localImpact = `${selectedTruck.id} is ${selectedTruck.status.toLowerCase()} with ${selectedTruck.queueMinutes} min queue and ${selectedTruck.etaMinutes} min ETA to ${selectedTruck.destination}.`;
    systemImpact = selectedTruck.material === 'sand'
      ? `Sand loads protect frac continuity first; late arrival can slip stage execution and startup timing.`
      : `${MATERIALS[selectedTruck.material].name} affects ${MATERIALS[selectedTruck.material].affectedStages.map((s) => STAGES.find((stage) => stage.id === s)?.short).join(' / ')} before it reaches system economics.`;
    costImpact = selectedTruck.material === 'casing'
      ? 'Cost exposure is rig standby, tubular expediting and stranded drilled inventory, not immediate evacuation cost.'
      : selectedTruck.material === 'sand'
        ? 'Cost exposure is frac idle time, stage loss and re-mobilization friction.'
        : selectedTruck.material === 'diesel'
          ? 'Cost exposure is pump-hour interruption, field fleet endurance and standby equipment.'
          : `Cost exposure is queue and dwell time for ${MATERIALS[selectedTruck.material].name.toLowerCase()} loads.`;
    recommendation = selectedTruck.risk > 72
      ? `Pull ${selectedTruck.id} into priority gate release, confirm SAP validation, and assign a backup load only if the receiving pad is ready for execution.`
      : `Keep ${selectedTruck.id} on the current lane and pre-clear unloading documents to protect dwell time.`;
    path = [selectedTruck.cargo, 'Gate release', 'Pad receipt', 'Execution window', 'Startup conversion', 'Margin'];
  } else if (selectedMaterial) {
    const profile = MATERIALS[selectedMaterial.id];
    localImpact =
      selectedMaterial.id === 'casing'
        ? `Casing coverage primarily affects rig cycle, wellbore handoff and drilled-well delivery. Coverage is ${selectedMaterial.coverageDays.toFixed(1)} days.`
        : selectedMaterial.id === 'sand'
          ? `Sand coverage affects frac continuity and pumping windows. Coverage is ${selectedMaterial.coverageDays.toFixed(1)} days.`
          : selectedMaterial.id === 'water'
            ? `Water availability protects hydration buffer and stage velocity. Coverage is ${selectedMaterial.coverageDays.toFixed(1)} days.`
            : selectedMaterial.id === 'diesel'
              ? `Diesel coverage supports pump hours, rig auxiliaries and field logistics endurance. Coverage is ${selectedMaterial.coverageDays.toFixed(1)} days.`
              : selectedMaterial.id === 'chemicals'
                ? `Chemicals support frac fluid program or treatment spec readiness depending on the active context.`
                : `${selectedMaterial.name} coverage is ${selectedMaterial.coverageDays.toFixed(1)} days with a projected stockout window of ${selectedMaterial.nextStockoutHours.toFixed(0)} hours.`;
    systemImpact =
      selectedMaterial.id === 'casing'
        ? `Drilling gains create value only if completion capacity and ${globalConstraint} can absorb the queue.`
        : selectedMaterial.id === 'sand'
          ? `Sand pressure affects frac continuity first, then startup timing, production forecast and battery load.`
          : `The material focus propagates through ${profile.affectedStages.map((s) => STAGES.find((stage) => stage.id === s)?.short).join(' → ')} before it reaches economics.`;
    costImpact =
      selectedMaterial.id === 'casing'
        ? 'Cost exposure is rig standby, expediting premium and loss of drilling sequence confidence.'
        : selectedMaterial.id === 'sand'
          ? 'Cost exposure is frac idle time and the loss of scheduled stages.'
          : selectedMaterial.id === 'diesel'
            ? 'Cost exposure is pump-hour interruption, standby fleet and rig support risk.'
            : selectedMaterial.id === 'water'
              ? 'Cost exposure is pumping-window disruption and re-sequencing of water transfers.'
              : `Cost exposure is replenishment and handoff friction for ${selectedMaterial.name}.`;
    recommendation =
      selectedMaterial.id === 'casing'
        ? 'Keep casing replenishment aligned with rig sequence and avoid creating stranded drilled inventory ahead of completion capacity.'
        : selectedMaterial.id === 'sand'
          ? 'Keep sand allocation locked to the next pumping window and avoid over-prioritizing pads that are not ready for stage execution.'
          : selectedMaterial.id === 'diesel'
            ? 'Allocate diesel by physical execution window: frac pumps first, rig support second, noncritical fleet last.'
            : `Re-sequence inbound ${selectedMaterial.name.toLowerCase()} orders by readiness value rather than request time.`;
    path = [selectedMaterial.name, profile.primaryStage, 'Execution continuity', 'Startup timing', globalConstraint, 'Netback'];
  } else if (metrics.globalConstraint.includes('Evacuation')) {
    localImpact = `Evacuation utilization is ${pct(metrics.evacuationUtilization, 1)} while production uplift target is ${pct(controls.productionUpliftTarget)}.`;
    systemImpact = `Treatment and trunk rights are converting upstream gains into storage pressure before they become delivered barrels.`;
    costImpact = `Delivered cost is ${currency(metrics.deliveredCost)}/bbl; margin impact is ${metrics.marginImpact >= 0 ? '+' : ''}${metrics.marginImpact.toFixed(2)} $/bbl.`;
    recommendation = 'Prioritize spec-ready batches, rebalance plant inlet nominations, and defer noncritical startup until evacuation headroom recovers.';
    path = ['Production uplift', 'Battery load', 'Treatment inlet', 'Trunk rights', 'Tank pressure', 'Netback'];
  } else if (metrics.dominantConstraint.includes('Battery')) {
    localImpact = `Battery utilization is ${pct(metrics.batteryUtilization, 1)} with constrained surge capacity.`;
    systemImpact = `Connected wells may be ready, but surface handling determines whether uplift becomes evacuated volume.`;
    costImpact = 'Cost exposure is constrained production, separator stress and potential re-routing if manifold connectivity allows.';
    recommendation = 'If manifold connectivity allows, reroute selected wells to lower-load separation capacity; otherwise defer low-margin startups.';
    path = ['Connected wells', 'Flowline pressure', 'Battery load', 'Evacuation readiness', 'Tank pressure', 'Margin'];
  }

  return {
    selectedFocus,
    localStage,
    globalConstraint,
    localImpact,
    systemImpact,
    costImpact,
    scheduleImpact,
    recommendation,
    confidence: clamp(82 + metrics.downstreamImpactScore * 0.14 - (metrics.riskLevel === 'critical' ? 2 : 0), 76, 96),
    urgency: metrics.riskLevel,
    path,
  };
}

function findPad(id: string) {
  return BASE_PADS.find((pad) => pad.id === id);
}

function findWell(id: string) {
  return BASE_WELLS.find((well) => well.id === id) ?? BASE_WELLS.find((well) => well.id.endsWith(id.slice(-3)));
}

function defaultAssetForStage(stage: StageId): SelectedAsset {
  if (stage === 'pad') return { type: 'pad', id: 'PAD-12', label: 'Pad 12 handoff' };
  if (stage === 'drilling') return { type: 'rig', id: 'R-03', label: 'Rig R-03' };
  if (stage === 'completion') return { type: 'fracSpread', id: 'FS-01', label: 'Frac Spread FS-01' };
  if (stage === 'production') return { type: 'well', id: 'PAD-22-H03', label: 'Well PAD-22-H03' };
  if (stage === 'gathering') return { type: 'battery', id: 'B-07', label: 'Battery B-07' };
  if (stage === 'treatment') return { type: 'plant', id: 'PLT-03', label: 'Central Evacuation Plant' };
  return { type: 'tank', id: 'TK-03', label: 'Tank TK-03' };
}


function MiniMetric({ label, value, tone = 'slate' }: { label: string; value: string; tone?: 'slate' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue' }) {
  const toneMap: Record<'slate' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue', string> = {
    slate: 'border-slate-200 bg-white text-slate-800',
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
  };
  return (
    <div className={`rounded-xl border px-2.5 py-2 ${toneMap[tone]}`}>
      <div className="text-[9px] font-black uppercase tracking-[0.16em] opacity-70">{label}</div>
      <div className="mt-0.5 truncate text-[12px] font-black">{value}</div>
    </div>
  );
}

function ChartPanel({ spec, data, index }: { spec: ChartSpec; data: ChartDatum[]; index: number }) {
  const colors = ['#00B5E2', '#001C2E', '#10b981', '#f59e0b'];
  const primary = colors[index % colors.length];
  const secondary = ['#94a3b8', '#8b5cf6', '#ef4444', '#06b6d4'][index % 4];
  const gradientId = `grad-${spec.title.replace(/\W/g, '')}-${index}`;

  return (
    <div className="min-h-0 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="truncate text-[12px] font-black text-slate-900">{spec.title}</div>
        <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-500">{spec.unit}</span>
      </div>
      <div className="h-[calc(100%-28px)] min-h-[112px]">
        <ResponsiveContainer width="100%" height="100%">
          {spec.type === 'bar' ? (
            <BarChart data={data} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="primary" name={spec.primary} radius={[6, 6, 0, 0]} fill={primary} />
              <Bar dataKey="demand" name={spec.secondary} radius={[6, 6, 0, 0]} fill={secondary} opacity={0.35} />
            </BarChart>
          ) : spec.type === 'line' ? (
            <ComposedChart data={data} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line dataKey="primary" name={spec.primary} stroke={primary} strokeWidth={2.4} dot={false} type="monotone" />
              <Line dataKey="secondary" name={spec.secondary} stroke={secondary} strokeWidth={1.8} dot={false} type="monotone" strokeDasharray="5 5" />
            </ComposedChart>
          ) : spec.type === 'composed' ? (
            <ComposedChart data={data} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="demand" name={spec.secondary} radius={[6, 6, 0, 0]} fill={secondary} opacity={0.24} />
              <Line dataKey="primary" name={spec.primary} stroke={primary} strokeWidth={2.5} dot={false} type="monotone" />
              <Line dataKey="tertiary" name="Constraint" stroke="#ef4444" strokeWidth={1.8} dot={false} type="monotone" />
            </ComposedChart>
          ) : (
            <AreaChart data={data} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor={primary} stopOpacity={0.34} />
                  <stop offset="95%" stopColor={primary} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area dataKey="primary" name={spec.primary} type="monotone" stroke={primary} strokeWidth={2.5} fill={`url(#${gradientId})`} />
              <Line dataKey="risk" name="Risk" stroke={secondary} strokeWidth={1.8} dot={false} type="monotone" strokeDasharray="5 5" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OperatingCanvas({
  activeStage,
  viewMode,
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
  selectedAsset,
  selectedTruck,
  selectedMaterial,
  onSelectAsset,
  onSelectTruck,
}: {
  activeStage: StageId;
  viewMode: ViewMode;
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
  selectedAsset: SelectedAsset | null;
  selectedTruck: string | null;
  selectedMaterial: MaterialId | null;
  onSelectAsset: (asset: SelectedAsset) => void;
  onSelectTruck: (truck: TruckItem) => void;
}) {
  const selected = selectedAsset?.id ?? selectedTruck;
  const visibleTrucks = trucks.filter((truck) => !selectedMaterial || truck.material === selectedMaterial).slice(0, 34);

  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_-46px_rgba(0,28,46,0.28)]">
      <div className="absolute left-4 top-3 z-10 flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-[11px] font-black text-slate-600 shadow-sm">
        <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
        {STAGES.find((stage) => stage.id === activeStage)?.name} · {viewMode}
      </div>
      <div className="absolute right-4 top-3 z-10 flex items-center gap-2 text-[11px] font-black">
        <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-slate-600">{selectedAsset?.label ?? 'field overview'}</span>
        <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-cyan-700">{metrics.trucksActive} trucks</span>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700">{metrics.wellsDelayed} delayed wells</span>
      </div>
      <svg viewBox="0 0 1000 640" className="h-full w-full">
        <defs>
          <linearGradient id="canvasBg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#eef8fc" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#001C2E" floodOpacity="0.12" />
          </filter>
        </defs>
        <rect x="0" y="0" width="1000" height="640" rx="28" fill="url(#canvasBg)" />
        {Array.from({ length: 18 }).map((_, i) => <line key={`v-${i}`} x1={40 + i * 58} y1="44" x2={40 + i * 58} y2="600" stroke="#dbe7ef" strokeWidth="1" opacity="0.6" />)}
        {Array.from({ length: 10 }).map((_, i) => <line key={`h-${i}`} x1="34" y1={64 + i * 58} x2="966" y2={64 + i * 58} stroke="#e5edf4" strokeWidth="1" opacity="0.7" />)}

        {activeStage === 'pad' && pads.slice(0, 24).map((pad, index) => {
          const x = 90 + (index % 8) * 112;
          const y = 105 + Math.floor(index / 8) * 130;
          const risk = clamp(100 - pad.readiness + metrics.scheduleDelay * 4, 0, 100);
          return (
            <g key={pad.id} onClick={() => onSelectAsset({ type: 'pad', id: pad.id, label: pad.name })} style={{ cursor: 'pointer' }}>
              <rect x={x} y={y} width="86" height="72" rx="18" fill={selected === pad.id ? '#cffafe' : '#ffffff'} stroke={risk > 70 ? '#ef4444' : risk > 45 ? '#f59e0b' : '#00B5E2'} strokeWidth="2.2" filter="url(#softShadow)" />
              <text x={x + 13} y={y + 28} fontSize="15" fontWeight="800" fill="#001C2E">{pad.id}</text>
              <rect x={x + 13} y={y + 42} width="60" height="7" rx="4" fill="#e2e8f0" />
              <rect x={x + 13} y={y + 42} width={pad.readiness * 0.6} height="7" rx="4" fill="#00B5E2" />
              <text x={x + 13} y={y + 62} fontSize="10" fontWeight="700" fill="#64748b">{pad.wells} wells · {pad.readiness.toFixed(0)}%</text>
            </g>
          );
        })}

        {activeStage === 'drilling' && rigs.slice(0, 7).map((rig, index) => {
          const x = 120 + index * 125;
          const well = wells.find((item) => item.padId === rig.padId) ?? wells[index];
          return (
            <g key={rig.id} onClick={() => onSelectAsset({ type: 'rig', id: rig.id, label: `Rig ${rig.id}` })} style={{ cursor: 'pointer' }}>
              <path d={`M${x} 152 L${x + 34} 86 L${x + 68} 152`} fill="none" stroke="#10b981" strokeWidth="5" />
              <path d={`M${x + 34} 86 L${x + 34} 260`} stroke="#64748b" strokeWidth="3" strokeDasharray="8 8" />
              <rect x={x - 12} y="150" width="92" height="44" rx="15" fill={selected === rig.id ? '#cffafe' : '#ffffff'} stroke="#10b981" strokeWidth="2.2" filter="url(#softShadow)" />
              <text x={x + 13} y="174" fontSize="16" fontWeight="900" fill="#001C2E">{rig.id}</text>
              <text x={x + 9} y="188" fontSize="10" fontWeight="700" fill="#64748b">{rig.utilization.toFixed(0)}% util.</text>
              <circle cx={x + 34} cy="260" r="8" fill="#10b981" />
              <path d={`M${x + 34} 300 C${x + 30} 350 ${x + 74} 382 ${x + 132} 405`} fill="none" stroke="#2563eb" strokeWidth="4" />
              <circle cx={x + 132} cy="405" r="6" fill="#2563eb" onClick={(event: any) => { event.stopPropagation(); onSelectAsset({ type: 'well', id: well.id, label: well.id }); }} />
              <text x={x + 18} y="432" fontSize="10" fontWeight="700" fill="#334155">{well.id.slice(-3)} · {(well.measuredDepth / 1000).toFixed(1)}km</text>
            </g>
          );
        })}
        {activeStage === 'drilling' && (
          <g>
            <rect x="655" y="82" width="170" height="72" rx="20" fill="#ffffff" stroke="#bae6fd" filter="url(#softShadow)" />
            <text x="675" y="112" fontSize="14" fontWeight="800" fill="#001C2E">Rig sequence confidence</text>
            <text x="675" y="140" fontSize="30" fontWeight="900" fill="#2563eb">{metrics.drillingScheduleConfidence.toFixed(1)}%</text>
          </g>
        )}

        {activeStage === 'completion' && (
          <g>
            <rect x="80" y="82" width="118" height="76" rx="22" fill="#ffffff" stroke="#10b981" strokeWidth="3" filter="url(#softShadow)" />
            <text x="103" y="118" fontSize="22" fontWeight="900" fill="#001C2E">{fracSpreads[0]?.id ?? "FS-01"}</text>
            <text x="103" y="142" fontSize="15" fontWeight="700" fill="#64748b">{metrics.fracStagesToday} stages</text>

            <rect x="150" y="240" width="196" height="58" rx="18" fill="#fff7ed" stroke="#fdba74" />
            <text x="172" y="264" fontSize="16" fontWeight="900" fill="#9a3412">Sand delay</text>
            <text x="172" y="287" fontSize="22" fontWeight="900" fill="#001C2E">{controls.sandDeliveryDelay.toFixed(1)}h</text>
            <rect x="150" y="390" width="196" height="58" rx="18" fill="#ecfeff" stroke="#67e8f9" />
            <text x="172" y="414" fontSize="16" fontWeight="900" fill="#0e7490">Water availability</text>
            <text x="172" y="437" fontSize="22" fontWeight="900" fill="#001C2E">{controls.waterAvailability}%</text>
            <rect x="150" y="500" width="196" height="58" rx="18" fill="#f8fafc" stroke="#cbd5e1" />
            <text x="172" y="524" fontSize="16" fontWeight="900" fill="#475569">Diesel coverage</text>
            <text x="172" y="547" fontSize="22" fontWeight="900" fill="#001C2E">{controls.dieselAvailability}%</text>

            <path d="M345 270 C470 290 525 340 596 365" stroke="#f59e0b" strokeWidth="9" strokeLinecap="round" strokeDasharray="14 18" opacity="0.45" />
            <path d="M345 420 C470 398 520 376 596 368" stroke="#00B5E2" strokeWidth="9" strokeLinecap="round" strokeDasharray="14 18" opacity="0.45" />
            <path d="M345 530 C480 465 530 398 596 372" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" strokeDasharray="13 15" opacity="0.5" />

            <rect x="585" y="315" width="220" height="116" rx="28" fill="#ffffff" stroke="#facc15" strokeWidth="3" filter="url(#softShadow)" />
            <text x="620" y="360" fontSize="23" fontWeight="900" fill="#001C2E">Active Frac Spread</text>
            <text x="637" y="385" fontSize="14" fontWeight="800" fill="#64748b">FS-01 · {metrics.fracContinuityScore.toFixed(0)}% continuity</text>
            {Array.from({ length: 12 }).map((_, i) => <circle key={`bubble-${i}`} cx={610 + i * 15} cy={398 + Math.sin(i) * 12} r={8 + (i % 3) * 3} fill={i < 8 ? '#10b981' : '#f59e0b'} opacity="0.75" />)}
            {visibleTrucks.slice(0, 22).map((truck, i) => (
              <rect key={truck.id} x={360 + (i % 11) * 36} y={260 + Math.floor(i / 11) * 24} width="18" height="11" rx="4" fill={MATERIALS[truck.material].color} opacity={truck.status === 'Delayed' ? 0.45 : 0.8} onClick={() => onSelectTruck(truck)} style={{ cursor: 'pointer' }} />
            ))}
            <path d="M510 520 C600 550 720 548 840 515" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" fill="none" />
            {Array.from({ length: 18 }).map((_, i) => <circle key={`stage-dot-${i}`} cx={530 + i * 42} cy={520 + Math.sin(i * 0.7) * 16} r="8" fill={i < Math.round(metrics.fracStagesToday / 9) ? '#0ea5e9' : '#cbd5e1'} />)}
          </g>
        )}

        {activeStage === 'production' && (
          <g>
            {pads.slice(24, 45).map((pad, index) => {
              const x = 100 + (index % 7) * 120;
              const y = 105 + Math.floor(index / 7) * 115;
              const hot = index % 6 === 0;
              return (
                <g key={pad.id} onClick={() => onSelectAsset({ type: 'pad', id: pad.id, label: pad.name })} style={{ cursor: 'pointer' }}>
                  <circle cx={x} cy={y} r="18" fill={hot ? '#fecdd3' : '#cffafe'} stroke={hot ? '#ef4444' : '#00B5E2'} strokeWidth="3" />
                  <text x={x - 22} y={y - 30} fontSize="11" fontWeight="800" fill="#334155">{pad.id}</text>
                  <path d={`M${x + 18} ${y} C${x + 45} ${y + 24} 820 285 900 325`} stroke="#7dd3fc" strokeWidth="2.5" fill="none" opacity="0.7" />
                </g>
              );
            })}
            <rect x="770" y="270" width="150" height="92" rx="24" fill="#ffffff" stroke="#00B5E2" filter="url(#softShadow)" />
            <text x="800" y="305" fontSize="16" fontWeight="900" fill="#001C2E">{compact(metrics.currentProduction)} bbl/d</text>
            <text x="800" y="328" fontSize="12" fontWeight="700" fill="#64748b">current field output</text>
          </g>
        )}

        {activeStage === 'gathering' && (
          <g>
            {pads.slice(36, 56).map((pad, index) => {
              const x = 90 + (index % 5) * 125;
              const y = 95 + Math.floor(index / 5) * 85;
              const battery = batteries[index % batteries.length];
              return (
                <g key={pad.id}>
                  <circle cx={x} cy={y} r="8" fill="#00B5E2" />
                  <path d={`M${x + 8} ${y} C${x + 70} ${y + 20} ${battery.x - 20} ${battery.y - 20} ${battery.x} ${battery.y}`} stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.55" />
                </g>
              );
            })}
            {batteries.slice(0, 8).map((battery, index) => {
              const risk = metrics.batteryUtilization > 90 && index % 2 === 0;
              return (
                <g key={battery.id} onClick={() => onSelectAsset({ type: 'battery', id: battery.id, label: battery.name })} style={{ cursor: 'pointer' }}>
                  <rect x={battery.x - 42} y={battery.y - 24} width="84" height="48" rx="18" fill="#ffffff" stroke={risk ? '#ef4444' : '#00B5E2'} strokeWidth="2.5" filter="url(#softShadow)" />
                  <text x={battery.x - 24} y={battery.y + 5} fontSize="14" fontWeight="900" fill="#001C2E">{battery.id}</text>
                </g>
              );
            })}
          </g>
        )}

        {activeStage === 'treatment' && (
          <g>
            {BASE_BATTERIES.slice(0, 5).map((battery, index) => {
              const plant = plants[index % plants.length];
              return <path key={battery.id} d={`M${90 + index * 110} 410 C${220 + index * 50} 360 ${plant.x - 40} ${plant.y + 30} ${plant.x} ${plant.y}`} stroke="#94a3b8" strokeWidth="3" fill="none" opacity="0.5" />;
            })}
            {plants.map((plant) => (
              <g key={plant.id} onClick={() => onSelectAsset({ type: 'plant', id: plant.id, label: plant.name })} style={{ cursor: 'pointer' }}>
                <rect x={plant.x - 78} y={plant.y - 36} width="156" height="72" rx="22" fill="#ffffff" stroke={metrics.evacuationUtilization > 96 ? '#ef4444' : '#00B5E2'} strokeWidth="2.5" filter="url(#softShadow)" />
                <text x={plant.x - 54} y={plant.y - 4} fontSize="14" fontWeight="900" fill="#001C2E">{plant.name}</text>
                <text x={plant.x - 54} y={plant.y + 18} fontSize="11" fontWeight="700" fill="#64748b">{pct(metrics.evacuationUtilization, 1)} evacuation</text>
              </g>
            ))}
            <path d="M120 500 L900 500" stroke="#f59e0b" strokeWidth="6" strokeDasharray="18 12" />
            <text x="735" y="486" fontSize="13" fontWeight="900" fill="#92400e">trunk / nominations</text>
          </g>
        )}

        {activeStage === 'storage' && (
          <g>
            {tanks.map((tank) => {
              const ratio = tank.fillKbbl / tank.capacityKbbl;
              return (
                <g key={tank.id} onClick={() => onSelectAsset({ type: 'tank', id: tank.id, label: tank.name })} style={{ cursor: 'pointer' }}>
                  <rect x={tank.x - 36} y={tank.y - 48} width="72" height="112" rx="24" fill="#ffffff" stroke={ratio > 0.82 ? '#ef4444' : '#00B5E2'} strokeWidth="2.5" filter="url(#softShadow)" />
                  <rect x={tank.x - 24} y={tank.y + 48 - ratio * 86} width="48" height={ratio * 86} rx="16" fill="#7dd3fc" opacity="0.8" />
                  <text x={tank.x - 26} y={tank.y - 18} fontSize="13" fontWeight="900" fill="#001C2E">{tank.id}</text>
                  <text x={tank.x - 24} y={tank.y + 78} fontSize="10" fontWeight="700" fill="#475569">{tank.destination}</text>
                </g>
              );
            })}
            <path d="M96 520 L930 520" stroke="#00B5E2" strokeWidth="5" />
            <circle cx="900" cy="520" r="22" fill="#ffffff" stroke="#001C2E" strokeWidth="3" />
            <text x="887" y="525" fontSize="12" fontWeight="900" fill="#001C2E">OFF</text>
          </g>
        )}
      </svg>
    </div>
  );
}

function LogisticsView({
  trucks,
  selectedMaterial,
  metrics,
  onSelectTruck,
  onSelectMaterial,
}: {
  trucks: TruckItem[];
  selectedMaterial: MaterialId | null;
  metrics: SystemMetrics;
  onSelectTruck: (truck: TruckItem) => void;
  onSelectMaterial: (material: MaterialId) => void;
}) {
  const visible = selectedMaterial ? trucks.filter((truck) => truck.material === selectedMaterial) : trucks;
  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_260px] gap-3 overflow-hidden">
      <div className="min-h-0 rounded-3xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">logistics control tower</div>
            <div className="text-lg font-black text-[#001C2E]">{metrics.trucksActive} active movements · {metrics.queuedTrucks} queued · {metrics.delayedTrucks} delayed</div>
          </div>
          <Route className="h-5 w-5 text-cyan-600" />
        </div>
        <div className="grid h-[calc(100%-56px)] grid-rows-7 gap-2">
          {Array.from({ length: 7 }, (_, route) => {
            const lane = visible.filter((truck) => truck.route === route).slice(0, 38);
            return (
              <div key={route} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-2">
                <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  <span>lane {route + 1}</span>
                  <span>{lane.length} loads</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {lane.map((truck) => (
                    <button key={truck.id} type="button" onClick={() => onSelectTruck(truck)} className="h-2.5 w-5 rounded-full" style={{ background: MATERIALS[truck.material].color, opacity: truck.status === 'Delayed' ? 0.45 : 0.95 }} title={`${truck.id} ${truck.cargo}`} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-3">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">material lens</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(Object.keys(MATERIALS) as MaterialId[]).map((id) => {
              const Icon = MATERIALS[id].icon;
              const active = selectedMaterial === id;
              return (
                <button key={id} type="button" onClick={() => onSelectMaterial(id)} className={`rounded-2xl border p-2 ${active ? 'border-[#001C2E] bg-[#001C2E] text-white' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                  <Icon className="mx-auto h-4 w-4" />
                  <div className="mt-1 truncate text-[9px] font-black uppercase">{MATERIALS[id].name}</div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="min-h-0 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-3">
          <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">priority queue</div>
          <div className="space-y-2">
            {visible.slice().sort((a, b) => b.risk - a.risk).slice(0, 12).map((truck) => (
              <button key={truck.id} type="button" onClick={() => onSelectTruck(truck)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:border-cyan-200">
                <div>
                  <div className="text-xs font-black text-slate-900">{truck.id} · {truck.cargo}</div>
                  <div className="text-[10px] font-semibold text-slate-500">{truck.origin} → {truck.destination}</div>
                </div>
                <div className="text-right text-[10px] font-black text-slate-500">
                  <div>{truck.etaMinutes}m ETA</div>
                  <div>{truck.status}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryView({
  inventory,
  selectedMaterial,
  onSelectMaterial,
}: {
  inventory: InventoryItem[];
  selectedMaterial: MaterialId | null;
  onSelectMaterial: (material: MaterialId) => void;
}) {
  return (
    <div className="grid h-full min-h-0 grid-cols-3 gap-3 overflow-hidden">
      {inventory.map((item) => {
        const Icon = item.icon;
        const active = selectedMaterial === item.id;
        const risk = riskFromScore(item.risk);
        return (
          <button key={item.id} type="button" onClick={() => onSelectMaterial(item.id)} className={`rounded-3xl border p-4 text-left transition hover:border-cyan-200 ${active ? 'border-[#001C2E] bg-[#001C2E] text-white' : 'border-slate-200 bg-white text-slate-900'}`}>
            <div className="flex items-start justify-between">
              <div className={`rounded-2xl p-2 ${active ? 'bg-white/10' : 'bg-slate-50'}`}><Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-cyan-700'}`} /></div>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${active ? 'border-white/20 bg-white/10 text-white' : `${toneClasses[risk].border} ${toneClasses[risk].bg} ${toneClasses[risk].text}`}`}>{risk}</span>
            </div>
            <div className="mt-3 text-lg font-black">{item.name}</div>
            <div className={`text-xs font-semibold ${active ? 'text-white/70' : 'text-slate-500'}`}>{item.description}</div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div><div className={`text-[9px] font-black uppercase tracking-[0.18em] ${active ? 'text-white/50' : 'text-slate-400'}`}>stock</div><div className="text-sm font-black">{compact(item.stock)} {item.unit}</div></div>
              <div><div className={`text-[9px] font-black uppercase tracking-[0.18em] ${active ? 'text-white/50' : 'text-slate-400'}`}>coverage</div><div className="text-sm font-black">{item.coverageDays.toFixed(1)}d</div></div>
              <div><div className={`text-[9px] font-black uppercase tracking-[0.18em] ${active ? 'text-white/50' : 'text-slate-400'}`}>inbound</div><div className="text-sm font-black">+{compact(item.inbound)}</div></div>
              <div><div className={`text-[9px] font-black uppercase tracking-[0.18em] ${active ? 'text-white/50' : 'text-slate-400'}`}>stockout</div><div className="text-sm font-black">{item.nextStockoutHours}h</div></div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function AnalyticsView({ activeStage, selectedTimeRange, onTimeRangeChange, chartData }: { activeStage: StageId; selectedTimeRange: TimeRange; onTimeRangeChange: (range: TimeRange) => void; chartData: ChartDatum[] }) {
  const specs = chartSpecs(activeStage);
  return (
    <div className="grid h-full min-h-0 grid-rows-[42px_minmax(0,1fr)] gap-3 overflow-hidden">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-black text-[#001C2E]">
          <BarChart3 className="h-4 w-4 text-cyan-600" /> {STAGES.find((s) => s.id === activeStage)?.name} analytics
        </div>
        <div className="flex gap-1 rounded-2xl bg-slate-50 p-1">
          {rangeOptions.map((range) => (
            <button key={range} type="button" onClick={() => onTimeRangeChange(range)} className={`rounded-xl px-3 py-1.5 text-[11px] font-black ${selectedTimeRange === range ? 'bg-[#001C2E] text-white' : 'text-slate-500 hover:bg-white'}`}>{range}</button>
          ))}
        </div>
      </div>
      <div className="grid min-h-0 grid-cols-2 gap-3">
        {specs.map((spec, index) => <ChartPanel key={spec.title} spec={spec} data={chartData} index={index} />)}
      </div>
    </div>
  );
}

function ImpactPanel({ ai }: { ai: AiRecommendation }) {
  const tone = toneClasses[ai.urgency];
  return (
    <div className="space-y-3">
      <div className={`rounded-2xl border p-3 ${tone.border} ${tone.bg}`}>
        <div className="flex items-center justify-between gap-2">
          <div className={`text-[10px] font-black uppercase tracking-[0.18em] ${tone.text}`}>system consequence engine</div>
          <div className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-black text-slate-700">{ai.confidence.toFixed(0)}% confidence</div>
        </div>
        <div className="mt-2 text-lg font-black text-[#001C2E]">Focus: {ai.selectedFocus}</div>
        <div className="text-xs font-bold text-slate-600">Local stage: {ai.localStage}</div>
        <div className="text-xs font-bold text-slate-600">Global constraint: {ai.globalConstraint}</div>
      </div>
      {[
        ['Local impact', ai.localImpact],
        ['System impact', ai.systemImpact],
        ['Cost exposure', ai.costImpact],
        ['Schedule impact', ai.scheduleImpact],
      ].map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</div>
          <div className="mt-1 text-[13px] font-bold leading-relaxed text-slate-800">{value}</div>
        </div>
      ))}
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-600">recommended action</div>
        <div className="mt-1 text-[13px] font-black leading-relaxed text-slate-900">{ai.recommendation}</div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">operational path</div>
        <div className="flex flex-wrap gap-2">
          {ai.path.map((step, index) => (
            <React.Fragment key={`${step}-${index}`}>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black text-slate-600">{step}</span>
              {index < ai.path.length - 1 ? <ChevronRight className="h-4 w-4 text-slate-300" /> : null}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ selectedAsset, selectedTruck, selectedMaterial, metrics }: { selectedAsset: SelectedAsset | null; selectedTruck: TruckItem | null; selectedMaterial: InventoryItem | null; metrics: SystemMetrics }) {
  const title = selectedTruck?.id ?? selectedMaterial?.name ?? selectedAsset?.label ?? 'Field system';
  const subtitle = selectedTruck
    ? `${selectedTruck.contractor} · ${selectedTruck.cargo} · ${selectedTruck.origin} → ${selectedTruck.destination}`
    : selectedMaterial
      ? `${selectedMaterial.coverageDays.toFixed(1)} days coverage · ${selectedMaterial.dependentPads.length} dependent pads`
      : selectedAsset
        ? `${selectedAsset.type} · ${selectedAsset.id}`
        : 'No single asset selected. The whole system is active.';
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">selected operating detail</div>
        <div className="mt-1 text-xl font-black text-[#001C2E]">{title}</div>
        <div className="text-xs font-semibold text-slate-500">{subtitle}</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MiniMetric label="risk" value={metrics.bottleneckSeverity.toFixed(0)} tone={metrics.bottleneckSeverity > 76 ? 'rose' : metrics.bottleneckSeverity > 52 ? 'amber' : 'cyan'} />
        <MiniMetric label="delay" value={`${metrics.scheduleDelay.toFixed(1)}d`} tone={metrics.scheduleDelay > 3 ? 'amber' : 'slate'} />
        <MiniMetric label="netback" value={`${metrics.marginImpact >= 0 ? '+' : ''}${metrics.marginImpact.toFixed(2)}`} tone={metrics.marginImpact >= 0 ? 'emerald' : 'rose'} />
      </div>
      {selectedMaterial ? (
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">linked inventory</div>
              <div className="text-sm font-black text-slate-900">{selectedMaterial.name}</div>
            </div>
            <span className="rounded-xl bg-white px-2 py-1 text-[10px] font-black text-cyan-700">{selectedMaterial.coverageDays.toFixed(1)} days</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-cyan-500" style={{ width: `${clamp(selectedMaterial.coverageDays * 10, 5, 100)}%` }} />
          </div>
        </div>
      ) : null}
      {selectedTruck ? (
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
          <div className="rounded-xl bg-slate-50 p-2">ETA {selectedTruck.etaMinutes} min</div>
          <div className="rounded-xl bg-slate-50 p-2">Queue {selectedTruck.queueMinutes} min</div>
          <div className="rounded-xl bg-slate-50 p-2">Order {selectedTruck.orderStatus}</div>
          <div className="rounded-xl bg-slate-50 p-2">Cargo {selectedTruck.quantity} {selectedTruck.unit}</div>
        </div>
      ) : null}
    </div>
  );
}

function EventPanel({ events, onEventClick }: { events: EventItem[]; onEventClick: (event: EventItem) => void }) {
  return (
    <div className="space-y-2">
      {events.map((event) => {
        const tone = toneClasses[event.severity];
        const Icon = STAGES.find((stage) => stage.id === event.stage)?.icon ?? Activity;
        return (
          <button key={event.id} type="button" onClick={() => onEventClick(event)} className="flex w-full gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left hover:border-cyan-200">
            <div className={`rounded-xl border p-2 ${tone.bg} ${tone.border}`}>
              <Icon className={`h-4 w-4 ${tone.text}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-black text-slate-900">{event.title}</div>
                <div className="text-[10px] font-black text-slate-400">{event.minutesAgo}m</div>
              </div>
              <div className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">{event.detail}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function WhatIfPanel({ controls, activeScenario, metrics, onControlChange, onReset }: { controls: WhatIfControls; activeScenario: ScenarioId; metrics: SystemMetrics; onControlChange: (key: keyof WhatIfControls, value: number) => void; onReset: () => void }) {
  const sliders: Array<{ key: keyof WhatIfControls; label: string; min: number; max: number; step: number; suffix: string }> = [
    { key: 'sandDeliveryDelay', label: 'Sand delivery delay', min: 0, max: 6, step: 0.1, suffix: 'h' },
    { key: 'waterAvailability', label: 'Water availability', min: 60, max: 115, step: 1, suffix: '%' },
    { key: 'dieselAvailability', label: 'Diesel availability', min: 60, max: 115, step: 1, suffix: '%' },
    { key: 'rigEfficiency', label: 'Rig efficiency', min: 70, max: 115, step: 1, suffix: '%' },
    { key: 'fracSpreadProductivity', label: 'Frac productivity', min: 65, max: 115, step: 1, suffix: '%' },
    { key: 'truckCongestion', label: 'Truck congestion', min: 0, max: 100, step: 1, suffix: '%' },
    { key: 'batteryCapacityConstraint', label: 'Battery constraint', min: 0, max: 40, step: 1, suffix: '%' },
    { key: 'evacuationCapacity', label: 'Evacuation capacity', min: 60, max: 120, step: 1, suffix: '%' },
    { key: 'productionUpliftTarget', label: 'Production uplift target', min: 0, max: 30, step: 1, suffix: '%' },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">what-if console</div>
          <div className="text-xs font-semibold text-slate-500">Scenario: {SCENARIOS[activeScenario].label}</div>
        </div>
        <button type="button" onClick={onReset} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black text-slate-600">Reset</button>
      </div>
      {sliders.map((slider) => {
        const value = controls[slider.key];
        const pctValue = ((Number(value) - slider.min) / (slider.max - slider.min)) * 100;
        return (
          <div key={slider.key} className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-black text-slate-800">{slider.label}</div>
              <div className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-black text-cyan-700">{value}{slider.suffix}</div>
            </div>
            <input type="range" min={slider.min} max={slider.max} step={slider.step} value={value} onChange={(event: any) => onControlChange(slider.key, Number(event.target.value))} className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-cyan-600" style={{ background: `linear-gradient(90deg, #00B5E2 ${pctValue}%, #e2e8f0 ${pctValue}%)` }} />
          </div>
        );
      })}
      <div className="grid grid-cols-3 gap-2">
        <MiniMetric label="risk" value={metrics.bottleneckSeverity.toFixed(0)} tone={metrics.bottleneckSeverity > 76 ? 'rose' : 'amber'} />
        <MiniMetric label="delay" value={`${metrics.scheduleDelay.toFixed(1)}d`} tone="amber" />
        <MiniMetric label="netback" value={`${metrics.marginImpact >= 0 ? '+' : ''}${metrics.marginImpact.toFixed(2)}`} tone={metrics.marginImpact >= 0 ? 'emerald' : 'rose'} />
      </div>
    </div>
  );
}

function MetricsPanel({ metrics }: { metrics: SystemMetrics }) {
  const rows: Array<{ label: string; value: string; tone: 'slate' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue' }> = [
    { label: 'logistics intensity', value: pct(clamp(metrics.trucksActive / 4 + metrics.truckQueueTime * 7, 0, 100), 0), tone: metrics.truckQueueTime > 4 ? 'rose' : metrics.truckQueueTime > 2 ? 'amber' : 'cyan' },
    { label: 'inventory stress', value: pct(metrics.inventoryRisk, 0), tone: metrics.inventoryRisk > 75 ? 'rose' : metrics.inventoryRisk > 52 ? 'amber' : 'cyan' },
    { label: 'production delta', value: `${metrics.productionDelta >= 0 ? '+' : ''}${compact(metrics.productionDelta)} bbl/d`, tone: metrics.productionDelta >= 0 ? 'emerald' : 'rose' },
    { label: 'schedule delay', value: `${metrics.scheduleDelay.toFixed(1)}d`, tone: metrics.scheduleDelay > 3 ? 'amber' : 'slate' },
    { label: 'bottleneck severity', value: pct(metrics.bottleneckSeverity, 0), tone: metrics.bottleneckSeverity > 76 ? 'rose' : 'amber' },
    { label: 'capital efficiency', value: pct(metrics.capitalEfficiency, 1), tone: metrics.capitalEfficiency > 90 ? 'emerald' : 'cyan' },
  ];
  return <div className="grid grid-cols-2 gap-2">{rows.map((row) => <MiniMetric key={row.label} label={row.label} value={row.value} tone={row.tone} />)}</div>;
}

function StageTimeline({ stageStates, activeStage, onStageClick }: { stageStates: Array<StageDefinition & { risk: number; progress: number; liveMetric: string }>; activeStage: StageId; onStageClick: (stage: StageId) => void }) {
  return (
    <div className="grid h-full grid-cols-7 gap-2">
      {stageStates.map((stage, index) => {
        const Icon = stage.icon;
        const risk = riskFromScore(stage.risk);
        const active = activeStage === stage.id;
        return (
          <button key={stage.id} type="button" onClick={() => onStageClick(stage.id)} className={`relative overflow-hidden rounded-2xl border p-3 text-left transition ${active ? 'border-[#001C2E] bg-[#001C2E] text-white shadow-md' : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-200'}`}>
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-2 ${active ? 'bg-white/10' : toneClasses[risk].bg}`}>
                <Icon className={`h-4 w-4 ${active ? 'text-white' : toneClasses[risk].text}`} />
              </div>
              <span className={`text-[10px] font-black ${active ? 'text-white/60' : 'text-slate-300'}`}>0{index + 1}</span>
            </div>
            <div className="mt-2 text-[13px] font-black">{stage.short}</div>
            <div className={`truncate text-[11px] font-semibold ${active ? 'text-white/70' : 'text-slate-500'}`}>{stage.liveMetric}</div>
            <div className={`mt-2 h-1.5 rounded-full ${active ? 'bg-white/20' : 'bg-slate-100'}`}>
              <div className={`h-1.5 rounded-full bg-gradient-to-r ${active ? 'from-white to-cyan-200' : toneClasses[risk].fill}`} style={{ width: `${stage.progress}%` }} />
            </div>
          </button>
        );
      })}
    </div>
  );
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
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>('command');
  const [activeContextPanel, setActiveContextPanel] = useState<ContextPanel>('impact');

  useEffect(() => {
    const interval = window.setInterval(() => setSimulationTick((tick) => (tick + 1) % 10000), 4200);
    return () => window.clearInterval(interval);
  }, []);

  const metrics = useMemo(() => calculateSystemMetrics(whatIfControls, activeScenario, simulationTick), [whatIfControls, activeScenario, simulationTick]);
  const rigs = useMemo(() => generateRigs(BASE_PADS, whatIfControls), [whatIfControls]);
  const fracSpreads = useMemo(() => generateFracSpreads(BASE_WELLS, whatIfControls), [whatIfControls]);
  const inventory = useMemo(() => createInventory(whatIfControls, metrics), [whatIfControls, metrics]);
  const trucks = useMemo(() => generateTrucks(whatIfControls, metrics, simulationTick), [whatIfControls, metrics, simulationTick]);
  const selectedTruckObject = useMemo(() => trucks.find((truck) => truck.id === selectedTruck) ?? null, [trucks, selectedTruck]);
  const selectedMaterialObject = useMemo(() => inventory.find((item) => item.id === selectedMaterial) ?? null, [inventory, selectedMaterial]);
  const analyticsStage = selectedTruckObject ? MATERIALS[selectedTruckObject.material].primaryStage : selectedMaterial ? MATERIALS[selectedMaterial].primaryStage : activeStage;
  const chartData = useMemo(() => createChartData(analyticsStage, selectedTimeRange, metrics, whatIfControls, simulationTick), [analyticsStage, selectedTimeRange, metrics, whatIfControls, simulationTick]);
  const events = useMemo(() => createEvents(metrics, whatIfControls, simulationTick), [metrics, whatIfControls, simulationTick]);

  const stageStates = useMemo(
    () => STAGES.map((stage) => {
      const risk =
        stage.id === 'pad' ? 100 - metrics.scheduleConfidence + Math.max(0, 95 - whatIfControls.dieselAvailability) * 0.4 :
        stage.id === 'drilling' ? 100 - metrics.drillingScheduleConfidence :
        stage.id === 'completion' ? metrics.fracContinuityRisk :
        stage.id === 'production' ? Math.max(0, 100 - (metrics.currentProduction / metrics.forecastProduction) * 100) + metrics.scheduleDelay * 6 :
        stage.id === 'gathering' ? metrics.batteryUtilization :
        stage.id === 'treatment' ? metrics.evacuationUtilization :
        metrics.storagePressure;
      const liveMetric =
        stage.id === 'pad' ? `${metrics.padsActive} pads` :
        stage.id === 'drilling' ? `${metrics.wellsDrilling} drilling` :
        stage.id === 'completion' ? `${metrics.fracStagesToday} stages` :
        stage.id === 'production' ? `${compact(metrics.currentProduction)} bbl/d` :
        stage.id === 'gathering' ? `${pct(metrics.batteryUtilization, 0)} load` :
        stage.id === 'treatment' ? `${pct(metrics.evacuationUtilization, 0)} util.` :
        `${pct(metrics.storagePressure, 0)} tank`;
      const progress = clamp(100 - risk * 0.7, 12, 96);
      return { ...stage, risk, progress, liveMetric };
    }),
    [metrics, whatIfControls.dieselAvailability],
  );

  const ai = useMemo(
    () => deriveAIRecommendation({ activeStage, controls: whatIfControls, metrics, selectedAsset, selectedTruck: selectedTruckObject, selectedMaterial: activeStage === 'treatment' || activeStage === 'storage' ? null : selectedMaterialObject, scenario: activeScenario }),
    [activeStage, whatIfControls, metrics, selectedAsset, selectedTruckObject, selectedMaterialObject, activeScenario],
  );

  const workspaceDefaults: Record<WorkspaceId, ContextPanel> = { command: 'impact', logistics: 'detail', inventory: 'detail', network: 'detail', performance: 'metrics' };
  useEffect(() => setActiveContextPanel(workspaceDefaults[activeWorkspace]), [activeWorkspace]);

  const stageDefaultMaterial = (stage: StageId): MaterialId | null => {
    if (stage === 'pad') return 'diesel';
    if (stage === 'drilling') return 'casing';
    if (stage === 'completion') return 'sand';
    if (stage === 'production') return 'tubing';
    if (stage === 'gathering') return 'spares';
    return null;
  };

  const syncWorkspaceForStage = (stage: StageId): WorkspaceId => {
    if (stage === 'completion') return 'command';
    if (stage === 'pad' || stage === 'drilling' || stage === 'gathering') return 'network';
    return 'performance';
  };

  const handleScenarioChange = (scenario: ScenarioId) => {
    setActiveScenario(scenario);
    setWhatIfControls(getScenarioControls(scenario));
    setSelectedTruck(null);
    if (scenario === 'sandDelay') {
      setActiveStage('completion'); setSelectedMaterial('sand'); setSelectedAsset({ type: 'fracSpread', id: 'FS-01', label: 'Frac Spread FS-01' }); setSelectedViewMode('Constraint Lens'); setActiveWorkspace('logistics'); return;
    }
    if (scenario === 'batteryConstraint') {
      setActiveStage('gathering'); setSelectedMaterial('spares'); setSelectedAsset({ type: 'battery', id: 'B-07', label: 'Battery B-07' }); setSelectedViewMode('Constraint Lens'); setActiveWorkspace('network'); return;
    }
    if (scenario === 'evacuationConstraint') {
      setActiveStage('treatment'); setSelectedMaterial(null); setSelectedAsset({ type: 'plant', id: 'PLT-03', label: 'Central Evacuation Plant' }); setSelectedViewMode('Margin Lens'); setActiveWorkspace('performance'); return;
    }
    if (scenario === 'optimizationRecovery') {
      setActiveStage('storage'); setSelectedMaterial(null); setSelectedAsset({ type: 'tank', id: 'TK-03', label: 'Tank TK-03' }); setSelectedViewMode('Margin Lens'); setActiveWorkspace('performance'); return;
    }
    setActiveStage('completion'); setSelectedMaterial('sand'); setSelectedAsset(defaultAssetForStage('completion')); setSelectedViewMode('Digital Twin'); setActiveWorkspace('command');
  };

  const handleStageClick = (stage: StageId) => {
    setActiveStage(stage);
    setSelectedTruck(null);
    setSelectedMaterial(stageDefaultMaterial(stage));
    setSelectedAsset(defaultAssetForStage(stage));
    setActiveWorkspace(syncWorkspaceForStage(stage));
  };

  const handleSelectAsset = (asset: SelectedAsset) => {
    setSelectedAsset(asset);
    setSelectedTruck(null);
    if (asset.type === 'battery') { setActiveStage('gathering'); setSelectedMaterial('spares'); setActiveWorkspace('network'); }
    else if (asset.type === 'plant') { setActiveStage('treatment'); setSelectedMaterial(null); setActiveWorkspace('performance'); }
    else if (asset.type === 'tank') { setActiveStage('storage'); setSelectedMaterial(null); setActiveWorkspace('performance'); }
    else if (asset.type === 'rig') { setActiveStage('drilling'); setSelectedMaterial('casing'); setActiveWorkspace('network'); }
    else if (asset.type === 'fracSpread') { setActiveStage('completion'); setSelectedMaterial('sand'); setActiveWorkspace('command'); }
    else if (asset.type === 'well') { const next = findWell(asset.id)?.state === 'completion' ? 'completion' : 'production'; setActiveStage(next); setSelectedMaterial(next === 'completion' ? 'sand' : 'tubing'); setActiveWorkspace(syncWorkspaceForStage(next)); }
    setActiveContextPanel('detail');
  };

  const handleSelectTruck = (truck: TruckItem) => {
    setSelectedTruck(truck.id);
    setSelectedMaterial(truck.material);
    setSelectedAsset({ type: 'pad', id: truck.linkedPad, label: truck.destination });
    setActiveStage(MATERIALS[truck.material].primaryStage);
    setSelectedViewMode('Constraint Lens');
    setActiveWorkspace('logistics');
    setActiveContextPanel('detail');
  };

  const handleSelectMaterial = (material: MaterialId, source: 'inventory' | 'logistics' | 'event' | 'generic' = 'generic') => {
    const item = inventory.find((entry) => entry.id === material);
    setSelectedMaterial(material);
    setSelectedTruck(null);
    setActiveStage(MATERIALS[material].primaryStage);
    setSelectedViewMode(material === 'sand' || material === 'water' || material === 'diesel' ? 'Constraint Lens' : 'Digital Twin');
    setSelectedAsset(item?.dependentPads[0] ? { type: 'pad', id: item.dependentPads[0], label: findPad(item.dependentPads[0])?.name ?? item.dependentPads[0] } : defaultAssetForStage(MATERIALS[material].primaryStage));
    setActiveWorkspace(source === 'logistics' ? 'logistics' : source === 'event' ? syncWorkspaceForStage(MATERIALS[material].primaryStage) : 'inventory');
    setActiveContextPanel(source === 'event' ? 'events' : 'detail');
  };

  const handleKpiClick = (id: string) => {
    setSelectedTruck(null);
    setSelectedAsset({ type: 'kpi', id, label: id });
    if (id === 'inventory') {
      const highest = inventory.slice().sort((a, b) => b.risk - a.risk)[0];
      handleSelectMaterial(highest.id, 'inventory');
    } else if (id === 'trucks' || id === 'completion') {
      setActiveStage('completion'); setSelectedMaterial('sand'); setSelectedViewMode('Constraint Lens'); setActiveWorkspace('logistics'); setActiveContextPanel('impact');
    } else if (id === 'drilling') {
      setActiveStage('drilling'); setSelectedMaterial('casing'); setActiveWorkspace('network'); setActiveContextPanel('detail');
    } else if (id === 'battery') {
      setActiveStage('gathering'); setSelectedMaterial('spares'); setActiveWorkspace('network'); setActiveContextPanel('metrics');
    } else if (id === 'evacuation' || id === 'margin') {
      setActiveStage(id === 'margin' ? 'storage' : 'treatment'); setSelectedMaterial(null); setSelectedViewMode('Margin Lens'); setActiveWorkspace('performance'); setActiveContextPanel('impact');
    } else if (id === 'online') {
      setActiveStage('production'); setSelectedMaterial('tubing'); setActiveWorkspace('performance'); setActiveContextPanel('metrics');
    }
  };

  const handleEventClick = (event: EventItem) => {
    setActiveStage(event.stage);
    setSelectedTruck(null);
    setActiveWorkspace(syncWorkspaceForStage(event.stage));
    setActiveContextPanel('events');
    if (event.targetType === 'material') { handleSelectMaterial(event.targetId as MaterialId, 'event'); return; }
    if (event.targetType === 'truck') { const truck = trucks.find((entry) => entry.id === event.targetId); if (truck) handleSelectTruck(truck); return; }
    setSelectedAsset({ type: event.targetType, id: event.targetId, label: event.title });
  };

  const handleControlChange = (key: keyof WhatIfControls, value: number) => {
    setWhatIfControls((previous) => ({ ...previous, [key]: value }));
    if (key === 'sandDeliveryDelay' || key === 'waterAvailability' || key === 'truckCongestion') { setActiveStage('completion'); setSelectedMaterial(key === 'waterAvailability' ? 'water' : 'sand'); setSelectedViewMode('Constraint Lens'); setActiveWorkspace('logistics'); setActiveContextPanel('impact'); }
    else if (key === 'dieselAvailability') { setActiveStage('pad'); setSelectedMaterial('diesel'); setSelectedViewMode('Constraint Lens'); setActiveWorkspace('inventory'); setActiveContextPanel('impact'); }
    else if (key === 'batteryCapacityConstraint') { setActiveStage('gathering'); setSelectedMaterial('spares'); setSelectedViewMode('Constraint Lens'); setActiveWorkspace('network'); setActiveContextPanel('metrics'); }
    else if (key === 'evacuationCapacity' || key === 'productionUpliftTarget') { setActiveStage(key === 'evacuationCapacity' ? 'treatment' : 'production'); setSelectedMaterial(key === 'evacuationCapacity' ? null : 'tubing'); setSelectedViewMode('Margin Lens'); setActiveWorkspace('performance'); setActiveContextPanel('impact'); }
    else if (key === 'rigEfficiency') { setActiveStage('drilling'); setSelectedMaterial('casing'); setActiveWorkspace('network'); setActiveContextPanel('detail'); }
    else if (key === 'fracSpreadProductivity') { setActiveStage('completion'); setSelectedMaterial('sand'); setActiveWorkspace('command'); setActiveContextPanel('impact'); }
  };

  const navItems: Array<{ id: WorkspaceId; label: string; icon: LucideIcon }> = [
    { id: 'command', label: 'Command', icon: Cpu },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'network', label: 'Network', icon: GitBranch },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
  ];
  const contextButtons: Array<{ id: ContextPanel; label: string; icon: LucideIcon }> = [
    { id: 'impact', label: 'Impact', icon: BrainCircuit },
    { id: 'detail', label: 'Detail', icon: Layers },
    { id: 'events', label: 'Events', icon: Clock3 },
    { id: 'whatIf', label: 'What-if', icon: SlidersHorizontal },
    { id: 'metrics', label: 'Metrics', icon: Gauge },
  ];

  const activeWorkspaceLabel = navItems.find((item) => item.id === activeWorkspace)?.label ?? 'Command';
  const activeStageDef = STAGES.find((stage) => stage.id === activeStage)!;
  const activeEvents = events.slice(0, 6);
  const kpis = [
    { id: 'online', label: 'Wells online', value: metrics.wellsOnline.toFixed(0), sub: `${compact(metrics.currentProduction)} bbl/d`, risk: riskFromScore(metrics.wellsDelayed * 0.9) },
    { id: 'drilling', label: 'Drilling', value: metrics.wellsDrilling.toFixed(0), sub: `${pct(metrics.drillingScheduleConfidence, 0)} confidence`, risk: riskFromScore(100 - metrics.drillingScheduleConfidence) },
    { id: 'completion', label: 'Frac stages', value: metrics.fracStagesToday.toFixed(0), sub: `${metrics.wellsCompletion} wells`, risk: riskFromScore(metrics.fracContinuityRisk) },
    { id: 'trucks', label: 'Trucks', value: metrics.trucksActive.toFixed(0), sub: `${metrics.queuedTrucks} queued`, risk: riskFromScore(metrics.truckQueueTime * 12) },
    { id: 'inventory', label: 'Inventory', value: pct(metrics.inventoryRisk, 0), sub: `${metrics.inventoryCoverageDays.toFixed(1)} days`, risk: riskFromScore(metrics.inventoryRisk) },
    { id: 'battery', label: 'Battery', value: pct(metrics.batteryUtilization, 0), sub: 'surface load', risk: riskFromScore(metrics.batteryUtilization) },
    { id: 'evacuation', label: 'Evacuation', value: pct(metrics.evacuationUtilization, 0), sub: 'trunk load', risk: riskFromScore(metrics.evacuationUtilization) },
    { id: 'margin', label: 'Netback', value: `${metrics.marginImpact >= 0 ? '+' : ''}${metrics.marginImpact.toFixed(2)}`, sub: `$${metrics.deliveredCost.toFixed(2)}/bbl`, risk: riskFromScore(Math.abs(metrics.marginImpact) * 18 + metrics.bottleneckSeverity * 0.25) },
  ];

  const centerModule =
    activeWorkspace === 'logistics' ? (
      <LogisticsView trucks={trucks} selectedMaterial={selectedMaterial} metrics={metrics} onSelectTruck={handleSelectTruck} onSelectMaterial={(material) => handleSelectMaterial(material, 'logistics')} />
    ) : activeWorkspace === 'inventory' ? (
      <InventoryView inventory={inventory} selectedMaterial={selectedMaterial} onSelectMaterial={(material) => handleSelectMaterial(material, 'inventory')} />
    ) : activeWorkspace === 'performance' ? (
      <AnalyticsView activeStage={analyticsStage} selectedTimeRange={selectedTimeRange} onTimeRangeChange={setSelectedTimeRange} chartData={chartData} />
    ) : (
      <OperatingCanvas
        activeStage={activeStage}
        viewMode={selectedViewMode}
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
        selectedAsset={selectedAsset}
        selectedTruck={selectedTruck}
        selectedMaterial={selectedMaterial}
        onSelectAsset={handleSelectAsset}
        onSelectTruck={handleSelectTruck}
      />
    );

  const contextPanel =
    activeContextPanel === 'detail' ? (
      <DetailPanel selectedAsset={selectedAsset} selectedTruck={selectedTruckObject} selectedMaterial={selectedMaterialObject} metrics={metrics} />
    ) : activeContextPanel === 'events' ? (
      <EventPanel events={activeEvents} onEventClick={handleEventClick} />
    ) : activeContextPanel === 'whatIf' ? (
      <WhatIfPanel controls={whatIfControls} activeScenario={activeScenario} metrics={metrics} onControlChange={handleControlChange} onReset={() => setWhatIfControls(getScenarioControls(activeScenario))} />
    ) : activeContextPanel === 'metrics' ? (
      <MetricsPanel metrics={metrics} />
    ) : (
      <ImpactPanel ai={ai} />
    );

  return (
    <div className="h-[100svh] w-full overflow-hidden bg-white text-[13px] text-slate-900">
      <div className="grid h-full min-h-0 w-full grid-cols-[112px_minmax(0,1fr)_382px] grid-rows-[64px_70px_minmax(0,1fr)_116px] bg-[linear-gradient(180deg,#ffffff,#f8fbfd_58%,#f5f7fa)]">
        <aside className="row-span-4 flex h-full min-h-0 flex-col border-r border-slate-200 bg-[#F7F9FB] px-3 py-3">
          <div className="flex items-center justify-center pb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#001C2E] shadow-lg">
              <img src={LOGO_URL} alt="Pluspetrol" className="h-7 w-7 object-contain" />
            </div>
          </div>
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Workspaces</div>
          <nav className="mt-2 grid gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeWorkspace === item.id;
              return (
                <button key={item.id} type="button" onClick={() => setActiveWorkspace(item.id)} className={`flex items-center gap-2 rounded-2xl border px-2.5 py-2.5 text-left transition ${active ? 'border-[#001C2E] bg-[#001C2E] text-white shadow-md' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50 hover:text-[#001C2E]'}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-[0.12em]">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-4 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Rail panels</div>
          <div className="mt-2 grid gap-1.5">
            {contextButtons.map((item) => {
              const Icon = item.icon;
              const active = activeContextPanel === item.id;
              return (
                <button key={item.id} type="button" onClick={() => setActiveContextPanel(item.id)} className={`flex items-center gap-2 rounded-2xl border px-2.5 py-2 text-left transition ${active ? 'border-cyan-600 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50'}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-[0.12em]">{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-auto rounded-[1.1rem] border border-slate-200 bg-white p-2 text-center">
            <motion.div className="mx-auto mb-1.5 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" animate={{ scale: [1, 1.45, 1], opacity: [0.75, 1, 0.75] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
            <div className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">live</div>
            <div className="mt-0.5 text-xs font-black text-[#001C2E]">tick {simulationTick % 100}</div>
          </div>
        </aside>

        <header className="col-start-2 row-start-1 flex min-w-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-cyan-700">600-well operations system</span>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">{activeWorkspaceLabel}</span>
            </div>
            <div className="mt-1 truncate text-[23px] font-black leading-none tracking-tight text-[#001C2E]">Pluspetrol Well Factory Command</div>
          </div>
          <div className="grid min-w-[420px] grid-cols-3 gap-2">
            <MiniMetric label="selected focus" value={selectedTruckObject?.id ?? selectedMaterialObject?.name ?? selectedAsset?.label ?? activeStageDef.name} tone="slate" />
            <MiniMetric label="global constraint" value={metrics.globalConstraint} tone={metrics.riskLevel === 'critical' ? 'rose' : 'amber'} />
            <MiniMetric label="netback pulse" value={`${metrics.marginImpact >= 0 ? '+' : ''}${metrics.marginImpact.toFixed(2)} $/bbl`} tone={metrics.marginImpact >= 0 ? 'emerald' : 'rose'} />
          </div>
        </header>

        <section className="col-start-2 row-start-2 grid min-w-0 grid-cols-[minmax(0,1fr)_280px] gap-3 border-b border-slate-200 px-4 py-2">
          <div className="grid min-w-0 grid-cols-8 gap-2">
            {kpis.map((item) => {
              const tone = toneClasses[item.risk];
              return (
                <button key={item.id} type="button" onClick={() => handleKpiClick(item.id)} className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-left hover:border-cyan-200">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">{item.label}</div>
                      <div className="mt-0.5 truncate text-[16px] font-black leading-none text-[#001C2E]">{item.value}</div>
                      <div className="truncate text-[9px] font-semibold text-slate-500">{item.sub}</div>
                    </div>
                    <div className={`h-8 w-1 rounded-full bg-gradient-to-b ${tone.fill}`} />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="grid grid-rows-2 gap-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              {(['Digital Twin', 'Constraint Lens', 'Margin Lens'] as ViewMode[]).map((mode) => (
                <button key={mode} type="button" onClick={() => setSelectedViewMode(mode)} className={`rounded-xl border px-2 py-1 text-[9px] font-black ${selectedViewMode === mode ? 'border-[#001C2E] bg-[#001C2E] text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-cyan-50'}`}>{mode.replace(' Lens', '')}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(SCENARIOS) as ScenarioId[]).map((scenario) => (
                <button key={scenario} type="button" onClick={() => handleScenarioChange(scenario)} className={`rounded-xl border px-2.5 py-1 text-[9px] font-black ${activeScenario === scenario ? 'border-cyan-600 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-cyan-50'}`}>{SCENARIOS[scenario].label}</button>
              ))}
            </div>
          </div>
        </section>

        <main className="col-start-2 row-start-3 min-h-0 overflow-hidden p-4">
          <div className="h-full min-h-0 overflow-hidden">{centerModule}</div>
        </main>

        <aside className="col-start-3 row-span-4 row-start-1 min-h-0 border-l border-slate-200 bg-white/75 p-3">
          <div className="grid h-full min-h-0 grid-rows-[46px_minmax(0,1fr)] gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Context rail · {contextButtons.find((item) => item.id === activeContextPanel)?.label}</div>
              <div className="truncate text-sm font-black text-[#001C2E]">{ai.selectedFocus}</div>
            </div>
            <div className="min-h-0 overflow-y-auto pr-1">{contextPanel}</div>
          </div>
        </aside>

        <footer className="col-start-2 row-start-4 min-h-0 border-t border-slate-200 px-4 py-3">
          <StageTimeline stageStates={stageStates} activeStage={activeStage} onStageClick={handleStageClick} />
        </footer>
      </div>
    </div>
  );
}
