/** Offset in bits in a BitStream */
export type BitAddress = number;

/**
 * A stream where you can read and write arbitrary amounts of bits.
 * One can change the offset to seek specific locations.
 * Only supports  signed integers up to 32 bits. Supports variable length integers.
 * It DOES NOT check for out of bounds reads or writes.
 *
 * It works using a 32bits buffer and when reading or writing two situations can happen:
 *
 * [+] ONLY LEFT BOUNDARY: the value being read is contained in the exact 32bits word
 * ```
 * [00000000000000000000000000000000] [00000000000000000000000000000000]
 *             ↑ offset     ↑ offset + bits
 *             |    VALUE   |
 *             |------------|
 * |-- delta --|--- bits ---|
 * ```
 *
 * [+] CROSS BOUNDARY: the value being read is divided between two 32bits words
 * ```
 *  |--------------------------------| |---------------------------------|
 *  |           value1               | |            value2               |
 *  ↓ aligned32                      | ↓ aligned32 + 1                   |
 *  [00000000000000000000000000000000] [00000000000000000000000000000000]
 *              ↑ offset                         ↑ offset + bits
 *              |             VALUE              |
 *              |--------------------------------|
 *  |-- delta --|------------- bits -------------|
 * ```
 *
 * `delta`, `bits`, `aligned32` and `offset` represent the variables in the code.
 */
export class BitStream {
    public buffer: Uint32Array;

    /** Reading and writing "head", bytes will be read or written starting from this offset */
    public offset: BitAddress;

    constructor(buffer?: ArrayBuffer) {
        if (buffer) {
            if (buffer instanceof ArrayBuffer === false) throw new Error("buffer must be an ArrayBuffer");
            if (buffer.byteLength % 4 !== 0) throw new Error("buffer must be aligned to 32bits");
        }

        this.buffer = buffer ? new Uint32Array(buffer) : new Uint32Array(1024); // 1024 u32 by default, 4KB
        this.offset = 0;
    }

    /**
     * Returns the data buffer up to the current offset as an Uint8Array.
     * The buffer returned is aligned to 32bits, so it can be used to create another BitStream instance.
     */
    get buffer8(): Readonly<Uint8Array> {
        // we are reusing the same buffer (to a void a copy) and wrapping it in a new Uint8Array with the offsets we need
        return new Uint8Array(this.buffer.buffer, 0, Math.ceil(this.offset / 32) * 4);
    }

    /**
     * Grows the data buffer to allow new bits to be written.
     * Note that the buffer instance will change.
     */
    private grow(): void {
        const growthFactor = 1.5;
        const newBuffer = new Uint32Array(this.buffer.length * growthFactor);
        newBuffer.set(this.buffer);
        this.buffer = newBuffer;
    }

    /** Sets the value at the current offset using the specified number of bits */
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

        // TODO: try to do it branch-less
        if (delta + bits > 32) {
            const corr = bits - (32 - delta);
            buffer[aligned32] = (buffer[aligned32] & ~(mask >>> corr)) | (valueMasked >>> corr);
            buffer[aligned32 + 1] = (buffer[aligned32 + 1] & ~(mask << (32 - corr))) | (valueMasked << (32 - corr));
        } else {
            const corr = 32 - delta - bits;
            buffer[aligned32] = (buffer[aligned32] & ~(mask << corr)) | (valueMasked << corr);
        }
    }

    /** Reads the value at the current offset using the specified number of bits */
    getBits(bits: number): number {
        const buffer = this.buffer;
        const offset = this.offset;
        this.offset += bits;

        const aligned32 = offset >>> 5;
        const delta = offset - (aligned32 << 5);
        const value1 = buffer[aligned32];
        const value2 = buffer[aligned32 + 1];

        // TODO: try to do it branch-less
        let value = 0;
        if (delta + bits > 32) {
            const aligned = (value1 << delta) | (value2 >>> (32 - delta));
            value = aligned >>> (32 - bits);
        } else {
            value = (value1 << delta) >>> (32 - bits);
        }
        return value >>> 0;
    }

    /**
     * Writes a variable length integer, up to the specified number of bits.
     * Knowing the maximum number of bits lets us decide if we need to use a variable length encoding or if its worse.
     */
    writeVarInt(value: number, maxBits: number = 32): void {
        if (maxBits < 10) {
            this.setBits(maxBits, value);
            return;
        }

        while (value > 127) {
            this.setBits(8, (value & 127) | 128);
            value = value >>> 7;
        }
        this.setBits(8, value);
    }

    /** Reads a variable length integer, up to the specified number of bits */
    readVarInt(maxBits: number = 32): number {
        if (maxBits < 10) return this.getBits(maxBits);

        let value = 0;
        let byte = 0;
        let shift = 0;
        do {
            byte = this.getBits(8);
            value |= (byte & 127) << shift;
            shift += 7;
        } while (byte & 128);
        return value;
    }
}
