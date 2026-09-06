import { execFileSync } from 'child_process';
import fs from 'fs';
import net from 'net';
import path from 'path';

const PG_DIR = process.env.PG_BIN_DIR || 'C:\\Program Files\\PostgreSQL\\18\\bin';
const defaultPgCtl = path.join(PG_DIR, 'pg_ctl.exe');
const PG_CTL = process.env.PG_CTL_PATH || (fs.existsSync(defaultPgCtl) ? defaultPgCtl : 'pg_ctl');
const DATA_DIR = process.env.PGDATA || 'd:\\shrey\\pgdata_dealflow360';
const LOG_FILE = process.env.PG_LOG_FILE || path.join(DATA_DIR, 'server.log');
const PID_FILE = path.join(DATA_DIR, 'postmaster.pid');
const PORT = parseInt(process.env.DB_PORT || '5433', 10);

function checkPort(port, timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

function cleanStalePid() {
  if (fs.existsSync(PID_FILE)) {
    try {
      const content = fs.readFileSync(PID_FILE, 'utf8');
      const pid = parseInt(content.split('\n')[0].trim(), 10);
      if (pid) {
        try {
          process.kill(pid, 0);
          return false;
        } catch (e) {
          fs.unlinkSync(PID_FILE);
          console.log(`Removed stale postmaster.pid (dead PID ${pid})`);
          return true;
        }
      }
    } catch (e) {
      // ignore
    }
  }
  return true;
}

async function status() {
  const isListening = await checkPort(PORT);
  if (isListening) {
    console.log(`✅ DealFlow360 PostgreSQL is RUNNING and listening on port ${PORT}.`);
    try {
      const out = execFileSync(PG_CTL, ['-D', DATA_DIR, 'status'], { encoding: 'utf8' });
      console.log(out.trim());
    } catch (e) {
      if (e.stdout) console.log(e.stdout.trim());
    }
  } else {
    console.log(`❌ DealFlow360 PostgreSQL is STOPPED on port ${PORT}.`);
  }
}

async function start() {
  const isListening = await checkPort(PORT);
  if (isListening) {
    console.log(`✅ DealFlow360 PostgreSQL is already running on port ${PORT}.`);
    return;
  }

  cleanStalePid();

  console.log(`⏳ Starting DealFlow360 PostgreSQL on port ${PORT}...`);
  try {
    const out = execFileSync(PG_CTL, ['-D', DATA_DIR, '-l', LOG_FILE, 'start'], { encoding: 'utf8' });
    console.log(out.trim());
  } catch (e) {
    if (e.stdout) console.log(e.stdout.trim());
    if (e.stderr) console.error(e.stderr.trim());
  }

  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await checkPort(PORT)) {
      console.log(`🚀 PostgreSQL started successfully and is accepting connections on port ${PORT}!`);
      return;
    }
  }
  console.error(`⚠️ PostgreSQL start attempted, but port ${PORT} is not yet responding.`);
}

async function stop() {
  const isListening = await checkPort(PORT);
  if (!isListening && !fs.existsSync(PID_FILE)) {
    console.log(`DealFlow360 PostgreSQL is already stopped.`);
    return;
  }

  console.log(`⏳ Stopping DealFlow360 PostgreSQL...`);
  try {
    const out = execFileSync(PG_CTL, ['-D', DATA_DIR, '-m', 'fast', 'stop'], { encoding: 'utf8' });
    console.log(out.trim());
  } catch (e) {
    if (e.stdout) console.log(e.stdout.trim());
    if (e.stderr) console.error(e.stderr.trim());
  }
}

const action = process.argv[2] || 'status';

switch (action) {
  case 'start':
    await start();
    break;
  case 'stop':
    await stop();
    break;
  case 'status':
    await status();
    break;
  case 'restart':
    await stop();
    await new Promise((r) => setTimeout(r, 1000));
    await start();
    break;
  default:
    console.log(`Usage: node scripts/db.js [start|stop|status|restart]`);
}
