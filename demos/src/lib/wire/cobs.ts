/** COBS encode — board wire uses 0x00 as the frame delimiter. */
export function cobsEncode(src: Uint8Array): Uint8Array {
  const out: number[] = [];
  let codePtr = out.length;
  out.push(0);
  let code = 1;
  for (const b of src) {
    if (b === 0) {
      out[codePtr] = code;
      codePtr = out.length;
      out.push(0);
      code = 1;
    } else {
      out.push(b);
      if (++code === 0xff) {
        out[codePtr] = code;
        codePtr = out.length;
        out.push(0);
        code = 1;
      }
    }
  }
  out[codePtr] = code;
  return new Uint8Array(out);
}

/** COBS decode — returns null if the block is truncated / invalid. */
export function cobsDecode(src: Uint8Array): Uint8Array | null {
  const out: number[] = [];
  let i = 0;
  while (i < src.length) {
    const code = src[i++];
    for (let j = 1; j < code && i < src.length; j++) {
      out.push(src[i++]);
    }
    if (code < 0xff && i < src.length) out.push(0);
  }
  return new Uint8Array(out);
}
