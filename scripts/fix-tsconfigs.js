import { writeFileSync, existsSync } from 'fs';

const files = [
  'node_modules/es-object-atoms/tsconfig.json',
  'node_modules/math-intrinsics/tsconfig.json',
  'node_modules/call-bind-apply-helpers/tsconfig.json',
  'node_modules/es-set-tostringtag/tsconfig.json',
  'node_modules/es-errors/tsconfig.json',
  'node_modules/gopd/tsconfig.json',
  'node_modules/es-define-property/tsconfig.json',
  'node_modules/has-symbols/tsconfig.json',
  'node_modules/hasown/tsconfig.json',
  'node_modules/dunder-proto/tsconfig.json',
  'node_modules/get-proto/tsconfig.json',
  'node_modules/has-tostringtag/tsconfig.json',
];

const fixed = JSON.stringify({ compilerOptions: { target: 'es5' }, include: [] }, null, 2);

for (const f of files) {
  if (existsSync(f)) {
    writeFileSync(f, fixed);
  }
}
