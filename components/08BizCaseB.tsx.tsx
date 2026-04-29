import { type ComponentType, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  Eye,
  Factory,
  FileText,
  Filter,
  Gauge,
  GitBranch,
  GitMerge,
  Layers3,
  Link2,
  MapPin,
  Pause,
  PencilLine,
  Play,
  RotateCcw,
  Scissors,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  X,
  Workflow,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

type Domain = 'drilling' | 'production' | 'maintenance' | 'hse';

type ReportType =
  | 'DDR'
  | 'CompanyManReport'
  | 'DirectionalReport'
  | 'MudLogging'
  | 'ProductionDaily'
  | 'ControlRoomLog'
  | 'BatteryReport'
  | 'CompressorReport'
  | 'MaintenanceWorkOrder'
  | 'ReliabilityReport'
  | 'VibrationReport'
  | 'HSENearMiss'
  | 'IncidentReport';

type EventCategory =
  | 'HighTorque'
  | 'ROPDrop'
  | 'CompressorTrip'
  | 'HighTemperature'
  | 'PumpVibration'
  | 'MWDFailure'
  | 'StuckPipeRisk'
  | 'LineRestriction'
  | 'MaterialDelay'
  | 'NearMiss'
  | 'MaintenanceCorrective'
  | 'FlowDeviation';

type CauseType = 'reported_fact' | 'hypothesis' | 'unknown' | 'conflicting';
type ConfidenceLevel = 'high' | 'medium' | 'low' | 'missing';

type ValidationStatus =
  | 'pending_review'
  | 'approved'
  | 'corrected'
  | 'ambiguous'
  | 'split'
  | 'merged';

type Severity = 'low' | 'medium' | 'high' | 'critical';
type Tone = 'slate' | 'cyan' | 'blue' | 'violet' | 'emerald' | 'amber' | 'rose';
type ScenarioId =
  | 'drillingTorque'
  | 'compressorTrip'
  | 'pumpVibration'
  | 'mwdFailure'
  | 'stuckPipeRisk'
  | 'lineRestriction'
  | 'hseNearMiss';
type DeckMode = 'timeline' | 'search' | 'similar' | 'clusters' | 'predictive';
type OverlayMode = 'none' | 'document' | 'validation' | 'detail';

type PhaseId =
  | 'archive'
  | 'document'
  | 'highlight'
  | 'fields'
  | 'validation'
  | 'traceability'
  | 'timeline'
  | 'similar'
  | 'clusters'
  | 'predictive'
  | 'complete';

type FieldKey =
  | 'domain'
  | 'reportType'
  | 'sourceDocument'
  | 'authorRole'
  | 'date'
  | 'shift'
  | 'asset'
  | 'assetTag'
  | 'well'
  | 'facility'
  | 'activity'
  | 'eventCategory'
  | 'anomaly'
  | 'cause'
  | 'causeType'
  | 'actionTaken'
  | 'result'
  | 'duration'
  | 'nptHours'
  | 'severity'
  | 'operationalImpact'
  | 'confidence'
  | 'validationStatus'
  | 'normalizedLabel'
  | 'sourceExcerpt';

type ValidationActionKind = 'approve' | 'edit' | 'split' | 'merge' | 'ambiguous' | 'correctCategory';

interface ToneClasses {
  bg: string;
  border: string;
  text: string;
  soft: string;
  fill: string;
  ring: string;
  gradient: string;
}

interface ReportAuthor {
  name: string;
  role: string;
  reliabilityScore: number;
}

interface SourceSpan {
  id: string;
  text: string;
  label: string;
  tone: Tone;
  fieldKey: FieldKey;
  start: number;
  end: number;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  explanation: string;
}

interface HistoricalReport {
  id: string;
  title: string;
  reportType: ReportType;
  domain: Domain;
  author: ReportAuthor;
  date: string;
  shift: string;
  facility: string;
  well?: string;
  assetPhrase: string;
  excerpt: string;
  qualityScore: number;
  candidateEvents: number;
  unreadableFragments: number;
  metadata: Array<{ field: string; value: string }>;
  scenarioId?: ScenarioId;
}

interface ExtractedField {
  id: string;
  key: FieldKey;
  label: string;
  value: string;
  normalizedValue?: string;
  sourceSpanId?: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  tone: Tone;
  requiresReview: boolean;
  reasoning: string;
}

interface ExtractedEvent {
  id: string;
  scenarioId?: ScenarioId;
  title: string;
  domain: Domain;
  reportType: ReportType;
  sourceDocumentId: string;
  sourceDocument: string;
  authorRole: string;
  date: string;
  shift: string;
  asset: string;
  assetTag: string;
  well?: string;
  facility: string;
  activity: string;
  eventCategory: EventCategory;
  anomaly: string;
  cause: string;
  causeType: CauseType;
  actionTaken: string;
  result: string;
  duration: string;
  nptHours: number | null;
  severity: Severity;
  operationalImpact: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  validationStatus: ValidationStatus;
  sourceSpanIds: string[];
  normalizedLabel: string;
  similarEventCount: number;
  clusterId: string;
  learningNote: string;
  sourceExcerpt: string;
  fields: ExtractedField[];
}

interface ScenarioConfig {
  id: ScenarioId;
  name: string;
  shortName: string;
  domain: Domain;
  reportType: ReportType;
  title: string;
  sourceDocumentId: string;
  sourceDocument: string;
  authorRole: string;
  date: string;
  shift: string;
  facility: string;
  well?: string;
  asset: string;
  assetTag: string;
  activity: string;
  eventCategory: EventCategory;
  anomaly: string;
  cause: string;
  causeType: CauseType;
  actionTaken: string;
  result: string;
  duration: string;
  nptHours: number | null;
  severity: Severity;
  operationalImpact: string;
  confidence: number;
  validationStatus: ValidationStatus;
  normalizedLabel: string;
  similarEventCount: number;
  clusterId: string;
  learningNote: string;
  value: string;
  excerpt: string;
  spans: Array<{
    text: string;
    label: string;
    fieldKey: FieldKey;
    tone: Tone;
    confidence: number;
    explanation: string;
  }>;
}

interface EventSeed {
  id: string;
  scenarioId?: ScenarioId;
  title: string;
  domain: Domain;
  reportType: ReportType;
  sourceDocumentId: string;
  sourceDocument: string;
  authorRole: string;
  date: string;
  shift: string;
  asset: string;
  assetTag: string;
  well?: string;
  facility: string;
  activity: string;
  eventCategory: EventCategory;
  anomaly: string;
  cause: string;
  causeType: CauseType;
  actionTaken: string;
  result: string;
  duration: string;
  nptHours: number | null;
  severity: Severity;
  operationalImpact: string;
  confidence: number;
  validationStatus: ValidationStatus;
  normalizedLabel: string;
  similarEventCount: number;
  clusterId: string;
  learningNote: string;
  sourceExcerpt: string;
}

interface EventCluster {
  id: string;
  label: string;
  domain: Domain;
  category: EventCategory;
  eventCount: number;
  confidence: number;
  nptExposure: number;
  recurrenceRate: number;
  x: number;
  y: number;
  radius: number;
  tone: Tone;
  commonActions: string[];
  outcomes: Array<{ label: string; percentage: number; tone: Tone }>;
  insight: string;
}

interface SearchQuery {
  id: string;
  text: string;
  domain: Domain;
  expectedClusterId: string;
  resultCount: number;
  tone: Tone;
}

interface SearchResult {
  id: string;
  queryId: string;
  eventId: string;
  title: string;
  where: string;
  when: string;
  cause: string;
  action: string;
  result: string;
  duration: string;
  source: string;
  confidence: number;
}

interface TimelinePoint {
  id: string;
  eventId: string;
  domain: Domain;
  label: string;
  date: string;
  position: number;
  depth?: number;
  asset: string;
  severity: Severity;
  nptHours: number;
  clusterId: string;
  source: string;
}

interface PatternInsight {
  id: string;
  clusterId: string;
  title: string;
  narrative: string;
  supportingSignals: string[];
  recommendedUse: string;
  confidence: number;
  tone: Tone;
}

interface PredictiveSignal {
  id: string;
  clusterId: string;
  title: string;
  historicalPattern: string;
  leadingIndicators: string[];
  recommendedMonitoring: string[];
  modelUseCase: string;
  confidence: number;
  operationalValue: string;
  riskDelta: number;
  readinessScore: number;
}

interface OperationalMemoryMetrics {
  documentsIndexed: number;
  yearsCovered: number;
  candidateEvents: number;
  highConfidenceEvents: number;
  eventsRequiringReview: number;
  sourceTraceabilityCoverage: number;
  analystHoursSaved: number;
  similarCasesFound: number;
  nptEventsDiscovered: number;
  recurringFailurePatterns: number;
  predictiveModelReadiness: number;
  searchTimeReduction: number;
  validationBacklog: number;
}

interface SystemMetrics {
  corpusStatus: string;
  selectedDomain: Domain;
  selectedScenario: string;
  timeSpan: string;
  extractionProgress: number;
  documentsIndexed: number;
  candidateEvents: number;
  humanValidationEnabled: boolean;
  traceabilityActive: boolean;
  dominantConstraint: string;
}

interface ValidationAction {
  id: ValidationActionKind;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  tone: Tone;
}

interface RuntimePatch {
  validationStatus?: ValidationStatus;
  confidence?: number;
  confidenceLevel?: ConfidenceLevel;
  cause?: string;
  causeType?: CauseType;
  eventCategory?: EventCategory;
  normalizedLabel?: string;
  learningNote?: string;
  title?: string;
}

interface NormalizationExample {
  phrases: string[];
  normalized: string;
  tone: Tone;
}

interface AssetResolution {
  phrase: string;
  officialTag: string;
  confidence: number;
  status: 'resolved' | 'requires_review';
  candidates: Array<{ label: string; confidence: number; selected: boolean; tone: Tone }>;
}

interface ChartDatum {
  name: string;
  value: number;
  tone: Tone;
}

interface DensityDatum {
  label: string;
  events: number;
  npt: number;
}

interface StreamItem {
  id: string;
  message: string;
  tone: Tone;
  phase: PhaseId;
  eventId?: string;
  clusterId?: string;
}

interface ClusterScatterDatum {
  clusterId: string;
  name: string;
  x: number;
  y: number;
  z: number;
  tone: Tone;
  value: number;
}

const PLUSPETROL_ISOLOGO = 'https://images.aiworkify.com/pluspetrol-project/pluspetrol-isologo.png';

const TONES: Record<Tone, ToneClasses> = {
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    soft: 'bg-slate-100/80 text-slate-700 border-slate-200',
    fill: '#64748b',
    ring: 'ring-slate-200',
    gradient: 'from-slate-100 to-white',
  },
  cyan: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    soft: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    fill: '#06b6d4',
    ring: 'ring-cyan-200',
    gradient: 'from-cyan-50 to-white',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    soft: 'bg-blue-50 text-blue-700 border-blue-200',
    fill: '#2563eb',
    ring: 'ring-blue-200',
    gradient: 'from-blue-50 to-white',
  },
  violet: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    soft: 'bg-violet-50 text-violet-700 border-violet-200',
    fill: '#7c3aed',
    ring: 'ring-violet-200',
    gradient: 'from-violet-50 to-white',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    soft: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    fill: '#059669',
    ring: 'ring-emerald-200',
    gradient: 'from-emerald-50 to-white',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    soft: 'bg-amber-50 text-amber-700 border-amber-200',
    fill: '#d97706',
    ring: 'ring-amber-200',
    gradient: 'from-amber-50 to-white',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    soft: 'bg-rose-50 text-rose-700 border-rose-200',
    fill: '#e11d48',
    ring: 'ring-rose-200',
    gradient: 'from-rose-50 to-white',
  },
};

const DOMAIN_LABELS: Record<Domain, string> = {
  drilling: 'Drilling',
  production: 'Production',
  maintenance: 'Maintenance',
  hse: 'HSE',
};

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  DDR: 'Drilling DDR',
  CompanyManReport: 'Company Man Report',
  DirectionalReport: 'Directional Drilling Report',
  MudLogging: 'Mud Logging Report',
  ProductionDaily: 'Production Daily Report',
  ControlRoomLog: 'Control Room Log',
  BatteryReport: 'Battery Report',
  CompressorReport: 'Compressor Report',
  MaintenanceWorkOrder: 'Maintenance Work Order',
  ReliabilityReport: 'Reliability Report',
  VibrationReport: 'Vibration Report',
  HSENearMiss: 'HSE Near Miss',
  IncidentReport: 'Incident Report',
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  HighTorque: 'High Torque',
  ROPDrop: 'ROP Drop',
  CompressorTrip: 'Compressor Trip',
  HighTemperature: 'High Temperature',
  PumpVibration: 'Pump Vibration',
  MWDFailure: 'MWD Failure',
  StuckPipeRisk: 'Stuck Pipe Risk',
  LineRestriction: 'Line Restriction',
  MaterialDelay: 'Material Delay',
  NearMiss: 'Near Miss',
  MaintenanceCorrective: 'Corrective Maintenance',
  FlowDeviation: 'Flow Deviation',
};

const CAUSE_TYPE_LABELS: Record<CauseType, string> = {
  reported_fact: 'Reported fact',
  hypothesis: 'Hypothesis',
  unknown: 'Unknown',
  conflicting: 'Conflicting evidence',
};

const VALIDATION_LABELS: Record<ValidationStatus, string> = {
  pending_review: 'Review recommended',
  approved: 'Validated',
  corrected: 'Corrected by reviewer',
  ambiguous: 'Marked ambiguous',
  split: 'Split into two events',
  merged: 'Merged duplicate',
};

const VALIDATION_TONES: Record<ValidationStatus, Tone> = {
  pending_review: 'amber',
  approved: 'emerald',
  corrected: 'blue',
  ambiguous: 'amber',
  split: 'violet',
  merged: 'cyan',
};

const SEVERITY_TONES: Record<Severity, Tone> = {
  low: 'cyan',
  medium: 'amber',
  high: 'rose',
  critical: 'rose',
};

const CONFIDENCE_TONES: Record<ConfidenceLevel, Tone> = {
  high: 'emerald',
  medium: 'amber',
  low: 'rose',
  missing: 'slate',
};

const PHASES: Array<{ id: PhaseId; label: string; description: string; tone: Tone }> = [
  { id: 'archive', label: 'Archive appears', description: 'Report mountain is indexed by domain and year.', tone: 'slate' },
  { id: 'document', label: 'Document selected', description: 'One operational narrative enters the foundry.', tone: 'cyan' },
  { id: 'highlight', label: 'Text highlighted', description: 'Semantic spans are anchored to source text.', tone: 'violet' },
  { id: 'fields', label: 'Fields assembled', description: 'Spans become normalized event fields.', tone: 'blue' },
  { id: 'validation', label: 'Validation queued', description: 'Confidence and review status are calculated.', tone: 'amber' },
  { id: 'traceability', label: 'Source linked', description: 'Every field remains traceable to the report.', tone: 'emerald' },
  { id: 'timeline', label: 'Timeline populated', description: 'The event joins historical operations memory.', tone: 'blue' },
  { id: 'similar', label: 'Similar events found', description: 'Comparable cases fan in from prior years.', tone: 'cyan' },
  { id: 'clusters', label: 'Cluster formed', description: 'Events group into reusable operational patterns.', tone: 'violet' },
  { id: 'predictive', label: 'Predictive signal', description: 'Patterns become model-ready leading indicators.', tone: 'emerald' },
  { id: 'complete', label: 'Memory complete', description: 'Validated history becomes operational intelligence.', tone: 'emerald' },
];

const VALIDATION_ACTIONS: ValidationAction[] = [
  { id: 'approve', label: 'Approve', description: 'Promote this event to trusted memory.', icon: CheckCircle2, tone: 'emerald' },
  { id: 'edit', label: 'Edit', description: 'Correct a field and capture feedback.', icon: PencilLine, tone: 'blue' },
  { id: 'split', label: 'Split event', description: 'Separate multiple events in one paragraph.', icon: Scissors, tone: 'violet' },
  { id: 'merge', label: 'Merge duplicate', description: 'Combine with a similar source-backed event.', icon: GitMerge, tone: 'cyan' },
  { id: 'ambiguous', label: 'Mark ambiguous', description: 'Flag source-backed ambiguity for engineering review.', icon: AlertTriangle, tone: 'amber' },
  { id: 'correctCategory', label: 'Correct category', description: 'Reclassify into the right operational taxonomy.', icon: GitBranch, tone: 'rose' },
];

const DECK_MODES: Array<{ id: DeckMode; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: 'timeline', label: 'Event Timeline', icon: Clock },
  { id: 'search', label: 'Natural Language Search', icon: Search },
  { id: 'similar', label: 'Similar Events', icon: Layers3 },
  { id: 'clusters', label: 'Pattern Clusters', icon: Workflow },
  { id: 'predictive', label: 'Predictive Signal', icon: TrendingUp },
];

