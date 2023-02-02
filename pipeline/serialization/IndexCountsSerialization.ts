import { IndexCounts } from "@pipeline/process/IndexCounts";
import { BitStream } from "@pipeline/serialization/BitStream";

// In this file we serialize IndexCounts, which is an array of [index, count] pairs.
// We require `bitsPerIndex` to know how many bits to use for each index.
// Now for counts, what do we do? ↓
//
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
// So, with this data in mind, we can choose between four strategies:
//   - (0b00) Single Index (only if total === 1): [Index]
//   - (0b01) Double Index (only if total === 2): [Index, Index]
//   - (0b10) Serial: [Sum of counts, Index, Index, Index, Index]
//   - (0b11) Run Length Encoding: [Counts Length, Bits for max count, (Index, Count), (Index, Count), ...]
//
// We can use two bits to decide the strategy per array basis, using the one which uses the less amount of bits.
// :)

/** Writes the IndexCounts to the stream using `bitsPerIndex` bits to encode indexes */
export const writeIndexCounts = (counts: IndexCounts, stream: BitStream, bitsPerIndex: number) => {
    const len = counts.length;
    let total = 0;
    let maxCount = 0;
    for (let i = 0; i < len; i++) {
        const c = counts[i][1];
        total += c;
        maxCount = Math.max(maxCount, c);
    }

    // check for single and double strategies
    if (total === 1) {
        stream.setBits(2, 0b00); // 0b00=single index
        stream.setBits(bitsPerIndex, counts[0][0]);
        return;
    } else if (total === 2) {
        stream.setBits(2, 0b01); // 0b01=double index
        if (counts.length === 1) {
            // [A, 2] (double combined)
            stream.setBits(bitsPerIndex, counts[0][0]);
            stream.setBits(bitsPerIndex, counts[0][0]);
        } else {
            // [A, 1] [B, 1] (double)
            stream.setBits(bitsPerIndex, counts[0][0]);
            stream.setBits(bitsPerIndex, counts[1][0]);
        }
        return;
    }

    // bits needed to store maxCount
    const bitsPerCount = 32 - Math.clz32(maxCount);
    // prevent overflow of total
    const realTotal = Math.min(total, 1023);
    // prevent overflow of len
    const realLen = Math.min(len, 127);

    const serialBits =
        // sum of counts, below 2^10=1024 (99.99%)
        10 +
        // index * total
        bitsPerIndex * realTotal;

    const rleBits =
        // length of counts, below 2^7=128 (99.99%)
        7 +
        // num bits for counts, up to 2^5=32
        5 +
        // (index + count) * len
        (bitsPerIndex + bitsPerCount) * realLen;

    if (serialBits < rleBits) {
        // use serial encoding
        stream.setBits(2, 0b10); // 0b10=serial
        stream.setBits(10, realTotal);

        let written = 0;
        let lastIndex = 0;
        for (let i = 0; i < len; i++) {
            for (let j = 0; j < counts[i][1] && written < realTotal; j++) {
                const diff = counts[i][0] - lastIndex;
                console.assert(diff >= 0, "delta encoding failed, index counts are not sorted");
                // delta encoding
                stream.setBits(bitsPerIndex, diff);
                lastIndex += diff;
                written++;
            }
        }
    } else {
        // use RLE
        stream.setBits(2, 0b11); // 0b11=RLE
        stream.setBits(7, realLen);
        stream.setBits(5, bitsPerCount - 1); // since 0 is not possible, we can squeeze one more value

        for (let i = 0; i < realLen; i++) {
            stream.setBits(bitsPerIndex, counts[i][0]);
            stream.setBits(bitsPerCount, counts[i][1]);
        }
    }
};

/** Reads IndexCounts from the stream using `bitsPerIndex` bits per index */
export const readIndexCounts = (stream: BitStream, bitsPerIndex: number): IndexCounts => {
    const counts: IndexCounts = [];
    const strategy = stream.getBits(2);

    if (strategy === 0b00) {
        // SINGLE INDEX
        counts.push([stream.getBits(bitsPerIndex), 1]);
    } else if (strategy === 0b01) {
        // DOUBLE INDEX
        counts.push([stream.getBits(bitsPerIndex), 1]);
        counts.push([stream.getBits(bitsPerIndex), 1]);
    } else if (strategy === 0b10) {
        // SERIAL
        const total = stream.getBits(10);
        let lastIndex = -1;
        for (let i = 0; i < total; i++) {
            const diff = stream.getBits(bitsPerIndex);
            if (lastIndex === -1) {
                counts.push([diff, 1]);
                lastIndex = diff;
            } else if (diff === 0) {
                counts[counts.length - 1][1]++;
            } else {
                counts.push([lastIndex + diff, 1]);
                lastIndex += diff;
            }
        }
    } else {
        // RLE
        const len = stream.getBits(7);
        const bitsPerCount = stream.getBits(5) + 1;
        for (let i = 0; i < len; i++) {
            const index = stream.getBits(bitsPerIndex);
            const count = stream.getBits(bitsPerCount);
            counts.push([index, count]);
        }
    }

    return counts;
};

/** Advances the offset of the stream by one IndexCount without decoding it, thus faster if not needed */
export const skipIndexCounts = (stream: BitStream, bitsPerIndex: number) => {
    const strategy = stream.getBits(2);

    if (strategy === 0b00) {
        // SINGLE INDEX
        stream.offset += bitsPerIndex;
    } else if (strategy === 0b01) {
        // DOUBLE INDEX
        stream.offset += 2 * bitsPerIndex;
    } else if (strategy === 0b10) {
        // SERIAL
        const total = stream.getBits(10);
        stream.offset += bitsPerIndex * total;
    } else {
        // RLE
        const len = stream.getBits(7);
        const bitsPerCount = stream.getBits(5) + 1;
        stream.offset += (bitsPerIndex + bitsPerCount) * len;
    }
};
