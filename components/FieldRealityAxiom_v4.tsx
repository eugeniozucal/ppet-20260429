"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Bot,
  BrainCircuit,
  Database,
  Gauge,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Waves,
} from "lucide-react";

type StageKey = "measurement" | "registration" | "intelligence" | "optimization";
type Phase = 0 | 1 | 2 | 3 | 4 | 5;

type StageDef = {
  key: StageKey;
  index: string;
  title: string;
  subtitle: string;
  accent: string;
  softBg: string;
  line: string;
  icon: React.ComponentType<{ className?: string }>;
  caption: string;
  micro: string;
};

type FocusDef = {
  id: string;
  stage: StageKey;
  label: string;
  text: string;
};

const STAGES: StageDef[] = [
  {
    key: "measurement",
    index: "01",
    title: "Measurement",
    subtitle: "field reality",
    accent: "text-cyan-700",
    softBg: "from-cyan-50/90 via-white to-sky-50/80",
    line: "#22d3ee",
    icon: Gauge,
    caption: "A fracking well becomes observable through live physical signals.",
    micro: "Pressure, flow, temperature and field events emerge as measured truth.",
  },
  {
    key: "registration",
    index: "02",
    title: "Registration",
    subtitle: "data enters the system",
    accent: "text-blue-700",
    softBg: "from-blue-50/90 via-white to-indigo-50/80",
    line: "#3b82f6",
    icon: Database,
    caption: "The signal travels into a professional system of record in realtime.",
    micro: "Packets become rows, timestamps, tags and structured operational memory.",
  },
  {
    key: "intelligence",
    index: "03",
    title: "Intelligence",
    subtitle: "agents build understanding",
    accent: "text-violet-700",
    softBg: "from-violet-50/90 via-white to-fuchsia-50/80",
    line: "#8b5cf6",
    icon: BrainCircuit,
    caption: "Autonomous agents turn data bricks into dashboards, context and priority.",
    micro: "Not a chart dump: an assembly line of reasoning.",
  },
  {
    key: "optimization",
    index: "04",
    title: "Optimization",
    subtitle: "impact is visible",
    accent: "text-emerald-700",
    softBg: "from-emerald-50/90 via-white to-teal-50/80",
    line: "#10b981",
    icon: TrendingUp,
    caption: "Recommendations become visible performance lift across multiple graph forms.",
    micro: "The end state is not insight. It is measurable improvement.",
  },
];

const FOCUS: FocusDef[] = [
  {
    id: "focus-measurement",
    stage: "measurement",
    label: "Measured",
    text: "Sensors around the fracking well emit pressure, flow and temperature as live signals.",
  },
  {
    id: "focus-registration",
    stage: "registration",
    label: "Registered",
    text: "Those signals travel as data packets and fill a database in realtime as trusted operational records.",
  },
  {
    id: "focus-intelligence",
    stage: "intelligence",
    label: "Interpreted",
    text: "Agents pick up those data bricks and assemble dashboards, priorities and recommendations.",
  },
  {
    id: "focus-optimization",
    stage: "optimization",
    label: "Optimized",
    text: "The system responds with visible growth curves, KPI gains and reduced friction.",
  },
];

const REVEAL_ORDER: StageKey[] = ["measurement", "registration", "intelligence", "optimization"];
const PHASE_LABELS: Record<Phase, string> = {
  0: "quiet field",
  1: "measurement",
  2: "registration",
  3: "intelligence",
  4: "optimization",
  5: "orchestra mode",
};

const phaseDurationMs = 3000;