const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'drillingTorque',
    name: 'Drilling Torque / ROP Event',
    shortName: 'Torque + ROP',
    domain: 'drilling',
    reportType: 'DDR',
    title: 'High torque and ROP drop during lateral drilling',
    sourceDocumentId: 'DDR-VM-2022-0417',
    sourceDocument: 'DDR-VM-2022-0417 · VM-LT-18H',
    authorRole: 'Company man',
    date: '2022-04-17',
    shift: 'Night shift',
    facility: 'Vaca Muerta · Pad VM-17',
    well: 'VM-LT-18H',
    asset: 'VM-LT-18H lateral section',
    assetTag: 'WELL-VM-LT-18H · Lateral 6 1/8 in',
    activity: 'Lateral drilling',
    eventCategory: 'HighTorque',
    anomaly: 'High torque with ROP drop',
    cause: 'Possible poor hole cleaning',
    causeType: 'hypothesis',
    actionTaken: 'Reduced RPM and circulated for hole cleaning',
    result: 'Parameters normalized',
    duration: '45 min',
    nptHours: 0.75,
    severity: 'medium',
    operationalImpact: 'Temporary drilling dysfunction and NPT exposure',
    confidence: 86,
    validationStatus: 'pending_review',
    normalizedLabel: 'High Torque + ROP Drop + Hole Cleaning',
    similarEventCount: 42,
    clusterId: 'CL-TORQUE-ROP-HC',
    learningNote: 'Reviewer should confirm whether hole cleaning is a suspected cause or only a mitigation action.',
    value: 'Find similar historical events and identify what actions reduced NPT.',
    excerpt:
      'During lateral drilling, torque increased and ROP dropped. RPM was reduced and circulation was performed for hole cleaning. Parameters normalized after 45 minutes.',
    spans: [
      { text: 'During lateral drilling', label: 'Activity', fieldKey: 'activity', tone: 'cyan', confidence: 94, explanation: 'Explicit operation in progress.' },
      { text: 'torque increased', label: 'Anomaly', fieldKey: 'anomaly', tone: 'rose', confidence: 90, explanation: 'Torque increase is a drilling dysfunction signal.' },
      { text: 'ROP dropped', label: 'Anomaly', fieldKey: 'eventCategory', tone: 'rose', confidence: 88, explanation: 'ROP drop is paired with torque increase.' },
      { text: 'RPM was reduced', label: 'Decision / Action', fieldKey: 'actionTaken', tone: 'blue', confidence: 89, explanation: 'The crew response is explicitly stated.' },
      { text: 'circulation was performed', label: 'Action', fieldKey: 'actionTaken', tone: 'blue', confidence: 92, explanation: 'Circulation is a corrective action.' },
      { text: 'hole cleaning', label: 'Suspected cause', fieldKey: 'cause', tone: 'amber', confidence: 67, explanation: 'Likely mechanism, not a confirmed root cause.' },
      { text: 'Parameters normalized', label: 'Result', fieldKey: 'result', tone: 'emerald', confidence: 93, explanation: 'The outcome is explicit and positive.' },
      { text: '45 minutes', label: 'Duration', fieldKey: 'duration', tone: 'violet', confidence: 86, explanation: 'Duration is directly stated.' },
    ],
  },
  {
    id: 'compressorTrip',
    name: 'Compressor High Temperature Trip',
    shortName: 'Compressor Trip',
    domain: 'production',
    reportType: 'CompressorReport',
    title: 'Compressor C-102 trip due to high temperature',
    sourceDocumentId: 'PSL-GP-2021-0914-B',
    sourceDocument: 'Production Shift Log · Gas Plant · 2021-09-14',
    authorRole: 'Control room supervisor',
    date: '2021-09-14',
    shift: 'Day shift',
    facility: 'Gas Plant · Compression Train A',
    asset: 'Compressor C-102',
    assetTag: 'CMP-C-102 · Gas Plant · Train A',
    activity: 'Gas compression operations',
    eventCategory: 'CompressorTrip',
    anomaly: 'Compressor trip on high temperature',
    cause: 'High temperature and faulty temperature sensor',
    causeType: 'reported_fact',
    actionTaken: 'Inspected cooling fan and replaced faulty sensor',
    result: 'Unit returned to service',
    duration: '3.2 hours',
    nptHours: 3.2,
    severity: 'high',
    operationalImpact: 'Equipment unavailable and compression capacity reduced',
    confidence: 91,
    validationStatus: 'approved',
    normalizedLabel: 'Compressor Trip + High Temperature',
    similarEventCount: 31,
    clusterId: 'CL-COMP-HIGHTEMP',
    learningNote: 'Instrumentation behavior should be separated from mechanical cooling failures.',
    value: 'Detect recurring compressor trips and reliability patterns.',
    excerpt:
      'Compressor C-102 tripped due to high temperature. Maintenance inspected cooling fan and replaced faulty sensor. Unit returned to service after 3.2 hours.',
    spans: [
      { text: 'Compressor C-102', label: 'Asset', fieldKey: 'asset', tone: 'cyan', confidence: 97, explanation: 'Official equipment tag is present.' },
      { text: 'tripped', label: 'Event', fieldKey: 'eventCategory', tone: 'rose', confidence: 93, explanation: 'Trip is an explicit production event.' },
      { text: 'high temperature', label: 'Cause / alarm', fieldKey: 'cause', tone: 'amber', confidence: 90, explanation: 'The trip condition is stated.' },
      { text: 'inspected cooling fan', label: 'Action', fieldKey: 'actionTaken', tone: 'blue', confidence: 88, explanation: 'Maintenance action is explicit.' },
      { text: 'replaced faulty sensor', label: 'Corrective action', fieldKey: 'actionTaken', tone: 'blue', confidence: 94, explanation: 'The actual correction is stated.' },
      { text: 'returned to service', label: 'Result', fieldKey: 'result', tone: 'emerald', confidence: 95, explanation: 'Return-to-service outcome is clear.' },
      { text: '3.2 hours', label: 'Duration', fieldKey: 'duration', tone: 'violet', confidence: 93, explanation: 'Elapsed unavailability is quantified.' },
    ],
  },
  {
    id: 'pumpVibration',
    name: 'Pump Vibration / Seal Replacement',
    shortName: 'Pump Vibration',
    domain: 'maintenance',
    reportType: 'VibrationReport',
    title: 'Pump P-201 vibration leading to seal replacement',
    sourceDocumentId: 'VIB-BAT-2023-0308',
    sourceDocument: 'Vibration Report · Battery Norte · 2023-03-08',
    authorRole: 'Reliability technician',
    date: '2023-03-08',
    shift: 'Day shift',
    facility: 'Battery Norte · Transfer Area',
    asset: 'Pump P-201',
    assetTag: 'PMP-P-201 · Battery Norte · Transfer Service',
    activity: 'Transfer pump monitoring',
    eventCategory: 'PumpVibration',
    anomaly: 'High vibration detected',
    cause: 'Seal wear suspected after inspection',
    causeType: 'hypothesis',
    actionTaken: 'Removed pump from service, inspected seal and replaced it',
    result: 'Startup allowed with vibration trend monitoring',
    duration: '2.4 hours',
    nptHours: 2.4,
    severity: 'medium',
    operationalImpact: 'Pump unavailable during corrective maintenance',
    confidence: 88,
    validationStatus: 'pending_review',
    normalizedLabel: 'High Vibration + Seal Replacement',
    similarEventCount: 27,
    clusterId: 'CL-PUMP-VIB-SEAL',
    learningNote: 'Repeated temporary repairs can hide recurring mechanical degradation.',
    value: 'Connect vibration symptoms to maintenance actions and future failure indicators.',
    excerpt:
      'High vibration detected on pump P-201. Pump removed from service. Seal inspected and replaced. Recommendation: monitor vibration trend before next startup.',
    spans: [
      { text: 'High vibration', label: 'Symptom', fieldKey: 'anomaly', tone: 'rose', confidence: 96, explanation: 'The condition is explicit.' },
      { text: 'pump P-201', label: 'Asset', fieldKey: 'asset', tone: 'cyan', confidence: 95, explanation: 'Asset tag appears in the sentence.' },
      { text: 'removed from service', label: 'Impact', fieldKey: 'operationalImpact', tone: 'amber', confidence: 89, explanation: 'Availability impact is stated.' },
      { text: 'Seal inspected', label: 'Inspection', fieldKey: 'actionTaken', tone: 'blue', confidence: 86, explanation: 'Maintenance inspection action.' },
      { text: 'replaced', label: 'Corrective action', fieldKey: 'actionTaken', tone: 'blue', confidence: 90, explanation: 'Corrective action is stated.' },
      { text: 'monitor vibration trend', label: 'Recommendation', fieldKey: 'result', tone: 'emerald', confidence: 84, explanation: 'Forward-looking monitoring instruction.' },
      { text: 'before next startup', label: 'Operational condition', fieldKey: 'result', tone: 'violet', confidence: 72, explanation: 'A temporal condition is present.' },
    ],
  },
  {
    id: 'mwdFailure',
    name: 'MWD Signal Failure',
    shortName: 'MWD Failure',
    domain: 'drilling',
    reportType: 'DirectionalReport',
    title: 'Intermittent MWD signal causing unplanned trip',
    sourceDocumentId: 'DIR-LL-2020-1120',
    sourceDocument: 'Directional Drilling Report · LL-24H · 2020-11-20',
    authorRole: 'Directional driller',
    date: '2020-11-20',
    shift: 'Night shift',
    facility: 'Loma La Lata · Pad LL-24',
    well: 'LL-24H',
    asset: 'MWD tool string',
    assetTag: 'MWD-LL24H-RUN05 · Tool family Orion',
    activity: 'Directional drilling',
    eventCategory: 'MWDFailure',
    anomaly: 'Intermittent MWD signal',
    cause: 'Tool communication failure suspected',
    causeType: 'hypothesis',
    actionTaken: 'Performed unplanned trip and replaced tool',
    result: 'MWD telemetry restored',
    duration: '6.5 hours',
    nptHours: 6.5,
    severity: 'high',
    operationalImpact: 'Unplanned trip and non-productive time',
    confidence: 87,
    validationStatus: 'pending_review',
    normalizedLabel: 'MWD Signal Loss + Unplanned Trip',
    similarEventCount: 18,
    clusterId: 'CL-MWD-TRIP',
    learningNote: 'Vendor and tool family are useful grouping variables for reliability analysis.',
    value: 'Analyze tool reliability and non-productive time.',
    excerpt:
      'Intermittent MWD signal observed during drilling. Decision made to perform unplanned trip and replace tool. Lost time recorded: 6.5 hours.',
    spans: [
      { text: 'Intermittent MWD signal', label: 'Anomaly', fieldKey: 'anomaly', tone: 'rose', confidence: 94, explanation: 'Telemetry failure symptom is explicit.' },
      { text: 'during drilling', label: 'Activity', fieldKey: 'activity', tone: 'cyan', confidence: 87, explanation: 'Operational context is stated.' },
      { text: 'unplanned trip', label: 'Action / impact', fieldKey: 'actionTaken', tone: 'blue', confidence: 92, explanation: 'The response and NPT mechanism are explicit.' },
      { text: 'replace tool', label: 'Corrective action', fieldKey: 'actionTaken', tone: 'blue', confidence: 91, explanation: 'Tool replacement is stated.' },
      { text: 'Lost time recorded', label: 'NPT evidence', fieldKey: 'nptHours', tone: 'amber', confidence: 90, explanation: 'NPT is reported directly.' },
      { text: '6.5 hours', label: 'Duration', fieldKey: 'duration', tone: 'violet', confidence: 95, explanation: 'Lost time is quantified.' },
    ],
  },
  {
    id: 'stuckPipeRisk',
    name: 'Stuck Pipe Risk',
    shortName: 'Stuck Pipe Risk',
    domain: 'drilling',
    reportType: 'CompanyManReport',
    title: 'Stuck pipe risk reduced by circulation decision',
    sourceDocumentId: 'CMR-VM-2022-0602',
    sourceDocument: 'Company Man Report · VM-LT-22H · 2022-06-02',
    authorRole: 'Company man',
    date: '2022-06-02',
    shift: 'Day shift',
    facility: 'Vaca Muerta · Pad VM-22',
    well: 'VM-LT-22H',
    asset: 'VM-LT-22H lateral section',
    assetTag: 'WELL-VM-LT-22H · Lateral',
    activity: 'Backreaming',
    eventCategory: 'StuckPipeRisk',
    anomaly: 'Increased drag while backreaming',
    cause: 'Hole cleaning parameters required review',
    causeType: 'hypothesis',
    actionTaken: 'Stopped rotation, circulated bottoms-up and reviewed hole cleaning parameters',
    result: 'Stuck pipe risk reduced',
    duration: '1.1 hours',
    nptHours: 1.1,
    severity: 'high',
    operationalImpact: 'Prevented escalation to stuck pipe event',
    confidence: 84,
    validationStatus: 'pending_review',
    normalizedLabel: 'Stuck Pipe Risk + Hole Cleaning Circulation',
    similarEventCount: 36,
    clusterId: 'CL-STUCK-RISK',
    learningNote: 'Captures operational decision-making that avoided a severe incident.',
    value: 'Capture decision-making patterns that avoided severe incidents.',
    excerpt:
      'Increased drag observed while backreaming. Crew stopped rotation, circulated bottoms-up and reviewed hole cleaning parameters. Stuck pipe risk reduced.',
    spans: [
      { text: 'Increased drag', label: 'Symptom', fieldKey: 'anomaly', tone: 'rose', confidence: 90, explanation: 'Drag increase is a stuck-pipe precursor.' },
      { text: 'backreaming', label: 'Activity', fieldKey: 'activity', tone: 'cyan', confidence: 92, explanation: 'Activity is explicitly stated.' },
      { text: 'stopped rotation', label: 'Decision', fieldKey: 'actionTaken', tone: 'blue', confidence: 87, explanation: 'Crew decision is explicit.' },
      { text: 'circulated bottoms-up', label: 'Action', fieldKey: 'actionTaken', tone: 'blue', confidence: 91, explanation: 'Mitigation action is explicit.' },
      { text: 'hole cleaning parameters', label: 'Suspected mechanism', fieldKey: 'cause', tone: 'amber', confidence: 73, explanation: 'Mechanism is implied by review request.' },
      { text: 'Stuck pipe risk reduced', label: 'Result', fieldKey: 'result', tone: 'emerald', confidence: 86, explanation: 'Outcome is stated as risk reduction.' },
    ],
  },
  {
    id: 'lineRestriction',
    name: 'Production Line Restriction',
    shortName: 'Line Restriction',
    domain: 'production',
    reportType: 'ControlRoomLog',
    title: 'Line pressure increase with downstream restriction suspected',
    sourceDocumentId: 'CRL-BAT-2024-0126',
    sourceDocument: 'Control Room Log · Battery Sur · 2024-01-26',
    authorRole: 'Control room operator',
    date: '2024-01-26',
    shift: 'Evening shift',
    facility: 'Battery Sur · Oil Transfer',
    asset: 'Oil export line L-14',
    assetTag: 'LINE-L-14 · Battery Sur · Export',
    activity: 'Oil transfer operations',
    eventCategory: 'LineRestriction',
    anomaly: 'Line pressure above normal operating range',
    cause: 'Restriction suspected in downstream segment',
    causeType: 'hypothesis',
    actionTaken: 'Reduced flow and requested valve inspection',
    result: 'Pressure stabilized under reduced flow',
    duration: '2.0 hours',
    nptHours: 0.4,
    severity: 'medium',
    operationalImpact: 'Temporary production flow reduction',
    confidence: 83,
    validationStatus: 'pending_review',
    normalizedLabel: 'Line Pressure Increase + Flow Restriction',
    similarEventCount: 22,
    clusterId: 'CL-LINE-RESTRICT',
    learningNote: 'Flow assurance events often use inconsistent vocabulary across logs.',
    value: 'Connect production anomalies with flow assurance and maintenance response.',
    excerpt:
      'Line pressure increased above normal operating range. Flow was reduced and valve inspection requested. Restriction suspected in downstream segment.',
    spans: [
      { text: 'Line pressure increased', label: 'Anomaly', fieldKey: 'anomaly', tone: 'rose', confidence: 92, explanation: 'Pressure deviation is explicit.' },
      { text: 'normal operating range', label: 'Operating envelope', fieldKey: 'operationalImpact', tone: 'amber', confidence: 80, explanation: 'Deviation from operating range is specified.' },
      { text: 'Flow was reduced', label: 'Action', fieldKey: 'actionTaken', tone: 'blue', confidence: 91, explanation: 'Control action is explicit.' },
      { text: 'valve inspection requested', label: 'Follow-up', fieldKey: 'actionTaken', tone: 'blue', confidence: 86, explanation: 'Maintenance request is stated.' },
      { text: 'Restriction suspected', label: 'Suspected cause', fieldKey: 'cause', tone: 'amber', confidence: 66, explanation: 'The word suspected makes this a hypothesis.' },
      { text: 'downstream segment', label: 'Location', fieldKey: 'asset', tone: 'cyan', confidence: 72, explanation: 'Asset area is implied.' },
    ],
  },
  {
    id: 'hseNearMiss',
    name: 'HSE Near Miss',
    shortName: 'Near Miss',
    domain: 'hse',
    reportType: 'HSENearMiss',
    title: 'Near miss during manual valve operation',
    sourceDocumentId: 'HSE-NM-2023-0712',
    sourceDocument: 'HSE Near Miss Report · 2023-07-12',
    authorRole: 'HSE observer',
    date: '2023-07-12',
    shift: 'Day shift',
    facility: 'Central Plant · Manifold Area',
    asset: 'Manual valve MV-38',
    assetTag: 'MV-38 · Central Plant · Manifold',
    activity: 'Manual valve operation',
    eventCategory: 'NearMiss',
    anomaly: 'Near miss during manual valve operation',
    cause: 'Line-of-fire exposure during field task',
    causeType: 'reported_fact',
    actionTaken: 'Isolated area and performed toolbox talk before resuming activity',
    result: 'Activity resumed with risk controls reinforced',
    duration: '35 min',
    nptHours: 0,
    severity: 'medium',
    operationalImpact: 'Safety learning and preventive action captured',
    confidence: 90,
    validationStatus: 'approved',
    normalizedLabel: 'Safety Near Miss + Manual Valve Operation',
    similarEventCount: 16,
    clusterId: 'CL-HSE-VALVE',
    learningNote: 'Near-miss learning should be linked to operational context and preventive controls.',
    value: 'Extract safety learning and preventive actions.',
    excerpt:
      'Near miss reported during manual valve operation. Area isolated and toolbox talk performed before resuming activity.',
    spans: [
      { text: 'Near miss reported', label: 'Event', fieldKey: 'eventCategory', tone: 'rose', confidence: 95, explanation: 'The HSE event type is explicit.' },
      { text: 'manual valve operation', label: 'Activity', fieldKey: 'activity', tone: 'cyan', confidence: 94, explanation: 'Task is stated.' },
      { text: 'Area isolated', label: 'Corrective action', fieldKey: 'actionTaken', tone: 'blue', confidence: 91, explanation: 'Immediate control action.' },
      { text: 'toolbox talk performed', label: 'Preventive action', fieldKey: 'actionTaken', tone: 'blue', confidence: 90, explanation: 'Safety reinforcement action.' },
      { text: 'resuming activity', label: 'Result', fieldKey: 'result', tone: 'emerald', confidence: 84, explanation: 'Operational continuation is stated.' },
    ],
  },
];

const EXTRA_REPORTS: HistoricalReport[] = [
  {
    id: 'MUD-VM-2022-0418',
    title: 'Mud Logging Report · VM-LT-18H · Cuttings load trend',
    reportType: 'MudLogging',
    domain: 'drilling',
    author: { name: 'S. Alvarez', role: 'Mud logger', reliabilityScore: 82 },
    date: '2022-04-18',
    shift: 'Night shift',
    facility: 'Vaca Muerta · Pad VM-17',
    well: 'VM-LT-18H',
    assetPhrase: 'lateral hole section',
    excerpt:
      'Cuttings volume increased at shaker after sweep. Torque stayed elevated until additional circulation was performed. Drilling resumed with lower rotary speed.',
    qualityScore: 81,
    candidateEvents: 3,
    unreadableFragments: 1,
    metadata: [
      { field: 'Format', value: 'Scanned daily report' },
      { field: 'OCR quality', value: 'Medium' },
      { field: 'Vocabulary', value: 'Mud logging notes' },
    ],
  },
  {
    id: 'BHA-LL-2020-1120',
    title: 'BHA Run Summary · LL-24H · MWD telemetry note',
    reportType: 'DirectionalReport',
    domain: 'drilling',
    author: { name: 'J. Rivas', role: 'MWD engineer', reliabilityScore: 86 },
    date: '2020-11-20',
    shift: 'Night shift',
    facility: 'Loma La Lata · Pad LL-24',
    well: 'LL-24H',
    assetPhrase: 'BHA run 05',
    excerpt:
      'Tool face updates were intermittent and pulser response degraded. Team prepared trip plan and confirmed replacement MWD assembly availability.',
    qualityScore: 88,
    candidateEvents: 2,
    unreadableFragments: 0,
    metadata: [
      { field: 'Format', value: 'Service company PDF' },
      { field: 'Tool family', value: 'Orion MWD' },
      { field: 'Run number', value: '05' },
    ],
  },
  {
    id: 'BAT-NORTE-WO-2023-0310',
    title: 'Maintenance Work Order · Pump P-201 · Seal replacement',
    reportType: 'MaintenanceWorkOrder',
    domain: 'maintenance',
    author: { name: 'M. Farias', role: 'Maintenance planner', reliabilityScore: 90 },
    date: '2023-03-10',
    shift: 'Day shift',
    facility: 'Battery Norte · Transfer Area',
    assetPhrase: 'transfer pump P201',
    excerpt:
      'Work order closed after mechanical seal replacement on transfer pump P201. Temporary repair was not accepted; reliability requested vibration follow-up within 30 days.',
    qualityScore: 93,
    candidateEvents: 2,
    unreadableFragments: 0,
    metadata: [
      { field: 'Format', value: 'CMMS work note' },
      { field: 'Work type', value: 'Corrective maintenance' },
      { field: 'Close code', value: 'Seal replaced' },
    ],
  },
  {
    id: 'REL-GP-2021-1001',
    title: 'Reliability Report · Compressor C-102 · Recurring trips',
    reportType: 'ReliabilityReport',
    domain: 'maintenance',
    author: { name: 'L. Brown', role: 'Reliability engineer', reliabilityScore: 94 },
    date: '2021-10-01',
    shift: 'Engineering review',
    facility: 'Gas Plant · Compression Train A',
    assetPhrase: 'main compressor train A',
    excerpt:
      'C-102 shows repeated high-temperature trips. Two cases align with cooling fan degradation, while the latest event matches faulty instrumentation behavior.',
    qualityScore: 95,
    candidateEvents: 4,
    unreadableFragments: 0,
    metadata: [
      { field: 'Format', value: 'Engineering memo' },
      { field: 'Asset family', value: 'Compression' },
      { field: 'Review window', value: '12 months' },
    ],
  },
  {
    id: 'PROD-BAT-2024-0130',
    title: 'Production Daily Report · Battery Sur · Flow restriction follow-up',
    reportType: 'ProductionDaily',
    domain: 'production',
    author: { name: 'A. West', role: 'Production engineer', reliabilityScore: 87 },
    date: '2024-01-30',
    shift: 'Day shift',
    facility: 'Battery Sur · Oil Transfer',
    assetPhrase: 'export line L14',
    excerpt:
      'Downstream pressure remained unstable on L14 during ramp-up. Valve inspection identified partial obstruction; flow restored after cleaning.',
    qualityScore: 89,
    candidateEvents: 2,
    unreadableFragments: 0,
    metadata: [
      { field: 'Format', value: 'Production daily' },
      { field: 'Area', value: 'Oil transfer' },
      { field: 'Flow assurance tag', value: 'L14 restriction' },
    ],
  },
  {
    id: 'ALM-GP-2022-0526',
    title: 'Control Room Alarm Log · Compressor C-102 · Temperature alarms',
    reportType: 'ControlRoomLog',
    domain: 'production',
    author: { name: 'R. Vega', role: 'Control room operator', reliabilityScore: 78 },
    date: '2022-05-26',
    shift: 'Night shift',
    facility: 'Gas Plant · Compression Train A',
    assetPhrase: 'compressor train A',
    excerpt:
      'Repeated high temperature alarm on compressor train A. Operator lowered load and maintenance requested sensor calibration before restart.',
    qualityScore: 79,
    candidateEvents: 2,
    unreadableFragments: 2,
    metadata: [
      { field: 'Format', value: 'Alarm export + manual notes' },
      { field: 'Alarm class', value: 'Temperature' },
      { field: 'Operator note quality', value: 'Mixed' },
    ],
  },
  {
    id: 'BAT-REPORT-2020-0803',
    title: 'Battery Report · Material delay on valve replacement',
    reportType: 'BatteryReport',
    domain: 'production',
    author: { name: 'T. Sosa', role: 'Battery supervisor', reliabilityScore: 83 },
    date: '2020-08-03',
    shift: 'Day shift',
    facility: 'Battery Oeste · Field Gathering',
    assetPhrase: 'wellpad manifold valve',
    excerpt:
      'Valve replacement could not start because spares were unavailable. Waiting on material recorded as operational delay and temporary bypass remained in place.',
    qualityScore: 84,
    candidateEvents: 2,
    unreadableFragments: 0,
    metadata: [
      { field: 'Format', value: 'Battery report' },
      { field: 'Delay family', value: 'Material availability' },
      { field: 'Temporary state', value: 'Bypass active' },
    ],
  },
  {
    id: 'HSE-OBS-2022-1201',
    title: 'Safety Observation · Manual valve line-of-fire condition',
    reportType: 'IncidentReport',
    domain: 'hse',
    author: { name: 'P. Torres', role: 'HSE specialist', reliabilityScore: 91 },
    date: '2022-12-01',
    shift: 'Evening shift',
    facility: 'Central Plant · Manifold Area',
    assetPhrase: 'manual valve at manifold',
    excerpt:
      'Operator observed line-of-fire exposure while opening manual valve. Work stopped, area isolated and pre-task briefing repeated with the crew.',
    qualityScore: 90,
    candidateEvents: 2,
    unreadableFragments: 0,
    metadata: [
      { field: 'Format', value: 'Safety observation' },
      { field: 'Risk type', value: 'Line of fire' },
      { field: 'Control applied', value: 'Stop work + briefing' },
    ],
  },
  {
    id: 'CAL-GP-2022-0527',
    title: 'Instrumentation Note · C-102 sensor calibration',
    reportType: 'MaintenanceWorkOrder',
    domain: 'maintenance',
    author: { name: 'C. Roman', role: 'Instrumentation technician', reliabilityScore: 88 },
    date: '2022-05-27',
    shift: 'Day shift',
    facility: 'Gas Plant · Compression Train A',
    assetPhrase: 'temperature sensor on C102',
    excerpt:
      'Temperature transmitter on C102 drifted high during verification. Instrument was recalibrated and alarm threshold validated against reference probe.',
    qualityScore: 92,
    candidateEvents: 2,
    unreadableFragments: 0,
    metadata: [
      { field: 'Format', value: 'Instrumentation work note' },
      { field: 'Calibration', value: 'Reference probe' },
      { field: 'Asset alias', value: 'C102 / C-102' },
    ],
  },
  {
    id: 'TRIP-VM-2019-0612',
    title: 'Trip Report · Backreaming drag escalation',
    reportType: 'CompanyManReport',
    domain: 'drilling',
    author: { name: 'G. Herrera', role: 'Drilling supervisor', reliabilityScore: 86 },
    date: '2019-06-12',
    shift: 'Night shift',
    facility: 'Vaca Muerta · Pad VM-09',
    well: 'VM-09H',
    assetPhrase: 'open hole lateral',
    excerpt:
      'Drag increased during backreaming and string movement became erratic. Crew circulated bottoms-up, reduced rotary speed and avoided stuck pipe escalation.',
    qualityScore: 87,
    candidateEvents: 3,
    unreadableFragments: 0,
    metadata: [
      { field: 'Format', value: 'Trip report' },
      { field: 'Risk family', value: 'Stuck pipe prevention' },
      { field: 'Decision context', value: 'Backreaming' },
    ],
  },
];

