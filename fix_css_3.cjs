const fs = require('fs');
let s = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

s = s.replace(
  /className="pointer-events-auto absolute bottom-0 left-0 right-0 w-full"/g,
  `className="pointer-events-auto absolute bottom-0 left-0 right-0 w-full h-[500px]"`
);

// We need to verify if the TV mode icons look fine. Their background is rounded, but it's okay because it's a floating sidebar.
// Also we need to make sure the overlays cover up OperatingCanvas properly.
fs.writeFileSync('components/FactoryCommand_v4_1.tsx', s);