export default function FieldRealityAxiomV3() {
  const [phase, setPhase] = useState<Phase>(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [activeStage, setActiveStage] = useState<StageKey>("measurement");
  const [selectedFocus, setSelectedFocus] = useState<string>("focus-measurement");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTick((v) => v + 1);
    }, 1200);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!autoPlay) return;
    const timeout = window.setTimeout(() => {
      setPhase((prev) => {
        const next = (prev < 5 ? prev + 1 : 5) as Phase;
        if (next >= 1 && next <= 4) {
          setActiveStage(REVEAL_ORDER[next - 1]);
          setSelectedFocus(`focus-${REVEAL_ORDER[next - 1]}`);
        }
        if (next === 5) {
          setActiveStage("optimization");
          setSelectedFocus("focus-optimization");
        }
        return next;
      });
    }, phase === 0 ? 1200 : phaseDurationMs);
    return () => window.clearTimeout(timeout);
  }, [phase, autoPlay]);

  const selectedFocusItem = useMemo(
    () => FOCUS.find((item) => item.id === selectedFocus) ?? FOCUS[0],
    [selectedFocus],
  );

  const activeStageMeta = useMemo(
    () => STAGES.find((s) => s.key === activeStage) ?? STAGES[0],
    [activeStage],
  );

  const progress = useMemo(() => (phase / 5) * 100, [phase]);

  const setStage = (key: StageKey) => {
    setActiveStage(key);
    setSelectedFocus(`focus-${key}`);
  };

  const handleReset = () => {
    setPhase(0);
    setAutoPlay(true);
    setActiveStage("measurement");
    setSelectedFocus("focus-measurement");
  };

  return (
    <div className="relative w-full overflow-hidden rounded-[34px] border border-slate-200/80 bg-[#fbfcfe] text-slate-950 shadow-[0_28px_120px_rgba(15,23,42,0.09)]">
      <BackdropGrid />
      <div className="relative z-10 mx-auto flex aspect-video min-h-[800px] w-full flex-col p-6 md:p-8 xl:p-10">
        <Header
          phase={phase}
          progress={progress}
          autoPlay={autoPlay}
          onToggle={() => setAutoPlay((v) => !v)}
          onReset={handleReset}
        />

        <div className="relative mt-6 flex-1 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/75 shadow-[0_24px_70px_rgba(15,23,42,0.05)] backdrop-blur-sm">
          <MasterFlow phase={phase} activeStage={activeStage} tick={tick} />

          <div className="relative z-10 grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-4 lg:gap-3 lg:p-5">
            <StageCard
              stage={STAGES[0]}
              visible={phase >= 1}
              active={activeStage === "measurement"}
              onClick={() => setStage("measurement")}
            >
              <MeasurementScene tick={tick} emphasized={activeStage === "measurement"} onFocus={() => setSelectedFocus("focus-measurement")} />
            </StageCard>

            <StageCard
              stage={STAGES[1]}
              visible={phase >= 2}
              active={activeStage === "registration"}
              onClick={() => setStage("registration")}
            >
              <RegistrationScene tick={tick} emphasized={activeStage === "registration"} onFocus={() => setSelectedFocus("focus-registration")} />
            </StageCard>

            <StageCard
              stage={STAGES[2]}
              visible={phase >= 3}
              active={activeStage === "intelligence"}
              onClick={() => setStage("intelligence")}
            >
              <IntelligenceScene tick={tick} emphasized={activeStage === "intelligence"} onFocus={() => setSelectedFocus("focus-intelligence")} />
            </StageCard>

            <StageCard
              stage={STAGES[3]}
              visible={phase >= 4}
              active={activeStage === "optimization"}
              onClick={() => setStage("optimization")}
            >
              <OptimizationScene tick={tick} emphasized={activeStage === "optimization"} onFocus={() => setSelectedFocus("focus-optimization")} />
            </StageCard>
          </div>
        </div>

        <BottomPanel
          phase={phase}
          stage={activeStageMeta}
          focus={selectedFocusItem}
          onSelectFocus={setSelectedFocus}
        />
      </div>
    </div>
  );
}