function scenarioToReport(scenario: ScenarioConfig): HistoricalReport {
  return {
    id: scenario.sourceDocumentId,
    title: scenario.sourceDocument,
    reportType: scenario.reportType,
    domain: scenario.domain,
    author: {
      name: scenario.authorRole.includes('Company') ? 'R. Molina' : scenario.authorRole.includes('Control') ? 'K. Larsen' : 'Field Team',
      role: scenario.authorRole,
      reliabilityScore: scenario.confidence,
    },
    date: scenario.date,
    shift: scenario.shift,
    facility: scenario.facility,
    well: scenario.well,
    assetPhrase: scenario.asset,
    excerpt: scenario.excerpt,
    qualityScore: Math.min(99, scenario.confidence + 4),
    candidateEvents: scenario.id === 'drillingTorque' ? 4 : scenario.id === 'compressorTrip' ? 3 : 2,
    unreadableFragments: scenario.confidence > 88 ? 0 : 1,
    scenarioId: scenario.id,
    metadata: [
      { field: 'Source system', value: REPORT_TYPE_LABELS[scenario.reportType] },
      { field: 'Extraction mode', value: 'Span anchored event extraction' },
      { field: 'Traceability', value: 'Source fragment retained' },
    ],
  };
}

function generateHistoricalReports(): HistoricalReport[] {
  return [...SCENARIOS.map(scenarioToReport), ...EXTRA_REPORTS];
}

const EXTRA_EVENT_SEEDS: EventSeed[] = [
  {
    id: 'EV-10429',
    title: 'Cuttings load and elevated torque after sweep',
    domain: 'drilling',
    reportType: 'MudLogging',
    sourceDocumentId: 'MUD-VM-2022-0418',
    sourceDocument: 'Mud Logging Report · VM-LT-18H · 2022-04-18',
    authorRole: 'Mud logger',
    date: '2022-04-18',
    shift: 'Night shift',
    asset: 'VM-LT-18H lateral hole section',
    assetTag: 'WELL-VM-LT-18H · Lateral',
    well: 'VM-LT-18H',
    facility: 'Vaca Muerta · Pad VM-17',
    activity: 'Hole cleaning circulation',
    eventCategory: 'HighTorque',
    anomaly: 'Elevated torque after cuttings load increased',
    cause: 'Cuttings loading likely affected hole cleaning',
    causeType: 'hypothesis',
    actionTaken: 'Additional circulation and lower rotary speed',
    result: 'Drilling resumed',
    duration: '1.0 hours',
    nptHours: 1,
    severity: 'medium',
    operationalImpact: 'Short drilling delay and cleaning action',
    confidence: 82,
    validationStatus: 'pending_review',
    normalizedLabel: 'High Torque + Hole Cleaning Circulation',
    similarEventCount: 39,
    clusterId: 'CL-TORQUE-ROP-HC',
    learningNote: 'Mud logging vocabulary aligns with DDR torque and hole cleaning cluster.',
    sourceExcerpt:
      'Cuttings volume increased at shaker after sweep. Torque stayed elevated until additional circulation was performed. Drilling resumed with lower rotary speed.',
  },
  {
    id: 'EV-10430',
    title: 'Tool face updates intermittent before MWD replacement',
    domain: 'drilling',
    reportType: 'DirectionalReport',
    sourceDocumentId: 'BHA-LL-2020-1120',
    sourceDocument: 'BHA Run Summary · LL-24H · MWD telemetry note',
    authorRole: 'MWD engineer',
    date: '2020-11-20',
    shift: 'Night shift',
    asset: 'BHA run 05',
    assetTag: 'BHA-LL24H-RUN05 · Orion MWD',
    well: 'LL-24H',
    facility: 'Loma La Lata · Pad LL-24',
    activity: 'MWD telemetry monitoring',
    eventCategory: 'MWDFailure',
    anomaly: 'Intermittent tool face updates and degraded pulser response',
    cause: 'Pulser response degradation suspected',
    causeType: 'hypothesis',
    actionTaken: 'Prepared trip plan and confirmed replacement assembly',
    result: 'Replacement assembly made available',
    duration: '2.0 hours',
    nptHours: 0.5,
    severity: 'medium',
    operationalImpact: 'Pre-trip planning for telemetry reliability',
    confidence: 84,
    validationStatus: 'pending_review',
    normalizedLabel: 'MWD Signal Loss + Tool Replacement Planning',
    similarEventCount: 18,
    clusterId: 'CL-MWD-TRIP',
    learningNote: 'Early telemetry degradation may precede unplanned trip decisions.',
    sourceExcerpt:
      'Tool face updates were intermittent and pulser response degraded. Team prepared trip plan and confirmed replacement MWD assembly availability.',
  },
  {
    id: 'EV-10431',
    title: 'Corrective work order closed after pump seal replacement',
    domain: 'maintenance',
    reportType: 'MaintenanceWorkOrder',
    sourceDocumentId: 'BAT-NORTE-WO-2023-0310',
    sourceDocument: 'Maintenance Work Order · Pump P-201 · Seal replacement',
    authorRole: 'Maintenance planner',
    date: '2023-03-10',
    shift: 'Day shift',
    asset: 'Transfer pump P201',
    assetTag: 'PMP-P-201 · Battery Norte · Transfer Service',
    facility: 'Battery Norte · Transfer Area',
    activity: 'Corrective maintenance',
    eventCategory: 'MaintenanceCorrective',
    anomaly: 'Mechanical seal replacement required',
    cause: 'Seal degradation',
    causeType: 'reported_fact',
    actionTaken: 'Replaced mechanical seal and requested vibration follow-up',
    result: 'Work order closed; follow-up required within 30 days',
    duration: '4.0 hours',
    nptHours: 4,
    severity: 'medium',
    operationalImpact: 'Pump restored with reliability monitoring condition',
    confidence: 93,
    validationStatus: 'approved',
    normalizedLabel: 'Seal Replacement + Vibration Follow-up',
    similarEventCount: 27,
    clusterId: 'CL-PUMP-VIB-SEAL',
    learningNote: 'CMMS close codes can validate corrective action extracted from vibration reports.',
    sourceExcerpt:
      'Work order closed after mechanical seal replacement on transfer pump P201. Temporary repair was not accepted; reliability requested vibration follow-up within 30 days.',
  },
  {
    id: 'EV-10432',
    title: 'C-102 recurring high-temperature trips split into cooling and instrumentation families',
    domain: 'maintenance',
    reportType: 'ReliabilityReport',
    sourceDocumentId: 'REL-GP-2021-1001',
    sourceDocument: 'Reliability Report · Compressor C-102 · Recurring trips',
    authorRole: 'Reliability engineer',
    date: '2021-10-01',
    shift: 'Engineering review',
    asset: 'Main compressor train A',
    assetTag: 'CMP-C-102 · Gas Plant · Train A',
    facility: 'Gas Plant · Compression Train A',
    activity: 'Reliability review',
    eventCategory: 'CompressorTrip',
    anomaly: 'Repeated high-temperature trips',
    cause: 'Cooling fan degradation and faulty instrumentation behavior',
    causeType: 'conflicting',
    actionTaken: 'Separated trip family into cooling and instrumentation patterns',
    result: 'Reliability taxonomy updated',
    duration: 'Review period 12 months',
    nptHours: 9.6,
    severity: 'high',
    operationalImpact: 'Recurring equipment unavailability pattern identified',
    confidence: 88,
    validationStatus: 'corrected',
    normalizedLabel: 'Compressor Trip + Mixed High Temperature Causes',
    similarEventCount: 31,
    clusterId: 'CL-COMP-HIGHTEMP',
    learningNote: 'Conflicting cause evidence should not be flattened into a single root cause.',
    sourceExcerpt:
      'C-102 shows repeated high-temperature trips. Two cases align with cooling fan degradation, while the latest event matches faulty instrumentation behavior.',
  },
  {
    id: 'EV-10433',
    title: 'L14 downstream obstruction confirmed after unstable pressure',
    domain: 'production',
    reportType: 'ProductionDaily',
    sourceDocumentId: 'PROD-BAT-2024-0130',
    sourceDocument: 'Production Daily Report · Battery Sur · Flow restriction follow-up',
    authorRole: 'Production engineer',
    date: '2024-01-30',
    shift: 'Day shift',
    asset: 'Export line L14',
    assetTag: 'LINE-L-14 · Battery Sur · Export',
    facility: 'Battery Sur · Oil Transfer',
    activity: 'Production ramp-up',
    eventCategory: 'LineRestriction',
    anomaly: 'Downstream pressure remained unstable',
    cause: 'Partial obstruction identified during valve inspection',
    causeType: 'reported_fact',
    actionTaken: 'Cleaned downstream obstruction',
    result: 'Flow restored after cleaning',
    duration: '2.5 hours',
    nptHours: 0.9,
    severity: 'medium',
    operationalImpact: 'Flow assurance issue resolved',
    confidence: 89,
    validationStatus: 'approved',
    normalizedLabel: 'Line Restriction + Obstruction Cleaning',
    similarEventCount: 22,
    clusterId: 'CL-LINE-RESTRICT',
    learningNote: 'Follow-up reports can convert suspected causes into reported facts.',
    sourceExcerpt:
      'Downstream pressure remained unstable on L14 during ramp-up. Valve inspection identified partial obstruction; flow restored after cleaning.',
  },
  {
    id: 'EV-10434',
    title: 'Repeated C-102 high-temperature alarm before sensor calibration',
    domain: 'production',
    reportType: 'ControlRoomLog',
    sourceDocumentId: 'ALM-GP-2022-0526',
    sourceDocument: 'Control Room Alarm Log · Compressor C-102 · Temperature alarms',
    authorRole: 'Control room operator',
    date: '2022-05-26',
    shift: 'Night shift',
    asset: 'Compressor train A',
    assetTag: 'CMP-C-102 · Gas Plant · Train A',
    facility: 'Gas Plant · Compression Train A',
    activity: 'Compressor operation',
    eventCategory: 'HighTemperature',
    anomaly: 'Repeated high temperature alarm',
    cause: 'Temperature sensor drift suspected',
    causeType: 'hypothesis',
    actionTaken: 'Lowered load and requested sensor calibration',
    result: 'Restart held until maintenance verification',
    duration: '1.7 hours',
    nptHours: 1.7,
    severity: 'medium',
    operationalImpact: 'Temporary load reduction and restart delay',
    confidence: 79,
    validationStatus: 'pending_review',
    normalizedLabel: 'High Temperature Alarm + Sensor Calibration Request',
    similarEventCount: 31,
    clusterId: 'CL-COMP-HIGHTEMP',
    learningNote: 'Alarm logs require confirmation against maintenance notes before root cause assignment.',
    sourceExcerpt:
      'Repeated high temperature alarm on compressor train A. Operator lowered load and maintenance requested sensor calibration before restart.',
  },
  {
    id: 'EV-10435',
    title: 'Valve replacement delayed by unavailable spares',
    domain: 'production',
    reportType: 'BatteryReport',
    sourceDocumentId: 'BAT-REPORT-2020-0803',
    sourceDocument: 'Battery Report · Material delay on valve replacement',
    authorRole: 'Battery supervisor',
    date: '2020-08-03',
    shift: 'Day shift',
    asset: 'Wellpad manifold valve',
    assetTag: 'VALVE-MFD-WO-08 · Battery Oeste',
    facility: 'Battery Oeste · Field Gathering',
    activity: 'Valve replacement',
    eventCategory: 'MaterialDelay',
    anomaly: 'Spares unavailable for replacement work',
    cause: 'Material delay',
    causeType: 'reported_fact',
    actionTaken: 'Temporary bypass remained in place',
    result: 'Work could not start',
    duration: '7.5 hours',
    nptHours: 7.5,
    severity: 'medium',
    operationalImpact: 'Operational delay and temporary bypass exposure',
    confidence: 85,
    validationStatus: 'approved',
    normalizedLabel: 'Material Delay + Valve Replacement',
    similarEventCount: 24,
    clusterId: 'CL-MATERIAL-NPT',
    learningNote: 'Material delay is often under-classified when reports use local phrases such as spares unavailable.',
    sourceExcerpt:
      'Valve replacement could not start because spares were unavailable. Waiting on material recorded as operational delay and temporary bypass remained in place.',
  },
  {
    id: 'EV-10436',
    title: 'Line-of-fire exposure during manual valve operation',
    domain: 'hse',
    reportType: 'IncidentReport',
    sourceDocumentId: 'HSE-OBS-2022-1201',
    sourceDocument: 'Safety Observation · Manual valve line-of-fire condition',
    authorRole: 'HSE specialist',
    date: '2022-12-01',
    shift: 'Evening shift',
    asset: 'Manual valve at manifold',
    assetTag: 'MV-38 · Central Plant · Manifold',
    facility: 'Central Plant · Manifold Area',
    activity: 'Manual valve operation',
    eventCategory: 'NearMiss',
    anomaly: 'Line-of-fire exposure observed',
    cause: 'Unsafe body position during valve operation',
    causeType: 'reported_fact',
    actionTaken: 'Stopped work, isolated area and repeated pre-task briefing',
    result: 'Crew resumed with reinforced controls',
    duration: '40 min',
    nptHours: 0,
    severity: 'medium',
    operationalImpact: 'Safety observation converted into preventive learning',
    confidence: 91,
    validationStatus: 'approved',
    normalizedLabel: 'Safety Near Miss + Manual Valve Operation',
    similarEventCount: 16,
    clusterId: 'CL-HSE-VALVE',
    learningNote: 'Safety observations can be connected to recurring field-task risk patterns.',
    sourceExcerpt:
      'Operator observed line-of-fire exposure while opening manual valve. Work stopped, area isolated and pre-task briefing repeated with the crew.',
  },
  {
    id: 'EV-10437',
    title: 'C-102 temperature transmitter drift confirmed by calibration note',
    domain: 'maintenance',
    reportType: 'MaintenanceWorkOrder',
    sourceDocumentId: 'CAL-GP-2022-0527',
    sourceDocument: 'Instrumentation Note · C-102 sensor calibration',
    authorRole: 'Instrumentation technician',
    date: '2022-05-27',
    shift: 'Day shift',
    asset: 'Temperature sensor on C102',
    assetTag: 'TT-C102-OUT · Gas Plant · Train A',
    facility: 'Gas Plant · Compression Train A',
    activity: 'Instrumentation calibration',
    eventCategory: 'HighTemperature',
    anomaly: 'Temperature transmitter drifted high',
    cause: 'Instrument drift',
    causeType: 'reported_fact',
    actionTaken: 'Recalibrated transmitter and validated alarm threshold',
    result: 'Alarm threshold validated against reference probe',
    duration: '1.2 hours',
    nptHours: 1.2,
    severity: 'medium',
    operationalImpact: 'False high-temperature trip risk reduced',
    confidence: 92,
    validationStatus: 'approved',
    normalizedLabel: 'Instrumentation Drift + Temperature Alarm',
    similarEventCount: 31,
    clusterId: 'CL-COMP-HIGHTEMP',
    learningNote: 'Calibration note upgrades suspected instrumentation cause to reported fact.',
    sourceExcerpt:
      'Temperature transmitter on C102 drifted high during verification. Instrument was recalibrated and alarm threshold validated against reference probe.',
  },
  {
    id: 'EV-10438',
    title: 'Backreaming drag escalation avoided stuck pipe',
    domain: 'drilling',
    reportType: 'CompanyManReport',
    sourceDocumentId: 'TRIP-VM-2019-0612',
    sourceDocument: 'Trip Report · Backreaming drag escalation',
    authorRole: 'Drilling supervisor',
    date: '2019-06-12',
    shift: 'Night shift',
    asset: 'Open hole lateral',
    assetTag: 'WELL-VM-09H · Open Hole Lateral',
    well: 'VM-09H',
    facility: 'Vaca Muerta · Pad VM-09',
    activity: 'Backreaming',
    eventCategory: 'StuckPipeRisk',
    anomaly: 'Drag increased and string movement became erratic',
    cause: 'Hole cleaning and cuttings bed risk',
    causeType: 'hypothesis',
    actionTaken: 'Circulated bottoms-up and reduced rotary speed',
    result: 'Stuck pipe escalation avoided',
    duration: '1.6 hours',
    nptHours: 1.6,
    severity: 'high',
    operationalImpact: 'Prevented severe drilling incident',
    confidence: 86,
    validationStatus: 'pending_review',
    normalizedLabel: 'Stuck Pipe Risk + Backreaming Drag',
    similarEventCount: 36,
    clusterId: 'CL-STUCK-RISK',
    learningNote: 'Mitigation decision resembles later VM-LT-22H event and should be included in decision library.',
    sourceExcerpt:
      'Drag increased during backreaming and string movement became erratic. Crew circulated bottoms-up, reduced rotary speed and avoided stuck pipe escalation.',
  },
  {
    id: 'EV-10439',
    title: 'Flow deviation after separator pressure oscillation',
    domain: 'production',
    reportType: 'ProductionDaily',
    sourceDocumentId: 'PROD-BAT-2024-0130',
    sourceDocument: 'Production Daily Report · Battery Sur · Flow restriction follow-up',
    authorRole: 'Production engineer',
    date: '2024-02-02',
    shift: 'Day shift',
    asset: 'Separator train S-14',
    assetTag: 'SEP-S-14 · Battery Sur',
    facility: 'Battery Sur · Separation Area',
    activity: 'Separator operation',
    eventCategory: 'FlowDeviation',
    anomaly: 'Separator pressure oscillation caused flow deviation',
    cause: 'Control valve response suspected',
    causeType: 'hypothesis',
    actionTaken: 'Adjusted controller tuning and requested valve stroke test',
    result: 'Flow deviation reduced',
    duration: '1.5 hours',
    nptHours: 0.6,
    severity: 'low',
    operationalImpact: 'Short flow instability event',
    confidence: 76,
    validationStatus: 'ambiguous',
    normalizedLabel: 'Flow Deviation + Control Valve Response',
    similarEventCount: 14,
    clusterId: 'CL-LINE-RESTRICT',
    learningNote: 'Potentially separate from line restriction but shares pressure instability symptoms.',
    sourceExcerpt:
      'Separator pressure oscillation caused flow deviation during ramp-up. Controller tuning was adjusted and valve stroke test was requested.',
  },
  {
    id: 'EV-10440',
    title: 'Material delay masked as waiting on vendor truck',
    domain: 'maintenance',
    reportType: 'MaintenanceWorkOrder',
    sourceDocumentId: 'BAT-REPORT-2020-0803',
    sourceDocument: 'Battery Report · Material delay on valve replacement',
    authorRole: 'Maintenance planner',
    date: '2020-08-04',
    shift: 'Day shift',
    asset: 'Wellpad manifold valve',
    assetTag: 'VALVE-MFD-WO-08 · Battery Oeste',
    facility: 'Battery Oeste · Field Gathering',
    activity: 'Maintenance logistics',
    eventCategory: 'MaterialDelay',
    anomaly: 'Replacement delayed by vendor truck arrival',
    cause: 'Material logistics delay',
    causeType: 'reported_fact',
    actionTaken: 'Rescheduled work package and kept bypass under observation',
    result: 'Corrective work deferred to next shift',
    duration: '5.0 hours',
    nptHours: 5,
    severity: 'medium',
    operationalImpact: 'Deferred maintenance and continued temporary operating state',
    confidence: 80,
    validationStatus: 'pending_review',
    normalizedLabel: 'Material Delay + Deferred Corrective Work',
    similarEventCount: 24,
    clusterId: 'CL-MATERIAL-NPT',
    learningNote: 'Normalization identifies waiting on vendor truck as material delay rather than generic standby.',
    sourceExcerpt:
      'Corrective work remained delayed while waiting on vendor truck with replacement valve. Bypass was kept under observation until next shift.',
  },
  {
    id: 'EV-10441',
    title: 'Torque dysfunction resolved after backreaming and circulation',
    domain: 'drilling',
    reportType: 'DDR',
    sourceDocumentId: 'DDR-VM-2022-0417',
    sourceDocument: 'DDR-VM-2022-0417 · VM-LT-18H',
    authorRole: 'Company man',
    date: '2022-04-16',
    shift: 'Day shift',
    asset: 'VM-LT-18H lateral section',
    assetTag: 'WELL-VM-LT-18H · Lateral 6 1/8 in',
    well: 'VM-LT-18H',
    facility: 'Vaca Muerta · Pad VM-17',
    activity: 'Lateral drilling',
    eventCategory: 'ROPDrop',
    anomaly: 'Torque oscillation and ROP loss',
    cause: 'Poor hole cleaning suspected',
    causeType: 'hypothesis',
    actionTaken: 'Backreamed short interval and circulated high-vis sweep',
    result: 'Torque stabilized and ROP recovered',
    duration: '1.3 hours',
    nptHours: 1.3,
    severity: 'medium',
    operationalImpact: 'Dysfunction corrected without trip',
    confidence: 84,
    validationStatus: 'approved',
    normalizedLabel: 'High Torque + ROP Drop + Hole Cleaning',
    similarEventCount: 42,
    clusterId: 'CL-TORQUE-ROP-HC',
    learningNote: 'Similar action-outcome pair reinforces circulation as successful mitigation.',
    sourceExcerpt:
      'Torque oscillation and ROP loss were observed while drilling lateral. Crew backreamed short interval and circulated high-vis sweep. Torque stabilized and ROP recovered.',
  },
];

const SEARCH_QUERIES: SearchQuery[] = [
  {
    id: 'SQ-TORQUE',
    text: 'Show high torque events in lateral sections of similar wells.',
    domain: 'drilling',
    expectedClusterId: 'CL-TORQUE-ROP-HC',
    resultCount: 42,
    tone: 'violet',
  },
  {
    id: 'SQ-COMP',
    text: 'Find compressor trips caused by high temperature in the last five years.',
    domain: 'production',
    expectedClusterId: 'CL-COMP-HIGHTEMP',
    resultCount: 31,
    tone: 'rose',
  },
  {
    id: 'SQ-PUMP',
    text: 'Which pump vibration events ended with seal replacement?',
    domain: 'maintenance',
    expectedClusterId: 'CL-PUMP-VIB-SEAL',
    resultCount: 27,
    tone: 'amber',
  },
  {
    id: 'SQ-MWD',
    text: 'Show MWD failures that caused unplanned trips and NPT.',
    domain: 'drilling',
    expectedClusterId: 'CL-MWD-TRIP',
    resultCount: 18,
    tone: 'blue',
  },
  {
    id: 'SQ-CIRC',
    text: 'Find events where circulation normalized drilling parameters.',
    domain: 'drilling',
    expectedClusterId: 'CL-STUCK-RISK',
    resultCount: 36,
    tone: 'cyan',
  },
];

