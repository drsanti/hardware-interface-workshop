# ex28 — Mic recorder

**Goal:** capture **MicPcm** into a host buffer, **play** it on the PC
speakers, and **download** a 16 kHz mono WAV.

Needs **`es3c28p`** and **USB**.

Enable in [`src/App.tsx`](../../App.tsx): uncomment `Ex28MicRecorder`
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

**Previous:** [ex27 — Mic spectrogram](../ex27-mic-spectrogram/)  
**Next:** [ex29 — Mic filter](../ex29-mic-filter/)
