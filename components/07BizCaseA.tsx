import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Cloud,
  Cpu,
  Database,
  Eye,
  FileCheck2,
  FileText,
  Gauge,
  HardHat,
  History,
  Info,
  Layers,
  Link2,
  Lock,
  MapPin,
  MessageSquareText,
  Pause,
  Play,
  Radio,
  RefreshCcw,
  Route,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  UserCheck,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

type ScenarioId =
  | 'hot-oil-startup'
  | 'compressor-isolation'
  | 'pressure-purge'
  | 'valve-verification'
  | 'emergency-gas'
  | 'missing-context'
  | 'document-conflict';

type PhaseId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type RiskLevel = 'Informational' | 'Controlled' | 'Requires Validation' | 'Critical Emergency';
type ProcedureType = 'startup' | 'isolation' | 'purge' | 'verification' | 'emergency' | 'abnormal' | 'generic';
type ApprovalStatus = 'current-approved' | 'reference-only' | 'needs-validation' | 'obsolete' | 'conflicting-current';
type DocumentStatus = 'current' | 'reference' | 'needs-validation' | 'replaced' | 'conflicting';
type Criticality = 'low' | 'medium' | 'high' | 'critical';
type Tone = 'slate' | 'blue' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';
type AssetVisualMode = 'furnace' | 'compressor' | 'pressure-line' | 'manifold' | 'gas-line' | 'unknown';
type TraceStatus = 'queued' | 'running' | 'complete' | 'blocked' | 'escalated';
type ChecklistCategory = 'context' | 'permit' | 'loto' | 'pressure' | 'communication' | 'document' | 'emergency';
type GateAction = 'guidance-available' | 'requires-escalation' | 'blocked' | 'emergency-protocol';
type EscalationStatus = 'not-required' | 'available' | 'sent' | 'acknowledged' | 'mandatory';
type TelemetryKind = 'pressure' | 'temperature' | 'flow' | 'gas' | 'vibration' | 'status';

type IconType = React.ComponentType<{ className?: string }>;

interface PhaseDefinition {
  id: PhaseId;
  shortLabel: string;
  label: string;
  detail: string;
  icon: IconType;
  tone: Tone;
}

interface ToneStyle {
  text: string;
  border: string;
  bg: string;
  soft: string;
  ring: string;
  dot: string;
  gradient: string;
}

interface RiskStyle extends ToneStyle {
  label: string;
  compact: string;
}

interface TelemetryPoint {
  id: string;
  label: string;
  value: string;
  unit: string;
  kind: TelemetryKind;
  status: 'normal' | 'watch' | 'alarm';
  x: number;
  y: number;
  relatedProcedures: string[];
}

interface AssetContext {
  id: string;
  tag: string;
  name: string;
  type: string;
  installation: string;
  area: string;
  system: string;
  currentState: string;
  lastMaintenanceRelease: string;
  riskProfile: string;
  operator: string;
  shift: string;
  connectivity: 'online' | 'limited' | 'offline';
  qrStatus: 'verified' | 'missing' | 'manual';
  controlRoomLink: 'available' | 'required' | 'emergency';
  visualMode: AssetVisualMode;
  telemetry: TelemetryPoint[];
}

interface ProcedureSection {
  id: string;
  section: string;
  title: string;
  excerpt: string;
  steps: string[];
  warnings: string[];
  prerequisites: string[];
}

interface ProcedureDocument {
  id: string;
  code: string;
  title: string;
  version: string;
  effectiveDate: string;
  approvalStatus: ApprovalStatus;
  owner: string;
  assetTypes: string[];
  systems: string[];
  procedureType: ProcedureType;
  criticality: Criticality;
  sections: ProcedureSection[];
  replacedBy?: string;
  isPrimary: boolean;
  relevanceScore: number;
  status: DocumentStatus;
  relatedProcedures: string[];
}

interface RankedProcedureDocument extends ProcedureDocument {
  rankScore: number;
  matchReason: string;
  usedForGuidance: boolean;
}

interface OperatorQuestion {
  id: string;
  scenario: ScenarioId;
  text: string;
  intent: ProcedureType;
  missingContext: boolean;
  riskKeywords: string[];
}

interface Citation {
  id: string;
  docId: string;
  docCode: string;
  documentTitle: string;
  section: string;
  excerpt: string;
  answerBlockId: string;
  confidence: number;
  usedForGuidance: boolean;
}

interface GuidedStepSeed {
  label: string;
  detail: string;
  docCode: string;
  section: string;
  tone?: Tone;
}

interface GuidedStep {
  id: string;
  index: number;
  label: string;
  detail: string;
  citations: Citation[];
  tone: Tone;
  required: boolean;
  blockedBy?: string;
}

interface AssistantAnswer {
  id: string;
  summary: string;
  mode: 'normal' | 'missing-context' | 'emergency' | 'conflict';
  guidedSteps: GuidedStep[];
  prerequisites: string[];
  warnings: string[];
  citations: Citation[];
  requiredEscalation: boolean;
  forbiddenActions: string[];
  confidence: number;
  answerTone: Tone;
}

interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  checked: boolean;
  source: string;
  category: ChecklistCategory;
  blocksExecutionIfMissing: boolean;
}

interface SafetyGate {
  id: string;
  riskLevel: RiskLevel;
  action: GateAction;
  confidence: number;
  guidanceAvailable: boolean;
  executionAuthorized: boolean;
  requiresSupervisor: boolean;
  requiresPermit: boolean;
  requiresLoto: boolean;
  requiresControlRoom: boolean;
  emergencyMode: boolean;
  reason: string;
  blockers: string[];
  readinessScore: number;
  requiredContext: string[];
  compactStatus: string;
}

interface TraceEvent {
  id: string;
  timestamp: string;
  label: string;
  detail: string;
  status: TraceStatus;
  phase: PhaseId;
  source?: string;
}

interface SupervisorEscalation {
  id: string;
  recipient: string;
  channel: string;
  status: EscalationStatus;
  asset: string;
  procedure: string;
  riskLevel: RiskLevel;
  summary: string;
  includedSources: string[];
  checklistStatus: string;
}

interface ValueMetric {
  id: string;
  label: string;
  before: string;
  after: string;
  delta: string;
  tone: Tone;
}

interface SystemMetrics {
  searchTimeBeforeMin: number;
  searchTimeAfterSec: number;
  procedureVersionConfidence: number;
  supervisorCallsAvoidedPct: number;
  checklistOmissionsReducedPct: number;
  traceabilityCoveragePct: number;
  repeatedQuestionsThisMonth: number;
  trainingAccelerationPct: number;
  decisionLatencyReductionPct: number;
  dominantConstraint: string;
  riskEmphasis: string;
  primaryOutcome: string;
}

interface ScenarioConfig {
  id: ScenarioId;
  title: string;
  compactTitle: string;
  question: OperatorQuestion;
  alternateQuestions: OperatorQuestion[];
  assetId: string;
  contextComplete: boolean;
  sourceDocumentCodes: string[];
  riskLevel: RiskLevel;
  procedureType: ProcedureType;
  safetySummary: string;
  businessValue: string;
  answerProfile: {
    summary: string;
    guidedSteps: GuidedStepSeed[];
    prerequisites: string[];
    warnings: string[];
    forbiddenActions: string[];
  };
  checklist: ChecklistItem[];
  valueDeltas: Partial<SystemMetrics>;
  conflictMode?: 'none' | 'obsolete-found' | 'current-conflict';
}

interface GateClickPayload {
  label: string;
  detail: string;
  tone: Tone;
}

const PLUSPETROL_LOGO_URL = 'https://images.aiworkify.com/pluspetrol-project/pluspetrol-isologo.png';

const PHASES: PhaseDefinition[] = [
  { id: 0, shortLabel: 'Field', label: 'Field context', detail: 'The operator is at the asset and scans the field tag.', icon: MapPin, tone: 'blue' },
  { id: 1, shortLabel: 'Context', label: 'Context detected', detail: 'Asset, area, system, shift, and connectivity are validated.', icon: BadgeCheck, tone: 'cyan' },
  { id: 2, shortLabel: 'Question', label: 'Question received', detail: 'Natural-language intent is mapped to a procedure type.', icon: MessageSquareText, tone: 'violet' },
  { id: 3, shortLabel: 'Retrieve', label: 'Documents retrieved', detail: 'Controlled procedures, P&IDs, checklists, and standards are matched.', icon: Search, tone: 'blue' },
  { id: 4, shortLabel: 'Version', label: 'Versions validated', detail: 'Current approved documents are preferred; obsolete sources are separated.', icon: FileCheck2, tone: 'emerald' },
  { id: 5, shortLabel: 'Safety', label: 'Safety gate evaluated', detail: 'Risk, permits, LOTO, control room coordination, and emergency boundaries are checked.', icon: ShieldAlert, tone: 'amber' },
  { id: 6, shortLabel: 'Answer', label: 'Guidance generated', detail: 'The assistant summarizes the official sequence without authorizing execution.', icon: Sparkles, tone: 'violet' },
  { id: 7, shortLabel: 'Cite', label: 'Citations attached', detail: 'Every material instruction is tied to document, version, section, and excerpt.', icon: Link2, tone: 'cyan' },
  { id: 8, shortLabel: 'Human', label: 'Supervisor path available', detail: 'High-risk or conflicting situations create an escalation package.', icon: UserCheck, tone: 'amber' },
  { id: 9, shortLabel: 'Trace', label: 'Consultation logged', detail: 'The consultation is recorded with asset, question, documents, and risk state.', icon: History, tone: 'emerald' },
  { id: 10, shortLabel: 'Ready', label: 'Decision support complete', detail: 'The operator has official context, boundaries, citations, and traceability.', icon: CheckCircle2, tone: 'emerald' },
];

const TONE_STYLES: Record<Tone, ToneStyle> = {
  slate: {
    text: 'text-slate-700',
    border: 'border-slate-200',
    bg: 'bg-slate-50',
    soft: 'bg-slate-500/10',
    ring: 'ring-slate-200',
    dot: 'bg-slate-400',
    gradient: 'from-slate-100 to-white',
  },
  blue: {
    text: 'text-blue-700',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    soft: 'bg-blue-500/10',
    ring: 'ring-blue-200',
    dot: 'bg-blue-500',
    gradient: 'from-blue-50 to-white',
  },
  cyan: {
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    bg: 'bg-cyan-50',
    soft: 'bg-cyan-500/10',
    ring: 'ring-cyan-200',
    dot: 'bg-cyan-500',
    gradient: 'from-cyan-50 to-white',
  },
  emerald: {
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    soft: 'bg-emerald-500/10',
    ring: 'ring-emerald-200',
    dot: 'bg-emerald-500',
    gradient: 'from-emerald-50 to-white',
  },
  amber: {
    text: 'text-amber-700',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    soft: 'bg-amber-500/10',
    ring: 'ring-amber-200',
    dot: 'bg-amber-500',
    gradient: 'from-amber-50 to-white',
  },
  rose: {
    text: 'text-rose-700',
    border: 'border-rose-200',
    bg: 'bg-rose-50',
    soft: 'bg-rose-500/10',
    ring: 'ring-rose-200',
    dot: 'bg-rose-500',
    gradient: 'from-rose-50 to-white',
  },
  violet: {
    text: 'text-violet-700',
    border: 'border-violet-200',
    bg: 'bg-violet-50',
    soft: 'bg-violet-500/10',
    ring: 'ring-violet-200',
    dot: 'bg-violet-500',
    gradient: 'from-violet-50 to-white',
  },
};


const TONE_HEX: Record<Tone, string> = {
  slate: '#94a3b8',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  violet: '#8b5cf6',
};

const RISK_STYLES: Record<RiskLevel, RiskStyle> = {
  Informational: {
    ...TONE_STYLES.blue,
    label: 'Informational',
    compact: 'Reference guidance',
  },
  Controlled: {
    ...TONE_STYLES.emerald,
    label: 'Controlled',
    compact: 'Controlled maneuver',
  },
  'Requires Validation': {
    ...TONE_STYLES.amber,
    label: 'Requires validation',
    compact: 'Human validation required',
  },
  'Critical Emergency': {
    ...TONE_STYLES.rose,
    label: 'Critical emergency',
    compact: 'Emergency protocol only',
  },
};

const BASE_METRICS: SystemMetrics = {
  searchTimeBeforeMin: 18,
  searchTimeAfterSec: 45,
  procedureVersionConfidence: 100,
  supervisorCallsAvoidedPct: 32,
  checklistOmissionsReducedPct: 41,
  traceabilityCoveragePct: 100,
  repeatedQuestionsThisMonth: 18,
  trainingAccelerationPct: 22,
  decisionLatencyReductionPct: 74,
  dominantConstraint: 'Document search friction',
  riskEmphasis: 'Version certainty',
  primaryOutcome: 'Faster procedure confidence',
};

const ASSETS: AssetContext[] = [
  {
    id: 'asset-hof-204',
    tag: 'HOF-204',
    name: 'Hot Oil Furnace',
    type: 'Hot oil furnace',
    installation: 'Loma Campana CPF',
    area: 'Utilities West Pad',
    system: 'Hot Oil Loop B',
    currentState: 'Maintenance release pending startup',
    lastMaintenanceRelease: 'WO-77841 · Released 2026-04-28 18:20',
    riskProfile: 'Burner management, hot surfaces, thermal expansion',
    operator: 'M. Silva',
    shift: 'Day shift · Crew B',
    connectivity: 'online',
    qrStatus: 'verified',
    controlRoomLink: 'available',
    visualMode: 'furnace',
    telemetry: [
      { id: 'hof-temp', label: 'Jacket temp', value: '62', unit: '°C', kind: 'temperature', status: 'watch', x: 68, y: 37, relatedProcedures: ['PO-HO-022', 'CK-HO-014'] },
      { id: 'hof-flow', label: 'Loop flow', value: '0', unit: 'm³/h', kind: 'flow', status: 'normal', x: 38, y: 63, relatedProcedures: ['PO-HO-022'] },
      { id: 'hof-status', label: 'Burner state', value: 'Locked', unit: '', kind: 'status', status: 'normal', x: 53, y: 25, relatedProcedures: ['HSE-LOTO-010'] },
    ],
  },
  {
    id: 'asset-cmp-102',
    tag: 'C-102',
    name: 'Compressor',
    type: 'Gas compressor',
    installation: 'Gas Plant Norte',
    area: 'Compression Train A',
    system: 'Fuel Gas Compression',
    currentState: 'Standby after process trip',
    lastMaintenanceRelease: 'WO-78190 · Intervention scope active',
    riskProfile: 'Stored pressure, rotating equipment, electrical energy',
    operator: 'A. Rojas',
    shift: 'Night shift · Crew C',
    connectivity: 'online',
    qrStatus: 'verified',
    controlRoomLink: 'required',
    visualMode: 'compressor',
    telemetry: [
      { id: 'cmp-pressure', label: 'Suction pressure', value: '18.4', unit: 'bar', kind: 'pressure', status: 'watch', x: 24, y: 54, relatedProcedures: ['PO-CMP-014', 'PID-GAS-221'] },
      { id: 'cmp-vibration', label: 'Vibration', value: '1.8', unit: 'mm/s', kind: 'vibration', status: 'normal', x: 59, y: 47, relatedProcedures: ['PO-CMP-014'] },
      { id: 'cmp-loto', label: 'LOTO state', value: 'Not applied', unit: '', kind: 'status', status: 'watch', x: 74, y: 32, relatedProcedures: ['HSE-LOTO-010'] },
    ],
  },
  {
    id: 'asset-pl-77a',
    tag: 'PL-77A',
    name: 'Pressure Line',
    type: 'Pressure line',
    installation: 'Bajada del Palo Oeste',
    area: 'Wellpad 7 Gathering',
    system: 'Condensate Transfer',
    currentState: 'Pressurized and ready for purge planning',
    lastMaintenanceRelease: 'WO-77622 · Permit requested',
    riskProfile: 'Pressure release, gas exposure, ignition control',
    operator: 'L. Medina',
    shift: 'Day shift · Crew A',
    connectivity: 'limited',
    qrStatus: 'manual',
    controlRoomLink: 'required',
    visualMode: 'pressure-line',
    telemetry: [
      { id: 'pl-pressure', label: 'Line pressure', value: '43.8', unit: 'bar', kind: 'pressure', status: 'watch', x: 49, y: 49, relatedProcedures: ['PO-PRS-031', 'ER-OPS-004'] },
      { id: 'pl-gas', label: 'Gas reading', value: '0', unit: '%LEL', kind: 'gas', status: 'normal', x: 70, y: 37, relatedProcedures: ['HSE-GAS-009'] },
      { id: 'pl-flow', label: 'Flow', value: '0.2', unit: 'm³/h', kind: 'flow', status: 'normal', x: 28, y: 62, relatedProcedures: ['PO-PRS-031'] },
    ],
  },
  {
    id: 'asset-mf-12',
    tag: 'MF-12',
    name: 'Valve Manifold',
    type: 'Valve manifold',
    installation: 'La Calera Battery',
    area: 'Manifold Deck',
    system: 'Production Routing',
    currentState: 'Circuit disabled pending valve verification',
    lastMaintenanceRelease: 'No active maintenance release',
    riskProfile: 'Misrouting, backflow, unexpected pressure',
    operator: 'J. Paredes',
    shift: 'Day shift · Crew D',
    connectivity: 'online',
    qrStatus: 'verified',
    controlRoomLink: 'available',
    visualMode: 'manifold',
    telemetry: [
      { id: 'mf-v12', label: 'V-12', value: 'Closed', unit: '', kind: 'status', status: 'normal', x: 30, y: 41, relatedProcedures: ['CK-MAN-006', 'PID-MF-12'] },
      { id: 'mf-v18', label: 'V-18', value: 'Open', unit: '', kind: 'status', status: 'watch', x: 60, y: 52, relatedProcedures: ['PO-MAN-018'] },
      { id: 'mf-pressure', label: 'Header pressure', value: '12.1', unit: 'bar', kind: 'pressure', status: 'normal', x: 78, y: 31, relatedProcedures: ['PID-MF-12'] },
    ],
  },
  {
    id: 'asset-gl-44',
    tag: 'GL-44',
    name: 'Gas Line',
    type: 'Gas line',
    installation: 'Gas Plant Norte',
    area: 'Metering Skid East',
    system: 'High Pressure Gas Export',
    currentState: 'Abnormal pressure trend reported',
    lastMaintenanceRelease: 'No maintenance release · abnormal condition',
    riskProfile: 'Gas release, overpressure, immediate escalation',
    operator: 'R. Fuentes',
    shift: 'Night shift · Crew C',
    connectivity: 'online',
    qrStatus: 'verified',
    controlRoomLink: 'emergency',
    visualMode: 'gas-line',
    telemetry: [
      { id: 'gl-pressure', label: 'Line pressure', value: '68.2', unit: 'bar', kind: 'pressure', status: 'alarm', x: 47, y: 42, relatedProcedures: ['ER-GAS-001', 'PO-ABN-012'] },
      { id: 'gl-gas', label: 'Gas reading', value: '12', unit: '%LEL', kind: 'gas', status: 'alarm', x: 64, y: 56, relatedProcedures: ['ER-GAS-001'] },
      { id: 'gl-flow', label: 'Flow instability', value: 'High', unit: '', kind: 'flow', status: 'alarm', x: 27, y: 33, relatedProcedures: ['PO-ABN-012'] },
    ],
  },
  {
    id: 'asset-unknown',
    tag: 'Unknown tag',
    name: 'Equipment not identified',
    type: 'Unknown asset',
    installation: 'Not confirmed',
    area: 'Not confirmed',
    system: 'Not confirmed',
    currentState: 'Insufficient context',
    lastMaintenanceRelease: 'Not available',
    riskProfile: 'Procedure cannot be selected safely',
    operator: 'M. Silva',
    shift: 'Day shift · Crew B',
    connectivity: 'online',
    qrStatus: 'missing',
    controlRoomLink: 'available',
    visualMode: 'unknown',
    telemetry: [
      { id: 'unknown-context', label: 'Asset context', value: 'Missing', unit: '', kind: 'status', status: 'watch', x: 50, y: 50, relatedProcedures: ['OPS-GEN-001'] },
    ],
  },
];

