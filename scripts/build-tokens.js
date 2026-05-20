import StyleDictionary from 'style-dictionary';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKENS_PATH = path.resolve(__dirname, '../tokens/tokens.json');
const STYLES_DIR = path.resolve(__dirname, '../src/styles/');
const TYPES_DIR = path.resolve(__dirname, '../src/types/');

// ─── Helpers ───────────────────────────────────────────────────────────

function normalizeName(segments) {
  return segments
    .map(s => s.toLowerCase().replace(/[\s/]+/g, '-'))
    .filter(Boolean)
    .join('-');
}

function stripExtensions(obj) {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') && key !== '$value') {
        delete obj[key];
      } else {
        stripExtensions(obj[key]);
      }
    }
  }
  return obj;
}

function collectTokenPaths(obj, prefix = '', paths = new Set()) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return paths;
  if (Object.prototype.hasOwnProperty.call(obj, 'value') || Object.prototype.hasOwnProperty.call(obj, '$value')) {
    paths.add(prefix);
  }
  // Always recurse into children to find state tokens (hover, active, disabled, etc.)
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    if (!/^[a-zA-Z0-9_/]/.test(key)) continue;
    collectTokenPaths(value, prefix ? `${prefix}.${key}` : key, paths);
  }
  return paths;
}

function flattenCompositeTokens(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;

  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) {
      result[key] = value;
      continue;
    }
    if (!/^[a-zA-Z0-9_/]/.test(key)) continue;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const childHasValue =
        Object.prototype.hasOwnProperty.call(value, 'value') ||
        Object.prototype.hasOwnProperty.call(value, '$value');

      if (childHasValue) {
        // This child is a token — check if it has state children (hover, active, disabled, etc.)
        const basePart = {};
        let hasStateChildren = false;

        for (const [k, v] of Object.entries(value)) {
          if (k.startsWith('$')) {
            basePart[k] = v;
            continue;
          }
          if (v && typeof v === 'object' && !Array.isArray(v)) {
            const vHasValue =
              Object.prototype.hasOwnProperty.call(v, 'value') ||
              Object.prototype.hasOwnProperty.call(v, '$value');
            if (vHasValue) {
              // State token — extract as sibling with combined key
              hasStateChildren = true;
              result[`${key}-${k}`] = flattenCompositeTokens(v);
              continue;
            }
          }
          // Non-state property — keep in base token
          basePart[k] = flattenCompositeTokens(v);
        }

        result[key] = hasStateChildren ? basePart : flattenCompositeTokens(value);
      } else {
        // Not a token, recurse
        result[key] = flattenCompositeTokens(value);
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

function fixReferences(obj, knownPaths, knownPrefixes) {
  if (typeof obj === 'string') {
    return obj.replace(/\{([^}]+)\}/g, (match, ref) => {
      if (knownPaths.has(ref)) return match;
      for (const prefix of knownPrefixes) {
        const candidate = `${prefix}.${ref}`;
        if (knownPaths.has(candidate)) return `{${candidate}}`;
      }
      return match;
    });
  }
  if (Array.isArray(obj)) return obj.map(item => fixReferences(item, knownPaths, knownPrefixes));
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!/^[a-zA-Z0-9_/]/.test(key)) continue;
      result[key] = fixReferences(value, knownPaths, knownPrefixes);
    }
    return result;
  }
  return obj;
}

// ─── Name transform: handles both primitives and semantic tokens ──────

// Strip only composite set-name segments (top-level keys).
// Do NOT strip 'light', 'dark', 'value' individually — those can appear
// as legitimate middle path segments (e.g. surface.brand.light.color).
const STRIP_SEGMENTS = new Set([
  'primitives/value',
  'semantic/light',
  'semantic/dark',
]);

StyleDictionary.registerTransform({
  name: 'name/ds',
  type: 'name',
  transform: (token) => {
    const p = token.path || [];
    // Strip set-specific prefixes (e.g. 'primitives/value', 'semantic/light')
    const filtered = p.filter(s => !STRIP_SEGMENTS.has(s));
    // Return just the name — the css/variables format prepends '--'
    return `ds-${normalizeName(filtered)}`;
  },
});

