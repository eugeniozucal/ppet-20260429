import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Brain,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Database,
  FileCheck,
  FileText,
  Gauge,
  GitBranch,
  HardDrive,
  Layers,
  Link2,
  ListChecks,
  MessageSquare,
  Pause,
  PenLine,
  Play,
  Radar,
  RefreshCcw,
  Route,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Waves,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ScenarioId =
  | "highTorqueRopDrop"
  | "mwdSignalFailure"
  | "holeCleaningCirculation"
  | "geosteeringDecision"
  | "mudPropertyAdjustment"
  | "connectionTimeAnomaly"
  | "nptClassificationReview";

type SourceType =
  | "rigData"
  | "realTimeAlert"
  | "shiftReport"
  | "companyMan"
  | "mwdLwd"
  | "directional"
  | "mudReport"
  | "mudLogging"
  | "geology"
  | "serviceCompany"
  | "hse"
  | "manualReview";

type ActivityType =
  | "drilling"
  | "connection"
  | "circulation"
  | "reaming"
  | "trip"
  | "waiting"
  | "maintenance"
  | "nptCandidate"
  | "safety"
  | "review";

type SectionStatus = "complete" | "needsReview" | "missingData" | "conflict" | "ready" | "approved";
type ConfidenceLevel = "high" | "medium" | "low" | "missing";

type ReviewActionType =
  | "approve"
  | "edit"
  | "confirmNpt"
  | "markOperationalDelay"
  | "requestClarification"
  | "addReviewerNote"
  | "approveDdr";

type Tone = "slate" | "cyan" | "blue" | "violet" | "emerald" | "amber" | "rose";
type DemoPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type ReviewItemStatus = "open" | "inReview" | "resolved" | "deferred";
type BottomTabId = "activity" | "npt" | "traceability" | "events" | "quality";
type DraftStatus = "collecting" | "aligning" | "draftGenerated" | "reviewRequired" | "ready" | "published";
type MemoryStatus = "draft" | "ready" | "saved";

interface ScenarioConfig {
  id: ScenarioId;
  name: string;
  shortName: string;
  accentTone: Tone;
  headline: string;
  description: string;
  aiInsight: string;
  selectedEventId: string;
  selectedSegmentId: string;
  selectedParagraphId: string;
  selectedReviewItemId: string;
  primarySources: SourceType[];
  riskLabel: string;
  riskTone: Tone;
  targetApprovalReadiness: number;
  operatingFocus: string;
}

interface WellContext {
  wellName: string;
  rigName: string;
  reportDate: string;
  operationDay: number;
  sectionDrilled: string;
  field: string;
  basin: string;
  country: string;
  startingDepth: number;
  endingDepth: number;
  currentMeasuredDepth: number;
  plannedTvd: number;
  bitSize: string;
  mudSystem: string;
  companyMan: string;
  drillingSupervisor: string;
  directionalLead: string;
  geologist: string;
}

interface RigDataPoint {
  time: number;
  timeLabel: string;
  measuredDepth: number;
  bitDepth: number;
  rop: number;
  rpm: number;
  torque: number;
  standpipePressure: number;
  wob: number;
  flowRate: number;
  hookload: number;
  gammaRay: number;
  mwdSignalQuality: number;
  activity: ActivityType;
  anomalyScore: number;
  segmentId: string;
}

interface ActivitySegment {
  id: string;
  type: ActivityType;
  label: string;
  startHour: number;
  endHour: number;
  startDepth: number;
  endDepth: number;
  confidence: ConfidenceLevel;
  tone: Tone;
  sourceIds: string[];
  paragraphIds: string[];
  reviewItemIds: string[];
  eventIds: string[];
  summary: string;
  nptCandidate: boolean;
  uncertainty: string | null;
}

interface SourceStream {
  id: string;
  type: SourceType;
  name: string;
  status: "connected" | "loaded" | "aligned" | "reviewRequired" | "missing";
  coverage: string;
  completeness: number;
  recordCount: number;
  usedCount: number;
  contributed: boolean;
  confidence: ConfidenceLevel;
  tone: Tone;
  latestExcerpt: string;
  relatedParagraphIds: string[];
  relatedSegmentIds: string[];
  relatedEventIds: string[];
}

interface HumanComment {
  id: string;
  sourceId: string;
  sourceType: SourceType;
  author: string;
  role: string;
  time: number;
  depth: number;
  text: string;
  extractedIntent: string;
  confidence: ConfidenceLevel;
  relatedSegmentId: string;
  relatedParagraphId: string;
}

interface RealTimeAlert {
  id: string;
  sourceId: string;
  time: number;
  depth: number;
  title: string;
  severity: "info" | "warning" | "critical";
  signal: string;
  detail: string;
  acknowledged: boolean;
  relatedSegmentId: string;
  relatedParagraphId: string;
}

interface SourceChip {
  id: string;
  sourceId: string;
  sourceType: SourceType;
  label: string;
  confidence: ConfidenceLevel;
  tone: Tone;
}

interface DDRParagraph {
  id: string;
  sectionId: string;
  title: string;
  body: string;
  status: SectionStatus;
  confidence: ConfidenceLevel;
  sourceChips: SourceChip[];
  evidenceIds: string[];
  segmentIds: string[];
  reviewItemIds: string[];
  generatedByAi: boolean;
  reviewerNote: string | null;
  lastEditedBy: string | null;
}

interface DDRSection {
  id: string;
  title: string;
  status: SectionStatus;
  confidence: ConfidenceLevel;
  summary: string;
  paragraphs: DDRParagraph[];
  requiredSources: SourceType[];
  missingSourceTypes: SourceType[];
  reviewItemIds: string[];
  order: number;
}

interface EvidenceItem {
  id: string;
  paragraphId: string;
  sourceId: string;
  sourceType: SourceType;
  segmentId: string;
  title: string;
  timestamp: string;
  depth: number;
  detail: string;
  extractedFields: Array<{ label: string; value: string }>;
  confidence: ConfidenceLevel;
  tone: Tone;
  discrepancy: string | null;
}

interface ReviewQueueItem {
  id: string;
  title: string;
  description: string;
  scenarioIds: ScenarioId[];
  status: ReviewItemStatus;
  severity: Tone;
  sectionId: string;
  paragraphId: string;
  segmentId: string;
  eventId: string;
  actionTypes: ReviewActionType[];
  resolutionText: string;
  evidenceSummary: string;
  requiredForApproval: boolean;
}

interface OperationalEvent {
  id: string;
  title: string;
  type: ActivityType;
  severity: Tone;
  time: number;
  depth: number;
  segmentId: string;
  paragraphId: string;
  reviewItemId: string | null;
  summary: string;
  includedInDraft: boolean;
  confidence: ConfidenceLevel;
  sourceIds: string[];
}

interface StructuredEvent {
  id: string;
  title: string;
  type: ActivityType;
  startHour: number;
  endHour: number;
  depthRange: string;
  cause: string;
  action: string;
  result: string;
  parameters: Array<{ label: string; value: string }>;
  sources: SourceType[];
  confidence: ConfidenceLevel;
  status: MemoryStatus;
  memoryImpact: string;
  relatedReviewItemId: string | null;
  tone: Tone;
}

interface NptInterval {
  id: string;
  startHour: number;
  endHour: number;
  durationHours: number;
  depthRange: string;
  description: string;
  candidateReason: string;
  classification: "unclassified" | "confirmedNpt" | "operationalDelay";
  confidence: ConfidenceLevel;
  relatedReviewItemId: string;
  sourceIds: string[];
}

interface ReportQualityMetrics {
  completenessScore: number;
  traceabilityScore: number;
  unresolvedUncertainty: number;
  reviewProgress: number;
  approvalReadiness: number;
  manualTimeSavedMinutes: number;
  inconsistenciesDetected: number;
  possibleNptIntervalsFlagged: number;
  structuredEventsCreated: number;
  historicalMemoryEnrichment: number;
  missingCitations: number;
  sectionsApproved: number;
  sectionsReady: number;
  sourceCoverage: number;
  validationItemsResolved: number;
  qualityTone: Tone;
}

interface SystemMetrics {
  manualCompilationBeforeMinutes: number;
  manualCompilationAfterMinutes: number;
  traceabilityCoverage: number;
  inconsistenciesDetected: number;
  possibleNptIntervalsFlagged: number;
  structuredEventsCreated: number;
  reportCompleteness: number;
  reviewReadiness: number;
  historicalMemoryEnrichment: number;
  similarWellsComparisonReady: boolean;
  dominantConstraint: string;
  currentRiskTone: Tone;
  sourceFamiliesAligned: number;
  paragraphCitationCoverage: number;
}

interface TraceEvent {
  id: string;
  time: string;
  phase: DemoPhase;
  title: string;
  detail: string;
  tone: Tone;
  relatedSourceId: string | null;
  relatedSegmentId: string | null;
  relatedParagraphId: string | null;
  relatedReviewItemId: string | null;
  type: "system" | "source" | "event" | "review" | "memory";
}

interface ApprovalState {
  ready: boolean;
  status: DraftStatus;
  readiness: number;
  officialArchiveStatus: MemoryStatus;
  structuredMemoryStatus: MemoryStatus;
  blockers: string[];
  reviewer: string;
  approvalTimestamp: string | null;
  approvedSectionCount: number;
  totalSectionCount: number;
  requiredOpenItems: number;
}

interface ToneClassSet {
  text: string;
  border: string;
  bg: string;
  softBg: string;
  iconBg: string;
  ring: string;
  dot: string;
  gradient: string;
}

interface ReviewResolution {
  actionType: ReviewActionType;
  label: string;
  resolved: boolean;
  note: string;
  timestamp: string;
}

interface ValueMetric {
  label: string;
  value: string;
  delta: string;
  tone: Tone;
  icon: LucideIcon;
}

interface ActivitySplitItem {
  type: ActivityType;
  label: string;
  hours: number;
  color: string;
}

interface AlignmentSummary {
  sourceId: string;
  segmentIds: string[];
  paragraphIds: string[];
}

interface ChartClickState {
  activePayload?: Array<{ payload: RigDataPoint }>;
}

const PLUSPETROL_LOGO_URL = "https://images.aiworkify.com/pluspetrol-project/pluspetrol-isologo.png";

const WELL_CONTEXT: WellContext = {
  wellName: "PP.NQN-OS-1475H",
  rigName: "Rig Patagonia 217",
  reportDate: "29 Apr 2026",
  operationDay: 18,
  sectionDrilled: "8 1/2 in lateral section",
  field: "Loma Campana",
  basin: "Neuquén Basin",
  country: "Argentina",
  startingDepth: 4820,
  endingDepth: 5146,
  currentMeasuredDepth: 5146,
  plannedTvd: 3018,
  bitSize: "8 1/2 in PDC",
  mudSystem: "OBM 1.28 sg",
  companyMan: "A. Pereira",
  drillingSupervisor: "M. Robledo",
  directionalLead: "D. Fuentes",
  geologist: "L. Ibáñez",
};

const PHASES: Array<{ phase: DemoPhase; label: string; tone: Tone }> = [
  { phase: 0, label: "End of drilling day", tone: "slate" },
  { phase: 1, label: "Sources connect", tone: "cyan" },
  { phase: 2, label: "Time-depth alignment", tone: "blue" },
  { phase: 3, label: "Event detection", tone: "rose" },
  { phase: 4, label: "Source fusion", tone: "violet" },
  { phase: 5, label: "DDR draft generated", tone: "blue" },
  { phase: 6, label: "Uncertainty flagged", tone: "amber" },
  { phase: 7, label: "Human review", tone: "emerald" },
  { phase: 8, label: "Approval readiness", tone: "emerald" },
  { phase: 9, label: "Publish path", tone: "violet" },
  { phase: 10, label: "Official DDR + memory", tone: "emerald" },
];

const SCENARIOS: ScenarioConfig[] = [
  {
    id: "highTorqueRopDrop",
    name: "High Torque + ROP Drop",
    shortName: "Torque / ROP",
    accentTone: "rose",
    headline: "Torque increased while ROP dropped in the lateral section.",
    description:
      "Rig data and a real-time alert identify a deviation. Company man notes confirm RPM reduction and circulation; root cause remains flagged as suspected until validated.",
    aiInsight:
      "Rig data and the real-time alert agree on the torque / ROP deviation. The human comment supports the action taken, but the cause should remain classified as suspected hole cleaning until the reviewer validates it.",
    selectedEventId: "evt-torque-rop",
    selectedSegmentId: "seg-circulation-1435",
    selectedParagraphId: "p-relevant-events",
    selectedReviewItemId: "rq-cause-rpm",
    primarySources: ["rigData", "realTimeAlert", "companyMan", "shiftReport", "mudLogging"],
    riskLabel: "Cause requires validation",
    riskTone: "amber",
    targetApprovalReadiness: 86,
    operatingFocus: "Separate objective parameter deviation from human explanation.",
  },
  {
    id: "mwdSignalFailure",
    name: "MWD Signal Failure",
    shortName: "MWD Signal",
    accentTone: "violet",
    headline: "Intermittent MWD signal aligns with troubleshooting and a 2.1h activity gap.",
    description:
      "Directional report and MWD signal quality support the event. The DDR draft flags possible NPT and asks the reviewer to confirm classification.",
    aiInsight:
      "The MWD signal issue aligns with the directional report and a 2.1h activity gap. This interval should be reviewed for NPT classification before report approval.",
    selectedEventId: "evt-mwd-signal",
    selectedSegmentId: "seg-waiting-1130",
    selectedParagraphId: "p-directional-mwd",
    selectedReviewItemId: "rq-mwd-npt",
    primarySources: ["mwdLwd", "directional", "rigData", "shiftReport", "serviceCompany"],
    riskLabel: "Possible NPT classification",
    riskTone: "rose",
    targetApprovalReadiness: 78,
    operatingFocus: "Confirm whether the signal failure generated official NPT.",
  },
  {
    id: "holeCleaningCirculation",
    name: "Hole Cleaning Circulation",
    shortName: "Hole Cleaning",
    accentTone: "cyan",
    headline: "Pumps stayed active with no depth progress during suspected loaded-hole circulation.",
    description:
      "Shift report explains the drilling pause. The draft captures the action, suspected cause, and result with source citations.",
    aiInsight:
      "The pumps-on / no-depth interval is explained by the shift report. The narrative should state suspected loaded hole as the reason and retain the result as observed parameter normalization.",
    selectedEventId: "evt-hole-cleaning",
    selectedSegmentId: "seg-circulation-1510",
    selectedParagraphId: "p-relevant-events",
    selectedReviewItemId: "rq-cause-rpm",
    primarySources: ["rigData", "shiftReport", "companyMan", "mudLogging"],
    riskLabel: "Supported by shift report",
    riskTone: "cyan",
    targetApprovalReadiness: 88,
    operatingFocus: "Attach human explanation to objective circulation interval.",
  },
  {
    id: "geosteeringDecision",
    name: "Geosteering Decision",
    shortName: "Geosteering",
    accentTone: "emerald",
    headline: "Geology note explains a conservative steering decision while staying inside target.",
    description:
      "Geological observation is linked to directional plan versus actual trajectory, avoiding unsupported performance interpretation.",
    aiInsight:
      "The geology note explains the conservative steering decision. The narrative should cite geology rather than infer drilling performance as the cause.",
    selectedEventId: "evt-geosteer",
    selectedSegmentId: "seg-drilling-1320",
    selectedParagraphId: "p-geology",
    selectedReviewItemId: "rq-geology-plan",
    primarySources: ["geology", "directional", "mwdLwd", "rigData"],
    riskLabel: "Ready after geology approval",
    riskTone: "emerald",
    targetApprovalReadiness: 91,
    operatingFocus: "Link geosteering decisions with directional and gamma response.",
  },
  {
    id: "mudPropertyAdjustment",
    name: "Mud Property Adjustment",
    shortName: "Mud Treatment",
    accentTone: "blue",
    headline: "Mud density and viscosity adjustment matches standpipe pressure response.",
    description:
      "Mud report treatment and rig pressure trend support inclusion of the mud system update and operational reason.",
    aiInsight:
      "Mud report and standpipe pressure trend support inclusion of the mud treatment in the daily narrative. The reviewer should confirm final mud values before approval.",
    selectedEventId: "evt-mud-treatment",
    selectedSegmentId: "seg-mud-treatment",
    selectedParagraphId: "p-mud-system",
    selectedReviewItemId: "rq-mud-values",
    primarySources: ["mudReport", "rigData", "mudLogging", "companyMan"],
    riskLabel: "Mud values need confirmation",
    riskTone: "amber",
    targetApprovalReadiness: 84,
    operatingFocus: "Connect service report values with rig pressure response.",
  },
  {
    id: "connectionTimeAnomaly",
    name: "Connection Time Anomaly",
    shortName: "Connection",
    accentTone: "amber",
    headline: "Extended connection detected without an explanatory human comment.",
    description:
      "Rig activity indicates longer-than-usual connection time. The draft avoids root-cause classification until reviewer input is added.",
    aiInsight:
      "Rig activity indicates an extended connection, but no shift comment explains the delay. The DDR draft should not classify root cause until reviewer input is added.",
    selectedEventId: "evt-connection-delay",
    selectedSegmentId: "seg-connection-0925",
    selectedParagraphId: "p-hourly-activities",
    selectedReviewItemId: "rq-connection-delay",
    primarySources: ["rigData", "manualReview", "shiftReport"],
    riskLabel: "Missing explanation",
    riskTone: "amber",
    targetApprovalReadiness: 74,
    operatingFocus: "Flag missing commentary instead of inventing a cause.",
  },
  {
    id: "nptClassificationReview",
    name: "NPT Classification Review",
    shortName: "NPT Review",
    accentTone: "rose",
    headline: "No drilling progress for 2.1h while waiting on tool confirmation.",
    description:
      "Comments indicate waiting on tool confirmation. The DDR marks possible NPT and requires human classification before publishing.",
    aiInsight:
      "The 2.1h interval has enough evidence to be flagged as possible NPT, but the classification must be confirmed by the drilling supervisor before the DDR can be approved.",
    selectedEventId: "evt-npt-candidate",
    selectedSegmentId: "seg-npt-1655",
    selectedParagraphId: "p-npt",
    selectedReviewItemId: "rq-npt-classification",
    primarySources: ["rigData", "companyMan", "serviceCompany", "manualReview"],
    riskLabel: "NPT requires classification",
    riskTone: "rose",
    targetApprovalReadiness: 72,
    operatingFocus: "Keep lost-time classification under human approval.",
  },
];

const TONE_CLASSES: Record<Tone, ToneClassSet> = {
  slate: {
    text: "text-slate-700",
    border: "border-slate-200",
    bg: "bg-slate-100",
    softBg: "bg-slate-50",
    iconBg: "bg-slate-100",
    ring: "ring-slate-200",
    dot: "bg-slate-400",
    gradient: "from-slate-100 via-white to-slate-50",
  },
  cyan: {
    text: "text-cyan-700",
    border: "border-cyan-200",
    bg: "bg-cyan-100",
    softBg: "bg-cyan-50",
    iconBg: "bg-cyan-100",
    ring: "ring-cyan-200",
    dot: "bg-cyan-500",
    gradient: "from-cyan-100 via-white to-sky-50",
  },
  blue: {
    text: "text-blue-700",
    border: "border-blue-200",
    bg: "bg-blue-100",
    softBg: "bg-blue-50",
    iconBg: "bg-blue-100",
    ring: "ring-blue-200",
    dot: "bg-blue-600",
    gradient: "from-blue-100 via-white to-cyan-50",
  },
  violet: {
    text: "text-violet-700",
    border: "border-violet-200",
    bg: "bg-violet-100",
    softBg: "bg-violet-50",
    iconBg: "bg-violet-100",
    ring: "ring-violet-200",
    dot: "bg-violet-500",
    gradient: "from-violet-100 via-white to-indigo-50",
  },
  emerald: {
    text: "text-emerald-700",
    border: "border-emerald-200",
    bg: "bg-emerald-100",
    softBg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
    gradient: "from-emerald-100 via-white to-teal-50",
  },
  amber: {
    text: "text-amber-700",
    border: "border-amber-200",
    bg: "bg-amber-100",
    softBg: "bg-amber-50",
    iconBg: "bg-amber-100",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
    gradient: "from-amber-100 via-white to-orange-50",
  },
  rose: {
    text: "text-rose-700",
    border: "border-rose-200",
    bg: "bg-rose-100",
    softBg: "bg-rose-50",
    iconBg: "bg-rose-100",
    ring: "ring-rose-200",
    dot: "bg-rose-500",
    gradient: "from-rose-100 via-white to-red-50",
  },
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  drilling: "#2563eb",
  connection: "#64748b",
  circulation: "#06b6d4",
  reaming: "#8b5cf6",
  trip: "#0f766e",
  waiting: "#f59e0b",
  maintenance: "#475569",
  nptCandidate: "#e11d48",
  safety: "#dc2626",
  review: "#7c3aed",
};

const SOURCE_LABELS: Record<SourceType, string> = {
  rigData: "Rig data",
  realTimeAlert: "Real-time alert",
  shiftReport: "Shift report",
  companyMan: "Company man",
  mwdLwd: "MWD/LWD",
  directional: "Directional",
  mudReport: "Mud report",
  mudLogging: "Mud logging",
  geology: "Geology",
  serviceCompany: "Service company",
  hse: "HSE",
  manualReview: "Manual review",
};

const SOURCE_ICONS: Record<SourceType, LucideIcon> = {
  rigData: Gauge,
  realTimeAlert: Zap,
  shiftReport: ClipboardCheck,
  companyMan: MessageSquare,
  mwdLwd: Radar,
  directional: Route,
  mudReport: Waves,
  mudLogging: Layers,
  geology: Target,
  serviceCompany: HardDrive,
  hse: ShieldCheck,
  manualReview: UserCheck,
};

const SOURCE_TONES: Record<SourceType, Tone> = {
  rigData: "blue",
  realTimeAlert: "rose",
  shiftReport: "slate",
  companyMan: "cyan",
  mwdLwd: "violet",
  directional: "blue",
  mudReport: "emerald",
  mudLogging: "amber",
  geology: "emerald",
  serviceCompany: "slate",
  hse: "emerald",
  manualReview: "violet",
};

const BOTTOM_TABS: Array<{ id: BottomTabId; label: string; icon: LucideIcon }> = [
  { id: "activity", label: "Activity Summary", icon: BarChart3 },
  { id: "npt", label: "NPT Review", icon: Timer },
  { id: "traceability", label: "Source Traceability", icon: Link2 },
  { id: "events", label: "Structured Events", icon: Database },
  { id: "quality", label: "Report Quality", icon: BadgeCheck },
];

function getScenarioConfig(id: ScenarioId): ScenarioConfig {
  return SCENARIOS.find((scenario) => scenario.id === id) ?? SCENARIOS[0];
}

