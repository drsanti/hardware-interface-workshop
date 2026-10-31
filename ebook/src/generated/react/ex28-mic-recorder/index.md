# ex28 — Mic recorder

<div class="ebook-run">

**Track:** `react` · **Project:** `demos` · **Port:** `5173`

```text
cd demos
vp install   # first time
vp dev
# enable ex28-mic-recorder in demos/src/App.tsx (import + <Route>)
# match WORKSHOP_BOARD_ID in demos/src/lib/workshop.ts
```

<p class="ebook-source"><strong>Source:</strong> <code>demos/src/pages/ex28-mic-recorder/README.md</code></p>

</div>


**Goal:** capture **MicPcm** into a host buffer, **play** it on the PC
speakers, and **download** a 16 kHz mono WAV.

Needs **`es3c28p`** and **USB**.

Enable in [`src/App.tsx`](../../../../demos/src/App.tsx): uncomment `Ex28MicRecorder`
import + `<Route>`, comment the others.

---

## 1. Why this lab?

FFT / spectrogram are live views. Recording teaches **buffering PCM**, a
simple **WAV container**, and host-side **playback** — the base for
offline filters and ML later.

**Success:** Record a few seconds → Stop → Play hears your voice → WAV
downloads and opens in a media player.

---

## 2. Learning objectives

| Idea | In this exercise |
| ---- | ---------------- |
| MicPcm capture | Append int16 chunks while `recording` |
| Auto stream | Record turns on `MicCmd.stream` if needed |
| WAV | RIFF header + PCM payload (`lib/pcm/wav.ts`) |
| Web Audio play | `AudioBuffer` from int16 → speakers |
| Cap | 30 s max — keeps RAM bounded |

---

## 3. Mental model

```
Mic ──► MicPcm ──► chunks[] ──► Int16Array
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
         Play (WA)    Download     Clear
```

---

## 4. Files

| File | Role |
| ---- | ---- |
| `index.tsx` | Composition |
| `Ex28Header.tsx` | Title copy |
| `hooks/useMicRecorder.ts` | Capture / play / download |
| `lib/pcm/wav.ts` | WAV + play helper |
| `components/RecorderCard.tsx` | Buttons + status |

---

## 5. Checklist

- [ ] Flash `es3c28p`; USB only
- [ ] Connect → Ready → **Record** → speak → **Stop**
- [ ] **Play** — hear clip on the PC
- [ ] **WAV** — file opens elsewhere
- [ ] **Clear** empties the buffer

**Previous:** [ex27 — Mic spectrogram](../../generated/react/ex27-mic-spectrogram/index.md)  
**Next:** [ex29 — Mic filter](../../generated/react/ex29-mic-filter/index.md)
