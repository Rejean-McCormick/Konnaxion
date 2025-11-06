#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const file = path.join(cwd, 'components', 'map-components', 'Map.tsx');

let src = await fs.readFile(file, 'utf8');
const before = src;

// 1) Provide props to ControlPanel
src = src.replace(
  /<ControlPanel\s*\/>/,
  '<ControlPanel lat={markerLat} lng={markerLng} />'
);

// 2) Prefer NEXT_PUBLIC_ token on client if present
src = src.replace(
  /process\.env\.MAPBOX_ACCESS_TOKEN/g,
  'process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_ACCESS_TOKEN'
);

if (src !== before) {
  await fs.writeFile(file, src, 'utf8');
  console.log('patched', path.relative(cwd, file));
} else {
  console.log('no changes', path.relative(cwd, file));
}