function getToneClasses(tone: Tone): ToneClassSet {
  return TONE_CLASSES[tone];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function formatTime(hour: number): string {
  const normalized = clamp(hour, 0, 24);
  const whole = Math.floor(normalized);
  const minutesRaw = Math.round((normalized - whole) * 60);
  const minutes = minutesRaw === 60 ? 0 : minutesRaw;
  const hourValue = minutesRaw === 60 ? whole + 1 : whole;
  return `${String(hourValue).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatDepth(depth: number): string {
  return `${Math.round(depth).toLocaleString("en-US")} mMD`;
}

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h <= 0) return `${m} min`;
  if (m <= 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function confidenceToScore(confidence: ConfidenceLevel): number {
  if (confidence === "high") return 92;
  if (confidence === "medium") return 76;
  if (confidence === "low") return 54;
  return 18;
}

function scoreToConfidence(score: number): ConfidenceLevel {
  if (score >= 86) return "high";
  if (score >= 68) return "medium";
  if (score >= 38) return "low";
  return "missing";
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function wave(value: number, seed: number): number {
  return Math.sin(value * 1.37 + seed) + Math.cos(value * 0.63 + seed * 0.41);
}

function scenarioIndex(scenarioId: ScenarioId): number {
  return Math.max(0, SCENARIOS.findIndex((scenario) => scenario.id === scenarioId));
}

function safeDemoPhase(value: number): DemoPhase {
  return clamp(Math.round(value), 0, 10) as DemoPhase;
}

function reviewActionLabel(action: ReviewActionType): string {
  const labels: Record<ReviewActionType, string> = {
    approve: "Approve section",
    edit: "Edit narrative",
    confirmNpt: "Confirm NPT",
    markOperationalDelay: "Mark operational delay",
    requestClarification: "Request clarification",
    addReviewerNote: "Add reviewer note",
    approveDdr: "Approve DDR",
  };
  return labels[action];
}

function statusLabel(status: SectionStatus): string {
  const labels: Record<SectionStatus, string> = {
    complete: "Complete",
    needsReview: "Needs review",
    missingData: "Missing data",
    conflict: "Conflict detected",
    ready: "Ready",
    approved: "Approved",
  };
  return labels[status];
}

function statusTone(status: SectionStatus): Tone {
  const tones: Record<SectionStatus, Tone> = {
    complete: "emerald",
    needsReview: "amber",
    missingData: "rose",
    conflict: "rose",
    ready: "blue",
    approved: "emerald",
  };
  return tones[status];
}

function draftStatusLabel(status: DraftStatus): string {
  const labels: Record<DraftStatus, string> = {
    collecting: "Sources collecting",
    aligning: "Time-depth aligning",
    draftGenerated: "Draft generated",
    reviewRequired: "Human approval required",
    ready: "Ready for approval",
    published: "Published + stored",
  };
  return labels[status];
}

function sourceTypeFromId(sourceId: string): SourceType {
  const map: Record<string, SourceType> = {
    "src-rig": "rigData",
    "src-alerts": "realTimeAlert",
    "src-shift": "shiftReport",
    "src-company": "companyMan",
    "src-mwd": "mwdLwd",
    "src-directional": "directional",
    "src-mud": "mudReport",
    "src-mudlog": "mudLogging",
    "src-geology": "geology",
    "src-service": "serviceCompany",
    "src-hse": "hse",
    "src-review": "manualReview",
  };
  return map[sourceId] ?? "manualReview";
}

function sourceChip(sourceId: string, confidence: ConfidenceLevel = "high"): SourceChip {
  const sourceType = sourceTypeFromId(sourceId);
  return {
    id: `${sourceId}-${confidence}`,
    sourceId,
    sourceType,
    label: SOURCE_LABELS[sourceType],
    confidence,
    tone: SOURCE_TONES[sourceType],
  };
}

function generateActivitySegments(scenarioId: ScenarioId): ActivitySegment[] {
  const mwdFailure = scenarioId === "mwdSignalFailure";
  const connectionAnomaly = scenarioId === "connectionTimeAnomaly";
  const highTorque = scenarioId === "highTorqueRopDrop";
  const holeCleaning = scenarioId === "holeCleaningCirculation";
  const geosteering = scenarioId === "geosteeringDecision";
  const mudAdjustment = scenarioId === "mudPropertyAdjustment";
  const nptReview = scenarioId === "nptClassificationReview";

  const connectionEnd = connectionAnomaly ? 10.35 : 9.75;
  const mwdStart = 11.55;
  const mwdEnd = mwdFailure ? 13.65 : 12.15;
  const drilling1320Start = mwdEnd;
  const nptStartDepth = holeCleaning ? 5112 : highTorque ? 5094 : 5128;
  const nptEnd = nptReview ? 19.05 : 18.6;

  return [
    {
      id: "seg-review-0000",
      type: "review",
      label: "Midnight handover",
      startHour: 0,
      endHour: 0.9,
      startDepth: 4820,
      endDepth: 4820,
      confidence: "high",
      tone: "slate",
      sourceIds: ["src-shift", "src-company"],
      paragraphIds: ["p-hourly-activities"],
      reviewItemIds: [],
      eventIds: ["evt-handover"],
      summary: "Night shift handover, BHA condition, well control status, and drilling program confirmation.",
      nptCandidate: false,
      uncertainty: null,
    },
    {
      id: "seg-drilling-0055",
      type: "drilling",
      label: "Drill lateral section",
      startHour: 0.9,
      endHour: 3.4,
      startDepth: 4820,
      endDepth: 4876,
      confidence: "high",
      tone: "blue",
      sourceIds: ["src-rig", "src-mwd"],
      paragraphIds: ["p-hourly-activities", "p-parameters"],
      reviewItemIds: [],
      eventIds: ["evt-drilling-a"],
      summary: "Steady drilling with stable flow, torque, toolface, and ROP.",
      nptCandidate: false,
      uncertainty: null,
    },
    {
      id: "seg-connection-0330",
      type: "connection",
      label: "Connection",
      startHour: 3.4,
      endHour: 3.75,
      startDepth: 4876,
      endDepth: 4876,
      confidence: "high",
      tone: "slate",
      sourceIds: ["src-rig"],
      paragraphIds: ["p-hourly-activities"],
      reviewItemIds: [],
      eventIds: ["evt-connection-a"],
      summary: "Connection detected from slips, hookload, pump-off and no-depth signature.",
      nptCandidate: false,
      uncertainty: null,
    },
    {
      id: "seg-drilling-0345",
      type: "drilling",
      label: "Drill ahead",
      startHour: 3.75,
      endHour: 6.85,
      startDepth: 4876,
      endDepth: 4942,
      confidence: "high",
      tone: "blue",
      sourceIds: ["src-rig", "src-mwd"],
      paragraphIds: ["p-hourly-activities", "p-parameters"],
      reviewItemIds: [],
      eventIds: ["evt-drilling-b"],
      summary: "Drilling resumed after connection with ROP near plan and stable standpipe pressure.",
      nptCandidate: false,
      uncertainty: null,
    },
    {
      id: "seg-circulation-0650",
      type: "circulation",
      label: "Short circulation",
      startHour: 6.85,
      endHour: 7.25,
      startDepth: 4942,
      endDepth: 4942,
      confidence: "medium",
      tone: "cyan",
      sourceIds: ["src-rig", "src-shift"],
      paragraphIds: ["p-hourly-activities"],
      reviewItemIds: [],
      eventIds: ["evt-circ-a"],
      summary: "Pumps active with no depth progress; shift note indicates bottoms-up check.",
      nptCandidate: false,
      uncertainty: null,
    },
    {
      id: "seg-drilling-0720",
      type: "drilling",
      label: "Drill lateral build-out",
      startHour: 7.25,
      endHour: 9.35,
      startDepth: 4942,
      endDepth: 4994,
      confidence: "high",
      tone: geosteering ? "emerald" : "blue",
      sourceIds: ["src-rig", "src-mwd", "src-geology"],
      paragraphIds: ["p-hourly-activities", "p-geology"],
      reviewItemIds: geosteering ? ["rq-geology-plan"] : [],
      eventIds: ["evt-geosteer"],
      summary: geosteering
        ? "Gamma and cuttings interpretation support conservative continuation inside the target window."
        : "Drilling continued with gamma response monitored against target window.",
      nptCandidate: false,
      uncertainty: null,
    },
    {
      id: "seg-connection-0925",
      type: connectionAnomaly ? "review" : "connection",
      label: connectionAnomaly ? "Extended connection anomaly" : "Connection",
      startHour: 9.35,
      endHour: connectionEnd,
      startDepth: 4994,
      endDepth: 4994,
      confidence: connectionAnomaly ? "medium" : "high",
      tone: connectionAnomaly ? "amber" : "slate",
      sourceIds: connectionAnomaly ? ["src-rig", "src-review"] : ["src-rig"],
      paragraphIds: ["p-hourly-activities"],
      reviewItemIds: connectionAnomaly ? ["rq-connection-delay"] : [],
      eventIds: ["evt-connection-delay"],
      summary: connectionAnomaly
        ? "Connection time exceeds offset baseline and has no explanatory comment attached."
        : "Connection detected and reconciled with shift activity table.",
      nptCandidate: false,
      uncertainty: connectionAnomaly ? "No shift or company man comment explains the extended connection." : null,
    },
    {
      id: "seg-drilling-1000",
      type: "drilling",
      label: "Drill ahead",
      startHour: connectionEnd,
      endHour: mwdStart,
      startDepth: 4994,
      endDepth: 5036,
      confidence: "high",
      tone: "blue",
      sourceIds: ["src-rig", "src-mwd", "src-directional"],
      paragraphIds: ["p-hourly-activities", "p-directional-mwd"],
      reviewItemIds: [],
      eventIds: ["evt-drilling-c"],
      summary: "Drilling ahead with stable trajectory control and real-time survey updates.",
      nptCandidate: false,
      uncertainty: null,
    },
    {
      id: "seg-waiting-1130",
      type: mwdFailure ? "nptCandidate" : "maintenance",
      label: mwdFailure ? "MWD troubleshooting gap" : "Toolface confirmation",
      startHour: mwdStart,
      endHour: mwdEnd,
      startDepth: 5036,
      endDepth: 5036,
      confidence: mwdFailure ? "medium" : "high",
      tone: mwdFailure ? "rose" : "slate",
      sourceIds: ["src-rig", "src-mwd", "src-directional", "src-service"],
      paragraphIds: ["p-directional-mwd", "p-npt"],
      reviewItemIds: mwdFailure ? ["rq-mwd-npt"] : [],
      eventIds: ["evt-mwd-signal"],
      summary: mwdFailure
        ? "Intermittent MWD signal, troubleshooting, and no-depth interval require lost-time classification review."
        : "Directional team confirmed toolface and resumed drilling without reportable lost time.",
      nptCandidate: mwdFailure,
      uncertainty: mwdFailure ? "NPT classification is not yet approved." : null,
    },
    {
      id: "seg-drilling-1320",
      type: "drilling",
      label: geosteering ? "Conservative geosteering" : "Drill ahead",
      startHour: drilling1320Start,
      endHour: 14.35,
      startDepth: 5036,
      endDepth: 5086,
      confidence: "high",
      tone: geosteering ? "emerald" : "blue",
      sourceIds: ["src-rig", "src-mwd", "src-geology", "src-directional"],
      paragraphIds: ["p-geology", "p-directional-mwd", "p-hourly-activities"],
      reviewItemIds: geosteering ? ["rq-geology-plan"] : [],
      eventIds: ["evt-geosteer"],
      summary: geosteering
        ? "Trajectory remained inside target; geology recommended a conservative steering decision."
        : "Drilling ahead with normal ROP and directional updates.",
      nptCandidate: false,
      uncertainty: null,
    },
    {
      id: "seg-circulation-1435",
      type: highTorque ? "circulation" : "drilling",
      label: highTorque ? "Torque / ROP response" : "Drill ahead",
      startHour: 14.35,
      endHour: 15.45,
      startDepth: 5086,
      endDepth: highTorque ? 5094 : 5112,
      confidence: highTorque ? "medium" : "high",
      tone: highTorque ? "amber" : "blue",
      sourceIds: ["src-rig", "src-alerts", "src-company", "src-mudlog"],
      paragraphIds: ["p-relevant-events", "p-hourly-activities"],
      reviewItemIds: highTorque ? ["rq-cause-rpm"] : [],
      eventIds: ["evt-torque-rop"],
      summary: highTorque
        ? "Torque deviation and ROP drop followed by RPM reduction and circulation."
        : "Drill ahead through lateral interval.",
      nptCandidate: false,
      uncertainty: highTorque ? "Cause suggested by analytics; requires validation." : null,
    },
    {
      id: "seg-circulation-1510",
      type: holeCleaning ? "circulation" : "drilling",
      label: holeCleaning ? "Hole cleaning circulation" : "Drill ahead",
      startHour: 15.45,
      endHour: 16.35,
      startDepth: highTorque ? 5094 : 5112,
      endDepth: holeCleaning ? 5112 : 5128,
      confidence: holeCleaning ? "high" : "high",
      tone: holeCleaning ? "cyan" : "blue",
      sourceIds: ["src-rig", "src-shift", "src-company", "src-mudlog"],
      paragraphIds: ["p-relevant-events", "p-hourly-activities"],
      reviewItemIds: holeCleaning ? ["rq-cause-rpm"] : [],
      eventIds: ["evt-hole-cleaning"],
      summary: holeCleaning
        ? "Circulated for suspected loaded hole; parameters normalized before drilling resumed."
        : "Drilling continued with expected parameter response.",
      nptCandidate: false,
      uncertainty: null,
    },
    {
      id: "seg-mud-treatment",
      type: mudAdjustment ? "circulation" : "connection",
      label: mudAdjustment ? "Mud property adjustment" : "Connection",
      startHour: 16.35,
      endHour: 16.95,
      startDepth: holeCleaning ? 5112 : highTorque ? 5094 : 5128,
      endDepth: holeCleaning ? 5112 : highTorque ? 5094 : 5128,
      confidence: mudAdjustment ? "medium" : "high",
      tone: mudAdjustment ? "blue" : "slate",
      sourceIds: ["src-rig", "src-mud", "src-company"],
      paragraphIds: ["p-mud-system", "p-hourly-activities"],
      reviewItemIds: mudAdjustment ? ["rq-mud-values"] : [],
      eventIds: ["evt-mud-treatment"],
      summary: mudAdjustment
        ? "Mud density and viscosity adjusted; standpipe pressure response observed after treatment."
        : "Connection and flow check.",
      nptCandidate: false,
      uncertainty: mudAdjustment ? "Final mud values require reviewer confirmation." : null,
    },
    {
      id: "seg-npt-1655",
      type: nptReview ? "nptCandidate" : "drilling",
      label: nptReview ? "Waiting on tool confirmation" : "Drill ahead",
      startHour: 16.95,
      endHour: nptEnd,
      startDepth: nptStartDepth,
      endDepth: nptReview ? nptStartDepth : 5146,
      confidence: nptReview ? "medium" : "high",
      tone: nptReview ? "rose" : "blue",
      sourceIds: ["src-rig", "src-company", "src-service"],
      paragraphIds: ["p-npt", "p-hourly-activities"],
      reviewItemIds: nptReview ? ["rq-npt-classification"] : [],
      eventIds: ["evt-npt-candidate"],
      summary: nptReview
        ? "No depth progress while waiting for tool confirmation; classify as NPT or operational delay."
        : "Final drilling interval completed to planned daily depth.",
      nptCandidate: nptReview,
      uncertainty: nptReview ? "Lost-time class requires supervisor approval." : null,
    },
    {
      id: "seg-reaming-1905",
      type: "reaming",
      label: "Ream and condition hole",
      startHour: nptEnd,
      endHour: 20.45,
      startDepth: nptReview ? nptStartDepth : 5146,
      endDepth: 5146,
      confidence: "high",
      tone: "violet",
      sourceIds: ["src-rig", "src-shift"],
      paragraphIds: ["p-hourly-activities", "p-next-steps"],
      reviewItemIds: [],
      eventIds: ["evt-reaming"],
      summary: "Reamed and conditioned hole; no additional incidents recorded.",
      nptCandidate: false,
      uncertainty: null,
    },
    {
      id: "seg-safety-2045",
      type: "safety",
      label: "HSE observation",
      startHour: 20.45,
      endHour: 21.15,
      startDepth: 5146,
      endDepth: 5146,
      confidence: "high",
      tone: "emerald",
      sourceIds: ["src-hse", "src-shift"],
      paragraphIds: ["p-hse"],
      reviewItemIds: [],
      eventIds: ["evt-hse"],
      summary: "No incidents. Confirmed dropped-object inspection after end-of-day worksite walkdown.",
      nptCandidate: false,
      uncertainty: null,
    },
    {
      id: "seg-review-2115",
      type: "review",
      label: "End-of-day DDR review",
      startHour: 21.15,
      endHour: 24,
      startDepth: 5146,
      endDepth: 5146,
      confidence: "medium",
      tone: "violet",
      sourceIds: ["src-review", "src-company"],
      paragraphIds: ["p-approvals", "p-next-steps"],
      reviewItemIds: ["rq-final-approval"],
      eventIds: ["evt-ddr-draft"],
      summary: "AI draft assembled; reviewer validates uncertainty, NPT classification, and final plan.",
      nptCandidate: false,
      uncertainty: "Final DDR requires human approval before publishing.",
    },
  ];
}

function calculateDailyFootage(segments: ActivitySegment[]): number {
  return segments.reduce((sum, segment) => sum + Math.max(0, segment.endDepth - segment.startDepth), 0);
}

function calculateActivitySplit(segments: ActivitySegment[]): ActivitySplitItem[] {
  const map = new Map<ActivityType, number>();
  segments.forEach((segment) => {
    const hours = segment.endHour - segment.startHour;
    map.set(segment.type, (map.get(segment.type) ?? 0) + hours);
  });

  return Array.from(map.entries())
    .map(([type, hours]) => ({
      type,
      label: type === "nptCandidate" ? "NPT candidate" : type[0].toUpperCase() + type.slice(1),
      hours: Number(hours.toFixed(2)),
      color: ACTIVITY_COLORS[type],
    }))
    .sort((a, b) => b.hours - a.hours);
}

function detectActivityFromRigData(point: RigDataPoint): ActivityType {
  if (point.anomalyScore > 80 && point.rop < 2 && point.flowRate > 450) return "nptCandidate";
  if (point.rop > 5 && point.rpm > 60) return "drilling";
  if (point.flowRate > 450 && point.rop < 2) return "circulation";
  if (point.rpm > 25 && point.rop < 5) return "reaming";
  return point.activity;
}

function generateRigCurveData(scenarioId: ScenarioId, segments: ActivitySegment[]): RigDataPoint[] {
  const seed = scenarioIndex(scenarioId) + 1;
  const points: RigDataPoint[] = [];
  for (let i = 0; i <= 96; i += 1) {
    const time = i / 4;
    const segment = segments.find((candidate) => time >= candidate.startHour && time <= candidate.endHour) ?? segments[segments.length - 1];
    const duration = Math.max(0.1, segment.endHour - segment.startHour);
    const localProgress = clamp((time - segment.startHour) / duration, 0, 1);
    const drillingProgress = segment.endDepth > segment.startDepth ? localProgress : 0;
    const measuredDepth = segment.startDepth + (segment.endDepth - segment.startDepth) * drillingProgress;
    const isDrilling = segment.type === "drilling" || (segment.type === "reaming" && segment.endDepth > segment.startDepth);
    const depthDelta = Math.max(0, segment.endDepth - segment.startDepth);
    const baseRop = isDrilling ? depthDelta / duration : 0;
    const noise = wave(time, seed);
    let rop = isDrilling ? clamp(baseRop + noise * 1.8, 6, 34) : segment.type === "nptCandidate" ? 0.3 : segment.type === "circulation" ? 0.5 : 0.1;
    let rpm = isDrilling ? 118 + noise * 6 : segment.type === "circulation" ? 76 : segment.type === "reaming" ? 65 : segment.type === "connection" ? 8 : 0;
    let torque = isDrilling ? 16 + (measuredDepth - 4800) / 90 + wave(time, seed + 2) * 1.2 : 8 + wave(time, seed) * 0.8;
    let standpipePressure = segment.type === "circulation" || isDrilling ? 3150 + (measuredDepth - 4800) * 0.35 + wave(time, seed + 3) * 45 : 350 + wave(time, seed) * 20;
    let wob = isDrilling ? 19 + wave(time, seed + 4) * 2.3 : segment.type === "reaming" ? 10 : 0;
    let flowRate = segment.type === "circulation" || isDrilling || segment.type === "reaming" ? 590 + wave(time, seed + 5) * 16 : 0;
    let hookload = 255 + wave(time, seed + 6) * 5 + (segment.type === "connection" ? 25 : 0);
    let gammaRay = 92 + Math.sin(measuredDepth / 23 + seed) * 18 + (scenarioId === "geosteeringDecision" && time > 12.6 && time < 14.2 ? 18 : 0);
    let mwdSignalQuality = 92 + wave(time, seed + 7) * 4;
    let anomalyScore = 12 + Math.abs(noise) * 8;

    if (scenarioId === "highTorqueRopDrop" && time >= 14.25 && time <= 15.5) {
      torque += 11 + wave(time, seed + 10) * 2;
      rop = clamp(rop * 0.22, 0.2, 8);
      rpm = 78 + wave(time, seed + 11) * 4;
      standpipePressure += 180;
      anomalyScore = 88;
    }

    if (scenarioId === "mwdSignalFailure" && time >= 11.45 && time <= 13.65) {
      mwdSignalQuality = clamp(26 + wave(time, seed + 12) * 8, 8, 44);
      flowRate = segment.type === "nptCandidate" ? 120 : flowRate;
      rpm = segment.type === "nptCandidate" ? 0 : rpm;
      standpipePressure = segment.type === "nptCandidate" ? 420 : standpipePressure;
      anomalyScore = 82;
    }

    if (scenarioId === "holeCleaningCirculation" && time >= 15.35 && time <= 16.35) {
      rop = 0.4;
      rpm = 74 + wave(time, seed + 13) * 3;
      flowRate = 632 + wave(time, seed + 14) * 12;
      standpipePressure += 120;
      torque = 14 + wave(time, seed + 15) * 1.5;
      anomalyScore = 65;
    }

    if (scenarioId === "mudPropertyAdjustment" && time >= 16.35 && time <= 16.95) {
      flowRate = 585 + wave(time, seed + 16) * 8;
      standpipePressure += 240 - localProgress * 145;
      rop = 0.2;
      anomalyScore = 56;
    }

    if (scenarioId === "connectionTimeAnomaly" && time >= 9.35 && time <= 10.35) {
      rop = 0;
      rpm = 0;
      flowRate = time < 9.7 ? 0 : 185;
      standpipePressure = time < 9.7 ? 260 : 520;
      hookload += 18;
      anomalyScore = 74;
    }

    if (scenarioId === "nptClassificationReview" && time >= 16.95 && time <= 19.05) {
      rop = 0;
      rpm = 0;
      flowRate = 90;
      standpipePressure = 360;
      anomalyScore = 91;
    }

    points.push({
      time,
      timeLabel: formatTime(time),
      measuredDepth: Math.round(measuredDepth),
      bitDepth: Math.round(measuredDepth - (segment.type === "trip" ? 120 : segment.type === "connection" ? 6 : 1)),
      rop: Number(clamp(rop, 0, 40).toFixed(1)),
      rpm: Number(clamp(rpm, 0, 150).toFixed(1)),
      torque: Number(clamp(torque, 0, 38).toFixed(1)),
      standpipePressure: Number(clamp(standpipePressure, 0, 4200).toFixed(0)),
      wob: Number(clamp(wob, 0, 32).toFixed(1)),
      flowRate: Number(clamp(flowRate, 0, 700).toFixed(0)),
      hookload: Number(clamp(hookload, 180, 330).toFixed(1)),
      gammaRay: Number(clamp(gammaRay, 45, 165).toFixed(1)),
      mwdSignalQuality: Number(clamp(mwdSignalQuality, 0, 100).toFixed(0)),
      activity: segment.type,
      anomalyScore: Number(clamp(anomalyScore, 0, 100).toFixed(0)),
      segmentId: segment.id,
    });
  }
  return points;
}

function buildSourceStreams(scenario: ScenarioConfig, segments: ActivitySegment[]): SourceStream[] {
  const primarySet = new Set<SourceType>(scenario.primarySources);
  const relatedParagraphIds = (sourceId: string): string[] =>
    Array.from(new Set(segments.filter((segment) => segment.sourceIds.includes(sourceId)).flatMap((segment) => segment.paragraphIds)));
  const relatedSegmentIds = (sourceId: string): string[] =>
    segments.filter((segment) => segment.sourceIds.includes(sourceId)).map((segment) => segment.id);
  const relatedEventIds = (sourceId: string): string[] =>
    Array.from(new Set(segments.filter((segment) => segment.sourceIds.includes(sourceId)).flatMap((segment) => segment.eventIds)));

  const definitions: Array<Omit<SourceStream, "contributed" | "relatedParagraphIds" | "relatedSegmentIds" | "relatedEventIds">> = [
    {
      id: "src-rig",
      type: "rigData",
      name: "Rig data",
      status: "connected",
      coverage: "24h coverage",
      completeness: 96,
      recordCount: 97,
      usedCount: 16,
      confidence: "high",
      tone: SOURCE_TONES.rigData,
      latestExcerpt: "MD, bit depth, RPM, torque, SPP, WOB, flow and hookload aligned to 15-minute curve points.",
    },
    {
      id: "src-alerts",
      type: "realTimeAlert",
      name: "Real-time drilling room alerts",
      status: scenario.id === "highTorqueRopDrop" ? "reviewRequired" : "aligned",
      coverage: "3 alerts",
      completeness: scenario.id === "highTorqueRopDrop" ? 88 : 82,
      recordCount: 6,
      usedCount: scenario.id === "highTorqueRopDrop" ? 3 : 1,
      confidence: scenario.id === "highTorqueRopDrop" ? "medium" : "high",
      tone: SOURCE_TONES.realTimeAlert,
      latestExcerpt: scenario.id === "highTorqueRopDrop" ? "Torque trend exceeded lateral offset envelope at 14:35." : "No active critical alert in final review window.",
    },
    {
      id: "src-shift",
      type: "shiftReport",
      name: "Shift reports",
      status: "loaded",
      coverage: "Day + night tour",
      completeness: 89,
      recordCount: 14,
      usedCount: 7,
      confidence: "high",
      tone: SOURCE_TONES.shiftReport,
      latestExcerpt: "Tour sheets contain hourly activity notes, crew handover and end-of-day operational plan.",
    },
    {
      id: "src-company",
      type: "companyMan",
      name: "Company man comments",
      status: scenario.id === "connectionTimeAnomaly" ? "reviewRequired" : "aligned",
      coverage: "8 comments",
      completeness: scenario.id === "connectionTimeAnomaly" ? 72 : 91,
      recordCount: 8,
      usedCount: scenario.id === "connectionTimeAnomaly" ? 3 : 5,
      confidence: scenario.id === "connectionTimeAnomaly" ? "medium" : "high",
      tone: SOURCE_TONES.companyMan,
      latestExcerpt:
        scenario.id === "connectionTimeAnomaly"
          ? "No comment attached to extended connection; reviewer input required."
          : "RPM reduced and circulation performed after torque / ROP deviation.",
    },
    {
      id: "src-mwd",
      type: "mwdLwd",
      name: "MWD/LWD",
      status: scenario.id === "mwdSignalFailure" ? "reviewRequired" : "aligned",
      coverage: "14 surveys",
      completeness: scenario.id === "mwdSignalFailure" ? 68 : 90,
      recordCount: 14,
      usedCount: scenario.id === "mwdSignalFailure" ? 5 : 4,
      confidence: scenario.id === "mwdSignalFailure" ? "medium" : "high",
      tone: SOURCE_TONES.mwdLwd,
      latestExcerpt:
        scenario.id === "mwdSignalFailure"
          ? "Signal quality intermittent between 11:38 and 13:34. Toolface confirmation delayed."
          : "Survey set reconciled with directional plan; no critical survey gap.",
    },
    {
      id: "src-directional",
      type: "directional",
      name: "Directional drilling report",
      status: "loaded",
      coverage: "Plan vs actual",
      completeness: 86,
      recordCount: 9,
      usedCount: 4,
      confidence: "high",
      tone: SOURCE_TONES.directional,
      latestExcerpt: "Inclination and azimuth updates are aligned to the 12:15 and 14:10 survey points.",
    },
    {
      id: "src-mud",
      type: "mudReport",
      name: "Mud report",
      status: scenario.id === "mudPropertyAdjustment" ? "reviewRequired" : "loaded",
      coverage: "2 treatments",
      completeness: scenario.id === "mudPropertyAdjustment" ? 84 : 78,
      recordCount: 7,
      usedCount: scenario.id === "mudPropertyAdjustment" ? 4 : 2,
      confidence: "medium",
      tone: SOURCE_TONES.mudReport,
      latestExcerpt:
        scenario.id === "mudPropertyAdjustment"
          ? "Density adjusted to 1.29 sg; PV/YP rechecked after treatment."
          : "Mud properties stable; no material variance from program.",
    },
    {
      id: "src-mudlog",
      type: "mudLogging",
      name: "Mud logging report",
      status: "aligned",
      coverage: "Gas + cuttings",
      completeness: 88,
      recordCount: 12,
      usedCount: 4,
      confidence: "high",
      tone: SOURCE_TONES.mudLogging,
      latestExcerpt: "Cuttings load and gas trend reviewed against circulation intervals.",
    },
    {
      id: "src-geology",
      type: "geology",
      name: "Geology / geosteering notes",
      status: scenario.id === "geosteeringDecision" ? "reviewRequired" : "aligned",
      coverage: "4 notes",
      completeness: 88,
      recordCount: 4,
      usedCount: scenario.id === "geosteeringDecision" ? 3 : 2,
      confidence: "high",
      tone: SOURCE_TONES.geology,
      latestExcerpt:
        scenario.id === "geosteeringDecision"
          ? "Remain inside target; continue conservative steering until next gamma trend confirms boundary distance."
          : "Gamma trend remains compatible with target window.",
    },
    {
      id: "src-service",
      type: "serviceCompany",
      name: "Service company comments",
      status: scenario.id === "mwdSignalFailure" || scenario.id === "nptClassificationReview" ? "reviewRequired" : "loaded",
      coverage: "5 comments",
      completeness: 74,
      recordCount: 5,
      usedCount: scenario.id === "mwdSignalFailure" || scenario.id === "nptClassificationReview" ? 3 : 1,
      confidence: "medium",
      tone: SOURCE_TONES.serviceCompany,
      latestExcerpt: "Service provider confirms tool troubleshooting sequence and readiness to resume.",
    },
    {
      id: "src-hse",
      type: "hse",
      name: "Safety / HSE observations",
      status: "loaded",
      coverage: "1 observation",
      completeness: 93,
      recordCount: 2,
      usedCount: 1,
      confidence: "high",
      tone: SOURCE_TONES.hse,
      latestExcerpt: "No incidents. DROPS inspection completed after end-of-day worksite walkdown.",
    },
    {
      id: "src-review",
      type: "manualReview",
      name: "Reviewer decisions",
      status: "reviewRequired",
      coverage: "Approval queue",
      completeness: scenario.targetApprovalReadiness,
      recordCount: 6,
      usedCount: 2,
      confidence: "medium",
      tone: SOURCE_TONES.manualReview,
      latestExcerpt: "Validation required before final report and structured memory are saved.",
    },
  ];

  return definitions.map((definition) => ({
    ...definition,
    contributed: primarySet.has(definition.type) || relatedSegmentIds(definition.id).length > 0,
    relatedParagraphIds: relatedParagraphIds(definition.id),
    relatedSegmentIds: relatedSegmentIds(definition.id),
    relatedEventIds: relatedEventIds(definition.id),
  }));
}

function buildHumanComments(scenario: ScenarioConfig): HumanComment[] {
  const comments: HumanComment[] = [
    {
      id: "cm-001",
      sourceId: "src-shift",
      sourceType: "shiftReport",
      author: "Night Tour Driller",
      role: "Shift report",
      time: 0.25,
      depth: 4820,
      text: "Handover completed. Continue drilling lateral with same BHA and OBM parameters.",
      extractedIntent: "handover",
      confidence: "high",
      relatedSegmentId: "seg-review-0000",
      relatedParagraphId: "p-hourly-activities",
    },
    {
      id: "cm-002",
      sourceId: "src-company",
      sourceType: "companyMan",
      author: WELL_CONTEXT.companyMan,
      role: "Company man",
      time: 6.95,
      depth: 4942,
      text: "Circulated short bottoms-up check before continuing. No abnormal gas observed.",
      extractedIntent: "circulation explanation",
      confidence: "high",
      relatedSegmentId: "seg-circulation-0650",
      relatedParagraphId: "p-hourly-activities",
    },
    {
      id: "cm-003",
      sourceId: "src-geology",
      sourceType: "geology",
      author: WELL_CONTEXT.geologist,
      role: "Geologist",
      time: 8.7,
      depth: 4986,
      text: "Gamma and cuttings indicate trajectory remains inside target. Recommend conservative continuation to avoid upper boundary.",
      extractedIntent: "geosteering decision",
      confidence: "high",
      relatedSegmentId: "seg-drilling-0720",
      relatedParagraphId: "p-geology",
    },
    {
      id: "cm-004",
      sourceId: "src-directional",
      sourceType: "directional",
      author: WELL_CONTEXT.directionalLead,
      role: "Directional driller",
      time: 10.8,
      depth: 5020,
      text: "Toolface stable after connection. Continue with conservative slide / rotate plan until next survey confirms azimuth trend.",
      extractedIntent: "directional plan",
      confidence: "high",
      relatedSegmentId: "seg-drilling-1000",
      relatedParagraphId: "p-directional-mwd",
    },
    {
      id: "cm-005",
      sourceId: "src-mwd",
      sourceType: "mwdLwd",
      author: "MWD Engineer",
      role: "MWD/LWD",
      time: 11.9,
      depth: 5036,
      text:
        scenario.id === "mwdSignalFailure"
          ? "MWD signal intermittent. Troubleshooting pulser response and surface decoding. Awaiting confirmation before drilling ahead."
          : "MWD survey received. Signal quality acceptable and decoding normal.",
      extractedIntent: scenario.id === "mwdSignalFailure" ? "MWD failure" : "MWD status",
      confidence: scenario.id === "mwdSignalFailure" ? "medium" : "high",
      relatedSegmentId: "seg-waiting-1130",
      relatedParagraphId: "p-directional-mwd",
    },
    {
      id: "cm-006",
      sourceId: "src-company",
      sourceType: "companyMan",
      author: WELL_CONTEXT.companyMan,
      role: "Company man",
      time: 14.62,
      depth: 5089,
      text:
        scenario.id === "highTorqueRopDrop"
          ? "Observed torque increasing with ROP decrease. Reduced RPM and circulated due to possible loaded hole. Monitor trend before resuming."
          : "Drilling parameters remain within expected range through the afternoon interval.",
      extractedIntent: scenario.id === "highTorqueRopDrop" ? "torque response" : "parameter status",
      confidence: scenario.id === "highTorqueRopDrop" ? "medium" : "high",
      relatedSegmentId: "seg-circulation-1435",
      relatedParagraphId: "p-relevant-events",
    },
    {
      id: "cm-007",
      sourceId: "src-shift",
      sourceType: "shiftReport",
      author: "Day Tour Driller",
      role: "Shift report",
      time: 15.7,
      depth: 5112,
      text:
        scenario.id === "holeCleaningCirculation"
          ? "Circulated for hole cleaning due to suspected loaded hole. Torque and flow-out trend normalized after circulation."
          : "Continued drilling ahead. No hole cleaning concern recorded in tour sheet.",
      extractedIntent: scenario.id === "holeCleaningCirculation" ? "hole cleaning" : "drilling note",
      confidence: scenario.id === "holeCleaningCirculation" ? "high" : "medium",
      relatedSegmentId: "seg-circulation-1510",
      relatedParagraphId: "p-relevant-events",
    },
    {
      id: "cm-008",
      sourceId: "src-mud",
      sourceType: "mudReport",
      author: "Mud Engineer",
      role: "Mud report",
      time: 16.55,
      depth: 5128,
      text:
        scenario.id === "mudPropertyAdjustment"
          ? "Raised density from 1.28 to 1.29 sg and adjusted low-shear viscosity. Standpipe pressure stabilized after treatment."
          : "Mud properties checked. Density remains 1.28 sg with no treatment required.",
      extractedIntent: scenario.id === "mudPropertyAdjustment" ? "mud treatment" : "mud check",
      confidence: "medium",
      relatedSegmentId: "seg-mud-treatment",
      relatedParagraphId: "p-mud-system",
    },
    {
      id: "cm-009",
      sourceId: "src-service",
      sourceType: "serviceCompany",
      author: "Service Tool Specialist",
      role: "Service company",
      time: 17.25,
      depth: 5128,
      text:
        scenario.id === "nptClassificationReview"
          ? "Waiting on tool confirmation from service line before drilling ahead. Troubleshooting complete, final confirmation pending."
          : "Service tools remain operational; no open service restriction.",
      extractedIntent: scenario.id === "nptClassificationReview" ? "tool confirmation wait" : "service status",
      confidence: scenario.id === "nptClassificationReview" ? "medium" : "high",
      relatedSegmentId: "seg-npt-1655",
      relatedParagraphId: "p-npt",
    },
    {
      id: "cm-010",
      sourceId: "src-company",
      sourceType: "companyMan",
      author: WELL_CONTEXT.companyMan,
      role: "Company man",
      time: 18.2,
      depth: 5128,
      text:
        scenario.id === "nptClassificationReview"
          ? "No drilling progress while waiting on tool confirmation. Need final NPT category before DDR approval."
          : "Finished planned daily interval and prepared to condition hole.",
      extractedIntent: scenario.id === "nptClassificationReview" ? "NPT review" : "end interval",
      confidence: "high",
      relatedSegmentId: "seg-npt-1655",
      relatedParagraphId: "p-npt",
    },
    {
      id: "cm-011",
      sourceId: "src-hse",
      sourceType: "hse",
      author: "HSE Advisor",
      role: "HSE",
      time: 20.65,
      depth: 5146,
      text: "No recordable incidents. DROPS inspection complete and worksite housekeeping acceptable.",
      extractedIntent: "HSE observation",
      confidence: "high",
      relatedSegmentId: "seg-safety-2045",
      relatedParagraphId: "p-hse",
    },
    {
      id: "cm-012",
      sourceId: "src-review",
      sourceType: "manualReview",
      author: WELL_CONTEXT.drillingSupervisor,
      role: "Reviewer",
      time: 21.8,
      depth: 5146,
      text: "Review generated DDR draft, validate uncertain causes and confirm next plan before publishing.",
      extractedIntent: "approval requirement",
      confidence: "high",
      relatedSegmentId: "seg-review-2115",
      relatedParagraphId: "p-approvals",
    },
  ];
  return comments;
}

function buildRealTimeAlerts(scenario: ScenarioConfig): RealTimeAlert[] {
  return [
    {
      id: "al-001",
      sourceId: "src-alerts",
      time: 6.9,
      depth: 4942,
      title: "Flow check completed",
      severity: "info",
      signal: "Flow-out stable",
      detail: "No abnormal flow-out after short circulation.",
      acknowledged: true,
      relatedSegmentId: "seg-circulation-0650",
      relatedParagraphId: "p-hourly-activities",
    },
    {
      id: "al-002",
      sourceId: "src-alerts",
      time: 11.72,
      depth: 5036,
      title: scenario.id === "mwdSignalFailure" ? "MWD signal below threshold" : "MWD signal healthy",
      severity: scenario.id === "mwdSignalFailure" ? "warning" : "info",
      signal: "MWD signal quality",
      detail:
        scenario.id === "mwdSignalFailure"
          ? "Signal quality dropped below 40% for repeated samples; directional troubleshooting comment attached."
          : "Signal quality remained above operating threshold.",
      acknowledged: scenario.id !== "mwdSignalFailure",
      relatedSegmentId: "seg-waiting-1130",
      relatedParagraphId: "p-directional-mwd",
    },
    {
      id: "al-003",
      sourceId: "src-alerts",
      time: 14.58,
      depth: 5089,
      title: scenario.id === "highTorqueRopDrop" ? "Torque / ROP deviation" : "Torque in range",
      severity: scenario.id === "highTorqueRopDrop" ? "critical" : "info",
      signal: "Torque + ROP correlation",
      detail:
        scenario.id === "highTorqueRopDrop"
          ? "Torque trend exceeded offset envelope while ROP dropped below expected lateral response."
          : "Torque trend remains within offset envelope.",
      acknowledged: scenario.id !== "highTorqueRopDrop",
      relatedSegmentId: "seg-circulation-1435",
      relatedParagraphId: "p-relevant-events",
    },
    {
      id: "al-004",
      sourceId: "src-alerts",
      time: 15.75,
      depth: 5112,
      title: scenario.id === "holeCleaningCirculation" ? "Pumps-on no-depth interval" : "Drilling progression normal",
      severity: scenario.id === "holeCleaningCirculation" ? "warning" : "info",
      signal: "Depth progress + flow rate",
      detail:
        scenario.id === "holeCleaningCirculation"
          ? "No depth progress while pumps active; shift report explains hole cleaning circulation."
          : "Depth progression and pump activity are consistent with drilling ahead.",
      acknowledged: true,
      relatedSegmentId: "seg-circulation-1510",
      relatedParagraphId: "p-relevant-events",
    },
    {
      id: "al-005",
      sourceId: "src-alerts",
      time: 16.62,
      depth: 5128,
      title: scenario.id === "mudPropertyAdjustment" ? "Pressure response after mud treatment" : "Pressure trend stable",
      severity: "info",
      signal: "SPP trend",
      detail:
        scenario.id === "mudPropertyAdjustment"
          ? "Standpipe pressure response changed after mud property adjustment; mud report confirms treatment."
          : "Pressure trend stable through connection and flow checks.",
      acknowledged: true,
      relatedSegmentId: "seg-mud-treatment",
      relatedParagraphId: "p-mud-system",
    },
    {
      id: "al-006",
      sourceId: "src-alerts",
      time: 17.45,
      depth: 5128,
      title: scenario.id === "nptClassificationReview" ? "No-depth interval exceeds review threshold" : "No lost-time threshold exceeded",
      severity: scenario.id === "nptClassificationReview" ? "warning" : "info",
      signal: "Depth progress timer",
      detail:
        scenario.id === "nptClassificationReview"
          ? "No drilling progress for more than two hours; comments indicate waiting on tool confirmation."
          : "No activity gap exceeds NPT candidate threshold.",
      acknowledged: scenario.id !== "nptClassificationReview",
      relatedSegmentId: "seg-npt-1655",
      relatedParagraphId: "p-npt",
    },
  ];
}

function detectEventsFromSignals(scenario: ScenarioConfig, segments: ActivitySegment[], alerts: RealTimeAlert[]): OperationalEvent[] {
  const eventFromSegment = (id: string, fallbackTime: number, fallbackDepth: number): ActivitySegment | undefined =>
    segments.find((segment) => segment.id === id) ?? segments.find((segment) => segment.startHour <= fallbackTime && segment.endHour >= fallbackTime && segment.startDepth <= fallbackDepth + 200);

  const definitions: OperationalEvent[] = [
    {
      id: "evt-handover",
      title: "Tour handover complete",
      type: "review",
      severity: "slate",
      time: 0.25,
      depth: 4820,
      segmentId: "seg-review-0000",
      paragraphId: "p-hourly-activities",
      reviewItemId: null,
      summary: "Shift handover and daily program context were loaded into the DDR evidence map.",
      includedInDraft: true,
      confidence: "high",
      sourceIds: ["src-shift", "src-company"],
    },
    {
      id: "evt-connection-delay",
      title: scenario.id === "connectionTimeAnomaly" ? "Extended connection unexplained" : "Connection reconciled",
      type: "connection",
      severity: scenario.id === "connectionTimeAnomaly" ? "amber" : "slate",
      time: 9.55,
      depth: 4994,
      segmentId: "seg-connection-0925",
      paragraphId: "p-hourly-activities",
      reviewItemId: scenario.id === "connectionTimeAnomaly" ? "rq-connection-delay" : null,
      summary:
        scenario.id === "connectionTimeAnomaly"
          ? "Connection duration exceeds offset baseline and has no explanatory human comment."
          : "Connection signature is consistent with normal activity table.",
      includedInDraft: true,
      confidence: scenario.id === "connectionTimeAnomaly" ? "medium" : "high",
      sourceIds: ["src-rig", "src-review"],
    },
    {
      id: "evt-mwd-signal",
      title: scenario.id === "mwdSignalFailure" ? "MWD signal failure" : "MWD signal check",
      type: scenario.id === "mwdSignalFailure" ? "nptCandidate" : "maintenance",
      severity: scenario.id === "mwdSignalFailure" ? "rose" : "violet",
      time: 11.8,
      depth: 5036,
      segmentId: "seg-waiting-1130",
      paragraphId: "p-directional-mwd",
      reviewItemId: scenario.id === "mwdSignalFailure" ? "rq-mwd-npt" : null,
      summary:
        scenario.id === "mwdSignalFailure"
          ? "MWD/LWD signal drop and directional troubleshooting align with no-depth interval."
          : "MWD signal quality confirmed; no lost-time impact.",
      includedInDraft: true,
      confidence: scenario.id === "mwdSignalFailure" ? "medium" : "high",
      sourceIds: ["src-mwd", "src-directional", "src-rig", "src-service"],
    },
    {
      id: "evt-geosteer",
      title: scenario.id === "geosteeringDecision" ? "Geosteering decision" : "Geology linked",
      type: "drilling",
      severity: scenario.id === "geosteeringDecision" ? "emerald" : "blue",
      time: 13.25,
      depth: 5062,
      segmentId: "seg-drilling-1320",
      paragraphId: "p-geology",
      reviewItemId: scenario.id === "geosteeringDecision" ? "rq-geology-plan" : null,
      summary:
        scenario.id === "geosteeringDecision"
          ? "Geology note explains conservative continuation while staying inside the target interval."
          : "Geology note is linked to directional interval with no special decision required.",
      includedInDraft: true,
      confidence: "high",
      sourceIds: ["src-geology", "src-directional", "src-mwd"],
    },
    {
      id: "evt-torque-rop",
      title: scenario.id === "highTorqueRopDrop" ? "High torque + ROP drop" : "Torque trend normal",
      type: scenario.id === "highTorqueRopDrop" ? "circulation" : "drilling",
      severity: scenario.id === "highTorqueRopDrop" ? "amber" : "blue",
      time: 14.58,
      depth: 5089,
      segmentId: "seg-circulation-1435",
      paragraphId: "p-relevant-events",
      reviewItemId: scenario.id === "highTorqueRopDrop" ? "rq-cause-rpm" : null,
      summary:
        scenario.id === "highTorqueRopDrop"
          ? "Torque rose and ROP fell; RPM reduction and circulation are evidenced but root cause remains suspected."
          : "Torque and ROP remained inside operating envelope.",
      includedInDraft: true,
      confidence: scenario.id === "highTorqueRopDrop" ? "medium" : "high",
      sourceIds: ["src-rig", "src-alerts", "src-company", "src-mudlog"],
    },
    {
      id: "evt-hole-cleaning",
      title: scenario.id === "holeCleaningCirculation" ? "Hole cleaning circulation" : "Circulation check",
      type: "circulation",
      severity: scenario.id === "holeCleaningCirculation" ? "cyan" : "slate",
      time: 15.75,
      depth: 5112,
      segmentId: "seg-circulation-1510",
      paragraphId: "p-relevant-events",
      reviewItemId: scenario.id === "holeCleaningCirculation" ? "rq-cause-rpm" : null,
      summary:
        scenario.id === "holeCleaningCirculation"
          ? "Pumps-on no-depth interval is explained by shift note as circulation for suspected loaded hole."
          : "Afternoon circulation remains routine.",
      includedInDraft: true,
      confidence: scenario.id === "holeCleaningCirculation" ? "high" : "medium",
      sourceIds: ["src-rig", "src-shift", "src-company", "src-mudlog"],
    },
    {
      id: "evt-mud-treatment",
      title: scenario.id === "mudPropertyAdjustment" ? "Mud treatment" : "Mud check",
      type: "circulation",
      severity: scenario.id === "mudPropertyAdjustment" ? "blue" : "emerald",
      time: 16.55,
      depth: 5128,
      segmentId: "seg-mud-treatment",
      paragraphId: "p-mud-system",
      reviewItemId: scenario.id === "mudPropertyAdjustment" ? "rq-mud-values" : null,
      summary:
        scenario.id === "mudPropertyAdjustment"
          ? "Mud report treatment aligns with standpipe pressure response and should be included in the DDR."
          : "Mud values remain stable.",
      includedInDraft: true,
      confidence: "medium",
      sourceIds: ["src-mud", "src-rig", "src-mudlog"],
    },
    {
      id: "evt-npt-candidate",
      title: scenario.id === "nptClassificationReview" ? "Possible NPT interval" : "No NPT detected",
      type: scenario.id === "nptClassificationReview" ? "nptCandidate" : "drilling",
      severity: scenario.id === "nptClassificationReview" ? "rose" : "emerald",
      time: 17.55,
      depth: 5128,
      segmentId: "seg-npt-1655",
      paragraphId: "p-npt",
      reviewItemId: scenario.id === "nptClassificationReview" ? "rq-npt-classification" : null,
      summary:
        scenario.id === "nptClassificationReview"
          ? "No progress for 2.1h while waiting on tool confirmation; reviewer must classify."
          : "No NPT interval requiring classification is present in this scenario.",
      includedInDraft: true,
      confidence: scenario.id === "nptClassificationReview" ? "medium" : "high",
      sourceIds: ["src-rig", "src-company", "src-service"],
    },
    {
      id: "evt-hse",
      title: "HSE observation closed",
      type: "safety",
      severity: "emerald",
      time: 20.65,
      depth: 5146,
      segmentId: "seg-safety-2045",
      paragraphId: "p-hse",
      reviewItemId: null,
      summary: "No incidents; HSE observation is ready for DDR inclusion.",
      includedInDraft: true,
      confidence: "high",
      sourceIds: ["src-hse", "src-shift"],
    },
    {
      id: "evt-ddr-draft",
      title: "DDR draft assembled",
      type: "review",
      severity: "violet",
      time: 21.9,
      depth: 5146,
      segmentId: "seg-review-2115",
      paragraphId: "p-approvals",
      reviewItemId: "rq-final-approval",
      summary: "Company-format DDR draft generated with source chips, uncertainty flags, and review queue.",
      includedInDraft: true,
      confidence: "high",
      sourceIds: ["src-review", "src-company"],
    },
  ];

  return definitions.map((event) => {
    const matchingSegment = eventFromSegment(event.segmentId, event.time, event.depth);
    const relatedAlert = alerts.find((alert) => alert.relatedSegmentId === event.segmentId);
    return {
      ...event,
      time: matchingSegment ? (matchingSegment.startHour + matchingSegment.endHour) / 2 : event.time,
      depth: matchingSegment ? Math.round((matchingSegment.startDepth + matchingSegment.endDepth) / 2) : event.depth,
      confidence: relatedAlert?.severity === "critical" ? "medium" : event.confidence,
    };
  });
}

function paragraphStatusFromReview(defaultStatus: SectionStatus, reviewItemIds: string[], reviewedItems: Record<string, ReviewResolution>): SectionStatus {
  if (reviewItemIds.length === 0) return defaultStatus;
  const allResolved = reviewItemIds.every((id) => reviewedItems[id]?.resolved);
  if (allResolved) return "complete";
  if (defaultStatus === "conflict" || defaultStatus === "missingData") return defaultStatus;
  return "needsReview";
}

function buildGeneratedParagraphs(
  scenario: ScenarioConfig,
  reviewedItems: Record<string, ReviewResolution>,
  editedParagraphs: Record<string, string>,
): DDRParagraph[] {
  const highTorque = scenario.id === "highTorqueRopDrop";
  const mwdFailure = scenario.id === "mwdSignalFailure";
  const holeCleaning = scenario.id === "holeCleaningCirculation";
  const geosteering = scenario.id === "geosteeringDecision";
  const mudAdjustment = scenario.id === "mudPropertyAdjustment";
  const connectionAnomaly = scenario.id === "connectionTimeAnomaly";
  const nptReview = scenario.id === "nptClassificationReview";

  const causeResolved = Boolean(reviewedItems["rq-cause-rpm"]?.resolved);
  const mwdResolved = Boolean(reviewedItems["rq-mwd-npt"]?.resolved);
  const nptResolved = Boolean(reviewedItems["rq-npt-classification"]?.resolved);
  const connectionResolved = Boolean(reviewedItems["rq-connection-delay"]?.resolved);
  const mudResolved = Boolean(reviewedItems["rq-mud-values"]?.resolved);
  const geologyResolved = Boolean(reviewedItems["rq-geology-plan"]?.resolved);

  const paragraphs: DDRParagraph[] = [
    {
      id: "p-well-identification",
      sectionId: "section-well",
      title: "Well identification",
      body: `${WELL_CONTEXT.wellName} · ${WELL_CONTEXT.field}, ${WELL_CONTEXT.basin}. Daily Drilling Report for ${WELL_CONTEXT.reportDate}, operation day ${WELL_CONTEXT.operationDay}, ${WELL_CONTEXT.sectionDrilled}.`,
      status: "complete",
      confidence: "high",
      sourceChips: [sourceChip("src-shift"), sourceChip("src-review")],
      evidenceIds: ["ev-well-001"],
      segmentIds: ["seg-review-0000"],
      reviewItemIds: [],
      generatedByAi: true,
      reviewerNote: null,
      lastEditedBy: null,
    },
    {
      id: "p-depth-summary",
      sectionId: "section-well",
      title: "Depth and footage summary",
      body: `Starting depth ${formatDepth(WELL_CONTEXT.startingDepth)}. Ending depth ${formatDepth(WELL_CONTEXT.endingDepth)}. Daily footage 326 m. Current bit size ${WELL_CONTEXT.bitSize}; mud system ${WELL_CONTEXT.mudSystem}.`,
      status: "complete",
      confidence: "high",
      sourceChips: [sourceChip("src-rig"), sourceChip("src-shift")],
      evidenceIds: ["ev-depth-001"],
      segmentIds: ["seg-drilling-0055", "seg-npt-1655", "seg-reaming-1905"],
      reviewItemIds: [],
      generatedByAi: true,
      reviewerNote: null,
      lastEditedBy: null,
    },
    {
      id: "p-executive-summary",
      sectionId: "section-summary",
      title: "Executive summary",
      body:
        highTorque
          ? "Drilling continued in the lateral section with a parameter deviation at approximately 14:35. Torque increased while ROP decreased; RPM was reduced and circulation was performed. The draft keeps the suspected cause visible until reviewer validation."
          : mwdFailure
            ? "Drilling advanced during the day but a mid-day MWD signal issue caused a no-depth interval that requires NPT classification review. The generated narrative cites directional troubleshooting and MWD signal quality."
            : holeCleaning
              ? "The day shows a pumps-on no-depth interval explained by shift report as circulation for hole cleaning due to suspected loaded hole. Parameters normalized before drilling resumed."
              : geosteering
                ? "Drilling remained inside the target window. A geology note and directional plan support the decision to continue conservatively rather than infer performance-related causes."
                : mudAdjustment
                  ? "Mud property adjustment was captured from the mud report and reconciled with standpipe pressure response. The final mud values require reviewer confirmation before approval."
                  : connectionAnomaly
                    ? "An extended connection was detected from rig activity without a matching human explanation. The DDR draft flags the delay and does not invent a root cause."
                    : "A 2.1h no-depth interval was detected while waiting on tool confirmation. The DDR marks the interval as possible NPT and requires supervisor classification.",
      status: paragraphStatusFromReview(scenario.riskTone === "rose" ? "needsReview" : "complete", [scenario.selectedReviewItemId], reviewedItems),
      confidence: scenario.riskTone === "rose" || scenario.riskTone === "amber" ? "medium" : "high",
      sourceChips: scenario.primarySources.slice(0, 4).map((type, index) => {
        const sourceId = Object.keys(SOURCE_LABELS).includes(type) ? "src-rig" : "src-rig";
        const sourceByType: Record<SourceType, string> = {
          rigData: "src-rig",
          realTimeAlert: "src-alerts",
          shiftReport: "src-shift",
          companyMan: "src-company",
          mwdLwd: "src-mwd",
          directional: "src-directional",
          mudReport: "src-mud",
          mudLogging: "src-mudlog",
          geology: "src-geology",
          serviceCompany: "src-service",
          hse: "src-hse",
          manualReview: "src-review",
        };
        return sourceChip(sourceByType[type] ?? sourceId, index < 2 ? "high" : "medium");
      }),
      evidenceIds: ["ev-summary-001", "ev-summary-002"],
      segmentIds: [scenario.selectedSegmentId],
      reviewItemIds: [scenario.selectedReviewItemId],
      generatedByAi: true,
      reviewerNote: reviewedItems[scenario.selectedReviewItemId]?.note ?? null,
      lastEditedBy: editedParagraphs["p-executive-summary"] ? WELL_CONTEXT.drillingSupervisor : null,
    },
    {
      id: "p-hourly-activities",
      sectionId: "section-hourly",
      title: "Hourly activities",
      body: connectionAnomaly
        ? "From 00:55 to 09:25 drilling progressed from 4,820 to 4,994 mMD with routine connections and short circulation. At 09:25 an extended connection was detected and remains unexplained by human comments; the draft requests reviewer input before classification. Drilling resumed and continued to the planned end-of-day conditioning sequence."
        : "From 00:55 to 20:45, the operational day was reconstructed from rig signatures into drilling, connection, circulation, reaming, HSE and review intervals. Objective rig activity is kept separate from human explanations, with source chips attached to each reportable interval.",
      status: paragraphStatusFromReview(connectionAnomaly ? "missingData" : "complete", connectionAnomaly ? ["rq-connection-delay"] : [], reviewedItems),
      confidence: connectionAnomaly && !connectionResolved ? "medium" : "high",
      sourceChips: [sourceChip("src-rig"), sourceChip("src-shift"), sourceChip("src-company", "medium")],
      evidenceIds: ["ev-hourly-001", "ev-hourly-002"],
      segmentIds: ["seg-drilling-0055", "seg-connection-0925", "seg-waiting-1130", "seg-circulation-1435"],
      reviewItemIds: connectionAnomaly ? ["rq-connection-delay"] : [],
      generatedByAi: true,
      reviewerNote: reviewedItems["rq-connection-delay"]?.note ?? null,
      lastEditedBy: editedParagraphs["p-hourly-activities"] ? WELL_CONTEXT.drillingSupervisor : null,
    },
    {
      id: "p-parameters",
      sectionId: "section-parameters",
      title: "Main drilling parameters",
      body: highTorque
        ? "Average drilling ROP before the deviation was 18.4 m/h. During the 14:35 interval, torque rose above the expected lateral envelope while ROP decreased and RPM was reduced. The parameter change is supported by rig data and the real-time alert."
        : "Main drilling parameters remained internally consistent across MD, bit depth, ROP, RPM, torque, standpipe pressure, WOB, flow rate and hookload. The parameter summary is derived from rig curves and aligned to activity segments.",
      status: highTorque && !causeResolved ? "needsReview" : "complete",
      confidence: highTorque ? "medium" : "high",
      sourceChips: [sourceChip("src-rig"), sourceChip("src-alerts", highTorque ? "medium" : "high")],
      evidenceIds: ["ev-parameters-001", "ev-parameters-002"],
      segmentIds: [highTorque ? "seg-circulation-1435" : "seg-drilling-0345"],
      reviewItemIds: highTorque ? ["rq-cause-rpm"] : [],
      generatedByAi: true,
      reviewerNote: reviewedItems["rq-cause-rpm"]?.note ?? null,
      lastEditedBy: editedParagraphs["p-parameters"] ? WELL_CONTEXT.drillingSupervisor : null,
    },
    {
      id: "p-relevant-events",
      sectionId: "section-events",
      title: "Relevant events",
      body: highTorque
        ? "At approximately 14:35, torque increased while ROP decreased in the lateral section. RPM was reduced and circulation was performed. Company man comments support the action; the cause is retained as suspected hole cleaning until validated."
        : holeCleaning
          ? "From 15:27 to 16:21, pumps remained active with no depth progress. Shift report states circulation was performed for hole cleaning due to suspected loaded hole. Parameters normalized before drilling resumed."
          : "Relevant operational events were reconstructed from rig activity, comments, alerts and service inputs. No unsupported root cause has been added to the narrative.",
      status: paragraphStatusFromReview(highTorque || holeCleaning ? "needsReview" : "complete", highTorque || holeCleaning ? ["rq-cause-rpm"] : [], reviewedItems),
      confidence: highTorque && !causeResolved ? "medium" : holeCleaning ? "high" : "high",
      sourceChips: [sourceChip("src-rig"), sourceChip("src-company", highTorque ? "medium" : "high"), sourceChip("src-alerts", highTorque ? "medium" : "high"), sourceChip("src-mudlog", "medium")],
      evidenceIds: ["ev-event-001", "ev-event-002", "ev-event-003"],
      segmentIds: [highTorque ? "seg-circulation-1435" : holeCleaning ? "seg-circulation-1510" : "seg-drilling-1320"],
      reviewItemIds: highTorque || holeCleaning ? ["rq-cause-rpm"] : [],
      generatedByAi: true,
      reviewerNote: reviewedItems["rq-cause-rpm"]?.note ?? null,
      lastEditedBy: editedParagraphs["p-relevant-events"] ? WELL_CONTEXT.drillingSupervisor : null,
    },
    {
      id: "p-npt",
      sectionId: "section-npt",
      title: "NPT / delays",
      body: mwdFailure
        ? "A 2.1h no-depth interval aligns with intermittent MWD signal and directional troubleshooting. The DDR draft marks this interval as possible NPT and requires reviewer classification before publishing."
        : nptReview
          ? "From 16:57 to 19:03, no drilling progress was recorded while waiting on tool confirmation. Comments support the waiting reason, but the official classification must be confirmed as NPT or operational delay."
          : connectionAnomaly
            ? "No NPT is assigned. An extended connection remains a review item because no source explains the delay. The system flags the gap without classifying root cause."
            : "No confirmed NPT has been assigned for this draft. Candidate intervals are visible with evidence and require human classification if applicable.",
      status: paragraphStatusFromReview(mwdFailure || nptReview ? "needsReview" : connectionAnomaly ? "missingData" : "complete", mwdFailure ? ["rq-mwd-npt"] : nptReview ? ["rq-npt-classification"] : connectionAnomaly ? ["rq-connection-delay"] : [], reviewedItems),
      confidence: (mwdFailure && !mwdResolved) || (nptReview && !nptResolved) || connectionAnomaly ? "medium" : "high",
      sourceChips: [sourceChip("src-rig"), sourceChip("src-company", "medium"), sourceChip("src-service", "medium"), sourceChip("src-review", "medium")],
      evidenceIds: ["ev-npt-001", "ev-npt-002"],
      segmentIds: [mwdFailure ? "seg-waiting-1130" : nptReview ? "seg-npt-1655" : "seg-connection-0925"],
      reviewItemIds: mwdFailure ? ["rq-mwd-npt"] : nptReview ? ["rq-npt-classification"] : connectionAnomaly ? ["rq-connection-delay"] : [],
      generatedByAi: true,
      reviewerNote: reviewedItems["rq-mwd-npt"]?.note ?? reviewedItems["rq-npt-classification"]?.note ?? reviewedItems["rq-connection-delay"]?.note ?? null,
      lastEditedBy: editedParagraphs["p-npt"] ? WELL_CONTEXT.drillingSupervisor : null,
    },
    {
      id: "p-mud-system",
      sectionId: "section-mud",
      title: "Mud system",
      body: mudAdjustment
        ? "Mud report indicates density adjustment from 1.28 to 1.29 sg and viscosity tuning during the 16:21–16:57 interval. Standpipe pressure response supports inclusion of the treatment; final values require reviewer confirmation."
        : "Mud system remained within program. OBM density and rheology checks were captured from the mud report and aligned to the relevant activity intervals.",
      status: paragraphStatusFromReview(mudAdjustment ? "needsReview" : "complete", mudAdjustment ? ["rq-mud-values"] : [], reviewedItems),
      confidence: mudAdjustment && !mudResolved ? "medium" : "high",
      sourceChips: [sourceChip("src-mud", "medium"), sourceChip("src-rig"), sourceChip("src-mudlog", "medium")],
      evidenceIds: ["ev-mud-001", "ev-mud-002"],
      segmentIds: ["seg-mud-treatment"],
      reviewItemIds: mudAdjustment ? ["rq-mud-values"] : [],
      generatedByAi: true,
      reviewerNote: reviewedItems["rq-mud-values"]?.note ?? null,
      lastEditedBy: editedParagraphs["p-mud-system"] ? WELL_CONTEXT.drillingSupervisor : null,
    },
    {
      id: "p-directional-mwd",
      sectionId: "section-directional",
      title: "Directional / MWD / LWD",
      body: mwdFailure
        ? "MWD signal quality became intermittent between approximately 11:35 and 13:39. Directional troubleshooting comments and MWD signal curves are aligned to the no-depth interval, and the draft requests NPT classification review."
        : "Directional plan versus actual remained reconciled. Surveys, toolface notes and MWD/LWD signal quality were aligned by time and depth to support the daily directional narrative.",
      status: paragraphStatusFromReview(mwdFailure ? "needsReview" : "complete", mwdFailure ? ["rq-mwd-npt"] : [], reviewedItems),
      confidence: mwdFailure && !mwdResolved ? "medium" : "high",
      sourceChips: [sourceChip("src-mwd", mwdFailure ? "medium" : "high"), sourceChip("src-directional"), sourceChip("src-rig")],
      evidenceIds: ["ev-mwd-001", "ev-mwd-002"],
      segmentIds: [mwdFailure ? "seg-waiting-1130" : "seg-drilling-1320"],
      reviewItemIds: mwdFailure ? ["rq-mwd-npt"] : [],
      generatedByAi: true,
      reviewerNote: reviewedItems["rq-mwd-npt"]?.note ?? null,
      lastEditedBy: editedParagraphs["p-directional-mwd"] ? WELL_CONTEXT.drillingSupervisor : null,
    },
    {
      id: "p-geology",
      sectionId: "section-geology",
      title: "Geological observations",
      body: geosteering
        ? "Geology note states the trajectory remained inside target and recommends conservative continuation. The DDR links this note to directional plan-versus-actual and gamma response, without inferring a performance-related cause."
        : "Gamma response and mud logging observations were incorporated as supporting context. No geology-driven operational exception is added unless supported by geology notes.",
      status: paragraphStatusFromReview(geosteering ? "needsReview" : "complete", geosteering ? ["rq-geology-plan"] : [], reviewedItems),
      confidence: geosteering && !geologyResolved ? "medium" : "high",
      sourceChips: [sourceChip("src-geology"), sourceChip("src-directional"), sourceChip("src-mwd", "medium")],
      evidenceIds: ["ev-geology-001", "ev-geology-002"],
      segmentIds: [geosteering ? "seg-drilling-1320" : "seg-drilling-0720"],
      reviewItemIds: geosteering ? ["rq-geology-plan"] : [],
      generatedByAi: true,
      reviewerNote: reviewedItems["rq-geology-plan"]?.note ?? null,
      lastEditedBy: editedParagraphs["p-geology"] ? WELL_CONTEXT.drillingSupervisor : null,
    },
    {
      id: "p-hse",
      sectionId: "section-hse",
      title: "Safety / HSE",
      body: "No recordable incidents were reported. HSE observation confirms DROPS inspection, housekeeping check and worksite walkdown completed before end-of-day review.",
      status: "complete",
      confidence: "high",
      sourceChips: [sourceChip("src-hse"), sourceChip("src-shift")],
      evidenceIds: ["ev-hse-001"],
      segmentIds: ["seg-safety-2045"],
      reviewItemIds: [],
      generatedByAi: true,
      reviewerNote: null,
      lastEditedBy: null,
    },
    {
      id: "p-company-comments",
      sectionId: "section-comments",
      title: "Company man comments",
      body: highTorque
        ? "Company man comment is used to describe the action taken: RPM reduced and circulation performed after the torque / ROP deviation. The system does not convert suspected cause into confirmed root cause without validation."
        : connectionAnomaly
          ? "Company man comments were loaded, but no comment explains the extended connection. The reviewer is asked to add or confirm the reason before final approval."
          : "Company man comments are attached to the activity intervals they explain, preserving separation between measured rig activity and human interpretation.",
      status: connectionAnomaly && !connectionResolved ? "missingData" : highTorque && !causeResolved ? "needsReview" : "complete",
      confidence: connectionAnomaly ? "medium" : "high",
      sourceChips: [sourceChip("src-company", connectionAnomaly ? "medium" : "high"), sourceChip("src-rig")],
      evidenceIds: ["ev-company-001"],
      segmentIds: [highTorque ? "seg-circulation-1435" : connectionAnomaly ? "seg-connection-0925" : "seg-review-2115"],
      reviewItemIds: connectionAnomaly ? ["rq-connection-delay"] : highTorque ? ["rq-cause-rpm"] : [],
      generatedByAi: true,
      reviewerNote: reviewedItems["rq-connection-delay"]?.note ?? reviewedItems["rq-cause-rpm"]?.note ?? null,
      lastEditedBy: editedParagraphs["p-company-comments"] ? WELL_CONTEXT.drillingSupervisor : null,
    },
    {
      id: "p-next-steps",
      sectionId: "section-next",
      title: "Next steps",
      body: "Condition hole, confirm final survey and continue with the approved forward plan. Open uncertainty items must be reviewed before the report can be published and stored as structured operational memory.",
      status: "ready",
      confidence: "high",
      sourceChips: [sourceChip("src-shift"), sourceChip("src-review")],
      evidenceIds: ["ev-next-001"],
      segmentIds: ["seg-reaming-1905", "seg-review-2115"],
      reviewItemIds: ["rq-final-approval"],
      generatedByAi: true,
      reviewerNote: reviewedItems["rq-final-approval"]?.note ?? null,
      lastEditedBy: editedParagraphs["p-next-steps"] ? WELL_CONTEXT.drillingSupervisor : null,
    },
    {
      id: "p-approvals",
      sectionId: "section-approvals",
      title: "Review and approvals",
      body: "Draft generated. Human validation required before publishing. Reviewer correction will update both the official DDR and the structured event memory with an auditable version trail.",
      status: paragraphStatusFromReview("needsReview", ["rq-final-approval"], reviewedItems),
      confidence: "high",
      sourceChips: [sourceChip("src-review"), sourceChip("src-company")],
      evidenceIds: ["ev-approval-001"],
      segmentIds: ["seg-review-2115"],
      reviewItemIds: ["rq-final-approval"],
      generatedByAi: true,
      reviewerNote: reviewedItems["rq-final-approval"]?.note ?? null,
      lastEditedBy: editedParagraphs["p-approvals"] ? WELL_CONTEXT.drillingSupervisor : null,
    },
  ];

  return paragraphs.map((paragraph) => ({
    ...paragraph,
    body: editedParagraphs[paragraph.id] ?? paragraph.body,
    lastEditedBy: editedParagraphs[paragraph.id] ? WELL_CONTEXT.drillingSupervisor : paragraph.lastEditedBy,
  }));
}

function calculateSectionStatus(paragraphs: DDRParagraph[], approved: boolean): SectionStatus {
  if (approved) return "approved";
  if (paragraphs.some((paragraph) => paragraph.status === "conflict")) return "conflict";
  if (paragraphs.some((paragraph) => paragraph.status === "missingData")) return "missingData";
  if (paragraphs.some((paragraph) => paragraph.status === "needsReview")) return "needsReview";
  if (paragraphs.some((paragraph) => paragraph.status === "ready")) return "ready";
  return "complete";
}

function calculateSectionConfidence(paragraphs: DDRParagraph[]): ConfidenceLevel {
  const score = average(paragraphs.map((paragraph) => confidenceToScore(paragraph.confidence)));
  return scoreToConfidence(score);
}

function buildDDRSections(paragraphs: DDRParagraph[], approvedSections: Record<string, boolean>): DDRSection[] {
  const definitions: Array<{ id: string; title: string; requiredSources: SourceType[]; order: number; summary: string }> = [
    { id: "section-well", title: "Well identification", requiredSources: ["rigData", "shiftReport"], order: 1, summary: "Identity, date, rig and depth basis." },
    { id: "section-summary", title: "Executive summary", requiredSources: ["rigData", "companyMan", "shiftReport"], order: 2, summary: "Daily operational truth in reviewer-ready form." },
    { id: "section-hourly", title: "Hourly activities", requiredSources: ["rigData", "shiftReport"], order: 3, summary: "Activity table reconstructed from time-depth signals." },
    { id: "section-parameters", title: "Main drilling parameters", requiredSources: ["rigData"], order: 4, summary: "ROP, RPM, torque, SPP, WOB, flow and hookload." },
    { id: "section-events", title: "Relevant events", requiredSources: ["rigData", "realTimeAlert", "companyMan"], order: 5, summary: "Operational exceptions and source-backed explanations." },
    { id: "section-npt", title: "NPT / delays", requiredSources: ["rigData", "companyMan", "manualReview"], order: 6, summary: "Possible lost-time classification, not hallucinated." },
    { id: "section-mud", title: "Mud system", requiredSources: ["mudReport", "rigData"], order: 7, summary: "Mud properties and treatments linked to rig response." },
    { id: "section-directional", title: "Directional / MWD / LWD", requiredSources: ["mwdLwd", "directional"], order: 8, summary: "Surveys, toolface and signal quality." },
    { id: "section-geology", title: "Geological observations", requiredSources: ["geology", "mudLogging"], order: 9, summary: "Geology and geosteering context." },
    { id: "section-hse", title: "Safety / HSE", requiredSources: ["hse"], order: 10, summary: "Safety observations and incidents." },
    { id: "section-comments", title: "Company man comments", requiredSources: ["companyMan"], order: 11, summary: "Human explanation kept distinct from rig signatures." },
    { id: "section-next", title: "Next steps", requiredSources: ["shiftReport", "manualReview"], order: 12, summary: "Forward plan and review dependency." },
    { id: "section-approvals", title: "Review and approvals", requiredSources: ["manualReview"], order: 13, summary: "Human approval and auditable version trail." },
  ];

  return definitions.map((definition) => {
    const sectionParagraphs = paragraphs.filter((paragraph) => paragraph.sectionId === definition.id);
    const sourceTypes = new Set(sectionParagraphs.flatMap((paragraph) => paragraph.sourceChips.map((chip) => chip.sourceType)));
    const missingSourceTypes = definition.requiredSources.filter((sourceType) => !sourceTypes.has(sourceType));
    const reviewItemIds = Array.from(new Set(sectionParagraphs.flatMap((paragraph) => paragraph.reviewItemIds)));
    const approved = Boolean(approvedSections[definition.id]);
    const status = calculateSectionStatus(sectionParagraphs, approved);
    return {
      id: definition.id,
      title: definition.title,
      status,
      confidence: calculateSectionConfidence(sectionParagraphs),
      summary: definition.summary,
      paragraphs: sectionParagraphs,
      requiredSources: definition.requiredSources,
      missingSourceTypes,
      reviewItemIds,
      order: definition.order,
    };
  });
}

function applyReviewAction(item: ReviewQueueItem, actionType: ReviewActionType): ReviewResolution {
  const resolutionNote: Record<ReviewActionType, string> = {
    approve: `${item.title} approved with existing source traceability.`,
    edit: `${item.title} edited by reviewer. Narrative wording updated; citations retained.`,
    confirmNpt: `${item.title} confirmed as NPT by reviewer. Structured event updated with official classification.`,
    markOperationalDelay: `${item.title} marked as operational delay, not NPT. Structured event stores classification rationale.`,
    requestClarification: `${item.title} clarification requested. The item remains visible in the audit trail.`,
    addReviewerNote: `${item.title} annotated by reviewer. Reviewer note attached to DDR and memory event.`,
    approveDdr: "DDR approved by reviewer. Official report and structured memory outputs are ready.",
  };

  return {
    actionType,
    label: reviewActionLabel(actionType),
    resolved: actionType !== "requestClarification",
    note: resolutionNote[actionType],
    timestamp: formatTime(22.2),
  };
}

function buildReviewQueue(scenario: ScenarioConfig, reviewedItems: Record<string, ReviewResolution>): ReviewQueueItem[] {
  const items: ReviewQueueItem[] = [
    {
      id: "rq-cause-rpm",
      title: "Confirm cause of RPM reduction",
      description: "The system detected RPM reduction and circulation after a torque / ROP deviation. Cause remains suspected unless validated by the reviewer.",
      scenarioIds: ["highTorqueRopDrop", "holeCleaningCirculation"],
      status: "open",
      severity: scenario.id === "holeCleaningCirculation" ? "cyan" : "amber",
      sectionId: "section-events",
      paragraphId: "p-relevant-events",
      segmentId: scenario.id === "holeCleaningCirculation" ? "seg-circulation-1510" : "seg-circulation-1435",
      eventId: scenario.id === "holeCleaningCirculation" ? "evt-hole-cleaning" : "evt-torque-rop",
      actionTypes: ["approve", "edit", "addReviewerNote", "requestClarification"],
      resolutionText: "Cause validated as suspected hole cleaning; narrative retains uncertainty wording.",
      evidenceSummary: "Rig data, company man note, real-time alert and mud logging context are attached.",
      requiredForApproval: true,
    },
    {
      id: "rq-mwd-npt",
      title: "Validate MWD signal failure and NPT impact",
      description: "MWD signal quality dropped during a no-depth interval. Confirm whether the interval belongs in NPT / delays.",
      scenarioIds: ["mwdSignalFailure"],
      status: "open",
      severity: "rose",
      sectionId: "section-directional",
      paragraphId: "p-directional-mwd",
      segmentId: "seg-waiting-1130",
      eventId: "evt-mwd-signal",
      actionTypes: ["confirmNpt", "markOperationalDelay", "edit", "requestClarification"],
      resolutionText: "Signal failure reviewed and classification stored in NPT section.",
      evidenceSummary: "MWD signal curve, directional troubleshooting and service company comment are aligned.",
      requiredForApproval: true,
    },
    {
      id: "rq-geology-plan",
      title: "Approve geosteering explanation",
      description: "Confirm that geology note explains the conservative steering decision and that the DDR does not infer performance cause.",
      scenarioIds: ["geosteeringDecision"],
      status: "open",
      severity: "emerald",
      sectionId: "section-geology",
      paragraphId: "p-geology",
      segmentId: "seg-drilling-1320",
      eventId: "evt-geosteer",
      actionTypes: ["approve", "edit", "addReviewerNote"],
      resolutionText: "Geosteering note approved and cited in directional / geology sections.",
      evidenceSummary: "Geology note, gamma trend and directional plan are linked.",
      requiredForApproval: false,
    },
    {
      id: "rq-mud-values",
      title: "Confirm mud treatment values",
      description: "Mud density and viscosity adjustment are supported by the mud report. Confirm final values before approval.",
      scenarioIds: ["mudPropertyAdjustment"],
      status: "open",
      severity: "amber",
      sectionId: "section-mud",
      paragraphId: "p-mud-system",
      segmentId: "seg-mud-treatment",
      eventId: "evt-mud-treatment",
      actionTypes: ["approve", "edit", "addReviewerNote"],
      resolutionText: "Mud treatment values confirmed and stored with final daily event.",
      evidenceSummary: "Mud report values and SPP response are reconciled.",
      requiredForApproval: true,
    },
    {
      id: "rq-connection-delay",
      title: "Explain extended connection delay",
      description: "Rig activity indicates an extended connection, but no human comment explains it. Add reviewer note or request clarification.",
      scenarioIds: ["connectionTimeAnomaly"],
      status: "open",
      severity: "amber",
      sectionId: "section-hourly",
      paragraphId: "p-hourly-activities",
      segmentId: "seg-connection-0925",
      eventId: "evt-connection-delay",
      actionTypes: ["addReviewerNote", "edit", "markOperationalDelay", "requestClarification"],
      resolutionText: "Reviewer explanation added; DDR no longer contains an unexplained connection delay.",
      evidenceSummary: "Rig data shows extended slips / no-depth signature; comments are missing.",
      requiredForApproval: true,
    },
    {
      id: "rq-npt-classification",
      title: "Classify 2.1h waiting time",
      description: "No depth progress while waiting on tool confirmation. Confirm NPT category or mark operational delay.",
      scenarioIds: ["nptClassificationReview"],
      status: "open",
      severity: "rose",
      sectionId: "section-npt",
      paragraphId: "p-npt",
      segmentId: "seg-npt-1655",
      eventId: "evt-npt-candidate",
      actionTypes: ["confirmNpt", "markOperationalDelay", "edit", "requestClarification"],
      resolutionText: "Lost-time interval classified and stored as structured operational event.",
      evidenceSummary: "No-depth interval, company man comment and service confirmation are aligned.",
      requiredForApproval: true,
    },
    {
      id: "rq-final-approval",
      title: "Approve DDR and structured memory output",
      description: "Final approval creates the official DDR archive and stores structured operational events with citations and reviewer corrections.",
      scenarioIds: ["highTorqueRopDrop", "mwdSignalFailure", "holeCleaningCirculation", "geosteeringDecision", "mudPropertyAdjustment", "connectionTimeAnomaly", "nptClassificationReview"],
      status: "open",
      severity: "violet",
      sectionId: "section-approvals",
      paragraphId: "p-approvals",
      segmentId: "seg-review-2115",
      eventId: "evt-ddr-draft",
      actionTypes: ["approveDdr", "addReviewerNote"],
      resolutionText: "DDR approved and publish path enabled.",
      evidenceSummary: "All sections and uncertainty items are summarized for approval.",
      requiredForApproval: false,
    },
  ];

  return items
    .filter((item) => item.scenarioIds.includes(scenario.id) || item.id === "rq-final-approval")
    .map((item) => {
      const resolution = reviewedItems[item.id];
      return {
        ...item,
        status: resolution?.resolved ? "resolved" : resolution && !resolution.resolved ? "deferred" : item.status,
      };
    });
}

function buildEvidenceForParagraph(
  paragraph: DDRParagraph | null,
  scenario: ScenarioConfig,
  sources: SourceStream[],
  comments: HumanComment[],
  alerts: RealTimeAlert[],
  segments: ActivitySegment[],
): EvidenceItem[] {
  const targetParagraphId = paragraph?.id ?? scenario.selectedParagraphId;
  const targetSegmentId = paragraph?.segmentIds[0] ?? scenario.selectedSegmentId;
  const segment = segments.find((candidate) => candidate.id === targetSegmentId) ?? segments[0];
  const sourceFor = (type: SourceType): SourceStream => sources.find((source) => source.type === type) ?? sources[0];
  const comment = comments.find((item) => item.relatedParagraphId === targetParagraphId) ?? comments.find((item) => item.relatedSegmentId === targetSegmentId) ?? comments[0];
  const alert = alerts.find((item) => item.relatedParagraphId === targetParagraphId) ?? alerts.find((item) => item.relatedSegmentId === targetSegmentId) ?? alerts[0];

  const baseEvidence: EvidenceItem[] = [
    {
      id: "ev-rig-signature",
      paragraphId: targetParagraphId,
      sourceId: "src-rig",
      sourceType: "rigData",
      segmentId: targetSegmentId,
      title: "Rig activity signature",
      timestamp: `${formatTime(segment.startHour)}–${formatTime(segment.endHour)}`,
      depth: Math.round((segment.startDepth + segment.endDepth) / 2),
      detail:
        segment.type === "circulation"
          ? "Pumps active with little or no depth progress. RPM and flow remained on, supporting circulation classification."
          : segment.type === "nptCandidate"
            ? "No measurable depth progress over the interval, with rig state outside normal connection duration."
            : segment.type === "connection" || segment.type === "review"
              ? "Slips / hookload pattern and no-depth signature identify connection or review interval."
              : "Depth progression, RPM, torque, SPP and flow are internally consistent with drilling activity.",
      extractedFields: [
        { label: "Activity", value: segment.label },
        { label: "Interval", value: `${formatTime(segment.startHour)}–${formatTime(segment.endHour)}` },
        { label: "Depth", value: `${formatDepth(segment.startDepth)} → ${formatDepth(segment.endDepth)}` },
        { label: "Confidence", value: segment.confidence },
      ],
      confidence: segment.confidence,
      tone: segment.tone,
      discrepancy: segment.uncertainty,
    },
    {
      id: "ev-human-comment",
      paragraphId: targetParagraphId,
      sourceId: comment.sourceId,
      sourceType: comment.sourceType,
      segmentId: comment.relatedSegmentId,
      title: `${comment.role} comment`,
      timestamp: formatTime(comment.time),
      depth: comment.depth,
      detail: comment.text,
      extractedFields: [
        { label: "Author", value: comment.author },
        { label: "Intent", value: comment.extractedIntent },
        { label: "Linked depth", value: formatDepth(comment.depth) },
        { label: "Confidence", value: comment.confidence },
      ],
      confidence: comment.confidence,
      tone: SOURCE_TONES[comment.sourceType],
      discrepancy: scenario.id === "connectionTimeAnomaly" && targetParagraphId === "p-hourly-activities" ? "No comment explains the extended connection." : null,
    },
    {
      id: "ev-alert",
      paragraphId: targetParagraphId,
      sourceId: alert.sourceId,
      sourceType: "realTimeAlert",
      segmentId: alert.relatedSegmentId,
      title: alert.title,
      timestamp: formatTime(alert.time),
      depth: alert.depth,
      detail: alert.detail,
      extractedFields: [
        { label: "Signal", value: alert.signal },
        { label: "Severity", value: alert.severity },
        { label: "Acknowledged", value: alert.acknowledged ? "Yes" : "No" },
        { label: "Source", value: sourceFor("realTimeAlert").name },
      ],
      confidence: alert.severity === "critical" ? "medium" : "high",
      tone: alert.severity === "critical" ? "rose" : alert.severity === "warning" ? "amber" : "cyan",
      discrepancy: alert.acknowledged ? null : "Alert acknowledgement is pending reviewer validation.",
    },
    {
      id: "ev-extracted-fields",
      paragraphId: targetParagraphId,
      sourceId: "src-review",
      sourceType: "manualReview",
      segmentId: targetSegmentId,
      title: "Extracted DDR fields",
      timestamp: "Generated at 21:54",
      depth: WELL_CONTEXT.currentMeasuredDepth,
      detail: "The paragraph is composed from extracted fields and retains source chips for every claim that can affect operational interpretation.",
      extractedFields: [
        { label: "Paragraph", value: paragraph?.title ?? "Selected section" },
        { label: "Status", value: paragraph ? statusLabel(paragraph.status) : "Needs review" },
        { label: "Sources", value: `${paragraph?.sourceChips.length ?? 0}` },
        { label: "Review", value: paragraph?.reviewItemIds.length ? "Required" : "Not required" },
      ],
      confidence: paragraph?.confidence ?? "medium",
      tone: "violet",
      discrepancy: paragraph?.status === "missingData" ? "Missing field requires reviewer input." : null,
    },
  ];

  if (scenario.id === "highTorqueRopDrop" && targetParagraphId === "p-relevant-events") {
    baseEvidence.unshift({
      id: "ev-torque-exact",
      paragraphId: targetParagraphId,
      sourceId: "src-rig",
      sourceType: "rigData",
      segmentId: "seg-circulation-1435",
      title: "Torque / ROP curve evidence",
      timestamp: "14:35–15:27",
      depth: 5089,
      detail: "RPM was reduced from approximately 120 to 80 while ROP dropped and torque trended above the expected lateral envelope.",
      extractedFields: [
        { label: "RPM", value: "120 → 80" },
        { label: "ROP", value: "18.4 → 4.8 m/h" },
        { label: "Torque", value: "+38% envelope" },
        { label: "Cause", value: "Suspected" },
      ],
      confidence: "medium",
      tone: "amber",
      discrepancy: "Cause suggested by analytics and comment; reviewer must validate.",
    });
  }

  return baseEvidence;
}

function calculateNptCandidates(scenario: ScenarioConfig, reviewedItems: Record<string, ReviewResolution>): NptInterval[] {
  const mwdClassification: NptInterval["classification"] = reviewedItems["rq-mwd-npt"]?.actionType === "markOperationalDelay" ? "operationalDelay" : reviewedItems["rq-mwd-npt"]?.actionType === "confirmNpt" ? "confirmedNpt" : "unclassified";
  const nptClassification: NptInterval["classification"] = reviewedItems["rq-npt-classification"]?.actionType === "markOperationalDelay" ? "operationalDelay" : reviewedItems["rq-npt-classification"]?.actionType === "confirmNpt" ? "confirmedNpt" : "unclassified";

  const intervals: NptInterval[] = [];
  if (scenario.id === "mwdSignalFailure") {
    intervals.push({
      id: "npt-mwd-signal",
      startHour: 11.55,
      endHour: 13.65,
      durationHours: 2.1,
      depthRange: `${formatDepth(5036)}–${formatDepth(5036)}`,
      description: "MWD signal troubleshooting with no depth progress.",
      candidateReason: "MWD signal quality below threshold and directional report confirms troubleshooting.",
      classification: mwdClassification,
      confidence: "medium",
      relatedReviewItemId: "rq-mwd-npt",
      sourceIds: ["src-rig", "src-mwd", "src-directional", "src-service"],
    });
  }
  if (scenario.id === "nptClassificationReview") {
    intervals.push({
      id: "npt-tool-confirmation",
      startHour: 16.95,
      endHour: 19.05,
      durationHours: 2.1,
      depthRange: `${formatDepth(5128)}–${formatDepth(5128)}`,
      description: "Waiting on tool confirmation before drilling ahead.",
      candidateReason: "No-depth interval exceeds review threshold; comments indicate waiting on service confirmation.",
      classification: nptClassification,
      confidence: "medium",
      relatedReviewItemId: "rq-npt-classification",
      sourceIds: ["src-rig", "src-company", "src-service"],
    });
  }
  if (scenario.id === "connectionTimeAnomaly") {
    intervals.push({
      id: "npt-connection-review",
      startHour: 9.35,
      endHour: 10.35,
      durationHours: 1,
      depthRange: `${formatDepth(4994)}–${formatDepth(4994)}`,
      description: "Extended connection without explanatory comment.",
      candidateReason: "Duration exceeds offset baseline; missing human explanation prevents classification.",
      classification: reviewedItems["rq-connection-delay"]?.actionType === "markOperationalDelay" ? "operationalDelay" : "unclassified",
      confidence: "low",
      relatedReviewItemId: "rq-connection-delay",
      sourceIds: ["src-rig", "src-review"],
    });
  }
  return intervals;
}

function buildStructuredEvents(scenario: ScenarioConfig, reviewedItems: Record<string, ReviewResolution>, published: boolean): StructuredEvent[] {
  const memoryStatus = (reviewItemId: string | null): MemoryStatus => {
    if (published) return "saved";
    if (!reviewItemId) return "ready";
    return reviewedItems[reviewItemId]?.resolved ? "ready" : "draft";
  };

  const highTorqueCause = reviewedItems["rq-cause-rpm"]?.resolved ? "Suspected hole cleaning validated by reviewer" : "Suspected hole cleaning — validation pending";
  const nptClass = reviewedItems["rq-npt-classification"]?.actionType === "markOperationalDelay" ? "Operational delay" : reviewedItems["rq-npt-classification"]?.actionType === "confirmNpt" ? "Confirmed NPT" : "Possible NPT — classification pending";
  const mwdClass = reviewedItems["rq-mwd-npt"]?.actionType === "markOperationalDelay" ? "Operational delay" : reviewedItems["rq-mwd-npt"]?.actionType === "confirmNpt" ? "Confirmed NPT" : "NPT impact pending";

  return [
    {
      id: "se-drilling-day",
      title: "Daily drilling progression",
      type: "drilling",
      startHour: 0.9,
      endHour: 18.6,
      depthRange: `${formatDepth(4820)} → ${formatDepth(5146)}`,
      cause: "Planned lateral drilling",
      action: "Drilled ahead through multiple intervals and connections.",
      result: "Daily footage captured with time-depth source traceability.",
      parameters: [
        { label: "Footage", value: "326 m" },
        { label: "Avg ROP", value: "18.4 m/h" },
        { label: "Bit", value: WELL_CONTEXT.bitSize },
      ],
      sources: ["rigData", "shiftReport", "mwdLwd"],
      confidence: "high",
      status: published ? "saved" : "ready",
      memoryImpact: "Forms the daily activity backbone for similar-well comparison.",
      relatedReviewItemId: null,
      tone: "blue",
    },
    {
      id: "se-torque-rop",
      title: "High torque + ROP drop",
      type: "circulation",
      startHour: 14.35,
      endHour: 15.45,
      depthRange: `${formatDepth(5086)} → ${formatDepth(scenario.id === "highTorqueRopDrop" ? 5094 : 5112)}`,
      cause: scenario.id === "highTorqueRopDrop" ? highTorqueCause : "Not active in selected scenario",
      action: scenario.id === "highTorqueRopDrop" ? "Reduced RPM and circulated to stabilize parameters." : "No abnormal action required.",
      result: scenario.id === "highTorqueRopDrop" ? "Parameters normalized after circulation and reviewer validation remains visible." : "Normal torque / ROP envelope.",
      parameters: [
        { label: "RPM", value: scenario.id === "highTorqueRopDrop" ? "120 → 80" : "118 avg" },
        { label: "Torque", value: scenario.id === "highTorqueRopDrop" ? "+38%" : "In envelope" },
        { label: "ROP", value: scenario.id === "highTorqueRopDrop" ? "Downtrend" : "Normal" },
      ],
      sources: ["rigData", "realTimeAlert", "companyMan", "mudLogging"],
      confidence: scenario.id === "highTorqueRopDrop" ? "medium" : "high",
      status: scenario.id === "highTorqueRopDrop" ? memoryStatus("rq-cause-rpm") : published ? "saved" : "ready",
      memoryImpact: "Captures deviation-response pattern for future lateral hole-cleaning risk models.",
      relatedReviewItemId: scenario.id === "highTorqueRopDrop" ? "rq-cause-rpm" : null,
      tone: scenario.id === "highTorqueRopDrop" ? "amber" : "slate",
    },
    {
      id: "se-hole-cleaning",
      title: "Hole cleaning circulation",
      type: "circulation",
      startHour: 15.45,
      endHour: 16.35,
      depthRange: `${formatDepth(5112)} → ${formatDepth(5112)}`,
      cause: scenario.id === "holeCleaningCirculation" ? "Suspected loaded hole from shift report" : "Routine circulation",
      action: "Circulated with pumps active and no depth progress.",
      result: scenario.id === "holeCleaningCirculation" ? "Torque and flow-out trends normalized before drilling ahead." : "No reportable exception.",
      parameters: [
        { label: "Flow", value: "~632 gpm" },
        { label: "Depth progress", value: "0 m" },
        { label: "Duration", value: "54 min" },
      ],
      sources: ["rigData", "shiftReport", "companyMan", "mudLogging"],
      confidence: scenario.id === "holeCleaningCirculation" ? "high" : "medium",
      status: scenario.id === "holeCleaningCirculation" ? memoryStatus("rq-cause-rpm") : published ? "saved" : "ready",
      memoryImpact: "Stores circulation reason and result as reusable hole-cleaning evidence.",
      relatedReviewItemId: scenario.id === "holeCleaningCirculation" ? "rq-cause-rpm" : null,
      tone: scenario.id === "holeCleaningCirculation" ? "cyan" : "slate",
    },
    {
      id: "se-mwd-signal",
      title: "MWD signal issue",
      type: "nptCandidate",
      startHour: 11.55,
      endHour: 13.65,
      depthRange: `${formatDepth(5036)} → ${formatDepth(5036)}`,
      cause: scenario.id === "mwdSignalFailure" ? mwdClass : "Signal quality acceptable",
      action: scenario.id === "mwdSignalFailure" ? "Troubleshot pulser response and surface decoding." : "Survey updates received normally.",
      result: scenario.id === "mwdSignalFailure" ? "Classification required before final DDR approval." : "No lost time assigned.",
      parameters: [
        { label: "Signal", value: scenario.id === "mwdSignalFailure" ? "<40%" : ">90%" },
        { label: "Duration", value: scenario.id === "mwdSignalFailure" ? "2.1h" : "0h" },
        { label: "Status", value: scenario.id === "mwdSignalFailure" ? "Review" : "Ready" },
      ],
      sources: ["mwdLwd", "directional", "rigData", "serviceCompany"],
      confidence: scenario.id === "mwdSignalFailure" ? "medium" : "high",
      status: scenario.id === "mwdSignalFailure" ? memoryStatus("rq-mwd-npt") : published ? "saved" : "ready",
      memoryImpact: "Links signal-quality failure to activity gap and final NPT decision.",
      relatedReviewItemId: scenario.id === "mwdSignalFailure" ? "rq-mwd-npt" : null,
      tone: scenario.id === "mwdSignalFailure" ? "rose" : "slate",
    },
    {
      id: "se-geosteering",
      title: "Geosteering decision",
      type: "drilling",
      startHour: 12.15,
      endHour: 14.35,
      depthRange: `${formatDepth(5036)} → ${formatDepth(5086)}`,
      cause: scenario.id === "geosteeringDecision" ? "Trajectory inside target; conservative continuation recommended" : "Geology note contextual",
      action: "Linked geology note to directional plan versus actual trajectory.",
      result: "Avoided unsupported performance inference by citing geology source.",
      parameters: [
        { label: "GR trend", value: scenario.id === "geosteeringDecision" ? "Boundary watch" : "Stable" },
        { label: "TVD", value: `${WELL_CONTEXT.plannedTvd} m` },
        { label: "Decision", value: "Conservative" },
      ],
      sources: ["geology", "directional", "mwdLwd"],
      confidence: "high",
      status: scenario.id === "geosteeringDecision" ? memoryStatus("rq-geology-plan") : published ? "saved" : "ready",
      memoryImpact: "Stores geosteering rationale with trajectory and geology citations.",
      relatedReviewItemId: scenario.id === "geosteeringDecision" ? "rq-geology-plan" : null,
      tone: scenario.id === "geosteeringDecision" ? "emerald" : "slate",
    },
    {
      id: "se-mud-treatment",
      title: "Mud treatment",
      type: "circulation",
      startHour: 16.35,
      endHour: 16.95,
      depthRange: `${formatDepth(5128)} → ${formatDepth(5128)}`,
      cause: scenario.id === "mudPropertyAdjustment" ? "Density / viscosity adjustment" : "Routine mud check",
      action: scenario.id === "mudPropertyAdjustment" ? "Adjusted density and low-shear viscosity." : "Checked mud values against program.",
      result: scenario.id === "mudPropertyAdjustment" ? "SPP response stabilized after treatment; final values require confirmation." : "Mud properties within program.",
      parameters: [
        { label: "Density", value: scenario.id === "mudPropertyAdjustment" ? "1.28 → 1.29 sg" : "1.28 sg" },
        { label: "SPP", value: scenario.id === "mudPropertyAdjustment" ? "Response observed" : "Stable" },
        { label: "Mud", value: "OBM" },
      ],
      sources: ["mudReport", "rigData", "mudLogging"],
      confidence: "medium",
      status: scenario.id === "mudPropertyAdjustment" ? memoryStatus("rq-mud-values") : published ? "saved" : "ready",
      memoryImpact: "Preserves mud change and rig-pressure response for future offset review.",
      relatedReviewItemId: scenario.id === "mudPropertyAdjustment" ? "rq-mud-values" : null,
      tone: scenario.id === "mudPropertyAdjustment" ? "blue" : "slate",
    },
    {
      id: "se-npt-candidate",
      title: "NPT candidate",
      type: "nptCandidate",
      startHour: 16.95,
      endHour: 19.05,
      depthRange: `${formatDepth(5128)} → ${formatDepth(5128)}`,
      cause: scenario.id === "nptClassificationReview" ? nptClass : "No candidate interval active",
      action: scenario.id === "nptClassificationReview" ? "Flagged no-depth interval and attached comments for classification." : "No action required.",
      result: scenario.id === "nptClassificationReview" ? "Waiting for supervisor classification." : "No NPT output.",
      parameters: [
        { label: "Duration", value: scenario.id === "nptClassificationReview" ? "2.1h" : "0h" },
        { label: "Progress", value: scenario.id === "nptClassificationReview" ? "0 m" : "Normal" },
        { label: "Class", value: scenario.id === "nptClassificationReview" ? nptClass : "None" },
      ],
      sources: ["rigData", "companyMan", "serviceCompany", "manualReview"],
      confidence: scenario.id === "nptClassificationReview" ? "medium" : "high",
      status: scenario.id === "nptClassificationReview" ? memoryStatus("rq-npt-classification") : published ? "saved" : "ready",
      memoryImpact: "Stores lost-time candidate with approved class and source evidence.",
      relatedReviewItemId: scenario.id === "nptClassificationReview" ? "rq-npt-classification" : null,
      tone: scenario.id === "nptClassificationReview" ? "rose" : "slate",
    },
    {
      id: "se-ddr-approval",
      title: "DDR approval record",
      type: "review",
      startHour: 21.15,
      endHour: 24,
      depthRange: `${formatDepth(5146)} → ${formatDepth(5146)}`,
      cause: "Human-in-the-loop validation",
      action: "Reviewer approves or corrects the DDR draft.",
      result: published ? "Official DDR and structured memory saved." : "Ready to publish after required review items are closed.",
      parameters: [
        { label: "Reviewer", value: WELL_CONTEXT.drillingSupervisor },
        { label: "Sections", value: "13" },
        { label: "Traceable", value: "Yes" },
      ],
      sources: ["manualReview", "companyMan", "rigData"],
      confidence: "high",
      status: published ? "saved" : "draft",
      memoryImpact: "Creates an auditable version trail for official DDR publication.",
      relatedReviewItemId: "rq-final-approval",
      tone: "violet",
    },
  ];
}

function alignSourcesByTime(sources: SourceStream[], segments: ActivitySegment[]): AlignmentSummary[] {
  return sources.map((source) => ({
    sourceId: source.id,
    segmentIds: segments.filter((segment) => segment.sourceIds.includes(source.id)).map((segment) => segment.id),
    paragraphIds: source.relatedParagraphIds,
  }));
}

function alignSourcesByDepth(sources: SourceStream[], segments: ActivitySegment[]): AlignmentSummary[] {
  return sources.map((source) => ({
    sourceId: source.id,
    segmentIds: segments
      .filter((segment) => segment.sourceIds.includes(source.id))
      .sort((a, b) => a.startDepth - b.startDepth)
      .map((segment) => segment.id),
    paragraphIds: source.relatedParagraphIds,
  }));
}

function calculateReportQuality(
  scenario: ScenarioConfig,
  sections: DDRSection[],
  reviewQueue: ReviewQueueItem[],
  reviewedItems: Record<string, ReviewResolution>,
): ReportQualityMetrics {
  const openRequired = reviewQueue.filter((item) => item.requiredForApproval && item.status !== "resolved").length;
  const resolved = reviewQueue.filter((item) => item.status === "resolved").length;
  const total = reviewQueue.length;
  const sectionsApproved = sections.filter((section) => section.status === "approved").length;
  const sectionsReady = sections.filter((section) => section.status === "complete" || section.status === "ready" || section.status === "approved").length;
  const unresolvedUncertainty = sections.filter((section) => section.status === "needsReview" || section.status === "missingData" || section.status === "conflict").length + openRequired;
  const citations = sections.flatMap((section) => section.paragraphs).filter((paragraph) => paragraph.sourceChips.length > 0).length;
  const paragraphs = Math.max(1, sections.flatMap((section) => section.paragraphs).length);
  const baselineReadiness = scenario.targetApprovalReadiness;
  const reviewLift = resolved * 5 + sectionsApproved * 1.5;
  const approvalReadiness = clamp(baselineReadiness + reviewLift - openRequired * 6, 52, 99);
  const completenessScore = clamp(82 + sectionsReady * 1.2 + resolved * 2 - openRequired * 5, 58, 98);
  const traceabilityScore = clamp(88 + Math.round((citations / paragraphs) * 8) - (scenario.id === "connectionTimeAnomaly" ? 8 : 0), 70, 98);
  const possibleNpt = scenario.id === "mwdSignalFailure" || scenario.id === "nptClassificationReview" || scenario.id === "connectionTimeAnomaly" ? 1 : scenario.id === "highTorqueRopDrop" ? 1 : 0;

  return {
    completenessScore: Math.round(completenessScore),
    traceabilityScore: Math.round(traceabilityScore),
    unresolvedUncertainty,
    reviewProgress: total === 0 ? 100 : Math.round((resolved / total) * 100),
    approvalReadiness: Math.round(approvalReadiness),
    manualTimeSavedMinutes: 210 - 38 + resolved * 4,
    inconsistenciesDetected: scenario.id === "connectionTimeAnomaly" ? 3 : scenario.id === "mwdSignalFailure" ? 2 : scenario.id === "highTorqueRopDrop" ? 3 : 1,
    possibleNptIntervalsFlagged: possibleNpt,
    structuredEventsCreated: 8,
    historicalMemoryEnrichment: 8 + resolved,
    missingCitations: scenario.id === "connectionTimeAnomaly" && !reviewedItems["rq-connection-delay"]?.resolved ? 1 : 0,
    sectionsApproved,
    sectionsReady,
    sourceCoverage: clamp(92 - (scenario.id === "connectionTimeAnomaly" ? 6 : 0) + resolved * 2, 72, 99),
    validationItemsResolved: resolved,
    qualityTone: approvalReadiness > 88 ? "emerald" : approvalReadiness > 76 ? "amber" : "rose",
  };
}

function calculateApprovalReadiness(quality: ReportQualityMetrics, reviewQueue: ReviewQueueItem[]): number {
  const openRequired = reviewQueue.filter((item) => item.requiredForApproval && item.status !== "resolved").length;
  return clamp(quality.approvalReadiness - openRequired * 3, 0, 100);
}

function calculateSystemMetrics(
  scenario: ScenarioConfig,
  quality: ReportQualityMetrics,
  reviewQueue: ReviewQueueItem[],
  structuredEvents: StructuredEvent[],
): SystemMetrics {
  const openRequired = reviewQueue.filter((item) => item.requiredForApproval && item.status !== "resolved");
  const dominantConstraint = openRequired[0]?.title ?? (quality.unresolvedUncertainty > 0 ? "Final approval pending" : "None");
  return {
    manualCompilationBeforeMinutes: 210,
    manualCompilationAfterMinutes: 38,
    traceabilityCoverage: quality.traceabilityScore,
    inconsistenciesDetected: quality.inconsistenciesDetected,
    possibleNptIntervalsFlagged: quality.possibleNptIntervalsFlagged,
    structuredEventsCreated: structuredEvents.length,
    reportCompleteness: quality.completenessScore,
    reviewReadiness: calculateApprovalReadiness(quality, reviewQueue),
    historicalMemoryEnrichment: quality.historicalMemoryEnrichment,
    similarWellsComparisonReady: true,
    dominantConstraint,
    currentRiskTone: scenario.riskTone,
    sourceFamiliesAligned: scenario.primarySources.length + 5,
    paragraphCitationCoverage: quality.traceabilityScore,
  };
}

function buildValueMetrics(scenario: ScenarioConfig, systemMetrics: SystemMetrics): ValueMetric[] {
  return [
    {
      label: "Manual compilation time",
      value: "3.5h → 38min",
      delta: "assisted review",
      tone: "violet",
      icon: Timer,
    },
    {
      label: "Traceability coverage",
      value: `${systemMetrics.traceabilityCoverage}%`,
      delta: "paragraph-level citations",
      tone: "cyan",
      icon: Link2,
    },
    {
      label: "Inconsistencies detected",
      value: String(systemMetrics.inconsistenciesDetected),
      delta: scenario.riskLabel,
      tone: scenario.riskTone,
      icon: AlertTriangle,
    },
    {
      label: "Possible NPT intervals",
      value: String(systemMetrics.possibleNptIntervalsFlagged),
      delta: "review queue",
      tone: systemMetrics.possibleNptIntervalsFlagged > 0 ? "rose" : "emerald",
      icon: CircleAlert,
    },
    {
      label: "Structured events created",
      value: String(systemMetrics.structuredEventsCreated),
      delta: "+ operational memory",
      tone: "emerald",
      icon: Database,
    },
    {
      label: "Report completeness",
      value: `${systemMetrics.reportCompleteness}%`,
      delta: `${systemMetrics.reviewReadiness}% approval readiness`,
      tone: systemMetrics.reviewReadiness > 84 ? "emerald" : "amber",
      icon: FileCheck,
    },
  ];
}

function buildApprovalState(
  quality: ReportQualityMetrics,
  sections: DDRSection[],
  reviewQueue: ReviewQueueItem[],
  published: boolean,
): ApprovalState {
  const requiredOpen = reviewQueue.filter((item) => item.requiredForApproval && item.status !== "resolved");
  const readiness = calculateApprovalReadiness(quality, reviewQueue);
  const ready = requiredOpen.length === 0 && readiness >= 82;
  return {
    ready: ready || published,
    status: published ? "published" : ready ? "ready" : "reviewRequired",
    readiness: published ? 100 : readiness,
    officialArchiveStatus: published ? "saved" : ready ? "ready" : "draft",
    structuredMemoryStatus: published ? "saved" : ready ? "ready" : "draft",
    blockers: requiredOpen.map((item) => item.title),
    reviewer: WELL_CONTEXT.drillingSupervisor,
    approvalTimestamp: published ? "22:24" : null,
    approvedSectionCount: sections.filter((section) => section.status === "approved").length,
    totalSectionCount: sections.length,
    requiredOpenItems: requiredOpen.length,
  };
}

function buildTraceEvents(
  scenario: ScenarioConfig,
  reviewedItems: Record<string, ReviewResolution>,
  activePhase: DemoPhase,
  published: boolean,
): TraceEvent[] {
  const events: TraceEvent[] = [
    {
      id: "tr-001",
      time: "21:32",
      phase: 1,
      title: "Rig source connected",
      detail: "24h rig activity and drilling parameters loaded.",
      tone: "blue",
      relatedSourceId: "src-rig",
      relatedSegmentId: "seg-drilling-0055",
      relatedParagraphId: "p-parameters",
      relatedReviewItemId: null,
      type: "source",
    },
    {
      id: "tr-002",
      time: "21:34",
      phase: 2,
      title: "Time-depth alignment assembled",
      detail: "Signals, comments, alerts and service inputs indexed by time and measured depth.",
      tone: "cyan",
      relatedSourceId: null,
      relatedSegmentId: scenario.selectedSegmentId,
      relatedParagraphId: scenario.selectedParagraphId,
      relatedReviewItemId: null,
      type: "system",
    },
    {
      id: "tr-003",
      time: "21:36",
      phase: 3,
      title: scenario.name,
      detail: scenario.headline,
      tone: scenario.accentTone,
      relatedSourceId: null,
      relatedSegmentId: scenario.selectedSegmentId,
      relatedParagraphId: scenario.selectedParagraphId,
      relatedReviewItemId: scenario.selectedReviewItemId,
      type: "event",
    },
    {
      id: "tr-004",
      time: "21:39",
      phase: 4,
      title: "Human comment attached",
      detail: "Objective rig activity and human explanation were fused but kept separate.",
      tone: "violet",
      relatedSourceId: scenario.primarySources.includes("companyMan") ? "src-company" : "src-review",
      relatedSegmentId: scenario.selectedSegmentId,
      relatedParagraphId: scenario.selectedParagraphId,
      relatedReviewItemId: scenario.selectedReviewItemId,
      type: "source",
    },
    {
      id: "tr-005",
      time: "21:43",
      phase: 5,
      title: "DDR section generated",
      detail: "Company-format paragraph created with source chips and confidence fields.",
      tone: "blue",
      relatedSourceId: "src-review",
      relatedSegmentId: scenario.selectedSegmentId,
      relatedParagraphId: scenario.selectedParagraphId,
      relatedReviewItemId: scenario.selectedReviewItemId,
      type: "system",
    },
    {
      id: "tr-006",
      time: "21:45",
      phase: 6,
      title: "Uncertainty flagged",
      detail: scenario.riskLabel,
      tone: scenario.riskTone,
      relatedSourceId: "src-review",
      relatedSegmentId: scenario.selectedSegmentId,
      relatedParagraphId: scenario.selectedParagraphId,
      relatedReviewItemId: scenario.selectedReviewItemId,
      type: "review",
    },
    {
      id: "tr-007",
      time: "21:50",
      phase: 7,
      title: reviewedItems[scenario.selectedReviewItemId]?.resolved ? "Reviewer confirmed classification" : "Reviewer validation pending",
      detail: reviewedItems[scenario.selectedReviewItemId]?.note ?? "Human reviewer must validate or correct the AI-generated draft.",
      tone: reviewedItems[scenario.selectedReviewItemId]?.resolved ? "emerald" : "amber",
      relatedSourceId: "src-review",
      relatedSegmentId: scenario.selectedSegmentId,
      relatedParagraphId: scenario.selectedParagraphId,
      relatedReviewItemId: scenario.selectedReviewItemId,
      type: "review",
    },
    {
      id: "tr-008",
      time: "22:04",
      phase: 8,
      title: "Approval readiness recalculated",
      detail: "Open review items, citations and section readiness updated.",
      tone: "emerald",
      relatedSourceId: "src-review",
      relatedSegmentId: "seg-review-2115",
      relatedParagraphId: "p-approvals",
      relatedReviewItemId: "rq-final-approval",
      type: "review",
    },
    {
      id: "tr-009",
      time: "22:18",
      phase: 9,
      title: "Publish path prepared",
      detail: "Official DDR and structured memory outputs are linked to the same evidence graph.",
      tone: "violet",
      relatedSourceId: "src-review",
      relatedSegmentId: "seg-review-2115",
      relatedParagraphId: "p-approvals",
      relatedReviewItemId: "rq-final-approval",
      type: "memory",
    },
    {
      id: "tr-010",
      time: "22:24",
      phase: 10,
      title: published ? "Structured event saved" : "Structured event ready",
      detail: published ? "The approved DDR became official and operational memory was enriched." : "Approved DDR will create official archive and structured event memory.",
      tone: published ? "emerald" : "cyan",
      relatedSourceId: "src-review",
      relatedSegmentId: "seg-review-2115",
      relatedParagraphId: "p-approvals",
      relatedReviewItemId: "rq-final-approval",
      type: "memory",
    },
  ];

  return events.filter((event) => event.phase <= activePhase || activePhase >= 10);
}

function StatusBadge({ status, compact = false }: { status: SectionStatus; compact?: boolean }) {
  const tone = statusTone(status);
  const classes = getToneClasses(tone);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${classes.border} ${classes.softBg} ${classes.text} ${compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"} font-extrabold uppercase tracking-wide`}>
      <span className={`h-1.5 w-1.5 rounded-full ${classes.dot}`} />
      {statusLabel(status)}
    </span>
  );
}

