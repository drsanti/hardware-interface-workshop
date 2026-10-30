# ex15 — SFX · play / stop (Serial or BLE)

**Goal.** Trigger board sound presets with `SfxCmd` (`MSG_SFX_CMD` `0x84`) via
`writeAcked()`, over USB or BLE. First speaker lab in the vanilla track.

---

## Learning outcomes

1. Reuse dual-transport `BoardSession` for an actuator that is not the LED.
2. Encode play / stop with `encodeSfxPlay` / `encodeSfxStop`.
3. Know preset `255` means stop; some presets (e.g. Alarm) loop until Stop.
4. Speaker works on **both** board SKUs (no `CAP.LED` gate).

## Message map

| Msg                  | Dir          | Role                |
| -------------------- | ------------ | ------------------- |
| `MSG_SFX_CMD` `0x84` | host → board | Play preset / stop  |
| `MSG_CMD_ACK` `0x27` | board → host | `writeAcked` result |

Desk-safe: this lab sends `volume: 25` on each play.

---

## Try it

[http://localhost:5174/ex15-sfx-play/](http://localhost:5174/ex15-sfx-play/)

- [ ] Beep / Chime play once  
- [ ] Alarm loops until Stop  
- [ ] CmdAck shows `rc=0`

**Previous:** [ex14 — LED sliders](../ex14-led-sliders/)  
**Next:** [ex16 — SFX volume](../ex16-sfx-volume/)
