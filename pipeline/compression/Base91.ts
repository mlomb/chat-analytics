// This is a browser version of https://github.com/Equim-chan/base91

/*
BSD 3-Clause License

Copyright (c) 2017, Equim
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// NOTE: the character "<" was replaced by "-" to avoid problems embedding in HTML         ↓
const TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;-=>?@[]^_`{|}~"';
const TABLE_AS_BYTES = TABLE.split("").map((c) => c.charCodeAt(0));
const TABLE_LOOKUP = TABLE_AS_BYTES.reduce((acc, chr, i) => {
    acc[chr] = i;
    return acc;
}, new Uint8Array(256));

const B91_LENGTH_DIGITS = 12;

export const base91encode = (data: Uint8Array): string => {
    const len = data.length;
    let i = 0;
    let n = 0;
    let b = 0;
    let encodedSize = 0;

    // We run the algorithm twice, first to calculate the size of the encoded string, then to actually encode it
    while (i < len) {
        b |= data[i] << n;
        n += 8;

        if (n > 13) {
            let v = b & 8191;
            if (v > 88) {
                b >>= 13;
                n -= 13;
            } else {
                v = b & 16383;
                b >>= 14;
                n -= 14;
            }
            encodedSize += 2;
        }
        i++;
    }

    if (n) {
        encodedSize++;
        if (n > 7 || b > 90) encodedSize++;
    }

    // Now we actually encode the data
    const buffer = new Uint8Array(B91_LENGTH_DIGITS + encodedSize);

    let pos = B91_LENGTH_DIGITS;
    i = 0;
    n = 0;
    b = 0;

    const lenText = len.toString().padStart(B91_LENGTH_DIGITS, "0");
    buffer.set(new TextEncoder().encode(lenText), 0);

    while (i < len) {
        b |= data[i] << n;
        n += 8;

        if (n > 13) {
            let v = b & 8191;
            if (v > 88) {
                b >>= 13;
                n -= 13;
            } else {
                v = b & 16383;
                b >>= 14;
                n -= 14;
            }
            buffer[pos++] = TABLE_AS_BYTES[v % 91];
            buffer[pos++] = TABLE_AS_BYTES[(v / 91) | 0];
        }
        i++;
    }

    if (n) {
        buffer[pos++] = TABLE_AS_BYTES[b % 91];
        if (n > 7 || b > 90) buffer[pos++] = TABLE_AS_BYTES[(b / 91) | 0];
    }

    return new TextDecoder("iso-8859-10").decode(buffer);
};

export const base91decode = (data: string): Uint8Array => {
    let pos = B91_LENGTH_DIGITS;
    let k = 0;
    let b = 0;
    let n = 0;
    let v = -1;

    const len = data.length;
    const outputLength = parseInt(data.slice(0, B91_LENGTH_DIGITS));

    const ret = new Uint8Array(outputLength);

    while (pos < len) {
        const p = TABLE_LOOKUP[data[pos].charCodeAt(0)];
        if (v < 0) {
            v = p;
        } else {
            v += p * 91;
            b |= v << n;
            n += (v & 8191) > 88 ? 13 : 14;
            do {
                ret[k++] = b & 0xff;
                b >>= 8;
                n -= 8;
            } while (n > 7);
            v = -1;
        }
        pos++;
    }

    if (v > -1) {
        ret[k++] = (b | (v << n)) & 0xff;
    }

    return ret;
};
