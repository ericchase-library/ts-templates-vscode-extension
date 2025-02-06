import { SplitLines } from '../Utility/String.js';

export class U8Group {
  arrays = new Array<Uint8Array>();
  byteLength = 0;
  add(bytes: Uint8Array) {
    this.arrays.push(bytes);
    this.byteLength += bytes.byteLength;
    return this.byteLength;
  }
  get(count: number, offset = 0): Uint8Array {
    const out = new Uint8Array(count);
    let i_out = 0;
    if (offset === 0) {
      for (const bytes of this.arrays) {
        for (let i_bytes = 0; i_bytes < bytes.byteLength; i_bytes++) {
          out[i_out] = bytes[i_bytes];
          i_out++;
          if (i_out >= count) {
            return out;
          }
        }
      }
    } else {
      let i_total = 0;
      for (const bytes of this.arrays) {
        for (let i_bytes = 0; i_bytes < bytes.byteLength; i_bytes++) {
          i_total++;
          if (i_total >= offset) {
            out[i_out] = bytes[i_bytes];
            i_out++;
            if (i_out >= count) {
              return out;
            }
          }
        }
      }
    }
    return out;
  }
}

export function U8(from: ArrayLike<number> = []): Uint8Array {
  return Uint8Array.from(from);
}

export function U8Clamped(from: ArrayLike<number> = []): Uint8Array {
  return Uint8Array.from(Uint8ClampedArray.from(from));
}

export function U8Concat(arrays: readonly Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (const array of arrays) {
    totalLength += array.length;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }
  return result;
}

export function U8Copy(bytes: Uint8Array, count: number, offset = 0): Uint8Array {
  return bytes.slice(offset, offset + count);
}

export function U8FromString(from: string): Uint8Array {
  return new TextEncoder().encode(from);
}

export function U8FromUint32(from: number): Uint8Array {
  const u8s = new Uint8Array(4);
  const view = new DataView(u8s.buffer);
  view.setUint32(0, from >>> 0, false);
  return u8s;
}

export function U8Split(bytes: Uint8Array, count: number): Uint8Array[] {
  if (count > bytes.byteLength) {
    return [bytes.slice()];
  }
  if (count > 0) {
    const parts: Uint8Array[] = [];
    for (let i = 0; i < bytes.length; i += count) {
      parts.push(bytes.slice(i, i + count));
    }
    return parts;
  }
  return [bytes.slice()];
}

export function U8Take(bytes: Uint8Array, count: number): [Uint8Array, Uint8Array] {
  if (count > bytes.byteLength) {
    return [bytes.slice(), new Uint8Array()];
  }
  if (count > 0) {
    const chunkA = bytes.slice(0, count);
    const chunkB = bytes.slice(count);
    return [chunkA, chunkB];
  }
  return [new Uint8Array(), bytes.slice()];
}

export function U8TakeEnd(bytes: Uint8Array, count: number): [Uint8Array, Uint8Array] {
  if (count > bytes.byteLength) {
    return [bytes.slice(), new Uint8Array()];
  }
  if (count > 0) {
    const chunkA = bytes.slice(bytes.byteLength - count);
    const chunkB = bytes.slice(0, bytes.byteLength - count);
    return [chunkA, chunkB];
  }
  return [new Uint8Array(), bytes.slice()];
}

export function U8ToASCII(bytes: Uint8Array): string {
  // appending to string has best overall performance for chrome and firefox
  let ascii = '';
  for (const byte of bytes) {
    ascii += String.fromCharCode(byte >>> 0);
  }
  return ascii;
}

export function U8ToDecimal(bytes: Uint8Array): string[] {
  // Array[index] has best overall performance for chrome and firefox
  const decimal: string[] = new Array(bytes.byteLength);
  for (let i = 0; i < bytes.byteLength; i += 1) {
    decimal[i] = (bytes[i] >>> 0).toString(10);
  }
  return decimal;
}

export function U8ToHex(bytes: Uint8Array): string[] {
  // Array[index] has best overall performance for chrome and firefox
  const hex: string[] = new Array(bytes.byteLength);
  for (let i = 0; i < bytes.byteLength; i += 1) {
    hex[i] = (bytes[i] >>> 0).toString(16).padStart(2, '0');
  }
  return hex;
}

export function U8ToLines(bytes: Uint8Array) {
  // Array.split() beats Array[index] here for overall performance
  return SplitLines(U8ToString(bytes));
}

export function U8ToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}
