import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, 'locales');
const PAGES_DIRS = [path.join(ROOT, 'pages'), path.join(ROOT, 'src'), path.join(ROOT, 'components'), path.join(ROOT, 'public')];

function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(acc, flatten(v, key));
    } else if (Array.isArray(v)) {
      v.forEach((item, index) => {
        if (item && typeof item === 'object') {
          Object.assign(acc, flatten(item, `${key}.${index}`));
        } else {
          acc[`${key}.${index}`] = item;
        }
      });
    } else {
      acc[key] = v;
    }
    return acc;
  }, {});
}

function ensureKey(obj, keyPath, fallback = '') {
  const parts = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  const leaf = parts[parts.length - 1];
  if (typeof current[leaf] !== 'string') {
    current[leaf] = fallback || leaf.replace(/_/g, ' ');
  }
}

function readJsonSafe(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function writeJson(file, obj) {
  fs.writeFileSync(file, `${JSON.stringify(obj, null, 2)}\n`, 'utf8');
}

function collectKeys() {
  const files = [];
  const extensions = ['.html', '.htm', '.svg', '.tsx', '.jsx'];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (extensions.some((ext) => fullPath.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  PAGES_DIRS.forEach(walk);

  const keys = new Set();
  const regex = /data-i18n\s*=\s*["']([^"']+)["']/g;
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = regex.exec(source))) {
      keys.add(match[1]);
    }
  }
  return [...keys];
}

const keys = collectKeys();
const localeFiles = fs.readdirSync(LOCALES_DIR).filter((file) => file.endsWith('.json'));

for (const locale of localeFiles) {
  const filePath = path.join(LOCALES_DIR, locale);
  const json = readJsonSafe(filePath);
  const flat = flatten(json);
  const missing = keys.filter((key) => !(key in flat));
  if (missing.length > 0) {
    missing.forEach((key) => ensureKey(json, key, ''));
    writeJson(filePath, json);
    console.log(`[i18n] ${locale}: +${missing.length} clés ajoutées.`);
  } else {
    console.log(`[i18n] ${locale}: OK (aucune clé manquante).`);
  }
}
