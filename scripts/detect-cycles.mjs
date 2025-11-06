#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const srcRoot = path.join(projectRoot, 'src');

const fileExtensions = new Set(['.ts', '.tsx']);

const files = [];
const stack = [srcRoot];
while (stack.length > 0) {
  const dir = stack.pop();
  if (!dir) continue;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      stack.push(entryPath);
    } else if (fileExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }
}

const importRegex = /import\s+(?:[^'"\n]+\s+from\s+)?['"]([^'"\n]+)['"]/g;
const dynamicImportRegex = /import\(\s*['"]([^'"\n]+)['"]\s*\)/g;

const graph = new Map();

const toModuleId = (absolutePath) => path.relative(projectRoot, absolutePath);

for (const file of files) {
  const contents = fs.readFileSync(file, 'utf8');
  const imports = new Set();
  const addImport = (specifier) => {
    if (!specifier) return;
    if (specifier.startsWith('http://') || specifier.startsWith('https://')) return;
    if (specifier.startsWith('.')) {
      const resolved = path.resolve(path.dirname(file), specifier);
      for (const ext of ['', '.ts', '.tsx', '.js', '.jsx']) {
        const candidate = resolved + ext;
        if (fs.existsSync(candidate) && fileExtensions.has(path.extname(candidate))) {
          imports.add(toModuleId(candidate));
          break;
        }
      }
      return;
    }
    if (specifier.startsWith('@/')) {
      const resolved = path.join(srcRoot, specifier.slice(2));
      for (const ext of ['', '.ts', '.tsx', '.js', '.jsx']) {
        const candidate = resolved + ext;
        if (fs.existsSync(candidate) && fileExtensions.has(path.extname(candidate))) {
          imports.add(toModuleId(candidate));
          break;
        }
      }
    }
  };

  let match;
  while ((match = importRegex.exec(contents)) !== null) {
    addImport(match[1]);
  }
  while ((match = dynamicImportRegex.exec(contents)) !== null) {
    addImport(match[1]);
  }

  graph.set(toModuleId(file), Array.from(imports));
}

const visiting = new Set();
const visited = new Set();
const cycles = [];
const pathStack = [];

const dfs = (node) => {
  if (visited.has(node)) return;
  if (visiting.has(node)) {
    const cycleStart = pathStack.indexOf(node);
    if (cycleStart !== -1) {
      cycles.push([...pathStack.slice(cycleStart), node]);
    }
    return;
  }
  visiting.add(node);
  pathStack.push(node);
  const neighbors = graph.get(node) ?? [];
  for (const neighbor of neighbors) {
    if (graph.has(neighbor)) {
      dfs(neighbor);
    }
  }
  pathStack.pop();
  visiting.delete(node);
  visited.add(node);
};

for (const node of graph.keys()) {
  if (!visited.has(node)) {
    dfs(node);
  }
}

if (cycles.length === 0) {
  console.log('No circular imports detected in src/.');
  process.exit(0);
}

console.error('Circular import cycles detected:');
for (const cycle of cycles) {
  console.error(' - ' + cycle.join(' -> '));
}
process.exit(1);