function Header({
  phase,
  progress,
  autoPlay,
  onToggle,
  onReset,
}: {
  phase: Phase;
  progress: number;
  autoPlay: boolean;
  onToggle: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div className="max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
          operating axiom
        </div>
        <h1 className="mt-4 max-w-5xl text-[38px] font-semibold leading-[0.94] tracking-[-0.055em] text-slate-950 sm:text-[52px] xl:text-[60px]">
          From Field Reality to Operational Advantage
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
          Measure in the field. Register the data. Let agents turn it into intelligence.
          Then show optimization as visible growth.
        </p>
      </div>

      <div className="w-full max-w-[360px] rounded-[24px] border border-slate-200/80 bg-white/88 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              current mode
            </div>
            <div className="mt-1 text-base font-semibold text-slate-800">{PHASE_LABELS[phase]}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {autoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {autoPlay ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            <span>reveal progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-emerald-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StageCard({
  stage,
  visible,
  active,
  onClick,
  children,
}: {
  stage: StageDef;
  visible: boolean;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const Icon = stage.icon;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`group relative flex h-full min-h-[490px] flex-col overflow-hidden rounded-[28px] border bg-gradient-to-br p-4 text-left transition lg:min-h-0 ${stage.softBg} ${
        active
          ? "border-slate-300/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
          : "border-slate-200/75 shadow-sm hover:border-slate-300/80"
      }`}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: visible ? 1 : 0.08, y: visible ? 0 : 16, scale: active ? 1.01 : 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${stage.accent} shadow-sm`}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950/[0.03] text-[10px] text-slate-700">
            {stage.index}
          </span>
          <Icon className="h-3.5 w-3.5" />
        </div>

        <div className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${stage.accent} bg-white/80`}>
          {stage.subtitle}
        </div>
      </div>

      <div className="mt-4 flex-1">{children}</div>

      <div className="mt-4 border-t border-white/70 pt-4">
        <h2 className="text-[28px] font-semibold tracking-[-0.05em] text-slate-950">{stage.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{stage.caption}</p>
      </div>
    </motion.button>
  );
}

function MeasurementScene({
  tick,
  emphasized,
  onFocus,
}: {
  tick: number;
  emphasized: boolean;
  onFocus: () => void;
}) {
  const pulseIndex = tick % 4;

  return (
    <div className="flex h-full flex-col gap-4">
      <div
        onClick={(e) => {
          e.stopPropagation();
          onFocus();
        }}
        className="relative h-[320px] overflow-hidden rounded-[26px] border border-cyan-100/90 bg-white/78 text-left cursor-pointer"
      >
        <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-cyan-50/90 to-transparent" />
        <svg viewBox="0 0 340 320" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="wellPipe" x1="0" x2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          <line x1="0" x2="340" y1="210" y2="210" stroke="#bae6fd" strokeWidth="2" />
          <path d="M92 210 L125 96 L158 210 M108 150 H142" fill="none" stroke="url(#wellPipe)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M148 170 C194 178 240 168 286 146" fill="none" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round" />
          <path d="M286 146 C296 142 309 142 320 148" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
          <path d="M36 132 C86 88 146 88 210 118" fill="none" stroke="#a5f3fc" strokeWidth="3" strokeDasharray="6 9">
            <animate attributeName="stroke-dashoffset" from="0" to="-72" dur="6s" repeatCount="indefinite" />
          </path>
          <path d="M44 162 C96 178 154 176 230 154" fill="none" stroke="#93c5fd" strokeWidth="2.5" strokeDasharray="7 9">
            <animate attributeName="stroke-dashoffset" from="0" to="54" dur="5s" repeatCount="indefinite" />
          </path>

          {[
            { x: 72, y: 178, label: "P" },
            { x: 128, y: 126, label: "F" },
            { x: 188, y: 122, label: "T" },
            { x: 250, y: 154, label: "E" },
          ].map((node, index) => {
            const hot = pulseIndex === index;
            return (
              <g key={node.label}>
                <circle cx={node.x} cy={node.y} r={hot ? 11 : 8} fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
                <text x={node.x} y={node.y + 3} textAnchor="middle" fontSize="9" fill="#0369a1" fontWeight="700">
                  {node.label}
                </text>
                {hot && (
                  <circle cx={node.x} cy={node.y} r="18" fill="none" stroke="#22d3ee" strokeOpacity="0.4" strokeWidth="2">
                    <animate attributeName="r" values="12;22;12" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.45;0.08;0.45" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          <path d="M58 250 C88 232 118 242 150 248 C178 252 204 248 242 236" fill="none" stroke="#dbeafe" strokeWidth="10" strokeLinecap="round" />
          <path d="M58 250 C88 232 118 242 150 248 C178 252 204 248 242 236" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 12">
            <animate attributeName="stroke-dashoffset" from="0" to="-64" dur="4s" repeatCount="indefinite" />
          </path>
        </svg>

        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-700 shadow-sm">
          <Waves className="h-3.5 w-3.5" />
          live sensing at the well
        </div>

        <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-2">
          {[
            { label: "Pressure", value: "67 bar" },
            { label: "Flow", value: "132.4" },
            { label: "Temp", value: "78°C" },
            { label: "Truck", value: "+00:38" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className={`rounded-2xl border px-2.5 py-2 ${
                pulseIndex === index ? "border-cyan-300 bg-cyan-50/95" : "border-slate-200/80 bg-white/90"
              }`}
              animate={emphasized && pulseIndex === index ? { y: [0, -2, 0] } : { y: 0 }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">{item.value}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          "pressure pulse",
          "flow wave",
          "temperature drift",
        ].map((label, index) => (
          <div key={label} className="rounded-2xl border border-white/80 bg-white/70 px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">signal</div>
            <div className="mt-1 text-sm font-medium text-slate-700">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegistrationScene({
  tick,
  emphasized,
  onFocus,
}: {
  tick: number;
  emphasized: boolean;
  onFocus: () => void;
}) {
  const fillRows = 3 + (tick % 5);

  return (
    <div className="flex h-full flex-col gap-4">
      <div
        onClick={(e) => {
          e.stopPropagation();
          onFocus();
        }}
        className="relative h-[320px] overflow-hidden rounded-[26px] border border-blue-100/90 bg-white/78 text-left cursor-pointer"
      >
        <div className="absolute left-0 top-0 h-full w-[42%] bg-gradient-to-r from-blue-50/70 to-transparent" />
        <svg viewBox="0 0 340 320" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="dataFlow" x1="0" x2="1">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>

          <path d="M26 154 C72 154 92 154 136 154 C154 154 162 156 176 160" fill="none" stroke="#dbeafe" strokeWidth="14" strokeLinecap="round" />
          <path d="M26 154 C72 154 92 154 136 154 C154 154 162 156 176 160" fill="none" stroke="url(#dataFlow)" strokeWidth="7" strokeDasharray="12 12" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" from="0" to="58" dur="3.4s" repeatCount="indefinite" />
          </path>

          {Array.from({ length: 6 }).map((_, index) => (
            <rect
              key={index}
              x={34 + index * 16}
              y={144 + (index % 2) * 10}
              width="10"
              height="10"
              rx="3"
              fill={index === tick % 6 ? "#1d4ed8" : "#60a5fa"}
            >
              <animateTransform attributeName="transform" type="translate" values="0 0; 6 0; 0 0" dur={`${2 + index * 0.2}s`} repeatCount="indefinite" />
            </rect>
          ))}

          <ellipse cx="252" cy="78" rx="56" ry="16" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="2" />
          <path d="M196 78 V232" stroke="#bfdbfe" strokeWidth="2" />
          <path d="M308 78 V232" stroke="#bfdbfe" strokeWidth="2" />
          <ellipse cx="252" cy="232" rx="56" ry="16" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="2" />
          <rect x="196" y={232 - fillRows * 22} width="112" height={fillRows * 22} fill="#bfdbfe" opacity="0.25" />
          <ellipse cx="252" cy={232 - fillRows * 22} rx="56" ry="16" fill="#60a5fa" opacity="0.4" />

          {Array.from({ length: 7 }).map((_, index) => (
            <g key={index}>
              <line x1="206" x2="296" y1={104 + index * 16} y2={104 + index * 16} stroke="#dbeafe" strokeWidth="4" strokeLinecap="round" />
              {index < fillRows && (
                <>
                  <circle cx="214" cy={104 + index * 16} r="3" fill="#2563eb" />
                  <line x1="226" x2="286" y1={104 + index * 16} y2={104 + index * 16} stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" />
                </>
              )}
            </g>
          ))}
        </svg>

        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-sm">
          <Database className="h-3.5 w-3.5" />
          realtime ingestion
        </div>

        <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-blue-100/90 bg-white/90 px-3 py-3 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            {[
              ["SCADA tag", "stored"],
              ["SAP event", "posted"],
              ["Prod row", "synced"],
            ].map(([a, b], index) => (
              <motion.div
                key={a}
                className={`rounded-xl border px-2.5 py-2 ${emphasized && index === tick % 3 ? "border-blue-300 bg-blue-50" : "border-slate-200/80 bg-white"}`}
                animate={emphasized && index === tick % 3 ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{a}</div>
                <div className="mt-1 text-sm font-semibold text-slate-800">{b}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/70 px-3 py-3 text-sm text-slate-600">
        <Activity className="h-4 w-4 text-blue-600" />
        Data packets travel in, the database fills, and structured truth appears.
      </div>
    </div>
  );
}

function IntelligenceScene({
  tick,
  emphasized,
  onFocus,
}: {
  tick: number;
  emphasized: boolean;
  onFocus: () => void;
}) {
  const activeBrick = tick % 6;
  const built = 4 + (tick % 5);

  return (
    <div className="flex h-full flex-col gap-4">
      <div
        onClick={(e) => {
          e.stopPropagation();
          onFocus();
        }}
        className="relative h-[320px] overflow-hidden rounded-[26px] border border-violet-100/90 bg-white/78 text-left cursor-pointer"
      >
        <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-violet-50/75 to-transparent" />

        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-700 shadow-sm">
          <Bot className="h-3.5 w-3.5" />
          agents assembling insight
        </div>

        <div className="absolute left-4 top-16 flex flex-col gap-4">
          {[0, 1, 2].map((idx) => (
            <motion.div
              key={idx}
              className="flex items-center gap-3"
              animate={emphasized ? { x: [0, 4, 0] } : { x: 0 }}
              transition={{ duration: 1.9 + idx * 0.25, repeat: Infinity }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-violet-200 bg-violet-100/95 text-violet-700 shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <motion.div
                className={`h-5 w-10 rounded-md ${activeBrick === idx ? "bg-violet-500" : "bg-violet-200"}`}
                animate={emphasized ? { y: [0, -8, 0] } : { y: 0 }}
                transition={{ duration: 1.6 + idx * 0.2, repeat: Infinity }}
              />
            </motion.div>
          ))}
        </div>

        <div className="absolute right-4 top-16 grid w-[54%] grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, index) => {
            const isBuilt = index < built;
            return (
              <motion.div
                key={index}
                className={`h-[62px] rounded-2xl border p-2 ${
                  isBuilt ? "border-violet-200 bg-white shadow-sm" : "border-dashed border-violet-100 bg-violet-50/40"
                }`}
                initial={{ opacity: 0.3, scale: 0.95 }}
                animate={{ opacity: isBuilt ? 1 : 0.35, scale: isBuilt ? 1 : 0.95 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
              >
                {isBuilt && (
                  <>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-violet-500">
                      <BarChart3 className="h-3 w-3" />
                      tile
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-violet-100" />
                    <div className="mt-2 grid grid-cols-3 gap-1">
                      <div className="h-4 rounded-md bg-violet-50" />
                      <div className="h-4 rounded-md bg-violet-50" />
                      <div className="h-4 rounded-md bg-violet-100" />
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-violet-100 bg-white/90 px-3 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <BrainCircuit className="h-4 w-4 text-violet-600" />
            Agents pick up data bricks and build a decision wall.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          "priority",
          "reasoning",
          "recommendation",
        ].map((tag, index) => (
          <div key={tag} className={`rounded-2xl border px-3 py-2 ${emphasized && index === tick % 3 ? "border-violet-300 bg-violet-50" : "border-white/80 bg-white/70"}`}>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">agent output</div>
            <div className="mt-1 text-sm font-medium text-slate-700">{tag}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OptimizationScene({
  tick,
  emphasized,
  onFocus,
}: {
  tick: number;
  emphasized: boolean;
  onFocus: () => void;
}) {
  const bars = [52, 68, 82, 102].map((v, idx) => v + ((tick + idx) % 3) * 4);

  return (
    <div className="flex h-full flex-col gap-4">
      <div
        onClick={(e) => {
          e.stopPropagation();
          onFocus();
        }}
        className="relative h-[320px] overflow-hidden rounded-[26px] border border-emerald-100/90 bg-white/78 p-4 text-left cursor-pointer"
      >
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-emerald-50/80 to-transparent" />
        <div className="relative grid h-full grid-cols-[1.1fr_0.9fr] gap-3">
          <div className="rounded-[22px] border border-emerald-100/90 bg-gradient-to-br from-emerald-50/70 to-white p-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              growth curve
            </div>
            <svg viewBox="0 0 180 120" className="mt-3 h-[135px] w-full">
              <path d="M12 102 H170" stroke="#d1fae5" strokeWidth="2" />
              <path d="M16 104 V16" stroke="#d1fae5" strokeWidth="2" />
              <path d="M22 96 C56 94 74 76 98 62 C120 50 140 34 164 18" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
              {[26, 58, 90, 122, 154].map((x, idx) => (
                <circle key={x} cx={x} cy={94 - idx * 15} r={idx === tick % 5 ? 5 : 4} fill="#10b981">
                  <animate attributeName="r" values="4;6;4" dur={`${1.8 + idx * 0.2}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </svg>
          </div>

          <div className="grid grid-rows-2 gap-3">
            <div className="rounded-[22px] border border-emerald-100/90 bg-white p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">kpi lift</div>
              <div className="mt-3 flex h-[88px] items-end gap-2">
                {bars.map((height, idx) => (
                  <motion.div
                    key={idx}
                    className="flex-1 rounded-t-xl bg-gradient-to-t from-emerald-500 to-teal-300"
                    animate={emphasized ? { height } : { height: 38 }}
                    transition={{ duration: 0.7, delay: idx * 0.08 }}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-[22px] border border-emerald-100/90 bg-white p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">improvement pulse</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  ["Latency", "-78%"],
                  ["Risk", "-42%"],
                  ["Confidence", "+12%"],
                  ["Cost", "↓ 0.60"],
                ].map(([label, value], idx) => (
                  <div key={label} className={`rounded-xl border px-2.5 py-2 ${idx === tick % 4 ? "border-emerald-300 bg-emerald-50" : "border-emerald-100 bg-white"}`}>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</div>
                    <div className="mt-1 text-sm font-semibold text-emerald-700">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/70 px-3 py-3 text-sm text-slate-600">
        <BarChart3 className="h-4 w-4 text-emerald-600" />
        Improvement is shown as line growth, bar lift and KPI change, not as text overload.
      </div>
    </div>
  );
}

function BottomPanel({
  phase,
  stage,
  focus,
  onSelectFocus,
}: {
  phase: Phase;
  stage: StageDef;
  focus: FocusDef;
  onSelectFocus: (id: string) => void;
}) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-[26px] border border-slate-200/80 bg-white/88 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              active explanation
            </div>
            <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-900">
              {stage.title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{focus.text}</p>
          </div>
          <div className={`rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${stage.accent}`}>
            {PHASE_LABELS[phase]}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {FOCUS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectFocus(item.id)}
              className={`rounded-full border px-3 py-2 text-sm transition ${
                focus.id === item.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[26px] border border-slate-200/80 bg-white/88 p-5 shadow-sm">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">sequence</div>
        <div className="mt-4 space-y-3">
          {STAGES.map((item, index) => {
            const unlocked = phase >= index + 1;
            const active = stage.key === item.key;
            return (
              <div key={item.key} className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold ${unlocked ? "border-slate-300 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-400"}`}>
                  {item.index}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${active ? "text-slate-900" : "text-slate-600"}`}>{item.title}</div>
                  <div className="text-xs text-slate-400">{item.subtitle}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-3 text-sm leading-relaxed text-slate-600">
          {phase < 5
            ? "Each stage fades in one by one, staying visually distinct from the previous one."
            : "All four stages now read as a single orchestra: clear, connected and calm."}
        </div>
      </div>
    </div>
  );
}

function MasterFlow({
  phase,
  activeStage,
  tick,
}: {
  phase: Phase;
  activeStage: StageKey;
  tick: number;
}) {
  const visibleSegments = Math.max(0, Math.min(phase - 1, 3));
  const activeIndex = REVEAL_ORDER.indexOf(activeStage);

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg viewBox="0 0 1440 860" className="h-full w-full">
        <defs>
          <linearGradient id="masterGradient" x1="0" x2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="33%" stopColor="#3b82f6" />
            <stop offset="67%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <filter id="glowPath" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[360, 720, 1080].map((x) => (
          <line key={x} x1={x} x2={x} y1="42" y2="818" stroke="#e2e8f0" strokeWidth="1.5" opacity="0.6" />
        ))}

        <path d="M168 612 C260 612 308 612 360 612 C432 612 468 612 540 612 C620 612 660 612 728 612 C812 612 848 612 912 612 C992 612 1030 612 1086 612 C1176 612 1226 612 1274 612" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" opacity="0.85" />

        {visibleSegments >= 0 && phase >= 1 && (
          <motion.path
            d={segmentPath(0, visibleSegments)}
            fill="none"
            stroke="url(#masterGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="12 12"
            filter="url(#glowPath)"
            animate={{ strokeDashoffset: tick * 4, opacity: phase >= 5 ? 0.95 : 0.8 }}
            transition={{ duration: 1.1, ease: "linear" }}
          />
        )}

        {phase >= 5 && (
          <>
            <path d="M1264 644 C1206 744 1026 796 724 796 C458 796 258 742 174 650" fill="none" stroke="#d8b4fe" strokeWidth="2.5" strokeDasharray="10 12" opacity="0.8">
              <animate attributeName="stroke-dashoffset" from="0" to="-70" dur="5.5s" repeatCount="indefinite" />
            </path>
            <path d="M1264 644 C1206 744 1026 796 724 796 C458 796 258 742 174 650" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="10 12" opacity="0.35">
              <animate attributeName="stroke-dashoffset" from="0" to="-56" dur="4.8s" repeatCount="indefinite" />
            </path>
          </>
        )}

        {[168, 528, 888, 1248].map((x, index) => {
          const unlocked = phase >= index + 1;
          const isActive = index === activeIndex;
          return (
            <g key={x}>
              <circle cx={x} cy="612" r={isActive ? 11 : 8} fill="#ffffff" stroke={isActive ? "#0f172a" : unlocked ? "#94a3b8" : "#cbd5e1"} strokeWidth="2" />
              {unlocked && (
                <circle cx={x} cy="612" r={isActive ? 22 : 16} fill="none" stroke={isActive ? "#94a3b8" : "#e2e8f0"} strokeWidth="1.5" opacity="0.55">
                  <animate attributeName="r" values={isActive ? "18;24;18" : "14;18;14"} dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.45;0.18;0.45" dur="2.4s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function BackdropGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(34,211,238,0.08),transparent_28%),radial-gradient(circle_at_72%_16%,rgba(139,92,246,0.08),transparent_30%),radial-gradient(circle_at_84%_82%,rgba(16,185,129,0.08),transparent_28%)]" />
      <svg viewBox="0 0 1600 1000" className="absolute inset-0 h-full w-full opacity-[0.055]">
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 70} x2={i * 70} y1="0" y2="1000" stroke="#0f172a" strokeWidth="1" />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={`h-${i}`} x1="0" x2="1600" y1={i * 70} y2={i * 70} stroke="#0f172a" strokeWidth="1" />
        ))}
      </svg>
      <motion.div
        className="absolute left-[9%] top-[18%] h-32 w-32 rounded-full bg-cyan-200/10 blur-3xl"
        animate={{ x: [0, 14, 0], y: [0, -12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[11%] top-[13%] h-32 w-32 rounded-full bg-violet-300/10 blur-3xl"
        animate={{ x: [0, -12, 0], y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[12%] right-[18%] h-32 w-32 rounded-full bg-emerald-200/10 blur-3xl"
        animate={{ x: [0, -10, 0], y: [0, 8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function segmentPath(startIndex: number, visibleSegments: number) {
  const segments = [
    "M168 612 C260 612 308 612 360 612 C432 612 468 612 528 612",
    "M528 612 C620 612 660 612 720 612 C812 612 848 612 888 612",
    "M888 612 C992 612 1030 612 1104 612 C1176 612 1216 612 1248 612",
  ];
  return segments.slice(startIndex, startIndex + visibleSegments + 1).join(" ");
}
