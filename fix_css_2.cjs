const fs = require('fs');
let s = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

// Strip AnalyticsDeck card wrapper
s = s.replace(
  /<div className="overflow-hidden rounded-\[2rem\] border border-slate-200 bg-white\/85 shadow-\[0_28px_80px_-48px_rgba\(15,23,42,0\.55\)\] backdrop-blur">/g,
  `<div className="w-full h-full flex flex-col border-t border-slate-200 bg-[#F2F2F2]/95 backdrop-blur-xl">`
);

// AnalyticsDeck TV layout spacing
s = s.replace(
  /className="pointer-events-auto absolute bottom-10 left-0 right-0 mx-auto max-w-\[1200px\]"/g,
  `className="pointer-events-auto absolute bottom-0 left-0 right-0 w-full"`
);

// Also ProcessNavigator wrapper
s = s.replace(
  /className="pointer-events-auto absolute bottom-10 left-0 right-0 mx-auto max-w-4xl"/g,
  `className="pointer-events-auto absolute bottom-10 left-0 right-0 mx-auto max-w-[1200px]"`
);

fs.writeFileSync('components/FactoryCommand_v4_1.tsx', s);
