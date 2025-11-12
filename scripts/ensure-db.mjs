#!/usr/bin/env node
// Ensure a Postgres instance is reachable on the configured host:port before starting the app.
// On Windows, we shell out to the repo's PowerShell script scripts/start-db.ps1 to start Docker Compose 'postgres'.

import net from 'node:net';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const DEFAULT_URL = 'postgresql://e4d:e4dpass@127.0.0.1:5432/e4d?schema=public';
const url = process.env.DATABASE_URL || DEFAULT_URL;

function parseHostPort(dbUrl) {
  try {
    const u = new URL(dbUrl);
    return { host: u.hostname || '127.0.0.1', port: Number(u.port || 5432) };
  } catch {
    return { host: '127.0.0.1', port: 5432 };
  }
}

function checkTcp(host, port, timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => { try { socket.destroy(); } catch {} resolve(false); };
    socket.setTimeout(timeoutMs, onError);
    socket.once('error', onError);
    socket.connect(port, host, () => { socket.end(); resolve(true); });
  });
}

async function waitUntilReachable(host, port, attempts = 30, delayMs = 1000) {
  for (let i = 0; i < attempts; i++) {
    if (await checkTcp(host, port, 800)) return true;
    await new Promise(r => setTimeout(r, delayMs));
  }
  return false;
}

async function main() {
  const { host, port } = parseHostPort(url);
  // If DB already reachable, nothing to do
  if (await checkTcp(host, port)) {
    process.exit(0);
    return;
  }

  const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(__dirnameLocal, '..', '..');
  const psScript = path.join(repoRoot, 'scripts', 'start-db.ps1');

  if (process.platform === 'win32' && fs.existsSync(psScript)) {
    console.log(`[ensure-db] ${host}:${port} not reachable. Attempting to start Docker Postgres via PowerShell script...`);
    await new Promise((resolve) => {
      const child = spawn('pwsh', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', psScript], { stdio: 'inherit' });
      child.on('exit', async (code) => {
        if (code === 0) {
          const ok = await waitUntilReachable(host, port, 60, 1000);
          if (ok) return resolve(0);
        }
        resolve(1);
      });
    }).then((code) => {
      process.exitCode = code;
    });
    if (process.exitCode === 0) return;
    console.error('[ensure-db] Failed to start Postgres automatically. Please start Docker Desktop and run: docker compose up -d postgres');
    process.exit(1);
    return;
  }

  // Non-Windows fallback: try docker compose directly if available
  console.log(`[ensure-db] ${host}:${port} not reachable. Trying 'docker compose up -d postgres'...`);
  const child = spawn('docker', ['compose', 'up', '-d', 'postgres'], { cwd: repoRoot, stdio: 'inherit' });
  await new Promise((r) => child.on('exit', r));
  const ok = await waitUntilReachable(host, port, 60, 1000);
  if (ok) process.exit(0);
  console.error('[ensure-db] Postgres still not reachable. Ensure Docker Desktop is running and try again.');
  process.exit(1);
}

main().catch((err) => {
  console.error('[ensure-db] Unexpected error:', err);
  process.exit(2);
});
