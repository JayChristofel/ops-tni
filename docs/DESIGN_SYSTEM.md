# Design System — JC Design System v1.0

> Terminal-first dark aesthetic untuk tooling keamanan, OSINT, dan dasbor operasional.

---

## Philosophy

**"Data dulu, dekorasi belum tentu."**

UI ini bukan dashboard korporat. Ini terminal operasi. Setiap elemen harus earn its place:
- **Kepadatan informasi** lebih penting dari whitespace
- **Sinyal warna** hanya untuk status, bukan dekorasi
- **Font monospace** untuk data teknis, sans-serif untuk label
- **Animasi** hanya untuk transisi state dan data live, bukan estetika

---

## Color Tokens

### CSS Custom Properties (Tailwind v4 `@theme`)

```css
@theme {
  /* Neutrals */
  --color-ink:     #0B0F0E;   /* Background paling dalam — canvas utama */
  --color-surface: #121917;   /* Card, panel, sidebar */
  --color-line:    #1F2B27;   /* Border, divider, separator */
  --color-txt:     #D7E3DE;   /* Primary text */
  --color-muted:   #8FA39B;   /* Secondary text, placeholder, label */

  /* Signals */
  --color-signal:  #3DDC97;   /* Success, aktif, secure, GREEN */
  --color-purple:  #B79CFF;   /* Info, Red Team accent, intel */
  --color-warn:    #F2B84B;   /* Warning, degraded, amber */
  --color-danger:  #FF6B6B;   /* Error, kritis, attack, RED */
}
```

### Semantic Usage Guide

| Token | Use Case | DO | DON'T |
|-------|----------|-----|-------|
| `ink` | Halaman background | Body, canvas | Card background |
| `surface` | Elevated surface | Panel, card, modal | Background page |
| `line` | Borders | Divider, input border | Text, icon |
| `txt` | Primary content | Body copy, data values | Decorative |
| `muted` | Secondary info | Label, hint, timestamp | Primary action |
| `signal` | Positive status | Secure, online, success | Generic green |
| `purple` | Intel / Red Team | C2 session, payload info | Random accent |
| `warn` | Degraded state | Medium threat, cooldown | General attention |
| `danger` | Critical / Attack | Under attack, critical, error | Decoration |

### Tailwind Color Usage

```tsx
// Backgrounds
className="bg-ink"        // Page bg
className="bg-surface"    // Card/panel bg

// Text
className="text-txt"      // Primary text
className="text-muted"    // Label/secondary
className="text-signal"   // Green value
className="text-warn"     // Amber value
className="text-danger"   // Red value
className="text-purple"   // Purple/intel value

// Borders
className="border-line"   // Standard border
className="border-signal" // Active/secure highlight
className="border-danger" // Alert/attack highlight

// Dots & Badges
className="bg-signal"     // Online dot
className="bg-danger"     // Attack indicator
```

---

## Typography

### Font Stack

```css
@theme {
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
}
```

### Type Scale

| Class | Size | Weight | Font | Use Case |
|-------|------|--------|------|----------|
| `text-xs font-mono` | 10px | 400 | Mono | Timestamps, hex values |
| `text-sm font-mono` | 12px | 400 | Mono | Terminal output, log entries |
| `text-sm font-sans` | 12px | 400 | Sans | Chip labels, tiny UI |
| `text-base font-mono` | 14px | 400 | Mono | Data values, code |
| `text-base font-sans` | 14px | 400 | Sans | Body text, descriptions |
| `text-lg font-sans font-semibold` | 16px | 600 | Sans | Section header |
| `text-xl font-mono font-bold` | 18px | 700 | Mono | Panel title, stat value |
| `text-2xl font-mono font-bold` | 20px | 700 | Mono | Score, big number |
| `text-3xl font-mono font-bold` | 24px | 700 | Mono | Hero stat |

### Typography Patterns

```tsx
// Log entry — monospace, kecil, dimmed timestamp
<div className="font-mono text-xs">
  <span className="text-muted">[12:34:56]</span>
  <span className="text-purple ml-2">[RED]</span>
  <span className="text-txt ml-2">{message}</span>
</div>

// Big stat value
<div className="font-mono text-3xl font-bold text-signal">
  {value}
  <span className="text-sm font-sans text-muted ml-1">MB</span>
</div>

// Section heading
<h2 className="font-sans text-lg font-semibold text-muted uppercase tracking-widest">
  {title}
</h2>

// Panel title
<h3 className="font-mono text-xl font-bold text-txt">
  {panelTitle}
</h3>
```

