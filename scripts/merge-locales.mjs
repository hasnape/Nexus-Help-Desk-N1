import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const OLD_DIR = path.join(ROOT, 'locales');
const PUB_DIR = path.join(ROOT, 'public', 'locales');
const LOCALES = ['en', 'fr', 'ar'];

const readJsonIfExists = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return {};
  }
};

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const deepMergeUnion = (base, extra) => {
  if (!isObject(base)) {
    return isObject(extra) ? extra : extra ?? base;
  }

  const merged = { ...base };
  for (const key of Object.keys(extra || {})) {
    merged[key] = deepMergeUnion(base?.[key], extra[key]);
  }
  return merged;
};

const sortDeep = (value) => {
  if (Array.isArray(value)) {
    return value.map(sortDeep);
  }
  if (!isObject(value)) {
    return value;
  }

  const sorted = {};
  for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b))) {
    sorted[key] = sortDeep(value[key]);
  }
  return sorted;
};

const writeJsonPretty = (filePath, data) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(sortDeep(data), null, 2)}\n`, 'utf8');
};

const fillMissing = (reference, target) => {
  if (Array.isArray(reference)) {
    return target ?? reference;
  }
  if (!isObject(reference)) {
    return target ?? reference;
  }

  const filled = { ...(isObject(target) ? target : {}) };
  for (const key of Object.keys(reference)) {
    filled[key] = fillMissing(reference[key], filled[key]);
  }
  return filled;
};

const mergeOneLocale = (lang) => {
  const oldFile = path.join(OLD_DIR, `${lang}.json`);
  const pubFile = path.join(PUB_DIR, `${lang}.json`);
  const oldData = readJsonIfExists(oldFile);
  const pubData = readJsonIfExists(pubFile);
  return deepMergeUnion(pubData, oldData);
};

const diffKeys = (reference, target, prefix = '') => {
  const missing = [];
  const referenceKeys = new Set(Object.keys(reference || {}));

  for (const key of referenceKeys) {
    const pathKey = prefix ? `${prefix}.${key}` : key;
    if (!(target && Object.prototype.hasOwnProperty.call(target, key))) {
      missing.push(pathKey);
      continue;
    }

    const refChild = reference[key];
    const targetChild = target[key];
    if (isObject(refChild) && isObject(targetChild)) {
      missing.push(...diffKeys(refChild, targetChild, pathKey));
    }
  }

  return missing;
};

(() => {
  const enMerged = mergeOneLocale('en');
  const frMerged = mergeOneLocale('fr');
  const arMerged = mergeOneLocale('ar');

  const frFilled = fillMissing(enMerged, frMerged);
  const arFilled = fillMissing(enMerged, arMerged);

  writeJsonPretty(path.join(PUB_DIR, 'en.json'), enMerged);
  writeJsonPretty(path.join(PUB_DIR, 'fr.json'), frFilled);
  writeJsonPretty(path.join(PUB_DIR, 'ar.json'), arFilled);

  const frMissing = diffKeys(enMerged, frMerged);
  const arMissing = diffKeys(enMerged, arMerged);

  console.log(`\n[merge-locales] Clés ajoutées en FR: ${frMissing.length}`);
  if (frMissing.length > 0) {
    console.log(frMissing.join('\n'));
  }
  console.log(`\n[merge-locales] Clés ajoutées en AR: ${arMissing.length}`);
  if (arMissing.length > 0) {
    console.log(arMissing.join('\n'));
  }

  try {
    fs.rmSync(OLD_DIR, { recursive: true, force: true });
    console.log('\n[merge-locales] Dossier "locales/" supprimé.');
  } catch (error) {
    console.error('\n[merge-locales] Impossible de supprimer le dossier "locales/" :', error);
  }
})();