const NORMALIZATION_EXAMPLES: NormalizationExample[] = [
  {
    phrases: ['reduced RPM', 'lowered rotation', 'dropped rotary speed', 'drilled with lower rotation'],
    normalized: 'RPM Reduction',
    tone: 'blue',
  },
  {
    phrases: ['compressor trip', 'unit shutdown', 'compressor stopped', 'train tripped'],
    normalized: 'Compressor Trip',
    tone: 'rose',
  },
  {
    phrases: ['high vibration', 'vibration alarm', 'excessive vibration', 'high vib trend'],
    normalized: 'High Vibration',
    tone: 'amber',
  },
  {
    phrases: ['waiting on material', 'material delay', 'spares unavailable', 'vendor truck delayed'],
    normalized: 'Material Delay',
    tone: 'violet',
  },
  {
    phrases: ['circulated for cleaning', 'hole cleaning circulation', 'sweep pumped', 'bottoms-up circulation'],
    normalized: 'Hole Cleaning Circulation',
    tone: 'cyan',
  },
];

const BASE_CLUSTERS: EventCluster[] = [
  {
    id: 'CL-TORQUE-ROP-HC',
    label: 'High Torque + ROP Drop + Hole Cleaning',
    domain: 'drilling',
    category: 'HighTorque',
    eventCount: 42,
    confidence: 86,
    nptExposure: 23,
    recurrenceRate: 61,
    x: 28,
    y: 48,
    radius: 22,
    tone: 'violet',
    commonActions: ['Reduced RPM', 'Circulated for cleaning', 'Backreaming', 'Changed WOB', 'High-vis sweep'],
    outcomes: [
      { label: 'Parameters normalized', percentage: 61, tone: 'emerald' },
      { label: 'NPT recorded', percentage: 23, tone: 'amber' },
      { label: 'Escalated to engineering', percentage: 11, tone: 'blue' },
      { label: 'Stuck pipe risk increased', percentage: 5, tone: 'rose' },
    ],
    insight:
      'Across similar lateral drilling events, the most frequent successful action was RPM reduction followed by circulation for hole cleaning.',
  },
  {
    id: 'CL-COMP-HIGHTEMP',
    label: 'Compressor Trip + High Temperature',
    domain: 'production',
    category: 'CompressorTrip',
    eventCount: 31,
    confidence: 89,
    nptExposure: 37,
    recurrenceRate: 44,
    x: 62,
    y: 34,
    radius: 19,
    tone: 'rose',
    commonActions: ['Lowered load', 'Inspected cooling fan', 'Replaced sensor', 'Calibrated transmitter'],
    outcomes: [
      { label: 'Returned to service', percentage: 68, tone: 'emerald' },
      { label: 'Repeated within 30 days', percentage: 19, tone: 'amber' },
      { label: 'Mechanical cooling issue', percentage: 8, tone: 'blue' },
      { label: 'Conflicting cause evidence', percentage: 5, tone: 'rose' },
    ],
    insight:
      'Compressor C-102 high-temperature trips appear in three patterns: cooling fan degradation, sensor drift, and alarm threshold behavior.',
  },
  {
    id: 'CL-PUMP-VIB-SEAL',
    label: 'Pump Vibration + Seal Replacement',
    domain: 'maintenance',
    category: 'PumpVibration',
    eventCount: 27,
    confidence: 88,
    nptExposure: 21,
    recurrenceRate: 48,
    x: 47,
    y: 68,
    radius: 17,
    tone: 'amber',
    commonActions: ['Removed from service', 'Inspected seal', 'Replaced seal', 'Monitored trend'],
    outcomes: [
      { label: 'Temporary recovery', percentage: 54, tone: 'amber' },
      { label: 'No recurrence in 45 days', percentage: 28, tone: 'emerald' },
      { label: 'Repeat corrective work', percentage: 15, tone: 'rose' },
      { label: 'Missing follow-up', percentage: 3, tone: 'slate' },
    ],
    insight:
      'Pump vibration events with temporary repairs show higher repeat corrective maintenance probability than events with follow-up trending.',
  },
  {
    id: 'CL-MWD-TRIP',
    label: 'MWD Signal Loss + Unplanned Trip',
    domain: 'drilling',
    category: 'MWDFailure',
    eventCount: 18,
    confidence: 85,
    nptExposure: 52,
    recurrenceRate: 33,
    x: 74,
    y: 66,
    radius: 15,
    tone: 'blue',
    commonActions: ['Restarted telemetry', 'Prepared trip', 'Replaced MWD tool', 'Changed pulser'],
    outcomes: [
      { label: 'Unplanned trip', percentage: 58, tone: 'rose' },
      { label: 'Telemetry restored', percentage: 27, tone: 'emerald' },
      { label: 'Vendor review', percentage: 11, tone: 'blue' },
      { label: 'Insufficient evidence', percentage: 4, tone: 'slate' },
    ],
    insight:
      'MWD signal failures causing unplanned trips group strongly by tool family and run number.',
  },
  {
    id: 'CL-STUCK-RISK',
    label: 'Stuck Pipe Risk + Backreaming Drag',
    domain: 'drilling',
    category: 'StuckPipeRisk',
    eventCount: 36,
    confidence: 84,
    nptExposure: 18,
    recurrenceRate: 42,
    x: 31,
    y: 75,
    radius: 18,
    tone: 'cyan',
    commonActions: ['Stopped rotation', 'Circulated bottoms-up', 'Reduced rotary speed', 'Reviewed cleaning parameters'],
    outcomes: [
      { label: 'Escalation avoided', percentage: 64, tone: 'emerald' },
      { label: 'NPT recorded', percentage: 18, tone: 'amber' },
      { label: 'Trip required', percentage: 10, tone: 'rose' },
      { label: 'Engineering review', percentage: 8, tone: 'blue' },
    ],
    insight:
      'Stuck pipe risk mitigation patterns preserve field decision-making that prevented severe incidents.',
  },
  {
    id: 'CL-LINE-RESTRICT',
    label: 'Line Pressure Increase + Flow Restriction',
    domain: 'production',
    category: 'LineRestriction',
    eventCount: 22,
    confidence: 82,
    nptExposure: 16,
    recurrenceRate: 28,
    x: 68,
    y: 50,
    radius: 16,
    tone: 'cyan',
    commonActions: ['Reduced flow', 'Requested valve inspection', 'Cleaned obstruction', 'Adjusted controller'],
    outcomes: [
      { label: 'Flow restored', percentage: 57, tone: 'emerald' },
      { label: 'Reduced flow continued', percentage: 21, tone: 'amber' },
      { label: 'Valve work order', percentage: 15, tone: 'blue' },
      { label: 'Ambiguous cause', percentage: 7, tone: 'rose' },
    ],
    insight:
      'Flow restriction reports often move from suspected downstream restriction to confirmed obstruction only after follow-up documentation.',
  },
  {
    id: 'CL-MATERIAL-NPT',
    label: 'Material Delay + NPT',
    domain: 'maintenance',
    category: 'MaterialDelay',
    eventCount: 24,
    confidence: 80,
    nptExposure: 41,
    recurrenceRate: 39,
    x: 19,
    y: 31,
    radius: 16,
    tone: 'violet',
    commonActions: ['Rescheduled work', 'Temporary bypass', 'Escalated spares', 'Deferred corrective action'],
    outcomes: [
      { label: 'Maintenance deferred', percentage: 46, tone: 'amber' },
      { label: 'Bypass remained active', percentage: 28, tone: 'rose' },
      { label: 'Work completed next shift', percentage: 18, tone: 'emerald' },
      { label: 'Planning review', percentage: 8, tone: 'blue' },
    ],
    insight:
      'Material-delay events are frequently under-classified in reports and account for more NPT than originally tagged.',
  },
  {
    id: 'CL-HSE-VALVE',
    label: 'Safety Near Miss + Manual Valve Operation',
    domain: 'hse',
    category: 'NearMiss',
    eventCount: 16,
    confidence: 90,
    nptExposure: 0,
    recurrenceRate: 24,
    x: 82,
    y: 25,
    radius: 14,
    tone: 'emerald',
    commonActions: ['Stopped work', 'Isolated area', 'Toolbox talk', 'Repeated pre-task briefing'],
    outcomes: [
      { label: 'Controls reinforced', percentage: 72, tone: 'emerald' },
      { label: 'Repeated observation', percentage: 16, tone: 'amber' },
      { label: 'Procedure updated', percentage: 8, tone: 'blue' },
      { label: 'Missing follow-up', percentage: 4, tone: 'slate' },
    ],
    insight:
      'Near-miss extraction links safety learning to operational tasks instead of storing it as isolated narrative.',
  },
];

const INSIGHTS: PatternInsight[] = [
  {
    id: 'PI-TORQUE',
    clusterId: 'CL-TORQUE-ROP-HC',
    title: 'Successful drilling dysfunction mitigation is repeated across wells',
    narrative:
      'Across similar lateral drilling events, the most frequent successful action was RPM reduction followed by circulation for hole cleaning. Cases that continued drilling at high ROP had higher NPT exposure.',
    supportingSignals: ['42 similar events', '61% normalized after circulation', '23% exposed to NPT'],
    recommendedUse: 'Use as a decision-support pattern during lateral drilling dysfunction review.',
    confidence: 86,
    tone: 'violet',
  },
  {
    id: 'PI-COMP',
    clusterId: 'CL-COMP-HIGHTEMP',
    title: 'High-temperature compressor trips separate into reliability subfamilies',
    narrative:
      'Compressor C-102 high-temperature trips appear in three clusters. Two are related to cooling fan issues and one to faulty instrumentation. The latest event aligns more closely with instrumentation behavior.',
    supportingSignals: ['31 trips', '4 source families', 'sensor calibration evidence'],
    recommendedUse: 'Separate mechanical cooling failures from instrumentation trips before calculating reliability actions.',
    confidence: 89,
    tone: 'rose',
  },
  {
    id: 'PI-PUMP',
    clusterId: 'CL-PUMP-VIB-SEAL',
    title: 'Vibration symptoms need post-repair evidence',
    narrative:
      'This pump vibration event matches a recurring pattern where seal replacement solved the symptom temporarily but vibration reappeared within 45 days when follow-up trending was absent.',
    supportingSignals: ['27 maintenance cases', '48% recurrence signal', 'follow-up trend missing in 3%'],
    recommendedUse: 'Feed vibration trend monitoring and repeat corrective maintenance models.',
    confidence: 88,
    tone: 'amber',
  },
  {
    id: 'PI-MWD',
    clusterId: 'CL-MWD-TRIP',
    title: 'Tool family appears as a grouping variable for MWD NPT',
    narrative:
      'MWD signal failures caused unplanned trips in comparable events. Vendor, tool family and run number appear as relevant grouping variables for reliability analysis.',
    supportingSignals: ['18 comparable events', '58% unplanned trip outcome', 'tool family extracted in directional reports'],
    recommendedUse: 'Build vendor and tool family features for NPT risk models.',
    confidence: 85,
    tone: 'blue',
  },
  {
    id: 'PI-LINE',
    clusterId: 'CL-LINE-RESTRICT',
    title: 'Suspected restrictions become confirmed causes only after follow-up reports',
    narrative:
      'Production line restriction events often start as suspected downstream restrictions and become confirmed obstruction events after valve inspection or cleaning notes are connected.',
    supportingSignals: ['22 events', '57% flow restored after intervention', 'follow-up source changes cause type'],
    recommendedUse: 'Connect control room logs with production daily reports for diagnosis acceleration.',
    confidence: 82,
    tone: 'cyan',
  },
  {
    id: 'PI-HSE',
    clusterId: 'CL-HSE-VALVE',
    title: 'Safety lessons become searchable by task and control',
    narrative:
      'Near-miss reports linked to manual valve operation preserve field learning and make preventive controls searchable across years instead of buried in HSE narrative.',
    supportingSignals: ['16 near misses', '72% controls reinforced', 'task-level asset link resolved'],
    recommendedUse: 'Surface repeated risk patterns during pre-task planning and toolbox talks.',
    confidence: 90,
    tone: 'emerald',
  },
];

const PREDICTIVE_SIGNALS: PredictiveSignal[] = [
  {
    id: 'PS-TORQUE',
    clusterId: 'CL-TORQUE-ROP-HC',
    title: 'High torque + falling ROP leading indicator',
    historicalPattern:
      'Events with high torque, falling ROP and insufficient circulation were followed by NPT in 23% of similar cases.',
    leadingIndicators: ['Torque increase', 'ROP decline', 'Cuttings load at shaker', 'Hole cleaning reference in text'],
    recommendedMonitoring: ['Torque trend', 'ROP trend', 'Sweep frequency', 'Backreaming notes'],
    modelUseCase: 'Lateral drilling dysfunction early-warning model',
    confidence: 86,
    operationalValue: 'Reduce NPT by surfacing proven actions from similar wells.',
    riskDelta: 23,
    readinessScore: 78,
  },
  {
    id: 'PS-COMP',
    clusterId: 'CL-COMP-HIGHTEMP',
    title: 'Recurring high-temperature trip precursor',
    historicalPattern:
      'Recurring compressor high-temperature alarms increased before sensor replacement and calibration work notes.',
    leadingIndicators: ['Repeated high temperature alarm', 'Load reduction', 'Sensor calibration request', 'Cooling fan inspection'],
    recommendedMonitoring: ['Alarm frequency', 'Temperature transmitter drift', 'Restart delays', 'Fan inspection history'],
    modelUseCase: 'Compressor trip recurrence model',
    confidence: 89,
    operationalValue: 'Separate instrumentation trips from cooling failures to target reliability work.',
    riskDelta: 37,
    readinessScore: 82,
  },
  {
    id: 'PS-PUMP',
    clusterId: 'CL-PUMP-VIB-SEAL',
    title: 'Pump vibration recurrence feature set',
    historicalPattern:
      'Pump vibration events with repeated temporary repairs had a higher probability of repeat corrective maintenance.',
    leadingIndicators: ['High vibration', 'Seal inspection', 'Temporary repair rejected', 'No trend follow-up'],
    recommendedMonitoring: ['Vibration trend', 'Seal replacement interval', 'Work order recurrence', 'Startup recommendation text'],
    modelUseCase: 'Predictive maintenance repeat-failure signal',
    confidence: 88,
    operationalValue: 'Improve reliability by linking symptoms, corrective actions and follow-up conditions.',
    riskDelta: 21,
    readinessScore: 74,
  },
  {
    id: 'PS-MWD',
    clusterId: 'CL-MWD-TRIP',
    title: 'MWD trip risk from telemetry degradation',
    historicalPattern:
      'Intermittent tool face updates and pulser degradation frequently preceded unplanned trips and tool replacement.',
    leadingIndicators: ['Intermittent signal', 'Pulser response degraded', 'Replacement assembly prepared', 'Vendor tool family'],
    recommendedMonitoring: ['Telemetry quality', 'Pulser response notes', 'Run number', 'Service company tool family'],
    modelUseCase: 'MWD NPT and tool reliability model',
    confidence: 85,
    operationalValue: 'Identify telemetry degradation before it becomes unplanned trip NPT.',
    riskDelta: 52,
    readinessScore: 71,
  },
  {
    id: 'PS-LINE',
    clusterId: 'CL-LINE-RESTRICT',
    title: 'Flow restriction confirmation loop',
    historicalPattern:
      'Pressure increases above normal range followed by valve inspection created a reliable pathway from suspected restriction to confirmed obstruction.',
    leadingIndicators: ['Line pressure increase', 'Flow reduction', 'Downstream segment reference', 'Valve inspection request'],
    recommendedMonitoring: ['Pressure envelope', 'Flow reduction commands', 'Valve inspection work notes', 'Cleaning outcomes'],
    modelUseCase: 'Flow assurance anomaly triage model',
    confidence: 82,
    operationalValue: 'Accelerate diagnosis by linking control room events to maintenance follow-up.',
    riskDelta: 16,
    readinessScore: 69,
  },
  {
    id: 'PS-HSE',
    clusterId: 'CL-HSE-VALVE',
    title: 'Repeated manual valve near-miss signal',
    historicalPattern:
      'Manual valve near misses cluster around line-of-fire exposure and missing pre-task reinforcement.',
    leadingIndicators: ['Manual valve task', 'Area isolation', 'Toolbox talk', 'Line-of-fire phrase'],
    recommendedMonitoring: ['Task-level HSE observations', 'Repeat valve locations', 'Control effectiveness notes'],
    modelUseCase: 'Safety learning retrieval and pre-task risk pattern alert',
    confidence: 90,
    operationalValue: 'Preserve field experience and surface repeated risk controls during planning.',
    riskDelta: 0,
    readinessScore: 76,
  },
];

const STREAM_ITEMS: StreamItem[] = [
  { id: 'S-01', message: 'Historical corpus loaded: 42,618 documents indexed', tone: 'slate', phase: 'archive' },
  { id: 'S-02', message: 'DDR-VM-2022-0417 parsed with source spans retained', tone: 'cyan', phase: 'document', eventId: 'EV-10428' },
  { id: 'S-03', message: 'High torque event extracted from narrative', tone: 'violet', phase: 'highlight', eventId: 'EV-10428' },
  { id: 'S-04', message: 'Cause tagged as hypothesis, not fact', tone: 'amber', phase: 'validation', eventId: 'EV-10428' },
  { id: 'S-05', message: 'Asset alias resolved to WELL-VM-LT-18H', tone: 'emerald', phase: 'fields', eventId: 'EV-10428' },
  { id: 'S-06', message: '42 similar events found across lateral sections', tone: 'blue', phase: 'similar', clusterId: 'CL-TORQUE-ROP-HC' },
  { id: 'S-07', message: 'Cluster formed: Torque + ROP + Hole Cleaning', tone: 'violet', phase: 'clusters', clusterId: 'CL-TORQUE-ROP-HC' },
  { id: 'S-08', message: 'Predictive signal updated: 23% NPT exposure', tone: 'emerald', phase: 'predictive', clusterId: 'CL-TORQUE-ROP-HC' },
];

const SCENARIO_EVENT_IDS: Record<ScenarioId, string> = {
  drillingTorque: 'EV-10428',
  compressorTrip: 'EV-20411',
  pumpVibration: 'EV-30502',
  mwdFailure: 'EV-11877',
  stuckPipeRisk: 'EV-11904',
  lineRestriction: 'EV-40118',
  hseNearMiss: 'EV-50912',
};

function getScenarioConfig(scenarioId: ScenarioId): ScenarioConfig {
  const scenario = SCENARIOS.find((item) => item.id === scenarioId);
  return scenario ?? SCENARIOS[0];
}

function getToneClasses(tone: Tone): ToneClasses {
  return TONES[tone];
}

function getDomainColor(domain: Domain): Tone {
  if (domain === 'drilling') return 'violet';
  if (domain === 'production') return 'cyan';
  if (domain === 'maintenance') return 'amber';
  return 'emerald';
}

function getReportTypeTone(reportType: ReportType): Tone {
  const mapping: Record<ReportType, Tone> = {
    DDR: 'violet',
    CompanyManReport: 'blue',
    DirectionalReport: 'cyan',
    MudLogging: 'emerald',
    ProductionDaily: 'cyan',
    ControlRoomLog: 'blue',
    BatteryReport: 'amber',
    CompressorReport: 'rose',
    MaintenanceWorkOrder: 'amber',
    ReliabilityReport: 'violet',
    VibrationReport: 'rose',
    HSENearMiss: 'emerald',
    IncidentReport: 'rose',
  };
  return mapping[reportType];
}

function getConfidenceLevel(confidence: number | null): ConfidenceLevel {
  if (confidence === null) return 'missing';
  if (confidence >= 88) return 'high';
  if (confidence >= 72) return 'medium';
  if (confidence > 0) return 'low';
  return 'missing';
}

function getCauseTone(causeType: CauseType): Tone {
  if (causeType === 'reported_fact') return 'emerald';
  if (causeType === 'hypothesis') return 'amber';
  if (causeType === 'conflicting') return 'rose';
  return 'slate';
}

function formatConfidence(value: number | null): string {
  if (value === null) return 'Missing';
  return `${Math.round(value)}%`;
}