---

## Spacing & Layout

### Base Unit: 4px

```css
/* Tailwind spacing scale yang kita pakai */
p-1  = 4px    /* Tight padding — chip, badge */
p-2  = 8px    /* Inner padding — small card */
p-3  = 12px   /* Standard component padding */
p-4  = 16px   /* Panel content padding */
p-6  = 24px   /* Section padding */
p-8  = 32px   /* Page padding */

gap-2 = 8px   /* Tight list items */
gap-3 = 12px  /* Standard gap */
gap-4 = 16px  /* Panel sections */
gap-6 = 24px  /* Major layout sections */
```

### Border Radius

```css
@theme {
  --radius-chip:   4px;    /* Chip, badge */
  --radius-card:   8px;    /* Card, panel */
  --radius-modal:  12px;   /* Modal, overlay */
}

/* Usage */
className="rounded"       /* 4px — chip */
className="rounded-lg"    /* 8px — card */
className="rounded-xl"    /* 12px — modal */
```

### Grid Layout

```
War Room (3-column):
┌──────────┬──────────────────────┬──────────┐
│ Sidebar  │   ThreatGlobe 3D     │ Sidebar  │
│ 280px    │   (flex-1)           │ 280px    │
│ Attack   │                      │ Score-   │
│ Feed     │                      │ board    │
└──────────┴──────────────────────┴──────────┘

Red Team (2-column):
┌──────────────────────┬────────────────────┐
│   TargetBoard        │   KillChain        │
│   (40%)              │   (60%)            │
│   + C2 Panel below   │   + Payload/Exfil  │
└──────────────────────┴────────────────────┘

Blue Team (2-column):
┌────────────────┬────────────────────────────┐
│ NetworkGraph   │  SectorDefensePanel        │
│ 3D (50%)       │  AssetHealthBySektor       │
│                │  AlertFeed                 │
└────────────────┴────────────────────────────┘
```

---

## Component Patterns

### Card / Panel

```tsx
// Standard panel
<div className="bg-surface border border-line rounded-lg p-4">
  <h3 className="font-mono text-sm font-semibold text-muted uppercase tracking-widest mb-3">
    {title}
  </h3>
  {children}
</div>

// Highlighted panel (signal border)
<div className="bg-surface border border-signal/30 rounded-lg p-4">
  ...
</div>

// Danger state panel
<div className="bg-surface border border-danger/50 rounded-lg p-4">
  ...
</div>
```

### Status Badge

```tsx
// Threat level badge
const THREAT_COLORS = {
  1: 'bg-signal/20 text-signal border-signal/40',
  2: 'bg-signal/20 text-signal border-signal/40',
  3: 'bg-warn/20 text-warn border-warn/40',
  4: 'bg-danger/20 text-danger border-danger/40',
  5: 'bg-danger/30 text-danger border-danger/60',
}

<span className={`px-2 py-0.5 rounded text-xs font-mono border ${THREAT_COLORS[level]}`}>
  LEVEL {level}
</span>

// Status dot
<span className={`inline-block w-2 h-2 rounded-full ${
  status === 'online' ? 'bg-signal' : 
  status === 'attack' ? 'bg-danger animate-pulse' : 
  'bg-muted'
}`} />
```

### Progress Bar

```tsx
// Health bar
<div className="w-full h-1.5 bg-line rounded-full">
  <div
    className={`h-full rounded-full transition-all duration-500 ${
      pct > 60 ? 'bg-signal' :
      pct > 30 ? 'bg-warn' :
      'bg-danger'
    }`}
    style={{ width: `${pct}%` }}
  />
</div>

// Intensity bar (MITRE heatmap)
<div className="w-full h-2 bg-line rounded-sm">
  <div
    className="h-full bg-danger/80 rounded-sm transition-all duration-300"
    style={{ width: `${intensity}%` }}
  />
</div>
```

### Button