function TonePill({ tone, label, icon: Icon }: { tone: Tone; label: string; icon?: LucideIcon }) {
  const classes = getToneClasses(tone);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${classes.border} ${classes.softBg} ${classes.text} px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide`}>
      {Icon ? <Icon className="h-3 w-3" /> : <span className={`h-1.5 w-1.5 rounded-full ${classes.dot}`} />}
      {label}
    </span>
  );
}

function ProgressBar({ value, tone = "blue", height = "h-1.5" }: { value: number; tone?: Tone; height?: string }) {
  const classes = getToneClasses(tone);
  return (
    <div className={`${height} overflow-hidden rounded-full bg-slate-100`}>
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${classes.gradient}`}
        initial={false}
        animate={{ width: `${clamp(value, 0, 100)}%` }}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
      />
    </div>
  );
}

function MetricPanel({ label, value, tone, icon: Icon, sublabel }: { label: string; value: string; tone: Tone; icon: LucideIcon; sublabel?: string }) {
  const classes = getToneClasses(tone);
  return (
    <div className={`rounded-2xl border ${classes.border} ${classes.softBg} p-3 shadow-sm`}>
      <div className="flex items-center justify-between gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${classes.iconBg} ${classes.text}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className={`text-lg font-black ${classes.text}`}>{value}</span>
      </div>
      <div className="mt-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">{label}</div>
      {sublabel ? <div className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-slate-400">{sublabel}</div> : null}
    </div>
  );
}

function Header({
  scenario,
  well,
  activePhase,
  autoPlay,
  onToggleAutoplay,
  onReset,
  onScenarioChange,
  systemMetrics,
}: {
  scenario: ScenarioConfig;
  well: WellContext;
  activePhase: DemoPhase;
  autoPlay: boolean;
  onToggleAutoplay: () => void;
  onReset: () => void;
  onScenarioChange: (scenarioId: ScenarioId) => void;
  systemMetrics: SystemMetrics;
}) {
  const phase = PHASES[activePhase];
  return (
    <header className="relative z-20 border-b border-slate-200/80 bg-white/82 px-4 py-3 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="flex min-w-[330px] items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img src={PLUSPETROL_LOGO_URL} alt="Pluspetrol" className="h-8 w-8 object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-black tracking-tight text-slate-950">Pluspetrol DDR Autopilot</h1>
              <TonePill tone={phase.tone} label={phase.label} />
            </div>
            <p className="truncate text-xs font-medium text-slate-500">Turning rig activity, drilling signals, comments and alerts into a traceable Daily Drilling Report draft.</p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-6 gap-2">
          <HeaderFact label="Well" value={well.wellName} />
          <HeaderFact label="Rig" value={well.rigName} />
          <HeaderFact label="Report date" value={well.reportDate} />
          <HeaderFact label="Op day" value={`#${well.operationDay}`} />
          <HeaderFact label="Section" value={well.sectionDrilled} />
          <HeaderFact label="Current MD" value={formatDepth(well.currentMeasuredDepth)} />
        </div>

        <div className="flex min-w-[330px] items-center justify-end gap-2">
          <button
            type="button"
            onClick={onToggleAutoplay}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50"
          >
            {autoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {autoPlay ? "Pause" : "Autoplay"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_510px] gap-3">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          <HeaderStatusChip tone="emerald" label="Rig data connected" />
          <HeaderStatusChip tone="cyan" label="Shift reports loaded" />
          <HeaderStatusChip tone="blue" label="Real-time alerts aligned" />
          <HeaderStatusChip tone="violet" label="Source traceability active" />
          <HeaderStatusChip tone={scenario.riskTone} label="Human approval required" />
          <HeaderStatusChip tone={systemMetrics.reviewReadiness > 84 ? "emerald" : "amber"} label={`Draft completeness: ${systemMetrics.reportCompleteness}%`} />
        </div>
        <ScenarioSelector activeScenario={scenario.id} onScenarioChange={onScenarioChange} />
      </div>
    </header>
  );
}

function HeaderFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2">
      <div className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="truncate text-xs font-extrabold text-slate-800">{value}</div>
    </div>
  );
}

