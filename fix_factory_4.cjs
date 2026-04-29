const fs = require('fs');
let s = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

// The replacement was:
// s = s.replace(
//   /<div className="absolute inset-0 z-0 pl-\[124px\]">/g,
//   `{activeOverlay !== 'logistics' && <div className="absolute inset-0 z-0 pl-[124px]">`
// );
// Meaning it didn't close it properly because the closing part failed to match.

s = s.replace(
  /\{activeOverlay !== 'logistics' && <div className="absolute inset-0 z-0 pl-\[124px\]">/g,
  `<div className="absolute inset-0 z-0 pl-[124px]">`
);

// We want to hide OperatingCanvas div if activeOverlay is 'logistics'
s = s.replace(
  /<div className="absolute inset-0 z-0 pl-\[124px\]">\n\s*<OperatingCanvas/,
  `{activeOverlay !== 'logistics' && (\n        <div className="absolute inset-0 z-0 pl-[124px]">\n          <OperatingCanvas`
);

s = s.replace(
  /            onSelectTruck=\{handleSelectTruck\}\n          \/>\n        <\/div>\n\n        \{\/\* ASIDE MENU/,
  `            onSelectTruck={handleSelectTruck}\n          />\n        </div>\n        )}\n\n        {/* ASIDE MENU`
);

fs.writeFileSync('components/FactoryCommand_v4_1.tsx', s);
