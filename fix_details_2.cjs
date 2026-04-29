const fs = require('fs');
let s = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

// 1. Add 'details' to OverlayTab
s = s.replace(
  /export type OverlayTab = 'none' \| 'spine' \| 'consequence' \| 'logistics' \| 'inventory' \| 'analytics' \| 'events';/g,
  `export type OverlayTab = 'none' | 'details' | 'spine' | 'consequence' | 'logistics' | 'inventory' | 'analytics' | 'events';`
);

// 2. Add 'details' to tvModes
s = s.replace(
  /const tvModes: \{ id: OverlayTab; label: string; icon: any; title: string \}\[\] = \[\n\s*\{ id: 'none', label: 'Canvas', icon: Home, title: 'Hide Overlays' \},/,
  `const tvModes: { id: OverlayTab; label: string; icon: any; title: string }[] = [\n    { id: 'none', label: 'Canvas', icon: Home, title: 'Hide Overlays' },\n    { id: 'details', label: 'Details', icon: Activity, title: 'Detailed Inspector' },`
);

s = s.replace(
  /const handleSelectAsset = \(event: \{ targetType: string; targetId: string; title: string \}\) => \{\n    const typeMap: Record<string, AssetType> = \{\n      pad: 'pad',\n      well: 'well',\n      truck: 'truck',\n      material: 'kpi',\n      battery: 'battery',\n      plant: 'plant',\n      tank: 'tank',\n    \};\n    setSelectedAsset\(\{ type: typeMap\[event.targetType\], id: event.targetId, label: event.title \}\);\n    setActiveOverlay\('none'\);\n  \};/g,
  `const handleSelectAsset = (event: { targetType: string; targetId: string; title: string }) => {\n    const typeMap: Record<string, AssetType> = {\n      pad: 'pad',\n      well: 'well',\n      truck: 'truck',\n      material: 'kpi',\n      battery: 'battery',\n      plant: 'plant',\n      tank: 'tank',\n    };\n    setSelectedAsset({ type: typeMap[event.targetType], id: event.targetId, label: event.title });\n  };`
);

// DetailDrawer render condition
s = s.replace(
  /\{selectedAsset && !selectedTruck && !selectedMaterial && activeOverlay === 'none' \? \(/g,
  `{selectedAsset && !selectedTruck && !selectedMaterial && activeOverlay === 'details' ? (`
);
s = s.replace(
  /\{selectedTruck && activeOverlay === 'none' \? \(/g,
  `{selectedTruck && activeOverlay === 'details' ? (`
);
s = s.replace(
  /\{selectedMaterial && !selectedTruck && activeOverlay === 'none' \? \(/g,
  `{selectedMaterial && !selectedTruck && activeOverlay === 'details' ? (`
);

// For the "Global Modal Detail Drawer" (Wait, DetailDrawer handles all 3? Yes!)
s = s.replace(
  /        \{\/\* Global Modal Detail Drawer \*\/\}\n        <DetailDrawer/g,
  `        {/* Global Modal Detail Drawer */}\n        {activeOverlay === 'details' && <DetailDrawer`
);
s = s.replace(
  /        \/>\n      <\/div>/g,
  `        />}\n      </div>`
);

fs.writeFileSync('components/FactoryCommand_v4_1.tsx', s);
