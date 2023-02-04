import { BitStream } from "@pipeline/serialization/BitStream";

describe("writing", () => {
    const cases: {
        name: string;
        offset: number;
        bits: number;
        input: number;
        previous: [number, number]; // current stream data
        expected: [number, number]; // expected stream data after write
    }[] = [
        {
            name: "only left boundary",
            offset: 5,
            bits: 5,
            input: 0b10011,
            previous: [0b00000000000000000000000000000000, 0b00000000000000000000000000000000],
            //                ↓ offset
            expected: [0b00000100110000000000000000000000, 0b00000000000000000000000000000000],
            //                    ↑ offset + bits
        },
        {
            name: "only left boundary with noise",
            offset: 5,
            bits: 5,
            input: 0b10011,
            previous: [0b01010101011010101011101010101101, 0b01110100101010101101000101000101],
            //                ↓ offset
            expected: [0b01010100111010101011101010101101, 0b01110100101010101101000101000101],
            //                    ↑ offset + bits
        },
        {
            name: "only left boundary (full 32 bits)",
            offset: 0,
            bits: 32,
            input: 0b01110100101010101101000101000101,
            previous: [0b10001000001000001001000100001000, 0b10001000001000001001000100001000],
            expected: [0b01110100101010101101000101000101, 0b10001000001000001001000100001000],
        },
        {
            name: "one bit",
            offset: 15,
            bits: 1,
            input: 0b1,
            previous: [0b00000000000000000000000000000000, 0b00000000000000000000000000000000],
            expected: [0b00000000000000010000000000000000, 0b00000000000000000000000000000000],
        },
        {
            name: "cross boundary",
            offset: 25,
            bits: 10,
            input: 0b1110001110,
            previous: [0b00000000000000000000000000000000, 0b00000000000000000000000000000000],
            //                                    ↓ offset
            expected: [0b00000000000000000000000001110001, 0b11000000000000000000000000000000],
            //                                                 ↑ offset + bits
        },
        {
            name: "cross boundary with noise",
            offset: 25,
            bits: 10,
            input: 0b1110001110,
            previous: [0b01010101011010101011101010101101, 0b01110100101010101101000101000101],
            //                                    ↓ offset
            expected: [0b01010101011010101011101011110001, 0b11010100101010101101000101000101],
            //                                                 ↑ offset + bits
        },
    ];

    test.each(cases)("$name: offset=$offset bits=$bits", ({ offset, bits, input, previous, expected }) => {
        const s = new BitStream(new ArrayBuffer(1024));
        s.buffer[0] = previous[0];
        s.buffer[1] = previous[1];
        s.offset = offset;
        s.setBits(bits, input);
        expect(s.buffer[0]).toBe(expected[0]);
        expect(s.buffer[1]).toBe(expected[1]);
    });
});

describe("reading", () => {
    const casesNew: {
        name: string;
        offset: number;
        bits: number;
        previous: [number, number]; // current stream data
        expected: number; // expected read
    }[] = [
        {
            name: "only left boundary",
            offset: 5,
            bits: 5,
            //             ↓ offset
            previous: [0b00000111110000000000000000000000, 0b00000000000000000000000000000000],
            //                 ↑ offset + bits
            expected: 0b11111,
        },
        {
            name: "only left boundary with noise",
            offset: 5,
            bits: 5,
            //                ↓ offset
            previous: [0b01010101010110101011101010101101, 0b01110100101010101101000101000101],
            //                    ↑ offset + bits
            expected: 0b10101,
        },
        {
            name: "only left boundary (full 32 bits)",
            offset: 0,
            bits: 32,
            //           ↓ offset
            previous: [0b11111111111111111111111111111111, 0b00000000000000000000000000000000],
            //                                          ↑ offset + bits
            expected: 0b11111111111111111111111111111111,
        },
        {
            name: "cross boundary",
            offset: 5,
            bits: 32,
            //                ↓ offset
            previous: [0b00000111111111111111111111111111, 0b11111000000000000000000000000000],
            //                                                   ↑ offset + bits
            expected: 0b11111111111111111111111111111111,
        },
        {
            name: "cross boundary with noise",
            offset: 5,
            bits: 32,
            //                ↓ offset
            previous: [0b01010101010110101011101010101101, 0b01110100101010101101000101000101],
            //                                                   ↑ offset + bits
            expected: 0b10101011010101110101010110101110,
        },
    ];

    test.each(casesNew)("$name: offset=$offset bits=$bits", async ({ offset, bits, previous, expected }) => {
        const s = new BitStream(new ArrayBuffer(4 * 2));
        s.offset = offset;
        s.buffer[0] = previous[0];
        s.buffer[1] = previous[1];
        const val = s.getBits(bits);
        expect(val).toBe(expected);
    });

    test.each(casesNew)("$name (negated): offset=$offset bits=$bits", async ({ offset, bits, previous, expected }) => {
        const s = new BitStream(new ArrayBuffer(4 * 2));
        s.offset = offset;
        s.buffer[0] = ~previous[0];
        s.buffer[1] = ~previous[1];
        const val = s.getBits(bits);
        if (bits === 32) expected = ~expected;
        else expected = ~expected & ((1 << bits) - 1);
        expect(val).toBe(expected);
    });
});

it("should get bits correctly after lots of sets", () => {
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

test.each([7, 8, 9, 10, 11, 15, 16, 17, 20, 24, 31, 32])("varint %s bits should write and read correctly", (bits) => {
    const cases: number[] = [0, 100, 200, 500, 1000, 5000, 10000, 100000, 2000000, 5000000, 1000000000].filter(
        (v) => v < Math.pow(2, bits)
    );
    for (const value of cases) {
        let s = new BitStream();
        s.offset = 0;
        s.writeVarInt(value, bits);
        s.offset = 0;
        expect(s.readVarInt(bits)).toBe(value);
    }
});

test("buffer8 returns a buffer aligned to 32bits", () => {
    const s = new BitStream();
    s.setBits(32, 42);
    s.setBits(32, 42);
    s.setBits(7, 42);
    s.setBits(7, 42);
    expect(s.offset).toBe(32 + 32 + 7 + 7);
    const buffer = s.buffer8;
    expect(buffer.length).toBe(12);
    expect(buffer.byteLength % 4).toBe(0);
    expect(s.buffer.buffer).toBe(buffer.buffer); // test no copy
});

it("should crash if created with an invalid buffer", () => {
    expect(() => new BitStream({} as any)).toThrow("buffer must be an ArrayBuffer"); // there was a buffer you could pass that did not work, can't remember what it was
    expect(() => new BitStream(new ArrayBuffer(7))).toThrow("buffer must be aligned to 32bits"); // must be a multiple of 4 bytes
});
