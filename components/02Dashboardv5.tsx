'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BellRing,
  BarChart3,
  BatteryCharging,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Cpu,
  Database,
  DollarSign,
  Droplets,
  Eye,
  Factory,
  Flame,
  Fuel,
  Gauge,
  Layers,
  Pause,
  Pickaxe,
  Play,
  RadioTower,
  RefreshCw,
  Route,
  Satellite,
  ShieldCheck,
  Sparkles,
  Target,
  Thermometer,
  Truck,
  Waves,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type StageId = 'pad' | 'drilling' | 'geosteering' | 'drillstring' | 'frac' | 'production' | 'gathering' | 'treatment' | 'storage' | 'alerts';
type TimeWindow = 'Live' | '24H' | '7D' | '30D';
type Scenario = 'base' | 'constraint' | 'certificate' | 'optimization';
type ProductMode = 'crude' | 'gas';
type CostFooterMode = 'original' | 'current';
type Tone = 'cyan' | 'amber' | 'emerald' | 'rose' | 'violet' | 'slate';

type FocusObject = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  tone?: Tone;
  metrics: Array<{ label: string; value: string; tone?: Tone }>;
  insight: string;
};

type StageConfig = {
  id: StageId;
  short: string;
  label: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tone: Tone;
  command: string;
  operatingQuestion: string;
};

type ChartSpec = {
  id: string;
  title: string;
  subtitle: string;
  unit: string;
  tone: Tone;
  base: number;
  spread: number;
  trend: number;
  decimals?: number;
};

type KPI = {
  label: string;
  value: string;
  delta: string;
  tone: Tone;
  icon: LucideIcon;
  description: string;
};

type RouteNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: 'injection' | 'measurement' | 'pumping' | 'terminal' | 'storage';
  flow: number;
  cost: number;
  density: number;
  utilization: number;
};

const LOGO_URL = 'https://images.aiworkify.com/pluspetrol-project/pluspetrol-isologo.png';
const TIME_WINDOWS: TimeWindow[] = ['Live', '24H', '7D', '30D'];

const SCENARIOS: Array<{ id: Scenario; label: string; caption: string }> = [
  { id: 'base', label: 'Base Operations', caption: 'stable flow' },
  { id: 'constraint', label: 'Constraint Mode', caption: 'capacity tension' },
  { id: 'certificate', label: 'Certificate Delay', caption: 'reconciliation risk' },
  { id: 'optimization', label: 'Optimization Mode', caption: 'AI recovery' },
];

const STAGES: StageConfig[] = [
  {
    id: 'drilling',
    short: 'RTO',
    label: 'Real-Time Drilling Room',
    title: 'Real-Time Drilling Room',
    subtitle: 'Rig telemetry, MWD/LWD, mud logging, daily reports, geologist and drilling engineer in one synchronized room.',
    icon: Pickaxe,
    tone: 'violet',
    command: 'Integrate rig sensors, downhole tools, mud logging, DDR context and historical wells while the horizontal well is being drilled.',
    operatingQuestion: 'Are geology, drilling and historical evidence seeing the same reality before the next decision?',
  },
  {
    id: 'geosteering',
    short: 'GEO',
    label: 'Geosteering & Landing',
    title: 'Geosteering, Wellbore Landing & Sweet Spot Targeting',
    subtitle: 'Plan vs actual trajectory, gamma/resistivity, offset wells, target window and landing corrections.',
    icon: Target,
    tone: 'cyan',
    command: 'Keep the bit inside the sweet spot while updating the geological model from live curves and offset correlation.',
    operatingQuestion: 'Is the lateral still in the best rock, or do we need a safe steering correction now?',
  },
  {
    id: 'drillstring',
    short: 'RPM',
    label: 'Sarta, WOB & RPM Economics',
    title: 'Drillstring Weight, RPM & Cost-of-Slowdown Control',
    subtitle: 'Hookload, WOB transfer, torque, drag, vibration, stick-slip, RPM reductions and rig-rate economic impact.',
    icon: Gauge,
    tone: 'amber',
    command: 'Quantify uncertainty in drillstring behavior before conservative RPM decisions become hidden annual cost.',
    operatingQuestion: 'Are reduced RPM and lower ROP justified by risk, or are we burning rig time without evidence?',
  },
  {
    id: 'production',
    short: 'LIVE',
    label: 'Production',
    title: 'Live Well Production Control',
    subtitle: 'Natural flow, artificial lift, tubing, pressure and production stability.',
    icon: Activity,
    tone: 'emerald',
    command: 'Bring the well online and stabilize live production at pad level.',
    operatingQuestion: 'Which wells are producing, unstable, or becoming lift candidates?',
  },
  {
    id: 'gathering',
    short: 'BAT',
    label: 'Gathering & Batteries',
    title: 'Flowlines, Batteries & Separation',
    subtitle: 'Internal pipelines, battery capacity, oil/gas/water split and pressure.',
    icon: Factory,
    tone: 'cyan',
    command: 'Move mixed fluids through flowlines into production batteries.',
    operatingQuestion: 'Where is the gathering system losing capacity, quality or time?',
  },
  {
    id: 'treatment',
    short: 'PTC',
    label: 'Treatment & Evacuation',
    title: 'Treatment Plants & Trunk Evacuation',
    subtitle: 'Crude dehydration, gas compression, spec compliance and trunk capacity.',
    icon: Route,
    tone: 'rose',
    command: 'Treat the molecule to specification and evacuate through trunk lines.',
    operatingQuestion: 'Can the trunk system absorb incremental production without raising delivered cost?',
  },
  {
    id: 'storage',
    short: 'PR',
    label: 'Storage & Dispatch',
    title: 'Terminal, Batch & Margin Control',
    subtitle: 'Tank fill, batch scheduling, title transfer, realized price and netback.',
    icon: DollarSign,
    tone: 'emerald',
    command: 'Close the loop at Puerto Rosales with storage, dispatch and monetization.',
    operatingQuestion: 'Which batch should be dispatched first to protect margin and inventory?',
  },
  {
    id: 'alerts',
    short: 'ALR',
    label: 'Critical Alert Field',
    title: 'Drilling Critical Alert Field',
    subtitle: 'Aerial/isometric render of rig, wellbore, drillstring, mud system, geosteering room and delay propagation.',
    icon: BellRing,
    tone: 'rose',
    command: 'Expose the exact physical and decision bottleneck behind the critical operations clock.',
    operatingQuestion: 'Which drilling object is delaying the critical path and what recovery action is safe?',
  },
];

const GAS_STAGES: StageConfig[] = [
  {
    id: 'drilling',
    short: 'RTO',
    label: 'Gas Real-Time Drilling Room',
    title: 'Gas Real-Time Drilling Room',
    subtitle: 'Rig telemetry, MWD/LWD, mud gas, geological prognosis, DDR context and historical offsets.',
    icon: Pickaxe,
    tone: 'violet',
    command: 'Integrate rig sensors, downhole tools, mud gas response and historical gas wells while the lateral is being drilled.',
    operatingQuestion: 'Are geology, drilling and historical gas behavior aligned before the next decision?',
  },
  {
    id: 'geosteering',
    short: 'GEO',
    label: 'Gas Geosteering & Landing',
    title: 'Gas Landing, Sweet Spot & Reservoir Contact',
    subtitle: 'Gamma/resistivity, mud gas, plan vs actual trajectory, offset wells and target-window decisions.',
    icon: Target,
    tone: 'cyan',
    command: 'Keep the gas lateral inside the target rock while updating the model with live measurements and offset correlation.',
    operatingQuestion: 'Are we maximizing reservoir contact without steering outside the gas-rich window?',
  },
  {
    id: 'drillstring',
    short: 'RPM',
    label: 'Gas Sarta, WOB & RPM Economics',
    title: 'Gas Drillstring Weight, RPM & ROP Loss Control',
    subtitle: 'Hookload, WOB transfer, torque/drag, vibration, stick-slip, RPM reductions and day-rate impact.',
    icon: Gauge,
    tone: 'amber',
    command: 'Quantify uncertainty in drillstring behavior before conservative RPM decisions reduce gas-well delivery speed.',
    operatingQuestion: 'Is lower RPM reducing mechanical risk or silently destroying drilling economics?',
  },
  {
    id: 'production',
    short: 'GAS',
    label: 'Gas Production',
    title: 'Gas Production & Deliverability Control',
    subtitle: 'Wellhead pressure, choke, tubing velocity, liquid loading, decline curve and allocation.',
    icon: Wind,
    tone: 'emerald',
    command: 'Optimize gas deliverability while preventing liquid loading and excessive drawdown.',
    operatingQuestion: 'Which wells are constrained by backpressure, liquids or compression availability?',
  },
  {
    id: 'gathering',
    short: 'LP',
    label: 'Low-Pressure Gathering',
    title: 'Gas Gathering & Slug Catcher Command',
    subtitle: 'Low-pressure headers, condensate, slug catcher load, H2S/CO2 surveillance and linepack.',
    icon: Route,
    tone: 'cyan',
    command: 'Move wet gas from pads to the plant without slugging, hydrate formation or pressure collapse.',
    operatingQuestion: 'Where is pressure or liquids inventory stealing deliverability before compression?',
  },
  {
    id: 'treatment',
    short: 'CGT',
    label: 'Compression & Treatment',
    title: 'Compression, Dehydration & Dew Point Control',
    subtitle: 'Compressor trains, TEG dehydration, condensate stabilization, dew point and sales gas specification.',
    icon: RadioTower,
    tone: 'rose',
    command: 'Turn wet field gas into reliable sales gas while protecting compressors and export specs.',
    operatingQuestion: 'Can compression and dehydration absorb incremental gas without violating sales spec?',
  },
  {
    id: 'storage',
    short: 'MKT',
    label: 'Linepack & Sales',
    title: 'Sales Metering, Linepack & Nomination Control',
    subtitle: 'Sales meter, custody transfer, nominations, linepack, imbalance and realized gas margin.',
    icon: DollarSign,
    tone: 'emerald',
    command: 'Balance field deliverability with nominations, transport capacity and commercial imbalance risk.',
    operatingQuestion: 'Which gas should be nominated now to protect margin and avoid imbalance penalties?',
  },
  {
    id: 'alerts',
    short: 'ALR',
    label: 'Critical Drilling Alert',
    title: 'Gas Drilling Critical Alert Field',
    subtitle: 'Aerial/isometric render of rig, wellbore, drillstring, mud system and control-room decision delay.',
    icon: BellRing,
    tone: 'rose',
    command: 'Expose the exact drilling decision or physical bottleneck behind the red operations clock.',
    operatingQuestion: 'Which drilling signal is on the critical path and what recovery action is safest?',
  },
];

function getStageCatalog(productMode: ProductMode) {
  return productMode === 'gas' ? GAS_STAGES : STAGES;
}

const SCENARIO_DETAILS: Record<Scenario, { title: string; badge: string; description: string; actions: string[]; tones: Tone[] }> = {
  base: {
    title: 'Base Operations',
    badge: 'stable flow',
    description: 'Baseline control room: production, logistics, treatment and dispatch inside normal operating envelope.',
    actions: ['Keep live surveillance active', 'Compare against plan curve', 'Escalate only exceptions'],
    tones: ['cyan', 'emerald', 'slate'],
  },
  constraint: {
    title: 'Constraint Mode',
    badge: 'capacity tension',
    description: 'Raises bottleneck sensitivity: flowline pressure, battery load, compressor headroom, trunk capacity and queue risk.',
    actions: ['Prioritize bottleneck removal', 'Reroute non-critical volumes', 'Protect rig, compressor and critical path'],
    tones: ['amber', 'rose', 'cyan'],
  },
  certificate: {
    title: 'Certificate Delay',
    badge: 'reconciliation risk',
    description: 'Separates physical losses from documentary delay: custody meters, density, volume tickets and commercial settlement.',
    actions: ['Lock source-of-truth meter', 'Reconcile density and volume', 'Prevent unnecessary field escalation'],
    tones: ['violet', 'amber', 'cyan'],
  },
  optimization: {
    title: 'Optimization Mode',
    badge: 'AI recovery',
    description: 'Applies optimization recommendations across routing, choke/compressor setpoints, batch order and nominations.',
    actions: ['Execute lowest-risk reroute', 'Commit margin-positive schedule', 'Monitor response for 30 minutes'],
    tones: ['emerald', 'cyan', 'violet'],
  },
};

const TIME_WINDOW_DETAILS: Record<TimeWindow, { title: string; cadence: string; purpose: string; stats: Array<{ label: string; value: string; tone: Tone }>; chart: number[] }> = {
  Live: {
    title: 'Live pulse',
    cadence: 'last 15 min',
    purpose: 'Detects critical events before they become downtime.',
    stats: [
      { label: 'Signal latency', value: '2.4s', tone: 'emerald' },
      { label: 'Active alerts', value: '3', tone: 'amber' },
      { label: 'AI confidence', value: '92%', tone: 'cyan' },
    ],
    chart: [42, 44, 43, 46, 49, 51, 50, 54, 58, 57, 61, 60],
  },
  '24H': {
    title: '24 hour shift',
    cadence: 'shift performance',
    purpose: 'Shows what changed during the operating day: delays, throughput, cost and recovery.',
    stats: [
      { label: 'Recovered time', value: '3.8h', tone: 'emerald' },
      { label: 'NPT exposure', value: '7.2%', tone: 'amber' },
      { label: 'Volume delta', value: '+1.1%', tone: 'emerald' },
    ],
    chart: [48, 51, 52, 50, 54, 56, 60, 58, 61, 64, 63, 67],
  },
  '7D': {
    title: '7 day campaign',
    cadence: 'campaign trend',
    purpose: 'Connects drilling-room decisions, geosteering, production and evacuation over the week.',
    stats: [
      { label: 'Plan adherence', value: '96%', tone: 'emerald' },
      { label: 'Bottleneck hours', value: '11h', tone: 'amber' },
      { label: 'Margin protected', value: 'USD 1.8M', tone: 'emerald' },
    ],
    chart: [44, 47, 51, 49, 55, 59, 62, 64, 63, 68, 70, 73],
  },
  '30D': {
    title: '30 day system',
    cadence: 'monthly envelope',
    purpose: 'Highlights structural capacity, decline behavior, reliability and commercial imbalance.',
    stats: [
      { label: 'Reliability', value: '98.1%', tone: 'emerald' },
      { label: 'Decline offset', value: '+4 pads', tone: 'cyan' },
      { label: 'Cost variance', value: '-2.6%', tone: 'emerald' },
    ],
    chart: [51, 49, 52, 54, 57, 55, 60, 63, 65, 68, 72, 74],
  },
};

type GasModule = {
  id: string;
  stage: StageId;
  label: string;
  short: string;
  x: number;
  y: number;
  tone: Tone;
  value: string;
  risk: 'normal' | 'watch' | 'critical';
  description: string;
};

const GAS_MODULES: GasModule[] = [
  { id: 'gas-pad', stage: 'pad', label: 'Wellhead pad', short: 'WHD', x: 8, y: 47, tone: 'cyan', value: '42 wells', risk: 'normal', description: 'Chokes, manifolds, test separator, hydrate inhibitor and first measurement.' },
  { id: 'gas-drill', stage: 'drilling', label: 'Gas lateral', short: 'HZ', x: 20, y: 35, tone: 'violet', value: '2.9 km', risk: 'normal', description: 'Horizontal exposure in gas-bearing rock, casing and cement integrity.' },
  { id: 'gas-flowback', stage: 'frac', label: 'Flowback', short: 'FBK', x: 32, y: 58, tone: 'amber', value: '31/50 stg', risk: 'watch', description: 'Sand return, choke schedule, water recovery and temporary gas handling.' },
  { id: 'gas-prod', stage: 'production', label: 'Production header', short: 'GAS', x: 45, y: 44, tone: 'emerald', value: '4.12 MMm³/d', risk: 'normal', description: 'Deliverability, liquid loading, wellhead pressure and allocation.' },
  { id: 'gas-slug', stage: 'gathering', label: 'Slug catcher', short: 'LP', x: 58, y: 55, tone: 'cyan', value: '82% load', risk: 'watch', description: 'Wet gas, condensate knock-out, linepack and hydrate risk.' },
  { id: 'gas-compressor', stage: 'treatment', label: 'Compression', short: 'CGT', x: 70, y: 38, tone: 'rose', value: '8,250 HP', risk: 'critical', description: 'Compressor availability, suction pressure, discharge temperature and recycle.' },
  { id: 'gas-dewpoint', stage: 'treatment', label: 'TEG / dew point', short: 'TEG', x: 80, y: 58, tone: 'amber', value: '-12 °C', risk: 'watch', description: 'Water dew point, glycol circulation, regeneration and spec compliance.' },
  { id: 'gas-sales', stage: 'storage', label: 'Sales meter', short: 'MKT', x: 92, y: 47, tone: 'emerald', value: '97.6% nom.', risk: 'normal', description: 'Custody transfer, transport nomination, imbalance and realized margin.' },
];



const ROUTE_NODES: RouteNode[] = [
  { id: 'puesto-hernandez', label: 'Puesto Hernández', x: 70, y: 150, kind: 'injection', flow: 31400, cost: 35.2, density: 0.842, utilization: 74 },
  { id: 'auca-mahuida', label: 'Auca Mahuida', x: 130, y: 195, kind: 'measurement', flow: 48600, cost: 35.8, density: 0.846, utilization: 79 },
  { id: 'catriel', label: 'Crucero Catriel', x: 222, y: 255, kind: 'measurement', flow: 81400, cost: 37.1, density: 0.844, utilization: 87 },
  { id: 'medanito', label: 'Medanito', x: 305, y: 303, kind: 'measurement', flow: 97600, cost: 37.8, density: 0.849, utilization: 82 },
  { id: 'allen', label: 'Allen', x: 330, y: 510, kind: 'measurement', flow: 128900, cost: 38.9, density: 0.845, utilization: 80 },
  { id: 'chimpay', label: 'Chimpay', x: 570, y: 535, kind: 'measurement', flow: 132700, cost: 40.1, density: 0.846, utilization: 81 },
  { id: 'pichi', label: 'Pichi Mahuida', x: 820, y: 535, kind: 'measurement', flow: 133200, cost: 41.0, density: 0.845, utilization: 83 },
  { id: 'rio-colorado', label: 'Río Colorado', x: 960, y: 502, kind: 'measurement', flow: 132500, cost: 41.7, density: 0.844, utilization: 88 },
  { id: 'algarrobo', label: 'Algarrobo', x: 1088, y: 485, kind: 'pumping', flow: 132100, cost: 42.2, density: 0.844, utilization: 84 },
  { id: 'salitral', label: 'Salitral', x: 1204, y: 440, kind: 'storage', flow: 131800, cost: 42.7, density: 0.844, utilization: 80 },
  { id: 'puerto-rosales', label: 'Puerto Rosales', x: 1295, y: 494, kind: 'terminal', flow: 130900, cost: 43.1, density: 0.844, utilization: 76 },
];

const ROUTE_PATH =
  'M 70 150 L 130 195 L 222 255 L 305 303 L 300 410 L 330 510 C 430 538 515 535 570 535 L 710 535 L 820 535 C 880 525 920 510 960 502 L 1088 485 L 1204 440 L 1295 494';

const EVENTS = [
  'Sala RT synchronized rig, MWD/LWD, mud logging and DDR context · latency 2.4s',
  'Geosteerer confirms lateral remains inside sweet spot · gamma/res match 91%',
  'Drilling engineer reviews hookload gap · WOB transfer uncertainty visible',
  'RPM reduced conservatively for vibration watch · ROP impact now quantified',
  'DDR note structured into event · cause, duration, depth and cost linked',
  'Battery B-04 crossed 91% utilization · separator load rising',
  'Río Colorado certificate 20211 pending density validation',
  'AI recommendation saved · gradual RPM recovery and watch response',
];

function toneClasses(tone: Tone) {
  const map: Record<Tone, { text: string; border: string; bg: string; glow: string; dot: string; gradient: string }> = {
    cyan: {
      text: 'text-cyan-200',
      border: 'border-cyan-300/30',
      bg: 'bg-cyan-300/10',
      glow: 'shadow-[0_0_32px_rgba(34,211,238,.20)]',
      dot: 'bg-cyan-300',
      gradient: 'from-cyan-400 to-sky-500',
    },
    amber: {
      text: 'text-amber-200',
      border: 'border-amber-300/30',
      bg: 'bg-amber-300/10',
      glow: 'shadow-[0_0_32px_rgba(245,158,11,.20)]',
      dot: 'bg-amber-300',
      gradient: 'from-amber-400 to-orange-500',
    },
    emerald: {
      text: 'text-emerald-200',
      border: 'border-emerald-300/30',
      bg: 'bg-emerald-300/10',
      glow: 'shadow-[0_0_32px_rgba(52,211,153,.20)]',
      dot: 'bg-emerald-300',
      gradient: 'from-emerald-400 to-teal-500',
    },
    rose: {
      text: 'text-rose-200',
      border: 'border-rose-300/30',
      bg: 'bg-rose-300/10',
      glow: 'shadow-[0_0_32px_rgba(251,113,133,.20)]',
      dot: 'bg-rose-300',
      gradient: 'from-rose-400 to-red-500',
    },
    violet: {
      text: 'text-violet-200',
      border: 'border-violet-300/30',
      bg: 'bg-violet-300/10',
      glow: 'shadow-[0_0_32px_rgba(139,92,246,.20)]',
      dot: 'bg-violet-300',
      gradient: 'from-violet-400 to-fuchsia-500',
    },
    slate: {
      text: 'text-slate-200',
      border: 'border-slate-300/20',
      bg: 'bg-white/[0.04]',
      glow: 'shadow-[0_0_32px_rgba(148,163,184,.12)]',
      dot: 'bg-slate-300',
      gradient: 'from-slate-400 to-slate-500',
    },
  };
  return map[tone];
}

function colorForTone(tone: Tone) {
  const map: Record<Tone, string> = {
    cyan: '#22d3ee',
    amber: '#f59e0b',
    emerald: '#34d399',
    rose: '#fb7185',
    violet: '#a78bfa',
    slate: '#94a3b8',
  };
  return map[tone];
}

