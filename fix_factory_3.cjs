const fs = require('fs');
let s = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

// 1. the main wrapper
s = s.replace(
  /<div className="w-full aspect-video relative overflow-hidden bg-\[#F2F2F2\] text-slate-900 antialiased( rounded-\[2rem\])?">\n\s*<div className="absolute inset-0 origin-top-left" style=\{\{ transform: 'scale\(0\.67\)', width: '149\.2537%', height: '149\.2537%' \}\}>/g,
  `<div className="w-full aspect-video relative overflow-hidden bg-[#F2F2F2] text-slate-900 antialiased border border-slate-200 rounded-[2rem] shadow-xl">\n      <div className="absolute inset-0 origin-top-left" style={{ transform: 'scale(0.67)', width: '149.2537%', height: '149.2537%' }}>`
);

s = s.replace(
  /<div className="flex h-screen w-full items-center justify-center bg-\[#1e293b\] p-4 sm:p-8 overflow-hidden text-slate-900 antialiased">\n\s*<div className="relative flex aspect-video w-full max-h-full max-w-\[1920px\] overflow-hidden( rounded-\[2rem\])? border border-slate-700 bg-\[#F2F2F2\] shadow-\[0_30px_90px_-40px_rgba\(0,0,0,0\.5\)\]">/g,
  `<div className="w-full aspect-video relative overflow-hidden bg-[#F2F2F2] text-slate-900 antialiased border border-slate-200 rounded-[2rem] shadow-xl">\n      <div className="absolute inset-0 origin-top-left" style={{ transform: 'scale(0.67)', width: '149.2537%', height: '149.2537%' }}>`
);

// 2. Adjust overlays position
// Change "absolute bottom-0 left-0" to "absolute bottom-10 left-10" or similar
// Wait, the user said: "Diseñaste todo como flotanes, cuandotienes la mitad inverior del canvas libre, despliega a hí los distintos elementos para que aprovechen lo que no ocupa el CENTRAL CANVAS"
// "Que el modulo logistics haga takeover de toda la seccion (se va el CENTRAL canvas)"
s = s.replace(
  /\{activeOverlay === 'spine' && \(\n\s*<motion\.div initial=\{\{ y: -20, opacity: 0 \}\} animate=\{\{ y: 0, opacity: 1 \}\} exit=\{\{ y: -20, opacity: 0 \}\} className="pointer-events-auto absolute top-0 left-0 right-0 mx-auto max-w-4xl">/g,
  `{activeOverlay === 'spine' && (\n                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="pointer-events-auto absolute bottom-10 left-0 right-0 mx-auto max-w-4xl">`
);

s = s.replace(
  /\{activeOverlay === 'consequence' && \(\n\s*<motion\.div initial=\{\{ x: 20, opacity: 0 \}\} animate=\{\{ x: 0, opacity: 1 \}\} exit=\{\{ x: 20, opacity: 0 \}\} className="pointer-events-auto absolute top-0 right-0 max-w-\[420px\] max-h-full overflow-y-auto rounded-3xl pb-0">/g,
  `{activeOverlay === 'consequence' && (\n                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="pointer-events-auto absolute bottom-10 right-10 max-w-[420px] max-h-[800px] overflow-y-auto rounded-3xl pb-0">`
);

// Events too
s = s.replace(
  /\{activeOverlay === 'events' && \(\n\s*<motion\.div initial=\{\{ x: 20, opacity: 0 \}\} animate=\{\{ x: 0, opacity: 1 \}\} exit=\{\{ x: 20, opacity: 0 \}\} className="pointer-events-auto absolute top-0 right-0 max-w-\[420px\] h-full pb-0">/g,
  `{activeOverlay === 'events' && (\n                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="pointer-events-auto absolute bottom-10 right-10 max-w-[420px] h-[800px] pb-0">`
);

// Logistics takeover
s = s.replace(
  /<div className="absolute inset-0 z-0 pl-\[124px\]">/g,
  `{activeOverlay !== 'logistics' && <div className="absolute inset-0 z-0 pl-[124px]">`
);

s = s.replace(
  /          <\/OperatingCanvas>\n        <\/div>/g,
  `          </OperatingCanvas>\n        </div>}`
);

s = s.replace(
  /\{activeOverlay === 'logistics' && \(\n\s*<motion\.div initial=\{\{ y: 20, opacity: 0 \}\} animate=\{\{ y: 0, opacity: 1 \}\} exit=\{\{ y: 20, opacity: 0 \}\} className="pointer-events-auto absolute bottom-0 left-0 w-full max-w-\[800px\]">/g,
  `{activeOverlay === 'logistics' && (\n                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="pointer-events-auto absolute inset-0 pt-10 pb-10 flex items-center justify-center">`
);

s = s.replace(
  /<div className="rounded-\[2rem\] border border-slate-200 bg-white\/95 p-4 shadow-2xl backdrop-blur-md">\n\s*<LogisticsSimulationLayer/g,
  `<div className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-2xl backdrop-blur-md w-full max-w-[1400px] mx-auto">\n                      <LogisticsSimulationLayer`
);

// Inventory centering
s = s.replace(
  /\{activeOverlay === 'inventory' && \(\n\s*<motion\.div initial=\{\{ y: 20, opacity: 0 \}\} animate=\{\{ y: 0, opacity: 1 \}\} exit=\{\{ y: 20, opacity: 0 \}\} className="pointer-events-auto absolute bottom-0 left-0 w-full max-w-\[800px\]">/g,
  `{activeOverlay === 'inventory' && (\n                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="pointer-events-auto absolute inset-0 flex items-center pt-10 pb-10 justify-center">`
);

s = s.replace(
  /<div className="rounded-\[2rem\] border border-slate-200 bg-white\/95 p-4 shadow-2xl backdrop-blur-md">\n\s*<InventoryModule/g,
  `<div className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-2xl backdrop-blur-md w-full max-w-[1200px] mx-auto">\n                      <InventoryModule`
);


// Adjust navigation tv modes (Sidebar)
// It was max-h-full, which means it might overlap if it's placed centrally. It's absolute bottom-4 left-4 top-4.
s = s.replace(
  /<aside className="absolute bottom-4 left-4 top-4 z-40 w-\[108px\] rounded-\[1\.5rem\] border border-slate-200 bg-white\/95 p-3 shadow-xl backdrop-blur-xl flex flex-col items-center justify-between">/g,
  `<aside className="absolute bottom-10 left-10 top-10 z-40 w-[108px] rounded-[1.5rem] border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-xl flex flex-col items-center justify-between">`
);

fs.writeFileSync('components/FactoryCommand_v4_1.tsx', s);
