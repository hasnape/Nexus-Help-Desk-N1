#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const logsDir = path.join(cwd, 'logs');
const docsDir = path.join(cwd, 'docs');
fs.mkdirSync(logsDir, { recursive: true });
fs.mkdirSync(docsDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = path.join(logsDir, `build-${timestamp}.log`);
const logStream = fs.createWriteStream(logFile);

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const build = spawn(command, ['vite', 'build'], {
  cwd,
  stdio: ['ignore', 'pipe', 'pipe'],
});

const forward = (chunk, writer) => {
  if (!chunk) return;
  process[writer].write(chunk);
  logStream.write(chunk);
};

build.stdout.on('data', (chunk) => forward(chunk, 'stdout'));
build.stderr.on('data', (chunk) => forward(chunk, 'stderr'));

const journalPath = path.join(docsDir, 'ERROR_JOURNAL.md');
if (!fs.existsSync(journalPath)) {
  fs.writeFileSync(
    journalPath,
    '# Error Journal\n\nThis log chronicles build attempts triggered via `npm run build:journal`. Each entry captures the timestamp, outcome, and, when applicable, a snippet of the failure log to speed up troubleshooting.\n\n'
  );
}

build.on('close', (code, signal) => {
  logStream.end();
  const exitCode = typeof code === 'number' ? code : 1;
  const outcome = exitCode === 0 ? 'SUCCESS' : `FAIL (code ${exitCode}${signal ? `, signal ${signal}` : ''})`;
  const relativeLogPath = path.relative(cwd, logFile) || logFile;

  let snippet = '';
  try {
    const contents = fs.readFileSync(logFile, 'utf8');
    const lines = contents.split(/\r?\n/).filter(Boolean);
    const tailLines = lines.slice(-40);
    if (exitCode !== 0 && tailLines.length) {
      snippet = tailLines.join('\n');
    }
  } catch (error) {
    snippet = `Unable to read log: ${error instanceof Error ? error.message : String(error)}`;
  }

  const entryLines = [
    `## ${timestamp}`,
    `- Result: ${outcome}`,
    `- Log: \`${relativeLogPath}\``,
  ];

  if (snippet) {
    entryLines.push('\n````text');
    entryLines.push(snippet);
    entryLines.push('````\n');
  } else {
    entryLines.push('');
  }

  fs.appendFileSync(journalPath, `${entryLines.join('\n')}\n`);

  if (exitCode === 0) {
    console.log(`\n✅ Build completed. Detailed log saved to ${relativeLogPath}.`);
  } else {
    console.error(`\n❌ Build failed. See ${relativeLogPath} and docs/ERROR_JOURNAL.md for details.`);
  }

  process.exit(exitCode);
});