const PROCEDURE_DOCUMENTS: ProcedureDocument[] = [
  {
    id: 'doc-po-ho-022',
    code: 'PO-HO-022',
    title: 'Hot Oil Furnace Startup After Maintenance',
    version: 'v5.4',
    effectiveDate: '2026-01-18',
    approvalStatus: 'current-approved',
    owner: 'Operations Engineering',
    assetTypes: ['Hot oil furnace'],
    systems: ['Hot Oil Loop B', 'Utilities'],
    procedureType: 'startup',
    criticality: 'medium',
    isPrimary: true,
    relevanceScore: 96,
    status: 'current',
    relatedProcedures: ['CK-HO-014', 'HSE-LOTO-010'],
    sections: [
      {
        id: 'po-ho-022-4-1',
        section: '4.1',
        title: 'Pre-start authorization and maintenance release',
        excerpt: 'Startup after maintenance shall begin only after maintenance release is recorded, pre-start checklist is complete, and the control room confirms readiness.',
        steps: ['Confirm maintenance release and work order closure.', 'Review active inhibits and burner management status.', 'Coordinate pre-start notice with the control room.'],
        warnings: ['Do not energize the burner management system with open maintenance locks.'],
        prerequisites: ['Maintenance handover accepted', 'Pre-start checklist available', 'Control room link confirmed'],
      },
      {
        id: 'po-ho-022-5-3',
        section: '5.3',
        title: 'Controlled return to service',
        excerpt: 'Return the hot oil furnace to service using the approved sequence: verify circulation, confirm permissives, release energy isolation, initiate purge, and start burner under control room observation.',
        steps: ['Verify circulation path and expansion tank level.', 'Confirm permissive status and release approved isolation.', 'Initiate purge cycle before burner start.', 'Start burner under control room observation.'],
        warnings: ['Do not bypass furnace purge or flame safeguard interlocks.'],
        prerequisites: ['Circulation path confirmed', 'Permissives healthy', 'Authorized isolation release'],
      },
    ],
  },
  {
    id: 'doc-ck-ho-014',
    code: 'CK-HO-014',
    title: 'Hot Oil Furnace Pre-start Checklist',
    version: 'v2.1',
    effectiveDate: '2025-11-07',
    approvalStatus: 'current-approved',
    owner: 'Field Operations',
    assetTypes: ['Hot oil furnace'],
    systems: ['Hot Oil Loop B'],
    procedureType: 'startup',
    criticality: 'medium',
    isPrimary: false,
    relevanceScore: 91,
    status: 'current',
    relatedProcedures: ['PO-HO-022'],
    sections: [
      {
        id: 'ck-ho-014-2',
        section: '2',
        title: 'Pre-start field checks',
        excerpt: 'The operator shall verify circulation valves, expansion tank level, burner enclosure condition, purge path, and field communication before startup.',
        steps: ['Verify circulation valve line-up.', 'Confirm expansion tank level is within operating range.', 'Confirm radio or control room channel is available.'],
        warnings: ['Checklist completion does not authorize startup without the approved procedure.'],
        prerequisites: ['Asset tag confirmed', 'Checklist printed or available on device'],
      },
    ],
  },
  {
    id: 'doc-hse-loto-010',
    code: 'HSE-LOTO-010',
    title: 'Energy Isolation Release and Lockout / Tagout Standard',
    version: 'v9.0',
    effectiveDate: '2026-03-01',
    approvalStatus: 'current-approved',
    owner: 'HSE',
    assetTypes: ['Gas compressor', 'Hot oil furnace', 'Pressure line', 'Valve manifold'],
    systems: ['Fuel Gas Compression', 'Hot Oil Loop B', 'Condensate Transfer', 'Production Routing'],
    procedureType: 'isolation',
    criticality: 'high',
    isPrimary: false,
    relevanceScore: 94,
    status: 'current',
    relatedProcedures: ['PO-CMP-014', 'PO-HO-022', 'PO-PRS-031'],
    sections: [
      {
        id: 'hse-loto-010-3-4',
        section: '3.4',
        title: 'Authorized isolation verification',
        excerpt: 'Isolation removal or application must be performed by authorized personnel and independently verified before equipment is returned to operation or released for intervention.',
        steps: ['Identify all energy sources.', 'Apply or remove locks only under authorization.', 'Record independent verification before continuation.'],
        warnings: ['Never bypass lockout/tagout for schedule recovery.'],
        prerequisites: ['Authorized person present', 'Permit or work order linked'],
      },
      {
        id: 'hse-loto-010-6-2',
        section: '6.2',
        title: 'Stored energy confirmation',
        excerpt: 'Stored pressure, electrical energy, hydraulic energy, and thermal energy shall be verified as controlled before the field team proceeds.',
        steps: ['Verify zero energy state where required.', 'Confirm pressure bleed-down on indicated points.', 'Record verification in the isolation log.'],
        warnings: ['Residual pressure requires stopping the maneuver and escalation.'],
        prerequisites: ['Isolation plan approved', 'Verification equipment available'],
      },
    ],
  },
  {
    id: 'doc-po-cmp-014',
    code: 'PO-CMP-014',
    title: 'Compressor Isolation Procedure',
    version: 'v7.2',
    effectiveDate: '2026-02-14',
    approvalStatus: 'current-approved',
    owner: 'Operations Engineering',
    assetTypes: ['Gas compressor'],
    systems: ['Fuel Gas Compression'],
    procedureType: 'isolation',
    criticality: 'high',
    isPrimary: true,
    relevanceScore: 98,
    status: 'current',
    relatedProcedures: ['HSE-LOTO-010', 'PID-GAS-221'],
    sections: [
      {
        id: 'po-cmp-014-5-2',
        section: '5.2',
        title: 'Isolation before intervention',
        excerpt: 'Before intervention, the compressor must be isolated according to the approved sequence, depressurized to the defined safe condition, and verified by authorized personnel prior to maintenance handover.',
        steps: ['Confirm work order and intervention scope.', 'Notify control room and shift supervisor.', 'Stop compressor and verify alarms.', 'Apply approved isolation sequence.', 'Confirm pressure bleed-down to safe condition.', 'Verify LOTO with authorized personnel.'],
        warnings: ['Do not continue if residual pressure remains above the defined safe condition.'],
        prerequisites: ['Supervisor validation', 'Permit status confirmed', 'Control room coordination', 'LOTO personnel available'],
      },
      {
        id: 'po-cmp-014-6-1',
        section: '6.1',
        title: 'Maintenance handover',
        excerpt: 'Maintenance handover is permitted only after isolation, pressure verification, gas test confirmation, and checklist sign-off are recorded.',
        steps: ['Complete isolation-ready checklist.', 'Attach verification values to the work order.', 'Hand over to maintenance lead after authorization.'],
        warnings: ['Field assistant guidance does not constitute handover approval.'],
        prerequisites: ['Verified isolation', 'Documented gas test', 'Supervisor sign-off'],
      },
    ],
  },
  {
    id: 'doc-po-cmp-011',
    code: 'PO-CMP-011',
    title: 'Legacy Compressor Isolation Instruction',
    version: 'v4.8',
    effectiveDate: '2024-08-30',
    approvalStatus: 'obsolete',
    owner: 'Operations Engineering',
    assetTypes: ['Gas compressor'],
    systems: ['Fuel Gas Compression'],
    procedureType: 'isolation',
    criticality: 'high',
    isPrimary: false,
    relevanceScore: 72,
    status: 'replaced',
    replacedBy: 'PO-CMP-014',
    relatedProcedures: ['PO-CMP-014'],
    sections: [
      {
        id: 'po-cmp-011-4-2',
        section: '4.2',
        title: 'Legacy isolation sequence',
        excerpt: 'This legacy instruction is replaced by PO-CMP-014 and shall not be used as primary guidance for compressor isolation.',
        steps: ['Do not use as operating guidance.', 'Refer to PO-CMP-014.'],
        warnings: ['Obsolete procedure found for traceability only.'],
        prerequisites: ['Current procedure validation'],
      },
    ],
  },
  {
    id: 'doc-pid-gas-221',
    code: 'PID-GAS-221',
    title: 'Compressor Train A P&ID',
    version: 'rev 14',
    effectiveDate: '2026-01-26',
    approvalStatus: 'reference-only',
    owner: 'Process Engineering',
    assetTypes: ['Gas compressor', 'Gas line'],
    systems: ['Fuel Gas Compression', 'High Pressure Gas Export'],
    procedureType: 'generic',
    criticality: 'medium',
    isPrimary: false,
    relevanceScore: 87,
    status: 'reference',
    relatedProcedures: ['PO-CMP-014'],
    sections: [
      {
        id: 'pid-gas-221-c102',
        section: 'C-102',
        title: 'Isolation points and pressure indicators',
        excerpt: 'P&ID reference for C-102 identifies upstream and downstream isolation points, bleed connection, and pressure indicator locations.',
        steps: ['Use to identify equipment boundaries only.', 'Confirm field tags match P&ID references.'],
        warnings: ['P&ID is a reference and does not replace the operating procedure.'],
        prerequisites: ['Field tag verification'],
      },
    ],
  },
  {
    id: 'doc-po-prs-031',
    code: 'PO-PRS-031',
    title: 'Pressure System Purge Procedure',
    version: 'v6.0',
    effectiveDate: '2026-02-03',
    approvalStatus: 'current-approved',
    owner: 'Operations Engineering',
    assetTypes: ['Pressure line'],
    systems: ['Condensate Transfer'],
    procedureType: 'purge',
    criticality: 'high',
    isPrimary: true,
    relevanceScore: 97,
    status: 'current',
    relatedProcedures: ['HSE-GAS-009', 'ER-OPS-004'],
    sections: [
      {
        id: 'po-prs-031-5',
        section: '5',
        title: 'Controlled purge preparation',
        excerpt: 'Purge activity requires pressure status confirmation, defined vent destination, gas test controls, ignition control, and control room coordination before any field release.',
        steps: ['Confirm pressure and purge objective.', 'Validate approved vent or flare destination.', 'Establish gas monitoring and exclusion zone.', 'Coordinate with control room before opening any purge path.'],
        warnings: ['Do not open purge points without confirmed destination and gas monitoring.'],
        prerequisites: ['Permit active', 'Gas monitor functional', 'Control room aligned'],
      },
      {
        id: 'po-prs-031-6',
        section: '6',
        title: 'Purge execution boundaries',
        excerpt: 'If pressure does not respond as expected, stop the purge sequence, maintain safe position, and escalate under abnormal pressure response procedure.',
        steps: ['Open purge path only as instructed by procedure.', 'Monitor pressure decay at defined intervals.', 'Stop if pressure rises or gas readings exceed limits.'],
        warnings: ['Unexpected pressure response triggers escalation.'],
        prerequisites: ['Standby watch assigned', 'Emergency response channel tested'],
      },
    ],
  },
  {
    id: 'doc-hse-gas-009',
    code: 'HSE-GAS-009',
    title: 'Gas Release Safety Standard',
    version: 'v8.1',
    effectiveDate: '2025-12-15',
    approvalStatus: 'current-approved',
    owner: 'HSE',
    assetTypes: ['Pressure line', 'Gas line'],
    systems: ['Condensate Transfer', 'High Pressure Gas Export'],
    procedureType: 'purge',
    criticality: 'high',
    isPrimary: false,
    relevanceScore: 93,
    status: 'current',
    relatedProcedures: ['PO-PRS-031', 'ER-GAS-001'],
    sections: [
      {
        id: 'hse-gas-009-2-5',
        section: '2.5',
        title: 'Gas test and exclusion zone',
        excerpt: 'Gas release work requires calibrated gas detection, ignition source control, exclusion zone setup, and continuous monitoring while release potential exists.',
        steps: ['Verify gas detector calibration.', 'Set exclusion zone and ignition controls.', 'Maintain continuous gas monitoring.'],
        warnings: ['Gas detection above limits requires emergency escalation.'],
        prerequisites: ['Gas detector bump test', 'Area authority notified'],
      },
    ],
  },
  {
    id: 'doc-er-ops-004',
    code: 'ER-OPS-004',
    title: 'Abnormal Pressure Response',
    version: 'v4.3',
    effectiveDate: '2026-01-05',
    approvalStatus: 'current-approved',
    owner: 'Operations Emergency Response',
    assetTypes: ['Pressure line', 'Gas line'],
    systems: ['Condensate Transfer', 'High Pressure Gas Export'],
    procedureType: 'abnormal',
    criticality: 'critical',
    isPrimary: false,
    relevanceScore: 89,
    status: 'current',
    relatedProcedures: ['PO-PRS-031', 'PO-ABN-012'],
    sections: [
      {
        id: 'er-ops-004-3',
        section: '3',
        title: 'Unexpected pressure increase',
        excerpt: 'When pressure rises unexpectedly during a maneuver, field execution shall stop and the control room shall evaluate the abnormal condition before continuation.',
        steps: ['Stop the normal maneuver.', 'Maintain safe position.', 'Notify control room and supervisor.', 'Follow abnormal pressure instructions.'],
        warnings: ['Do not continue normal procedure during abnormal pressure trend.'],
        prerequisites: ['Emergency channel available'],
      },
    ],
  },
  {
    id: 'doc-po-man-018',
    code: 'PO-MAN-018',
    title: 'Manifold Circuit Enablement Procedure',
    version: 'v3.9',
    effectiveDate: '2026-01-22',
    approvalStatus: 'current-approved',
    owner: 'Field Operations',
    assetTypes: ['Valve manifold'],
    systems: ['Production Routing'],
    procedureType: 'verification',
    criticality: 'medium',
    isPrimary: true,
    relevanceScore: 95,
    status: 'current',
    relatedProcedures: ['CK-MAN-006', 'PID-MF-12'],
    sections: [
      {
        id: 'po-man-018-4-4',
        section: '4.4',
        title: 'Valve verification before circuit enablement',
        excerpt: 'Before enabling the circuit, the operator shall verify listed valve positions against the approved checklist and confirm routing with the control room when production path changes.',
        steps: ['Confirm target circuit and product route.', 'Verify each listed valve position.', 'Confirm no blinds or maintenance locks are active.', 'Notify control room before enablement.'],
        warnings: ['Do not enable circuit if any valve position is uncertain.'],
        prerequisites: ['Valve checklist available', 'Circuit route confirmed'],
      },
    ],
  },
  {
    id: 'doc-ck-man-006',
    code: 'CK-MAN-006',
    title: 'Valve Position Checklist',
    version: 'v1.8',
    effectiveDate: '2025-10-19',
    approvalStatus: 'current-approved',
    owner: 'Field Operations',
    assetTypes: ['Valve manifold'],
    systems: ['Production Routing'],
    procedureType: 'verification',
    criticality: 'medium',
    isPrimary: false,
    relevanceScore: 92,
    status: 'current',
    relatedProcedures: ['PO-MAN-018'],
    sections: [
      {
        id: 'ck-man-006-3',
        section: '3',
        title: 'Required valve position list',
        excerpt: 'Valve V-12 shall be closed, V-18 shall be open, bypass V-23 shall be closed, and the header drain shall be confirmed closed before enablement.',
        steps: ['Verify V-12 closed.', 'Verify V-18 open.', 'Verify bypass V-23 closed.', 'Confirm header drain closed.'],
        warnings: ['Any mismatch blocks enablement until supervisor validates routing.'],
        prerequisites: ['Field tags visible', 'Checklist matched to manifold MF-12'],
      },
    ],
  },
  {
    id: 'doc-pid-mf-12',
    code: 'PID-MF-12',
    title: 'Manifold MF-12 Process Diagram',
    version: 'rev 9',
    effectiveDate: '2025-12-02',
    approvalStatus: 'reference-only',
    owner: 'Process Engineering',
    assetTypes: ['Valve manifold'],
    systems: ['Production Routing'],
    procedureType: 'generic',
    criticality: 'medium',
    isPrimary: false,
    relevanceScore: 86,
    status: 'reference',
    relatedProcedures: ['PO-MAN-018'],
    sections: [
      {
        id: 'pid-mf-12-legend',
        section: 'Legend',
        title: 'Valve and circuit references',
        excerpt: 'P&ID reference for MF-12 shows the circuit routing, bypass, drain, and production header boundaries.',
        steps: ['Use for visual boundary confirmation.', 'Do not use as the procedure sequence.'],
        warnings: ['Reference only; follow PO-MAN-018 and CK-MAN-006 for procedure steps.'],
        prerequisites: ['Procedure document open'],
      },
    ],
  },
  {
    id: 'doc-er-gas-001',
    code: 'ER-GAS-001',
    title: 'Gas Release Response',
    version: 'v10.2',
    effectiveDate: '2026-03-20',
    approvalStatus: 'current-approved',
    owner: 'Operations Emergency Response',
    assetTypes: ['Gas line'],
    systems: ['High Pressure Gas Export'],
    procedureType: 'emergency',
    criticality: 'critical',
    isPrimary: true,
    relevanceScore: 99,
    status: 'current',
    relatedProcedures: ['HSE-EMG-003', 'PO-ABN-012'],
    sections: [
      {
        id: 'er-gas-001-1',
        section: '1',
        title: 'Immediate field response',
        excerpt: 'If gas odor or confirmed gas release is present with rising pressure, stop the normal maneuver, move to a safe location if required, notify control room immediately, and follow emergency communication protocol.',
        steps: ['Stop normal field operation.', 'Move to safe condition as trained and if safe to do so.', 'Contact control room immediately.', 'Follow emergency response command.'],
        warnings: ['Do not troubleshoot locally during suspected gas release.'],
        prerequisites: ['Emergency radio channel', 'Area evacuation route known'],
      },
    ],
  },
  {
    id: 'doc-hse-emg-003',
    code: 'HSE-EMG-003',
    title: 'Emergency Communication Protocol',
    version: 'v6.7',
    effectiveDate: '2026-02-25',
    approvalStatus: 'current-approved',
    owner: 'HSE',
    assetTypes: ['Gas line', 'Pressure line', 'Gas compressor'],
    systems: ['High Pressure Gas Export', 'Fuel Gas Compression'],
    procedureType: 'emergency',
    criticality: 'critical',
    isPrimary: false,
    relevanceScore: 95,
    status: 'current',
    relatedProcedures: ['ER-GAS-001'],
    sections: [
      {
        id: 'hse-emg-003-2',
        section: '2',
        title: 'Emergency communication chain',
        excerpt: 'Emergency communication shall prioritize control room notification, shift supervisor escalation, area isolation communication, and emergency response activation when required.',
        steps: ['Notify control room first.', 'Escalate to shift supervisor.', 'State asset tag, location, observed condition, and immediate actions taken.'],
        warnings: ['Do not delay emergency communication to search for additional documents.'],
        prerequisites: ['Radio channel available'],
      },
    ],
  },
  {
    id: 'doc-po-abn-012',
    code: 'PO-ABN-012',
    title: 'Abnormal Pressure Procedure',
    version: 'v4.6',
    effectiveDate: '2026-01-31',
    approvalStatus: 'current-approved',
    owner: 'Operations Engineering',
    assetTypes: ['Gas line', 'Pressure line'],
    systems: ['High Pressure Gas Export', 'Condensate Transfer'],
    procedureType: 'abnormal',
    criticality: 'critical',
    isPrimary: false,
    relevanceScore: 90,
    status: 'current',
    relatedProcedures: ['ER-GAS-001', 'ER-OPS-004'],
    sections: [
      {
        id: 'po-abn-012-5',
        section: '5',
        title: 'Pressure above normal range',
        excerpt: 'When pressure exceeds the normal range during field activity, the operator shall stop the maneuver, notify the control room, and not continue until the abnormal condition is evaluated.',
        steps: ['Stop field activity.', 'Notify control room.', 'Confirm pressure indication source.', 'Await authorized response.'],
        warnings: ['Do not continue routine procedure under abnormal pressure conditions.'],
        prerequisites: ['Control room contacted'],
      },
    ],
  },
  {
    id: 'doc-ops-gen-001',
    code: 'OPS-GEN-001',
    title: 'Procedure Assistant Context Requirement',
    version: 'v1.0',
    effectiveDate: '2026-04-01',
    approvalStatus: 'current-approved',
    owner: 'Operational Excellence',
    assetTypes: ['Unknown asset'],
    systems: ['Not confirmed'],
    procedureType: 'generic',
    criticality: 'medium',
    isPrimary: true,
    relevanceScore: 84,
    status: 'current',
    relatedProcedures: [],
    sections: [
      {
        id: 'ops-gen-001-context',
        section: '2.1',
        title: 'Minimum context for asset-specific guidance',
        excerpt: 'Asset-specific guidance shall not be generated until installation, equipment tag, system, and intended maneuver are identified.',
        steps: ['Request asset tag.', 'Request installation.', 'Request system or area.', 'Request maneuver type.'],
        warnings: ['Generic isolation guidance is not safe for field execution.'],
        prerequisites: ['Asset context confirmed'],
      },
    ],
  },
  {
    id: 'doc-fi-cmp-022',
    code: 'FI-CMP-022',
    title: 'Field Instruction: Compressor Isolation Variant',
    version: 'v1.2',
    effectiveDate: '2026-02-18',
    approvalStatus: 'conflicting-current',
    owner: 'Local Field Operations',
    assetTypes: ['Gas compressor'],
    systems: ['Fuel Gas Compression'],
    procedureType: 'isolation',
    criticality: 'high',
    isPrimary: false,
    relevanceScore: 92,
    status: 'conflicting',
    relatedProcedures: ['PO-CMP-014'],
    sections: [
      {
        id: 'fi-cmp-022-3',
        section: '3',
        title: 'Local isolation variant',
        excerpt: 'This current field instruction contains a local sequence that conflicts with PO-CMP-014 section 5.2 and requires governance resolution before guidance.',
        steps: ['Do not provide sequence while conflict is unresolved.', 'Escalate to document owner and shift supervisor.'],
        warnings: ['Conflicting current instructions detected.'],
        prerequisites: ['Document governance escalation'],
      },
    ],
  },
];

