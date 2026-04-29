const fs = require('fs');
let content = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

// remove second redeclaration of tvModes
content = content.replace(
  /const tvModes = \[\s*\{ id: 'command' as const,[\s\S]*?\];/m,
  ""
);

content = content.replace(
  /setActiveOverlay\(activeStage === 'storage' \|\| activeStage === 'treatment' \? 'performance' : activeStage === 'drilling' \|\| activeStage === 'gathering' \? 'network' : 'command'\)/g,
  "setActiveOverlay('none')"
);

content = content.replace(
  /activeShell\.description/g,
  "''"
);
content = content.replace(
  /metrics\.dominantConstraint/g,
  "''"
);

fs.writeFileSync('components/FactoryCommand_v4_1.tsx', content);

let b = fs.readFileSync('components/02Dashboardv2.tsx', 'utf8');
b = b.replace(/stage: 'pad',/g, "stage: 'drilling',");
b = b.replace(/stage: 'frac',/g, "stage: 'drilling',");
b = b.replace(/pad: 0,/g, "");
fs.writeFileSync('components/02Dashboardv2.tsx', b);
