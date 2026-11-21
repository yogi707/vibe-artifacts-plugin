// Checks the plugin's manifests and skill, and that no access token was committed.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const problems = [];
const fail = (msg) => problems.push(msg);

function readJson(path) {
  try {
    return JSON.parse(readFileSync(join(root, path), 'utf8'));
  } catch (e) {
    fail(`${path}: ${e.code === 'ENOENT' ? 'missing' : `invalid JSON (${e.message})`}`);
    return null;
  }
}

const plugin = readJson('.claude-plugin/plugin.json');
if (plugin) {
  if (plugin.name !== 'vibe-artifacts') fail('plugin.json: name must be "vibe-artifacts"');
  if (!/^\d+\.\d+\.\d+$/.test(plugin.version ?? '')) fail('plugin.json: version must be semver');
  if (!plugin.description) fail('plugin.json: description is required');
}

const market = readJson('.claude-plugin/marketplace.json');
if (market) {
  if (market.name !== 'vibe-artifacts') fail('marketplace.json: name must be "vibe-artifacts"');
  const entry = market.plugins?.find((p) => p.name === 'vibe-artifacts');
  if (!entry) fail('marketplace.json: must list the vibe-artifacts plugin');
  else if (entry.source !== './') fail('marketplace.json: plugin source must be "./"');
}

const mcp = readJson('.mcp.json');
if (mcp) {
  const server = mcp.mcpServers?.['vibe-artifacts'];
  if (!server) fail('.mcp.json: mcpServers["vibe-artifacts"] is required');
  else {
    if (server.type !== 'http') fail('.mcp.json: type must be "http"');
    if (
      server.url !==
      '${VIBE_ARTIFACTS_URL:-https://artifacts-api.ekyogi.com}/api/v1/mcp'
    ) {
      fail('.mcp.json: url must default to the staging API and honour VIBE_ARTIFACTS_URL');
    }
    if (server.headers?.Authorization !== 'Bearer ${VIBE_ARTIFACTS_TOKEN}') {
      fail('.mcp.json: Authorization header must come from VIBE_ARTIFACTS_TOKEN');
    }
  }
}

const skillPath = 'skills/publish-artifact/SKILL.md';
let skill = '';
try {
  skill = readFileSync(join(root, skillPath), 'utf8');
} catch {
  fail(`${skillPath}: missing`);
}
if (skill) {
  const front = skill.match(/^---\n([\s\S]*?)\n---\n/);
  if (!front) fail(`${skillPath}: front matter missing`);
  else {
    if (!/^name: publish-artifact$/m.test(front[1])) fail(`${skillPath}: name must be publish-artifact`);
    if (!/^description: .{40,}/m.test(front[1])) fail(`${skillPath}: description is required`);
  }
  // The upload command is `--data-binary @'<fileName>'` run from the file's folder,
  // so fileName must be the bare name, never a path.
  if (!/`fileName` must be the file's base name/.test(skill)) {
    fail(`${skillPath}: must tell Claude to pass the file's base name as fileName`);
  }
}

// No real access token anywhere in the repo.
const TOKEN = /va_pat_[A-Za-z0-9_-]{20,}/;
function scan(dir) {
  for (const name of readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) scan(path);
    else if (TOKEN.test(readFileSync(path, 'utf8'))) {
      fail(`${relative(root, path)}: contains what looks like an access token`);
    }
  }
}
scan(root);

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join('\n'));
  process.exit(1);
}
console.log('✓ plugin files are valid');