const HOT_OIL_CHECKLIST: ChecklistItem[] = [
  { id: 'hof-ctx', label: 'Asset tag and QR context verified', required: true, checked: true, source: 'PO-HO-022 §4.1', category: 'context', blocksExecutionIfMissing: true },
  { id: 'hof-mr', label: 'Maintenance release accepted', required: true, checked: true, source: 'PO-HO-022 §4.1', category: 'permit', blocksExecutionIfMissing: true },
  { id: 'hof-loto', label: 'Energy isolation release authorized', required: true, checked: false, source: 'HSE-LOTO-010 §3.4', category: 'loto', blocksExecutionIfMissing: true },
  { id: 'hof-circ', label: 'Circulation and expansion checks complete', required: true, checked: false, source: 'CK-HO-014 §2', category: 'pressure', blocksExecutionIfMissing: true },
  { id: 'hof-cr', label: 'Control room observation channel active', required: true, checked: true, source: 'PO-HO-022 §5.3', category: 'communication', blocksExecutionIfMissing: true },
];

const COMPRESSOR_CHECKLIST: ChecklistItem[] = [
  { id: 'cmp-ctx', label: 'C-102 context verified by QR', required: true, checked: true, source: 'PO-CMP-014 §5.2', category: 'context', blocksExecutionIfMissing: true },
  { id: 'cmp-sup', label: 'Supervisor validation requested', required: true, checked: false, source: 'PO-CMP-014 §5.2', category: 'communication', blocksExecutionIfMissing: true },
  { id: 'cmp-loto', label: 'LOTO authorized personnel assigned', required: true, checked: false, source: 'HSE-LOTO-010 §3.4', category: 'loto', blocksExecutionIfMissing: true },
  { id: 'cmp-press', label: 'Depressurization verification planned', required: true, checked: false, source: 'PO-CMP-014 §5.2', category: 'pressure', blocksExecutionIfMissing: true },
  { id: 'cmp-pid', label: 'P&ID boundaries reviewed', required: false, checked: true, source: 'PID-GAS-221 C-102', category: 'document', blocksExecutionIfMissing: false },
];

const PURGE_CHECKLIST: ChecklistItem[] = [
  { id: 'prs-ctx', label: 'Line PL-77A selected manually', required: true, checked: true, source: 'PO-PRS-031 §5', category: 'context', blocksExecutionIfMissing: true },
  { id: 'prs-permit', label: 'Purge permit active', required: true, checked: false, source: 'PO-PRS-031 §5', category: 'permit', blocksExecutionIfMissing: true },
  { id: 'prs-gas', label: 'Gas monitor bump test confirmed', required: true, checked: false, source: 'HSE-GAS-009 §2.5', category: 'emergency', blocksExecutionIfMissing: true },
  { id: 'prs-cr', label: 'Control room purge coordination complete', required: true, checked: false, source: 'PO-PRS-031 §5', category: 'communication', blocksExecutionIfMissing: true },
  { id: 'prs-dest', label: 'Vent or flare destination confirmed', required: true, checked: false, source: 'PO-PRS-031 §5', category: 'pressure', blocksExecutionIfMissing: true },
];

const MANIFOLD_CHECKLIST: ChecklistItem[] = [
  { id: 'man-ctx', label: 'Manifold MF-12 context verified', required: true, checked: true, source: 'PO-MAN-018 §4.4', category: 'context', blocksExecutionIfMissing: true },
  { id: 'man-v12', label: 'V-12 confirmed closed', required: true, checked: false, source: 'CK-MAN-006 §3', category: 'pressure', blocksExecutionIfMissing: true },
  { id: 'man-v18', label: 'V-18 confirmed open', required: true, checked: true, source: 'CK-MAN-006 §3', category: 'pressure', blocksExecutionIfMissing: true },
  { id: 'man-v23', label: 'Bypass V-23 confirmed closed', required: true, checked: false, source: 'CK-MAN-006 §3', category: 'pressure', blocksExecutionIfMissing: true },
  { id: 'man-cr', label: 'Control room notified before enablement', required: false, checked: false, source: 'PO-MAN-018 §4.4', category: 'communication', blocksExecutionIfMissing: false },
];

const EMERGENCY_CHECKLIST: ChecklistItem[] = [
  { id: 'gas-stop', label: 'Normal maneuver stopped', required: true, checked: false, source: 'ER-GAS-001 §1', category: 'emergency', blocksExecutionIfMissing: true },
  { id: 'gas-safe', label: 'Operator moving to safe condition', required: true, checked: false, source: 'ER-GAS-001 §1', category: 'emergency', blocksExecutionIfMissing: true },
  { id: 'gas-cr', label: 'Control room contacted immediately', required: true, checked: false, source: 'HSE-EMG-003 §2', category: 'communication', blocksExecutionIfMissing: true },
  { id: 'gas-sup', label: 'Shift supervisor emergency notification', required: true, checked: false, source: 'HSE-EMG-003 §2', category: 'communication', blocksExecutionIfMissing: true },
];

const MISSING_CONTEXT_CHECKLIST: ChecklistItem[] = [
  { id: 'missing-tag', label: 'Equipment tag provided', required: true, checked: false, source: 'OPS-GEN-001 §2.1', category: 'context', blocksExecutionIfMissing: true },
  { id: 'missing-installation', label: 'Installation confirmed', required: true, checked: false, source: 'OPS-GEN-001 §2.1', category: 'context', blocksExecutionIfMissing: true },
  { id: 'missing-system', label: 'System or area confirmed', required: true, checked: false, source: 'OPS-GEN-001 §2.1', category: 'context', blocksExecutionIfMissing: true },
  { id: 'missing-maneuver', label: 'Maneuver type identified', required: true, checked: true, source: 'OPS-GEN-001 §2.1', category: 'context', blocksExecutionIfMissing: true },
];

const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'hot-oil-startup',
    title: 'Hot Oil Furnace Startup',
    compactTitle: 'Hot oil startup',
    assetId: 'asset-hof-204',
    contextComplete: true,
    sourceDocumentCodes: ['PO-HO-022', 'HSE-LOTO-010', 'CK-HO-014'],
    riskLevel: 'Requires Validation',
    procedureType: 'startup',
    safetySummary: 'Startup after maintenance requires control room observation, maintenance release, isolation release, and burner permissive checks.',
    businessValue: 'Reduces startup delay while keeping formal authorization outside the assistant.',
    conflictMode: 'none',
    question: {
      id: 'q-hof-main',
      scenario: 'hot-oil-startup',
      text: 'How do I put the hot oil furnace back in service after maintenance?',
      intent: 'startup',
      missingContext: false,
      riskKeywords: ['startup', 'maintenance', 'furnace'],
    },
    alternateQuestions: [
      { id: 'q-hof-alt-1', scenario: 'hot-oil-startup', text: 'Which pre-start checks apply to HOF-204?', intent: 'startup', missingContext: false, riskKeywords: ['pre-start', 'checks'] },
      { id: 'q-hof-alt-2', scenario: 'hot-oil-startup', text: 'Can I release the furnace isolation after maintenance?', intent: 'startup', missingContext: false, riskKeywords: ['isolation', 'release'] },
    ],
    answerProfile: {
      summary: 'Context confirmed: Hot Oil Furnace HOF-204, Loma Campana CPF, Hot Oil Loop B. Based on current approved procedure PO-HO-022, startup after maintenance requires maintenance release, pre-start checklist completion, energy isolation release authorization, purge confirmation, and control room observation. I can summarize the approved sequence and show the source, but I cannot authorize execution.',
      guidedSteps: [
        { label: 'Confirm maintenance release', detail: 'Verify that the work order release is recorded and the maintenance handover is accepted before any return-to-service action.', docCode: 'PO-HO-022', section: '4.1', tone: 'blue' },
        { label: 'Complete pre-start field checks', detail: 'Check circulation valves, expansion tank level, purge path, burner enclosure condition, and communications.', docCode: 'CK-HO-014', section: '2', tone: 'cyan' },
        { label: 'Validate isolation release', detail: 'Only authorized personnel may remove or release energy isolation, with independent verification recorded.', docCode: 'HSE-LOTO-010', section: '3.4', tone: 'amber' },
        { label: 'Start through controlled sequence', detail: 'Verify circulation, confirm permissives, initiate purge, and start the burner under control room observation.', docCode: 'PO-HO-022', section: '5.3', tone: 'emerald' },
      ],
      prerequisites: ['Maintenance release accepted', 'Authorized isolation release', 'Pre-start checklist complete', 'Control room observation channel active'],
      warnings: ['Do not bypass furnace purge or flame safeguard interlocks.', 'Guidance does not authorize startup; supervisor and formal procedure authority remain required.'],
      forbiddenActions: ['Bypass burner management permissives', 'Release isolation without authorized personnel', 'Start without purge cycle'],
    },
    checklist: HOT_OIL_CHECKLIST,
    valueDeltas: { dominantConstraint: 'Startup knowledge delay', riskEmphasis: 'Maintenance release discipline', primaryOutcome: 'Safer return to service', decisionLatencyReductionPct: 68 },
  },
  {
    id: 'compressor-isolation',
    title: 'Compressor Isolation',
    compactTitle: 'Compressor isolation',
    assetId: 'asset-cmp-102',
    contextComplete: true,
    sourceDocumentCodes: ['PO-CMP-014', 'HSE-LOTO-010', 'PID-GAS-221', 'PO-CMP-011'],
    riskLevel: 'Requires Validation',
    procedureType: 'isolation',
    safetySummary: 'High-risk isolation requires supervisor validation, LOTO, depressurization verification, gas test confirmation, and control room coordination.',
    businessValue: 'Shows the assistant rejecting legacy procedure drift and anchoring to the current controlled document.',
    conflictMode: 'obsolete-found',
    question: {
      id: 'q-cmp-main',
      scenario: 'compressor-isolation',
      text: 'What is the sequence to isolate Compressor C-102 before intervention?',
      intent: 'isolation',
      missingContext: false,
      riskKeywords: ['isolate', 'compressor', 'intervention', 'pressure'],
    },
    alternateQuestions: [
      { id: 'q-cmp-alt-1', scenario: 'compressor-isolation', text: 'Which documents apply before C-102 handover?', intent: 'isolation', missingContext: false, riskKeywords: ['handover', 'C-102'] },
      { id: 'q-cmp-alt-2', scenario: 'compressor-isolation', text: 'Is the older compressor isolation instruction still valid?', intent: 'isolation', missingContext: false, riskKeywords: ['older', 'valid'] },
    ],
    answerProfile: {
      summary: 'Context confirmed: Compressor C-102, Gas Plant Norte, Compression Train A. For isolation before intervention, the applicable current procedure is PO-CMP-014, section 5.2. This maneuver requires supervisor validation, lockout/tagout confirmation, depressurization verification, gas test confirmation, and control room coordination. I can summarize the approved sequence and show the source, but I cannot authorize execution.',
      guidedSteps: [
        { label: 'Confirm work order and scope', detail: 'Confirm the intervention scope and the exact equipment boundary before preparing isolation.', docCode: 'PO-CMP-014', section: '5.2', tone: 'blue' },
        { label: 'Notify control room and supervisor', detail: 'Coordinate the compressor status, alarms, expected isolation window, and human validation before field action.', docCode: 'PO-CMP-014', section: '5.2', tone: 'amber' },
        { label: 'Apply approved isolation sequence', detail: 'Use the current approved procedure for isolation; the legacy PO-CMP-011 is replaced and not used as guidance.', docCode: 'PO-CMP-014', section: '5.2', tone: 'emerald' },
        { label: 'Verify zero-energy and pressure condition', detail: 'Confirm pressure bleed-down, stored energy control, and independent LOTO verification before handover.', docCode: 'HSE-LOTO-010', section: '6.2', tone: 'amber' },
        { label: 'Use P&ID only for boundaries', detail: 'Reference PID-GAS-221 to confirm field tags and isolation points; it does not replace the procedure.', docCode: 'PID-GAS-221', section: 'C-102', tone: 'cyan' },
      ],
      prerequisites: ['Supervisor validation', 'Active permit or work order', 'Authorized LOTO personnel', 'Control room coordination', 'Pressure verification method'],
      warnings: ['Do not continue if residual pressure remains above the defined safe condition.', 'PO-CMP-011 was found but is replaced by PO-CMP-014 and is shown for traceability only.'],
      forbiddenActions: ['Use obsolete PO-CMP-011 as guidance', 'Bypass LOTO', 'Proceed without depressurization verification', 'Treat assistant guidance as execution approval'],
    },
    checklist: COMPRESSOR_CHECKLIST,
    valueDeltas: { dominantConstraint: 'LOTO and pressure-risk alignment', riskEmphasis: 'Energy isolation certainty', primaryOutcome: 'Standardized intervention readiness', decisionLatencyReductionPct: 76, checklistOmissionsReducedPct: 46 },
  },
  {
    id: 'pressure-purge',
    title: 'Pressure Line Purge',
    compactTitle: 'Pressure purge',
    assetId: 'asset-pl-77a',
    contextComplete: true,
    sourceDocumentCodes: ['PO-PRS-031', 'HSE-GAS-009', 'ER-OPS-004'],
    riskLevel: 'Requires Validation',
    procedureType: 'purge',
    safetySummary: 'Purge requires permit, gas monitoring, vent destination, ignition control, and control room coordination.',
    businessValue: 'Converts scattered purge rules into a single governed field view with abnormal-condition boundaries.',
    conflictMode: 'none',
    question: {
      id: 'q-prs-main',
      scenario: 'pressure-purge',
      text: 'What is the procedure to purge this pressure system?',
      intent: 'purge',
      missingContext: false,
      riskKeywords: ['purge', 'pressure', 'gas'],
    },
    alternateQuestions: [
      { id: 'q-prs-alt-1', scenario: 'pressure-purge', text: 'What must be confirmed before opening a purge point?', intent: 'purge', missingContext: false, riskKeywords: ['purge point'] },
      { id: 'q-prs-alt-2', scenario: 'pressure-purge', text: 'What if pressure does not decay during purge?', intent: 'abnormal', missingContext: false, riskKeywords: ['pressure', 'decay'] },
    ],
    answerProfile: {
      summary: 'Context confirmed: Pressure Line PL-77A, Bajada del Palo Oeste, Condensate Transfer. The applicable current procedure is PO-PRS-031. Purge work is high risk and requires permit confirmation, gas monitoring, approved vent destination, ignition control, and control room coordination. I can provide the controlled preparation sequence and boundaries, but not execution authorization.',
      guidedSteps: [
        { label: 'Confirm purge objective and pressure status', detail: 'Confirm current pressure, intended purge endpoint, and whether abnormal pressure response criteria are present.', docCode: 'PO-PRS-031', section: '5', tone: 'blue' },
        { label: 'Validate release destination', detail: 'Confirm the approved vent or flare destination before any purge path is opened.', docCode: 'PO-PRS-031', section: '5', tone: 'amber' },
        { label: 'Set gas release controls', detail: 'Establish gas detection, exclusion zone, and ignition source control for the purge area.', docCode: 'HSE-GAS-009', section: '2.5', tone: 'amber' },
        { label: 'Monitor purge boundaries', detail: 'If pressure rises or does not respond as expected, stop and escalate to abnormal pressure response.', docCode: 'ER-OPS-004', section: '3', tone: 'rose' },
      ],
      prerequisites: ['Purge permit active', 'Gas monitor functional', 'Vent destination approved', 'Control room coordination', 'Emergency channel tested'],
      warnings: ['Do not open purge points without confirmed destination and gas monitoring.', 'Unexpected pressure response triggers escalation.'],
      forbiddenActions: ['Vent to undefined destination', 'Continue purge during abnormal pressure trend', 'Operate without gas monitoring'],
    },
    checklist: PURGE_CHECKLIST,
    valueDeltas: { dominantConstraint: 'Gas-release controls', riskEmphasis: 'Purge boundary discipline', primaryOutcome: 'Fewer uncontrolled releases', decisionLatencyReductionPct: 70, checklistOmissionsReducedPct: 52 },
  },
  {
    id: 'valve-verification',
    title: 'Valve Verification Before Circuit Enablement',
    compactTitle: 'Valve verification',
    assetId: 'asset-mf-12',
    contextComplete: true,
    sourceDocumentCodes: ['PO-MAN-018', 'CK-MAN-006', 'PID-MF-12'],
    riskLevel: 'Controlled',
    procedureType: 'verification',
    safetySummary: 'Medium-risk enablement requires valve checklist verification and control room awareness for routing changes.',
    businessValue: 'Prevents route confusion by connecting procedure, checklist, and process diagram at the manifold.',
    conflictMode: 'none',
    question: {
      id: 'q-man-main',
      scenario: 'valve-verification',
      text: 'Which valves do I need to verify before enabling this circuit?',
      intent: 'verification',
      missingContext: false,
      riskKeywords: ['valves', 'verify', 'enable'],
    },
    alternateQuestions: [
      { id: 'q-man-alt-1', scenario: 'valve-verification', text: 'Is V-18 supposed to be open for this circuit?', intent: 'verification', missingContext: false, riskKeywords: ['V-18'] },
      { id: 'q-man-alt-2', scenario: 'valve-verification', text: 'Can I use the P&ID to enable the circuit?', intent: 'verification', missingContext: false, riskKeywords: ['P&ID'] },
    ],
    answerProfile: {
      summary: 'Context confirmed: Manifold MF-12, La Calera Battery, Production Routing. The current approved procedure PO-MAN-018 and checklist CK-MAN-006 identify the valve positions to verify before circuit enablement. The P&ID supports visual boundary confirmation only and does not replace the checklist.',
      guidedSteps: [
        { label: 'Confirm target circuit', detail: 'Confirm the selected production route and circuit target before checking valve positions.', docCode: 'PO-MAN-018', section: '4.4', tone: 'blue' },
        { label: 'Verify listed valve positions', detail: 'Verify V-12 closed, V-18 open, bypass V-23 closed, and header drain closed before enablement.', docCode: 'CK-MAN-006', section: '3', tone: 'emerald' },
        { label: 'Check for active maintenance constraints', detail: 'Confirm no blinds, maintenance locks, or open work orders remain on the route.', docCode: 'PO-MAN-018', section: '4.4', tone: 'amber' },
        { label: 'Use P&ID as visual reference', detail: 'Use PID-MF-12 to confirm circuit boundaries, but follow PO-MAN-018 and CK-MAN-006 for execution sequence.', docCode: 'PID-MF-12', section: 'Legend', tone: 'cyan' },
      ],
      prerequisites: ['Asset tag confirmed', 'Valve checklist matched to MF-12', 'Target route confirmed', 'Control room notified when route changes'],
      warnings: ['Do not enable circuit if any valve position is uncertain.', 'A P&ID alone is not an operating authorization.'],
      forbiddenActions: ['Enable with unverified valves', 'Substitute P&ID for procedure', 'Ignore active maintenance locks'],
    },
    checklist: MANIFOLD_CHECKLIST,
    valueDeltas: { dominantConstraint: 'Checklist clarity', riskEmphasis: 'Route integrity', primaryOutcome: 'Reduced misrouting risk', decisionLatencyReductionPct: 79, supervisorCallsAvoidedPct: 38 },
  },
  {
    id: 'emergency-gas',
    title: 'Emergency / Unsafe Condition',
    compactTitle: 'Emergency gas',
    assetId: 'asset-gl-44',
    contextComplete: true,
    sourceDocumentCodes: ['ER-GAS-001', 'HSE-EMG-003', 'PO-ABN-012'],
    riskLevel: 'Critical Emergency',
    procedureType: 'emergency',
    safetySummary: 'Emergency mode suppresses normal step-by-step work guidance and directs the operator to emergency response protocol.',
    businessValue: 'Shows that the assistant knows when not to continue a normal operating procedure.',
    conflictMode: 'none',
    question: {
      id: 'q-gas-main',
      scenario: 'emergency-gas',
      text: 'Pressure is rising above normal range and I smell gas. What should I do?',
      intent: 'emergency',
      missingContext: false,
      riskKeywords: ['pressure rising', 'smell gas', 'emergency'],
    },
    alternateQuestions: [
      { id: 'q-gas-alt-1', scenario: 'emergency-gas', text: 'Can I keep troubleshooting the gas line locally?', intent: 'emergency', missingContext: false, riskKeywords: ['troubleshooting', 'gas'] },
      { id: 'q-gas-alt-2', scenario: 'emergency-gas', text: 'Which emergency protocol applies to GL-44?', intent: 'emergency', missingContext: false, riskKeywords: ['emergency protocol'] },
    ],
    answerProfile: {
      summary: 'Emergency mode: rising pressure combined with gas odor is not a normal field procedure request. Based on ER-GAS-001 and HSE-EMG-003, stop the normal maneuver, move to a safe condition if required and safe to do so, contact the control room immediately, and follow emergency command. I will not provide a routine step-by-step operating sequence for this condition.',
      guidedSteps: [
        { label: 'Stop normal field operation', detail: 'Do not continue the current maneuver or troubleshoot locally under suspected gas release conditions.', docCode: 'ER-GAS-001', section: '1', tone: 'rose' },
        { label: 'Move to safe condition', detail: 'Move away from the release area according to training and site emergency instructions if safe to do so.', docCode: 'ER-GAS-001', section: '1', tone: 'rose' },
        { label: 'Contact control room immediately', detail: 'Report asset tag, location, gas odor, pressure trend, and immediate actions taken.', docCode: 'HSE-EMG-003', section: '2', tone: 'rose' },
        { label: 'Do not resume normal guidance', detail: 'Routine procedure continuation is blocked until emergency response and abnormal pressure evaluation are complete.', docCode: 'PO-ABN-012', section: '5', tone: 'amber' },
      ],
      prerequisites: ['Emergency radio channel', 'Safe egress route', 'Control room notification', 'Shift supervisor escalation'],
      warnings: ['Do not troubleshoot locally during suspected gas release.', 'Do not continue routine procedure under abnormal pressure conditions.'],
      forbiddenActions: ['Continue normal maneuver', 'Troubleshoot at the line', 'Delay emergency communication', 'Override emergency protocol'],
    },
    checklist: EMERGENCY_CHECKLIST,
    valueDeltas: { dominantConstraint: 'Emergency response speed', riskEmphasis: 'Stop-work discipline', primaryOutcome: 'Faster escalation, less exposure', decisionLatencyReductionPct: 88, checklistOmissionsReducedPct: 63, supervisorCallsAvoidedPct: 0 },
  },
  {
    id: 'missing-context',
    title: 'Missing Asset Context',
    compactTitle: 'Missing context',
    assetId: 'asset-unknown',
    contextComplete: false,
    sourceDocumentCodes: ['OPS-GEN-001'],
    riskLevel: 'Informational',
    procedureType: 'generic',
    safetySummary: 'The assistant blocks asset-specific procedure guidance until installation, equipment tag, system, and maneuver are known.',
    businessValue: 'Demonstrates that the assistant does not improvise when critical operating context is missing.',
    conflictMode: 'none',
    question: {
      id: 'q-missing-main',
      scenario: 'missing-context',
      text: 'How do I isolate this equipment?',
      intent: 'isolation',
      missingContext: true,
      riskKeywords: ['isolate', 'equipment'],
    },
    alternateQuestions: [
      { id: 'q-missing-alt-1', scenario: 'missing-context', text: 'Can you give me the generic isolation steps?', intent: 'isolation', missingContext: true, riskKeywords: ['generic'] },
      { id: 'q-missing-alt-2', scenario: 'missing-context', text: 'What information do you need to identify the procedure?', intent: 'generic', missingContext: true, riskKeywords: ['information needed'] },
    ],
    answerProfile: {
      summary: 'I need the equipment tag, installation, system or area, and intended maneuver type before I can identify the correct approved procedure. Generic isolation guidance is not safe for field execution. Provide the asset tag or scan the QR code and I will retrieve the applicable controlled document.',
      guidedSteps: [
        { label: 'Request asset tag', detail: 'The equipment tag is required before selecting an asset-specific procedure.', docCode: 'OPS-GEN-001', section: '2.1', tone: 'amber' },
        { label: 'Request installation and system', detail: 'Installation, system, and area prevent the assistant from matching a procedure from the wrong asset family.', docCode: 'OPS-GEN-001', section: '2.1', tone: 'amber' },
        { label: 'Request maneuver type', detail: 'The assistant needs to know whether the task is isolation, startup, purge, verification, or abnormal response.', docCode: 'OPS-GEN-001', section: '2.1', tone: 'cyan' },
      ],
      prerequisites: ['Asset tag', 'Installation', 'System or area', 'Maneuver type'],
      warnings: ['Asset-specific procedure guidance is blocked until context is complete.', 'Do not use generic isolation guidance for field execution.'],
      forbiddenActions: ['Generate asset-specific sequence without context', 'Use memory-based generic steps', 'Select procedure from unknown asset family'],
    },
    checklist: MISSING_CONTEXT_CHECKLIST,
    valueDeltas: { dominantConstraint: 'Missing field context', riskEmphasis: 'No guessing', primaryOutcome: 'Safer procedure matching', decisionLatencyReductionPct: 55, supervisorCallsAvoidedPct: 12 },
  },
  {
    id: 'document-conflict',
    title: 'Conflicting Current Documents',
    compactTitle: 'Document conflict',
    assetId: 'asset-cmp-102',
    contextComplete: true,
    sourceDocumentCodes: ['PO-CMP-014', 'FI-CMP-022', 'HSE-LOTO-010'],
    riskLevel: 'Requires Validation',
    procedureType: 'isolation',
    safetySummary: 'Two current documents conflict; the assistant escalates rather than choosing an instruction path.',
    businessValue: 'Creates document governance value by identifying conflicts before they appear in the field.',
    conflictMode: 'current-conflict',
    question: {
      id: 'q-conflict-main',
      scenario: 'document-conflict',
      text: 'Which compressor isolation instruction should I follow for C-102?',
      intent: 'isolation',
      missingContext: false,
      riskKeywords: ['compressor', 'instruction', 'conflict'],
    },
    alternateQuestions: [
      { id: 'q-conflict-alt-1', scenario: 'document-conflict', text: 'Why did the assistant stop the isolation answer?', intent: 'isolation', missingContext: false, riskKeywords: ['stopped'] },
      { id: 'q-conflict-alt-2', scenario: 'document-conflict', text: 'Can I use the local field instruction instead?', intent: 'isolation', missingContext: false, riskKeywords: ['local instruction'] },
    ],
    answerProfile: {
      summary: 'Context confirmed for Compressor C-102, but two current instructions match the isolation request and the local field instruction conflicts with PO-CMP-014. I will not provide a field sequence while the conflict is unresolved. Escalation to the shift supervisor and document owner is required before guidance.',
      guidedSteps: [
        { label: 'Identify conflict', detail: 'PO-CMP-014 and FI-CMP-022 are both current matches, but FI-CMP-022 contains a conflicting local isolation variant.', docCode: 'FI-CMP-022', section: '3', tone: 'rose' },
        { label: 'Block procedural sequence', detail: 'The assistant does not choose between conflicting current documents for a high-risk isolation.', docCode: 'FI-CMP-022', section: '3', tone: 'rose' },
        { label: 'Escalate to document owner', detail: 'Send the conflict package with asset, question, and cited sections to supervisor and Operations Engineering.', docCode: 'PO-CMP-014', section: '5.2', tone: 'amber' },
      ],
      prerequisites: ['Supervisor escalation', 'Document owner review', 'Current approved instruction clarified'],
      warnings: ['Conflicting current instructions detected. Escalation required before field guidance.', 'Do not use a local variant when it conflicts with the controlled procedure until governance resolves it.'],
      forbiddenActions: ['Choose between conflicting current documents', 'Provide detailed isolation sequence', 'Treat conflict as a preference'],
    },
    checklist: COMPRESSOR_CHECKLIST,
    valueDeltas: { dominantConstraint: 'Document governance conflict', riskEmphasis: 'Conflict escalation', primaryOutcome: 'Procedure governance visibility', decisionLatencyReductionPct: 61, repeatedQuestionsThisMonth: 24 },
  },
];

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function clampPhase(value: number): PhaseId {
  const next = Math.max(0, Math.min(10, Math.round(value)));
  return next as PhaseId;
}