```tsx
// Primary action — signal (green)
<button className="
  px-4 py-2 rounded font-mono text-sm font-semibold
  bg-signal/20 text-signal border border-signal/40
  hover:bg-signal/30 hover:border-signal/60
  transition-colors duration-150
  disabled:opacity-40 disabled:cursor-not-allowed
">
  [EXECUTE]
</button>

// Danger action — red
<button className="
  px-4 py-2 rounded font-mono text-sm font-semibold
  bg-danger/20 text-danger border border-danger/40
  hover:bg-danger/30 hover:border-danger/60
  transition-colors duration-150
">
  [ATTACK]
</button>

// Secondary — neutral
<button className="
  px-3 py-1.5 rounded font-mono text-xs
  bg-line text-muted border border-line
  hover:bg-surface hover:text-txt
  transition-colors duration-150
">
  [DETAILS]
</button>
```

### Input / Select

```tsx
<input
  className="
    w-full px-3 py-2 rounded font-mono text-sm
    bg-ink border border-line text-txt
    placeholder:text-muted
    focus:outline-none focus:border-signal/60
    transition-colors duration-150
  "
  placeholder="> ENTER COMMAND..."
/>

<select className="
  px-3 py-2 rounded font-mono text-sm
  bg-ink border border-line text-txt
  focus:outline-none focus:border-signal/60
">
  <option value="">-- SELECT --</option>
</select>
```

### Terminal / Log Stream

```tsx
<div className="
  bg-ink border border-line rounded-lg p-3
  font-mono text-xs
  overflow-y-auto
  scrollbar-thin scrollbar-track-ink scrollbar-thumb-line
">
  {logs.map((log, i) => (
    <div key={i} className="flex gap-2 py-0.5">
      <span className="text-muted shrink-0">[{log.time}]</span>
      <span className={`shrink-0 ${
        log.team === 'RED'   ? 'text-danger' :
        log.team === 'BLUE'  ? 'text-signal' :
        log.team === 'INTEL' ? 'text-purple' :
        'text-muted'
      }`}>
        [{log.team}]
      </span>
      <span className="text-txt break-all">{log.msg}</span>
    </div>
  ))}
</div>
```

### Countdown Chip

```tsx
// Cooldown timer
<span className="
  px-2 py-0.5 rounded text-xs font-mono
  bg-warn/20 text-warn border border-warn/40
">
  {remaining}s
</span>

// Active / deployed
<span className="
  px-2 py-0.5 rounded text-xs font-mono
  bg-signal/20 text-signal border border-signal/40
">
  ACTIVE
</span>
```

---

## Icon Convention

Gunakan prefix bracket `[...]` sebagai pseudo-icon dalam terminal aesthetic:

```tsx
// Status indicators
[*]   → scanning / processing
[+]   → success / added
[-]   → removed / stopped  
[!]   → warning / alert
[✗]   → error / failed
[>]   → command / execute

// Team markers
[RED]   → Red Team action
[BLUE]  → Blue Team defense
[INTEL] → Intelligence / OSINT
[SYS]   → System message
[C2]    → C2 activity
```

---

## Animation Tokens

```css
/* Framer Motion variants — gunakan ini sebagai preset */

/* Panel slide-in dari kanan */
const slideIn = {
  hidden:  { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } }
}

/* Alert pulse */
const alertPulse = {
  animate: { opacity: [1, 0.5, 1], transition: { repeat: Infinity, duration: 1 } }
}

/* Fade in list item */
const listItem = {
  hidden:  { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.15 } }
}

/* Toast toast */
const toast = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0,  scale: 1 },
  exit:    { opacity: 0, y: -10, scale: 0.95 }
}
```

---

## Responsive Breakpoints

```
Mobile  < 768px   → Stack semua panel vertikal, sembunyikan 3D canvas
Tablet  768–1024px → 2 kolom, simplifikasi
Desktop > 1024px  → Full 3-column layout dengan 3D canvas
```

```tsx
// Grid responsive
className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"

// Hide canvas on mobile
className="hidden lg:block"  // ThreatGlobe dan NetworkGraph3D

// Full height panel
className="h-[calc(100vh-64px)] overflow-hidden"  // 64px = Navbar height
```

---

## Navbar

```
Height: 48px (h-12)
Background: bg-surface/80 backdrop-blur border-b border-line
Position: sticky top-0 z-50

Left:   Logo + "CYBERWAR SIM" wordmark
Center: Nav links (War Room / Red Team / Blue Team)
Right:  LIVE badge + Tick counter
```

---

*JC Design System v1.0 — CyberWar Simulation UI — 2026*
