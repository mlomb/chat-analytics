import { BitAddress } from "@pipeline/Types";

/*
Support:
    - Signed integers
    - Reads and writes up to 32bits
    - Works in multiples of 32bits

cross boundary
|--------------------------------| |---------------------------------|
|           value1               | |            value2               |
↓ aligned32                      | ↓ aligned32 + 1                   |
[00000000000000000000000000000000] [00000000000000000000000000000000]
            ↑ offset                         ↑ offset + bits
            |            VALUE               |
            |--------------------------------|
|- delta -|------------- bits -------------|

only left boundary
[00000000000000000000000000000000] [00000000000000000000000000000000]
            ↑ offset     ↑ offset + bits
            |   VALUE    |
            |------------|
|- delta -|--- bits ---|
*/
export class BitStream {
    public buffer: Uint32Array;
    public offset: BitAddress;

    constructor(buffer?: ArrayBuffer) {
        if (buffer) console.assert(buffer instanceof ArrayBuffer);
        this.buffer = buffer ? new Uint32Array(buffer) : new Uint32Array(1024); // 1024 bytes by default
        this.offset = 0;
    }

    get buffer8(): Uint8Array {
        return new Uint8Array(this.buffer.buffer);
    }

    private grow(): void {
        // TODO: maybe double is too much
        const newBuffer = new Uint32Array(this.buffer.length * 2);
        newBuffer.set(this.buffer);
        this.buffer = newBuffer;
    }

    setBits(bits: number, value: number): void {
        const offset = this.offset;
        this.offset += bits;

        // check if we must grow the buffer
        if ((offset + bits) / 8 > this.buffer.byteLength - 4) this.grow();
        // buffer may have grown
        const buffer = this.buffer;

        // only keep the bits we need
        const mask = bits === 32 ? 0b11111111111111111111111111111111 : (1 << bits) - 1;
        const valueMasked = value & mask;

        const aligned32 = offset >>> 5;
        const delta = offset - (aligned32 << 5);

        // TODO: try to do it branchless
        if (delta + bits > 32) {
            const corr = bits - (32 - delta);
            buffer[aligned32] = (buffer[aligned32] & (~(mask >>> corr) >>> 0)) | (valueMasked >>> corr);
            buffer[aligned32 + 1] = (buffer[aligned32 + 1] & ~(mask << (32 - corr))) | (valueMasked << (32 - corr));
        } else {
            const corr = 32 - delta - bits;
            buffer[aligned32] = (buffer[aligned32] & ~(mask << corr)) | (valueMasked << corr);
        }
    }

    getBits(bits: number): number {
        const buffer = this.buffer;
        const offset = this.offset;
        this.offset += bits;

        const aligned32 = offset >>> 5;
        const delta = offset - (aligned32 << 5);
        const value1 = buffer[aligned32];
        const value2 = buffer[aligned32 + 1];

        // TODO: try to do it branchless
        let value = 0;
        if (delta + bits > 32) {
            const aligned = (value1 << delta) | (value2 >>> (32 - delta));
            value = aligned >>> (32 - bits);
        } else {
            value = (value1 << delta) >>> (32 - bits);
        }
        return value >>> 0;
    }
}
