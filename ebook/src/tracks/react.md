# React track (`demos`)

Advanced catalog after vanilla: React 19 + TypeScript + Tailwind, same board
wire over Serial/BLE. Vite+ SPA on port **5173**.

```text
cd demos
vp install
vp dev
```

Enable **exactly one** lab: uncomment its import + `<Route>` in
`demos/src/App.tsx` (comment the others). Set `WORKSHOP_BOARD_ID` in
`demos/src/lib/workshop.ts` to match the flashed SKU.

## Blocks

| Labs | Focus |
|------|--------|
| ex00–ex03 | Getting started, components, Serial picker, board hello |
| ex04–ex15 | LED, SFX, mic studios — prefer **es3c28p** |
| ex16–ex25 | Keys, battery, IMU/RTC (**ws28p**), appliances, caps gate |
| ex26–ex34 | Host-side mic DSP + sense appliances |

Gate UI with `boardHas()` / caps — never assume LED or mic on `ws28p`.
