# Frontend Design Direction — License Rejection Reason

**Feature**: `006-license-rejection-reason`
**Created**: 2026-08-18
**Scope**: rejection modal only — no new pages, no routing change

---

## Brief

**Subject**: Rejection confirmation modal in the admin license dashboard.
**Audience**: Back-office admins who routinely review and act on employee leave requests.
**Single job**: Give the admin a focused, friction-appropriate moment to write down exactly why a license is being rejected — and signal that what they write matters before the action is committed.

---

## Token System

### Palette (6 named values)

| Token              | Hex                     | Role                                      |
| ------------------ | ----------------------- | ----------------------------------------- |
| `surface`          | `#FFFFFF`               | Modal background                          |
| `overlay`          | `rgba(15, 23, 42, 0.5)` | Backdrop (slate-900 at 50%)               |
| `text-primary`     | `#0F172A`               | Modal title, textarea content             |
| `text-secondary`   | `#64748B`               | Description copy, placeholder, label      |
| `rejection-accent` | `#EF4444`               | Destructive CTA, stripe, counter-at-limit |
| `rejection-tint`   | `#FEF2F2`               | Modal header area background              |

These extend — not replace — the existing app palette. All other surfaces inherit from the host page.

### Typography roles

| Role                   | Treatment                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| **Modal title**        | `font-semibold text-base text-[#0F172A]` — states the action, not a warning                   |
| **Body / description** | `text-sm text-[#64748B]` — brief, factual, one sentence                                       |
| **Label**              | `text-xs font-medium text-[#64748B] uppercase tracking-wide` — signals a field, not a heading |
| **Counter**            | `text-xs font-mono tabular-nums` — slate-400 at rest, `#EF4444` below 50 chars remaining      |

No custom typeface imports — the app's system font stack handles this. The distinctiveness comes from the counter treatment and the header stripe, not a new font.

---

## Layout Concept

```
┌──────────────────────────────────┐
│ ▌ Motivo del rechazo             │  ← rejection-tint bg + 4px left stripe (rejection-accent)
│   Al empleado se le notificará   │
│   el motivo por correo.          │
├──────────────────────────────────┤
│ MOTIVO                           │  ← label (uppercase xs)
│ ┌──────────────────────────────┐ │
│ │                              │ │
│ │                              │ │  ← textarea, 4 rows min, resize-none
│ │                              │ │
│ └──────────────────────────────┘ │
│                     482 restantes│  ← counter, right-aligned, monospace
│                                  │
│  (inline error if empty)         │  ← only appears on failed submit attempt
├──────────────────────────────────┤
│              [Cancelar] [Rechazar]│  ← ghost + destructive red
└──────────────────────────────────┘
```

**Width**: `max-w-md` (448px). Tall enough to show ~4 lines of textarea without scrolling.
**Modal component**: use the existing `Dialog` from `ui/dialog` — no custom overlay needed.

---

## Signature Element

**Countdown counter + left danger stripe (combined effect)**

The header area uses `rejection-tint` (`#FEF2F2`) with a `4px solid #EF4444` left border — a "danger stripe" that is restrained enough to not feel like a system error, but immediately signals consequential territory. The admin reads: _this is a step that matters_.

The character counter counts **down** (500 → 0) rather than up. This is the actual distinctive choice: it reframes the interaction as "you have this much space to explain — use it well." Turns below 50 remaining chars red. Rejects that feel rushed will naturally feel pressured by the shrinking count.

**What was cut and why:**

- No warning icon (⚠️) — would read as a system error rather than a deliberate admin decision
- No red modal header background — `#FEF2F2` tint is enough; full red would make it feel destructive UI rather than a focused form
- No numbered layout markers or decorative dividers — this is a single-field form, structure would be noise

---

## Component Map

| Element           | Component                      | Notes                                                 |
| ----------------- | ------------------------------ | ----------------------------------------------------- |
| Modal shell       | `Dialog` from `ui/dialog`      | `open` controlled by parent, no route change          |
| Trigger           | none — opened programmatically | `CertificateActions` intercepts `rechazado` selection |
| Textarea          | `Textarea` from `ui/textarea`  | `rows={4}`, `maxLength={500}`, `resize-none`          |
| Character counter | inline `<span>`                | `500 - value.length` descending, red below 50         |
| Error message     | inline below textarea          | only shown after first failed submit attempt          |
| Cancel            | `Button variant="ghost"`       | resets state, reverts select value                    |
| Confirm           | `Button variant="destructive"` | submits status + reason, shows `isLoading` spinner    |

---

## States

| State                            | Visual                                                   |
| -------------------------------- | -------------------------------------------------------- |
| **Idle** (modal just opened)     | Empty textarea, counter at 500, both buttons enabled     |
| **Writing**                      | Counter decreasing, textarea border default              |
| **Near limit** (< 50 chars left) | Counter turns `#EF4444`                                  |
| **Failed submit** (empty field)  | Red border on textarea, inline error message visible     |
| **Submitting**                   | Confirm button shows spinner + disabled, Cancel disabled |
| **Success**                      | Modal closes, select reflects new status, toast success  |
