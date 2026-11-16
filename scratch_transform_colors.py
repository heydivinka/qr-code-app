import re

with open('app/routes/_index/landing.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace green / olive OKLCH colors with modern Royal Cobalt / Indigo palette
replacements = [
    (r"--color-paper:\s*oklch\([^)]+\);", "--color-paper: #f8fafc;"),
    (r"--color-paper-2:\s*oklch\([^)]+\);", "--color-paper-2: #f1f5f9;"),
    (r"--color-paper-3:\s*oklch\([^)]+\);", "--color-paper-3: #e2e8f0;"),
    (r"--color-paper-sheet:\s*oklch\([^)]+\);", "--color-paper-sheet: #ffffff;"),
    (r"--color-ink:\s*oklch\([^)]+\);", "--color-ink: #0f172a;"),
    (r"--color-ink-2:\s*oklch\([^)]+\);", "--color-ink-2: #1e293b;"),
    (r"--color-ink-soft:\s*oklch\([^)]+\);", "--color-ink-soft: #475569;"),
    (r"--color-muted:\s*oklch\([^)]+\);", "--color-muted: #94a3b8;"),
    (r"--color-rule:\s*oklch\([^)]+\);", "--color-rule: #e2e8f0;"),
    (r"--color-rule-ink:\s*oklch\([^)]+\);", "--color-rule-ink: #334155;"),
    (r"--color-accent:\s*oklch\([^)]+\);", "--color-accent: #2563eb;"),
    (r"--color-accent-deep:\s*oklch\([^)]+\);", "--color-accent-deep: #1d4ed8;"),
    (r"--color-accent-soft:\s*oklch\([^)]+\);", "--color-accent-soft: #eff6ff;"),
    (r"--color-accent-ink:\s*oklch\([^)]+\);", "--color-accent-ink: #ffffff;"),
    (r"--color-focus:\s*oklch\([^)]+\);", "--color-focus: #3b82f6;"),
    (r"--selection-bg:\s*oklch\([^)]+\);", "--selection-bg: #bfdbfe;"),
    (r"--shadow-btn-primary:\s*[^;]+;", "--shadow-btn-primary: inset 0 1px 0 rgba(255,255,255,0.35), 0 0 0 1px #1d4ed8, 0 3px 0 #1e40af;"),
    (r"--shadow-btn-secondary:\s*[^;]+;", "--shadow-btn-secondary: inset 0 1px 0 #ffffff, 0 0 0 1px #cbd5e1, 0 3px 0 #cbd5e1;"),
    (r"--surface-stamp-soft:\s*[^;]+;", "--surface-stamp-soft: #eff6ff;"),
    (r"\.band--ink\{background:var\(--color-ink\);", ".band--ink{background:#090e1a;"),
]

for pattern, repl in replacements:
    css = re.sub(pattern, repl, css)

with open('app/routes/_index/landing.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("landing.css colors transformed.")

