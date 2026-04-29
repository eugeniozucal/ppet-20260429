const fs = require('fs');
let s = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

// Fix 3357
s = s.replace(
  /<DrawerMetric key=\{label\} label=\{label\} value=\{value\} tone=\{tone\} \/>/g,
  '<DrawerMetric key={label} label={label} value={value} tone={tone as any} />'
);

// Fix 3655
s = s.replace(
  /setActiveOverlay\(activeStage === 'storage' \|\| activeStage === 'treatment' \? 'performance' : activeStage === 'drilling' \|\| activeStage === 'gathering' \? 'network' : 'command'\)/g,
  "setActiveOverlay('none')"
);

fs.writeFileSync('components/FactoryCommand_v4_1.tsx', s);