function HeaderStatusChip({ label, tone }: { label: string; tone: Tone }) {
  const classes = getToneClasses(tone);
  return (
    <span className={`shrink-0 rounded-full border ${classes.border} ${classes.softBg} ${classes.text} px-2.5 py-1 text-[10px] font-extrabold`}>
      {label}
    </span>
  );
}

function ScenarioSelector({ activeScenario, onScenarioChange }: { activeScenario: ScenarioId; onScenarioChange: (scenarioId: ScenarioId) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
      <SlidersHorizontal className="ml-2 h-4 w-4 text-slate-400" />
      <select
        value={activeScenario}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onScenarioChange(event.target.value as ScenarioId)}
        className="min-w-0 flex-1 appearance-none bg-transparent px-2 py-1.5 text-xs font-extrabold text-slate-800 outline-none"
      >
        {SCENARIOS.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.name}
          </option>
        ))}
      </select>
      <div className="flex gap-1">
        {SCENARIOS.slice(0, 7).map((scenario) => {
          const active = scenario.id === activeScenario;
          const classes = getToneClasses(scenario.accentTone);
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onScenarioChange(scenario.id)}
              title={scenario.name}
              className={`h-7 rounded-xl border px-2 text-[9px] font-black transition ${
                active ? `${classes.border} ${classes.softBg} ${classes.text} ring-2 ${classes.ring}` : "border-slate-200 bg-slate-50 text-slate-500 hover:border-cyan-200 hover:bg-cyan-50"
              }`}
            >
              {scenario.shortName}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SourceStreamPanel({
  sources,
  selectedSourceId,
  selectedParagraphId,
  activePhase,
  onSourceClick,
}: {
  sources: SourceStream[];
  selectedSourceId: string | null;
  selectedParagraphId: string | null;
  activePhase: DemoPhase;
  onSourceClick: (source: SourceStream) => void;
}) {
  return (
    <section className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white/88 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-black text-slate-950">Source streams</h2>
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">Rig data, people, services and alerts feeding the DDR evidence graph.</p>
          </div>
          <TonePill tone="emerald" label={`${sources.filter((source) => source.contributed).length}/12 active`} />
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
        {sources.map((source, index) => (
          <SourceCard
            key={source.id}
            source={source}
            selected={selectedSourceId === source.id}
            highlightedByParagraph={Boolean(selectedParagraphId && source.relatedParagraphIds.includes(selectedParagraphId))}
            revealed={activePhase >= 1 || index < 3}
            onClick={() => onSourceClick(source)}
          />
        ))}
      </div>
    </section>
  );
}

function SourceCard({
  source,
  selected,
  highlightedByParagraph,
  revealed,
  onClick,
}: {
  source: SourceStream;
  selected: boolean;
  highlightedByParagraph: boolean;
  revealed: boolean;
  onClick: () => void;
}) {
  const classes = getToneClasses(source.tone);
  const Icon = SOURCE_ICONS[source.type];
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={false}
      animate={{ opacity: revealed ? 1 : 0.35, x: revealed ? 0 : -8 }}
      className={`group w-full rounded-2xl border p-3 text-left transition ${
        selected
          ? `${classes.border} ${classes.softBg} shadow-lg ring-2 ${classes.ring}`
          : highlightedByParagraph
            ? "border-violet-200 bg-violet-50/70"
            : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${classes.iconBg} ${classes.text}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-xs font-black text-slate-900">{source.name}</div>
            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${source.status === "reviewRequired" ? "border-amber-200 bg-amber-50 text-amber-700" : source.status === "missing" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
              {source.status === "reviewRequired" ? "Review" : source.status}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-slate-500">
            <span>{source.coverage}</span>
            <span>·</span>
            <span>{source.recordCount} records</span>
            <span>·</span>
            <span>{source.usedCount} used</span>
          </div>
          <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-slate-500">{source.latestExcerpt}</p>
          <div className="mt-2 flex items-center gap-2">
            <ProgressBar value={source.completeness} tone={source.tone} />
            <span className="w-8 text-right text-[10px] font-black text-slate-600">{source.completeness}%</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function TimeDepthReconstruction({
  scenario,
  segments,
  curveData,
  events,
  selectedSegmentId,
  selectedSourceId,
  selectedEventId,
  activePhase,
  onSegmentClick,
  onEventClick,
  onCurvePointClick,
}: {
  scenario: ScenarioConfig;
  segments: ActivitySegment[];
  curveData: RigDataPoint[];
  events: OperationalEvent[];
  selectedSegmentId: string | null;
  selectedSourceId: string | null;
  selectedEventId: string | null;
  activePhase: DemoPhase;
  onSegmentClick: (segment: ActivitySegment) => void;
  onEventClick: (event: OperationalEvent) => void;
  onCurvePointClick: (point: RigDataPoint) => void;
}) {
  const selectedSegment = segments.find((segment) => segment.id === selectedSegmentId) ?? segments[0];
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events.find((event) => event.id === scenario.selectedEventId) ?? events[0];
  const footage = calculateDailyFootage(segments);
  const selectedActivity = curveData.find((point) => point.segmentId === selectedSegment.id);
  const inferredActivity = selectedActivity ? detectActivityFromRigData(selectedActivity) : selectedSegment.type;

  return (
    <section className="relative flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/88 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-black text-slate-950">Time-depth drilling day reconstruction</h2>
              <TonePill tone={scenario.accentTone} label={scenario.shortName} />
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">The day already happened in the data. AI aligns rig activity, comments, alerts and service inputs before drafting.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-right">
            <MiniKpi label="Footage" value={`${footage} m`} tone="blue" />
            <MiniKpi label="Selected" value={selectedSegment.label} tone={selectedSegment.tone} />
            <MiniKpi label="AI class" value={inferredActivity} tone={selectedSegment.tone} />
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[154px_94px_minmax(0,1fr)] gap-3 p-3">
        <RigToReportSvg selectedSourceId={selectedSourceId} activePhase={activePhase} scenario={scenario} />
        <ActivityTimeline
          segments={segments}
          events={events}
          selectedSegmentId={selectedSegment.id}
          selectedEventId={selectedEvent.id}
          activePhase={activePhase}
          onSegmentClick={onSegmentClick}
          onEventClick={onEventClick}
        />
        <div className="grid min-h-0 grid-cols-[1fr_260px] gap-3">
          <RigCurveChart
            data={curveData}
            segments={segments}
            selectedSegment={selectedSegment}
            selectedEvent={selectedEvent}
            activePhase={activePhase}
            onCurvePointClick={onCurvePointClick}
          />
          <SelectedEventPanel event={selectedEvent} segment={selectedSegment} activePhase={activePhase} onEventClick={onEventClick} />
        </div>
      </div>
    </section>
  );
}

function MiniKpi({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  const classes = getToneClasses(tone);
  return (
    <div className={`min-w-[86px] rounded-2xl border ${classes.border} ${classes.softBg} px-3 py-1.5`}>
      <div className={`truncate text-xs font-black ${classes.text}`}>{value}</div>
      <div className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}

function RigToReportSvg({ selectedSourceId, activePhase, scenario }: { selectedSourceId: string | null; activePhase: DemoPhase; scenario: ScenarioConfig }) {
  const sourceActive = (sourceId: string): boolean => selectedSourceId === null || selectedSourceId === sourceId;
  const phaseProgress = clamp(activePhase * 10, 0, 100);
  const accent = scenario.accentTone;
  const accentColor =
    accent === "rose" ? "#e11d48" : accent === "amber" ? "#f59e0b" : accent === "emerald" ? "#10b981" : accent === "violet" ? "#8b5cf6" : accent === "cyan" ? "#06b6d4" : "#2563eb";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-cyan-50/50 p-2">
      <svg viewBox="0 0 900 140" className="h-full w-full">
        <defs>
          <linearGradient id="pp-flow-blue" x1="0" x2="1" y1="0" y2="0">
            <stop stopColor="#e0f2fe" />
            <stop offset="0.52" stopColor="#06b6d4" />
            <stop offset="1" stopColor={accentColor} />
          </linearGradient>
          <filter id="pp-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect x="0" y="0" width="900" height="140" rx="18" fill="rgba(248,250,252,.76)" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={`grid-${i}`} x1={50 + i * 145} x2={50 + i * 145} y1="8" y2="132" stroke="rgba(148,163,184,.18)" strokeDasharray="4 6" />
        ))}

        <SvgSourceNode x={28} y={24} label="Rig signals" active={sourceActive("src-rig")} icon="curve" tone="blue" />
        <SvgSourceNode x={28} y={70} label="Human comments" active={sourceActive("src-company") || sourceActive("src-shift")} icon="comment" tone="cyan" />
        <SvgSourceNode x={28} y={116} label="Service inputs" active={sourceActive("src-mwd") || sourceActive("src-mud")} icon="service" tone="violet" />

        <FlowPath d="M168 28 C260 24 278 48 350 50" active={sourceActive("src-rig")} delay={0} />
        <FlowPath d="M168 74 C250 74 286 72 350 70" active={sourceActive("src-company") || sourceActive("src-shift")} delay={0.3} />
        <FlowPath d="M168 118 C260 116 278 94 350 90" active={sourceActive("src-mwd") || sourceActive("src-mud")} delay={0.6} />

        <motion.g filter="url(#pp-glow)" initial={false} animate={{ opacity: activePhase >= 2 ? 1 : 0.55 }}>
          <rect x="350" y="28" width="180" height="84" rx="24" fill="white" stroke="#cbd5e1" />
          <rect x="363" y="41" width="154" height="58" rx="18" fill="rgba(240,249,255,.95)" stroke="#bae6fd" />
          <text x="440" y="62" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0f172a">Time + Depth</text>
          <text x="440" y="79" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0369a1">Alignment Core</text>
          <motion.circle cx="440" cy="91" r="4" fill={accentColor} animate={{ r: [4, 7, 4], opacity: [1, 0.35, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} />
        </motion.g>

        <FlowPath d="M530 52 C585 40 626 30 686 28" active={activePhase >= 3} delay={0.1} />
        <FlowPath d="M530 70 C590 70 628 70 686 70" active={activePhase >= 5} delay={0.4} />
        <FlowPath d="M530 88 C585 104 630 113 686 116" active={activePhase >= 6} delay={0.7} />

        <SvgOutputNode x={692} y={24} label="Activity table" tone="blue" active={activePhase >= 2} />
        <SvgOutputNode x={692} y={70} label="DDR draft" tone="violet" active={activePhase >= 5} />
        <SvgOutputNode x={692} y={116} label="Structured memory" tone="emerald" active={activePhase >= 8} />

        <motion.rect x="18" y="8" width={phaseProgress * 8.64} height="3" rx="2" fill="url(#pp-flow-blue)" opacity="0.7" />
      </svg>
    </div>
  );
}

function SvgSourceNode({ x, y, label, active, tone }: { x: number; y: number; label: string; active: boolean; icon: "curve" | "comment" | "service"; tone: Tone }) {
  const color = tone === "blue" ? "#2563eb" : tone === "cyan" ? "#06b6d4" : "#8b5cf6";
  return (
    <motion.g initial={false} animate={{ opacity: active ? 1 : 0.25 }}>
      <rect x={x} y={y - 18} width="140" height="34" rx="14" fill="white" stroke={active ? color : "#cbd5e1"} />
      <circle cx={x + 17} cy={y - 1} r="7" fill={color} opacity="0.18" />
      <circle cx={x + 17} cy={y - 1} r="3" fill={color} />
      <text x={x + 32} y={y + 4} fontSize="12" fontWeight="800" fill="#334155">{label}</text>
    </motion.g>
  );
}

function SvgOutputNode({ x, y, label, active, tone }: { x: number; y: number; label: string; active: boolean; tone: Tone }) {
  const color = tone === "blue" ? "#2563eb" : tone === "violet" ? "#8b5cf6" : "#10b981";
  return (
    <motion.g initial={false} animate={{ opacity: active ? 1 : 0.35, x: active ? 0 : 8 }}>
      <rect x={x} y={y - 18} width="170" height="34" rx="14" fill="white" stroke={active ? color : "#cbd5e1"} />
      <rect x={x + 11} y={y - 9} width="18" height="18" rx="6" fill={color} opacity="0.16" />
      <path d={`M${x + 16} ${y - 1} L${x + 20} ${y + 4} L${x + 26} ${y - 6}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x={x + 38} y={y + 4} fontSize="12" fontWeight="800" fill="#334155">{label}</text>
    </motion.g>
  );
}

function FlowPath({ d, active, delay }: { d: string; active: boolean; delay: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke="rgba(148,163,184,.36)" strokeWidth="2" />
      <motion.path
        d={d}
        fill="none"
        stroke="url(#pp-flow-blue)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="8 12"
        initial={false}
        animate={{ pathLength: active ? [0.1, 1, 0.1] : 0, opacity: active ? [0.35, 1, 0.35] : 0.05 }}
        transition={{ repeat: Infinity, duration: 3.4, delay }}
      />
    </g>
  );
}

function ActivityTimeline({
  segments,
  events,
  selectedSegmentId,
  selectedEventId,
  activePhase,
  onSegmentClick,
  onEventClick,
}: {
  segments: ActivitySegment[];
  events: OperationalEvent[];
  selectedSegmentId: string | null;
  selectedEventId: string | null;
  activePhase: DemoPhase;
  onSegmentClick: (segment: ActivitySegment) => void;
  onEventClick: (event: OperationalEvent) => void;
}) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-cyan-600" />
          <span className="text-xs font-black text-slate-900">Operational timeline · 00:00–24:00</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
          <span>Time</span>
          <ArrowRight className="h-3 w-3" />
          <span>Depth</span>
          <ArrowRight className="h-3 w-3" />
          <span>DDR evidence</span>
        </div>
      </div>
      <div className="relative h-12 overflow-visible rounded-xl bg-slate-50 ring-1 ring-slate-200">
        {[0, 4, 8, 12, 16, 20, 24].map((tick) => (
          <div key={tick} className="absolute top-0 h-full border-l border-slate-200" style={{ left: `${(tick / 24) * 100}%` }}>
            <div className="absolute top-[-18px] -translate-x-1/2 text-[9px] font-black text-slate-400">{formatTime(tick)}</div>
          </div>
        ))}
        {segments.map((segment, index) => {
          const selected = segment.id === selectedSegmentId;
          const left = (segment.startHour / 24) * 100;
          const width = Math.max(0.8, ((segment.endHour - segment.startHour) / 24) * 100);
          const color = ACTIVITY_COLORS[segment.type];
          return (
            <motion.button
              key={segment.id}
              type="button"
              onClick={() => onSegmentClick(segment)}
              initial={{ opacity: 0, scaleY: 0.7 }}
              animate={{ opacity: activePhase >= 2 || index < 4 ? 1 : 0.35, scaleY: 1 }}
              transition={{ delay: index * 0.015 }}
              className={`absolute top-1 h-10 rounded-lg border text-left transition hover:brightness-105 ${selected ? "z-20 border-slate-900 shadow-lg ring-2 ring-slate-300" : "border-white/70 shadow-sm"}`}
              style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color }}
              title={`${segment.label} · ${formatTime(segment.startHour)}-${formatTime(segment.endHour)}`}
            >
              <span className="block truncate px-2 text-[9px] font-black leading-10 text-white drop-shadow-sm">{width > 4 ? segment.label : ""}</span>
              {segment.uncertainty ? <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-300 ring-2 ring-white" /> : null}
            </motion.button>
          );
        })}
        {events.map((event) => {
          const selected = event.id === selectedEventId;
          const left = (event.time / 24) * 100;
          const classes = getToneClasses(event.severity);
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onEventClick(event)}
              className={`absolute -top-5 z-30 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border bg-white shadow-lg transition hover:scale-105 ${selected ? `${classes.border} ring-2 ${classes.ring}` : "border-slate-200"}`}
              style={{ left: `${left}%` }}
              title={event.title}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${classes.dot}`} />
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {Object.entries(ACTIVITY_COLORS).map(([type, color]) => (
          <span key={type} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            {type === "nptCandidate" ? "NPT candidate" : type}
          </span>
        ))}
      </div>
    </div>
  );
}

function RigCurveChart({
  data,
  segments,
  selectedSegment,
  selectedEvent,
  activePhase,
  onCurvePointClick,
}: {
  data: RigDataPoint[];
  segments: ActivitySegment[];
  selectedSegment: ActivitySegment;
  selectedEvent: OperationalEvent;
  activePhase: DemoPhase;
  onCurvePointClick: (point: RigDataPoint) => void;
}) {
  const handleChartClick = (state: unknown) => {
    const chartState = state as ChartClickState;
    const point = chartState.activePayload?.[0]?.payload;
    if (point) onCurvePointClick(point);
  };

  return (
    <div className="min-h-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-black text-slate-900">Rig curves aligned to activity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-black text-slate-500">{segments.length} classified intervals</span>
          <TonePill tone={selectedEvent.severity} label={selectedEvent.title} />
        </div>
      </div>
      <div className="h-[215px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} onClick={handleChartClick} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(148,163,184,.24)" />
            <XAxis dataKey="timeLabel" interval={11} tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 130]} tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} />
            <Tooltip content={<RigTooltip />} />
            {activePhase >= 2 ? (
              <ReferenceArea
                yAxisId="left"
                x1={formatTime(selectedSegment.startHour)}
                x2={formatTime(selectedSegment.endHour)}
                fill={ACTIVITY_COLORS[selectedSegment.type]}
                fillOpacity={0.08}
                strokeOpacity={0}
              />
            ) : null}
            <ReferenceLine yAxisId="right" x={formatTime(selectedEvent.time)} stroke="#0f172a" strokeDasharray="4 4" strokeOpacity={0.5} />
            <Line yAxisId="left" type="monotone" dataKey="measuredDepth" name="MD" dot={false} stroke="#2563eb" strokeWidth={2.4} isAnimationActive={activePhase >= 2} />
            <Line yAxisId="right" type="monotone" dataKey="rop" name="ROP" dot={false} stroke="#06b6d4" strokeWidth={2} isAnimationActive={activePhase >= 2} />
            <Line yAxisId="right" type="monotone" dataKey="rpm" name="RPM" dot={false} stroke="#8b5cf6" strokeWidth={1.8} isAnimationActive={activePhase >= 2} />
            <Line yAxisId="right" type="monotone" dataKey="torque" name="Torque" dot={false} stroke="#e11d48" strokeWidth={2} isAnimationActive={activePhase >= 3} />
            <Line yAxisId="right" type="monotone" dataKey="mwdSignalQuality" name="MWD signal" dot={false} stroke="#10b981" strokeWidth={1.7} isAnimationActive={activePhase >= 3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        <CurveLegend label="MD" tone="blue" />
        <CurveLegend label="ROP" tone="cyan" />
        <CurveLegend label="RPM" tone="violet" />
        <CurveLegend label="Torque" tone="rose" />
        <CurveLegend label="MWD signal" tone="emerald" />
      </div>
    </div>
  );
}

function RigTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: RigDataPoint; name: string; value: number | string }> }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 text-xs shadow-xl backdrop-blur-xl">
      <div className="font-black text-slate-900">{point.timeLabel} · {formatDepth(point.measuredDepth)}</div>
      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-600">
        <span>ROP {point.rop} m/h</span>
        <span>RPM {point.rpm}</span>
        <span>Torque {point.torque} klbf-ft</span>
        <span>SPP {point.standpipePressure} psi</span>
        <span>Flow {point.flowRate} gpm</span>
        <span>MWD {point.mwdSignalQuality}%</span>
      </div>
    </div>
  );
}

function CurveLegend({ label, tone }: { label: string; tone: Tone }) {
  const classes = getToneClasses(tone);
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-black text-slate-500">
      <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${classes.dot}`} />
      {label}
    </div>
  );
}

