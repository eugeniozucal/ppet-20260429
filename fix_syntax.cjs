const fs = require('fs');
let s = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

s = s.replace(
  /className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-cyan-600"\n\s*style=\{\{ background: `linear-gradient\(90deg, #06b6d4 \$\{percent\}%, #e2e8f0 \$\{percent\}%\)` \}\}\n\s*\/>\}/g,
  `className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-cyan-600"\n          style={{ background: \`linear-gradient(90deg, #06b6d4 \${percent}%, #e2e8f0 \${percent}%)\` }}\n        />`
);

s = s.replace(
  /setActiveOverlay\('none'\);\n\s*\}\}\}\n\s*\/>\}\n\s*<\/div>/g,
  `setActiveOverlay('none');\n          }}\n        />}\n      </div>`
);

fs.writeFileSync('components/FactoryCommand_v4_1.tsx', s);
