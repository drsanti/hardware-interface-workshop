# ex10 — Sound studio

<div class="ebook-run">

**Track:** `react` · **Project:** `demos` · **Port:** `5173`

```text
cd demos
vp install   # first time
vp dev
# enable ex10-sfx-studio in demos/src/App.tsx (import + <Route>)
# match WORKSHOP_BOARD_ID in demos/src/lib/workshop.ts
```

<p class="ebook-source"><strong>Source:</strong> <code>demos/src/pages/ex10-sfx-studio/README.md</code></p>

</div>


**Goal:** one page that combines everything from ex06–ex09 — presets,
volume/loops, live knobs, and upload/play user melody.

Works on **both** board targets (speaker).

Enable in [`src/App.tsx`](../../../../demos/src/App.tsx): uncomment `Ex10SfxStudio`
import + `<Route>`, comment the others.

---

## 1. Why this lab?

ex06–ex09 each taught **one** idea. The studio shows how those pieces
fit in a single product-like UI without new wire messages.

**Success:** In one session you can play a siren, tweak Echo live,
upload a custom melody, play user slot, and Stop — all without changing
labs.

---

## 2. Learning objectives

| Idea | In this exercise |
| ---- | ---------------- |
| Feature composition | Dedicated `SfxStudioCard` (full tool set) |
| Message mix | `0x84` play, `0x85` param, `0x8d` prog |
| Workflow | Play → tweak live → upload/play custom → Stop |

---

## 3. Before you start

1. Flash matching `firmware-prebuilt/<board>/`.
2. Ideally finish ex06–ex09 once each.
3. Chrome/Edge on localhost; quit other serial apps.

---

## 4. Suggested walkthrough

1. Connect → Ready; keep Volume low.
2. Play **Police** (loops) → drag **Echo mix** / **Release**.
3. **Stop**.
4. **Upload melody** → **Play user slot** (should ≠ Chime).
5. Play **Chirp ↑** then **Chirp ↓** to confirm compare pair.
6. Disconnect.

---

## 5. Mental model

```
┌─────────────────────────────────────┐
│           SFX studio UI             │
│  presets │ volume/loops │ SfxParam  │
│  Upload / Play user slot │ Stop     │
└───────────────┬─────────────────────┘
                │ 0x84 / 0x85 / 0x8d
                ▼
         Board speaker path
```

---

## 6. Files

| File | Role |
| ---- | ---- |
| `index.tsx` | Mounts `SfxStudioCard` |
| `Ex10Header.tsx` | Title + copy |
| `README.md` | This guide |

Shared: `useSfx`, `components/sfx/SfxStudioCard.tsx`, `lib/wire/sfx.ts`.

---

## 7. Checklist

- [ ] Looping preset + live Echo works
- [ ] Upload + Play user slot works
- [ ] Volume/loops still affect the next play
- [ ] Stop always recovers silence

**Previous:** [ex09 — SFX melody](../../generated/react/ex09-sfx-melody/index.md)  
**Next:** [ex11 — Mic hello](../../generated/react/ex11-mic-hello/index.md)
