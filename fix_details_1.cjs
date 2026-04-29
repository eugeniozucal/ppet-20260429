const fs = require('fs');
let s = fs.readFileSync('components/FactoryCommand_v4_1.tsx', 'utf8');

// 1. Add 'details' to OverlayTab
s = s.replace(
  /export type OverlayTab = 'none' \| 'spine' \| 'consequence' \| 'logistics' \| 'inventory' \| 'analytics' \| 'events';/g,
  `export type OverlayTab = 'none' | 'details' | 'spine' | 'consequence' | 'logistics' | 'inventory' | 'analytics' | 'events';`
);

// 2. Add 'details' to tvModes
s = s.replace(
  /const tvModes: \{ id: OverlayTab; label: string; icon: any; title: string \}... = \[\n\s*\{ id: 'none', label: 'Canvas', icon: Home, title: 'Hide Overlays' \},/g,
  `const tvModes: { id: OverlayTab; label: string; icon: any; title: string }[] = [\n    { id: 'none', label: 'Canvas', icon: Home, title: 'Hide Overlays' },\n    { id: 'details', label: 'Details', icon: Activity, title: 'Detailed Inspector' },`
);

// 3. Change selection handlers: when an asset is clicked, don't change the activeOverlay, or maybe just don't reset to 'none'.
s = s.replace(
  /const handleSelectAsset = \(event: \{ targetType: string; targetId: string; title: string \}\) => \{\n\s*const typeMap: Record<string, AssetType> = \{[^{}]+?\};\n\s*setSelectedAsset\(\{ type: typeMap\[event.targetType\], id: event.targetId, label: event.title \}\);\n\s*setActiveOverlay\('none'\);\n\s*\};/g,
  `const handleSelectAsset = (event: { targetType: string; targetId: string; title: string }) => {\n    const typeMap: Record<string, AssetType> = {\n      pad: 'pad',\n      well: 'well',\n      truck: 'truck',\n      material: 'kpi',\n      battery: 'battery',\n      plant: 'plant',\n      tank: 'tank',\n    };\n    setSelectedAsset({ type: typeMap[event.targetType], id: event.targetId, label: event.title });\n  };`
);

fs.writeFileSync('components/FactoryCommand_v4_1.tsx', s);