function formatDuration(duration: string, nptHours: number | null): string {
  if (nptHours === null) return duration;
  if (nptHours === 0) return `${duration} · no NPT`; 
  return `${duration} · ${nptHours.toFixed(nptHours % 1 === 0 ? 0 : 1)} h NPT`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scenarioToEventSeed(scenario: ScenarioConfig): EventSeed {
  return {
    id: SCENARIO_EVENT_IDS[scenario.id],
    scenarioId: scenario.id,
    title: scenario.title,
    domain: scenario.domain,
    reportType: scenario.reportType,
    sourceDocumentId: scenario.sourceDocumentId,
    sourceDocument: scenario.sourceDocument,
    authorRole: scenario.authorRole,
    date: scenario.date,
    shift: scenario.shift,
    asset: scenario.asset,
    assetTag: scenario.assetTag,
    well: scenario.well,
    facility: scenario.facility,
    activity: scenario.activity,
    eventCategory: scenario.eventCategory,
    anomaly: scenario.anomaly,
    cause: scenario.cause,
    causeType: scenario.causeType,
    actionTaken: scenario.actionTaken,
    result: scenario.result,
    duration: scenario.duration,
    nptHours: scenario.nptHours,
    severity: scenario.severity,
    operationalImpact: scenario.operationalImpact,
    confidence: scenario.confidence,
    validationStatus: scenario.validationStatus,
    normalizedLabel: scenario.normalizedLabel,
    similarEventCount: scenario.similarEventCount,
    clusterId: scenario.clusterId,
    learningNote: scenario.learningNote,
    sourceExcerpt: scenario.excerpt,
  };
}

function allEventSeeds(): EventSeed[] {
  return [...SCENARIOS.map(scenarioToEventSeed), ...EXTRA_EVENT_SEEDS];
}

function buildGenericSpanSeeds(event: EventSeed): ScenarioConfig['spans'] {
  const candidates: ScenarioConfig['spans'] = [
    { text: event.asset, label: 'Asset', fieldKey: 'asset', tone: 'cyan', confidence: Math.min(95, event.confidence + 4), explanation: 'Asset phrase was matched to an official tag candidate.' },
    { text: event.activity, label: 'Activity', fieldKey: 'activity', tone: 'cyan', confidence: Math.min(92, event.confidence), explanation: 'Operational activity is extracted from the report context.' },
    { text: event.anomaly.split(' ').slice(0, 4).join(' '), label: 'Anomaly', fieldKey: 'anomaly', tone: 'rose', confidence: event.confidence, explanation: 'The operational deviation is described in narrative text.' },
    { text: event.cause.split(' ').slice(0, 4).join(' '), label: 'Cause', fieldKey: 'cause', tone: getCauseTone(event.causeType), confidence: clamp(event.confidence - 11, 45, 95), explanation: 'Cause extraction is classified as fact, hypothesis, unknown or conflicting.' },
    { text: event.actionTaken.split(' ').slice(0, 5).join(' '), label: 'Action', fieldKey: 'actionTaken', tone: 'blue', confidence: clamp(event.confidence - 4, 55, 95), explanation: 'Action phrase is mapped into a normalized operational action.' },
    { text: event.result.split(' ').slice(0, 5).join(' '), label: 'Result', fieldKey: 'result', tone: 'emerald', confidence: clamp(event.confidence - 3, 55, 96), explanation: 'Outcome is extracted from the source narrative.' },
    { text: event.duration, label: 'Duration', fieldKey: 'duration', tone: 'violet', confidence: clamp(event.confidence - 2, 50, 96), explanation: 'Duration is extracted when explicit or inferred from operational note.' },
  ];
  return candidates.filter((candidate) => event.sourceExcerpt.toLowerCase().includes(candidate.text.toLowerCase()));
}

function buildSourceSpans(event: EventSeed): SourceSpan[] {
  const scenario = event.scenarioId ? getScenarioConfig(event.scenarioId) : undefined;
  const spanSeeds = scenario ? scenario.spans : buildGenericSpanSeeds(event);
  let cursor = 0;
  return spanSeeds.map((span, index) => {
    const lowerExcerpt = event.sourceExcerpt.toLowerCase();
    const lowerText = span.text.toLowerCase();
    const found = lowerExcerpt.indexOf(lowerText, cursor);
    const fallback = lowerExcerpt.indexOf(lowerText);
    const start = found >= 0 ? found : fallback >= 0 ? fallback : Math.min(cursor, event.sourceExcerpt.length);
    const end = Math.min(event.sourceExcerpt.length, start + span.text.length);
    cursor = end;
    return {
      id: `${event.id}-SPAN-${index + 1}`,
      text: event.sourceExcerpt.slice(start, end) || span.text,
      label: span.label,
      tone: span.tone,
      fieldKey: span.fieldKey,
      start,
      end,
      confidence: span.confidence,
      confidenceLevel: getConfidenceLevel(span.confidence),
      explanation: span.explanation,
    };
  });
}

function normalizedCategoryLabel(category: EventCategory): string {
  return CATEGORY_LABELS[category];
}

function getEventValue(event: EventSeed | ExtractedEvent, key: FieldKey): string {
  switch (key) {
    case 'domain':
      return DOMAIN_LABELS[event.domain];
    case 'reportType':
      return REPORT_TYPE_LABELS[event.reportType];
    case 'sourceDocument':
      return event.sourceDocument;
    case 'authorRole':
      return event.authorRole;
    case 'date':
      return event.date;
    case 'shift':
      return event.shift;
    case 'asset':
      return event.asset;
    case 'assetTag':
      return event.assetTag;
    case 'well':
      return event.well ?? 'Not applicable';
    case 'facility':
      return event.facility;
    case 'activity':
      return event.activity;
    case 'eventCategory':
      return normalizedCategoryLabel(event.eventCategory);
    case 'anomaly':
      return event.anomaly;
    case 'cause':
      return event.cause;
    case 'causeType':
      return CAUSE_TYPE_LABELS[event.causeType];
    case 'actionTaken':
      return event.actionTaken;
    case 'result':
      return event.result;
    case 'duration':
      return event.duration;
    case 'nptHours':
      return event.nptHours === null ? 'Missing' : `${event.nptHours.toFixed(event.nptHours % 1 === 0 ? 0 : 1)} h`;
    case 'severity':
      return event.severity;
    case 'operationalImpact':
      return event.operationalImpact;
    case 'confidence':
      return formatConfidence(event.confidence);
    case 'validationStatus':
      return VALIDATION_LABELS[event.validationStatus];
    case 'normalizedLabel':
      return event.normalizedLabel;
    case 'sourceExcerpt':
      return event.sourceExcerpt;
    default:
      return '';
  }
}

function fieldLabel(key: FieldKey): string {
  const labels: Record<FieldKey, string> = {
    domain: 'Domain',
    reportType: 'Report type',
    sourceDocument: 'Source document',
    authorRole: 'Author role',
    date: 'Date',
    shift: 'Shift',
    asset: 'Asset phrase',
    assetTag: 'Official asset tag',
    well: 'Well',
    facility: 'Facility',
    activity: 'Activity',
    eventCategory: 'Event type',
    anomaly: 'Anomaly',
    cause: 'Cause',
    causeType: 'Cause type',
    actionTaken: 'Action taken',
    result: 'Result',
    duration: 'Duration',
    nptHours: 'NPT',
    severity: 'Severity',
    operationalImpact: 'Operational impact',
    confidence: 'Event confidence',
    validationStatus: 'Validation status',
    normalizedLabel: 'Normalized label',
    sourceExcerpt: 'Source excerpt',
  };
  return labels[key];
}

function fieldTone(key: FieldKey, event: EventSeed | ExtractedEvent): Tone {
  if (key === 'cause' || key === 'causeType') return getCauseTone(event.causeType);
  if (key === 'severity') return SEVERITY_TONES[event.severity];
  if (key === 'validationStatus') return VALIDATION_TONES[event.validationStatus];
  if (key === 'confidence') return CONFIDENCE_TONES[getConfidenceLevel(event.confidence)];
  if (key === 'eventCategory' || key === 'anomaly') return 'rose';
  if (key === 'actionTaken') return 'blue';
  if (key === 'result') return 'emerald';
  if (key === 'duration' || key === 'normalizedLabel') return 'violet';
  if (key === 'asset' || key === 'assetTag' || key === 'facility' || key === 'well') return 'cyan';
  if (key === 'operationalImpact' || key === 'nptHours') return 'amber';
  return 'slate';
}

function calculateFieldConfidence(key: FieldKey, event: EventSeed | ExtractedEvent, spans: SourceSpan[]): number {
  const directSpan = spans.find((span) => span.fieldKey === key);
  if (directSpan) return directSpan.confidence;
  if (key === 'cause' && event.causeType === 'hypothesis') return clamp(event.confidence - 18, 40, 82);
  if (key === 'causeType' && event.causeType === 'conflicting') return 74;
  if (key === 'nptHours' && event.nptHours === null) return 0;
  if (key === 'assetTag') return clamp(event.confidence - 5, 55, 96);
  if (key === 'sourceDocument') return 100;
  if (key === 'validationStatus') return 100;
  return clamp(event.confidence - 6, 48, 96);
}

function buildExtractedFields(event: EventSeed | ExtractedEvent, spans: SourceSpan[]): ExtractedField[] {
  const keys: FieldKey[] = [
    'eventCategory',
    'domain',
    'asset',
    'assetTag',
    'well',
    'facility',
    'activity',
    'anomaly',
    'cause',
    'causeType',
    'actionTaken',
    'result',
    'duration',
    'nptHours',
    'severity',
    'operationalImpact',
    'confidence',
    'validationStatus',
    'sourceDocument',
  ];
  return keys.map((key) => {
    const confidence = calculateFieldConfidence(key, event, spans);
    const span = spans.find((candidate) => candidate.fieldKey === key);
    const confidenceLevel = getConfidenceLevel(confidence);
    return {
      id: `${'id' in event ? event.id : 'event'}-${key}`,
      key,
      label: fieldLabel(key),
      value: getEventValue(event, key),
      normalizedValue: key === 'eventCategory' ? event.normalizedLabel : key === 'asset' ? event.assetTag : undefined,
      sourceSpanId: span?.id,
      confidence,
      confidenceLevel,
      tone: fieldTone(key, event),
      requiresReview: confidenceLevel === 'low' || confidenceLevel === 'missing' || key === 'cause' && event.causeType !== 'reported_fact',
      reasoning: span?.explanation ?? `${fieldLabel(key)} was derived from report context, source metadata, or normalized operational taxonomy.`,
    };
  });
}

function extractEventFromSeed(seed: EventSeed, runtimePatch?: RuntimePatch): ExtractedEvent {
  const patched: EventSeed = {
    ...seed,
    validationStatus: runtimePatch?.validationStatus ?? seed.validationStatus,
    confidence: runtimePatch?.confidence ?? seed.confidence,
    cause: runtimePatch?.cause ?? seed.cause,
    causeType: runtimePatch?.causeType ?? seed.causeType,
    eventCategory: runtimePatch?.eventCategory ?? seed.eventCategory,
    normalizedLabel: runtimePatch?.normalizedLabel ?? seed.normalizedLabel,
    learningNote: runtimePatch?.learningNote ?? seed.learningNote,
    title: runtimePatch?.title ?? seed.title,
  };
  const spans = buildSourceSpans(patched);
  const fields = buildExtractedFields(patched, spans);
  return {
    ...patched,
    confidenceLevel: runtimePatch?.confidenceLevel ?? getConfidenceLevel(patched.confidence),
    sourceSpanIds: spans.map((span) => span.id),
    fields,
  };
}

function extractEventFromReport(report: HistoricalReport, events: ExtractedEvent[]): ExtractedEvent {
  return events.find((event) => event.sourceDocumentId === report.id) ?? events.find((event) => event.domain === report.domain) ?? events[0];
}

function getSelectedReport(reports: HistoricalReport[], selectedReportId: string, fallbackScenarioId: ScenarioId): HistoricalReport {
  const byId = reports.find((report) => report.id === selectedReportId);
  if (byId) return byId;
  const scenario = getScenarioConfig(fallbackScenarioId);
  return reports.find((report) => report.id === scenario.sourceDocumentId) ?? reports[0];
}

function normalizeOperationalTerms(event: ExtractedEvent): NormalizationExample {
  const byCluster = NORMALIZATION_EXAMPLES.find((example) => example.normalized.toLowerCase().includes(event.normalizedLabel.split('+')[0].trim().toLowerCase()));
  if (byCluster) return byCluster;
  if (event.clusterId === 'CL-COMP-HIGHTEMP') return NORMALIZATION_EXAMPLES[1];
  if (event.clusterId === 'CL-PUMP-VIB-SEAL') return NORMALIZATION_EXAMPLES[2];
  if (event.clusterId === 'CL-MATERIAL-NPT') return NORMALIZATION_EXAMPLES[3];
  return NORMALIZATION_EXAMPLES[0];
}

function resolveAssetAlias(event: ExtractedEvent): AssetResolution {
  const ambiguous = event.asset.toLowerCase().includes('main compressor') || event.asset.toLowerCase().includes('downstream');
  return {
    phrase: event.asset,
    officialTag: event.assetTag,
    confidence: ambiguous ? clamp(event.confidence - 13, 55, 88) : clamp(event.confidence + 5, 70, 98),
    status: ambiguous ? 'requires_review' : 'resolved',
    candidates: [
      { label: event.assetTag, confidence: ambiguous ? 82 : clamp(event.confidence + 5, 75, 98), selected: true, tone: 'emerald' },
      { label: event.facility, confidence: ambiguous ? 74 : 62, selected: false, tone: 'cyan' },
      { label: event.well ?? 'Facility-level asset family', confidence: ambiguous ? 61 : 44, selected: false, tone: 'amber' },
    ],
  };
}

function calculateEventSeverity(event: ExtractedEvent): Severity {
  if ((event.nptHours ?? 0) >= 6 || event.eventCategory === 'MWDFailure') return 'high';
  if (event.eventCategory === 'NearMiss') return 'medium';
  if ((event.nptHours ?? 0) >= 2) return 'medium';
  if (event.confidence < 78) return 'low';
  return event.severity;
}

function calculateValidationStatus(event: ExtractedEvent): ValidationStatus {
  if (event.validationStatus !== 'pending_review') return event.validationStatus;
  if (event.confidence >= 90 && event.causeType === 'reported_fact') return 'approved';
  if (event.causeType === 'conflicting') return 'ambiguous';
  return 'pending_review';
}

function calculateOperationalMemoryMetrics(events: ExtractedEvent[], selectedEvent: ExtractedEvent): OperationalMemoryMetrics {
  const highConfidenceEvents = Math.round(128_940 * 0.78);
  const reviewRate = events.filter((event) => event.validationStatus === 'pending_review' || event.confidence < 84).length / Math.max(1, events.length);
  return {
    documentsIndexed: 42_618,
    yearsCovered: 8.7,
    candidateEvents: 128_940,
    highConfidenceEvents,
    eventsRequiringReview: Math.round(128_940 * reviewRate * 0.62),
    sourceTraceabilityCoverage: 100,
    analystHoursSaved: 310 + Math.round(selectedEvent.similarEventCount * 1.6),
    similarCasesFound: selectedEvent.similarEventCount,
    nptEventsDiscovered: 11_842 + Math.round((selectedEvent.nptHours ?? 0) * 140),
    recurringFailurePatterns: 6 + BASE_CLUSTERS.filter((cluster) => cluster.domain === selectedEvent.domain).length,
    predictiveModelReadiness: buildPredictiveSignal(selectedEvent.clusterId).readinessScore,
    searchTimeReduction: 94,
    validationBacklog: 416 + Math.round(reviewRate * 180),
  };
}

function calculateSystemMetrics(selectedScenario: ScenarioConfig, progress: number): SystemMetrics {
  return {
    corpusStatus: 'Historical corpus loaded',
    selectedDomain: selectedScenario.domain,
    selectedScenario: selectedScenario.shortName,
    timeSpan: '2016–2024 · 8.7 years',
    extractionProgress: progress,
    documentsIndexed: 42_618,
    candidateEvents: 128_940,
    humanValidationEnabled: true,
    traceabilityActive: true,
    dominantConstraint: selectedScenario.causeType === 'hypothesis' ? 'Hypothesis separated from reported fact' : 'Source traceability active',
  };
}

function buildTimelinePoints(events: ExtractedEvent[]): TimelinePoint[] {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((event, index) => ({
    id: `TL-${event.id}`,
    eventId: event.id,
    domain: event.domain,
    label: event.normalizedLabel,
    date: event.date,
    position: index + 1,
    depth: event.domain === 'drilling' ? 2950 + index * 85 : undefined,
    asset: event.assetTag,
    severity: calculateEventSeverity(event),
    nptHours: event.nptHours ?? 0,
    clusterId: event.clusterId,
    source: event.sourceDocument,
  }));
}

function buildEventClusters(events: ExtractedEvent[]): EventCluster[] {
  return BASE_CLUSTERS.map((cluster) => {
    const clusterEvents = events.filter((event) => event.clusterId === cluster.id);
    const averageConfidence = clusterEvents.length
      ? Math.round(clusterEvents.reduce((sum, event) => sum + event.confidence, 0) / clusterEvents.length)
      : cluster.confidence;
    const totalNpt = clusterEvents.reduce((sum, event) => sum + (event.nptHours ?? 0), 0);
    return {
      ...cluster,
      confidence: averageConfidence,
      eventCount: Math.max(cluster.eventCount, clusterEvents.length),
      nptExposure: Math.max(cluster.nptExposure, Math.round(totalNpt * 2)),
    };
  });
}

function runNaturalLanguageSearch(query: SearchQuery, events: ExtractedEvent[]): SearchResult[] {
  const clusterEvents = events.filter((event) => event.clusterId === query.expectedClusterId);
  const fallbackEvents = events.filter((event) => event.domain === query.domain && event.clusterId !== query.expectedClusterId).slice(0, 2);
  return [...clusterEvents, ...fallbackEvents].slice(0, 5).map((event, index) => ({
    id: `${query.id}-RESULT-${index + 1}`,
    queryId: query.id,
    eventId: event.id,
    title: event.title,
    where: event.well ? `${event.well} · ${event.facility}` : event.facility,
    when: `${event.date} · ${event.shift}`,
    cause: `${event.cause} · ${CAUSE_TYPE_LABELS[event.causeType]}`,
    action: event.actionTaken,
    result: event.result,
    duration: formatDuration(event.duration, event.nptHours),
    source: event.sourceDocument,
    confidence: event.confidence,
  }));
}

function getSimilarEvents(event: ExtractedEvent, events: ExtractedEvent[]): ExtractedEvent[] {
  return events
    .filter((candidate) => candidate.clusterId === event.clusterId && candidate.id !== event.id)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}

function buildPredictiveSignal(clusterId: string): PredictiveSignal {
  return PREDICTIVE_SIGNALS.find((signal) => signal.clusterId === clusterId) ?? PREDICTIVE_SIGNALS[0];
}

function buildPatternInsight(clusterId: string): PatternInsight {
  return INSIGHTS.find((insight) => insight.clusterId === clusterId) ?? INSIGHTS[0];
}

function calculateBusinessImpact(event: ExtractedEvent): Array<{ label: string; value: string; tone: Tone; detail: string }> {
  const npt = event.nptHours ?? 0;
  return [
    {
      label: 'NPT context',
      value: npt > 0 ? `${npt.toFixed(npt % 1 === 0 ? 0 : 1)} h` : 'Preventive',
      tone: npt > 3 ? 'rose' : npt > 0 ? 'amber' : 'emerald',
      detail: npt > 0 ? 'Lost or exposed operating time captured from narrative.' : 'Safety or risk-reduction learning captured without NPT.',
    },
    {
      label: 'Similar cases',
      value: `${event.similarEventCount}`,
      tone: 'blue',
      detail: 'Structured events that can now be queried by engineers.',
    },
    {
      label: 'Model readiness',
      value: `${buildPredictiveSignal(event.clusterId).readinessScore}%`,
      tone: 'violet',
      detail: 'Completeness of extracted historical features for predictive use.',
    },
    {
      label: 'Traceability',
      value: '100%',
      tone: 'emerald',
      detail: 'Every field remains anchored to a source document fragment.',
    },
  ];
}

function applyValidationAction(action: ValidationActionKind, event: ExtractedEvent): RuntimePatch {
  if (action === 'approve') {
    return {
      validationStatus: 'approved',
      confidence: clamp(event.confidence + 6, 0, 98),
      confidenceLevel: getConfidenceLevel(clamp(event.confidence + 6, 0, 98)),
      learningNote: `Reviewer approved ${event.id}; pattern confidence updated with trusted source evidence.`,
    };
  }
  if (action === 'edit') {
    const correctedCause = event.clusterId === 'CL-COMP-HIGHTEMP' ? 'Instrumentation trip / faulty temperature sensor' : event.cause;
    return {
      validationStatus: 'corrected',
      confidence: clamp(event.confidence + 4, 0, 96),
      confidenceLevel: getConfidenceLevel(clamp(event.confidence + 4, 0, 96)),
      cause: correctedCause,
      causeType: event.clusterId === 'CL-COMP-HIGHTEMP' ? 'reported_fact' : event.causeType,
      learningNote: `Reviewer correction captured for ${event.id}; normalization dictionary and cluster assignment received feedback.`,
    };
  }
  if (action === 'split') {
    return {
      validationStatus: 'split',
      confidence: clamp(event.confidence + 2, 0, 94),
      confidenceLevel: getConfidenceLevel(clamp(event.confidence + 2, 0, 94)),
      title: `${event.title} · split into event and action`,
      learningNote: `Paragraph split: anomaly, decision and result now have separate audit trail anchors.`,
    };
  }
  if (action === 'merge') {
    return {
      validationStatus: 'merged',
      confidence: clamp(event.confidence + 3, 0, 95),
      confidenceLevel: getConfidenceLevel(clamp(event.confidence + 3, 0, 95)),
      learningNote: `Duplicate candidate merged with historical memory cluster ${event.clusterId}.`,
    };
  }
  if (action === 'ambiguous') {
    return {
      validationStatus: 'ambiguous',
      confidence: clamp(event.confidence - 8, 30, 90),
      confidenceLevel: getConfidenceLevel(clamp(event.confidence - 8, 30, 90)),
      causeType: 'conflicting',
      learningNote: `Reviewer marked evidence ambiguous; event remains searchable but blocked from automatic root-cause analytics.`,
    };
  }
  return {
    validationStatus: 'corrected',
    confidence: clamp(event.confidence + 5, 0, 96),
    confidenceLevel: getConfidenceLevel(clamp(event.confidence + 5, 0, 96)),
    eventCategory: event.eventCategory === 'HighTemperature' ? 'CompressorTrip' : event.eventCategory,
    normalizedLabel: event.eventCategory === 'HighTemperature' ? 'Compressor Trip + Instrumentation High Temperature' : event.normalizedLabel,
    learningNote: `Reviewer corrected operational taxonomy and updated pattern cluster features.`,
  };
}

function getReportTypeIcon(reportType: ReportType): ComponentType<{ className?: string }> {
  if (reportType === 'CompressorReport') return Gauge;
  if (reportType === 'ControlRoomLog') return Activity;
  if (reportType === 'MaintenanceWorkOrder') return Settings;
  if (reportType === 'ReliabilityReport') return Brain;
  if (reportType === 'VibrationReport') return Zap;
  if (reportType === 'HSENearMiss' || reportType === 'IncidentReport') return ShieldCheck;
  if (reportType === 'ProductionDaily' || reportType === 'BatteryReport') return Factory;
  return FileText;
}

function buildReportTypeChart(reports: HistoricalReport[]): ChartDatum[] {
  const counts = reports.reduce<Record<ReportType, number>>((acc, report) => {
    acc[report.reportType] = (acc[report.reportType] ?? 0) + 1;
    return acc;
  }, {} as Record<ReportType, number>);
  return Object.entries(counts).map(([key, value]) => ({
    name: REPORT_TYPE_LABELS[key as ReportType].replace(' Report', ''),
    value,
    tone: getReportTypeTone(key as ReportType),
  }));
}

function buildCategoryChart(events: ExtractedEvent[]): ChartDatum[] {
  const counts = events.reduce<Partial<Record<EventCategory, number>>>((acc, event) => {
    acc[event.eventCategory] = (acc[event.eventCategory] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([key, value]) => ({
    name: CATEGORY_LABELS[key as EventCategory],
    value,
    tone: fieldTone('eventCategory', events.find((event) => event.eventCategory === key) ?? events[0]),
  }));
}

function buildConfidenceChart(events: ExtractedEvent[]): ChartDatum[] {
  const levels: ConfidenceLevel[] = ['high', 'medium', 'low', 'missing'];
  return levels.map((level) => ({
    name: level === 'high' ? 'High' : level === 'medium' ? 'Medium' : level === 'low' ? 'Low' : 'Missing',
    value: events.filter((event) => event.confidenceLevel === level).length,
    tone: CONFIDENCE_TONES[level],
  }));
}

function buildDensityData(timeline: TimelinePoint[]): DensityDatum[] {
  const domains: Domain[] = ['drilling', 'production', 'maintenance', 'hse'];
  return domains.map((domain) => ({
    label: DOMAIN_LABELS[domain],
    events: timeline.filter((point) => point.domain === domain).length,
    npt: Number(timeline.filter((point) => point.domain === domain).reduce((sum, point) => sum + point.nptHours, 0).toFixed(1)),
  }));
}

function buildClusterScatterData(clusters: EventCluster[]): ClusterScatterDatum[] {
  return clusters.map((cluster) => ({
    clusterId: cluster.id,
    name: cluster.label,
    x: cluster.x,
    y: cluster.y,
    z: cluster.radius * 18,
    tone: cluster.tone,
    value: cluster.eventCount,
  }));
}

function sourceSpansForEvent(event: ExtractedEvent): SourceSpan[] {
  const seed = allEventSeeds().find((item) => item.id === event.id) ?? {
    ...event,
    sourceExcerpt: event.sourceExcerpt,
  };
  return buildSourceSpans(seed);
}

function toneText(tone: Tone): string {
  return getToneClasses(tone).text;
}

function toneBorder(tone: Tone): string {
  return getToneClasses(tone).border;
}

function toneSoft(tone: Tone): string {
  return getToneClasses(tone).soft;
}

function toneFill(tone: Tone): string {
  return getToneClasses(tone).fill;
}

function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

function Badge({ tone, children, onClick, active = false }: { tone: Tone; children: ReactNode; onClick?: () => void; active?: boolean }) {
  const classes = getToneClasses(tone);
  const content = (
    <span
      className={classNames(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-tight',
        classes.soft,
        active && `ring-2 ${classes.ring}`,
      )}
    >
      {children}
    </span>
  );
  if (!onClick) return content;
  return (
    <button type="button" onClick={onClick} className="rounded-full text-left transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-200">
      {content}
    </button>
  );
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={classNames('rounded-3xl border border-slate-200/80 bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl', className)}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, kicker, title, action }: { icon: ComponentType<{ className?: string }>; kicker: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-2 text-blue-700 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{kicker}</div>
          <div className="truncate text-sm font-bold text-slate-900">{title}</div>
        </div>
      </div>
      {action}
    </div>
  );
}

function ProgressBar({ value, tone = 'blue', height = 'h-2' }: { value: number; tone?: Tone; height?: string }) {
  return (
    <div className={classNames('overflow-hidden rounded-full bg-slate-100', height)}>
      <motion.div
        className={classNames('h-full rounded-full', tone === 'emerald' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : tone === 'rose' ? 'bg-rose-500' : tone === 'violet' ? 'bg-violet-500' : tone === 'cyan' ? 'bg-cyan-500' : 'bg-blue-500')}
        initial={{ width: 0 }}
        animate={{ width: `${clamp(value, 0, 100)}%` }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      />
    </div>
  );
}

function MiniMetric({ label, value, tone, onClick }: { label: string; value: string; tone: Tone; onClick?: () => void }) {
  const classes = getToneClasses(tone);
  const body = (
    <div className={classNames('rounded-2xl border bg-gradient-to-br p-3', classes.border, classes.gradient)}>
      <div className={classNames('text-lg font-black tabular-nums', classes.text)}>{value}</div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
    </div>
  );
  if (!onClick) return body;
  return (
    <button type="button" onClick={onClick} className="w-full text-left transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-200">
      {body}
    </button>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number | string; name?: string; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 text-xs shadow-xl backdrop-blur">
      <div className="mb-1 font-bold text-slate-800">{label}</div>
      {payload.map((item, index) => (
        <div key={`${item.name}-${index}`} className="flex items-center gap-2 text-slate-600">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color ?? '#64748b' }} />
          <span>{item.name}: </span>
          <span className="font-bold text-slate-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function Header({
  selectedScenario,
  scenarios,
  systemMetrics,
  autoplay,
  onToggleAutoplay,
  onReset,
  onSelectScenario,
}: {
  selectedScenario: ScenarioConfig;
  scenarios: ScenarioConfig[];
  systemMetrics: SystemMetrics;
  autoplay: boolean;
  onToggleAutoplay: () => void;
  onReset: () => void;
  onSelectScenario: (scenarioId: ScenarioId) => void;
}) {
  return (
    <header className="relative z-20 flex h-[108px] shrink-0 items-stretch gap-3 border-b border-slate-200/80 bg-white/82 px-5 py-3 shadow-[0_8px_32px_rgba(15,23,42,0.05)] backdrop-blur-2xl">
      <div className="flex w-[340px] shrink-0 items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
          <img src={PLUSPETROL_ISOLOGO} alt="Pluspetrol" className="h-9 w-9 object-contain" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-[17px] font-black tracking-tight text-slate-950">Pluspetrol Operational Memory Foundry</h1>
          </div>
          <p className="mt-1 max-w-[310px] text-xs leading-snug text-slate-500">
            Transforming historical reports into structured events, patterns, and predictive intelligence.
          </p>
        </div>
      </div>

      <div className="grid min-w-[440px] flex-1 grid-cols-3 gap-2">
        <Badge tone="emerald"><CheckCircle2 className="h-3 w-3" />{systemMetrics.corpusStatus}</Badge>
        <Badge tone="blue"><Database className="h-3 w-3" />{systemMetrics.documentsIndexed.toLocaleString()} documents indexed</Badge>
        <Badge tone="violet"><Brain className="h-3 w-3" />{systemMetrics.candidateEvents.toLocaleString()} candidate events</Badge>
        <Badge tone="cyan"><Clock className="h-3 w-3" />{systemMetrics.timeSpan}</Badge>
        <Badge tone={getDomainColor(systemMetrics.selectedDomain)}><Filter className="h-3 w-3" />{DOMAIN_LABELS[systemMetrics.selectedDomain]}</Badge>
        <Badge tone="amber"><ShieldCheck className="h-3 w-3" />{systemMetrics.dominantConstraint}</Badge>
        <div className="col-span-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2">
          <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Extraction progress</span>
          <div className="min-w-0 flex-1"><ProgressBar value={systemMetrics.extractionProgress} tone="violet" /></div>
          <span className="w-10 text-right text-xs font-black tabular-nums text-violet-700">{systemMetrics.extractionProgress}%</span>
        </div>
      </div>

      <div className="flex w-[520px] shrink-0 flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Scenario journey</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleAutoplay}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            >
              {autoplay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {autoplay ? 'Pause' : 'Autoplay'}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {scenarios.map((scenario) => {
            const active = scenario.id === selectedScenario.id;
            return (
              <button
                type="button"
                key={scenario.id}
                onClick={() => onSelectScenario(scenario.id)}
                className={classNames(
                  'group rounded-2xl border px-2 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-200',
                  active ? `${toneBorder(getDomainColor(scenario.domain))} bg-white shadow-md` : 'border-slate-200 bg-slate-50/70 hover:border-blue-200 hover:bg-white',
                )}
              >
                <div className={classNames('truncate text-[10px] font-black', active ? toneText(getDomainColor(scenario.domain)) : 'text-slate-500 group-hover:text-slate-900')}>
                  {scenario.shortName}
                </div>
                <div className="mt-1 h-1 rounded-full bg-slate-200">
                  <div className="h-1 rounded-full" style={{ width: active ? '100%' : '40%', backgroundColor: toneFill(getDomainColor(scenario.domain)) }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

function FoundryPipelineSvg({ phaseIndex, selectedEvent }: { phaseIndex: number; selectedEvent: ExtractedEvent }) {
  const tone = getDomainColor(selectedEvent.domain);
  const color = toneFill(tone);
  return (
    <svg viewBox="0 0 760 208" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id="foundryBeam" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#e2e8f0" />
          <stop offset="0.45" stopColor={color} stopOpacity="0.9" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="14" y="30" width="128" height="118" rx="24" fill="#ffffff" stroke="#cbd5e1" />
      {[0, 1, 2, 3].map((item) => (
        <motion.g key={item} initial={{ x: -18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: item * 0.12 }}>
          <rect x={32 + item * 12} y={48 + item * 14} width="72" height="46" rx="10" fill="#f8fafc" stroke="#dbeafe" />
          <line x1={42 + item * 12} y1={60 + item * 14} x2={88 + item * 12} y2={60 + item * 14} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          <line x1={42 + item * 12} y1={70 + item * 14} x2={78 + item * 12} y2={70 + item * 14} stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        </motion.g>
      ))}
      <motion.path
        d="M146 88 C214 78, 224 88, 282 88 S394 88, 448 88 S558 86, 628 92"
        fill="none"
        stroke="url(#foundryBeam)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="10 9"
        animate={{ strokeDashoffset: [0, -120] }}
        transition={{ repeat: Infinity, duration: 3.4, ease: 'linear' }}
      />
      <motion.path
        d="M146 116 C222 148, 286 134, 352 116 S492 68, 626 120"
        fill="none"
        stroke="#8b5cf6"
        strokeOpacity="0.45"
        strokeWidth="2.5"
        strokeDasharray="7 10"
        animate={{ strokeDashoffset: [0, -90] }}
        transition={{ repeat: Infinity, duration: 4.1, ease: 'linear' }}
      />
      <motion.g animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 24, ease: 'linear' }} style={{ transformOrigin: '342px 94px' }}>
        <circle cx="342" cy="94" r="54" fill="#ffffff" stroke="#dbeafe" strokeWidth="2" />
        <circle cx="342" cy="94" r="38" fill="#eff6ff" stroke="#bfdbfe" />
        <path d="M342 42 L350 72 L380 82 L354 99 L356 130 L342 108 L314 130 L326 99 L298 82 L331 74 Z" fill={color} fillOpacity="0.22" />
      </motion.g>
      <circle cx="342" cy="94" r="18" fill="#ffffff" stroke={color} strokeWidth="4" filter="url(#softGlow)" />
      <text x="342" y="99" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0f172a">AI</text>
      {[
        { x: 498, y: 46, label: 'Activity' },
        { x: 520, y: 82, label: 'Anomaly' },
        { x: 496, y: 120, label: 'Action' },
        { x: 540, y: 154, label: 'Result' },
      ].map((field, index) => (
        <motion.g key={field.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: phaseIndex >= 3 ? 1 : 0.35, x: 0 }} transition={{ delay: index * 0.08 }}>
          <rect x={field.x} y={field.y} width="104" height="26" rx="13" fill="#ffffff" stroke={index === 1 ? '#fecdd3' : '#bfdbfe'} />
          <circle cx={field.x + 14} cy={field.y + 13} r="5" fill={index === 1 ? '#e11d48' : color} />
          <text x={field.x + 25} y={field.y + 17} fontSize="11" fontWeight="700" fill="#334155">{field.label}</text>
        </motion.g>
      ))}
      <motion.g initial={{ scale: 0.9, opacity: 0.65 }} animate={{ scale: phaseIndex >= 9 ? 1.02 : 1, opacity: 1 }} transition={{ repeat: Infinity, repeatType: 'mirror', duration: 2.2 }}>
        <rect x="632" y="46" width="118" height="116" rx="26" fill="#ffffff" stroke="#bbf7d0" strokeWidth="2" />
        <circle cx="662" cy="78" r="11" fill="#dcfce7" stroke="#10b981" />
        <circle cx="704" cy="105" r="17" fill="#eef2ff" stroke="#8b5cf6" />
        <circle cx="676" cy="136" r="9" fill="#fef3c7" stroke="#f59e0b" />
        <path d="M662 78 L704 105 L676 136" stroke="#94a3b8" strokeWidth="2" fill="none" />
        <text x="691" y="154" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0f172a">Memory</text>
      </motion.g>
      {Array.from({ length: 12 }).map((_, index) => (
        <motion.circle
          key={index}
          r={index % 3 === 0 ? 4 : 2.5}
          fill={index % 4 === 0 ? '#8b5cf6' : index % 4 === 1 ? '#06b6d4' : index % 4 === 2 ? '#10b981' : '#f59e0b'}
          initial={{ cx: 154, cy: 93 + (index % 5) * 8, opacity: 0 }}
          animate={{ cx: [154, 342, 630], cy: [93 + (index % 5) * 8, 68 + (index % 4) * 20, 72 + (index % 5) * 18], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 4 + index * 0.16, delay: index * 0.2, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
}

function HighlightedText({
  text,
  spans,
  activeSpanId,
  activeFieldKey,
  onSelectSpan,
}: {
  text: string;
  spans: SourceSpan[];
  activeSpanId?: string;
  activeFieldKey?: FieldKey;
  onSelectSpan: (span: SourceSpan) => void;
}) {
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  const nodes: ReactNode[] = [];
  let cursor = 0;
  sorted.forEach((span) => {
    if (span.start > cursor) {
      nodes.push(<span key={`text-${cursor}`}>{text.slice(cursor, span.start)}</span>);
    }
    const active = span.id === activeSpanId || span.fieldKey === activeFieldKey;
    const classes = getToneClasses(span.tone);
    nodes.push(
      <button
        key={span.id}
        type="button"
        onClick={() => onSelectSpan(span)}
        className={classNames(
          'relative mx-0.5 rounded-lg border px-1.5 py-0.5 text-left font-semibold transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200',
          classes.soft,
          active && `ring-2 ${classes.ring}`,
        )}
      >
        <span>{text.slice(span.start, span.end)}</span>
        <span className={classNames('absolute -top-4 left-0 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.16em]', classes.bg, classes.text)}>
          {span.label}
        </span>
      </button>,
    );
    cursor = Math.max(cursor, span.end);
  });
  if (cursor < text.length) nodes.push(<span key={`text-${cursor}`}>{text.slice(cursor)}</span>);
  return <div className="text-[15px] leading-[2.35] text-slate-700">{nodes}</div>;
}

function ArchiveZone({
  reports,
  selectedReport,
  selectedDomain,
  reportTypeData,
  onSelectReport,
  onSelectReportType,
}: {
  reports: HistoricalReport[];
  selectedReport: HistoricalReport;
  selectedDomain: Domain;
  reportTypeData: ChartDatum[];
  onSelectReport: (report: HistoricalReport) => void;
  onSelectReportType: (reportType: ReportType) => void;
}) {
  const totalCandidateEvents = reports.reduce((sum, report) => sum + report.candidateEvents, 0);
  const lowQuality = reports.filter((report) => report.qualityScore < 84).length;
  const visibleReports = reports.filter((report) => report.domain === selectedDomain || report.id === selectedReport.id).slice(0, 9);
  const reportTypes = Array.from(new Set(reports.map((report) => report.reportType)));

  return (
    <Panel className="flex h-full min-h-0 flex-col overflow-hidden p-4">
      <SectionTitle
        icon={Archive}
        kicker="Historical archive"
        title="Document mountain"
        action={<Badge tone={getDomainColor(selectedDomain)}>{DOMAIN_LABELS[selectedDomain]}</Badge>}
      />
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Historical reports are not archives. They are unstructured operational memory: DDRs, shift logs, maintenance notes, alarm logs and HSE observations.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniMetric label="Years covered" value="8.7" tone="blue" />
        <MiniMetric label="Candidate events" value={totalCandidateEvents.toString()} tone="violet" />
        <MiniMetric label="Report families" value={reportTypes.length.toString()} tone="cyan" />
        <MiniMetric label="Low-quality docs" value={lowQuality.toString()} tone="amber" />
      </div>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Corpus by report type</div>
          <Badge tone="emerald">Traceable OCR</Badge>
        </div>
        <div className="h-[118px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportTypeData} margin={{ top: 4, right: 0, bottom: 0, left: -28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} height={36} />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {reportTypeData.map((entry) => (
                  <Cell key={entry.name} fill={toneFill(entry.tone)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {reportTypes.map((reportType) => {
          const Icon = getReportTypeIcon(reportType);
          const active = reportType === selectedReport.reportType;
          return (
            <button
              type="button"
              key={reportType}
              onClick={() => onSelectReportType(reportType)}
              className={classNames(
                'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-200',
                active ? toneSoft(getReportTypeTone(reportType)) : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700',
              )}
            >
              <Icon className="h-3 w-3" />
              {REPORT_TYPE_LABELS[reportType].replace(' Report', '')}
            </button>
          );
        })}
      </div>

      <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,rgba(248,250,252,0.95),rgba(255,255,255,0.95))] p-3">
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(#dbeafe_1px,transparent_1px),linear-gradient(90deg,#dbeafe_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="relative z-10 mb-2 flex items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Documents entering the foundry</div>
          <Badge tone="violet"><Sparkles className="h-3 w-3" />Semantic OCR</Badge>
        </div>
        <div className="relative z-10 grid grid-cols-1 gap-2 overflow-y-auto pr-1 memory-scroll h-[calc(100%-26px)]">
          {visibleReports.map((report, index) => {
            const Icon = getReportTypeIcon(report.reportType);
            const tone = getReportTypeTone(report.reportType);
            const active = report.id === selectedReport.id;
            return (
              <motion.button
                type="button"
                key={report.id}
                onClick={() => onSelectReport(report)}
                className={classNames(
                  'group relative w-full rounded-2xl border bg-white/92 p-3 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-200',
                  active ? `${toneBorder(tone)} ring-2 ${getToneClasses(tone).ring}` : 'border-slate-200 hover:border-blue-200 hover:shadow-md',
                )}
                initial={{ opacity: 0, y: 16, rotate: -1 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: index * 0.045 }}
              >
                <div className="flex items-start gap-2">
                  <div className={classNames('rounded-xl border p-2', toneSoft(tone))}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-black text-slate-900">{report.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                      <span>{REPORT_TYPE_LABELS[report.reportType]}</span>
                      <span>·</span>
                      <span>{report.date}</span>
                      <span>·</span>
                      <span>{report.author.role}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-blue-500" />
                </div>
                <div className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{report.excerpt}</div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Quality</div>
                    <ProgressBar value={report.qualityScore} tone={report.qualityScore > 88 ? 'emerald' : report.qualityScore > 80 ? 'amber' : 'rose'} height="h-1.5" />
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Events</div>
                    <div className={classNames('text-xs font-black', toneText(tone))}>{report.candidateEvents}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Unreadable</div>
                    <div className={classNames('text-xs font-black', report.unreadableFragments ? 'text-amber-700' : 'text-emerald-700')}>{report.unreadableFragments}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

function ExtractionFoundry({
  selectedReport,
  selectedEvent,
  spans,
  phaseIndex,
  activeSpanId,
  activeFieldKey,
  onSelectSpan,
  onSelectField,
  onOpenDocument,
}: {
  selectedReport: HistoricalReport;
  selectedEvent: ExtractedEvent;
  spans: SourceSpan[];
  phaseIndex: number;
  activeSpanId?: string;
  activeFieldKey?: FieldKey;
  onSelectSpan: (span: SourceSpan) => void;
  onSelectField: (field: ExtractedField) => void;
  onOpenDocument: () => void;
}) {
  const activeField = selectedEvent.fields.find((field) => field.key === activeFieldKey) ?? selectedEvent.fields.find((field) => field.sourceSpanId === activeSpanId);
  const normalization = normalizeOperationalTerms(selectedEvent);
  const assetResolution = resolveAssetAlias(selectedEvent);
  const railSteps = [
    'Detect report type',
    'Read context',
    'Identify activity',
    'Detect event',
    'Extract asset',
    'Separate fact vs hypothesis',
    'Extract action',
    'Extract result',
    'Estimate severity',
    'Attach source',
    'Assign confidence',
    'Queue validation',
  ];

  return (
    <Panel className="flex h-full min-h-0 flex-col overflow-hidden p-4">
      <SectionTitle
        icon={Cpu}
        kicker="Extraction foundry"
        title="Free text becomes structured memory"
        action={<Badge tone="violet"><Sparkles className="h-3 w-3" />AI reasoning visible</Badge>}
      />

      <div className="mt-3 grid grid-cols-[1fr_220px] gap-3">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Selected source excerpt</div>
              <div className="mt-1 truncate text-sm font-black text-slate-900">{selectedReport.title}</div>
            </div>
            <button
              type="button"
              onClick={onOpenDocument}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            >
              <Eye className="h-3.5 w-3.5" />
              Open source
            </button>
          </div>
          <HighlightedText text={selectedEvent.sourceExcerpt} spans={spans} activeSpanId={activeSpanId} activeFieldKey={activeFieldKey} onSelectSpan={onSelectSpan} />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Pipeline spine</div>
          <div className="mt-2 max-h-[170px] space-y-1.5 overflow-hidden">
            {railSteps.map((step, index) => {
              const done = index <= Math.min(railSteps.length - 1, phaseIndex + 2);
              return (
                <div key={step} className="flex items-center gap-2">
                  <div className={classNames('flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-black', done ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-400')}>
                    {done ? '✓' : index + 1}
                  </div>
                  <div className={classNames('truncate text-[10px] font-semibold', done ? 'text-slate-700' : 'text-slate-400')}>{step}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 h-[200px] rounded-3xl border border-slate-200 bg-white/80 p-2">
        <FoundryPipelineSvg phaseIndex={phaseIndex} selectedEvent={selectedEvent} />
      </div>

      <div className="mt-3 grid min-h-0 flex-1 grid-cols-[1.08fr_0.92fr] gap-3 overflow-hidden">
        <div className="min-h-0 rounded-3xl border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Structured fields assembled from spans</div>
              <div className="text-xs text-slate-500">Click a field to reveal its source anchor, normalization and confidence reasoning.</div>
            </div>
            <Badge tone={CONFIDENCE_TONES[selectedEvent.confidenceLevel]}>{formatConfidence(selectedEvent.confidence)}</Badge>
          </div>
          <div className="grid max-h-[214px] grid-cols-2 gap-2 overflow-y-auto pr-1 memory-scroll">
            {selectedEvent.fields.slice(0, 14).map((field) => {
              const active = field.key === activeFieldKey || field.sourceSpanId === activeSpanId;
              return (
                <button
                  type="button"
                  key={field.id}
                  onClick={() => onSelectField(field)}
                  className={classNames(
                    'rounded-2xl border bg-white p-2 text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200',
                    active ? `${toneBorder(field.tone)} ring-2 ${getToneClasses(field.tone).ring}` : 'border-slate-200',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{field.label}</div>
                    <span className={classNames('rounded-full px-1.5 py-0.5 text-[9px] font-black', toneSoft(CONFIDENCE_TONES[field.confidenceLevel]))}>{formatConfidence(field.confidence)}</span>
                  </div>
                  <div className="mt-1 line-clamp-2 text-[11px] font-bold leading-snug text-slate-800">{field.value}</div>
                  {field.normalizedValue && <div className={classNames('mt-1 text-[10px] font-semibold', toneText(field.tone))}>→ {field.normalizedValue}</div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid min-h-0 grid-rows-[1fr_1fr] gap-3 overflow-hidden">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Normalization engine</div>
              <Badge tone={normalization.tone}>{normalization.normalized}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {normalization.phrases.map((phrase) => (
                <span key={phrase} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 shadow-sm">{phrase}</span>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
              <ArrowRight className="h-4 w-4 text-blue-500" />
              <span>Multiple author phrases converge into one canonical operational label.</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Asset alias resolution</div>
              <Badge tone={assetResolution.status === 'resolved' ? 'emerald' : 'amber'}>{assetResolution.status === 'resolved' ? 'Resolved' : 'Requires review'}</Badge>
            </div>
            <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 text-[11px]">
              <div className="font-semibold text-slate-500">Free-text asset phrase</div>
              <div className="font-black text-slate-900">{assetResolution.phrase}</div>
            </div>
            <div className="mt-2 space-y-1.5">
              {assetResolution.candidates.map((candidate) => (
                <button
                  type="button"
                  key={candidate.label}
                  onClick={() => onSelectField(selectedEvent.fields.find((field) => field.key === 'assetTag') ?? selectedEvent.fields[0])}
                  className={classNames('flex w-full items-center justify-between rounded-xl border px-2 py-1.5 text-left text-[10px] transition hover:border-blue-200', candidate.selected ? toneSoft(candidate.tone) : 'border-slate-200 bg-white text-slate-500')}
                >
                  <span className="truncate font-bold">{candidate.label}</span>
                  <span className="font-black tabular-nums">{candidate.confidence}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeField && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-black text-slate-900">Field reasoning · {activeField.label}</div>
            <Badge tone={CONFIDENCE_TONES[activeField.confidenceLevel]}>{formatConfidence(activeField.confidence)}</Badge>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{activeField.reasoning}</p>
        </motion.div>
      )}
    </Panel>
  );
}

function EventMemoryCard({
  event,
  activeFieldKey,
  onSelectField,
  onOpenDocument,
  onOpenDetail,
}: {
  event: ExtractedEvent;
  activeFieldKey?: FieldKey;
  onSelectField: (field: ExtractedField) => void;
  onOpenDocument: () => void;
  onOpenDetail: () => void;
}) {
  const visibleFields = event.fields.filter((field) => ['eventCategory', 'domain', 'assetTag', 'activity', 'anomaly', 'cause', 'causeType', 'actionTaken', 'result', 'duration', 'nptHours', 'severity', 'operationalImpact'].includes(field.key));
  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge tone={getDomainColor(event.domain)}>{DOMAIN_LABELS[event.domain]}</Badge>
            <Badge tone={SEVERITY_TONES[event.severity]}>{event.severity.toUpperCase()}</Badge>
          </div>
          <h3 className="mt-2 text-lg font-black leading-tight text-slate-950">{event.normalizedLabel}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{event.title}</p>
        </div>
        <button
          type="button"
          onClick={onOpenDetail}
          className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:border-blue-200 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniMetric label="Confidence" value={formatConfidence(event.confidence)} tone={CONFIDENCE_TONES[event.confidenceLevel]} />
        <MiniMetric label="Similar cases" value={`${event.similarEventCount}`} tone="blue" />
        <MiniMetric label="Validation" value={VALIDATION_LABELS[event.validationStatus].split(' ')[0]} tone={VALIDATION_TONES[event.validationStatus]} />
        <MiniMetric label="NPT" value={event.nptHours === null ? 'Missing' : `${event.nptHours}h`} tone={event.nptHours && event.nptHours > 3 ? 'rose' : 'amber'} />
      </div>

      <div className="mt-3 space-y-1.5">
        {visibleFields.map((field) => {
          const active = field.key === activeFieldKey;
          return (
            <button
              type="button"
              key={field.id}
              onClick={() => onSelectField(field)}
              className={classNames(
                'grid w-full grid-cols-[118px_1fr_auto] items-center gap-2 rounded-2xl border px-2.5 py-2 text-left transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200',
                active ? `${toneBorder(field.tone)} ${getToneClasses(field.tone).bg}` : 'border-slate-200 bg-white',
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{field.label}</span>
              <span className="line-clamp-1 text-[11px] font-bold text-slate-800">{field.value}</span>
              <span className={classNames('rounded-full px-1.5 py-0.5 text-[9px] font-black tabular-nums', toneSoft(CONFIDENCE_TONES[field.confidenceLevel]))}>{formatConfidence(field.confidence)}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onOpenDocument}
        className="mt-3 flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-left text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200"
      >
        <span className="inline-flex min-w-0 items-center gap-2"><Link2 className="h-4 w-4 shrink-0" /><span className="truncate">Source: {event.sourceDocument}</span></span>
        <ChevronRight className="h-4 w-4 shrink-0" />
      </button>
    </div>
  );
}

function RightMemoryPanel({
  event,
  activeFieldKey,
  traceLog,
  metrics,
  onSelectField,
  onValidate,
  onOpenDocument,
  onOpenValidation,
  onOpenDetail,
  onStreamItem,
}: {
  event: ExtractedEvent;
  activeFieldKey?: FieldKey;
  traceLog: StreamItem[];
  metrics: OperationalMemoryMetrics;
  onSelectField: (field: ExtractedField) => void;
  onValidate: (action: ValidationActionKind) => void;
  onOpenDocument: () => void;
  onOpenValidation: () => void;
  onOpenDetail: () => void;
  onStreamItem: (item: StreamItem) => void;
}) {
  return (
    <Panel className="flex h-full min-h-0 flex-col overflow-hidden p-4">
      <SectionTitle
        icon={Database}
        kicker="Structured memory"
        title="Source-backed event intelligence"
        action={<Badge tone={VALIDATION_TONES[event.validationStatus]}>{VALIDATION_LABELS[event.validationStatus]}</Badge>}
      />

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 memory-scroll">
        <EventMemoryCard event={event} activeFieldKey={activeFieldKey} onSelectField={onSelectField} onOpenDocument={onOpenDocument} onOpenDetail={onOpenDetail} />

        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Human-in-the-loop validation</div>
              <div className="text-xs text-slate-500">Extraction is validated before it becomes trusted data.</div>
            </div>
            <button
              type="button"
              onClick={onOpenValidation}
              className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              Workbench
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <MiniMetric label="Approved" value="3" tone="emerald" onClick={() => onValidate('approve')} />
            <MiniMetric label="Corrected" value="1" tone="blue" onClick={() => onValidate('edit')} />
            <MiniMetric label="Ambiguous" value="1" tone="amber" onClick={() => onValidate('ambiguous')} />
            <MiniMetric label="Backlog" value={metrics.validationBacklog.toString()} tone="violet" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {VALIDATION_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  type="button"
                  key={action.id}
                  onClick={() => onValidate(action.id)}
                  className={classNames('rounded-2xl border p-2 text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200', toneSoft(action.tone))}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-[11px] font-black">{action.label}</span>
                  </div>
                  <div className="mt-1 line-clamp-2 text-[10px] leading-snug opacity-80">{action.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 rounded-3xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Extraction governance
          </div>
          <div className="mt-2 space-y-2 text-[11px] leading-relaxed text-slate-600">
            <p>Every extracted event remains traceable to a source document and highlighted fragment.</p>
            <p>Causes are tagged as reported fact, hypothesis, unknown or conflicting evidence.</p>
            <p>Human validation is required for high-impact or low-confidence fields. Corrections create learning feedback; structured memory supports engineering judgment, not automatic authority.</p>
          </div>
        </div>

        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Live event stream</div>
            <Badge tone="cyan">Learning loop</Badge>
          </div>
          <div className="space-y-1.5">
            {traceLog.slice(0, 6).map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => onStreamItem(item)}
                className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-left text-[11px] text-slate-600 transition hover:border-blue-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: toneFill(item.tone) }} />
                <span className="line-clamp-1 font-semibold">{item.message}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function TimelineDeck({
  timeline,
  selectedEventId,
  densityData,
  onSelectEvent,
}: {
  timeline: TimelinePoint[];
  selectedEventId: string;
  densityData: DensityDatum[];
  onSelectEvent: (eventId: string) => void;
}) {
  const maxPosition = Math.max(...timeline.map((point) => point.position), 1);
  return (
    <div className="grid h-full grid-cols-[1fr_300px] gap-3">
      <div className="rounded-3xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Event timeline</div>
            <div className="text-sm font-black text-slate-900">Events become operational memory points</div>
          </div>
          <Badge tone="blue">Clickable source-backed events</Badge>
        </div>
        <div className="relative mt-6 h-[130px] rounded-3xl border border-slate-200 bg-slate-50 px-5 py-6">
          <div className="absolute left-6 right-6 top-1/2 h-1 rounded-full bg-gradient-to-r from-blue-100 via-violet-200 to-emerald-100" />
          {timeline.map((point) => {
            const left = `${(point.position / maxPosition) * 92 + 2}%`;
            const active = point.eventId === selectedEventId;
            const tone = SEVERITY_TONES[point.severity];
            return (
              <button
                type="button"
                key={point.id}
                onClick={() => onSelectEvent(point.eventId)}
                className="absolute top-1/2 -translate-y-1/2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                style={{ left }}
                title={point.label}
              >
                <motion.span
                  className={classNames('block rounded-full border-4 bg-white shadow-lg', active ? 'h-8 w-8' : 'h-5 w-5')}
                  style={{ borderColor: toneFill(tone) }}
                  animate={active ? { scale: [1, 1.16, 1] } : { scale: 1 }}
                  transition={{ repeat: active ? Infinity : 0, duration: 1.8 }}
                />
                <span className={classNames('absolute left-1/2 top-8 w-28 -translate-x-1/2 text-center text-[9px] font-bold leading-tight', active ? toneText(tone) : 'text-slate-500')}>
                  {point.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-4">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Timeline density</div>
        <div className="mt-3 h-[158px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={densityData} margin={{ left: -20, right: 8, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="events" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
              <Line type="monotone" dataKey="npt" stroke="#f59e0b" strokeWidth={2} dot />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SearchDeck({
  queries,
  activeQueryId,
  results,
  onSelectQuery,
  onSelectEvent,
}: {
  queries: SearchQuery[];
  activeQueryId: string;
  results: SearchResult[];
  onSelectQuery: (query: SearchQuery) => void;
  onSelectEvent: (eventId: string) => void;
}) {
  return (
    <div className="grid h-full grid-cols-[360px_1fr] gap-3">
      <div className="rounded-3xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-blue-600" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Ask the operational memory</div>
            <div className="text-sm font-black text-slate-900">Query events, not documents</div>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {queries.map((query) => {
            const active = query.id === activeQueryId;
            return (
              <button
                type="button"
                key={query.id}
                onClick={() => onSelectQuery(query)}
                className={classNames('w-full rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200', active ? toneSoft(query.tone) : 'border-slate-200 bg-slate-50 text-slate-600')}
              >
                <div className="text-xs font-bold leading-snug">{query.text}</div>
                <div className="mt-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em] opacity-75">
                  <span>{DOMAIN_LABELS[query.domain]}</span>
                  <span>{query.resultCount} events</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Structured results</div>
            <div className="text-sm font-black text-slate-900">What happened, where, why, what action and outcome</div>
          </div>
          <Badge tone="emerald">Source-backed cards</Badge>
        </div>
        <div className="grid max-h-[205px] grid-cols-2 gap-2 overflow-y-auto pr-1 memory-scroll">
          {results.map((result) => (
            <button
              type="button"
              key={result.id}
              onClick={() => onSelectEvent(result.eventId)}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <div className="line-clamp-1 text-xs font-black text-slate-900">{result.title}</div>
              <div className="mt-1 line-clamp-1 text-[10px] font-semibold text-slate-500">{result.where} · {result.when}</div>
              <div className="mt-2 space-y-1 text-[10px] leading-snug text-slate-600">
                <div><span className="font-black text-slate-400">Cause:</span> {result.cause}</div>
                <div><span className="font-black text-slate-400">Action:</span> {result.action}</div>
                <div><span className="font-black text-slate-400">Result:</span> {result.result}</div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <Badge tone={CONFIDENCE_TONES[getConfidenceLevel(result.confidence)]}>{formatConfidence(result.confidence)}</Badge>
                <span className="truncate text-[9px] font-bold text-slate-400">{result.source}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SimilarDeck({
  event,
  similarEvents,
  cluster,
  onSelectEvent,
}: {
  event: ExtractedEvent;
  similarEvents: ExtractedEvent[];
  cluster: EventCluster;
  onSelectEvent: (eventId: string) => void;
}) {
  return (
    <div className="grid h-full grid-cols-[1fr_320px] gap-3">
      <div className="rounded-3xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Similar historical events</div>
            <div className="text-sm font-black text-slate-900">Current event: {event.normalizedLabel}</div>
          </div>
          <Badge tone="blue">{event.similarEventCount} found</Badge>
        </div>
        <div className="grid max-h-[210px] grid-cols-3 gap-2 overflow-y-auto pr-1 memory-scroll">
          {similarEvents.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onSelectEvent(item.id)}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <div className="line-clamp-2 text-xs font-black text-slate-900">{item.title}</div>
              <div className="mt-2 text-[10px] font-semibold text-slate-500">{item.date} · {item.facility}</div>
              <div className="mt-2 line-clamp-2 text-[10px] text-slate-600">{item.actionTaken}</div>
              <div className="mt-2 flex items-center justify-between">
                <Badge tone={SEVERITY_TONES[item.severity]}>{item.severity}</Badge>
                <span className="text-[10px] font-black text-slate-400">{formatConfidence(item.confidence)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-4">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Outcome distribution</div>
        <div className="mt-2 h-[112px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={cluster.outcomes} dataKey="percentage" nameKey="label" innerRadius={32} outerRadius={54} paddingAngle={2}>
                {cluster.outcomes.map((outcome) => <Cell key={outcome.label} fill={toneFill(outcome.tone)} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5">
          {cluster.outcomes.map((outcome) => (
            <div key={outcome.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px]">
              <span className="font-semibold text-slate-600">{outcome.label}</span>
              <span className={classNames('font-black', toneText(outcome.tone))}>{outcome.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClusterDeck({
  clusters,
  selectedClusterId,
  scatterData,
  onSelectCluster,
}: {
  clusters: EventCluster[];
  selectedClusterId: string;
  scatterData: ClusterScatterDatum[];
  onSelectCluster: (clusterId: string) => void;
}) {
  const selected = clusters.find((cluster) => cluster.id === selectedClusterId) ?? clusters[0];
  return (
    <div className="grid h-full grid-cols-[420px_1fr] gap-3">
      <div className="rounded-3xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Pattern clusters</div>
            <div className="text-sm font-black text-slate-900">Events group into operational patterns</div>
          </div>
          <Badge tone={selected.tone}>{selected.eventCount} events</Badge>
        </div>
        <div className="mt-2 h-[188px] rounded-3xl border border-slate-200 bg-slate-50 p-1">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
              <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
              <ZAxis type="number" dataKey="z" range={[120, 520]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltip />} />
              <Scatter
                data={scatterData}
                onClick={(data: unknown) => {
                  const datum = data as ClusterScatterDatum;
                  if (datum.clusterId) onSelectCluster(datum.clusterId);
                }}
              >
                {scatterData.map((entry) => (
                  <Cell key={entry.clusterId} fill={toneFill(entry.tone)} stroke={entry.clusterId === selectedClusterId ? '#0f172a' : '#ffffff'} strokeWidth={entry.clusterId === selectedClusterId ? 3 : 1} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 memory-scroll">
        {clusters.map((cluster) => {
          const active = cluster.id === selectedClusterId;
          return (
            <button
              type="button"
              key={cluster.id}
              onClick={() => onSelectCluster(cluster.id)}
              className={classNames('rounded-3xl border bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200', active ? `${toneBorder(cluster.tone)} ring-2 ${getToneClasses(cluster.tone).ring}` : 'border-slate-200')}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="line-clamp-2 text-xs font-black text-slate-900">{cluster.label}</div>
                <Badge tone={cluster.tone}>{cluster.eventCount}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-[10px] leading-snug text-slate-500">{cluster.insight}</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                <div className="rounded-xl bg-slate-50 p-1.5 text-center"><div className="text-[9px] text-slate-400">Conf.</div><div className="text-[11px] font-black text-slate-900">{cluster.confidence}%</div></div>
                <div className="rounded-xl bg-slate-50 p-1.5 text-center"><div className="text-[9px] text-slate-400">NPT</div><div className="text-[11px] font-black text-slate-900">{cluster.nptExposure}%</div></div>
                <div className="rounded-xl bg-slate-50 p-1.5 text-center"><div className="text-[9px] text-slate-400">Repeat</div><div className="text-[11px] font-black text-slate-900">{cluster.recurrenceRate}%</div></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PredictiveDeck({ signal, insight, cluster }: { signal: PredictiveSignal; insight: PatternInsight; cluster: EventCluster }) {
  return (
    <div className="grid h-full grid-cols-[1fr_360px] gap-3">
      <div className="rounded-3xl border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Predictive signal</div>
            <div className="text-lg font-black text-slate-950">{signal.title}</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{signal.historicalPattern}</p>
          </div>
          <Badge tone="emerald">Readiness {signal.readinessScore}%</Badge>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <MiniMetric label="Risk exposure" value={`${signal.riskDelta}%`} tone={signal.riskDelta > 30 ? 'rose' : signal.riskDelta > 0 ? 'amber' : 'emerald'} />
          <MiniMetric label="Signal confidence" value={`${signal.confidence}%`} tone={CONFIDENCE_TONES[getConfidenceLevel(signal.confidence)]} />
          <MiniMetric label="Cluster events" value={`${cluster.eventCount}`} tone={cluster.tone} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Leading indicators</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {signal.leadingIndicators.map((item) => <Badge key={item} tone="blue">{item}</Badge>)}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Recommended monitoring</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {signal.recommendedMonitoring.map((item) => <Badge key={item} tone="violet">{item}</Badge>)}
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-emerald-700" />
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">AI insight panel</div>
        </div>
        <h4 className="mt-2 text-sm font-black text-slate-950">{insight.title}</h4>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">{insight.narrative}</p>
        <div className="mt-3 space-y-1.5">
          {insight.supportingSignals.map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-600">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {item}
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-white p-3 text-xs font-semibold leading-relaxed text-emerald-800">
          {signal.operationalValue}
        </div>
      </div>
    </div>
  );
}

function AnalyticsDeck({
  activeDeck,
  setActiveDeck,
  selectedEvent,
  selectedCluster,
  selectedClusterId,
  timeline,
  densityData,
  searchQueries,
  activeQueryId,
  searchResults,
  similarEvents,
  clusters,
  scatterData,
  signal,
  insight,
  categoryData,
  confidenceData,
  onSelectEvent,
  onSelectQuery,
  onSelectCluster,
}: {
  activeDeck: DeckMode;
  setActiveDeck: (mode: DeckMode) => void;
  selectedEvent: ExtractedEvent;
  selectedCluster: EventCluster;
  selectedClusterId: string;
  timeline: TimelinePoint[];
  densityData: DensityDatum[];
  searchQueries: SearchQuery[];
  activeQueryId: string;
  searchResults: SearchResult[];
  similarEvents: ExtractedEvent[];
  clusters: EventCluster[];
  scatterData: ClusterScatterDatum[];
  signal: PredictiveSignal;
  insight: PatternInsight;
  categoryData: ChartDatum[];
  confidenceData: ChartDatum[];
  onSelectEvent: (eventId: string) => void;
  onSelectQuery: (query: SearchQuery) => void;
  onSelectCluster: (clusterId: string) => void;
}) {
  return (
    <Panel className="flex h-full min-h-0 flex-col overflow-hidden p-4">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle icon={TrendingUp} kicker="Pattern intelligence deck" title="Timeline, search, clusters and predictive signal" />
        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
          {DECK_MODES.map((mode) => {
            const Icon = mode.icon;
            const active = activeDeck === mode.id;
            return (
              <button
                type="button"
                key={mode.id}
                onClick={() => setActiveDeck(mode.id)}
                className={classNames('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-200', active ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900')}
              >
                <Icon className="h-3.5 w-3.5" />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid h-[64px] grid-cols-4 gap-2">
        <MiniMetric label="Selected event" value={selectedEvent.id.replace('EV-', '#')} tone={getDomainColor(selectedEvent.domain)} />
        <MiniMetric label="Cluster" value={`${selectedCluster.eventCount}`} tone={selectedCluster.tone} />
        <MiniMetric label="Event categories" value={`${categoryData.length}`} tone="violet" />
        <MiniMetric label="High confidence" value={`${confidenceData.find((item) => item.name === 'High')?.value ?? 0}`} tone="emerald" />
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={activeDeck} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full">
            {activeDeck === 'timeline' && <TimelineDeck timeline={timeline} selectedEventId={selectedEvent.id} densityData={densityData} onSelectEvent={onSelectEvent} />}
            {activeDeck === 'search' && <SearchDeck queries={searchQueries} activeQueryId={activeQueryId} results={searchResults} onSelectQuery={onSelectQuery} onSelectEvent={onSelectEvent} />}
            {activeDeck === 'similar' && <SimilarDeck event={selectedEvent} similarEvents={similarEvents} cluster={selectedCluster} onSelectEvent={onSelectEvent} />}
            {activeDeck === 'clusters' && <ClusterDeck clusters={clusters} selectedClusterId={selectedClusterId} scatterData={scatterData} onSelectCluster={onSelectCluster} />}
            {activeDeck === 'predictive' && <PredictiveDeck signal={signal} insight={insight} cluster={selectedCluster} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Panel>
  );
}

function DocumentViewerOverlay({
  report,
  event,
  spans,
  onClose,
  onSelectSpan,
}: {
  report: HistoricalReport;
  event: ExtractedEvent;
  spans: SourceSpan[];
  onClose: () => void;
  onSelectSpan: (span: SourceSpan) => void;
}) {
  return (
    <motion.div className="fixed inset-0 z-50 bg-slate-900/28 p-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.22)]"
        initial={{ y: 30, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.98 }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2 text-emerald-700"><Link2 className="h-5 w-5" /></div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Source traceability viewer</div>
              <div className="truncate text-lg font-black text-slate-950">{report.title}</div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-blue-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[1.15fr_0.85fr] gap-4 overflow-hidden p-5">
          <div className="min-h-0 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 memory-scroll">
            <div className="mb-4 grid grid-cols-4 gap-2">
              <MiniMetric label="Report type" value={REPORT_TYPE_LABELS[report.reportType].split(' ')[0]} tone={getReportTypeTone(report.reportType)} />
              <MiniMetric label="Date" value={report.date.slice(5)} tone="blue" />
              <MiniMetric label="Quality" value={`${report.qualityScore}%`} tone={report.qualityScore > 88 ? 'emerald' : 'amber'} />
              <MiniMetric label="Event ID" value={event.id.replace('EV-', '#')} tone="violet" />
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Original phrase</div>
                  <div className="text-sm font-black text-slate-900">Highlighted evidence spans</div>
                </div>
                <Badge tone="emerald">100% source anchored</Badge>
              </div>
              <HighlightedText text={event.sourceExcerpt} spans={spans} onSelectSpan={onSelectSpan} />
            </div>
            <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Document metadata</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[{ field: 'Author role', value: report.author.role }, { field: 'Author reliability', value: `${report.author.reliabilityScore}%` }, { field: 'Shift', value: report.shift }, { field: 'Facility', value: report.facility }, ...report.metadata].map((item) => (
                  <div key={`${item.field}-${item.value}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">{item.field}</div>
                    <div className="mt-1 text-xs font-bold text-slate-800">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="min-h-0 overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 memory-scroll">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Extracted event linked to source</div>
            <h3 className="mt-1 text-lg font-black leading-tight text-slate-950">{event.normalizedLabel}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{event.learningNote}</p>
            <div className="mt-4 space-y-2">
              {event.fields.slice(0, 12).map((field) => (
                <div key={field.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{field.label}</div>
                    <Badge tone={CONFIDENCE_TONES[field.confidenceLevel]}>{formatConfidence(field.confidence)}</Badge>
                  </div>
                  <div className="mt-1 text-xs font-bold text-slate-800">{field.value}</div>
                  {field.sourceSpanId && <div className="mt-1 text-[10px] font-semibold text-emerald-700">Anchored to {field.sourceSpanId.split('-SPAN-')[1]}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ValidationWorkbenchOverlay({
  event,
  spans,
  traceLog,
  onValidate,
  onClose,
  onSelectSpan,
}: {
  event: ExtractedEvent;
  spans: SourceSpan[];
  traceLog: StreamItem[];
  onValidate: (action: ValidationActionKind) => void;
  onClose: () => void;
  onSelectSpan: (span: SourceSpan) => void;
}) {
  const predictedStatus = calculateValidationStatus(event);
  return (
    <motion.div className="fixed inset-0 z-50 bg-slate-900/28 p-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.22)]"
        initial={{ y: 30, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.98 }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-2 text-blue-700"><ShieldCheck className="h-5 w-5" /></div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Validation workbench</div>
              <div className="truncate text-lg font-black text-slate-950">Trusted extraction before structured memory</div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-blue-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[1fr_1.15fr_0.75fr] gap-4 overflow-hidden p-5">
          <div className="min-h-0 overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 memory-scroll">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Original text</div>
                <div className="text-sm font-black text-slate-900">Evidence spans</div>
              </div>
              <Badge tone="emerald">Source retained</Badge>
            </div>
            <HighlightedText text={event.sourceExcerpt} spans={spans} onSelectSpan={onSelectSpan} />
            <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-xs font-black text-amber-900">Reviewer prompt</div>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                Confirm whether the cause is a reported fact or a hypothesis. High-impact events and low-confidence cause fields should not be promoted without review.
              </p>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 memory-scroll">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Extracted fields</div>
                <div className="text-sm font-black text-slate-900">Confidence, missing fields and suggested normalization</div>
              </div>
              <Badge tone={VALIDATION_TONES[predictedStatus]}>Suggested: {VALIDATION_LABELS[predictedStatus]}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {event.fields.map((field) => (
                <div key={field.id} className={classNames('rounded-2xl border p-3', field.requiresReview ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200 bg-slate-50')}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{field.label}</div>
                    <Badge tone={CONFIDENCE_TONES[field.confidenceLevel]}>{field.confidenceLevel}</Badge>
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs font-bold text-slate-800">{field.value}</div>
                  {field.requiresReview && <div className="mt-1 text-[10px] font-bold text-amber-700">Review required</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 memory-scroll">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Reviewer controls</div>
            <div className="mt-3 space-y-2">
              {VALIDATION_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    type="button"
                    key={action.id}
                    onClick={() => onValidate(action.id)}
                    className={classNames('w-full rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200', toneSoft(action.tone))}
                  >
                    <div className="flex items-center gap-2 text-xs font-black"><Icon className="h-4 w-4" />{action.label}</div>
                    <div className="mt-1 text-[10px] leading-snug opacity-80">{action.description}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 rounded-3xl border border-emerald-200 bg-white p-3">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Audit trail</div>
              <div className="mt-2 space-y-1.5">
                {traceLog.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] font-semibold text-slate-600">{item.message}</div>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-3xl border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-800">
              Corrections update category, cause type, confidence, pattern cluster and learning signal. Validation converts extraction into trusted operational data.
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailDrawer({
  event,
  cluster,
  signal,
  insight,
  similarEvents,
  onClose,
  onOpenDocument,
  onSelectEvent,
}: {
  event: ExtractedEvent;
  cluster: EventCluster;
  signal: PredictiveSignal;
  insight: PatternInsight;
  similarEvents: ExtractedEvent[];
  onClose: () => void;
  onOpenDocument: () => void;
  onSelectEvent: (eventId: string) => void;
}) {
  const impact = calculateBusinessImpact(event);
  return (
    <motion.div className="fixed inset-0 z-50 bg-slate-900/12 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.aside
        className="absolute right-0 top-0 flex h-full w-[520px] flex-col overflow-hidden border-l border-slate-200 bg-white shadow-[0_0_80px_rgba(15,23,42,0.2)]"
        initial={{ x: 560 }}
        animate={{ x: 0 }}
        exit={{ x: 560 }}
        transition={{ type: 'spring', damping: 32, stiffness: 260 }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Event detail drawer</div>
            <div className="text-lg font-black text-slate-950">{event.id}</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-blue-200"><X className="h-5 w-5" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 memory-scroll">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone={getDomainColor(event.domain)}>{DOMAIN_LABELS[event.domain]}</Badge>
              <Badge tone={getReportTypeTone(event.reportType)}>{REPORT_TYPE_LABELS[event.reportType]}</Badge>
              <Badge tone={VALIDATION_TONES[event.validationStatus]}>{VALIDATION_LABELS[event.validationStatus]}</Badge>
            </div>
            <h2 className="mt-3 text-xl font-black leading-tight text-slate-950">{event.normalizedLabel}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{event.sourceExcerpt}</p>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              <MapPin className="h-4 w-4 text-cyan-600" />
              <span>{event.well ? `${event.well} · ` : ''}{event.facility}</span>
            </div>
            <button type="button" onClick={onOpenDocument} className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200">
              <Link2 className="h-4 w-4" /> Open source document
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {impact.map((item) => <MiniMetric key={item.label} label={item.label} value={item.value} tone={item.tone} />)}
          </div>
          <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Pattern cluster</div>
            <div className="mt-1 text-sm font-black text-slate-900">{cluster.label}</div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{cluster.insight}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {cluster.commonActions.map((action) => <Badge key={action} tone={cluster.tone}>{action}</Badge>)}
            </div>
          </div>
          <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Predictive use case</div>
            <div className="mt-1 text-sm font-black text-slate-900">{signal.modelUseCase}</div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{signal.historicalPattern}</p>
          </div>
          <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Similar events</div>
            <div className="mt-2 space-y-2">
              {similarEvents.slice(0, 4).map((item) => (
                <button key={item.id} type="button" onClick={() => onSelectEvent(item.id)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <div className="text-xs font-black text-slate-900">{item.title}</div>
                  <div className="mt-1 text-[10px] font-semibold text-slate-500">{item.date} · {item.sourceDocument}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Suggested use case</div>
            <p className="mt-2 text-xs leading-relaxed text-emerald-800">{insight.recommendedUse}</p>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}

export default function BizCaseB() {
  const reports = useMemo(() => generateHistoricalReports(), []);
  const eventSeeds = useMemo(() => allEventSeeds(), []);
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>('drillingTorque');
  const [selectedReportId, setSelectedReportId] = useState<string>(SCENARIOS[0].sourceDocumentId);
  const [selectedEventId, setSelectedEventId] = useState<string>(SCENARIO_EVENT_IDS.drillingTorque);
  const [selectedClusterId, setSelectedClusterId] = useState<string>(SCENARIOS[0].clusterId);
  const [activeDeck, setActiveDeck] = useState<DeckMode>('timeline');
  const [activeQueryId, setActiveQueryId] = useState<string>(SEARCH_QUERIES[0].id);
  const [activeSpanId, setActiveSpanId] = useState<string | undefined>(undefined);
  const [activeFieldKey, setActiveFieldKey] = useState<FieldKey | undefined>(undefined);
  const [overlay, setOverlay] = useState<OverlayMode>('none');
  const [autoplay, setAutoplay] = useState<boolean>(false);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [runtimePatches, setRuntimePatches] = useState<Record<string, RuntimePatch>>({});
  const [traceLog, setTraceLog] = useState<StreamItem[]>(() => [...STREAM_ITEMS].reverse());
  const interactionCountRef = useRef<number>(0);

  const selectedScenario = useMemo(() => getScenarioConfig(selectedScenarioId), [selectedScenarioId]);

  const events = useMemo(() => eventSeeds.map((seed) => extractEventFromSeed(seed, runtimePatches[seed.id])), [eventSeeds, runtimePatches]);

  const selectedReport = useMemo(
    () => getSelectedReport(reports, selectedReportId, selectedScenarioId),
    [reports, selectedReportId, selectedScenarioId],
  );

  const fallbackEvent = useMemo(() => extractEventFromReport(selectedReport, events), [events, selectedReport]);
  const selectedEvent = useMemo(() => events.find((event) => event.id === selectedEventId) ?? fallbackEvent, [events, fallbackEvent, selectedEventId]);
  const sourceSpans = useMemo(() => sourceSpansForEvent(selectedEvent), [selectedEvent]);
  const clusters = useMemo(() => buildEventClusters(events), [events]);
  const selectedCluster = useMemo(() => clusters.find((cluster) => cluster.id === selectedClusterId) ?? clusters[0], [clusters, selectedClusterId]);
  const timeline = useMemo(() => buildTimelinePoints(events), [events]);
  const densityData = useMemo(() => buildDensityData(timeline), [timeline]);
  const reportTypeData = useMemo(() => buildReportTypeChart(reports), [reports]);
  const categoryData = useMemo(() => buildCategoryChart(events), [events]);
  const confidenceData = useMemo(() => buildConfidenceChart(events), [events]);
  const scatterData = useMemo(() => buildClusterScatterData(clusters), [clusters]);
  const activeQuery = useMemo(() => SEARCH_QUERIES.find((query) => query.id === activeQueryId) ?? SEARCH_QUERIES[0], [activeQueryId]);
  const searchResults = useMemo(() => runNaturalLanguageSearch(activeQuery, events), [activeQuery, events]);
  const similarEvents = useMemo(() => getSimilarEvents(selectedEvent, events), [events, selectedEvent]);
  const insight = useMemo(() => buildPatternInsight(selectedClusterId), [selectedClusterId]);
  const signal = useMemo(() => buildPredictiveSignal(selectedClusterId), [selectedClusterId]);
  const progress = useMemo(() => Math.round(((phaseIndex + 1) / PHASES.length) * 100), [phaseIndex]);
  const systemMetrics = useMemo(() => calculateSystemMetrics(selectedScenario, progress), [selectedScenario, progress]);
  const memoryMetrics = useMemo(() => calculateOperationalMemoryMetrics(events, selectedEvent), [events, selectedEvent]);

  useEffect(() => {
    if (!autoplay) return undefined;
    const interval = window.setInterval(() => {
      setPhaseIndex((current) => (current + 1) % PHASES.length);
    }, 2100);
    return () => window.clearInterval(interval);
  }, [autoplay]);

  useEffect(() => {
    const scenario = getScenarioConfig(selectedScenarioId);
    setSelectedReportId(scenario.sourceDocumentId);
    setSelectedEventId(SCENARIO_EVENT_IDS[scenario.id]);
    setSelectedClusterId(scenario.clusterId);
    const queryForCluster = SEARCH_QUERIES.find((query) => query.expectedClusterId === scenario.clusterId) ?? SEARCH_QUERIES[0];
    setActiveQueryId(queryForCluster.id);
    setActiveSpanId(undefined);
    setActiveFieldKey(undefined);
  }, [selectedScenarioId]);

  const addTrace = (message: string, tone: Tone, phase: PhaseId, eventId?: string, clusterId?: string) => {
    interactionCountRef.current += 1;
    const item: StreamItem = {
      id: `USER-TRACE-${interactionCountRef.current}`,
      message,
      tone,
      phase,
      eventId,
      clusterId,
    };
    setTraceLog((current) => [item, ...current].slice(0, 14));
  };

  const handleSelectScenario = (scenarioId: ScenarioId) => {
    const scenario = getScenarioConfig(scenarioId);
    setSelectedScenarioId(scenarioId);
    setPhaseIndex(0);
    setActiveDeck('timeline');
    addTrace(`Scenario selected: ${scenario.name}`, getDomainColor(scenario.domain), 'document', SCENARIO_EVENT_IDS[scenarioId], scenario.clusterId);
  };

  const handleSelectReport = (report: HistoricalReport) => {
    const event = extractEventFromReport(report, events);
    setSelectedReportId(report.id);
    setSelectedEventId(event.id);
    setSelectedClusterId(event.clusterId);
    setActiveSpanId(undefined);
    setActiveFieldKey(undefined);
    if (report.scenarioId) setSelectedScenarioId(report.scenarioId);
    addTrace(`${report.id} selected; ${event.id} loaded`, getReportTypeTone(report.reportType), 'document', event.id, event.clusterId);
  };

  const handleSelectReportType = (reportType: ReportType) => {
    const report = reports.find((item) => item.reportType === reportType && item.domain === selectedScenario.domain) ?? reports.find((item) => item.reportType === reportType);
    if (report) handleSelectReport(report);
  };

  const handleSelectEvent = (eventId: string, openDetail = true) => {
    const event = events.find((item) => item.id === eventId);
    if (!event) return;
    setSelectedEventId(event.id);
    setSelectedReportId(event.sourceDocumentId);
    setSelectedClusterId(event.clusterId);
    setActiveSpanId(undefined);
    setActiveFieldKey(undefined);
    if (event.scenarioId) setSelectedScenarioId(event.scenarioId);
    if (openDetail) setOverlay('detail');
    addTrace(`${event.id} selected from operational memory`, getDomainColor(event.domain), 'timeline', event.id, event.clusterId);
  };

  const handleSelectSpan = (span: SourceSpan) => {
    setActiveSpanId(span.id);
    setActiveFieldKey(span.fieldKey);
    addTrace(`Source span selected: ${span.label} → ${fieldLabel(span.fieldKey)}`, span.tone, 'highlight', selectedEvent.id, selectedEvent.clusterId);
  };

  const handleSelectField = (field: ExtractedField) => {
    setActiveFieldKey(field.key);
    if (field.sourceSpanId) setActiveSpanId(field.sourceSpanId);
    addTrace(`Field selected: ${field.label} · confidence ${formatConfidence(field.confidence)}`, field.tone, 'fields', selectedEvent.id, selectedEvent.clusterId);
  };

  const handleValidate = (action: ValidationActionKind) => {
    const patch = applyValidationAction(action, selectedEvent);
    setRuntimePatches((current) => ({
      ...current,
      [selectedEvent.id]: {
        ...current[selectedEvent.id],
        ...patch,
      },
    }));
    const actionLabel = VALIDATION_ACTIONS.find((item) => item.id === action)?.label ?? 'Validation action';
    addTrace(`${actionLabel}: ${selectedEvent.id} · ${patch.learningNote ?? 'learning feedback captured'}`, VALIDATION_TONES[patch.validationStatus ?? selectedEvent.validationStatus], 'validation', selectedEvent.id, selectedEvent.clusterId);
  };

  const handleSelectQuery = (query: SearchQuery) => {
    setActiveQueryId(query.id);
    setSelectedClusterId(query.expectedClusterId);
    setActiveDeck('search');
    addTrace(`Memory query executed: ${query.resultCount} structured events returned`, query.tone, 'similar', undefined, query.expectedClusterId);
  };

  const handleSelectCluster = (clusterId: string) => {
    const cluster = clusters.find((item) => item.id === clusterId);
    if (!cluster) return;
    setSelectedClusterId(clusterId);
    setActiveDeck('clusters');
    const event = events.find((item) => item.clusterId === clusterId);
    if (event) {
      setSelectedEventId(event.id);
      setSelectedReportId(event.sourceDocumentId);
    }
    const query = SEARCH_QUERIES.find((item) => item.expectedClusterId === clusterId);
    if (query) setActiveQueryId(query.id);
    addTrace(`Cluster selected: ${cluster.label}`, cluster.tone, 'clusters', event?.id, clusterId);
  };

  const handleStreamItem = (item: StreamItem) => {
    setPhaseIndex(Math.max(0, PHASES.findIndex((phase) => phase.id === item.phase)));
    if (item.eventId) handleSelectEvent(item.eventId, false);
    if (item.clusterId) setSelectedClusterId(item.clusterId);
    addTrace(`Stream replayed: ${item.message}`, item.tone, item.phase, item.eventId, item.clusterId);
  };

  const resetDemo = () => {
    setSelectedScenarioId('drillingTorque');
    setSelectedReportId(SCENARIOS[0].sourceDocumentId);
    setSelectedEventId(SCENARIO_EVENT_IDS.drillingTorque);
    setSelectedClusterId(SCENARIOS[0].clusterId);
    setActiveDeck('timeline');
    setActiveQueryId(SEARCH_QUERIES[0].id);
    setActiveSpanId(undefined);
    setActiveFieldKey(undefined);
    setOverlay('none');
    setPhaseIndex(0);
    setRuntimePatches({});
    setTraceLog([...STREAM_ITEMS].reverse());
  };

  return (
    <div className="relative h-screen min-h-[860px] overflow-hidden bg-[#f7f9fc] text-slate-900">
      <style>{`
        @keyframes memoryFlow {
          0% { transform: translateX(-12px); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: translateX(18px); opacity: 0; }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: .45; }
          50% { opacity: .72; }
        }
        .memory-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .memory-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
        .memory-scroll::-webkit-scrollbar-track { background: transparent; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(#dbeafe_1px,transparent_1px),linear-gradient(90deg,#dbeafe_1px,transparent_1px)] [background-size:34px_34px]" style={{ animation: 'gridPulse 5s ease-in-out infinite' }} />
      <div className="pointer-events-none absolute -left-28 top-20 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute right-12 top-24 h-96 w-96 rounded-full bg-violet-200/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-[620px] -translate-x-1/2 rounded-full bg-emerald-100/45 blur-3xl" />

      <Header
        selectedScenario={selectedScenario}
        scenarios={SCENARIOS}
        systemMetrics={systemMetrics}
        autoplay={autoplay}
        onToggleAutoplay={() => setAutoplay((current) => !current)}
        onReset={resetDemo}
        onSelectScenario={handleSelectScenario}
      />

      <main className="relative z-10 grid h-[calc(100vh-108px)] min-h-[752px] grid-rows-[minmax(0,1fr)_318px] gap-3 p-3">
        <div className="grid min-h-0 grid-cols-[352px_minmax(0,1fr)_416px] gap-3">
          <ArchiveZone
            reports={reports}
            selectedReport={selectedReport}
            selectedDomain={selectedScenario.domain}
            reportTypeData={reportTypeData}
            onSelectReport={handleSelectReport}
            onSelectReportType={handleSelectReportType}
          />
          <ExtractionFoundry
            selectedReport={selectedReport}
            selectedEvent={selectedEvent}
            spans={sourceSpans}
            phaseIndex={phaseIndex}
            activeSpanId={activeSpanId}
            activeFieldKey={activeFieldKey}
            onSelectSpan={handleSelectSpan}
            onSelectField={handleSelectField}
            onOpenDocument={() => setOverlay('document')}
          />
          <RightMemoryPanel
            event={selectedEvent}
            activeFieldKey={activeFieldKey}
            traceLog={traceLog}
            metrics={memoryMetrics}
            onSelectField={handleSelectField}
            onValidate={handleValidate}
            onOpenDocument={() => setOverlay('document')}
            onOpenValidation={() => setOverlay('validation')}
            onOpenDetail={() => setOverlay('detail')}
            onStreamItem={handleStreamItem}
          />
        </div>
        <AnalyticsDeck
          activeDeck={activeDeck}
          setActiveDeck={setActiveDeck}
          selectedEvent={selectedEvent}
          selectedCluster={selectedCluster}
          selectedClusterId={selectedClusterId}
          timeline={timeline}
          densityData={densityData}
          searchQueries={SEARCH_QUERIES}
          activeQueryId={activeQueryId}
          searchResults={searchResults}
          similarEvents={similarEvents}
          clusters={clusters}
          scatterData={scatterData}
          signal={signal}
          insight={insight}
          categoryData={categoryData}
          confidenceData={confidenceData}
          onSelectEvent={handleSelectEvent}
          onSelectQuery={handleSelectQuery}
          onSelectCluster={handleSelectCluster}
        />
      </main>

      <div className="pointer-events-none absolute bottom-[332px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-white/88 px-3 py-2 text-[11px] font-bold text-slate-600 shadow-lg backdrop-blur-xl">
        <Timer className="h-3.5 w-3.5 text-blue-600" />
        <span>{PHASES[phaseIndex].label}</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-400">{PHASES[phaseIndex].description}</span>
      </div>

      <AnimatePresence>
        {overlay === 'document' && (
          <DocumentViewerOverlay
            report={selectedReport}
            event={selectedEvent}
            spans={sourceSpans}
            onClose={() => setOverlay('none')}
            onSelectSpan={handleSelectSpan}
          />
        )}
        {overlay === 'validation' && (
          <ValidationWorkbenchOverlay
            event={selectedEvent}
            spans={sourceSpans}
            traceLog={traceLog}
            onValidate={handleValidate}
            onClose={() => setOverlay('none')}
            onSelectSpan={handleSelectSpan}
          />
        )}
        {overlay === 'detail' && (
          <DetailDrawer
            event={selectedEvent}
            cluster={selectedCluster}
            signal={signal}
            insight={insight}
            similarEvents={similarEvents}
            onClose={() => setOverlay('none')}
            onOpenDocument={() => setOverlay('document')}
            onSelectEvent={(eventId) => handleSelectEvent(eventId, false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
