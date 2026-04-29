const fs = require('fs');
let s = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

s = s.replace(
  /className="pointer-events-auto absolute bottom-0 left-0 right-0 mx-auto max-w-\[1200px\]"/g,
  'className="pointer-events-auto absolute bottom-10 left-0 right-0 mx-auto max-w-[1200px]"'
);

fs.writeFileSync('components/FactoryCommand_v4_1.tsx', s);
