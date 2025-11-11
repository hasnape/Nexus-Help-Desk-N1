import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PUB_DIR = path.join(ROOT, 'public', 'locales');
const OUT_FILE = path.join(ROOT, 'i18n-report.csv');

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const en = readJson(path.join(PUB_DIR, 'en.json'));
const fr = readJson(path.join(PUB_DIR, 'fr.json'));
const ar = readJson(path.join(PUB_DIR, 'ar.json'));

const rows = [["key", "fr_missing", "ar_missing", "fr_equals_en", "ar_equals_en"]];

const getValue = (obj, pathKey) =>
  pathKey.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

const walk = (obj, prefix = '') => {
  Object.keys(obj).forEach((key) => {
    const pathKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      walk(value, pathKey);
      return;
    }

    const frValue = getValue(fr, pathKey);
    const arValue = getValue(ar, pathKey);

    rows.push([
      pathKey,
      frValue === undefined ? '1' : '',
      arValue === undefined ? '1' : '',
      frValue !== undefined && frValue === value ? '1' : '',
      arValue !== undefined && arValue === value ? '1' : '',
    ]);
  });
};

walk(en);

const csv = rows
  .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
  .join('\n');

fs.writeFileSync(OUT_FILE, `${csv}\n`, 'utf8');
console.log('[i18n] Report written to i18n-report.csv');
