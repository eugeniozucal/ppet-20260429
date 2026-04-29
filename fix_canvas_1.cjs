const fs = require('fs');
let s = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

s = s.replace(
  /\{activeOverlay !== 'logistics' && \(\n\s*<div className="absolute inset-0 z-0 pl-\[124px\]">/g,
  `{!['logistics', 'inventory', 'analytics'].includes(activeOverlay) && (\n        <div className="absolute inset-0 z-0 pl-[124px]">`
);

fs.writeFileSync('components/FactoryCommand_v4_1.tsx', s);
