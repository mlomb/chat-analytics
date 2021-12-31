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

const B91_LENGTH_DIGITS = 12;

// TODO: use buffers
export const base91encode = (data: Uint8Array): string => {
    let ret = (data.length + "").padStart(B91_LENGTH_DIGITS, "0");
    const len = data.length;

    let i = 0;
    let n = 0;
    let b = 0;

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
            ret += TABLE[v % 91] + TABLE[(v / 91) | 0];
        }
        i++;
    }

    if (n) {
        ret += TABLE[b % 91];
        if (n > 7 || b > 90) ret += TABLE[(b / 91) | 0];
    }

    return ret;
};

export const base91decode = (data: string): Uint8Array => {
    let i = B91_LENGTH_DIGITS;
    let k = 0;
    let b = 0;
    let n = 0;
    let v = -1;

    const len = data.length;
    const outputLength = parseInt(data.slice(0, B91_LENGTH_DIGITS));
    const ret = new Uint8Array(outputLength);

    while (i < len) {
        const p = TABLE.indexOf(data[i]);
        if (p === -1) continue;
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
        i++;
    }

    if (v > -1) {
        ret[k++] = (b | (v << n)) & 0xff;
    }

    return ret;
};
