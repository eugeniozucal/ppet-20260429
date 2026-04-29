const fs = require('fs');
let s = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

// Replace the main wrapper
s = s.replace(
  /<div className="flex h-screen w-full items-center justify-center bg-\[#1e293b\] p-4 sm:p-8 overflow-hidden text-slate-900 antialiased">\n\s*<div className="relative flex aspect-video w-full max-h-full max-w-\[1920px\] overflow-hidden rounded-\[2rem\] border border-slate-700 bg-\[#F2F2F2\] shadow-\[0_30px_90px_-40px_rgba\(0,0,0,0\.5\)\]">/g,
  `    <div className="w-full aspect-video relative overflow-hidden bg-[#F2F2F2] text-slate-900 antialiased">\n      <div className="absolute inset-0 origin-top-left" style={{ transform: 'scale(0.67)', width: '149.2537%', height: '149.2537%' }}>`
);

s = s.replace(
  /          \}\}\n        \/>\n      <\/div>\n    <\/div>\n  \);\n}/,
  `          }}\n        />\n      </div>\n    </div>\n  );\n}`
);

fs.writeFileSync('components/FactoryCommand_v4_1.tsx', s);
