/* Static CSS token auditor — no browser needed.
   Checks: brace balance, every var(--x) resolves somewhere, and no
   self-referential custom property. */
const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, '..', 'public', 'css');
const files = fs.readdirSync(CSS_DIR).filter(f => f.endsWith('.css')).sort()
  .map(f => path.join(CSS_DIR, f));

let problems = 0;
const defined = new Map();      // token -> [file:line]
const selfRef = [];

for (const fp of files) {
  const css = fs.readFileSync(fp, 'utf8');
  const name = path.basename(fp);

  // 1. brace balance
  let depth = 0;
  for (const ch of css) {
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth < 0) break;
  }
  if (depth !== 0) { console.log(`✗ ${name}: unbalanced braces (depth ${depth})`); problems++; }

  // 2. declarations (values may span several lines, e.g. layered gradients)
  // Values may span several lines (layered gradients) but never contain a bare
  // `;` or `}`, so [^;{}] is both safe and immune to the lazy-match runaway that
  // a [\s\S]*? pattern has when the terminator alternation can match elsewhere.
  const declRe = /^\s*(--[a-z0-9-]+)\s*:([^;{}]*)[;\n]/gm;
  const lines = css.split('\n');
  const lineOf = (idx) => css.slice(0, idx).split('\n').length;
  let m;
  declRe.lastIndex = 0;
  const decls = [];
  while ((m = declRe.exec(css)) !== null) decls.push([m[1], m[2], lineOf(m.index)]);
  decls.forEach(([prop, value, ln]) => {
    const i = ln - 1;
    {
    if (!defined.has(prop)) defined.set(prop, []);
    defined.get(prop).push(`${name}:${i + 1}`);
    // self reference: --x: …var(--x)… with no fallback
    const refs = [...value.matchAll(/var\(\s*(--[a-z0-9-]+)\s*(,)?/g)];
    for (const r of refs) {
      if (r[1] === prop && !r[2]) selfRef.push(`${name}:${i + 1}  ${prop}: ${value.trim().slice(0, 90)}`);
    }
    }
  });
}

if (selfRef.length) {
  console.log('✗ self-referential custom properties (guaranteed-invalid at computed-value time):');
  selfRef.forEach(s => console.log('   ' + s));
  problems += selfRef.length;
}

// 3. usage
const used = new Map();
for (const fp of files) {
  const css = fs.readFileSync(fp, 'utf8');
  const name = path.basename(fp);
  css.split('\n').forEach((line, i) => {
    if (/^\s*--[a-z0-9-]+\s*:/.test(line)) {
      // values of declarations may also reference tokens — still count as usage
    }
    for (const m of line.matchAll(/var\(\s*(--[a-z0-9-]+)\s*(,|\))/g)) {
      const tok = m[1];
      if (!used.has(tok)) used.set(tok, []);
      used.get(tok).push(`${name}:${i + 1}`);
    }
  });
}

// tokens owned by JS at runtime (declared for safety, overwritten inline)
const JS_OWNED = new Set(['--pl-glow', '--pl-accent']);
const missing = [...used.keys()].filter(t => !defined.has(t) && !JS_OWNED.has(t)).sort();
if (missing.length) {
  console.log(`✗ ${missing.length} referenced token(s) never declared:`);
  missing.forEach(t => console.log(`   ${t}  ← ${used.get(t).slice(0, 3).join(', ')}`));
  problems += missing.length;
}

// 4. tokens declared but never used (informational)
const unused = [...defined.keys()].filter(t => !used.has(t) && !JS_OWNED.has(t)).sort();

console.log(`\n${defined.size} tokens declared, ${used.size} referenced.`);
if (unused.length) console.log(`Declared-but-unused (${unused.length}): ${unused.join(', ')}`);
console.log(problems === 0 ? '\n✓ no token errors' : `\n✗ ${problems} problem(s)`);
process.exit(problems === 0 ? 0 : 1);
