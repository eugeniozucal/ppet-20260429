const fs = require('fs');
let content = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

content = content.replace(/setActiveWorkspace\('command'\)/g, "setActiveOverlay('none')");
content = content.replace(/setActiveWorkspace\('network'\)/g, "setActiveOverlay('spine')");
content = content.replace(/setActiveWorkspace\('supply'\)/g, "setActiveOverlay('logistics')");
content = content.replace(/setActiveWorkspace\('performance'\)/g, "setActiveOverlay('analytics')");
content = content.replace(/setActiveWorkspace/g, "setActiveOverlay");

content = content.replace(
  /const activeShell = shellSections\.find.*/g,
  "const activeShell = tvModes.find(m => m.id === activeOverlay) ?? tvModes[0];"
);
// replace shellSections with tvModes where not deleted
content = content.replace(/shellSections/g, "tvModes");

fs.writeFileSync('components/FactoryCommand_v4_1.tsx', content);