// ─── Load and prepare data ────────────────────────────────────────────

function loadPreparedTokens() {
  const raw = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'));

  // Remove Figma metadata ($themes, $metadata)
  delete raw['$themes'];
  delete raw['$metadata'];

  // Strip Figma extension metadata ($extensions, $scopes, etc.)
  stripExtensions(raw);

  // Collect all known token paths for reference resolution
  const knownPaths = collectTokenPaths(raw);
  const knownPrefixes = Object.keys(raw).filter(k => !k.startsWith('$'));

  // Fix relative references across the entire tree
  const fixed = fixReferences(raw, knownPaths, knownPrefixes);

  // Flatten composite tokens: tokens like { value, type, hover: { value, type } }
  // become separate sibling tokens (color → color + color-hover)
  return flattenCompositeTokens(fixed);
}

// ─── Build ─────────────────────────────────────────────────────────────

async function build() {
  // Load & fix references once — shared across all outputs
  const allTokens = loadPreparedTokens();

  // Derive token sets (keys that exist and aren't metadata)
  const sets = Object.keys(allTokens).filter(k => !k.startsWith('$'));

  // Define output files — each maps to a token set subset
  const files = [
    {
      destination: 'primitives.css',
      selector: ':root',
      sets: ['primitives/value'],
    },
    {
      destination: 'semantic-light.css',
      selector: ':root, [data-theme="light"]',
      sets: ['semantic/light'],
    },
    {
      destination: 'semantic-dark.css',
      selector: '[data-theme="dark"]',
      sets: ['semantic/dark'],
    },
  ];

  const sd = new StyleDictionary({
    tokens: allTokens,
    platforms: {
      css: {
        transformGroup: 'css',
        transforms: ['name/ds', 'attribute/cti', 'size/rem', 'color/css'],
        buildPath: STYLES_DIR,
        files: files.map(f => ({
          destination: f.destination,
          format: 'css/variables',
          filter: (token) => {
            // Only include tokens whose first path segment is in the target sets
            return f.sets.includes(token.path[0]);
          },
          options: {
            outputReferences: false,
            selector: f.selector,
          },
        })),
      },
    },
  });

  await sd.buildAllPlatforms();
  files.forEach(f => console.log(`  ✔  ${f.destination}`));

  // ─── Aggregate tokens.css ──────────────────────────────────────────
  const aggregate = `/* Design System Tokens — auto-generated */
@import './primitives.css';
@import './semantic-light.css';
@import './semantic-dark.css';

* {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
`;
  fs.writeFileSync(path.resolve(STYLES_DIR, 'tokens.css'), aggregate);
  console.log('  ✔  tokens.css (aggregate)');

  // ─── TypeScript types ──────────────────────────────────────────────
  function extractTokenNames(obj, prefix = '') {
    let names = [];
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) continue;
      if (!/^[a-zA-Z0-9_/]/.test(key)) continue;
      if (value && typeof value === 'object' && !('value' in value || '$value' in value)) {
        names = [...names, ...extractTokenNames(value, `${prefix}${key}-`)];
      } else if (value && (value.value || value.$value)) {
        const name = normalizeName((prefix + key).split('-'));
        names.push(`--ds-${name}`);
      }
    }
    return names;
  }

  const p = allTokens['primitives/value'];
  const sl = allTokens['semantic/light'];
  const pNames = p ? extractTokenNames(p) : [];
  const slNames = sl ? extractTokenNames(sl) : [];
  const allNames = [...new Set([...pNames, ...slNames])].sort();

  const dts = `// Auto-generated token types — do not edit directly
export type DesignToken = ${allNames.map(n => `\n  | '${n}'`).join('')};

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeTokens {
${allNames.map(n => `  ${n.replace(/--ds-/g, '').replace(/-/g, '_')}: string;`).join('\n')}
}
`;
  const typesFile = path.resolve(TYPES_DIR, 'tokens.d.ts');
  fs.writeFileSync(typesFile, dts);
  console.log('  ✔  tokens.d.ts');
}

build().catch((err) => {
  console.error('\n❌ Build failed:', err);
  process.exit(1);
});
