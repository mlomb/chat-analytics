import { base91decode, base91encode } from "@pipeline/compression/Base91";

test.each([128, 256, 12345, 99999])("should encode and decode correctly len=%i", (len) => {
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) buffer[i] = i % 256;

    const encoded = base91encode(buffer);
    const decoded = base91decode(encoded);

    expect(decoded.byteLength).toEqual(buffer.byteLength);
    expect(buffer.every((v, i) => v === decoded[i])).toBe(true);
});
