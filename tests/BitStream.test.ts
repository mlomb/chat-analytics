import { BitStream } from "@pipeline/serialization/BitStream";

describe("writing", () => {
    const cases: [string, number, number, number, [number, number], [number, number]][] = [
        [
            "only left boundary",
            // offset
            5,
            // bits
            5,
            // input
            0b10011,
            // initial
            [0b00000000000000000000000000000000, 0b00000000000000000000000000000000],
            // expected
            //      ↓ offset
            [0b00000100110000000000000000000000, 0b00000000000000000000000000000000],
            //          ↑ offset + bits
        ],
        [
            "only left boundary with noise",
            // offset
            5,
            // bits
            5,
            // input
            0b10011,
            // initial
            [0b01010101011010101011101010101101, 0b01110100101010101101000101000101],
            // expected
            //      ↓ offset
            [0b01010100111010101011101010101101, 0b01110100101010101101000101000101],
            //          ↑ offset + bits
        ],
        [
            "only left boundary (full 32 bits)",
            // offset
            0,
            // bits
            32,
            // input
            0b01110100101010101101000101000101,
            // initial
            [0b10001000001000001001000100001000, 0b10001000001000001001000100001000],
            // expected
            [0b01110100101010101101000101000101, 0b10001000001000001001000100001000],
        ],
        [
            "one bit",
            // offset
            15,
            // bits
            1,
            // input
            0b1,
            // initial
            [0b00000000000000000000000000000000, 0b00000000000000000000000000000000],
            // expected
            [0b00000000000000010000000000000000, 0b00000000000000000000000000000000],
        ],
        [
            "cross boundary",
            // offset
            25,
            // bits
            10,
            // input
            0b1110001110,
            // initial
            [0b00000000000000000000000000000000, 0b00000000000000000000000000000000],
            // expected
            //                          ↓ offset
            [0b00000000000000000000000001110001, 0b11000000000000000000000000000000],
            //                                       ↑ offset + bits
        ],
        [
            "cross boundary with noise",
            // offset
            25,
            // bits
            10,
            // input
            0b1110001110,
            // initial
            [0b01010101011010101011101010101101, 0b01110100101010101101000101000101],
            // expected
            //                          ↓ offset
            [0b01010101011010101011101011110001, 0b11010100101010101101000101000101],
            //                                       ↑ offset + bits
        ],
    ];

    test.each(cases)("%p offset=%p bits=%p", async (_, offset, bits, input, initial, expected) => {
        const s = new BitStream(new ArrayBuffer(1024));
        s.buffer[0] = initial[0];
        s.buffer[1] = initial[1];
        s.offset = offset;
        s.setBits(bits, input);
        expect(s.buffer[0]).toBe(expected[0]);
        expect(s.buffer[1]).toBe(expected[1]);
    });
});

describe("reading", () => {
    const cases: [string, number, number, number, number, number][] = [
        [
            "only left boundary",
            // offset
            5,
            // bits
            5,
            // expected
            0b11111,
            //     ↓ offset
            0b00000111110000000000000000000000,
            //         ↑ offset + bits
            0b00000000000000000000000000000000,
        ],
        [
            "only left boundary with noise",
            // offset
            5,
            // bits
            5,
            // expected
            0b10101,
            //     ↓ offset
            0b01010101010110101011101010101101,
            //         ↑ offset + bits
            0b01110100101010101101000101000101,
        ],
        [
            "only left boundary (full 32 bits)",
            // offset
            0,
            // bits
            32,
            // expected
            0b11111111111111111111111111111111,
            //↓ offset
            0b11111111111111111111111111111111,
            //                               ↑ offset + bits
            0b00000000000000000000000000000000,
        ],
        [
            "cross boundary",
            // offset
            5,
            // bits
            32,
            // expected
            0b11111111111111111111111111111111,
            //     ↓ offset
            0b00000111111111111111111111111111,
            //    ↓ offset + bits
            0b11111000000000000000000000000000,
        ],
        [
            "cross boundary with noise",
            // offset
            5,
            // bits
            32,
            // expected
            0b10101011010101110101010110101110,
            //     ↓ offset
            0b01010101010110101011101010101101,
            //    ↓ offset + bits
            0b01110100101010101101000101000101,
        ],
    ];

    test.each(cases)("%p offset=%p bits=%p", async (_, offset, bits, expected, a, b) => {
        const s = new BitStream(new ArrayBuffer(4 * 2));
        s.offset = offset;
        s.buffer[0] = a;
        s.buffer[1] = b;
        const val = s.getBits(bits);
        expect(val).toBe(expected);
    });

    test.each(cases)("%p (negated) offset=%p bits=%p", async (_, offset, bits, expected, a, b) => {
        const s = new BitStream(new ArrayBuffer(4 * 2));
        s.offset = offset;
        s.buffer[0] = ~a;
        s.buffer[1] = ~b;
        const val = s.getBits(bits);
        if (bits === 32) expected = ~expected;
        else expected = ~expected & ((1 << bits) - 1);
        expect(val).toBe(expected);
    });
});

test("read then write", () => {
    const s = new BitStream();
    const bits = [],
        values = [];
    for (let k = 0; k < 100; k++) {
        for (let i = 1; i <= 32; i++) {
            const value = Math.floor(Math.random() * Math.pow(2, i));
            s.setBits(i, value);
            bits.push(i);
            values.push(value);
        }
    }
    // check
    s.offset = 0;
    for (let k = 0; k < bits.length; k++) {
        const value = s.getBits(bits[k]);
        expect(value).toBe(values[k]);
    }
});

describe("varint", () => {
    const cases: number[] = [0, 100, 200, 500, 1000, 5000, 10000, 100000, 2000000, 5000000];
    test.each(cases)("%p", async (value) => {
        let s = new BitStream();
        s.offset = 0;
        s.writeVarInt(value);
        s.offset = 0;
        expect(s.readVarInt()).toBe(value);
    });
});