function getScenarioConfig(scenarioId: ScenarioId): ScenarioConfig {
  return SCENARIOS.find((scenario) => scenario.id === scenarioId) ?? SCENARIOS[0];
}

function getAssetContext(assetId: string): AssetContext {
  return ASSETS.find((asset) => asset.id === assetId) ?? ASSETS[ASSETS.length - 1];
}

function getApplicableDocuments(scenario: ScenarioConfig): ProcedureDocument[] {
  const requested = new Set(scenario.sourceDocumentCodes);
  return PROCEDURE_DOCUMENTS.filter((doc) => requested.has(doc.code));
}

function rankDocumentsByContext(documents: ProcedureDocument[], assetContext: AssetContext, scenario: ScenarioConfig): RankedProcedureDocument[] {
  return documents
    .map((doc) => {
      const assetMatch = doc.assetTypes.includes(assetContext.type) ? 18 : 0;
      const systemMatch = doc.systems.includes(assetContext.system) ? 18 : 0;
      const procedureMatch = doc.procedureType === scenario.procedureType ? 16 : doc.procedureType === 'generic' ? 6 : 0;
      const primaryBoost = doc.isPrimary ? 8 : 0;
      const currentBoost = doc.status === 'current' ? 12 : doc.status === 'reference' ? 3 : doc.status === 'replaced' ? -18 : doc.status === 'conflicting' ? -6 : 0;
      const conflictPenalty = scenario.conflictMode === 'current-conflict' && doc.status === 'conflicting' ? -4 : 0;
      const rankScore = Math.max(0, Math.min(100, doc.relevanceScore + assetMatch + systemMatch + procedureMatch + primaryBoost + currentBoost + conflictPenalty - 36));
      const matchReason =
        doc.status === 'replaced'
          ? `Replaced by ${doc.replacedBy ?? 'a newer document'} · traceability only`
          : doc.status === 'conflicting'
            ? 'Current match but conflicts with another current instruction'
            : doc.status === 'reference'
              ? 'Reference document used for asset boundaries'
              : doc.isPrimary
                ? 'Primary current approved procedure'
                : 'Supporting current approved control';
      return { ...doc, rankScore, matchReason, usedForGuidance: doc.status === 'current' && doc.approvalStatus === 'current-approved' };
    })
    .sort((a, b) => b.rankScore - a.rankScore);
}

function filterApprovedSources(documents: RankedProcedureDocument[], scenario: ScenarioConfig): RankedProcedureDocument[] {
  if (scenario.conflictMode === 'current-conflict') {
    return documents.filter((doc) => doc.status === 'current' || doc.status === 'conflicting');
  }
  return documents.filter((doc) => doc.status === 'current');
}

function detectRiskLevel(question: OperatorQuestion, assetContext: AssetContext, scenario: ScenarioConfig): RiskLevel {
  if (question.riskKeywords.some((keyword) => keyword.includes('smell gas') || keyword.includes('emergency'))) return 'Critical Emergency';
  if (assetContext.telemetry.some((point) => point.status === 'alarm')) return 'Critical Emergency';
  if (scenario.procedureType === 'purge' || scenario.procedureType === 'isolation' || scenario.procedureType === 'startup') return 'Requires Validation';
  if (scenario.procedureType === 'verification') return 'Controlled';
  return scenario.riskLevel;
}

function requiresSupervisorValidation(riskLevel: RiskLevel, procedureType: ProcedureType, scenario: ScenarioConfig): boolean {
  return riskLevel === 'Requires Validation' || riskLevel === 'Critical Emergency' || procedureType === 'isolation' || procedureType === 'purge' || scenario.conflictMode === 'current-conflict';
}

function findDocumentSection(document: ProcedureDocument, sectionRef: string): ProcedureSection {
  return document.sections.find((section) => section.section === sectionRef) ?? document.sections[0];
}

function buildCitationId(docCode: string, section: string, answerBlockId: string): string {
  return `${docCode}-${section}-${answerBlockId}`.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
}

function buildCitationsForStep(stepId: string, seed: GuidedStepSeed, documents: RankedProcedureDocument[]): Citation[] {
  const doc = documents.find((item) => item.code === seed.docCode);
  if (!doc) return [];
  const section = findDocumentSection(doc, seed.section);
  const citation: Citation = {
    id: buildCitationId(doc.code, section.section, stepId),
    docId: doc.id,
    docCode: doc.code,
    documentTitle: doc.title,
    section: section.section,
    excerpt: section.excerpt,
    answerBlockId: stepId,
    confidence: doc.status === 'current' ? Math.min(100, doc.rankScore) : Math.min(72, doc.rankScore),
    usedForGuidance: doc.usedForGuidance,
  };
  return [citation];
}

function getEmergencyResponse(scenario: ScenarioConfig, documents: RankedProcedureDocument[]): AssistantAnswer {
  const guidedSteps = scenario.answerProfile.guidedSteps.map((seed, index) => {
    const id = `emergency-step-${index + 1}`;
    return {
      id,
      index: index + 1,
      label: seed.label,
      detail: seed.detail,
      citations: buildCitationsForStep(id, seed, documents),
      tone: seed.tone ?? 'rose',
      required: true,
      blockedBy: index === 0 ? undefined : 'Normal procedure guidance is blocked in emergency mode',
    };
  });
  const citations = guidedSteps.flatMap((step) => step.citations);
  return {
    id: `${scenario.id}-answer`,
    summary: scenario.answerProfile.summary,
    mode: 'emergency',
    guidedSteps,
    prerequisites: scenario.answerProfile.prerequisites,
    warnings: scenario.answerProfile.warnings,
    citations,
    requiredEscalation: true,
    forbiddenActions: scenario.answerProfile.forbiddenActions,
    confidence: 96,
    answerTone: 'rose',
  };
}

function buildAssistantAnswer(scenario: ScenarioConfig, documents: RankedProcedureDocument[], riskLevel: RiskLevel): AssistantAnswer {
  if (riskLevel === 'Critical Emergency') return getEmergencyResponse(scenario, documents);

  const mode: AssistantAnswer['mode'] = !scenario.contextComplete ? 'missing-context' : scenario.conflictMode === 'current-conflict' ? 'conflict' : 'normal';
  const guidedSteps = scenario.answerProfile.guidedSteps.map((seed, index) => {
    const id = `${scenario.id}-step-${index + 1}`;
    const blockedBy =
      mode === 'missing-context'
        ? 'Asset context is required before asset-specific guidance'
        : mode === 'conflict' && index > 0
          ? 'Detailed procedure sequence blocked until conflict is resolved'
          : undefined;
    return {
      id,
      index: index + 1,
      label: seed.label,
      detail: seed.detail,
      citations: buildCitationsForStep(id, seed, documents),
      tone: seed.tone ?? (mode === 'conflict' ? 'rose' : 'blue'),
      required: true,
      blockedBy,
    };
  });

  const citations = guidedSteps.flatMap((step) => step.citations);
  const confidence = mode === 'missing-context' ? 66 : mode === 'conflict' ? 71 : Math.round(documents.reduce((sum, doc) => sum + doc.rankScore, 0) / Math.max(1, documents.length));

  return {
    id: `${scenario.id}-answer`,
    summary: scenario.answerProfile.summary,
    mode,
    guidedSteps,
    prerequisites: scenario.answerProfile.prerequisites,
    warnings: scenario.answerProfile.warnings,
    citations,
    requiredEscalation: requiresSupervisorValidation(riskLevel, scenario.procedureType, scenario),
    forbiddenActions: scenario.answerProfile.forbiddenActions,
    confidence,
    answerTone: mode === 'missing-context' ? 'amber' : mode === 'conflict' ? 'rose' : riskLevel === 'Controlled' ? 'emerald' : 'amber',
  };
}

function calculateReadinessScore(checklist: ChecklistItem[]): number {
  const required = checklist.filter((item) => item.required);
  if (required.length === 0) return 100;
  const completed = required.filter((item) => item.checked).length;
  return Math.round((completed / required.length) * 100);
}

function buildSafetyGate(scenario: ScenarioConfig, riskLevel: RiskLevel, checklist: ChecklistItem[]): SafetyGate {
  const readinessScore = calculateReadinessScore(checklist);
  const missingRequired = checklist.filter((item) => item.blocksExecutionIfMissing && !item.checked);
  const requiresSupervisor = requiresSupervisorValidation(riskLevel, scenario.procedureType, scenario);

  if (riskLevel === 'Critical Emergency') {
    return {
      id: `${scenario.id}-gate`,
      riskLevel,
      action: 'emergency-protocol',
      confidence: 98,
      guidanceAvailable: false,
      executionAuthorized: false,
      requiresSupervisor: true,
      requiresPermit: false,
      requiresLoto: false,
      requiresControlRoom: true,
      emergencyMode: true,
      reason: 'Emergency condition detected. Normal procedure guidance is suppressed.',
      blockers: ['Stop normal maneuver', 'Contact control room immediately', 'Follow emergency command'],
      readinessScore,
      requiredContext: ['Asset tag', 'Observed condition', 'Location', 'Immediate actions taken'],
      compactStatus: 'Emergency protocol only',
    };
  }

  if (!scenario.contextComplete) {
    return {
      id: `${scenario.id}-gate`,
      riskLevel,
      action: 'blocked',
      confidence: 88,
      guidanceAvailable: false,
      executionAuthorized: false,
      requiresSupervisor: false,
      requiresPermit: false,
      requiresLoto: false,
      requiresControlRoom: false,
      emergencyMode: false,
      reason: 'Asset-specific procedure guidance blocked because context is incomplete.',
      blockers: ['Equipment tag missing', 'Installation missing', 'System or area missing'],
      readinessScore,
      requiredContext: ['Installation', 'Equipment tag', 'System', 'Maneuver type'],
      compactStatus: 'Context required',
    };
  }

  if (scenario.conflictMode === 'current-conflict') {
    return {
      id: `${scenario.id}-gate`,
      riskLevel,
      action: 'requires-escalation',
      confidence: 92,
      guidanceAvailable: false,
      executionAuthorized: false,
      requiresSupervisor: true,
      requiresPermit: true,
      requiresLoto: true,
      requiresControlRoom: true,
      emergencyMode: false,
      reason: 'Conflicting current documents detected. Procedure sequence is blocked until governance resolves the conflict.',
      blockers: ['Document conflict', 'Supervisor validation', 'Operations Engineering review'],
      readinessScore,
      requiredContext: ['Conflicting documents', 'Asset tag', 'Question', 'Document owner'],
      compactStatus: 'Conflict escalation',
    };
  }

  const blockedByChecklist = missingRequired.length > 0;
  return {
    id: `${scenario.id}-gate`,
    riskLevel,
    action: blockedByChecklist ? 'blocked' : requiresSupervisor ? 'requires-escalation' : 'guidance-available',
    confidence: riskLevel === 'Controlled' ? 93 : 91,
    guidanceAvailable: true,
    executionAuthorized: false,
    requiresSupervisor,
    requiresPermit: scenario.procedureType === 'purge' || scenario.procedureType === 'isolation' || scenario.procedureType === 'startup',
    requiresLoto: scenario.procedureType === 'isolation' || scenario.id === 'hot-oil-startup',
    requiresControlRoom: scenario.procedureType !== 'generic',
    emergencyMode: false,
    reason: blockedByChecklist
      ? 'Guidance is available, but required readiness checks remain incomplete.'
      : requiresSupervisor
        ? 'Guidance is available. Execution requires authorized supervisor validation.'
        : 'Guidance is available for controlled verification. Execution authority remains external to the assistant.',
    blockers: missingRequired.map((item) => item.label),
    readinessScore,
    requiredContext: ['Asset tag', 'Installation', 'System', 'Shift', 'Question intent'],
    compactStatus: blockedByChecklist ? 'Readiness incomplete' : requiresSupervisor ? 'Validation required' : 'Guidance available',
  };
}

function timestampForPhase(phase: PhaseId): string {
  const stamps: Record<PhaseId, string> = {
    0: '09:42:00',
    1: '09:42:05',
    2: '09:42:08',
    3: '09:42:14',
    4: '09:42:18',
    5: '09:42:22',
    6: '09:42:28',
    7: '09:42:31',
    8: '09:42:36',
    9: '09:42:42',
    10: '09:42:45',
  };
  return stamps[phase];
}