function SelectedEventPanel({ event, segment, activePhase, onEventClick }: { event: OperationalEvent; segment: ActivitySegment; activePhase: DemoPhase; onEventClick: (event: OperationalEvent) => void }) {
  const classes = getToneClasses(event.severity);
  return (
    <button
      type="button"
      onClick={() => onEventClick(event)}
      className={`min-h-0 rounded-2xl border p-3 text-left shadow-sm transition hover:shadow-md ${classes.border} ${classes.softBg}`}
    >
      <div className="flex items-center justify-between gap-2">
        <TonePill tone={event.severity} label="Selected event" icon={Sparkles} />
        <span className="text-[10px] font-black text-slate-500">{formatTime(event.time)}</span>
      </div>
      <h3 className="mt-3 text-sm font-black text-slate-950">{event.title}</h3>
      <p className="mt-2 text-[11px] leading-5 text-slate-600">{event.summary}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniEvidence label="Interval" value={`${formatTime(segment.startHour)}–${formatTime(segment.endHour)}`} />
        <MiniEvidence label="Depth" value={`${formatDepth(segment.startDepth)} → ${formatDepth(segment.endDepth)}`} />
        <MiniEvidence label="Duration" value={formatDuration(segment.endHour - segment.startHour)} />
        <MiniEvidence label="Confidence" value={event.confidence} />
        <MiniEvidence label="Draft" value={event.includedInDraft ? "Included" : "Pending"} />
      </div>
      <div className="mt-3 rounded-xl border border-white/70 bg-white/70 p-2 text-[10px] font-semibold leading-4 text-slate-600">
        {activePhase < 5 ? "Event evidence is being aligned before drafting." : "Event is linked to a DDR paragraph and review item where needed."}
      </div>
    </button>
  );
}