function useClock() {
  const [clock, setClock] = useState('--:--:--');
  useEffect(() => {
    const update = () => {
      setClock(
        new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date())
      );
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);
  return clock;
}

function scenarioModifier(scenario: Scenario) {
  if (scenario === 'constraint') return { production: -5.5, utilization: 8.5, cost: 1.1, margin: -1.5, risk: 19 };
  if (scenario === 'certificate') return { production: -0.8, utilization: 1.5, cost: 0.25, margin: -0.25, risk: 27 };
  if (scenario === 'optimization') return { production: 2.4, utilization: -3.2, cost: -0.55, margin: 1.1, risk: -16 };
  return { production: 0, utilization: 0, cost: 0, margin: 0, risk: 0 };
}

function wave(tick: number, seed: number, amp = 1) {
  return Math.sin((tick + seed) * 0.34) * amp + Math.cos((tick + seed * 1.7) * 0.17) * amp * 0.35;
}

function formatNumber(value: number, decimals = 0) {
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function MiniSparkline({ data, tone = 'cyan' }: { data: number[]; tone?: Tone }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = Math.max(1, max - min);
  const points = data
    .map((v, i) => {
      const x = (i / Math.max(1, data.length - 1)) * 100;
      const y = 34 - ((v - min) / span) * 27;
      return `${x},${y}`;
    })
    .join(' ');
  const color = colorForTone(tone);
  return (
    <svg viewBox="0 0 100 40" className="h-10 w-full overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
      <circle cx="100" cy="20" r="2.7" fill={color} style={{ filter: `drop-shadow(0 0 7px ${color})` }} />
    </svg>
  );
}

function MiniGauge({ value, tone = 'emerald' }: { value: number; tone?: Tone }) {
  const color = toneClasses(tone).gradient;
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
      <motion.div className={`h-full rounded-full bg-gradient-to-r ${color}`} animate={{ width: `${Math.max(5, Math.min(100, value))}%` }} transition={{ duration: 0.8 }} />
    </div>
  );
}

function generateSeries(stage: StageId, window: TimeWindow, index: number, tick: number, scenario: Scenario) {
  const n = window === 'Live' ? 28 : window === '24H' ? 24 : window === '7D' ? 28 : 30;
  const mod = scenarioModifier(scenario);
  const stageFactor: Record<StageId, number> = {
    pad: 0.8,
    drilling: 1.25,
    geosteering: 1.35,
    drillstring: 1.45,
    frac: 1.6,
    production: 1.1,
    gathering: 0.95,
    treatment: 0.9,
    storage: 0.75,
    alerts: 1.9,
  };
  return Array.from({ length: n }, (_, i) => {
    const base = 50 + index * 11 + stageFactor[stage] * 7;
    const cycle = Math.sin((i + tick * 0.22 + index * 3) * 0.47) * (6 + index * 1.7);
    const drift = ((i / n) * (index % 2 === 0 ? 8 : -5)) + (window === '30D' ? Math.sin(i * 0.18) * 10 : 0);
    const scenarioPush = index === 0 ? mod.production * 0.6 : index === 1 ? mod.utilization * 0.7 : index === 2 ? mod.cost * 7 : mod.margin * 5;
    return Math.max(2, base + cycle + drift + scenarioPush);
  });
}

function getChartSpecs(stage: StageId, scenario: Scenario, productMode: ProductMode = 'crude'): ChartSpec[] {
  if (productMode === 'gas') return getGasChartSpecs(stage, scenario);
  const riskTone: Tone = scenario === 'constraint' || scenario === 'certificate' ? 'amber' : 'emerald';
  const map: Record<StageId, ChartSpec[]> = {
    pad: [
      { id: 'readiness', title: 'Pad readiness', subtitle: 'earthworks, compaction, access', unit: '%', tone: 'cyan', base: 74, spread: 5, trend: 1.2 },
      { id: 'diesel', title: 'Diesel burn', subtitle: 'heavy equipment consumption', unit: 'L', tone: 'amber', base: 12000, spread: 700, trend: 0.6 },
      { id: 'surface', title: 'Surface prepared', subtitle: '230–250m x 150m footprint', unit: 'm²', tone: 'emerald', base: 34500, spread: 1500, trend: 1.8 },
      { id: 'rig-entry', title: 'Rig-entry risk', subtitle: 'days to release location', unit: 'risk', tone: riskTone, base: 32, spread: 10, trend: -0.8 },
    ],
    drilling: [
      { id: 'signal-latency', title: 'Room signal latency', subtitle: 'rig sensors + MWD/LWD sync', unit: 's', tone: 'emerald', base: 2.4, spread: 0.8, trend: -0.02, decimals: 1 },
      { id: 'rop-plan', title: 'ROP vs plan', subtitle: 'meters/hour against offset benchmark', unit: 'm/h', tone: 'cyan', base: 23.4, spread: 3.2, trend: 0.12, decimals: 1 },
      { id: 'mwd-health', title: 'MWD/LWD health', subtitle: 'survey, gamma, resistivity and vibration data quality', unit: '%', tone: 'violet', base: 94.5, spread: 2.4, trend: 0.04, decimals: 1 },
      { id: 'decision-lag', title: 'Decision lag', subtitle: 'time from anomaly to signed action', unit: 'min', tone: riskTone, base: 18, spread: 6, trend: -0.18 },
    ],
    geosteering: [
      { id: 'sweetspot-offset', title: 'Sweet-spot offset', subtitle: 'distance from target-window center', unit: 'm', tone: riskTone, base: 1.8, spread: 0.9, trend: -0.02, decimals: 1 },
      { id: 'gamma-match', title: 'Gamma / resistivity match', subtitle: 'correlation against prognosis and offsets', unit: '%', tone: 'cyan', base: 91.2, spread: 3.6, trend: 0.05, decimals: 1 },
      { id: 'landing-quality', title: 'Landing quality', subtitle: 'entry angle, DLS and target-window capture', unit: '%', tone: 'emerald', base: 96.4, spread: 1.8, trend: 0.04, decimals: 1 },
      { id: 'steering-lead', title: 'Steering lead time', subtitle: 'minutes before leaving the target window', unit: 'min', tone: 'amber', base: 42, spread: 8, trend: 0.2 },
    ],
    drillstring: [
      { id: 'hookload-gap', title: 'Hookload model gap', subtitle: 'observed vs torque-and-drag model', unit: 'klbf', tone: riskTone, base: 18, spread: 5, trend: 0.1 },
      { id: 'wob-transfer', title: 'WOB transfer', subtitle: 'surface weight reaching the bit', unit: '%', tone: 'cyan', base: 78, spread: 6, trend: 0.08 },
      { id: 'rpm-slowdown', title: 'RPM slowdown', subtitle: 'hours at conservative rotation', unit: 'h', tone: 'amber', base: 3.6, spread: 1.1, trend: -0.05, decimals: 1 },
      { id: 'slowdown-cost', title: 'Cost of slowdown', subtitle: 'rig day-rate exposure from lower ROP', unit: 'USDk', tone: 'rose', base: 126, spread: 28, trend: 0.6 },
    ],
    frac: [
      { id: 'stages', title: 'Frac stages', subtitle: 'completed vs ~50 per well', unit: 'stg', tone: 'amber', base: 31, spread: 4, trend: 1.6 },
      { id: 'sand', title: 'Sand pumped', subtitle: '11–12k tons per well', unit: 't', tone: 'rose', base: 7400, spread: 500, trend: 2.2 },
      { id: 'water', title: 'Water pumped', subtitle: '~70k m³ per well', unit: 'm³', tone: 'cyan', base: 43800, spread: 2200, trend: 2.0 },
      { id: 'diesel-stage', title: 'Diesel per stage', subtitle: '~11k L per frac stage', unit: 'L/stg', tone: riskTone, base: 11000, spread: 420, trend: 0.2 },
    ],
    production: [
      { id: 'oil-rate', title: 'Oil rate', subtitle: 'live pad production', unit: 'bbl/d', tone: 'emerald', base: 62400, spread: 1600, trend: 0.7 },
      { id: 'lift', title: 'Artificial lift uptime', subtitle: 'pump / gaslift availability', unit: '%', tone: 'cyan', base: 94, spread: 3, trend: 0.2 },
      { id: 'pressure', title: 'Pressure stability', subtitle: 'wellhead behavior', unit: 'bar', tone: riskTone, base: 42, spread: 4, trend: -0.1 },
      { id: 'online', title: 'Wells online', subtitle: 'active vs candidate wells', unit: 'wells', tone: 'emerald', base: 42, spread: 2, trend: 0.3 },
    ],
    gathering: [
      { id: 'battery', title: 'Battery throughput', subtitle: 'separation capacity', unit: 'bbl/d', tone: 'cyan', base: 19000, spread: 900, trend: 0.4 },
      { id: 'pressure-map', title: 'Gathering pressure', subtitle: 'flowline pressure envelope', unit: 'bar', tone: riskTone, base: 38, spread: 5, trend: 0.1 },
      { id: 'split', title: 'Oil / gas / water split', subtitle: 'fluid separation behavior', unit: '% oil', tone: 'emerald', base: 72, spread: 4, trend: 0.2 },
      { id: 'util', title: 'Separator utilization', subtitle: 'battery loading', unit: '%', tone: riskTone, base: 84, spread: 6, trend: 0.4 },
    ],
    treatment: [
      { id: 'plant', title: 'Plant throughput', subtitle: 'PTC / PTG processing', unit: 'bbl/d', tone: 'rose', base: 31500, spread: 1300, trend: 0.4 },
      { id: 'compressor', title: 'Compression load', subtitle: 'gas plant horsepower', unit: 'HP', tone: 'amber', base: 8000, spread: 420, trend: 0.3 },
      { id: 'trunk', title: 'Trunk utilization', subtitle: 'evacuation capacity', unit: '%', tone: riskTone, base: 86, spread: 5, trend: 0.5 },
      { id: 'spec', title: 'Spec compliance', subtitle: 'dehydration / commercial spec', unit: '%', tone: 'emerald', base: 98.6, spread: 0.8, trend: 0.05, decimals: 1 },
    ],
    storage: [
      { id: 'fill', title: 'Tank fill', subtitle: 'terminal inventory', unit: '%', tone: 'cyan', base: 72, spread: 5, trend: 0.2 },
      { id: 'batch', title: 'Batch readiness', subtitle: 'outbound schedule', unit: '%', tone: 'emerald', base: 88, spread: 4, trend: 0.4 },
      { id: 'dispatch', title: 'Dispatch volume', subtitle: 'delivered today', unit: 'bbl', tone: 'emerald', base: 130900, spread: 1800, trend: 0.6 },
      { id: 'margin', title: 'Margin per barrel', subtitle: 'netback after delivered cost', unit: 'USD/bbl', tone: riskTone, base: 26.7, spread: 1.2, trend: 0.1, decimals: 1 },
    ],
    alerts: [
      { id: 'critical-delay', title: 'Critical path delay', subtitle: 'clock drift on active operation', unit: 'min', tone: 'rose', base: 47, spread: 8, trend: 0.35 },
      { id: 'reroute', title: 'Reroute headroom', subtitle: 'available bypass capacity', unit: '%', tone: 'amber', base: 18, spread: 5, trend: -0.2 },
      { id: 'field-objects', title: 'Objects at risk', subtitle: 'pads, trucks, pumps, compressors', unit: 'items', tone: 'violet', base: 9, spread: 3, trend: 0.1 },
      { id: 'recovery', title: 'Recovery ETA', subtitle: 'after recommended actions', unit: 'min', tone: 'emerald', base: 64, spread: 10, trend: -0.55 },
    ],
  };
  return map[stage];
}

function getGasChartSpecs(stage: StageId, scenario: Scenario): ChartSpec[] {
  const riskTone: Tone = scenario === 'constraint' || scenario === 'certificate' ? 'amber' : 'emerald';
  const map: Record<StageId, ChartSpec[]> = {
    pad: [
      { id: 'whp', title: 'Wellhead pressure', subtitle: 'choke and manifold envelope', unit: 'bar', tone: 'cyan', base: 184, spread: 9, trend: 0.12 },
      { id: 'hydrate', title: 'Hydrate margin', subtitle: 'methanol and temperature buffer', unit: '°C', tone: riskTone, base: 7.8, spread: 1.1, trend: -0.03, decimals: 1 },
      { id: 'test-sep', title: 'Test separator load', subtitle: 'flowback readiness', unit: '%', tone: 'amber', base: 72, spread: 7, trend: 0.22 },
      { id: 'first-gas', title: 'First gas readiness', subtitle: 'pad handover to production', unit: '%', tone: 'emerald', base: 81, spread: 5, trend: 0.35 },
    ],
    drilling: [
      { id: 'gas-signal-latency', title: 'Room signal latency', subtitle: 'rig + downhole + mud gas sync', unit: 's', tone: 'emerald', base: 2.6, spread: 0.9, trend: -0.02, decimals: 1 },
      { id: 'gas-rop-plan', title: 'Gas ROP vs plan', subtitle: 'lateral drilling rate against gas offsets', unit: 'm/h', tone: 'cyan', base: 22.8, spread: 3.4, trend: 0.08, decimals: 1 },
      { id: 'gas-mwd-health', title: 'MWD/LWD health', subtitle: 'survey, gamma, resistivity, vibration and mud gas quality', unit: '%', tone: 'violet', base: 93.7, spread: 2.8, trend: 0.03, decimals: 1 },
      { id: 'gas-decision-lag', title: 'Decision lag', subtitle: 'time from anomaly to signed action', unit: 'min', tone: riskTone, base: 19, spread: 6, trend: -0.12 },
    ],
    geosteering: [
      { id: 'gas-window', title: 'Gas-window offset', subtitle: 'distance from gas-rich target center', unit: 'm', tone: riskTone, base: 1.6, spread: 0.8, trend: -0.02, decimals: 1 },
      { id: 'mudgas-correlation', title: 'Mud gas correlation', subtitle: 'gas response vs prognosis and offset wells', unit: '%', tone: 'emerald', base: 88.5, spread: 4.5, trend: 0.07, decimals: 1 },
      { id: 'landing-quality-gas', title: 'Landing quality', subtitle: 'entry angle, DLS and reservoir-contact capture', unit: '%', tone: 'cyan', base: 95.6, spread: 2.0, trend: 0.04, decimals: 1 },
      { id: 'steering-lead-gas', title: 'Steering lead time', subtitle: 'minutes before leaving the gas window', unit: 'min', tone: 'amber', base: 39, spread: 7, trend: 0.2 },
    ],
    drillstring: [
      { id: 'gas-hookload-gap', title: 'Hookload model gap', subtitle: 'observed vs torque-and-drag model', unit: 'klbf', tone: riskTone, base: 19, spread: 5, trend: 0.08 },
      { id: 'gas-wob-transfer', title: 'WOB transfer', subtitle: 'surface weight reaching the bit', unit: '%', tone: 'cyan', base: 77, spread: 6, trend: 0.06 },
      { id: 'gas-rpm-slowdown', title: 'RPM slowdown', subtitle: 'hours at conservative rotation', unit: 'h', tone: 'amber', base: 3.9, spread: 1.2, trend: -0.04, decimals: 1 },
      { id: 'gas-slowdown-cost', title: 'Cost of slowdown', subtitle: 'rig day-rate exposure from lower ROP', unit: 'USDk', tone: 'rose', base: 132, spread: 30, trend: 0.6 },
    ],
    frac: [
      { id: 'flowback', title: 'Flowback gas rate', subtitle: 'clean-up gas to temporary handling', unit: 'km³/h', tone: 'amber', base: 72, spread: 8, trend: 0.45 },
      { id: 'sand-return', title: 'Sand return', subtitle: 'separator erosion watch', unit: 'kg/h', tone: riskTone, base: 38, spread: 12, trend: -0.12 },
      { id: 'water-recovery', title: 'Water recovery', subtitle: 'load recovery after stimulation', unit: '%', tone: 'cyan', base: 43, spread: 5, trend: 0.28 },
      { id: 'choke', title: 'Choke stability', subtitle: 'drawdown within safe band', unit: '%', tone: 'emerald', base: 91, spread: 4, trend: 0.08 },
    ],
    production: [
      { id: 'gas-rate', title: 'Gas deliverability', subtitle: 'pad gas rate after allocation', unit: 'm³/d', tone: 'emerald', base: 4_120_000, spread: 80000, trend: 9000 },
      { id: 'whp-decline', title: 'Pressure decline', subtitle: 'wellhead pressure trend', unit: 'bar/d', tone: riskTone, base: 1.7, spread: 0.4, trend: 0.01, decimals: 1 },
      { id: 'liquid-loading', title: 'Liquid loading risk', subtitle: 'tubing velocity vs critical rate', unit: '%', tone: 'amber', base: 22, spread: 6, trend: 0.12 },
      { id: 'allocation', title: 'Allocation confidence', subtitle: 'VFM + test separator match', unit: '%', tone: 'cyan', base: 94.4, spread: 1.2, trend: 0.03, decimals: 1 },
    ],
    gathering: [
      { id: 'suction', title: 'Suction pressure', subtitle: 'low-pressure header health', unit: 'bar', tone: 'cyan', base: 34, spread: 2.5, trend: -0.04, decimals: 1 },
      { id: 'slug', title: 'Slug catcher load', subtitle: 'liquids inventory before plant', unit: '%', tone: riskTone, base: 82, spread: 7, trend: 0.18 },
      { id: 'linepack', title: 'Field linepack', subtitle: 'short-term gas buffer', unit: 'km³', tone: 'emerald', base: 212, spread: 18, trend: 0.3 },
      { id: 'co2-h2s', title: 'Acid gas watch', subtitle: 'H2S / CO2 surveillance index', unit: 'idx', tone: 'violet', base: 12, spread: 3, trend: 0.05 },
    ],
    treatment: [
      { id: 'comp-hp', title: 'Compression load', subtitle: 'horsepower absorbed by trains', unit: 'HP', tone: riskTone, base: 8250, spread: 360, trend: 8 },
      { id: 'tegglycol', title: 'TEG circulation', subtitle: 'dehydration intensity', unit: 'm³/h', tone: 'cyan', base: 18.4, spread: 1.3, trend: 0.03, decimals: 1 },
      { id: 'dewpoint', title: 'Water dew point', subtitle: 'sales gas specification', unit: '°C', tone: 'emerald', base: -12, spread: 1.6, trend: -0.03, decimals: 1 },
      { id: 'recycle', title: 'Compressor recycle', subtitle: 'wasted compression energy', unit: '%', tone: 'amber', base: 9.6, spread: 2.2, trend: -0.05, decimals: 1 },
    ],
    storage: [
      { id: 'nomination', title: 'Nomination coverage', subtitle: 'sales commitments vs supply', unit: '%', tone: 'emerald', base: 97.6, spread: 2.1, trend: 0.03, decimals: 1 },
      { id: 'linepack-sales', title: 'Export linepack', subtitle: 'pipeline buffer at sales point', unit: 'km³', tone: 'cyan', base: 440, spread: 22, trend: 0.2 },
      { id: 'imbalance', title: 'Imbalance risk', subtitle: 'commercial deviation exposure', unit: '%', tone: riskTone, base: 3.2, spread: 1.1, trend: -0.02, decimals: 1 },
      { id: 'gas-margin', title: 'Gas margin', subtitle: 'realized value after treatment/transport', unit: 'USD/k m³', tone: 'emerald', base: 46.8, spread: 2.6, trend: 0.08, decimals: 1 },
    ],
    alerts: [
      { id: 'compressor-delay', title: 'Compressor delay', subtitle: 'critical train restart drift', unit: 'min', tone: 'rose', base: 47, spread: 8, trend: 0.35 },
      { id: 'curtailment', title: 'Curtailment exposure', subtitle: 'gas at risk if train trips', unit: 'm³/d', tone: 'amber', base: 280000, spread: 60000, trend: 1200 },
      { id: 'dewpoint-risk', title: 'Dew point breach', subtitle: 'sales spec probability', unit: '%', tone: 'violet', base: 18, spread: 5, trend: 0.1 },
      { id: 'reroute-gas', title: 'Bypass recovery', subtitle: 'safe reroute to parallel train', unit: '%', tone: 'emerald', base: 62, spread: 8, trend: 0.35 },
    ],
  };
  return map[stage];
}

function getStageKPIs(stage: StageId, scenario: Scenario, tick: number, productMode: ProductMode): KPI[] {
  const mod = scenarioModifier(scenario);
  const oilGasUnit = productMode === 'crude' ? 'bbl/d' : 'm³/d';
  const productionValue = productMode === 'crude' ? 182450 + mod.production * 1200 + wave(tick, 1, 700) : 4_120_000 + mod.production * 18000 + wave(tick, 2, 11000);
  if (productMode === 'gas') return getGasStageKPIs(stage, scenario, tick);
  const common: Record<StageId, KPI[]> = {
    pad: [
      { label: 'Pad readiness', value: `${formatNumber(74 + wave(tick, 1, 1.5), 0)}%`, delta: '+6 pts', tone: 'cyan', icon: Layers, description: 'Location readiness before rig entry.' },
      { label: 'Diesel consumed', value: `${formatNumber(8240 + wave(tick, 2, 160), 0)} L`, delta: 'vs 12k plan', tone: 'amber', icon: Fuel, description: 'Heavy equipment diesel burn.' },
      { label: 'Crew on site', value: '25', delta: 'normal', tone: 'emerald', icon: Activity, description: 'Construction workforce deployed.' },
      { label: 'Rig entry ETA', value: '6.4 d', delta: scenario === 'constraint' ? '+1.2 d' : '-0.4 d', tone: scenario === 'constraint' ? 'amber' : 'emerald', icon: Clock3, description: 'Days until location release.' },
    ],
    drilling: [
      { label: 'Room sync latency', value: `${formatNumber(2.4 + Math.max(0, wave(tick, 3, 0.25)), 1)}s`, delta: 'MWD + rig + DDR', tone: 'emerald', icon: Cpu, description: 'Delay across rig telemetry, MWD/LWD and control-room ingestion.' },
      { label: 'ROP vs plan', value: `${formatNumber(23.4 + wave(tick, 4, 1.8), 1)} m/h`, delta: '+0.7 vs offset', tone: 'cyan', icon: Pickaxe, description: 'Current drilling rate compared with prognosis and offset wells.' },
      { label: 'MWD/LWD health', value: `${formatNumber(94.5 + wave(tick, 5, 0.8), 1)}%`, delta: 'survey live', tone: 'violet', icon: Satellite, description: 'Quality of downhole surveys, gamma/resistivity and vibration signals.' },
      { label: 'Decision lag', value: `${formatNumber(18 + Math.max(0, mod.risk * 0.06) + wave(tick, 6, 1.2), 0)} min`, delta: scenario === 'constraint' ? 'too slow' : 'controlled', tone: scenario === 'constraint' ? 'amber' : 'emerald', icon: Clock3, description: 'Elapsed time between anomaly, multidisciplinary review and signed operating action.' },
    ],
    geosteering: [
      { label: 'Sweet spot offset', value: `${formatNumber(1.8 + wave(tick, 61, 0.35), 1)} m`, delta: 'target center', tone: 'cyan', icon: Target, description: 'Estimated distance between actual trajectory and sweet-spot center.' },
      { label: 'Gamma/res match', value: `${formatNumber(91.2 + wave(tick, 62, 1.0), 1)}%`, delta: 'offset aligned', tone: 'emerald', icon: Activity, description: 'Correlation of live gamma/resistivity curves with prognosis and offset wells.' },
      { label: 'DLS envelope', value: `${formatNumber(2.1 + wave(tick, 63, 0.16), 1)}°/30m`, delta: 'safe steer', tone: 'violet', icon: Route, description: 'Dogleg severity required to keep the lateral in target without mechanical penalty.' },
      { label: 'Steering lead', value: `${formatNumber(42 + wave(tick, 64, 4), 0)} min`, delta: 'before exit', tone: 'amber', icon: AlertTriangle, description: 'Time available before the well path risks leaving the target window.' },
    ],
    drillstring: [
      { label: 'Hookload gap', value: `${formatNumber(18 + wave(tick, 65, 2), 0)} klbf`, delta: 'model mismatch', tone: scenario === 'constraint' ? 'rose' : 'amber', icon: Gauge, description: 'Difference between observed hookload and torque-and-drag model.' },
      { label: 'WOB transfer', value: `${formatNumber(78 + wave(tick, 66, 2), 0)}%`, delta: 'surface to bit', tone: 'cyan', icon: Target, description: 'Estimated portion of surface weight actually reaching the bit.' },
      { label: 'Low RPM time', value: `${formatNumber(3.6 + Math.max(0, mod.risk * 0.03) + wave(tick, 67, 0.4), 1)} h`, delta: 'conservative mode', tone: 'amber', icon: RefreshCw, description: 'Accumulated time drilling at reduced RPM due to uncertainty or vibration.' },
      { label: 'Cost exposure', value: `USD ${formatNumber(126 + Math.max(0, mod.risk * 1.7) + wave(tick, 68, 8), 0)}k`, delta: 'rig day-rate', tone: 'rose', icon: DollarSign, description: 'Estimated rig-rate exposure from lower ROP caused by RPM reduction.' },
    ],
    frac: [
      { label: 'Frac stages', value: `${formatNumber(31 + wave(tick, 6, 0.7), 0)}/50`, delta: '+4 today', tone: 'amber', icon: Waves, description: 'Completed stages in active well.' },
      { label: 'Sand inventory', value: `${formatNumber(14600 + wave(tick, 7, 300), 0)} t`, delta: '14h cover', tone: 'rose', icon: Truck, description: 'Available sand and inbound logistics.' },
      { label: 'Water pumped', value: `${formatNumber(43800 + wave(tick, 8, 760), 0)} m³`, delta: '63% well', tone: 'cyan', icon: Droplets, description: 'Water used in stimulation.' },
      { label: 'Pump diesel', value: `${formatNumber(11000 + wave(tick, 9, 90), 0)} L/stg`, delta: 'per stage', tone: 'amber', icon: Fuel, description: 'Diesel burn in high-pressure pumping.' },
    ],
    production: [
      { label: 'Current production', value: `${formatNumber(productionValue, 0)} ${oilGasUnit}`, delta: productMode === 'crude' ? '+1.2%' : '+0.8%', tone: 'emerald', icon: Activity, description: 'Live production across active pads.' },
      { label: 'Wells online', value: '42 / 48', delta: '+2 today', tone: 'emerald', icon: CheckCircle2, description: 'Active wells vs available wells.' },
      { label: 'Artificial lift', value: '18 wells', delta: '+3 watch', tone: 'cyan', icon: BatteryCharging, description: 'Wells under pump or gaslift support.' },
      { label: 'Pressure stability', value: `${formatNumber(94 + wave(tick, 10, 1), 0)}%`, delta: 'inside band', tone: 'emerald', icon: Gauge, description: 'Wellhead behavior compared to expected curves.' },
    ],
    gathering: [
      { label: 'Battery throughput', value: `${formatNumber(19000 + wave(tick, 11, 420), 0)} bbl/d`, delta: 'per plant', tone: 'cyan', icon: Factory, description: 'Average battery processing capacity.' },
      { label: 'Flowline pressure', value: `${formatNumber(38 + wave(tick, 12, 1.8), 1)} bar`, delta: scenario === 'constraint' ? 'watch' : 'normal', tone: scenario === 'constraint' ? 'amber' : 'emerald', icon: Gauge, description: 'Internal gathering pressure.' },
      { label: 'Oil cut', value: `${formatNumber(72 + wave(tick, 13, 1.3), 0)}%`, delta: '+0.4 pt', tone: 'emerald', icon: Droplets, description: 'Approximate oil fraction after separation.' },
      { label: 'Reconciliation', value: `${formatNumber(98.7 + wave(tick, 14, 0.15), 1)}%`, delta: 'matched', tone: 'emerald', icon: ShieldCheck, description: 'Measured vs expected volume alignment.' },
    ],
    treatment: [
      { label: 'PTC throughput', value: `${formatNumber(31500 + wave(tick, 15, 900), 0)} bbl/d`, delta: '+1.0%', tone: 'rose', icon: Factory, description: 'Crude treatment plant throughput.' },
      { label: 'PTG throughput', value: `${formatNumber(4_000_000 + wave(tick, 16, 40000), 0)} m³/d`, delta: 'in spec', tone: 'cyan', icon: RadioTower, description: 'Gas treatment plant processing.' },
      { label: 'Compression load', value: `${formatNumber(8000 + wave(tick, 17, 140), 0)} HP`, delta: '+2.1%', tone: 'amber', icon: Zap, description: 'Compressor horsepower currently required.' },
      { label: 'Trunk utilization', value: `${formatNumber(86 + mod.utilization * 0.5 + wave(tick, 18, 1.1), 0)}%`, delta: scenario === 'constraint' ? 'constraint' : 'normal', tone: scenario === 'constraint' ? 'amber' : 'emerald', icon: Route, description: 'Evacuation line capacity usage.' },
    ],
    storage: [
      { label: 'Storage fill', value: `${formatNumber(72 + wave(tick, 19, 1.4), 0)}%`, delta: '+2 pts', tone: 'cyan', icon: Factory, description: 'Tank farm inventory level.' },
      { label: 'Delivered today', value: `${formatNumber(130900 + wave(tick, 20, 1100), 0)} bbl`, delta: '+0.7%', tone: 'emerald', icon: Truck, description: 'Barrels delivered to terminal or customer.' },
      { label: 'Delivered cost', value: `USD ${formatNumber(43.1 + mod.cost + wave(tick, 21, 0.06), 1)}/bbl`, delta: scenario === 'constraint' ? '+2.8%' : '-0.2%', tone: scenario === 'constraint' ? 'rose' : 'cyan', icon: BarChart3, description: 'Cost accumulated from field to dispatch.' },
      { label: 'Net margin', value: `USD ${formatNumber(26.7 + mod.margin + wave(tick, 22, 0.1), 1)}/bbl`, delta: scenario === 'constraint' ? '-4.1%' : '+1.4%', tone: scenario === 'constraint' ? 'amber' : 'emerald', icon: DollarSign, description: 'Realized price less delivered cost.' },
    ],
    alerts: [
      { label: 'Critical delay', value: `${formatNumber(47 + wave(tick, 23, 3), 0)} min`, delta: 'red clock', tone: 'rose', icon: BellRing, description: 'Delay on the current critical path.' },
      { label: 'Assets exposed', value: '9 objects', delta: 'field render', tone: 'amber', icon: Satellite, description: 'Operational objects impacted by the alert.' },
      { label: 'Reroute headroom', value: `${formatNumber(18 + wave(tick, 24, 2), 0)}%`, delta: 'limited', tone: 'violet', icon: Route, description: 'Available capacity to bypass the constraint.' },
      { label: 'Recovery ETA', value: `${formatNumber(64 + wave(tick, 25, 5), 0)} min`, delta: 'with AI plan', tone: 'emerald', icon: Target, description: 'Estimated time to recover after recommendations.' },
    ],
  };
  return common[stage];
}

function getGasStageKPIs(stage: StageId, scenario: Scenario, tick: number): KPI[] {
  const mod = scenarioModifier(scenario);
  const common: Record<StageId, KPI[]> = {
    pad: [
      { label: 'Wellhead pressure', value: `${formatNumber(184 + wave(tick, 31, 4), 0)} bar`, delta: 'inside choke band', tone: 'cyan', icon: Gauge, description: 'Pad pressure before low-pressure gathering.' },
      { label: 'Hydrate margin', value: `${formatNumber(7.8 + wave(tick, 32, 0.5), 1)} °C`, delta: scenario === 'constraint' ? 'watch' : 'safe', tone: scenario === 'constraint' ? 'amber' : 'emerald', icon: Thermometer, description: 'Temperature buffer against hydrate formation.' },
      { label: 'Methanol cover', value: '19h', delta: '+4h inbound', tone: 'emerald', icon: Droplets, description: 'Chemical coverage for cold flowback and wet gas.' },
      { label: 'Pad handover', value: `${formatNumber(81 + wave(tick, 33, 2), 0)}%`, delta: 'to first gas', tone: 'cyan', icon: CheckCircle2, description: 'Gas pad readiness to hand over to production.' },
    ],
    drilling: [
      { label: 'Room sync latency', value: `${formatNumber(2.6 + Math.max(0, wave(tick, 34, 0.25)), 1)}s`, delta: 'rig + MWD + mud gas', tone: 'emerald', icon: Cpu, description: 'Delay across rig telemetry, downhole tools, mud gas and control-room ingestion.' },
      { label: 'Gas ROP vs plan', value: `${formatNumber(22.8 + wave(tick, 35, 1.8), 1)} m/h`, delta: '+0.4 vs offset', tone: 'cyan', icon: Pickaxe, description: 'Current drilling rate compared with gas-well prognosis and offsets.' },
      { label: 'MWD/LWD health', value: `${formatNumber(93.7 + wave(tick, 36, 0.9), 1)}%`, delta: 'survey live', tone: 'violet', icon: Satellite, description: 'Quality of downhole surveys, gamma/resistivity, vibration and mud-gas-aligned data.' },
      { label: 'Decision lag', value: `${formatNumber(19 + Math.max(0, mod.risk * 0.06) + wave(tick, 37, 1.3), 0)} min`, delta: scenario === 'constraint' ? 'too slow' : 'controlled', tone: scenario === 'constraint' ? 'amber' : 'emerald', icon: Clock3, description: 'Elapsed time between anomaly, multidisciplinary review and signed operating action.' },
    ],
    geosteering: [
      { label: 'Gas window offset', value: `${formatNumber(1.6 + wave(tick, 69, 0.3), 1)} m`, delta: 'target center', tone: 'cyan', icon: Target, description: 'Estimated distance between actual trajectory and gas-rich target center.' },
      { label: 'Mud gas correlation', value: `${formatNumber(88.5 + wave(tick, 70, 1.2), 1)}%`, delta: 'offset aligned', tone: 'emerald', icon: Wind, description: 'Correlation of live mud gas response with prognosis and neighboring wells.' },
      { label: 'DLS envelope', value: `${formatNumber(2.0 + wave(tick, 71, 0.15), 1)}°/30m`, delta: 'safe steer', tone: 'violet', icon: Route, description: 'Dogleg severity required to keep reservoir contact without mechanical penalty.' },
      { label: 'Steering lead', value: `${formatNumber(39 + wave(tick, 72, 4), 0)} min`, delta: 'before exit', tone: 'amber', icon: AlertTriangle, description: 'Time available before the gas lateral risks leaving the target window.' },
    ],
    drillstring: [
      { label: 'Hookload gap', value: `${formatNumber(19 + wave(tick, 73, 2), 0)} klbf`, delta: 'model mismatch', tone: scenario === 'constraint' ? 'rose' : 'amber', icon: Gauge, description: 'Difference between observed hookload and torque-and-drag model.' },
      { label: 'WOB transfer', value: `${formatNumber(77 + wave(tick, 74, 2), 0)}%`, delta: 'surface to bit', tone: 'cyan', icon: Target, description: 'Estimated portion of surface weight actually reaching the bit.' },
      { label: 'Low RPM time', value: `${formatNumber(3.9 + Math.max(0, mod.risk * 0.03) + wave(tick, 75, 0.4), 1)} h`, delta: 'conservative mode', tone: 'amber', icon: RefreshCw, description: 'Accumulated time drilling at reduced RPM due to uncertainty or vibration.' },
      { label: 'Cost exposure', value: `USD ${formatNumber(132 + Math.max(0, mod.risk * 1.7) + wave(tick, 76, 8), 0)}k`, delta: 'rig day-rate', tone: 'rose', icon: DollarSign, description: 'Estimated rig-rate exposure from lower ROP caused by RPM reduction.' },
    ],
    frac: [
      { label: 'Flowback gas', value: `${formatNumber(72 + wave(tick, 37, 5), 0)} km³/h`, delta: '+9%', tone: 'amber', icon: Wind, description: 'Early gas rate during clean-up and test separator routing.' },
      { label: 'Sand return', value: `${formatNumber(38 + wave(tick, 38, 7), 0)} kg/h`, delta: 'separator watch', tone: 'rose', icon: Truck, description: 'Proppant return that can erode chokes and separators.' },
      { label: 'Water recovery', value: `${formatNumber(43 + wave(tick, 39, 2), 0)}%`, delta: 'load cleanup', tone: 'cyan', icon: Droplets, description: 'Frac water recovery and liquids handling.' },
      { label: 'Choke stability', value: `${formatNumber(91 + wave(tick, 40, 1), 0)}%`, delta: 'safe drawdown', tone: 'emerald', icon: Gauge, description: 'Drawdown control protecting deliverability.' },
    ],
    production: [
      { label: 'Gas deliverability', value: `${formatNumber(4_120_000 + mod.production * 18000 + wave(tick, 41, 11000), 0)} m³/d`, delta: '+0.8%', tone: 'emerald', icon: Wind, description: 'Allocated gas rate across active pads.' },
      { label: 'Liquid loading', value: `${formatNumber(22 + wave(tick, 42, 2), 0)}%`, delta: '6 wells watch', tone: 'amber', icon: Droplets, description: 'Risk that liquids reduce gas velocity and well deliverability.' },
      { label: 'Backpressure', value: `${formatNumber(34 + wave(tick, 43, 1.2), 1)} bar`, delta: scenario === 'constraint' ? 'rising' : 'stable', tone: scenario === 'constraint' ? 'amber' : 'cyan', icon: Gauge, description: 'Gathering/compression pressure seen by producing wells.' },
      { label: 'Allocation conf.', value: `${formatNumber(94.4 + wave(tick, 44, 0.4), 1)}%`, delta: 'VFM matched', tone: 'emerald', icon: ShieldCheck, description: 'VFM, test separator and sales meter agreement.' },
    ],
    gathering: [
      { label: 'Suction pressure', value: `${formatNumber(34 + wave(tick, 45, 1.1), 1)} bar`, delta: 'LP header', tone: 'cyan', icon: Gauge, description: 'Low-pressure header health before compression.' },
      { label: 'Slug catcher', value: `${formatNumber(82 + wave(tick, 46, 4), 0)}%`, delta: scenario === 'constraint' ? 'watch' : 'normal', tone: scenario === 'constraint' ? 'amber' : 'emerald', icon: Factory, description: 'Liquids inventory and slug handling before treatment.' },
      { label: 'Linepack', value: `${formatNumber(212 + wave(tick, 47, 7), 0)} km³`, delta: '+3%', tone: 'emerald', icon: Route, description: 'Gas buffer inside the gathering system.' },
      { label: 'Acid gas watch', value: `${formatNumber(12 + wave(tick, 48, 1), 0)} idx`, delta: 'inside limits', tone: 'violet', icon: AlertTriangle, description: 'H2S / CO2 surveillance index.' },
    ],
    treatment: [
      { label: 'Compression load', value: `${formatNumber(8250 + wave(tick, 49, 120), 0)} HP`, delta: scenario === 'constraint' ? 'near limit' : '+2.1%', tone: scenario === 'constraint' ? 'rose' : 'amber', icon: Zap, description: 'Compressor horsepower required to move gas.' },
      { label: 'TEG circulation', value: `${formatNumber(18.4 + wave(tick, 50, 0.4), 1)} m³/h`, delta: 'dewpoint ctrl', tone: 'cyan', icon: Droplets, description: 'Glycol circulation supporting dehydration.' },
      { label: 'Water dew point', value: `${formatNumber(-12 + wave(tick, 51, 0.6), 1)} °C`, delta: 'sales spec', tone: 'emerald', icon: Thermometer, description: 'Water dew point after dehydration.' },
      { label: 'Recycle', value: `${formatNumber(9.6 + wave(tick, 52, 0.8), 1)}%`, delta: 'energy loss', tone: 'amber', icon: RefreshCw, description: 'Compressor recycle and wasted compression energy.' },
    ],
    storage: [
      { label: 'Nominations', value: `${formatNumber(97.6 + wave(tick, 53, 0.7), 1)}%`, delta: 'covered', tone: 'emerald', icon: DollarSign, description: 'Sales nominations covered by expected supply.' },
      { label: 'Export linepack', value: `${formatNumber(440 + wave(tick, 54, 9), 0)} km³`, delta: 'buffer ok', tone: 'cyan', icon: Route, description: 'Gas buffer at export connection.' },
      { label: 'Imbalance risk', value: `${formatNumber(3.2 + Math.max(0, mod.risk * 0.02) + wave(tick, 55, 0.3), 1)}%`, delta: scenario === 'certificate' ? 'watch' : 'low', tone: scenario === 'certificate' ? 'amber' : 'emerald', icon: ShieldCheck, description: 'Commercial imbalance exposure.' },
      { label: 'Gas margin', value: `USD ${formatNumber(46.8 + mod.margin + wave(tick, 56, 0.3), 1)}/k m³`, delta: '+1.4%', tone: 'emerald', icon: Target, description: 'Realized gas value after treatment and transport.' },
    ],
    alerts: [
      { label: 'Compressor delay', value: `${formatNumber(47 + wave(tick, 57, 3), 0)} min`, delta: 'critical', tone: 'rose', icon: BellRing, description: 'Restart drift on compressor train B.' },
      { label: 'Gas at risk', value: `${formatNumber(280000 + wave(tick, 58, 16000), 0)} m³/d`, delta: 'curtailment', tone: 'amber', icon: Wind, description: 'Potential gas curtailment if the train remains unavailable.' },
      { label: 'Dew point breach', value: `${formatNumber(18 + wave(tick, 59, 2), 0)}%`, delta: 'sales spec', tone: 'violet', icon: Thermometer, description: 'Probability of dew point breach under current bypass.' },
      { label: 'Bypass recovery', value: `${formatNumber(62 + wave(tick, 60, 4), 0)}%`, delta: 'parallel train', tone: 'emerald', icon: Route, description: 'Expected recovery using safe reroute to parallel train.' },
    ],
  };
  return common[stage];
}

function focusFromKPI(kpi: KPI, stage: StageId): FocusObject {
  return {
    id: `kpi-${stage}-${kpi.label}`,
    type: 'KPI drill-down',
    title: kpi.label,
    subtitle: kpi.description,
    tone: kpi.tone,
    metrics: [
      { label: 'Current value', value: kpi.value, tone: kpi.tone },
      { label: 'Delta', value: kpi.delta, tone: kpi.tone },
      { label: 'Source layer', value: stage === 'storage' ? 'Terminal + SAP + certificates' : stage === 'production' ? 'SCADA + PIMS + VFM' : stage === 'geosteering' ? 'MWD/LWD + offset wells + geology model' : stage === 'drillstring' ? 'Rig sensors + torque/drag model + DDR' : 'Operational telemetry' },
      { label: 'Recommended action', value: stage === 'geosteering' ? 'Validate target-window correction' : stage === 'drillstring' ? 'Validate RPM/WOB evidence' : stage === 'drilling' ? 'Open real-time room lineage' : 'Open root-cause lens' },
    ],
    insight: `The ${kpi.label.toLowerCase()} KPI is linked to the active ${STAGES.find((s) => s.id === stage)?.label} stage. The platform highlights the operational signals that move this value instead of treating it as a static dashboard number.`,
  };
}

function focusForObject(id: string, stage: StageId): FocusObject {
  const catalog: Record<string, FocusObject> = {
    'rt-room': {
      id,
      type: 'Real-time drilling room',
      title: 'Real-Time Drilling Operations',
      subtitle: 'Geologist/geosteerer, drilling engineer, directional, mud logging and AI assistant watching the same well by time and depth.',
      tone: 'violet',
      metrics: [
        { label: 'Signal latency', value: '2.4s', tone: 'emerald' },
        { label: 'Sources fused', value: 'Rig · MWD/LWD · Mud logging · DDR · offsets', tone: 'cyan' },
        { label: 'Active anomaly', value: 'RPM reduction under review', tone: 'amber' },
        { label: 'Decision lag', value: '18 min', tone: 'amber' },
      ],
      insight: 'This is the client-requested drilling room: live data, historical wells, geosteering and drilling decisions converge before an RPM reduction or trajectory correction becomes hidden NPT.',
    },
    'mwd-feed': {
      id,
      type: 'Downhole data feed',
      title: 'MWD/LWD live feed',
      subtitle: 'Surveys, toolface, gamma ray, resistivity, vibration, temperature and mud-pulse confidence.',
      tone: 'cyan',
      metrics: [
        { label: 'Data quality', value: '94.5%', tone: 'emerald' },
        { label: 'Gamma delay', value: '14m behind bit', tone: 'amber' },
        { label: 'Survey cadence', value: '92 sec', tone: 'cyan' },
        { label: 'Vibration flag', value: 'torsional watch', tone: 'amber' },
      ],
      insight: 'The tool does not always measure exactly at the bit. The dashboard explicitly shows spatial delay so the geosteerer does not overreact late to a boundary change.',
    },
    'ddr-context': {
      id,
      type: 'DDR / shift context',
      title: 'Manual report converted to event',
      subtitle: '“Bajamos RPM por vibración / incertidumbre de sarta” becomes a structured operating event.',
      tone: 'violet',
      metrics: [
        { label: 'Manual note', value: 'RPM reduced by driller', tone: 'amber' },
        { label: 'Duration linked', value: '3.6 h', tone: 'amber' },
        { label: 'ROP impact', value: '-6.8 m/h', tone: 'rose' },
        { label: 'Lesson stored', value: 'yes', tone: 'emerald' },
      ],
      insight: 'The system connects human context from DDRs with sensor evidence, so annualized losses from conservative parameters become visible and learnable.',
    },
    'sweet-spot': {
      id,
      type: 'Geosteering target',
      title: 'Sweet spot target window',
      subtitle: 'Formation top/base, planned path, actual path and uncertainty band.',
      tone: 'cyan',
      metrics: [
        { label: 'Target offset', value: '1.8 m', tone: 'cyan' },
        { label: 'Gamma/res match', value: '91.2%', tone: 'emerald' },
        { label: 'Steering lead', value: '42 min', tone: 'amber' },
        { label: 'Recommendation', value: 'hold / soft down-correction', tone: 'violet' },
      ],
      insight: 'The geosteerer sees whether the lateral is centered, near the roof, or near the base. Corrections are evaluated against mechanical dogleg constraints before execution.',
    },
    'offset-wells': {
      id,
      type: 'Historical correlation',
      title: 'Offset wells and prognosis match',
      subtitle: 'Live curves compared with neighboring wells, structural model and expected log response.',
      tone: 'emerald',
      metrics: [
        { label: 'Best offset', value: 'VM-114H', tone: 'emerald' },
        { label: 'Curve match', value: '88–92%', tone: 'cyan' },
        { label: 'Formation shift', value: '+1.6 m high', tone: 'amber' },
        { label: 'Uncertainty', value: 'medium', tone: 'amber' },
      ],
      insight: 'Historical wells are not decorative: they explain whether a live curve change is a real geological boundary, a fault/dip change or sensor noise.',
    },
    'bha-bit': {
      id,
      type: 'BHA / bit health',
      title: 'BHA, trépano and vibration state',
      subtitle: 'Bit, motor/RSS, stabilizers, MWD/LWD tools and shock/stick-slip indicators.',
      tone: 'amber',
      metrics: [
        { label: 'Stick-slip index', value: '62%', tone: 'amber' },
        { label: 'Downhole vibration', value: 'watch', tone: 'amber' },
        { label: 'Bit aggressiveness', value: 'controlled', tone: 'cyan' },
        { label: 'Tool hours', value: '118 h', tone: 'violet' },
      ],
      insight: 'The BHA view explains why a driller may lower RPM: protect tools and measurements, but quantify the ROP and cost trade-off.',
    },
    'hookload-wob': {
      id,
      type: 'Drillstring mechanics',
      title: 'Hookload, WOB and weight uncertainty',
      subtitle: 'Surface hookload, pick-up/slack-off, WOB transfer and torque-and-drag model gap.',
      tone: 'amber',
      metrics: [
        { label: 'Hookload gap', value: '18 klbf', tone: 'amber' },
        { label: 'WOB transfer', value: '78%', tone: 'cyan' },
        { label: 'Drag trend', value: '+6%', tone: 'amber' },
        { label: 'Stuck-pipe risk', value: 'low/watch', tone: 'emerald' },
      ],
      insight: 'This directly reflects the client pain point: uncertainty about how much the string weighs or how weight reaches the bit often triggers conservative RPM and slower drilling.',
    },
    'rpm-economics': {
      id,
      type: 'RPM economics',
      title: 'RPM reduction and annualized cost',
      subtitle: 'Lower RPM stabilizes risk but reduces ROP, meters drilled per hour and rig-time economics.',
      tone: 'rose',
      metrics: [
        { label: 'Low RPM time', value: '3.6 h', tone: 'amber' },
        { label: 'ROP loss', value: '24 m', tone: 'rose' },
        { label: 'Cost exposure', value: 'USD 126k', tone: 'rose' },
        { label: 'Annualized loss', value: 'USD 8.4M', tone: 'amber' },
      ],
      insight: 'The platform does not label conservative drilling as wrong; it makes the decision explicit, evidence-based and auditable before it compounds across the yearly campaign.',
    },
    'pad-surface': {
      id,
      type: 'Pad readiness',
      title: 'Pad LC-08 Surface Readiness',
      subtitle: 'Earthworks, compaction, access road and rig-entry gate.',
      tone: 'cyan',
      metrics: [
        { label: 'Readiness', value: '74%', tone: 'cyan' },
        { label: 'Footprint prepared', value: '34,500 m²' },
        { label: 'Diesel consumed', value: '8,240 L', tone: 'amber' },
        { label: 'Rig-entry ETA', value: '6.4 days', tone: 'emerald' },
      ],
      insight: 'The pad is on track, but the rig-entry gate is still sensitive to access road compaction and final water logistics.',
    },
    'earthmoving-fleet': {
      id,
      type: 'Fleet detail',
      title: 'Earthmoving Fleet',
      subtitle: 'Heavy equipment supporting location construction.',
      tone: 'amber',
      metrics: [
        { label: 'Units active', value: '17 / 21', tone: 'emerald' },
        { label: 'Diesel rate', value: '382 L/h', tone: 'amber' },
        { label: 'Idle time', value: '7.8%', tone: 'cyan' },
        { label: 'Area remaining', value: '8,920 m²' },
      ],
      insight: 'Reducing idle time by 2 points would protect the rig-entry window without adding machinery.',
    },
    'rig-03': {
      id,
      type: 'Rig control',
      title: 'Walking Rig R-03',
      subtitle: 'Drilling sequence across the active pad.',
      tone: 'violet',
      metrics: [
        { label: 'Measured depth', value: '4,820 m', tone: 'violet' },
        { label: 'Target depth', value: '6,000 m' },
        { label: 'Rate of penetration', value: '23 m/h', tone: 'cyan' },
        { label: 'Cycle time', value: '20.4 days', tone: 'emerald' },
      ],
      insight: 'Rig R-03 is ahead of the planned curve. The next risk is casing availability before the lateral section closes.',
    },
    'well-path': {
      id,
      type: 'Wellbore detail',
      title: 'Horizontal Well Profile',
      subtitle: 'Vertical section, landing curve and lateral reach.',
      tone: 'violet',
      metrics: [
        { label: 'Vertical section', value: '3,000 m' },
        { label: 'Lateral section', value: '2,920 m', tone: 'violet' },
        { label: 'Casing installed', value: '3,080 m' },
        { label: 'Mud volume', value: '1,420 m³' },
      ],
      insight: 'The well path is inside corridor. Deviations in the landing section should be monitored before the next walking move.',
    },
    'frac-spread': {
      id,
      type: 'Frac spread',
      title: 'High-Pressure Frac Spread',
      subtitle: 'Pumps, manifold, water, sand and diesel intensity.',
      tone: 'amber',
      metrics: [
        { label: 'Stage progress', value: '31 / 50', tone: 'amber' },
        { label: 'Water pumped', value: '43,800 m³', tone: 'cyan' },
        { label: 'Sand pumped', value: '7,400 t', tone: 'rose' },
        { label: 'Diesel per stage', value: '11,000 L/stg', tone: 'amber' },
      ],
      insight: 'The pumping spread is stable. Sand cover is the constraint to watch over the next 14 hours.',
    },
    'truck-queue': {
      id,
      type: 'Logistics flow',
      title: 'Sand / Water / Diesel Convoys',
      subtitle: 'Inbound logistics feeding the frac operation.',
      tone: 'rose',
      metrics: [
        { label: 'Sand trucks inbound', value: '118', tone: 'rose' },
        { label: 'Water trucks equivalent', value: '64', tone: 'cyan' },
        { label: 'Gate congestion', value: '11 min avg', tone: 'amber' },
        { label: 'Inventory cover', value: '14h', tone: 'amber' },
      ],
      insight: 'Gate congestion is not critical yet, but it is the earliest visible signal before a frac-stage delay.',
    },
    'well-pad': {
      id,
      type: 'Pad production',
      title: 'Pad VM-12 Live Wells',
      subtitle: 'Natural flow, artificial lift and tubing readiness.',
      tone: 'emerald',
      metrics: [
        { label: 'Wells online', value: '42 / 48', tone: 'emerald' },
        { label: 'Natural flow', value: '24 wells' },
        { label: 'Artificial lift', value: '18 wells', tone: 'cyan' },
        { label: 'Tubing installed', value: '2,760 m avg' },
      ],
      insight: 'Three wells are becoming lift candidates. Early intervention prevents production instability from reaching the gathering system.',
    },
    'battery-04': {
      id,
      type: 'Battery',
      title: 'Battery B-04 Separation',
      subtitle: 'Oil, gas and water split before treatment.',
      tone: 'cyan',
      metrics: [
        { label: 'Throughput', value: '19,000 bbl/d', tone: 'cyan' },
        { label: 'Utilization', value: '91%', tone: 'amber' },
        { label: 'Oil cut', value: '72%', tone: 'emerald' },
        { label: 'Water separated', value: '8.2%' },
      ],
      insight: 'Battery B-04 is the most likely upstream bottleneck if two more wells come online before the next evacuation window.',
    },
    'trunk-route': {
      id,
      type: 'Evacuation route',
      title: 'Neuquén → Puerto Rosales Trunk Route',
      subtitle: 'Measured flow, density, certificates and delivered cost.',
      tone: 'rose',
      metrics: [
        { label: 'Trunk flow', value: '132.5k bbl/d', tone: 'cyan' },
        { label: 'Utilization', value: '86%', tone: 'amber' },
        { label: 'Density', value: '0.844 kg/L' },
        { label: 'Delivered cost', value: 'USD 43.1/bbl', tone: 'rose' },
      ],
      insight: 'The trunk is stable but close enough to constraint that upstream scale-up should be evaluated against contracted capacity.',
    },
    'certificate-20211': {
      id,
      type: 'Certificate',
      title: 'Volumetric Certificate 20211',
      subtitle: 'March 01–05 measured volume and density validation.',
      tone: 'violet',
      metrics: [
        { label: 'Certified volume', value: '5,980 m³', tone: 'cyan' },
        { label: 'Density', value: '0.844 kg/L' },
        { label: 'Status', value: 'Pending validation', tone: 'amber' },
        { label: 'Mismatch risk', value: 'Documentary, not physical', tone: 'emerald' },
      ],
      insight: 'The platform separates physical loss from documentary delay, preventing unnecessary operational escalation.',
    },
    'tank-farm': {
      id,
      type: 'Terminal storage',
      title: 'Puerto Rosales Tank Farm',
      subtitle: 'Inventory, blend status and outbound readiness.',
      tone: 'emerald',
      metrics: [
        { label: 'Storage fill', value: '72%', tone: 'cyan' },
        { label: 'Committed volume', value: '418k bbl' },
        { label: 'Batch readiness', value: '88%', tone: 'emerald' },
        { label: 'Net margin', value: 'USD 26.7/bbl', tone: 'emerald' },
      ],
      insight: 'Dispatch sequencing should favor high-netback batches before storage fill tightens the operating window.',
    },
  };
  return (
    catalog[id] || {
      id,
      type: 'Operational object',
      title: `${STAGES.find((s) => s.id === stage)?.label || 'Asset'} Detail`,
      subtitle: 'Contextual operational lens.',
      tone: 'cyan',
      metrics: [
        { label: 'Status', value: 'Live', tone: 'emerald' },
        { label: 'Signal quality', value: '96%', tone: 'cyan' },
        { label: 'Impact', value: 'Tracked' },
        { label: 'Recommendation', value: 'Open analysis' },
      ],
      insight: 'This object is connected to the active command layer and updates the stage-specific analytics.',
    }
  );
}

function ControlStyles() {
  return (
    <style>{`
      @keyframes flowDash { to { stroke-dashoffset: -96; } }
      @keyframes tickerMove { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      @keyframes scanMove { 0% { transform: translateY(-100%); opacity: .04; } 46% { opacity: .18; } 100% { transform: translateY(100%); opacity: .02; } }
      @keyframes shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
      @keyframes blinkSoft { 0%, 100% { opacity: .42; } 50% { opacity: 1; } }
      @keyframes pumpPulse { 0%, 100% { transform: scale(.94); opacity: .65; } 50% { transform: scale(1.08); opacity: 1; } }
      @keyframes truckMove { 0% { transform: translateX(-30px); opacity: .35; } 20% { opacity: 1; } 100% { transform: translateX(120px); opacity: .35; } }
      @keyframes verticalScan { 0% { transform: translateY(-30%); } 100% { transform: translateY(130%); } }
      @keyframes alertPing { 0% { transform: scale(.65); opacity: .85; } 78%, 100% { transform: scale(2.35); opacity: 0; } }
      @keyframes fieldSweep { 0% { transform: translateX(-120%) skewX(-16deg); opacity: 0; } 35% { opacity: .5; } 100% { transform: translateX(150%) skewX(-16deg); opacity: 0; } }
      @keyframes droneOrbit { 0% { transform: rotate(0deg) translateX(130px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(130px) rotate(-360deg); } }
      @keyframes flarePulse { 0%, 100% { transform: scaleY(.8); opacity: .55; filter: blur(.2px); } 50% { transform: scaleY(1.25); opacity: 1; filter: blur(.6px); } }
      @keyframes compressorVibrate { 0%, 100% { transform: translate(0,0); } 25% { transform: translate(.8px,-.5px); } 75% { transform: translate(-.8px,.5px); } }
      @keyframes isoTruck { 0% { transform: translate(-44px, 18px); opacity: .1; } 15% { opacity: 1; } 100% { transform: translate(190px, -82px); opacity: .1; } }
      @keyframes liquidPulse { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -120; } }
      .field-sweep::before { content: ''; position: absolute; top: -20%; bottom: -20%; left: 0; width: 32%; background: linear-gradient(90deg, transparent, rgba(103,232,249,.18), transparent); animation: fieldSweep 5.5s ease-in-out infinite; pointer-events: none; }
      .alert-ring { animation: alertPing 1.6s ease-out infinite; }
      .drone-orbit { animation: droneOrbit 12s linear infinite; transform-origin: center; }
      .flare-pulse { transform-origin: bottom; animation: flarePulse 1.1s ease-in-out infinite; }
      .compressor-vibrate { animation: compressorVibrate .22s linear infinite; }
      .iso-truck { animation: isoTruck 8s linear infinite; }
      .liquid-flow { stroke-dasharray: 12 14; animation: liquidPulse 3.2s linear infinite; }
      .control-room-compact { font-size: 13px; }
      .flow-dash { animation: flowDash 3.8s linear infinite; }
      .ticker-inner { width: max-content; animation: tickerMove 45s linear infinite; }
      .scan-shell::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent, rgba(103,232,249,.16), transparent); animation: scanMove 8s linear infinite; pointer-events: none; }
      .glass-shine::before { content: ''; position: absolute; inset: 0; background: linear-gradient(112deg, transparent 0%, rgba(255,255,255,.04) 42%, rgba(255,255,255,.14) 49%, transparent 58%); transform: translateX(-120%); animation: shimmer 9s ease-in-out infinite; pointer-events: none; }
      .tiny-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
      .tiny-scrollbar::-webkit-scrollbar-thumb { background: rgba(103,232,249,.28); border-radius: 999px; }
    `}</style>
  );
}

function TimeWindowSwitch({
  timeWindow,
  setTimeWindow,
  scenario,
  stage,
  tick,
}: {
  timeWindow: TimeWindow;
  setTimeWindow: (w: TimeWindow) => void;
  scenario: Scenario;
  stage: StageConfig;
  tick: number;
}) {
  const [open, setOpen] = useState(false);
  const active = TIME_WINDOW_DETAILS[timeWindow];
  const animatedChart = active.chart.map((value, index) => value + wave(tick, index + 2, 1.4));
  return (
    <div className="relative">
      <div className="flex rounded-2xl border border-white/10 bg-white/[0.04] p-1">
        {TIME_WINDOWS.map((window) => (
          <button
            key={window}
            onClick={() => {
              setTimeWindow(window);
              setOpen(true);
            }}
            className={`rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] transition ${
              timeWindow === window ? 'bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,.35)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            {window}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 8, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, scale: 0.96, filter: 'blur(8px)' }}
            className="absolute right-0 top-full z-[80] w-[360px] rounded-[28px] border border-cyan-200/15 bg-slate-950/95 p-4 shadow-[0_25px_100px_rgba(0,0,0,.65)] backdrop-blur-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">{active.title}</div>
                <div className="mt-1 text-lg font-semibold tracking-[-0.04em] text-white">{active.cadence}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{active.purpose}</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full border border-white/10 p-2 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {active.stats.map((stat) => (
                <div key={stat.label} className={`rounded-2xl border ${toneClasses(stat.tone).border} ${toneClasses(stat.tone).bg} p-3`}>
                  <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{stat.label}</div>
                  <div className={`mt-1 text-sm font-semibold ${toneClasses(stat.tone).text}`}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                <span>{stage.label}</span>
                <span className={toneClasses(stage.tone).text}>{SCENARIO_DETAILS[scenario].badge}</span>
              </div>
              <MiniSparkline data={animatedChart} tone={stage.tone} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScenarioModePicker({ scenario, setScenario, productMode }: { scenario: Scenario; setScenario: (s: Scenario) => void; productMode: ProductMode }) {
  const [open, setOpen] = useState(false);
  const active = SCENARIO_DETAILS[scenario];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className={`flex h-9 min-w-[190px] items-center justify-between gap-3 rounded-2xl border px-3 text-left text-xs transition ${toneClasses(active.tones[0]).border} ${toneClasses(active.tones[0]).bg} ${toneClasses(active.tones[0]).text}`}
      >
        <span className="min-w-0">
          <span className="block truncate font-black uppercase tracking-[0.12em]">{active.title}</span>
          <span className="block truncate text-[9px] uppercase tracking-[0.18em] text-slate-400">{active.badge}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 8, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, scale: 0.96, filter: 'blur(8px)' }}
            className="absolute right-0 top-full z-[90] w-[430px] rounded-[30px] border border-amber-200/15 bg-slate-950/96 p-3 shadow-[0_25px_100px_rgba(0,0,0,.7)] backdrop-blur-2xl"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200">operation modes</div>
                <div className="mt-1 text-xs text-slate-500">{productMode === 'gas' ? 'Gas modules use compressor, dew point, linepack and nominations.' : 'Crude modules use drilling room, geosteering, sarta/RPM, batteries, trunk and terminal.'}</div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full border border-white/10 p-2 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid gap-2">
              {SCENARIOS.map(({ id: mode }) => {
                const detail = SCENARIO_DETAILS[mode];
                const selected = scenario === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      setScenario(mode);
                      setOpen(false);
                    }}
                    className={`group rounded-2xl border p-3 text-left transition hover:bg-white/[0.07] ${
                      selected ? `${toneClasses(detail.tones[0]).border} ${toneClasses(detail.tones[0]).bg}` : 'border-white/10 bg-white/[0.035]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className={`text-sm font-semibold tracking-[-0.03em] ${selected ? toneClasses(detail.tones[0]).text : 'text-white'}`}>{detail.title}</div>
                        <div className="mt-1 text-xs leading-relaxed text-slate-400">{detail.description}</div>
                      </div>
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">{detail.badge}</span>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                      {detail.actions.map((action, idx) => (
                        <div key={action} className="rounded-xl border border-white/10 bg-slate-950/40 px-2 py-2 text-[10px] leading-tight text-slate-300">
                          <span className={toneClasses(detail.tones[idx] || 'cyan').text}>{idx + 1}.</span> {action}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Header({
  clock,
  stage,
  timeWindow,
  setTimeWindow,
  scenario,
  setScenario,
  productMode,
  setProductMode,
  autoPilot,
  setAutoPilot,
}: {
  clock: string;
  stage: StageConfig;
  timeWindow: TimeWindow;
  setTimeWindow: (w: TimeWindow) => void;
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
  productMode: ProductMode;
  setProductMode: (p: ProductMode) => void;
  autoPilot: boolean;
  setAutoPilot: (v: boolean) => void;
}) {
  return (
    <header className="relative z-50 border-b border-cyan-200/10 bg-slate-950/76 px-4 py-3 backdrop-blur-2xl lg:px-5">
      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] p-2 shadow-[0_0_28px_rgba(34,211,238,.14)]">
            <img src={LOGO_URL} alt="Pluspetrol" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold tracking-[-0.04em] text-white md:text-xl">Pluspetrol Operations Command v5</h1>
              <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] ${toneClasses(stage.tone).border} ${toneClasses(stage.tone).bg} ${toneClasses(stage.tone).text}`}>
                {productMode === 'gas' ? 'GAS FLOW' : 'CRUDE FLOW'} · {stage.short}
              </span>
            </div>
            <p className="mt-0.5 max-w-3xl text-[11px] text-slate-400">
              Compact 75% control room · {stage.label}: {stage.operatingQuestion}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex h-9 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-[11px] text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.95)]" style={{ animation: 'blinkSoft 1.5s ease-in-out infinite' }} />
            <span className="font-black uppercase tracking-[0.12em]">Live</span>
            <span className="text-slate-600">·</span>
            <Clock3 className="h-3.5 w-3.5 text-cyan-200" />
            <span className="font-mono text-cyan-100">{clock}</span>
          </div>

          <TimeWindowSwitch timeWindow={timeWindow} setTimeWindow={setTimeWindow} scenario={scenario} stage={stage} tick={Number(clock.slice(-2)) || 0} />

          <div className="flex h-9 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
            {(['crude', 'gas'] as ProductMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setProductMode(mode)}
                className={`rounded-xl px-3 text-[10px] font-black uppercase tracking-[0.14em] transition ${
                  productMode === mode ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <ScenarioModePicker scenario={scenario} setScenario={setScenario} productMode={productMode} />

          <button
            onClick={() => setAutoPilot(!autoPilot)}
            className={`flex h-9 items-center gap-2 rounded-2xl border px-3 text-[10px] font-black uppercase tracking-[0.16em] transition ${
              autoPilot ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100' : 'border-white/10 bg-white/[0.04] text-slate-300 hover:text-white'
            }`}
          >
            {autoPilot ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            Demo
          </button>
        </div>
      </div>
    </header>
  );
}

function ExecutiveRibbon({
  stage,
  scenario,
  tick,
  productMode,
  onFocus,
  onOpenAlert,
}: {
  stage: StageId;
  scenario: Scenario;
  tick: number;
  productMode: ProductMode;
  onFocus: (focus: FocusObject) => void;
  onOpenAlert: () => void;
}) {
  const mod = scenarioModifier(scenario);
  const activeCatalog = getStageCatalog(productMode);
  const metrics = [
    {
      label: productMode === 'crude' ? 'Total field production' : 'Gas deliverability',
      value:
        productMode === 'crude'
          ? `${formatNumber(182450 + mod.production * 1300 + wave(tick, 1, 740), 0)} bbl/d`
          : `${formatNumber(4_120_000 + mod.production * 14000 + wave(tick, 1, 9000), 0)} m³/d`,
      tone: 'emerald' as Tone,
      icon: productMode === 'crude' ? Activity : Wind,
      description: productMode === 'crude' ? 'Crude pad to trunk production.' : 'Allocated sales-quality and constrained gas deliverability.',
    },
    { label: productMode === 'crude' ? 'Drilled meters 24h' : 'Gas lateral meters', value: productMode === 'crude' ? `${formatNumber(412 + wave(tick, 4, 18), 0)} m` : `${formatNumber(386 + wave(tick, 4, 16), 0)} m`, tone: 'amber' as Tone, icon: Pickaxe, description: 'Drilling progress linked to ROP, WOB, RPM and directional decisions.' },
    { label: productMode === 'crude' ? 'Evacuation utilization' : 'Compression load', value: productMode === 'crude' ? `${formatNumber(86 + mod.utilization * 0.5 + wave(tick, 5, 1), 0)}%` : `${formatNumber(82 + mod.utilization * 0.45 + wave(tick, 5, 1.2), 0)}%`, tone: scenario === 'constraint' ? ('amber' as Tone) : ('cyan' as Tone), icon: productMode === 'crude' ? Route : Zap, description: 'Capacity pressure in the physical evacuation path.' },
    { label: productMode === 'crude' ? 'Delivered margin' : 'Gas netback', value: productMode === 'crude' ? `USD ${formatNumber(26.7 + mod.margin + wave(tick, 6, 0.15), 1)}/bbl` : `USD ${formatNumber(46.8 + mod.margin + wave(tick, 6, 0.2), 1)}/k m³`, tone: scenario === 'constraint' ? ('amber' as Tone) : ('emerald' as Tone), icon: DollarSign, description: 'Commercial value after field, treatment and transport.' },
  ];

  const clocks = [
    { label: 'Drilling slot', value: '02:14', status: 'ahead', tone: 'emerald' as Tone, percent: 72, icon: Pickaxe, action: null as null | (() => void) },
    { label: 'RPM slowdown', value: '00:47', status: 'critical', tone: 'rose' as Tone, percent: 92, icon: BellRing, action: onOpenAlert },
    { label: 'Sweet spot', value: '05:31', status: 'watch', tone: 'amber' as Tone, percent: 64, icon: Target, action: null as null | (() => void) },
    { label: 'Nomination', value: '11:08', status: 'safe', tone: 'cyan' as Tone, percent: 48, icon: Clock3, action: null as null | (() => void) },
  ];

  return (
    <div className="grid gap-3 2xl:grid-cols-[1.25fr_.95fr]">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          const tone = toneClasses(metric.tone);
          const spark = generateSeries(stage, 'Live', idx, tick, scenario).slice(-14);
          return (
            <button
              key={metric.label}
              onClick={() =>
                onFocus({
                  id: `executive-${metric.label}`,
                  type: 'Executive KPI',
                  title: metric.label,
                  subtitle: metric.description,
                  tone: metric.tone,
                  metrics: [
                    { label: 'Current value', value: metric.value, tone: metric.tone },
                    { label: 'Active module', value: activeCatalog.find((s) => s.id === stage)?.label || '' },
                    { label: 'Mode', value: SCENARIO_DETAILS[scenario].title },
                    { label: 'Source confidence', value: '94%', tone: 'emerald' },
                  ],
                  insight: 'The executive KPI is traceable to the active operational module, so clicking it opens the signal lineage instead of leaving a static number.',
                })
              }
              className={`glass-shine relative overflow-hidden rounded-[22px] border ${tone.border} bg-white/[0.045] p-3 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.07] ${tone.glow}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${tone.bg} ${tone.text}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${tone.border} ${tone.text}`}>{SCENARIO_DETAILS[scenario].badge}</span>
              </div>
              <div className="mt-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">{metric.label}</div>
              <div className="mt-1 text-lg font-semibold tracking-[-0.04em] text-white">{metric.value}</div>
              <MiniSparkline data={spark} tone={metric.tone} />
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 2xl:grid-cols-4">
        {clocks.map((clock) => {
          const Icon = clock.icon;
          const tone = toneClasses(clock.tone);
          const clickable = !!clock.action;
          return (
            <button
              key={clock.label}
              onClick={() => clock.action?.()}
              className={`relative overflow-hidden rounded-[22px] border p-3 text-left transition ${tone.border} ${clock.status === 'critical' ? 'bg-rose-500/10 shadow-[0_0_44px_rgba(244,63,94,.24)]' : 'bg-white/[0.04] hover:bg-white/[0.07]'} ${clickable ? 'hover:-translate-y-0.5' : ''}`}
            >
              {clock.status === 'critical' && (
                <>
                  <span className="absolute right-4 top-4 h-3 w-3 rounded-full bg-rose-400" />
                  <span className="alert-ring absolute right-4 top-4 h-3 w-3 rounded-full border border-rose-300" />
                </>
              )}
              <div className="flex items-center gap-2">
                <div className={`grid h-10 w-10 place-items-center rounded-full ${tone.bg} ${tone.text}`} style={{ backgroundImage: `conic-gradient(${colorForTone(clock.tone)} ${clock.percent}%, rgba(255,255,255,.09) 0)` }}>
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-950">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">{clock.label}</div>
                  <div className={`text-base font-semibold tracking-[-0.04em] ${tone.text}`}>{clock.value}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-slate-500">
                <span>{clock.status}</span>
                {clickable ? <span className="text-rose-200">open field</span> : <span>clock</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StageNavigator({
  stages,
  activeStage,
  setActiveStage,
  setFocus,
  setAutoPilot,
}: {
  stages: StageConfig[];
  activeStage: StageId;
  setActiveStage: (stage: StageId) => void;
  setFocus: (focus: FocusObject) => void;
  setAutoPilot: (v: boolean) => void;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-slate-950/62 p-2.5 backdrop-blur-2xl">
      <div className="mb-2 flex items-center justify-between px-1">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">operating spine</div>
          <div className="mt-0.5 text-[10px] text-slate-500">Stage click navigates. Lens opens command.</div>
        </div>
        <Cpu className="h-4 w-4 text-cyan-200" />
      </div>
      <div className="space-y-1.5">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const active = activeStage === stage.id;
          const tone = toneClasses(stage.tone);
          return (
            <div
              key={stage.id}
              className={`group relative overflow-hidden rounded-2xl border transition ${
                active ? `${tone.border} ${tone.bg} ${tone.glow}` : 'border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]'
              }`}
            >
              <button
                onClick={() => {
                  setAutoPilot(false);
                  setActiveStage(stage.id);
                }}
                className="flex w-full items-center gap-2.5 p-2.5 pr-4 text-left"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-slate-950/50' : 'bg-white/[0.05]'} ${active ? tone.text : 'text-slate-300'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${active ? tone.text : 'text-slate-500'}`}>{String(idx + 1).padStart(2, '0')}</span>
                    <span className="truncate text-xs font-semibold text-white">{stage.label}</span>
                  </div>
                  <div className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">{stage.operatingQuestion}</div>
                </div>
              </button>
            </div>
          );
        })}
        {(() => {
          const activeConfig = stages.find(s => s.id === activeStage);
          if (!activeConfig) return null;
          const tone = toneClasses(activeConfig.tone);
          return (
            <div className={`mt-2 rounded-2xl border transition border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]`}>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setAutoPilot(false);
                  setFocus({
                    id: `stage-${activeConfig.id}`,
                    type: 'Stage command',
                    title: activeConfig.title,
                    subtitle: activeConfig.subtitle,
                    tone: activeConfig.tone,
                    metrics: [
                      { label: 'Stage', value: activeConfig.label, tone: activeConfig.tone },
                      { label: 'Operating command', value: activeConfig.command },
                      { label: 'Control question', value: activeConfig.operatingQuestion },
                      { label: 'Interaction', value: 'Lens opened intentionally', tone: 'emerald' },
                    ],
                    insight: `${activeConfig.label} drives the main visual layer, KPI panel and analytics charts. The command lens now opens only from this Lens button so navigation never blocks the central panel.`,
                  });
                }}
                className="flex w-full items-center justify-between p-2.5 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-950/50 ${tone.text}`}>
                    <Eye className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">Focus Lens</span>
                    <span className="text-[10px] text-slate-500">Open active command insight</span>
                  </div>
                </div>
                <div className={`rounded-xl border px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] ${tone.border} ${tone.text} bg-slate-950/50`}>
                  <Eye className="h-3 w-3 inline" /> Lens
                </div>
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function Hotspot({ x, y, tone = 'cyan', label, onClick }: { x: string; y: string; tone?: Tone; label: string; onClick: () => void }) {
  const toneDef = toneClasses(tone);
  return (
    <button className="absolute z-30 -translate-x-1/2 -translate-y-1/2 outline-none" style={{ left: x, top: y }} onClick={onClick}>
      <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.96 }} className="relative flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/82 px-3 py-2 text-xs font-bold text-white shadow-[0_12px_35px_rgba(0,0,0,.35)] backdrop-blur-xl">
        <span className={`absolute h-9 w-9 rounded-full ${toneDef.bg}`} style={{ animation: 'pumpPulse 2s ease-in-out infinite' }} />
        <span className={`relative h-2.5 w-2.5 rounded-full ${toneDef.dot} shadow-[0_0_10px_currentColor]`} />
        <span className="relative whitespace-nowrap">{label}</span>
      </motion.div>
    </button>
  );
}

function StageCanvas({ stage, scenario, tick, productMode, setFocus }: { stage: StageId; scenario: Scenario; tick: number; productMode: ProductMode; setFocus: (focus: FocusObject) => void }) {
  const config = getStageCatalog(productMode).find((s) => s.id === stage)!;
  const canvas =
    stage === 'alerts' ? (
      <FieldAlertView tick={tick} scenario={scenario} productMode={productMode} setFocus={setFocus} />
    ) : stage === 'drilling' ? (
      <RealtimeDrillingRoomView tick={tick} scenario={scenario} productMode={productMode} setFocus={(id) => setFocus(focusForObject(id, stage))} />
    ) : stage === 'geosteering' ? (
      <GeosteeringView tick={tick} scenario={scenario} productMode={productMode} setFocus={(id) => setFocus(focusForObject(id, stage))} />
    ) : stage === 'drillstring' ? (
      <DrillStringMechanicsView tick={tick} scenario={scenario} productMode={productMode} setFocus={(id) => setFocus(focusForObject(id, stage))} />
    ) : productMode === 'gas' ? (
      <GasValueChainCanvas stage={stage} scenario={scenario} tick={tick} setFocus={setFocus} />
    ) : (
      {
        pad: <PadConstructionView tick={tick} setFocus={(id) => setFocus(focusForObject(id, stage))} />,
        drilling: <RealtimeDrillingRoomView tick={tick} scenario={scenario} productMode={productMode} setFocus={(id) => setFocus(focusForObject(id, stage))} />,
        geosteering: <GeosteeringView tick={tick} scenario={scenario} productMode={productMode} setFocus={(id) => setFocus(focusForObject(id, stage))} />,
        drillstring: <DrillStringMechanicsView tick={tick} scenario={scenario} productMode={productMode} setFocus={(id) => setFocus(focusForObject(id, stage))} />,
        frac: <FracView tick={tick} setFocus={(id) => setFocus(focusForObject(id, stage))} scenario={scenario} />,
        production: <ProductionView tick={tick} setFocus={(id) => setFocus(focusForObject(id, stage))} productMode={productMode} />,
        gathering: <GatheringView tick={tick} setFocus={(id) => setFocus(focusForObject(id, stage))} scenario={scenario} />,
        treatment: <TreatmentEvacuationView tick={tick} setFocus={(id) => setFocus(focusForObject(id, stage))} scenario={scenario} />,
        storage: <StorageDispatchView tick={tick} setFocus={(id) => setFocus(focusForObject(id, stage))} scenario={scenario} />,
        alerts: <FieldAlertView tick={tick} scenario={scenario} productMode={productMode} setFocus={setFocus} />,
      }[stage]
    );

  return (
    <div className="scan-shell relative h-full min-h-[420px] overflow-hidden rounded-[28px] border border-cyan-200/15 bg-slate-950/60 shadow-[0_24px_90px_rgba(0,0,0,.58)] backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,.16),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(245,158,11,.12),transparent_24%),linear-gradient(135deg,rgba(15,23,42,.65),rgba(2,6,23,.72))]" />
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(103,232,249,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,.18) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />

      <div className="absolute left-4 top-4 z-40 max-w-[560px]">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] ${toneClasses(config.tone).border} ${toneClasses(config.tone).bg} ${toneClasses(config.tone).text}`}>{config.short} command mode</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-300">{SCENARIO_DETAILS[scenario].title}</span>
          {productMode === 'gas' && <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-200">gas modules</span>}
        </div>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.045em] text-white md:text-2xl">{config.title}</h2>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-400">{config.command}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${productMode}-${stage}`} initial={{ opacity: 0, scale: 0.985, filter: 'blur(8px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 0.985, filter: 'blur(8px)' }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
          {canvas}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function RealtimeDrillingRoomView({ tick, scenario, productMode, setFocus }: { tick: number; scenario: Scenario; productMode: ProductMode; setFocus: (id: string) => void }) {
  const mod = scenarioModifier(scenario);
  const rop = 23.4 + wave(tick, 4, 1.3) - Math.max(0, mod.risk * 0.025);
  const latency = 2.4 + Math.max(0, wave(tick, 3, 0.25));
  const decisionLag = 18 + Math.max(0, mod.risk * 0.06) + wave(tick, 6, 1.2);
  const streams = [
    { label: 'Rig sensors', value: 'WOB · RPM · torque · hookload', tone: 'violet' as Tone, x: 16, y: 72 },
    { label: 'MWD/LWD', value: 'survey · gamma · resistivity · vibration', tone: 'cyan' as Tone, x: 44, y: 61 },
    { label: 'Mud logging', value: productMode === 'gas' ? 'mud gas · cuttings · shows' : 'lithology · cuttings · gas', tone: 'emerald' as Tone, x: 55, y: 76 },
    { label: 'DDR / shift', value: 'manual cause · action · NPT', tone: 'amber' as Tone, x: 75, y: 69 },
  ];

  return (
    <div className="absolute inset-0 pt-[118px]">
      <svg viewBox="0 0 1000 560" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="roomWall" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#0f172a" stopOpacity="0.25" />
            <stop offset="1" stopColor="#4c1d95" stopOpacity="0.20" />
          </linearGradient>
          <filter id="roomGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect x="0" y="292" width="1000" height="268" fill="#0f172a" opacity="0.48" />
        <path d="M0 300 C180 276 300 318 486 294 C650 272 805 300 1000 278" stroke="#64748b" strokeOpacity="0.23" fill="none" />

        <g transform="translate(92 154)">
          <motion.g animate={{ x: [0, 10, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
            <path d="M10 144 L68 0 L126 144" fill="none" stroke="#a78bfa" strokeWidth="5" strokeLinecap="round" />
            <path d="M31 84 L105 84 M22 118 L116 118 M68 0 L68 174" stroke="#e9d5ff" strokeOpacity="0.45" strokeWidth="2" />
            <rect x="28" y="144" width="88" height="24" rx="6" fill="#1e1b4b" stroke="#a78bfa" />
            <rect x="48" y="170" width="48" height="26" rx="5" fill="#312e81" opacity="0.8" />
          </motion.g>
          <motion.path d="M68 170 C72 235 78 302 92 380 C118 414 190 414 282 390 C356 371 422 372 500 382" fill="none" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" filter="url(#roomGlow)" strokeDasharray="12 8" className="flow-dash" />
        </g>

        <path d="M 226 458 C 310 488 435 494 576 460 C 680 433 752 420 905 426" stroke="#22d3ee" strokeOpacity="0.25" strokeWidth="8" fill="none" strokeLinecap="round" />
        <motion.path d="M 226 458 C 310 488 435 494 576 460 C 680 433 752 420 905 426" stroke="#67e8f9" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="7 12" className="flow-dash" />

        <g transform="translate(600 126)">
          <rect x="0" y="0" width="325" height="190" rx="28" fill="url(#roomWall)" stroke="#22d3ee" strokeOpacity="0.24" />
          <rect x="18" y="24" width="92" height="54" rx="12" fill="#020617" stroke="#22d3ee" strokeOpacity="0.28" />
          <rect x="122" y="24" width="92" height="54" rx="12" fill="#020617" stroke="#34d399" strokeOpacity="0.24" />
          <rect x="226" y="24" width="76" height="54" rx="12" fill="#020617" stroke="#f59e0b" strokeOpacity="0.26" />
          <path d="M28 60 C44 45 58 69 74 52 C82 44 91 53 101 46" stroke="#22d3ee" fill="none" strokeWidth="2" />
          <path d="M132 62 C150 66 157 42 176 56 C188 65 198 53 208 58" stroke="#34d399" fill="none" strokeWidth="2" />
          <path d="M236 64 C248 46 260 72 273 52 C282 42 292 50 300 46" stroke="#f59e0b" fill="none" strokeWidth="2" />
          <text x="22" y="105" fill="#c4b5fd" fontSize="11" fontWeight="800" letterSpacing="2">GEOLOGIST / GEOSTEERER</text>
          <text x="22" y="128" fill="#67e8f9" fontSize="11" fontWeight="800" letterSpacing="2">DRILLING ENGINEER</text>
          <text x="22" y="151" fill="#fbbf24" fontSize="11" fontWeight="800" letterSpacing="2">HISTORICAL + DDR CONTEXT</text>
          <circle cx="280" cy="122" r="18" fill="#22d3ee" opacity="0.12" />
          <circle cx="280" cy="122" r="6" fill="#22d3ee" opacity="0.9" />
        </g>

        <path d="M 220 280 C 360 185 490 220 600 220" stroke="#a78bfa" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="8 12" className="flow-dash" fill="none" />
        <path d="M 300 458 C 448 355 490 274 600 236" stroke="#22d3ee" strokeOpacity="0.65" strokeWidth="2" strokeDasharray="8 12" className="flow-dash" fill="none" />
        <path d="M 514 430 C 560 345 625 288 678 280" stroke="#34d399" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="8 12" className="flow-dash" fill="none" />
      </svg>

      {streams.map((stream, idx) => (
        <button
          key={stream.label}
          onClick={() => setFocus(idx === 1 ? 'mwd-feed' : idx === 3 ? 'ddr-context' : 'rt-room')}
          className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-2xl border ${toneClasses(stream.tone).border} bg-slate-950/72 p-3 text-left backdrop-blur-xl transition hover:scale-105`}
          style={{ left: `${stream.x}%`, top: `${stream.y}%` }}
        >
          <div className={`text-[9px] font-black uppercase tracking-[0.16em] ${toneClasses(stream.tone).text}`}>{stream.label}</div>
          <div className="mt-1 max-w-[150px] text-[10px] leading-tight text-slate-300">{stream.value}</div>
        </button>
      ))}

      <Hotspot x="75%" y="36%" tone="violet" label="Sala RT" onClick={() => setFocus('rt-room')} />
      <Hotspot x="41%" y="81%" tone="cyan" label="MWD/LWD feed" onClick={() => setFocus('mwd-feed')} />
      <Hotspot x="82%" y="72%" tone="amber" label="DDR event" onClick={() => setFocus('ddr-context')} />

      <div className="absolute bottom-4 left-4 right-4 z-30 grid gap-3 md:grid-cols-4">
        {[
          { label: 'Latency', value: `${formatNumber(latency, 1)}s`, tone: 'emerald' as Tone, icon: Cpu },
          { label: 'ROP vs offset', value: `${formatNumber(rop, 1)} m/h`, tone: 'cyan' as Tone, icon: Pickaxe },
          { label: 'Decision lag', value: `${formatNumber(decisionLag, 0)} min`, tone: scenario === 'constraint' ? 'amber' as Tone : 'emerald' as Tone, icon: Clock3 },
          { label: 'Structured context', value: '84%', tone: 'violet' as Tone, icon: Database },
        ].map((item) => {
          const Icon = item.icon;
          const tone = toneClasses(item.tone);
          return (
            <button key={item.label} onClick={() => setFocus(item.label === 'Structured context' ? 'ddr-context' : 'rt-room')} className={`rounded-2xl border ${tone.border} bg-slate-950/72 p-3 text-left backdrop-blur hover:bg-white/[0.06]`}>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500"><Icon className={`h-3.5 w-3.5 ${tone.text}`} /> {item.label}</div>
              <div className={`mt-1 text-base font-semibold ${tone.text}`}>{item.value}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GeosteeringView({ tick, scenario, productMode, setFocus }: { tick: number; scenario: Scenario; productMode: ProductMode; setFocus: (id: string) => void }) {
  const offset = 1.8 + wave(tick, 61, 0.35) + (scenario === 'constraint' ? 0.4 : 0);
  const match = productMode === 'gas' ? 88.5 + wave(tick, 70, 1.1) : 91.2 + wave(tick, 62, 1.0);
  const warning = Math.abs(offset) > 2.1 || scenario === 'constraint';
  const curve = Array.from({ length: 34 }, (_, i) => 38 + Math.sin(i * 0.52 + tick * 0.12) * 22 + (i > 20 ? 8 : 0));
  const points = curve.map((v, i) => `${35 + i * 7},${150 - v}`).join(' ');

  return (
    <div className="absolute inset-0 pt-[116px]">
      <svg viewBox="0 0 1000 560" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="geoLayerA" x1="0" x2="1">
            <stop offset="0" stopColor="#0f766e" stopOpacity="0.22" />
            <stop offset="1" stopColor="#1d4ed8" stopOpacity="0.12" />
          </linearGradient>
          <filter id="geoGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="0" y="250" width="1000" height="310" fill="#0f172a" opacity="0.52" />
        <path d="M0 334 C170 306 300 344 455 318 C620 289 760 314 1000 290 L1000 560 L0 560 Z" fill="#1e293b" opacity="0.38" />
        <path d="M0 385 C178 356 328 392 502 362 C678 332 786 354 1000 338 L1000 466 C780 490 646 468 510 494 C330 528 182 485 0 516 Z" fill="url(#geoLayerA)" stroke="#22d3ee" strokeOpacity="0.28" />
        <path d="M0 424 C208 392 352 432 530 402 C708 372 832 392 1000 374" stroke="#67e8f9" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="8 12" />
        <path d="M0 480 C208 456 352 490 530 464 C708 438 832 454 1000 432" stroke="#67e8f9" strokeOpacity="0.28" strokeWidth="2" strokeDasharray="8 12" />

        <path d="M 178 260 C 250 342 260 404 322 438 C 406 486 552 423 705 414 C 815 408 880 417 942 410" stroke="#c4b5fd" strokeWidth="3" strokeOpacity="0.45" strokeDasharray="10 12" fill="none" />
        <motion.path d="M 178 260 C 250 342 265 394 330 428 C 420 474 552 421 704 404 C 818 391 872 406 942 400" stroke={warning ? '#f59e0b' : '#22d3ee'} strokeWidth="5" strokeLinecap="round" fill="none" filter="url(#geoGlow)" initial={{ pathLength: 0.66 }} animate={{ pathLength: 0.94 }} transition={{ duration: 1.4 }} />
        <motion.circle cx="868" cy={warning ? 405 : 400} r="10" fill={warning ? '#f59e0b' : '#22d3ee'} animate={{ r: [8, 12, 8] }} transition={{ duration: 1.8, repeat: Infinity }} />
        <text x="610" y="384" fill="#67e8f9" fontSize="12" fontWeight="800" letterSpacing="3">SWEET SPOT / TARGET WINDOW</text>
        <text x="198" y="250" fill="#c4b5fd" fontSize="12" fontWeight="800" letterSpacing="3">BUILD + LANDING</text>

        <g transform="translate(46 118)">
          <rect x="0" y="0" width="285" height="176" rx="24" fill="#020617" stroke="#22d3ee" strokeOpacity="0.18" />
          <text x="18" y="30" fill="#67e8f9" fontSize="11" fontWeight="800" letterSpacing="2">LIVE LOG CORRELATION</text>
          <polyline points={points} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M35 72 L270 72" stroke="#f59e0b" strokeOpacity="0.38" strokeDasharray="5 8" />
          <path d="M35 110 L270 110" stroke="#34d399" strokeOpacity="0.30" strokeDasharray="5 8" />
        </g>

        <g transform="translate(710 122)">
          <rect x="0" y="0" width="245" height="128" rx="22" fill="#020617" stroke="#34d399" strokeOpacity="0.18" />
          <text x="18" y="28" fill="#bbf7d0" fontSize="11" fontWeight="800" letterSpacing="2">OFFSET WELLS</text>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <path d={`M ${38 + i * 66} 96 C ${42 + i * 66} 72 ${48 + i * 66} 58 ${54 + i * 66} 38`} stroke={i === 1 ? '#34d399' : '#64748b'} strokeWidth="4" strokeLinecap="round" fill="none" opacity={i === 1 ? 0.9 : 0.45} />
              <circle cx={54 + i * 66} cy="38" r="6" fill={i === 1 ? '#34d399' : '#475569'} />
            </g>
          ))}
        </g>
      </svg>

      <Hotspot x="70%" y="73%" tone={warning ? 'amber' : 'cyan'} label="Sweet spot" onClick={() => setFocus('sweet-spot')} />
      <Hotspot x="81%" y="28%" tone="emerald" label="Offset wells" onClick={() => setFocus('offset-wells')} />
      <Hotspot x="29%" y="30%" tone="cyan" label={productMode === 'gas' ? 'Mud gas + GR' : 'GR + resistivity'} onClick={() => setFocus('mwd-feed')} />

      <div className="absolute bottom-4 left-4 right-4 z-30 grid gap-3 md:grid-cols-4">
        {[
          { label: productMode === 'gas' ? 'Gas-window offset' : 'Sweet-spot offset', value: `${formatNumber(offset, 1)} m`, tone: warning ? 'amber' as Tone : 'cyan' as Tone },
          { label: productMode === 'gas' ? 'Mud gas match' : 'Gamma/res match', value: `${formatNumber(match, 1)}%`, tone: 'emerald' as Tone },
          { label: 'DLS envelope', value: `${formatNumber(2.1 + wave(tick, 63, 0.12), 1)}°/30m`, tone: 'violet' as Tone },
          { label: 'Steering lead', value: `${formatNumber(warning ? 24 : 42, 0)} min`, tone: warning ? 'rose' as Tone : 'amber' as Tone },
        ].map((item) => (
          <button key={item.label} onClick={() => setFocus(item.label.includes('match') ? 'offset-wells' : 'sweet-spot')} className={`rounded-2xl border ${toneClasses(item.tone).border} bg-slate-950/72 p-3 text-left backdrop-blur hover:bg-white/[0.06]`}>
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">{item.label}</div>
            <div className={`mt-1 text-base font-semibold ${toneClasses(item.tone).text}`}>{item.value}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function DrillStringMechanicsView({ tick, scenario, productMode, setFocus }: { tick: number; scenario: Scenario; productMode: ProductMode; setFocus: (id: string) => void }) {
  const mod = scenarioModifier(scenario);
  const lowRpm = 3.6 + Math.max(0, mod.risk * 0.03) + wave(tick, 67, 0.3);
  const wobTransfer = 78 + wave(tick, 66, 2);
  const hookGap = 18 + Math.max(0, mod.risk * 0.08) + wave(tick, 65, 2);
  const cost = 126 + Math.max(0, mod.risk * 1.7) + wave(tick, 68, 8);
  const risk = scenario === 'constraint';
  const productLabel = productMode === 'gas' ? 'GAS WELL' : 'CRUDE WELL';

  return (
    <div className="absolute inset-0 pt-[118px]">
      <svg viewBox="0 0 1000 560" className="absolute inset-0 h-full w-full">
        <defs>
          <filter id="stringGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="0" y="282" width="1000" height="278" fill="#0f172a" opacity="0.52" />
        <path d="M0 290 C210 270 348 310 520 290 C725 266 840 300 1000 278" stroke="#64748b" strokeOpacity="0.22" fill="none" />

        <g transform="translate(172 142)">
          <path d="M0 140 L62 0 L124 140" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
          <path d="M22 78 L102 78 M15 112 L112 112 M62 0 L62 170" stroke="#fde68a" strokeOpacity="0.42" strokeWidth="2" />
          <rect x="20" y="140" width="92" height="24" rx="6" fill="#451a03" stroke="#f59e0b" />
          <motion.circle cx="62" cy="172" r="13" fill="#020617" stroke="#f59e0b" strokeWidth="3" animate={{ rotate: [0, 360] }} transition={{ duration: risk ? 2.8 : 1.6, repeat: Infinity, ease: 'linear' }} />
        </g>

        <motion.path d="M 234 306 C 240 374 254 428 318 458 C 430 510 552 438 700 424 C 802 414 875 430 940 420" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" opacity="0.18" />
        <motion.path d="M 234 306 C 240 374 254 428 318 458 C 430 510 552 438 700 424 C 802 414 875 430 940 420" fill="none" stroke={risk ? '#fb7185' : '#f59e0b'} strokeWidth="4" strokeLinecap="round" filter="url(#stringGlow)" strokeDasharray="10 9" className="flow-dash" />
        <motion.circle cx="840" cy="424" r="15" fill={risk ? '#fb7185' : '#f59e0b'} opacity="0.9" animate={{ scale: [0.88, 1.14, 0.88] }} transition={{ duration: 1.2, repeat: Infinity }} />
        <text x="650" y="402" fill="#fbbf24" fontSize="12" fontWeight="800" letterSpacing="3">{productLabel} · BHA + BIT · STICK-SLIP WATCH</text>

        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle key={i} cx={708 + i * 34} cy={424 + Math.sin(i) * 4} r={18 + i * 2} fill="none" stroke={risk ? '#fb7185' : '#f59e0b'} strokeOpacity={0.18 - i * 0.02} animate={{ r: [14 + i * 2, 24 + i * 2, 14 + i * 2] }} transition={{ duration: 1.6 + i * 0.2, repeat: Infinity }} />
        ))}

        <g transform="translate(46 122)">
          <rect x="0" y="0" width="318" height="166" rx="24" fill="#020617" stroke="#f59e0b" strokeOpacity="0.22" />
          <text x="18" y="30" fill="#fbbf24" fontSize="11" fontWeight="800" letterSpacing="2">SURFACE VS MODEL</text>
          <path d="M32 118 C80 90 128 136 176 82 C214 40 250 72 292 50" stroke="#22d3ee" strokeWidth="3" fill="none" />
          <path d="M32 126 C80 112 128 112 176 96 C214 82 250 78 292 68" stroke="#f59e0b" strokeWidth="3" strokeDasharray="8 8" fill="none" />
          <text x="34" y="150" fill="#94a3b8" fontSize="10">hookload observed vs torque/drag model</text>
        </g>

        <g transform="translate(680 126)">
          <rect x="0" y="0" width="270" height="172" rx="24" fill="#020617" stroke="#fb7185" strokeOpacity="0.22" />
          <text x="18" y="30" fill="#fecdd3" fontSize="11" fontWeight="800" letterSpacing="2">RPM DECISION TRACE</text>
          <path d="M24 62 L88 62 L88 112 L154 112 L154 88 L238 88" stroke="#fb7185" strokeWidth="4" fill="none" strokeLinecap="round" />
          <text x="26" y="52" fill="#cbd5e1" fontSize="10">150 RPM</text>
          <text x="94" y="128" fill="#fecdd3" fontSize="10">90 RPM conservative</text>
          <text x="164" y="80" fill="#bbf7d0" fontSize="10">recover gradually</text>
        </g>
      </svg>

      <Hotspot x="84%" y="76%" tone={risk ? 'rose' : 'amber'} label="BHA / trépano" onClick={() => setFocus('bha-bit')} />
      <Hotspot x="22%" y="36%" tone="amber" label="Hookload / WOB" onClick={() => setFocus('hookload-wob')} />
      <Hotspot x="78%" y="34%" tone="rose" label="RPM economics" onClick={() => setFocus('rpm-economics')} />

      <div className="absolute bottom-4 left-4 right-4 z-30 grid gap-3 md:grid-cols-4">
        {[
          { label: 'Hookload gap', value: `${formatNumber(hookGap, 0)} klbf`, tone: risk ? 'rose' as Tone : 'amber' as Tone, id: 'hookload-wob' },
          { label: 'WOB transfer', value: `${formatNumber(wobTransfer, 0)}%`, tone: 'cyan' as Tone, id: 'hookload-wob' },
          { label: 'Low RPM time', value: `${formatNumber(lowRpm, 1)} h`, tone: 'amber' as Tone, id: 'rpm-economics' },
          { label: 'Cost exposure', value: `USD ${formatNumber(cost, 0)}k`, tone: 'rose' as Tone, id: 'rpm-economics' },
        ].map((item) => (
          <button key={item.label} onClick={() => setFocus(item.id)} className={`rounded-2xl border ${toneClasses(item.tone).border} bg-slate-950/72 p-3 text-left backdrop-blur hover:bg-white/[0.06]`}>
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">{item.label}</div>
            <div className={`mt-1 text-base font-semibold ${toneClasses(item.tone).text}`}>{item.value}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function GasValueChainCanvas({ stage, scenario, tick, setFocus }: { stage: StageId; scenario: Scenario; tick: number; setFocus: (focus: FocusObject) => void }) {
  const critical = scenario === 'constraint' || stage === 'treatment';
  const gasRate = 4_120_000 + scenarioModifier(scenario).production * 18000 + wave(tick, 8, 12000);

  const openModule = (module: GasModule) => {
    setFocus({
      id: module.id,
      type: 'Gas module lens',
      title: module.label,
      subtitle: module.description,
      tone: module.risk === 'critical' || (critical && module.stage === 'treatment') ? 'rose' : module.tone,
      metrics: [
        { label: 'Current value', value: module.value, tone: module.tone },
        { label: 'Module stage', value: getStageCatalog('gas').find((s) => s.id === module.stage)?.label || module.stage, tone: module.tone },
        { label: 'Risk posture', value: module.risk === 'critical' || (critical && module.stage === 'treatment') ? 'critical' : module.risk, tone: module.risk === 'critical' ? 'rose' : module.risk === 'watch' ? 'amber' : 'emerald' },
        { label: 'Signal stack', value: module.stage === 'treatment' ? 'SCADA + compressor PLC + lab' : 'SCADA + VFM + historian' },
      ],
      insight:
        module.stage === 'treatment'
          ? 'Compression and dehydration are the gas equivalent of the evacuation bottleneck. Suction pressure, recycle, discharge temperature and dew point must be optimized together.'
          : 'The gas module is connected to the full flow path, so changes here propagate into linepack, nominations and sales gas quality.',
    });
  };

  return (
    <div className="absolute inset-0 pt-[118px]">
      <div className="absolute right-4 top-4 z-40 hidden w-[310px] rounded-[24px] border border-emerald-300/15 bg-slate-950/72 p-3 backdrop-blur-2xl xl:block">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-300">gas command flow</div>
            <div className="mt-1 text-lg font-semibold tracking-[-0.04em] text-white">{formatNumber(gasRate, 0)} m³/d</div>
          </div>
          <Wind className="h-5 w-5 text-emerald-200" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: 'Linepack', value: '212 km³', tone: 'cyan' as Tone },
            { label: 'Dew point', value: '-12 °C', tone: 'emerald' as Tone },
            { label: 'Recycle', value: '9.6%', tone: 'amber' as Tone },
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl border ${toneClasses(item.tone).border} ${toneClasses(item.tone).bg} p-2`}>
              <div className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
              <div className={`mt-1 text-xs font-semibold ${toneClasses(item.tone).text}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 1000 390" className="absolute inset-x-6 top-[180px] h-[230px] w-[calc(100%-48px)] overflow-visible">
        <defs>
          <linearGradient id="gasPipeGradient" x1="0" x2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity=".35" />
            <stop offset="52%" stopColor="#34d399" stopOpacity=".82" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity=".55" />
          </linearGradient>
          <filter id="gasGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d="M 70 215 C 155 135 220 210 310 176 C 390 144 420 236 500 196 C 585 154 630 185 700 145 C 800 92 860 190 930 145" stroke="url(#gasPipeGradient)" strokeWidth="18" fill="none" strokeLinecap="round" opacity=".18" />
        <path d="M 70 215 C 155 135 220 210 310 176 C 390 144 420 236 500 196 C 585 154 630 185 700 145 C 800 92 860 190 930 145" stroke="url(#gasPipeGradient)" strokeWidth="4" fill="none" strokeLinecap="round" filter="url(#gasGlow)" className="liquid-flow" />
        {Array.from({ length: 8 }, (_, index) => (
          <motion.circle
            key={index}
            r="5"
            fill={index % 3 === 0 ? '#34d399' : '#22d3ee'}
            opacity=".88"
            style={{ filter: 'drop-shadow(0 0 10px rgba(34,211,238,.8))' }}
            initial={false}
          >
            <animateMotion dur={`${8 + index * 0.35}s`} repeatCount="indefinite" begin={`${index * 0.65}s`} path="M 70 215 C 155 135 220 210 310 176 C 390 144 420 236 500 196 C 585 154 630 185 700 145 C 800 92 860 190 930 145" />
          </motion.circle>
        ))}
      </svg>

      <div className="absolute inset-0">
        {GAS_MODULES.map((module, idx) => {
          const active = module.stage === stage;
          const riskTone: Tone = module.risk === 'critical' || (critical && module.stage === 'treatment') ? 'rose' : module.risk === 'watch' ? 'amber' : module.tone;
          const tone = toneClasses(riskTone);
          return (
            <button
              key={module.id}
              onClick={() => openModule(module)}
              className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-[22px] border p-3 text-left transition hover:-translate-y-[55%] hover:bg-white/[0.08] ${active ? `${tone.border} ${tone.bg} ${tone.glow}` : 'border-white/10 bg-slate-950/72'} `}
              style={{ left: `${module.x}%`, top: `${module.y + 10}%`, width: active ? 170 : 138 }}
            >
              {(module.risk === 'critical' || (critical && module.stage === 'treatment')) && (
                <>
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-rose-400" />
                  <span className="alert-ring absolute -right-1 -top-1 h-3 w-3 rounded-full border border-rose-300" />
                </>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${tone.border} ${tone.text}`}>{module.short}</span>
                <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
              </div>
              <div className="mt-2 text-xs font-semibold text-white">{module.label}</div>
              <div className={`mt-1 text-sm font-semibold tracking-[-0.03em] ${tone.text}`}>{module.value}</div>
              {active && <MiniGauge value={module.risk === 'critical' ? 92 : module.risk === 'watch' ? 74 : 58} tone={riskTone} />}
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-30 grid gap-3 md:grid-cols-4">
        {[
          { label: 'Compressor train B', value: critical ? 'critical' : 'available', tone: critical ? 'rose' : 'emerald', icon: Zap },
          { label: 'Hydrate protection', value: '7.8 °C margin', tone: 'cyan', icon: Thermometer },
          { label: 'Sales spec', value: 'dew point ok', tone: 'emerald', icon: ShieldCheck },
          { label: 'Field flare', value: critical ? 'standby' : 'idle', tone: critical ? 'amber' : 'slate', icon: Flame },
        ].map((item) => {
          const Icon = item.icon;
          const tone = toneClasses(item.tone as Tone);
          return (
            <div key={item.label} className={`rounded-2xl border ${tone.border} bg-slate-950/68 p-3 backdrop-blur`}>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
                <Icon className={`h-3.5 w-3.5 ${tone.text}`} /> {item.label}
              </div>
              <div className={`mt-1 text-sm font-semibold ${tone.text}`}>{item.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FieldAlertView({ tick, scenario, productMode, setFocus }: { tick: number; scenario: Scenario; productMode: ProductMode; setFocus: (focus: FocusObject) => void }) {
  const criticalLabel = 'RPM reduction delay under drillstring weight uncertainty';
  const assets = [
    { id: 'pad-a', label: 'Rig floor', x: 18, y: 42, tone: 'cyan' as Tone, status: 'stable', icon: Layers, metric: 'live floor' },
    { id: 'rig-stand', label: 'Top drive / hook', x: 28, y: 30, tone: 'violet' as Tone, status: 'ahead', icon: Pickaxe, metric: '02:14 ahead' },
    { id: 'frac-spread-alert', label: 'BHA vibration', x: 38, y: 52, tone: 'rose' as Tone, status: 'critical', icon: Waves, metric: 'stick-slip' },
    { id: 'sand-yard', label: 'Mud system', x: 48, y: 68, tone: 'amber' as Tone, status: 'watch', icon: Droplets, metric: 'pressure watch' },
    { id: 'separator', label: 'MWD/LWD feed', x: 58, y: 46, tone: 'cyan' as Tone, status: 'watch', icon: Satellite, metric: '94.5% quality' },
    { id: 'compressor', label: 'RPM decision', x: 70, y: 38, tone: 'rose' as Tone, status: 'critical', icon: RefreshCw, metric: '00:47 delay' },
    { id: 'flare', label: 'DDR context', x: 77, y: 62, tone: 'amber' as Tone, status: 'standby', icon: Database, metric: 'manual note' },
    { id: 'export', label: 'Sweet spot path', x: 88, y: 48, tone: 'emerald' as Tone, status: 'safe', icon: Route, metric: 'in window' },
  ];

  const openAsset = (asset: (typeof assets)[number]) => {
    setFocus({
      id: `field-alert-${asset.id}`,
      type: asset.status === 'critical' ? 'Critical alert object' : 'Aerial field object',
      title: asset.label,
      subtitle: asset.id === 'compressor' ? criticalLabel : 'Aerial/isometric drilling object connected to the critical operations clock.',
      tone: asset.tone,
      metrics: [
        { label: 'Status', value: asset.status, tone: asset.tone },
        { label: 'Metric', value: asset.metric, tone: asset.tone },
        { label: 'Scenario', value: SCENARIO_DETAILS[scenario].title },
        { label: 'Action', value: asset.status === 'critical' ? 'Validate WOB/RPM evidence + ramp recovery' : 'Continue surveillance', tone: asset.status === 'critical' ? 'rose' : 'emerald' },
      ],
      insight:
        asset.status === 'critical'
          ? 'This object is on the drilling critical path. The recommended workflow is to isolate the hookload/WOB mismatch, validate vibration evidence, ramp RPM only when safe and record the economic impact.'
          : 'This object is visible in the aerial layer because it can amplify or absorb the critical path delay.',
    });
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute right-4 top-4 z-50 w-[340px] rounded-[22px] border border-rose-300/25 bg-rose-950/22 p-4 shadow-[0_0_70px_rgba(244,63,94,.18)] backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-rose-200">
              <BellRing className="h-3.5 w-3.5" /> critical operations clock
            </div>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.045em] text-white">{criticalLabel}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">Aerial operations render isolates the delaying object, the propagation path and the safest recovery sequence.</p>
          </div>
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-rose-300/35 bg-rose-400/10 text-rose-100" style={{ backgroundImage: 'conic-gradient(#fb7185 84%, rgba(255,255,255,.08) 0)' }}>
            <div className="text-center">
              <div className="text-lg font-bold leading-none">47</div>
              <div className="text-[8px] font-black uppercase tracking-[0.12em]">min</div>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Objects', value: '8', tone: 'cyan' as Tone },
            { label: 'At risk', value: '24 m / 3.6 h', tone: 'amber' as Tone },
            { label: 'ETA', value: '64 min', tone: 'emerald' as Tone },
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl border ${toneClasses(item.tone).border} ${toneClasses(item.tone).bg} p-2`}>
              <div className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
              <div className={`mt-1 text-sm font-semibold ${toneClasses(item.tone).text}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute left-1/2 top-[56%] h-[520px] w-[860px] -translate-x-1/2 -translate-y-1/2">
        <div className="drone-orbit absolute left-1/2 top-1/2 z-50 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/35 bg-cyan-300/10 shadow-[0_0_24px_rgba(34,211,238,.32)]">
          <Satellite className="m-2 h-5 w-5 text-cyan-100" />
        </div>

        <div className="field-sweep absolute inset-0 rounded-[44px] border border-cyan-200/10 bg-gradient-to-br from-emerald-950/20 via-slate-900/50 to-cyan-950/20 shadow-[0_30px_140px_rgba(0,0,0,.55)]" style={{ transform: 'perspective(980px) rotateX(58deg) rotateZ(-28deg)', transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-8 rounded-[34px] border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] bg-[length:44px_44px]" />
          <svg viewBox="0 0 860 520" className="absolute inset-0 h-full w-full overflow-visible">
            <path d="M 120 225 C 240 160 320 290 435 230 C 540 175 610 250 745 210" stroke="#22d3ee" strokeWidth="8" strokeOpacity=".16" fill="none" strokeLinecap="round" />
            <path d="M 120 225 C 240 160 320 290 435 230 C 540 175 610 250 745 210" stroke={productMode === 'gas' ? '#34d399' : '#38bdf8'} strokeWidth="3" strokeOpacity=".8" fill="none" strokeLinecap="round" className="liquid-flow" />
            <path d="M 340 300 L 420 360 L 520 326 L 645 352" stroke="#f59e0b" strokeWidth="2" strokeOpacity=".55" strokeDasharray="10 10" className="liquid-flow" fill="none" />
            <path d="M 520 200 L 605 120 L 700 160" stroke="#fb7185" strokeWidth="3" strokeOpacity=".8" strokeDasharray="12 10" className="liquid-flow" fill="none" />
          </svg>

          <div className="iso-truck absolute left-[20%] top-[68%] z-20 h-4 w-9 rounded bg-amber-300/70 shadow-[0_0_14px_rgba(245,158,11,.5)]" />
          <div className="iso-truck absolute left-[34%] top-[72%] z-20 h-4 w-9 rounded bg-cyan-300/65 shadow-[0_0_14px_rgba(34,211,238,.4)]" style={{ animationDelay: '2.4s' }} />

          {assets.map((asset) => {
            const Icon = asset.icon;
            const tone = toneClasses(asset.tone);
            return (
              <button
                key={asset.id}
                onClick={() => openAsset(asset)}
                className={`absolute z-40 -translate-x-1/2 -translate-y-1/2 rounded-2xl border ${tone.border} ${asset.status === 'critical' ? 'bg-rose-500/18 shadow-[0_0_30px_rgba(244,63,94,.38)]' : 'bg-slate-950/82'} p-2 text-left backdrop-blur transition hover:scale-105`}
                style={{ left: `${asset.x}%`, top: `${asset.y}%`, transform: 'translate(-50%, -50%) rotateZ(28deg) rotateX(-58deg)' }}
              >
                {asset.status === 'critical' && (
                  <>
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-rose-400" />
                    <span className="alert-ring absolute -right-1 -top-1 h-3 w-3 rounded-full border border-rose-300" />
                  </>
                )}
                <div className="flex items-center gap-2">
                  <div className={`grid h-8 w-8 place-items-center rounded-xl ${tone.bg} ${tone.text} ${asset.id === 'compressor' ? 'compressor-vibrate' : ''}`}>
                    <Icon className={`h-4 w-4 ${asset.id === 'flare' ? 'flare-pulse' : ''}`} />
                  </div>
                  <div>
                    <div className="whitespace-nowrap text-[10px] font-semibold text-white">{asset.label}</div>
                    <div className={`text-[9px] font-black uppercase tracking-[0.12em] ${tone.text}`}>{asset.metric}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-40 grid w-[min(760px,calc(100%-32px))] gap-3 md:grid-cols-4">
        {[
          { label: '1 isolate', value: 'Hookload / WOB mismatch', tone: 'rose' as Tone },
          { label: '2 verify', value: 'Vibration + torque evidence', tone: 'amber' as Tone },
          { label: '3 protect', value: 'BHA + MWD signal', tone: 'cyan' as Tone },
          { label: '4 recover', value: '64 min ETA', tone: 'emerald' as Tone },
        ].map((step) => (
          <div key={step.label} className={`rounded-2xl border ${toneClasses(step.tone).border} bg-slate-950/72 p-3 backdrop-blur-2xl`}>
            <div className={`text-[9px] font-black uppercase tracking-[0.18em] ${toneClasses(step.tone).text}`}>{step.label}</div>
            <div className="mt-1 text-xs font-semibold text-white">{step.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PadConstructionView({ tick, setFocus }: { tick: number; setFocus: (id: string) => void }) {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 1000 560" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="padTerrain" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0f766e" stopOpacity="0.22" />
            <stop offset="1" stopColor="#f59e0b" stopOpacity="0.12" />
          </linearGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M 140 360 C 220 245 410 205 610 230 C 760 248 865 330 880 420 C 690 500 345 510 140 360 Z" fill="url(#padTerrain)" stroke="#67e8f9" strokeOpacity="0.2" />
        <motion.rect x="270" y="235" width="450" height="210" rx="16" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" opacity="0.9" animate={{ opacity: [0.78, 0.95, 0.78] }} transition={{ duration: 4, repeat: Infinity }} />
        <rect x="298" y="260" width="394" height="160" rx="12" fill="none" stroke="#e2e8f0" strokeOpacity="0.18" strokeDasharray="8 10" />
        <motion.rect x="298" y="260" width="290" height="160" rx="12" fill="#22d3ee" opacity="0.08" animate={{ width: 282 + Math.sin(tick * 0.3) * 10 }} />
        {Array.from({ length: 9 }, (_, i) => (
          <motion.g key={i} animate={{ x: [0, 35, 0] }} transition={{ duration: 4 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}>
            <rect x={180 + i * 75} y={440 + (i % 2) * 18} width="38" height="18" rx="5" fill="#f59e0b" opacity="0.75" />
            <circle cx={188 + i * 75} cy={462 + (i % 2) * 18} r="4" fill="#020617" />
            <circle cx={210 + i * 75} cy={462 + (i % 2) * 18} r="4" fill="#020617" />
          </motion.g>
        ))}
        <motion.path d="M 170 220 C 250 190 310 210 362 252" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 18" className="flow-dash" opacity="0.8" />
        <text x="735" y="270" fill="#67e8f9" fontSize="12" letterSpacing="3">RIG ENTRY GATE</text>
        <text x="320" y="342" fill="#f8fafc" fontSize="15" fontWeight="800" letterSpacing="1.6">PAD LC-08 · LOCATION UNDER CONSTRUCTION</text>
      </svg>
      <Hotspot x="49%" y="58%" tone="cyan" label="Pad surface" onClick={() => setFocus('pad-surface')} />
      <Hotspot x="22%" y="79%" tone="amber" label="Earthmoving fleet" onClick={() => setFocus('earthmoving-fleet')} />
      <Hotspot x="77%" y="49%" tone="emerald" label="Rig entry gate" onClick={() => setFocus('pad-surface')} />
      <div className="absolute bottom-7 right-7 grid w-[360px] gap-3 rounded-[28px] border border-white/10 bg-slate-950/72 p-4 backdrop-blur-2xl">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">construction telemetry</div>
        {[
          ['Execution time', '30 days / location', 64, 'cyan' as Tone],
          ['Diesel plan', '12,000 L', 69, 'amber' as Tone],
          ['Workforce', '25 workers', 88, 'emerald' as Tone],
        ].map(([label, value, gauge, tone]) => (
          <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div className="flex justify-between text-xs"><span className="text-slate-400">{label}</span><span className="font-semibold text-white">{value}</span></div>
            <MiniGauge value={Number(gauge)} tone={tone as Tone} />
          </div>
        ))}
      </div>
    </div>
  );
}

function DrillingView({ tick, setFocus }: { tick: number; setFocus: (id: string) => void }) {
  const progress = 0.74 + Math.sin(tick * 0.18) * 0.02;
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 1000 560" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="earth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0f172a" stopOpacity="0.1" />
            <stop offset="1" stopColor="#78350f" stopOpacity="0.26" />
          </linearGradient>
          <filter id="drillGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="0" y="275" width="1000" height="285" fill="url(#earth)" />
        <path d="M0 275 C200 250 310 292 500 272 C710 250 850 280 1000 260" stroke="#94a3b8" strokeOpacity="0.2" fill="none" />
        <g transform="translate(430 132)">
          <motion.g animate={{ x: [0, 22, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
            <path d="M0 135 L55 0 L112 135" fill="none" stroke="#a78bfa" strokeWidth="5" strokeLinecap="round" />
            <path d="M24 80 L90 80 M12 112 L100 112 M55 0 L55 160" stroke="#e9d5ff" strokeOpacity="0.45" strokeWidth="2" />
            <rect x="20" y="135" width="72" height="24" rx="5" fill="#1e1b4b" stroke="#a78bfa" />
            <circle cx="35" cy="165" r="7" fill="#020617" stroke="#a78bfa" />
            <circle cx="80" cy="165" r="7" fill="#020617" stroke="#a78bfa" />
          </motion.g>
        </g>
        <motion.path d="M 485 290 C 495 370 500 430 510 500 C 535 532 620 526 710 496 C 790 470 835 468 900 475" fill="none" stroke="#1e1b4b" strokeWidth="12" strokeLinecap="round" opacity="0.82" />
        <motion.path d="M 485 290 C 495 370 500 430 510 500 C 535 532 620 526 710 496 C 790 470 835 468 900 475" fill="none" stroke="#a78bfa" strokeWidth="5" strokeLinecap="round" filter="url(#drillGlow)" initial={{ pathLength: 0 }} animate={{ pathLength: progress }} transition={{ duration: 1.2 }} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M ${420 + i * 42} 288 C ${422 + i * 42} 382 ${430 + i * 44} 438 ${444 + i * 50} 492 C ${480 + i * 52} 515 ${570 + i * 54} 498 ${690 + i * 43} ${498 + i * 6}`} fill="none" stroke="#67e8f9" strokeOpacity={i === 1 ? 0.55 : 0.24} strokeWidth={i === 1 ? 3 : 2} />
        ))}
        <text x="70" y="330" fill="#94a3b8" fontSize="13" letterSpacing="3">SUBSURFACE PROFILE</text>
        <text x="660" y="452" fill="#a78bfa" fontSize="12" letterSpacing="3">LATERAL SECTION · 2,920m</text>
        <text x="330" y="392" fill="#a78bfa" fontSize="12" letterSpacing="3">VERTICAL · 3,000m</text>
      </svg>
      <Hotspot x="48%" y="29%" tone="violet" label="Walking rig R-03" onClick={() => setFocus('rig-03')} />
      <Hotspot x="72%" y="78%" tone="violet" label="Well path" onClick={() => setFocus('well-path')} />
      <div className="absolute bottom-7 right-7 w-[390px] rounded-[28px] border border-violet-300/20 bg-slate-950/72 p-4 backdrop-blur-2xl">
        <div className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">drilling progress</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Depth', '4,820m'],
            ['Target', '6,000m'],
            ['Crew', '58'],
          ].map(([l, v]) => (
            <div key={l} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center">
              <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{l}</div>
              <div className="mt-1 text-lg font-semibold text-white">{v}</div>
            </div>
          ))}
        </div>
        <MiniGauge value={progress * 100} tone="violet" />
      </div>
    </div>
  );
}

function FracView({ tick, setFocus, scenario }: { tick: number; setFocus: (id: string) => void; scenario: Scenario }) {
  const stages = 50;
  const completed = scenario === 'constraint' ? 29 : scenario === 'optimization' ? 34 : 31;
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 1000 560" className="absolute inset-0 h-full w-full">
        <defs>
          <filter id="fracGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <rect x="320" y="250" width="330" height="135" rx="24" fill="#0f172a" stroke="#f59e0b" strokeOpacity="0.45" />
        <path d="M 650 318 C 730 318 770 280 865 280" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" opacity="0.42" />
        <path d="M 650 318 C 730 318 770 280 865 280" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="3 18" className="flow-dash" opacity="0.9" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.g key={i} animate={{ scale: [0.96, 1.05, 0.96] }} transition={{ duration: 1.5 + i * 0.1, repeat: Infinity }}>
            <rect x={355 + i * 45} y="280" width="32" height="48" rx="7" fill="#7c2d12" stroke="#f59e0b" />
            <circle cx={371 + i * 45} cy="345" r="7" fill="#020617" stroke="#f59e0b" />
          </motion.g>
        ))}
        {[0, 1, 2, 3].map((row) => (
          <g key={row}>
            {Array.from({ length: 13 }, (_, col) => {
              const idx = row * 13 + col;
              const filled = idx < completed;
              return <circle key={idx} cx={80 + col * 23} cy={342 + row * 23} r="7" fill={filled ? '#f59e0b' : '#334155'} opacity={filled ? 0.95 : 0.45} filter={idx === completed - 1 ? 'url(#fracGlow)' : undefined} />;
            })}
          </g>
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <g key={i} style={{ animation: `truckMove ${5 + i * 0.35}s linear infinite`, animationDelay: `${-i * 0.8}s` }}>
            <rect x={90 + i * 18} y={455 + (i % 2) * 24} width="42" height="20" rx="5" fill={i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#f59e0b' : '#fb7185'} opacity="0.8" />
            <circle cx={99 + i * 18} cy={478 + (i % 2) * 24} r="4" fill="#020617" />
            <circle cx={122 + i * 18} cy={478 + (i % 2) * 24} r="4" fill="#020617" />
          </g>
        ))}
        <text x="72" y="310" fill="#f59e0b" fontSize="12" fontWeight="800" letterSpacing="3">STAGE MATRIX</text>
        <text x="352" y="265" fill="#f59e0b" fontSize="12" fontWeight="800" letterSpacing="3">HIGH-PRESSURE PUMPING SPREAD</text>
        <text x="90" y="440" fill="#94a3b8" fontSize="12" letterSpacing="3">SAND · WATER · DIESEL LOGISTICS</text>
      </svg>
      <Hotspot x="50%" y="56%" tone="amber" label="Frac spread" onClick={() => setFocus('frac-spread')} />
      <Hotspot x="17%" y="83%" tone="rose" label="Truck queue" onClick={() => setFocus('truck-queue')} />
      <Hotspot x="18%" y="61%" tone="amber" label={`${completed}/50 stages`} onClick={() => setFocus('frac-spread')} />
      <div className="absolute bottom-7 right-7 grid w-[375px] grid-cols-3 gap-3 rounded-[28px] border border-amber-300/20 bg-slate-950/72 p-4 backdrop-blur-2xl">
        {[
          ['Sand', '7,400t', 'rose' as Tone],
          ['Water', '43,800m³', 'cyan' as Tone],
          ['Diesel', '11k L/stg', 'amber' as Tone],
        ].map(([label, value, tone]) => (
          <button key={label} onClick={() => setFocus(label === 'Sand' ? 'truck-queue' : 'frac-spread')} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left hover:bg-white/[0.08]">
            <div className={`text-[10px] uppercase tracking-[0.16em] ${toneClasses(tone as Tone).text}`}>{label}</div>
            <div className="mt-1 text-lg font-semibold text-white">{value}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductionView({ tick, setFocus, productMode }: { tick: number; setFocus: (id: string) => void; productMode: ProductMode }) {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 1000 560" className="absolute inset-0 h-full w-full">
        <defs><filter id="prodGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        <rect x="125" y="230" width="420" height="225" rx="28" fill="#052e2b" stroke="#34d399" strokeOpacity="0.35" />
        {Array.from({ length: 48 }, (_, i) => {
          const col = i % 12;
          const row = Math.floor(i / 12);
          const active = i % 11 !== 0;
          const lift = i % 4 === 0;
          return (
            <g key={i} onClick={() => setFocus('well-pad')} className="cursor-pointer">
              <circle cx={160 + col * 30} cy={270 + row * 42} r="8" fill={active ? (lift ? '#22d3ee' : '#34d399') : '#475569'} opacity={active ? 0.9 : 0.45} filter={active ? 'url(#prodGlow)' : undefined}>
                {active && <animate attributeName="r" values="7;10;7" dur={`${2.4 + (i % 4) * 0.3}s`} repeatCount="indefinite" />}
              </circle>
              <path d={`M ${160 + col * 30} ${270 + row * 42} C 570 ${260 + row * 15} 610 330 720 335`} stroke={active ? '#34d399' : '#475569'} strokeWidth="1.5" strokeOpacity={active ? 0.32 : 0.1} fill="none" />
            </g>
          );
        })}
        <rect x="700" y="285" width="155" height="105" rx="24" fill="#052e2b" stroke="#34d399" strokeWidth="2" />
        <path d="M 720 335 C 790 335 845 320 920 292" fill="none" stroke="#34d399" strokeWidth="8" strokeLinecap="round" opacity="0.42" />
        <path d="M 720 335 C 790 335 845 320 920 292" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="3 18" className="flow-dash" opacity="0.8" />
        <text x="150" y="214" fill="#34d399" fontSize="12" fontWeight="800" letterSpacing="3">PAD VM-12 · LIVE WELL MATRIX</text>
        <text x="700" y="270" fill="#34d399" fontSize="12" fontWeight="800" letterSpacing="3">GATHERING HEADER</text>
        <text x="680" y="430" fill="#94a3b8" fontSize="12" letterSpacing="3">{productMode === 'crude' ? 'CRUDE FLOWLINES' : 'GAS FLOWLINES'}</text>
      </svg>
      <Hotspot x="32%" y="57%" tone="emerald" label="Pad wells" onClick={() => setFocus('well-pad')} />
      <Hotspot x="77%" y="60%" tone="cyan" label="Gathering header" onClick={() => setFocus('battery-04')} />
      <div className="absolute bottom-7 right-7 w-[360px] rounded-[28px] border border-emerald-300/20 bg-slate-950/72 p-4 backdrop-blur-2xl">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">live production behavior</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><div className="text-[10px] text-slate-500">Natural flow</div><div className="text-xl font-semibold text-white">24 wells</div></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><div className="text-[10px] text-slate-500">Artificial lift</div><div className="text-xl font-semibold text-white">18 wells</div></div>
        </div>
        <MiniSparkline data={generateSeries('production', 'Live', 0, tick, 'base')} tone="emerald" />
      </div>
    </div>
  );
}

function GatheringView({ tick, setFocus, scenario }: { tick: number; setFocus: (id: string) => void; scenario: Scenario }) {
  const risk = scenario === 'constraint';
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 1000 560" className="absolute inset-0 h-full w-full">
        <defs><filter id="gathGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        {Array.from({ length: 18 }, (_, i) => {
          const x = 130 + (i % 6) * 55;
          const y = 185 + Math.floor(i / 6) * 72;
          return (
            <g key={i} onClick={() => setFocus('well-pad')} className="cursor-pointer">
              <circle cx={x} cy={y} r="8" fill="#34d399" opacity="0.8" filter="url(#gathGlow)" />
              <path d={`M ${x} ${y} C 420 ${y + 20} 470 260 565 280`} fill="none" stroke="#22d3ee" strokeWidth="2" strokeOpacity="0.22" />
            </g>
          );
        })}
        <rect x="535" y="225" width="180" height="130" rx="28" fill="#082f49" stroke={risk ? '#f59e0b' : '#22d3ee'} strokeWidth="2" />
        <circle cx="585" cy="290" r="31" fill="#0f172a" stroke="#22d3ee" />
        <circle cx="665" cy="290" r="31" fill="#0f172a" stroke="#22d3ee" />
        <path d="M715 280 C 790 240 830 205 905 180" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" opacity="0.75" />
        <path d="M715 300 C 795 300 840 300 910 300" fill="none" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" opacity="0.75" />
        <path d="M715 320 C 790 360 835 390 905 420" fill="none" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" opacity="0.55" />
        <text x="130" y="150" fill="#22d3ee" fontSize="12" fontWeight="800" letterSpacing="3">FLOWLINES</text>
        <text x="545" y="210" fill="#22d3ee" fontSize="12" fontWeight="800" letterSpacing="3">BATTERY B-04</text>
        <text x="835" y="170" fill="#f59e0b" fontSize="11" letterSpacing="2">OIL</text>
        <text x="840" y="292" fill="#22d3ee" fontSize="11" letterSpacing="2">GAS</text>
        <text x="830" y="438" fill="#38bdf8" fontSize="11" letterSpacing="2">WATER</text>
      </svg>
      <Hotspot x="62%" y="52%" tone={risk ? 'amber' : 'cyan'} label="Battery B-04" onClick={() => setFocus('battery-04')} />
      <Hotspot x="24%" y="47%" tone="emerald" label="Flowline network" onClick={() => setFocus('well-pad')} />
    </div>
  );
}

function TreatmentEvacuationView({ tick, setFocus, scenario }: { tick: number; setFocus: (id: string) => void; scenario: Scenario }) {
  const risk = scenario === 'constraint';
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 1360 640" className="absolute inset-0 h-full w-full">
        <defs><filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        <path d={ROUTE_PATH} transform="translate(15 10)" fill="none" stroke="#020617" strokeWidth="20" strokeLinecap="round" />
        <path d={ROUTE_PATH} transform="translate(15 10)" fill="none" stroke={risk ? '#f59e0b' : '#22d3ee'} strokeWidth="10" strokeLinecap="round" opacity="0.55" filter="url(#routeGlow)" />
        <path d={ROUTE_PATH} transform="translate(15 10)" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="3 22" className="flow-dash" opacity="0.86" />
        {ROUTE_NODES.map((node) => (
          <g key={node.id} onClick={() => setFocus(node.id === 'rio-colorado' ? 'certificate-20211' : node.id === 'puerto-rosales' ? 'tank-farm' : 'trunk-route')} className="cursor-pointer" transform="translate(15 10)">
            <circle cx={node.x} cy={node.y} r={node.kind === 'terminal' ? 15 : 11} fill="#020617" stroke={risk && ['catriel', 'medanito'].includes(node.id) ? '#f59e0b' : '#38bdf8'} strokeWidth="3" />
            <circle cx={node.x} cy={node.y} r="5" fill={risk && ['catriel', 'medanito'].includes(node.id) ? '#f59e0b' : '#fff'} />
            <text x={node.x + 14} y={node.y + 28} fill="#cbd5e1" fontSize="13" style={{ paintOrder: 'stroke', stroke: '#020617', strokeWidth: 4 }}>{node.label}</text>
          </g>
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <circle key={i} r="5" fill={risk ? '#f59e0b' : '#fff'} opacity="0.8" filter="url(#routeGlow)">
            <animateMotion path={ROUTE_PATH} dur={risk ? `${18 + i}s` : `${12 + i * 0.5}s`} begin={`${-i * 1.7}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <text x="88" y="120" fill="#22d3ee" fontSize="12" fontWeight="800" letterSpacing="3">NEUQUÉN INJECTION</text>
        <text x="860" y="455" fill="#f59e0b" fontSize="12" fontWeight="800" letterSpacing="3">CERTIFICATES / RECONCILIATION</text>
        <text x="1125" y="610" fill="#34d399" fontSize="12" fontWeight="800" letterSpacing="3">PUERTO ROSALES</text>
      </svg>
      <Hotspot x="70%" y="73%" tone={scenario === 'certificate' ? 'violet' : 'cyan'} label="Certificate 20211" onClick={() => setFocus('certificate-20211')} />
      <Hotspot x="89%" y="77%" tone="emerald" label="Puerto Rosales" onClick={() => setFocus('tank-farm')} />
      <Hotspot x="31%" y="50%" tone={risk ? 'amber' : 'cyan'} label="Trunk route" onClick={() => setFocus('trunk-route')} />
    </div>
  );
}

function StorageDispatchView({ tick, setFocus, scenario }: { tick: number; setFocus: (id: string) => void; scenario: Scenario }) {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 1000 560" className="absolute inset-0 h-full w-full">
        <defs><linearGradient id="tankFill" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#34d399" /><stop offset="1" stopColor="#22d3ee" /></linearGradient><filter id="storageGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = [74, 81, 66, 72, 58][i] + Math.sin(tick * 0.18 + i) * 2;
          return (
            <g key={i} onClick={() => setFocus('tank-farm')} className="cursor-pointer">
              <rect x={190 + i * 95} y="190" width="70" height="180" rx="20" fill="#0f172a" stroke="#34d399" strokeOpacity="0.35" />
              <motion.rect x={190 + i * 95} y={190 + 180 - (fill / 100) * 180} width="70" height={(fill / 100) * 180} rx="18" fill="url(#tankFill)" opacity="0.72" />
              <text x={225 + i * 95} y="402" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="800">T-0{i + 1}</text>
            </g>
          );
        })}
        <path d="M 650 280 C 720 260 780 240 860 210" fill="none" stroke="#34d399" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
        <path d="M 650 320 C 730 330 795 352 870 392" fill="none" stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
        <path d="M 650 280 C 720 260 780 240 860 210" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="3 18" className="flow-dash" opacity="0.8" />
        <path d="M 650 320 C 730 330 795 352 870 392" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="3 18" className="flow-dash" opacity="0.8" />
        <rect x="820" y="170" width="100" height="64" rx="18" fill="#064e3b" stroke="#34d399" />
        <rect x="825" y="360" width="110" height="70" rx="18" fill="#082f49" stroke="#22d3ee" />
        <text x="195" y="160" fill="#34d399" fontSize="12" fontWeight="800" letterSpacing="3">PUERTO ROSALES TANK FARM</text>
        <text x="807" y="155" fill="#34d399" fontSize="12" fontWeight="800" letterSpacing="3">EXPORT</text>
        <text x="792" y="455" fill="#22d3ee" fontSize="12" fontWeight="800" letterSpacing="3">DOMESTIC REFINERY</text>
      </svg>
      <Hotspot x="40%" y="51%" tone="emerald" label="Tank farm" onClick={() => setFocus('tank-farm')} />
      <Hotspot x="84%" y="36%" tone="emerald" label="Export batch" onClick={() => setFocus('tank-farm')} />
      <Hotspot x="86%" y="69%" tone="cyan" label="Dispatch lane" onClick={() => setFocus('tank-farm')} />
      <div className="absolute bottom-7 right-7 w-[390px] rounded-[28px] border border-emerald-300/20 bg-slate-950/72 p-4 backdrop-blur-2xl">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">margin dispatch logic</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><div className="text-[10px] text-slate-500">Realized price</div><div className="text-xl font-semibold text-white">USD 69.8</div></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><div className="text-[10px] text-slate-500">Net margin</div><div className="text-xl font-semibold text-emerald-300">USD {scenario === 'constraint' ? '25.2' : '26.7'}</div></div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsPanel({ stage, scenario, tick, productMode, setFocus, setScenario }: { stage: StageId; scenario: Scenario; tick: number; productMode: ProductMode; setFocus: (focus: FocusObject) => void; setScenario: (scenario: Scenario) => void }) {
  const config = getStageCatalog(productMode).find((s) => s.id === stage)!;
  const kpis = getStageKPIs(stage, scenario, tick, productMode);
  const insight = useMemo(() => {
    if (stage === 'alerts') {
      return productMode === 'gas'
        ? 'Critical alert mode isolates the drilling slowdown, quantifies meters and rig-time at risk, and gives an explicit RPM/WOB recovery sequence.'
        : 'Critical alert mode links the red clock to the physical drilling object causing delay, then shows how lower RPM propagates into ROP, NPT and cost.';
    }
    if (productMode === 'gas') {
      if (stage === 'pad') return 'Gas pad readiness is more than construction: hydrate protection, choke setup, test separation and first measurement determine whether the well can flow safely.';
      if (stage === 'drilling') return 'The real-time gas drilling room aligns rig sensors, MWD/LWD, mud gas, DDR context and historical offsets before a decision changes ROP or trajectory.';
      if (stage === 'geosteering') return 'Gas geosteering treats the target window as a live object: mud gas, gamma/resistivity, offset wells and dogleg limits must agree before steering.';
      if (stage === 'drillstring') return 'Drillstring mechanics expose the client pain point: uncertainty in string weight and WOB transfer can trigger lower RPM, lower ROP and hidden day-rate losses.';
      if (stage === 'frac') return 'Flowback turns a frac job into usable gas. Sand return, water recovery and choke discipline protect both the well and the surface facilities.';
      if (stage === 'production') return 'Gas production is governed by deliverability, backpressure and liquid loading. The dashboard connects well behavior to compression availability.';
      if (stage === 'gathering') return 'Low-pressure gathering is the early-warning layer for slugging, hydrate risk and linepack depletion before compression becomes constrained.';
      if (stage === 'treatment') return 'Compression and dehydration form the gas plant constraint. The useful view is not one compressor KPI but horsepower, recycle, dew point and nominations together.';
      return 'Gas commercialization is nomination control: linepack, custody transfer, imbalance and gas netback determine what should be sold, held or curtailed.';
    }
    if (stage === 'pad') return 'Pad readiness is the first leverage point. Any delay here propagates into rig idle time before production value is created.';
    if (stage === 'drilling') return 'The real-time drilling room is the new operating center: rig telemetry, MWD/LWD, mud logging, geologist, drilling engineer, DDR notes and historical wells in one view.';
    if (stage === 'geosteering') return 'Geosteering shows whether the well is still in the sweet spot. The dashboard combines plan vs actual path, gamma/resistivity, offsets and safe steering envelope.';
    if (stage === 'drillstring') return 'Sarta/RPM economics makes conservative drilling measurable: WOB transfer, hookload gap, vibration, stick-slip, low-RPM hours and cost exposure are shown together.';
    if (stage === 'frac') return 'Frac is the highest logistics intensity layer. Sand, water and diesel coverage should be controlled like a live production input, not a static procurement item.';
    if (stage === 'production') return 'The well matrix shows which wells are alive, unstable or moving to artificial lift. This is where live signals become operational advantage.';
    if (stage === 'gathering') return 'Battery utilization and gathering pressure are the earliest visible signals before upstream growth becomes an evacuation constraint.';
    if (stage === 'treatment') return 'Treatment and trunk evacuation connect physical production to commercial readiness. Certificates and line utilization must close together.';
    return 'Storage and dispatch convert the molecule into margin. Batch sequencing should protect realized price and avoid inventory friction.';
  }, [stage, productMode]);

  return (
    <aside className="relative z-30 flex h-full min-h-0 flex-col gap-3 border-l border-cyan-200/10 bg-slate-950/70 p-3 backdrop-blur-2xl xl:w-[332px]">
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-[9px] font-black uppercase tracking-[0.24em] ${toneClasses(config.tone).text}`}>{config.short} analytics</div>
          <div className="mt-0.5 text-xs text-slate-400">stage-specific command metrics</div>
        </div>
        <config.icon className={`h-5 w-5 ${toneClasses(config.tone).text}`} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2.5 overflow-y-auto pr-1 tiny-scrollbar sm:grid-cols-2 xl:grid-cols-1">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const tone = toneClasses(kpi.tone);
          const spark = generateSeries(stage, 'Live', idx, tick, scenario);
          const gaugeValue = Math.max(15, Math.min(98, 48 + idx * 12 + wave(tick, idx + 3, 8)));
          if (idx === 0) {
            return (
              <button
                key={kpi.label}
                onClick={() => setFocus(focusFromKPI(kpi, stage))}
                className={`glass-shine relative overflow-hidden rounded-[24px] border ${tone.border} bg-gradient-to-br from-white/[0.07] to-white/[0.025] p-3 text-left shadow-[0_12px_35px_rgba(0,0,0,.25)] transition hover:-translate-y-0.5`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tone.bg} ${tone.text}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[9px] font-bold ${tone.border} ${tone.text}`}>{kpi.delta}</span>
                </div>
                <div className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">{kpi.label}</div>
                <motion.div key={kpi.value} initial={{ opacity: 0.45, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">
                  {kpi.value}
                </motion.div>
                <MiniSparkline data={spark} tone={kpi.tone} />
              </button>
            );
          }

          if (idx === 1) {
            return (
              <button
                key={kpi.label}
                onClick={() => setFocus(focusFromKPI(kpi, stage))}
                className={`relative overflow-hidden rounded-[22px] border ${tone.border} bg-white/[0.045] p-3 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.075]`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                      <Icon className={`h-3.5 w-3.5 ${tone.text}`} />
                      <span className="truncate">{kpi.label}</span>
                    </div>
                    <div className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">{kpi.value}</div>
                  </div>
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 text-[10px] font-black text-white" style={{ backgroundImage: `conic-gradient(${colorForTone(kpi.tone)} ${gaugeValue}%, rgba(255,255,255,.08) 0)` }}>
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-950">{Math.round(gaugeValue)}</div>
                  </div>
                </div>
                <MiniGauge value={gaugeValue} tone={kpi.tone} />
              </button>
            );
          }

          return (
            <button
              key={kpi.label}
              onClick={() => setFocus(focusFromKPI(kpi, stage))}
              className={`glass-shine relative overflow-hidden rounded-[22px] border ${tone.border} bg-white/[0.04] p-3 text-left shadow-[0_12px_35px_rgba(0,0,0,.20)] transition hover:-translate-y-0.5 hover:bg-white/[0.075]`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                    <Icon className={`h-3.5 w-3.5 ${tone.text}`} />
                    <span className="truncate">{kpi.label}</span>
                  </div>
                  <motion.div key={kpi.value} initial={{ opacity: 0.45, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">
                    {kpi.value}
                  </motion.div>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${tone.border} ${tone.text}`}>{kpi.delta}</span>
              </div>
              {idx === 2 ? <MiniGauge value={gaugeValue} tone={kpi.tone} /> : <MiniSparkline data={spark} tone={kpi.tone} />}
            </button>
          );
        })}
      </div>

      <div className="rounded-[24px] border border-violet-300/20 bg-gradient-to-br from-violet-500/12 via-cyan-500/8 to-slate-950/80 p-3 shadow-[0_0_45px_rgba(139,92,246,.12)]">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-violet-300/12 text-violet-200">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Live Recommendation</div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-violet-200/70">AI over existing signals</div>
            </div>
          </div>
          <span className="rounded-full border border-violet-200/20 px-2 py-1 text-[9px] text-violet-100">conf. 92%</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-200">{insight}</p>
        <button onClick={() => setScenario('optimization')} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-950 transition hover:bg-cyan-100">
          <Zap className="h-3.5 w-3.5" /> Apply optimization scenario
        </button>
      </div>
    </aside>
  );
}

function getOriginalCrudeScenarioModifier(scenario: Scenario) {
  if (scenario === 'constraint') {
    return {
      flow: -8400,
      transit: -6,
      transportCost: 0.72,
      deliveredCost: 1.08,
      margin: -1.24,
      reconciliation: 0.38,
    };
  }

  if (scenario === 'certificate') {
    return {
      flow: -1200,
      transit: -1,
      transportCost: 0.08,
      deliveredCost: 0.18,
      margin: -0.22,
      reconciliation: 1.12,
    };
  }

  if (scenario === 'optimization') {
    return {
      flow: 2900,
      transit: 3,
      transportCost: -0.18,
      deliveredCost: -0.46,
      margin: 0.86,
      reconciliation: -0.18,
    };
  }

  return {
    flow: 0,
    transit: 0,
    transportCost: 0,
    deliveredCost: 0,
    margin: 0,
    reconciliation: 0,
  };
}

function OriginalCrudeCostBuildUp({ scenario, tick }: { scenario: Scenario; tick: number }) {
  const mod = getOriginalCrudeScenarioModifier(scenario);

  const production = 35.4 + Math.sin(tick * 0.21) * 0.08;
  const gathering = 1.8 + (scenario === 'constraint' ? 0.12 : 0);
  const trunk = 4.8 + mod.transportCost;
  const terminal = 1.3 + (scenario === 'constraint' ? 0.08 : 0);
  const delivered = production + gathering + trunk + terminal;
  const price = 69.8 + Math.cos(tick * 0.19) * 0.14;
  const margin = price - delivered + mod.margin * 0.18;

  const steps = [
    { label: 'Producción', value: production, icon: Gauge, tone: 'cyan' as Tone },
    { label: 'Gathering / batería', value: gathering, icon: Layers, tone: 'cyan' as Tone },
    { label: 'Transporte troncal', value: trunk, icon: Route, tone: scenario === 'constraint' ? 'amber' as Tone : 'cyan' as Tone },
    { label: 'Terminal / storage', value: terminal, icon: Factory, tone: 'cyan' as Tone },
    { label: 'Delivered cost', value: delivered, icon: BarChart3, tone: scenario === 'constraint' ? 'rose' as Tone : 'amber' as Tone },
    { label: 'Precio realizado', value: price, icon: DollarSign, tone: 'emerald' as Tone },
    { label: 'Margen', value: margin, icon: Target, tone: scenario === 'constraint' ? 'amber' as Tone : 'emerald' as Tone },
  ];

  return (
    <div className="relative z-30 rounded-[28px] border border-cyan-200/15 bg-slate-950/78 p-3 shadow-[0_18px_70px_rgba(0,0,0,.5)] backdrop-blur-2xl">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">cost build-up de la molécula</div>
          <div className="mt-0.5 text-[11px] text-slate-400">el barril suma costo a medida que avanza por la línea</div>
        </div>

        <div className={`rounded-full border px-3 py-1 text-[10px] font-bold ${scenario === 'constraint' ? 'border-amber-300/40 text-amber-200' : 'border-emerald-300/40 text-emerald-200'}`}>
          {scenario === 'constraint' ? 'costo tensionado' : 'margen protegido'}
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-2 md:grid-cols-4 2xl:grid-cols-7">
        <div className="absolute left-6 right-6 top-[43px] hidden h-1 rounded-full bg-gradient-to-r from-cyan-400 via-amber-300 to-emerald-400 opacity-35 2xl:block" />

        <motion.div
          className="absolute top-[36px] hidden h-5 w-5 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,.95)] 2xl:block"
          animate={{ left: ['3%', '91%', '3%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const tone = step.tone === 'emerald' ? 'border-emerald-300/20 bg-emerald-400/[0.08]' : step.tone === 'amber' ? 'border-amber-300/20 bg-amber-400/[0.08]' : step.tone === 'rose' ? 'border-rose-300/20 bg-rose-400/[0.08]' : 'border-cyan-300/15 bg-white/[0.035]';

          return (
            <div key={step.label} className={`relative rounded-2xl border p-2.5 ${tone}`}>
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.08] text-cyan-100">
                <Icon className="h-4 w-4" />
              </div>

              <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">{idx + 1}. {step.label}</div>

              <motion.div key={step.value.toFixed(2)} initial={{ y: 4, opacity: 0.5 }} animate={{ y: 0, opacity: 1 }} className="mt-1 text-base font-semibold tracking-[-0.04em] text-white">
                USD {step.value.toFixed(1)}
              </motion.div>

              <div className="mt-0.5 text-[9px] text-slate-500">/ bbl</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CostFooterSwitch({
  stage,
  scenario,
  timeWindow,
  tick,
  productMode,
  costFooterMode,
  setCostFooterMode,
  setExpandedChart,
}: {
  stage: StageId;
  scenario: Scenario;
  timeWindow: TimeWindow;
  tick: number;
  productMode: ProductMode;
  costFooterMode: CostFooterMode;
  setCostFooterMode: (mode: CostFooterMode) => void;
  setExpandedChart: (payload: { spec: ChartSpec; data: number[] }) => void;
}) {
  return (
    <div className="relative">
      <div className="absolute left-0 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-1.5 rounded-2xl border border-white/10 bg-slate-950/82 p-1.5 shadow-[0_12px_45px_rgba(0,0,0,.35)] backdrop-blur-2xl">
        {[
          { id: 'original' as CostFooterMode, label: 'Crude cost' },
          { id: 'current' as CostFooterMode, label: 'Current' },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setCostFooterMode(mode.id)}
            className={`rounded-xl px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] transition ${costFooterMode === mode.id ? 'bg-cyan-300 text-slate-950' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="pl-24">
        {costFooterMode === 'original' ? (
          <OriginalCrudeCostBuildUp scenario={scenario} tick={tick} />
        ) : (
          <AnalyticsGrid stage={stage} scenario={scenario} timeWindow={timeWindow} tick={tick} productMode={productMode} setExpandedChart={setExpandedChart} />
        )}
      </div>
    </div>
  );
}

function ChartCard({ spec, data, timeWindow, onClick }: { spec: ChartSpec; data: number[]; timeWindow: TimeWindow; onClick: () => void }) {
  const latest = data[data.length - 1];
  const tone = toneClasses(spec.tone);
  const decimals = spec.decimals ?? (Math.abs(latest) < 100 ? 1 : 0);
  return (
    <button onClick={onClick} className={`glass-shine relative min-h-[126px] overflow-hidden rounded-[22px] border ${tone.border} bg-white/[0.04] p-3 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.07]`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`text-[10px] font-black uppercase tracking-[0.18em] ${tone.text}`}>{spec.title}</div>
          <div className="mt-1 line-clamp-1 text-xs text-slate-500">{spec.subtitle}</div>
        </div>
        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{timeWindow}</span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <motion.div key={latest.toFixed(2)} initial={{ opacity: 0.45, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-semibold tracking-[-0.05em] text-white">
            {formatNumber(latest, decimals)}
          </motion.div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{spec.unit}</div>
        </div>
        <div className="h-14 flex-1">
          <MiniSparkline data={data} tone={spec.tone} />
        </div>
      </div>
    </button>
  );
}

function AnalyticsGrid({ stage, scenario, timeWindow, tick, productMode, setExpandedChart }: { stage: StageId; scenario: Scenario; timeWindow: TimeWindow; tick: number; productMode: ProductMode; setExpandedChart: (payload: { spec: ChartSpec; data: number[] }) => void }) {
  const specs = getChartSpecs(stage, scenario, productMode);
  return (
    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
      {specs.map((spec, index) => {
        const data = generateSeries(stage, timeWindow, index, tick, scenario).map((value, i) => {
          const ratio = spec.base > 1000 ? spec.base / 60 : spec.base / 20;
          return Math.max(0, spec.base + (value - 60) * ratio * 0.18 + i * spec.trend);
        });
        return <ChartCard key={spec.id} spec={spec} data={data} timeWindow={timeWindow} onClick={() => setExpandedChart({ spec, data })} />;
      })}
    </div>
  );
}

function FocusDrawer({ focus, onClose }: { focus: FocusObject | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {focus && (
        <motion.div className="pointer-events-none absolute inset-0 z-[70]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/18 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.aside
            initial={{ opacity: 0, x: 42, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 42, filter: 'blur(10px)' }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto absolute bottom-3 right-3 top-3 w-[min(390px,calc(100%-24px))] overflow-hidden rounded-[30px] border border-cyan-200/15 bg-slate-950/78 shadow-[0_30px_100px_rgba(0,0,0,.65)] backdrop-blur-2xl"
          >
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(103,232,249,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,.35) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="relative flex h-full min-h-0 flex-col p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneClasses(focus.tone || 'cyan').border} ${toneClasses(focus.tone || 'cyan').bg} ${toneClasses(focus.tone || 'cyan').text}`}>
                    <Database className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold tracking-[-0.04em] text-white">{focus.title}</h3>
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">{focus.type}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{focus.subtitle}</p>
                  </div>
                </div>
                <button onClick={onClose} className="flex shrink-0 items-center justify-center rounded-full border border-white/10 p-2 text-slate-300 hover:bg-white/10 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid gap-2">
                {focus.metrics.map((metric, idx) => (
                  <div key={metric.label} className={`rounded-2xl border ${toneClasses(metric.tone || (idx === 0 ? focus.tone || 'cyan' : 'slate')).border} bg-white/[0.04] p-3`}>
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">{metric.label}</div>
                    <div className={`mt-1 text-sm font-semibold tracking-[-0.03em] ${toneClasses(metric.tone || 'slate').text}`}>{metric.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-violet-300/20 bg-violet-400/10 p-3 tiny-scrollbar">
                <div className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-violet-200">
                  <Sparkles className="h-3.5 w-3.5" /> Operational insight
                </div>
                <p className="text-sm leading-relaxed text-slate-200">{focus.insight}</p>

                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/46 p-3">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">recommended workflow</div>
                  <div className="mt-2 grid gap-2">
                    {['Validate live signal source', 'Quantify production / margin exposure', 'Commit safe action and watch response'].map((step, idx) => (
                      <div key={step} className="flex items-center gap-2 rounded-xl bg-white/[0.035] px-2 py-2 text-xs text-slate-300">
                        <span className={`grid h-5 w-5 place-items-center rounded-full ${idx === 2 ? 'bg-emerald-300/15 text-emerald-200' : 'bg-cyan-300/10 text-cyan-200'}`}>{idx + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={onClose} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300 hover:bg-white/10 hover:text-white">
                <ArrowLeft className="h-3.5 w-3.5" /> Replegar lens
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ExpandedChartModal({ chart, onClose }: { chart: { spec: ChartSpec; data: number[] } | null; onClose: () => void }) {
  if (!chart) return null;
  const { spec, data } = chart;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = Math.max(1, max - min);
  const points = data.map((v, i) => `${(i / Math.max(1, data.length - 1)) * 720},${220 - ((v - min) / span) * 170}`).join(' ');
  const color = colorForTone(spec.tone);
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/72 p-6 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} className="w-full max-w-4xl rounded-[36px] border border-cyan-200/15 bg-slate-950 p-6 shadow-[0_30px_120px_rgba(0,0,0,.75)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className={`text-[10px] font-black uppercase tracking-[0.22em] ${toneClasses(spec.tone).text}`}>expanded analytics</div>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white">{spec.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{spec.subtitle}</p>
            </div>
            <button onClick={onClose} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-300 hover:bg-white/10 hover:text-white">Close</button>
          </div>
          <svg viewBox="0 0 760 260" className="h-[300px] w-full overflow-visible rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
            {Array.from({ length: 6 }, (_, i) => <line key={i} x1="20" x2="740" y1={30 + i * 38} y2={30 + i * 38} stroke="#94a3b8" strokeOpacity="0.12" />)}
            <polyline points={points} transform="translate(20 18)" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={`20,240 ${points.split(' ').map((point) => { const [x, y] = point.split(','); return `${Number(x) + 20},${Number(y) + 18}`; }).join(' ')} 740,240`} fill={color} opacity="0.08" />
          </svg>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function LiveTicker({ scenario }: { scenario: Scenario }) {
  const headline = scenario === 'constraint' ? 'Constraint active · Catriel–Medanito capacity band turning amber' : scenario === 'certificate' ? 'Certificate delay · Río Colorado density validation pending' : scenario === 'optimization' ? 'Optimization applied · dispatch sequence protects margin' : 'System stable · end-to-end operation inside expected envelope';
  const items = [headline, ...EVENTS, headline, ...EVENTS];
  return (
    <div className="relative z-40 border-t border-cyan-200/10 bg-slate-950/78 px-4 py-3 backdrop-blur-2xl">
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
          <RefreshCw className="h-3 w-3" /> live event stream
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="ticker-inner flex items-center gap-3">
            {items.map((event, idx) => (
              <button key={`${event}-${idx}`} className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs text-slate-300 hover:bg-white/[0.07]">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,.8)]" />
                {event}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PluspetrolOperationsCommand() {
  const [activeStage, setActiveStage] = useState<StageId>('production');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('Live');
  const [scenario, setScenario] = useState<Scenario>('base');
  const [productMode, setProductMode] = useState<ProductMode>('crude');
  const [autoPilot, setAutoPilot] = useState(false);
  const [tick, setTick] = useState(0);
  const [focus, setFocus] = useState<FocusObject | null>(null);
  const [expandedChart, setExpandedChart] = useState<{ spec: ChartSpec; data: number[] } | null>(null);
  const [costFooterMode, setCostFooterMode] = useState<CostFooterMode>('original');
  const clock = useClock();

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!autoPilot) return;
    const id = window.setInterval(() => {
      setActiveStage((current) => {
        const catalog = getStageCatalog(productMode);
        const index = catalog.findIndex((stage) => stage.id === current);
        return catalog[(index + 1) % catalog.length].id;
      });
      setFocus(null);
    }, 7000);
    return () => window.clearInterval(id);
  }, [autoPilot, productMode]);

  const stageCatalog = getStageCatalog(productMode);
  const activeConfig = stageCatalog.find((stage) => stage.id === activeStage) || stageCatalog[0];

  return (
    <section className="control-room-compact relative h-[100vh] min-h-[740px] w-full overflow-hidden bg-[#02050b] font-sans text-white selection:bg-cyan-300/20">
      <div style={{ transform: 'scale(0.67)', transformOrigin: 'top left', width: 'calc(100% / 0.67)', height: 'calc(100% / 0.67)' }} className="relative flex flex-col">
        <ControlStyles />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(34,211,238,.16),transparent_28%),radial-gradient(circle_at_92%_18%,rgba(245,158,11,.10),transparent_22%),linear-gradient(135deg,#02050b_0%,#07111f_48%,#02050b_100%)]" />
        <div className="absolute inset-0 opacity-[0.045]" style={{ backgroundImage: 'linear-gradient(transparent 50%, rgba(255,255,255,.9) 50%)', backgroundSize: '100% 4px' }} />

        <Header
        clock={clock}
        stage={activeConfig}
        timeWindow={timeWindow}
        setTimeWindow={setTimeWindow}
        scenario={scenario}
        setScenario={setScenario}
        productMode={productMode}
        setProductMode={setProductMode}
        autoPilot={autoPilot}
        setAutoPilot={setAutoPilot}
      />

      <main className="relative z-10 grid flex-1 min-h-0 grid-rows-[1fr_auto] xl:grid-cols-[1fr_332px] xl:grid-rows-1">
        <div className="relative min-h-0 p-3 lg:p-3.5">
          <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-3">
            <ExecutiveRibbon
              stage={activeStage}
              scenario={scenario}
              tick={tick}
              productMode={productMode}
              onFocus={setFocus}
              onOpenAlert={() => {
                setAutoPilot(false);
                setScenario('constraint');
                setActiveStage('alerts');
                setFocus(null);
              }}
            />

            <div className="grid min-h-0 gap-3 xl:grid-cols-[205px_1fr]">
              <StageNavigator stages={stageCatalog} activeStage={activeStage} setActiveStage={setActiveStage} setFocus={setFocus} setAutoPilot={setAutoPilot} />
              <StageCanvas stage={activeStage} scenario={scenario} tick={tick} productMode={productMode} setFocus={setFocus} />
            </div>

            <CostFooterSwitch
              stage={activeStage}
              scenario={scenario}
              timeWindow={timeWindow}
              tick={tick}
              productMode={productMode}
              costFooterMode={costFooterMode}
              setCostFooterMode={setCostFooterMode}
              setExpandedChart={setExpandedChart}
            />
          </div>

          <FocusDrawer focus={focus} onClose={() => setFocus(null)} />
        </div>

        <AnalyticsPanel stage={activeStage} scenario={scenario} tick={tick} productMode={productMode} setFocus={setFocus} setScenario={setScenario} />
      </main>

      <LiveTicker scenario={scenario} />
      <ExpandedChartModal chart={expandedChart} onClose={() => setExpandedChart(null)} />
      </div>
    </section>
  );
}
