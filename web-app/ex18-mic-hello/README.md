# ex18 — Mic · hello (Serial or BLE)

**Goal.** Enable the board microphone with `MicCmd` (`0x86`) and display
live `AudioLevel` (`0x23`) numbers — first **board → host** stream lab.

Needs **`es3c28p`** (`CAP.MIC`).

---

## Learning outcomes

1. Gate UI on `boardHas(CAP.MIC, caps)`.
2. `writeAcked(MSG_MIC_CMD, encodeMicCmd({ enable }))`.
3. `subscribe` for `MSG_AUDIO_LEVEL` and `decodeAudioLevel`.

---

## Try it

[http://localhost:5174/ex18-mic-hello/](http://localhost:5174/ex18-mic-hello/)

- [ ] Mic on → rms/peak move when you speak  
- [ ] Mic off → levels stop  

**Previous:** [ex17 — SFX params](../ex17-sfx-params/)  
**Next:** [ex19 — Mic VU](../ex19-mic-vu/)
