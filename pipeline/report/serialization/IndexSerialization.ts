import { Index } from "@pipeline/Types";
import { BitStream } from "@pipeline/report/BitStream";

// Some stats from a big chat sample (3.4M messages)
// 4,062,249 samples
//
// About counts.length:
//   - 100.0000% of counts are below 256
//   - 99.99687% of counts are below 128
//   - 99.84385% of counts are below 64
//   - 98.93386% of counts are below 32
//   - 93.77512% of counts are below 16
//   - 73.748236% of counts are below 8
//   - 47.426856% of counts are below 4
//   - 39.680974% of counts are 2 or less
//   - 30.990542% of counts are 1
//
// About sum of counts (`counts.reduce((acc, [_, count]) => acc + count, 0)`):
//   - 99.999532% of sum of counts are below 10,000
//   - 99.998646% of sum of counts are below 5,000
//   - 99.996849% of sum of counts are below 2,000
//   - 99.995248% of sum of counts are below 1,000
//   - 99.993353% of sum of counts are below 500
//   - 99.986042% of sum of counts are below 200
//   - 99.877752% of sum of counts are below 100
//   - 99.469628% of sum of counts are below 50
//   - 95.684287% of sum of counts are below 20
//   - 81.095078% of sum of counts are below 10
//   - 54.372245% of sum of counts are below 5
//   - 39.205400% of sum of counts are below 3
//   - 30.442545% of sum of counts are exactly 1
//
// So, whith this data in mind, we can choose between two strategies:
//   - Direct: [Sum of counts, Index, Index, Index, Index]
//   - Run Length Encoding: [Counts Length, Bits for max count, (Index, Count), (Index, Count), ...]
//
// We can use one bit to decide the strategy per array basis, using the one which uses the less amount of bits.
// :)

export const writeIndexArray = (counts: [Index, number][], stream: BitStream, bitsPerIndex: number) => {
    const len = counts.length;
    let total = 0;
    let maxCount = 0;
    for (let i = 0; i < len; i++) {
        const c = counts[i][1];
        total += c;
        maxCount = Math.max(maxCount, c);
    }
    // bits needed to store maxCount
    const bitsPerCount = 32 - Math.clz32(maxCount);

    const directBits =
        // sum of counts, below 2^10=1024 (99.99%)
        10 +
        // index * total
        bitsPerIndex * total;

    const rleBits =
        // length of counts, below 2^7=128 (99.99%)
        7 +
        // num bits for counts, up to 2^4=16
        4 +
        // (index + count) * len
        (bitsPerIndex + bitsPerCount) * len;

    if (directBits < rleBits) {
        // use direct encoding
        stream.setBits(1, 0); // 0=DIRECT

        // prevent overflow of total
        const realTotal = Math.min(total, 1023);
        let written = 0;

        stream.setBits(10, realTotal);
        for (let i = 0; i < len; i++) {
            for (let j = 0; j < counts[i][1] && written < realTotal; j++) {
                stream.setBits(bitsPerIndex, counts[i][0]);
                written++;
            }
        }
    } else {
        // use RLE
        stream.setBits(1, 1); // 1=RLE

        // prevent overflow of len
        const realLen = Math.min(len, 127);
        stream.setBits(7, realLen);
        stream.setBits(4, bitsPerCount);
        for (let i = 0; i < realLen; i++) {
            stream.setBits(bitsPerIndex, counts[i][0]);
            stream.setBits(bitsPerCount, counts[i][1]);
        }
    }
};

export const readIndexArray = (stream: BitStream, bitsPerIndex: number): [Index, number][] => {
    const counts: [Index, number][] = [];
    const strategy = stream.getBits(1);

    if (strategy === 0) {
        // DIRECT
        const total = stream.getBits(10);
        let lastIndex = -1;
        for (let i = 0; i < total; i++) {
            const index = stream.getBits(bitsPerIndex);
            if (index === lastIndex) {
                counts[counts.length - 1][1]++;
            } else {
                counts.push([index, 1]);
                lastIndex = index;
            }
        }
    } else {
        // RLE
        const len = stream.getBits(7);
        const bitsPerCount = stream.getBits(4);
        for (let i = 0; i < len; i++) {
            const index = stream.getBits(bitsPerIndex);
            const count = stream.getBits(bitsPerCount);
            counts.push([index, count]);
        }
    }

    return counts;
};

export const skipIndexArray = (stream: BitStream, bitsPerIndex: number) => {
    const strategy = stream.getBits(1);

    if (strategy === 0) {
        // DIRECT
        const total = stream.getBits(10);
        stream.offset += bitsPerIndex * total;
    } else {
        // RLE
        const len = stream.getBits(7);
        const bitsPerCount = stream.getBits(4);
        stream.offset += (bitsPerIndex + bitsPerCount) * len;
    }
};