function buildTraceLogEntry(scenario: ScenarioConfig, documents: RankedProcedureDocument[], phase: PhaseId): TraceEvent {
  const phaseDefinition = PHASES.find((item) => item.id === phase) ?? PHASES[0];
  const sourceCodes = documents.slice(0, 3).map((doc) => doc.code).join(', ');
  const detailByPhase: Partial<Record<PhaseId, string>> = {
    0: `Field asset candidate: ${getAssetContext(scenario.assetId).tag}`,
    1: scenario.contextComplete ? `Context confirmed for ${getAssetContext(scenario.assetId).tag}` : 'Context missing: asset tag and system required',
    2: `Question captured: "${scenario.question.text}"`,
    3: `Matched sources: ${sourceCodes || 'none'}`,
    4: scenario.conflictMode === 'obsolete-found' ? 'Legacy source detected and excluded from guidance' : scenario.conflictMode === 'current-conflict' ? 'Conflicting current source detected' : 'Current approved versions validated',
    5: `Risk classified: ${scenario.riskLevel}`,
    6: scenario.riskLevel === 'Critical Emergency' ? 'Emergency guidance mode activated' : 'Officially cited answer prepared',
    7: 'Citations anchored to document sections',
    8: requiresSupervisorValidation(scenario.riskLevel, scenario.procedureType, scenario) ? 'Supervisor validation package available' : 'No mandatory escalation for this query',
    9: 'Consultation recorded for audit and learning loop',
    10: 'Decision-support package complete',
  };
  return {
    id: `${scenario.id}-phase-${phase}`,
    timestamp: timestampForPhase(phase),
    label: phaseDefinition.label,
    detail: detailByPhase[phase] ?? phaseDefinition.detail,
    status: phase < 3 ? 'complete' : phaseDefinition.tone === 'rose' ? 'blocked' : phase === 8 && requiresSupervisorValidation(scenario.riskLevel, scenario.procedureType, scenario) ? 'escalated' : 'complete',
    phase,
    source: sourceCodes,
  };
}

function buildInitialTraceEvents(scenario: ScenarioConfig, documents: RankedProcedureDocument[], phase: PhaseId): TraceEvent[] {
  return PHASES.filter((item) => item.id <= phase).map((item) => buildTraceLogEntry(scenario, documents, item.id));
}

function appendTraceUnique(events: TraceEvent[], event: TraceEvent): TraceEvent[] {
  if (events.some((item) => item.id === event.id)) return events;
  return [...events, event].slice(-14);
}

function getCitationJourney(citationId: string, answer: AssistantAnswer, documents: RankedProcedureDocument[]): { citation?: Citation; document?: RankedProcedureDocument; section?: ProcedureSection } {
  const citation = answer.citations.find((item) => item.id === citationId);
  const document = citation ? documents.find((item) => item.id === citation.docId) : undefined;
  const section = citation && document ? findDocumentSection(document, citation.section) : undefined;
  return { citation, document, section };
}

function buildSupervisorEscalation(scenario: ScenarioConfig, documents: RankedProcedureDocument[], riskLevel: RiskLevel, checklist: ChecklistItem[], status: EscalationStatus): SupervisorEscalation {
  const asset = getAssetContext(scenario.assetId);
  const primary = documents.find((doc) => doc.isPrimary) ?? documents[0];
  const completed = checklist.filter((item) => item.checked).length;
  return {
    id: `${scenario.id}-supervisor-escalation`,
    recipient: riskLevel === 'Critical Emergency' ? 'Control Room Supervisor · Emergency Desk' : 'Shift Supervisor · Operations',
    channel: riskLevel === 'Critical Emergency' ? 'Emergency radio channel + control room alarm line' : 'Control room channel CR-2 + supervisor inbox',
    status,
    asset: `${asset.tag} · ${asset.system}`,
    procedure: primary ? `${primary.code} · ${primary.title}` : 'Procedure pending context',
    riskLevel,
    summary:
      riskLevel === 'Critical Emergency'
        ? 'Emergency response package sent with asset context, observed pressure trend, gas indication, and cited emergency protocol.'
        : scenario.conflictMode === 'current-conflict'
          ? 'Document conflict package sent with current conflicting sections and request for authoritative resolution.'
          : `Validation requested for ${scenario.compactTitle}. Procedure, checklist state, and cited sections are attached.`,
    includedSources: documents.slice(0, 4).map((doc) => `${doc.code} ${doc.version}`),
    checklistStatus: `${completed}/${checklist.length} checklist items currently confirmed`,
  };
}

function buildValueMetrics(scenario: ScenarioConfig): SystemMetrics {
  return { ...BASE_METRICS, ...scenario.valueDeltas };
}

function metricCards(metrics: SystemMetrics, scenario: ScenarioConfig): ValueMetric[] {
  const emergency = scenario.riskLevel === 'Critical Emergency';
  return [
    { id: 'search-time', label: 'Search time reduced', before: `${metrics.searchTimeBeforeMin} min`, after: `${metrics.searchTimeAfterSec} sec`, delta: '-95%', tone: 'blue' },
    { id: 'version-confidence', label: 'Procedure version confidence', before: 'manual check', after: `${metrics.procedureVersionConfidence}%`, delta: 'current', tone: 'emerald' },
    { id: 'checklist', label: emergency ? 'Emergency omissions reduced' : 'Checklist omissions reduced', before: 'baseline', after: `${metrics.checklistOmissionsReducedPct}%`, delta: 'simulated', tone: emergency ? 'rose' : 'cyan' },
    { id: 'traceability', label: 'Traceability coverage', before: 'partial', after: `${metrics.traceabilityCoveragePct}%`, delta: 'logged', tone: 'violet' },
  ];
}

function buildChartData(metrics: SystemMetrics): Array<{ label: string; value: number }> {
  return [
    { label: 'Search', value: 100 - Math.min(95, Math.round((metrics.searchTimeAfterSec / (metrics.searchTimeBeforeMin * 60)) * 100)) },
    { label: 'Version', value: metrics.procedureVersionConfidence },
    { label: 'Checklist', value: metrics.checklistOmissionsReducedPct + 40 },
    { label: 'Trace', value: metrics.traceabilityCoveragePct },
    { label: 'Latency', value: metrics.decisionLatencyReductionPct },
  ];
}

function seedChecklistState(items: ChecklistItem[]): Record<string, boolean> {
  return items.reduce<Record<string, boolean>>((state, item) => {
    state[item.id] = item.checked;
    return state;
  }, {});
}

function applyChecklistState(items: ChecklistItem[], selected: Record<string, boolean>): ChecklistItem[] {
  return items.map((item) => ({ ...item, checked: selected[item.id] ?? item.checked }));
}

function statusLabel(status: DocumentStatus): string {
  if (status === 'current') return 'Current approved';
  if (status === 'reference') return 'Reference only';
  if (status === 'replaced') return 'Replaced · not used';
  if (status === 'conflicting') return 'Conflicting current';
  return 'Needs validation';
}

function toneForDocument(status: DocumentStatus): Tone {
  if (status === 'current') return 'emerald';
  if (status === 'reference') return 'blue';
  if (status === 'replaced') return 'amber';
  if (status === 'conflicting') return 'rose';
  return 'slate';
}

function iconForTelemetry(kind: TelemetryKind): IconType {
  if (kind === 'pressure') return Gauge;
  if (kind === 'temperature') return Thermometer;
  if (kind === 'flow') return Activity;
  if (kind === 'gas') return ShieldAlert;
  if (kind === 'vibration') return Zap;
  return Info;
}

function telemetryTone(status: TelemetryPoint['status']): Tone {
  if (status === 'alarm') return 'rose';
  if (status === 'watch') return 'amber';
  return 'emerald';
}

function phaseIsVisible(activePhase: PhaseId, targetPhase: PhaseId): boolean {
  return activePhase >= targetPhase;
}

function interactionTrace(scenario: ScenarioConfig, label: string, detail: string, nonce: number, phase: PhaseId = 10): TraceEvent {
  return {
    id: `${scenario.id}-interaction-${nonce}`,
    timestamp: `09:43:${String(10 + (nonce % 50)).padStart(2, '0')}`,
    label,
    detail,
    status: 'complete',
    phase,
  };
}

function StatusChip({ icon: Icon, label, tone = 'slate', active = true }: { icon: IconType; label: string; tone?: Tone; active?: boolean }) {
  const style = TONE_STYLES[tone];
  return (
    <div className={cn('inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm', active ? `${style.bg} ${style.border} ${style.text}` : 'border-slate-200 bg-white text-slate-400')}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function MiniLabel({ label, value, tone = 'slate' }: { label: string; value: string; tone?: Tone }) {
  const style = TONE_STYLES[tone];
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn('truncate text-xs font-bold', style.text)}>{value}</div>
    </div>
  );
}