function MiniEvidence({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/80 bg-white/75 px-2 py-1.5">
      <div className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="truncate text-[10px] font-black text-slate-700">{value}</div>
    </div>
  );
}

function DDRDraftPanel({
  scenario,
  sections,
  selectedParagraphId,
  selectedSourceId,
  activePhase,
  onSectionApprove,
  onParagraphClick,
  onSourceChipClick,
  onUncertaintyClick,
}: {
  scenario: ScenarioConfig;
  sections: DDRSection[];
  selectedParagraphId: string | null;
  selectedSourceId: string | null;
  activePhase: DemoPhase;
  onSectionApprove: (sectionId: string) => void;
  onParagraphClick: (paragraph: DDRParagraph) => void;
  onSourceChipClick: (chip: SourceChip, paragraph: DDRParagraph) => void;
  onUncertaintyClick: (paragraph: DDRParagraph) => void;
}) {
  const visibleSections = activePhase < 5 ? sections.slice(0, 3) : sections;
  const status: DraftStatus = activePhase < 2 ? "collecting" : activePhase < 5 ? "aligning" : activePhase < 8 ? "reviewRequired" : "ready";
  return (
    <section className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white/88 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-violet-600" />
              <h2 className="text-sm font-black text-slate-950">DDR draft · company format</h2>
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">AI-generated draft. Human approval required. Every paragraph is tied to evidence.</p>
          </div>
          <TonePill tone={status === "ready" ? "emerald" : "violet"} label={draftStatusLabel(status)} />
        </div>
        <div className="mt-3 rounded-2xl border border-violet-200 bg-violet-50/80 p-3">
          <div className="flex items-start gap-2">
            <Brain className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />
            <div>
              <div className="text-xs font-black text-slate-950">The DDR should be assembled from evidence, not reconstructed manually.</div>
              <p className="mt-1 text-[11px] leading-4 text-slate-600">{scenario.operatingFocus}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        <div className="space-y-3">
          {visibleSections.map((section, index) => (
            <DDRSectionCard
              key={section.id}
              section={section}
              index={index}
              selectedParagraphId={selectedParagraphId}
              selectedSourceId={selectedSourceId}
              onSectionApprove={onSectionApprove}
              onParagraphClick={onParagraphClick}
              onSourceChipClick={onSourceChipClick}
              onUncertaintyClick={onUncertaintyClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DDRSectionCard({
  section,
  index,
  selectedParagraphId,
  selectedSourceId,
  onSectionApprove,
  onParagraphClick,
  onSourceChipClick,
  onUncertaintyClick,
}: {
  section: DDRSection;
  index: number;
  selectedParagraphId: string | null;
  selectedSourceId: string | null;
  onSectionApprove: (sectionId: string) => void;
  onParagraphClick: (paragraph: DDRParagraph) => void;
  onSourceChipClick: (chip: SourceChip, paragraph: DDRParagraph) => void;
  onUncertaintyClick: (paragraph: DDRParagraph) => void;
}) {
  const tone = statusTone(section.status);
  const classes = getToneClasses(tone);
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025 }}
      className={`rounded-2xl border ${classes.border} bg-white p-3 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => section.paragraphs[0] && onParagraphClick(section.paragraphs[0])} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-500">{section.order}</span>
            <h3 className="truncate text-xs font-black text-slate-950">{section.title}</h3>
          </div>
          <p className="mt-1 line-clamp-1 text-[10px] font-medium text-slate-500">{section.summary}</p>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={section.status} compact />
          <button
            type="button"
            onClick={() => onSectionApprove(section.id)}
            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Approve
          </button>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {section.paragraphs.map((paragraph) => (
          <GeneratedParagraph
            key={paragraph.id}
            paragraph={paragraph}
            selected={paragraph.id === selectedParagraphId}
            selectedSourceId={selectedSourceId}
            onParagraphClick={onParagraphClick}
            onSourceChipClick={onSourceChipClick}
            onUncertaintyClick={onUncertaintyClick}
          />
        ))}
      </div>
    </motion.article>
  );
}

function GeneratedParagraph({
  paragraph,
  selected,
  selectedSourceId,
  onParagraphClick,
  onSourceChipClick,
  onUncertaintyClick,
}: {
  paragraph: DDRParagraph;
  selected: boolean;
  selectedSourceId: string | null;
  onParagraphClick: (paragraph: DDRParagraph) => void;
  onSourceChipClick: (chip: SourceChip, paragraph: DDRParagraph) => void;
  onUncertaintyClick: (paragraph: DDRParagraph) => void;
}) {
  const tone = statusTone(paragraph.status);
  const classes = getToneClasses(tone);
  const flagged = paragraph.status === "needsReview" || paragraph.status === "missingData" || paragraph.status === "conflict";
  return (
    <div className={`rounded-2xl border p-3 transition ${selected ? `${classes.border} ${classes.softBg} ring-2 ${classes.ring}` : "border-slate-200 bg-slate-50/60"}`}>
      <button type="button" onClick={() => onParagraphClick(paragraph)} className="block w-full text-left">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-violet-600" />
            <span className="text-[11px] font-black text-slate-900">{paragraph.title}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {paragraph.lastEditedBy ? <TonePill tone="emerald" label="Edited" /> : <TonePill tone="violet" label="AI-generated" />}
            <StatusBadge status={paragraph.status} compact />
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-5 text-slate-600">{paragraph.body}</p>
      </button>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {paragraph.sourceChips.map((chip) => (
          <SourceChipBadge key={`${paragraph.id}-${chip.id}`} chip={chip} active={selectedSourceId === chip.sourceId} onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            onSourceChipClick(chip, paragraph);
          }} />
        ))}
      </div>
      {flagged ? (
        <button
          type="button"
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            onUncertaintyClick(paragraph);
          }}
          className="mt-3 flex w-full items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left transition hover:border-amber-300 hover:bg-amber-100"
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
          <span className="text-[10px] font-bold leading-4 text-amber-800">
            {paragraph.status === "missingData" ? "Missing or unexplained source evidence requires reviewer input." : "Uncertainty is visible before approval; click to validate or correct."}
          </span>
        </button>
      ) : null}
      {paragraph.reviewerNote ? (
        <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-semibold leading-4 text-emerald-700">
          {paragraph.reviewerNote}
        </div>
      ) : null}
    </div>
  );
}

function SourceChipBadge({ chip, active, onClick }: { chip: SourceChip; active: boolean; onClick: (event: MouseEvent<HTMLButtonElement>) => void }) {
  const classes = getToneClasses(chip.tone);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-black transition ${active ? `${classes.border} ${classes.bg} ${classes.text} ring-2 ${classes.ring}` : `${classes.border} bg-white ${classes.text} hover:${classes.softBg}`}`}
      title={`Open source excerpt: ${chip.label}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${classes.dot}`} />
      {chip.label}
      <span className="opacity-60">· {chip.confidence}</span>
    </button>
  );
}

function AIInsightPanel({ scenario, selectedSource, selectedParagraph, selectedSegment }: { scenario: ScenarioConfig; selectedSource: SourceStream | null; selectedParagraph: DDRParagraph | null; selectedSegment: ActivitySegment | null }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/88 p-3 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-600" />
          <h2 className="text-sm font-black text-slate-950">AI insight</h2>
        </div>
        <TonePill tone={scenario.riskTone} label={scenario.riskLabel} />
      </div>
      <p className="mt-2 text-[11px] leading-5 text-slate-600">{scenario.aiInsight}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <InsightCell label="Source focus" value={selectedSource?.name ?? "All sources"} tone={selectedSource?.tone ?? "slate"} />
        <InsightCell label="Paragraph" value={selectedParagraph?.title ?? "Draft"} tone={selectedParagraph ? statusTone(selectedParagraph.status) : "violet"} />
        <InsightCell label="Interval" value={selectedSegment ? `${formatTime(selectedSegment.startHour)}–${formatTime(selectedSegment.endHour)}` : "Day"} tone={selectedSegment?.tone ?? "blue"} />
      </div>
    </section>
  );
}

function InsightCell({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  const classes = getToneClasses(tone);
  return (
    <div className={`rounded-2xl border ${classes.border} ${classes.softBg} px-2.5 py-2`}>
      <div className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-0.5 truncate text-[10px] font-black ${classes.text}`}>{value}</div>
    </div>
  );
}

function EventStream({ traceEvents, onTraceClick }: { traceEvents: TraceEvent[]; onTraceClick: (event: TraceEvent) => void }) {
  return (
    <section className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white/88 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
      <div className="border-b border-slate-200 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-600" />
            <h2 className="text-sm font-black text-slate-950">Event stream</h2>
          </div>
          <TonePill tone="cyan" label={`${traceEvents.length} steps`} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-2">
        {traceEvents.map((event) => {
          const classes = getToneClasses(event.tone);
          return (
            <button key={event.id} type="button" onClick={() => onTraceClick(event)} className="mb-2 w-full rounded-2xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-cyan-200 hover:bg-cyan-50/40 last:mb-0">
              <div className="flex items-start gap-2">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${classes.dot}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] font-black text-slate-900">{event.title}</span>
                    <span className="text-[9px] font-black text-slate-400">{event.time}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-slate-500">{event.detail}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BottomAnalyticsDeck({
  selectedTab,
  onTabChange,
  activitySplit,
  nptIntervals,
  sections,
  structuredEvents,
  quality,
  systemMetrics,
  onStructuredEventClick,
  onNptClick,
}: {
  selectedTab: BottomTabId;
  onTabChange: (tab: BottomTabId) => void;
  activitySplit: ActivitySplitItem[];
  nptIntervals: NptInterval[];
  sections: DDRSection[];
  structuredEvents: StructuredEvent[];
  quality: ReportQualityMetrics;
  systemMetrics: SystemMetrics;
  onStructuredEventClick: (event: StructuredEvent) => void;
  onNptClick: (interval: NptInterval) => void;
}) {
  return (
    <section className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white/88 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
      <div className="border-b border-slate-200 px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-black text-slate-950">Review, validation and structured memory deck</h2>
          </div>
          <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {BOTTOM_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = tab.id === selectedTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[10px] font-black transition ${active ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:bg-white hover:text-slate-800"}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 p-3">
        <AnimatePresence mode="wait">
          <motion.div key={selectedTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="h-full">
            {selectedTab === "activity" ? <ActivitySummaryTab activitySplit={activitySplit} quality={quality} /> : null}
            {selectedTab === "npt" ? <NptReviewTab intervals={nptIntervals} onNptClick={onNptClick} /> : null}
            {selectedTab === "traceability" ? <TraceabilityTab sections={sections} /> : null}
            {selectedTab === "events" ? <StructuredEventsTab events={structuredEvents} onEventClick={onStructuredEventClick} /> : null}
            {selectedTab === "quality" ? <ReportQualityTab quality={quality} systemMetrics={systemMetrics} /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function ActivitySummaryTab({ activitySplit, quality }: { activitySplit: ActivitySplitItem[]; quality: ReportQualityMetrics }) {
  const totalHours = activitySplit.reduce((sum, item) => sum + item.hours, 0);
  return (
    <div className="grid h-full grid-cols-[1fr_280px] gap-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-slate-950">Main activity split</div>
            <p className="text-[10px] font-medium text-slate-500">Activity is reconstructed from rig signatures and reconciled with comments.</p>
          </div>
          <TonePill tone="blue" label={`${totalHours.toFixed(1)}h`} />
        </div>
        <div className="mt-3 h-[196px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activitySplit} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="rgba(148,163,184,.22)" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} />
              <Tooltip content={<SimpleTooltip suffix="h" />} />
              <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                {activitySplit.map((entry) => (
                  <Cell key={entry.type} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MetricPanel label="Drilling hours" value={`${(activitySplit.find((item) => item.type === "drilling")?.hours ?? 0).toFixed(1)}h`} tone="blue" icon={Activity} />
        <MetricPanel label="Connection hours" value={`${(activitySplit.find((item) => item.type === "connection")?.hours ?? 0).toFixed(1)}h`} tone="slate" icon={GitBranch} />
        <MetricPanel label="Circulation hours" value={`${(activitySplit.find((item) => item.type === "circulation")?.hours ?? 0).toFixed(1)}h`} tone="cyan" icon={Waves} />
        <MetricPanel label="Waiting / NPT" value={`${((activitySplit.find((item) => item.type === "nptCandidate")?.hours ?? 0) + (activitySplit.find((item) => item.type === "waiting")?.hours ?? 0)).toFixed(1)}h`} tone="rose" icon={Timer} />
        <MetricPanel label="Daily footage" value="326 m" tone="emerald" icon={TrendingUp} />
        <MetricPanel label="Avg ROP" value="18.4 m/h" tone="violet" icon={Gauge} />
        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">Review readiness</span>
            <span className="text-sm font-black text-slate-800">{quality.approvalReadiness}%</span>
          </div>
          <div className="mt-2"><ProgressBar value={quality.approvalReadiness} tone={quality.qualityTone} /></div>
        </div>
      </div>
    </div>
  );
}

function NptReviewTab({ intervals, onNptClick }: { intervals: NptInterval[]; onNptClick: (interval: NptInterval) => void }) {
  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs font-black text-slate-950">NPT / delay review</div>
          <p className="text-[10px] font-medium text-slate-500">Possible lost-time intervals are flagged for human classification, not auto-published.</p>
        </div>
        <TonePill tone={intervals.length > 0 ? "rose" : "emerald"} label={`${intervals.length} candidate${intervals.length === 1 ? "" : "s"}`} />
      </div>
      <div className="mt-3 grid h-[205px] grid-cols-2 gap-3 overflow-auto">
        {intervals.length === 0 ? (
          <div className="col-span-2 flex items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-center">
            <div>
              <ShieldCheck className="mx-auto h-8 w-8 text-emerald-600" />
              <div className="mt-2 text-sm font-black text-slate-900">No unresolved NPT candidate</div>
              <p className="mt-1 max-w-md text-xs text-slate-500">The DDR still preserves evidence, but no current interval crosses the NPT review threshold.</p>
            </div>
          </div>
        ) : (
          intervals.map((interval) => (
            <button key={interval.id} type="button" onClick={() => onNptClick(interval)} className="rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-rose-200 hover:bg-rose-50/40">
              <div className="flex items-center justify-between gap-2">
                <TonePill tone={interval.classification === "confirmedNpt" ? "rose" : interval.classification === "operationalDelay" ? "amber" : "rose"} label={interval.classification} />
                <span className="text-sm font-black text-slate-900">{interval.durationHours.toFixed(1)}h</span>
              </div>
              <h3 className="mt-3 text-xs font-black text-slate-950">{interval.description}</h3>
              <p className="mt-1 text-[11px] leading-5 text-slate-600">{interval.candidateReason}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniEvidence label="Interval" value={`${formatTime(interval.startHour)}–${formatTime(interval.endHour)}`} />
                <MiniEvidence label="Depth" value={interval.depthRange} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {interval.sourceIds.map((sourceId) => (
                  <span key={`${interval.id}-${sourceId}`} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-500">{SOURCE_LABELS[sourceTypeFromId(sourceId)]}</span>
                ))}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function TraceabilityTab({ sections }: { sections: DDRSection[] }) {
  const paragraphs = sections.flatMap((section) => section.paragraphs);
  return (
    <div className="grid h-full grid-cols-[1fr_260px] gap-3">
      <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
        <div className="mb-2 text-xs font-black text-slate-950">Paragraph-level source traceability</div>
        <div className="space-y-2">
          {paragraphs.map((paragraph) => {
            const tone = statusTone(paragraph.status);
            const classes = getToneClasses(tone);
            return (
              <div key={paragraph.id} className="grid grid-cols-[1fr_90px_90px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-black text-slate-900">{paragraph.title}</div>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {paragraph.sourceChips.slice(0, 4).map((chip) => (
                      <span key={`${paragraph.id}-${chip.id}`} className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[8px] font-bold text-slate-500">{chip.label}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right text-[10px] font-black text-slate-600">{paragraph.sourceChips.length} sources</div>
                <div className="flex justify-end"><span className={`rounded-full ${classes.softBg} ${classes.text} px-2 py-1 text-[9px] font-black`}>{paragraph.confidence}</span></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid gap-2">
        <MetricPanel label="Cited paragraphs" value={`${paragraphs.filter((p) => p.sourceChips.length > 0).length}/${paragraphs.length}`} tone="cyan" icon={Link2} />
        <MetricPanel label="Missing citations" value={String(paragraphs.filter((p) => p.sourceChips.length === 0).length)} tone="emerald" icon={Search} />
        <MetricPanel label="Review flags" value={String(paragraphs.filter((p) => p.status === "needsReview" || p.status === "missingData" || p.status === "conflict").length)} tone="amber" icon={AlertTriangle} />
        <MetricPanel label="AI paragraphs" value={String(paragraphs.filter((p) => p.generatedByAi).length)} tone="violet" icon={Sparkles} />
      </div>
    </div>
  );
}

function StructuredEventsTab({ events, onEventClick }: { events: StructuredEvent[]; onEventClick: (event: StructuredEvent) => void }) {
  return (
    <div className="h-full overflow-auto rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="grid grid-cols-2 gap-2">
        {events.map((event) => {
          const classes = getToneClasses(event.tone);
          return (
            <button key={event.id} type="button" onClick={() => onEventClick(event)} className="rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-cyan-200 hover:bg-cyan-50/40">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${classes.dot}`} />
                  <span className="truncate text-xs font-black text-slate-900">{event.title}</span>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${event.status === "saved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : event.status === "ready" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                  {event.status}
                </span>
              </div>
              <div className="mt-1 text-[10px] font-semibold text-slate-500">{formatTime(event.startHour)}–{formatTime(event.endHour)} · {event.depthRange}</div>
              <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-slate-500">{event.action} · {event.result}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {event.sources.slice(0, 4).map((source) => (
                  <span key={`${event.id}-${source}`} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold text-slate-500">{SOURCE_LABELS[source]}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReportQualityTab({ quality, systemMetrics }: { quality: ReportQualityMetrics; systemMetrics: SystemMetrics }) {
  const radialData: Array<{ name: string; value: number; tone: Tone }> = [
    { name: "Completeness", value: quality.completenessScore, tone: "blue" },
    { name: "Traceability", value: quality.traceabilityScore, tone: "cyan" },
    { name: "Readiness", value: quality.approvalReadiness, tone: quality.approvalReadiness > 84 ? "emerald" : "amber" },
  ];
  const toneHex: Record<Tone, string> = {
    slate: "#64748b",
    cyan: "#06b6d4",
    blue: "#2563eb",
    violet: "#8b5cf6",
    emerald: "#10b981",
    amber: "#f59e0b",
    rose: "#e11d48",
  };
  return (
    <div className="grid h-full grid-cols-[260px_1fr] gap-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
        <div className="text-xs font-black text-slate-900">Report quality</div>
        <div className="h-[210px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="28%" outerRadius="92%" data={radialData} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" background cornerRadius={10}>
                {radialData.map((entry) => <Cell key={entry.name} fill={toneHex[entry.tone]} />)}
              </RadialBar>
              <Tooltip content={<SimpleTooltip suffix="%" />} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MetricPanel label="Completeness" value={`${quality.completenessScore}%`} tone="blue" icon={FileCheck} />
        <MetricPanel label="Traceability" value={`${quality.traceabilityScore}%`} tone="cyan" icon={Link2} />
        <MetricPanel label="Review progress" value={`${quality.reviewProgress}%`} tone="emerald" icon={ListChecks} />
        <MetricPanel label="Unresolved items" value={String(quality.unresolvedUncertainty)} tone={quality.unresolvedUncertainty > 0 ? "amber" : "emerald"} icon={AlertTriangle} />
        <MetricPanel label="Manual time saved" value={`${quality.manualTimeSavedMinutes}m`} tone="violet" icon={Timer} />
        <MetricPanel label="Dominant constraint" value={systemMetrics.dominantConstraint === "None" ? "0" : "1"} tone={systemMetrics.dominantConstraint === "None" ? "emerald" : "amber"} icon={ShieldCheck} sublabel={systemMetrics.dominantConstraint} />
      </div>
    </div>
  );
}

function SimpleTooltip({ active, payload, suffix = "" }: { active?: boolean; payload?: Array<{ name: string; value: number | string }>; suffix?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 p-2 text-[10px] font-bold text-slate-700 shadow-xl backdrop-blur-xl">
      {payload.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-4">
          <span>{entry.name}</span>
          <span>{entry.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
}

function ReviewQueuePanel({
  reviewQueue,
  selectedReviewItemId,
  onReviewItemClick,
  onAction,
}: {
  reviewQueue: ReviewQueueItem[];
  selectedReviewItemId: string | null;
  onReviewItemClick: (item: ReviewQueueItem) => void;
  onAction: (item: ReviewQueueItem, action: ReviewActionType) => void;
}) {
  return (
    <section className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white/88 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
      <div className="border-b border-slate-200 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-black text-slate-950">Human review queue</h2>
          </div>
          <TonePill tone={reviewQueue.some((item) => item.status === "open") ? "amber" : "emerald"} label={`${reviewQueue.filter((item) => item.status === "open").length} open`} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-2">
        {reviewQueue.map((item) => (
          <ReviewQueueCard key={item.id} item={item} selected={item.id === selectedReviewItemId} onReviewItemClick={onReviewItemClick} onAction={onAction} />
        ))}
      </div>
    </section>
  );
}

function ReviewQueueCard({ item, selected, onReviewItemClick, onAction }: { item: ReviewQueueItem; selected: boolean; onReviewItemClick: (item: ReviewQueueItem) => void; onAction: (item: ReviewQueueItem, action: ReviewActionType) => void }) {
  const classes = getToneClasses(item.severity);
  return (
    <button
      type="button"
      onClick={() => onReviewItemClick(item)}
      className={`mb-2 w-full rounded-2xl border p-3 text-left transition last:mb-0 ${selected ? `${classes.border} ${classes.softBg} ring-2 ${classes.ring}` : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/40"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${classes.dot}`} />
            <span className="truncate text-[11px] font-black text-slate-900">{item.title}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{item.description}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${item.status === "resolved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : item.status === "deferred" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
          {item.status}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {item.actionTypes.slice(0, 4).map((action) => (
          <button
            key={`${item.id}-${action}`}
            type="button"
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              onAction(item, action);
            }}
            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-[9px] font-black text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            {reviewActionLabel(action)}
          </button>
        ))}
      </div>
    </button>
  );
}

function ValueMetrics({ metrics }: { metrics: ValueMetric[] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/88 p-3 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
      <div className="mb-2 flex items-center gap-2">
        <TrendingDown className="h-4 w-4 text-violet-600" />
        <h2 className="text-sm font-black text-slate-950">Business value</h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric) => {
          const classes = getToneClasses(metric.tone);
          const Icon = metric.icon;
          return (
            <div key={metric.label} className={`rounded-2xl border ${classes.border} ${classes.softBg} p-2.5`}>
              <div className="flex items-center justify-between gap-2">
                <Icon className={`h-4 w-4 ${classes.text}`} />
                <span className={`text-sm font-black ${classes.text}`}>{metric.value}</span>
              </div>
              <div className="mt-1 text-[9px] font-extrabold uppercase tracking-wide text-slate-400">{metric.label}</div>
              <div className="mt-0.5 truncate text-[10px] font-semibold text-slate-500">{metric.delta}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function GovernancePanel() {
  const items = [
    "The AI generates a draft, not an official report.",
    "Human review and approval are required before publishing.",
    "Uncertain causes remain flagged instead of being hallucinated.",
    "Possible NPT intervals require validation and official classification.",
    "Source conflicts and missing comments are shown explicitly.",
    "Corrections are logged and stored with the approved version.",
    "Structured events are saved with source traceability.",
  ];
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/88 p-3 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
      <div className="mb-2 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <h2 className="text-sm font-black text-slate-950">Governance</h2>
      </div>
      <div className="grid grid-cols-1 gap-1.5">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-[10px] font-medium leading-4 text-slate-600">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function EvidenceDrawer({
  open,
  paragraph,
  evidenceItems,
  selectedEvidenceId,
  onClose,
  onEvidenceClick,
}: {
  open: boolean;
  paragraph: DDRParagraph | null;
  evidenceItems: EvidenceItem[];
  selectedEvidenceId: string | null;
  onClose: () => void;
  onEvidenceClick: (item: EvidenceItem) => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          initial={{ x: 520, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 520, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed right-4 top-[132px] z-40 flex h-[calc(100vh-156px)] w-[500px] flex-col rounded-3xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-300/60 backdrop-blur-xl"
        >
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-cyan-600" />
                  <div className="text-sm font-black text-slate-950">Evidence drawer</div>
                </div>
                <p className="text-[11px] text-slate-500">Exact source excerpts, extracted fields and discrepancies for the selected DDR paragraph.</p>
              </div>
              <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-4">
            {paragraph ? (
              <div className="mb-3 rounded-2xl border border-violet-200 bg-violet-50 p-3">
                <div className="text-[10px] font-black uppercase tracking-wide text-violet-700">Selected DDR paragraph</div>
                <div className="mt-1 text-xs font-black text-slate-900">{paragraph.title}</div>
                <p className="mt-1 text-[11px] leading-5 text-slate-600">{paragraph.body}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {paragraph.sourceChips.map((chip) => (
                    <span key={`${paragraph.id}-drawer-${chip.id}`} className="rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[9px] font-black text-violet-700">{chip.label}: {chip.confidence}</span>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="grid gap-2">
              {evidenceItems.map((item) => {
                const active = item.id === selectedEvidenceId;
                const classes = getToneClasses(item.tone);
                const Icon = SOURCE_ICONS[item.sourceType];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onEvidenceClick(item)}
                    className={`rounded-2xl border p-3 text-left transition ${active ? `${classes.border} ${classes.softBg} ring-2 ${classes.ring}` : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/40"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${classes.iconBg} ${classes.text}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate text-xs font-black text-slate-900">{item.title}</div>
                          <div className="text-[10px] font-black text-slate-500">{item.confidence}</div>
                        </div>
                        <div className="mt-0.5 text-[10px] font-semibold text-slate-400">{SOURCE_LABELS[item.sourceType]} · {item.timestamp} · {formatDepth(item.depth)}</div>
                        <p className="mt-1 text-[11px] leading-5 text-slate-600">{item.detail}</p>
                        <div className="mt-2 grid grid-cols-2 gap-1">
                          {item.extractedFields.map((field) => (
                            <div key={`${item.id}-${field.label}`} className="rounded-lg border border-slate-200 bg-white/70 px-2 py-1">
                              <div className="text-[9px] font-black uppercase tracking-wide text-slate-400">{field.label}</div>
                              <div className="truncate text-[10px] font-black text-slate-700">{field.value}</div>
                            </div>
                          ))}
                        </div>
                        {item.discrepancy ? (
                          <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-2 py-1.5 text-[10px] font-semibold text-amber-800">{item.discrepancy}</div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

function ValidationOverlay({
  item,
  paragraph,
  evidenceItems,
  onClose,
  onAction,
}: {
  item: ReviewQueueItem | null;
  paragraph: DDRParagraph | null;
  evidenceItems: EvidenceItem[];
  onClose: () => void;
  onAction: (item: ReviewQueueItem, action: ReviewActionType) => void;
}) {
  return (
    <AnimatePresence>
      {item ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-6 backdrop-blur-sm">
          <motion.div initial={{ y: 20, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.98 }} className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <TonePill tone={item.severity} label="Validation required" />
                    <span className="text-[11px] font-semibold text-slate-400">{item.id}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-black text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
                <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_1fr] gap-4 p-5">
              <div>
                <div className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">Generated paragraph</div>
                <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                  <div className="text-sm font-black text-slate-950">{paragraph?.title ?? "DDR paragraph"}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{paragraph?.body ?? "No paragraph selected."}</p>
                  <div className="mt-3 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-800">{item.evidenceSummary}</div>
                </div>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
                  <b className="text-slate-900">Human-in-the-loop rule:</b> The AI can draft and cite. It cannot publish the DDR or assign uncertain root cause without reviewer approval.
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">Conflicting or supporting evidence</div>
                <div className="max-h-[310px] overflow-auto rounded-2xl border border-slate-200 bg-white p-2">
                  {evidenceItems.slice(0, 5).map((evidence) => (
                    <div key={evidence.id} className="mb-2 rounded-xl border border-slate-200 bg-slate-50 p-3 last:mb-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-black text-slate-900">{evidence.title}</div>
                        <div className="text-[10px] font-black text-slate-500">{evidence.confidence}</div>
                      </div>
                      <p className="mt-1 text-[11px] leading-5 text-slate-600">{evidence.detail}</p>
                      {evidence.discrepancy ? <div className="mt-2 text-[10px] font-semibold text-amber-700">{evidence.discrepancy}</div> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <div className="text-xs font-semibold text-slate-500">Reviewer correction will update both DDR and structured event memory.</div>
              <div className="flex flex-wrap justify-end gap-2">
                {item.actionTypes.map((action) => (
                  <button key={action} type="button" onClick={() => onAction(item, action)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700">
                    {reviewActionLabel(action)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ApprovalOverlay({
  open,
  approvalState,
  structuredEvents,
  onClose,
  onPublish,
}: {
  open: boolean;
  approvalState: ApprovalState;
  structuredEvents: StructuredEvent[];
  onClose: () => void;
  onPublish: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-6 backdrop-blur-sm">
          <motion.div initial={{ y: 22, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 22, scale: 0.98 }} className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 bg-gradient-to-r from-white via-cyan-50 to-violet-50 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <TonePill tone={approvalState.ready ? "emerald" : "amber"} label={approvalState.ready ? "Ready for human approval" : "Approval blocked by review items"} />
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Publish traceable DDR</h3>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">The AI-generated draft becomes official only after human approval. Publishing creates two auditable outputs: the official DDR archive and structured operational memory.</p>
                </div>
                <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_140px_1fr] gap-4 p-6">
              <OutputCard tone="blue" icon={FileText} title="Official DDR Archive" status={approvalState.officialArchiveStatus} copy="Auditable company-format Daily Drilling Report with reviewer approval, source citations and version trail." />
              <div className="flex items-center justify-center">
                <div className="relative h-32 w-32 rounded-full border border-slate-200 bg-slate-50">
                  <motion.div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500" animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
                  <GitBranch className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 text-slate-700" />
                  <motion.div className="absolute left-1 top-1/2 h-1.5 w-10 rounded-full bg-blue-500" animate={{ x: approvalState.officialArchiveStatus === "saved" ? [0, 42, 0] : [0, 22, 0], opacity: [0.1, 1, 0.1] }} transition={{ repeat: Infinity, duration: 2.2 }} />
                  <motion.div className="absolute right-1 top-1/2 h-1.5 w-10 rounded-full bg-emerald-500" animate={{ x: approvalState.structuredMemoryStatus === "saved" ? [0, -42, 0] : [0, -22, 0], opacity: [0.1, 1, 0.1] }} transition={{ repeat: Infinity, duration: 2.2 }} />
                </div>
              </div>
              <OutputCard tone="emerald" icon={Database} title="Structured Event Memory" status={approvalState.structuredMemoryStatus} copy={`${structuredEvents.length} daily events: activity segments, causes, actions, results, parameters, NPT candidates and reviewer corrections.`} />
            </div>
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <MiniScore label="Readiness" value={`${approvalState.readiness}%`} tone={approvalState.ready ? "emerald" : "amber"} />
                  <MiniScore label="Open items" value={String(approvalState.requiredOpenItems)} tone={approvalState.requiredOpenItems === 0 ? "emerald" : "amber"} />
                  <MiniScore label="Sections" value={`${approvalState.approvedSectionCount}/${approvalState.totalSectionCount}`} tone="blue" />
                  <MiniScore label="Memory events" value={String(structuredEvents.length)} tone="violet" />
                </div>
                <button
                  type="button"
                  onClick={onPublish}
                  className={`rounded-2xl px-5 py-3 text-sm font-black shadow-lg transition ${approvalState.ready ? "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700" : "bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600"}`}
                >
                  {approvalState.ready ? "Approve and publish DDR" : "Simulate reviewer approval"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function OutputCard({ tone, icon: Icon, title, status, copy }: { tone: Tone; icon: LucideIcon; title: string; status: MemoryStatus; copy: string }) {
  const classes = getToneClasses(tone);
  return (
    <div className={`rounded-3xl border p-5 ${classes.border} ${classes.softBg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-white/70 p-3"><Icon className={`h-6 w-6 ${classes.text}`} /></div>
        <span className="rounded-full border border-white/70 bg-white/70 px-2 py-1 text-[10px] font-black uppercase text-slate-600">{status}</span>
      </div>
      <div className="mt-4 text-lg font-black text-slate-950">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
      <div className="mt-4 h-1.5 rounded-full bg-white/70">
        <motion.div className={`h-full rounded-full ${classes.bg}`} animate={{ width: status === "saved" ? "100%" : status === "ready" ? "74%" : "38%" }} />
      </div>
    </div>
  );
}

function MiniScore({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  const classes = getToneClasses(tone);
  return (
    <div className={`min-w-[92px] rounded-2xl border px-3 py-2 ${classes.border} ${classes.softBg}`}>
      <div className={`text-lg font-black ${classes.text}`}>{value}</div>
      <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

export default function BizCaseC() {
  const [activeScenario, setActiveScenario] = useState<ScenarioId>("highTorqueRopDrop");
  const [activePhase, setActivePhase] = useState<DemoPhase>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedParagraphId, setSelectedParagraphId] = useState<string | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [selectedReviewItemId, setSelectedReviewItemId] = useState<string | null>(null);
  const [selectedBottomTab, setSelectedBottomTab] = useState<BottomTabId>("activity");
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState<boolean>(false);
  const [showValidationOverlay, setShowValidationOverlay] = useState<boolean>(false);
  const [showApprovalOverlay, setShowApprovalOverlay] = useState<boolean>(false);
  const [reviewedItems, setReviewedItems] = useState<Record<string, ReviewResolution>>({});
  const [approvedSections, setApprovedSections] = useState<Record<string, boolean>>({});
  const [editedParagraphs, setEditedParagraphs] = useState<Record<string, string>>({});
  const [published, setPublished] = useState<boolean>(false);
  const [simulationTick, setSimulationTick] = useState<number>(0);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const scenario = useMemo(() => getScenarioConfig(activeScenario), [activeScenario]);
  const segments = useMemo(() => generateActivitySegments(activeScenario), [activeScenario]);
  const curveData = useMemo(() => generateRigCurveData(activeScenario, segments), [activeScenario, segments]);
  const sources = useMemo(() => buildSourceStreams(scenario, segments), [scenario, segments]);
  const comments = useMemo(() => buildHumanComments(scenario), [scenario]);
  const alerts = useMemo(() => buildRealTimeAlerts(scenario), [scenario]);
  const events = useMemo(() => detectEventsFromSignals(scenario, segments, alerts), [scenario, segments, alerts]);
  const paragraphs = useMemo(() => buildGeneratedParagraphs(scenario, reviewedItems, editedParagraphs), [scenario, reviewedItems, editedParagraphs]);
  const sections = useMemo(() => buildDDRSections(paragraphs, approvedSections), [paragraphs, approvedSections]);
  const reviewQueue = useMemo(() => buildReviewQueue(scenario, reviewedItems), [scenario, reviewedItems]);
  const selectedParagraph = useMemo(
    () => paragraphs.find((paragraph) => paragraph.id === selectedParagraphId) ?? paragraphs.find((paragraph) => paragraph.id === scenario.selectedParagraphId) ?? paragraphs[0] ?? null,
    [paragraphs, scenario.selectedParagraphId, selectedParagraphId],
  );
  const selectedSource = useMemo(() => sources.find((source) => source.id === selectedSourceId) ?? null, [sources, selectedSourceId]);
  const selectedSegment = useMemo(
    () => segments.find((segment) => segment.id === selectedSegmentId) ?? segments.find((segment) => segment.id === scenario.selectedSegmentId) ?? segments[0] ?? null,
    [segments, scenario.selectedSegmentId, selectedSegmentId],
  );
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? events.find((event) => event.id === scenario.selectedEventId) ?? events[0] ?? null,
    [events, scenario.selectedEventId, selectedEventId],
  );
  const evidenceItems = useMemo(() => buildEvidenceForParagraph(selectedParagraph, scenario, sources, comments, alerts, segments), [selectedParagraph, scenario, sources, comments, alerts, segments]);
  const nptIntervals = useMemo(() => calculateNptCandidates(scenario, reviewedItems), [scenario, reviewedItems]);
  const structuredEvents = useMemo(() => buildStructuredEvents(scenario, reviewedItems, published), [scenario, reviewedItems, published]);
  const quality = useMemo(() => calculateReportQuality(scenario, sections, reviewQueue, reviewedItems), [scenario, sections, reviewQueue, reviewedItems]);
  const systemMetrics = useMemo(() => calculateSystemMetrics(scenario, quality, reviewQueue, structuredEvents), [scenario, quality, reviewQueue, structuredEvents]);
  const valueMetrics = useMemo(() => buildValueMetrics(scenario, systemMetrics), [scenario, systemMetrics]);
  const approvalState = useMemo(() => buildApprovalState(quality, sections, reviewQueue, published), [quality, sections, reviewQueue, published]);
  const traceEvents = useMemo(() => buildTraceEvents(scenario, reviewedItems, activePhase, published), [scenario, reviewedItems, activePhase, published]);
  const activitySplit = useMemo(() => calculateActivitySplit(segments), [segments]);
  const timeAlignment = useMemo(() => alignSourcesByTime(sources, segments), [sources, segments]);
  const depthAlignment = useMemo(() => alignSourcesByDepth(sources, segments), [sources, segments]);

  useEffect(() => {
    if (!autoPlay) return undefined;
    const timer = window.setInterval(() => {
      setSimulationTick((value) => value + 1);
      setActivePhase((phase) => safeDemoPhase(phase >= 10 ? 10 : phase + 1));
    }, 2200);
    return () => window.clearInterval(timer);
  }, [autoPlay]);

  useEffect(() => {
    const nextScenario = getScenarioConfig(activeScenario);
    setSelectedSourceId(null);
    setSelectedSegmentId(nextScenario.selectedSegmentId);
    setSelectedEventId(nextScenario.selectedEventId);
    setSelectedParagraphId(nextScenario.selectedParagraphId);
    setSelectedEvidenceId(null);
    setSelectedReviewItemId(nextScenario.selectedReviewItemId);
    setSelectedBottomTab("activity");
    setShowEvidenceDrawer(false);
    setShowValidationOverlay(false);
    setShowApprovalOverlay(false);
    setReviewedItems({});
    setApprovedSections({});
    setEditedParagraphs({});
    setPublished(false);
    setSimulationTick(0);
    setActivePhase(0);
  }, [activeScenario]);

  useEffect(() => {
    if (activePhase >= 5 && !selectedParagraphId) setSelectedParagraphId(scenario.selectedParagraphId);
    if (activePhase >= 6 && !selectedReviewItemId) setSelectedReviewItemId(scenario.selectedReviewItemId);
    if (activePhase >= 9) setShowApprovalOverlay(false);
  }, [activePhase, scenario.selectedParagraphId, scenario.selectedReviewItemId, selectedParagraphId, selectedReviewItemId]);

  const handleReset = () => {
    setActivePhase(0);
    setSimulationTick(0);
    setSelectedSourceId(null);
    setSelectedSegmentId(scenario.selectedSegmentId);
    setSelectedEventId(scenario.selectedEventId);
    setSelectedParagraphId(scenario.selectedParagraphId);
    setSelectedEvidenceId(null);
    setSelectedReviewItemId(scenario.selectedReviewItemId);
    setReviewedItems({});
    setApprovedSections({});
    setEditedParagraphs({});
    setPublished(false);
    setShowEvidenceDrawer(false);
    setShowValidationOverlay(false);
    setShowApprovalOverlay(false);
    setSelectedBottomTab("activity");
  };

  const handleScenarioChange = (scenarioId: ScenarioId) => {
    setActiveScenario(scenarioId);
  };

  const handleSourceClick = (source: SourceStream) => {
    setSelectedSourceId(source.id);
    setSelectedSegmentId(source.relatedSegmentIds[0] ?? scenario.selectedSegmentId);
    setSelectedParagraphId(source.relatedParagraphIds[0] ?? scenario.selectedParagraphId);
    setSelectedEventId(source.relatedEventIds[0] ?? scenario.selectedEventId);
    setSelectedEvidenceId(null);
    setSelectedBottomTab("traceability");
    setShowEvidenceDrawer(true);
  };

  const handleSegmentClick = (segment: ActivitySegment) => {
    setSelectedSegmentId(segment.id);
    setSelectedEventId(segment.eventIds[0] ?? scenario.selectedEventId);
    setSelectedParagraphId(segment.paragraphIds[0] ?? scenario.selectedParagraphId);
    setSelectedReviewItemId(segment.reviewItemIds[0] ?? scenario.selectedReviewItemId);
    setShowEvidenceDrawer(true);
  };

  const handleEventClick = (event: OperationalEvent) => {
    setSelectedEventId(event.id);
    setSelectedSegmentId(event.segmentId);
    setSelectedParagraphId(event.paragraphId);
    setSelectedReviewItemId(event.reviewItemId);
    setSelectedBottomTab(event.type === "nptCandidate" ? "npt" : "events");
    setShowEvidenceDrawer(true);
  };

  const handleCurvePointClick = (point: RigDataPoint) => {
    const segment = segments.find((item) => item.id === point.segmentId);
    setSelectedSegmentId(point.segmentId);
    setSelectedParagraphId(segment?.paragraphIds[0] ?? scenario.selectedParagraphId);
    setSelectedEventId(segment?.eventIds[0] ?? scenario.selectedEventId);
    setShowEvidenceDrawer(true);
  };

  const handleParagraphClick = (paragraph: DDRParagraph) => {
    setSelectedParagraphId(paragraph.id);
    setSelectedSegmentId(paragraph.segmentIds[0] ?? scenario.selectedSegmentId);
    setSelectedEventId(events.find((event) => event.paragraphId === paragraph.id)?.id ?? scenario.selectedEventId);
    setSelectedReviewItemId(paragraph.reviewItemIds[0] ?? null);
    setShowEvidenceDrawer(true);
  };

  const handleSourceChipClick = (chip: SourceChip, paragraph: DDRParagraph) => {
    setSelectedSourceId(chip.sourceId);
    setSelectedParagraphId(paragraph.id);
    setSelectedSegmentId(paragraph.segmentIds[0] ?? scenario.selectedSegmentId);
    setShowEvidenceDrawer(true);
    setSelectedBottomTab("traceability");
  };

  const handleEvidenceClick = (item: EvidenceItem) => {
    setSelectedEvidenceId(item.id);
    setSelectedSourceId(item.sourceId);
    setSelectedSegmentId(item.segmentId);
    setSelectedParagraphId(item.paragraphId);
  };

  const handleReviewItemClick = (item: ReviewQueueItem) => {
    setSelectedReviewItemId(item.id);
    setSelectedParagraphId(item.paragraphId);
    setSelectedSegmentId(item.segmentId);
    setSelectedEventId(item.eventId);
    setShowEvidenceDrawer(true);
    if (item.status === "open") setShowValidationOverlay(true);
  };

  const handleUncertaintyClick = (paragraph: DDRParagraph) => {
    const item = reviewQueue.find((candidate) => paragraph.reviewItemIds.includes(candidate.id)) ?? reviewQueue.find((candidate) => candidate.status === "open") ?? null;
    setSelectedParagraphId(paragraph.id);
    setSelectedReviewItemId(item?.id ?? null);
    setSelectedSegmentId(paragraph.segmentIds[0] ?? scenario.selectedSegmentId);
    setShowEvidenceDrawer(true);
    setShowValidationOverlay(Boolean(item));
  };

  const handleReviewAction = (item: ReviewQueueItem, action: ReviewActionType) => {
    const resolution = applyReviewAction(item, action);
    setReviewedItems((current) => ({ ...current, [item.id]: resolution }));
    setSelectedReviewItemId(item.id);
    setSelectedParagraphId(item.paragraphId);
    setSelectedSegmentId(item.segmentId);
    setSelectedEventId(item.eventId);
    setShowValidationOverlay(false);
    setShowEvidenceDrawer(true);
    setActivePhase((phase) => safeDemoPhase(Math.max(phase, 7)));

    if (action === "edit" || action === "addReviewerNote") {
      const paragraph = paragraphs.find((candidate) => candidate.id === item.paragraphId);
      const note = action === "edit" ? "Reviewer validated wording and retained source traceability." : "Reviewer note added; uncertainty remains auditable.";
      setEditedParagraphs((current) => ({
        ...current,
        [item.paragraphId]: `${paragraph?.body ?? item.description} ${note}`,
      }));
    }

    if (action === "approveDdr") {
      setShowApprovalOverlay(true);
    }
  };

  const handleSectionApprove = (sectionId: string) => {
    setApprovedSections((current) => ({ ...current, [sectionId]: true }));
    setActivePhase((phase) => safeDemoPhase(Math.max(phase, 7)));
  };

  const handleTraceClick = (event: TraceEvent) => {
    if (event.relatedSourceId) setSelectedSourceId(event.relatedSourceId);
    if (event.relatedSegmentId) setSelectedSegmentId(event.relatedSegmentId);
    if (event.relatedParagraphId) setSelectedParagraphId(event.relatedParagraphId);
    if (event.relatedReviewItemId) setSelectedReviewItemId(event.relatedReviewItemId);
    if (event.type === "memory") setSelectedBottomTab("events");
    if (event.type === "review") setSelectedBottomTab("quality");
    setShowEvidenceDrawer(true);
  };

  const handleStructuredEventClick = (event: StructuredEvent) => {
    setSelectedBottomTab("events");
    const sourceType = event.sources[0];
    const source = sources.find((candidate) => candidate.type === sourceType);
    if (source) setSelectedSourceId(source.id);
    const reviewItem = event.relatedReviewItemId ? reviewQueue.find((item) => item.id === event.relatedReviewItemId) : null;
    setSelectedReviewItemId(reviewItem?.id ?? null);
    setSelectedParagraphId(reviewItem?.paragraphId ?? selectedParagraph?.id ?? scenario.selectedParagraphId);
    setSelectedSegmentId(reviewItem?.segmentId ?? selectedSegment?.id ?? scenario.selectedSegmentId);
    setShowEvidenceDrawer(true);
  };

  const handleNptClick = (interval: NptInterval) => {
    const item = reviewQueue.find((candidate) => candidate.id === interval.relatedReviewItemId) ?? null;
    if (item) {
      setSelectedReviewItemId(item.id);
      setSelectedParagraphId(item.paragraphId);
      setSelectedSegmentId(item.segmentId);
      setSelectedEventId(item.eventId);
      setShowValidationOverlay(item.status === "open");
    }
    setSelectedBottomTab("npt");
    setShowEvidenceDrawer(true);
  };

  const handlePublish = () => {
    if (!approvalState.ready) {
      const requiredItems = reviewQueue.filter((item) => item.requiredForApproval && item.status !== "resolved");
      const updates = requiredItems.reduce<Record<string, ReviewResolution>>((acc, item) => {
        const action: ReviewActionType = item.id.includes("npt") || item.id.includes("mwd") ? "confirmNpt" : item.id.includes("connection") ? "markOperationalDelay" : "approve";
        acc[item.id] = applyReviewAction(item, action);
        return acc;
      }, {});
      setReviewedItems((current) => ({ ...current, ...updates }));
      setApprovedSections((current) => sections.reduce<Record<string, boolean>>((acc, section) => ({ ...acc, [section.id]: true }), current));
    }
    setPublished(true);
    setActivePhase(10);
    setSelectedBottomTab("events");
  };

  const selectedValidationItem = showValidationOverlay ? reviewQueue.find((item) => item.id === selectedReviewItemId) ?? null : null;
  const selectedValidationParagraph = selectedValidationItem ? paragraphs.find((paragraph) => paragraph.id === selectedValidationItem.paragraphId) ?? selectedParagraph : selectedParagraph;
  const selectedEventIdForRender = selectedEvent?.id ?? scenario.selectedEventId;
  const selectedSegmentIdForRender = selectedSegment?.id ?? scenario.selectedSegmentId;
  const phaseText = PHASES[activePhase]?.label ?? "Living final state";

  return (
    <div ref={rootRef} className="relative min-h-screen overflow-hidden bg-[#f6f8fb] text-slate-900">
      <style>{`
        .pp-grid-glow {
          background-image:
            radial-gradient(circle at 10% 10%, rgba(6,182,212,.12), transparent 28%),
            radial-gradient(circle at 90% 4%, rgba(37,99,235,.10), transparent 30%),
            radial-gradient(circle at 72% 92%, rgba(124,58,237,.09), transparent 30%),
            linear-gradient(to right, rgba(148,163,184,.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148,163,184,.18) 1px, transparent 1px);
          background-size: auto, auto, auto, 36px 36px, 36px 36px;
        }
        @keyframes ppFloat {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: .55; }
          50% { transform: translate3d(12px, -8px, 0); opacity: 1; }
        }
        @keyframes ppScan {
          0% { transform: translateX(-35%); opacity: 0; }
          20% { opacity: .75; }
          100% { transform: translateX(135%); opacity: 0; }
        }
        .pp-scan::after {
          content: "";
          position: absolute;
          inset: 0;
          width: 35%;
          background: linear-gradient(90deg, transparent, rgba(6,182,212,.16), transparent);
          animation: ppScan 3.8s ease-in-out infinite;
        }
        .pp-float-soft { animation: ppFloat 8s ease-in-out infinite; }
      `}</style>
      <div className="absolute inset-0 pp-grid-glow" />
      <div className="pp-float-soft absolute left-12 top-32 h-64 w-64 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="absolute bottom-10 right-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

      <Header
        scenario={scenario}
        well={WELL_CONTEXT}
        activePhase={activePhase}
        autoPlay={autoPlay}
        onToggleAutoplay={() => setAutoPlay((value) => !value)}
        onReset={handleReset}
        onScenarioChange={handleScenarioChange}
        systemMetrics={systemMetrics}
      />

      <main className="relative z-10 grid h-[calc(100vh-128px)] grid-cols-[320px_minmax(640px,1fr)_430px] grid-rows-[minmax(0,1fr)_350px] gap-3 p-4">
        <SourceStreamPanel
          sources={sources}
          selectedSourceId={selectedSourceId}
          selectedParagraphId={selectedParagraph?.id ?? null}
          activePhase={activePhase}
          onSourceClick={handleSourceClick}
        />

        <TimeDepthReconstruction
          scenario={scenario}
          segments={segments}
          curveData={curveData}
          events={events}
          selectedSegmentId={selectedSegmentIdForRender}
          selectedSourceId={selectedSourceId}
          selectedEventId={selectedEventIdForRender}
          activePhase={activePhase}
          onSegmentClick={handleSegmentClick}
          onEventClick={handleEventClick}
          onCurvePointClick={handleCurvePointClick}
        />

        <DDRDraftPanel
          scenario={scenario}
          sections={sections}
          selectedParagraphId={selectedParagraph?.id ?? null}
          selectedSourceId={selectedSourceId}
          activePhase={activePhase}
          onSectionApprove={handleSectionApprove}
          onParagraphClick={handleParagraphClick}
          onSourceChipClick={handleSourceChipClick}
          onUncertaintyClick={handleUncertaintyClick}
        />

        <div className="col-span-3 grid min-h-0 grid-cols-[320px_minmax(620px,1fr)_430px] gap-3">
          <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
            <AIInsightPanel scenario={scenario} selectedSource={selectedSource} selectedParagraph={selectedParagraph} selectedSegment={selectedSegment} />
            <EventStream traceEvents={traceEvents} onTraceClick={handleTraceClick} />
          </div>

          <BottomAnalyticsDeck
            selectedTab={selectedBottomTab}
            onTabChange={setSelectedBottomTab}
            activitySplit={activitySplit}
            nptIntervals={nptIntervals}
            sections={sections}
            structuredEvents={structuredEvents}
            quality={quality}
            systemMetrics={systemMetrics}
            onStructuredEventClick={handleStructuredEventClick}
            onNptClick={handleNptClick}
          />

          <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto_auto] gap-3">
            <ReviewQueuePanel
              reviewQueue={reviewQueue}
              selectedReviewItemId={selectedReviewItemId}
              onReviewItemClick={handleReviewItemClick}
              onAction={handleReviewAction}
            />
            <ValueMetrics metrics={valueMetrics} />
            <GovernancePanel />
          </div>
        </div>
      </main>

      <div className="pointer-events-none fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-[11px] font-bold text-slate-600 shadow-xl backdrop-blur-xl">
        <span>Phase {activePhase}/10</span>
        <ChevronRight className="mx-1 inline h-3 w-3" />
        <span>{phaseText}</span>
        <ChevronRight className="mx-1 inline h-3 w-3" />
        <span>tick {simulationTick}</span>
        <ChevronRight className="mx-1 inline h-3 w-3" />
        <span>time/depth aligned sources {timeAlignment.length}/{depthAlignment.length}</span>
      </div>

      <EvidenceDrawer
        open={showEvidenceDrawer}
        paragraph={selectedParagraph}
        evidenceItems={evidenceItems}
        selectedEvidenceId={selectedEvidenceId}
        onClose={() => setShowEvidenceDrawer(false)}
        onEvidenceClick={handleEvidenceClick}
      />

      <ValidationOverlay
        item={selectedValidationItem}
        paragraph={selectedValidationParagraph}
        evidenceItems={evidenceItems}
        onClose={() => setShowValidationOverlay(false)}
        onAction={handleReviewAction}
      />

      <ApprovalOverlay
        open={showApprovalOverlay}
        approvalState={approvalState}
        structuredEvents={structuredEvents}
        onClose={() => setShowApprovalOverlay(false)}
        onPublish={handlePublish}
      />

    </div>
  );
}
