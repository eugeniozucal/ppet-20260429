const fs = require('fs');
let s = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

// For Logistics
s = s.replace(
  /className="pointer-events-auto absolute inset-0 pt-8 pb-8 flex items-center justify-center bg-\[#F2F2F2\]\/95 backdrop-blur-md"/g,
  `className="pointer-events-auto absolute inset-0 bg-[#F2F2F2]/95 backdrop-blur-md"`
);
s = s.replace(
  /<div className="w-full h-full max-w-\[1600px\] mx-auto px-10">\n\s*<LogisticsSimulationLayer/g,
  `<div className="w-full h-full pl-[124px]"><LogisticsSimulationLayer`
);

// For Inventory
s = s.replace(
  /className="pointer-events-auto absolute inset-0 flex items-center pt-10 pb-10 justify-center"/g,
  `className="pointer-events-auto absolute inset-0 bg-[#F2F2F2]/95 backdrop-blur-md"`
);
s = s.replace(
  /<div className="w-full h-full max-w-\[1600px\] mx-auto px-10">\n\s*<InventoryModule/g,
  `<div className="w-full h-full pl-[124px]"><InventoryModule`
);

fs.writeFileSync('components/FactoryCommand_v4_1.tsx', s);