function Header({
  scenario,
  asset,
  activePhase,
  autoPlay,
  onTogglePlay,
  onReset,
  onScenarioChange,
}: {
  scenario: ScenarioConfig;
  asset: AssetContext;
  activePhase: PhaseId;
  autoPlay: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onScenarioChange: (scenarioId: ScenarioId) => void;
}) {
  const riskStyle = RISK_STYLES[scenario.riskLevel];
  const phase = PHASES.find((item) => item.id === activePhase) ?? PHASES[0];
  return (
    <header className="relative z-20 flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <img src={PLUSPETROL_LOGO_URL} alt="Pluspetrol" className="h-8 w-8 object-contain" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-black tracking-tight text-slate-950">Pluspetrol Procedure Intelligence</h1>
            <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em]', riskStyle.border, riskStyle.bg, riskStyle.text)}>{riskStyle.compact}</span>
          </div>
          <p className="truncate text-xs font-medium text-slate-500">Official procedures, asset context, safety gates, citations, and traceability at the point of operation.</p>
        </div>
      </div>

      <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 px-5 2xl:flex">
        <StatusChip icon={Database} label="Connected to approved procedure library" tone="emerald" />
        <StatusChip icon={BadgeCheck} label={scenario.contextComplete ? 'Asset context detected' : 'Context incomplete'} tone={scenario.contextComplete ? 'cyan' : 'amber'} />
        <StatusChip icon={History} label="Trace logging enabled" tone="violet" />
        <StatusChip icon={Lock} label="Human authorization required" tone="amber" />
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs shadow-inner lg:block">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <HardHat className="h-3.5 w-3.5 text-slate-500" />
            {asset.operator}
            <span className="text-slate-300">·</span>
            {asset.shift}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <MapPin className="h-3 w-3" />
            <span className="max-w-[230px] truncate">{asset.installation} · {asset.area}</span>
          </div>
        </div>

        <div className="hidden min-w-[260px] xl:block">
          <select
            value={scenario.id}
            onChange={(event) => onScenarioChange(event.target.value as ScenarioId)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          >
            {SCENARIOS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <DemoControls autoPlay={autoPlay} onTogglePlay={onTogglePlay} onReset={onReset} phase={phase} />
      </div>
    </header>
  );
}

function DemoControls({ autoPlay, onTogglePlay, onReset, phase }: { autoPlay: boolean; onTogglePlay: () => void; onReset: () => void; phase: PhaseDefinition }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={onTogglePlay}
        className="inline-flex h-9 items-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-black text-white shadow-sm transition hover:bg-slate-800"
      >
        {autoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{autoPlay ? 'Pause' : 'Play'}</span>
      </button>
      <button type="button" onClick={onReset} className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 text-slate-600 transition hover:bg-slate-50">
        <RefreshCcw className="h-3.5 w-3.5" />
      </button>
      <div className="hidden min-w-[148px] px-2 text-[11px] font-bold text-slate-500 lg:block">
        Phase {phase.id}/10 · {phase.shortLabel}
      </div>
    </div>
  );
}

function ScenarioRail({ activeScenario, onScenarioChange }: { activeScenario: ScenarioId; onScenarioChange: (scenarioId: ScenarioId) => void }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/80 p-2 shadow-sm backdrop-blur">
      <div className="mb-2 flex items-center gap-2 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
        <Route className="h-3.5 w-3.5" />
        Scenario
      </div>
      <div className="grid grid-cols-2 gap-1 xl:grid-cols-1">
        {SCENARIOS.map((scenario) => {
          const active = scenario.id === activeScenario;
          const style = RISK_STYLES[scenario.riskLevel];
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onScenarioChange(scenario.id)}
              className={cn(
                'group min-w-0 rounded-2xl border px-3 py-2 text-left transition',
                active ? `${style.border} ${style.bg} shadow-sm ring-4 ${style.ring}` : 'border-transparent bg-white/50 hover:border-slate-200 hover:bg-white',
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', style.dot)} />
                <span className={cn('truncate text-xs font-black', active ? style.text : 'text-slate-700')}>{scenario.compactTitle}</span>
              </div>
              <div className="mt-1 truncate text-[10px] font-semibold text-slate-500">{scenario.riskLevel}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FieldAssetScene({
  asset,
  scenario,
  activePhase,
  selectedAssetPoint,
  onSelectPoint,
  onQrClick,
  onControlRoomClick,
}: {
  asset: AssetContext;
  scenario: ScenarioConfig;
  activePhase: PhaseId;
  selectedAssetPoint?: string;
  onSelectPoint: (point: TelemetryPoint) => void;
  onQrClick: () => void;
  onControlRoomClick: () => void;
}) {
  const riskStyle = RISK_STYLES[scenario.riskLevel];
  return (
    <section className="flex min-h-0 flex-col gap-3">
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white/90 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(14,165,233,0.10),transparent_35%),radial-gradient(circle_at_80%_8%,rgba(16,185,129,0.09),transparent_34%),linear-gradient(135deg,rgba(248,250,252,0.9),rgba(255,255,255,0.55))]" />
        <div className="relative z-10 mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Cpu className="h-3.5 w-3.5" />
              Field asset context
            </div>
            <h2 className="mt-1 truncate text-2xl font-black tracking-tight text-slate-950">{asset.name} <span className={riskStyle.text}>{asset.tag}</span></h2>
            <p className="truncate text-xs font-medium text-slate-500">{asset.installation} · {asset.system}</p>
          </div>
          <QrBadge asset={asset} activePhase={activePhase} onClick={onQrClick} />
        </div>

        <div className="relative z-10 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50/80 p-2 shadow-inner">
          <AssetSvg asset={asset} scenario={scenario} activePhase={activePhase} selectedAssetPoint={selectedAssetPoint} onSelectPoint={onSelectPoint} />
        </div>

        <div className="relative z-10 mt-3 grid grid-cols-2 gap-2">
          <MiniLabel label="Current state" value={asset.currentState} tone={scenario.riskLevel === 'Critical Emergency' ? 'rose' : 'blue'} />
          <button type="button" onClick={onControlRoomClick} className={cn('rounded-xl border px-3 py-2 text-left shadow-sm transition hover:-translate-y-0.5', asset.controlRoomLink === 'emergency' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-cyan-200 bg-cyan-50 text-cyan-700')}>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] opacity-70">
              <Radio className="h-3.5 w-3.5" />
              Control room
            </div>
            <div className="mt-0.5 truncate text-xs font-black">{asset.controlRoomLink === 'emergency' ? 'Emergency channel' : asset.controlRoomLink === 'required' ? 'Coordination required' : 'Link available'}</div>
          </button>
        </div>
      </div>

      <AssetContextCard asset={asset} scenario={scenario} activePhase={activePhase} />
      <TelemetryInspector asset={asset} selectedAssetPoint={selectedAssetPoint} onSelectPoint={onSelectPoint} />
    </section>
  );
}

function QrBadge({ asset, activePhase, onClick }: { asset: AssetContext; activePhase: PhaseId; onClick: () => void }) {
  const verified = asset.qrStatus === 'verified';
  const tone: Tone = verified ? 'emerald' : asset.qrStatus === 'manual' ? 'amber' : 'rose';
  const style = TONE_STYLES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('group relative overflow-hidden rounded-2xl border p-2 shadow-sm transition hover:-translate-y-0.5', style.border, style.bg)}
    >
      <div className="grid h-12 w-12 grid-cols-4 grid-rows-4 gap-0.5 rounded-xl bg-white p-1">
        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index} className={cn('rounded-[2px]', index % 3 === 0 || index === 5 || index === 10 ? 'bg-slate-900' : 'bg-slate-200')} />
        ))}
      </div>
      <motion.div
        className={cn('pointer-events-none absolute left-2 right-2 h-0.5', style.dot)}
        initial={{ top: 10, opacity: 0 }}
        animate={{ top: activePhase >= 1 ? [10, 50, 10] : 10, opacity: activePhase >= 1 ? [0, 0.9, 0] : 0 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className={cn('mt-1 text-center text-[9px] font-black uppercase tracking-[0.14em]', style.text)}>
        {asset.qrStatus === 'verified' ? 'QR verified' : asset.qrStatus === 'manual' ? 'Manual tag' : 'QR missing'}
      </div>
    </button>
  );
}

function AssetSvg({
  asset,
  scenario,
  activePhase,
  selectedAssetPoint,
  onSelectPoint,
}: {
  asset: AssetContext;
  scenario: ScenarioConfig;
  activePhase: PhaseId;
  selectedAssetPoint?: string;
  onSelectPoint: (point: TelemetryPoint) => void;
}) {
  const critical = scenario.riskLevel === 'Critical Emergency';
  return (
    <div className="relative h-[278px] w-full overflow-hidden rounded-[24px] bg-white">
      <svg viewBox="0 0 400 260" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="fieldGrid" x1="0" x2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#eef6ff" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="#0f172a" floodOpacity="0.10" />
          </filter>
          <linearGradient id="pipeBlue" x1="0" x2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="60%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient id="emergencyRed" x1="0" x2="1">
            <stop offset="0%" stopColor="#fecdd3" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>

        <rect width="400" height="260" fill="url(#fieldGrid)" />
        <g opacity="0.62">
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`v-${i}`} x1={20 + i * 34} x2={20 + i * 34} y1="16" y2="244" stroke="#e2e8f0" strokeWidth="1" />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`h-${i}`} x1="14" x2="386" y1={24 + i * 34} y2={24 + i * 34} stroke="#e2e8f0" strokeWidth="1" />
          ))}
        </g>

        <motion.path
          d="M36 218 C92 160, 118 154, 168 158 S265 117, 360 72"
          fill="none"
          stroke={critical ? '#fb7185' : '#38bdf8'}
          strokeWidth="2"
          strokeDasharray="5 8"
          initial={{ pathLength: 0.15, opacity: 0.2 }}
          animate={{ pathLength: activePhase >= 3 ? 1 : 0.35, opacity: activePhase >= 3 ? 0.95 : 0.36 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {asset.visualMode === 'furnace' && <FurnaceGeometry critical={critical} activePhase={activePhase} />}
        {asset.visualMode === 'compressor' && <CompressorGeometry critical={critical} activePhase={activePhase} />}
        {asset.visualMode === 'pressure-line' && <PressureLineGeometry critical={critical} activePhase={activePhase} />}
        {asset.visualMode === 'manifold' && <ManifoldGeometry critical={critical} activePhase={activePhase} />}
        {asset.visualMode === 'gas-line' && <GasLineGeometry critical={critical} activePhase={activePhase} />}
        {asset.visualMode === 'unknown' && <UnknownGeometry activePhase={activePhase} />}

        <g>
          {asset.telemetry.map((point) => {
            const tone = telemetryTone(point.status);
            const style = TONE_STYLES[tone];
            const selected = selectedAssetPoint === point.id;
            return (
              <g key={point.id}>
                <motion.circle
                  cx={(point.x / 100) * 400}
                  cy={(point.y / 100) * 260}
                  r={selected ? 16 : 12}
                  fill={point.status === 'alarm' ? '#ffe4e6' : point.status === 'watch' ? '#fef3c7' : '#dcfce7'}
                  stroke={point.status === 'alarm' ? '#fb7185' : point.status === 'watch' ? '#f59e0b' : '#10b981'}
                  strokeWidth={selected ? 3 : 2}
                  animate={{ scale: selected || point.status === 'alarm' ? [1, 1.12, 1] : 1, opacity: [0.82, 1, 0.82] }}
                  transition={{ duration: point.status === 'alarm' ? 1 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <foreignObject x={(point.x / 100) * 400 - 60} y={(point.y / 100) * 260 + 15} width="120" height="46">
                  <button
                    type="button"
                    onClick={() => onSelectPoint(point)}
                    className={cn('w-full rounded-xl border bg-white/90 px-2 py-1 text-center shadow-sm backdrop-blur transition hover:scale-[1.02]', style.border)}
                  >
                    <div className={cn('truncate text-[9px] font-black uppercase tracking-[0.12em]', style.text)}>{point.label}</div>
                    <div className="truncate text-[10px] font-bold text-slate-700">{point.value}{point.unit ? ` ${point.unit}` : ''}</div>
                  </button>
                </foreignObject>
              </g>
            );
          })}
        </g>

        <g transform="translate(24 22)">
          <rect width="122" height="30" rx="15" fill="white" stroke="#cbd5e1" />
          <circle cx="17" cy="15" r="5" fill={critical ? '#fb7185' : '#10b981'} />
          <text x="30" y="19" fontSize="11" fontWeight="800" fill="#334155">{asset.tag}</text>
        </g>
      </svg>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
          <Wifi className={cn('h-3.5 w-3.5', asset.connectivity === 'online' ? 'text-emerald-500' : 'text-amber-500')} />
          Connectivity: {asset.connectivity}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
          <Cloud className="h-3.5 w-3.5 text-cyan-500" />
          Library online
        </div>
      </div>
    </div>
  );
}

function FurnaceGeometry({ critical, activePhase }: { critical: boolean; activePhase: PhaseId }) {
  return (
    <g filter="url(#softShadow)">
      <rect x="126" y="58" width="140" height="120" rx="18" fill="white" stroke={critical ? '#fb7185' : '#94a3b8'} strokeWidth="2" />
      <rect x="148" y="82" width="96" height="54" rx="12" fill={critical ? '#fff1f2' : '#eff6ff'} stroke={critical ? '#fb7185' : '#60a5fa'} />
      <motion.circle cx="196" cy="109" r="18" fill="#fed7aa" stroke="#f97316" animate={{ opacity: activePhase >= 5 ? [0.55, 0.95, 0.55] : 0.35 }} transition={{ duration: 1.8, repeat: Infinity }} />
      <path d="M90 154 H126 M266 154 H326" stroke="url(#pipeBlue)" strokeWidth="12" strokeLinecap="round" />
      <path d="M181 58 V34 H218 V58" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
      <rect x="158" y="150" width="72" height="18" rx="9" fill="#e2e8f0" />
    </g>
  );
}

function CompressorGeometry({ critical, activePhase }: { critical: boolean; activePhase: PhaseId }) {
  return (
    <g filter="url(#softShadow)">
      <path d="M78 146 H138" stroke="url(#pipeBlue)" strokeWidth="14" strokeLinecap="round" />
      <path d="M268 146 H338" stroke="url(#pipeBlue)" strokeWidth="14" strokeLinecap="round" />
      <rect x="134" y="96" width="138" height="78" rx="18" fill="white" stroke={critical ? '#fb7185' : '#64748b'} strokeWidth="2" />
      <motion.circle cx="184" cy="135" r="32" fill="#eff6ff" stroke="#60a5fa" strokeWidth="3" animate={{ rotate: activePhase >= 3 ? 360 : 0 }} transformOrigin="184px 135px" transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />
      <circle cx="184" cy="135" r="11" fill="#93c5fd" />
      <rect x="217" y="118" width="40" height="34" rx="9" fill={critical ? '#ffe4e6' : '#ecfeff'} stroke={critical ? '#fb7185' : '#06b6d4'} />
      <path d="M148 174 V195 H257 V174" fill="none" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />
    </g>
  );
}

function PressureLineGeometry({ critical, activePhase }: { critical: boolean; activePhase: PhaseId }) {
  return (
    <g filter="url(#softShadow)">
      <path d="M52 132 H346" stroke={critical ? 'url(#emergencyRed)' : 'url(#pipeBlue)'} strokeWidth="18" strokeLinecap="round" />
      {[112, 198, 286].map((x, index) => (
        <g key={x} transform={`translate(${x} 132)`}>
          <circle r="25" fill="white" stroke={index === 1 ? '#f59e0b' : '#60a5fa'} strokeWidth="2" />
          <motion.path d="M-14 -14 L14 14 M14 -14 L-14 14" stroke={index === 1 ? '#f59e0b' : '#60a5fa'} strokeWidth="5" strokeLinecap="round" animate={{ rotate: activePhase >= 4 ? [0, 12, 0] : 0 }} transition={{ duration: 2.3, repeat: Infinity }} />
        </g>
      ))}
      <path d="M198 107 V73" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />
      <rect x="166" y="48" width="64" height="28" rx="14" fill="#fff" stroke="#cbd5e1" />
      <text x="181" y="66" fontSize="10" fontWeight="800" fill="#475569">Purge</text>
    </g>
  );
}

function ManifoldGeometry({ critical, activePhase }: { critical: boolean; activePhase: PhaseId }) {
  return (
    <g filter="url(#softShadow)">
      <path d="M72 74 H326 M72 132 H326 M72 190 H326" stroke={critical ? 'url(#emergencyRed)' : 'url(#pipeBlue)'} strokeWidth="10" strokeLinecap="round" />
      <path d="M130 74 V190 M212 74 V190 M286 74 V190" stroke="#93c5fd" strokeWidth="10" strokeLinecap="round" />
      {[130, 212, 286].map((x, index) => (
        <g key={x}>
          <motion.circle cx={x} cy={132} r="22" fill="white" stroke={index === 1 ? '#10b981' : '#f59e0b'} strokeWidth="2" animate={{ scale: activePhase >= 6 ? [1, 1.06, 1] : 1 }} transition={{ duration: 1.8, delay: index * 0.2, repeat: Infinity }} />
          <path d={`M${x - 11} 121 L${x + 11} 143 M${x + 11} 121 L${x - 11} 143`} stroke={index === 1 ? '#10b981' : '#f59e0b'} strokeWidth="5" strokeLinecap="round" />
        </g>
      ))}
      <rect x="96" y="205" width="218" height="24" rx="12" fill="#fff" stroke="#cbd5e1" />
      <text x="145" y="221" fontSize="10" fontWeight="800" fill="#475569">Valve position verification</text>
    </g>
  );
}

function GasLineGeometry({ critical, activePhase }: { critical: boolean; activePhase: PhaseId }) {
  return (
    <g filter="url(#softShadow)">
      <path d="M46 142 C100 98, 154 184, 212 132 S300 96, 354 138" stroke={critical ? 'url(#emergencyRed)' : 'url(#pipeBlue)'} strokeWidth="16" strokeLinecap="round" fill="none" />
      <motion.circle cx="214" cy="132" r="44" fill="none" stroke="#fb7185" strokeWidth="3" strokeDasharray="7 7" animate={{ scale: [0.88, 1.15, 0.88], opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 1.2, repeat: Infinity }} />
      <motion.path d="M190 93 L223 93 L209 122 L238 122 L196 180 L207 137 L176 137 Z" fill="#fecdd3" stroke="#fb7185" strokeWidth="2" animate={{ opacity: activePhase >= 1 ? [0.62, 1, 0.62] : 0.5 }} transition={{ duration: 1, repeat: Infinity }} />
      <text x="166" y="211" fontSize="11" fontWeight="900" fill="#be123c">Emergency state</text>
    </g>
  );
}

function UnknownGeometry({ activePhase }: { activePhase: PhaseId }) {
  return (
    <g filter="url(#softShadow)">
      <rect x="118" y="72" width="164" height="118" rx="22" fill="white" stroke="#f59e0b" strokeWidth="2" strokeDasharray="8 6" />
      <motion.circle cx="200" cy="130" r="34" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" animate={{ scale: activePhase >= 1 ? [1, 1.08, 1] : 1 }} transition={{ duration: 1.6, repeat: Infinity }} />
      <text x="190" y="140" fontSize="36" fontWeight="900" fill="#d97706">?</text>
      <text x="126" y="212" fontSize="11" fontWeight="900" fill="#92400e">Asset context required</text>
    </g>
  );
}

function AssetContextCard({ asset, scenario, activePhase }: { asset: AssetContext; scenario: ScenarioConfig; activePhase: PhaseId }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black text-slate-800">
          <Layers className="h-4 w-4 text-cyan-600" />
          Context validation
        </div>
        <StatusChip icon={scenario.contextComplete ? CheckCircle2 : AlertTriangle} label={scenario.contextComplete ? 'Context confirmed' : 'Context missing'} tone={scenario.contextComplete ? 'emerald' : 'amber'} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MiniLabel label="Asset tag" value={asset.tag} tone={scenario.contextComplete ? 'cyan' : 'amber'} />
        <MiniLabel label="System" value={asset.system} tone="blue" />
        <MiniLabel label="Area" value={asset.area} tone="slate" />
        <MiniLabel label="Maintenance" value={asset.lastMaintenanceRelease} tone="amber" />
      </div>
      <AnimatePresence>
        {phaseIsVisible(activePhase, 1) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-3 rounded-2xl border border-cyan-200 bg-cyan-50/70 px-3 py-2 text-[11px] font-semibold text-cyan-800"
          >
            Context detected: {asset.tag} · {asset.installation} · {asset.system}. Official document library is {asset.connectivity === 'online' ? 'online' : 'available in limited mode'}.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TelemetryInspector({ asset, selectedAssetPoint, onSelectPoint }: { asset: AssetContext; selectedAssetPoint?: string; onSelectPoint: (point: TelemetryPoint) => void }) {
  return (
    <div className="min-h-0 rounded-[28px] border border-slate-200 bg-white/90 p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-xs font-black text-slate-800">
        <Gauge className="h-4 w-4 text-blue-600" />
        Field telemetry anchors
      </div>
      <div className="space-y-2">
        {asset.telemetry.map((point) => {
          const Icon = iconForTelemetry(point.kind);
          const tone = telemetryTone(point.status);
          const style = TONE_STYLES[tone];
          const selected = selectedAssetPoint === point.id;
          return (
            <button
              key={point.id}
              type="button"
              onClick={() => onSelectPoint(point)}
              className={cn('flex w-full min-w-0 items-center gap-3 rounded-2xl border px-3 py-2 text-left transition hover:-translate-y-0.5', selected ? `${style.border} ${style.bg} shadow-sm ring-4 ${style.ring}` : 'border-slate-200 bg-white hover:bg-slate-50')}
            >
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', style.soft)}>
                <Icon className={cn('h-4 w-4', style.text)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-black text-slate-800">{point.label}</div>
                <div className="truncate text-[11px] font-semibold text-slate-500">Related: {point.relatedProcedures.join(', ')}</div>
              </div>
              <div className={cn('text-right text-xs font-black', style.text)}>
                {point.value}{point.unit ? ` ${point.unit}` : ''}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function KnowledgeCircuitSpine({ scenario, activePhase }: { scenario: ScenarioConfig; activePhase: PhaseId }) {
  const critical = scenario.riskLevel === 'Critical Emergency';
  const gates: Array<{ id: string; label: string; x: number; tone: Tone; phase: PhaseId }> = [
    { id: 'asset', label: 'Asset Context', x: 8, tone: scenario.contextComplete ? 'cyan' : 'amber', phase: 1 },
    { id: 'docs', label: 'Retrieval', x: 25, tone: 'blue', phase: 3 },
    { id: 'version', label: 'Version Control', x: 42, tone: scenario.conflictMode === 'current-conflict' ? 'rose' : 'emerald', phase: 4 },
    { id: 'safety', label: 'Safety Boundary', x: 59, tone: critical ? 'rose' : 'amber', phase: 5 },
    { id: 'cite', label: 'Citation Anchor', x: 76, tone: 'cyan', phase: 7 },
    { id: 'human', label: 'Human Validation', x: 92, tone: requiresSupervisorValidation(scenario.riskLevel, scenario.procedureType, scenario) ? 'amber' : 'emerald', phase: 8 },
  ];

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black text-slate-800">
          <Route className="h-4 w-4 text-violet-600" />
          Verified knowledge circuit
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Context → sources → boundary → citation → human</div>
      </div>
      <svg viewBox="0 0 100 44" className="h-[74px] w-full">
        <defs>
          <linearGradient id="circuitLine" x1="0" x2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="45%" stopColor="#6366f1" />
            <stop offset="72%" stopColor={critical ? '#f43f5e' : '#f59e0b'} />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path d="M4 24 C17 8, 24 8, 33 24 S52 40, 62 24 S78 8, 96 24" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
        <motion.path d="M4 24 C17 8, 24 8, 33 24 S52 40, 62 24 S78 8, 96 24" fill="none" stroke="url(#circuitLine)" strokeWidth="2.8" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: Math.min(1, activePhase / 10) }} transition={{ duration: 0.8, ease: 'easeInOut' }} />
        {activePhase >= 3 && (
          <>
            <circle r="1.5" fill={critical ? '#fb7185' : '#06b6d4'}>
              <animateMotion dur="3.6s" repeatCount="indefinite" path="M4 24 C17 8, 24 8, 33 24 S52 40, 62 24 S78 8, 96 24" />
            </circle>
            <circle r="1.2" fill="#8b5cf6">
              <animateMotion dur="4.4s" begin="0.8s" repeatCount="indefinite" path="M4 24 C17 8, 24 8, 33 24 S52 40, 62 24 S78 8, 96 24" />
            </circle>
          </>
        )}
        {gates.map((gate) => {
          const enabled = activePhase >= gate.phase;
          return (
            <g key={gate.id}>
              <motion.circle cx={gate.x} cy="24" r={enabled ? 4.8 : 3.7} fill={enabled ? TONE_HEX[gate.tone] : '#cbd5e1'} />
              <circle cx={gate.x} cy="24" r="7" fill="transparent" stroke={enabled ? '#cbd5e1' : '#e2e8f0'} strokeWidth="0.6" />
              <text x={gate.x} y="42" fontSize="3.5" textAnchor="middle" fontWeight="800" fill={enabled ? '#334155' : '#94a3b8'}>{gate.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function OperatorQuestionBubble({
  question,
  activePhase,
  selectedQuestionId,
  onClick,
}: {
  question: OperatorQuestion;
  activePhase: PhaseId;
  selectedQuestionId?: string;
  onClick: () => void;
}) {
  const visible = phaseIsVisible(activePhase, 2);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: visible ? 1 : 0.35, y: visible ? 0 : 8 }}
      className={cn(
        'w-full rounded-[26px] border p-4 text-left shadow-sm transition hover:-translate-y-0.5',
        selectedQuestionId === question.id ? 'border-violet-200 bg-violet-50 ring-4 ring-violet-100' : 'border-slate-200 bg-white',
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-black text-slate-800">
        <MessageSquareText className="h-4 w-4 text-violet-600" />
        Operator question
      </div>
      <p className="text-lg font-black leading-snug tracking-tight text-slate-950">“{question.text}”</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusChip icon={Search} label={`Intent: ${question.intent}`} tone="violet" />
        <StatusChip icon={question.missingContext ? AlertTriangle : BadgeCheck} label={question.missingContext ? 'Missing context' : 'Context available'} tone={question.missingContext ? 'amber' : 'cyan'} />
      </div>
    </motion.button>
  );
}

function QuestionExamples({
  scenario,
  selectedQuestionId,
  onSelectQuestion,
}: {
  scenario: ScenarioConfig;
  selectedQuestionId?: string;
  onSelectQuestion: (question: OperatorQuestion) => void;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white/80 p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
        <BookOpen className="h-3.5 w-3.5" />
        Field phrasing examples
      </div>
      <div className="grid grid-cols-1 gap-2 2xl:grid-cols-2">
        {[scenario.question, ...scenario.alternateQuestions].map((question) => {
          const selected = selectedQuestionId === question.id;
          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onSelectQuestion(question)}
              className={cn('min-w-0 rounded-2xl border px-3 py-2 text-left text-[11px] font-bold transition hover:-translate-y-0.5', selected ? 'border-violet-200 bg-violet-50 text-violet-800 ring-4 ring-violet-100' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}
            >
              <span className="line-clamp-2">“{question.text}”</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ContextValidationStage({ scenario, asset, activePhase }: { scenario: ScenarioConfig; asset: AssetContext; activePhase: PhaseId }) {
  const visible = phaseIsVisible(activePhase, 1);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: visible ? 1 : 0.35, y: visible ? 0 : 8 }}
      className="rounded-[26px] border border-slate-200 bg-white/90 p-3 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', scenario.contextComplete ? 'bg-cyan-50 text-cyan-700' : 'bg-amber-50 text-amber-700')}>
            {scenario.contextComplete ? <BadgeCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-black text-slate-900">{scenario.contextComplete ? 'Asset context validated before guidance' : 'Asset-specific guidance blocked'}</div>
            <div className="truncate text-[11px] font-semibold text-slate-500">
              {scenario.contextComplete ? `${asset.tag} · ${asset.installation} · ${asset.system}` : 'Need installation, equipment tag, system, and maneuver type.'}
            </div>
          </div>
        </div>
        <div className="hidden grid-cols-3 gap-2 lg:grid">
          <StatusChip icon={Wifi} label={asset.connectivity} tone={asset.connectivity === 'online' ? 'emerald' : 'amber'} />
          <StatusChip icon={FileText} label="Controlled docs" tone="blue" />
          <StatusChip icon={History} label="Audit on" tone="violet" />
        </div>
      </div>
    </motion.div>
  );
}

function RetrievalAnimation({
  documents,
  activePhase,
  selectedDocumentId,
  onDocumentClick,
}: {
  documents: RankedProcedureDocument[];
  activePhase: PhaseId;
  selectedDocumentId?: string;
  onDocumentClick: (documentId: string) => void;
}) {
  const visible = phaseIsVisible(activePhase, 3);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: visible ? 1 : 0.25, y: visible ? 0 : 6 }}
      className="rounded-[26px] border border-slate-200 bg-white/90 p-3 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black text-slate-800">
          <Database className="h-4 w-4 text-blue-600" />
          Retrieval and version validation
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{documents.length} sources matched</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {documents.slice(0, 6).map((document, index) => {
          const tone = toneForDocument(document.status);
          const style = TONE_STYLES[tone];
          const selected = selectedDocumentId === document.id;
          const phaseReady = activePhase >= 3 + Math.min(2, index);
          return (
            <motion.button
              key={document.id}
              type="button"
              onClick={() => onDocumentClick(document.id)}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: visible ? (phaseReady ? 1 : 0.38) : 0.25, scale: phaseReady ? 1 : 0.96 }}
              transition={{ duration: 0.28, delay: index * 0.05 }}
              className={cn('min-w-0 rounded-2xl border px-3 py-2 text-left transition hover:-translate-y-0.5', selected ? `${style.border} ${style.bg} ring-4 ${style.ring}` : 'border-slate-200 bg-white hover:bg-slate-50')}
            >
              <div className={cn('truncate text-xs font-black', style.text)}>{document.code}</div>
              <div className="mt-0.5 truncate text-[10px] font-semibold text-slate-500">{document.version} · {statusLabel(document.status)}</div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                <motion.div className={cn('h-1.5 rounded-full', style.dot)} initial={{ width: 0 }} animate={{ width: phaseReady ? `${Math.min(100, document.rankScore)}%` : '18%' }} />
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function CitationBadge({
  citation,
  selected,
  onClick,
}: {
  citation: Citation;
  selected: boolean;
  onClick: (citation: Citation) => void;
}) {
  const tone: Tone = citation.usedForGuidance ? 'cyan' : 'amber';
  const style = TONE_STYLES[tone];
  return (
    <button
      type="button"
      onClick={() => onClick(citation)}
      className={cn('inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-black transition hover:-translate-y-0.5', selected ? `${style.border} ${style.bg} ${style.text} ring-4 ${style.ring}` : 'border-slate-200 bg-white text-slate-600')}
      title={citation.excerpt}
    >
      <Link2 className="h-3 w-3 shrink-0" />
      <span className="truncate">{citation.docCode} · §{citation.section}</span>
    </button>
  );
}

function GuidedStepRow({
  step,
  active,
  selected,
  selectedCitationId,
  onStepClick,
  onCitationClick,
}: {
  step: GuidedStep;
  active: boolean;
  selected: boolean;
  selectedCitationId?: string;
  onStepClick: (stepId: string) => void;
  onCitationClick: (citation: Citation) => void;
}) {
  const style = TONE_STYLES[step.tone];
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: active ? 1 : 0.3, x: active ? 0 : -8 }}
      className={cn('rounded-2xl border p-3 transition', selected ? `${style.border} ${style.bg} ring-4 ${style.ring}` : 'border-slate-200 bg-white/90')}
    >
      <button type="button" onClick={() => onStepClick(step.id)} className="flex w-full gap-3 text-left">
        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black', style.soft, style.text)}>
          {step.index}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h4 className="min-w-0 flex-1 text-sm font-black text-slate-950">{step.label}</h4>
            {step.blockedBy && (
              <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-amber-700">Blocked</span>
            )}
          </div>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">{step.detail}</p>
        </div>
      </button>
      {step.blockedBy && (
        <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800">
          {step.blockedBy}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {step.citations.map((citation) => (
          <CitationBadge key={citation.id} citation={citation} selected={selectedCitationId === citation.id} onClick={onCitationClick} />
        ))}
      </div>
    </motion.div>
  );
}

function BoundaryList({ title, items, tone, icon: Icon }: { title: string; items: string[]; tone: Tone; icon: IconType }) {
  const style = TONE_STYLES[tone];
  return (
    <div className={cn('rounded-2xl border p-3', style.border, style.bg)}>
      <div className={cn('mb-2 flex items-center gap-2 text-xs font-black', style.text)}>
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 text-[11px] font-semibold leading-snug text-slate-700">
            <ChevronRight className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', style.text)} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssistantAnswerPanel({
  answer,
  activePhase,
  selectedStepId,
  selectedCitationId,
  onStepClick,
  onCitationClick,
}: {
  answer: AssistantAnswer;
  activePhase: PhaseId;
  selectedStepId?: string;
  selectedCitationId?: string;
  onStepClick: (stepId: string) => void;
  onCitationClick: (citation: Citation) => void;
}) {
  const visible = phaseIsVisible(activePhase, 6);
  const style = TONE_STYLES[answer.answerTone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: visible ? 1 : 0.2, y: visible ? 0 : 10 }}
      className={cn('min-h-0 rounded-[28px] border bg-white/90 p-4 shadow-sm', answer.mode === 'emergency' ? 'border-rose-200' : answer.mode === 'conflict' ? 'border-amber-200' : 'border-slate-200')}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800">
            <Sparkles className={cn('h-4 w-4', style.text)} />
            Operational guidance grounded in approved sources
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            <StatusChip icon={ShieldCheck} label="Assist, do not authorize" tone="amber" />
            <StatusChip icon={Link2} label={`${answer.citations.length} citation anchors`} tone="cyan" />
            <StatusChip icon={Eye} label={`${answer.confidence}% context confidence`} tone={answer.confidence > 85 ? 'emerald' : 'amber'} />
          </div>
        </div>
        <div className={cn('rounded-2xl border px-3 py-2 text-right', style.border, style.bg)}>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Mode</div>
          <div className={cn('text-xs font-black capitalize', style.text)}>{answer.mode.replace('-', ' ')}</div>
        </div>
      </div>

      <div className={cn('rounded-2xl border p-3', style.border, style.bg)}>
        <p className="text-sm font-semibold leading-relaxed text-slate-800">{answer.summary}</p>
      </div>

      <div className="mt-3 grid min-h-0 grid-cols-1 gap-3 2xl:grid-cols-[minmax(0,1.4fr)_minmax(230px,0.8fr)]">
        <div className="min-h-0 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Guided sequence
          </div>
          <div className="max-h-[342px] space-y-2 overflow-y-auto pr-1">
            {answer.guidedSteps.map((step, index) => (
              <GuidedStepRow
                key={step.id}
                step={step}
                active={visible && activePhase >= 6 && index <= Math.max(0, activePhase - 6)}
                selected={selectedStepId === step.id}
                selectedCitationId={selectedCitationId}
                onStepClick={onStepClick}
                onCitationClick={onCitationClick}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <BoundaryList title="Prerequisites" items={answer.prerequisites} tone="blue" icon={FileCheck2} />
          <BoundaryList title="Safety boundaries" items={answer.warnings} tone={answer.mode === 'emergency' ? 'rose' : 'amber'} icon={ShieldAlert} />
          <BoundaryList title="Forbidden actions" items={answer.forbiddenActions} tone="rose" icon={Lock} />
        </div>
      </div>
    </motion.div>
  );
}

function AssistantWorkspace({
  scenario,
  asset,
  documents,
  answer,
  activePhase,
  selectedQuestionId,
  selectedDocumentId,
  selectedStepId,
  selectedCitationId,
  onQuestionClick,
  onQuestionSelect,
  onDocumentClick,
  onStepClick,
  onCitationClick,
}: {
  scenario: ScenarioConfig;
  asset: AssetContext;
  documents: RankedProcedureDocument[];
  answer: AssistantAnswer;
  activePhase: PhaseId;
  selectedQuestionId?: string;
  selectedDocumentId?: string;
  selectedStepId?: string;
  selectedCitationId?: string;
  onQuestionClick: () => void;
  onQuestionSelect: (question: OperatorQuestion) => void;
  onDocumentClick: (documentId: string) => void;
  onStepClick: (stepId: string) => void;
  onCitationClick: (citation: Citation) => void;
}) {
  return (
    <section className="flex min-h-0 flex-col gap-3">
      <KnowledgeCircuitSpine scenario={scenario} activePhase={activePhase} />
      <div className="grid grid-cols-1 gap-3 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <OperatorQuestionBubble question={scenario.question} activePhase={activePhase} selectedQuestionId={selectedQuestionId} onClick={onQuestionClick} />
        <QuestionExamples scenario={scenario} selectedQuestionId={selectedQuestionId} onSelectQuestion={onQuestionSelect} />
      </div>
      <ContextValidationStage scenario={scenario} asset={asset} activePhase={activePhase} />
      <RetrievalAnimation documents={documents} activePhase={activePhase} selectedDocumentId={selectedDocumentId} onDocumentClick={onDocumentClick} />
      <AssistantAnswerPanel
        answer={answer}
        activePhase={activePhase}
        selectedStepId={selectedStepId}
        selectedCitationId={selectedCitationId}
        onStepClick={onStepClick}
        onCitationClick={onCitationClick}
      />
    </section>
  );
}

function DocumentCard({
  document,
  selected,
  highlighted,
  onClick,
}: {
  document: RankedProcedureDocument;
  selected: boolean;
  highlighted: boolean;
  onClick: (documentId: string) => void;
}) {
  const tone = toneForDocument(document.status);
  const style = TONE_STYLES[tone];
  return (
    <button
      type="button"
      onClick={() => onClick(document.id)}
      className={cn('w-full rounded-2xl border p-3 text-left transition hover:-translate-y-0.5', selected || highlighted ? `${style.border} ${style.bg} ring-4 ${style.ring}` : 'border-slate-200 bg-white hover:bg-slate-50')}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={cn('truncate text-sm font-black', style.text)}>{document.code}</div>
          <div className="line-clamp-2 text-xs font-bold leading-snug text-slate-800">{document.title}</div>
        </div>
        <div className={cn('shrink-0 rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em]', style.border, style.bg, style.text)}>
          {statusLabel(document.status)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-500">
        <div>Version: <span className="font-black text-slate-700">{document.version}</span></div>
        <div>Effective: <span className="font-black text-slate-700">{document.effectiveDate}</span></div>
        <div className="col-span-2 truncate">Owner: <span className="font-black text-slate-700">{document.owner}</span></div>
        <div className="col-span-2 truncate">Section: <span className="font-black text-slate-700">{document.sections[0]?.section} · {document.sections[0]?.title}</span></div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="min-w-0 truncate text-[10px] font-bold text-slate-500">{document.matchReason}</div>
        <div className="shrink-0 text-[10px] font-black text-slate-700">{document.rankScore}%</div>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
        <div className={cn('h-1.5 rounded-full', style.dot)} style={{ width: `${Math.min(100, document.rankScore)}%` }} />
      </div>
    </button>
  );
}

function OfficialSourcesPanel({
  documents,
  selectedDocumentId,
  selectedCitation,
  onDocumentClick,
}: {
  documents: RankedProcedureDocument[];
  selectedDocumentId?: string;
  selectedCitation?: Citation;
  onDocumentClick: (documentId: string) => void;
}) {
  const current = documents.filter((doc) => doc.status === 'current').length;
  const nonGuidance = documents.length - current;
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-slate-800">
            <FileCheck2 className="h-4 w-4 text-emerald-600" />
            Official sources used
          </div>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">Current documents are prioritized. Obsolete or conflicting sources are visible for governance.</p>
        </div>
        <div className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
          <div className="text-sm font-black text-slate-950">{current}</div>
          <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">current</div>
        </div>
      </div>
      <div className="max-h-[396px] space-y-2 overflow-y-auto pr-1">
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            selected={selectedDocumentId === document.id}
            highlighted={selectedCitation?.docId === document.id}
            onClick={onDocumentClick}
          />
        ))}
      </div>
      {nonGuidance > 0 && (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800">
          {nonGuidance} matched source{nonGuidance > 1 ? 's are' : ' is'} shown for traceability or governance and not used as primary guidance.
        </div>
      )}
    </div>
  );
}

function GateMiniStat({ payload, onClick }: { payload: GateClickPayload; onClick: (payload: GateClickPayload) => void }) {
  const style = TONE_STYLES[payload.tone];
  return (
    <button
      type="button"
      onClick={() => onClick(payload)}
      className={cn('rounded-2xl border px-3 py-2 text-left transition hover:-translate-y-0.5', style.border, style.bg)}
    >
      <div className={cn('truncate text-[10px] font-black uppercase tracking-[0.15em]', style.text)}>{payload.label}</div>
      <div className="mt-0.5 truncate text-xs font-bold text-slate-700">{payload.detail}</div>
    </button>
  );
}

function SafetyGatePanel({
  gate,
  scenario,
  onGateClick,
  onRequestSupervisor,
}: {
  gate: SafetyGate;
  scenario: ScenarioConfig;
  onGateClick: (payload: GateClickPayload) => void;
  onRequestSupervisor: () => void;
}) {
  const riskStyle = RISK_STYLES[gate.riskLevel];
  const actionTone: Tone = gate.action === 'emergency-protocol' ? 'rose' : gate.action === 'blocked' ? 'amber' : gate.action === 'requires-escalation' ? 'amber' : 'emerald';
  const actionStyle = TONE_STYLES[actionTone];
  const gateItems: GateClickPayload[] = [
    { label: 'Supervisor', detail: gate.requiresSupervisor ? 'Required' : 'Not mandatory', tone: gate.requiresSupervisor ? 'amber' : 'emerald' },
    { label: 'Permit', detail: gate.requiresPermit ? 'Required' : 'Not required', tone: gate.requiresPermit ? 'amber' : 'emerald' },
    { label: 'LOTO', detail: gate.requiresLoto ? 'Required' : 'Not required', tone: gate.requiresLoto ? 'amber' : 'emerald' },
    { label: 'Control room', detail: gate.requiresControlRoom ? 'Required' : 'Available', tone: gate.requiresControlRoom ? (gate.emergencyMode ? 'rose' : 'cyan') : 'emerald' },
  ];

  return (
    <div className={cn('rounded-[28px] border p-4 shadow-sm', gate.emergencyMode ? 'border-rose-200 bg-rose-50/80' : 'border-slate-200 bg-white/90')}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-slate-800">
            <ShieldAlert className={cn('h-4 w-4', riskStyle.text)} />
            Safety / authorization gate
          </div>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">The assistant explains and cites. It never authorizes execution.</p>
        </div>
        <div className={cn('shrink-0 rounded-2xl border px-3 py-2 text-right', riskStyle.border, riskStyle.bg)}>
          <div className={cn('text-xs font-black', riskStyle.text)}>{riskStyle.label}</div>
          <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">{gate.confidence}% confidence</div>
        </div>
      </div>

      <div className={cn('rounded-2xl border p-3', actionStyle.border, actionStyle.bg)}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className={cn('text-sm font-black', actionStyle.text)}>{gate.compactStatus}</div>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">{gate.reason}</p>
          </div>
          <div className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 44 44" className="h-16 w-16 -rotate-90">
              <circle cx="22" cy="22" r="17" fill="none" stroke="#e2e8f0" strokeWidth="5" />
              <circle cx="22" cy="22" r="17" fill="none" stroke={gate.emergencyMode ? '#fb7185' : gate.readinessScore > 80 ? '#10b981' : '#f59e0b'} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(gate.readinessScore / 100) * 106} 106`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-800">{gate.readinessScore}%</div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {gateItems.map((item) => (
          <GateMiniStat key={item.label} payload={item} onClick={onGateClick} />
        ))}
      </div>

      {gate.blockers.length > 0 && (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2">
          <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            Active blockers
          </div>
          <div className="space-y-1">
            {gate.blockers.slice(0, 4).map((blocker) => (
              <div key={blocker} className="flex items-start gap-2 text-[11px] font-bold text-amber-900">
                <Circle className="mt-1 h-2 w-2 fill-current" />
                <span>{blocker}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onRequestSupervisor}
        className={cn('mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black shadow-sm transition hover:-translate-y-0.5', gate.emergencyMode ? 'bg-rose-600 text-white hover:bg-rose-700' : gate.requiresSupervisor || scenario.conflictMode === 'current-conflict' ? 'bg-slate-950 text-white hover:bg-slate-800' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}
      >
        <Send className="h-4 w-4" />
        {gate.emergencyMode ? 'Send emergency notification' : gate.requiresSupervisor ? 'Request supervisor validation' : 'Share guidance package'}
      </button>
    </div>
  );
}

function ChecklistPanel({
  checklist,
  onToggle,
}: {
  checklist: ChecklistItem[];
  onToggle: (item: ChecklistItem) => void;
}) {
  const readiness = calculateReadinessScore(checklist);
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black text-slate-800">
          <ClipboardCheck className="h-4 w-4 text-blue-600" />
          Readiness checklist
        </div>
        <div className={cn('rounded-full border px-2.5 py-1 text-[10px] font-black', readiness >= 80 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700')}>
          {readiness}% ready
        </div>
      </div>
      <div className="max-h-[244px] space-y-2 overflow-y-auto pr-1">
        {checklist.map((item) => {
          const tone: Tone = item.checked ? 'emerald' : item.required ? 'amber' : 'slate';
          const style = TONE_STYLES[tone];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item)}
              className={cn('flex w-full items-start gap-3 rounded-2xl border px-3 py-2 text-left transition hover:-translate-y-0.5', item.checked ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white hover:bg-slate-50')}
            >
              <div className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border', item.checked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-transparent')}>
                <Check className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-slate-800">{item.label}</div>
                <div className="mt-0.5 flex flex-wrap gap-1.5">
                  <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em]', style.soft, style.text)}>{item.required ? 'Required' : 'Supporting'}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">{item.source}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GovernanceBoundaryPanel({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const rules = [
    'Never authorize execution.',
    'Never bypass permits, LOTO, interlocks, or control room authority.',
    'Never continue normal guidance during emergency conditions.',
    'Never answer asset-specific procedures without asset context.',
    'Never use obsolete documents as primary sources.',
    'Escalate unresolved conflicts between current documents.',
    'Cite every procedural instruction.',
    'Log relevant consultations for traceability.',
  ];

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-sm">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-2 text-xs font-black text-slate-800">
          <ShieldCheck className="h-4 w-4 text-violet-600" />
          AI boundaries
        </div>
        <ChevronRight className={cn('h-4 w-4 text-slate-400 transition', expanded && 'rotate-90')} />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 grid grid-cols-1 gap-2">
              {rules.map((rule) => (
                <div key={rule} className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-700">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ValueImpactPanel({ metrics, chartData, scenario }: { metrics: SystemMetrics; chartData: Array<{ label: string; value: number }>; scenario: ScenarioConfig }) {
  const cards = metricCards(metrics, scenario);
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-slate-800">
            <Activity className="h-4 w-4 text-cyan-600" />
            Operational value signal
          </div>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{metrics.primaryOutcome}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
          <div className="text-sm font-black text-slate-950">-{metrics.decisionLatencyReductionPct}%</div>
          <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">latency</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {cards.map((metric) => (
          <MetricPill key={metric.id} metric={metric} />
        ))}
      </div>
      <div className="mt-3 h-[110px] rounded-2xl border border-slate-200 bg-slate-50 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="impactArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 11 }} />
            <Area type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={2} fill="url(#impactArea)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 rounded-2xl border border-violet-200 bg-violet-50 px-3 py-2 text-[11px] font-bold text-violet-800">
        Document friction detected: {metrics.repeatedQuestionsThisMonth} repeated questions this month · {metrics.dominantConstraint}.
      </div>
    </div>
  );
}

function MetricPill({ metric }: { metric: ValueMetric }) {
  const style = TONE_STYLES[metric.tone];
  return (
    <div className={cn('min-w-0 rounded-2xl border px-3 py-2', style.border, style.bg)}>
      <div className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{metric.label}</div>
      <div className="mt-1 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[10px] font-semibold text-slate-400">{metric.before}</div>
          <div className={cn('truncate text-sm font-black', style.text)}>{metric.after}</div>
        </div>
        <div className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[9px] font-black text-slate-500">{metric.delta}</div>
      </div>
    </div>
  );
}

function TraceabilityTimeline({
  activePhase,
  traceEvents,
  selectedTraceEventId,
  onPhaseClick,
  onTraceClick,
}: {
  activePhase: PhaseId;
  traceEvents: TraceEvent[];
  selectedTraceEventId?: string;
  onPhaseClick: (phase: PhaseId) => void;
  onTraceClick: (event: TraceEvent) => void;
}) {
  return (
    <footer className="relative z-10 grid h-[154px] shrink-0 grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)] gap-3 border-t border-slate-200 bg-white/75 px-5 py-3 shadow-[0_-18px_55px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      <div className="rounded-[26px] border border-slate-200 bg-white/90 p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800">
            <Route className="h-4 w-4 text-blue-600" />
            Process timeline
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Click any phase</div>
        </div>
        <div className="grid grid-cols-11 gap-1.5">
          {PHASES.map((phase) => {
            const style = TONE_STYLES[phase.tone];
            const active = activePhase >= phase.id;
            const current = activePhase === phase.id;
            const Icon = phase.icon;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => onPhaseClick(phase.id)}
                className={cn('group min-w-0 rounded-2xl border px-2 py-2 text-center transition hover:-translate-y-0.5', current ? `${style.border} ${style.bg} ring-4 ${style.ring}` : active ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-55')}
              >
                <div className={cn('mx-auto flex h-7 w-7 items-center justify-center rounded-xl', active ? style.soft : 'bg-slate-100')}>
                  <Icon className={cn('h-3.5 w-3.5', active ? style.text : 'text-slate-400')} />
                </div>
                <div className="mt-1 truncate text-[9px] font-black text-slate-700">{phase.shortLabel}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0 rounded-[26px] border border-slate-200 bg-white/90 p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800">
            <History className="h-4 w-4 text-violet-600" />
            Trace log
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Audit ready</div>
        </div>
        <div className="max-h-[102px] space-y-1.5 overflow-y-auto pr-1">
          {traceEvents.slice().reverse().map((event) => {
            const selected = selectedTraceEventId === event.id;
            const tone: Tone = event.status === 'blocked' ? 'rose' : event.status === 'escalated' ? 'amber' : event.status === 'running' ? 'blue' : 'emerald';
            const style = TONE_STYLES[tone];
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onTraceClick(event)}
                className={cn('flex w-full min-w-0 items-start gap-2 rounded-xl border px-2.5 py-1.5 text-left transition hover:bg-slate-50', selected ? `${style.border} ${style.bg}` : 'border-slate-200 bg-white')}
              >
                <span className="shrink-0 text-[10px] font-black text-slate-400">{event.timestamp}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-black text-slate-800">{event.label}</span>
                  <span className="block truncate text-[10px] font-semibold text-slate-500">{event.detail}</span>
                </span>
                <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.12em]', style.soft, style.text)}>{event.status}</span>
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
}

function RightPanel({
  scenario,
  documents,
  gate,
  checklist,
  metrics,
  chartData,
  selectedDocumentId,
  selectedCitation,
  showGovernanceRules,
  onDocumentClick,
  onGateClick,
  onChecklistToggle,
  onRequestSupervisor,
  onToggleGovernance,
}: {
  scenario: ScenarioConfig;
  documents: RankedProcedureDocument[];
  gate: SafetyGate;
  checklist: ChecklistItem[];
  metrics: SystemMetrics;
  chartData: Array<{ label: string; value: number }>;
  selectedDocumentId?: string;
  selectedCitation?: Citation;
  showGovernanceRules: boolean;
  onDocumentClick: (documentId: string) => void;
  onGateClick: (payload: GateClickPayload) => void;
  onChecklistToggle: (item: ChecklistItem) => void;
  onRequestSupervisor: () => void;
  onToggleGovernance: () => void;
}) {
  return (
    <section className="flex min-h-0 flex-col gap-3 overflow-hidden">
      <div className="min-h-0 overflow-y-auto pr-1">
        <div className="space-y-3">
          <OfficialSourcesPanel documents={documents} selectedDocumentId={selectedDocumentId} selectedCitation={selectedCitation} onDocumentClick={onDocumentClick} />
          <SafetyGatePanel gate={gate} scenario={scenario} onGateClick={onGateClick} onRequestSupervisor={onRequestSupervisor} />
          <ChecklistPanel checklist={checklist} onToggle={onChecklistToggle} />
          <GovernanceBoundaryPanel expanded={showGovernanceRules} onToggle={onToggleGovernance} />
          <ValueImpactPanel metrics={metrics} chartData={chartData} scenario={scenario} />
        </div>
      </div>
    </section>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 border-b border-slate-100 py-2 text-xs">
      <div className="font-black uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="font-bold text-slate-800">{value}</div>
    </div>
  );
}

function DocumentViewerOverlay({
  open,
  document,
  citation,
  onClose,
  onShare,
}: {
  open: boolean;
  document?: RankedProcedureDocument;
  citation?: Citation;
  onClose: () => void;
  onShare: () => void;
}) {
  return null;

  const section = document && citation ? findDocumentSection(document, citation.section) : document?.sections[0];
  const tone = document ? toneForDocument(document.status) : 'slate';
  const style = TONE_STYLES[tone];

  return (
    <AnimatePresence>
      {open && document && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 p-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="relative grid h-[82vh] w-[min(1180px,94vw)] grid-cols-[380px_minmax(0,1fr)] overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.22)]"
          >
            <div className={cn('border-r p-5', style.border, style.bg)}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]', style.border, 'bg-white/70', style.text)}>
                    <FileText className="h-3.5 w-3.5" />
                    Internal document viewer
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-950">{document.code}</h3>
                  <p className="mt-1 text-sm font-bold leading-snug text-slate-700">{document.title}</p>
                </div>
                <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm">
                <MetaRow label="Version" value={document.version} />
                <MetaRow label="Effective" value={document.effectiveDate} />
                <MetaRow label="Approval" value={statusLabel(document.status)} />
                <MetaRow label="Owner" value={document.owner} />
                <MetaRow label="Criticality" value={document.criticality} />
                <MetaRow label="Used" value={document.usedForGuidance ? 'Used for cited guidance' : 'Traceability / reference only'} />
              </div>

              <div className="mt-5 space-y-2">
                <button type="button" onClick={onShare} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black text-white shadow-sm transition hover:bg-slate-800">
                  <Send className="h-4 w-4" />
                  Share with supervisor
                </button>
                <button type="button" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50">
                  <Eye className="h-4 w-4" />
                  Open full procedure
                </button>
              </div>

              {document.replacedBy && (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                  This document is replaced by {document.replacedBy}. It is not used as primary guidance.
                </div>
              )}
            </div>

            <div className="min-w-0 overflow-y-auto bg-white p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Highlighted source fragment</div>
                  <h4 className="mt-1 text-xl font-black text-slate-950">§{section?.section} · {section?.title}</h4>
                </div>
                <div className={cn('rounded-2xl border px-3 py-2 text-right', style.border, style.bg)}>
                  <div className={cn('text-sm font-black', style.text)}>{citation ? `${citation.confidence}%` : `${document.rankScore}%`}</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">relevance</div>
                </div>
              </div>

              <div className="relative rounded-[28px] border border-cyan-200 bg-cyan-50/70 p-5 shadow-sm">
                <div className="absolute -left-2 top-8 h-4 w-4 rounded-full border border-cyan-200 bg-cyan-50" />
                <p className="text-base font-bold leading-relaxed text-slate-800">{section?.excerpt}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusChip icon={Link2} label={`Source: ${document.code} · ${document.version} · §${section?.section}`} tone="cyan" />
                  <StatusChip icon={BadgeCheck} label={statusLabel(document.status)} tone={tone} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-black text-slate-800">
                    <ClipboardCheck className="h-4 w-4 text-blue-600" />
                    Section steps
                  </div>
                  <div className="space-y-2">
                    {(section?.steps ?? []).map((step, index) => (
                      <div key={step} className="flex gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-black text-blue-700">{index + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-black text-slate-800">
                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                    Warnings and prerequisites
                  </div>
                  <div className="space-y-2">
                    {(section?.warnings ?? []).map((warning) => (
                      <div key={warning} className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">{warning}</div>
                    ))}
                    {(section?.prerequisites ?? []).map((item) => (
                      <div key={item} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">{item}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-violet-200 bg-violet-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-black text-violet-800">
                  <Sparkles className="h-4 w-4" />
                  Citation connection
                </div>
                <p className="text-xs font-semibold leading-relaxed text-violet-900">
                  This highlighted fragment is connected to the selected assistant response block. The operator sees the answer and the controlled source together, including version, owner, section, and approval state.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SupervisorEscalationOverlay({
  open,
  escalation,
  onClose,
  onAcknowledge,
}: {
  open: boolean;
  escalation: SupervisorEscalation;
  onClose: () => void;
  onAcknowledge: () => void;
}) {
  const riskStyle = RISK_STYLES[escalation.riskLevel];
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 p-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            className="w-[min(760px,94vw)] overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.22)]"
          >
            <div className={cn('border-b p-5', riskStyle.border, riskStyle.bg)}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className={cn('inline-flex items-center gap-2 rounded-full border bg-white/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]', riskStyle.border, riskStyle.text)}>
                    <UserCheck className="h-3.5 w-3.5" />
                    Supervisor validation
                  </div>
                  <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                    {escalation.status === 'sent' || escalation.status === 'acknowledged' ? 'Sent to Shift Supervisor' : 'Supervisor confirmation required'}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-slate-700">{escalation.summary}</p>
                </div>
                <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <MiniLabel label="Recipient" value={escalation.recipient} tone="amber" />
                <MiniLabel label="Channel" value={escalation.channel} tone="cyan" />
                <MiniLabel label="Asset" value={escalation.asset} tone="blue" />
                <MiniLabel label="Risk" value={escalation.riskLevel} tone={escalation.riskLevel === 'Critical Emergency' ? 'rose' : 'amber'} />
              </div>

              <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-black text-slate-800">
                  <FileCheck2 className="h-4 w-4 text-emerald-600" />
                  Procedure and cited sections attached
                </div>
                <div className="flex flex-wrap gap-2">
                  {escalation.includedSources.map((source) => (
                    <span key={source} className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] font-black text-cyan-700">{source}</span>
                  ))}
                </div>
                <div className="mt-3 rounded-2xl border border-white bg-white px-3 py-2 text-xs font-bold text-slate-700">{escalation.procedure}</div>
                <div className="mt-2 rounded-2xl border border-white bg-white px-3 py-2 text-xs font-bold text-slate-700">{escalation.checklistStatus}</div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {['Procedure attached', 'Citations included', 'Execution not authorized'].map((item, index) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm">
                    <div className={cn('mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl', index === 2 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700')}>
                      {index === 2 ? <Lock className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div className="text-[11px] font-black text-slate-700">{item}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-50">Close</button>
                <button type="button" onClick={onAcknowledge} className={cn('rounded-2xl px-4 py-3 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5', escalation.riskLevel === 'Critical Emergency' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-950 hover:bg-slate-800')}>
                  Mark validation requested
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AmbientBackground({ scenario }: { scenario: ScenarioConfig }) {
  const emergency = scenario.riskLevel === 'Critical Emergency';
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#F8FAFC_0%,#EFF6FF_44%,#F8FAFC_100%)]" />
      <motion.div
        className={cn('absolute -left-20 top-10 h-72 w-72 rounded-full blur-3xl', emergency ? 'bg-rose-200/40' : 'bg-cyan-200/40')}
        animate={{ x: [0, 30, 0], y: [0, 18, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 top-20 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl"
        animate={{ x: [0, -24, 0], y: [0, 28, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.92),transparent_42%)]" />
    </div>
  );
}

export default function BizCaseA() {
  const [activeScenario, setActiveScenario] = useState<ScenarioId>('compressor-isolation');
  const [activePhase, setActivePhase] = useState<PhaseId>(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>(undefined);
  const [selectedCitationId, setSelectedCitationId] = useState<string | undefined>(undefined);
  const [selectedChecklist, setSelectedChecklist] = useState<Record<string, boolean>>({});
  const [selectedAssetPoint, setSelectedAssetPoint] = useState<string | undefined>(undefined);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [showSupervisorOverlay, setShowSupervisorOverlay] = useState(false);
  const [showGovernanceRules, setShowGovernanceRules] = useState(false);
  const [simulationTick, setSimulationTick] = useState(0);
  const [manualMode, setManualMode] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | undefined>(undefined);
  const [traceEvents, setTraceEvents] = useState<TraceEvent[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>(undefined);
  const [selectedTraceEventId, setSelectedTraceEventId] = useState<string | undefined>(undefined);
  const [escalationStatus, setEscalationStatus] = useState<EscalationStatus>('available');

  const traceNonceRef = useRef(0);
  const mainRef = useRef<HTMLDivElement | null>(null);

  const scenario = useMemo(() => getScenarioConfig(activeScenario), [activeScenario]);
  const asset = useMemo(() => getAssetContext(scenario.assetId), [scenario.assetId]);
  const applicableDocuments = useMemo(() => getApplicableDocuments(scenario), [scenario]);
  const rankedDocuments = useMemo(() => rankDocumentsByContext(applicableDocuments, asset, scenario), [applicableDocuments, asset, scenario]);
  const approvedSourceCount = useMemo(() => filterApprovedSources(rankedDocuments, scenario).length, [rankedDocuments, scenario]);
  const riskLevel = useMemo(() => detectRiskLevel(scenario.question, asset, scenario), [scenario, asset]);
  const checklist = useMemo(() => applyChecklistState(scenario.checklist, selectedChecklist), [scenario.checklist, selectedChecklist]);
  const answer = useMemo(() => buildAssistantAnswer(scenario, rankedDocuments, riskLevel), [scenario, rankedDocuments, riskLevel]);
  const selectedCitation = useMemo(() => (selectedCitationId ? answer.citations.find((citation) => citation.id === selectedCitationId) : undefined), [answer.citations, selectedCitationId]);
  const citationJourney = useMemo(() => (selectedCitationId ? getCitationJourney(selectedCitationId, answer, rankedDocuments) : {}), [selectedCitationId, answer, rankedDocuments]);
  const selectedDocument = useMemo(() => {
    if (citationJourney.document) return citationJourney.document;
    return rankedDocuments.find((doc) => doc.id === selectedDocumentId);
  }, [citationJourney.document, rankedDocuments, selectedDocumentId]);
  const gate = useMemo(() => buildSafetyGate(scenario, riskLevel, checklist), [scenario, riskLevel, checklist]);
  const metrics = useMemo(() => buildValueMetrics(scenario), [scenario]);
  const chartData = useMemo(() => buildChartData(metrics), [metrics]);
  const escalation = useMemo(() => buildSupervisorEscalation(scenario, rankedDocuments, riskLevel, checklist, escalationStatus), [scenario, rankedDocuments, riskLevel, checklist, escalationStatus]);

  const nextTraceNonce = () => {
    traceNonceRef.current += 1;
    return traceNonceRef.current;
  };

  const addInteractionTrace = (label: string, detail: string, phase: PhaseId = activePhase) => {
    const nonce = nextTraceNonce();
    setTraceEvents((events) => appendTraceUnique(events, interactionTrace(scenario, label, detail, nonce, phase)));
  };

  useEffect(() => {
    setActivePhase(0);
    setSelectedDocumentId(undefined);
    setSelectedCitationId(undefined);
    setSelectedChecklist(seedChecklistState(scenario.checklist));
    setSelectedAssetPoint(asset.telemetry[0]?.id);
    setShowDocumentViewer(false);
    setShowSupervisorOverlay(false);
    setShowGovernanceRules(false);
    setSelectedQuestionId(scenario.question.id);
    setSelectedStepId(undefined);
    setSelectedTraceEventId(undefined);
    setEscalationStatus(requiresSupervisorValidation(scenario.riskLevel, scenario.procedureType, scenario) ? 'available' : 'not-required');
    setTraceEvents(buildInitialTraceEvents(scenario, rankedDocuments, 0));
    traceNonceRef.current = 0;
  }, [activeScenario]);

  useEffect(() => {
    const tick = window.setInterval(() => setSimulationTick((value) => (value + 1) % 1000), 1200);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!autoPlay || manualMode) return;
    const timer = window.setInterval(() => {
      setActivePhase((phase) => (phase >= 10 ? 0 : clampPhase(phase + 1)));
    }, 1750);
    return () => window.clearInterval(timer);
  }, [autoPlay, manualMode]);

  useEffect(() => {
    setTraceEvents((events) => appendTraceUnique(events, buildTraceLogEntry(scenario, rankedDocuments, activePhase)));
    if (activePhase === 0) {
      setShowDocumentViewer(false);
      setShowSupervisorOverlay(false);
    }
    if (activePhase === 7 && answer.citations[0]) {
      const citation = answer.citations[0];
      setSelectedCitationId(citation.id);
      setSelectedDocumentId(citation.docId);
      setSelectedStepId(citation.answerBlockId);
      setShowDocumentViewer(false);
    }
    if (activePhase === 8 && requiresSupervisorValidation(riskLevel, scenario.procedureType, scenario)) {
      if (autoPlay && !manualMode) setEscalationStatus('sent');
    }
    if (activePhase >= 9 && escalationStatus === 'sent') {
      setEscalationStatus('acknowledged');
    }
  }, [activePhase, scenario, rankedDocuments, answer.citations, riskLevel, autoPlay, manualMode, escalationStatus]);

  const handleScenarioChange = (scenarioId: ScenarioId) => {
    setManualMode(false);
    setAutoPlay(false);
    setActiveScenario(scenarioId);
  };

  const handleReset = () => {
    setManualMode(false);
    setActivePhase(0);
    setAutoPlay(false);
    setSelectedDocumentId(undefined);
    setSelectedCitationId(undefined);
    setSelectedStepId(undefined);
    setShowDocumentViewer(false);
    setShowSupervisorOverlay(false);
    setTraceEvents(buildInitialTraceEvents(scenario, rankedDocuments, 0));
  };

  const handleTogglePlay = () => {
    setManualMode(false);
    setAutoPlay((value) => !value);
  };

  const handlePhaseClick = (phase: PhaseId) => {
    setManualMode(true);
    setAutoPlay(false);
    setActivePhase(phase);
    addInteractionTrace('Phase manually selected', `Viewer jumped to phase ${phase}: ${PHASES.find((item) => item.id === phase)?.label ?? 'unknown'}`, phase);
  };

  const handleDocumentClick = (documentId: string) => {
    setManualMode(true);
    setAutoPlay(false);
    setSelectedDocumentId(documentId);
    setSelectedCitationId(undefined);
    setShowDocumentViewer(true);
    const document = rankedDocuments.find((doc) => doc.id === documentId);
    addInteractionTrace('Document opened', document ? `${document.code} · ${statusLabel(document.status)}` : 'Document opened', 7);
  };

  const handleCitationClick = (citation: Citation) => {
    setManualMode(true);
    setAutoPlay(false);
    setSelectedCitationId(citation.id);
    setSelectedDocumentId(citation.docId);
    setSelectedStepId(citation.answerBlockId);
    setShowDocumentViewer(true);
    addInteractionTrace('Citation opened', `${citation.docCode} §${citation.section} connected to answer block`, 7);
  };

  const handleChecklistToggle = (item: ChecklistItem) => {
    setManualMode(true);
    setAutoPlay(false);
    setSelectedChecklist((state) => ({ ...state, [item.id]: !(state[item.id] ?? item.checked) }));
    addInteractionTrace('Checklist updated', `${item.label} toggled. Source: ${item.source}`, 5);
  };

  const handleAssetPoint = (point: TelemetryPoint) => {
    setManualMode(true);
    setAutoPlay(false);
    setSelectedAssetPoint(point.id);
    setActivePhase((phase) => clampPhase(Math.max(phase, 1)));
    addInteractionTrace('Telemetry point selected', `${point.label}: ${point.value}${point.unit ? ` ${point.unit}` : ''}. Related sources: ${point.relatedProcedures.join(', ')}`, 1);
  };

  const handleQrClick = () => {
    setManualMode(true);
    setAutoPlay(false);
    setActivePhase((phase) => clampPhase(Math.max(phase, 1)));
    addInteractionTrace('QR context inspected', `${asset.qrStatus === 'verified' ? 'QR scan verified' : 'QR context incomplete'} for ${asset.tag}`, 1);
  };

  const handleQuestionSelect = (question: OperatorQuestion) => {
    setManualMode(true);
    setAutoPlay(false);
    setSelectedQuestionId(question.id);
    setActivePhase((phase) => clampPhase(Math.max(phase, 2)));
    addInteractionTrace('Question phrasing selected', question.text, 2);
  };

  const handleQuestionClick = () => {
    setManualMode(true);
    setAutoPlay(false);
    setActivePhase((phase) => clampPhase(Math.max(phase, 2)));
    addInteractionTrace('Operator question inspected', scenario.question.text, 2);
  };

  const handleStepClick = (stepId: string) => {
    setManualMode(true);
    setAutoPlay(false);
    setSelectedStepId(stepId);
    const step = answer.guidedSteps.find((item) => item.id === stepId);
    if (step?.citations[0]) {
      setSelectedCitationId(step.citations[0].id);
      setSelectedDocumentId(step.citations[0].docId);
    }
    addInteractionTrace('Guided step selected', step ? step.label : 'Step selected', 6);
  };

  const handleGateClick = (payload: GateClickPayload) => {
    setManualMode(true);
    setAutoPlay(false);
    addInteractionTrace('Safety gate detail inspected', `${payload.label}: ${payload.detail}`, 5);
  };

  const handleRequestSupervisor = () => {
    setManualMode(true);
    setAutoPlay(false);
    setEscalationStatus('sent');
    setShowSupervisorOverlay(true);
    addInteractionTrace('Supervisor escalation requested', escalation.summary, 8);
  };

  const handleAcknowledgeEscalation = () => {
    setEscalationStatus('acknowledged');
    setShowSupervisorOverlay(false);
    addInteractionTrace('Supervisor escalation acknowledged', 'Validation package status changed to acknowledged in the demo trace.', 8);
  };

  const handleTraceClick = (event: TraceEvent) => {
    setManualMode(true);
    setAutoPlay(false);
    setSelectedTraceEventId(event.id);
    setActivePhase(event.phase);
  };

  const handleControlRoomClick = () => {
    setManualMode(true);
    setAutoPlay(false);
    setShowSupervisorOverlay(true);
    setEscalationStatus(scenario.riskLevel === 'Critical Emergency' ? 'sent' : 'available');
    addInteractionTrace('Control room link opened', `${asset.controlRoomLink} channel for ${asset.tag}`, 8);
  };

  const handleShareDocument = () => {
    setShowDocumentViewer(false);
    setEscalationStatus('sent');
    setShowSupervisorOverlay(true);
    addInteractionTrace('Document shared with supervisor', selectedDocument ? `${selectedDocument.code} included in validation package` : 'Document included in validation package', 8);
  };

  const selectedDocumentForViewer = selectedDocument;
  const currentCitationForViewer = selectedCitation ?? citationJourney.citation;

  return (
    <div ref={mainRef} className="relative h-screen w-screen overflow-hidden bg-slate-50 text-slate-950">
      <AmbientBackground scenario={scenario} />
      <style>{`
        @keyframes pp-soft-pulse {
          0%, 100% { opacity: .65; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        .pp-scrollbar::-webkit-scrollbar { width: 7px; height: 7px; }
        .pp-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, .45); border-radius: 999px; }
        .pp-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <Header
          scenario={scenario}
          asset={asset}
          activePhase={activePhase}
          autoPlay={autoPlay}
          onTogglePlay={handleTogglePlay}
          onReset={handleReset}
          onScenarioChange={handleScenarioChange}
        />

        <main className="min-h-0 flex-1 overflow-hidden p-5">
          <div className="grid h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-[410px_minmax(0,1fr)_420px]">
            <div className="hidden min-h-0 flex-col gap-3 xl:flex">
              <ScenarioRail activeScenario={activeScenario} onScenarioChange={handleScenarioChange} />
              <FieldAssetScene
                asset={asset}
                scenario={scenario}
                activePhase={activePhase}
                selectedAssetPoint={selectedAssetPoint}
                onSelectPoint={handleAssetPoint}
                onQrClick={handleQrClick}
                onControlRoomClick={handleControlRoomClick}
              />
            </div>

            <div className="min-h-0 overflow-y-auto pr-1 pp-scrollbar">
              <AssistantWorkspace
                scenario={scenario}
                asset={asset}
                documents={rankedDocuments}
                answer={answer}
                activePhase={activePhase}
                selectedQuestionId={selectedQuestionId}
                selectedDocumentId={selectedDocumentId}
                selectedStepId={selectedStepId}
                selectedCitationId={selectedCitationId}
                onQuestionClick={handleQuestionClick}
                onQuestionSelect={handleQuestionSelect}
                onDocumentClick={handleDocumentClick}
                onStepClick={handleStepClick}
                onCitationClick={handleCitationClick}
              />
            </div>

            <RightPanel
              scenario={scenario}
              documents={rankedDocuments}
              gate={gate}
              checklist={checklist}
              metrics={metrics}
              chartData={chartData}
              selectedDocumentId={selectedDocumentId}
              selectedCitation={selectedCitation}
              showGovernanceRules={showGovernanceRules}
              onDocumentClick={handleDocumentClick}
              onGateClick={handleGateClick}
              onChecklistToggle={handleChecklistToggle}
              onRequestSupervisor={handleRequestSupervisor}
              onToggleGovernance={() => setShowGovernanceRules((value) => !value)}
            />
          </div>
        </main>

        <TraceabilityTimeline
          activePhase={activePhase}
          traceEvents={traceEvents}
          selectedTraceEventId={selectedTraceEventId}
          onPhaseClick={handlePhaseClick}
          onTraceClick={handleTraceClick}
        />
      </div>

      <DocumentViewerOverlay
        open={showDocumentViewer}
        document={selectedDocumentForViewer}
        citation={currentCitationForViewer}
        onClose={() => setShowDocumentViewer(false)}
        onShare={handleShareDocument}
      />

      <SupervisorEscalationOverlay
        open={showSupervisorOverlay}
        escalation={escalation}
        onClose={() => setShowSupervisorOverlay(false)}
        onAcknowledge={handleAcknowledgeEscalation}
      />

      <div className="pointer-events-none absolute bottom-[160px] right-[456px] z-20 hidden xl:block">
        <div className={cn('rounded-full border bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] shadow-sm backdrop-blur', autoPlay && !manualMode ? 'border-emerald-200 text-emerald-700' : 'border-blue-200 text-blue-700')}>
          {autoPlay && !manualMode ? `Live demo mode · ${approvedSourceCount} approved sources` : `Manual mode · tick ${simulationTick} · ${approvedSourceCount} approved sources`}
        </div>
      </div>
    </div>
  );
}
