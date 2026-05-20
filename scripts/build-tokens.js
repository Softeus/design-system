const path = require('path');
const fs = require('fs');
const StyleDictionary = require('style-dictionary').default;

/**
 * Check if a key is a valid token name (not a Figma artifact like '!!!!!!').
 */
function isValidKey(key) {
  return /^[a-zA-Z0-9_/]/.test(key);
}

/**
 * Recursively walk an object, skip artifact keys, and apply a transform function to all string values.
 */
function walkAndTransform(obj, fn) {
  if (typeof obj === 'string') {
    return fn(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => walkAndTransform(item, fn));
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!isValidKey(key)) continue; // skip Figma artifact keys
      result[key] = walkAndTransform(value, fn);
    }
    return result;
  }
  return obj;
}

/**
 * Collect all leaf token paths (fully qualified, dot-separated).
 * A token leaf is identified by having a "value" or dollar sign "value" property.
 */
function collectTokenPaths(obj, prefix, paths) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return paths;
  }
  const hasValue = Object.prototype.hasOwnProperty.call(obj, 'value')
    || Object.prototype.hasOwnProperty.call(obj, '$value');
  if (hasValue) {
    paths.add(prefix);
  } else {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) continue;
      if (!isValidKey(key)) continue;
      const nextPrefix = prefix ? prefix + '.' + key : key;
      collectTokenPaths(value, nextPrefix, paths);
    }
  }
  return paths;
}

/**
 * Figma Tokens Studio exports references relative to their token set,
 * e.g. {Blue Ribbon.600} instead of {primitives/Mode 1.Blue Ribbon.600}.
 * This fixes them by checking if the reference exists directly, and if not,
 * tries prepending each known top-level token set prefix.
 */
function fixReferences(obj, knownPaths, knownPrefixes) {
  return walkAndTransform(obj, (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/\{([^}]+)\}/g, (match, ref) => {
      if (knownPaths.has(ref)) {
        return match; // already valid
      }
      for (const prefix of knownPrefixes) {
        const candidate = prefix + '.' + ref;
        if (knownPaths.has(candidate)) {
          return '{' + candidate + '}';
        }
      }
      return match; // leave as-is if unresolvable
    });
  });
}

async function build() {
  const tokensPath = path.resolve(__dirname, '../tokens/tokens.json');
  const raw = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));

  // Remove Figma metadata that would confuse Style Dictionary
  delete raw['$themes'];
  delete raw['$metadata'];

  // Collect all token paths and known top-level prefixes
  const knownPaths = collectTokenPaths(raw, '', new Set());
  const knownPrefixes = Object.keys(raw);
  console.log('Token sets:', knownPrefixes);
  console.log('Total token paths:', knownPaths.size);

  // Fix relative references in the entire token tree
  const fixed = fixReferences(raw, knownPaths, knownPrefixes);

  const config = {
    tokens: fixed,
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: path.resolve(__dirname, '../src/styles/') + '/',
        files: [
          {
            destination: 'tokens.css',
            format: 'css/variables',
          },
        ],
      },
    },
  };

  const sd = new StyleDictionary(config);
  await sd.buildAllPlatforms();
  console.log('Tokens built successfully!');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
