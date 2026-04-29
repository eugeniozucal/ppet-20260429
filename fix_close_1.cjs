const fs = require('fs');
let s = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

s = s.replace(
  /onClose=\{.*?setSelectedMaterial\(null\).*?\}/s,
  `onClose={() => {\n            setSelectedAsset(null);\n            setSelectedTruck(null);\n            setSelectedMaterial(null);\n            setActiveOverlay('none');\n          }}`
);

fs.writeFileSync('components/FactoryCommand_v4_1.tsx', s);
