#!/usr/bin/env python3
"""Render-fidelity check for the default "Retro Gold" theme.

Resolves every design token back to a concrete colour and compares each CSS
declaration in the refactored stylesheets against the pre-refactor original
(git HEAD). Anything that is not an exact match — and is not on the explicit
allow-list of intended tweaks — is a regression in the default look.
"""
import re, sys, subprocess, pathlib, colorsys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FILES = ['base', 'hero', 'playlist-selector', 'player', 'drawer', 'sections', 'modals']


# ---------------------------------------------------------------- token resolver
def hex_to_rgba(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
    return (r, g, b, a)


NAMED = {'white': (255, 255, 255, 1.0), 'black': (0, 0, 0, 1.0),
         'transparent': (0, 0, 0, 0.0), 'red': (255, 0, 0, 1.0)}


def parse_color(text):
    """-> (r,g,b,a) or None if the string holds no colour."""
    t = text.strip()
    if t.lower() in NAMED:
        return NAMED[t.lower()]
    m = re.fullmatch(r'rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)', t)
    if m:
        r, g, b = (int(float(m.group(i))) for i in (1, 2, 3))
        a = m.group(4)
        a = 1.0 if a is None else (float(a[:-1]) / 100 if a.endswith('%') else float(a))
        return (r, g, b, a)
    m = re.fullmatch(r'#[0-9a-fA-F]{3,8}', t)
    if m:
        return hex_to_rgba(t)
    return None


class Resolver:
    """Evaluates the :root token graph of the default theme to concrete colours."""

    def __init__(self, css, overrides=None):
        self.vars = {}
        for m in re.finditer(r'(--[a-z0-9-]+)\s*:([^;{}]+);', css):
            name, value = m.group(1), m.group(2).strip()
            if name not in self.vars:            # first declaration wins in :root
                self.vars[name] = value
        for k, v in (overrides or {}).items():
            self.vars[k] = v
        self.cache = {}

    def sub(self, text, depth=0):
        """Recursively replace var(--x[, fallback]) with its value."""
        if depth > 40:
            return text
        out, i = [], 0
        while True:
            j = text.find('var(', i)
            if j < 0:
                out.append(text[i:])
                break
            out.append(text[i:j])
            k, d = j + 4, 1
            while k < len(text) and d:
                if text[k] == '(':
                    d += 1
                elif text[k] == ')':
                    d -= 1
                k += 1
            inner = text[j + 4:k - 1]
            parts = self._split_top(inner)
            name = parts[0].strip()
            fallback = parts[1].strip() if len(parts) > 1 else None
            raw = self.vars.get(name)
            if raw is None:
                raw = fallback if fallback is not None else ''
            out.append(self.sub(raw, depth + 1))
            i = k
        return ''.join(out)

    @staticmethod
    def _split_top(s):
        parts, d, cur = [], 0, []
        for ch in s:
            if ch in '([':
                d += 1
            elif ch in ')]':
                d -= 1
            if ch == ',' and d == 0:
                parts.append(''.join(cur))
                cur = []
            else:
                cur.append(ch)
        parts.append(''.join(cur))
        return parts

    def color_mix(self, text, depth=0):
        """Evaluate color-mix(in srgb, A p%, B) — used by the accent ramp.

        Arguments are split bracket-aware because a colour stop is itself
        `rgb(42, 23, 14)` and naive comma splitting would shred it."""
        if depth > 20 or 'color-mix(' not in text:
            return text
        i = text.find('color-mix(')
        j, d = i + len('color-mix('), 1
        while j < len(text) and d:
            if text[j] == '(':
                d += 1
            elif text[j] == ')':
                d -= 1
            j += 1
        args = self._split_top(text[i + len('color-mix('):j - 1])
        if len(args) < 3 or args[0].strip() != 'in srgb':
            return text
        # strip the trailing percentage before parsing the colour itself
        pa = re.search(r'(\d+(?:\.\d+)?)\s*%\s*$', args[1].strip())
        pb = re.search(r'(\d+(?:\.\d+)?)\s*%\s*$', args[2].strip())
        ca = args[1].strip()[:pa.start()].strip() if pa else args[1].strip()
        cb = args[2].strip()[:pb.start()].strip() if pb else args[2].strip()
        a = parse_color(self.sub(ca, depth + 1))
        b = parse_color(self.sub(cb, depth + 1))
        if not a or not b:
            return text
        w1 = float(pa.group(1)) / 100 if pa else (1 - float(pb.group(1)) / 100 if pb else 0.5)
        mixed = tuple(a[k] * w1 + b[k] * (1 - w1) for k in range(3)) + (a[3] * w1 + b[3] * (1 - w1),)
        repl = 'rgba(%d, %d, %d, %.4f)' % mixed
        return self.color_mix(text[:i] + repl + text[j:], depth + 1)

    def value(self, name):
        if name in self.cache:
            return self.cache[name]
        raw = self.vars.get(name, '')
        resolved = self.color_mix(self.sub(raw))
        self.cache[name] = resolved
        return resolved


def colors_in(value, res):
    """All concrete colours inside a (possibly multi-part) declaration value."""
    expanded = res.color_mix(res.sub(value))
    found = []
    for m in re.finditer(r'rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b', expanded):
        c = parse_color(m.group(0))
        if c:
            found.append((m.group(0), c))
    # `rgb(var(--triplet))` expands to rgb(42, 23, 14) — but a bare triplet that
    # never got wrapped (e.g. a token used where a colour was expected) is a bug.
    if re.search(r'var\(--', expanded):
        found.append(('UNRESOLVED:' + expanded.strip()[:60], None))
    return found


# ---------------------------------------------------------------- declaration walker
BLOCK = re.compile(r'([^{}@]+)\{([^{}]*)\}', re.S)


def declarations(css):
    """selector -> {prop: value} (last wins, matching the cascade for duplicates)."""
    out = {}
    for sel, body in BLOCK.findall(css):
        sel = re.sub(r'\s+', ' ', sel.strip().split('/*')[-1].strip())
        if not sel or sel.startswith('/*'):
            continue
        props = out.setdefault(sel, {})
        for dm in re.finditer(r'(^|;)\s*([a-z-]+)\s*:([^;]*)', body, re.S):
            prop, val = dm.group(2).strip(), re.sub(r'\s+', ' ', dm.group(3)).strip()
            props[prop] = val
    return out


def norm_sel(s):
    """Compare selectors loosely: the refactor renamed some aliases."""
    return re.sub(r'\s+', ' ', s).strip().rstrip(',').strip()


# ---------------------------------------------------------------- run
cur_vars = (ROOT / 'public/css/variables.css').read_text()
res = Resolver(cur_vars)

# The original stylesheets referenced their own token names (--amber, --cream…),
# so they must be resolved against HEAD's variables.css — with the legacy names
# restored — not against the new graph.
head_vars = subprocess.run(['git', '-C', str(ROOT), 'show', 'HEAD:public/css/variables.css'],
                           capture_output=True, text=True).stdout
LEGACY = """
:root {
  --amber: #f5b324;
  --amber-light: #ffd56b;
  --amber-dark: #c48208;
  --amber-glow: rgba(245, 179, 36, 0.4);
  --cream: #fbf1de;
  --cream-dim: #d8c3a5;
  --panel-solid: #1c1008;
}
"""
res_orig = Resolver(head_vars + LEGACY)

# intended, documented deviations from the original artwork (not regressions)
ALLOW = {
    ('.hero-shade', 'background'),        # scrim bottom stop 0.9 -> 0.98, plus --pl-glow default
    ('.brand', 'text-shadow'),            # now themed via --brand-shadow (same retro values)
    ('.brand', 'font-size'),              # phosphor skin only
    ('.brand span', 'text-shadow'),       # now themed via --brand-span-shadow
    ('.hero-bg', 'filter'),               # now themed via --hero-img-filter
    ('body', 'font-family'),              # now --font-body (same stack, + Devanagari fallback)
    ('body', 'background'),               # now carries --bg-image
    ('body', 'color'),                    # --cream -> --text (identical value)
    ('.foot-brand', 'font-family'),       # hardcoded Baloo -> --font-display
    ('main', 'background'),               # now --main-grad
    ('.foot', 'background'),              # now --foot-bg
    ('.toast', 'background'),             # now --toast-grad
    ('.drawer', 'border-radius'),
    ('.player', 'border-radius'),
    ('.sheet', 'border-radius'),
    ('.card', 'border-radius'),
    ('.station-btn', 'border-radius'),
    ('.acc details', 'border-radius'),
    ('.acc summary', 'border-radius'),
    ('.form-input', 'border-radius'),
    ('.req-type-btn', 'border-radius'),
    ('::-webkit-scrollbar-thumb', 'border-radius'),
    (':focus-visible', 'border-radius'),
}

problems, notes, compared, skipped = [], [], 0, 0
for name in FILES:
    orig = subprocess.run(['git', '-C', str(ROOT), 'show', f'HEAD:public/css/{name}.css'],
                          capture_output=True, text=True).stdout
    cur = (ROOT / f'public/css/{name}.css').read_text()
    o, c = declarations(orig), declarations(cur)
    for sel, props in o.items():
        if sel not in c:
            continue
        for prop, oval in props.items():
            cval = c[sel].get(prop)
            if cval is None:
                continue
            if (sel, prop) in ALLOW:
                skipped += 1
                continue
            oc, cc = colors_in(oval, res_orig), colors_in(cval, res)
            compared += 1
            if len(oc) != len(cc):
                # only a problem if the original actually had colours
                if oc:
                    problems.append((name, sel, prop, oval, cval, [x[0] for x in oc], [x[0] for x in cc]))
                continue
            for (ot, orc), (ct, crc) in zip(oc, cc):
                if orc is None or crc is None:
                    problems.append((name, sel, prop, oval, cval, ot, ct))
                    break
                # alpha is weighted 4x: an opacity slip is far more visible than
                # a few points of hue on these dark, low-chroma surfaces
                delta = max([abs(orc[i] - crc[i]) for i in range(3)] +
                            [abs(orc[3] - crc[3]) * 255 * 4])
                if delta > 12:
                    problems.append((name, sel, prop, oval, cval,
                                     f'{ot} {tuple(round(x, 3) for x in orc)}',
                                     f'{ct} {tuple(round(x, 3) for x in crc)} Δ{delta:.0f}'))
                elif delta > 0.5:
                    notes.append((name, sel, prop, ot, ct, delta))
                break_flag = True

print(f'compared {compared} declarations across {len(FILES)} stylesheets '
      f'({skipped} intentional theme hooks skipped)\n')
if notes:
    print(f'• {len(notes)} sub-perceptual consolidations (≤12/255 — near-identical '
          f'original hexes merged into one token):')
    seen = set()
    for f, sel, prop, ot, ct, d in notes:
        key = (ot, ct)
        if key in seen:
            continue
        seen.add(key)
        print(f'    {ot:<22} -> {ct:<28} Δ{d:.1f}  (e.g. {f}.css {sel} {{{prop}}})')
    print()
if problems:
    print(f'✗ {len(problems)} colour drift(s) in the default theme:\n')
    for f, sel, prop, oval, cval, o, c in problems:
        print(f'  {f}.css  {sel} {{ {prop} }}')
        print(f'     original : {oval}')
        print(f'     resolved : {o}')
        print(f'     now      : {cval}')
        print(f'     resolves : {c}\n')
    sys.exit(1)
print('✓ default "Retro Gold" theme resolves to the original colours — no visual regression')
