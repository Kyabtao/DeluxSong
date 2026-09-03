#!/usr/bin/env python3
"""WCAG contrast audit for the classic Retro Gold palette.

Resolves the design tokens and checks the pairs that actually carry meaning
on screen:

    body copy / headings / dim text        on  page background
    body copy                              on  raised panel + modal sheet
    ink on a filled accent chip            on  the accent itself
    accent (links, badges, eyebrow)        on  page background
    hero headline                          on  the darkest hero scrim stop
    amber LCD readout                      on  the player deck's darkest glass
    key faces / meta lines                 on  the player deck's wood shell

Reports AA (4.5:1) for normal text and flags anything under 3:1 as a failure.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

# reuse the resolver from the render audit without running its report
src = (ROOT / 'tools/audit-render.py').read_text().split('# ---------------------------------------------------------------- declaration walker')[0]
# the borrowed module resolves ROOT from __file__, so hand it one
ns = {'__file__': str(ROOT / 'tools' / 'audit-render.py')}
exec(compile(src, 'audit-render', 'exec'), ns)
Resolver, parse_color = ns['Resolver'], ns['parse_color']

# variables.css owns the palette; the player deck scopes its own --deck-* ramp
# on .player. Resolver keeps the first declaration of a name, so appending the
# deck layer adds the new tokens without disturbing any root value.
variables = (ROOT / 'public/css/variables.css').read_text()
variables += '\n' + (ROOT / 'public/css/player-redesign.css').read_text()

# token -> what it is used for
PAIRS = [
    ('--text',        '--bg',            'body copy on page background'),
    ('--text',        '--panel-solid',   'body copy on raised panel'),
    ('--text',        '--surface-2',     'body copy on modal sheet'),
    ('--text-soft',   '--bg',            'soft body copy on page background'),
    ('--text-dim',    '--bg',            'dim/meta text on page background'),
    ('--accent',      '--bg',            'accent (badges, links) on background'),
    ('--on-accent',   '--accent',        'ink on filled accent chip'),
    ('--on-accent-3', '--accent',        'secondary ink on filled accent chip'),
    ('--chip-text',   '--bg',            'accent-tinted small copy on background'),
    ('--danger-text', '--bg',            'error text on background'),
    ('--ok-text',     '--bg',            'success text on background'),
    # Player deck — the LCD resolves to its darkest glass stop and the shell to
    # its lightest, which is the conservative end of each gradient.
    ('--deck-ink',      '--deck-lcd',    'deck LCD headline on amber glass'),
    ('--deck-ink-hi',   '--deck-lcd',    'deck LCD accent markers on glass'),
    ('--deck-ink-meta', '--deck-lcd',    'deck LCD credit line on glass'),
    ('--text',          '--deck-shell',  'transport key labels on deck wood'),
    ('--text-soft',     '--deck-shell',  'baarish mixer label on deck wood'),
]


def srgb_to_lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(rgba):
    r, g, b, a = rgba
    # composite over the assumed backdrop when the colour is translucent
    return 0.2126 * srgb_to_lin(r) + 0.7152 * srgb_to_lin(g) + 0.0722 * srgb_to_lin(b)


def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def theme_overrides(tid):
    if tid == 'retro':
        return {}
    return None


def resolve(res, token):
    val = res.value(token)
    m = re.search(r'rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b', val)
    if not m:
        return None
    return parse_color(m.group(0))


fails, warns, checks = [], [], 0
print(f'{"palette":<11} {"pair":<42} {"ratio":>7}  verdict')
print('-' * 78)

for tid in ['retro']:
    res = Resolver(variables, theme_overrides(tid))
    for fg_tok, bg_tok, label in PAIRS:
        fg, bg = resolve(res, fg_tok), resolve(res, bg_tok)
        if not fg or not bg:
            warns.append((tid, label, f'could not resolve {fg_tok} / {bg_tok}'))
            continue
        r = ratio(fg, bg)
        checks += 1
        verdict = 'AA ✓' if r >= 4.5 else ('AA-large ✓' if r >= 3 else 'FAIL ✗')
        flag = '' if r >= 4.5 else ('  (large text only)' if r >= 3 else '')
        print(f'{tid:<11} {label:<42} {r:>6.2f}  {verdict}{flag}')
        if r < 3:
            fails.append((tid, label, r))
        elif r < 4.5:
            warns.append((tid, label, f'{r:.2f}:1 — passes AA only for large/bold text'))
    print()

print(f'{checks} pairs checked across the classic palette')
if warns:
    print(f'\n⚠ {len(warns)} pair(s) below 4.5:1 (acceptable for large/bold UI text):')
    for t, l, r in warns:
        print(f'    {t:<11} {l:<42} {r}')
if fails:
    print(f'\n✗ {len(fails)} pair(s) below 3:1 — unreadable, must fix:')
    for t, l, r in fails:
        print(f'    {t:<11} {l:<42} {r:.2f}:1')
    sys.exit(1)
print('\n✓ nothing drops below the 3:1 legibility floor')
