const fs = require('fs');
let s = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

s = s.replace(
  /<div className="w-full aspect-video relative overflow-hidden bg-\[#F2F2F2\] text-slate-900 antialiased border border-slate-200 rounded-\[2rem\] shadow-xl">/,
  '<div className="w-full aspect-video relative overflow-hidden bg-[#F2F2F2] text-slate-900 antialiased">'
);

fs.writeFileSync('components/FactoryCommand_v4_1.tsx', s);
