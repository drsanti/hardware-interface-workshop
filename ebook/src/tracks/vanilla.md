# Vanilla track (`web-app`)

Beginner path: **HTML → CSS → TypeScript** in the browser, then board I/O
through shared `@sdk`. One Vite+ MPA project on port **5174**.

```text
cd web-app
vp install
vp dev
# open http://localhost:5174/ex00-hello/
```

## Blocks

| Labs | Focus |
|------|--------|
| ex00–ex09 | DOM, style, forms, pointer, SVG, canvas, Web Audio, camera |
| ex10–ex11 | Web Serial / Web Bluetooth + `BoardInfo` |
| ex12–ex14 | RGB LED (`LedFx`, `WaveCmd`, sliders) — **es3c28p** |
| ex15–ex17 | Speaker SFX |
| ex18–ex20 | Mic levels / VU / waveform — **es3c28p**; PCM = USB Serial |

Wire helpers match the React demos; only the UI stack differs. Deep API notes:
[`@sdk` reference](../sdk/index.md).
